const clientIdKeyValueNamespace = "CLIENT";

let clientKeyValueStorage;
const getClientKeyValueStorage = () => {
    if (clientKeyValueStorage === undefined) {
        throw new Error("Client key-value storage was not initialized.");
    }
    return clientKeyValueStorage;
};

const initializeStorage = (env) => {
    clientKeyValueStorage = env[clientIdKeyValueNamespace];
};

export default { initializeStorage, getClientKeyValueStorage };
