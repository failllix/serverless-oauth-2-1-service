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
    clientId,
    name,
    redirectUri,
};

console.log("Generated client:");
console.log(client);
console.log();
console.log(`Take note of your generated client id: ${client.clientId}`);
console.log();

const command = `wrangler d1 execute test-db --local --env local --command "INSERT INTO Clients (ClientId, Name, RedirectUri) VALUES ('${client.clientId}', '${client.name}', '${client.redirectUri}')"`;

console.log(`\nRunning command: ${command}`);

execSync(command);
