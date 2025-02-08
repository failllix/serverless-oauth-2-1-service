import AuthenticationError from "./error/authenticationError.js";
import logger from "./logger.js";
import { INTERNAL_SERVER_ERROR, NOT_IMPLEMENTED } from "./responses.js";
import authCodeTokenFlow from "./tokenFlows/authCodeTokenFlow.js";
import tokenExchangeValidator from "./validation/tokenExchangeValidator.js";

async function handleTokenRequest(request) {
    try {
        const formData = await request.formData();
        const validatedGrantType = tokenExchangeValidator.isValidGrantType(formData.get("grant_type"));

        logger.logMessage(`Grant type: ${validatedGrantType}`);

        if (validatedGrantType === "authorization_code") {
            return await authCodeTokenFlow.exchangeAccessCodeForToken(formData);
        }

        return NOT_IMPLEMENTED;
    } catch (failure) {
        logger.logError(failure);

        if (failure instanceof AuthenticationError) {
            return INTERNAL_SERVER_ERROR(failure.errorDescription);
        }

        return INTERNAL_SERVER_ERROR(failure.message);
    }
}

export default {
    handleTokenRequest,
};
