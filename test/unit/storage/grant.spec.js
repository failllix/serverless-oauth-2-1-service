import { assert } from "chai";
import { describe } from "mocha";
import sinon from "sinon";
import grantStorage from "../../../src/storage/grant.js";
import storageManager from "../../../src/storage/manager.js";

describe("Grant storage", () => {
    let databaseStub;
    let databasePrepareStub;

    beforeEach(() => {
        databasePrepareStub = sinon.stub();

        databaseStub = {
            prepare: databasePrepareStub,
        };

        sinon.stub(storageManager);

        storageManager.getDatabase.returns(databaseStub);
    });

    describe("getGrant", () => {
        it("should throw if running database statement rejects", async () => {
            const statementBindStub = sinon.stub();
            const statementRunStub = sinon.stub();

            databasePrepareStub.withArgs("SELECT * FROM Grants WHERE GrantId = ?").returns({
                bind: statementBindStub,
            });

            statementBindStub.withArgs("grantId").returns({ run: statementRunStub });

            const expectedError = new Error("Database connection is broken");
            statementRunStub.withArgs().rejects(expectedError);

            try {
                await grantStorage.getGrant("grantId");
                throw new Error("Function under test never threw an error ");
            } catch (error) {
                assert.deepEqual(error, expectedError);
            }
        });

        it("should throw if database returns more than one row for key", async () => {
            const statementBindStub = sinon.stub();
            const statementRunStub = sinon.stub();

            databasePrepareStub.withArgs("SELECT * FROM Grants WHERE GrantId = ?").returns({
                bind: statementBindStub,
            });

            statementBindStub.withArgs("grantId").returns({ run: statementRunStub });

            statementRunStub.withArgs().resolves({ results: [{ row: true }, { row: true, notExpected: true }] });

            try {
                await grantStorage.getGrant("grantId");
                throw new Error("Function under test never threw an error ");
            } catch (error) {
                assert.deepEqual(error.message, "Expected to receive only one grant with id 'grantId'");
            }
        });

        it("should get database and run prepared statement with refresh token and return result with expanded scopes", async () => {
            const statementBindStub = sinon.stub();
            const statementRunStub = sinon.stub();

            databasePrepareStub.withArgs("SELECT * FROM Grants WHERE GrantId = ?").returns({
                bind: statementBindStub,
            });

            statementBindStub.withArgs("grantId").returns({ run: statementRunStub });

            statementRunStub.withArgs().resolves({ results: [{ row: true, Scope: "a,b,c" }] });

            const result = await grantStorage.getGrant("grantId");

            assert.deepEqual(result, {
                row: true,
                Scope: ["a", "b", "c"],
            });
        });

        it("should get database and run prepared statement and return null if empty array was returned", async () => {
            const statementBindStub = sinon.stub();
            const statementRunStub = sinon.stub();

            databasePrepareStub.withArgs("SELECT * FROM Grants WHERE GrantId = ?").returns({
                bind: statementBindStub,
            });

            statementBindStub.withArgs("grantId").returns({ run: statementRunStub });

            statementRunStub.withArgs().resolves({ results: [] });

            const result = await grantStorage.getGrant("grantId");

            assert.deepEqual(result, null);
        });
    });

    describe("saveGrant", () => {
        it("should get database and run prepared statement", async () => {
            const statementBindStub = sinon.stub();
            const statementRunStub = sinon.stub();

            databasePrepareStub.withArgs("INSERT INTO Grants (GrantId, ClientId, Username, Scope) VALUES (?, ?, ?, ?)").returns({
                bind: statementBindStub,
            });

            statementBindStub.withArgs("someGrantId", "testClient", "testUser", "testScope1,testScope2").returns({ run: statementRunStub });

            statementRunStub.resolves();

            await grantStorage.saveGrant({
                grantId: "someGrantId",
                scope: ["testScope1", "testScope2"],
                clientId: "testClient",
                username: "testUser",
            });

            sinon.assert.calledOnceWithExactly(statementRunStub);
        });

        it("should throw if running statement rejects", async () => {
            const statementBindStub = sinon.stub();
            const statementRunStub = sinon.stub();

            databasePrepareStub.withArgs("INSERT INTO Grants (GrantId, ClientId, Username, Scope) VALUES (?, ?, ?, ?)").returns({
                bind: statementBindStub,
            });

            statementBindStub.withArgs("someGrantId", "testClient", "testUser", "testScope1,testScope2").returns({ run: statementRunStub });

            const expectedError = new Error("Cannot insert");
            statementRunStub.rejects(expectedError);

            try {
                await grantStorage.saveGrant({
                    grantId: "someGrantId",
                    scope: ["testScope1", "testScope2"],
                    clientId: "testClient",
                    username: "testUser",
                });
                throw new Error("Function under test never threw");
            } catch (error) {
                assert.equal(expectedError, error);
                sinon.assert.calledOnceWithExactly(statementRunStub);
            }
        });
    });

    describe("deleteGrant", () => {
        it("should get database and run prepared statement and return if update changed database", async () => {
            const statementBindStub = sinon.stub();
            const statementRunStub = sinon.stub();

            databasePrepareStub.withArgs("DELETE FROM Grants WHERE GrantId = ? AND Username = ?").returns({
                bind: statementBindStub,
            });

            statementBindStub.withArgs("someGrantId", "testUser").returns({ run: statementRunStub });

            statementRunStub.resolves({
                meta: {
                    changed_db: "db_status",
                },
            });

            const result = await grantStorage.deleteGrant({
                grantId: "someGrantId",
                username: "testUser",
            });

            assert.equal(result, "db_status");
            sinon.assert.calledOnceWithExactly(statementRunStub);
        });

        it("should throw if running statement rejects", async () => {
            const statementBindStub = sinon.stub();
            const statementRunStub = sinon.stub();

            databasePrepareStub.withArgs("DELETE FROM Grants WHERE GrantId = ? AND Username = ?").returns({
                bind: statementBindStub,
            });

            statementBindStub.withArgs("someGrantId", "testUser").returns({ run: statementRunStub });

            const expectedError = new Error("Cannot delete");
            statementRunStub.rejects(expectedError);

            try {
                await grantStorage.deleteGrant({
                    grantId: "someGrantId",
                    username: "testUser",
                });
                throw new Error("Function under test never threw");
            } catch (error) {
                assert.equal(expectedError, error);
                sinon.assert.calledOnceWithExactly(statementRunStub);
            }
        });
    });

    describe("getGrantsByUsername", () => {
        it("should get database and run prepared statement", async () => {
            const statementBindStub = sinon.stub();
            const statementRunStub = sinon.stub();

            databasePrepareStub.withArgs("SELECT * FROM Grants WHERE Username = ?").returns({
                bind: statementBindStub,
            });

            statementBindStub.withArgs("testUser").returns({ run: statementRunStub });

            statementRunStub.resolves({
                results: [
                    {
                        row: true,
                        Scope: "a,b,c",
                    },
                    {
                        row: true,
                        Scope: "b",
                    },
                ],
            });

            const result = await grantStorage.getGrantsByUsername("testUser");

            assert.deepEqual(result, [
                {
                    row: true,
                    Scope: ["a", "b", "c"],
                },
                {
                    row: true,
                    Scope: ["b"],
                },
            ]);
            sinon.assert.calledOnceWithExactly(statementRunStub);
        });

        it("should throw if running statement rejects", async () => {
            const statementBindStub = sinon.stub();
            const statementRunStub = sinon.stub();

            databasePrepareStub.withArgs("SELECT * FROM Grants WHERE Username = ?").returns({
                bind: statementBindStub,
            });

            statementBindStub.withArgs("testUser").returns({ run: statementRunStub });

            const expectedError = new Error("Cannot delete");
            statementRunStub.rejects(expectedError);

            try {
                await grantStorage.getGrantsByUsername("testUser");
                throw new Error("Function under test never threw");
            } catch (error) {
                assert.equal(expectedError, error);
                sinon.assert.calledOnceWithExactly(statementRunStub);
            }
        });
    });
});
