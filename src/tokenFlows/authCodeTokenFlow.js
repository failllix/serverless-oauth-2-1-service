import AuthenticationError from ".././error/authenticationError.js";
import logger from ".././logger.js";
import codeStorage from ".././storage/code.js";
import util from ".././util.js";
import sharedValidator from ".././validation/sharedValidator.js";
import tokenExchangeValidator from ".././validation/tokenExchangeValidator.js";
import tokenCreator from "./tokenCreator.js";

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

    return await tokenCreator.getAccessTokenResponse({
        clientId: accessCodeDetails.clientId,
        grantId: accessCodeDetails.grantId,
        scope: validatedParameters.scope,
        username: accessCodeDetails.username,
    });
};

export default {
    exchangeAccessCodeForToken,
};
