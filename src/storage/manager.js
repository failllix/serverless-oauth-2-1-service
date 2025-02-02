const clientKeyValueNamespace = "CLIENT";
const userKeyValueNamespace = "USER";
const codeKeyValueNamespace = "CODE";
const environmentVariableNames = {
    signingKey: "SIGNING_KEY",
    publickey: "PUBLIC_KEY",
    tokenTimeToLive: "TOKEN_TIME_TO_LIVE",
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
    environmentVariableStorage = {
        signingKey: env[environmentVariableNames.signingKey],
        publickey: env[environmentVariableNames.publickey],
        tokenTimeToLive: parseInt(env[environmentVariableNames.tokenTimeToLive]),
    };
};

export default {
    initializeStorage,
    getClientKeyValueStorage,
    getUserKeyValueStorage,
    getCodeKeyValueStorage,
    getEnvironmentVariableStorage,
};
