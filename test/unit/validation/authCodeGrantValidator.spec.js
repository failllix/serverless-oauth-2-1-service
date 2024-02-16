import sinon from "sinon";
import authCodeGrantValidator from "../../../src/validation/authCodeGrantValidator.js";

import validation from "../../../src/validation/validation.js";

import { assert } from "chai";

describe("Auth code grant validator", () => {
    describe("isValidRedirectUri", () => {
        it("returns value, if sequentially asserted validations pass", () => {
            const sequentiallyMatchAllValidationsStub = sinon.stub(validation, "sequentiallyMatchAllValidations");

            sequentiallyMatchAllValidationsStub
                .withArgs({
                    fieldName: "redirect_uri",
                    value: "abc",
                    validations: [validation.isNotUndefined, validation.isNotNull, validation.isNotEmpty, validation.isString],
                })
                .returns("someValue");

            const result = authCodeGrantValidator.isValidRedirectUri("abc");

            assert.equal(result, "someValue");
            sinon.assert.calledOnce(sequentiallyMatchAllValidationsStub);
        });

        it("throws, if sequentially asserted validations throw error", () => {
            const sequentiallyMatchAllValidationsStub = sinon.stub(validation, "sequentiallyMatchAllValidations");

            const expectedError = new Error("Something did not pass validation");
            sequentiallyMatchAllValidationsStub
                .withArgs({
                    fieldName: "redirect_uri",
                    value: "abc",
                    validations: [validation.isNotUndefined, validation.isNotNull, validation.isNotEmpty, validation.isString],
                })
                .throws(expectedError);

            try {
                authCodeGrantValidator.isValidRedirectUri("abc");
                return Promise.reject("Function under test never threw an error");
            } catch (error) {
                assert.equal(error, expectedError);
                assert.deepEqual(error, new Error("Something did not pass validation"));
            }
        });
    });

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

            const result = authCodeGrantValidator.isValidUsername("john");

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
                authCodeGrantValidator.isValidUsername("john");
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

            const result = authCodeGrantValidator.isValidPassword("secret");

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
                authCodeGrantValidator.isValidPassword("secret");
                return Promise.reject("Function under test never threw an error");
            } catch (error) {
                assert.equal(error, expectedError);
                assert.deepEqual(error, new Error("Something did not pass validation"));
            }
        });
    });

    describe("isValidClientId", () => {
        it("returns value, if sequentially asserted validations pass", () => {
            const sequentiallyMatchAllValidationsStub = sinon.stub(validation, "sequentiallyMatchAllValidations");

            sequentiallyMatchAllValidationsStub
                .withArgs({
                    fieldName: "client_id",
                    value: "client",
                    validations: [validation.isNotUndefined, validation.isNotNull, validation.isNotEmpty, validation.isString],
                })
                .returns("someValue");

            const result = authCodeGrantValidator.isValidClientId("client");

            assert.equal(result, "someValue");
            sinon.assert.calledOnce(sequentiallyMatchAllValidationsStub);
        });

        it("throws, if sequentially asserted validations throw error", () => {
            const sequentiallyMatchAllValidationsStub = sinon.stub(validation, "sequentiallyMatchAllValidations");

            const expectedError = new Error("Something did not pass validation");
            sequentiallyMatchAllValidationsStub
                .withArgs({
                    fieldName: "client_id",
                    value: "client",
                    validations: [validation.isNotUndefined, validation.isNotNull, validation.isNotEmpty, validation.isString],
                })
                .throws(expectedError);

            try {
                authCodeGrantValidator.isValidClientId("client");
                return Promise.reject("Function under test never threw an error");
            } catch (error) {
                assert.equal(error, expectedError);
                assert.deepEqual(error, new Error("Something did not pass validation"));
            }
        });
    });

    describe("isValidScope", () => {
        it("returns value, if sequentially asserted validations pass", () => {
            const sequentiallyMatchAllValidationsStub = sinon.stub(validation, "sequentiallyMatchAllValidations");

            sequentiallyMatchAllValidationsStub
                .withArgs({
                    fieldName: "scope",
                    value: ["superpowers"],
                    validations: [validation.isNotUndefined, validation.isNotNull, validation.isNotEmpty, validation.isArray],
                })
                .returns("someValue");

            const result = authCodeGrantValidator.isValidScope(["superpowers"]);

            assert.equal(result, "someValue");
            sinon.assert.calledOnce(sequentiallyMatchAllValidationsStub);
        });

        it("throws, if sequentially asserted validations throw error", () => {
            const sequentiallyMatchAllValidationsStub = sinon.stub(validation, "sequentiallyMatchAllValidations");

            const expectedError = new Error("Something did not pass validation");
            sequentiallyMatchAllValidationsStub
                .withArgs({
                    fieldName: "scope",
                    value: ["superpowers"],
                    validations: [validation.isNotUndefined, validation.isNotNull, validation.isNotEmpty, validation.isArray],
                })
                .throws(expectedError);

            try {
                authCodeGrantValidator.isValidScope(["superpowers"]);
                return Promise.reject("Function under test never threw an error");
            } catch (error) {
                assert.equal(error, expectedError);
                assert.deepEqual(error, new Error("Something did not pass validation"));
            }
        });
    });
});
