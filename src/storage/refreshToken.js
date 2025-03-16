import keyValueHelper from "../helper/keyValueHelper.js";
import environmentVariables from "./environmentVariables.js";
import storageManager from "./manager.js";

const getRefreshToken = async (refreshTokenId) => {
    return JSON.parse(await storageManager.getRefreshTokenKeyValueStorage().get(refreshTokenId));
};

const getRefreshTokensByUsername = async (username) => {
    return await keyValueHelper.getAllValuesForPrefix({
        keyValueStorage: storageManager.getRefreshTokenKeyValueStorage(),
        keyPrefix: username,
    });
};

const getKeys = ({ refreshTokenId, username }) => {
    return [refreshTokenId, `${username}:${refreshTokenId}`];
};

const saveRefreshToken = async ({ refreshTokenId, scope = [], clientId, grantId, username }) => {
    const refreshTokenTimeToLive = environmentVariables.getRefreshTokenTimeToLive();
    const refreshTokenInfo = JSON.stringify({
        clientId,
        scope,
        grantId,
        active: true,
        username,
    });

    const saveOptions = { expirationTtl: refreshTokenTimeToLive };

    for (const key of getKeys({ refreshTokenId, username })) {
        await storageManager.getRefreshTokenKeyValueStorage().put(key, refreshTokenInfo, saveOptions);
    }
};

const deactivateRefreshToken = async ({ refreshTokenId, username }) => {
    const currentToken = await getRefreshToken(refreshTokenId);

    if (currentToken === null) {
        throw new Error("Refresh token cannot be deactivated. It no longer exists.");
    }

    const updatedRefreshTokenInfo = JSON.stringify({ ...currentToken, active: false });

    for (const key of getKeys({ refreshTokenId, username })) {
        await storageManager.getRefreshTokenKeyValueStorage().put(key, updatedRefreshTokenInfo);
    }
};

export default { getRefreshToken, saveRefreshToken, deactivateRefreshToken, getRefreshTokensByUsername };
