import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

test("both marketplaces expose the same purpose plugins", () => {
	const codex = readJson(".agents/plugins/marketplace.json");
	const claude = readJson(".claude-plugin/marketplace.json");
	assert.equal(codex.name, "appelent");
	assert.equal(claude.name, "appelent");
	assert.deepEqual(
		codex.plugins.map((entry) => entry.name),
		["mobile", "web", "workflow", "development"],
	);
	assert.deepEqual(
		claude.plugins.map((entry) => entry.name),
		["mobile", "web", "workflow", "development"],
	);
});

test("Codex setup supports a side-effect-free development preview", () => {
	const output = execFileSync(
		process.execPath,
		["scripts/setup-codex.mjs", "--dev", "--dry-run"],
		{ encoding: "utf8" },
	);
	assert.match(output, /plugin.*marketplace.*add/);
	for (const name of ["mobile", "web", "workflow", "development"])
		assert.match(output, new RegExp(`${name}@appelent`));
});
