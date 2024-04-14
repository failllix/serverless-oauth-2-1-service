// import { strToSha512HexString, strToUint8, strToUrlBase64, uint8ToUrlBase64, urlBase64Touint8 } from "./util.js";

import authCodeGrantHandler from "./authCodeGrantHandler.js";
import storageManager from "./storage/manager.js";

import { BAD_REQUEST, FORBIDDEN, NOT_FOUND, SUCCESS, UNAUTHORIZED } from "./responses.js";

async function getPrivateKey(privateJwk) {
    return await crypto.subtle.importKey(
        "jwk",
        JSON.parse(privateJwk),
        {
            name: "ECDSA",
            namedCurve: "P-521",
        },
        true,
        ["sign"],
    );
}

async function getPublicKey(publicJwk) {
    return await crypto.subtle.importKey(
        "jwk",
        JSON.parse(publicJwk),
        {
            name: "ECDSA",
            namedCurve: "P-521",
        },
        true,
        ["verify"],
    );
}

async function exchangeCodeForToken(request, codesKV, clientKV, tokensKV, privateJwk) {
    const url = new URL(request.url);
    const body = await request.json();
    const code = body.code;
    const clientId = body.client_id;

    if (code == null || clientId == null || code === undefined || clientId === undefined) return BAD_REQUEST;

    const storedCode = JSON.parse(await codesKV.get(code));
    // Code not found or expired
    if (storedCode == null) return UNAUTHORIZED;
    // Check code is valid for specified client
    if (storedCode.client_id !== clientId) return UNAUTHORIZED;

    const client = JSON.parse(await clientKV.get(clientId));

    // check if client exists
    if (client == null) return UNAUTHORIZED;

    //Delete code, to ensure its only used once
    await codesKV.delete(code);

    const tokenTTL = 3600;

    const header = {
        alg: "ES512",
        typ: "JWT",
    };

    const payload = {
        aud: client.route,
        iss: url.hostname,
        sub: storedCode.username,
        exp: Math.round(Date.now() / 1000) + tokenTTL,
        iat: Math.round(Date.now() / 1000),
        scope: storedCode.scope,
    };

    const headerBase64 = strToUrlBase64(JSON.stringify(header));
    const payloadBase64 = strToUrlBase64(JSON.stringify(payload));

    const key = await getPrivateKey(privateJwk);
    const signatureBase64 = uint8ToUrlBase64(new Uint8Array(await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-512" }, key, strToUint8(`${headerBase64}.${payloadBase64}`))));

    const generatedJWT = [headerBase64, payloadBase64, signatureBase64].join(".");

    await tokensKV.put(
        await strToSha512HexString(generatedJWT),
        JSON.stringify({
            client_id: clientId,
            username: storedCode.username,
            jwt: generatedJWT,
        }),
        {
            expirationTtl: tokenTTL,
        },
    );

    // Save and return JWT
    return new Response(
        JSON.stringify({
            expires_in: tokenTTL,
            access_token: generatedJWT,
            token_type: "bearer",
            scope: storedCode.scope,
        }),
        {
            headers: {
                "content-type": "application/json",
                ...corsHeaders,
            },
        },
    );
}

async function verifyToken(request, tokensKV, publicJwk) {
    const url = new URL(request.url);

    const INVALID_TOKEN_RESPONSE = new Response(JSON.stringify({ active: false }), {
        headers: {
            "content-type": "application/json",
            ...corsHeaders,
        },
    });
    const body = await request.json();
    const accessToken = body.access_token;
    if (accessToken === null || accessToken === "") return BAD_REQUEST;

    const storedToken = JSON.parse(await tokensKV.get(await strToSha512HexString(accessToken)));

    if (storedToken == null) return INVALID_TOKEN_RESPONSE;

    //Check expiration of token
    if (storedToken.exp < Math.round(Date.now() / 1000)) return INVALID_TOKEN_RESPONSE;

    //Deconstruct JWT
    const [headerBase64, payloadBase64, signatureBase64Url] = accessToken.split(".");

    const header = JSON.parse(atob(headerBase64));
    const payload = JSON.parse(atob(payloadBase64));

    //Confirm correct token type and algorithm
    if (header.typ !== "JWT" || header.alg !== "ES512") return INVALID_TOKEN_RESPONSE;

    //Does the token claim to have been issued by someone else?
    if (payload.iss !== url.hostname) return INVALID_TOKEN_RESPONSE;

    // Was the token signed with the known key?
    const key = await getPublicKey(publicJwk);
    const verified = await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-512" }, key, urlBase64Touint8(signatureBase64Url), strToUint8(`${headerBase64}.${payloadBase64}`));
    if (!verified) return INVALID_TOKEN_RESPONSE;

    return new Response(
        JSON.stringify({
            active: true,
            scope: payload.scope,
            client_id: storedToken.client_id,
            exp: payload.exp,
            user_info: {
                name: payload.sub,
            },
        }),
        {
            headers: {
                "content-type": "application/json",
                ...corsHeaders,
            },
        },
    );
}

async function returnPublicKeys(publicJwk) {
    return new Response(JSON.stringify({ keys: [JSON.parse(publicJwk)] }), {
        headers: {
            "content-type": "application/json",
            ...corsHeaders,
        },
    });
}

const enrichWithCorsHeadersInLocalEnvironment = (response, environment, corsHeaders) => {
    if (environment.ENVIRONMENT === "local") {
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
            "Access-Control-Allow-Origin": "http://localhost:8788",
            "Access-Control-Allow-Methods": "GET, POST",
            "Access-Control-Allow-Headers": "Authorization, Content-Type",
        };

        if (pathname === "/authorize") {
            if (method === "OPTIONS") {
                return enrichWithCorsHeadersInLocalEnvironment(SUCCESS(""), env, localAuthorizeCorsHeaders);
            }
            if (method === "POST" || method === "GET") {
                return enrichWithCorsHeadersInLocalEnvironment(await authCodeGrantHandler.handleAuthCodeRequest(request), env, localAuthorizeCorsHeaders);
            }
        }

        const localTokenCorsHeaders = {
            "Access-Control-Allow-Origin": "http://localhost:8788",
            "Access-Control-Allow-Methods": "POST",
            "Access-Control-Allow-Headers": "Authorization, Content-Type",
        };

        if (pathname === "/token") {
            if (method === "OPTIONS") {
                return enrichWithCorsHeadersInLocalEnvironment(SUCCESS(""), env, localTokenCorsHeaders);
            }
            if (method === "POST") {
                return new Response(
                    JSON.stringify({
                        token_type: "JWT",
                        expires_in: 100,
                        scope: ["abc"],
                        access_token: "abc",
                        refresh_token: "def",
                    }),
                    {
                        status: 200,
                        headers: localTokenCorsHeaders,
                    },
                );
            }
        }

        // if (url.pathname === "/introspect")
        //   return verifyToken(request, env.TOKENS, env.PUBLIC_KEY);

        // if (url.pathname === "/.well-known/jwks.json")
        //   return returnPublicKeys(env.PUBLIC_KEY);

        return NOT_FOUND;
    },
};
