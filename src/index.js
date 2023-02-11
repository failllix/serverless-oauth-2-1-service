import {
    getAssetFromKV,
    mapRequestToAsset,
} from "@cloudflare/kv-asset-handler";
import manifestJSON from "__STATIC_CONTENT_MANIFEST";
const assetManifest = JSON.parse(manifestJSON);
import {
    strToUrlBase64,
    strToUint8,
    uint8ToUrlBase64,
    strToSha512HexString,
    urlBase64Touint8,
} from "./helper";

const BAD_REQUEST = new Response(null, {
    status: 400,
});
const NOT_FOUND = new Response(null, {
    status: 404,
});
const FORBIDDEN = new Response(null, {
    status: 403,
});
const UNAUTHORIZED = new Response(null, {
    status: 401,
});

const corsHeaders = ({
    origin = "*",
    methods = "GET, HEAD, POST, OPTIONS",
    allowHeaders = "Content-Type",
}) => {
    return {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": methods,
        "Access-Control-Allow-Headers": allowHeaders,
    };
};

async function getPrivateKey(privateJwk) {
    return await crypto.subtle.importKey(
        "jwk",
        JSON.parse(privateJwk),
        {
            name: "ECDSA",
            namedCurve: "P-521",
        },
        true,
        ["sign"]
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
        ["verify"]
    );
}

async function redirectWithCode(request, userKV, clientsKV, codesKV) {
    const body = await request.json();
    const returnType = body.return_type;
    const redirectURI = body.redirect_uri;
    const username = body.username;
    const password = body.password;
    const clientId = body.client_id;
    const requestedScopes = body.scope;

    if (
        redirectURI == null ||
        redirectURI == "" ||
        username == null ||
        username == "" ||
        password == null ||
        password == "" ||
        clientId == null ||
        clientId == "" ||
        requestedScopes == null ||
        requestedScopes == "" ||
        requestedScopes.length === 0
    )
        return BAD_REQUEST;

    const client = JSON.parse(await clientsKV.get(clientId));
    const user = JSON.parse(await userKV.get(username));

    // Check if client and user exist
    if (client == null || user == null) return UNAUTHORIZED;
    const hashHex = await strToSha512HexString(password + user.salt);
    // Verify password
    if (user.pwdToken != hashHex) return UNAUTHORIZED;

    //Check if user has requested scopes
    for (const scope of requestedScopes) {
        if (!user.scope.includes(scope)) return FORBIDDEN;
    }

    //Check if redirect_uri is valid
    if (!client.redirect_uris.includes(redirectURI)) return UNAUTHORIZED;

    //generate random code
    const code = crypto.randomUUID().replaceAll("-", "");

    //Saving code as expiring key (10 mins) with client id its valid for.
    await codesKV.put(
        code,
        JSON.stringify({
            client_id: clientId,
            scope: requestedScopes,
            username,
        }),
        {
            expirationTtl: 600,
        }
    );

    const redirectURIWithCode = redirectURI + "?code=" + code;

    if (returnType === "body") {
        return new Response(
            JSON.stringify({
                redirect_uri: redirectURIWithCode,
            }),
            {
                status: 200,
                headers: {
                    "content-type": "application/json",
                    ...corsHeaders({}),
                },
            }
        );
    }

    return new Response(null, {
        status: 302,
        headers: {
            location: redirectURIWithCode,
            ...corsHeaders({}),
        },
    });
}

async function exchangeCodeForToken(
    request,
    codesKV,
    clientKV,
    tokensKV,
    privateJwk
) {
    const url = new URL(request.url);
    const body = await request.json();
    const code = body.code;
    const clientId = body.client_id;

    if (
        code == null ||
        clientId == null ||
        code == undefined ||
        clientId == undefined
    )
        return BAD_REQUEST;

    const storedCode = JSON.parse(await codesKV.get(code));
    // Code not found or expired
    if (storedCode == null) return UNAUTHORIZED;
    // Check code is valid for specified client
    if (storedCode.client_id != clientId) return UNAUTHORIZED;

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
    const signatureBase64 = uint8ToUrlBase64(
        new Uint8Array(
            await crypto.subtle.sign(
                { name: "ECDSA", hash: "SHA-512" },
                key,
                strToUint8(headerBase64 + "." + payloadBase64)
            )
        )
    );

    const generatedJWT = [headerBase64, payloadBase64, signatureBase64].join(
        "."
    );

    await tokensKV.put(
        await strToSha512HexString(generatedJWT),
        JSON.stringify({
            client_id: clientId,
            username: storedCode.username,
            jwt: generatedJWT,
        }),
        {
            expirationTtl: tokenTTL,
        }
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
                ...corsHeaders({}),
            },
        }
    );
}

