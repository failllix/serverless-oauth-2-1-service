import sinon from "sinon";
import AuthenticationError from "../../../src/error/authenticationError.js";
import sharedValidator from "../../../src/validation/sharedValidator.js";
import validation from "../../../src/validation/validation.js";

import { assert } from "chai";

describe("Shared validator", () => {
    describe("isValidRedirectUri", () => {
        it("returns value, if sequentially asserted validations pass", () => {
            const sequentiallyMatchAllValidationsStub = sinon.stub(validation, "sequentiallyMatchAllValidations");

            sequentiallyMatchAllValidationsStub
                .withArgs({
                    fieldName: "redirect_uri",
                    value: "abc",
                    validations: [
                        {
                            rule: validation.isNotUndefined,
                            error: new AuthenticationError({
                                errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                            }),
                        },
                        {
                            rule: validation.isNotNull,
                            error: new AuthenticationError({
                                errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                            }),
                        },
                        {
                            rule: validation.isNotEmpty,
                            error: new AuthenticationError({
                                errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                            }),
                        },
                        {
                            rule: validation.isString,
                            error: new AuthenticationError({
                                errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                            }),
                        },
                    ],
                })
                .returns("someValue");

            const result = sharedValidator.isValidRedirectUri("abc");

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
                    validations: [
                        {
                            rule: validation.isNotUndefined,
                            error: new AuthenticationError({
                                errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                            }),
                        },
                        {
                            rule: validation.isNotNull,
                            error: new AuthenticationError({
                                errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                            }),
                        },
                        {
                            rule: validation.isNotEmpty,
                            error: new AuthenticationError({
                                errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                            }),
                        },
                        {
                            rule: validation.isString,
                            error: new AuthenticationError({
                                errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                            }),
                        },
                    ],
                })
                .throws(expectedError);

            try {
                sharedValidator.isValidRedirectUri("abc");
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
                    validations: [
                        {
                            rule: validation.isNotUndefined,
                            error: new AuthenticationError({
                                errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                            }),
                        },
                        {
                            rule: validation.isNotNull,
                            error: new AuthenticationError({
                                errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                            }),
                        },
                        {
                            rule: validation.isNotEmpty,
                            error: new AuthenticationError({
                                errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                            }),
                        },
                        {
                            rule: validation.isString,
                            error: new AuthenticationError({
                                errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                            }),
                        },
                    ],
                })
                .returns("someValue");

            const result = sharedValidator.isValidClientId("client");

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
                    validations: [
                        {
                            rule: validation.isNotUndefined,
                            error: new AuthenticationError({
                                errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                            }),
                        },
                        {
                            rule: validation.isNotNull,
                            error: new AuthenticationError({
                                errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                            }),
                        },
                        {
                            rule: validation.isNotEmpty,
                            error: new AuthenticationError({
                                errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                            }),
                        },
                        {
                            rule: validation.isString,
                            error: new AuthenticationError({
                                errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                            }),
                        },
                    ],
                })
                .throws(expectedError);

            try {
                sharedValidator.isValidClientId("client");
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
                    validations: [
                        {
                            rule: validation.isNotUndefined,
                            error: new AuthenticationError({
                                errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                            }),
                        },
                        {
                            rule: validation.isNotNull,
                            error: new AuthenticationError({
                                errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                            }),
                        },
                        {
                            rule: validation.isNotEmpty,
                            error: new AuthenticationError({
                                errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                            }),
                        },
                        {
                            rule: validation.isArray,
                            error: new AuthenticationError({
                                errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                            }),
                        },
                    ],
                })
                .returns("someValue");

            const result = sharedValidator.isValidScope(["superpowers"]);

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
                    validations: [
                        {
                            rule: validation.isNotUndefined,
                            error: new AuthenticationError({
                                errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                            }),
                        },
                        {
                            rule: validation.isNotNull,
                            error: new AuthenticationError({
                                errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                            }),
                        },
                        {
                            rule: validation.isNotEmpty,
                            error: new AuthenticationError({
                                errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                            }),
                        },
                        {
                            rule: validation.isArray,
                            error: new AuthenticationError({
                                errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                            }),
                        },
                    ],
                })
                .throws(expectedError);

            try {
                sharedValidator.isValidScope(["superpowers"]);
                return Promise.reject("Function under test never threw an error");
            } catch (error) {
                assert.equal(error, expectedError);
                assert.deepEqual(error, new Error("Something did not pass validation"));
            }
        });
    });
});
