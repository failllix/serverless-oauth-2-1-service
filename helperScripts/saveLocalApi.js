import { execSync } from "child_process";

import promptSync from "prompt-sync";
const prompt = promptSync({ sigint: true });

const name = prompt("Enter the API Name: ");
const uri = prompt("Enter the API Uri: ");

const api = {
    name,
    uri,
};

const command = `wrangler d1 execute test-db --local --env local --command "INSERT INTO Apis (Name, Uri) VALUES ('${api.name}', '${api.uri}')"`;

console.log(`\nRunning command: ${command}`);
execSync(command, { stdio: "inherit" });
