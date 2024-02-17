const clientKeyValueNamespace = "CLIENT";
const userKeyValueNamespace = "USER";

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

const initializeStorage = (env) => {
    clientKeyValueStorage = env[clientKeyValueNamespace];
    userKeyValueStorage = env[userKeyValueNamespace];
};

export default {
    initializeStorage,
    getClientKeyValueStorage,
    getUserKeyValueStorage,
};
