import { assert } from "chai";
import { describe } from "mocha";
import sinon from "sinon";
import clientStorage from "../../../src/storage/client.js";
import storageManager from "../../../src/storage/manager.js";

describe("Client storage", () => {
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

    describe("getClient", () => {
        it("should throw if running database statement rejects", async () => {
            const statementBindStub = sinon.stub();
            const statementRunStub = sinon.stub();

            databasePrepareStub.withArgs("SELECT * FROM Clients WHERE ClientId = ?").returns({
                bind: statementBindStub,
            });

            statementBindStub.withArgs("myClientId").returns({ run: statementRunStub });

            const expectedError = new Error("Database connection is broken");
            statementRunStub.withArgs().rejects(expectedError);

            try {
                await clientStorage.getClient("myClientId");
                throw new Error("Function under test never threw an error ");
            } catch (error) {
                assert.deepEqual(error, expectedError);
            }
        });

        it("should throw if database returns more than one row for key", async () => {
            const statementBindStub = sinon.stub();
            const statementRunStub = sinon.stub();

            databasePrepareStub.withArgs("SELECT * FROM Clients WHERE ClientId = ?").returns({
                bind: statementBindStub,
            });

            statementBindStub.withArgs("myClientId").returns({ run: statementRunStub });

            statementRunStub.withArgs().resolves({ results: [{ row: true }, { row: true, notExpected: true }] });

            try {
                await clientStorage.getClient("myClientId");
                throw new Error("Function under test never threw an error ");
            } catch (error) {
                assert.deepEqual(error.message, "Expected to receive only one client for id 'myClientId'");
            }
        });

        it("should get database and run prepared statement and return client result", async () => {
            const statementBindStub = sinon.stub();
            const statementRunStub = sinon.stub();

            databasePrepareStub.withArgs("SELECT * FROM Clients WHERE ClientId = ?").returns({
                bind: statementBindStub,
            });

            statementBindStub.withArgs("myClientId").returns({ run: statementRunStub });

            statementRunStub.withArgs().resolves({ results: [{ row: true }] });

            const result = await clientStorage.getClient("myClientId");

            assert.deepEqual(result, {
                row: true,
            });
        });

        it("should get database and run prepared statement and return null if empty array was returned", async () => {
            const statementBindStub = sinon.stub();
            const statementRunStub = sinon.stub();

            databasePrepareStub.withArgs("SELECT * FROM Clients WHERE ClientId = ?").returns({
                bind: statementBindStub,
            });

            statementBindStub.withArgs("myClientId").returns({ run: statementRunStub });

            statementRunStub.withArgs().resolves({ results: [] });

            const result = await clientStorage.getClient("myClientId");

            assert.deepEqual(result, null);
        });
    });
});
