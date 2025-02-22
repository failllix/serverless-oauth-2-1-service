import { assert } from "chai";
import sinon from "sinon";
import AuthenticationError from "../../../src/error/authenticationError.js";
import util from "../../../src/helper/util.js";
import logger from "../../../src/logger.js";
import codeStorage from "../../../src/storage/code.js";
import authCodeTokenFlow from "../../../src/tokenFlows/authCodeTokenFlow.js";
import tokenCreator from "../../../src/tokenFlows/tokenCreator.js";
import sharedValidator from "../../../src/validation/sharedValidator.js";
import tokenExchangeValidator from "../../../src/validation/tokenExchangeValidator.js";

describe("Auth code token flow", () => {
    let mockedFormData;
    let formDataGetStub;

    beforeEach(() => {
        sinon.stub(logger);

        formDataGetStub = sinon.stub();
        formDataGetStub.withArgs("client_id").returns("someClientId");
        formDataGetStub.withArgs("redirect_uri").returns("someRedirectUri");
        formDataGetStub.withArgs("scope").returns("someScope1,someScope2");
        formDataGetStub.withArgs("code_verifier").returns("someCodeVerifier");
        formDataGetStub.withArgs("code").returns("someAccessCode");
        mockedFormData = {
            get: formDataGetStub,
        };
    });

    describe("validation failures", () => {
        afterEach(() => {
            sinon.assert.notCalled(logger.logObject);
        });

        it("should throw if client id validation fails", async () => {
            sinon.stub(sharedValidator);

            const expectedError = new Error("Invalid client id");
            sharedValidator.isValidClientId.throws(expectedError);

            try {
                await authCodeTokenFlow.exchangeAccessCodeForToken({ formData: mockedFormData, host: "someHost" });
                throw new Error("Function under test was expected to throw error");
            } catch (error) {
                assert.equal(expectedError, error);

                sinon.assert.calledOnceWithExactly(sharedValidator.isValidClientId, "someClientId");
                sinon.assert.calledOnceWithExactly(formDataGetStub, "client_id");
            }
        });

        it("should throw if redirect URI validation fails", async () => {
            sinon.stub(sharedValidator);

            const expectedError = new Error("Invalid redirect URI");
            sharedValidator.isValidClientId.returns("someClientId");
            sharedValidator.isValidRedirectUri.throws(expectedError);

            try {
                await authCodeTokenFlow.exchangeAccessCodeForToken({ formData: mockedFormData, host: "someHost" });
                throw new Error("Function under test was expected to throw error");
            } catch (error) {
                assert.equal(expectedError, error);

                sinon.assert.calledOnceWithExactly(sharedValidator.isValidClientId, "someClientId");
                sinon.assert.calledOnceWithExactly(sharedValidator.isValidRedirectUri, "someRedirectUri");

                sinon.assert.calledWith(formDataGetStub, "client_id");
                sinon.assert.calledWith(formDataGetStub, "redirect_uri");
                sinon.assert.callCount(formDataGetStub, 2);
            }
        });

        it("should throw if scope validation fails", async () => {
            sinon.stub(sharedValidator);

            const expectedError = new Error("Invalid scopes");
            sharedValidator.isValidClientId.returns("someClientId");
            sharedValidator.isValidRedirectUri.returns("someRedirectUri");
            sharedValidator.isValidScope.throws(expectedError);

            try {
                await authCodeTokenFlow.exchangeAccessCodeForToken({ formData: mockedFormData, host: "someHost" });
                throw new Error("Function under test was expected to throw error");
            } catch (error) {
                assert.equal(expectedError, error);

                sinon.assert.calledOnceWithExactly(sharedValidator.isValidClientId, "someClientId");
                sinon.assert.calledOnceWithExactly(sharedValidator.isValidRedirectUri, "someRedirectUri");
                sinon.assert.calledOnceWithExactly(sharedValidator.isValidScope, ["someScope1", "someScope2"]);

                sinon.assert.calledWith(formDataGetStub, "client_id");
                sinon.assert.calledWith(formDataGetStub, "redirect_uri");
                sinon.assert.calledWith(formDataGetStub, "scope");
                sinon.assert.callCount(formDataGetStub, 3);
            }
        });

        it("should throw if code verifier validation fails", async () => {
            sinon.stub(sharedValidator);
            sinon.stub(tokenExchangeValidator);

            const expectedError = new Error("Invalid code verifier");
            sharedValidator.isValidClientId.returns("someClientId");
            sharedValidator.isValidRedirectUri.returns("someRedirectUri");
            sharedValidator.isValidScope.returns(["someScope1", "someScope2"]);
            tokenExchangeValidator.isValidCodeVerifier.throws(expectedError);

            try {
                await authCodeTokenFlow.exchangeAccessCodeForToken({ formData: mockedFormData, host: "someHost" });
                throw new Error("Function under test was expected to throw error");
            } catch (error) {
                assert.equal(expectedError, error);

                sinon.assert.calledOnceWithExactly(sharedValidator.isValidClientId, "someClientId");
                sinon.assert.calledOnceWithExactly(sharedValidator.isValidRedirectUri, "someRedirectUri");
                sinon.assert.calledOnceWithExactly(sharedValidator.isValidScope, ["someScope1", "someScope2"]);
                sinon.assert.calledOnceWithExactly(tokenExchangeValidator.isValidCodeVerifier, "someCodeVerifier");

                sinon.assert.calledWith(formDataGetStub, "client_id");
                sinon.assert.calledWith(formDataGetStub, "redirect_uri");
                sinon.assert.calledWith(formDataGetStub, "scope");
                sinon.assert.calledWith(formDataGetStub, "code_verifier");
                sinon.assert.callCount(formDataGetStub, 4);
            }
        });

        it("should throw if access code validation fails", async () => {
            sinon.stub(sharedValidator);
            sinon.stub(tokenExchangeValidator);

            const expectedError = new Error("Invalid access code");
            sharedValidator.isValidClientId.returns("someClientId");
            sharedValidator.isValidRedirectUri.returns("someRedirectUri");
            sharedValidator.isValidScope.returns(["someScope1", "someScope2"]);
            tokenExchangeValidator.isValidCodeVerifier.returns("someCodeVerifier");
            tokenExchangeValidator.isValidAccessCode.throws(expectedError);

            try {
                await authCodeTokenFlow.exchangeAccessCodeForToken({ formData: mockedFormData, host: "someHost" });
                throw new Error("Function under test was expected to throw error");
            } catch (error) {
                assert.equal(expectedError, error);

                sinon.assert.calledOnceWithExactly(sharedValidator.isValidClientId, "someClientId");
                sinon.assert.calledOnceWithExactly(sharedValidator.isValidRedirectUri, "someRedirectUri");
                sinon.assert.calledOnceWithExactly(sharedValidator.isValidScope, ["someScope1", "someScope2"]);
                sinon.assert.calledOnceWithExactly(tokenExchangeValidator.isValidCodeVerifier, "someCodeVerifier");
                sinon.assert.calledOnceWithExactly(tokenExchangeValidator.isValidAccessCode, "someAccessCode");

                sinon.assert.calledWith(formDataGetStub, "client_id");
                sinon.assert.calledWith(formDataGetStub, "redirect_uri");
                sinon.assert.calledWith(formDataGetStub, "scope");
                sinon.assert.calledWith(formDataGetStub, "code_verifier");
                sinon.assert.calledWith(formDataGetStub, "code");
                sinon.assert.callCount(formDataGetStub, 5);
            }
        });
    });

    describe("post validation", () => {
        beforeEach(() => {
            sinon.stub(sharedValidator);
            sinon.stub(tokenExchangeValidator);

            sharedValidator.isValidClientId.returns("someClientId");
            sharedValidator.isValidRedirectUri.returns("someRedirectUri");
            sharedValidator.isValidScope.returns(["someScope1", "someScope2"]);
            tokenExchangeValidator.isValidCodeVerifier.returns("someCodeVerifier");
            tokenExchangeValidator.isValidAccessCode.returns("someAccessCode");
        });

        afterEach(() => {
            sinon.assert.calledOnceWithExactly(logger.logObject, {
                label: "validated token request parameters",
                object: {
                    clientId: "someClientId",
                    redirectUri: "someRedirectUri",
                    scope: ["someScope1", "someScope2"],
                    codeVerifier: "someCodeVerifier",
                    accessCode: "someAccessCode",
                },
            });
        });

        describe("error cases", () => {
            it("should throw saving access code rejects", async () => {
                sinon.stub(codeStorage);

                const expectedError = new Error("Access code storage unavailable");
                codeStorage.getAccessCode.rejects(expectedError);

                try {
                    await authCodeTokenFlow.exchangeAccessCodeForToken({ formData: mockedFormData, host: "someHost" });
                    throw new Error("Function under test was expected to throw error");
                } catch (error) {
                    assert.equal(error, expectedError);

                    sinon.assert.calledWithExactly(codeStorage.getAccessCode, "someAccessCode");
                }
            });

            it("should throw saving access code was not found", async () => {
                sinon.stub(codeStorage);

                codeStorage.getAccessCode.resolves(null);

                try {
                    await authCodeTokenFlow.exchangeAccessCodeForToken({ formData: mockedFormData, host: "someHost" });
                    throw new Error("Function under test was expected to throw error");
                } catch (error) {
                    assert.instanceOf(error, AuthenticationError);
                    assert.equal(error.errorCategory, "invalid_grant");
                    assert.equal(error.errorDescription, "Invalid access code.");

                    sinon.assert.calledWithExactly(codeStorage.getAccessCode, "someAccessCode");
                }
            });

            it("should throw if provided client id does not match saved client id", async () => {
                sinon.stub(codeStorage);

                codeStorage.getAccessCode.resolves({
                    clientId: "somethingElse",
                });

                try {
                    await authCodeTokenFlow.exchangeAccessCodeForToken({ formData: mockedFormData, host: "someHost" });
                    throw new Error("Function under test was expected to throw error");
                } catch (error) {
                    assert.instanceOf(error, AuthenticationError);
                    assert.equal(error.errorCategory, "invalid_grant");
                    assert.equal(error.errorDescription, "Invalid client for access code.");

                    sinon.assert.calledWithExactly(codeStorage.getAccessCode, "someAccessCode");
                }
            });

            it("should throw if code challenge method is not 'S256'", async () => {
                sinon.stub(codeStorage);

                codeStorage.getAccessCode.resolves({
                    clientId: "someClientId",
                    codeChallengeMethod: "notS256",
                });

                try {
                    await authCodeTokenFlow.exchangeAccessCodeForToken({ formData: mockedFormData, host: "someHost" });
                    throw new Error("Function under test was expected to throw error");
                } catch (error) {
                    assert.instanceOf(error, AuthenticationError);
                    assert.equal(error.errorCategory, "invalid_grant");
                    assert.equal(error.errorDescription, "Invalid code challenge method");

                    sinon.assert.calledWithExactly(codeStorage.getAccessCode, "someAccessCode");
                }
            });

            it("should throw if code challenge method is 'S256', but sha256 calculation rejects", async () => {
                sinon.stub(codeStorage);
                sinon.stub(util);

                codeStorage.getAccessCode.resolves({
                    clientId: "someClientId",
                    codeChallengeMethod: "S256",
                });

                const expectedError = new Error("Cannot calculate SHA256 hash");
                util.calculateSha256FromString.rejects(expectedError);

                try {
                    await authCodeTokenFlow.exchangeAccessCodeForToken({ formData: mockedFormData, host: "someHost" });
                    throw new Error("Function under test was expected to throw error");
                } catch (error) {
                    assert.equal(error, expectedError);

                    sinon.assert.calledWithExactly(codeStorage.getAccessCode, "someAccessCode");

                    sinon.assert.calledWithExactly(util.calculateSha256FromString, "someCodeVerifier");
                    sinon.assert.notCalled(util.uint8ToUrlBase64);
                }
            });

            it("should throw if calculated code challenge does not match provided code challenge", async () => {
                sinon.stub(codeStorage);
                sinon.stub(util);

                codeStorage.getAccessCode.resolves({
                    clientId: "someClientId",
                    codeChallengeMethod: "S256",
                    codeChallenge: "unexpected",
                });

                util.calculateSha256FromString.resolves("someCodeVerifierSha256Hash");
                util.uint8ToUrlBase64.withArgs("someCodeVerifierSha256Hash").returns("someCodeVerifierSha256HashBase64");

                try {
                    await authCodeTokenFlow.exchangeAccessCodeForToken({ formData: mockedFormData, host: "someHost" });
                    throw new Error("Function under test was expected to throw error");
                } catch (error) {
                    assert.instanceOf(error, AuthenticationError);
                    assert.equal(error.errorCategory, "invalid_grant");
                    assert.equal(error.errorDescription, "Invalid code challenge");

                    sinon.assert.calledWithExactly(codeStorage.getAccessCode, "someAccessCode");

                    sinon.assert.calledWithExactly(util.calculateSha256FromString, "someCodeVerifier");
                    sinon.assert.calledWithExactly(util.uint8ToUrlBase64, "someCodeVerifierSha256Hash");
                }
            });

            it("should throw if no scopes match saved scopes", async () => {
                sinon.stub(codeStorage);
                sinon.stub(util);

                codeStorage.getAccessCode.resolves({
                    clientId: "someClientId",
                    codeChallengeMethod: "S256",
                    codeChallenge: "someCodeVerifierSha256HashBase64",
                    scope: ["notSomeScope1", "notSomeScope2"],
                });

                util.calculateSha256FromString.resolves("someCodeVerifierSha256Hash");
                util.uint8ToUrlBase64.withArgs("someCodeVerifierSha256Hash").returns("someCodeVerifierSha256HashBase64");

                try {
                    await authCodeTokenFlow.exchangeAccessCodeForToken({ formData: mockedFormData, host: "someHost" });
                    throw new Error("Function under test was expected to throw error");
                } catch (error) {
                    assert.instanceOf(error, AuthenticationError);
                    assert.equal(error.errorCategory, "invalid_grant");
                    assert.equal(error.errorDescription, "Requested scopes were not granted for acccess code");

                    sinon.assert.calledWithExactly(codeStorage.getAccessCode, "someAccessCode");

                    sinon.assert.calledWithExactly(util.calculateSha256FromString, "someCodeVerifier");
                    sinon.assert.calledWithExactly(util.uint8ToUrlBase64, "someCodeVerifierSha256Hash");
                }
            });

            it("should throw if some scopes do not match saved scopes", async () => {
                sinon.stub(codeStorage);
                sinon.stub(util);

                codeStorage.getAccessCode.resolves({
                    clientId: "someClientId",
                    codeChallengeMethod: "S256",
                    codeChallenge: "someCodeVerifierSha256HashBase64",
                    scope: ["someScope1", "notSomeScope2"],
                });

                util.calculateSha256FromString.resolves("someCodeVerifierSha256Hash");
                util.uint8ToUrlBase64.withArgs("someCodeVerifierSha256Hash").returns("someCodeVerifierSha256HashBase64");

                try {
                    await authCodeTokenFlow.exchangeAccessCodeForToken({ formData: mockedFormData, host: "someHost" });
                    throw new Error("Function under test was expected to throw error");
                } catch (error) {
                    assert.instanceOf(error, AuthenticationError);
                    assert.equal(error.errorCategory, "invalid_grant");
                    assert.equal(error.errorDescription, "Requested scopes were not granted for acccess code");

                    sinon.assert.calledWithExactly(codeStorage.getAccessCode, "someAccessCode");

                    sinon.assert.calledWithExactly(util.calculateSha256FromString, "someCodeVerifier");
                    sinon.assert.calledWithExactly(util.uint8ToUrlBase64, "someCodeVerifierSha256Hash");
                }
            });
        });

        describe("success cases", () => {
            it("should return token response", async () => {
                sinon.stub(codeStorage);
                sinon.stub(util);
                sinon.stub(tokenCreator);

                codeStorage.getAccessCode.resolves({
                    clientId: "someClientId",
                    codeChallengeMethod: "S256",
                    codeChallenge: "someCodeVerifierSha256HashBase64",
                    scope: ["someScope1", "someScope2"],
                    grantId: "someGrantId",
                    username: "dummy",
                });

                util.calculateSha256FromString.resolves("someCodeVerifierSha256Hash");
                util.uint8ToUrlBase64.withArgs("someCodeVerifierSha256Hash").returns("someCodeVerifierSha256HashBase64");

                tokenCreator.getAccessTokenResponse.resolves("tokenResponse");

                const response = await authCodeTokenFlow.exchangeAccessCodeForToken({ formData: mockedFormData, host: "someHost" });

                assert.equal(response, "tokenResponse");

                sinon.assert.calledWithExactly(codeStorage.getAccessCode, "someAccessCode");

                sinon.assert.calledWithExactly(util.calculateSha256FromString, "someCodeVerifier");
                sinon.assert.calledWithExactly(util.uint8ToUrlBase64, "someCodeVerifierSha256Hash");
                sinon.assert.calledWithExactly(tokenCreator.getAccessTokenResponse, {
                    clientId: "someClientId",
                    grantId: "someGrantId",
                    scope: ["someScope1", "someScope2"],
                    username: "dummy",
                    issuer: "someHost",
                });
            });
        });
    });
});
