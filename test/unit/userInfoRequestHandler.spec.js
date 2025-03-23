import { assert } from "chai";
import sinon from "sinon";
import keyHelper from "../../src/helper/keyHelper.js";
import util from "../../src/helper/util.js";
import logger from "../../src/logger.js";
import codeStorage from "../../src/storage/code.js";
import grantStorage from "../../src/storage/grant.js";
import refreshTokenStorage from "../../src/storage/refreshToken.js";
import userInfoRequestHandler from "../../src/userInfoRequestHandler.js";

describe("User info request handler", () => {
    let requestGetStub;

    beforeEach(() => {
        sinon.stub(logger);

        requestGetStub = sinon.stub();
    });

    describe("pre token verification", () => {
        for (const [functionName, endpointHandler] of Object.entries(userInfoRequestHandler)) {
            describe(functionName, () => {
                it("should return bad request if authorization header is missing", async () => {
                    requestGetStub.withArgs("Authorization").returns(null);

                    const response = await endpointHandler.call(null, {
                        url: "http://localhost/me/grants/grantId",
                        headers: {
                            get: requestGetStub,
                        },
                    });

                    assert.equal(response.status, 400);
                    const responseText = await response.text();
                    assert.equal(responseText, "Missing access token in 'Authorization' header. Format: 'Authorization: Bearer <access_token>'.");
                });

                it("should return bad request if authorization header is not conforming to 'Bearer <access_token>' format", async () => {
                    requestGetStub.withArgs("Authorization").returns("tokenWithoutBearerPrefix");

                    const response = await endpointHandler.call(null, {
                        url: "http://localhost/me/grants/grantId",
                        headers: {
                            get: requestGetStub,
                        },
                    });

                    assert.equal(response.status, 400);
                    const responseText = await response.text();
                    assert.equal(responseText, "Could not parse Bearer token in 'Authorization' header. Format: 'Authorization: Bearer <access_token>'.");
                });

                it("should return internal error if key helper rejects during token verification", async () => {
                    sinon.stub(keyHelper);
                    sinon.stub(util);

                    requestGetStub.withArgs("Authorization").returns("Bearer header.payload.signature");

                    util.urlBase64Touint8.withArgs("signature").returns("verificationSignatureUint8");
                    util.strToUint8.withArgs("header.payload").returns("verificationPayloadUint8");

                    const expectedError = new Error("Cannot verify signature");
                    keyHelper.verifyToken.withArgs({ uint8Signature: "verificationSignatureUint8", uint8TokenContent: "verificationPayloadUint8" }).rejects(expectedError);

                    const response = await endpointHandler.call(null, {
                        url: "http://localhost/me/grants/grantId",
                        headers: {
                            get: requestGetStub,
                        },
                    });

                    assert.equal(response.status, 500);
                    const responseText = await response.text();
                    assert.equal(responseText, "Cannot verify signature");

                    sinon.assert.calledOnceWithExactly(logger.logError, expectedError);
                });

                it("should return bad request if key helper returns 'false' during token verification", async () => {
                    sinon.stub(keyHelper);
                    sinon.stub(util);

                    requestGetStub.withArgs("Authorization").returns("Bearer header.payload.signature");

                    util.urlBase64Touint8.withArgs("signature").returns("verificationSignatureUint8");
                    util.strToUint8.withArgs("header.payload").returns("verificationPayloadUint8");

                    keyHelper.verifyToken.withArgs({ uint8Signature: "verificationSignatureUint8", uint8TokenContent: "verificationPayloadUint8" }).resolves(false);

                    const response = await endpointHandler.call(null, {
                        url: "http://localhost/me/grants/grantId",
                        headers: {
                            get: requestGetStub,
                        },
                    });

                    assert.equal(response.status, 400);
                    const responseText = await response.text();
                    assert.equal(responseText, "Could not verify signature of provided access token");
                });
            });
        }
    });

    describe("post token verification", () => {
        const dummyTokenPayload = {
            sub: "dummy",
        };

        beforeEach(() => {
            sinon.stub(keyHelper);
            sinon.stub(util);

            requestGetStub.withArgs("Authorization").returns("Bearer header.payload.signature");

            util.urlBase64Touint8.withArgs("signature").returns("verificationSignatureUint8");
            util.strToUint8.withArgs("header.payload").returns("verificationPayloadUint8");
            keyHelper.verifyToken.withArgs({ uint8Signature: "verificationSignatureUint8", uint8TokenContent: "verificationPayloadUint8" }).resolves(true);

            util.urlBase64ToStr.withArgs("payload").returns(JSON.stringify(dummyTokenPayload));
        });

        afterEach(() => {
            sinon.assert.calledWithExactly(logger.logObject, { label: "Verified token payload", object: dummyTokenPayload });
        });

        describe("handleGetUserInfoRequest", () => {
            describe("error cases", () => {
                it("should return internal server error if getting access codes rejects", async () => {
                    sinon.stub(codeStorage);

                    const expectedError = new Error("Cannot find access codes");
                    codeStorage.getAccessCodesByUsername.withArgs("dummy").rejects(expectedError);

                    const response = await userInfoRequestHandler.handleGetUserInfoRequest({
                        headers: {
                            get: requestGetStub,
                        },
                    });

                    assert.equal(response.status, 500);
                    const responseText = await response.text();

                    assert.equal(responseText, "Cannot find access codes");

                    sinon.assert.calledOnceWithExactly(logger.logError, expectedError);
                });

                it("should return internal server error if getting grants rejects", async () => {
                    sinon.stub(codeStorage);
                    sinon.stub(grantStorage);

                    codeStorage.getAccessCodesByUsername.withArgs("dummy").resolves({
                        accessKey1: "someValue",
                        accessKey2: "someValue",
                        accessKey3: "someValue",
                    });

                    const expectedError = new Error("Cannot find grants");

                    grantStorage.getGrantsByUsername.withArgs("dummy").rejects(expectedError);

                    const response = await userInfoRequestHandler.handleGetUserInfoRequest({
                        headers: {
                            get: requestGetStub,
                        },
                    });

                    assert.equal(response.status, 500);
                    const responseText = await response.text();

                    assert.equal(responseText, "Cannot find grants");

                    sinon.assert.calledOnceWithExactly(logger.logError, expectedError);
                });

                it("should return internal server error if getting refresh tokens rejects", async () => {
                    sinon.stub(codeStorage);
                    sinon.stub(grantStorage);
                    sinon.stub(refreshTokenStorage);

                    codeStorage.getAccessCodesByUsername.withArgs("dummy").resolves({
                        accessKey1: "someValue",
                        accessKey2: "someValue",
                        accessKey3: "someValue",
                    });
                    grantStorage.getGrantsByUsername.withArgs("dummy").resolves({
                        grantKey1: "someValue",
                        grantKey2: "someValue",
                        grantKey3: "someValue",
                    });

                    const expectedError = new Error("Cannot find refresh tokens");

                    refreshTokenStorage.getRefreshTokensByUsername.withArgs("dummy").rejects(expectedError);

                    const response = await userInfoRequestHandler.handleGetUserInfoRequest({
                        headers: {
                            get: requestGetStub,
                        },
                    });

                    assert.equal(response.status, 500);
                    const responseText = await response.text();

                    assert.equal(responseText, "Cannot find refresh tokens");

                    sinon.assert.calledOnceWithExactly(logger.logError, expectedError);
                });
            });

            describe("success cases", () => {
                it("should return user info", async () => {
                    sinon.stub(codeStorage);
                    sinon.stub(grantStorage);
                    sinon.stub(refreshTokenStorage);

                    codeStorage.getAccessCodesByUsername.withArgs("dummy").resolves({
                        accessKey1: "someValue",
                        accessKey2: "someValue",
                        accessKey3: "someValue",
                    });
                    grantStorage.getGrantsByUsername.withArgs("dummy").resolves({
                        grantKey1: "someValue",
                        grantKey2: "someValue",
                        grantKey3: "someValue",
                    });
                    refreshTokenStorage.getRefreshTokensByUsername.withArgs("dummy").resolves({
                        refreshTokenKey1: { active: true, value: "someValue" },
                        refreshTokenKey2: { active: false, value: "someValue" },
                        refreshTokenKey3: { active: true, value: "someValue" },
                    });

                    const response = await userInfoRequestHandler.handleGetUserInfoRequest({
                        headers: {
                            get: requestGetStub,
                        },
                    });

                    assert.equal(response.status, 200);
                    const responseBody = await response.json();

                    assert.deepEqual(responseBody, {
                        accessCodes: {
                            accessKey1: "someValue",
                            accessKey2: "someValue",
                            accessKey3: "someValue",
                        },
                        grants: {
                            grantKey1: "someValue",
                            grantKey2: "someValue",
                            grantKey3: "someValue",
                        },
                        activeRefreshTokens: {
                            refreshTokenKey1: { active: true, value: "someValue" },
                            refreshTokenKey3: { active: true, value: "someValue" },
                        },
                        inactiveRefreshTokens: {
                            refreshTokenKey2: { active: false, value: "someValue" },
                        },
                    });
                });
            });
        });

        describe("handleGrantDeletionRequest", () => {
            describe("error cases", () => {
                it("should return bad request if URL does not contain grant id", async () => {
                    const response = await userInfoRequestHandler.handleGrantDeletionRequest({
                        url: "http://localhost/me/grants/",
                        headers: {
                            get: requestGetStub,
                        },
                    });

                    assert.equal(response.status, 400);
                    const responseText = await response.text();
                    assert.equal(responseText, "Could not extract grant id from path.");
                });

                it("should return internal server error if getting grant rejects", async () => {
                    sinon.stub(grantStorage);

                    const expectedError = new Error("Cannot find grant");
                    grantStorage.getGrant.withArgs("dummy:grantId").rejects(expectedError);

                    const response = await userInfoRequestHandler.handleGrantDeletionRequest({
                        url: "http://localhost/me/grants/grantId",
                        headers: {
                            get: requestGetStub,
                        },
                    });

                    assert.equal(response.status, 500);
                    const responseText = await response.text();
                    assert.equal(responseText, "Cannot find grant");

                    sinon.assert.calledOnceWithExactly(logger.logMessage, "Attempting to delete grant with id 'grantId' of user 'dummy'.");
                });

                it("should return not found if getting grant returns null", async () => {
                    sinon.stub(grantStorage);

                    grantStorage.getGrant.withArgs("dummy:grantId").resolves(null);

                    const response = await userInfoRequestHandler.handleGrantDeletionRequest({
                        url: "http://localhost/me/grants/grantId",
                        headers: {
                            get: requestGetStub,
                        },
                    });

                    assert.equal(response.status, 404);
                    const responseText = await response.text();
                    assert.equal(responseText, "");

                    sinon.assert.calledOnceWithExactly(logger.logMessage, "Attempting to delete grant with id 'grantId' of user 'dummy'.");
                });

                it("should return internal server errro if deleting grant rejects", async () => {
                    sinon.stub(grantStorage);

                    grantStorage.getGrant.withArgs("dummy:grantId").resolves({ someGrant: "yes" });

                    const expectedError = new Error("Cannot delete grant");
                    grantStorage.deleteGrant
                        .withArgs({
                            grantId: "grantId",
                            username: "dummy",
                        })
                        .rejects(expectedError);

                    const response = await userInfoRequestHandler.handleGrantDeletionRequest({
                        url: "http://localhost/me/grants/grantId",
                        headers: {
                            get: requestGetStub,
                        },
                    });

                    assert.equal(response.status, 500);
                    const responseText = await response.text();
                    assert.equal(responseText, "Cannot delete grant");

                    sinon.assert.calledOnceWithExactly(logger.logMessage, "Attempting to delete grant with id 'grantId' of user 'dummy'.");
                });
            });

            describe("success cases", () => {
                it("should delete grant", async () => {
                    sinon.stub(grantStorage);

                    grantStorage.getGrant.withArgs("dummy:grantId").resolves({ someGrant: "yes" });
                    grantStorage.deleteGrant
                        .withArgs({
                            grantId: "grantId",
                            username: "dummy",
                        })
                        .resolves();

                    const response = await userInfoRequestHandler.handleGrantDeletionRequest({
                        url: "http://localhost/me/grants/grantId",
                        headers: {
                            get: requestGetStub,
                        },
                    });

                    assert.equal(response.status, 200);
                    const responseBody = await response.json();
                    assert.deepEqual(responseBody, "");

                    sinon.assert.calledOnceWithExactly(logger.logMessage, "Attempting to delete grant with id 'grantId' of user 'dummy'.");
                });
            });
        });

        describe("handleRefreshTokenDeletionRequest", () => {
            describe("error cases", () => {
                it("should return bad request if URL does not contain refresh token id", async () => {
                    const response = await userInfoRequestHandler.handleRefreshTokenDeletionRequest({
                        url: "http://localhost/me/refreshTokens/",
                        headers: {
                            get: requestGetStub,
                        },
                    });

                    assert.equal(response.status, 400);
                    const responseText = await response.text();
                    assert.equal(responseText, "Could not extract refresh token id from path.");
                });

                it("should return internal server error if getting refresh token rejects", async () => {
                    sinon.stub(refreshTokenStorage);
                    const expectedError = new Error("Cannot refresh token");

                    refreshTokenStorage.getRefreshToken.withArgs("dummy:refreshTokenId").rejects(expectedError);

                    const response = await userInfoRequestHandler.handleRefreshTokenDeletionRequest({
                        url: "http://localhost/me/refreshTokens/refreshTokenId",
                        headers: {
                            get: requestGetStub,
                        },
                    });

                    assert.equal(response.status, 500);
                    const responseText = await response.text();
                    assert.equal(responseText, "Cannot refresh token");

                    sinon.assert.calledOnceWithExactly(logger.logMessage, "Attempting to deactivate refresh token with id 'refreshTokenId' of user 'dummy'.");
                });

                it("should return not found if getting refresh token returns null", async () => {
                    sinon.stub(refreshTokenStorage);

                    refreshTokenStorage.getRefreshToken.withArgs("dummy:refreshTokenId").resolves(null);

                    const response = await userInfoRequestHandler.handleRefreshTokenDeletionRequest({
                        url: "http://localhost/me/refreshTokens/refreshTokenId",
                        headers: {
                            get: requestGetStub,
                        },
                    });

                    assert.equal(response.status, 404);
                    const responseText = await response.text();
                    assert.equal(responseText, "");

                    sinon.assert.calledOnceWithExactly(logger.logMessage, "Attempting to deactivate refresh token with id 'refreshTokenId' of user 'dummy'.");
                });

                it("should return not found if deactivating refresh token rejects", async () => {
                    sinon.stub(refreshTokenStorage);

                    refreshTokenStorage.getRefreshToken.withArgs("dummy:refreshTokenId").resolves({ refresh: "yes" });

                    const expectedError = new Error("Cannot deactivate refresh token");
                    refreshTokenStorage.deactivateRefreshToken
                        .withArgs({
                            refreshTokenId: "refreshTokenId",
                            username: "dummy",
                        })
                        .rejects(expectedError);

                    const response = await userInfoRequestHandler.handleRefreshTokenDeletionRequest({
                        url: "http://localhost/me/refreshTokens/refreshTokenId",
                        headers: {
                            get: requestGetStub,
                        },
                    });

                    assert.equal(response.status, 500);
                    const responseText = await response.text();
                    assert.equal(responseText, "Cannot deactivate refresh token");

                    sinon.assert.calledOnceWithExactly(logger.logMessage, "Attempting to deactivate refresh token with id 'refreshTokenId' of user 'dummy'.");
                });
            });

            describe("success cases", () => {
                it("should deactivate refresh token", async () => {
                    sinon.stub(refreshTokenStorage);

                    refreshTokenStorage.getRefreshToken.withArgs("dummy:refreshTokenId").resolves({ refresh: "yes" });
                    refreshTokenStorage.deactivateRefreshToken
                        .withArgs({
                            refreshTokenId: "refreshTokenId",
                            username: "dummy",
                        })
                        .resolves();

                    const response = await userInfoRequestHandler.handleRefreshTokenDeletionRequest({
                        url: "http://localhost/me/refreshTokens/refreshTokenId",
                        headers: {
                            get: requestGetStub,
                        },
                    });

                    assert.equal(response.status, 200);

                    const responseBody = await response.json();
                    assert.deepEqual(responseBody, "");

                    sinon.assert.calledOnceWithExactly(logger.logMessage, "Attempting to deactivate refresh token with id 'refreshTokenId' of user 'dummy'.");
                });
            });
        });
    });
});
