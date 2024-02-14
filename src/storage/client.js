import storageManager from "./manager.js";

const getClient = async (clientId) => {
    return await storageManager.getClientKeyValueStorage().get(clientId);
};

export default { getClient };
