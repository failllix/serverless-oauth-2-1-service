import { LOCAL_ENVIRONMENT_NAME } from "../helper/constants.js";
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

const getUserInfoApiUrl = () => {
    return storageManager.getEnvironmentVariableStorage().userInfoApiUrl;
};

const isLocalEnvironment = () => {
    return storageManager.getEnvironmentVariableStorage().environment === LOCAL_ENVIRONMENT_NAME;
};

export default { getSigningKey, getPublicKey, getTokenTimeToLive, getRefreshTokenTimeToLive, getUserInfoApiUrl, isLocalEnvironment };
