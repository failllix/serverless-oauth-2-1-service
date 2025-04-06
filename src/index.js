import authorizationRequestHandler from "./authorizationRequestHandler.js";
import storageManager from "./storage/manager.js";
import tokenRequestHandler from "./tokenRequestHandler.js";
import userInfoRequestHandler from "./userInfoRequestHandler.js";

import { NOT_IMPLEMENTED, SUCCESS } from "./helper/responses.js";
import environmentVariables from "./storage/environmentVariables.js";

const enrichWithCorsHeadersInLocalEnvironment = (response, corsHeaders) => {
    if (environmentVariables.isLocalEnvironment()) {
        for (const [key, value] of Object.entries(corsHeaders)) {
            response.headers.set(key, value);
        }
    }
    return response;
};

export default {
    async fetch(request, env, ctx) {
        storageManager.initializeStorage(env);

        const method = request.method;
        const url = new URL(request.url);
        const pathname = url.pathname;

        const localAuthorizeCorsHeaders = {
            "Access-Control-Allow-Origin": "http://localhost:8789",
            "Access-Control-Allow-Methods": "GET, POST",
            "Access-Control-Allow-Headers": "Authorization, Content-Type",
        };

        if (pathname === "/authorize") {
            if (method === "OPTIONS") {
                return enrichWithCorsHeadersInLocalEnvironment(SUCCESS({ jsonResponse: "" }), localAuthorizeCorsHeaders);
            }
            if (method === "POST" || method === "GET") {
                return enrichWithCorsHeadersInLocalEnvironment(await authorizationRequestHandler.handleAuthorizationRequest(request), localAuthorizeCorsHeaders);
            }
        }

        const localTokenCorsHeaders = {
            "Access-Control-Allow-Origin": "http://localhost:8788",
            "Access-Control-Allow-Methods": "POST",
            "Access-Control-Allow-Headers": "Authorization, Content-Type",
        };

        if (pathname === "/token") {
            if (method === "OPTIONS") {
                return enrichWithCorsHeadersInLocalEnvironment(SUCCESS({ jsonResponse: "" }), localTokenCorsHeaders);
            }
            if (method === "POST") {
                return enrichWithCorsHeadersInLocalEnvironment(await tokenRequestHandler.handleTokenRequest(request), localTokenCorsHeaders);
            }
        }

        if (pathname === "/me") {
            if (method === "GET") {
                return await userInfoRequestHandler.handleGetUserInfoRequest(request);
            }
        }

        if (pathname.startsWith("/me/grants")) {
            if (method === "DELETE") {
                return await userInfoRequestHandler.handleGrantDeletionRequest(request);
            }
        }

        if (pathname.startsWith("/me/refreshTokens")) {
            if (method === "DELETE") {
                return await userInfoRequestHandler.handleRefreshTokenDeletionRequest(request);
            }
        }

        // if (url.pathname === "/.well-known/jwks.json")
        //   return getPublicKeys();

        return NOT_IMPLEMENTED;
    },
};
