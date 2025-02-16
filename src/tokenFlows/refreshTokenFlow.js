import AuthenticationError from "../error/authenticationError.js";
import logger from "../logger.js";
import environmentVariables from "../storage/environmentVariables.js";
import grantStorage from "../storage/grant.js";
import refreshTokenStorage from "../storage/refreshToken.js";
import util from "../util.js";
import refreshTokenExchangeValidator from "../validation/refreshTokenExchangeValidator.js";
import sharedValidator from "../validation/sharedValidator.js";
import tokenCreator from "./tokenCreator.js";

async function getPublickey() {
    return await crypto.subtle.importKey(
        "jwk",
        JSON.parse(environmentVariables.getPublicKey()),
        {
            name: "ECDSA",
            namedCurve: "P-521",
        },
        true,
        ["verify"],
    );
}

const getValidatedRefreshTokenFlowParameters = (formData) => {
    const validatedParameters = {
        clientId: sharedValidator.isValidClientId(formData.get("client_id")),
        scope: sharedValidator.isValidScope(formData.get("scope")?.split(",")),
        refreshToken: refreshTokenExchangeValidator.isValidRefreshToken(formData.get("refresh_token")),
    };

    logger.logObject({
        label: "validated refresh token request parameters",
        object: validatedParameters,
    });
    return validatedParameters;
};

async function exchangeRefreshTokenForAccessToken(formData) {
    const validatedParameters = getValidatedRefreshTokenFlowParameters(formData);

    const refreshToken = validatedParameters.refreshToken;

    const [refreshTokenPayloadBase64, refreshTokenSignatureBase64] = refreshToken.split(".");

    const key = await getPublickey();

    const verified = await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-512" }, key, util.urlBase64Touint8(refreshTokenSignatureBase64), util.strToUint8(refreshTokenPayloadBase64));

    if (!verified) {
        throw new AuthenticationError({
            errorCategory: AuthenticationError.errrorCategories.INVALID_GRANT,
            errorDescription: "Signature of refresh token could not be verified.",
        });
    }

    const verifiedRefreshTokenPayload = JSON.parse(util.urlBase64ToStr(refreshTokenPayloadBase64));

    logger.logObject({
        label: "verified refresh token payload",
        object: verifiedRefreshTokenPayload,
    });

    const savedRefreshTokenDetails = await refreshTokenStorage.getRefreshToken(verifiedRefreshTokenPayload.token_id);

    if (savedRefreshTokenDetails === null) {
        throw new AuthenticationError({
            errorCategory: AuthenticationError.errrorCategories.INVALID_GRANT,
            errorDescription: "Refresh token was not found.",
        });
    }

    if (!savedRefreshTokenDetails.active) {
        logger.logError("Encountered inactive refresh token. Revoking grant.");

        await grantStorage.deleteGrant(savedRefreshTokenDetails.grantId);

        throw new AuthenticationError({
            errorCategory: AuthenticationError.errrorCategories.INVALID_GRANT,
            errorDescription: "Refresh token is no longer active.",
        });
    }

    const grantDetails = await grantStorage.getGrant(verifiedRefreshTokenPayload.grant_id);

    if (grantDetails === null) {
        throw new AuthenticationError({
            errorCategory: AuthenticationError.errrorCategories.INVALID_GRANT,
            errorDescription: "Grant is no longer active.",
        });
    }

    if (validatedParameters.clientId !== savedRefreshTokenDetails.clientId) {
        throw new AuthenticationError({
            errorCategory: AuthenticationError.errrorCategories.INVALID_GRANT,
            errorDescription: "Invalid client for refresh token.",
        });
    }

    if (!validatedParameters.scope.every((scope) => grantDetails.scope.includes(scope))) {
        throw new AuthenticationError({
            errorCategory: AuthenticationError.errrorCategories.INVALID_GRANT,
            errorDescription: "Requested scopes were not granted for refresh token",
        });
    }

    await refreshTokenStorage.deactivateRefreshToken(verifiedRefreshTokenPayload.token_id);

    return await tokenCreator.getAccessTokenResponse({
        grantId: verifiedRefreshTokenPayload.grant_id,
        clientId: validatedParameters.clientId,
        scope: validatedParameters.scope,
        username: grantDetails.username,
    });
}

export default { exchangeRefreshTokenForAccessToken };
