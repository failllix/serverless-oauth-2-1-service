import { assert } from "chai";
import { describe } from "mocha";
import sinon from "sinon";
import environmentVariables from "../../../src/storage/environmentVariables.js";
import storageManager from "../../../src/storage/manager.js";
import refreshTokenStorage from "../../../src/storage/refreshToken.js";

describe("Refresh token storage", () => {
    describe("getRefreshToken", () => {
        it("should get refresh token key-value storage from manager and return parsed refresh token information by token id", async () => {
            const keyValueGetStub = sinon.stub();
            keyValueGetStub.withArgs("myTokenId").resolves(JSON.stringify({ refresh: "something" }));

            sinon.stub(storageManager);
            storageManager.getRefreshTokenKeyValueStorage.returns({ get: keyValueGetStub });

            const refreshTokenInfo = await refreshTokenStorage.getRefreshToken("myTokenId");

            assert.deepEqual(refreshTokenInfo, { refresh: "something" });
            sinon.assert.calledOnceWithExactly(storageManager.getRefreshTokenKeyValueStorage);
        });
    });

    describe("saveRefreshToken", () => {
        it("should save stringified refresh token information to key-value storage", async () => {
            sinon.stub(environmentVariables);

            environmentVariables.getRefreshTokenTimeToLive.returns("fooo");

            const keyValuePutStub = sinon.stub();

            sinon.stub(storageManager);
            storageManager.getRefreshTokenKeyValueStorage.returns({ put: keyValuePutStub });

            await refreshTokenStorage.saveRefreshToken({ refreshTokenId: "myTokenId", scope: ["something"], clientId: "fooClient", grantId: "myGrantId" });

            sinon.assert.calledOnceWithExactly(storageManager.getRefreshTokenKeyValueStorage);
            sinon.assert.calledOnceWithExactly(keyValuePutStub, "myTokenId", '{"clientId":"fooClient","scope":["something"],"grantId":"myGrantId","active":true}', { expirationTtl: "fooo" });
        });
    });

    describe("deactivateRefreshToken", () => {
        it("should set 'active' field of existing refresh token information to false", async () => {
            const keyValuePutStub = sinon.stub();
            const keyValueGetStub = sinon.stub();

            sinon.stub(storageManager);
            storageManager.getRefreshTokenKeyValueStorage.returns({ put: keyValuePutStub, get: keyValueGetStub });

            keyValueGetStub.withArgs("myGrantId").resolves(
                JSON.stringify({
                    someValue: "yes",
                    active: true,
                    someMoreKey: "yes",
                }),
            );

            await refreshTokenStorage.deactivateRefreshToken("myGrantId");

            sinon.assert.calledTwice(storageManager.getRefreshTokenKeyValueStorage);
            sinon.assert.calledOnceWithExactly(keyValueGetStub, "myGrantId");
            sinon.assert.calledOnceWithExactly(keyValuePutStub, "myGrantId", '{"someValue":"yes","active":false,"someMoreKey":"yes"}');
        });

        it("should throw error when refresh token cannot be received", async () => {
            const keyValuePutStub = sinon.stub();
            const keyValueGetStub = sinon.stub();

            sinon.stub(storageManager);
            storageManager.getRefreshTokenKeyValueStorage.returns({ put: keyValuePutStub, get: keyValueGetStub });

            keyValueGetStub.withArgs("myGrantId").resolves(null);

            try {
                await refreshTokenStorage.deactivateRefreshToken("myGrantId");
                throw new Error("Function under test never threw error");
            } catch (error) {
                assert.equal(error.message, "Refresh token cannot be deactivated. It no longer exists.");
                sinon.assert.calledWithExactly(storageManager.getRefreshTokenKeyValueStorage);
                sinon.assert.calledOnceWithExactly(keyValueGetStub, "myGrantId");
                sinon.assert.notCalled(keyValuePutStub);
            }
        });
    });
});
