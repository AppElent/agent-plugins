# Scan commands

Adapt to the repo. Every command below is read-only. Run the ecosystem-specific
tools first — they are far more accurate than grep — and use grep only for the
signals no tool reports.

## Establish the baseline first

Find the real commands in `package.json` scripts / `Makefile` / `justfile` /
`pyproject.toml`, then record their output verbatim before any change.

| Ecosystem | Lint | Test | Build |
|---|---|---|---|
| Node/TS | `pnpm lint`, `biome check .`, `eslint .` | `pnpm test` | `pnpm build`, `pnpm typecheck` |
| Python | `ruff check .` | `pytest -q` | `mypy .` |
| Go | `go vet ./...` | `go test ./...` | `go build ./...` |
| Rust | `cargo clippy` | `cargo test` | `cargo build --release` |

## Dead code

**Node / TypeScript**

```bash
npx knip                      # unused files, exports, deps, types — best single signal
npx depcheck                  # unused + missing dependencies
npx ts-prune                  # unused exports (older, noisier than knip)
npx madge --circular src/     # circular imports
```

**Python**

```bash
vulture . --min-confidence 80
ruff check --select F401,F841 .
pip-extra-reqs . ; pip-missing-reqs .
```

**Go / Rust**

```bash
deadcode ./...                # golang.org/x/tools/cmd/deadcode
staticcheck ./...
cargo +nightly udeps
cargo machete
```

## Language-agnostic grep signals

```bash
# TODO/FIXME/HACK/XXX, with counts
grep -rInE "\b(TODO|FIXME|HACK|XXX)\b" --exclude-dir={node_modules,.git,dist,build} . | wc -l

# Swallowed errors
grep -rInE "catch\s*\([^)]*\)\s*\{\s*\}|except.*:\s*pass|_ = err" --exclude-dir={node_modules,.git} .

# Escape hatches
grep -rIn -e eslint-disable -e @ts-ignore -e @ts-expect-error -e biome-ignore -e "type: ignore" --exclude-dir={node_modules,.git} .

# Files over 500 lines
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.py" -o -name "*.go" -o -name "*.rs" \) \
  -not -path "*/node_modules/*" -not -path "*/.git/*" -exec wc -l {} + | sort -rn | head -30

# Commented-out code: comment lines ending in ; { } or ,
grep -rInE "^\s*(//|#)\s*.*[;{},]\s*$" --exclude-dir={node_modules,.git} . | head -50
```

## Orphaned assets

Every file under an assets directory that no source file mentions by name:

```bash
for f in $(find static public assets -type f 2>/dev/null); do
  n=$(basename "$f")
  grep -rqI --exclude-dir={node_modules,.git,dist,build} -- "$n" \
    --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
    --include="*.css" --include="*.html" --include="*.md" . || echo "ORPHAN: $f"
done
```

Check CSS the same way — a selector with no matching class or id in any template
is dead. Do this before touching `!important`: most `!important` flags exist to
beat a rule that is itself dead, and disappear with it.

## Churn and staleness

```bash
# Files nobody has touched in a year — candidates for "is this still real?"
git log --since="1 year ago" --name-only --format= | sort -u > /tmp/recent.txt
git ls-files | sort > /tmp/all.txt
comm -23 /tmp/all.txt /tmp/recent.txt

# Hotspots — high churn plus high complexity is where debt actually hurts
git log --since="1 year ago" --name-only --format= | sort | uniq -c | sort -rn | head -20

# Branches nobody will return to
git branch -a --sort=-committerdate --format="%(committerdate:short) %(refname:short)"
```

## Duplication

```bash
npx jscpd --min-lines 10 --reporters console src/
# or: pmd cpd --minimum-tokens 100 --dir src
```

## Dependencies

```bash
npx npm-check-updates      # how far behind
pnpm why <pkg>             # direct or transitive
pnpm audit --prod
```

A dependency used at exactly one call site for one function is a finding: name
the call site and the line count of the inline replacement.
