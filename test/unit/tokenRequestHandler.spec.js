import { assert } from "chai";
import { describe } from "mocha";
import sinon from "sinon";

import AuthenticationError from "../../src/error/authenticationError.js";
import logger from "../../src/logger.js";
import authCodeTokenFlow from "../../src/tokenFlows/authCodeTokenFlow.js";
import refreshTokenFlow from "../../src/tokenFlows/refreshTokenFlow.js";
import tokenRequestHandler from "../../src/tokenRequestHandler.js";
import tokenExchangeValidator from "../../src/validation/tokenExchangeValidator.js";

describe("The token request handler", () => {
    beforeEach(() => {
        sinon.stub(logger);
    });

    describe("success cases", () => {
        it("should return response of auth code flow handler when 'grant_type' is 'authorization_code'", async () => {
            sinon.stub(authCodeTokenFlow);
            sinon.stub(tokenExchangeValidator);
            const requestFormDataStub = sinon.stub();

            const requestStub = {
                formData: requestFormDataStub,
            };

            const formDataGetStub = sinon.stub();
            const formDataStub = {
                get: formDataGetStub,
            };
            requestFormDataStub.resolves(formDataStub);
            formDataGetStub.returns("someGrantType");

            tokenExchangeValidator.isValidGrantType.returns("authorization_code");

            authCodeTokenFlow.exchangeAccessCodeForToken.resolves("expectedReturnValue");

            const response = await tokenRequestHandler.handleTokenRequest(requestStub);
            assert.equal(response, "expectedReturnValue");

            sinon.assert.calledOnceWithExactly(requestFormDataStub);
            sinon.assert.calledOnceWithExactly(formDataGetStub, "grant_type");
            sinon.assert.calledOnceWithExactly(tokenExchangeValidator.isValidGrantType, "someGrantType");
            sinon.assert.calledOnceWithExactly(logger.logMessage, "Grant type: authorization_code");
            sinon.assert.calledOnceWithExactly(authCodeTokenFlow.exchangeAccessCodeForToken, formDataStub);
        });

        it("should return response of refresh token flow handler when 'grant_type' is 'refresh_token'", async () => {
            sinon.stub(refreshTokenFlow);
            sinon.stub(tokenExchangeValidator);
            const requestFormDataStub = sinon.stub();

            const requestStub = {
                formData: requestFormDataStub,
            };

            const formDataGetStub = sinon.stub();
            const formDataStub = {
                get: formDataGetStub,
            };
            requestFormDataStub.resolves(formDataStub);
            formDataGetStub.returns("someGrantType");

            tokenExchangeValidator.isValidGrantType.returns("refresh_token");

            refreshTokenFlow.exchangeRefreshTokenForAccessToken.resolves("expectedReturnValue");

            const response = await tokenRequestHandler.handleTokenRequest(requestStub);
            assert.equal(response, "expectedReturnValue");

            sinon.assert.calledOnceWithExactly(requestFormDataStub);
            sinon.assert.calledOnceWithExactly(formDataGetStub, "grant_type");
            sinon.assert.calledOnceWithExactly(tokenExchangeValidator.isValidGrantType, "someGrantType");
            sinon.assert.calledOnceWithExactly(logger.logMessage, "Grant type: refresh_token");
            sinon.assert.calledOnceWithExactly(refreshTokenFlow.exchangeRefreshTokenForAccessToken, formDataStub);
        });
    });

    describe("error cases", () => {
        it("should return 'NOT IMPLEMENTED' response when 'grant_type' does not match expected values", async () => {
            sinon.stub(authCodeTokenFlow);
            sinon.stub(tokenExchangeValidator);
            const requestFormDataStub = sinon.stub();

            const requestStub = {
                formData: requestFormDataStub,
            };

            const formDataGetStub = sinon.stub();
            const formDataStub = {
                get: formDataGetStub,
            };
            requestFormDataStub.resolves(formDataStub);
            formDataGetStub.returns("someGrantType");

            tokenExchangeValidator.isValidGrantType.returns("somethingNotImplemented");

            const response = await tokenRequestHandler.handleTokenRequest(requestStub);
            assert.equal(response.status, 501);
            assert.equal(await response.text(), "");

            sinon.assert.calledOnceWithExactly(requestFormDataStub);
            sinon.assert.calledOnceWithExactly(formDataGetStub, "grant_type");
            sinon.assert.calledOnceWithExactly(tokenExchangeValidator.isValidGrantType, "someGrantType");
            sinon.assert.calledOnceWithExactly(logger.logMessage, "Grant type: somethingNotImplemented");
            sinon.assert.notCalled(authCodeTokenFlow.exchangeAccessCodeForToken);
        });
        it("should log error and return internal server error when getting form data from request fails", async () => {
            sinon.stub(authCodeTokenFlow);
            sinon.stub(tokenExchangeValidator);
            const requestFormDataStub = sinon.stub();

            const requestStub = {
                formData: requestFormDataStub,
            };

            const expectedError = new Error("Something broke");
            requestFormDataStub.throws(expectedError);

            const response = await tokenRequestHandler.handleTokenRequest(requestStub);

            assert.equal(response.status, 500);
            assert.equal(await response.text(), "Something broke");

            sinon.assert.calledOnceWithExactly(requestFormDataStub);
            sinon.assert.calledOnceWithExactly(logger.logError, expectedError);

            sinon.assert.notCalled(tokenExchangeValidator.isValidGrantType);
            sinon.assert.notCalled(logger.logMessage);
            sinon.assert.notCalled(authCodeTokenFlow.exchangeAccessCodeForToken);
        });
        it("should log error and return internal server error with error description when validating 'grant_type' throws authentication error", async () => {
            sinon.stub(authCodeTokenFlow);
            sinon.stub(tokenExchangeValidator);
            const requestFormDataStub = sinon.stub();

            const requestStub = {
                formData: requestFormDataStub,
            };

            const formDataGetStub = sinon.stub();
            const formDataStub = {
                get: formDataGetStub,
            };
            requestFormDataStub.resolves(formDataStub);
            formDataGetStub.returns("someGrantType");

            const expectedError = new AuthenticationError({
                errorCategory: "foo",
                errorDescription: "expectedErrorResponse",
            });

            tokenExchangeValidator.isValidGrantType.throws(expectedError);

            const response = await tokenRequestHandler.handleTokenRequest(requestStub);

            assert.equal(response.status, 500);
            assert.equal(await response.text(), "expectedErrorResponse");

            sinon.assert.calledOnceWithExactly(requestFormDataStub);
            sinon.assert.calledOnceWithExactly(logger.logError, expectedError);
            sinon.assert.calledOnceWithExactly(tokenExchangeValidator.isValidGrantType, "someGrantType");

            sinon.assert.notCalled(logger.logMessage);
            sinon.assert.notCalled(authCodeTokenFlow.exchangeAccessCodeForToken);
        });
    });
});
