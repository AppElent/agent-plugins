import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dev = process.argv.includes("--dev");
const dryRun = process.argv.includes("--dry-run");
const source = dev ? repoRoot : "https://github.com/AppElent/agent-plugins.git";
const plugins = ["mobile", "web", "workflow", "development"];

const commands = [
	["plugin", "marketplace", "add", source],
	...plugins.map((name) => ["plugin", "add", `${name}@appelent`]),
];

for (const args of commands) {
	console.log(`codex ${args.map((part) => JSON.stringify(part)).join(" ")}`);
	if (!dryRun) execFileSync("codex", args, { stdio: "inherit" });
}

console.log("Start a new Codex task so the installed skills reload.");
