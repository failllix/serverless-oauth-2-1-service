import promptSync from "prompt-sync";
const prompt = promptSync({ sigint: true });

import crypto from "crypto";
import { execSync } from "child_process";

const name = prompt("Enter the clients name: ");
const redirectUri = prompt("Enter the client's redirect URI: ");

const rawClientId = crypto.getRandomValues(new Uint8Array(32));

const hashedClientIdBuffer = await crypto.subtle.digest("SHA-256", rawClientId);

const clientId = Array.from(new Uint8Array(hashedClientIdBuffer))
  .map((b) => b.toString(16).padStart(2, "0"))
  .join("");

const client = {
  name,
  redirectUri,
};

console.log("Generated user:");
console.log(client);
console.log();
console.log(`Take note of your client id: ${clientId}`);
console.log();

const stringifiedClient = JSON.stringify(client);

console.log(`Saving object with key '${clientId}': ${stringifiedClient}`);

execSync(
  `wrangler kv:key put --env local --binding CLIENT --local '${clientId}' '${stringifiedClient}'`
);
