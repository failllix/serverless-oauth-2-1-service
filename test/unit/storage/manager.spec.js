import { assert } from "chai";
import storageManager from "../../../src/storage/manager.js";

describe("Storage Manager", () => {
    beforeEach(() => {
        storageManager.initializeStorage({});
    });

    after(() => {
        storageManager.initializeStorage({});
    });

    describe("Client key-value storage", () => {
        it("should initialize the client key-value storage to the value provided in the environment", () => {
            storageManager.initializeStorage({
                CLIENT: "client_KV",
            });

            const clientKeyValueStorage = storageManager.getClientKeyValueStorage();

            assert.equal(clientKeyValueStorage, "client_KV");
        });

        it("should throw an error if one tries to access the client key-value storage before initialization", () => {
            try {
                storageManager.getClientKeyValueStorage();
                return Promise.reject("Function under test never threw error");
            } catch (error) {
                assert.equal(error.message, "Client key-value storage was not initialized.");
            }
        });
    });

    describe("User key-value storage", () => {
        it("should initialize the user key-value storage to the value provided in the environment", () => {
            storageManager.initializeStorage({
                USER: "user_KV",
            });

            const clientKeyValueStorage = storageManager.getUserKeyValueStorage();

            assert.equal(clientKeyValueStorage, "user_KV");
        });

        it("should throw an error if one tries to access the user key-value storage before initialization", () => {
            try {
                storageManager.getUserKeyValueStorage();
                return Promise.reject("Function under test never threw error");
            } catch (error) {
                assert.equal(error.message, "User key-value storage was not initialized.");
            }
        });
    });

    describe("Code key-value storage", () => {
        it("should initialize the code key-value storage to the value provided in the environment", () => {
            storageManager.initializeStorage({
                CODE: "code_KV",
            });

            const clientKeyValueStorage = storageManager.getCodeKeyValueStorage();

            assert.equal(clientKeyValueStorage, "code_KV");
        });

        it("should throw an error if one tries to access the code key-value storage before initialization", () => {
            try {
                storageManager.getCodeKeyValueStorage();
                return Promise.reject("Function under test never threw error");
            } catch (error) {
                assert.equal(error.message, "Code key-value storage was not initialized.");
            }
        });
    });

    describe("Grant key-value storage", () => {
        it("should initialize the grant key-value storage to the value provided in the environment", () => {
            storageManager.initializeStorage({
                GRANT: "grant_KV",
            });

            const clientKeyValueStorage = storageManager.getGrantKeyValueStorage();

            assert.equal(clientKeyValueStorage, "grant_KV");
        });

        it("should throw an error if one tries to access the grant key-value storage before initialization", () => {
            try {
                storageManager.getGrantKeyValueStorage();
                return Promise.reject("Function under test never threw error");
            } catch (error) {
                assert.equal(error.message, "Grant key-value storage was not initialized.");
            }
        });
    });

    describe("Refresh token key-value storage", () => {
        it("should initialize the code key-value storage to the value provided in the environment", () => {
            storageManager.initializeStorage({
                REFRESH_TOKEN: "refresh_token_KV",
            });

            const clientKeyValueStorage = storageManager.getRefreshTokenKeyValueStorage();

            assert.equal(clientKeyValueStorage, "refresh_token_KV");
        });

        it("should throw an error if one tries to access the code key-value storage before initialization", () => {
            try {
                storageManager.getRefreshTokenKeyValueStorage();
                return Promise.reject("Function under test never threw error");
            } catch (error) {
                assert.equal(error.message, "Refresh token key-value storage was not initialized.");
            }
        });
    });

    describe("Environment variable storage", () => {
        it("should initialize the environment key-value storage to the values provided in the environment", () => {
            storageManager.initializeStorage({
                SIGNING_KEY: "secret",
                PUBLIC_KEY: "notSecret",
                TOKEN_TIME_TO_LIVE: "5",
                REFRESH_TOKEN_TIME_TO_LIVE: "500",
            });

            const environmentKeyValueStorage = storageManager.getEnvironmentVariableStorage();

            assert.deepEqual(environmentKeyValueStorage, {
                signingKey: "secret",
                publicKey: "notSecret",
                refreshTokenTimeToLive: 500,
                tokenTimeToLive: 5,
            });
        });

        it("should throw an error if one tries to access the environment key-value storage before initialization", () => {
            try {
                storageManager.getEnvironmentVariableStorage();
                return Promise.reject("Function under test never threw error");
            } catch (error) {
                assert.equal(error.message, "Environment variable storage was not initialized.");
            }
        });

        it("should throw an error if signing key is missing", () => {
            try {
                storageManager.initializeStorage({
                    PUBLIC_KEY: "notSecret",
                    TOKEN_TIME_TO_LIVE: "5",
                    REFRESH_TOKEN_TIME_TO_LIVE: "10",
                });
                storageManager.getEnvironmentVariableStorage();
                return Promise.reject("Function under test never threw error");
            } catch (error) {
                assert.equal(error.message, "Environment variable storage was not initialized.");
            }
        });

        it("should throw an error if public key is missing", () => {
            try {
                storageManager.initializeStorage({
                    SIGNING_KEY: "secret",
                    TOKEN_TIME_TO_LIVE: "5",
                    REFRESH_TOKEN_TIME_TO_LIVE: "10",
                });
                storageManager.getEnvironmentVariableStorage();
                return Promise.reject("Function under test never threw error");
            } catch (error) {
                assert.equal(error.message, "Environment variable storage was not initialized.");
            }
        });

        it("should throw an error if access token time to live is missing", () => {
            try {
                storageManager.initializeStorage({
                    SIGNING_KEY: "secret",
                    PUBLIC_KEY: "notSecret",
                    REFRESH_TOKEN_TIME_TO_LIVE: "10",
                });
                storageManager.getEnvironmentVariableStorage();
                return Promise.reject("Function under test never threw error");
            } catch (error) {
                assert.equal(error.message, "Environment variable storage was not initialized.");
            }
        });

        it("should throw an error if access token time to live is not a number", () => {
            try {
                storageManager.initializeStorage({
                    SIGNING_KEY: "secret",
                    PUBLIC_KEY: "notSecret",
                    TOKEN_TIME_TO_LIVE: "notANumber",
                    REFRESH_TOKEN_TIME_TO_LIVE: "10",
                });
                storageManager.getEnvironmentVariableStorage();
                return Promise.reject("Function under test never threw error");
            } catch (error) {
                assert.equal(error.message, "Environment variable storage was not initialized.");
            }
        });

        it("should throw an error if refresh token time to live is missing", () => {
            try {
                storageManager.initializeStorage({
                    SIGNING_KEY: "secret",
                    PUBLIC_KEY: "notSecret",
                    TOKEN_TIME_TO_LIVE: "10",
                });
                storageManager.getEnvironmentVariableStorage();
                return Promise.reject("Function under test never threw error");
            } catch (error) {
                assert.equal(error.message, "Environment variable storage was not initialized.");
            }
        });

        it("should throw an error if refresh token time to live is not a number", () => {
            try {
                storageManager.initializeStorage({
                    SIGNING_KEY: "secret",
                    PUBLIC_KEY: "notSecret",
                    TOKEN_TIME_TO_LIVE: "10",
                    REFRESH_TOKEN_TIME_TO_LIVE: "notANumber",
                });
                storageManager.getEnvironmentVariableStorage();
                return Promise.reject("Function under test never threw error");
            } catch (error) {
                assert.equal(error.message, "Environment variable storage was not initialized.");
            }
        });
    });
});
