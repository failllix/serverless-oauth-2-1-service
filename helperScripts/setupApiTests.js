const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const pathToClientsKV = path.join(
    __dirname,
    "..",
    ".wrangler",
    "state",
    "kv",
    "CLIENTS"
);

const pathToUsersKV = path.join(
    __dirname,
    "..",
    ".wrangler",
    "state",
    "kv",
    "USERS"
);

fs.mkdirSync(pathToClientsKV, { recursive: true });
fs.writeFileSync(
    path.join(pathToClientsKV, "API_TEST_CLIENT"),
    JSON.stringify({
        name: "API test",
        redirect_uris: ["http://localhost:3000"],
    })
);

const salt = crypto.randomUUID();
const msgUint8 = new TextEncoder().encode("dummy" + salt);
const hash = crypto.createHash("sha512").update(msgUint8);
const passwordHash = hash.digest("hex");

fs.mkdirSync(pathToUsersKV, { recursive: true });
fs.writeFileSync(
    path.join(pathToUsersKV, "dummy"),
    JSON.stringify({
        pwdToken: passwordHash,
        salt,
        scope: ["API_TEST"],
    })
);
