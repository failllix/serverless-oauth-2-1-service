import AuthenticationError from "../error/authenticationError.js";

const isNotEmpty = (fieldName, value) => {
    const notEmptyError = new Error(`Parameter '${fieldName}' must not be empty.`);

    const type = typeof value;
    switch (type) {
        case "string":
            if (value !== "") {
                return true;
            }
            throw notEmptyError;
        case "object":
            if (value === null) {
                throw new Error(`Parameter '${fieldName}' must not be null or empty.`);
            }

            if (Object.keys(value).length > 0) {
                return true;
            }
            throw notEmptyError;
        default:
            throw new Error(`Encountered unexpected type '${type}' while ensuring '${fieldName}' is not empty. Expected one of: 'string', 'object', 'array'.`);
    }
};

const isNotNull = (fieldName, value) => {
    if (value !== null) {
        return true;
    }

    throw new Error(`Parameter '${fieldName}' must not be null.`);
};

const isNotUndefined = (fieldName, value) => {
    if (value !== undefined) {
        return true;
    }

    throw new Error(`Parameter '${fieldName}' must not be undefined.`);
};

const isObject = (fieldName, value) => {
    if (typeof value === "object" && !Array.isArray(value) && value !== null) {
        return true;
    }

    throw new Error(`Parameter '${fieldName}' must be an object.`);
};

const isArray = (fieldName, value) => {
    if (Array.isArray(value)) {
        return true;
    }

    throw new Error(`Parameter '${fieldName}' must be an array.`);
};

const isString = (fieldName, value) => {
    if (typeof value === "string") {
        return true;
    }

    throw new Error(`Parameter '${fieldName}' must be a String.`);
};

const isInList = (fieldName, value, list) => {
    if (list.includes(value)) {
        return true;
    }

    throw new Error(
        `Parameter '${fieldName}' must be one of: ${Object.values(list)
            .map((value) => `'${value}'`)
            .join(", ")}.`,
    );
};

const matchesRegex = (fieldName, value, regex) => {
    const matches = value.toString().match(regex);
    if (matches !== null) {
        return true;
    }

    throw new Error(`Parameter '${fieldName}' did not match: ${regex}.`);
};

const sequentiallyMatchAllValidations = ({ validations, fieldName, value }) => {
    for (const { rule, args = [], error: authenticationError } of validations) {
        try {
            const result = rule.call(null, fieldName, value, ...args);
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
            authenticationError.errorDescription = validationError.message;
            throw authenticationError;
        }
    }
    return value;
};

const arrayContainsOnlyValidEntries = (fieldName, value, rules) => {
    isArray(fieldName, value);

    try {
        for (const element of value) {
            for (const rule of rules) {
                rule(fieldName, element);
            }
        }
    } catch (error) {
        throw new Error(`Parameter '${fieldName}' contains invalid element. Reason: Value of ${error.message}`);
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
