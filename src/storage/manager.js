const clientKeyValueNamespace = "CLIENT";
const userKeyValueNamespace = "USER";
const codeKeyValueNamespace = "CODE";

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

const initializeStorage = (env) => {
    clientKeyValueStorage = env[clientKeyValueNamespace];
    userKeyValueStorage = env[userKeyValueNamespace];
    codeKeyValueStorage = env[codeKeyValueNamespace];
};

export default {
    initializeStorage,
    getClientKeyValueStorage,
    getUserKeyValueStorage,
    getCodeKeyValueStorage,
};
