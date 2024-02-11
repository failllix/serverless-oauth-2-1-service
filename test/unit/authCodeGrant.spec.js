import { assert } from "chai";
import { handleAuthCodeRequest } from "../../src/authCodeGrant.js";

const getDummyRequest = (body) => {
    return {
        json: () => Promise.resolve(body),
    };
};

describe("The auth code request handler", () => {
    describe("should return HTTP code 400 (bad request)", () => {
        it("when the request body is empty", async () => {
            const response = await handleAuthCodeRequest(getDummyRequest({}));

            assert.equal(response.status, 400);
            assert.equal(await response.text(), "Missing properties: redirect_uri, username, password, client_id, scope");
        });
    });
});
