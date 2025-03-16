import { assert } from "chai";
import { describe } from "mocha";
import sinon from "sinon";
import keyValueHelper from "../../../src/helper/keyValueHelper.js";
import grantStorage from "../../../src/storage/grant.js";
import storageManager from "../../../src/storage/manager.js";

describe("Grant storage", () => {
    describe("getGrant", () => {
        it("should get grant key-value storage from manager and return parsed grant information by grant id", async () => {
            const keyValueGetStub = sinon.stub();
            keyValueGetStub.withArgs("myGrantId").resolves(JSON.stringify({ grant: true }));

            sinon.stub(storageManager);
            storageManager.getGrantKeyValueStorage.returns({ get: keyValueGetStub });

            const grantInfo = await grantStorage.getGrant("myGrantId");

            assert.deepEqual(grantInfo, { grant: true });
            sinon.assert.calledOnceWithExactly(storageManager.getGrantKeyValueStorage);
        });
    });

    describe("saveAccessCode", () => {
        it("should save stringified grant information to key-value storage", async () => {
            const keyValuePutStub = sinon.stub();

            sinon.stub(storageManager);
            storageManager.getGrantKeyValueStorage.returns({ put: keyValuePutStub });

            await grantStorage.saveGrant({ grantId: "myGrantId", clientId: "fooClient", scope: ["something"], username: "dummy" });

            sinon.assert.calledTwice(storageManager.getGrantKeyValueStorage);
            sinon.assert.calledWithExactly(storageManager.getGrantKeyValueStorage);

            sinon.assert.calledTwice(keyValuePutStub);
            sinon.assert.calledWithExactly(keyValuePutStub, "myGrantId", '{"clientId":"fooClient","scope":["something"],"username":"dummy"}');
            sinon.assert.calledWithExactly(keyValuePutStub, "dummy:myGrantId", '{"clientId":"fooClient","scope":["something"],"username":"dummy"}');
        });
    });

    describe("deleteGrant", () => {
        it("should delete grant information from key-value storage using grant id", async () => {
            const keyValueDeleteStub = sinon.stub();

            sinon.stub(storageManager);
            storageManager.getGrantKeyValueStorage.returns({ delete: keyValueDeleteStub });

            await grantStorage.deleteGrant({ grantId: "myGrantId", username: "dummy" });

            sinon.assert.calledTwice(storageManager.getGrantKeyValueStorage);
            sinon.assert.calledWithExactly(storageManager.getGrantKeyValueStorage);

            sinon.assert.calledTwice(keyValueDeleteStub);
            sinon.assert.calledWithExactly(keyValueDeleteStub, "myGrantId");
            sinon.assert.calledWithExactly(keyValueDeleteStub, "dummy:myGrantId");
        });
    });

    describe("getGrantsByUsername", () => {
        it("should return all grants by username", async () => {
            sinon.stub(keyValueHelper);
            sinon.stub(storageManager);

            const grantKeyValueStub = sinon.stub();

            storageManager.getGrantKeyValueStorage.returns(grantKeyValueStub);

            keyValueHelper.getAllValuesForPrefix.withArgs({ keyValueStorage: grantKeyValueStub, keyPrefix: "dummy" }).resolves({ foo: "bar" });

            const allGrants = await grantStorage.getGrantsByUsername("dummy");

            assert.deepEqual(allGrants, { foo: "bar" });
        });
    });
});
