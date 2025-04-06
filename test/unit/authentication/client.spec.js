import sinon from "sinon";
import clientAuthenticator from "../../../src/authentication/client.js";

import { assert } from "chai";
import AuthenticationError from "../../../src/error/authenticationError.js";
import logger from "../../../src/logger.js";
import apiStorage from "../../../src/storage/api.js";
import clientStorage from "../../../src/storage/client.js";

describe("Client authentication", () => {
    describe("authenticateClient", () => {
        it("does not throw, if client was found and redirect uri and audiences match", async () => {
            const getClientStub = sinon.stub(clientStorage, "getClient");
            const getApisOfClientStub = sinon.stub(apiStorage, "getApisOfClient");
            getClientStub.withArgs("someClient").resolves({
                RedirectUri: "http://localhost/valid",
            });

            getApisOfClientStub.withArgs("someClient").resolves(["aud1", "aud2"]);

            await clientAuthenticator.authenticateClient({ clientId: "someClient", redirectUri: "http://localhost/valid", audience: ["aud1", "aud2"] });
        });

        it("logs error and throws generic error if getting client throws", async () => {
            const getClientStub = sinon.stub(clientStorage, "getClient");
            const expectedError = Object.freeze(new Error("Client could not be found"));
            getClientStub.withArgs("dummyClient").throws(expectedError);

            const errorLogStub = sinon.stub(logger, "logError");

            try {
                await clientAuthenticator.authenticateClient({ clientId: "dummyClient", redirectUri: "http://localhost/irrelevant", audience: ["aud1", "aud2"] });
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
                await clientAuthenticator.authenticateClient({ clientId: "dummyClient", redirectUri: "http://localhost/irrelevant", audience: ["aud1", "aud2"] });
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
                RedirectUri: "http://localhost/valid",
            });

            try {
                await clientAuthenticator.authenticateClient({ clientId: "dummyClient", redirectUri: "http://localhost/invalid", audience: ["aud1", "aud2"] });
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

        it("logs error and throws generic error if getting APIs of client throws", async () => {
            const getClientStub = sinon.stub(clientStorage, "getClient");
            const getApisOfClientStub = sinon.stub(apiStorage, "getApisOfClient");
            getClientStub.withArgs("dummyClient").resolves({
                RedirectUri: "http://localhost/valid",
            });

            const expectedError = Object.freeze(new Error("Client could not be found"));
            getApisOfClientStub.withArgs("dummyClient").throws(expectedError);

            const errorLogStub = sinon.stub(logger, "logError");

            try {
                await clientAuthenticator.authenticateClient({ clientId: "dummyClient", redirectUri: "http://localhost/valid", audience: ["aud1", "aud2"] });
                return Promise.reject("Test fails, because function under test never threw error");
            } catch (error) {
                sinon.assert.calledOnceWithExactly(errorLogStub, expectedError);

                assert.deepEqual(error, new Error("Client authentication failed with unknown error."));
            }
        });

        it("throws if the client is not entitled for every requested audience", async () => {
            const getClientStub = sinon.stub(clientStorage, "getClient");
            const getApisOfClientStub = sinon.stub(apiStorage, "getApisOfClient");
            getClientStub.withArgs("dummyClient").resolves({
                RedirectUri: "http://localhost/valid",
            });

            getApisOfClientStub.withArgs("dummyClient").resolves(["aud1"]);

            try {
                await clientAuthenticator.authenticateClient({ clientId: "dummyClient", redirectUri: "http://localhost/valid", audience: ["aud1", "aud2"] });
                return Promise.reject("Test fails, because function under test never threw error");
            } catch (error) {
                assert.deepEqual(
                    error,
                    new AuthenticationError({
                        errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                        errorDescription: "Client is not entitled to request tokens with audience 'aud1,aud2'.",
                    }),
                );
            }
        });
    });
});
