const prompt = require("prompt-sync")({ sigint: true });
const crypto = require("crypto");

const scopeString = prompt("Enter a comma separated list of scopes, e.g. 'MY_SCOPE1,MY_SCOPE2': ");
const password = prompt("Enter a password: ", { echo: "*" });
const salt = crypto.randomUUID();

const msgUint8 = new TextEncoder().encode(password + salt);
const hash = crypto.createHash("sha512").update(msgUint8);
const passwordHash = hash.digest("hex");
console.log("Save the following JSON object in your 'USERS' KV with the desired username as key:");

console.log({ pwdToken: passwordHash, salt, scope: scopeString.split(",") });
