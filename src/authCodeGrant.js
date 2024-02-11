import { BAD_REQUEST } from "./responses.js";

const getValidatedParameters = (body) => {
    const typeMap = {
        redirect_uri: "string",
        username: "string",
        password: "string",
        client_id: "string",
        scope: "array",
    };

    const bodyFieldNames = Object.keys(body);
    const expectedFieldnames = Object.keys(typeMap);

    const missingFieldNames = expectedFieldnames.filter((name) => !bodyFieldNames.includes(name));
    const unexpectedFieldNames = bodyFieldNames.filter((name) => !expectedFieldnames.includes(name));

    if (missingFieldNames.length > 0) {
        throw new Error(`Missing properties: ${missingFieldNames.join(", ")}`);
    }

    if (unexpectedFieldNames.length > 0) {
        throw new Error(`Missing properties: ${unexpectedFieldNames.join(", ")}`);
    }

    for (const fieldName in typeMap) {
        if (typeof body[fieldName] !== typeMap[fieldName]) {
            throw new Error(`${fieldName} must be of type ${typeMap[fieldName]}`);
        }

        if (typeMap[fieldName] === "string" && !body[fieldName]) {
            throw new Error(`${fieldName} musat not be empty, null or undefined`);
        }
    }

    return {
        redirectUri: body.redirect_uri,
        username: body.username,
        password: body.password,
        clientId: body.client_id,
        scope: body.scope,
    };
};

async function handleAuthCodeRequest(request) {
    const body = await request.json();

    try {
        const params = getValidatedParameters(body);
    } catch (error) {
        return BAD_REQUEST(error.message);
    }

    //   const client = JSON.parse(await clientsKV.get(clientId));
    //   const user = JSON.parse(await userKV.get(username));

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

export { handleAuthCodeRequest };
