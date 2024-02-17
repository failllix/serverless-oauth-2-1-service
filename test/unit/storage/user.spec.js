import { assert } from "chai";
import { describe } from "mocha";
import sinon from "sinon";
import storageManager from "../../../src/storage/manager.js";
import userStorage from "../../../src/storage/user.js";

describe("User storage", () => {
    describe("getUser", () => {
        it("should get user key-value storage from manager and get parsed user by username", async () => {
            const keyValueGetStub = sinon.stub();
            keyValueGetStub.withArgs("myUsername").resolves(JSON.stringify({ test: true, user: "dummy" }));

            const clientKeyValueStorageStub = sinon.stub(storageManager, "getUserKeyValueStorage");

            clientKeyValueStorageStub.callsFake((...args) => (args.length === 0 ? { get: keyValueGetStub } : undefined));

            const clientId = await userStorage.getUser("myUsername");

            assert.deepEqual(clientId, { test: true, user: "dummy" });
        });
    });
});
