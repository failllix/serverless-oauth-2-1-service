import AuthenticationError from "../error/authenticationError.js";
import validation from "./validation.js";

const isValidRedirectUri = (redirectUri) => {
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
        fieldName: "redirect_uri",
        value: redirectUri,
    });
};

const isValidAudience = (audience) => {
    return validation.sequentiallyMatchAllValidations({
        validations: [
            {
                rule: validation.isArray,
                error: new AuthenticationError({
                    errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                }),
            },
            {
                rule: validation.arrayContainsOnlyValidEntries,
                error: new AuthenticationError({
                    errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                }),
                args: [[validation.isNotUndefined, validation.isNotNull, validation.isNotEmpty, validation.isString]],
            },
        ],
        fieldName: "audience",
        value: audience,
    });
};

const isValidClientId = (clientId) => {
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
        fieldName: "client_id",
        value: clientId,
    });
};

const isValidOptionalScope = (scope) => {
    return validation.sequentiallyMatchAllValidations({
        validations: [
            {
                rule: validation.isArray,
                error: new AuthenticationError({
                    errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                }),
            },
            {
                rule: validation.arrayContainsOnlyValidEntries,
                error: new AuthenticationError({
                    errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                }),
                args: [[validation.isNotNull, validation.isNotUndefined, validation.isNotEmpty, validation.isString]],
            },
        ],
        fieldName: "scope",
        value: scope,
    });
};

export default {
    isValidClientId,
    isValidAudience,
    isValidRedirectUri,
    isValidOptionalScope,
};
