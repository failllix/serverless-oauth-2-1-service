import { assert } from "chai";
import requestHandler from "../../src/index.js";

describe("App entry point (request handler)", () => {
    it("should return CORS headers for OPTIONS request", async () => {
        const dummyRequest = {
            method: "OPTIONS",
            url: "http://localhost:123",
        };
        const response = await requestHandler.fetch(dummyRequest, null, null);

        assert.deepEqual(Object.fromEntries(response.headers), {
            "access-control-allow-origin": "*",
            "access-control-allow-methods": "GET, HEAD, POST, OPTIONS",
            "access-control-allow-headers": "Content-Type",
        });
    });
});
