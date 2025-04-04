import sinon from "sinon";
import userAuthenticator from "../../../src/authentication/user.js";

import { assert } from "chai";
import util from "../../../src/helper/util.js";
import logger from "../../../src/logger.js";
import userStorage from "../../../src/storage/user.js";

describe("User authentication", () => {
    describe("authenticateUser", () => {
        it("does not throw, if correct hash can be derived for password and user has all requested scopes", async () => {
            const getUserStub = sinon.stub(userStorage, "getUser");
            getUserStub.withArgs("dummy").resolves({ Salt: "abc", PasswordHash: "hashed", Scope: ["a", "b"] });

            const getPBKDF2PasswordHashStub = sinon.stub(util, "getPBKDF2PasswordHash");
            getPBKDF2PasswordHashStub.withArgs("insecure", "abc").resolves("hashed");

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

            const loggerErrorStub = sinon.stub(logger, "logError");

            try {
                await userAuthenticator.authenticateUser({
                    username: "dummy",
                    password: "insecure",
                });
                return Promise.reject("Function under test never threw error");
            } catch (error) {
                assert.equal(error.message, "Wrong username or password.");

                sinon.assert.calledWithExactly(
                    loggerErrorStub,
                    sinon.match((error) => {
                        try {
                            assert.deepEqual(error, expectedError);
                            return true;
                        } catch (error) {
                            return false;
                        }
                    }),
                );
            }
        });

        it("throws, if null user was found and logs error", async () => {
            const getUserStub = sinon.stub(userStorage, "getUser");
            getUserStub.withArgs("dummy").resolves(null);

            const loggerErrorStub = sinon.stub(logger, "logError");

            try {
                await userAuthenticator.authenticateUser({
                    username: "dummy",
                    password: "insecure",
                });
                return Promise.reject("Function under test never threw error");
            } catch (error) {
                assert.equal(error.message, "Wrong username or password.");

                sinon.assert.calledWithExactly(
                    loggerErrorStub,
                    sinon.match((error) => {
                        try {
                            assert.deepEqual(error, new Error("User 'dummy' was not found."));
                            return true;
                        } catch (error) {
                            return false;
                        }
                    }),
                );
            }
        });

        it("throws, if password and PasswordHash don't match and logs error", async () => {
            const getUserStub = sinon.stub(userStorage, "getUser");
            getUserStub.withArgs("dummy").resolves({ Salt: "abc", notPasswordToken: "hashed" });

            const getPBKDF2PasswordHashStub = sinon.stub(util, "getPBKDF2PasswordHash");
            getPBKDF2PasswordHashStub.withArgs("wrong", "abc").resolves("notHashedPassword");

            const loggerErrorStub = sinon.stub(logger, "logError");

            try {
                await userAuthenticator.authenticateUser({
                    username: "dummy",
                    password: "wrong",
                });
                return Promise.reject("Function under test never threw error");
            } catch (error) {
                assert.equal(error.message, "Wrong username or password.");

                sinon.assert.calledWithExactly(
                    loggerErrorStub,
                    sinon.match((error) => {
                        try {
                            assert.deepEqual(error, new Error("Wrong password."));
                            return true;
                        } catch (error) {
                            return false;
                        }
                    }),
                );
            }
        });

        it("throws, if user object does not include scope", async () => {
            const getUserStub = sinon.stub(userStorage, "getUser");
            getUserStub.withArgs("dummy").resolves({ Salt: "abc", PasswordHash: "hash", notScope: ["a", "b"] });

            const getPBKDF2PasswordHashStub = sinon.stub(util, "getPBKDF2PasswordHash");
            getPBKDF2PasswordHashStub.withArgs("insecure", "abc").resolves("hash");

            try {
                await userAuthenticator.authenticateUser({
                    username: "dummy",
                    password: "insecure",
                    scope: ["a", "b"],
                });
                return Promise.reject("Function under test never threw error");
            } catch (error) {
                assert.equal(error.message, "User has insufficient scopes.");
            }
        });

        it("throws, if user does not have all requested scopes", async () => {
            const getUserStub = sinon.stub(userStorage, "getUser");
            getUserStub.withArgs("dummy").resolves({ Salt: "abc", PasswordHash: "hash", Scope: ["a"] });

            const getPBKDF2PasswordHashStub = sinon.stub(util, "getPBKDF2PasswordHash");
            getPBKDF2PasswordHashStub.withArgs("insecure", "abc").resolves("hash");

            try {
                await userAuthenticator.authenticateUser({
                    username: "dummy",
                    password: "insecure",
                    scope: ["a", "b"],
                });
                return Promise.reject("Function under test never threw error");
            } catch (error) {
                assert.equal(error.message, "User has insufficient scopes.");
            }
        });
    });
});
