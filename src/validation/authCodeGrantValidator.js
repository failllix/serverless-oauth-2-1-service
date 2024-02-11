import validation from "./validation.js";

const isValidRedirectUri = async (redirectUri) => {
    return await validation.sequentiallyMatchAllValidations({
        validations: [validation.isNotUndefined, validation.isNotNull, validation.isNotEmpty],
        fieldName: "redirect_uri",
        value: redirectUri,
    });
};

export default { isValidRedirectUri };