async function verifyToken(request, tokensKV, publicJwk) {
    const url = new URL(request.url);

    const INVALID_TOKEN_RESPONSE = new Response(
        JSON.stringify({ active: false }),
        {
            headers: {
                "content-type": "application/json",
                ...corsHeaders({}),
            },
        }
    );
    const body = await request.json();
    const accessToken = body.access_token;
    if (accessToken === null || accessToken === "") return BAD_REQUEST;

    const storedToken = JSON.parse(
        await tokensKV.get(await strToSha512HexString(accessToken))
    );

    if (storedToken == null) return INVALID_TOKEN_RESPONSE;

    //Check expiration of token
    if (storedToken.exp < Math.round(Date.now() / 1000))
        return INVALID_TOKEN_RESPONSE;

    //Deconstruct JWT
    const [headerBase64, payloadBase64, signatureBase64Url] =
        accessToken.split(".");

    const header = JSON.parse(atob(headerBase64));
    const payload = JSON.parse(atob(payloadBase64));

    //Confirm correct token type and algorithm
    if (header.typ != "JWT" || header.alg != "ES512")
        return INVALID_TOKEN_RESPONSE;

    //Does the token claim to have been issued by someone else?
    if (payload.iss != url.hostname) return INVALID_TOKEN_RESPONSE;

    // Was the token signed with the known key?
    const key = await getPublicKey(publicJwk);
    const verified = await crypto.subtle.verify(
        { name: "ECDSA", hash: "SHA-512" },
        key,
        urlBase64Touint8(signatureBase64Url),
        strToUint8(headerBase64 + "." + payloadBase64)
    );
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
                ...corsHeaders({}),
            },
        }
    );
}

async function returnPublicKeys(publicJwk) {
    return new Response(JSON.stringify({ keys: [JSON.parse(publicJwk)] }), {
        headers: {
            "content-type": "application/json",
            ...corsHeaders({}),
        },
    });
}

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        //Serves login page
        if (url.pathname === "/auth") {
            try {
                return await getAssetFromKV(
                    {
                        request,
                        waitUntil: ctx.waitUntil.bind(ctx),
                    },
                    {
                        mapRequestToAsset: (request) => {
                            let url = request.url;
                            url = url.replace("/auth", "/auth.html");
                            return mapRequestToAsset(new Request(url, request));
                        },
                        ASSET_NAMESPACE: env.__STATIC_CONTENT,
                        ASSET_MANIFEST: assetManifest,
                    }
                );
            } catch (e) {
                let pathname = new URL(request.url).pathname;
                return new Response(`"${pathname}" not found`, {
                    status: 404,
                    statusText: "not found",
                });
            }
        }

        // Receives creds from user and returns code if valid
        if (url.pathname === "/code") {
            if (request.method === "OPTIONS") {
                return handleOptions();
            } else
                return redirectWithCode(
                    request,
                    env.USERS,
                    env.CLIENTS,
                    env.CODES
                );
        }

        //Exchange code for access token
        if (url.pathname.includes("/token"))
            return exchangeCodeForToken(
                request,
                env.CODES,
                env.CLIENTS,
                env.TOKENS,
                env.SIGNING_KEY
            );

        if (url.pathname === "/introspect")
            return verifyToken(request, env.TOKENS, env.PUBLIC_KEY);

        if (url.pathname === "/.well-known/jwks.json")
            return returnPublicKeys(env.PUBLIC_KEY);

        if (request.method === "OPTIONS") return handleOptions();

        return NOT_FOUND;
    },
};

function handleOptions() {
    // Handle CORS pre-flight request.
    return new Response(null, {
        headers: corsHeaders({}),
    });
}
