import { assert } from "chai";
import sinon from "sinon";
import util from "../../../src/helper/util.js";
import environmentVariables from "../../../src/storage/environmentVariables.js";
import refreshTokenStorage from "../../../src/storage/refreshToken.js";
import tokenCreator from "../../../src/tokenFlows/tokenCreator.js";

describe("Token creator", () => {
    let clock;

    beforeEach(() => {
        clock = sinon.useFakeTimers();
    });

    describe("error cases", () => {
        it("should throw if importing key rejects", async () => {
            sinon.stub(environmentVariables);
            sinon.stub(util);
            sinon.stub(crypto.subtle);
            sinon.stub(refreshTokenStorage);

            environmentVariables.getTokenTimeToLive.returns(10);
            environmentVariables.getRefreshTokenTimeToLive.returns(100);

            clock.tick(1000);

            util.strToUrlBase64
                .withArgs(
                    JSON.stringify({
                        alg: "ES512",
                        typ: "JWT",
                    }),
                )
                .returns("tokenHeaderBase64");

            util.strToUrlBase64
                .withArgs(
                    JSON.stringify({
                        aud: "abc",
                        iss: "someHost",
                        sub: "dummy",
                        exp: 11,
                        iat: 1,
                        scope: ["test1", "test2"],
                    }),
                )
                .returns("tokenPayloadBase64");

            environmentVariables.getSigningKey.returns('{"signingKey":true}');

            const expectedError = new Error("Key is malformed");

            crypto.subtle.importKey
                .withArgs(
                    "jwk",
                    { signingKey: true },
                    {
                        name: "ECDSA",
                        namedCurve: "P-521",
                    },
                    true,
                    ["sign"],
                )
                .rejects(expectedError);

            try {
                await tokenCreator.getAccessTokenResponse({
                    grantId: "someGrant",
                    scope: ["test1", "test2"],
                    username: "dummy",
                    clientId: "someClientId",
                    issuer: "someHost",
                });
                throw new Error("Function under test never threw error");
            } catch (error) {
                assert.equal(error, expectedError);
                sinon.assert.calledOnce(crypto.subtle.importKey);
            }
        });

        it("should throw if signing access token rejects", async () => {
            sinon.stub(environmentVariables);
            sinon.stub(util);
            sinon.stub(crypto.subtle);
            sinon.stub(refreshTokenStorage);

            environmentVariables.getTokenTimeToLive.returns(10);
            environmentVariables.getRefreshTokenTimeToLive.returns(100);

            clock.tick(1000);

            util.strToUrlBase64
                .withArgs(
                    JSON.stringify({
                        alg: "ES512",
                        typ: "JWT",
                    }),
                )
                .returns("tokenHeaderBase64");

            util.strToUrlBase64
                .withArgs(
                    JSON.stringify({
                        aud: "abc",
                        iss: "someHost",
                        sub: "dummy",
                        exp: 11,
                        iat: 1,
                        scope: ["test1", "test2"],
                    }),
                )
                .returns("tokenPayloadBase64");

            environmentVariables.getSigningKey.returns('{"signingKey":true}');

            crypto.subtle.importKey
                .withArgs(
                    "jwk",
                    { signingKey: true },
                    {
                        name: "ECDSA",
                        namedCurve: "P-521",
                    },
                    true,
                    ["sign"],
                )
                .resolves("importedSigningKey");

            util.strToUint8.withArgs("tokenHeaderBase64.tokenPayloadBase64").returns("tokenContentToBeSigned");

            const expectedError = new Error("I forgot how to sign access tokens");

            crypto.subtle.sign.withArgs({ name: "ECDSA", hash: "SHA-512" }, "importedSigningKey", "tokenContentToBeSigned").rejects(expectedError);

            try {
                await tokenCreator.getAccessTokenResponse({
                    grantId: "someGrant",
                    scope: ["test1", "test2"],
                    username: "dummy",
                    clientId: "someClientId",
                    issuer: "someHost",
                });
                throw new Error("Function under test never threw error");
            } catch (error) {
                assert.equal(error, expectedError);
                sinon.assert.calledOnce(crypto.subtle.importKey);
            }
        });

        it("should throw if signing refresh token rejects", async () => {
            sinon.stub(environmentVariables);
            sinon.stub(util);
            sinon.stub(crypto.subtle);
            sinon.stub(refreshTokenStorage);

            environmentVariables.getTokenTimeToLive.returns(10);
            environmentVariables.getRefreshTokenTimeToLive.returns(100);

            clock.tick(1000);

            util.strToUrlBase64
                .withArgs(
                    JSON.stringify({
                        alg: "ES512",
                        typ: "JWT",
                    }),
                )
                .returns("tokenHeaderBase64");

            util.strToUrlBase64
                .withArgs(
                    JSON.stringify({
                        aud: "abc",
                        iss: "someHost",
                        sub: "dummy",
                        exp: 11,
                        iat: 1,
                        scope: ["test1", "test2"],
                    }),
                )
                .returns("tokenPayloadBase64");

            environmentVariables.getSigningKey.returns('{"signingKey":true}');
            crypto.subtle.importKey
                .withArgs(
                    "jwk",
                    { signingKey: true },
                    {
                        name: "ECDSA",
                        namedCurve: "P-521",
                    },
                    true,
                    ["sign"],
                )
                .resolves("importedSigningKey");

            util.strToUint8.withArgs("tokenHeaderBase64.tokenPayloadBase64").returns("tokenContentToBeSigned");

            crypto.subtle.sign.withArgs({ name: "ECDSA", hash: "SHA-512" }, "importedSigningKey", "tokenContentToBeSigned").resolves([1, 2, 3, 4]);

            util.uint8ToUrlBase64.withArgs(new Uint8Array([1, 2, 3, 4])).returns("tokenSignatureBase64");

            util.getRandomUUID.returns("randomId");

            util.strToUrlBase64
                .withArgs(
                    JSON.stringify({
                        token_id: "randomId",
                        exp: 101,
                        iat: 1,
                        grant_id: "someGrant",
                        scope: ["test1", "test2"],
                    }),
                )
                .returns("refreshTokenPayloadBase64");

            util.strToUint8.withArgs("refreshTokenPayloadBase64").returns("refreshTokenContentToBeSigned");

            const expectedError = new Error("I forgot how to sign access tokens");

            crypto.subtle.sign.withArgs({ name: "ECDSA", hash: "SHA-512" }, "importedSigningKey", "refreshTokenContentToBeSigned").rejects(expectedError);

            try {
                await tokenCreator.getAccessTokenResponse({
                    grantId: "someGrant",
                    scope: ["test1", "test2"],
                    username: "dummy",
                    clientId: "someClientId",
                    issuer: "someHost",
                });
                throw new Error("Function under test never threw error");
            } catch (error) {
                assert.equal(error, expectedError);
                sinon.assert.calledTwice(crypto.subtle.importKey);
            }
        });

        it("should throw if saving refresh token rejects", async () => {
            sinon.stub(environmentVariables);
            sinon.stub(util);
            sinon.stub(crypto.subtle);
            sinon.stub(refreshTokenStorage);

            environmentVariables.getTokenTimeToLive.returns(10);
            environmentVariables.getRefreshTokenTimeToLive.returns(100);

            clock.tick(1000);

            util.strToUrlBase64
                .withArgs(
                    JSON.stringify({
                        alg: "ES512",
                        typ: "JWT",
                    }),
                )
                .returns("tokenHeaderBase64");

            util.strToUrlBase64
                .withArgs(
                    JSON.stringify({
                        aud: "abc",
                        iss: "someHost",
                        sub: "dummy",
                        exp: 11,
                        iat: 1,
                        scope: ["test1", "test2"],
                    }),
                )
                .returns("tokenPayloadBase64");

            environmentVariables.getSigningKey.returns('{"signingKey":true}');
            crypto.subtle.importKey
                .withArgs(
                    "jwk",
                    { signingKey: true },
                    {
                        name: "ECDSA",
                        namedCurve: "P-521",
                    },
                    true,
                    ["sign"],
                )
                .resolves("importedSigningKey");

            util.strToUint8.withArgs("tokenHeaderBase64.tokenPayloadBase64").returns("tokenContentToBeSigned");

            crypto.subtle.sign.withArgs({ name: "ECDSA", hash: "SHA-512" }, "importedSigningKey", "tokenContentToBeSigned").resolves([1, 2, 3, 4]);

            util.uint8ToUrlBase64.withArgs(new Uint8Array([1, 2, 3, 4])).returns("tokenSignatureBase64");

            util.getRandomUUID.returns("randomId");

            util.strToUrlBase64
                .withArgs(
                    JSON.stringify({
                        token_id: "randomId",
                        exp: 101,
                        iat: 1,
                        grant_id: "someGrant",
                        scope: ["test1", "test2"],
                    }),
                )
                .returns("refreshTokenPayloadBase64");

            util.strToUint8.withArgs("refreshTokenPayloadBase64").returns("refreshTokenContentToBeSigned");

            crypto.subtle.sign.withArgs({ name: "ECDSA", hash: "SHA-512" }, "importedSigningKey", "refreshTokenContentToBeSigned").resolves([5, 6, 7, 8]);

            util.uint8ToUrlBase64.withArgs(new Uint8Array([5, 6, 7, 8])).returns("refreshTokenSignatureBase64");

            const expectedError = new Error("Storage is full");

            refreshTokenStorage.saveRefreshToken.rejects(expectedError);

            try {
                await tokenCreator.getAccessTokenResponse({
                    grantId: "someGrant",
                    scope: ["test1", "test2"],
                    username: "dummy",
                    clientId: "someClientId",
                    issuer: "someHost",
                });
                throw new Error("Function under test never threw error");
            } catch (error) {
                assert.equal(error, expectedError);
                sinon.assert.calledTwice(crypto.subtle.importKey);
            }
        });
    });

    describe("success cases", () => {
        it("should return successful token response", async () => {
            sinon.stub(environmentVariables);
            sinon.stub(util);
            sinon.stub(crypto.subtle);
            sinon.stub(refreshTokenStorage);

            environmentVariables.getTokenTimeToLive.returns(10);
            environmentVariables.getRefreshTokenTimeToLive.returns(100);

            clock.tick(1000);

            util.strToUrlBase64
                .withArgs(
                    JSON.stringify({
                        alg: "ES512",
                        typ: "JWT",
                    }),
                )
                .returns("tokenHeaderBase64");

            util.strToUrlBase64
                .withArgs(
                    JSON.stringify({
                        aud: "abc",
                        iss: "someHost",
                        sub: "dummy",
                        exp: 11,
                        iat: 1,
                        scope: ["test1", "test2"],
                    }),
                )
                .returns("tokenPayloadBase64");

            environmentVariables.getSigningKey.returns('{"signingKey":true}');
            crypto.subtle.importKey
                .withArgs(
                    "jwk",
                    { signingKey: true },
                    {
                        name: "ECDSA",
                        namedCurve: "P-521",
                    },
                    true,
                    ["sign"],
                )
                .resolves("importedSigningKey");

            util.strToUint8.withArgs("tokenHeaderBase64.tokenPayloadBase64").returns("tokenContentToBeSigned");

            crypto.subtle.sign.withArgs({ name: "ECDSA", hash: "SHA-512" }, "importedSigningKey", "tokenContentToBeSigned").resolves([1, 2, 3, 4]);

            util.uint8ToUrlBase64.withArgs(new Uint8Array([1, 2, 3, 4])).returns("tokenSignatureBase64");

            util.getRandomUUID.returns("randomId");

            util.strToUrlBase64
                .withArgs(
                    JSON.stringify({
                        token_id: "randomId",
                        exp: 101,
                        iat: 1,
                        grant_id: "someGrant",
                        scope: ["test1", "test2"],
                    }),
                )
                .returns("refreshTokenPayloadBase64");

            util.strToUint8.withArgs("refreshTokenPayloadBase64").returns("refreshTokenContentToBeSigned");

            crypto.subtle.sign.withArgs({ name: "ECDSA", hash: "SHA-512" }, "importedSigningKey", "refreshTokenContentToBeSigned").resolves([5, 6, 7, 8]);

            util.uint8ToUrlBase64.withArgs(new Uint8Array([5, 6, 7, 8])).returns("refreshTokenSignatureBase64");

            refreshTokenStorage.saveRefreshToken.resolves();

            const response = await tokenCreator.getAccessTokenResponse({
                grantId: "someGrant",
                scope: ["test1", "test2"],
                username: "dummy",
                clientId: "someClientId",
                issuer: "someHost",
            });

            assert.equal(response.status, 200);
            assert.deepEqual(await response.json(), {
                access_token: "tokenHeaderBase64.tokenPayloadBase64.tokenSignatureBase64",
                refresh_token: "refreshTokenPayloadBase64.refreshTokenSignatureBase64",
                token_type: "JWT",
                expires_in: 10,
                scope: ["test1", "test2"],
            });

            sinon.assert.calledWithExactly(refreshTokenStorage.saveRefreshToken, { refreshTokenId: "randomId", clientId: "someClientId", grantId: "someGrant", scope: ["test1", "test2"], username: "dummy" });
            sinon.assert.calledTwice(crypto.subtle.importKey);
        });
    });
});
