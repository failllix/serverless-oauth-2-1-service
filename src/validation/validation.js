import AuthenticationError from "../error/authenticationError.js";

const isNotEmpty = (value) => {
    const notEmptyError = new Error("Must not be empty.");

    const type = typeof value;
    switch (type) {
        case "string":
            if (value !== "") {
                return true;
            }
            throw notEmptyError;
        case "object":
            if (value === null) {
                throw new Error("Must not be null or empty.");
            }

            if (Object.keys(value).length > 0) {
                return true;
            }
            throw notEmptyError;
        default:
            throw new Error(`Encountered unexpected type '${type}' while ensuring the field is not empty. Expected one of: 'string', 'object', 'array'.`);
    }
};

const isNotNull = (value) => {
    if (value !== null) {
        return true;
    }

    throw new Error("Must not be null.");
};

const isNotUndefined = (value) => {
    if (value !== undefined) {
        return true;
    }

    throw new Error("Must not be undefined.");
};

const isObject = (value) => {
    if (typeof value === "object" && !Array.isArray(value) && value !== null) {
        return true;
    }

    throw new Error("Must be an object.");
};

const isArray = (value) => {
    if (Array.isArray(value)) {
        return true;
    }

    throw new Error("Must be an array.");
};

const isString = (value) => {
    if (typeof value === "string") {
        return true;
    }

    throw new Error("Must be a String.");
};

const isInList = (value, list) => {
    if (list.includes(value)) {
        return true;
    }

    throw new Error(
        `Must be one of: ${Object.values(list)
            .map((value) => `'${value}'`)
            .join(", ")}.`,
    );
};

const matchesRegex = (value, regex) => {
    const matches = value.toString().match(regex);
    if (matches !== null) {
        return true;
    }

    throw new Error(`Did not match: ${regex}.`);
};

const sequentiallyMatchAllValidations = ({ validations, fieldName, value }) => {
    for (const { rule, args = [], error: authenticationError } of validations) {
        try {
            const result = rule.call(null, value, ...args);
            if (result !== true) {
                throw new AuthenticationError({
                    errorCategory: AuthenticationError.errrorCategories.SERVER_ERROR,
                    errorDescription: "Validation failed due to unexpected error.",
                });
            }
        } catch (validationError) {
            if (validationError instanceof AuthenticationError) {
                throw validationError;
            }
            authenticationError.errorDescription = `Value of parameter '${fieldName}' is not valid. Reason: ${validationError.message}`;
            throw authenticationError;
        }
    }
    return value;
};

const arrayContainsOnlyValidEntries = (value, rules) => {
    isArray(value);

    try {
        for (const element of value) {
            for (const rule of rules) {
                rule(element);
            }
        }
    } catch (error) {
        throw new Error(`Array contains invalid element. Reason for element: ${error.message}`);
    }

    return true;
};

export default {
    isNotEmpty,
    isNotNull,
    isNotUndefined,
    isObject,
    isArray,
    isString,
    isInList,
    matchesRegex,
    sequentiallyMatchAllValidations,
    arrayContainsOnlyValidEntries,
};
