import validation from "./validation.js";

const isValidRedirectUri = async (redirectUri) => {
    return await validation.sequentiallyMatchAllValidations({
        validations: [validation.isNotUndefined, validation.isNotNull, validation.isNotEmpty, validation.isString],
        fieldName: "redirect_uri",
        value: redirectUri,
    });
};

const isValidUsername = async (username) => {
    return await validation.sequentiallyMatchAllValidations({
        validations: [validation.isNotUndefined, validation.isNotNull, validation.isNotEmpty, validation.isString],
        fieldName: "username",
        value: username,
    });
};

const isValidPassword = async (password) => {
    return await validation.sequentiallyMatchAllValidations({
        validations: [validation.isNotUndefined, validation.isNotNull, validation.isNotEmpty, validation.isString],
        fieldName: "password",
        value: password,
    });
};

const isValidClientId = async (clientId) => {
    return await validation.sequentiallyMatchAllValidations({
        validations: [validation.isNotUndefined, validation.isNotNull, validation.isNotEmpty, validation.isString],
        fieldName: "client_id",
        value: clientId,
    });
};

const isValidScope = async (scope) => {
    return await validation.sequentiallyMatchAllValidations({
        validations: [validation.isNotUndefined, validation.isNotNull, validation.isNotEmpty, validation.isArray],
        fieldName: "scope",
        value: scope,
    });
};

export default {
    isValidRedirectUri,
    isValidUsername,
    isValidPassword,
    isValidClientId,
    isValidScope,
};
