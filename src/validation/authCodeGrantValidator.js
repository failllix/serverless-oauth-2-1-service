import AuthenticationError from "../error/authenticationError.js";
import validation from "./validation.js";

const isValidResponseType = (responseType) => {
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
                args: [["code"]],
                error: new AuthenticationError({
                    errorCategory: AuthenticationError.errrorCategories.UNSUPPORTED_RESPONSE_TYPE,
                }),
            },
        ],
        fieldName: "response_type",
        value: responseType,
    });
};

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

const isValidScope = (scope) => {
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
                rule: validation.isArray,
                error: new AuthenticationError({
                    errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                }),
            },
        ],
        fieldName: "scope",
        value: scope,
    });
};

const isValidCodeChallenge = (codeChallenge) => {
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
        fieldName: "code_challenge",
        value: codeChallenge,
    });
};

const isValidCodeChallengeTransformMethod = (codeChallengeMethod) => {
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
                args: [["S256"]],
                error: new AuthenticationError({
                    errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                }),
            },
        ],
        fieldName: "code_challenge_method",
        value: codeChallengeMethod,
    });
};

export default {
    isValidResponseType,
    isValidRedirectUri,
    isValidClientId,
    isValidScope,
    isValidCodeChallenge,
    isValidCodeChallengeTransformMethod,
};
