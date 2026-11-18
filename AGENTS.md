# AGENTS.md

For agents and people changing this repository: the CLI, the template it installs, and the
checks that hold both to account. It is not about building an app. In a project that `init`
wrote, read [template/base/AGENTS.md](template/base/AGENTS.md), which every project receives
as its own `AGENTS.md`.

Reading files under `template/base/` can make Claude Code load that tree's `CLAUDE.md`, rules
and skills. They describe a scaffolded project; `pnpm validate`, `apps/` and `supabase/` do
not exist at this root. Like them, this file is advisory: the hooks in [.claude/](.claude/),
the checks in [scripts/](scripts/) and CI enforce. An agent other than Claude Code runs none of
the hooks, so the rules below are its own to keep, and CI still runs every check.

This repository calls itself the **factory**, and a project `init` wrote a **consumer**. A path
in the shipped docs, such as `tools/check-secrets.mjs`, is where a file lands in a project;
here it is `template/base/tools/check-secrets.mjs` ([template/README.md](template/README.md)).

## What lives where

| Path | What it holds |
|---|---|
| [installer/](installer/) | The CLI published to npm; [installer/cli.mjs](installer/cli.mjs) is the entry point. Node built-ins only. |
| [template/](template/) | What `init` writes, and the data `update`, `doctor` and `eject` read ([template/README.md](template/README.md)). |
| [scripts/](scripts/) | This repository's checks (`check-*.mjs`, `hygiene.mjs`), generators (`generate-*.mjs`), evals, CI helpers (`ci/`), shared code (`lib/`), registers (`*.json`). |
| [tests/](tests/) | The factory's test suites and the can-fail-proof registry ([tests/README.md](tests/README.md)). |
| [.claude/](.claude/), [.github/](.github/) | This repository's own Claude Code hooks and CI. A project gets `template/base/.claude/` and `template/base/github/`. |
| [plugin/](plugin/), [.claude-plugin/](.claude-plugin/) | The Claude Code plugin, and the marketplace entry that points at it. |
| [docs/](docs/), [docs-site/](docs-site/) | Pages about this repository and its CLI, indexed in [docs/README.md](docs/README.md), with the release notes before 2.0.0 in [docs/changelog/](docs/changelog/); the documentation site, which renders the template's docs and those pages in place ([docs-site/README.md](docs-site/README.md)). |
| [design/](design/) | Dated fact records, specs, proposals and research ([design/README.md](design/README.md)). |
| [README.md](README.md), [CHANGELOG.md](CHANGELOG.md), [CONTRIBUTING.md](CONTRIBUTING.md) | The front page (npm shows it too), the release notes, and every check CI blocks on. |
| [ROADMAP.md](ROADMAP.md), [GOVERNANCE.md](GOVERNANCE.md), [SECURITY.md](SECURITY.md), [SUPPORT.md](SUPPORT.md), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md), [CITATION.cff](CITATION.cff) | Project policy and community files. |
| [LICENSE](LICENSE), [LICENSES/](LICENSES/), [REUSE.toml](REUSE.toml) | Apache-2.0 for the repository; everything under `template/` is "Apache-2.0 OR 0BSD". |
| [package.json](package.json), [pnpm-lock.yaml](pnpm-lock.yaml), [pnpm-workspace.yaml](pnpm-workspace.yaml) | The npm manifest (`bin`, `files`) and the root dev toolchain. This root is not a workspace. |
| [eslint.config.mjs](eslint.config.mjs), [tsconfig.json](tsconfig.json), [knip.json](knip.json), [renovate.json](renovate.json) | Lint, typecheck and dead-code settings for the factory's own code; Renovate's update policy. |
| [.gitattributes](.gitattributes), [.gitignore](.gitignore) | Line endings, binary and generated-file rules; ignores. |
| `AGENTS.md`, [CLAUDE.md](CLAUDE.md) | This file, and the import of it Claude Code reads. `pnpm bootstrap` (`init --consume`) replaces both with the scaffold's own. |

Only `installer/`, `template/` and a few root files go into the npm package (`files` in
`package.json`); nothing else here ships.

## The guards you will meet

- **Write guard.** [pretool-write-guard.mjs](.claude/hooks/pretool-write-guard.mjs) refuses
  Edit and Write on the enforcement surface: `template/base/tools/`,
  `template/base/.claude/hooks/`, `scripts/`, `installer/`, `template/migrations.json`,
  `.github/workflows/`, `tests/canary/injections.json` and `.claude/`. The escape is
  `HARNESS_ALLOW_SELF_EDIT=1` in the environment Claude Code started with, a human-in-the-loop
  act by design, so the change is deliberate and lands in a reviewed diff. Setting it from a
  shell command does not reach the hook. A path inside an agent's worktree
  (`.claude/worktrees/<id>/`) is judged against that worktree, so the same paths are protected
  there and the rest are open.
