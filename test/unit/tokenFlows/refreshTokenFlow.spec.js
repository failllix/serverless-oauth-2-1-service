import { assert } from "chai";
import sinon from "sinon";
import AuthenticationError from "../../../src/error/authenticationError.js";
import keyHelper from "../../../src/helper/keyHelper.js";
import util from "../../../src/helper/util.js";
import logger from "../../../src/logger.js";
import environmentVariables from "../../../src/storage/environmentVariables.js";
import grantStorage from "../../../src/storage/grant.js";
import refreshTokenStorage from "../../../src/storage/refreshToken.js";
import refreshTokenFlow from "../../../src/tokenFlows/refreshTokenFlow.js";
import tokenCreator from "../../../src/tokenFlows/tokenCreator.js";
import refreshTokenExchangeValidator from "../../../src/validation/refreshTokenExchangeValidator.js";
import sharedValidator from "../../../src/validation/sharedValidator.js";

describe("Refresh token flow", () => {
    let mockedFormData;
    let formDataGetStub;

    beforeEach(() => {
        sinon.stub(logger);

        formDataGetStub = sinon.stub();
        formDataGetStub.withArgs("client_id").returns("someClientId");
        formDataGetStub.withArgs("scope").returns("someScope1,someScope2");
        formDataGetStub.withArgs("refresh_token").returns("someRefreshTokenPayloadBase64.someRefreshTokenSignatureBase64");
        mockedFormData = {
            get: formDataGetStub,
        };
    });

    describe("validation failures", () => {
        afterEach(() => {
            sinon.assert.notCalled(logger.logObject);
        });

        it("should throw if client id validation fails", async () => {
            sinon.stub(sharedValidator);

            const expectedError = new Error("Invalid client id");
            sharedValidator.isValidClientId.throws(expectedError);

            try {
                await refreshTokenFlow.exchangeRefreshTokenForAccessToken({ formData: mockedFormData, host: "someHost" });
                throw new Error("Function under test was expected to throw error");
            } catch (error) {
                assert.equal(expectedError, error);

                sinon.assert.calledOnceWithExactly(sharedValidator.isValidClientId, "someClientId");
                sinon.assert.calledOnceWithExactly(formDataGetStub, "client_id");
            }
        });

        it("should throw if scope validation fails", async () => {
            sinon.stub(sharedValidator);

            const expectedError = new Error("Invalid scopes");
            sharedValidator.isValidClientId.returns("someClientId");
            sharedValidator.isValidScope.throws(expectedError);

            try {
                await refreshTokenFlow.exchangeRefreshTokenForAccessToken({ formData: mockedFormData, host: "someHost" });
                throw new Error("Function under test was expected to throw error");
            } catch (error) {
                assert.equal(expectedError, error);

                sinon.assert.calledOnceWithExactly(sharedValidator.isValidClientId, "someClientId");
                sinon.assert.calledOnceWithExactly(sharedValidator.isValidScope, ["someScope1", "someScope2"]);

                sinon.assert.calledWith(formDataGetStub, "client_id");
                sinon.assert.calledWith(formDataGetStub, "scope");
                sinon.assert.callCount(formDataGetStub, 2);
            }
        });

        it("should throw if access code validation fails", async () => {
            sinon.stub(sharedValidator);
            sinon.stub(refreshTokenExchangeValidator);

            const expectedError = new Error("Invalid access code");
            sharedValidator.isValidClientId.returns("someClientId");
            sharedValidator.isValidScope.returns(["someScope1", "someScope2"]);
            refreshTokenExchangeValidator.isValidRefreshToken.throws(expectedError);

            try {
                await refreshTokenFlow.exchangeRefreshTokenForAccessToken({ formData: mockedFormData, host: "someHost" });
                throw new Error("Function under test was expected to throw error");
            } catch (error) {
                assert.equal(expectedError, error);

                sinon.assert.calledOnceWithExactly(sharedValidator.isValidClientId, "someClientId");
                sinon.assert.calledOnceWithExactly(sharedValidator.isValidScope, ["someScope1", "someScope2"]);
                sinon.assert.calledOnceWithExactly(refreshTokenExchangeValidator.isValidRefreshToken, "someRefreshTokenPayloadBase64.someRefreshTokenSignatureBase64");

                sinon.assert.calledWith(formDataGetStub, "client_id");
                sinon.assert.calledWith(formDataGetStub, "scope");
                sinon.assert.calledWith(formDataGetStub, "refresh_token");
                sinon.assert.callCount(formDataGetStub, 3);
            }
        });
    });

    describe("post validation", () => {
        beforeEach(() => {
            sinon.stub(sharedValidator);
            sinon.stub(refreshTokenExchangeValidator);

            sharedValidator.isValidClientId.returns("someClientId");
            sharedValidator.isValidScope.returns(["someScope1", "someScope2"]);
            refreshTokenExchangeValidator.isValidRefreshToken.returns("someRefreshTokenPayloadBase64.someRefreshTokenSignatureBase64");
        });

        afterEach(() => {
            sinon.assert.calledWithExactly(logger.logObject, {
                label: "validated refresh token request parameters",
                object: {
                    clientId: "someClientId",
                    scope: ["someScope1", "someScope2"],
                    refreshToken: "someRefreshTokenPayloadBase64.someRefreshTokenSignatureBase64",
                },
            });
        });

        describe("error cases", () => {
            it("should throw when verifying refresh token payload rejects", async () => {
                sinon.stub(keyHelper);
                sinon.stub(environmentVariables);
                sinon.stub(util);

                util.urlBase64Touint8.withArgs("someRefreshTokenSignatureBase64").returns("refreshTokenSignatureUint8");
                util.strToUint8.withArgs("someRefreshTokenPayloadBase64").returns("refreshTokenPayloadUint8");

                const expectedError = new Error("This looks malicious");

                keyHelper.verifyToken
                    .withArgs({
                        uint8Signature: "refreshTokenSignatureUint8",
                        uint8TokenContent: "refreshTokenPayloadUint8",
                    })
                    .rejects(expectedError);

                try {
                    await refreshTokenFlow.exchangeRefreshTokenForAccessToken({ formData: mockedFormData, host: "someHost" });
                    throw new Error("Function under test was expected to throw error");
                } catch (error) {
                    assert.equal(error, expectedError);
                }
            });

            it("should throw when verifying refresh token payload resolves to untruthy value", async () => {
                sinon.stub(keyHelper);
                sinon.stub(environmentVariables);
                sinon.stub(util);

                environmentVariables.getPublicKey.returns(JSON.stringify({ public: true, key: "yes" }));

                util.urlBase64Touint8.withArgs("someRefreshTokenSignatureBase64").returns("refreshTokenSignatureUint8");
                util.strToUint8.withArgs("someRefreshTokenPayloadBase64").returns("refreshTokenPayloadUint8");

                keyHelper.verifyToken
                    .withArgs({
                        uint8Signature: "refreshTokenSignatureUint8",
                        uint8TokenContent: "refreshTokenPayloadUint8",
                    })
                    .resolves(false);

                try {
                    await refreshTokenFlow.exchangeRefreshTokenForAccessToken({ formData: mockedFormData, host: "someHost" });
                    throw new Error("Function under test was expected to throw error");
                } catch (error) {
                    assert.deepEqual(
                        error,
                        new AuthenticationError({
                            errorCategory: AuthenticationError.errrorCategories.INVALID_GRANT,
                            errorDescription: "Signature of refresh token could not be verified.",
                        }),
                    );
                }
            });

            it("should throw when getting refresh token rejects", async () => {
                sinon.stub(keyHelper);
                sinon.stub(util);
                sinon.stub(refreshTokenStorage);

                util.urlBase64Touint8.withArgs("someRefreshTokenSignatureBase64").returns("refreshTokenSignatureUint8");
                util.strToUint8.withArgs("someRefreshTokenPayloadBase64").returns("refreshTokenPayloadUint8");

                keyHelper.verifyToken
                    .withArgs({
                        uint8Signature: "refreshTokenSignatureUint8",
                        uint8TokenContent: "refreshTokenPayloadUint8",
                    })
                    .resolves(true);

                util.urlBase64ToStr.withArgs("someRefreshTokenPayloadBase64").returns(
                    JSON.stringify({
                        token_id: "someTokenId",
                        grant_id: "someGrantId",
                    }),
                );

                util.urlBase64ToStr.withArgs("someRefreshTokenPayloadBase64").returns(
                    JSON.stringify({
                        token_id: "someTokenId",
                        grant_id: "someGrantId",
                    }),
                );

                const expectedError = new Error("I searched so hard, but could not find your token");
                refreshTokenStorage.getRefreshToken.withArgs("someTokenId").rejects(expectedError);

                try {
                    await refreshTokenFlow.exchangeRefreshTokenForAccessToken({ formData: mockedFormData, host: "someHost" });
                    throw new Error("Function under test was expected to throw error");
                } catch (error) {
                    assert.equal(error, expectedError);
                }
            });

            it("should throw when saved refresh token is null", async () => {
                sinon.stub(keyHelper);
                sinon.stub(util);
                sinon.stub(refreshTokenStorage);

                util.urlBase64Touint8.withArgs("someRefreshTokenSignatureBase64").returns("refreshTokenSignatureUint8");
                util.strToUint8.withArgs("someRefreshTokenPayloadBase64").returns("refreshTokenPayloadUint8");

                keyHelper.verifyToken
                    .withArgs({
                        uint8Signature: "refreshTokenSignatureUint8",
                        uint8TokenContent: "refreshTokenPayloadUint8",
                    })
                    .resolves(true);

                util.urlBase64ToStr.withArgs("someRefreshTokenPayloadBase64").returns(
                    JSON.stringify({
                        token_id: "someTokenId",
                        grant_id: "someGrantId",
                    }),
                );

                util.urlBase64ToStr.withArgs("someRefreshTokenPayloadBase64").returns(
                    JSON.stringify({
                        token_id: "someTokenId",
                        grant_id: "someGrantId",
                    }),
                );

                refreshTokenStorage.getRefreshToken.withArgs("someTokenId").resolves(null);

                try {
                    await refreshTokenFlow.exchangeRefreshTokenForAccessToken({ formData: mockedFormData, host: "someHost" });
                    throw new Error("Function under test was expected to throw error");
                } catch (error) {
                    assert.deepEqual(
                        error,
                        new AuthenticationError({
                            errorCategory: AuthenticationError.errrorCategories.INVALID_GRANT,
                            errorDescription: "Refresh token was not found.",
                        }),
                    );
                }
            });

            it("should throw when saved refresh token is no longer active and deactivate refresh token and delete grant", async () => {
                sinon.stub(keyHelper);
                sinon.stub(util);
                sinon.stub(refreshTokenStorage);
                sinon.stub(grantStorage);

                util.urlBase64Touint8.withArgs("someRefreshTokenSignatureBase64").returns("refreshTokenSignatureUint8");
                util.strToUint8.withArgs("someRefreshTokenPayloadBase64").returns("refreshTokenPayloadUint8");

                keyHelper.verifyToken
                    .withArgs({
                        uint8Signature: "refreshTokenSignatureUint8",
                        uint8TokenContent: "refreshTokenPayloadUint8",
                    })
                    .resolves(true);

                util.urlBase64ToStr.withArgs("someRefreshTokenPayloadBase64").returns(
                    JSON.stringify({
                        token_id: "someTokenId",
                        grant_id: "someGrantId",
                    }),
                );

                util.urlBase64ToStr.withArgs("someRefreshTokenPayloadBase64").returns(
                    JSON.stringify({
                        token_id: "someTokenId",
                        grant_id: "someGrantId",
                    }),
                );

                refreshTokenStorage.getRefreshToken.withArgs("someTokenId").resolves({ active: false, grantId: "someGrantId", username: "dummy" });

                try {
                    await refreshTokenFlow.exchangeRefreshTokenForAccessToken({ formData: mockedFormData, host: "someHost" });
                    throw new Error("Function under test was expected to throw error");
                } catch (error) {
                    assert.deepEqual(
                        error,
                        new AuthenticationError({
                            errorCategory: AuthenticationError.errrorCategories.INVALID_GRANT,
                            errorDescription: "Refresh token is no longer active.",
                        }),
                    );

                    sinon.assert.calledOnceWithExactly(refreshTokenStorage.deactivateRefreshToken, { refreshTokenId: "someTokenId", username: "dummy" });
                    sinon.assert.calledOnceWithExactly(grantStorage.deleteGrant, { grantId: "someGrantId", username: "dummy" });
                }
            });

            it("should throw when provided and saved client id for refresh token don't match", async () => {
                sinon.stub(keyHelper);
                sinon.stub(util);
                sinon.stub(refreshTokenStorage);
                sinon.stub(grantStorage);

                util.urlBase64Touint8.withArgs("someRefreshTokenSignatureBase64").returns("refreshTokenSignatureUint8");
                util.strToUint8.withArgs("someRefreshTokenPayloadBase64").returns("refreshTokenPayloadUint8");

                keyHelper.verifyToken
                    .withArgs({
                        uint8Signature: "refreshTokenSignatureUint8",
                        uint8TokenContent: "refreshTokenPayloadUint8",
                    })
                    .resolves(true);

                util.urlBase64ToStr.withArgs("someRefreshTokenPayloadBase64").returns(
                    JSON.stringify({
                        token_id: "someTokenId",
                        grant_id: "someGrantId",
                    }),
                );

                util.urlBase64ToStr.withArgs("someRefreshTokenPayloadBase64").returns(
                    JSON.stringify({
                        token_id: "someTokenId",
                        grant_id: "someGrantId",
                    }),
                );

                refreshTokenStorage.getRefreshToken.withArgs("someTokenId").resolves({ active: true, clientId: "someDIFFERENTClientId", grantId: "someGrantId", username: "dummy" });

                grantStorage.getGrant.withArgs("someGrantId").resolves({ scope: ["someScope1", "someScope2"], username: "dummy" });

                try {
                    await refreshTokenFlow.exchangeRefreshTokenForAccessToken({ formData: mockedFormData, host: "someHost" });
                    throw new Error("Function under test was expected to throw error");
                } catch (error) {
                    assert.deepEqual(
                        error,
                        new AuthenticationError({
                            errorCategory: AuthenticationError.errrorCategories.INVALID_GRANT,
                            errorDescription: "Invalid client for refresh token.",
                        }),
                    );
                }
            });

            it("should throw when refresh token deactivation fails", async () => {
                sinon.stub(keyHelper);
                sinon.stub(util);
                sinon.stub(refreshTokenStorage);
                sinon.stub(grantStorage);

                util.urlBase64Touint8.withArgs("someRefreshTokenSignatureBase64").returns("refreshTokenSignatureUint8");
                util.strToUint8.withArgs("someRefreshTokenPayloadBase64").returns("refreshTokenPayloadUint8");

                keyHelper.verifyToken
                    .withArgs({
                        uint8Signature: "refreshTokenSignatureUint8",
                        uint8TokenContent: "refreshTokenPayloadUint8",
                    })
                    .resolves(true);

                util.urlBase64ToStr.withArgs("someRefreshTokenPayloadBase64").returns(
                    JSON.stringify({
                        token_id: "someTokenId",
                        grant_id: "someGrantId",
                    }),
                );

                util.urlBase64ToStr.withArgs("someRefreshTokenPayloadBase64").returns(
                    JSON.stringify({
                        token_id: "someTokenId",
                        grant_id: "someGrantId",
                    }),
                );

                refreshTokenStorage.getRefreshToken.withArgs("someTokenId").resolves({ active: true, clientId: "someClientId", grantId: "someGrantId", username: "dummy" });
                grantStorage.getGrant.withArgs("someGrantId").resolves({ scope: ["someScope1", "someScope2"], username: "dummy" });

                const expectedError = new Error("Cannot deactivate refresh token");
                refreshTokenStorage.deactivateRefreshToken.withArgs({ refreshTokenId: "someTokenId", username: "dummy" }).rejects(expectedError);

                try {
                    await refreshTokenFlow.exchangeRefreshTokenForAccessToken({ formData: mockedFormData, host: "someHost" });
                    throw new Error("Function under test was expected to throw error");
                } catch (error) {
                    assert.equal(error, expectedError);
                }
            });

            it("should throw when getting grant details rejects", async () => {
                sinon.stub(keyHelper);
                sinon.stub(util);
                sinon.stub(refreshTokenStorage);
                sinon.stub(grantStorage);

                util.urlBase64Touint8.withArgs("someRefreshTokenSignatureBase64").returns("refreshTokenSignatureUint8");
                util.strToUint8.withArgs("someRefreshTokenPayloadBase64").returns("refreshTokenPayloadUint8");

                keyHelper.verifyToken
                    .withArgs({
                        uint8Signature: "refreshTokenSignatureUint8",
                        uint8TokenContent: "refreshTokenPayloadUint8",
                    })
                    .resolves(true);

                util.urlBase64ToStr.withArgs("someRefreshTokenPayloadBase64").returns(
                    JSON.stringify({
                        token_id: "someTokenId",
                        grant_id: "someGrantId",
                    }),
                );

                util.urlBase64ToStr.withArgs("someRefreshTokenPayloadBase64").returns(
                    JSON.stringify({
                        token_id: "someTokenId",
                        grant_id: "someGrantId",
                    }),
                );

                refreshTokenStorage.getRefreshToken.withArgs("someTokenId").resolves({ active: true, clientId: "someClientId", grantId: "someGrantId", username: "dummy" });

                const expectedError = new Error("No grants to be found");
                grantStorage.getGrant.withArgs("someGrantId").rejects(expectedError);

                try {
                    await refreshTokenFlow.exchangeRefreshTokenForAccessToken({ formData: mockedFormData, host: "someHost" });
                    throw new Error("Function under test was expected to throw error");
                } catch (error) {
                    assert.equal(error, expectedError);
                }
            });

            it("should throw when getting grant details is null", async () => {
                sinon.stub(keyHelper);
                sinon.stub(util);
                sinon.stub(refreshTokenStorage);
                sinon.stub(grantStorage);

                util.urlBase64Touint8.withArgs("someRefreshTokenSignatureBase64").returns("refreshTokenSignatureUint8");
                util.strToUint8.withArgs("someRefreshTokenPayloadBase64").returns("refreshTokenPayloadUint8");

                keyHelper.verifyToken
                    .withArgs({
                        uint8Signature: "refreshTokenSignatureUint8",
                        uint8TokenContent: "refreshTokenPayloadUint8",
                    })
                    .resolves(true);

                util.urlBase64ToStr.withArgs("someRefreshTokenPayloadBase64").returns(
                    JSON.stringify({
                        token_id: "someTokenId",
                        grant_id: "someGrantId",
                    }),
                );

                util.urlBase64ToStr.withArgs("someRefreshTokenPayloadBase64").returns(
                    JSON.stringify({
                        token_id: "someTokenId",
                        grant_id: "someGrantId",
                    }),
                );

                refreshTokenStorage.getRefreshToken.withArgs("someTokenId").resolves({ active: true, clientId: "someClientId", grantId: "someGrantId", username: "dummy" });

                grantStorage.getGrant.withArgs("someGrantId").resolves(null);

                try {
                    await refreshTokenFlow.exchangeRefreshTokenForAccessToken({ formData: mockedFormData, host: "someHost" });
                    throw new Error("Function under test was expected to throw error");
                } catch (error) {
                    assert.deepEqual(
                        error,
                        new AuthenticationError({
                            errorCategory: AuthenticationError.errrorCategories.INVALID_GRANT,
                            errorDescription: "Grant is no longer active.",
                        }),
                    );
                }
            });

            it("should throw when requested scopes are not contained in saved grant details", async () => {
                sinon.stub(keyHelper);
                sinon.stub(util);
                sinon.stub(refreshTokenStorage);
                sinon.stub(grantStorage);

                util.urlBase64Touint8.withArgs("someRefreshTokenSignatureBase64").returns("refreshTokenSignatureUint8");
                util.strToUint8.withArgs("someRefreshTokenPayloadBase64").returns("refreshTokenPayloadUint8");

                keyHelper.verifyToken
                    .withArgs({
                        uint8Signature: "refreshTokenSignatureUint8",
                        uint8TokenContent: "refreshTokenPayloadUint8",
                    })
                    .resolves(true);

                util.urlBase64ToStr.withArgs("someRefreshTokenPayloadBase64").returns(
                    JSON.stringify({
                        token_id: "someTokenId",
                        grant_id: "someGrantId",
                    }),
                );

                util.urlBase64ToStr.withArgs("someRefreshTokenPayloadBase64").returns(
                    JSON.stringify({
                        token_id: "someTokenId",
                        grant_id: "someGrantId",
                    }),
                );

                refreshTokenStorage.getRefreshToken.withArgs("someTokenId").resolves({ active: true, clientId: "someClientId", grantId: "someGrantId", username: "dummy" });

                grantStorage.getGrant.withArgs("someGrantId").resolves({ scope: ["otherScope1", "otherScope1"], username: "dummy" });

                try {
                    await refreshTokenFlow.exchangeRefreshTokenForAccessToken({ formData: mockedFormData, host: "someHost" });
                    throw new Error("Function under test was expected to throw error");
                } catch (error) {
                    assert.deepEqual(
                        error,
                        new AuthenticationError({
                            errorCategory: AuthenticationError.errrorCategories.INVALID_GRANT,
                            errorDescription: "Requested scopes were not granted for refresh token",
                        }),
                    );
                }
            });

            it("should throw when not all requested scopes are contained in saved grant details", async () => {
                sinon.stub(keyHelper);
                sinon.stub(util);
                sinon.stub(refreshTokenStorage);
                sinon.stub(grantStorage);

                util.urlBase64Touint8.withArgs("someRefreshTokenSignatureBase64").returns("refreshTokenSignatureUint8");
                util.strToUint8.withArgs("someRefreshTokenPayloadBase64").returns("refreshTokenPayloadUint8");

                keyHelper.verifyToken
                    .withArgs({
                        uint8Signature: "refreshTokenSignatureUint8",
                        uint8TokenContent: "refreshTokenPayloadUint8",
                    })
                    .resolves(true);

                util.urlBase64ToStr.withArgs("someRefreshTokenPayloadBase64").returns(
                    JSON.stringify({
                        token_id: "someTokenId",
                        grant_id: "someGrantId",
                    }),
                );

                util.urlBase64ToStr.withArgs("someRefreshTokenPayloadBase64").returns(
                    JSON.stringify({
                        token_id: "someTokenId",
                        grant_id: "someGrantId",
                    }),
                );

                refreshTokenStorage.getRefreshToken.withArgs("someTokenId").resolves({ active: true, clientId: "someClientId", grantId: "someGrantId", username: "dummy" });

                grantStorage.getGrant.withArgs("someGrantId").resolves({ scope: ["someScope1", "otherScope1"], username: "dummy" });

                try {
                    await refreshTokenFlow.exchangeRefreshTokenForAccessToken({ formData: mockedFormData, host: "someHost" });
                    throw new Error("Function under test was expected to throw error");
                } catch (error) {
                    assert.deepEqual(
                        error,
                        new AuthenticationError({
                            errorCategory: AuthenticationError.errrorCategories.INVALID_GRANT,
                            errorDescription: "Requested scopes were not granted for refresh token",
                        }),
                    );
                }
            });

            it("should throw when token creator cannot create response", async () => {
                sinon.stub(keyHelper);
                sinon.stub(util);
                sinon.stub(refreshTokenStorage);
                sinon.stub(grantStorage);
                sinon.stub(tokenCreator);

                util.urlBase64Touint8.withArgs("someRefreshTokenSignatureBase64").returns("refreshTokenSignatureUint8");
                util.strToUint8.withArgs("someRefreshTokenPayloadBase64").returns("refreshTokenPayloadUint8");

                keyHelper.verifyToken
                    .withArgs({
                        uint8Signature: "refreshTokenSignatureUint8",
                        uint8TokenContent: "refreshTokenPayloadUint8",
                    })
                    .resolves(true);

                util.urlBase64ToStr.withArgs("someRefreshTokenPayloadBase64").returns(
                    JSON.stringify({
                        token_id: "someTokenId",
                        grant_id: "someGrantId",
                    }),
                );

                util.urlBase64ToStr.withArgs("someRefreshTokenPayloadBase64").returns(
                    JSON.stringify({
                        token_id: "someTokenId",
                        grant_id: "someGrantId",
                    }),
                );

                refreshTokenStorage.getRefreshToken.withArgs("someTokenId").resolves({ active: true, clientId: "someClientId", grantId: "someGrantId", username: "dummy" });
                grantStorage.getGrant.withArgs("someGrantId").resolves({ scope: ["someScope1", "someScope2"], username: "dummy" });

                refreshTokenStorage.deactivateRefreshToken.withArgs("someTokenId").resolves();

                const expectedError = new Error("No more tokens in stock");

                tokenCreator.getAccessTokenResponse
                    .withArgs({
                        grantId: "someGrantId",
                        clientId: "someClientId",
                        scope: ["someScope1", "someScope2"],
                        username: "dummy",
                        issuer: "someHost",
                    })
                    .rejects(expectedError);

                try {
                    await refreshTokenFlow.exchangeRefreshTokenForAccessToken({ formData: mockedFormData, host: "someHost" });
                    throw new Error("Function under test was expected to throw error");
                } catch (error) {
                    assert.equal(error, expectedError);
                }
            });
        });

        describe("success cases", () => {
            it("should return token response", async () => {
                sinon.stub(keyHelper);
                sinon.stub(util);
                sinon.stub(refreshTokenStorage);
                sinon.stub(grantStorage);
                sinon.stub(tokenCreator);

                util.urlBase64Touint8.withArgs("someRefreshTokenSignatureBase64").returns("refreshTokenSignatureUint8");
                util.strToUint8.withArgs("someRefreshTokenPayloadBase64").returns("refreshTokenPayloadUint8");

                keyHelper.verifyToken
                    .withArgs({
                        uint8Signature: "refreshTokenSignatureUint8",
                        uint8TokenContent: "refreshTokenPayloadUint8",
                    })
                    .resolves(true);

                util.urlBase64ToStr.withArgs("someRefreshTokenPayloadBase64").returns(
                    JSON.stringify({
                        token_id: "someTokenId",
                        grant_id: "someGrantId",
                    }),
                );

                util.urlBase64ToStr.withArgs("someRefreshTokenPayloadBase64").returns(
                    JSON.stringify({
                        token_id: "someTokenId",
                        grant_id: "someGrantId",
                    }),
                );

                refreshTokenStorage.getRefreshToken.withArgs("someTokenId").resolves({ active: true, clientId: "someClientId", grantId: "someGrantId", username: "dummy" });
                grantStorage.getGrant.withArgs("someGrantId").resolves({ scope: ["someScope1", "someScope2"], username: "dummy" });

                refreshTokenStorage.deactivateRefreshToken.withArgs("someTokenId").resolves();

                tokenCreator.getAccessTokenResponse
                    .withArgs({
                        grantId: "someGrantId",
                        clientId: "someClientId",
                        scope: ["someScope1", "someScope2"],
                        username: "dummy",
                        issuer: "someHost",
                    })
                    .resolves("tokenResponse");

                const response = await refreshTokenFlow.exchangeRefreshTokenForAccessToken({ formData: mockedFormData, host: "someHost" });

                assert.equal(response, "tokenResponse");
            });
        });
    });
});
