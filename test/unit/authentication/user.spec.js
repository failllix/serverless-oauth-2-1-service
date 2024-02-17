import sinon from "sinon";
import userAuthenticator from "../../../src/authentication/user.js";

import { assert } from "chai";
import userStorage from "../../../src/storage/user.js";
import util from "../../../src/util.js";

describe("User authentication", () => {
    describe("authenticateUser", () => {
        it("does not throw, if correct hash can be derived for password and user has all requested scopes", async () => {
            const getUserStub = sinon.stub(userStorage, "getUser");
            getUserStub.withArgs("dummy").resolves({ salt: "abc", passwordToken: "hashed", scope: ["a", "b"] });

            const strToSha512HexStringStub = sinon.stub(util, "strToSha512HexString");
            strToSha512HexStringStub.withArgs("insecureabc").resolves("hashed");

            await userAuthenticator.authenticateUser({
                username: "dummy",
                password: "insecure",
                scope: ["a", "b"],
            });
        });

        it("throws, if getting user throws", async () => {
            const expectedError = Object.freeze(new Error("No users in stock"));
            const getUserStub = sinon.stub(userStorage, "getUser");
            getUserStub.withArgs("dummy").throws(expectedError);

            try {
                await userAuthenticator.authenticateUser({
                    username: "dummy",
                    password: "insecure",
                });
                return Promise.reject("Function under test never threw error");
            } catch (error) {
                assert.equal(error, expectedError);
            }
        });

        it("throws, if null user was found, because undefined salt yields wrong hash", async () => {
            const getUserStub = sinon.stub(userStorage, "getUser");
            getUserStub.withArgs("dummy").resolves(null);

            const strToSha512HexStringStub = sinon.stub(util, "strToSha512HexString");

            try {
                await userAuthenticator.authenticateUser({
                    username: "dummy",
                    password: "insecure",
                });
                return Promise.reject("Function under test never threw error");
            } catch (error) {
                assert.equal(error.message, "Wrong username or password.");

                sinon.assert.calledWithExactly(strToSha512HexStringStub, "insecureundefined");
            }
        });

        it("throws, if user object does not include salt, because undefined salt yields wrong hash", async () => {
            const getUserStub = sinon.stub(userStorage, "getUser");
            getUserStub.withArgs("dummy").resolves({ notSalt: "abc", passwordToken: "hashed" });

            const strToSha512HexStringStub = sinon.stub(util, "strToSha512HexString");
            strToSha512HexStringStub.withArgs("insecureundefined").resolves("notHashedPassword");

            try {
                await userAuthenticator.authenticateUser({
                    username: "dummy",
                    password: "insecure",
                });
                return Promise.reject("Function under test never threw error");
            } catch (error) {
                assert.equal(error.message, "Wrong username or password.");
            }
        });

        it("throws, if user object does not include passwordToken", async () => {
            const getUserStub = sinon.stub(userStorage, "getUser");
            getUserStub.withArgs("dummy").resolves({ salt: "abc", notPasswordToken: "hashed" });

            const strToSha512HexStringStub = sinon.stub(util, "strToSha512HexString");
            strToSha512HexStringStub.withArgs("insecureabc").resolves("hashed");

            try {
                await userAuthenticator.authenticateUser({
                    username: "dummy",
                    password: "insecure",
                });
                return Promise.reject("Function under test never threw error");
            } catch (error) {
                assert.equal(error.message, "Wrong username or password.");
            }
        });

        it("throws, if password and passwordToken don't match", async () => {
            const getUserStub = sinon.stub(userStorage, "getUser");
            getUserStub.withArgs("dummy").resolves({ salt: "abc", notPasswordToken: "hashed" });

            const strToSha512HexStringStub = sinon.stub(util, "strToSha512HexString");
            strToSha512HexStringStub.withArgs("wrongabc").resolves("notHashedPassword");

            try {
                await userAuthenticator.authenticateUser({
                    username: "dummy",
                    password: "wrong",
                });
                return Promise.reject("Function under test never threw error");
            } catch (error) {
                assert.equal(error.message, "Wrong username or password.");
            }
        });

        it("throws, if user object does not include scope", async () => {
            const getUserStub = sinon.stub(userStorage, "getUser");
            getUserStub.withArgs("dummy").resolves({ salt: "abc", passwordToken: "hash", notScope: ["a", "b"] });

            const strToSha512HexStringStub = sinon.stub(util, "strToSha512HexString");
            strToSha512HexStringStub.withArgs("insecureabc").resolves("hash");

            try {
                await userAuthenticator.authenticateUser({
                    username: "dummy",
                    password: "insecure",
                    scope: ["a", "b"],
                });
                return Promise.reject("Function under test never threw error");
            } catch (error) {
                assert.equal(error.message, "User has inussificent scopes.");
            }
        });

        it("throws, if user does not have all requested scopes", async () => {
            const getUserStub = sinon.stub(userStorage, "getUser");
            getUserStub.withArgs("dummy").resolves({ salt: "abc", passwordToken: "hash", scope: ["a"] });

            const strToSha512HexStringStub = sinon.stub(util, "strToSha512HexString");
            strToSha512HexStringStub.withArgs("insecureabc").resolves("hash");

            try {
                await userAuthenticator.authenticateUser({
                    username: "dummy",
                    password: "insecure",
                    scope: ["a", "b"],
                });
                return Promise.reject("Function under test never threw error");
            } catch (error) {
                assert.equal(error.message, "User has inussificent scopes.");
            }
        });
    });
});
