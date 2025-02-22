import AuthenticationError from "./error/authenticationError.js";
import { INTERNAL_SERVER_ERROR, NOT_IMPLEMENTED } from "./helper/responses.js";
import logger from "./logger.js";
import authCodeTokenFlow from "./tokenFlows/authCodeTokenFlow.js";
import refreshTokenFlow from "./tokenFlows/refreshTokenFlow.js";
import tokenExchangeValidator from "./validation/tokenExchangeValidator.js";

async function handleTokenRequest(request) {
    try {
        const formData = await request.formData();
        const validatedGrantType = tokenExchangeValidator.isValidGrantType(formData.get("grant_type"));

        const url = new URL(request.url);
        const host = url.hostname;

        logger.logMessage(`Grant type: ${validatedGrantType}`);

        switch (validatedGrantType) {
            case "authorization_code":
                return await authCodeTokenFlow.exchangeAccessCodeForToken({ formData, host });
            case "refresh_token":
                return await refreshTokenFlow.exchangeRefreshTokenForAccessToken({ formData, host });
            default:
                return NOT_IMPLEMENTED;
        }
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
