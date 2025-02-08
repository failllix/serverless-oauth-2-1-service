import { assert } from "chai";
import { BAD_REQUEST, FORBIDDEN, FOUND, INTERNAL_SERVER_ERROR, NOT_FOUND, NOT_IMPLEMENTED, SUCCESS, UNAUTHORIZED } from "../../src/responses.js";

describe("Responses", () => {
    describe("Success", () => {
        it("it should return Response with status 200 including stringified payload and inject provided headers", async () => {
            const response = SUCCESS({
                jsonResponse: { someKey: "someValue", true: false, num: 100 },
                headers: { "X-custom": "foo" },
            });

            assert.equal(response.status, 200);
            assert.deepEqual(await response.json(), {
                someKey: "someValue",
                true: false,
                num: 100,
            });
            assert.equal(response.headers.get("X-custom"), "foo");
        });
    });

    describe("Found", () => {
        it("it should return Response with status 302 and 'Location' header pointing to provided URL", async () => {
            const response = FOUND("http://localhost/redirect");

            assert.equal(response.status, 302);
            assert.equal(response.headers.get("Location"), "http://localhost/redirect");
        });
    });

    describe("Bad request", () => {
        it("it should return Response with status 400 and text body containing provided message", async () => {
            const response = BAD_REQUEST("big failure");

            assert.equal(response.status, 400);
            assert.equal(await response.text(), "big failure");
        });
    });

    describe("Internal Server Error", () => {
        it("it should return Response with status 500 and text body containing provided message", async () => {
            const response = INTERNAL_SERVER_ERROR("internal failure");

            assert.equal(response.status, 500);
            assert.equal(await response.text(), "internal failure");
        });
    });

    describe("Not found", () => {
        it("it should return Response with status 404 and no body", async () => {
            const response = NOT_FOUND;

            assert.equal(response.status, 404);
            assert.equal(await response.text(), "");
        });
    });

    describe("Forbidden", () => {
        it("it should return Response with status 403 and no body", async () => {
            const response = FORBIDDEN;

            assert.equal(response.status, 403);
            assert.equal(await response.text(), "");
        });
    });

    describe("Unauthorized", () => {
        it("it should return Response with status 401 and no body", async () => {
            const response = UNAUTHORIZED;

            assert.equal(response.status, 401);
            assert.equal(await response.text(), "");
        });
    });

    describe("Not implemented", () => {
        it("it should return Response with status 501 and no body", async () => {
            const response = NOT_IMPLEMENTED;

            assert.equal(response.status, 501);
            assert.equal(await response.text(), "");
        });
    });
});
