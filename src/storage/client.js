import storageManager from "./manager.js";

const getClient = async (clientId) => {
    return JSON.parse(await storageManager.getClientKeyValueStorage().get(clientId));
};

export default { getClient };
