import { assert } from "chai";
import storageManager from "../../../src/storage/manager.js";

describe("Storage Manager", () => {
    beforeEach(() => {
        storageManager.initializeStorage({});
    });

    after(() => {
        storageManager.initializeStorage({});
    });

    describe("Database", () => {
        it("should initialize the database to the value provided in the environment", () => {
            storageManager.initializeStorage({
                DB: "database",
            });

            const database = storageManager.getDatabase();

            assert.equal(database, "database");
        });

        it("should throw an error if one tries to access the database before initialization", () => {
            try {
                storageManager.getDatabase();
                return Promise.reject("Function under test never threw error");
            } catch (error) {
                assert.equal(error.message, "Database was not initialized.");
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
                USER_INFO_API_URL: "http://localhost:foo",
                ENVIRONMENT: "test",
            });

            const environmentKeyValueStorage = storageManager.getEnvironmentVariableStorage();

            assert.deepEqual(environmentKeyValueStorage, {
                signingKey: "secret",
                publicKey: "notSecret",
                refreshTokenTimeToLive: 500,
                tokenTimeToLive: 5,
                userInfoApiUrl: "http://localhost:foo",
                environment: "test",
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
                    USER_INFO_API_URL: "http://localhost:foo",
                    ENVIRONMENT: "test",
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
                    USER_INFO_API_URL: "http://localhost:foo",
                    ENVIRONMENT: "test",
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
                    USER_INFO_API_URL: "http://localhost:foo",
                    ENVIRONMENT: "test",
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
                    USER_INFO_API_URL: "http://localhost:foo",
                    ENVIRONMENT: "test",
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
                    USER_INFO_API_URL: "http://localhost:foo",
                    ENVIRONMENT: "test",
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
                    USER_INFO_API_URL: "http://localhost:foo",
                    ENVIRONMENT: "test",
                });
                storageManager.getEnvironmentVariableStorage();
                return Promise.reject("Function under test never threw error");
            } catch (error) {
                assert.equal(error.message, "Environment variable storage was not initialized.");
            }
        });

        it("should throw an error if user info API URL is missing", () => {
            try {
                storageManager.initializeStorage({
                    SIGNING_KEY: "secret",
                    PUBLIC_KEY: "notSecret",
                    TOKEN_TIME_TO_LIVE: "5",
                    REFRESH_TOKEN_TIME_TO_LIVE: "10",
                    ENVIRONMENT: "test",
                });
                storageManager.getEnvironmentVariableStorage();
                return Promise.reject("Function under test never threw error");
            } catch (error) {
                assert.equal(error.message, "Environment variable storage was not initialized.");
            }
        });

        it("should throw an error if environment is missing", () => {
            try {
                storageManager.initializeStorage({
                    SIGNING_KEY: "secret",
                    PUBLIC_KEY: "notSecret",
                    TOKEN_TIME_TO_LIVE: "5",
                    REFRESH_TOKEN_TIME_TO_LIVE: "10",
                    USER_INFO_API_URL: "http://localhost:foo",
                });
                storageManager.getEnvironmentVariableStorage();
                return Promise.reject("Function under test never threw error");
            } catch (error) {
                assert.equal(error.message, "Environment variable storage was not initialized.");
            }
        });
    });
});
