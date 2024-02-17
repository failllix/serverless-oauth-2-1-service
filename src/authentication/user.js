import userStorage from "../storage/user.js";
import util from "../util.js";

const authenticateUser = async ({ username, password, scope }) => {
    const user = await userStorage.getUser(username);

    const passwordHash = await util.strToSha512HexString(password + user?.salt);

    if (user === null || user?.passwordToken !== passwordHash) {
        throw new Error("Wrong username or password.");
    }

    if (!scope.every((scope) => user?.scope?.includes(scope))) {
        throw new Error("User has inussificent scopes.");
    }
};

export default { authenticateUser };
