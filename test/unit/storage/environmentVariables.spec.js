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

    describe("getRefreshTokenTimeToLive", () => {
        it("should return value from storage manager", () => {
            sinon.stub(storageManager);

            storageManager.getEnvironmentVariableStorage.returns({
                refreshTokenTimeToLive: 600,
            });

            const timeToLive = environmentVariables.getRefreshTokenTimeToLive();

            assert.equal(timeToLive, 600);
        });
    });

    describe("getUserInfoApiUrl", () => {
        it("should return value from storage manager", () => {
            sinon.stub(storageManager);

            storageManager.getEnvironmentVariableStorage.returns({
                userInfoApiUrl: "some_URL",
            });

            const userInfoApiUrl = environmentVariables.getUserInfoApiUrl();

            assert.equal(userInfoApiUrl, "some_URL");
        });
    });

    describe("isLocalEnvironment", () => {
        it("should return true if storage manager returns 'local'", () => {
            sinon.stub(storageManager);

            storageManager.getEnvironmentVariableStorage.returns({
                environment: "local",
            });

            const isLocalEnvironment = environmentVariables.isLocalEnvironment();

            assert.equal(isLocalEnvironment, true);
        });

        it("should return true if storage manager does not return 'local'", () => {
            sinon.stub(storageManager);

            storageManager.getEnvironmentVariableStorage.returns({
                environment: "notLocal",
            });

            const isLocalEnvironment = environmentVariables.isLocalEnvironment();

            assert.equal(isLocalEnvironment, false);
        });
    });
});
