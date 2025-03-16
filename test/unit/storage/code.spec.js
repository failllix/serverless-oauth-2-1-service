import { assert } from "chai";
import { describe } from "mocha";
import sinon from "sinon";
import keyValueHelper from "../../../src/helper/keyValueHelper.js";
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

            const codeKeyValueStorageStub = sinon.stub(storageManager, "getCodeKeyValueStorage");

            codeKeyValueStorageStub.callsFake((...args) => (args.length === 0 ? { put: keyValuePutStub } : undefined));

            await codeStorage.saveAccessCode({
                code: "myCode",
                scope: ["test"],
                clientId: "test",
                codeChallenge: "abc",
                codeChallengeMethod: "def",
                username: "test",
                grantId: "someGrantId",
            });

            sinon.assert.calledTwice(keyValuePutStub);
            sinon.assert.calledWithExactly(keyValuePutStub, "myCode", '{"scope":["test"],"clientId":"test","codeChallenge":"abc","codeChallengeMethod":"def","username":"test","grantId":"someGrantId"}', { expirationTtl: 120 });
            sinon.assert.calledWithExactly(keyValuePutStub, "test:myCode", '{"scope":["test"],"clientId":"test","codeChallenge":"abc","codeChallengeMethod":"def","username":"test","grantId":"someGrantId"}', { expirationTtl: 120 });
        });
    });

    describe("getAccessCodesByUsername", () => {
        it("should return all access codes by username", async () => {
            sinon.stub(keyValueHelper);
            sinon.stub(storageManager);

            const codeKeyValueStub = sinon.stub();

            storageManager.getCodeKeyValueStorage.returns(codeKeyValueStub);

            keyValueHelper.getAllValuesForPrefix.withArgs({ keyValueStorage: codeKeyValueStub, keyPrefix: "dummy" }).resolves({ foo: "bar" });

            const allCodes = await codeStorage.getAccessCodesByUsername("dummy");

            assert.deepEqual(allCodes, { foo: "bar" });
        });
    });
});
