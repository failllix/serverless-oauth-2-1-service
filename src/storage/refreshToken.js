import storageManager from "./manager.js";

const getRefreshToken = async (refreshTokenId) => {
    return JSON.parse(await storageManager.getRefreshTokenKeyValueStorage().get(refreshTokenId));
};

const saveRefreshToken = async ({ refreshTokenId, scope = [], clientId, grantId }) => {
    await storageManager.getRefreshTokenKeyValueStorage().put(
        refreshTokenId,
        JSON.stringify({
            clientId,
            scope,
            grantId,
            active: true,
        }),
    );
};

const deactivateRefreshToken = async (refreshTokenId) => {
    const currentToken = await getRefreshToken(refreshTokenId);

    if (currentToken === null) {
        throw new Error("Refresh token cannot be deactivated. It no longer exists.");
    }

    await storageManager.getRefreshTokenKeyValueStorage().put(refreshTokenId, JSON.stringify({ ...currentToken, active: false }));
};

export default { getRefreshToken, saveRefreshToken, deactivateRefreshToken };
