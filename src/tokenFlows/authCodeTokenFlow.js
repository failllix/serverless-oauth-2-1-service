import AuthenticationError from ".././error/authenticationError.js";
import logger from ".././logger.js";
import codeStorage from ".././storage/code.js";
import sharedValidator from ".././validation/sharedValidator.js";
import tokenExchangeValidator from ".././validation/tokenExchangeValidator.js";
import util from "../helper/util.js";
import tokenCreator from "./tokenCreator.js";

const getValidatedAuthorizationCodeExchangeParameters = (formData) => {
    const validatedParameters = {
        clientId: sharedValidator.isValidClientId(formData.get("client_id")),
        redirectUri: sharedValidator.isValidRedirectUri(formData.get("redirect_uri")),
        scope: sharedValidator.isValidOptionalScope(formData.get("scope")?.split(",") || []),
        codeVerifier: tokenExchangeValidator.isValidCodeVerifier(formData.get("code_verifier")),
        accessCode: tokenExchangeValidator.isValidAccessCode(formData.get("code")),
    };

    logger.logObject({
        label: "validated token request parameters",
        object: validatedParameters,
    });
    return validatedParameters;
};

const exchangeAccessCodeForToken = async ({ formData, host }) => {
    const validatedParameters = getValidatedAuthorizationCodeExchangeParameters(formData);

    const accessCodeDetails = await codeStorage.getAccessCode(validatedParameters.accessCode);

    if (accessCodeDetails === null) {
        throw new AuthenticationError({
            errorCategory: AuthenticationError.errrorCategories.INVALID_GRANT,
            errorDescription: "Invalid access code.",
        });
    }

    if (accessCodeDetails.ClientId !== validatedParameters.clientId) {
        throw new AuthenticationError({
            errorCategory: AuthenticationError.errrorCategories.INVALID_GRANT,
            errorDescription: "Invalid client for access code.",
        });
    }

    if (accessCodeDetails.CodeChallengeMethod === "S256") {
        const calculatedCodeChallenge = util.uint8ToUrlBase64(await util.calculateSha256FromString(validatedParameters.codeVerifier));

        if (calculatedCodeChallenge !== accessCodeDetails.CodeChallenge) {
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

    if (!validatedParameters.scope.every((scope) => accessCodeDetails.Scope.includes(scope))) {
        throw new AuthenticationError({
            errorCategory: AuthenticationError.errrorCategories.INVALID_GRANT,
            errorDescription: "Requested scopes were not granted for acccess code",
        });
    }

    return await tokenCreator.getAccessTokenResponse({
        clientId: accessCodeDetails.ClientId,
        grantId: accessCodeDetails.GrantId,
        scope: validatedParameters.scope.length === 0 ? accessCodeDetails.Scope : validatedParameters.scope,
        username: accessCodeDetails.Username,
        issuer: host,
    });
};

export default {
    exchangeAccessCodeForToken,
};
