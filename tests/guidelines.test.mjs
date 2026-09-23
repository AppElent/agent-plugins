import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { buildGuidelines } from "../scripts/guidelines.mjs";

const source = fileURLToPath(new URL("../guidelines", import.meta.url));
test("exports deterministic, self-contained guideline releases", async () => {
	const bundle = await buildGuidelines();
	assert.equal(bundle.schemaVersion, 1);
	assert.equal(bundle.name, "appelent-guidelines");
	assert.deepEqual(Object.keys(bundle.sets), ["general", "mobile", "web"]);
	assert.equal(JSON.stringify(bundle), JSON.stringify(await buildGuidelines()));
	assert.match(bundle.sets.general.files["ui-states.md"], /skeletons/);
	assert(!JSON.stringify(bundle).includes(resolve(source)));
});
test("rejects undeclared source documents", async () => {
	const dir = await mkdtemp(join(tmpdir(), "guidelines source "));
	try {
		await cp(source, dir, { recursive: true });
		await writeFile(join(dir, "web", "orphan.md"), "# Orphan\n");
		await assert.rejects(buildGuidelines(dir), /every file/);
	} finally {
		await rm(dir, { recursive: true, force: true });
	}
});
test("requires a new version syntax and valid filenames", async () => {
	const dir = await mkdtemp(join(tmpdir(), "guidelines source "));
	try {
		await cp(source, dir, { recursive: true });
		const catalog = JSON.parse(
			await readFile(join(dir, "catalog.json"), "utf8"),
		);
		catalog.version = "latest";
		await writeFile(join(dir, "catalog.json"), JSON.stringify(catalog));
		await assert.rejects(buildGuidelines(dir), /version/);
	} finally {
		await rm(dir, { recursive: true, force: true });
	}
});
