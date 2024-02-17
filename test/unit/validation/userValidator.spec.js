import sinon from "sinon";
import userValidator from "../../../src/validation/userValidator.js";

import validation from "../../../src/validation/validation.js";

import { assert } from "chai";

describe("User validator", () => {
    describe("isValidUsername", () => {
        it("returns value, if sequentially asserted validations pass", () => {
            const sequentiallyMatchAllValidationsStub = sinon.stub(validation, "sequentiallyMatchAllValidations");

            sequentiallyMatchAllValidationsStub
                .withArgs({
                    fieldName: "username",
                    value: "john",
                    validations: [validation.isNotUndefined, validation.isNotNull, validation.isNotEmpty, validation.isString],
                })
                .returns("someValue");

            const result = userValidator.isValidUsername("john");

            assert.equal(result, "someValue");
            sinon.assert.calledOnce(sequentiallyMatchAllValidationsStub);
        });

        it("throws, if sequentially asserted validations throw error", () => {
            const sequentiallyMatchAllValidationsStub = sinon.stub(validation, "sequentiallyMatchAllValidations");

            const expectedError = new Error("Something did not pass validation");
            sequentiallyMatchAllValidationsStub
                .withArgs({
                    fieldName: "username",
                    value: "john",
                    validations: [validation.isNotUndefined, validation.isNotNull, validation.isNotEmpty, validation.isString],
                })
                .throws(expectedError);

            try {
                userValidator.isValidUsername("john");
                return Promise.reject("Function under test never threw an error");
            } catch (error) {
                assert.equal(error, expectedError);
                assert.deepEqual(error, new Error("Something did not pass validation"));
            }
        });
    });

    describe("isValidPassword", () => {
        it("returns value, if sequentially asserted validations pass", () => {
            const sequentiallyMatchAllValidationsStub = sinon.stub(validation, "sequentiallyMatchAllValidations");

            sequentiallyMatchAllValidationsStub
                .withArgs({
                    fieldName: "password",
                    value: "secret",
                    validations: [validation.isNotUndefined, validation.isNotNull, validation.isNotEmpty, validation.isString],
                })
                .returns("someValue");

            const result = userValidator.isValidPassword("secret");

            assert.equal(result, "someValue");
            sinon.assert.calledOnce(sequentiallyMatchAllValidationsStub);
        });

        it("throws, if sequentially asserted validations throw error", () => {
            const sequentiallyMatchAllValidationsStub = sinon.stub(validation, "sequentiallyMatchAllValidations");

            const expectedError = new Error("Something did not pass validation");
            sequentiallyMatchAllValidationsStub
                .withArgs({
                    fieldName: "password",
                    value: "secret",
                    validations: [validation.isNotUndefined, validation.isNotNull, validation.isNotEmpty, validation.isString],
                })
                .throws(expectedError);

            try {
                userValidator.isValidPassword("secret");
                return Promise.reject("Function under test never threw an error");
            } catch (error) {
                assert.equal(error, expectedError);
                assert.deepEqual(error, new Error("Something did not pass validation"));
            }
        });
    });
});
