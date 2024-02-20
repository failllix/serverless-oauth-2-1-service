import storageManager from "./manager.js";

const expirationTimeToLiveSeconds = 120;

const getAccessCode = async (code) => {
    return JSON.parse(await storageManager.getCodeKeyValueStorage().get(code));
};

const saveAccessCode = async ({ code, clientId }) => {
    await storageManager.getCodeKeyValueStorage().put(code, JSON.stringify({ clientId }, { expirationTtl: expirationTimeToLiveSeconds }));
};

export default { getAccessCode, saveAccessCode };
