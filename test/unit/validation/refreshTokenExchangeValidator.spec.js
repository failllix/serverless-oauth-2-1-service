import sinon from "sinon";
import AuthenticationError from "../../../src/error/authenticationError.js";
import refreshTokenExchangeValidator from "../../../src/validation/refreshTokenExchangeValidator.js";
import validation from "../../../src/validation/validation.js";

import { assert } from "chai";

describe("Refresh token exchange validator", () => {
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
                        {
                            rule: validation.matchesRegex,
                            args: [/^[a-zA-Z0-9_\.-]+\.[a-zA-Z0-9_\.-]+$/],
                            error: new AuthenticationError({
                                errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                            }),
                        },
                    ],
                })
                .returns("someValue");

            const result = refreshTokenExchangeValidator.isValidRefreshToken("buzz");

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
                        {
                            rule: validation.matchesRegex,
                            args: [/^[a-zA-Z0-9_\.-]+\.[a-zA-Z0-9_\.-]+$/],
                            error: new AuthenticationError({
                                errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                            }),
                        },
                    ],
                })
                .throws(expectedError);

            try {
                refreshTokenExchangeValidator.isValidRefreshToken("buzz");
                return Promise.reject("Function under test never threw an error");
            } catch (error) {
                assert.equal(error, expectedError);
                assert.deepEqual(error, new Error("Something did not pass validation"));
            }
        });
    });
});
