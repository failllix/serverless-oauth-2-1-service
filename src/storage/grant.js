import keyValueHelper from "../helper/keyValueHelper.js";
import storageManager from "./manager.js";

const getGrant = async (grantId) => {
    return JSON.parse(await storageManager.getGrantKeyValueStorage().get(grantId));
};

const getGrantsByUsername = async (username) => {
    return await keyValueHelper.getAllValuesForPrefix({
        keyValueStorage: storageManager.getGrantKeyValueStorage(),
        keyPrefix: username,
    });
};

const getKeys = ({ grantId, username }) => {
    return [grantId, `${username}:${grantId}`];
};

const saveGrant = async ({ grantId, clientId, scope, username }) => {
    const grantInfo = JSON.stringify({ clientId, scope, username });

    for (const key of getKeys({ grantId, username })) {
        await storageManager.getGrantKeyValueStorage().put(key, grantInfo);
    }
};

const deleteGrant = async ({ grantId, username }) => {
    for (const key of getKeys({ grantId, username })) {
        await storageManager.getGrantKeyValueStorage().delete(key);
    }
};

export default { getGrant, saveGrant, deleteGrant, getGrantsByUsername };
