const dbName = "DB";
const environmentVariableNames = {
    signingKey: "SIGNING_KEY",
    publicKey: "PUBLIC_KEY",
    tokenTimeToLive: "TOKEN_TIME_TO_LIVE",
    refreshTokenTimeToLive: "REFRESH_TOKEN_TIME_TO_LIVE",
};

let database;
const getDatabase = () => {
    if (database === undefined) {
        throw new Error("Database was not initialized.");
    }
    return database;
};

let environmentVariableStorage;
const getEnvironmentVariableStorage = () => {
    if (Object.values(environmentVariableStorage).some((value) => value === "" || value === undefined || (typeof value === "number" && Number.isNaN(value)))) {
        throw new Error("Environment variable storage was not initialized.");
    }

    return environmentVariableStorage;
};

const initializeStorage = (env) => {
    database = env[dbName];
    environmentVariableStorage = {
        signingKey: env[environmentVariableNames.signingKey],
        publicKey: env[environmentVariableNames.publicKey],
        tokenTimeToLive: parseInt(env[environmentVariableNames.tokenTimeToLive]),
        refreshTokenTimeToLive: parseInt(env[environmentVariableNames.refreshTokenTimeToLive]),
    };
};

export default {
    initializeStorage,
    getDatabase,
    getEnvironmentVariableStorage,
};
