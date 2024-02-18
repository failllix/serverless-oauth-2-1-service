import { assert } from "chai";
import { describe } from "mocha";
import sinon from "sinon";
import clientStorage from "../../../src/storage/client.js";
import storageManager from "../../../src/storage/manager.js";

describe("Client storage", () => {
    describe("getClient", () => {
        it("should get client key-value storage from manager and return parsed client by id", async () => {
            const keyValueGetStub = sinon.stub();
            keyValueGetStub.withArgs("myId").resolves(JSON.stringify({ myClient: true }));

            const clientKeyValueStorageStub = sinon.stub(storageManager, "getClientKeyValueStorage");

            clientKeyValueStorageStub.callsFake((...args) => (args.length === 0 ? { get: keyValueGetStub } : undefined));

            const clientId = await clientStorage.getClient("myId");

            assert.deepEqual(clientId, { myClient: true });
        });
    });
});
