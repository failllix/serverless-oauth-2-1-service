const clientKeyValueNamespace = "CLIENT";
const userKeyValueNamespace = "USER";
const codeKeyValueNamespace = "CODE";
const refreshTokenKeyValueNamespace = "REFRESH_TOKEN";
const grantKeyValueNamespace = "GRANT";
const environmentVariableNames = {
    signingKey: "SIGNING_KEY",
    publicKey: "PUBLIC_KEY",
    tokenTimeToLive: "TOKEN_TIME_TO_LIVE",
    refreshTokenTimeToLive: "REFRESH_TOKEN_TIME_TO_LIVE",
};

let clientKeyValueStorage;
const getClientKeyValueStorage = () => {
    if (clientKeyValueStorage === undefined) {
        throw new Error("Client key-value storage was not initialized.");
    }
    return clientKeyValueStorage;
};

let userKeyValueStorage;
const getUserKeyValueStorage = () => {
    if (userKeyValueStorage === undefined) {
        throw new Error("User key-value storage was not initialized.");
    }
    return userKeyValueStorage;
};

let codeKeyValueStorage;
const getCodeKeyValueStorage = () => {
    if (codeKeyValueStorage === undefined) {
        throw new Error("Code key-value storage was not initialized.");
    }
    return codeKeyValueStorage;
};

let refreshTokenKeyValueStorage;
const getRefreshTokenKeyValueStorage = () => {
    if (refreshTokenKeyValueStorage === undefined) {
        throw new Error("Refresh token key-value storage was not initialized.");
    }
    return refreshTokenKeyValueStorage;
};

let grantKeyValueStorage;
const getGrantKeyValueStorage = () => {
    if (grantKeyValueStorage === undefined) {
        throw new Error("Grant key-value storage was not initialized.");
    }
    return grantKeyValueStorage;
};

let environmentVariableStorage;
const getEnvironmentVariableStorage = () => {
    if (Object.values(environmentVariableStorage).some((value) => value === "" || value === undefined || (typeof value === "number" && Number.isNaN(value)))) {
        throw new Error("Environment variable storage was not initialized.");
    }

    return environmentVariableStorage;
};

const initializeStorage = (env) => {
    clientKeyValueStorage = env[clientKeyValueNamespace];
    userKeyValueStorage = env[userKeyValueNamespace];
    codeKeyValueStorage = env[codeKeyValueNamespace];
    refreshTokenKeyValueStorage = env[refreshTokenKeyValueNamespace];
    grantKeyValueStorage = env[grantKeyValueNamespace];
    environmentVariableStorage = {
        signingKey: env[environmentVariableNames.signingKey],
        publicKey: env[environmentVariableNames.publicKey],
        tokenTimeToLive: parseInt(env[environmentVariableNames.tokenTimeToLive]),
        refreshTokenTimeToLive: parseInt(env[environmentVariableNames.refreshTokenTimeToLive]),
    };
};

export default {
    initializeStorage,
    getClientKeyValueStorage,
    getUserKeyValueStorage,
    getCodeKeyValueStorage,
    getRefreshTokenKeyValueStorage,
    getGrantKeyValueStorage,
    getEnvironmentVariableStorage,
};
