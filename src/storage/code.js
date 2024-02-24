import storageManager from "./manager.js";

const expirationTimeToLiveSeconds = 120;

const getAccessCode = async (code) => {
    return JSON.parse(await storageManager.getCodeKeyValueStorage().get(code));
};

const saveAccessCode = async ({ code, clientId, codeChallenge, codeChallengeMethod }) => {
    await storageManager.getCodeKeyValueStorage().put(code, JSON.stringify({ clientId, codeChallenge, codeChallengeMethod }), { expirationTtl: expirationTimeToLiveSeconds });
};

export default { getAccessCode, saveAccessCode };
