import sinon from "sinon";
import AuthenticationError from "../../../src/error/authenticationError.js";
import tokenExchangeValidator from "../../../src/validation/tokenExchangeValidator.js";
import validation from "../../../src/validation/validation.js";

import { assert } from "chai";

describe("Token exchange validator", () => {
    describe("isValidAccessCode", () => {
        it("returns value, if sequentially asserted validations pass", () => {
            const sequentiallyMatchAllValidationsStub = sinon.stub(validation, "sequentiallyMatchAllValidations");

            sequentiallyMatchAllValidationsStub
                .withArgs({
                    fieldName: "access_code",
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

            const result = tokenExchangeValidator.isValidAccessCode("abc");

            assert.equal(result, "someValue");
            sinon.assert.calledOnce(sequentiallyMatchAllValidationsStub);
        });

        it("throws, if sequentially asserted validations throw error", () => {
            const sequentiallyMatchAllValidationsStub = sinon.stub(validation, "sequentiallyMatchAllValidations");

            const expectedError = new Error("Something did not pass validation");
            sequentiallyMatchAllValidationsStub
                .withArgs({
                    fieldName: "access_code",
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
                tokenExchangeValidator.isValidAccessCode("abc");
                return Promise.reject("Function under test never threw an error");
            } catch (error) {
                assert.equal(error, expectedError);
                assert.deepEqual(error, new Error("Something did not pass validation"));
            }
        });
    });

    describe("isValidGrantType", () => {
        it("returns value, if sequentially asserted validations pass", () => {
            const sequentiallyMatchAllValidationsStub = sinon.stub(validation, "sequentiallyMatchAllValidations");

            sequentiallyMatchAllValidationsStub
                .withArgs({
                    fieldName: "grant_type",
                    value: "foo",
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
                        {
                            rule: validation.isInList,
                            args: [["authorization_code", "refresh_token"]],
                            error: new AuthenticationError({
                                errorCategory: AuthenticationError.errrorCategories.UNSUPPORTED_GRANT_TYPE,
                            }),
                        },
                    ],
                })
                .returns("someValue");

            const result = tokenExchangeValidator.isValidGrantType("foo");

            assert.equal(result, "someValue");
            sinon.assert.calledOnce(sequentiallyMatchAllValidationsStub);
        });

        it("throws, if sequentially asserted validations throw error", () => {
            const sequentiallyMatchAllValidationsStub = sinon.stub(validation, "sequentiallyMatchAllValidations");

            const expectedError = new Error("Something did not pass validation");
            sequentiallyMatchAllValidationsStub
                .withArgs({
                    fieldName: "grant_type",
                    value: "foo",
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
                        {
                            rule: validation.isInList,
                            args: [["authorization_code", "refresh_token"]],
                            error: new AuthenticationError({
                                errorCategory: AuthenticationError.errrorCategories.UNSUPPORTED_GRANT_TYPE,
                            }),
                        },
                    ],
                })
                .throws(expectedError);

            try {
                tokenExchangeValidator.isValidGrantType("foo");
                return Promise.reject("Function under test never threw an error");
            } catch (error) {
                assert.equal(error, expectedError);
                assert.deepEqual(error, new Error("Something did not pass validation"));
            }
        });
    });

    describe("isValidCodeVerifier", () => {
        it("returns value, if sequentially asserted validations pass", () => {
            const sequentiallyMatchAllValidationsStub = sinon.stub(validation, "sequentiallyMatchAllValidations");

            sequentiallyMatchAllValidationsStub
                .withArgs({
                    fieldName: "code_verifier",
                    value: "bar",
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
                        {
                            rule: validation.matchesRegex,
                            args: [/^[a-zA-Z0-9_\.~-]{43,128}$/],
                            error: new AuthenticationError({
                                errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                            }),
                        },
                    ],
                })
                .returns("someValue");

            const result = tokenExchangeValidator.isValidCodeVerifier("bar");

            assert.equal(result, "someValue");
            sinon.assert.calledOnce(sequentiallyMatchAllValidationsStub);
        });

        it("throws, if sequentially asserted validations throw error", () => {
            const sequentiallyMatchAllValidationsStub = sinon.stub(validation, "sequentiallyMatchAllValidations");

            const expectedError = new Error("Something did not pass validation");
            sequentiallyMatchAllValidationsStub
                .withArgs({
                    fieldName: "code_verifier",
                    value: "bar",
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
                        {
                            rule: validation.matchesRegex,
                            args: [/^[a-zA-Z0-9_\.~-]{43,128}$/],
                            error: new AuthenticationError({
                                errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                            }),
                        },
                    ],
                })
                .throws(expectedError);

            try {
                tokenExchangeValidator.isValidCodeVerifier("bar");
                return Promise.reject("Function under test never threw an error");
            } catch (error) {
                assert.equal(error, expectedError);
                assert.deepEqual(error, new Error("Something did not pass validation"));
            }
        });
    });

    describe("isValidRefreshToken", () => {
        it("returns value, if sequentially asserted validations pass", () => {
            const sequentiallyMatchAllValidationsStub = sinon.stub(validation, "sequentiallyMatchAllValidations");

            sequentiallyMatchAllValidationsStub
                .withArgs({
                    fieldName: "refresh_token",
                    value: "buzz",
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

            const result = tokenExchangeValidator.isValidRefreshToken("buzz");

            assert.equal(result, "someValue");
            sinon.assert.calledOnce(sequentiallyMatchAllValidationsStub);
        });

        it("throws, if sequentially asserted validations throw error", () => {
            const sequentiallyMatchAllValidationsStub = sinon.stub(validation, "sequentiallyMatchAllValidations");

            const expectedError = new Error("Something did not pass validation");
            sequentiallyMatchAllValidationsStub
                .withArgs({
                    fieldName: "refresh_token",
                    value: "buzz",
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
                tokenExchangeValidator.isValidRefreshToken("buzz");
                return Promise.reject("Function under test never threw an error");
            } catch (error) {
                assert.equal(error, expectedError);
                assert.deepEqual(error, new Error("Something did not pass validation"));
            }
        });
    });
});
