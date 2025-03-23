import environmentVariables from "../storage/environmentVariables.js";

async function getPublickey() {
    return await crypto.subtle.importKey(
        "jwk",
        JSON.parse(environmentVariables.getPublicKey()),
        {
            name: "ECDSA",
            namedCurve: "P-521",
        },
        true,
        ["verify"],
    );
}

async function verifyToken({ uint8Signature, uint8TokenContent }) {
    const key = await getPublickey();

    const verified = await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-512" }, key, uint8Signature, uint8TokenContent);
    return verified;
}

export default {
    verifyToken,
};
