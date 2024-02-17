import storageManager from "./manager.js";

const getUser = async (username) => {
    return JSON.parse(await storageManager.getUserKeyValueStorage().get(username));
};

export default { getUser };
