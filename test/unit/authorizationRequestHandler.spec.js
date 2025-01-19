import { assert } from "chai";
import { describe } from "mocha";
import sinon from "sinon";
import authorizationRequestHandler from "../../src/authorizationRequestHandler.js";

import AuthenticationError from "../../src/error/authenticationError.js";
import logger from "../../src/logger.js";
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
        it("should return HTTP code 302 and error message, when JSON parsing of body returns rejected Promise", async () => {
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

        describe("validation", () => {
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
    });
});
