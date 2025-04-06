import { USER_INFO_SCOPE } from "../helper/constants.js";
import { SUCCESS } from "../helper/responses.js";
import util from "../helper/util.js";
import environmentVariables from "../storage/environmentVariables.js";
import refreshTokenStorage from "../storage/refreshToken.js";

async function getPrivateKey() {
    return await crypto.subtle.importKey(
        "jwk",
        JSON.parse(environmentVariables.getSigningKey()),
        {
            name: "ECDSA",
            namedCurve: "P-521",
        },
        true,
        ["sign"],
    );
}

async function getUrlBase64EncodedSignature(content) {
    const key = await getPrivateKey();

    return util.uint8ToUrlBase64(new Uint8Array(await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-512" }, key, util.strToUint8(content))));
}

async function getSignedAccessToken({ scope, audience, username, timeToLive, issuer }) {
    const tokenHeader = {
        alg: "ES512",
        typ: "JWT",
    };

    const tokenPayload = {
        aud: audience,
        iss: issuer,
        sub: username,
        exp: Math.round(Date.now() / 1000) + timeToLive,
        iat: Math.round(Date.now() / 1000),
        scope,
    };

    const tokenHeaderBase64 = util.strToUrlBase64(JSON.stringify(tokenHeader));
    const tokenPayloadBase64 = util.strToUrlBase64(JSON.stringify(tokenPayload));

    const tokenSignatureBase64 = await getUrlBase64EncodedSignature(`${tokenHeaderBase64}.${tokenPayloadBase64}`);

    const accessToken = [tokenHeaderBase64, tokenPayloadBase64, tokenSignatureBase64].join(".");

    return accessToken;
}

async function getSignedRefreshToken({ clientId, grantId, scope, timeToLive, username }) {
    const refreshTokenId = util.getRandomUUID();

    const refreshTokenPayload = {
        token_id: refreshTokenId,
        exp: Math.round(Date.now() / 1000) + timeToLive,
        iat: Math.round(Date.now() / 1000),
        grant_id: grantId,
        scope,
    };

    const refreshTokenPayloadBase64 = util.strToUrlBase64(JSON.stringify(refreshTokenPayload));
    const refreshTokenSignatureBase64 = await getUrlBase64EncodedSignature(refreshTokenPayloadBase64);

    const refreshToken = [refreshTokenPayloadBase64, refreshTokenSignatureBase64].join(".");

    await refreshTokenStorage.saveRefreshToken({ refreshTokenId, clientId, scope, grantId, username });

    return refreshToken;
}

async function getAccessTokenResponse({ grantId, scope, audience, username, clientId, issuer }) {
    const accessTokenTimeToLive = environmentVariables.getTokenTimeToLive();
    const refreshTokenTimeToLive = environmentVariables.getRefreshTokenTimeToLive();

    const accessToken = await getSignedAccessToken({
        scope,
        username,
        timeToLive: accessTokenTimeToLive,
        issuer,
        audience,
    });

    const refreshToken = await getSignedRefreshToken({
        grantId,
        clientId,
        scope,
        timeToLive: refreshTokenTimeToLive,
        username,
    });

    const tokenResponse = {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: "JWT",
        expires_in: accessTokenTimeToLive,
        scope: scope,
    };

    return SUCCESS({
        jsonResponse: tokenResponse,
        headers: { "Cache-Control": "no-store" },
    });
}

export default {
    getAccessTokenResponse,
};
