import { FOUND } from "../responses.js";

class AuthenticationError {
    static errrorCategories = {
        INVALID_REQUEST: "invalid_request",
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
        baseUrl.searchParams.set("error", this.errorCategory);
        baseUrl.searchParams.set("error_description", this.errorDescription);
        return FOUND(baseUrl);
    }
}

export default AuthenticationError;
