import storageManager from "./manager.js";

const getSigningKey = () => {
    return storageManager.getEnvironmentVariableStorage().signingKey;
};

const getPublicKey = () => {
    return storageManager.getEnvironmentVariableStorage().publicKey;
};

const getTokenTimeToLive = () => {
    return storageManager.getEnvironmentVariableStorage().tokenTimeToLive;
};

export default { getSigningKey, getPublicKey, getTokenTimeToLive };
