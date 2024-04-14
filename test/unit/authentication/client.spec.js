import sinon from "sinon";
import clientAuthenticator from "../../../src/authentication/client.js";

import { assert } from "chai";
import AuthenticationError from "../../../src/error/authenticationError.js";
import logger from "../../../src/logger.js";
import clientStorage from "../../../src/storage/client.js";

describe("Client authentication", () => {
    describe("authenticateClient", () => {
        it("does not throw, if client was found and supplied redirect uri matches", async () => {
            const getClientStub = sinon.stub(clientStorage, "getClient");
            getClientStub.withArgs("someClient").resolves({
                redirectUri: "http://localhost/valid",
            });

            await clientAuthenticator.authenticateClient("someClient", "http://localhost/valid");
        });

        it("logs error and throws generic error if getting client throws", async () => {
            const getClientStub = sinon.stub(clientStorage, "getClient");
            const expectedError = Object.freeze(new Error("Client could not be found"));
            getClientStub.withArgs("dummyClient").throws(expectedError);

            const errorLogStub = sinon.stub(logger, "logError");

            try {
                await clientAuthenticator.authenticateClient("dummyClient", "http://localhost/irrelevant");
                return Promise.reject("Test fails, because function under test never threw error");
            } catch (error) {
                sinon.assert.calledOnceWithExactly(errorLogStub, expectedError);

                assert.deepEqual(error, new Error("Client authentication failed with unknown error."));
            }
        });

        it("throws if client was not found", async () => {
            const getClientStub = sinon.stub(clientStorage, "getClient");
            getClientStub.withArgs("dummyClient").resolves(null);

            try {
                await clientAuthenticator.authenticateClient("dummyClient", "http://localhost/irrelevant");
                return Promise.reject("Test fails, because function under test never threw error");
            } catch (error) {
                assert.deepEqual(
                    error,
                    new AuthenticationError({
                        errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                        errorDescription: "Could not find client with id 'dummyClient'.",
                    }),
                );
            }
        });

        it("throws if redirect uris do not match", async () => {
            const getClientStub = sinon.stub(clientStorage, "getClient");
            getClientStub.withArgs("dummyClient").resolves({
                redirectUri: "http://localhost/valid",
            });

            try {
                await clientAuthenticator.authenticateClient("dummyClient", "http://localhost/invalid");
                return Promise.reject("Test fails, because function under test never threw error");
            } catch (error) {
                assert.deepEqual(
                    error,
                    new AuthenticationError({
                        errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                        errorDescription: "Redirect URI 'http://localhost/invalid' is not valid for client with id 'dummyClient'.",
                    }),
                );
            }
        });
    });
});
