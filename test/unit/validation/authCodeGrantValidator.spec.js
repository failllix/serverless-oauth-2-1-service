import sinon from "sinon";
import authCodeGrantValidator from "../../../src/validation/authCodeGrantValidator.js";

import validation from "../../../src/validation/validation.js";

import { assert } from "chai";

describe("Auth code grant validator", () => {
    describe("isValidRedirectUri", () => {
        it("resolves to value, if sequentially asserted validations pass", async () => {
            const sequentiallyMatchAllValidationsStub = sinon.stub(validation, "sequentiallyMatchAllValidations");

            sequentiallyMatchAllValidationsStub
                .withArgs({
                    fieldName: "redirect_uri",
                    value: "abc",
                    validations: [validation.isNotUndefined, validation.isNotNull, validation.isNotEmpty],
                })
                .resolves("someValue");

            const result = await authCodeGrantValidator.isValidRedirectUri("abc");

            assert.equal(result, "someValue");
            sinon.assert.calledOnce(sequentiallyMatchAllValidationsStub);
        });

        it("throws, if sequentially asserted validations throw error", async () => {
            const sequentiallyMatchAllValidationsStub = sinon.stub(validation, "sequentiallyMatchAllValidations");

            const expectedError = new Error("Something did not pass validation");
            sequentiallyMatchAllValidationsStub
                .withArgs({
                    fieldName: "redirect_uri",
                    value: "abc",
                    validations: [validation.isNotUndefined, validation.isNotNull, validation.isNotEmpty],
                })
                .throws(expectedError);

            try {
                await authCodeGrantValidator.isValidRedirectUri("abc");
            } catch (error) {
                assert.equal(error, expectedError);
                assert.deepEqual(error, new Error("Something did not pass validation"));
            }
        });
    });
});
