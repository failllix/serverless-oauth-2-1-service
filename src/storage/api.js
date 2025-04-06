import storageManager from "./manager.js";

const convertOutput = (apis) => {
    return apis.map((api) => api.Uri);
};

const getApisOfClient = async (clientId) => {
    const statement = storageManager.getDatabase().prepare("SELECT Apis.Uri FROM ClientApiAccess INNER JOIN Clients ON ClientApiAccess.ClientId = Clients.ClientId INNER JOIN Apis ON ClientApiAccess.Uri = Apis.Uri WHERE Clients.ClientId = ?").bind(clientId);

    const dbResult = await statement.run();

    const results = dbResult.results;

    return convertOutput(results);
};

export default { getApisOfClient };
