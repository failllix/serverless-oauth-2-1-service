const { expect } = require("chai");
const { requestAccessCodeWithPayload } = require("./helper/requestHelper");

describe("The /code endpoint", function () {
    it("should return an access code for valid user credentials", async function () {
        const response = await requestAccessCodeWithPayload({
            redirect_uri: "http://localhost:9999/",
            return_type: "body",
            username: "dummy",
            password: "dummy",
            client_id: "API_TEST_CLIENT",
            scope: ["API_TEST"],
        });

        expect(response.status).to.equal(200);
    });

    it("should return HTTP code 401 when an unknown username is used", async function () {
        const response = await requestAccessCodeWithPayload({
            redirect_uri: "http://localhost:9999/",
            return_type: "body",
            username: "invalidUsername",
            password: "dummy",
            client_id: "API_TEST_CLIENT",
            scope: ["API_TEST"],
        });

        expect(response.status).to.equal(401);
    });

    it("should return HTTP code 401 when a wrong password is supplied", async function () {
        const response = await requestAccessCodeWithPayload({
            redirect_uri: "http://localhost:9999/",
            return_type: "body",
            username: "dummy",
            password: "wrongPassword",
            client_id: "API_TEST_CLIENT",
            scope: ["API_TEST"],
        });

        expect(response.status).to.equal(401);
    });

    it("should return HTTP code 401 when an unknown client id is used", async function () {
        const response = await requestAccessCodeWithPayload({
            redirect_uri: "http://localhost:9999/",
            return_type: "body",
            username: "dummy",
            password: "dummy",
            client_id: "unknownClient",
            scope: ["API_TEST"],
        });

        expect(response.status).to.equal(401);
    });

    it("should return HTTP code 403 when scopes are requested that are not granted to the user", async function () {
        const response = await requestAccessCodeWithPayload({
            redirect_uri: "http://localhost:9999/",
            return_type: "body",
            username: "dummy",
            password: "dummy",
            client_id: "API_TEST_CLIENT",
            scope: ["WRONG_SCOPE"],
        });

        expect(response.status).to.equal(403);
    });
});
