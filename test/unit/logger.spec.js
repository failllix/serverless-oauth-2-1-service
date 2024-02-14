import { assert } from "chai";
import authCodeGrantHandler from "../../src/authCodeGrantHandler.js";
import sinon from "sinon";
import { describe } from "mocha";

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
      logger.logError("Highly important");

      sinon.assert.calledOnceWithExactly(console.error, "Highly important");
    });
  });

  describe("logObject", () => {
    it("should pass the object to the console for logging with depth 15", () => {
      const expectedObject = Object.freeze({ nested: true });
      logger.logObject(expectedObject);

      sinon.assert.calledOnceWithExactly(console.dir, expectedObject, {
        depth: 15,
      });
    });
  });
});