- **No shell writes around it.** Some redirects, copies and interpreter writes into those
  paths get past the bash guard. Using that gap defeats the guardrail this repository exists to
  demonstrate. When such a path needs a change, describe it, with draft text, for a human.
- **Bash guard.** [pretool-bash-guard.mjs](.claude/hooks/pretool-bash-guard.mjs) re-exports the
  guard every project gets. It matches command text, quoted strings, commit messages and
  `grep` patterns included. Commit with `-F` and a message file, remove scratch directories
  with `rm -r`, and run a script from a file rather than through `node -e`.
- **Edit check.** [posttool-factory-check.mjs](.claude/hooks/posttool-factory-check.mjs) runs
  the shipped provenance check on edits under a template layer: an uncited decision site of a
  mandatory class, such as an RLS policy, blocks the edit until it carries a `// SOURCE:` line.
- **Stop gate.** [stop-factory-gate.mjs](.claude/hooks/stop-factory-gate.mjs) runs most of
  CI's checks (its `STEPS` list says which), eslint, tsc, knip, Biome and the `tests/gates` and
  `tests/hooks` suites before a turn ends. It is slow on a small machine, so run your checks
  first. What it leaves out, such as the installer and eval suites, `check-obligations` and the
  docs-site build, runs only in CI: run those yourself when your change reaches them.

## Which checks to run

