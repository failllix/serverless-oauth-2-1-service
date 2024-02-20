import { assert } from "chai";
import { describe } from "mocha";
import sinon from "sinon";
import codeStorage from "../../../src/storage/code.js";
import storageManager from "../../../src/storage/manager.js";

describe("Code storage", () => {
    describe("getAccessCode", () => {
        it("should get code key-value storage from manager and return parsed access code information by access code", async () => {
            const keyValueGetStub = sinon.stub();
            keyValueGetStub.withArgs("myCode").resolves(JSON.stringify({ access: true }));

            const codeKeyValueStorageStub = sinon.stub(storageManager, "getCodeKeyValueStorage");

            codeKeyValueStorageStub.callsFake((...args) => (args.length === 0 ? { get: keyValueGetStub } : undefined));

            const accessCodeInfo = await codeStorage.getAccessCode("myCode");

            assert.deepEqual(accessCodeInfo, { access: true });
        });
    });

    describe("saveAccessCode", () => {
        it("should save stringified access code information to key-value storage", async () => {
            const keyValuePutStub = sinon.stub();
            keyValuePutStub.withArgs("someNewCode", '{"secretInfo":true}', { expirationTtl: 120 }).resolves();

            const codeKeyValueStorageStub = sinon.stub(storageManager, "getCodeKeyValueStorage");

            codeKeyValueStorageStub.callsFake((...args) => (args.length === 0 ? { put: keyValuePutStub } : undefined));

            await codeStorage.saveAccessCode("myCode", {
                secretInfo: true,
            });

            sinon.assert.calledOnce(keyValuePutStub);
        });
    });
});
