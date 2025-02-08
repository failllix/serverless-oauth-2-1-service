import AuthenticationError from ".././error/authenticationError.js";
import logger from ".././logger.js";
import { SUCCESS } from ".././responses.js";
import codeStorage from ".././storage/code.js";
import environmentVariables from ".././storage/environmentVariables.js";
import util from ".././util.js";
import sharedValidator from ".././validation/sharedValidator.js";
import tokenExchangeValidator from ".././validation/tokenExchangeValidator.js";

const getValidatedAuthorizationCodeExchangeParameters = (formData) => {
    const validatedParameters = {
        clientId: sharedValidator.isValidClientId(formData.get("client_id")),
        redirectUri: sharedValidator.isValidRedirectUri(formData.get("redirect_uri")),
        scope: sharedValidator.isValidScope(formData.get("scope")?.split(",")),
        codeVerifier: tokenExchangeValidator.isValidCodeVerifier(formData.get("code_verifier")),
        accessCode: tokenExchangeValidator.isValidAccessCode(formData.get("code")),
    };

    logger.logObject({
        label: "validated token request parameters",
        object: validatedParameters,
    });
    return validatedParameters;
};

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

const exchangeAccessCodeForToken = async (formData) => {
    const validatedParameters = getValidatedAuthorizationCodeExchangeParameters(formData);

    const accessCodeDetails = await codeStorage.getAccessCode(validatedParameters.accessCode);

    if (accessCodeDetails === null) {
        throw new AuthenticationError({
            errorCategory: AuthenticationError.errrorCategories.INVALID_GRANT,
            errorDescription: "Invalid access code.",
        });
    }

    if (accessCodeDetails.clientId !== validatedParameters.clientId) {
        throw new AuthenticationError({
            errorCategory: AuthenticationError.errrorCategories.INVALID_GRANT,
            errorDescription: "Invalid client for access code.",
        });
    }

    if (accessCodeDetails.codeChallengeMethod === "S256") {
        const calculatedCodeChallenge = util.uint8ToUrlBase64(await util.calculateSha256FromString(validatedParameters.codeVerifier));

        if (calculatedCodeChallenge !== accessCodeDetails.codeChallenge) {
            throw new AuthenticationError({
                errorCategory: AuthenticationError.errrorCategories.INVALID_GRANT,
                errorDescription: "Invalid code challenge",
            });
        }
    } else {
        throw new AuthenticationError({
            errorCategory: AuthenticationError.errrorCategories.INVALID_GRANT,
            errorDescription: "Invalid code challenge method",
        });
    }

    if (!validatedParameters.scope.every((scope) => accessCodeDetails.scope.includes(scope))) {
        throw new AuthenticationError({
            errorCategory: AuthenticationError.errrorCategories.INVALID_GRANT,
            errorDescription: "Requested scopes were not granted for acccess code",
        });
    }

    const tokenHeader = {
        alg: "ES512",
        typ: "JWT",
    };

    const tokenTimeToLive = environmentVariables.getTokenTimeToLive();

    const tokenPayload = {
        aud: "abc",
        iss: "abc",
        sub: accessCodeDetails.username,
        exp: Math.round(Date.now() / 1000) + tokenTimeToLive,
        iat: Math.round(Date.now() / 1000),
        scope: validatedParameters.scope,
    };

    const tokenHeaderBase64 = util.strToUrlBase64(JSON.stringify(tokenHeader));
    const tokenPayloadBase64 = util.strToUrlBase64(JSON.stringify(tokenPayload));

    const key = await getPrivateKey();

    const tokenSignatureBase64 = util.uint8ToUrlBase64(new Uint8Array(await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-512" }, key, util.strToUint8(`${tokenHeaderBase64}.${tokenPayloadBase64}`))));

    const token = [tokenHeaderBase64, tokenPayloadBase64, tokenSignatureBase64].join(".");

    const tokenResponse = {
        access_token: token,
        refresh_token: "token",
        token_type: "JWT",
        expires_in: tokenTimeToLive,
        scope: validatedParameters.scope,
    };

    return SUCCESS({
        jsonResponse: tokenResponse,
        headers: { "Cache-Control": "no-store" },
    });
};

export default {
    exchangeAccessCodeForToken,
};
