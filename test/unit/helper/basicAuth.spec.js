import { assert } from "chai";
import basicAuthHelper from "../../../src/helper/basicAuth.js";

const utf8Base64Encode = (str) => {
    const basicAuthBytes = new TextEncoder().encode(str);
    const binaryString = String.fromCodePoint(...basicAuthBytes);
    return btoa(binaryString);
};

describe("Basic auth helper", () => {
    describe("extractUserInfoFromBasicAuthHeader", () => {
        it("should extract username and password from a base64 encoded Basic auth header", () => {
            const result = basicAuthHelper.extractUserInfoFromBasicAuthHeader(`Basic ${btoa("myUser:secret")}`);
            assert.deepEqual(result, { username: "myUser", password: "secret" });
        });

        it("should support UTF-8 characters in username and password in a Basic auth header", () => {
            const result = basicAuthHelper.extractUserInfoFromBasicAuthHeader(`Basic ${utf8Base64Encode("myUser🙂:secret🔒")}`);
            assert.deepEqual(result, { username: "myUser🙂", password: "secret🔒" });
        });

        const invalidHeaders = ["", "Basicuser:password", "basic user:password", "Basic user:password ", " Basic user:password"];

        for (const headerValue of invalidHeaders) {
            it(`throws, if header value '${headerValue}' does not match Basic auth format`, () => {
                try {
                    basicAuthHelper.extractUserInfoFromBasicAuthHeader(headerValue);
                } catch (error) {
                    assert.equal(error.message, "Authorization header does not match expected format: 'Basic <base64_encoded_data>'.");
                }
            });
        }

        const invalidDecodedUserInfo = ["", " ", "user.password", "user password", "user/password", "user : password"];
        for (const decodedUserInfo of invalidDecodedUserInfo) {
            it(`throws, if decoded value '${decodedUserInfo}' does not match Basic auth format`, () => {
                try {
                    basicAuthHelper.extractUserInfoFromBasicAuthHeader(`Basic ${utf8Base64Encode(decodedUserInfo)}`);
                } catch (error) {
                    assert.equal(error.message, "Supplied Basic authentication data does not match expected format: '<username>:<password>'.");
                }
            });
        }
    });
});
