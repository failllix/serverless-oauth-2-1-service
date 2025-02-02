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

    describe("Environment variable storage", () => {
        it("should initialize the environment key-value storage to the values provided in the environment", () => {
            storageManager.initializeStorage({
                SIGNING_KEY: "secret",
                PUBLIC_KEY: "notSecret",
                TOKEN_TIME_TO_LIVE: "5",
            });

            const environmentKeyValueStorage = storageManager.getEnvironmentVariableStorage();

            assert.deepEqual(environmentKeyValueStorage, {
                signingKey: "secret",
                publickey: "notSecret",
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
                });
                storageManager.getEnvironmentVariableStorage();
                return Promise.reject("Function under test never threw error");
            } catch (error) {
                assert.equal(error.message, "Environment variable storage was not initialized.");
            }
        });

        it("should throw an error if time to live is missing", () => {
            try {
                storageManager.initializeStorage({
                    SIGNING_KEY: "secret",
                    PUBLIC_KEY: "notSecret",
                });
                storageManager.getEnvironmentVariableStorage();
                return Promise.reject("Function under test never threw error");
            } catch (error) {
                assert.equal(error.message, "Environment variable storage was not initialized.");
            }
        });

        it("should throw an error if time to live is no number", () => {
            try {
                storageManager.initializeStorage({
                    SIGNING_KEY: "secret",
                    PUBLIC_KEY: "notSecret",
                    TOKEN_TIME_TO_LIVE: "notANumber",
                });
                storageManager.getEnvironmentVariableStorage();
                return Promise.reject("Function under test never threw error");
            } catch (error) {
                assert.equal(error.message, "Environment variable storage was not initialized.");
            }
        });
    });
});
