import AuthenticationError from "../error/authenticationError.js";
import logger from "../logger.js";
import clientStorage from "../storage/client.js";

const authenticateClient = async (clientId, redirectUri) => {
    try {
        const client = await clientStorage.getClient(clientId);

        if (client === null) {
            throw new AuthenticationError({
                errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                errorDescription: `Could not find client with id '${clientId}'.`,
            });
        }

        if (client.redirectUri !== redirectUri) {
            throw new AuthenticationError({
                errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                errorDescription: `Redirect URI '${redirectUri}' is not valid for client with id '${clientId}'.`,
            });
        }
    } catch (error) {
        if (error instanceof AuthenticationError) {
            throw error;
        }

        logger.logError(error);

        throw new Error("Client authentication failed with unknown error.");
    }
};

export default {
    authenticateClient,
};
