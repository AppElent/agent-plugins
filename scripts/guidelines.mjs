import {
	mkdir,
	readdir,
	readFile,
	realpath,
	writeFile,
} from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export async function buildGuidelines(root = resolve(repo, "guidelines")) {
	const catalog = JSON.parse(
		await readFile(resolve(root, "catalog.json"), "utf8"),
	);
	if (
		catalog.schemaVersion !== 1 ||
		!/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/.test(catalog.version ?? "")
	)
		throw new Error("Invalid guideline catalog version");
	const names = Object.keys(catalog.sets ?? {}).sort();
	if (JSON.stringify(names) !== JSON.stringify(["general", "mobile", "web"]))
		throw new Error("Expected general, mobile, and web sets");
	const sets = {};
	const canonicalRoot = await realpath(root);
	for (const name of names) {
		const set = catalog.sets[name];
		if (
			!set ||
			![set.description, set.when].every(
				(value) =>
					typeof value === "string" &&
					value.length > 0 &&
					value.length <= 500 &&
					[...value].every(
						(char) => char.charCodeAt(0) >= 32 && char.charCodeAt(0) !== 127,
					),
			) ||
			!Array.isArray(set.files) ||
			!set.files.length ||
			set.files.length > 100 ||
			new Set(set.files).size !== set.files.length
		)
			throw new Error(`Invalid guideline set: ${name}`);
		const files = {};
		const declared = [...set.files].sort();
		const actual = (await readdir(resolve(root, name))).sort();
		if (JSON.stringify(actual) !== JSON.stringify(declared))
			throw new Error(`Catalog must include every file in ${name}`);
		for (const file of declared) {
			if (!/^[a-z][a-z0-9-]*\.md$/.test(file))
				throw new Error("Invalid guideline filename");
			const target = await realpath(resolve(root, name, file));
			const local = relative(canonicalRoot, target);
			if (
				isAbsolute(local) ||
				local === ".." ||
				local.startsWith(`..${sep}`) ||
				resolve(canonicalRoot, local) !== target
			)
				throw new Error("Guideline file escapes source directory");
			const content = await readFile(target, "utf8");
			if (!content.trim() || content.includes("\0"))
				throw new Error("Empty or invalid guideline file");
			files[file] = `${content.replaceAll("\r\n", "\n").trimEnd()}\n`;
		}
		sets[name] = { description: set.description, when: set.when, files };
	}
	const bundle = {
		schemaVersion: 1,
		name: "appelent-guidelines",
		version: catalog.version,
		sets,
	};
	if (Buffer.byteLength(JSON.stringify(bundle, null, 2)) > 2_000_000)
		throw new Error("Guideline bundle exceeds 2 MB");
	return bundle;
}

if (
	process.argv[1] &&
	resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
	const mode = process.argv[2] ?? "check";
	if (!["check", "pack"].includes(mode))
		throw new Error("Use guidelines.mjs check|pack");
	const bundle = await buildGuidelines();
	if (mode === "pack") {
		const output = resolve(
			repo,
			"dist",
			"guidelines",
			`appelent-guidelines-${bundle.version}.json`,
		);
		await mkdir(dirname(output), { recursive: true });
		await writeFile(output, `${JSON.stringify(bundle, null, 2)}\n`);
		console.log(output);
	} else console.log(`Guidelines ${bundle.version}: valid`);
}
