import validation from "./validation.js";

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

export default {
    isValidUsername,
    isValidPassword,
};
