import util from "../helper/util.js";
import logger from "../logger.js";
import userStorage from "../storage/user.js";

const getValidatedUser = async ({ username, password }) => {
    try {
        const user = await userStorage.getUser(username);

        if (user === null) {
            throw new Error(`User '${username}' was not found.`);
        }

        const passwordHash = await util.getPBKDF2PasswordHash(password, user.salt);

        if (user.passwordToken !== passwordHash) {
            throw new Error("Wrong password.");
        }

        return user;
    } catch (error) {
        logger.logError(error);
        throw new Error("Wrong username or password.");
    }
};

const authenticateUser = async ({ username, password, scope }) => {
    const user = await getValidatedUser({ username, password });

    if (!scope.every((scope) => user.scope?.includes(scope))) {
        throw new Error("User has inussificent scopes.");
    }
};

export default { authenticateUser };
