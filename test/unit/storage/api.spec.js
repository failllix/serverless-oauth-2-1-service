import { assert } from "chai";
import { describe } from "mocha";
import sinon from "sinon";
import apiStorage from "../../../src/storage/api.js";
import storageManager from "../../../src/storage/manager.js";

describe("API storage", () => {
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

    describe("getApisOfClient", () => {
        it("should throw if running database statement rejects", async () => {
            const statementBindStub = sinon.stub();
            const statementRunStub = sinon.stub();

            databasePrepareStub.withArgs("SELECT Apis.Uri FROM ClientApiAccess INNER JOIN Clients ON ClientApiAccess.ClientId = Clients.ClientId INNER JOIN Apis ON ClientApiAccess.Uri = Apis.Uri WHERE Clients.ClientId = ?").returns({
                bind: statementBindStub,
            });

            statementBindStub.withArgs("myClientId").returns({ run: statementRunStub });

            const expectedError = new Error("Database connection is broken");
            statementRunStub.withArgs().rejects(expectedError);

            try {
                await apiStorage.getApisOfClient("myClientId");
                throw new Error("Function under test never threw an error ");
            } catch (error) {
                assert.deepEqual(error, expectedError);
            }
        });

        it("should get database and run prepared statement and return list of client's APIs result", async () => {
            const statementBindStub = sinon.stub();
            const statementRunStub = sinon.stub();

            databasePrepareStub.withArgs("SELECT Apis.Uri FROM ClientApiAccess INNER JOIN Clients ON ClientApiAccess.ClientId = Clients.ClientId INNER JOIN Apis ON ClientApiAccess.Uri = Apis.Uri WHERE Clients.ClientId = ?").returns({
                bind: statementBindStub,
            });

            statementBindStub.withArgs("myClientId").returns({ run: statementRunStub });

            statementRunStub.withArgs().resolves({
                results: [
                    { row: true, Uri: "something" },
                    { row: true, Uri: "otherUri" },
                ],
            });

            const result = await apiStorage.getApisOfClient("myClientId");

            assert.deepEqual(result, ["something", "otherUri"]);
        });
    });
});
