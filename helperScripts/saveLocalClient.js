import promptSync from "prompt-sync";
const prompt = promptSync({ sigint: true });

import crypto from "crypto";
import { execSync } from "child_process";

const name = prompt("Enter the clients name: ");
const redirectUri = prompt("Enter the client's redirect URI: ");

console.log();
console.log("Displaying existing APIs");
console.log();
const displayExistingApisCommand = 'wrangler d1 execute test-db --local --env local --command "SELECT * FROM Apis"';
console.log(`\nRunning command: ${displayExistingApisCommand}`);
execSync(displayExistingApisCommand, { stdio: "inherit" });
console.log();

const audiences = prompt("Enter space-separated APIs (audiences) the client should be able to request tokens for (e.g. 'http://localhost:8787/me http://localhost:8789/resources'): ").split(" ");

const clientId = crypto.randomUUID();

const client = {
    clientId,
    name,
    redirectUri,
};

console.log();
console.log("Generated client:");
console.log(client);
console.log();
console.log(`Take note of your generated client id: ${client.clientId}`);
console.log();

const saveClientCommand = `wrangler d1 execute test-db --local --env local --command "
    BEGIN TRANSACTION;
    INSERT INTO Clients (ClientId, Name, RedirectUri) VALUES ('${client.clientId}', '${client.name}', '${client.redirectUri}'); 
    INSERT INTO ClientApiAccess (ClientId, Uri) VALUES ${audiences.map((audience) => `('${client.clientId}', '${audience}')`).join(",")}
    COMMIT;"`;

console.log(`\nRunning command: ${saveClientCommand}`);

execSync(saveClientCommand, { stdio: "inherit" });
