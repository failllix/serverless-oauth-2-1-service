import storageManager from "./manager.js";

const getUser = async (username) => {
    const statement = storageManager.getDatabase().prepare("SELECT * FROM Users WHERE Username = ?").bind(username);

    const dbResult = await statement.run();

    const results = dbResult.results;

    if (results.length === 0) {
        return null;
    }

    if (results.length > 1) {
        throw new Error(`Expected to receive only one user with username '${username}'`);
    }

    return results[0];
};

export default { getUser };
