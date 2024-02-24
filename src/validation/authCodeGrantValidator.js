import validation from "./validation.js";

const isValidResponseType = (responseType) => {
    return validation.sequentiallyMatchAllValidations({
        validations: [{ rule: validation.isNotUndefined }, { rule: validation.isNotNull }, { rule: validation.isNotEmpty }, { rule: validation.isString }, { rule: validation.isInList, args: [["code"]] }],
        fieldName: "response_type",
        value: responseType,
    });
};

const isValidRedirectUri = (redirectUri) => {
    return validation.sequentiallyMatchAllValidations({
        validations: [{ rule: validation.isNotUndefined }, { rule: validation.isNotNull }, { rule: validation.isNotEmpty }, { rule: validation.isString }],
        fieldName: "redirect_uri",
        value: redirectUri,
    });
};

const isValidClientId = (clientId) => {
    return validation.sequentiallyMatchAllValidations({
        validations: [{ rule: validation.isNotUndefined }, { rule: validation.isNotNull }, { rule: validation.isNotEmpty }, { rule: validation.isString }],
        fieldName: "client_id",
        value: clientId,
    });
};

const isValidScope = (scope) => {
    return validation.sequentiallyMatchAllValidations({
        validations: [{ rule: validation.isNotUndefined }, { rule: validation.isNotNull }, { rule: validation.isNotEmpty }, { rule: validation.isArray }],
        fieldName: "scope",
        value: scope,
    });
};

const isValidCodeChallenge = (codeChallenge) => {
    return validation.sequentiallyMatchAllValidations({
        validations: [{ rule: validation.isNotUndefined }, { rule: validation.isNotNull }, { rule: validation.isNotEmpty }, { rule: validation.isString }, { rule: validation.matchesRegex, args: [/^[a-zA-Z0-9_\.~-]{43,128}$/] }],
        fieldName: "code_challenge",
        value: codeChallenge,
    });
};

const isValidCodeChallengeTransformMethod = (codeChallengeMethod) => {
    return validation.sequentiallyMatchAllValidations({
        validations: [{ rule: validation.isNotUndefined }, { rule: validation.isNotNull }, { rule: validation.isNotEmpty }, { rule: validation.isString }, { rule: validation.isInList, args: [["S256"]] }],
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