[CONTRIBUTING.md, "Local development"](CONTRIBUTING.md#local-development) has the commands per
kind of change and, under "Everything CI blocks on", the whole list. Run all of it before
review. In short:

| You changed | Run |
|---|---|
| A doc: README, CONTRIBUTING, CHANGELOG, a page under `template/` | `node scripts/check-claims.mjs`; `node scripts/hygiene.mjs`; `GITHUB_BASE_REF=main CI=true node --test "tests/gates/**/*.test.mjs"` |
| `README.md` | the doc checks; `node scripts/check-reuse.mjs`; `GITHUB_BASE_REF=main CI=true node --test tests/installer/readme-recording.test.mjs` |
| A page under `template/base/docs/`, `template/modules/*/docs/` or `docs/`, or a change in `docs-site/` | the doc checks; `pnpm --dir docs-site install --frozen-lockfile`; `pnpm --dir docs-site run build` |
| `docs/cli.md` | `GITHUB_BASE_REF=main CI=true node --test tests/gates/cli-docs-sync.test.mjs tests/installer/demo-eject.test.mjs` |
| `design/` | `node scripts/check-claims.mjs`; `node scripts/check-obligations.mjs` |
| `installer/` | `GITHUB_BASE_REF=main CI=true node --test "tests/installer/**/*.test.mjs"`; `node scripts/check-syntax.mjs`; `node scripts/hygiene.mjs` |
| A hook in `template/base/.claude/hooks/` | `GITHUB_BASE_REF=main CI=true node --test "tests/hooks/**/*.test.mjs"` |
| A gate in `template/base/tools/` | its own tests (`tests/canary/injections.json` names them), then the `tests/gates` suite |
| A new gate, guard rule or CI job | its can-fail proof (`tests/canary/injections.json`; a guard rule's goes in `tests/hooks/hook-contract.test.mjs`); `node scripts/check-canary-coverage.mjs` |
| `template/base/.claude/{agents,commands,skills}/` or the root `LICENSE` | `node scripts/generate-plugin-folder.mjs --write`; `node scripts/check-plugin-manifest.mjs` |
| Anything under `template/` | `node scripts/generate-released-shas.mjs --current`, commit what changes; `node scripts/check-released-shas.mjs` |
| A demo copy of a seeded register | `node scripts/check-demo-index.mjs --write` |
| `package.json`, `CITATION.cff`, a plugin manifest | `node scripts/check-release-lockstep.mjs`; `node scripts/check-reuse.mjs`; `node scripts/check-plugin-manifest.mjs` |
| Factory code: `installer/`, `scripts/`, `tests/`, gates, hooks | after a root `pnpm install`: `pnpm exec eslint . --max-warnings 0`; `pnpm exec tsc --noEmit`; `pnpm exec knip` |

`GITHUB_BASE_REF=main CI=true` gives a local run the shape of a pull-request run; without it
the suites check less ([tests/README.md](tests/README.md) says why).

## Owned and generated files

- **Owned files.** Hooks, gate scripts, workflows and nearly every shipped doc are owned: each
  release records their bytes in `template/shas/<version>.json`, so `update` can tell an
  untouched copy from an edited one. After an edit under `template/`, run
  `node scripts/generate-released-shas.mjs --current` and commit what it writes with the edit.
  Never edit `template/shas/` or `template/base/tools/lib/planted-shas.json` by hand.
- **New template files** reach existing projects on their next `update`. A new seeded file
  must also be registered in `template/migrations.json` or `scripts/check-seeded-migrations.mjs`
  (both protected), or `update` plants it everywhere. Adding one is the maintainer's call.
- **Generated copies.** `plugin/agents/`, `plugin/commands/`, `plugin/skills/` and
  `plugin/LICENSE` come from `node scripts/generate-plugin-folder.mjs --write`; edit the source
  in `template/base/.claude/` and regenerate. Also generated: `template/demo-index.json`
  (`node scripts/check-demo-index.mjs --write`), the slice skill's marked code regions
  (`node scripts/generate-skill-references.mjs --write`) and the template docs whose banner
  says `GENERATED` (`node tools/gen-conformance-docs.mjs`, run in `template/base/`).
- **No renames.** Move or rename a tracked file only with the maintainer: install manifests
  record shipped paths, checks read paths exactly, shipped files cite `design/` records by path,
  and GitHub does not redirect a moved file.

## Numbers and claims

- **Numbers.** A number in prose must be one `scripts/check-claims.mjs` can recompute, or it
  should not be written. It recomputes the README's counts, and the chain length wherever
  `CONTRIBUTING.md`, `design/` or the shipped docs state it. Where it does not read (`docs/`,
  `docs-site/`, a folder README), write no live count: link the source or give the command
  that prints it. Pin a figure from history to a tag, with the command that reproduces it.
- **Timings.** No wall-clock figure near "chain", "validate", "Stop hook" or "turn end" unless
  it is the committed measurement in `scripts/chain-budget.json`.
- **History stays in the CHANGELOG.** Never rewrite an old entry to today's numbers, never copy
  one into `design/`, `template/base/docs/`, `CONTRIBUTING.md` or `template/base/AGENTS.md`
  (all read as present tense), and keep release history out of instructions and comments.
- **Claims.** The compliance registers are mappings: never claim a certification, conformance
  or maturity level; `scripts/hygiene.mjs` fails on the affirmative forms. No
  "production-ready", "enterprise-grade", "battle-tested", "seamless", bare "secure", "can't be
  bypassed", "every line reviewed" or "fully autonomous". The guards are tamper-evident, not
  tamper-proof. Put the limit next to the claim, and say what is not covered or measured.
- **Pinned text.** Checks hold some wording exactly: the README's Status line, counts,
  compliance lines, measured figures, GIF embed and the first `sh` block that runs
  `pnpm install`; CONTRIBUTING's `## Local development` section; the gates catalog's
  `### N. name — ` headings; `template/base/AGENTS.md`'s gate lists and line budget;
  `docs/cli.md`; and the `design/` sentences `check-obligations` matches as raw text. When a
  check names a pin, keep it.

## Commits, pull requests and the changelog

- **Conventional Commits:** a lower-case subject that states the change (`docs(readme): …`)
  and a body that says why and lists the parts, wrapped at 72 columns.
- **Accountability.** Agents write most changes here; a human maintainer reviews, merges and
  releases them and answers for them, and the gates judge both. Disclose agent help with a
  `Co-Authored-By:` trailer.
- **Tests come with the change.** A bug fix brings the test that would have caught it, and a
  new gate or guard rule its can-fail proof ([CONTRIBUTING.md](CONTRIBUTING.md), "Testing
  policy"). Every change reaches `main` through a pull request; say which checks you ran.
- **Changelog entries** go in the section of the release being prepared,
  `## [x.y.z] — YYYY-MM-DD`, under Keep a Changelog groups. Each opens with a bold lead
  sentence, and work left undone goes under "What stays open". Opening a section belongs to
  the version bump, which the maintainer makes: it moves the version in `package.json`, the
  plugin manifest, `CITATION.cff` and the protected hook stamps
  ([CONTRIBUTING.md](CONTRIBUTING.md), "Releases"). When the newest section is already
  tagged, do not open a new one or add to the released one: put the entry in the pull
  request, and the maintainer adds it at the bump.

[docs/architecture.md](docs/architecture.md) explains how the pieces fit, and the
[harness doctrine](template/base/docs/harness/README.md) what the escape relaxes in a project.
