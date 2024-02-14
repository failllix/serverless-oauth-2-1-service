import { describe } from "mocha";
import storageManager from "../../../src/storage/manager.js";
import clientStorage from "../../../src/storage/client.js";
import { assert } from "chai";
import sinon from "sinon";

describe("Client storage", () => {
  describe("getClient", () => {
    it("should get client key-value storage from manager and get client by id", async () => {
      const keyValueGetStub = sinon.stub();
      keyValueGetStub.withArgs("myId").resolves("myClient");

      const clientKeyValueStorageStub = sinon.stub(
        storageManager,
        "getClientKeyValueStorage"
      );
      clientKeyValueStorageStub.callsFake((...args) =>
        args.length === 0 ? { get: keyValueGetStub } : undefined
      );

      const clientId = await clientStorage.getClient("myId");

      assert.equal(clientId, "myClient");
    });
  });
});
