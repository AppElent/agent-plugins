import assert from "node:assert/strict";
import {
	cpSync,
	mkdtempSync,
	readFileSync,
	realpathSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { validateFeatures, validateResources } from "../scripts/catalog.mjs";

const plugins = ["mobile", "web", "workflow", "development"];
test("each plugin resolves its resources without a source checkout or sibling plugin", () => {
	const base = realpathSync(tmpdir());
	const temporary = mkdtempSync(join(base, "appelent plugin isolated "));
	try {
		for (const plugin of plugins) {
			const isolated = join(temporary, plugin);
			cpSync(join("plugins", plugin), isolated, { recursive: true });
			assert.deepEqual(validateResources(isolated), [], plugin);
		}
	} finally {
		assert.equal(dirname(realpathSync(temporary)), base);
		rmSync(temporary, { recursive: true, force: true });
	}
});
test("feature IDs have exactly one owner and all procedure routes exist", () => {
	assert.deepEqual(validateFeatures(resolve(".")), []);
	const catalog = JSON.parse(
		readFileSync("plugins/development/features.json", "utf8"),
	);
	assert.equal(catalog.auth.plugin, "development");
	assert.equal(catalog.i18n.plugin, "development");
	assert.equal(catalog.baseline.procedure.skill, "web-baseline");
});
test("baseline step selectors survive the ownership migration", () => {
	const text = readFileSync("plugins/web/skills/web-baseline/SKILL.md", "utf8");
	const numbers = [...text.matchAll(/^### (\d+)\. /gm)].map((match) =>
		Number(match[1]),
	);
	assert.deepEqual(
		numbers,
		Array.from({ length: 16 }, (_, index) => index + 1),
	);
});
test("resource validation detects a missing link in an installed plugin", () => {
	const base = realpathSync(tmpdir());
	const temporary = mkdtempSync(join(base, "appelent plugin missing "));
	try {
		writeFileSync(join(temporary, "SKILL.md"), "[required](missing.md)");
		assert.equal(validateResources(temporary).length, 1);
	} finally {
		assert.equal(dirname(realpathSync(temporary)), base);
		rmSync(temporary, { recursive: true, force: true });
	}
});
