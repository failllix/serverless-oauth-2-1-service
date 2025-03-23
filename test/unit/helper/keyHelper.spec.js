import { assert } from "chai";
import sinon from "sinon";
import keyHelper from "../../../src/helper/keyHelper.js";
import environmentVariables from "../../../src/storage/environmentVariables.js";

describe("Key Helper", () => {
    describe("verifyToken", () => {
        it("should return true if payload can be verified by imported public key", async () => {
            sinon.stub(crypto.subtle);
            sinon.stub(environmentVariables);

            environmentVariables.getPublicKey.returns(JSON.stringify({ public: true, key: "yes" }));

            crypto.subtle.importKey
                .withArgs(
                    "jwk",
                    { public: true, key: "yes" },
                    {
                        name: "ECDSA",
                        namedCurve: "P-521",
                    },
                    true,
                    ["verify"],
                )
                .resolves("importedPublicKey");

            crypto.subtle.verify.withArgs({ name: "ECDSA", hash: "SHA-512" }, "importedPublicKey", "signature", "payload").resolves(true);

            const verified = await keyHelper.verifyToken({
                uint8Signature: "signature",
                uint8TokenContent: "payload",
            });

            assert.isTrue(verified);

            sinon.assert.calledOnce(crypto.subtle.importKey);
        });

        it("should return false if payload cannot be verified by imported public key", async () => {
            sinon.stub(crypto.subtle);
            sinon.stub(environmentVariables);

            environmentVariables.getPublicKey.returns(JSON.stringify({ public: true, key: "yes" }));

            crypto.subtle.importKey
                .withArgs(
                    "jwk",
                    { public: true, key: "yes" },
                    {
                        name: "ECDSA",
                        namedCurve: "P-521",
                    },
                    true,
                    ["verify"],
                )
                .resolves("importedPublicKey");

            crypto.subtle.verify.withArgs({ name: "ECDSA", hash: "SHA-512" }, "importedPublicKey", "signature", "payload").resolves(true);

            const verified = await keyHelper.verifyToken({
                uint8Signature: "signature",
                uint8TokenContent: "payload",
            });

            assert.isTrue(verified);

            sinon.assert.calledOnce(crypto.subtle.importKey);
        });
    });
});
