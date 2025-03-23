import AuthenticationError from "../error/authenticationError.js";
import keyHelper from "../helper/keyHelper.js";
import util from "../helper/util.js";
import logger from "../logger.js";
import grantStorage from "../storage/grant.js";
import refreshTokenStorage from "../storage/refreshToken.js";
import refreshTokenExchangeValidator from "../validation/refreshTokenExchangeValidator.js";
import sharedValidator from "../validation/sharedValidator.js";
import tokenCreator from "./tokenCreator.js";

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

async function exchangeRefreshTokenForAccessToken({ formData, host }) {
    const validatedParameters = getValidatedRefreshTokenFlowParameters(formData);

    const refreshToken = validatedParameters.refreshToken;

    const [refreshTokenPayloadBase64, refreshTokenSignatureBase64] = refreshToken.split(".");

    const verified = await keyHelper.verifyToken({ uint8Signature: util.urlBase64Touint8(refreshTokenSignatureBase64), uint8TokenContent: util.strToUint8(refreshTokenPayloadBase64) });

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

    const username = savedRefreshTokenDetails.username;
    await refreshTokenStorage.deactivateRefreshToken({ refreshTokenId: verifiedRefreshTokenPayload.token_id, username });

    if (!savedRefreshTokenDetails.active) {
        logger.logError("Encountered inactive refresh token. Revoking grant.");

        await grantStorage.deleteGrant({ grantId: savedRefreshTokenDetails.grantId, username });

        throw new AuthenticationError({
            errorCategory: AuthenticationError.errrorCategories.INVALID_GRANT,
            errorDescription: "Refresh token is no longer active.",
        });
    }

    if (validatedParameters.clientId !== savedRefreshTokenDetails.clientId) {
        throw new AuthenticationError({
            errorCategory: AuthenticationError.errrorCategories.INVALID_GRANT,
            errorDescription: "Invalid client for refresh token.",
        });
    }

    const grantDetails = await grantStorage.getGrant(verifiedRefreshTokenPayload.grant_id);

    if (grantDetails === null) {
        throw new AuthenticationError({
            errorCategory: AuthenticationError.errrorCategories.INVALID_GRANT,
            errorDescription: "Grant is no longer active.",
        });
    }

    if (!validatedParameters.scope.every((scope) => grantDetails.scope.includes(scope))) {
        throw new AuthenticationError({
            errorCategory: AuthenticationError.errrorCategories.INVALID_GRANT,
            errorDescription: "Requested scopes were not granted for refresh token",
        });
    }

    return await tokenCreator.getAccessTokenResponse({
        grantId: verifiedRefreshTokenPayload.grant_id,
        clientId: validatedParameters.clientId,
        scope: validatedParameters.scope,
        username,
        issuer: host,
    });
}

export default { exchangeRefreshTokenForAccessToken };
