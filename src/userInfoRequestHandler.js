import keyHelper from "./helper/keyHelper.js";
import { BAD_REQUEST, FOUND, INTERNAL_SERVER_ERROR, NOT_FOUND, SUCCESS, UNAUTHORIZED } from "./helper/responses.js";
import util from "./helper/util.js";
import logger from "./logger.js";
import codeStorage from "./storage/code.js";
import grantStorage from "./storage/grant.js";
import refreshTokenStorage from "./storage/refreshToken.js";

async function getVerifiedToken(request) {
    const authHeader = request.headers.get("Authorization");

    if (authHeader === null) {
        throw BAD_REQUEST("Missing access token in 'Authorization' header. Format: 'Authorization: Bearer <access_token>'.");
    }

    const accessToken = authHeader.split("Bearer ")[1];
    if (accessToken === undefined) {
        throw BAD_REQUEST("Could not parse Bearer token in 'Authorization' header. Format: 'Authorization: Bearer <access_token>'.");
    }

    const [accessTokenHeaderUrlBase64, accessTokenPayloadUrlBase64, accessTokenSignatureUrlBase64] = accessToken.split(".");

    const verified = await keyHelper.verifyToken({ uint8Signature: util.urlBase64Touint8(accessTokenSignatureUrlBase64), uint8TokenContent: util.strToUint8(`${accessTokenHeaderUrlBase64}.${accessTokenPayloadUrlBase64}`) });

    if (!verified) {
        throw BAD_REQUEST("Could not verify signature of provided access token");
    }

    const tokenPayload = JSON.parse(util.urlBase64ToStr(accessTokenPayloadUrlBase64));

    logger.logObject({ label: "Verified token payload", object: tokenPayload });

    // TODO adjust after adding proper audience handling
    if (tokenPayload.aud !== "abc") {
        throw BAD_REQUEST("Audience of token does not match server URL");
    }

    if (!tokenPayload.scope.includes("userInfo")) {
        throw BAD_REQUEST("Missing 'userInfo' scope in authorization token");
    }

    if (Date.now() > tokenPayload.exp * 1000) {
        throw BAD_REQUEST("Token is expired");
    }

    return tokenPayload;
}

async function handleGetUserInfoRequest(request) {
    try {
        const verifiedToken = await getVerifiedToken(request);

        const username = verifiedToken.sub;

        const accessCodes = await codeStorage.getAccessCodesByUsername(username);
        const grants = await grantStorage.getGrantsByUsername(username);
        const refreshTokens = await refreshTokenStorage.getRefreshTokensByUsername(username);

        const activeRefreshTokens = refreshTokens.filter((refreshToken) => refreshToken.Active);
        const inactiveRefreshTokens = refreshTokens.filter((refreshToken) => !refreshToken.Active);

        return SUCCESS({ jsonResponse: { accessCodes, grants, activeRefreshTokens, inactiveRefreshTokens }, headers: {} });
    } catch (failure) {
        if (failure instanceof Response) {
            return failure;
        }
        logger.logError(failure);

        return INTERNAL_SERVER_ERROR(failure.message);
    }
}

async function handleGrantDeletionRequest(request) {
    try {
        const verifiedToken = await getVerifiedToken(request);
        const username = verifiedToken.sub;

        const url = new URL(request.url);
        const grantId = url.pathname.split("/me/grants/")[1];

        if (!grantId) {
            return BAD_REQUEST("Could not extract grant id from path.");
        }

        logger.logMessage(`Attempting to delete grant with id '${grantId}' of user '${username}'.`);

        const result = await grantStorage.deleteGrant({ grantId, username });
        if (!result) {
            return NOT_FOUND;
        }

        return SUCCESS({ jsonResponse: "", headers: {} });
    } catch (failure) {
        if (failure instanceof Response) {
            return failure;
        }
        logger.logError(failure);

        return INTERNAL_SERVER_ERROR(failure.message);
    }
}

async function handleRefreshTokenDeletionRequest(request) {
    try {
        const verifiedToken = await getVerifiedToken(request);
        const username = verifiedToken.sub;

        const url = new URL(request.url);
        const refreshTokenId = url.pathname.split("/me/refreshTokens/")[1];

        if (!refreshTokenId) {
            return BAD_REQUEST("Could not extract refresh token id from path.");
        }

        logger.logMessage(`Attempting to deactivate refresh token with id '${refreshTokenId}' of user '${username}'.`);

        const result = await refreshTokenStorage.deactivateRefreshToken({ refreshTokenId, username });

        if (!result) {
            return NOT_FOUND;
        }

        return SUCCESS({ jsonResponse: "", headers: {} });
    } catch (failure) {
        if (failure instanceof Response) {
            return failure;
        }
        logger.logError(failure);

        return INTERNAL_SERVER_ERROR(failure.message);
    }
}

export default { handleGetUserInfoRequest, handleGrantDeletionRequest, handleRefreshTokenDeletionRequest };
