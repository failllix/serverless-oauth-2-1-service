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

const getRefreshTokenTimeToLive = () => {
    return storageManager.getEnvironmentVariableStorage().refreshTokenTimeToLive;
};

export default { getSigningKey, getPublicKey, getTokenTimeToLive, getRefreshTokenTimeToLive };
