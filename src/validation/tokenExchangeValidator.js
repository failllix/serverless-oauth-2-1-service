import AuthenticationError from "../error/authenticationError.js";
import validation from "./validation.js";

const isValidAccessCode = (accessCode) => {
    return validation.sequentiallyMatchAllValidations({
        validations: [
            {
                rule: validation.isNotUndefined,
                error: new AuthenticationError({
                    errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                }),
            },
            {
                rule: validation.isNotNull,
                error: new AuthenticationError({
                    errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                }),
            },
            {
                rule: validation.isNotEmpty,
                error: new AuthenticationError({
                    errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                }),
            },
            {
                rule: validation.isString,
                error: new AuthenticationError({
                    errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                }),
            },
        ],
        fieldName: "access_code",
        value: accessCode,
    });
};

const isValidGrantType = (grantType) => {
    return validation.sequentiallyMatchAllValidations({
        validations: [
            {
                rule: validation.isNotUndefined,
                error: new AuthenticationError({
                    errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                }),
            },
            {
                rule: validation.isNotNull,
                error: new AuthenticationError({
                    errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                }),
            },
            {
                rule: validation.isNotEmpty,
                error: new AuthenticationError({
                    errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                }),
            },
            {
                rule: validation.isString,
                error: new AuthenticationError({
                    errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                }),
            },
            {
                rule: validation.isInList,
                args: [["authorization_code", "refresh_token"]],
                error: new AuthenticationError({
                    errorCategory: AuthenticationError.errrorCategories.UNSUPPORTED_GRANT_TYPE,
                }),
            },
        ],
        fieldName: "grant_type",
        value: grantType,
    });
};

const isValidCodeVerifier = (codeVerifier) => {
    return validation.sequentiallyMatchAllValidations({
        validations: [
            {
                rule: validation.isNotUndefined,
                error: new AuthenticationError({
                    errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                }),
            },
            {
                rule: validation.isNotNull,
                error: new AuthenticationError({
                    errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                }),
            },
            {
                rule: validation.isNotEmpty,
                error: new AuthenticationError({
                    errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                }),
            },
            {
                rule: validation.isString,
                error: new AuthenticationError({
                    errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                }),
            },
            {
                rule: validation.matchesRegex,
                args: [/^[a-zA-Z0-9_\.~-]{43,128}$/],
                error: new AuthenticationError({
                    errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                }),
            },
        ],
        fieldName: "code_verifier",
        value: codeVerifier,
    });
};

export default {
    isValidAccessCode,
    isValidGrantType,
    isValidCodeVerifier,
};
