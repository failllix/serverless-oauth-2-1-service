import { assert } from "chai";
import { beforeEach, describe } from "mocha";
import sinon from "sinon";
import codeStorage from "../../../src/storage/code.js";
import storageManager from "../../../src/storage/manager.js";

describe("Code storage", () => {
    let databaseStub;
    let databasePrepareStub;
    let databaseBatchStub;

    beforeEach(() => {
        databasePrepareStub = sinon.stub();
        databaseBatchStub = sinon.stub();

        databaseStub = {
            prepare: databasePrepareStub,
            batch: databaseBatchStub,
        };

        sinon.stub(storageManager);

        storageManager.getDatabase.returns(databaseStub);
    });

    describe("getAccessCode", () => {
        it("should throw if running database batch rejects", async () => {
            const statementBindStub = sinon.stub();

            databasePrepareStub.withArgs("SELECT * FROM Codes WHERE AccessCode = ?").returns({
                bind: statementBindStub,
            });

            statementBindStub.withArgs("dummyCode").returns("getDummyCodeStatement");

            databasePrepareStub.withArgs("DELETE FROM Codes WHERE ExpiresAt < datetime('now')").returns("clearExpiredCodesStatement");

            const expectedError = new Error("Database connection is broken");
            databaseBatchStub.withArgs(["clearExpiredCodesStatement", "getDummyCodeStatement"]).rejects(expectedError);

            try {
                await codeStorage.getAccessCode("dummyCode");
                throw new Error("Function under test never threw an error ");
            } catch (error) {
                assert.deepEqual(error, expectedError);
            }
        });

        it("should throw if database returns more than one row for key", async () => {
            const statementBindStub = sinon.stub();

            databasePrepareStub.withArgs("SELECT * FROM Codes WHERE AccessCode = ?").returns({
                bind: statementBindStub,
            });

            statementBindStub.withArgs("dummyCode").returns("getDummyCodeStatement");

            databasePrepareStub.withArgs("DELETE FROM Codes WHERE ExpiresAt < datetime('now')").returns("clearExpiredCodesStatement");

            databaseBatchStub.withArgs(["clearExpiredCodesStatement", "getDummyCodeStatement"]).resolves([
                "success",
                {
                    results: [
                        {
                            expected: "yes",
                            Scope: "a,b,c",
                        },
                        {
                            expected: "no",
                            Scope: "a,b,c",
                        },
                    ],
                },
            ]);

            try {
                await codeStorage.getAccessCode("dummyCode");
                throw new Error("Function under test never threw an error ");
            } catch (error) {
                assert.deepEqual(error.message, "Expected to receive only one code with id 'dummyCode'");
            }
        });

        it("should get database and run prepared statement with code and return result with expanded scopes", async () => {
            const statementBindStub = sinon.stub();

            databasePrepareStub.withArgs("SELECT * FROM Codes WHERE AccessCode = ?").returns({
                bind: statementBindStub,
            });

            statementBindStub.withArgs("dummyCode").returns("getDummyCodeStatement");

            databasePrepareStub.withArgs("DELETE FROM Codes WHERE ExpiresAt < datetime('now')").returns("clearExpiredCodesStatement");

            databaseBatchStub.withArgs(["clearExpiredCodesStatement", "getDummyCodeStatement"]).resolves([
                "success",
                {
                    results: [
                        {
                            expected: "yes",
                            Scope: "a,b,c",
                        },
                    ],
                },
            ]);

            const result = await codeStorage.getAccessCode("dummyCode");

            assert.deepEqual(result, {
                expected: "yes",
                Scope: ["a", "b", "c"],
            });
        });

        it("should get database and run prepared statement and return null if empty array was returned", async () => {
            const statementBindStub = sinon.stub();

            databasePrepareStub.withArgs("SELECT * FROM Codes WHERE AccessCode = ?").returns({
                bind: statementBindStub,
            });

            statementBindStub.withArgs("dummyCode").returns("getDummyCodeStatement");

            databasePrepareStub.withArgs("DELETE FROM Codes WHERE ExpiresAt < datetime('now')").returns("clearExpiredCodesStatement");

            databaseBatchStub.withArgs(["clearExpiredCodesStatement", "getDummyCodeStatement"]).resolves([
                "success",
                {
                    results: [],
                },
            ]);

            const result = await codeStorage.getAccessCode("dummyCode");

            assert.deepEqual(result, null);
        });
    });

    describe("saveAccessCode", () => {
        it("should get database and run prepared statement", async () => {
            const statementBindStub = sinon.stub();
            const statementRunStub = sinon.stub();

            databasePrepareStub.withArgs("INSERT INTO Codes (AccessCode, ClientId, Username, GrantId, Scope, CodeChallengeMethod, CodeChallenge) VALUES (?, ?, ?, ?, ?, ?, ?)").returns({
                bind: statementBindStub,
            });

            statementBindStub.withArgs("myCode", "testClient", "testUser", "someGrantId", "testScope1,testScope2", "def", "abc").returns({ run: statementRunStub });

            statementRunStub.resolves();

            await codeStorage.saveAccessCode({
                code: "myCode",
                scope: ["testScope1", "testScope2"],
                clientId: "testClient",
                codeChallenge: "abc",
                codeChallengeMethod: "def",
                username: "testUser",
                grantId: "someGrantId",
            });

            sinon.assert.calledOnceWithExactly(statementRunStub);
        });

        it("should throw if running statement rejects", async () => {
            const statementBindStub = sinon.stub();
            const statementRunStub = sinon.stub();

            databasePrepareStub.withArgs("INSERT INTO Codes (AccessCode, ClientId, Username, GrantId, Scope, CodeChallengeMethod, CodeChallenge) VALUES (?, ?, ?, ?, ?, ?, ?)").returns({
                bind: statementBindStub,
            });

            statementBindStub.withArgs("myCode", "testClient", "testUser", "someGrantId", "testScope1,testScope2", "def", "abc").returns({ run: statementRunStub });

            const expectedError = new Error("Cannot insert");
            statementRunStub.rejects(expectedError);

            try {
                await codeStorage.saveAccessCode({
                    code: "myCode",
                    scope: ["testScope1", "testScope2"],
                    clientId: "testClient",
                    codeChallenge: "abc",
                    codeChallengeMethod: "def",
                    username: "testUser",
                    grantId: "someGrantId",
                });
                throw new Error("Function under test never threw");
            } catch (error) {
                assert.equal(expectedError, error);
                sinon.assert.calledOnceWithExactly(statementRunStub);
            }
        });
    });

    describe("getAccessCodesByUsername", () => {
        it("should throw if running database batch rejects", async () => {
            const statementBindStub = sinon.stub();

            databasePrepareStub.withArgs("SELECT * FROM Codes WHERE Username = ?").returns({
                bind: statementBindStub,
            });

            statementBindStub.withArgs("dummyUser").returns("getCodesForDummyUserStatement");

            databasePrepareStub.withArgs("DELETE FROM Codes WHERE ExpiresAt < datetime('now')").returns("clearExpiredCodesStatement");

            const expectedError = new Error("Database connection is broken");
            databaseBatchStub.withArgs(["clearExpiredCodesStatement", "getCodesForDummyUserStatement"]).rejects(expectedError);

            try {
                await codeStorage.getAccessCodesByUsername("dummyUser");
                throw new Error("Function under test never threw an error ");
            } catch (error) {
                assert.deepEqual(error, expectedError);
            }
        });

        it("should get database and run prepared statement with code and return result with expanded scopes", async () => {
            const statementBindStub = sinon.stub();

            databasePrepareStub.withArgs("SELECT * FROM Codes WHERE Username = ?").returns({
                bind: statementBindStub,
            });

            statementBindStub.withArgs("dummyUser").returns("getCodesForDummyUserStatement");

            databasePrepareStub.withArgs("DELETE FROM Codes WHERE ExpiresAt < datetime('now')").returns("clearExpiredCodesStatement");

            databaseBatchStub.withArgs(["clearExpiredCodesStatement", "getCodesForDummyUserStatement"]).resolves([
                "success",
                {
                    results: [
                        {
                            expected: "yes",
                            Scope: "a,b,c",
                        },
                        {
                            expected: "yes",
                            Scope: "a",
                        },
                    ],
                },
            ]);

            const result = await codeStorage.getAccessCodesByUsername("dummyUser");

            assert.deepEqual(result, [
                {
                    expected: "yes",
                    Scope: ["a", "b", "c"],
                },
                {
                    expected: "yes",
                    Scope: ["a"],
                },
            ]);
        });
    });
});
