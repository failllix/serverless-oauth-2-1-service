const { expect } = require("chai");
const {
    requestAccessCodeWithPayload: requestAccessCodeUsingConfig,
    requestAccessTokenWithPayload: requestAccessTokenWithConfig,
} = require("./helper/requestHelper");

describe("The /token endpoint", function () {
    it("should return a JWT using a code obtained using valid user credentials", async function () {
        const codeResponse = await requestAccessCodeUsingConfig({
            redirect_uri: "http://localhost:9999/",
            return_type: "body",
            username: "dummy",
            password: "dummy",
            client_id: "API_TEST_CLIENT",
            scope: ["API_TEST"],
        });
        expect(codeResponse.status).to.equal(200);
        const accessCode = codeResponse.data.redirect_uri.split("code=")[1];

        const tokenResponse = await requestAccessTokenWithConfig({
            code: accessCode,
            client_id: "API_TEST_CLIENT",
        });
        expect(tokenResponse.status).to.equal(200);
    });

    it("should return HTTP code 401 when other client ID is used to request token than code", async function () {
        const codeResponse = await requestAccessCodeUsingConfig({
            redirect_uri: "http://localhost:9999/",
            return_type: "body",
            username: "dummy",
            password: "dummy",
            client_id: "API_TEST_CLIENT",
            scope: ["API_TEST"],
        });
        expect(codeResponse.status).to.equal(200);
        const accessCode = codeResponse.data.redirect_uri.split("code=")[1];

        const tokenResponse = await requestAccessTokenWithConfig({
            code: accessCode,
            client_id: "OTHER_CLIENT",
        });
        expect(tokenResponse.status).to.equal(401);
    });
});
