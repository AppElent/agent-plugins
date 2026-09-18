import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pluginNames = ["mobile", "web", "workflow"];
const semver = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const kebab = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const trigger = /\bUse (?:when|whenever|this|it|before|after|for)\b/i;
const errors = [];
const seenSkills = new Map();

const json = (path) => JSON.parse(readFileSync(path, "utf8"));
const text = (path) => readFileSync(path, "utf8");

function parseFrontmatter(content) {
	const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!match) return null;
	const result = {};
	for (const line of match[1].split(/\r?\n/)) {
		const pair = line.match(/^([\w-]+):\s*(.*)$/);
		if (pair) result[pair[1]] = pair[2].replace(/^['"]|['"]$/g, "").trim();
	}
	return result;
}

function validatePlugin(name) {
	const dir = join(root, "plugins", name);
	const manifests = [
		join(dir, "plugin.json"),
		join(dir, ".claude-plugin", "plugin.json"),
		join(dir, ".codex-plugin", "plugin.json"),
	];
	for (const path of manifests) {
		if (!existsSync(path)) errors.push(`${relative(root, path)} missing`);
	}
	if (manifests.some((path) => !existsSync(path))) return;

	const parsed = manifests.map(json);
	for (const [index, manifest] of parsed.entries()) {
		if (manifest.name !== name)
			errors.push(`${relative(root, manifests[index])}: name must be ${name}`);
		if (!semver.test(manifest.version ?? ""))
			errors.push(`${relative(root, manifests[index])}: invalid semver`);
		if (!manifest.description)
			errors.push(`${relative(root, manifests[index])}: description missing`);
		if (!manifest.author?.name)
			errors.push(`${relative(root, manifests[index])}: author.name missing`);
	}
	if (new Set(parsed.map((manifest) => manifest.version)).size !== 1) {
		errors.push(`${name}: manifest versions differ`);
	}

	const skillsDir = join(dir, "skills");
	for (const entry of readdirSync(skillsDir, { withFileTypes: true })) {
		if (!entry.isDirectory()) continue;
		const skillName = entry.name;
		const path = join(skillsDir, skillName, "SKILL.md");
		if (!kebab.test(skillName))
			errors.push(`${name}/${skillName}: invalid skill folder name`);
		if (!existsSync(path)) {
			errors.push(`${name}/${skillName}: SKILL.md missing`);
			continue;
		}
		const frontmatter = parseFrontmatter(text(path));
		const content = text(path);
		if (!frontmatter) errors.push(`${name}/${skillName}: frontmatter missing`);
		else {
			if (frontmatter.name !== skillName)
				errors.push(`${name}/${skillName}: frontmatter name mismatch`);
			if (!frontmatter.description || !trigger.test(frontmatter.description))
				errors.push(`${name}/${skillName}: trigger description missing`);
		}
		for (const match of content.matchAll(
			/`([^`]*references\/self-improvement\.md)`/g,
		)) {
			const target = match[1].startsWith("skills/")
				? join(dir, match[1])
				: resolve(dirname(path), match[1]);
			if (!existsSync(target))
				errors.push(`${name}/${skillName}: missing reference ${match[1]}`);
		}
		if (seenSkills.has(skillName))
			errors.push(
				`${skillName}: duplicated in ${seenSkills.get(skillName)} and ${name}`,
			);
		seenSkills.set(skillName, name);
	}

	const commandsDir = join(dir, "commands");
	const routes = {
		mobile: { skill: "mobile" },
		web: { feature: "web-feature", project: "web-project" },
		workflow: {
			skill: "workflow",
			"cleaning-up-codebases": "cleaning-up-codebases",
			"handoff-session": "handoff-session",
			"model-selector": "model-selector",
			"review-app": "review-app",
			"review-session": "review-session",
			"self-improve": "self-improve",
			"the-orca-way": "the-orca-way",
			"upgrade-deps": "upgrade-deps",
			"usage-audit": "usage-audit",
		},
	};
	for (const entry of readdirSync(commandsDir, { withFileTypes: true })) {
		if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
		const command = entry.name.slice(0, -3);
		const target = routes[name][command];
		if (!target || !existsSync(join(skillsDir, target, "SKILL.md")))
			errors.push(`${name}: command ${command} has no routed skill`);
	}
}

for (const name of pluginNames) validatePlugin(name);

const workspacePackages = readdirSync(join(root, "packages"), {
	withFileTypes: true,
})
	.filter((entry) => entry.isDirectory())
	.map((entry) => json(join(root, "packages", entry.name, "package.json")).name)
	.sort();
if (
	JSON.stringify(workspacePackages) !==
	JSON.stringify(["@appelent/auth", "@appelent/cli", "@appelent/i18n"])
)
	errors.push(
		"workspace packages must be @appelent/auth, @appelent/cli, and @appelent/i18n",
	);

const codexMarket = json(join(root, ".agents", "plugins", "marketplace.json"));
const claudeMarket = json(join(root, ".claude-plugin", "marketplace.json"));
if (codexMarket.name !== "appelent" || claudeMarket.name !== "appelent")
	errors.push("marketplace name must be appelent");
for (const market of [codexMarket, claudeMarket]) {
	const names = market.plugins.map((entry) => entry.name);
	if (JSON.stringify(names) !== JSON.stringify(pluginNames))
		errors.push("marketplace plugins must be mobile, web, workflow in order");
}

const allowedLegacy = new Set(["MIGRATION.md", "scripts/validate.mjs"]);
const tracked = (() => {
	try {
		return execFileSync("git", ["ls-files"], { cwd: root, encoding: "utf8" })
			.trim()
			.split(/\r?\n/)
			.filter(Boolean);
	} catch {
		return [];
	}
})();
for (const file of tracked) {
	if (allowedLegacy.has(file) || !/\.(?:md|json|mjs|ts|tsx)$/.test(file))
		continue;
	const content = text(join(root, file));
	for (const legacy of [
		"AppElent/appelent-packages",
		"AppElent/appelent-skills",
		"/appelent:",
		"/toolbox:",
	]) {
		if (content.includes(legacy))
			errors.push(`${file}: legacy reference ${legacy}`);
	}
}

for (const error of errors) console.error(`ERROR: ${error}`);
console.log(
	errors.length ? `${errors.length} validation error(s)` : "marketplace ok",
);
process.exitCode = errors.length ? 1 : 0;
