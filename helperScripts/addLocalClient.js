const prompt = require("prompt-sync")({ sigint: true });
const fs = require("fs");
const path = require("path");

const name = prompt("Enter the clients name: ");
const clientId = prompt("Enter local client ID: ");
const redirect_uris = prompt("Enter comma-separated redirect URIs: ").split(",");
const pathToClientsKV = path.join(__dirname, "..", ".wrangler", "state", "kv", "CLIENTS");

fs.mkdirSync(pathToClientsKV, { recursive: true });
fs.writeFileSync(path.join(pathToClientsKV, clientId), JSON.stringify({ name, redirect_uris, client_id: clientId }));
