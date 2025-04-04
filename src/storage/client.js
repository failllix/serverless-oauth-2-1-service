import storageManager from "./manager.js";

const getClient = async (clientId) => {
    const statement = storageManager.getDatabase().prepare("SELECT * FROM Clients WHERE ClientId = ?").bind(clientId);

    const dbResult = await statement.run();

    const results = dbResult.results;

    if (results.length === 0) {
        return null;
    }

    if (results.length > 1) {
        throw new Error(`Expected to receive only one client for id '${clientId}'`);
    }

    return results[0];
};

export default { getClient };
