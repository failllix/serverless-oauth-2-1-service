import keyHelper from "./helper/keyHelper.js";
import { BAD_REQUEST, FOUND, INTERNAL_SERVER_ERROR, NOT_FOUND, SUCCESS } from "./helper/responses.js";
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

    //TODO check if token contains expected scope
    //TODO check if audience is correct
    //TODO check if token has not expired

    const tokenPayload = JSON.parse(util.urlBase64ToStr(accessTokenPayloadUrlBase64));

    logger.logObject({ label: "Verified token payload", object: tokenPayload });

    return tokenPayload;
}

async function handleGetUserInfoRequest(request) {
    try {
        const verifiedToken = await getVerifiedToken(request);

        const username = verifiedToken.sub;

        const accessCodes = await codeStorage.getAccessCodesByUsername(username);
        const grants = await grantStorage.getGrantsByUsername(username);
        const refreshTokens = await refreshTokenStorage.getRefreshTokensByUsername(username);

        const activeRefreshTokens = Object.entries(refreshTokens).reduce((acc, [key, value]) => {
            if (value.active) {
                acc[key] = value;
            }
            return acc;
        }, {});
        const inactiveRefreshTokens = Object.entries(refreshTokens).reduce((acc, [key, value]) => {
            if (!value.active) {
                acc[key] = value;
            }
            return acc;
        }, {});

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

        const grant = await grantStorage.getGrant(`${username}:${grantId}`);

        if (grant === null) {
            return NOT_FOUND;
        }

        await grantStorage.deleteGrant({ grantId, username });
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

        const refreshToken = await refreshTokenStorage.getRefreshToken(`${username}:${refreshTokenId}`);

        if (refreshToken === null) {
            return NOT_FOUND;
        }

        await refreshTokenStorage.deactivateRefreshToken({ refreshTokenId, username });
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
