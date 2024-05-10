import { assert } from "chai";
import validation from "../../../src/validation/validation.js";

import sinon from "sinon";
import AuthenticationError from "../../../src/error/authenticationError.js";

describe("Validation", () => {
    describe("isNotEmpty", () => {
        it("passes for non-empty string values", () => {
            const result = validation.isNotEmpty("test", "something");
            assert.isTrue(result);
        });

        it("passes for non-empty objects", () => {
            const result = validation.isNotEmpty("test", { foo: "bar" });
            assert.isTrue(result);
        });

        it("passes for non-empty arrays", () => {
            const result = validation.isNotEmpty("test", ["something"]);
            assert.isTrue(result);
        });

        it("throws for empty strings", () => {
            try {
                validation.isNotEmpty("test", "");
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must not be empty.");
            }
        });

        it("throws for empty objects", () => {
            try {
                validation.isNotEmpty("test", {});
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must not be empty.");
            }
        });

        it("throws for empty arrays", () => {
            try {
                validation.isNotEmpty("test", []);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must not be empty.");
            }
        });

        it("throws for null values", () => {
            try {
                validation.isNotEmpty("test", null);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must not be null or empty.");
            }
        });

        it("throws for numbers", () => {
            try {
                validation.isNotEmpty("test", 5);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Encountered unexpected type 'number' while ensuring 'test' is not empty. Expected one of: 'string', 'object', 'array'.");
            }
        });

        it("throws for booleans", () => {
            try {
                validation.isNotEmpty("test", true);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Encountered unexpected type 'boolean' while ensuring 'test' is not empty. Expected one of: 'string', 'object', 'array'.");
            }
        });

        it("throws for undefined", () => {
            try {
                validation.isNotEmpty("test", undefined);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Encountered unexpected type 'undefined' while ensuring 'test' is not empty. Expected one of: 'string', 'object', 'array'.");
            }
        });
    });

    describe("isNotNull", () => {
        it("passes for non-null string values", () => {
            const result = validation.isNotNull("test", "something");
            assert.isTrue(result);
        });

        it("passes for non-null array values", () => {
            const result = validation.isNotNull("test", []);
            assert.isTrue(result);
        });

        it("passes for non-null object values", () => {
            const result = validation.isNotNull("test", {});
            assert.isTrue(result);
        });

        it("passes for non-null number values", () => {
            const result = validation.isNotNull("test", 5);
            assert.isTrue(result);
        });

        it("passes for undefined values", () => {
            const result = validation.isNotNull("test", undefined);
            assert.isTrue(result);
        });

        it("throws for null values", () => {
            try {
                validation.isNotNull("test", null);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must not be null.");
            }
        });
    });

    describe("isNotUndefined", () => {
        it("passes for non-undefined string values", () => {
            const result = validation.isNotUndefined("test", "something");
            assert.isTrue(result);
        });

        it("passes for non-undefined array values", () => {
            const result = validation.isNotUndefined("test", []);
            assert.isTrue(result);
        });

        it("passes for non-nuundefined object values", () => {
            const result = validation.isNotUndefined("test", {});
            assert.isTrue(result);
        });

        it("passes for non-nuundefined number values", () => {
            const result = validation.isNotUndefined("test", 5);
            assert.isTrue(result);
        });

        it("passes for null values", () => {
            const result = validation.isNotUndefined("test", null);
            assert.isTrue(result);
        });

        it("throws for undefined values", () => {
            try {
                validation.isNotUndefined("test", undefined);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must not be undefined.");
            }
        });
    });

    describe("isObject", () => {
        it("passes for empty objects", () => {
            const result = validation.isObject("test", {});
            assert.isTrue(result);
        });

        it("passes for objects", () => {
            const result = validation.isObject("test", {
                foo: "bar",
                buzz: 10,
                shizzle: ["foo"],
            });
            assert.isTrue(result);
        });

        it("passes for nested objects", () => {
            const result = validation.isObject("test", {
                nested: {
                    arr: [{ foo: "bar", shizzle: 42 }],
                },
            });
            assert.isTrue(result);
        });

        it("throws for string values", () => {
            try {
                validation.isObject("test", "something");
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must be an object.");
            }
        });

        it("throws for number values", () => {
            try {
                validation.isObject("test", 5);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must be an object.");
            }
        });

        it("throws for boolean values", () => {
            try {
                validation.isObject("test", false);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must be an object.");
            }
        });

        it("throws for null values", () => {
            try {
                validation.isObject("test", null);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must be an object.");
            }
        });

        it("throws for undefined values", () => {
            try {
                validation.isObject("test", undefined);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must be an object.");
            }
        });

        it("throws for array values", () => {
            try {
                validation.isObject("test", []);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must be an object.");
            }
        });

        it("throws for filled array values", () => {
            try {
                validation.isObject("test", ["someString", 5, true, false, undefined]);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must be an object.");
            }
        });
    });

    describe("isArray", () => {
        it("passes for empty arrays", () => {
            const result = validation.isArray("test", []);
            assert.isTrue(result);
        });

        it("passes for arrays", () => {
            const result = validation.isArray("test", ["some", "thing", 5, 12, false, true]);
            assert.isTrue(result);
        });

        it("passes for nested arrays", () => {
            const result = validation.isArray("test", [["a"], [["b"]], "12", 1, true, {}]);
            assert.isTrue(result);
        });

        it("throws for string values", () => {
            try {
                validation.isArray("test", "something");
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must be an array.");
            }
        });

        it("throws for number values", () => {
            try {
                validation.isArray("test", 5);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must be an array.");
            }
        });

        it("throws for boolean values", () => {
            try {
                validation.isArray("test", false);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must be an array.");
            }
        });

        it("throws for null values", () => {
            try {
                validation.isArray("test", null);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must be an array.");
            }
        });

        it("throws for undefined values", () => {
            try {
                validation.isArray("test", undefined);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must be an array.");
            }
        });

        it("throws for object values", () => {
            try {
                validation.isArray("test", {});
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must be an array.");
            }
        });

        it("throws for filled object values", () => {
            try {
                validation.isArray("test", { a: [] });
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must be an array.");
            }
        });
    });

    describe("isString", () => {
        it("passes for empty strings", () => {
            const result = validation.isString("test", "");
            assert.isTrue(result);
        });

        it("passes for strings", () => {
            const result = validation.isString("test", "something");
            assert.isTrue(result);
        });

        it("throws for number values", () => {
            try {
                validation.isString("test", 5);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must be a String.");
            }
        });

        it("throws for boolean values", () => {
            try {
                validation.isString("test", false);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must be a String.");
            }
        });

        it("throws for null values", () => {
            try {
                validation.isString("test", null);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must be a String.");
            }
        });

        it("throws for undefined values", () => {
            try {
                validation.isString("test", undefined);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must be a String.");
            }
        });

        it("throws for object values", () => {
            try {
                validation.isString("test", {});
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must be a String.");
            }
        });
    });

    describe("isInList", () => {
        it("passes for value in list", () => {
            const result = validation.isInList("test", "dummyValue", ["somethingElse", "dummyValue"]);
            assert.isTrue(result);
        });

        it("throws for string value not in list", () => {
            try {
                validation.isInList("test", "notDummy", ["somethingElse", "dummyValue"]);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must be one of: 'somethingElse', 'dummyValue'.");
            }
        });

        it("throws for number value not in list", () => {
            try {
                validation.isInList("test", 42, ["somethingElse", "dummyValue"]);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must be one of: 'somethingElse', 'dummyValue'.");
            }
        });
    });

    describe("matchesRegex", () => {
        it("passes for value matching regex", () => {
            const result = validation.matchesRegex("test", "something123", /^some[a-z]+[1-3]{3}$/);
            assert.isTrue(result);
        });

        it("passes for value casted as string matching regex", () => {
            const result = validation.matchesRegex("test", ["abc", 100], /^.+,[0-9]{3}$/);
            assert.isTrue(result);
        });

        it("throws for value not matching regex", () => {
            try {
                validation.matchesRegex("test", "notDummy", /^dummy$/);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' did not match: /^dummy$/.");
            }
        });

        it("throws for number not matching regex", () => {
            try {
                validation.matchesRegex("test", 425632, /^[0-9]{0,5}$/);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' did not match: /^[0-9]{0,5}$/.");
            }
        });
    });

    describe("sequentiallyMatchAllValidations", () => {
        it("calls all validations with field name, value and additional args and returns value if all validations resolve to true", () => {
            const validationStub1 = sinon.stub();
            const validationStub2 = sinon.stub();

            validationStub1.withArgs("field", 42).returns(true);
            validationStub2.withArgs("field", 42, "additionalString", 100, [{ anotherArray: true }]).returns(true);

            const result = validation.sequentiallyMatchAllValidations({
                validations: [
                    { rule: validationStub1 },
                    {
                        rule: validationStub2,
                        args: ["additionalString", 100, [{ anotherArray: true }]],
                    },
                ],
                fieldName: "field",
                value: 42,
            });

            assert.equal(result, 42);
            sinon.assert.calledOnce(validationStub1);
            sinon.assert.calledOnce(validationStub2);
        });

        it("calls only first validation with field name, value and additional args and throws if the first validation returns no boolean", () => {
            const validationStub1 = sinon.stub();
            const validationStub2 = sinon.stub();

            validationStub1.withArgs("field", 42, "additional").returns("true");

            try {
                validation.sequentiallyMatchAllValidations({
                    validations: [{ rule: validationStub1, args: ["additional"] }, { rule: validationStub2 }],
                    fieldName: "field",
                    value: 42,
                });
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.deepEqual(
                    error,
                    new AuthenticationError({
                        errorCategory: AuthenticationError.errrorCategories.SERVER_ERROR,
                        errorDescription: "Validation failed due to unexpected error.",
                    }),
                );
                sinon.assert.calledOnce(validationStub1);
                sinon.assert.notCalled(validationStub2);
            }
        });

        it("calls only first validation with field name, value and additional args and throws if the first validation returns false", () => {
            const validationStub1 = sinon.stub();
            const validationStub2 = sinon.stub();

            validationStub1.withArgs("field", 42, "additional").returns(false);

            try {
                validation.sequentiallyMatchAllValidations({
                    validations: [{ rule: validationStub1, args: ["additional"] }, { rule: validationStub2 }],
                    fieldName: "field",
                    value: 42,
                });
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.deepEqual(
                    error,
                    new AuthenticationError({
                        errorCategory: AuthenticationError.errrorCategories.SERVER_ERROR,
                        errorDescription: "Validation failed due to unexpected error.",
                    }),
                );
                sinon.assert.calledOnce(validationStub1);
                sinon.assert.notCalled(validationStub2);
            }
        });

        it("calls all validations with field name, value and additional args and throws if the second validation returns no boolean", () => {
            const validationStub1 = sinon.stub();
            const validationStub2 = sinon.stub();

            validationStub1.withArgs("field", 42).returns(true);
            validationStub2.withArgs("field", 42, 100).returns("true");

            try {
                validation.sequentiallyMatchAllValidations({
                    validations: [{ rule: validationStub1 }, { rule: validationStub2, args: [100] }],
                    fieldName: "field",
                    value: 42,
                });
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.deepEqual(
                    error,
                    new AuthenticationError({
                        errorCategory: AuthenticationError.errrorCategories.SERVER_ERROR,
                        errorDescription: "Validation failed due to unexpected error.",
                    }),
                );
                sinon.assert.calledOnce(validationStub1);
                sinon.assert.calledOnce(validationStub2);
            }
        });

        it("calls all validations with field name, value and additional args and throws if the second validation returns false", () => {
            const validationStub1 = sinon.stub();
            const validationStub2 = sinon.stub();

            validationStub1.withArgs("field", 42).returns(true);
            validationStub2.withArgs("field", 42, 100).returns(false);

            try {
                validation.sequentiallyMatchAllValidations({
                    validations: [{ rule: validationStub1 }, { rule: validationStub2, args: [100] }],
                    fieldName: "field",
                    value: 42,
                });
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.deepEqual(
                    error,
                    new AuthenticationError({
                        errorCategory: AuthenticationError.errrorCategories.SERVER_ERROR,
                        errorDescription: "Validation failed due to unexpected error.",
                    }),
                );
                sinon.assert.calledOnce(validationStub1);
                sinon.assert.calledOnce(validationStub2);
            }
        });

        it("calls only first validation with field name, value and additional args and throws enriched Authentication with correct message if the first validation throws error", () => {
            const validationStub1 = sinon.stub();
            const validationStub2 = sinon.stub();

            const validationError = new Error("I did not match");

            validationStub1.withArgs("field", 42, { something: "yey" }).throws(validationError);

            try {
                validation.sequentiallyMatchAllValidations({
                    validations: [
                        {
                            rule: validationStub1,
                            args: [{ something: "yey" }],
                            error: new AuthenticationError({
                                errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                            }),
                        },
                        { rule: validationStub2 },
                    ],
                    fieldName: "field",
                    value: 42,
                });
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.deepEqual(
                    error,
                    new AuthenticationError({
                        errorCategory: AuthenticationError.errrorCategories.INVALID_REQUEST,
                        errorDescription: "I did not match",
                    }),
                );
                sinon.assert.calledOnce(validationStub1);
                sinon.assert.notCalled(validationStub2);
            }
        });

        it("calls all validations with field name, value and additional args and throws if the second validation throws error", () => {
            const validationStub1 = sinon.stub();
            const validationStub2 = sinon.stub();

            const validationError = new Error("I did not match");

            validationStub1.withArgs("field", 42).returns(true);
            validationStub2.withArgs("field", 42, /regex/).throws(validationError);

            try {
                validation.sequentiallyMatchAllValidations({
                    validations: [
                        { rule: validationStub1 },
                        {
                            rule: validationStub2,
                            args: [/regex/],
                            error: new AuthenticationError({
                                errorCategory: AuthenticationError.errrorCategories.UNAUTHORIZED_CLIENT,
                            }),
                        },
                    ],
                    fieldName: "field",
                    value: 42,
                });
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.deepEqual(
                    error,
                    new AuthenticationError({
                        errorCategory: AuthenticationError.errrorCategories.UNAUTHORIZED_CLIENT,
                        errorDescription: "I did not match",
                    }),
                );

                sinon.assert.calledOnce(validationStub1);
                sinon.assert.calledOnce(validationStub2);
            }
        });
    });

    describe("arrayContainsOnlyValidEntries", () => {
        it("passes when array contains only valid elements", () => {
            const result = validation.arrayContainsOnlyValidEntries("test", ["someValue", "someOtherValue"], [(el) => ["someValue", "someOtherValue"].includes(el), (el) => el.startsWith("s")]);
            assert.isTrue(result);
        });

        for (const value of ["someValue", { someValue: true }, 100, true, false]) {
            it(`throws when value is no array (${JSON.stringify(value)})`, () => {
                try {
                    validation.arrayContainsOnlyValidEntries("test", value, [(el) => ["someValue", "someOtherValue"].includes(el), (el) => el.startsWith("s")]);
                    return Promise.reject(new Error("Function under test never threw Error."));
                } catch (error) {
                    assert.equal(error.message, "Parameter 'test' must be an array.");
                }
            });
        }

        it("throws wrapped error of failing validation rule", () => {
            const expectedError = Object.freeze(new Error("parameter 'abc' must not be invalid"));
            try {
                validation.arrayContainsOnlyValidEntries(
                    "test",
                    ["something"],
                    [
                        () => {
                            throw expectedError;
                        },
                    ],
                );
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' contains invalid element. Reason: Value of parameter 'abc' must not be invalid");
            }
        });
    });
});
