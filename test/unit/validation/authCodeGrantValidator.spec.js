import sinon from "sinon";
import authCodeGrantValidator from "../../../src/validation/authCodeGrantValidator.js";

import validation from "../../../src/validation/validation.js";

import { assert } from "chai";

describe("Auth code grant validator", () => {
  describe("isValidRedirectUri", () => {
    it("resolves to value, if sequentially asserted validations pass", async () => {
      const sequentiallyMatchAllValidationsStub = sinon.stub(
        validation,
        "sequentiallyMatchAllValidations"
      );

      sequentiallyMatchAllValidationsStub
        .withArgs({
          fieldName: "redirect_uri",
          value: "abc",
          validations: [
            validation.isNotUndefined,
            validation.isNotNull,
            validation.isNotEmpty,
            validation.isString,
          ],
        })
        .resolves("someValue");

      const result = await authCodeGrantValidator.isValidRedirectUri("abc");

      assert.equal(result, "someValue");
      sinon.assert.calledOnce(sequentiallyMatchAllValidationsStub);
    });

    it("throws, if sequentially asserted validations throw error", async () => {
      const sequentiallyMatchAllValidationsStub = sinon.stub(
        validation,
        "sequentiallyMatchAllValidations"
      );

      const expectedError = new Error("Something did not pass validation");
      sequentiallyMatchAllValidationsStub
        .withArgs({
          fieldName: "redirect_uri",
          value: "abc",
          validations: [
            validation.isNotUndefined,
            validation.isNotNull,
            validation.isNotEmpty,
            validation.isString,
          ],
        })
        .throws(expectedError);

      try {
        await authCodeGrantValidator.isValidRedirectUri("abc");
        return Promise.reject("Function under test never threw an error");
      } catch (error) {
        assert.equal(error, expectedError);
        assert.deepEqual(error, new Error("Something did not pass validation"));
      }
    });
  });

  describe("isValidUsername", () => {
    it("resolves to value, if sequentially asserted validations pass", async () => {
      const sequentiallyMatchAllValidationsStub = sinon.stub(
        validation,
        "sequentiallyMatchAllValidations"
      );

      sequentiallyMatchAllValidationsStub
        .withArgs({
          fieldName: "username",
          value: "john",
          validations: [
            validation.isNotUndefined,
            validation.isNotNull,
            validation.isNotEmpty,
            validation.isString,
          ],
        })
        .resolves("someValue");

      const result = await authCodeGrantValidator.isValidUsername("john");

      assert.equal(result, "someValue");
      sinon.assert.calledOnce(sequentiallyMatchAllValidationsStub);
    });

    it("throws, if sequentially asserted validations throw error", async () => {
      const sequentiallyMatchAllValidationsStub = sinon.stub(
        validation,
        "sequentiallyMatchAllValidations"
      );

      const expectedError = new Error("Something did not pass validation");
      sequentiallyMatchAllValidationsStub
        .withArgs({
          fieldName: "username",
          value: "john",
          validations: [
            validation.isNotUndefined,
            validation.isNotNull,
            validation.isNotEmpty,
            validation.isString,
          ],
        })
        .throws(expectedError);

      try {
        await authCodeGrantValidator.isValidUsername("john");
        return Promise.reject("Function under test never threw an error");
      } catch (error) {
        assert.equal(error, expectedError);
        assert.deepEqual(error, new Error("Something did not pass validation"));
      }
    });
  });

  describe("isValidPassword", () => {
    it("resolves to value, if sequentially asserted validations pass", async () => {
      const sequentiallyMatchAllValidationsStub = sinon.stub(
        validation,
        "sequentiallyMatchAllValidations"
      );

      sequentiallyMatchAllValidationsStub
        .withArgs({
          fieldName: "password",
          value: "secret",
          validations: [
            validation.isNotUndefined,
            validation.isNotNull,
            validation.isNotEmpty,
            validation.isString,
          ],
        })
        .resolves("someValue");

      const result = await authCodeGrantValidator.isValidPassword("secret");

      assert.equal(result, "someValue");
      sinon.assert.calledOnce(sequentiallyMatchAllValidationsStub);
    });

    it("throws, if sequentially asserted validations throw error", async () => {
      const sequentiallyMatchAllValidationsStub = sinon.stub(
        validation,
        "sequentiallyMatchAllValidations"
      );

      const expectedError = new Error("Something did not pass validation");
      sequentiallyMatchAllValidationsStub
        .withArgs({
          fieldName: "password",
          value: "secret",
          validations: [
            validation.isNotUndefined,
            validation.isNotNull,
            validation.isNotEmpty,
            validation.isString,
          ],
        })
        .throws(expectedError);

      try {
        await authCodeGrantValidator.isValidPassword("secret");
        return Promise.reject("Function under test never threw an error");
      } catch (error) {
        assert.equal(error, expectedError);
        assert.deepEqual(error, new Error("Something did not pass validation"));
      }
    });
  });

  describe("isValidClientId", () => {
    it("resolves to value, if sequentially asserted validations pass", async () => {
      const sequentiallyMatchAllValidationsStub = sinon.stub(
        validation,
        "sequentiallyMatchAllValidations"
      );

      sequentiallyMatchAllValidationsStub
        .withArgs({
          fieldName: "client_id",
          value: "client",
          validations: [
            validation.isNotUndefined,
            validation.isNotNull,
            validation.isNotEmpty,
            validation.isString,
          ],
        })
        .resolves("someValue");

      const result = await authCodeGrantValidator.isValidClientId("client");

      assert.equal(result, "someValue");
      sinon.assert.calledOnce(sequentiallyMatchAllValidationsStub);
    });

    it("throws, if sequentially asserted validations throw error", async () => {
      const sequentiallyMatchAllValidationsStub = sinon.stub(
        validation,
        "sequentiallyMatchAllValidations"
      );

      const expectedError = new Error("Something did not pass validation");
      sequentiallyMatchAllValidationsStub
        .withArgs({
          fieldName: "client_id",
          value: "client",
          validations: [
            validation.isNotUndefined,
            validation.isNotNull,
            validation.isNotEmpty,
            validation.isString,
          ],
        })
        .throws(expectedError);

      try {
        await authCodeGrantValidator.isValidClientId("client");
        return Promise.reject("Function under test never threw an error");
      } catch (error) {
        assert.equal(error, expectedError);
        assert.deepEqual(error, new Error("Something did not pass validation"));
      }
    });
  });

  describe("isValidScope", () => {
    it("resolves to value, if sequentially asserted validations pass", async () => {
      const sequentiallyMatchAllValidationsStub = sinon.stub(
        validation,
        "sequentiallyMatchAllValidations"
      );

      sequentiallyMatchAllValidationsStub
        .withArgs({
          fieldName: "scope",
          value: ["superpowers"],
          validations: [
            validation.isNotUndefined,
            validation.isNotNull,
            validation.isNotEmpty,
            validation.isArray,
          ],
        })
        .resolves("someValue");

      const result = await authCodeGrantValidator.isValidScope(["superpowers"]);

      assert.equal(result, "someValue");
      sinon.assert.calledOnce(sequentiallyMatchAllValidationsStub);
    });

    it("throws, if sequentially asserted validations throw error", async () => {
      const sequentiallyMatchAllValidationsStub = sinon.stub(
        validation,
        "sequentiallyMatchAllValidations"
      );

      const expectedError = new Error("Something did not pass validation");
      sequentiallyMatchAllValidationsStub
        .withArgs({
          fieldName: "scope",
          value: ["superpowers"],
          validations: [
            validation.isNotUndefined,
            validation.isNotNull,
            validation.isNotEmpty,
            validation.isArray,
          ],
        })
        .throws(expectedError);

      try {
        await authCodeGrantValidator.isValidScope(["superpowers"]);
        return Promise.reject("Function under test never threw an error");
      } catch (error) {
        assert.equal(error, expectedError);
        assert.deepEqual(error, new Error("Something did not pass validation"));
      }
    });
  });
});
