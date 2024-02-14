import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "./responses.js";

import logger from "./logger.js";
import authCodeGrantValidator from "./validation/authCodeGrantValidator.js";

const getValidatedParameters = (body) => {
    try {
        return {
            redirectUri: authCodeGrantValidator.isValidRedirectUri(body.redirect_uri),
            username: authCodeGrantValidator.isValidUsername(body.username),
            password: authCodeGrantValidator.isValidPassword(body.password),
            clientId: authCodeGrantValidator.isValidClientId(body.client_id),
            scope: authCodeGrantValidator.isValidScope(body.scope),
        };
    } catch (error) {
        logger.logError(error);
        throw BAD_REQUEST(error.message);
    }
};

async function handleAuthCodeRequest(request) {
    try {
        const body = await request.json();
        const params = getValidatedParameters(body);
    } catch (failure) {
        if (failure instanceof Response) {
            return failure;
        }

        logger.logError(failure);

        return INTERNAL_SERVER_ERROR("Encountered unexpected error.");
    }

    //   const client = JSON.parse(await clientsKV.get(clientId));
    //   const usber = JSON.parse(await userKV.get(username));

    //   // Check if client and user exist
    //   if (client == null || user == null) return UNAUTHORIZED;
    //   const hashHex = await strToSha512HexString(password + user.salt);
    //   // Verify password
    //   if (user.pwdToken != hashHex) return UNAUTHORIZED;

    //   //Check if user has requested scopes
    //   for (const scope of requestedScopes) {
    //     if (!user.scope.includes(scope)) return FORBIDDEN;
    //   }

    //   //Check if redirect_uri is valid
    //   if (!client.redirect_uris.includes(redirectURI)) return UNAUTHORIZED;

    //   //generate random code
    //   const code = crypto.randomUUID().replaceAll("-", "");

    //   //Saving code as expiring key (10 mins) with client id its valid for.
    //   await codesKV.put(
    //     code,
    //     JSON.stringify({
    //       client_id: clientId,
    //       scope: requestedScopes,
    //       username,
    //     }),
    //     {
    //       expirationTtl: 600,
    //     }
    //   );

    //   const redirectURIWithCode = redirectURI + "?code=" + code;

    //   if (returnType === "body") {
    //     return new Response(
    //       JSON.stringify({
    //         redirect_uri: redirectURIWithCode,
    //       }),
    //       {
    //         status: 200,
    //         headers: {
    //           "content-type": "application/json",
    //           ...corsHeaders,
    //         },
    //       }
    //     );
    //   }

    //   return new Response(null, {
    //     status: 302,
    //     headers: {
    //       location: redirectURIWithCode,
    //       ...corsHeaders,
    //     },
    //   });
}

export default { handleAuthCodeRequest };
