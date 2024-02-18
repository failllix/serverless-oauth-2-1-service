import logger from "../logger.js";
import userStorage from "../storage/user.js";
import util from "../util.js";

const authenticateUser = async ({ username, password, scope }) => {
    const user = await userStorage.getUser(username);

    try {
        if (user === null) {
            throw new Error(`User '${username}' was not found.`);
        }

        const passwordHash = await util.getPBKDF2PasswordHash(password, user.salt);
        if (user.passwordToken !== passwordHash) {
            throw new Error("Wrong password.");
        }
    } catch (error) {
        logger.logError(error);
        throw new Error("Wrong username or password.");
    }

    if (!scope.every((scope) => user.scope?.includes(scope))) {
        throw new Error("User has inussificent scopes.");
    }
};

export default { authenticateUser };
