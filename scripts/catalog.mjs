import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
export function frontmatter(text) {
	const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
	if (!match) return {};
	return Object.fromEntries(
		match[1]
			.split(/\r?\n/)
			.map((line) => /^([\w-]+):\s*(.*)$/.exec(line))
			.filter(Boolean)
			.map((match) => [match[1], match[2].replace(/^["']|["']$/g, "").trim()]),
	);
}
export function filesBelow(root) {
	return readdirSync(root, { withFileTypes: true }).flatMap((entry) =>
		entry.isDirectory()
			? filesBelow(join(root, entry.name))
			: [join(root, entry.name)],
	);
}
export function validateResources(plugin) {
	const errors = [];
	const base = resolve(plugin);
	for (const file of filesBelow(base).filter((path) => path.endsWith(".md"))) {
		const content = readFileSync(file, "utf8");
		const matches = [
			...content.matchAll(/\[[^\]\n]*\]\(([^)\s]+)\)/g),
			...content.matchAll(
				/\x60((?:\.\.?\/)+[^\x60\n ]+\.(?:md|json)(?:#[^\x60\n ]*)?)\x60/g,
			),
		];
		for (const match of matches) {
			const reference = match[1].split("#")[0];
			if (
				!reference ||
				/^(?:[a-z]+:|\/)/i.test(reference) ||
				/[<>]/.test(reference)
			)
				continue;
			const target = resolve(dirname(file), reference);
			const fromBase = relative(base, target);
			if (fromBase.startsWith("..") || isAbsolute(fromBase))
				errors.push(
					`${relative(base, file)}: reference escapes installed plugin: ${reference}`,
				);
			else if (!existsSync(target))
				errors.push(`${relative(base, file)}: missing reference: ${reference}`);
		}
	}
	return errors;
}
export function validateFeatures(root) {
	const errors = [];
	const catalog = JSON.parse(
		readFileSync(join(root, "plugins/development/features.json"), "utf8"),
	);
	const owners = new Map();
	for (const plugin of readdirSync(join(root, "plugins"))) {
		for (const file of filesBelow(join(root, "plugins", plugin)).filter(
			(path) => path.endsWith("/FEATURE.md") || path.endsWith("\\FEATURE.md"),
		)) {
			const content = readFileSync(file, "utf8");
			const fm = frontmatter(content);
			if (!/^[1-9]\d*$/.test(fm.version ?? ""))
				errors.push(`${file}: invalid feature version`);
			const headings = [...content.matchAll(/^## (.+)$/gm)].map((match) =>
				match[1].trim(),
			);
			if (
				JSON.stringify(headings) !==
				JSON.stringify([
					"What",
					"Stack",
					"Architecture",
					"Configuration",
					"Changelog",
				])
			)
				errors.push(`${file}: invalid feature sections`);
			if (fm.package && !/^@appelent\/[a-z][a-z0-9-]*$/.test(fm.package))
				errors.push(`${file}: invalid runtime package`);
			if (owners.has(fm.name))
				errors.push(`Duplicate feature owner: ${fm.name}`);
			owners.set(fm.name, {
				plugin,
				skill: dirname(file).split(/[\\/]/).at(-1),
			});
		}
	}
	for (const [id, entry] of Object.entries(catalog)) {
		if (
			JSON.stringify(owners.get(id)) !==
			JSON.stringify({ plugin: entry.plugin, skill: entry.skill })
		)
			errors.push(`Feature routing mismatch: ${id}`);
		for (const target of [entry, entry.procedure].filter(Boolean)) {
			if (
				!/^[a-z][a-z0-9-]*$/.test(target.plugin ?? "") ||
				!/^[a-z][a-z0-9-]*$/.test(target.skill ?? "") ||
				!existsSync(
					join(
						root,
						"plugins",
						target.plugin,
						"skills",
						target.skill,
						"SKILL.md",
					),
				)
			)
				errors.push(`Missing procedure owner: ${id}`);
		}
	}
	for (const id of owners.keys())
		if (!Object.hasOwn(catalog, id)) errors.push(`Unregistered feature: ${id}`);
	return errors;
}
