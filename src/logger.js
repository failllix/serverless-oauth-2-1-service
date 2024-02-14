const logError = (error) => {
    console.error(error);
};

const logMessage = (message) => {
    console.log(message);
};

const logObject = (object) => {
    console.dir(object, { depth: 15 });
};

export default { logError, logMessage, logObject };
