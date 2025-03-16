import keyValueHelper from "../helper/keyValueHelper.js";
import storageManager from "./manager.js";

const expirationTimeToLiveSeconds = 120;

const getAccessCodesByUsername = async (username) => {
    return await keyValueHelper.getAllValuesForPrefix({
        keyValueStorage: storageManager.getCodeKeyValueStorage(),
        keyPrefix: username,
    });
};

const getAccessCode = async (code) => {
    return JSON.parse(await storageManager.getCodeKeyValueStorage().get(code));
};

const saveAccessCode = async ({ code, scope = [], clientId, codeChallenge, codeChallengeMethod, username, grantId }) => {
    const codeInfo = JSON.stringify({
        scope,
        clientId,
        codeChallenge,
        codeChallengeMethod,
        username,
        grantId,
    });

    const saveOptions = { expirationTtl: expirationTimeToLiveSeconds };

    await storageManager.getCodeKeyValueStorage().put(code, codeInfo, saveOptions);
    await storageManager.getCodeKeyValueStorage().put(`${username}:${code}`, codeInfo, saveOptions);
};

export default { getAccessCode, saveAccessCode, getAccessCodesByUsername };
