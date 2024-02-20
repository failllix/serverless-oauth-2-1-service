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
});
