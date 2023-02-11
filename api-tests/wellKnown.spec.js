const { expect } = require("chai");
const { requestPublicKeys } = require("./helper/requestHelper");

describe("The /.well-known endpoint", function () {
    it("should return public keys with the desired algorithm properties", async function () {
        const keysResponse = await requestPublicKeys({
            redirect_uri: "http://localhost:9999/",
            return_type: "body",
            username: "dummy",
            password: "dummy",
            client_id: "API_TEST_CLIENT",
            scope: ["API_TEST"],
        });
        expect(keysResponse.status).to.equal(200);
        keysResponse.data.keys.forEach((element) => {
            expect(element).to.deep.include({
                kty: "EC",
                crv: "P-521",
                key_ops: ["verify"],
                use: "sig",
            });
        });
    });
});
