import { FOUND } from "./helper/responses.js";

import clientAuthenticator from "./authentication/client.js";
import userAuthenticator from "./authentication/user.js";
import AuthenticationError from "./error/authenticationError.js";
import basicAuthHelper from "./helper/basicAuth.js";
import { USER_INFO_SCOPE } from "./helper/constants.js";
import util from "./helper/util.js";
import logger from "./logger.js";
import codeStorage from "./storage/code.js";
import environmentVariables from "./storage/environmentVariables.js";
import grantStorage from "./storage/grant.js";
import authCodeGrantValidator from "./validation/authCodeGrantValidator.js";
import sharedValidator from "./validation/sharedValidator.js";

const getValidatedParameters = (parameters) => {
    const validatedParameters = {
        responseType: authCodeGrantValidator.isValidResponseType(parameters.response_type),
        clientId: sharedValidator.isValidClientId(parameters.client_id),
        redirectUri: sharedValidator.isValidRedirectUri(parameters.redirect_uri),
        audience: sharedValidator.isValidAudience(parameters.audience?.split(" ")),
        scope: authCodeGrantValidator.isValidScope(parameters.scope?.split(",")),
        codeChallenge: authCodeGrantValidator.isValidCodeChallenge(parameters.code_challenge),
        codeChallengeMethod: authCodeGrantValidator.isValidCodeChallengeTransformMethod(parameters.code_challenge_method),
        state: parameters.state?.toString(),
    };

    logger.logObject({
        label: "validated parameters",
        object: validatedParameters,
    });
    return validatedParameters;
};

const getParametersFromRequest = async ({ method, url, request }) => {
    if (method === "GET") {
        return Object.fromEntries(url.searchParams);
    }

    if (method === "POST") {
        return await request.json();
    }

    throw new Error(`Encountered unsupported '${method}' method while trying to get parameters.`);
};

async function handleAuthorizationRequest(request) {
    try {
        const method = request.method;
        const url = new URL(request.url);

        const parameters = await getParametersFromRequest({
            method,
            url,
            request,
        });

        const validatedParameters = getValidatedParameters(parameters);

        if (validatedParameters.scope.includes(USER_INFO_SCOPE)) {
            validatedParameters.audience = Array.from(new Set([environmentVariables.getUserInfoApiUrl(), ...validatedParameters.audience]));
        }

        await clientAuthenticator.authenticateClient({ clientId: validatedParameters.clientId, redirectUri: validatedParameters.redirectUri, audience: validatedParameters.audience });

        const authHeader = request.headers.get("Authorization");
        if (authHeader === null || authHeader === "") {
            const loginUrl = new URL(url);

            if (environmentVariables.isLocalEnvironment()) {
                logger.logMessage("Redirecting to local login page");
                loginUrl.host = "localhost:8789";
            }

            loginUrl.pathname = "login";
            loginUrl.search = new URLSearchParams({
                response_type: validatedParameters.responseType,
                client_id: validatedParameters.clientId,
                redirect_uri: validatedParameters.redirectUri,
                audience: validatedParameters.audience.join(" "),
                scope: validatedParameters.scope.join(","),
                code_challenge: validatedParameters.codeChallenge,
                code_challenge_method: validatedParameters.codeChallengeMethod,
                state: validatedParameters.state,
            }).toString();

            logger.logMessage(`Redirecting user to login at: ${loginUrl.toString()}`);
            return FOUND(loginUrl.toString());
        }

        const { username, password } = basicAuthHelper.extractUserInfoFromBasicAuthHeader(authHeader);

        await userAuthenticator.authenticateUser({
            username,
            password,
            scope: validatedParameters.scope,
        });

        const accessCode = await util.generateRandomSha256HexString();

        const grantId = util.getRandomUUID();

        await grantStorage.saveGrant({ grantId, clientId: validatedParameters.clientId, scope: validatedParameters.scope, username, audience: validatedParameters.audience });

        await codeStorage.saveAccessCode({
            code: accessCode,
            scope: validatedParameters.scope,
            clientId: validatedParameters.clientId,
            codeChallenge: validatedParameters.codeChallenge,
            codeChallengeMethod: validatedParameters.codeChallengeMethod,
            username,
            grantId,
            audience: validatedParameters.audience,
        });

        const redirectUrl = new URL(validatedParameters.redirectUri);
        redirectUrl.searchParams.set("code", accessCode);
        if (validatedParameters.state !== undefined) {
            redirectUrl.searchParams.set("state", validatedParameters.state);
        }

        logger.logMessage(`User authentication successful, redirecting to: ${redirectUrl}`);

        return FOUND(redirectUrl);
    } catch (failure) {
        logger.logError(failure);
        if (failure instanceof AuthenticationError) {
            return failure.toResponse("http://localhost:8789/login");
        }

        return new AuthenticationError({
            errorCategory: AuthenticationError.errrorCategories.SERVER_ERROR,
            errorDescription: failure.message,
        }).toResponse("http://localhost:8789/login");
    }
}

export default { handleAuthorizationRequest };
