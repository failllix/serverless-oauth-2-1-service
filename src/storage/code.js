import storageManager from "./manager.js";

const convertOutput = (results) => {
    return results.map((result) => {
        return { ...result, Scope: result.Scope.split(","), Audience: result.Audience.split(" ") };
    });
};

const clearExpiredCodesStatement = "DELETE FROM Codes WHERE ExpiresAt < datetime('now')";

const getAccessCodesByUsername = async (username) => {
    const statement = storageManager.getDatabase().prepare("SELECT * FROM Codes WHERE Username = ?").bind(username);

    const dbResult = await storageManager.getDatabase().batch([storageManager.getDatabase().prepare(clearExpiredCodesStatement), statement]);

    return convertOutput(dbResult[1].results);
};

const getAccessCode = async (code) => {
    const statement = storageManager.getDatabase().prepare("SELECT * FROM Codes WHERE AccessCode = ?").bind(code);

    const dbResult = await storageManager.getDatabase().batch([storageManager.getDatabase().prepare(clearExpiredCodesStatement), statement]);

    const results = dbResult[1].results;

    if (results.length === 0) {
        return null;
    }

    if (results.length > 1) {
        throw new Error(`Expected to receive only one code with id '${code}'`);
    }

    return convertOutput(results)[0];
};

const saveAccessCode = async ({ code, scope = [], clientId, codeChallenge, codeChallengeMethod, username, grantId, audience }) => {
    const statement = storageManager.getDatabase().prepare("INSERT INTO Codes (AccessCode, ClientId, Username, GrantId, Scope, CodeChallengeMethod, CodeChallenge, Audience) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(code, clientId, username, grantId, scope.join(","), codeChallengeMethod, codeChallenge, audience.join(" "));

    await statement.run();
};

export default { getAccessCode, saveAccessCode, getAccessCodesByUsername };
