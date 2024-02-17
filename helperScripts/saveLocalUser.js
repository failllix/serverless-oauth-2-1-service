import { execSync } from "child_process";

import promptSync from "prompt-sync";
const prompt = promptSync({ sigint: true });
import crypto from "crypto";

const username = prompt("Enter a user- / loginname (e.g. jdoe): ");
const name = prompt("Enter the user's full name (e.g. John Doe): ");
const scopeString = prompt(
  "Enter a comma separated list of scopes (e.g. 'MY_SCOPE1,MY_SCOPE2'): "
);
const password = prompt("Enter the password: ", { echo: "*" });
const salt = btoa(crypto.getRandomValues(new Uint32Array(16)));

const rawSaltedPassword = new TextEncoder().encode(password + salt);
const hash = crypto.createHash("sha512").update(rawSaltedPassword);
const passwordHash = hash.digest("hex");

const user = {
  name,
  salt,
  passwordToken: passwordHash,
  scope: scopeString.split(","),
};
console.log("Generated user:");
console.log(user);
console.log();

console.log(`Saving object with key '${username}': ${JSON.stringify(user)}`);

execSync(
  `wrangler kv:key put --binding USER --local ${username} '${JSON.stringify(user)}'`
);
