import promptSync from "prompt-sync";
const prompt = promptSync({ sigint: true });

import crypto from "crypto";
import { execSync } from "child_process";

const name = prompt("Enter the clients name: ");
const redirectUri = prompt("Enter the client's redirect URI: ");

const clientId = crypto.randomUUID();

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
