import storageManager from "./manager.js";

const convertOutput = (results) => {
    return results.map((result) => {
        return { ...result, Scope: result.Scope.split(","), Active: !!result.Active };
    });
};

const getRefreshToken = async (refreshTokenId) => {
    const statement = storageManager.getDatabase().prepare("SELECT * FROM RefreshTokens WHERE RefreshTokenId = ?").bind(refreshTokenId);

    const dbResult = await statement.run();

    const results = dbResult.results;

    if (results.length === 0) {
        return null;
    }

    if (results.length > 1) {
        throw new Error(`Expected to receive only one refresh token with id '${refreshTokenId}'`);
    }

    return convertOutput(results)[0];
};

const getRefreshTokensByUsername = async (username) => {
    const statement = storageManager.getDatabase().prepare("SELECT * FROM RefreshTokens WHERE Username = ?").bind(username);

    const dbResult = await statement.run();

    return convertOutput(dbResult.results);
};

const saveRefreshToken = async ({ refreshTokenId, scope = [], clientId, grantId, username }) => {
    const statement = storageManager.getDatabase().prepare("INSERT INTO RefreshTokens (RefreshTokenId, ClientId, GrantId, Username, Scope) VALUES (?, ?, ?, ?, ?)").bind(refreshTokenId, clientId, grantId, username, scope.join(","));

    await statement.run();
};

const deactivateRefreshToken = async ({ refreshTokenId, username }) => {
    const statement = storageManager.getDatabase().prepare("UPDATE RefreshTokens SET Active = 0 WHERE Active = 1 AND RefreshTokenId = ? AND Username = ?").bind(refreshTokenId, username);

    const result = await statement.run();

    return result.meta.changed_db;
};

export default { getRefreshToken, saveRefreshToken, deactivateRefreshToken, getRefreshTokensByUsername };
