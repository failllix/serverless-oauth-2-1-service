import sinon from "sinon";
import authCodeGrantValidator from "../../../src/validation/authCodeGrantValidator.js";

import validation from "../../../src/validation/validation.js";

import { assert } from "chai";

describe("Auth code grant validator", () => {
    describe("isValidResponseType", () => {
        it("returns value, if sequentially asserted validations pass", () => {
            const sequentiallyMatchAllValidationsStub = sinon.stub(validation, "sequentiallyMatchAllValidations");

            sequentiallyMatchAllValidationsStub
                .withArgs({
                    fieldName: "response_type",
                    value: "abc",
                    validations: [{ rule: validation.isNotUndefined }, { rule: validation.isNotNull }, { rule: validation.isNotEmpty }, { rule: validation.isString }, { rule: validation.isInList, args: [["code"]] }],
                })
                .returns("someValue");

            const result = authCodeGrantValidator.isValidResponseType("abc");

            assert.equal(result, "someValue");
            sinon.assert.calledOnce(sequentiallyMatchAllValidationsStub);
        });

        it("throws, if sequentially asserted validations throw error", () => {
            const sequentiallyMatchAllValidationsStub = sinon.stub(validation, "sequentiallyMatchAllValidations");

            const expectedError = new Error("Something did not pass validation");
            sequentiallyMatchAllValidationsStub
                .withArgs({
                    fieldName: "response_type",
                    value: "abc",
                    validations: [{ rule: validation.isNotUndefined }, { rule: validation.isNotNull }, { rule: validation.isNotEmpty }, { rule: validation.isString }, { rule: validation.isInList, args: [["code"]] }],
                })
                .throws(expectedError);

            try {
                authCodeGrantValidator.isValidResponseType("abc");
                return Promise.reject("Function under test never threw an error");
            } catch (error) {
                assert.equal(error, expectedError);
                assert.deepEqual(error, new Error("Something did not pass validation"));
            }
        });
    });

    describe("isValidRedirectUri", () => {
        it("returns value, if sequentially asserted validations pass", () => {
            const sequentiallyMatchAllValidationsStub = sinon.stub(validation, "sequentiallyMatchAllValidations");

            sequentiallyMatchAllValidationsStub
                .withArgs({
                    fieldName: "redirect_uri",
                    value: "abc",
                    validations: [{ rule: validation.isNotUndefined }, { rule: validation.isNotNull }, { rule: validation.isNotEmpty }, { rule: validation.isString }],
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
                    validations: [{ rule: validation.isNotUndefined }, { rule: validation.isNotNull }, { rule: validation.isNotEmpty }, { rule: validation.isString }],
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

    describe("isValidClientId", () => {
        it("returns value, if sequentially asserted validations pass", () => {
            const sequentiallyMatchAllValidationsStub = sinon.stub(validation, "sequentiallyMatchAllValidations");

            sequentiallyMatchAllValidationsStub
                .withArgs({
                    fieldName: "client_id",
                    value: "client",
                    validations: [{ rule: validation.isNotUndefined }, { rule: validation.isNotNull }, { rule: validation.isNotEmpty }, { rule: validation.isString }],
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
                    validations: [{ rule: validation.isNotUndefined }, { rule: validation.isNotNull }, { rule: validation.isNotEmpty }, { rule: validation.isString }],
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
                    validations: [{ rule: validation.isNotUndefined }, { rule: validation.isNotNull }, { rule: validation.isNotEmpty }, { rule: validation.isArray }],
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
                    validations: [{ rule: validation.isNotUndefined }, { rule: validation.isNotNull }, { rule: validation.isNotEmpty }, { rule: validation.isArray }],
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

    describe("isValidCodeChallenge", () => {
        it("returns value, if sequentially asserted validations pass", () => {
            const sequentiallyMatchAllValidationsStub = sinon.stub(validation, "sequentiallyMatchAllValidations");

            sequentiallyMatchAllValidationsStub
                .withArgs({
                    fieldName: "code_challenge",
                    value: "fad7910c9a",
                    validations: [
                        { rule: validation.isNotUndefined },
                        { rule: validation.isNotNull },
                        { rule: validation.isNotEmpty },
                        { rule: validation.isString },
                        {
                            rule: validation.matchesRegex,
                            args: [/^[a-zA-Z0-9_\.~-]{43,128}$/],
                        },
                    ],
                })
                .returns("someValue");

            const result = authCodeGrantValidator.isValidCodeChallenge("fad7910c9a");

            assert.equal(result, "someValue");
            sinon.assert.calledOnce(sequentiallyMatchAllValidationsStub);
        });

        it("throws, if sequentially asserted validations throw error", () => {
            const sequentiallyMatchAllValidationsStub = sinon.stub(validation, "sequentiallyMatchAllValidations");

            const expectedError = new Error("Something did not pass validation");
            sequentiallyMatchAllValidationsStub
                .withArgs({
                    fieldName: "code_challenge",
                    value: "fad7910c9a",
                    validations: [
                        { rule: validation.isNotUndefined },
                        { rule: validation.isNotNull },
                        { rule: validation.isNotEmpty },
                        { rule: validation.isString },
                        {
                            rule: validation.matchesRegex,
                            args: [/^[a-zA-Z0-9_\.~-]{43,128}$/],
                        },
                    ],
                })
                .throws(expectedError);

            try {
                authCodeGrantValidator.isValidCodeChallenge("fad7910c9a");
                return Promise.reject("Function under test never threw an error");
            } catch (error) {
                assert.equal(error, expectedError);
                assert.deepEqual(error, new Error("Something did not pass validation"));
            }
        });
    });

    describe("isValidCodeChallengeTransformMethod", () => {
        it("returns value, if sequentially asserted validations pass", () => {
            const sequentiallyMatchAllValidationsStub = sinon.stub(validation, "sequentiallyMatchAllValidations");

            sequentiallyMatchAllValidationsStub
                .withArgs({
                    fieldName: "code_challenge_method",
                    value: "secureAlgorithm",
                    validations: [{ rule: validation.isNotUndefined }, { rule: validation.isNotNull }, { rule: validation.isNotEmpty }, { rule: validation.isString }, { rule: validation.isInList, args: [["S256"]] }],
                })
                .returns("someValue");

            const result = authCodeGrantValidator.isValidCodeChallengeTransformMethod("secureAlgorithm");

            assert.equal(result, "someValue");
            sinon.assert.calledOnce(sequentiallyMatchAllValidationsStub);
        });

        it("throws, if sequentially asserted validations throw error", () => {
            const sequentiallyMatchAllValidationsStub = sinon.stub(validation, "sequentiallyMatchAllValidations");

            const expectedError = new Error("Something did not pass validation");
            sequentiallyMatchAllValidationsStub
                .withArgs({
                    fieldName: "code_challenge_method",
                    value: "algorithm",
                    validations: [{ rule: validation.isNotUndefined }, { rule: validation.isNotNull }, { rule: validation.isNotEmpty }, { rule: validation.isString }, { rule: validation.isInList, args: [["S256"]] }],
                })
                .throws(expectedError);

            try {
                authCodeGrantValidator.isValidCodeChallengeTransformMethod("algorithm");
                return Promise.reject("Function under test never threw an error");
            } catch (error) {
                assert.equal(error, expectedError);
                assert.deepEqual(error, new Error("Something did not pass validation"));
            }
        });
    });
});
