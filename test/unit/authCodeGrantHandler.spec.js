import { assert } from "chai";
import { describe } from "mocha";
import sinon from "sinon";
import authCodeGrantHandler from "../../src/authCodeGrantHandler.js";

import logger from "../../src/logger.js";
import authCodeGrantValidator from "../../src/validation/authCodeGrantValidator.js";

xdescribe("The auth code request handler", () => {
    beforeEach(() => {
        sinon.stub(logger);
    });

    describe("error cases", () => {
        it("should return HTTP code 500, when JSON parsing of body returns rejected Promise", async () => {
            const jsonBodyStub = sinon.stub();

            const expectedError = new Error("Invalid JSON");
            jsonBodyStub.rejects(expectedError);

            const response = await authCodeGrantHandler.handleAuthCodeRequest({
                json: jsonBodyStub,
            });

            assert.equal(response.status, 500);
            assert.equal(await response.text(), "Encountered unexpected error.");
            sinon.assert.calledOnceWithExactly(logger.logError, expectedError);
        });

        describe("validation", () => {
            it("should return HTTP code 400 and log error, when validation of redirect uri fails", async () => {
                const jsonBodyStub = sinon.stub();

                jsonBodyStub.resolves({
                    redirect_uri: "http://localhost",
                });

                const expectedError = Object.freeze(new Error("Invalid redirect uri"));
                const authCodeGrantValidatorStub = sinon.stub(authCodeGrantValidator, "isValidRedirectUri");
                authCodeGrantValidatorStub.withArgs("http://localhost").throws(expectedError);

                const response = await authCodeGrantHandler.handleAuthCodeRequest({
                    json: jsonBodyStub,
                });

                assert.equal(response.status, 400);
                assert.equal(await response.text(), "Invalid redirect uri");
                sinon.assert.calledOnceWithExactly(logger.logError, expectedError);
            });

            it("should return HTTP code 400 and log error, when validation of username fails", async () => {
                const jsonBodyStub = sinon.stub();

                jsonBodyStub.resolves({
                    username: "Mr. X",
                });

                const expectedError = Object.freeze(new Error("Invalid username"));
                const authCodeGrantValidatorStub = sinon.stub(authCodeGrantValidator, "isValidUsername");
                authCodeGrantValidatorStub.withArgs("Mr. X").throws(expectedError);

                const response = await authCodeGrantHandler.handleAuthCodeRequest({
                    json: jsonBodyStub,
                });

                assert.equal(response.status, 400);
                assert.equal(await response.text(), "Invalid username");
                sinon.assert.calledOnceWithExactly(logger.logError, expectedError);
            });

            it("should return HTTP code 400 and log error, when validation of password fails", async () => {
                const jsonBodyStub = sinon.stub();

                jsonBodyStub.resolves({
                    password: "pssst",
                });

                const expectedError = Object.freeze(new Error("Invalid password"));
                const authCodeGrantValidatorStub = sinon.stub(authCodeGrantValidator, "isValidPassword");
                authCodeGrantValidatorStub.withArgs("pssst").throws(expectedError);

                const response = await authCodeGrantHandler.handleAuthCodeRequest({
                    json: jsonBodyStub,
                });

                assert.equal(response.status, 400);
                assert.equal(await response.text(), "Invalid password");
                sinon.assert.calledOnceWithExactly(logger.logError, expectedError);
            });

            it("should return HTTP code 400 and log error, when validation of client id fails", async () => {
                const jsonBodyStub = sinon.stub();

                jsonBodyStub.resolves({
                    client_id: "client",
                });

                const expectedError = Object.freeze(new Error("Invalid client id"));
                const authCodeGrantValidatorStub = sinon.stub(authCodeGrantValidator, "isValidClientId");
                authCodeGrantValidatorStub.withArgs("client").throws(expectedError);

                const response = await authCodeGrantHandler.handleAuthCodeRequest({
                    json: jsonBodyStub,
                });

                assert.equal(response.status, 400);
                assert.equal(await response.text(), "Invalid client id");
                sinon.assert.calledOnceWithExactly(logger.logError, expectedError);
            });

            it("should return HTTP code 400 and log error, when validation of scope fails", async () => {
                const jsonBodyStub = sinon.stub();

                jsonBodyStub.resolves({
                    scope: ["superpower"],
                });

                const expectedError = Object.freeze(new Error("Invalid scope"));
                const authCodeGrantValidatorStub = sinon.stub(authCodeGrantValidator, "isValidScope");
                authCodeGrantValidatorStub.withArgs(["superpower"]).throws(expectedError);

                const response = await authCodeGrantHandler.handleAuthCodeRequest({
                    json: jsonBodyStub,
                });

                assert.equal(response.status, 400);
                assert.equal(await response.text(), "Invalid scope");
                sinon.assert.calledOnceWithExactly(logger.logError, expectedError);
            });
        });
    });
});
