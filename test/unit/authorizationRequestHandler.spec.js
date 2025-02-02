import { assert } from "chai";
import { beforeEach, describe } from "mocha";
import sinon from "sinon";
import authorizationRequestHandler from "../../src/authorizationRequestHandler.js";

import clientAuthenticator from "../../src/authentication/client.js";
import userAuthenticator from "../../src/authentication/user.js";
import AuthenticationError from "../../src/error/authenticationError.js";
import basicAuthHelper from "../../src/helper/basicAuth.js";
import logger from "../../src/logger.js";
import codeStorage from "../../src/storage/code.js";
import util from "../../src/util.js";
import authCodeGrantValidator from "../../src/validation/authCodeGrantValidator.js";
import sharedValidator from "../../src/validation/sharedValidator.js";

const getUrlWithSearchParams = (searchParams) => {
    const url = new URL("http://localhost:8787");
    for (const [name, value] of Object.entries(searchParams)) {
        url.searchParams.set(name, value);
    }
    return url.toString();
};

describe("The authorization request handler", () => {
    beforeEach(() => {
        sinon.stub(logger);
    });

    describe("error cases", () => {
        describe("pre validation", () => {
            it("should redirect to app URL with error when method is not suported", async () => {
                const jsonBodyStub = sinon.stub();
                const response = await authorizationRequestHandler.handleAuthorizationRequest({
                    json: jsonBodyStub,
                    url: "http://localhost:8787",
                    method: "UNSUPPORTED",
                });

                assert.equal(response.status, 302);
                const url = new URL(response.headers.get("Location"));
                assert.equal(url.searchParams.get("error"), "server_error");
                assert.equal(url.searchParams.get("error_description"), "Encountered unsupported 'UNSUPPORTED' method while trying to get parameters.");
                sinon.assert.calledOnce(logger.logError);
                assert.equal(
                    logger.logError.firstCall.args[0].message,

                    "Encountered unsupported 'UNSUPPORTED' method while trying to get parameters.",
                );
                sinon.assert.notCalled(jsonBodyStub);
            });

            it("should redirect to app URL with error when JSON parsing of body returns rejected Promise", async () => {
                const jsonBodyStub = sinon.stub();

                const expectedError = new Error("Invalid JSON");
                jsonBodyStub.rejects(expectedError);

                const response = await authorizationRequestHandler.handleAuthorizationRequest({
                    json: jsonBodyStub,
                    url: "http://localhost:8787",
                    method: "POST",
                });

                assert.equal(response.status, 302);
                const url = new URL(response.headers.get("Location"));
                assert.equal(url.searchParams.get("error"), "server_error");
                assert.equal(url.searchParams.get("error_description"), "Invalid JSON");
                sinon.assert.calledOnceWithExactly(logger.logError, expectedError);
            });
        });

        describe("validation errors", () => {
            let sharedValidatorStub;
            let authCodeGrantValidatorStub;

            beforeEach(() => {
                sharedValidatorStub = sinon.stub(sharedValidator);
                authCodeGrantValidatorStub = sinon.stub(authCodeGrantValidator);
            });

            it("should return converted authentication error response, when validation of response type fails", async () => {
                const authentionErrorStub = sinon.createStubInstance(AuthenticationError);
                authentionErrorStub.toResponse.withArgs("http://localhost:8788/login").returns("expectedErrorReturnValue");

                authCodeGrantValidatorStub.isValidResponseType.withArgs("myResponseTypeUnderTest").throws(authentionErrorStub);

                const response = await authorizationRequestHandler.handleAuthorizationRequest({
                    url: getUrlWithSearchParams({
                        response_type: "myResponseTypeUnderTest",
                    }),
                    method: "GET",
                });

                assert.equal(response, "expectedErrorReturnValue");
                sinon.assert.calledOnceWithExactly(logger.logError, authentionErrorStub);
            });

            it("should return converted authentication error response, when validation of client id fails", async () => {
                const authentionErrorStub = sinon.createStubInstance(AuthenticationError);
                authentionErrorStub.toResponse.withArgs("http://localhost:8788/login").returns("expectedErrorReturnValue");

                sharedValidator.isValidClientId.withArgs("myClientIdUnderTest").throws(authentionErrorStub);

                const response = await authorizationRequestHandler.handleAuthorizationRequest({
                    url: getUrlWithSearchParams({
                        client_id: "myClientIdUnderTest",
                    }),
                    method: "GET",
                });

                assert.equal(response, "expectedErrorReturnValue");
                sinon.assert.calledOnceWithExactly(logger.logError, authentionErrorStub);
            });

            it("should return converted authentication error response, when validation of redirect uri fails", async () => {
                const authentionErrorStub = sinon.createStubInstance(AuthenticationError);
                authentionErrorStub.toResponse.withArgs("http://localhost:8788/login").returns("expectedErrorReturnValue");

                sharedValidatorStub.isValidRedirectUri.withArgs("myUrlUnderTest").throws(authentionErrorStub);

                const response = await authorizationRequestHandler.handleAuthorizationRequest({
                    url: getUrlWithSearchParams({
                        redirect_uri: "myUrlUnderTest",
                    }),
                    method: "GET",
                });

                assert.equal(response, "expectedErrorReturnValue");
                sinon.assert.calledOnceWithExactly(logger.logError, authentionErrorStub);
            });

            it("should return converted authentication error response, when validation of scope fails", async () => {
                const authentionErrorStub = sinon.createStubInstance(AuthenticationError);
                authentionErrorStub.toResponse.withArgs("http://localhost:8788/login").returns("expectedErrorReturnValue");

                sharedValidatorStub.isValidScope.withArgs(["myScopeUnderTest"]).throws(authentionErrorStub);

                const response = await authorizationRequestHandler.handleAuthorizationRequest({
                    url: getUrlWithSearchParams({
                        scope: "myScopeUnderTest",
                    }),
                    method: "GET",
                });

                assert.equal(response, "expectedErrorReturnValue");
                sinon.assert.calledOnceWithExactly(logger.logError, authentionErrorStub);
            });

            it("should return converted authentication error response, when validation of code challenge fails", async () => {
                const authentionErrorStub = sinon.createStubInstance(AuthenticationError);
                authentionErrorStub.toResponse.withArgs("http://localhost:8788/login").returns("expectedErrorReturnValue");

                authCodeGrantValidatorStub.isValidCodeChallenge.withArgs("myCodeChallengeUnderTest").throws(authentionErrorStub);

                const response = await authorizationRequestHandler.handleAuthorizationRequest({
                    url: getUrlWithSearchParams({
                        code_challenge: "myCodeChallengeUnderTest",
                    }),
                    method: "GET",
                });

                assert.equal(response, "expectedErrorReturnValue");
                sinon.assert.calledOnceWithExactly(logger.logError, authentionErrorStub);
            });

            it("should return converted authentication error response, when validation of code challenge transform method fails", async () => {
                const authentionErrorStub = sinon.createStubInstance(AuthenticationError);
                authentionErrorStub.toResponse.withArgs("http://localhost:8788/login").returns("expectedErrorReturnValue");

                authCodeGrantValidatorStub.isValidCodeChallengeTransformMethod.withArgs("myCodeChallengeMethodUnderTest").throws(authentionErrorStub);

                const response = await authorizationRequestHandler.handleAuthorizationRequest({
                    url: getUrlWithSearchParams({
                        code_challenge_method: "myCodeChallengeMethodUnderTest",
                    }),
                    method: "GET",
                });

                assert.equal(response, "expectedErrorReturnValue");
                sinon.assert.calledOnceWithExactly(logger.logError, authentionErrorStub);
            });
        });

        describe("post validation", () => {
            const jsonBodyStub = sinon.stub();

            beforeEach(() => {
                sinon.stub(authCodeGrantValidator);
                sinon.stub(sharedValidator);

                jsonBodyStub.resolves({
                    response_type: "testResponseType",
                    client_id: "test",
                    redirect_uri: "http://localhost:8787/fooUri",
                    scope: "test,test2",
                    code_challenge: "challenge",
                    code_challenge_method: "challenge_method",
                    state: "washington",
                });

                authCodeGrantValidator.isValidResponseType.withArgs("testResponseType").returns("testResponseType");
                sharedValidator.isValidClientId.withArgs("test").returns("test");
                sharedValidator.isValidRedirectUri.withArgs("http://localhost:8787/fooUri").returns("http://localhost:8787/fooUri");
                sharedValidator.isValidScope.withArgs(["test", "test2"]).returns(["test", "test2"]);
                authCodeGrantValidator.isValidCodeChallenge.withArgs("challenge").returns("challenge");
                authCodeGrantValidator.isValidCodeChallengeTransformMethod.withArgs("challenge_method").returns("challenge_method");
            });

            it("should redirect to app URL with error when client authentication fails", async () => {
                sinon.stub(clientAuthenticator);

                const expectedError = new Error("Invalid client");
                clientAuthenticator.authenticateClient.withArgs("test", "http://localhost:8787/fooUri").rejects(expectedError);

                const response = await authorizationRequestHandler.handleAuthorizationRequest({
                    json: jsonBodyStub,
                    url: "http://localhost:8787",
                    method: "POST",
                });

                assert.equal(response.status, 302);
                const url = new URL(response.headers.get("Location"));
                assert.equal(url.searchParams.get("error"), "server_error");
                assert.equal(url.searchParams.get("error_description"), "Invalid client");
                sinon.assert.calledOnceWithExactly(logger.logError, expectedError);
            });

            it("should redirect to app URL with error when client authentication fails", async () => {
                sinon.stub(clientAuthenticator);
                sinon.stub(basicAuthHelper);
                sinon.stub(userAuthenticator);

                clientAuthenticator.authenticateClient.withArgs("test", "http://localhost:8787/fooUri").resolves();

                basicAuthHelper.extractUserInfoFromBasicAuthHeader.withArgs("something:basic").returns({
                    username: "dummy",
                    password: "insecure",
                });

                const expectedError = new Error("Invalid user");
                userAuthenticator.authenticateUser
                    .withArgs({
                        username: "dummy",
                        password: "insecure",
                        scope: ["test", "test2"],
                    })
                    .rejects(expectedError);

                const headersGetStub = sinon.stub();
                headersGetStub.returns("something:basic");

                const response = await authorizationRequestHandler.handleAuthorizationRequest({
                    json: jsonBodyStub,
                    url: "http://localhost:8787",
                    method: "POST",
                    headers: {
                        get: headersGetStub,
                    },
                });

                assert.equal(response.status, 302);
                const url = new URL(response.headers.get("Location"));
                assert.equal(url.searchParams.get("error"), "server_error");
                assert.equal(url.searchParams.get("error_description"), "Invalid user");
                sinon.assert.calledOnceWithExactly(logger.logError, expectedError);
            });

            it("should redirect to app URL with error when user authentication fails", async () => {
                sinon.stub(clientAuthenticator);
                sinon.stub(basicAuthHelper);
                sinon.stub(userAuthenticator);

                clientAuthenticator.authenticateClient.withArgs("test", "http://localhost:8787/fooUri").resolves();

                basicAuthHelper.extractUserInfoFromBasicAuthHeader.withArgs("something:basic").returns({
                    username: "dummy",
                    password: "insecure",
                });

                const expectedError = new Error("Invalid user");
                userAuthenticator.authenticateUser
                    .withArgs({
                        username: "dummy",
                        password: "insecure",
                        scope: ["test", "test2"],
                    })
                    .rejects(expectedError);

                const headersGetStub = sinon.stub();
                headersGetStub.returns("something:basic");

                const response = await authorizationRequestHandler.handleAuthorizationRequest({
                    json: jsonBodyStub,
                    url: "http://localhost:8787",
                    method: "POST",
                    headers: {
                        get: headersGetStub,
                    },
                });

                assert.equal(response.status, 302);
                const url = new URL(response.headers.get("Location"));
                assert.equal(url.searchParams.get("error"), "server_error");
                assert.equal(url.searchParams.get("error_description"), "Invalid user");
                sinon.assert.calledOnceWithExactly(logger.logError, expectedError);
            });

            it("should redirect to app URL with error when generating access code fails", async () => {
                sinon.stub(clientAuthenticator);
                sinon.stub(basicAuthHelper);
                sinon.stub(userAuthenticator);
                sinon.stub(util);

                clientAuthenticator.authenticateClient.withArgs("test", "http://localhost:8787/fooUri").resolves();

                basicAuthHelper.extractUserInfoFromBasicAuthHeader.withArgs("something:basic").returns({
                    username: "dummy",
                    password: "insecure",
                });

                userAuthenticator.authenticateUser
                    .withArgs({
                        username: "dummy",
                        password: "insecure",
                        scope: ["test", "test2"],
                    })
                    .resolves();

                const expectedError = new Error("RNG is broken");

                util.generateRandomSha256HexString.rejects(expectedError);

                const headersGetStub = sinon.stub();
                headersGetStub.returns("something:basic");

                const response = await authorizationRequestHandler.handleAuthorizationRequest({
                    json: jsonBodyStub,
                    url: "http://localhost:8787",
                    method: "POST",
                    headers: {
                        get: headersGetStub,
                    },
                });

                assert.equal(response.status, 302);
                const url = new URL(response.headers.get("Location"));
                assert.equal(url.searchParams.get("error"), "server_error");
                assert.equal(url.searchParams.get("error_description"), "RNG is broken");
                sinon.assert.calledOnceWithExactly(logger.logError, expectedError);
            });

            it("should redirect to app URL with error when generating access code fails", async () => {
                sinon.stub(clientAuthenticator);
                sinon.stub(basicAuthHelper);
                sinon.stub(userAuthenticator);
                sinon.stub(util);

                clientAuthenticator.authenticateClient.withArgs("test", "http://localhost:8787/fooUri").resolves();

                basicAuthHelper.extractUserInfoFromBasicAuthHeader.withArgs("something:basic").returns({
                    username: "dummy",
                    password: "insecure",
                });

                userAuthenticator.authenticateUser
                    .withArgs({
                        username: "dummy",
                        password: "insecure",
                        scope: ["test", "test2"],
                    })
                    .resolves();

                const expectedError = new Error("RNG is broken");

                util.generateRandomSha256HexString.rejects(expectedError);

                const headersGetStub = sinon.stub();
                headersGetStub.returns("something:basic");

                const response = await authorizationRequestHandler.handleAuthorizationRequest({
                    json: jsonBodyStub,
                    url: "http://localhost:8787",
                    method: "POST",
                    headers: {
                        get: headersGetStub,
                    },
                });

                assert.equal(response.status, 302);
                const url = new URL(response.headers.get("Location"));
                assert.equal(url.searchParams.get("error"), "server_error");
                assert.equal(url.searchParams.get("error_description"), "RNG is broken");
                sinon.assert.calledOnceWithExactly(logger.logError, expectedError);
            });

            it("should redirect to app URL with error when saving access code fails", async () => {
                sinon.stub(clientAuthenticator);
                sinon.stub(basicAuthHelper);
                sinon.stub(userAuthenticator);
                sinon.stub(util);
                sinon.stub(codeStorage);

                clientAuthenticator.authenticateClient.withArgs("test", "http://localhost:8787/fooUri").resolves();

                basicAuthHelper.extractUserInfoFromBasicAuthHeader.withArgs("something:basic").returns({
                    username: "dummy",
                    password: "insecure",
                });

                userAuthenticator.authenticateUser
                    .withArgs({
                        username: "dummy",
                        password: "insecure",
                        scope: ["test", "test2"],
                    })
                    .resolves();

                util.generateRandomSha256HexString.resolves("sha256");

                const expectedError = new Error("No more boxes found for storage");

                codeStorage.saveAccessCode
                    .withArgs({
                        code: "sha256",
                        scope: ["test", "test2"],
                        clientId: "test",
                        codeChallenge: "challenge",
                        codeChallengeMethod: "challenge_method",
                        username: "dummy",
                    })
                    .rejects(expectedError);

                const headersGetStub = sinon.stub();
                headersGetStub.returns("something:basic");

                const response = await authorizationRequestHandler.handleAuthorizationRequest({
                    json: jsonBodyStub,
                    url: "http://localhost:8787",
                    method: "POST",
                    headers: {
                        get: headersGetStub,
                    },
                });

                assert.equal(response.status, 302);
                const url = new URL(response.headers.get("Location"));
                assert.equal(url.searchParams.get("error"), "server_error");
                assert.equal(url.searchParams.get("error_description"), "No more boxes found for storage");
                sinon.assert.calledOnceWithExactly(logger.logError, expectedError);
            });
        });
    });

    describe("success cases", () => {
        const jsonBodyStub = sinon.stub();

        beforeEach(() => {
            sinon.stub(authCodeGrantValidator);
            sinon.stub(sharedValidator);

            jsonBodyStub.resolves({
                response_type: "testResponseType",
                client_id: "test",
                redirect_uri: "http://localhost:8787/fooUri",
                scope: "test,test2",
                code_challenge: "challenge",
                code_challenge_method: "challenge_method",
                state: "washington",
            });

            authCodeGrantValidator.isValidResponseType.withArgs("testResponseType").returns("testResponseType");
            sharedValidator.isValidClientId.withArgs("test").returns("test");
            sharedValidator.isValidRedirectUri.withArgs("http://localhost:8787/fooUri").returns("http://localhost:8787/fooUri");
            sharedValidator.isValidScope.withArgs(["test", "test2"]).returns(["test", "test2"]);
            authCodeGrantValidator.isValidCodeChallenge.withArgs("challenge").returns("challenge");
            authCodeGrantValidator.isValidCodeChallengeTransformMethod.withArgs("challenge_method").returns("challenge_method");
        });

        it("should redirect to login URL when authorization header is missing", async () => {
            sinon.stub(clientAuthenticator);

            clientAuthenticator.authenticateClient.withArgs("test", "http://localhost:8787/fooUri").resolves();

            const headersGetStub = sinon.stub();
            headersGetStub.returns(null);

            const response = await authorizationRequestHandler.handleAuthorizationRequest({
                json: jsonBodyStub,
                url: "http://localhost:8787",
                method: "POST",
                headers: {
                    get: headersGetStub,
                },
            });

            assert.equal(response.status, 302);
            const url = response.headers.get("Location");
            assert.equal(url, "http://localhost:8788/login");
            sinon.assert.calledOnceWithExactly(logger.logMessage, "Redirecting user to login at: http://localhost:8788/login");
            sinon.assert.calledWithExactly(headersGetStub, "Authorization");
        });

        it("should redirect to login URL when authorization header is empty", async () => {
            sinon.stub(clientAuthenticator);

            clientAuthenticator.authenticateClient.withArgs("test", "http://localhost:8787/fooUri").resolves();

            const headersGetStub = sinon.stub();
            headersGetStub.returns("");

            const response = await authorizationRequestHandler.handleAuthorizationRequest({
                json: jsonBodyStub,
                url: "http://localhost:8787",
                method: "POST",
                headers: {
                    get: headersGetStub,
                },
            });

            assert.equal(response.status, 302);
            const url = response.headers.get("Location");
            assert.equal(url, "http://localhost:8788/login");
            sinon.assert.calledOnceWithExactly(logger.logMessage, "Redirecting user to login at: http://localhost:8788/login");
            sinon.assert.calledWithExactly(headersGetStub, "Authorization");
        });

        it("should redirect to app URL when everthing is fine", async () => {
            sinon.stub(clientAuthenticator);
            sinon.stub(basicAuthHelper);
            sinon.stub(userAuthenticator);
            sinon.stub(util);
            sinon.stub(codeStorage);

            clientAuthenticator.authenticateClient.withArgs("test", "http://localhost:8787/fooUri").resolves();

            basicAuthHelper.extractUserInfoFromBasicAuthHeader.withArgs("something:basic").returns({
                username: "dummy",
                password: "insecure",
            });

            userAuthenticator.authenticateUser
                .withArgs({
                    username: "dummy",
                    password: "insecure",
                    scope: ["test", "test2"],
                })
                .resolves();

            util.generateRandomSha256HexString.resolves("sha256");

            codeStorage.saveAccessCode
                .withArgs({
                    code: "sha256",
                    scope: ["test", "test2"],
                    clientId: "test",
                    codeChallenge: "challenge",
                    codeChallengeMethod: "challenge_method",
                    username: "dummy",
                })
                .resolves();

            const headersGetStub = sinon.stub();
            headersGetStub.returns("something:basic");

            const response = await authorizationRequestHandler.handleAuthorizationRequest({
                json: jsonBodyStub,
                url: "http://localhost:8787",
                method: "POST",
                headers: {
                    get: headersGetStub,
                },
            });

            assert.equal(response.status, 302);
            assert.equal(response.headers.get("Location"), "http://localhost:8787/fooUri?code=sha256&state=washington");
            sinon.assert.calledOnceWithExactly(logger.logMessage, "User authentication successful, redirecting to: http://localhost:8787/fooUri?code=sha256&state=washington");
        });
    });
});
