import { assert } from "chai";
import storageManager from "../../../src/storage/manager.js";

describe("Storage Manager", () => {
    beforeEach(() => {
        storageManager.initializeStorage({});
    });

    after(() => {
        storageManager.initializeStorage({});
    });

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
