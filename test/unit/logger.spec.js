import { describe } from "mocha";
import sinon from "sinon";

import logger from "../../src/logger.js";

describe("Logger", () => {
    beforeEach(() => {
        sinon.stub(console);
    });

    describe("logError", () => {
        it("should pass the error to the console for logging", () => {
            const expectedError = Object.freeze(new Error("The sadness"));
            logger.logError(expectedError);

            sinon.assert.calledOnceWithExactly(console.error, expectedError);
        });
    });

    describe("logMessage", () => {
        it("should pass the message to the console for logging", () => {
            logger.logMessage("Highly important");

            sinon.assert.calledOnceWithExactly(console.log, "Highly important");
        });
    });

    describe("logObject", () => {
        it("should pass the stringified object to the console and log with label ", () => {
            const expectedObject = Object.freeze({ nested: true });
            logger.logObject({ label: "someLabel", object: expectedObject });

            sinon.assert.calledOnceWithExactly(console.log, "someLabel:", JSON.stringify(expectedObject, null, 2));
        });
    });
});
