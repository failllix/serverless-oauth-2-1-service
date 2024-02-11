import { assert } from "chai";
import validation from "../../../src/validation/validation.js";

import sinon from "sinon";

describe("Validation", () => {
    describe("isNotEmpty", () => {
        it("resolves for non-empty string values", async () => {
            const result = await validation.isNotEmpty("test", "something");
            assert.isTrue(result);
        });

        it("resolves for non-empty objects", async () => {
            const result = await validation.isNotEmpty("test", { foo: "bar" });
            assert.isTrue(result);
        });

        it("resolves for non-empty arrays", async () => {
            const result = await validation.isNotEmpty("test", ["something"]);
            assert.isTrue(result);
        });

        it("rejects empty strings", async () => {
            try {
                await validation.isNotEmpty("test", "");
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must not be empty.");
            }
        });

        it("rejects empty objects", async () => {
            try {
                await validation.isNotEmpty("test", {});
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must not be empty.");
            }
        });

        it("rejects empty arrays", async () => {
            try {
                await validation.isNotEmpty("test", []);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must not be empty.");
            }
        });

        it("rejects null values", async () => {
            try {
                await validation.isNotEmpty("test", null);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must not be null or empty.");
            }
        });

        it("rejects numbers", async () => {
            try {
                await validation.isNotEmpty("test", 5);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Encountered unexpected type 'number' while validating 'test' is not empty.");
            }
        });

        it("rejects booleans", async () => {
            try {
                await validation.isNotEmpty("test", true);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Encountered unexpected type 'boolean' while validating 'test' is not empty.");
            }
        });

        it("rejects undefined", async () => {
            try {
                await validation.isNotEmpty("test", undefined);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Encountered unexpected type 'undefined' while validating 'test' is not empty.");
            }
        });
    });

    describe("isNotNull", () => {
        it("resolves for non-null string values", async () => {
            const result = await validation.isNotNull("test", "something");
            assert.isTrue(result);
        });

        it("resolves for non-null array values", async () => {
            const result = await validation.isNotNull("test", []);
            assert.isTrue(result);
        });

        it("resolves for non-null object values", async () => {
            const result = await validation.isNotNull("test", {});
            assert.isTrue(result);
        });

        it("resolves for non-null number values", async () => {
            const result = await validation.isNotNull("test", 5);
            assert.isTrue(result);
        });

        it("resolves for undefined values", async () => {
            const result = await validation.isNotNull("test", undefined);
            assert.isTrue(result);
        });

        it("rejects null values", async () => {
            try {
                await validation.isNotNull("test", null);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must not be null.");
            }
        });
    });

    describe("isNotUndefined", () => {
        it("resolves for non-undefined string values", async () => {
            const result = await validation.isNotUndefined("test", "something");
            assert.isTrue(result);
        });

        it("resolves for non-undefined array values", async () => {
            const result = await validation.isNotUndefined("test", []);
            assert.isTrue(result);
        });

        it("resolves for non-nuundefined object values", async () => {
            const result = await validation.isNotUndefined("test", {});
            assert.isTrue(result);
        });

        it("resolves for non-nuundefined number values", async () => {
            const result = await validation.isNotUndefined("test", 5);
            assert.isTrue(result);
        });

        it("resolves for null values", async () => {
            const result = await validation.isNotUndefined("test", null);
            assert.isTrue(result);
        });

        it("rejects undefined values", async () => {
            try {
                await validation.isNotUndefined("test", undefined);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must not be undefined.");
            }
        });
    });

    describe("isObject", () => {
        it("resolves for empty objects", async () => {
            const result = await validation.isObject("test", {});
            assert.isTrue(result);
        });

        it("resolves for objects", async () => {
            const result = await validation.isObject("test", {
                foo: "bar",
                buzz: 10,
                shizzle: ["foo"],
            });
            assert.isTrue(result);
        });

        it("resolves for nested objects", async () => {
            const result = await validation.isObject("test", {
                nested: {
                    arr: [{ foo: "bar", shizzle: 42 }],
                },
            });
            assert.isTrue(result);
        });

        it("rejects string values", async () => {
            try {
                await validation.isObject("test", "something");
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must be an object.");
            }
        });

        it("rejects number values", async () => {
            try {
                await validation.isObject("test", 5);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must be an object.");
            }
        });

        it("rejects boolean values", async () => {
            try {
                await validation.isObject("test", false);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must be an object.");
            }
        });

        it("rejects null values", async () => {
            try {
                await validation.isObject("test", null);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must be an object.");
            }
        });

        it("rejects undefined values", async () => {
            try {
                await validation.isObject("test", undefined);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must be an object.");
            }
        });

        it("rejects array values", async () => {
            try {
                await validation.isObject("test", []);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must be an object.");
            }
        });

        it("rejects filled array values", async () => {
            try {
                await validation.isObject("test", ["someString", 5, true, false, undefined]);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must be an object.");
            }
        });
    });

    describe("isArray", () => {
        it("resolves for empty arrays", async () => {
            const result = await validation.isArray("test", []);
            assert.isTrue(result);
        });

        it("resolves for arrays", async () => {
            const result = await validation.isArray("test", ["some", "thing", 5, 12, false, true]);
            assert.isTrue(result);
        });

        it("resolves for nested arrays", async () => {
            const result = await validation.isArray("test", [["a"], [["b"]], "12", 1, true, {}]);
            assert.isTrue(result);
        });

        it("rejects string values", async () => {
            try {
                await validation.isArray("test", "something");
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must be an array.");
            }
        });

        it("rejects number values", async () => {
            try {
                await validation.isArray("test", 5);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must be an array.");
            }
        });

        it("rejects boolean values", async () => {
            try {
                await validation.isArray("test", false);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must be an array.");
            }
        });

        it("rejects null values", async () => {
            try {
                await validation.isArray("test", null);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must be an array.");
            }
        });

        it("rejects undefined values", async () => {
            try {
                await validation.isArray("test", undefined);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must be an array.");
            }
        });

        it("rejects object values", async () => {
            try {
                await validation.isArray("test", {});
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must be an array.");
            }
        });

        it("rejects filled object values", async () => {
            try {
                await validation.isArray("test", { a: [] });
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must be an array.");
            }
        });
    });

    describe("isString", () => {
        it("resolves for empty strings", async () => {
            const result = await validation.isString("test", "");
            assert.isTrue(result);
        });

        it("resolves for strings", async () => {
            const result = await validation.isString("test", "something");
            assert.isTrue(result);
        });

        it("rejects number values", async () => {
            try {
                await validation.isString("test", 5);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must be a String.");
            }
        });

        it("rejects boolean values", async () => {
            try {
                await validation.isString("test", false);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must be a String.");
            }
        });

        it("rejects null values", async () => {
            try {
                await validation.isString("test", null);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must be a String.");
            }
        });

        it("rejects undefined values", async () => {
            try {
                await validation.isString("test", undefined);
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must be a String.");
            }
        });

        it("rejects object values", async () => {
            try {
                await validation.isString("test", {});
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Parameter 'test' must be a String.");
            }
        });
    });

    describe("sequentiallyMatchAllValidations", () => {
        it("calls all validations with field name and value and returns value if all validations resolve to true", async () => {
            const validationStub1 = sinon.stub();
            const validationStub2 = sinon.stub();

            validationStub1.withArgs("field", 42).resolves(true);
            validationStub2.withArgs("field", 42).resolves(true);

            const result = await validation.sequentiallyMatchAllValidations({
                validations: [validationStub1, validationStub2],
                fieldName: "field",
                value: 42,
            });

            assert.equal(result, 42);
            sinon.assert.calledOnce(validationStub1);
            sinon.assert.calledOnce(validationStub2);
        });

        it("calls only first validation with field name and value and throws if the first validation returns something else than true", async () => {
            const validationStub1 = sinon.stub();
            const validationStub2 = sinon.stub();

            validationStub1.withArgs("field", 42).resolves("true");

            try {
                await validation.sequentiallyMatchAllValidations({
                    validations: [validationStub1, validationStub2],
                    fieldName: "field",
                    value: 42,
                });
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Validation method returned unexpected result (not 'true')");
                sinon.assert.calledOnce(validationStub1);
                sinon.assert.notCalled(validationStub2);
            }
        });

        it("calls all validations with field name and value and throws if the second validation returns something else than true", async () => {
            const validationStub1 = sinon.stub();
            const validationStub2 = sinon.stub();

            validationStub1.withArgs("field", 42).resolves(true);
            validationStub2.withArgs("field", 42).resolves("true");

            try {
                await validation.sequentiallyMatchAllValidations({
                    validations: [validationStub1, validationStub2],
                    fieldName: "field",
                    value: 42,
                });
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error.message, "Validation method returned unexpected result (not 'true')");
                sinon.assert.calledOnce(validationStub1);
                sinon.assert.calledOnce(validationStub2);
            }
        });

        it("calls only first validation with field name and value and throws if the first validation throws error", async () => {
            const validationStub1 = sinon.stub();
            const validationStub2 = sinon.stub();

            const expectedError = new Error("I did not match");

            validationStub1.withArgs("field", 42).throws(expectedError);

            try {
                await validation.sequentiallyMatchAllValidations({
                    validations: [validationStub1, validationStub2],
                    fieldName: "field",
                    value: 42,
                });
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error, expectedError);
                assert.deepEqual(error, new Error("I did not match"));

                sinon.assert.calledOnce(validationStub1);
                sinon.assert.notCalled(validationStub2);
            }
        });

        it("calls all validations with field name and value and throws if the second validation throws error", async () => {
            const validationStub1 = sinon.stub();
            const validationStub2 = sinon.stub();

            const expectedError = new Error("I did not match");

            validationStub1.withArgs("field", 42).resolves(true);
            validationStub2.withArgs("field", 42).throws(expectedError);

            try {
                await validation.sequentiallyMatchAllValidations({
                    validations: [validationStub1, validationStub2],
                    fieldName: "field",
                    value: 42,
                });
                return Promise.reject(new Error("Function under test never threw Error."));
            } catch (error) {
                assert.equal(error, expectedError);
                assert.deepEqual(error, new Error("I did not match"));

                sinon.assert.calledOnce(validationStub1);
                sinon.assert.calledOnce(validationStub2);
            }
        });
    });
});
