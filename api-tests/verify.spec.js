const { expect } = require("chai");
const {
    requestAccessCodeWithPayload,
    requestAccessTokenWithPayload,
    requestVerificationWithPayload,
} = require("./helper/requestHelper");

describe("The /introspect endpoint", function () {
    it("should return a successful response, if the JWT supplied is valid", async function () {
        const codeResponse = await requestAccessCodeWithPayload({
            redirect_uri: "http://localhost:9999/",
            return_type: "body",
            username: "dummy",
            password: "dummy",
            client_id: "API_TEST_CLIENT",
            scope: ["API_TEST"],
        });
        expect(codeResponse.status).to.equal(200);
        const accessCode = codeResponse.data.redirect_uri.split("code=")[1];

        const tokenResponse = await requestAccessTokenWithPayload({
            code: accessCode,
            client_id: "API_TEST_CLIENT",
        });
        const jwt = tokenResponse.data.access_token;
        expect(tokenResponse.status).to.equal(200);

        const verifyResponse = await requestVerificationWithPayload({
            access_token: jwt,
        });
        expect(verifyResponse.status).to.equal(200);
        expect(verifyResponse.data).to.have.all.keys(
            "active",
            "scope",
            "client_id",
            "exp",
            "user_info"
        );
        expect(verifyResponse.data).to.deep.include({
            active: true,
            scope: ["API_TEST"],
            client_id: "API_TEST_CLIENT",
            user_info: { name: "dummy" },
        });
    });
});
