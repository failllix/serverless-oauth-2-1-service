const logError = (error) => {
    console.error(error);
};

const logMessage = (message) => {
    console.log(message);
};

const logObject = ({ label, object }) => {
    console.log(label, JSON.stringify(object));
};

export default { logError, logMessage, logObject };
