import { assert } from "chai";
import sinon from "sinon";
import environmentVariables from "../../../src/storage/environmentVariables.js";
import storageManager from "../../../src/storage/manager.js";

describe("Environment Variables", () => {
    describe("getSigningKey", () => {
        it("should return value from storage manager", () => {
            sinon.stub(storageManager);

            storageManager.getEnvironmentVariableStorage.returns({
                signingKey: "foo",
            });

            const signingKey = environmentVariables.getSigningKey();

            assert.equal(signingKey, "foo");
        });
    });

    describe("getPublicKey", () => {
        it("should return value from storage manager", () => {
            sinon.stub(storageManager);

            storageManager.getEnvironmentVariableStorage.returns({
                publicKey: "bar",
            });

            const publicKey = environmentVariables.getPublicKey();

            assert.equal(publicKey, "bar");
        });
    });

    describe("getTokenTimeToLive", () => {
        it("should return value from storage manager", () => {
            sinon.stub(storageManager);

            storageManager.getEnvironmentVariableStorage.returns({
                tokenTimeToLive: 100,
            });

            const timeToLive = environmentVariables.getTokenTimeToLive();

            assert.equal(timeToLive, 100);
        });
    });
});
