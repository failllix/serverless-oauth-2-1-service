import { assert } from "chai";
import { describe } from "mocha";
import sinon from "sinon";
import storageManager from "../../../src/storage/manager.js";
import refreshTokenStorage from "../../../src/storage/refreshToken.js";

describe("Refresh token storage", () => {
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

    describe("getRefreshToken", () => {
        it("should throw if running database statement rejects", async () => {
            const statementBindStub = sinon.stub();
            const statementRunStub = sinon.stub();

            databasePrepareStub.withArgs("SELECT * FROM RefreshTokens WHERE RefreshTokenId = ?").returns({
                bind: statementBindStub,
            });

            statementBindStub.withArgs("refreshTokenId").returns({ run: statementRunStub });

            const expectedError = new Error("Database connection is broken");
            statementRunStub.withArgs().rejects(expectedError);

            try {
                await refreshTokenStorage.getRefreshToken("refreshTokenId");
                throw new Error("Function under test never threw an error ");
            } catch (error) {
                assert.deepEqual(error, expectedError);
            }
        });

        it("should throw if database returns more than one row for key", async () => {
            const statementBindStub = sinon.stub();
            const statementRunStub = sinon.stub();

            databasePrepareStub.withArgs("SELECT * FROM RefreshTokens WHERE RefreshTokenId = ?").returns({
                bind: statementBindStub,
            });

            statementBindStub.withArgs("refreshTokenId").returns({ run: statementRunStub });

            statementRunStub.withArgs().resolves({ results: [{ row: true }, { row: true, notExpected: true }] });

            try {
                await refreshTokenStorage.getRefreshToken("refreshTokenId");
                throw new Error("Function under test never threw an error ");
            } catch (error) {
                assert.deepEqual(error.message, "Expected to receive only one refresh token with id 'refreshTokenId'");
            }
        });

        it("should get database and run prepared statement with refresh token and return result with expanded scopes and converted Active flag", async () => {
            const statementBindStub = sinon.stub();
            const statementRunStub = sinon.stub();

            databasePrepareStub.withArgs("SELECT * FROM RefreshTokens WHERE RefreshTokenId = ?").returns({
                bind: statementBindStub,
            });

            statementBindStub.withArgs("refreshTokenId").returns({ run: statementRunStub });

            statementRunStub.withArgs().resolves({ results: [{ row: true, Scope: "a,b,c", Active: 1 }] });

            const result = await refreshTokenStorage.getRefreshToken("refreshTokenId");

            assert.deepEqual(result, {
                row: true,
                Scope: ["a", "b", "c"],
                Active: true,
            });
        });

        it("should get database and run prepared statement and return null if empty array was returned", async () => {
            const statementBindStub = sinon.stub();
            const statementRunStub = sinon.stub();

            databasePrepareStub.withArgs("SELECT * FROM RefreshTokens WHERE RefreshTokenId = ?").returns({
                bind: statementBindStub,
            });

            statementBindStub.withArgs("refreshTokenId").returns({ run: statementRunStub });

            statementRunStub.withArgs().resolves({ results: [] });

            const result = await refreshTokenStorage.getRefreshToken("refreshTokenId");

            assert.deepEqual(result, null);
        });
    });

    describe("saveRefreshToken", () => {
        it("should get database and run prepared statement", async () => {
            const statementBindStub = sinon.stub();
            const statementRunStub = sinon.stub();

            databasePrepareStub.withArgs("INSERT INTO RefreshTokens (RefreshTokenId, ClientId, GrantId, Username, Scope) VALUES (?, ?, ?, ?, ?)").returns({
                bind: statementBindStub,
            });

            statementBindStub.withArgs("myRefreshToken", "testClient", "someGrantId", "testUser", "testScope1,testScope2").returns({ run: statementRunStub });

            statementRunStub.resolves();

            await refreshTokenStorage.saveRefreshToken({
                refreshTokenId: "myRefreshToken",
                scope: ["testScope1", "testScope2"],
                clientId: "testClient",
                grantId: "someGrantId",
                username: "testUser",
            });

            sinon.assert.calledOnceWithExactly(statementRunStub);
        });

        it("should throw if running statement rejects", async () => {
            const statementBindStub = sinon.stub();
            const statementRunStub = sinon.stub();

            databasePrepareStub.withArgs("INSERT INTO RefreshTokens (RefreshTokenId, ClientId, GrantId, Username, Scope) VALUES (?, ?, ?, ?, ?)").returns({
                bind: statementBindStub,
            });

            statementBindStub.withArgs("myRefreshToken", "testClient", "someGrantId", "testUser", "testScope1,testScope2").returns({ run: statementRunStub });

            const expectedError = new Error("Cannot insert");
            statementRunStub.rejects(expectedError);

            try {
                await refreshTokenStorage.saveRefreshToken({
                    refreshTokenId: "myRefreshToken",
                    scope: ["testScope1", "testScope2"],
                    clientId: "testClient",
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

    describe("deactivateRefreshToken", () => {
        it("should get database and run prepared statement and return if update changed database", async () => {
            const statementBindStub = sinon.stub();
            const statementRunStub = sinon.stub();

            databasePrepareStub.withArgs("UPDATE RefreshTokens SET Active = 0 WHERE Active = 1 AND RefreshTokenId = ? AND Username = ?").returns({
                bind: statementBindStub,
            });

            statementBindStub.withArgs("myRefreshToken", "testUser").returns({ run: statementRunStub });

            statementRunStub.resolves({
                meta: {
                    changed_db: "db_status",
                },
            });

            const result = await refreshTokenStorage.deactivateRefreshToken({
                refreshTokenId: "myRefreshToken",
                username: "testUser",
            });

            assert.equal(result, "db_status");
            sinon.assert.calledOnceWithExactly(statementRunStub);
        });

        it("should throw if running statement rejects", async () => {
            const statementBindStub = sinon.stub();
            const statementRunStub = sinon.stub();

            databasePrepareStub.withArgs("UPDATE RefreshTokens SET Active = 0 WHERE Active = 1 AND RefreshTokenId = ? AND Username = ?").returns({
                bind: statementBindStub,
            });

            statementBindStub.withArgs("myRefreshToken", "testUser").returns({ run: statementRunStub });

            const expectedError = new Error("Cannot update");
            statementRunStub.rejects(expectedError);

            try {
                await refreshTokenStorage.deactivateRefreshToken({
                    refreshTokenId: "myRefreshToken",
                    username: "testUser",
                });
                throw new Error("Function under test never threw");
            } catch (error) {
                assert.equal(expectedError, error);
                sinon.assert.calledOnceWithExactly(statementRunStub);
            }
        });
    });

    describe("getRefreshTokensByUsername", () => {
        it("should return all access codes by username", async () => {
            const statementBindStub = sinon.stub();
            const statementRunStub = sinon.stub();

            databasePrepareStub.withArgs("SELECT * FROM RefreshTokens WHERE Username = ?").returns({
                bind: statementBindStub,
            });

            statementBindStub.withArgs("username").returns({ run: statementRunStub });

            statementRunStub.withArgs().resolves({
                results: [
                    { row: true, Scope: "a,b,c", Active: 1 },
                    { row: true, Scope: "a", Active: 0 },
                ],
            });

            const result = await refreshTokenStorage.getRefreshTokensByUsername("username");

            assert.deepEqual(result, [
                {
                    row: true,
                    Scope: ["a", "b", "c"],
                    Active: true,
                },
                {
                    row: true,
                    Scope: ["a"],
                    Active: false,
                },
            ]);
        });

        it("should throw if running statement rejects", async () => {
            const statementBindStub = sinon.stub();
            const statementRunStub = sinon.stub();

            databasePrepareStub.withArgs("SELECT * FROM RefreshTokens WHERE Username = ?").returns({
                bind: statementBindStub,
            });

            statementBindStub.withArgs("username").returns({ run: statementRunStub });

            const expectedError = new Error("Cannot select");
            statementRunStub.rejects(expectedError);

            try {
                await refreshTokenStorage.getRefreshTokensByUsername("username");
                throw new Error("Function under test never threw");
            } catch (error) {
                assert.equal(expectedError, error);
                sinon.assert.calledOnceWithExactly(statementRunStub);
            }
        });
    });
});
