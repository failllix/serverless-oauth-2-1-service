import storageManager from "./manager.js";

const convertOutput = (results) => {
    return results.map((result) => {
        return { ...result, Scope: result.Scope.split(",") };
    });
};

const getGrant = async (grantId) => {
    const statement = storageManager.getDatabase().prepare("SELECT * FROM Grants WHERE GrantId = ?").bind(grantId);

    const dbResult = await statement.run();

    const results = dbResult.results;

    if (results.length === 0) {
        return null;
    }

    if (results.length > 1) {
        throw new Error(`Expected to receive only one grant with id '${grantId}'`);
    }

    return convertOutput(results)[0];
};

const getGrantsByUsername = async (username) => {
    const statement = storageManager.getDatabase().prepare("SELECT * FROM Grants WHERE Username = ?").bind(username);

    const dbResult = await statement.run();

    return convertOutput(dbResult.results);
};

const saveGrant = async ({ grantId, clientId, scope, username }) => {
    const statement = storageManager.getDatabase().prepare("INSERT INTO Grants (GrantId, ClientId, Username, Scope) VALUES (?, ?, ?, ?)").bind(grantId, clientId, username, scope.join(","));

    await statement.run();
};

const deleteGrant = async ({ grantId, username }) => {
    const statement = storageManager.getDatabase().prepare("DELETE FROM Grants WHERE GrantId = ? AND Username = ?").bind(grantId, username);

    const result = await statement.run();

    return result.meta.changed_db;
};

export default { getGrant, saveGrant, deleteGrant, getGrantsByUsername };
