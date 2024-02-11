const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const { privateKey, publicKey } = crypto.generateKeyPairSync("ec", {
    namedCurve: "P-521",
});
const privateJwk = privateKey.export({ format: "jwk" });
const publicJwk = publicKey.export({ format: "jwk" });

privateJwk.key_ops = ["sign"];
publicJwk.key_ops = ["verify"];
publicJwk.use = "sig";
const privateStr = JSON.stringify(privateJwk);
const publicStr = JSON.stringify(publicJwk);

const pathToClientsKV = path.join(__dirname, "..", ".temp");
fs.mkdirSync(pathToClientsKV, { recursive: true });
fs.writeFileSync(
    path.join(pathToClientsKV, "privateKey.json"),
    JSON.stringify({
        SIGNING_KEY: privateStr,
    }),
);

console.log("Your private key (JWK representation): ");
console.log(privateStr);
console.log("");
console.log("Your public key (JWK representation): ");
console.log(publicStr);

console.log("");
console.log("---------- LOCAL DEVELOPMENT ----------");
console.log("");
console.log("Add the following to your .dev.vars file for local development:");
console.log("");
console.log(`SIGNING_KEY="${privateStr}"`);
console.log(`PUBLIC_KEY="${publicStr}"`);

console.log("");
console.log("---------- PRODUCTION ----------");
console.log("");
console.log("Add your public key to your wrangler.toml file:");
console.log("");
console.log(`PUBLIC_KEY="${publicStr.replaceAll('"', '\\"')}"`);
console.log("");
console.log("To add your signing key to your deployment run the command below. If this is your first deployment of the service, make sure to run 'npm run publish' before you try to update the secret.");
console.log("");
console.log("wrangler secret:bulk ./.temp/privateKey.json");
