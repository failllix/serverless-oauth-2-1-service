import AuthenticationError from "../error/authenticationError.js";
import validation from "./validation.js";

const isValidRefreshToken = (refreshToken) => {
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
                args: [/^[a-zA-Z0-9_\.-]+\.[a-zA-Z0-9_\.-]+$/],
                error: new AuthenticationError({
                    errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                }),
            },
        ],
        fieldName: "refresh_token",
        value: refreshToken,
    });
};

export default {
    isValidRefreshToken,
};
