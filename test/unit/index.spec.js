import { assert } from "chai";
import sinon from "sinon";
import authorizationRequestHandler from "../../src/authorizationRequestHandler.js";
import requestHandler from "../../src/index.js";
import environmentVariables from "../../src/storage/environmentVariables.js";
import storageManager from "../../src/storage/manager.js";
import tokenRequestHandler from "../../src/tokenRequestHandler.js";
import userInfoRequestHandler from "../../src/userInfoRequestHandler.js";

describe("App entry point", () => {
    it("should return not implemented response when request does not match handled routes", async () => {
        sinon.stub(storageManager);

        const dummyRequest = {
            method: "POST",
            url: "http://localhost:123/unhandled",
        };
        const dummyEnv = { someEnv: "something" };

        const response = await requestHandler.fetch(dummyRequest, dummyEnv, null);

        assert.equal(response.status, 501);
        assert.equal(await response.text(), "");
        assert.deepEqual(Object.fromEntries(response.headers), {});

        sinon.assert.calledOnceWithExactly(storageManager.initializeStorage, dummyEnv);
    });

    describe("authorization endpoint", () => {
        it("should return CORS headers for OPTIONS request when environment is 'local'", async () => {
            sinon.stub(storageManager);
            sinon.stub(environmentVariables);

            environmentVariables.isLocalEnvironment.returns(true);

            const dummyRequest = {
                method: "OPTIONS",
                url: "http://localhost:123/authorize",
            };
            const dummyEnv = { somthing: "yes" };

            const response = await requestHandler.fetch(dummyRequest, dummyEnv, null);

            assert.equal(response.status, 200);
            assert.equal(await response.text(), '""');
            assert.deepEqual(Object.fromEntries(response.headers), {
                "access-control-allow-origin": "http://localhost:8789",
                "access-control-allow-methods": "GET, POST",
                "access-control-allow-headers": "Authorization, Content-Type",
                "content-type": "text/plain;charset=UTF-8",
            });

            sinon.assert.calledOnceWithExactly(storageManager.initializeStorage, dummyEnv);
        });

        it("should not return CORS headers for OPTIONS request when environment is not 'local'", async () => {
            sinon.stub(storageManager);
            sinon.stub(environmentVariables);

            environmentVariables.isLocalEnvironment.returns(false);

            const dummyRequest = {
                method: "OPTIONS",
                url: "http://localhost:123/authorize",
            };
            const dummyEnv = { somthing: "yes" };

            const response = await requestHandler.fetch(dummyRequest, dummyEnv, null);

            assert.equal(response.status, 200);
            assert.equal(await response.text(), '""');
            assert.deepEqual(Object.fromEntries(response.headers), {
                "content-type": "text/plain;charset=UTF-8",
            });

            sinon.assert.calledOnceWithExactly(storageManager.initializeStorage, dummyEnv);
        });

        for (const method of ["GET", "POST"]) {
            describe(`authorization request using ${method} method`, () => {
                it("should return response from authorization request handler with CORS headers when environment is 'local'", async () => {
                    sinon.stub(storageManager);
                    sinon.stub(environmentVariables);
                    sinon.stub(authorizationRequestHandler);

                    environmentVariables.isLocalEnvironment.returns(true);

                    const dummyRequest = {
                        method,
                        url: "http://localhost:123/authorize",
                    };
                    const dummyEnv = { somthing: "yes" };

                    const dummyResponse = new Response("fooo");
                    authorizationRequestHandler.handleAuthorizationRequest.resolves(dummyResponse);

                    const response = await requestHandler.fetch(dummyRequest, dummyEnv, null);

                    assert.equal(response, dummyResponse);
                    assert.deepEqual(Object.fromEntries(response.headers), {
                        "access-control-allow-origin": "http://localhost:8789",
                        "access-control-allow-methods": "GET, POST",
                        "access-control-allow-headers": "Authorization, Content-Type",
                        "content-type": "text/plain;charset=UTF-8",
                    });

                    sinon.assert.calledOnceWithExactly(authorizationRequestHandler.handleAuthorizationRequest, dummyRequest);
                    sinon.assert.calledOnceWithExactly(storageManager.initializeStorage, dummyEnv);
                });

                it("should return response from authorization request handler without CORS headers when environment is not 'local'", async () => {
                    sinon.stub(storageManager);
                    sinon.stub(environmentVariables);
                    sinon.stub(authorizationRequestHandler);

                    environmentVariables.isLocalEnvironment.returns(false);

                    const dummyRequest = {
                        method,
                        url: "http://localhost:123/authorize",
                    };
                    const dummyEnv = { somthing: "yes" };

                    const dummyResponse = new Response("fooo");
                    authorizationRequestHandler.handleAuthorizationRequest.resolves(dummyResponse);

                    const response = await requestHandler.fetch(dummyRequest, dummyEnv, null);

                    assert.equal(response, dummyResponse);
                    assert.deepEqual(Object.fromEntries(response.headers), {
                        "content-type": "text/plain;charset=UTF-8",
                    });

                    sinon.assert.calledOnceWithExactly(authorizationRequestHandler.handleAuthorizationRequest, dummyRequest);
                    sinon.assert.calledOnceWithExactly(storageManager.initializeStorage, dummyEnv);
                });
            });
        }
    });

    describe("token endpoint", () => {
        it("should return CORS headers for OPTIONS request when environment is 'local'", async () => {
            sinon.stub(storageManager);
            sinon.stub(environmentVariables);

            environmentVariables.isLocalEnvironment.returns(true);

            const dummyRequest = {
                method: "OPTIONS",
                url: "http://localhost:123/token",
            };
            const dummyEnv = { somthing: "yes" };

            const response = await requestHandler.fetch(dummyRequest, dummyEnv, null);

            assert.equal(response.status, 200);
            assert.equal(await response.text(), '""');
            assert.deepEqual(Object.fromEntries(response.headers), {
                "access-control-allow-headers": "Authorization, Content-Type",
                "access-control-allow-methods": "POST",
                "access-control-allow-origin": "http://localhost:8788",
                "content-type": "text/plain;charset=UTF-8",
            });

            sinon.assert.calledOnceWithExactly(storageManager.initializeStorage, dummyEnv);
        });

        it("should not return CORS headers for OPTIONS request when environment is not 'local'", async () => {
            sinon.stub(storageManager);
            sinon.stub(environmentVariables);

            environmentVariables.isLocalEnvironment.returns(false);

            const dummyRequest = {
                method: "OPTIONS",
                url: "http://localhost:123/token",
            };
            const dummyEnv = { somthing: "yes" };

            const response = await requestHandler.fetch(dummyRequest, dummyEnv, null);

            assert.equal(response.status, 200);
            assert.equal(await response.text(), '""');
            assert.deepEqual(Object.fromEntries(response.headers), {
                "content-type": "text/plain;charset=UTF-8",
            });

            sinon.assert.calledOnceWithExactly(storageManager.initializeStorage, dummyEnv);
        });

        it("should return response from authorization request handler with CORS headers when environment is 'local'", async () => {
            sinon.stub(storageManager);
            sinon.stub(tokenRequestHandler);
            sinon.stub(environmentVariables);

            environmentVariables.isLocalEnvironment.returns(true);

            const dummyRequest = {
                method: "POST",
                url: "http://localhost:123/token",
            };
            const dummyEnv = { somthing: "yes" };

            const dummyResponse = new Response("fooo");
            tokenRequestHandler.handleTokenRequest.resolves(dummyResponse);

            const response = await requestHandler.fetch(dummyRequest, dummyEnv, null);

            assert.equal(response, dummyResponse);
            assert.deepEqual(Object.fromEntries(response.headers), {
                "access-control-allow-headers": "Authorization, Content-Type",
                "access-control-allow-methods": "POST",
                "access-control-allow-origin": "http://localhost:8788",
                "content-type": "text/plain;charset=UTF-8",
            });

            sinon.assert.calledOnceWithExactly(tokenRequestHandler.handleTokenRequest, dummyRequest);
            sinon.assert.calledOnceWithExactly(storageManager.initializeStorage, dummyEnv);
        });

        it("should return response from authorization request handler without CORS headers when environment is not 'local'", async () => {
            sinon.stub(storageManager);
            sinon.stub(tokenRequestHandler);
            sinon.stub(environmentVariables);

            environmentVariables.isLocalEnvironment.returns(false);

            const dummyRequest = {
                method: "POST",
                url: "http://localhost:123/token",
            };
            const dummyEnv = { somthing: "yes" };

            const dummyResponse = new Response("fooo");
            tokenRequestHandler.handleTokenRequest.resolves(dummyResponse);

            const response = await requestHandler.fetch(dummyRequest, dummyEnv, null);

            assert.equal(response, dummyResponse);
            assert.deepEqual(Object.fromEntries(response.headers), {
                "content-type": "text/plain;charset=UTF-8",
            });

            sinon.assert.calledOnceWithExactly(tokenRequestHandler.handleTokenRequest, dummyRequest);
            sinon.assert.calledOnceWithExactly(storageManager.initializeStorage, dummyEnv);
        });
    });

    describe("user info endpoint", () => {
        it("should return result of user info request handler when getting info about user", async () => {
            sinon.stub(storageManager);
            sinon.stub(userInfoRequestHandler);

            const dummyRequest = {
                method: "GET",
                url: "http://localhost:123/me",
            };

            const dummyResponse = new Response("fooo");
            const dummyEnv = { ENVIRONMENT: "local" };

            userInfoRequestHandler.handleGetUserInfoRequest.resolves(dummyResponse);

            const response = await requestHandler.fetch(dummyRequest, dummyEnv, null);

            assert.equal(response, dummyResponse);
            sinon.assert.calledOnceWithExactly(storageManager.initializeStorage, dummyEnv);
        });

        it("should return result of user info request handler when deleting grnat", async () => {
            sinon.stub(storageManager);
            sinon.stub(userInfoRequestHandler);

            const dummyRequest = {
                method: "DELETE",
                url: "http://localhost:123/me/grants",
            };

            const dummyResponse = new Response("fooo");
            const dummyEnv = { ENVIRONMENT: "local" };

            userInfoRequestHandler.handleGrantDeletionRequest.resolves(dummyResponse);

            const response = await requestHandler.fetch(dummyRequest, dummyEnv, null);

            assert.equal(response, dummyResponse);
            sinon.assert.calledOnceWithExactly(storageManager.initializeStorage, dummyEnv);
        });

        it("should return result of user info request handler when deleting refresh token", async () => {
            sinon.stub(storageManager);
            sinon.stub(userInfoRequestHandler);

            const dummyRequest = {
                method: "DELETE",
                url: "http://localhost:123/me/refreshTokens",
            };

            const dummyResponse = new Response("fooo");
            const dummyEnv = { ENVIRONMENT: "local" };

            userInfoRequestHandler.handleRefreshTokenDeletionRequest.resolves(dummyResponse);

            const response = await requestHandler.fetch(dummyRequest, dummyEnv, null);

            assert.equal(response, dummyResponse);
            sinon.assert.calledOnceWithExactly(storageManager.initializeStorage, dummyEnv);
        });
    });
});
