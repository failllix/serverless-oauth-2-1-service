import { execSync } from "child_process";

import promptSync from "prompt-sync";
const prompt = promptSync({ sigint: true });
import crypto from "crypto";

const username = prompt("Enter a user- / loginname (e.g. jdoe): ");
const name = prompt("Enter the user's full name (e.g. John Doe): ");
const scopeString = prompt("Enter a comma separated list of scopes (e.g. 'MY_SCOPE1,MY_SCOPE2'): ");
const password = prompt("Enter the password: ", { echo: "*" });

const encodedPassword = new TextEncoder().encode(password);

const key = await crypto.subtle.importKey("raw", encodedPassword, { name: "PBKDF2" }, false, ["deriveBits"]);

const salt = crypto.getRandomValues(new Uint8Array(16));

const derivedBits = await crypto.subtle.deriveBits(
    {
        name: "PBKDF2",
        salt,
        iterations: 1000000,
        hash: "SHA-512",
    },
    key,
    512,
);

const passwordHash = btoa(new Uint8Array(derivedBits));

const user = {
    name,
    salt: btoa(salt),
    passwordToken: passwordHash,
    scope: ["userInfo", ...scopeString.split(",")],
};
console.log("Generated user:");
console.log(user);
console.log();

const stringifiedUser = JSON.stringify(user);
console.log(`Saving object with key '${username}': ${stringifiedUser}`);

const command = `wrangler kv:key put --env local --binding USER --local '${username}' '${stringifiedUser}'`;

console.log(`\nRunning command: ${command}`);
execSync(command);
