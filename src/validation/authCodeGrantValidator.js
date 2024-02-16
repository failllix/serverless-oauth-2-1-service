import validation from "./validation.js";

const isValidRedirectUri = (redirectUri) => {
    return validation.sequentiallyMatchAllValidations({
        validations: [validation.isNotUndefined, validation.isNotNull, validation.isNotEmpty, validation.isString],
        fieldName: "redirect_uri",
        value: redirectUri,
    });
};

const isValidUsername = (username) => {
    return validation.sequentiallyMatchAllValidations({
        validations: [validation.isNotUndefined, validation.isNotNull, validation.isNotEmpty, validation.isString],
        fieldName: "username",
        value: username,
    });
};

const isValidPassword = (password) => {
    return validation.sequentiallyMatchAllValidations({
        validations: [validation.isNotUndefined, validation.isNotNull, validation.isNotEmpty, validation.isString],
        fieldName: "password",
        value: password,
    });
};

const isValidClientId = (clientId) => {
    return validation.sequentiallyMatchAllValidations({
        validations: [validation.isNotUndefined, validation.isNotNull, validation.isNotEmpty, validation.isString],
        fieldName: "client_id",
        value: clientId,
    });
};

const isValidScope = (scope) => {
    return validation.sequentiallyMatchAllValidations({
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
