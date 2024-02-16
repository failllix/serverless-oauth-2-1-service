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

const sequentiallyMatchAllValidations = ({ validations, fieldName, value }) => {
    for (const validation of validations) {
        const result = validation.call(null, fieldName, value);
        if (result !== true) {
            throw new Error("Validation method returned unexpected result (not 'true')");
        }
    }
    return value;
};

export default {
    isNotEmpty,
    isNotNull,
    isNotUndefined,
    isObject,
    isArray,
    isString,
    sequentiallyMatchAllValidations,
};
