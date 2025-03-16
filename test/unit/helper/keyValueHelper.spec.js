import { assert } from "chai";
import sinon from "sinon";
import keyValueHelper from "../../../src/helper/keyValueHelper.js";

describe("Key Value Helper", () => {
    describe("getAllValuesForPrefix", () => {
        it("should return values from first page if list is complete", async () => {
            const keyValueStoreListMock = sinon.stub();
            const keyValueStoreGetMock = sinon.stub();

            const keyValueStoreMock = { list: keyValueStoreListMock, get: keyValueStoreGetMock };

            keyValueStoreListMock.withArgs({ prefix: "foo", cursor: undefined }).resolves({
                keys: [{ name: "foo:key1" }, { name: "foo:key2" }],
                cursor: "abc",
                list_complete: true,
            });

            keyValueStoreGetMock.withArgs("foo:key1").resolves('{"something":"value1"}');
            keyValueStoreGetMock.withArgs("foo:key2").resolves('{"something":"value2"}');

            const result = await keyValueHelper.getAllValuesForPrefix({ keyValueStorage: keyValueStoreMock, keyPrefix: "foo" });

            assert.deepEqual(result, {
                key1: { something: "value1" },
                key2: { something: "value2" },
            });

            sinon.assert.calledOnce(keyValueStoreListMock);
        });

        it("should return values from all pages if list incomplete", async () => {
            const keyValueStoreListMock = sinon.stub();
            const keyValueStoreGetMock = sinon.stub();

            const keyValueStoreMock = { list: keyValueStoreListMock, get: keyValueStoreGetMock };

            keyValueStoreListMock.withArgs({ prefix: "foo", cursor: undefined }).resolves({
                keys: [{ name: "foo:key1" }, { name: "foo:key2" }],
                cursor: "abc",
                list_complete: false,
            });

            keyValueStoreListMock.withArgs({ prefix: "foo", cursor: "abc" }).resolves({
                keys: [{ name: "foo:key3" }, { name: "foo:key4" }],
                cursor: "def",
                list_complete: true,
            });

            keyValueStoreGetMock.withArgs("foo:key1").resolves('{"something":"value1"}');
            keyValueStoreGetMock.withArgs("foo:key2").resolves('{"something":"value2"}');
            keyValueStoreGetMock.withArgs("foo:key3").resolves('{"something":"value3"}');
            keyValueStoreGetMock.withArgs("foo:key4").resolves('{"something":"value4"}');

            const result = await keyValueHelper.getAllValuesForPrefix({ keyValueStorage: keyValueStoreMock, keyPrefix: "foo" });

            assert.deepEqual(result, {
                key1: { something: "value1" },
                key2: { something: "value2" },
                key3: { something: "value3" },
                key4: { something: "value4" },
            });

            sinon.assert.calledTwice(keyValueStoreListMock);
        });
    });
});
