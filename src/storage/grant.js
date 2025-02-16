import storageManager from "./manager.js";

const getGrant = async (grantId) => {
    return JSON.parse(await storageManager.getGrantKeyValueStorage().get(grantId));
};

const saveGrant = async ({ grantId, clientId, scope, username }) => {
    await storageManager.getGrantKeyValueStorage().put(grantId, JSON.stringify({ clientId, scope, username }));
};

const deleteGrant = async (grantId) => {
    return await storageManager.getGrantKeyValueStorage().delete(grantId);
};

export default { getGrant, saveGrant, deleteGrant };
