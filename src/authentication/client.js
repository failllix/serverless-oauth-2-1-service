import clientStorage from "../storage/client.js";

const authenticateClient = async (clientId, redirectUri) => {
    const client = await clientStorage.getClient(clientId);

    if (client === null) {
        throw new Error(`Could not find client with id '${clientId}'.`);
    }

    if (client.redirectUri !== redirectUri) {
        throw new Error(`Redirect URI '${redirectUri}' is not valid for client with id '${clientId}'.`);
    }
};

export default {
    authenticateClient,
};
