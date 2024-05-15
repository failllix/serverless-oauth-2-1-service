import { FOUND } from "../responses.js";

class AuthenticationError {
    static errrorCategories = {
        INVALID_REQUEST: "invalid_request",
        INVALID_GRANT: "invalid_grant",
        UNSUPPORTED_GRANT_TYPE: "unsupported_grant_type",
        UNAUTHORIZED_CLIENT: "unauthorized_client",
        ACCESS_DENIED: "access_denied",
        UNSUPPORTED_RESPONSE_TYPE: "unsupported_response_type",
        SERVER_ERROR: "server_error",
    };

    constructor({ errorCategory, errorDescription }) {
        this.errorCategory = errorCategory;
        this.errorDescription = errorDescription;
    }

    toResponse(baseUrl) {
        const url = new URL(baseUrl);
        url.searchParams.set("error", this.errorCategory);
        url.searchParams.set("error_description", this.errorDescription);
        return FOUND(url.toString());
    }
}

export default AuthenticationError;
