# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**Lineage note.** This harness was forked from
`expo-postgres-agent-harness`
and the version line continues from it. Entries at **0.1.2 and below are the
ancestor's** — they describe an Expo-only app over a self-hosted Hono/Drizzle
server and are kept for provenance, not because this repository shipped them.
This lineage's own history starts at 0.1.3.

**Older releases.** This file holds 2.0.0 and later, newest first. On 2026-11-18 the 1.x and
0.x sections moved, verbatim, to [docs/changelog/1.x.md](docs/changelog/1.x.md) and
[docs/changelog/0.x.md](docs/changelog/0.x.md); the second also holds the ancestor's entries.
Each release before 2.0.0, with its date and the file that holds it:

| Version | Date | File |
| --- | --- | --- |
| [1.1.0](docs/changelog/1.x.md#110--2026-10-02) | 2026-10-02 | [docs/changelog/1.x.md](docs/changelog/1.x.md) |
| [1.0.4](docs/changelog/1.x.md#104--2026-10-01) | 2026-10-01 | [docs/changelog/1.x.md](docs/changelog/1.x.md) |
| [1.0.3](docs/changelog/1.x.md#103--2026-09-23) | 2026-09-23 | [docs/changelog/1.x.md](docs/changelog/1.x.md) |
| [1.0.2](docs/changelog/1.x.md#102--2026-09-21) | 2026-09-21 | [docs/changelog/1.x.md](docs/changelog/1.x.md) |
| [1.0.1](docs/changelog/1.x.md#101--2026-08-19) | 2026-08-19 | [docs/changelog/1.x.md](docs/changelog/1.x.md) |
| [1.0.0](docs/changelog/1.x.md#100--2026-08-16) | 2026-08-16 | [docs/changelog/1.x.md](docs/changelog/1.x.md) |
| [0.11.1](docs/changelog/0.x.md#0111--2026-08-15) | 2026-08-15 | [docs/changelog/0.x.md](docs/changelog/0.x.md) |
| [0.11.0](docs/changelog/0.x.md#0110--2026-08-15) | 2026-08-15 | [docs/changelog/0.x.md](docs/changelog/0.x.md) |
| [0.10.0](docs/changelog/0.x.md#0100--2026-08-14) | 2026-08-14 | [docs/changelog/0.x.md](docs/changelog/0.x.md) |
| [0.9.9](docs/changelog/0.x.md#099--2026-08-13) | 2026-08-13 | [docs/changelog/0.x.md](docs/changelog/0.x.md) |
| [0.9.5](docs/changelog/0.x.md#095--2026-08-11) | 2026-08-11 | [docs/changelog/0.x.md](docs/changelog/0.x.md) |
| [0.9.0](docs/changelog/0.x.md#090--2026-08-10) | 2026-08-10 | [docs/changelog/0.x.md](docs/changelog/0.x.md) |
| [0.8.0](docs/changelog/0.x.md#080--2026-08-10) | 2026-08-10 | [docs/changelog/0.x.md](docs/changelog/0.x.md) |
| [0.7.0](docs/changelog/0.x.md#070--2026-08-08) | 2026-08-08 | [docs/changelog/0.x.md](docs/changelog/0.x.md) |
| [0.6.0](docs/changelog/0.x.md#060--2026-08-07) | 2026-08-07 | [docs/changelog/0.x.md](docs/changelog/0.x.md) |
| [0.5.0](docs/changelog/0.x.md#050--2026-08-07) | 2026-08-07 | [docs/changelog/0.x.md](docs/changelog/0.x.md) |
| [0.4.0](docs/changelog/0.x.md#040--2026-08-06) | 2026-08-06 | [docs/changelog/0.x.md](docs/changelog/0.x.md) |
| [0.3.0](docs/changelog/0.x.md#030--2026-08-05) | 2026-08-05 | [docs/changelog/0.x.md](docs/changelog/0.x.md) |
| [0.2.1](docs/changelog/0.x.md#021--2026-08-04) | 2026-08-04 | [docs/changelog/0.x.md](docs/changelog/0.x.md) |
| [0.2.0](docs/changelog/0.x.md#020--2026-08-03) | 2026-08-03 | [docs/changelog/0.x.md](docs/changelog/0.x.md) |
| [0.1.3](docs/changelog/0.x.md#013--2026-08-01) | 2026-08-01 | [docs/changelog/0.x.md](docs/changelog/0.x.md) |
| [0.1.2](docs/changelog/0.x.md#012--2026-07-20) | 2026-07-20 | [docs/changelog/0.x.md](docs/changelog/0.x.md) |
| [0.1.1](docs/changelog/0.x.md#011--2026-07-19) | 2026-07-19 | [docs/changelog/0.x.md](docs/changelog/0.x.md) |
| [0.1.0](docs/changelog/0.x.md#010--2026-07-18) | 2026-07-18 | [docs/changelog/0.x.md](docs/changelog/0.x.md) |

## [2.0.8] — 2026-11-11

**A security patch.** Seven `next` advisories upstream published on 2026-11-03 covered the
16.4.1 floor and the 16.4.2 pin 2.0.7 shipped, three of them also the 15.5.28 floor, and the
scheduled `floor-advisories` job in `hygiene.yml` is red on them. 2.0.8 moves the floor and
the pin to 16.4.5 (15.5.29 on the 15 line), records all seven, and gives the floor a new
review window. It also re-takes the Claude Code advisory snapshot, whose review window ended
on 2026-09-29, moves the Claude Code floor from 2.1.163 to 2.1.260 for four advisories
published since, and re-reviews `tools/eol.json`, whose window ends on 2026-11-20. No gate is
added, the chain length does not change, and no ramp opens or moves. The
`template/migrations.json` record withholds nothing and restates 2.0.0's
twenty-vintage `rampExpiry` population. `scripts/lib/ramp-sites.mjs` `VINTAGES` grows by
`2.0.7`.

**This release reds existing installs, by design.** `update` refreshes the owned
`tools/framework-floor.json` and leaves the seeded catalog alone, so `version-sync` reds on
any `next` pin below the new floor until the consumer raises it. The remedy is in
`docs/runbooks/harness-upgrade.md`, 2.0.8 section. An install that stays on an earlier
release keeps the review window 2.0.3 set, which lapses on 2026-11-16, and its scheduled
`floor-review` job then reds on it. That job has been red since 2026-09-30 on the lapsed
Claude Code snapshot, and taking 2.0.8 clears that finding. It does not deliver the
re-reviewed `tools/eol.json`, which is seeded: an install's own register lapsed on 2026-10-20
or before if it came from 2.0.3 or earlier, and lapses on 2026-11-20 if it came from 2.0.4 to
2.0.7. The runbook's 2.0.8 section says how to take the new one. The Claude Code floor itself
reds nothing: no gate reads the Claude Code version a developer runs.

### Security

- **The `next` floor moves to 16.4.5 on the 16 line and 15.5.29 on the 15 line, and the
  catalog pins 16.4.5.** Upstream published seven advisories on 2026-11-03, all Moderate,
  none of them in OSV on the day of review (2026-11-08):
  GHSA-pc58-hwjq-p385 (CVE-2026-119348, both lines) is response injection and disclosure
  across clients in a self-hosted app whose route handler returns a fetched upstream response
  unchanged, behind an HTTP/1.1 reverse proxy that queues pipelined requests.
  GHSA-rhh4-g77r-r9qj (CVE-2026-119349) is cache disclosure and poisoning across users when
  binary arguments reach a `use cache` function. GHSA-vvgp-ww4w-46vf (CVE-2026-119350, 16.4
  only) is cache poisoning of a shared fallback shell in a self-hosted app built with
  `cacheComponents: true` and Partial Prefetching off. GHSA-7qx7-33qx-rqx2 (CVE-2026-119347,
  both lines) lets a self-hosted `/_next/image` process an SVG despite
  `dangerouslyAllowSVG: false`. GHSA-mfr8-8qww-v76h (CVE-2026-119790) and GHSA-vc7v-qv4w-wrv8
  (CVE-2026-119351) serve the result of a `use cache` function for the wrong root param value,
  through `unstable_cache()` or a nested `use cache` function; upstream's release post rates
  the first High and its advisory Moderate. GHSA-f3mh-rxg3-f5g2 (CVE-2026-119346, both lines)
  puts cookie values, `HttpOnly` ones included, in a response header that same-origin
  JavaScript can read, on Edge runtime routes. 16.4.5 fixes all seven and 15.5.29 the three on
  the 15 line. As shipped, the scaffold enables no Cache Components, has no `use cache`
  function, and its two route handlers run on Node.js and return no fetched response, so none
  of the seven reaches it; the `/_next/image` endpoint exists in every install. The review
  window moves to 2026-11-08 through 2026-12-08. `tools/framework-floor.json` carries the
  seven rows and is owned, so `update` refreshes it. `pnpm-workspace.yaml` is seeded, so an
  existing install raises its own pin (`docs/runbooks/harness-upgrade.md`, 2.0.8 section), and
  `scripts/ci/apply-framework-floor.mjs` plays that remedy in the upgrade lane.
- **The Claude Code floor moves from 2.1.163 to 2.1.260, and its advisory snapshot is
  re-taken.** The snapshot in `tools/cc-floor.json` dated from 2026-08-15 and its 45-day window
  ended on 2026-09-29, so the scheduled `floor-review` job has been red on it since 2026-09-30,
  in every install and in every scaffold made since. The factory's nightly
  `registers-clockful` job read only `framework-floor.json` and `eol.json`, so nothing here
  noticed; it now reads `cc-floor.json` and `support-register.json` too. Re-taken on
  2026-11-08, GitHub's reviewed database returns 29 advisories, one more than before:
  GHSA-pq7j-f95f-qfcv (CVE-2026-86063, High, fixed in 2.1.179), where, on a git host that
  allows branch names shaped like a SHA, installing a plugin pinned to a commit SHA could
  install a branch named like that SHA. Anthropic's own
  advisory page lists three more npm advisories that neither that database nor OSV's npm
  records held that day: GHSA-5j29-h97v-84ch (CVE-2026-103435, High, 2.1.129) and
  GHSA-5xjx-9qx6-jcrv (CVE-2026-88968, High, 2.1.251), where a symlink swapped in after the
  path check took a file write outside the workspace, and GHSA-gfvf-j8jh-jxxw
  (CVE-2026-103012, Low, 2.1.260), where a session signed in with an Enterprise or Team
  account fetched its server-managed settings with a stored API key, and ran without them, or
  on a stale copy, when the endpoint refused the key. The floor is the earliest release
  outside every published vulnerable range, so it counts all four. The three rows that
  database lacks cite the vendor's record until it has them: `version-sync` required a
  `github.com/advisories/` address and now also accepts one on Claude Code's own advisory
  page. Either way the address must be the page followed by the row's own GHSA id and
  nothing more, so the bare page, another advisory's id and a path that climbs out of the
  page fail. When the snapshot lapses, `floor-review` now names both advisory queries to
  re-run, as the file's `howToRefresh` does.
  `recommended` moves to 2.1.311, for four hook fixes above the floor that carry no
  advisory and reach the shipped hooks. Before them a PreToolUse hook was skipped when
  matching it failed or the tool's input could not be serialized (2.1.288), on Windows
  without Git for Windows a hook that set no shell failed open (2.1.299) and one that ran in
  PowerShell did not block on exit code 2 (2.1.309), and `SubagentStop` hooks ran about twice
  a minute for each running subagent (2.1.311). No source says which versions had that last
  one, and 2.1.292 did not. On one that did, `.claude/hooks/subagent-verdict.mjs` would run on
  a reviewer still at work after about 30 seconds, find no verdict, exit 2 and record a block.
  The file's `uncvedHookFixes` records the four beside the hook fixes that do not reach the
  shipped hooks, and a new note lists three VulnCheck CVE records that neither of its
  advisory queries returns, all below the floor.
  The next review falls due by 2026-12-23. The file is owned, so `update` refreshes it.
  Claude Code's auto-update has already delivered the fixes, and the runbook's 2.0.8 section
  says how to check the version.

### Changed

- **The hygiene gate reads the private names it looks for from a secret.**
  `scripts/hygiene.mjs` reads them from the `HYGIENE_PRIVATE_NAMES` Actions secret instead of
  its own code, one case-insensitive regular expression per line, and fails on any path or
  line in the repository that matches one, not only under `template/`. A finding names the
  path, the line and the entry's number, never the line's text, and a name in the path
  prints as `[entry N]`. An entry with `^` or `$` outside a character class, or with a
  lookaround group, could match a path and not the line that reports it, so the gate fails
  on it by its number, as it does on an entry that does not compile or that matches an empty
  line. While an entry is refused, the gate prints only the refusals and a count of its other
  findings, since that entry cannot hide its name in them. A file with CRLF line ends gets the
  findings it would get with LF. `hygiene.yml` and
  `release.yml` pass the secret to the step that runs the gate. On a release tag and on a
  push to `main` in this repository they also set `HYGIENE_REQUIRE_PRIVATE_NAMES`, and a
  missing or empty list then fails the gate, naming the secret, so the secret has to be set
  before this release merges. Elsewhere a missing list skips the check: in a fork, a fork's
  pull request, a Dependabot run or a local run, the gate says on one line that the list is
  not set, and passes. Factory only: nothing changes for an install.
- **Nothing points to the retired Expo and Tauri harnesses.** The README, the lineage note
  above and `design/PORT-SPEC.md` name `expo-postgres-agent-harness` and
  `tauri-postgres-agent-harness` without a link. `init` still refuses a target that depends
  on `hono` but not `next`, and a Tauri desktop project, and now says what to do instead of
  naming a harness. With no `tools/mutation-baseline.json`, `mutation-ratchet` named the
  retired `expo-postgres-agent-harness` package in the command that pulls the template's
  copy, and now gives
  `npx next-expo-supabase-agent-harness@latest update --refresh-seeded tools/mutation-baseline.json`.
  The gate is owned and reaches an install with `update`.
- **Neutral example names.** The installer's prompts give "Acme Notes", `com.acme.notes` and
  `acmenotes` as examples. The crash-reporting module's ingest host and e-mail fixture use
  `example.com`, and its README and redaction test name account identifiers among the PII
  shapes to add. The module's two docs are owned and reach an install with `update`; the
  test is seeded, so only a new scaffold gets it.
- **`tools/eol.json` is re-reviewed, to 2026-12-09.** The window 2.0.4 set ends on
  2026-11-20, after which every new scaffold's `floor-review` would have failed on it. The
  registry sweep over a fresh strict-tier scaffold found the same six deprecations, none in
  the production closure. Expo's supported set is unchanged (SDK 58, 57 and 56). The
  vendor's table now calls `react-native` 0.85 Unsupported, so it leaves the set; every
  release of this harness pins 0.86.2. **The register is seeded, so `update` does not
  deliver the review**: the runbook's 2.0.8 section says how to take it.
- **The control-plane facts are re-verified, against Claude Code 2.1.292.**
  `design/CONTROL-PLANE-FACTS.md` records the 2026-11-08 probes: the hook payloads and the exit
  codes the guards rely on are unchanged, and the `stop_hook_active` transition was observed
  again. One finding is new: a `.claude/hooks/launch.mjs` that is empty, or cut inside its
  leading comment, is a valid module that exits 0, so that tear fails open with no notice.
  The `control-plane-facts-currency` obligation now anchors on the lines of
  `tools/cc-floor.json` that state the required floor, so the next floor move reds
  `check-obligations` until the facts are re-verified; its old anchor, `2.1.163`, stayed true
  through this move. Factory only: nothing changes for an install.

## [2.0.7] — 2026-11-07

**A patch: the v2.0.x defect fixes continue.** No gate is added, the chain length does not
change, and no ramp opens or moves. The `template/migrations.json` record restates 2.0.0's
twenty-vintage `rampExpiry` population, and `scripts/lib/ramp-sites.mjs` `VINTAGES` grows by
`2.0.6`.

### Changed

- **The seven commands ask Claude to run what they ran as they loaded.** `/adr`, `/new-action`,
  `/new-feature`, `/new-migration`, `/rls-check`, `/verify-citations` and `/verify-invariants`
  each ran `git diff --name-only HEAD`, `git status --short` or `date` on a `!` line as the file
  loaded, and put its output in the prompt. Each now tells Claude to run the same command and
  keeps the Bash rule that pre-approves it, so in an installed project it still runs without
  asking. The plugin ships the same text, and the plugin directory refuses such lines (below).
  `/rls-check` and `/verify-citations` also quote their `description`, whose `: ` a strict YAML
  reader cannot parse. The seven commands are owned and reach an install with `update`, which
  re-records their `tools/agents.lock.json` entries.
- **`citation-verifier` says to use its corpus server when `tools` names it.** Its note said
  the `mcp__corpus_search` server IS wired in (see `tools:` above), which the plugin's copy,
  whose `tools` names no MCP tool (below), would make false. In an installed project `tools`
  names the server, so the agent works as before. It is owned and reaches an install with
  `update`.
- **The plugin meets the plugin directory's rules.** The directory accepts it only if its
  commands and skills run nothing as they load and pre-approve only `Read`, `Grep`, `Glob` and
  `LS`, its files are Markdown, text, JSON, YAML or PNG, JPEG, GIF, WebP or ICO images, none of
  them starting with `#!` or configuring a package manager, and its frontmatter holds only keys
  the directory knows. 2.0.6's copies kept the `!` line commands and the slice scaffolder in
  `allowed-tools`, shipped the scaffolder script and carried `harnessFallbackModels` in eight
  agents. `scripts/lib/plugin-folder.mjs` now copies only those file types, so the copies of
  `/new-feature` and `authoring-vertical-slice` name the installed project's scaffolder, as
  their sources do. A command's or skill's copy keeps only those four tools in `allowed-tools`,
  and every component's copy only the frontmatter keys Claude Code reads for it. An agent's
  copy also drops each `mcp__` entry from `tools`: `security-reviewer` named `mcp__rls_verify`
  and `citation-verifier` `mcp__corpus_search`, servers an installed project runs and the
  plugin does not ship. `scripts/check-plugin-manifest.mjs` reds a `!` line or fenced `!` block
  in any command or skill, at its source or in `plugin/`. In `plugin/` it reds a file of another
  type, one that starts with `#!`, is not UTF-8 or holds a NUL byte, a package manager
  configuration file, any other `allowed-tools` entry, a frontmatter key the copy does not keep,
  a plain frontmatter value YAML reads otherwise than its text, and an agent's MCP tool. Each
  is watched red in `tests/gates/check-plugin-manifest.test.mjs`. `plugin/README.md` says that
  nothing runs as a command or skill loads. Factory only: nothing changes for an install.

## [2.0.6] — 2026-11-03

**A patch: the v2.0.x defect fixes continue.** No gate is added, the chain length does not
change, and no ramp opens or moves. The `template/migrations.json` record restates 2.0.0's
twenty-vintage `rampExpiry` population, and `scripts/lib/ramp-sites.mjs` `VINTAGES` grows by
`2.0.5`.

### Added

- **`init`'s next steps and the README start the local stack before the first Claude Code turn,
  and a new runbook shows that turn.** Both stopped at `pnpm validate`, which does not run the
  RLS tests, while the Stop hook's `rls-isolation` step fails closed with no local stack once
  `supabase/migrations/` exists. So unless the stack was already up, a new project's first turn
  was sent back at its first Stop whatever it was asked, and without Docker it ended red at the
  block cap. The steps are now `git init`, `pnpm install`, the first commit with
  `pnpm-lock.yaml`, `pnpm db:up` with Docker running, `pnpm validate` and one small change in
  Claude Code, then `docs/runbooks/first-run.md`, which the README and the documentation site's
  landing page link. An existing project with no `supabase/config.toml` has no local Supabase
  project to start, so `init` leaves `pnpm db:up` out there. The page gives the same steps and
  shows the first turn with the stack running and without it.
  `tests/gates/next-steps-order.test.mjs` holds `init`'s steps, the README and the page to one
  order, and `tests/installer/lifecycle.test.mjs` holds the steps, red on 2.0.5. The page is
  owned and reaches an install with `update`; the steps reach new projects.
- **The session-start brief says when the local database is not answering.** An agent learned
  that no stack was running at its first Stop, when `rls-isolation` failed closed.
  `tools/lib/harness-brief.mjs` now ends the brief with one fixed line, `local database: not
  answering, …`, when `supabase/migrations/` exists and nothing accepts a connection on
  `127.0.0.1` at `supabase/config.toml`'s `[db]` port, so the agent can start the stack before
  its work. The line is a hint: `rls-isolation` still asks `supabase status` and still fails
  closed, the hook still exits 0 with nothing on stderr, and the port is never printed.
  `tests/gates/harness-brief.test.mjs` proves the line against a listening and a closed socket,
  and `tests/hooks/session-brief.test.mjs` through the spawned hook, red on 2.0.5. The lib and
  the doctrine are owned and reach an install with `update`.
- **The plugin's README has examples and a troubleshooting section.** `plugin/README.md`
  gains "Examples", each of which works in a repository the harness did not install:
  `/next-expo-supabase-agent-harness:rls-check` on a staged migration, the
  `security-reviewer` agent on a diff and the `designing-mobile-ui` skill on an Expo screen.
  "Troubleshooting" replaces "Inside a harness-installed project": it keeps that section's
  notes on plugin component names and on reviewer verdicts in an installed project, and adds
  that load errors show in the `/plugin` Errors tab. "What runs without asking" now says
  that the commands and skills pre-approve reading and searching files, the plugin's own
  included, when you type them, and that a skill Claude starts by itself asks first.
  `plugin.json` gains `author.url`, `documentationUrl` (the plugin's README), `supportUrl`
  (Discussions) and `keywords`, and `marketplace.json`'s `owner` gains `url`. Factory only:
  nothing changes for an install.

### Fixed

- **The machinery's minimatch moves to 11.0.3** (GHSA-g3hv-75wg-m249, medium). The advisory,
  published on 2026-10-30, covers every minimatch below 11.0.1, and the scheduled OSV scan in
  `hygiene` has been red on it since. eslint 9 and its `@eslint` packages ask for `^3.1.5`
  and `eslint-plugin-sonarjs` for `^10.2.6`, and neither line has a fixed release, so an
  override in `pnpm-workspace.yaml` gives the root tree 11.0.3 alone. All of these load here
  as CommonJS and only construct `Minimatch`, and ESLint lints the same files with the same
  resolved configuration on 11.0.3. Only `@eslint/eslintrc` and `@eslint/config-array` have
  ES-module builds. Those default-import minimatch, and 11.x has no default export, so
  nothing here may import either from an ES module while the override stands. The two
  components it adds have reviewed rows in `scripts/sbom-additions.json`, and the
  `minimatch-11-override` row in `scripts/obligations.json` says when the override goes.
  Factory only: nothing changes for an install.
- **The steward record names the authors as `CITATION.cff` does, and the trust-boundary diagram
  names who merges as `GOVERNANCE.md` does.** `design/CONFORMANCE-FACTS.md` and the
  `conformance-cra-art14-application` row of `scripts/obligations.json` said `package.json`,
  `CITATION.cff` and `GOVERNANCE.md` name Cogvera Labs as the author. They now say
  `package.json` names it as the author, `CITATION.cff` as the first author, before Thomas
  Nicklin, and `GOVERNANCE.md` as the maintainer's organisation. The diagram in
  `docs/security/assurance-case.md` drew maintainer review as the one step before `main`, and
  now draws `maintainer or @oakla`. Factory only: nothing changes for an install.
- **The assurance case says what the ruleset on `main` requires, and names oakla's account beside
  the maintainer's.** Its separation-of-privilege row said editing the enforcement surface needs
  code-owner review, which the ruleset does not require. The row now says a change from an agent
  session in this repository needs the environment flag and a pull request that passes the
  required checks. R6, which cites `.github/CODEOWNERS`, now says the ruleset does not require
  that review. The list of adversaries and residual risk 2 named only the maintainer's account
  as the compromise route, though oakla's can merge to `main` once the required checks pass. They
  now name both. Factory only: nothing changes for an install.

## [2.0.5] — 2026-11-02

**A patch: the v2.0.x defect fixes continue.** No gate is added, the chain length does not
change, and no ramp opens or moves. The `template/migrations.json` record restates 2.0.0's
twenty-vintage `rampExpiry` population, and `scripts/lib/ramp-sites.mjs` `VINTAGES` grows by
`2.0.4`.

### Fixed

- **`edge-functions`, `gate-integrity`, `rate-limits` and `security-headers` pass what they
  read to their tools as arguments, not through a shell.** Each built a shell command from
  data: `tools/check-edge-functions.mjs` a `deno check` from each function's directory name,
  `tools/check-gate-integrity.mjs` a `git status` from each tsconfig path, and
  `tools/check-rate-limits.mjs` and `tools/check-security-headers.mjs` a `node -e` whose probe
  carries the project's path and, in `rate-limits`, every procedure name in
  `tools/generated/action-inventory.json` and every Server Action name in
  `tools/rate-limit-budget.json`. `$(…)` and backticks run inside double quotes, and the
  tsconfig path had no quotes, so either could run a command when the gate ran. CodeQL flagged
  only `edge-functions` (`js/shell-command-injection-from-environment`, medium). A `$NAME` in
  the project's path sent both probes to a file that does not exist, so `rate-limits` and
  `security-headers` skipped locally, naming type stripping, and failed in CI. A space split a
  tsconfig's path into two that match nothing, so an uncommitted edit to a tsconfig under such
  a directory read as committed. Every input comes from the project itself, whose code the
  chain and CI run anyway, so it could do nothing that code could not. The four gates now call
  `execFileSync` with an argument list, and their tests under `tests/gates/` check that each
  name reaches its tool as written and that nothing in it runs, red on 2.0.4. All four are
  owned and reach an install with `update`.
- **The template catalog pins `zod` at `^4.6.6`, and `update` and `doctor` ask an install to
  do the same** (GHSA-mrhx-c7xc-m3w5, high). zod through 4.6.5 can exhaust memory validating a
  large array against an array schema with no length limit. Every release from 0.1.3 through
  2.0.4 shipped `zod: ^4.4.3`, whose lower bound admits those versions. A `catalogPinFloors`
  entry in the 2.0.5 record floors `zod` at 4.6.6. `pnpm-workspace.yaml` is seeded, so
  `update` leaves the pin, names the floor and parks `.harness/pending/pin-floors.json`, and
  `doctor` warns (exit 2) until the pin's lower bound is 4.6.6 or higher; this release's
  runbook says how to raise it. `@expo/cli` 57, which Expo SDK 57 installs, still depends on
  zod 3, which the advisory also covers, and no catalog pin reaches it.
  `tests/installer/catalog-pin-floors.test.mjs` holds the record and the template's pin to the
  floor, red on 2.0.4.
- **`SECURITY.md` says nobody can bypass the required checks on `main`.** Its Branch-Protection
  finding said the maintainer could bypass them when merging their own pull request. Since
  2026-11-01 the ruleset on `main` lets nobody bypass it, the administrator included. Factory
  only: nothing changes for an install.

### Added

- **The Claude Code plugin has an icon.** `plugin/.claude-plugin/icon.png` is the Cogvera Labs
  logo, a 1024-pixel square PNG, and `plugin.json` names it in `icon`.
  `scripts/check-plugin-manifest.mjs` reds when `icon` is missing or names anything but a
  complete square PNG of 512 to 2048 pixels a side under 2 MB, and
  `scripts/generate-plugin-folder.mjs` keeps the file beside the manifest. Factory only:
  nothing changes for an install.

### Changed

- **The headline says what the hooks do: send the agent back to work when a check fails.** The
  README, `package.json`'s description, the documentation site and the social preview image
  said Claude Code hooks and CI gates "block an agent turn or a merge until validation
  passes". Claude Code ends a turn anyway after 8 Stop-hook blocks in a row with no tool call
  between them, when the hook reaches its timeout, and when the hook exits 2 with nothing on
  stdout and a stderr that says a file is missing. Each now reads "Claude Code hooks that send
  the agent back to work when a check fails, and CI gates that block a merge until validation
  passes", and the README's other mentions, `CITATION.cff` and `docs/architecture.md` follow.
  The doctrine's Stop hook section no longer calls the hook unbreakable, and names all three
  cases where it called the cap the one way a turn could end red.
  `docs/media/social-preview.png` is rendered again from its SVG with the command in its
  comment; the repository's social preview is uploaded by hand.
  `.claude-plugin/marketplace.json` names Cogvera Labs as its owner, and its plugin
  description lists every reviewer and skill in plain words. The doctrine is owned and reaches
  an install with `update`, and this release's runbook says so; the rest is factory only.
- **`GOVERNANCE.md` names the collaborator with write access, and says that either the
  maintainer or the collaborator decides what gets merged.** It said nobody but the maintainer
  had write access, and that the maintainer made all final decisions, what gets merged
  included. Write access lets a collaborator merge a pull request that passes the required
  checks, and the Roles table lists the collaborator. The maintainer still makes the final
  decisions about the project's direction and its releases. Settings, the security advisory
  queue and the release tags (`v*`) stay the maintainer's, so a successor needs administrator
  access to cut a release, and the continuity section says so. Factory only: nothing changes
  for an install.
- **`CITATION.cff` names Thomas Nicklin as an author, with his ORCID iD, beside Cogvera Labs.**
  Factory only: nothing changes for an install.
- **Each command and skill pre-approves only the commands it runs.** The seven commands and
  three skills each carried a bare `Bash` in `allowed-tools`, and seven a bare `Edit` or
  `Write`, which pre-approved every shell command and every file edit while one ran, past the
  project's own allow list. Each now names its commands as Bash rules: what its `!` lines run
  as it loads (`git diff --name-only HEAD`, `git status --short` or `date`), the slice
  scaffolder, and the `pnpm` and `node tools/` scripts and `supabase migration new` its steps
  name. `/new-migration` also names `pnpm test:rls`, which its `migration-rls-author` subagent
  runs: a typed command's rules reach the subagents it starts. So does `/new-action`, whose
  `dal-author` subagent has no shell and hands that command back to run. `designing-mobile-ui`
  runs none and names none. Any other command asks first unless the project's settings allow it,
  and file edits follow the session's permission mode, which the shipped `.claude/settings.json`
  sets to `acceptEdits`. The plugin's copies keep only the `!` line commands and the
  scaffolder, which they name from `${CLAUDE_PLUGIN_ROOT}`: the source's
  `node .claude/skills/` path exists only in an installed project, so the plugin's
  `/new-feature` and `authoring-vertical-slice` could not run it, and the project commands run
  that project's code, which a plugin cannot vouch for. `plugin/README.md` says what runs
  without asking. `scripts/check-plugin-manifest.mjs` reads each source command
  (`commands/**/*.md`) and skill (`skills/<name>/SKILL.md`) and splits its `allowed-tools`
  list as Claude Code 2.1.292 does: at commas and at spaces outside parentheses, with `Tool()`
  and `Tool(*)` read as the bare tool. Claude Code parses the frontmatter as YAML and ends it
  at the first `---`, even mid-line, so the check reds a list that is not a plain or wholly
  quoted one of tool names and rules, a `---` inside the frontmatter, and white space there
  other than spaces, tabs and newlines. It also reds a bare grant of `Bash`, `Monitor`,
  `PowerShell`, `AppifactRepl`, `Edit`, `Write`, `NotebookEdit` or `MultiEdit`, the tools whose
  grant pre-approves running a shell command or code, or writing a file; a rule of one of those
  on a one-word prefix or with a `*` wildcard; any MCP tool; a `!` line or fenced `!` block with
  no rule; and a script rule naming a file the skills do not ship. Each is watched red in
  `tests/gates/check-plugin-manifest.test.mjs`. The check guards against a broad grant added
  by mistake in these forms; it is not a sandbox against one written to get past it. It passes
  a command or skill whose file name is spelled in another case, such as `SKILL.MD`, a `hooks`
  entry in a frontmatter or in `plugin.json`, a rule on a prefix of two words that runs any
  code, such as `Bash(node -e:*)`, and an `Edit` rule naming a folder outside the project.
  Every template file this changes is owned and reaches an install with `update`, which
  re-records its `tools/agents.lock.json` entry.

### Corrections to the record

- **2.0.4 shipped on 2026-11-01, not 2026-10-21.** Its heading and the `date-released` in that
  release's `CITATION.cff` give the date of its version bump.

## [2.0.4] — 2026-10-21

**A patch: the v2.0.x defect fixes continue.** Each item that lands after this bump adds its
entry below. No gate is added, the chain length does not change, and no ramp opens or moves.
The `template/migrations.json` record restates 2.0.0's twenty-vintage `rampExpiry`
population, and `scripts/lib/ramp-sites.mjs` `VINTAGES` grows by `2.0.3`.

### Fixed

<!-- Entries from the 2.0.4 items that land after the version bump go here. The cut removes
this comment. -->

- **The shipped guards deny a NotebookEdit of a protected path, lefthook's skip variables and
  `git push --no-verify`** (#249). `.claude/hooks/pretool-write-guard.mjs` read
  `file_path ?? path`, but NotebookEdit names its subject `notebook_path`, so a notebook edit
  was judged on an empty path and passed, `.github/workflows/` included; it now reads
  `notebook_path` too, as the factory's own guard has since #224. The bash guard in
  `.claude/hooks/lib/guard-rules.mjs` gains two rules. `git-push-no-verify` denies
  `git push --no-verify` and every prefix of it down to `--no-v`, after global options too,
  which skipped the pre-push typecheck, lint and dead-code jobs. `lefthook-skip-env` denies an
  assignment to `LEFTHOOK` (`=0` or `=false` turns the hook script into an exit 0),
  `LEFTHOOK_EXCLUDE`, `LEFTHOOK_BIN` or `LEFTHOOK_CONFIG`, in the prefix, `export`, `env` and
  PowerShell `$env:` spellings, which skipped or replaced the commit-time layer with no flag on
  the git command. `git push -n`, `--no-verbose`, `LEFTHOOK_VERBOSE` and `LEFTHOOK_OUTPUT` stay
  allowed. `tests/hooks/hook-contract.test.mjs` denies all fourteen spellings, red on 2.0.3,
  and `docs/security/threat-model.md` lists both rules. Every file this changes is owned and
  reaches an install with `update`.
- **`tools/eol.json` re-reviewed** (lapsed 2026-10-20). The registry sweep over a fresh
  strict-tier scaffold probed 1620 pairs with zero errors and found the same seven
  deprecations the register carries, with unchanged messages. Both product tables moved:
  Expo's compatibility table now lists SDK 58, 57 and 56, so 55 and 54 leave the supported
  set, and `react-native` 0.88 joins it (npm `latest` since 2026-10-15), with 0.85 kept
  while the vendor's table still calls it End of Cycle. `uuid`'s `removalTarget` stays
  2.1.0: `xcode` 4.0.0 drops uuid, but `@expo/config-plugins` still depends on `xcode` 3.
  The window runs to 2026-11-20. **The register is seeded, so `update` does not deliver
  the review.** An install on Expo SDK 54 or 55 that copies the new supported set reds the
  vendor-support census; the scaffold pins SDK 57.
- **`uuid` 7 leaves `tools/eol.json`: the upstream discharge arrived.** Later on the review
  day, `@expo/config-plugins` 57.0.11 moved to `xcode` ^4.0.0, which has no uuid dependency,
  so a fresh resolution has no `uuid@7` and the row accepting it matched nothing.
  `version-sync` reds such a row, and `consumer-ci-static` went red on every branch. The row
  is deleted rather than re-dated, so the register has no production-scope row left. **An
  install keeps its own row** (the register is seeded): after its next re-resolve,
  `version-sync` names it as matching no deprecated resolution, and the remedy is to delete
  it, or `update --refresh-seeded tools/eol.json` on an untouched register. The arrival ramp
  in `tools/check-version-sync.mjs` still runs to 2.1.0 for installs holding the row.
- **The shipped guards deny a write of `lefthook-local.yml`** (#260). lefthook merges a local
  config over the committed `lefthook.yml`, so a `skip: true` for a job in it skipped that job
  at `git commit` with no flag and no `LEFTHOOK` variable, and neither guard knew the file. A
  new `WRITE_PROTECTED` row, `lefthook-local`, in `.claude/hooks/lib/guard-rules.mjs` denies
  an Edit or Write of every spelling lefthook 2.1.10 reads (`lefthook-local`,
  `.lefthook-local` and `.config/lefthook-local`, each with `.yml`, `.yaml`, `.json`,
  `.jsonc` or `.toml`), and the bash guard's shell-write rule denies the same paths.
  `tests/hooks/hook-contract.test.mjs` denies twelve spellings, red on 2.0.3, and
  `docs/security/threat-model.md` lists the row. A developer who wants a personal local
  config writes it themselves, as for `lefthook.yml`. Every file this changes is owned and
  reaches an install with `update`.
- **The template catalog moves Biome to 2.6.2 and `vitest` to 4.1.12, and Biome checks the
  same files it did on 2.5** (#269). Biome 2.6.0 added a Markdown and a YAML formatter, both
  on by default, and the scaffold's `biome.jsonc` includes every file, so `biome ci` would
  red a fresh scaffold on its docs, its workflows and `pnpm-lock.yaml`. `biome.jsonc` now
  names the 2.6.2 schema and excludes `*.md`, `*.markdown`, `*.yml`, `*.yaml` and `*.cff` by
  extension, which Biome 2.5 accepts; it rejects the `markdown` and `yaml` keys as unknown.
  Biome published 2.6.0 and 2.6.1 with no platform binary, so the pin skips them: on 2.6.1
  every scaffold `validate` in CI failed `format` with `Cannot find module
  '@biomejs/cli-linux-x64/biome'`. `vitest` and `@vitest/coverage-v8` 4.1.12 fix
  GHSA-qxg6-89mg-rqv8 and GHSA-xp26-3454-mjgp (both moderate), in `@vitest/mocker`'s mock
  registration over a dev server's WebSocket; the second bypasses the 4.1.11 fix on
  Windows. The catalog also moves `next` to 16.4.2 and pnpm to 11.28.6, and
  `tests/installer/catalog-pin-floors.test.mjs` now lowers whatever plain `vitest` pin the
  template ships instead of the literal 4.1.11. `biome.jsonc` is owned and reaches an install
  with `update`, where Biome 2.5 prints one information line about the newer schema.
  `pnpm-workspace.yaml` is seeded, so an install keeps its own pins. The `vitest` floor stays
  4.1.11, and the runbook's 2.0.4 section names the pins to raise by hand.
- **The agent-facing docs teach the org-scoped RLS shape** (#255). The vertical-slice skill's
  step 1, `/new-feature`, `/verify-invariants`, `.claude/rules/security-invariants.md`, the
  `migration-rls-author` and `security-reviewer` agents and `AGENTS.md` still taught policies
  keyed on `owner_id = (SELECT auth.uid())` with a leading owner index, the per-user shape
  every scaffold left at 0.2.0 and the `tenancy` gate reds. They now teach what
  `references/migration-rls.md`, `supabase/schemas/20_notes.sql` and `tools/tenancy.json`
  already do: a NOT NULL, trigger-frozen `org_id`, the `member_org_ids()` scope and
  `member_ranks()` rank-floor forms, a leading `org_id` index, and `owner_id` as nullable
  attribution. No gate changes. The skill, rule, commands and agents are owned and reach an
  install with `update`; `AGENTS.md` is seeded, so an install keeps its copy.
- **`eject` removes the demo files an earlier release wrote** (#256). Most of the worked
  example is seeded, so `update` leaves an untouched demo file at the bytes the install's own
  release wrote, and `eject` compared a seeded demo file only with its own release's demo. An
  untouched v2.0.2 `--with-demo` install, updated and ejected, kept eight demo files as
  "re-recorded forks", parked the default copy of five shared files and kept two `PARITY.md`
  rows. Each table under `template/shas/` now carries a `demo` map, every byte-variant of
  every path `template/demo` shipped, backfilled from 2.0.0 by `generate-released-shas.mjs
  --all`; `check-released-shas.mjs` holds it closed over the live tree and every tag, and
  `eject` accepts any release's demo bytes up to its own. `tests/installer/
  demo-eject-older-release.test.mjs` runs v2.0.2's own `init`, this `update` and this `eject`,
  red before the fix. The CLI carries the change; `update` plants this release's runbook
  section and nothing else.
- **`update` knows the bytes untagged `main` commits shipped** (#259). The install command
  has no tag, so each table under `template/shas/` is meant to list what every first-parent
  `main` commit of its version shipped, and the 1.0.4 and 1.1.0 tables missed some: an
  untouched install made from `main` at 8de6d2349 (the merge of #95) had six owned files,
  `tools/lib/gate.mjs` among them, parked as forks on `update`, and four escape lists read as
  widenings. A merge commit can carry bytes no pull request's CI checked, so
  `check-released-shas.mjs --verify-tags` now also verifies every first-parent `main` commit
  against its own version's table, judged by its own installer, and the tables are
  backfilled by `generate-released-shas.mjs --all`. `tests/gates/
  released-shas-history.test.mjs` reds a table missing that commit's `tools/lib/gate.mjs`,
  red before the fix. `update` plants the regenerated `tools/lib/planted-shas.json` and this
  release's runbook section.

- **The vertical-slice scaffolder never writes over or through a path that exists** (#163).
  `.claude/skills/authoring-vertical-slice/scripts/scaffold-slice.mjs` asked whether a
  stub's path existed and then wrote it by name (CodeQL `js/file-system-race`), so a file
  created between the two calls was overwritten, and a dangling symbolic link at the path
  was written through to its target. It now writes each stub with an exclusive create
  (`writeFileSync` with the `wx` flag) and prints `exists, skipped:` for any path that
  already exists, a link included, as it did for an existing file; nothing else it prints
  or writes changes. `tests/gates/scaffold-slice.test.mjs` covers an existing file and a
  dangling link, and the link case is red on 2.0.3. CodeQL's JavaScript extractor skips
  hidden directories other than `.github`, so neither an install's CodeQL lane nor this
  repository's analyses `.claude/`; this repository's lane found the race in the new
  `plugin/` copy. The script is owned and reaches an install with `update`. It runs only
  when someone runs it, so no slice an install already has changes.
- **The stand-in npm registry in `tests/gates/npm-publish.test.mjs` keeps its routes and
  request counts in `Map`s** (CodeQL `js/remote-property-injection` and
  `js/unvalidated-dynamic-method-call`, both high). They were plain objects indexed by the
  request path, so CodeQL traced a request to a write to, and a call of, a key that could
  name an `Object.prototype` member. The server lives for one test on 127.0.0.1 and its only
  client is the CLI under test, so no request could; with `Map`s the question does not
  arise, and every test keeps its meaning. Factory only: nothing changes for an install.
### Added

- **The README shows the harness running, and says which projects it fits** (#165). A
  recording near the top of the README is rendered by vhs from
  `docs/media/harness-demo.tape`, with no model in it: `init` writes a project, the Bash guard
  gets a force-push payload the way `.claude/settings.json` invokes it and prints its deny,
  and the secrets gate goes red on its own Canary 26 key in a tracked file, then green once
  the file is removed. `tests/installer/readme-recording.test.mjs` runs every command the
  tape types, in plain bash against the checkout, and holds each to the `# expect:` and
  `# exit:` lines written above it, so a guard or gate message that changes reds until the
  tape is updated and the GIF regenerated; it also holds the GIF to 2 MB and the README to
  embedding it. A new "Who this is for" section names the shape the harness assumes and,
  for a web-only app, an existing monorepo with its own CI, and an agent that is not Claude
  Code, which layers still apply. Factory only: nothing changes for an install.

- **macOS in CI** (#168). `installer-unit` runs on `macos-latest` beside Linux and Windows. A
  new `macos-scaffold` lane runs `init`, `pnpm install` and `pnpm validate --min-floor
  --report-all` on `macos-latest` with `CI` unset, which is what a developer's Mac without
  Docker gets: a gate whose prerequisite is missing skips instead of failing closed. The lane
  then reds on any skip except `types-drift`, the one validate step that needs the database
  (`scripts/lib/skip-verdict.mjs`, proven red by `tests/gates/skip-verdict.test.mjs`). The
  database gates are still proven on Linux only. Factory only: nothing changes for an install.
- **Evals A and B, the Single Home detector's model-free harnesses** (#188), work for 2.1.0.
  `node scripts/eval-a.mjs --split dev` mutates about 40 helpers from the template with seven
  scripted mutators (locals renamed, a literal swapped, statements edited or reordered, a
  sibling-vertical copy, a SQL copy across schemas, a move, an edit into resemblance), adds
  the decoys and v3's plantings, sweeps each case with `--sweep`'s library and prints recall
  per mutator, precision per rule and tier and the ±3-token audit around FLOOR. `--split
  holdout` refuses to run until `tests/evals/a/frozen.json` exists. `node scripts/eval-b.mjs`
  sweeps a frozen copy of the 2.0.0 stack head (core with the demo and the push slice
  applied), scores it against its labels and prints the dogfood coverage table. Both fail on
  an unlabelled key, and `tests/evals/sweep-digest.test.mjs` holds the sweep's output
  byte-identical on ubuntu and on Windows (a new `eval-digest-windows` job in `lint.yml`).
  Most labels are the maintainer's to give. Factory only: nothing changes for an install.
- **A documentation site** (#171). `docs-site/` builds a Starlight site from the pages `init`
  writes under `docs/`, read in place from `template/base/docs/` and `template/modules/*/docs/`
  rather than copied, so each page matches its file on `main`. The ADR skeleton and the App
  Review notes template stay off it, because they are templates for a project's own files. Each
  page takes its title from its first heading, has an edit link to its file (the two generated
  pages link to the register they are generated from) and shows the date of its last commit.
  Each gate heading and each CI-only lane in the gates catalog gets an anchor named after the
  gate, `#gate-<name>`, which does not move when the chain is renumbered; GitHub's own anchor
  stays on the page as an alias. A search for a gate's name lists the catalog among its first
  results, and `llms.txt` lists every page. `.github/workflows/pages.yml` builds the site on
  pull requests that touch those pages or `docs-site/`, and the build fails on a broken
  internal link or `#anchor`. Pushes to `main` deploy it to GitHub Pages, in this repository
  only. `docs-site/` is a pnpm project of its own with its own lockfile, so none of its
  packages are in the root lockfile or the SBOM release diff, and `init --consume` removes it
  with the other factory trees. The npm package's homepage link points at the site. Factory
  only: nothing changes for an install.

### Changed

- **The Claude Code plugin installs its own folder, not the whole repository** (#163). The
  marketplace entry's `source` is now `./plugin`, which holds the manifest, a README, the
  LICENSE and the agents, commands and skills, copied from `template/base/.claude/` as
  regular files by `scripts/generate-plugin-folder.mjs`. An install used to copy every
  tracked file, a folder the plugin directory holds for a reviewer when it has more than 512
  files or a non-image file over 256 KiB. `scripts/check-plugin-manifest.mjs` now reds when
  `plugin/` drifts from its sources, holds a link or a stray file, or breaks those limits,
  and `scripts/check-release-lockstep.mjs` reads the manifest at its new path,
  `plugin/.claude-plugin/plugin.json`. Its description no longer says hooks cannot ship in a
  plugin: what a plugin cannot carry is permissions, and the harness's hooks run the
  project's own tools. The README gains the install commands. The folder is factory only:
  of #163's changes, only the scaffolder fix under Fixed reaches an install.

- **One short description for the npm package, a social preview image, a fork recipe that
  does not need the template flag, and a discussion for each release** (#166).
  `package.json`'s description was longer than the part npm keeps, and the registry holds the
  previous release's description cut off mid-word. It is now one sentence, and the new
  `tests/gates/package-metadata.test.mjs` reds a description npm would cut. The npm keywords
  add terms such as `claude-code-hooks`, `pgtap` and `row-level-security`, and `CITATION.cff`
  gains a keyword list. The README says "(React Native)" in its opening sentence and names the
  Next.js minor the catalog pins, and it gains a supply-chain bullet, a link to the hook map,
  a comparison with create-t3-turbo and Solito, and a Documentation section.
  `docs/media/social-preview.svg` is the source of the image for the repository's social
  preview, which is uploaded by hand under Settings (GitHub has no API for it), and its comment
  holds the Chrome command that renders `docs/media/social-preview.png`. The
  repository is no longer a GitHub template repository, so `docs/forking.md` starts a sibling
  harness from a clone with a fresh history and says which checks stay red in a fork until it
  has a release tag below its own version, and which upgrade legs it has to rewrite;
  `GOVERNANCE.md` and `docs/cli.md` follow. The
  `release` job in `release.yml` gains `discussions: write` and a last step that opens the
  release's discussion in Announcements. When that fails, the step prints a warning and the
  job stays green, so `publish-npm` still runs. Factory only: nothing changes for an install.

- **The repository moved to the cogvera-labs organisation.** Its address is
  https://github.com/cogvera-labs/next-expo-supabase-agent-harness, and the old one
  redirects. The documentation site moved to
  https://cogvera-labs.github.io/next-expo-supabase-agent-harness/; GitHub does not redirect
  the old one. Releases from 2.0.4 carry provenance that names cogvera-labs, so `SECURITY.md`
  gives each release's signer. `publish-npm` and the Pages deploy check the repository's id
  instead of its name, so they run after the move and a fork still skips them. Factory only:
  nothing changes for an install.
- **The Supabase grants row is re-checked and re-dated to 2026-12-01.**
  `conformance-supabase-grants-arrival` fell due on 2026-10-30, and the nightly
  `obligations-clockful` job has been red on it since. The re-check on 2026-11-01 found that
  neither date Supabase announced has landed. Its announcement still says new projects stop
  getting Data API grants automatically from 2026-05-30 and every project from 2026-10-30.
  Supabase CLI 2.116.0 made an unset `auto_expose_new_tables` mean `true` again, because the
  cloud change "never landed", and dropped the flag's planned removal on 2026-10-30. A hosted
  project created after 2026-05-30 still granted `anon`, `authenticated` and `service_role`
  every privilege by default. The scaffold's migrations revoke and grant explicitly, so they
  are right either way. The maintainer re-dated the row rather than deleting it.
  `design/CONFORMANCE-FACTS.md` §1 records the re-check and its sources, and the row's reason
  and `ROADMAP.md` follow it. Factory docs: nothing reaches an install.
- **The perf-harness screen shows its three measured values on a pass, and the device runner
  prints them.** `maestro-smoke`, the selftest's nightly device lane, is red on about two
  nights in three, nearly always on `droppedFrames` over its cap of 12, and the same commit is
  green on other nights. `tools/interaction-budget.json` says to re-baseline its caps only
  from the lane's printed medians, but a green run printed no values. On a pass,
  `apps/mobile/app/perf-harness.tsx` now shows one line per value beside `perf-pass`, through
  a new catalog key, `perf.measured`, and after the flow passes `tools/check-e2e-device.mjs
  --phase perf-harness` reads the screen and prints the values in one `e2e-device: on screen
  after perf-harness.yaml passed` line. No cap, verdict or failure line changes, so Canary
  20's 300 ms stall fails the phase on `droppedFrames` as before. A re-baseline from these
  numbers is the maintainer's decision, for later. The runner is owned and reaches an install
  with `update`. The screen and the catalog are seeded, so an install's own screen shows the
  values only once it renders them, and until then the runner prints that it found none.

## [2.0.3] — 2026-10-17

**A patch: the v2.0.x defect fixes, a security floor move, and two additions.** The `next`
floor moves to 16.4.1 (15.5.28 on the 15 line) for three advisories upstream published on
2026-10-14, two of them Critical. The two additions (#185, #186) landed on `main` as work for
2.1.0 and ship here instead. No gate is added, the chain length does not change, and no ramp
opens or moves. The `template/migrations.json` record restates 2.0.0's twenty-vintage
`rampExpiry` population, and `scripts/lib/ramp-sites.mjs` `VINTAGES` grows by `2.0.2`.

### Added

- **One home for every closed printer, an advisory recorder, and the converted-gates ratchet**
  (#185). `tools/lib/closed-text.mjs` is new and imports nothing. It holds the path printer,
  the name set and `(unprintable)`, moved from `tools/lib/harness-brief.mjs` (the brief's
  bytes do not move), `ACTION_RE`, moved from `tools/check-mobile-parity.mjs` (parity's
  output does not move), and the printers the Single Home plan needs: symbols, SQL names,
  signatures rebuilt from tokens, enums and numbers, dotted callees of up to four segments,
  i18n keys, testIDs, subject ids and `key12`. N3's case labels print an identifier through
  the symbol printer and a literal of up to 12 characters as itself, anything longer as
  `#n`, and `renderDiffersAt` prints aligned arms, two names for one value joined by ` / `.
  `tools/lib/gate.mjs` gains the recorder: `noteAdvisory` checks a record against a closed
  schema, appends it to `HARNESS_ADVISORY_REPORT_DIR` and prints one NOTE line rendered from
  the record alone; `noteComplete` writes a producer leg's terminator; `advisoryKey` is the
  record's identity; and `rampNote` takes an optional `subject` that records what it
  withholds without changing its NOTE. With the variable unset nothing is written. The
  recorder decides no verdict and swallows its own errors. `tools/check-duplication.mjs`
  writes its L0 terminator right before its verdict, green or red, and none on the
  no-source skip or a malformed allow file; its red text and verdict do not change.
  `tools/lib/closed-text.mjs` joins the stamp machinery in `tools/lib/stamp-inputs.mjs`, so
  every warm stamp re-proves once after `update`. In the factory, `scripts/advisory-ratchet.json`
  lists the converted producers (`duplication`, with no family yet) and
  `tests/gates/advisory-ratchet.test.mjs` reds a listed producer that never calls
  `noteComplete`, or a family outside the recorder's enum. No gate, step or ramp is added or
  moved. The new and changed files under `tools/`, `docs/harness/README.md`,
  `docs/harness/gates-catalog.md` and `.github/workflows/quality-gate.yml` (whose
  `edge-functions` filter names the new module) are owned and reach an install with `update`.
- **The Single Home extractor, and the duplication sweep that reads it** (#186).
  `node tools/check-duplication.mjs --sweep --json` prints one deterministic document of
  advisory records, and `--explain '<key12>'` prints the record a key names. Neither decides
  a verdict: the Stop run is L0 alone, unchanged, and prints no advisory NOTE before the exact
  rule goes live (#201). New modules under `tools/lib/`: `shapes.mjs` reads every callable in
  L0's scope through the project's own `typescript`, and every SQL function the migration
  history leaves live, into one normalised record each (bound names numbered, shorthand
  properties expanded, a token convention that fixes the count); `importers.mjs` indexes who
  imports each export; `homes.mjs` says where one copy of a class may live (IMPORT, MODULE,
  LIFT or NONE), judged by the `architecture` rules, the vertical-anatomy laws and the
  workspace walls; `workspace-tiers.mjs` holds those walls, moved out of
  `tools/check-workspace-deps.mjs` with the `boundaries` messages and verdicts unchanged;
  `complexity.mjs` holds six complexity recipes; `differs.mjs` says where a near-miss pair
  differs; `sweep.mjs` registers the families (`SWEEP_FAMILIES`) and builds the document; and
  `duplication-scope.mjs` is L0's scan list, moved out of the gate unchanged so both readers
  share it. `tools/lib/sql-parse.mjs` gains `statementSpans`, each statement with its raw
  extent, because a `-- comment` inside a function body ran to the end of the
  whitespace-normalised statement; `splitStatements` returns the same statements as before.
  It also exports `endOfBlockComment`, so the extractor ends a nested comment where the parser
  does. A name no closed printer can carry (one with a `$`, a `#private` or quoted member, an
  over-long name) gets no record, so it never costs its leg completeness. SQL overloads
  are told apart by their argument types, read as PostgreSQL reads them (an `ARRAY[...]`
  default, an unnamed `text ARRAY`); a `CREATE OR REPLACE` that respells a type replaces the
  overload with the same input names, and a `DROP FUNCTION` drops the signature it names.
  Only a callable declared at a file's top level is an export, and JSX text compares as it
  renders. The importer index counts every name an export goes by, re-export barrels
  included, and its module graph reads side-effect imports and `export type *`; `home()`
  reads only the `architecture` rules at `error` severity, cycles and dependency types
  included, and a rule condition it does not know refuses the home; call sites count method
  calls and JSX uses. The `--sweep --json` document arrives whole through a pipe.
  `tools/lib/vertical-anatomy.mjs` exports the predicate its domain, events and client-reach
  scans apply, and `tools/lib/gate.mjs` exports `advisoryRecordOk`; neither scan's findings
  move. Without `typescript` the TS legs are written incomplete, the sweep exits 1 and records
  the missing prerequisite, and the SQL legs still run. No gate, step or ramp is added or
  moved. In the factory, six test files prove the modules and the `machinery-shapes` step in
  `lint.yml` runs them with the parser installed. The new and changed files under `tools/` and
  `docs/harness/gates-catalog.md` are owned and reach an install with `update`.

### Security

- **The `next` floor moves to 16.4.1 on the 16 line and 15.5.28 on the 15 line, and the
  catalog pins 16.4.1.** Upstream published three advisories on 2026-10-14, none of them in
  OSV on the day of review (2026-10-17), and the scheduled `floor-advisories` job in
  `hygiene.yml` has been red on them since:
  GHSA-2464-fhr4-w9xw (CVE-2026-96889, Critical) is remote code execution in Image
  Optimization when SVG files are used, on glibc-based Linux. GHSA-673q-mjm6-r5xr (Critical)
  is remote code execution in a `use cache` function that returns typed arrays.
  GHSA-p3m5-59mp-jv5r (High) is a CPU denial of service in App Router apps with a Server
  Action. The denial of service reaches the scaffold as shipped, because the web half is
  built on Server Actions. The scaffold has no `use cache` function, and the `/_next/image`
  endpoint exists in every install. Upstream fixed all three in 16.4.1 and 15.5.28 and
  patched no 16.3 release, so the pin crosses a minor, as it did in 1.0.2. The fixed
  releases require `sharp` 0.35.5 or later, upstream's workaround for the first advisory.
  `tools/framework-floor.json` carries the three rows and a review window of 2026-10-17 to
  2026-11-16, and is owned, so `update` refreshes it. `pnpm-workspace.yaml` is seeded, so an
  existing install raises its own pin when `version-sync` reds. The upgrade runbook section
  and the `template/migrations.json` record carry the remedy.
- **The factory lockfile resolves `smol-toml` 1.9.1, and the factory SCA lane is green
  again.** GHSA-r4xh-jqrq-34v2 (Moderate) is quadratic-time `parse()` in `smol-toml` 1.8.0
  and below, first patched in 1.9.0. The package is a transitive of `knip`, a machinery dev
  dependency, so it does not reach an install. The advisory reddened the scheduled
  `factory-sca` job in `hygiene.yml`, which code scanning showed as a
  failing osv-scanner configuration. 1.9.1 is inside `knip`'s caret range, and
  `scripts/sbom-additions.json` records it for 2.0.3.

### Fixed

<!-- Entries from the 2.0.3 items that land after the version bump go here. The cut removes
this comment. -->

- **The session brief prints App Router paths instead of `(unprintable)`** (#153). The path
  validator in `tools/lib/harness-brief.mjs` had no `(`, `)`, `[` or `]`, so every route
  group and dynamic segment, `apps/web/app/(protected)/o/[orgSlug]/page.tsx` and
  `apps/web/app/api/trpc/[trpc]/route.ts` among them, printed as `(unprintable)` in the
  SessionStart brief and in `node tools/harness-status.mjs`. That is how the brief prints a
  refused value, so an ordinary page edit read like an injection attempt, and the path that
  summoned accessibility, design or web-security was lost. The set now admits those four
  characters, and every printed path sits in a code span that a path cannot close, because
  a backtick is not in the set. The validator also refuses what it used to let through: an
  absolute path, an empty or `.` segment, and a segment that starts with `-`. The brief
  judges nothing, so no verdict moves and no ramp opens. `tests/gates/harness-brief.test.mjs`
  renders every path the template ships and an uncommitted route-group page, and refuses
  each new case. `tools/lib/harness-brief.mjs`, `docs/harness/README.md` and
  `docs/runbooks/harness-upgrade.md` are owned and reach an install with `update`.
- **The vertical-slice scaffold writes the worked example's shape** (#155).
  `scaffold-slice.mjs` wrote a slice's web page at `apps/web/app/<slice>/page.tsx`, outside
  the signed-in and org layouts and with no `page.meta.ts`, so a run with no edits turned
  `route-manifest` red. It wrote none of the example's data seams, and its Server Action stub
  taught a write with no org and an `as unknown as <Slice>Database` cast at each call site,
  which the example carried three times. The page is now a segment at
  `apps/web/app/(protected)/o/[orgSlug]/<slice>/` with `page.meta.ts` and `loading.tsx`,
  rendering each state id from `meta.states.*`. Comment-only stubs cover
  `src/data/{port,rows,errors,query-probes,<slice>}.ts` and `apps/web/lib/app-data/<slice>.ts`,
  each citing its section of `references/dal-dto.md`, and `apps/web/lib/app-data/<slice>-port.ts`
  holds the one narrowing function, the only stub that casts. The Server Action stub binds the
  org slug, takes the client, user and org from `requireOrgContext` and revalidates the org's
  path. The migration `next:` line asks for the `org_id` shape of
  `references/migration-rls.md`, and new `next:` lines name the catalog key, the registry
  regen, the browser spec, the query probes and the vertical's `package.json`. On a fresh core
  scaffold every `route-manifest` and `query-shapes` finding a run leaves is one of those
  lines, and the three route steps turn `route-manifest` green. `SKILL.md` and `dal-dto.md`
  teach the same route, narrowing and org-gated write. In the example (`--with-demo`),
  `apps/web/lib/app-data/notes-port.ts` holds the one cast, and the Server Action, the read
  seam and the tRPC route call it. No gate, step or ramp changes.
  `tests/gates/scaffold-slice.test.mjs` runs the script into a temporary root. The script,
  `SKILL.md` and `dal-dto.md` are owned and reach an install with `update`; `notes-port.ts` is
  seeded and withheld from existing installs that carry the example (`seedOnInitOnly`), which
  keep their casts. An install that takes the example's tRPC route whole pulls `notes-port.ts`
  with it; the runbook's 2.0.3 section says when.
- **The auth-event trail's partitions are created ahead of time, and old ones are dropped.**
  `20260816000000_auth_event_trail.sql` called `auth_trail.ensure_partitions()` once, at apply,
  and nothing scheduled it or `auth_trail.drop_partitions_older_than()`: the guarded pg_cron
  block in the audit migration schedules only audit's pair. From the fifth month after apply,
  every sign-in row landed in `auth_trail.events_default`, which retention never drops, and that
  month's partition could no longer be created. The new seeded migration
  `supabase/migrations/20261006000000_auth_trail_partition_schedule.sql` schedules both under
  pg_cron as `postgres` with audit's guard, horizon and 24-month retention, fifteen minutes after
  audit's jobs, then creates any missing months at once. Where the current month's rows already
  sit in the default partition, it creates the three months after it instead, so the schedule
  carries on from the next month. `supabase/tests/auth_trail.test.sql`
  gains two assertions that an active job calls each function (they skip, with the reason, where
  pg_cron is not installed), and the trail's ADR records the schedule. The migration reaches
  fresh scaffolds only (`seedOnInitOnly`); the runbook's 2.0.3 section gives an existing install
  the same SQL for a migration of its own and a query that shows how long it has (#146, part C).

- **A green turn shows the gates' NOTE lines to the user** (#152). Gates print
  `<gate>: NOTE — …` for a ramp that is live, a control that is switched off (the gzip ratchet)
  or a check that did not run (the reviewer ledger with no merge base). From a green step the
  Stop hook kept only `SKIPPED`, `STAMPED` and `FALLBACK MODEL` lines, and it wrote its own
  notes (a floor it could not read, a previous turn that ended red, an unusable block cap) to
  stderr, which reaches only the debug log when a hook exits 0. So on a green turn nobody saw
  any of them. `stop-validate-gate.mjs` now adds them to the one JSON `systemMessage` it prints
  on a green turn, after the fallback lines: the first ten NOTE lines, each cut at 300
  characters and stripped of control and format characters, then the hook's own notes. When
  the message cannot hold every line whole, all of them go to
  `.harness/stop-output/_notes.log`, and the message names that file only when it was
  written. A red turn's block lists a green step's NOTE lines too, and each `stop-step`
  telemetry record gains a `notes` count. No exit code changes, so the agent still does not see
  a green turn's notes; the user does. With no NOTE line, no fallback and no note of its own,
  the hook prints nothing on stdout, as before. `tests/hooks/hook-contract.test.mjs` and
  `tests/hooks/telemetry.test.mjs` hold it. The hook and `docs/harness/README.md` are owned
  and reach an install with `update`; a kept fork of the hook keeps dropping the lines.
- **A new vertical no longer leads an agent into editing the owned `./client` census**
  (#154). The anatomy law requires every vertical's `./client` key, `boundaries` reds a key
  `tools/exports-walls.json` does not sanction, and its message, `check-workspace-deps`' and
  `.claude/rules/boundaries.md` all said to edit the census. The census is harness-owned and
  hash-pinned and an owned file cannot be proposed, so the edit landed and `gate-integrity`
  called it tampering at the next validate, whose remedy reds `boundaries` again. A new
  write-guard row, `exports-walls-census`, denies an agent's Edit or Write of the census, and
  `WRITE_PROTECTED` rows gain an optional `message` the guard prints in place of the shared
  text, which points at `harness-proposals/`. The census row's message names the human path:
  hand the `{package, reason}` entry to a human, who adds it under security-owner review and
  re-records the file's sha256 in `.harness/manifest.json` in the same reviewed commit, after
  which `update` parks each later census change ("Forking an owned file"). Both `boundaries`
  reds and a new `scaffold-slice` `next:` line name the same path, `dal-author.md` and the
  slice `SKILL.md` stop presenting the census entry as a Class-A opt-in, and the stale
  "SEEDED" comment in `check-exports-walls.mjs` is corrected. Every row without a `message`
  prints the shared text byte for byte, and no verdict moves, because `gate-integrity` already
  redded the edit the row denies. `tests/hooks/hook-contract.test.mjs`,
  `tests/gates/check-boundaries.test.mjs` and `tests/gates/scaffold-slice.test.mjs` pin the
  deny, the messages and the `next:` line. Every file this changes is owned and reaches an
  install with `update`; the runbook's 2.0.3 section gives the human path for each new
  vertical. An additive project census, which would let a project sanction its own vertical
  without forking, is gate-proposal #160.
- **The bash guard denies every spelling of the skip-hooks commit flag** (#222). The
  `git-commit-no-verify` rule in `.claude/hooks/lib/guard-rules.mjs` caught `-n` only as a
  later argument on its own and allowed nothing between `git` and `commit`, so
  `git commit -nm x`, `-n` as the first argument, `-an` anywhere, `--no-verif` (git accepts an
  unambiguous prefix of a long option) and `git -c k=v commit --no-verify` all committed past
  lefthook's Biome, gitleaks and commitlint hooks. The rule now matches `n` in any short-flag
  cluster, every prefix of `--no-verify` down to `--no-v`, and global options such as `-c`,
  `-C` and `--git-dir=` before the subcommand. `git commit -m "x"`, `git commit -am "x"`,
  `git commit --amend --no-edit`, `--no-verbose` and the scaffold's
  `git -c user.email=… commit -qm` stay allowed. A message that only mentions ` -n` is now
  denied, a false positive in the safe direction. `tests/hooks/hook-contract.test.mjs` denies
  each spelling and allows each of those. No gate, step or ramp changes. `guard-rules.mjs` is
  owned and reaches an install with `update`.
- **The worked example builds its notes write context in one place** (#144). The tRPC router
  built a write's `{ actorId, emit, now, orgId }` in a function, while the web Server Action
  wrote it as an object literal with a no-op sink of its own and a `new Date()` nothing could
  inject. Both dropped every event, but a sink wired at `createContext`'s `emit` would have
  heard every tRPC write and no web one. The vertical now exports `noteWriteContext` from
  `src/data/write-context.ts`, beside `NoteWriteContext`, and the router's `writeContext` and the
  Server Action both call it. The new `apps/web/lib/request-ports.ts` holds the web host's one
  event sink (it still drops events) and clock: the action builds its context from it, and the
  tRPC route passes it to `createContext` (in the default tree too). `references/dal-dto.md` and
  the scaffold's Server Action stub teach the builder and the ports instead of the fields. No
  gate, step, ramp, row, event or generated file changes. The new
  `apps/web/__tests__/notes-write-context.test.ts` drives `createNoteAction` with a recording
  sink and a fixed instant and was red before the change; `envelope.test.ts` pins one
  `notes.created` reaching an injected `emit` over tRPC.
  `dal-dto.md` and `scaffold-slice.mjs` are owned and reach an install with `update`; the four
  new files are seeded and withheld from existing installs (`seedOnInitOnly`), which keep both
  copies. The runbook's 2.0.3 section says how to adopt the builder, and what to pull with an
  example file taken whole.
- **A note create past its quota reports `quotaExceeded`, not a retryable `unavailable`**
  (#147, part A). The notes table's per-org quota trigger raises SQLSTATE `53400`, and the
  example's mapper (`packages/verticals/notes/src/data/errors.ts`) had no case for it, so the
  code fell into class 53's retryable fallback. A create past the quota came back as
  `unavailable`, the one kind the kernel calls safe to retry, and the web showed "The service
  is temporarily unavailable. Try again shortly." instead of the quota copy, though waiting
  never frees a quota. The mapper now matches `53400` before that fallback and returns
  `quotaExceeded` with `@app/supabase`'s own sentence for the code, so the web shows "This
  organization has reached its limit." Every other class-53 code is still `unavailable`. No
  gate, step or ramp changes. A new `notes.test.ts` case, red before the change, sends `53400`
  through `createNote`. The mapper is seeded, so `update` does not change it in an existing
  install with the example; the runbook's 2.0.3 section gives the case to add by hand. The
  wrap of the platform mapper that removes the copied SQLSTATE table is part B, after #159.
- **The worked example's parity ledger names the web notes route for `notes.create` and
  `notes.list`** (#148). `template/demo/PARITY.md` marked both web cells `—` and said no notes
  screen was wired yet, while the notes route renders the composer, which submits through
  `createNoteAction`, and the list, which it loads through `loadNotesPage`. The `parity` gate
  stayed green because it checks only that a path cell exists and that a `—` cell gives a
  reason. The two web cells now name `note-composer.tsx` and `page.tsx` under
  `apps/web/app/(protected)/o/[orgSlug]/notes/`, and their Notes cells say web reaches each
  action through the Server Action or RSC twin, which runs the same `@app/notes` function, not
  over HTTP. No gate, step or ramp changes, and `template/demo-index.json` does not change.
  `tests/gates/check-mobile-parity.test.mjs` pins both cells and each screen's call, and was
  red before the edit. `PARITY.md` is seeded, so existing installs keep their copy. An install
  made with `--with-demo` by 2.0.0 to 2.0.2, or any 1.x install, can make the same two edits by
  hand, copying the rows from this release's `template/demo/PARITY.md`. A 2.0.x install that
  ejects without them keeps both rows as a conflict, and `parity` then reds them as stale, so
  delete the two rows by hand after `eject`.
- **The factory's per-edit citation check reads every template layer** (#223).
  `.claude/hooks/posttool-factory-check.mjs` runs the shipped `posttool-source-check` on this
  repository's own edits. It stripped the layer prefix from the edited path but always ran the
  hook from `template/base/`, so an edit to `template/stack/<p>`, `template/modules/<module>/<p>`
  or `template/presets/<preset>/<p>` was judged on `template/base/<p>`. That file is usually
  not there, and the hook exits 0 when its read fails, so an uncited decision site in those
  layers passed unread; where it is there, the verdict was on the wrong bytes.
  `template/demo/` was not a layer at all. The adapter now runs the hook from the root of the
  layer the edit is under, with `template/demo/` added, and the hook still loads its tables
  from `template/base/`. `tests/hooks/posttool-factory-check.test.mjs` writes each fixture only
  under its own layer and was red before the change. Factory only: nothing changes for an
  install.
- **Three copied bodies are one** (#149). Each pair sat under the duplication gate's 70-token
  floor, so none was reported. `serverPublicCredentials` in
  `packages/platform/supabase/src/server-env.ts` repeated `publicCredentials` from
  `public-env.ts`, and now returns it: the import runs server to public only, and nothing
  reachable from `./client` imports `server-env.ts`. The mobile theme and locale stores each
  kept a listener set with its own `emit` and `subscribe`; both now take them from the new
  `apps/mobile/src/lib/change-signal.ts`, which imports nothing and has its own vitest suite
  (listed in both `apps/mobile/jest.config.js` copies, so no runner runs it twice). The
  example's `noteCreated` and `noteDeleted` differed only in the event name; one private
  `lifecycleEvent(name)` in `events.ts` now builds both. No export, emitted event, gate or
  threshold changes, and the tests that pinned the old behaviour pass unedited. This reaches
  new scaffolds only: every source file it touches is seeded, and `change-signal.ts` and its
  test are withheld from existing installs (`seedOnInitOnly`). The runbook's 2.0.3 section
  says how to adopt the module.
- **The push-notifications slice passes the vertical-anatomy laws once applied, and a test
  applies it** (#156). The module ships its `@app/push` vertical as `.ts.txt` reference files
  that nothing compiles or gate-checks, and no test ever applied them, so the slice drifted
  from the laws its applied copy is judged by. Applied to a 2.0.x scaffold as `APPLY.md` said,
  it redded `boundaries` with five findings: `port-presence` on `src/data/push-tokens.ts`,
  whose port was declared inline; `port-presence` and `domain-purity` on
  `src/domain/push-token-id.ts`, whose `Buffer.from(` reads as a PostgREST call and whose
  `node:crypto` import a domain file may not make; and two `dual-barrel` findings, because the
  vertical has no `./client` barrel on purpose. The port now lives in `src/data/port.ts`, which
  the DAL imports with `import type`. The id helper and its test move to `src/server/`, not
  `src/data/`, because the `app-error-only` lint rule forbids a `throw` there and the helper
  fails closed on a non-UUID owner; its `Buffer.from(` calls become
  `Buffer.alloc(16, hex, 'hex')` and `digest.subarray(0, 16)`, and the pinned id test passes
  unchanged. A new `APPLY.md` step 8 adds one reviewed `dual-barrel` row to
  `tools/vertical-anatomy-allow.json`. `APPLY.md` also catches up with the 2.0.x trees: steps 3
  to 5 say what to do with and without the worked example, step 4 adds the `zod` dependency the
  router needs to compile, step 5 shows today's `ISOLATION_TARGETS` shape and bumps whatever
  `plan(N)` the suite has, and step 7 says a default scaffold has no notes clone to accept. The
  new `tests/installer/module-slices.test.mjs` scaffolds with `--tier core`, with and without
  `--with-demo`, enables each module that ships a slice, follows its installed `APPLY.md`, and
  requires `boundaries` and `duplication` to pass; it was red on the five findings before the
  change. No gate, step, ramp, count or floor changes. The slice, `APPLY.md` and the module
  README are owned and reach an install that enabled the module with `update`, which removes
  the two moved files when unmodified. A slice you already applied is seeded and stays yours;
  the runbook's 2.0.3 section gives the hand steps.
- **The factory's write guard denies every spelling of a protected path, and judges
  NotebookEdit** (#224). `.claude/hooks/pretool-write-guard.mjs` stripped the project dir from
  `file_path` and matched the rest as spelled, so `docs/../scripts/hygiene.mjs` and
  `./scripts/hygiene.mjs` passed every `^`-anchored pattern, and `scripts/../docs/guide.md`
  was denied though it lands in `docs/`. It read only `file_path`, so a NotebookEdit, which
  sends `notebook_path`, was judged on an empty path and passed. The guard now reads
  `file_path`, `notebook_path` or `path`, resolves it against the project dir and judges the
  project-relative result; a path that resolves outside the project passes, as before. The new
  `tests/hooks/factory-write-guard.test.mjs`, the guard's first test, was red on six of its
  nine cases before the change. Factory only: nothing changes for an install.
- **CONTRIBUTING says which commands cover a first change, and how long they take** (#167).
  "Local development" opened with every check CI blocks on, and never said which of them a
  given kind of change needs, how long each takes, or that the test suites need no install. A
  new "Your first change" subsection at its top gives the commands for a doc fix, an installer
  change, a hook change and a gate change, with times measured twice on a fresh clone with no
  install. It also says when to regenerate the released-sha table, which check is the slowest,
  and that a red check on a first pull request is normal. The full list follows under its own
  heading, unchanged, and `check-claims` still finds every `lint.yml` blocker in it. Factory
  only: nothing changes for an install.
- **The two append-only trails share one `deny_mutation()` and one pair of partition
  functions** (#146, parts A, B, D and E). The auth-event trail had copied the audit trail's
  `deny_mutation()`, `ensure_partitions(int)` and `drop_partitions_older_than(interval)` line
  for line, one schema over. No gate reads `supabase/**/*.sql` for clones, and the copies had
  drifted: the trail's maintenance was never scheduled (part C, above), its partition
  functions were revoked from `PUBLIC` only, and nothing proved that a new month got its
  `TRUNCATE` guard. The new seeded migration
  `supabase/migrations/20261007000000_trail_shared_functions.sql` makes `audit.deny_mutation()`
  name the schema it fired in, so a refusal on `auth_trail.events` still says `auth_trail` and
  the text for `audit.events` is unchanged. It adds `audit.ensure_partitions(regclass, int)` and
  `audit.drop_partitions_older_than(regclass, interval)`, which take the parent, derive the
  schema and the partition names from it, and refuse any parent but `audit.events` and
  `auth_trail.events`. The four old signatures become one-line wrappers, so the pg_cron jobs
  that call them by name keep working and none is re-pointed. Every trigger on the trail is
  re-pointed in place, the trail's wrappers are revoked from `anon` and `authenticated` as
  audit's are, and `auth_trail.deny_mutation()` is dropped without `CASCADE`. Everything stays
  `SECURITY INVOKER` with an empty `search_path`, and `tools/tenancy.json` does not change. The
  cost is the trails' independence: one `CREATE OR REPLACE` of `audit.deny_mutation()` now
  reaches both, which both ADRs record. `supabase/tests/auth_trail.test.sql` gains fourteen
  assertions (plan 25 to 39). Six of them were red without the migration: one trigger
  function for both trails, no copy in `auth_trail`, the shared pair closed to client roles
  and to any other parent, and wrappers with no DDL of their own. The other eight pass before
  and after: a month partition refuses `TRUNCATE`, so does a month each trail's maintenance
  creates during the run, every partition of both trails has a `TRUNCATE` trigger of its own,
  and each refusal names its trail. `supabase/schemas/40_audit.sql`
  declares the new body. No gate, step or ramp changes. The migration reaches fresh scaffolds
  only (`seedOnInitOnly`); the runbook's 2.0.3 section gives an existing install the same SQL
  for a migration of its own, with its second half left out where the trail was never adopted.

## [2.0.2] — 2026-10-03

**A patch: the installer stops moving an install backwards.** `update`, `enable`, `disable`
and `eject` write the running CLI's copy of the template, and an older CLI used to do that
over a newer install without a word. A 2.0.0 CLI over a 2.0.1 install printed `harness
update 2.0.1 → 2.0.0` and rewrote 11 owned files. A global install stays at the release it
was installed at, and a bare `npx next-expo-supabase-agent-harness` resolves to that copy, so
this was the ordinary stale-CLI case, and the README had just started offering
`npm i -g`. From 2.0.2 the four refuse an older CLI, `graduate` advances `baseVersion` to the
install's own version, and every command the harness prints names `@latest`. No gate is added,
the chain length does not change, and no ramp opens or moves. The `template/migrations.json`
record withholds nothing and restates 2.0.0's twenty-vintage `rampExpiry` population.
`scripts/lib/ramp-sites.mjs` `VINTAGES` grows by `2.0.1`.

### Security

- **The write guard's `apply-proposal` rule also matches the global command and `npm exec`.**
  Applying a staged register edit is reserved for a human; the verb refuses without a
  terminal, and the `apply-proposal-invocation` rule in `.claude/hooks/lib/guard-rules.mjs`
  is the second layer. It matched the verb only behind `node`, `pnpm`, `npx` or `tsx`, so the
  bare `next-expo-supabase-agent-harness apply-proposal <id>` a global install provides, and
  `npm exec next-expo-supabase-agent-harness -- apply-proposal <id>`, were not denied. Both
  are now, with deny cases for each in `tests/hooks/hook-contract.test.mjs`.

### Fixed

- **`update`, `enable`, `disable` and `eject` refuse a CLI older than the install.** Each
  stops before its first write (before the rollback snapshot, and in `--dry-run` and
  `--refresh-seeded` too), naming both versions and
  `npx next-expo-supabase-agent-harness@latest <command>`, plus `npm i -g
  next-expo-supabase-agent-harness@latest` for a global install. The same version is still
  allowed. The check is `refuseOlderCli` in `installer/lib/migrations.mjs`, and
  `tests/installer/version-mismatch.test.mjs` runs all four against a real scaffold whose
  manifest claims a newer release and asserts the manifest is untouched and no snapshot
  was taken. Because the check is in the installer, only a 2.0.2 or later CLI makes it.
- **`graduate` advances `baseVersion` to the install's `harnessVersion`, not the CLI's
  version.** Run at `@latest` on an install that had not been updated, it marked ramps the
  install does not carry as swept, so they would arrive as hard reds rather than NOTEs on
  the next `update`. It now targets the install's own version whichever CLI runs it, and
  a `baseVersion` already at that version is a no-op. A `baseVersion` recorded above
  `harnessVersion` before 2.0.2 is not rewritten.

### Changed

- **Every CLI command the harness prints names `@latest`.** The gate messages under
  `tools/`, the hooks, the upgrade runbook, the module READMEs and the other shipped docs
  printed `npx next-expo-supabase-agent-harness <command>`, which runs a global copy when one
  is on `PATH`. They now print `npx next-expo-supabase-agent-harness@latest <command>`, in 41 template
  files. Every template file this release changes (49, with the other hook stamps) is owned,
  so `update` re-plants it when unmodified; a kept fork prints the old spelling, which still
  runs. `docs/cli.md` documents the global command, the
  refusal and the `graduate` target.
- **The README spells out both ways to run the CLI.** It says the npm package is the CLI
  that `npx` runs. Then come three boxes: the `npx` command, `npm i -g
  next-expo-supabase-agent-harness`, and `next-expo-supabase-agent-harness init` to run from
  an empty folder. It says `init` asks for the project's details first, each with a default
  that Enter accepts, and that `init --yes` accepts them all. It says why the install is
  global (a local `npm i` writes a `package-lock.json`, and `init` stops when it finds one)
  and that a global install stays at its version until `npm i -g …@latest`. An npm version
  badge beside the OpenSSF badges links the package's npm page, because GitHub's "Packages"
  panel lists only GitHub Packages. The README's paragraph on how the package is published
  and on the older `npx github:` form is gone; SECURITY.md (Verifying a release) and
  docs/cli.md still cover both. #220 made the first pass of this.
- **`init` prints its next steps as a numbered list.** It used to end with one 389-character
  `next:` note carrying four commands, their order, two reasons and the rule the Stop hook
  enforces. The steps now print one per line under `next steps:` (`git init`, `pnpm install`,
  `git add -A && git commit` with the committed-lockfile reason, `pnpm validate`), and
  `--report json` carries them as a `steps` array. `git init` is left out when the target is
  already a git repository, and a retrofit keeps its note about merging the `.harness`
  sibling configs. The list is `nextSteps()` in `installer/commands/init.mjs`, and
  `check-ci-preconditions` and `tests/gates/next-steps-order.test.mjs` now read that function
  for the committed-lockfile step and the `git init`-first order; both still go red when it
  loses either. Contributed by @Soumo-git-hub (#162, #217).

## [2.0.1] — 2026-10-03

**A security patch.** Five `next` advisories upstream published on 2026-09-30 covered the
16.3.6 floor and pin 2.0.0 shipped, and two of them the 15.5.24 floor. The scheduled
`floor-advisories` job reported them on 2026-10-02, hours before 2.0.0 was cut, and the
2.0.0 floor decision did not read that run. 2.0.1 moves the floor and the pin to 16.3.8
(15.5.27 on the 15 line) and records all five. No gate is added, the chain length does not
change, and no ramp opens or moves. The `template/migrations.json` record withholds nothing
and restates 2.0.0's twenty-vintage `rampExpiry` population. `scripts/lib/ramp-sites.mjs`
`VINTAGES` grows by `2.0.0`.

**This release reds existing installs, by design.** `update` refreshes the owned
`tools/framework-floor.json` and leaves the seeded catalog alone, so `version-sync` reds on
any `next` pin below the new floor until the consumer raises it. The remedy is in
`docs/runbooks/harness-upgrade.md`, 2.0.1 section.

### Security

- **The `next` floor moves to 16.3.8 on the 16 line and 15.5.27 on the 15 line, and the
  catalog pins 16.3.8.** Upstream published five advisories on 2026-09-30, none of them in
  OSV on the day of review (2026-10-03):
  GHSA-cjq9-62q9-8jv4 (CVE-2026-94483, High) is server-side request forgery in Image
  Optimization through an allow-listed remote URL, for apps that configure
  `images.remotePatterns`. GHSA-4jqv-mc3x-m676 (CVE-2026-94543) and GHSA-mcj8-r9mp-w47p
  (CVE-2026-94484), both Moderate and on both lines, are cache poisoning of statically
  generated and ISR pages, on the Pages Router when self-hosted and behind a root-level
  catch-all page. GHSA-f87g-xv8r-7p7x (CVE-2026-94485, Moderate) is App Router metadata image
  routes ignoring `dynamicParams` in webpack builds. GHSA-39w2-rjm5-chcv (CVE-2026-94486, Low)
  is the `next dev` server's Model Context Protocol endpoint answering any origin.
  Every one gives its patched version as an unannounced `16.3.?` (or `15.5.?`), so no
  release is confirmed fixed. 16.3.8 and 15.5.27, the newest release on each line, came out
  the same day, and the floor moves to them rather than wait; each row in
  `tools/framework-floor.json` says the fix is unannounced. As shipped, the scaffold
  configures no `images.remotePatterns`, is App Router only with no static generation or
  ISR, and has no metadata image route, so of the five only the `next dev` disclosure
  reached a tree that added none of those. The review window moves to 2026-10-03 through
  2026-11-02. `pnpm-workspace.yaml` is seeded, so an existing install raises its own pin
  (`docs/runbooks/harness-upgrade.md`, 2.0.1 section), and `scripts/ci/apply-framework-floor.mjs`
  plays that remedy in the upgrade lane. A later release records the fixed versions once
  upstream names them.

### Fixed

- **`floor-advisories` reads an upper bound on an unannounced patch.** GHSA-cjq9-62q9-8jv4
  gave its range as `>= 16.0.0 < 16.3.?`, and the job reported it as a range syntax no test
  covers instead of judging it. An upper bound whose patch is `?` now reads as the whole
  major.minor line (`< 16.3.?` means `< 16.4.0`), because the fix is somewhere on that line
  and which release is unknown; a `?` anywhere else is still unreadable.
  `tests/gates/floor-advisories.test.mjs` adds the evaluator cases and the advisory as the
  run saw it. Factory only: nothing changes for an install.
- **`publish-npm` waits up to ten minutes for the registry to show a new version.** After
  `npm publish`, the job reads the version back and fails unless the registry holds the
  attested tarball, with provenance, from the GitHub trusted publisher. It read ten times,
  15 seconds apart. npm answers a trusted publish with "Your package is being processed and
  may take a few minutes to become available", and 2.0.0 became readable 2 min 38 s after
  `npm publish` returned, 20 seconds after the last read, so the job went red on a version
  that was published correctly. The same check, run once the version was readable, passes.
  `scripts/ci/npm-publish.mjs` now reads 40 times, 15 seconds apart, about ten minutes,
  inside the job's 30-minute timeout, and `tests/gates/npm-publish.test.mjs` holds the
  default budget to at least five minutes. A record that is readable and wrong still fails
  at the first read. Nothing changes for an install.

## [2.0.0] — 2026-10-02

**A major, the opt-in release: what an install carries is what it opted into, and the notes
1.1.0 opened become verdicts.** 1.2.0 is never cut: this lineage goes from 1.1.0 to 2.0.0
directly, and every comparison is `>=`, so each deadline dated 1.2.0 arrives here. Eighteen of
the twenty-four ramp sites the 1.1.0 release held at minVersion 1.1.0 reach it, across fifteen
gates, so an install whose `baseVersion` is below 1.1.0 now gets a hard failure where it got a
dated NOTE: the SQL history fold in `data-flow`, `db-limits`, `query-shapes`, `tenancy` and
`schema-rls`, `migrations`' `ALTER POLICY` rule, `schema-rls`' grant bound, `docs-sync`'s
severity contract, verdict-demand position and `AGENTS.md` gate list, the Edge Function
surface in `diff-coverage`, `edge-functions`, `mutation-ratchet` and `mutation-scope`,
`gate-integrity`'s planted escape list, `web-compile`, `route-manifest`'s per-route browser
closure, and `workflow-hardening`. A 1.1.0 install meets none of them. Of the other six, two
retire with what they carried (see Removed), two were dated 2.1.0 when they opened (the
reviewer ledger v2 and the security-reviewer model check), and two move to 2.1.0 (see
Changed). Each item that lands after this bump adds its entry below; the breaking ones say so.
The `template/migrations.json` record for 2.0.0 carries `rampExpiry` (twenty vintages, 0.1.3
through 1.0.4: 1.1.0's fifteen plus the five 1.0.x vintages), one `seededSourceFixes` set and
two `rampExtensions` entries, and injects no chain step. `scripts/lib/ramp-sites.mjs`
`VINTAGES` grows by `1.1.0`. The obligations register loses twelve release rows and re-targets
two to 2.1.0 (#86).
The full encryption rule, `.claude/rules/e2ee.md`, leaves every install without the `e2ee`
module (see Removed): the record's `removed` entry deletes it where a release's bytes still
stand, and an `e2ee` install gets it back as the module's own file (#86).
**Breaking: a fresh `init` writes no worked example.** The notes vertical, its screens, routes,
Server Action and migrations, and the matrix screen move to their own template tree, which
`init --with-demo` overlays and the new `eject` takes back out. An existing install keeps its
example: it is seeded, and `update` neither rewrites nor deletes it (#85).
**Breaking: `reviewer-verdicts` keys the reviewer ledger on the session and a format stamp,
not the prompt.** The step needs only the session id, and a reviewer whose verdicts in the
current session a 1.1.x hook wrote is re-run once after `update` (see Changed) (#87).
**This release reds every install whose `next` pin is below 16.3.6, by design.** `update`
refreshes the owned `tools/framework-floor.json`, whose 16.x floor moves to 16.3.6 (see
Security), and leaves the seeded catalog alone, so `version-sync` reds until the install
raises its own pin. The runbook's 2.0.0 section gives the remedy (#81).

### Added

- **`init --with-demo` and `eject`.** The worked example is stored in `template/demo/`, an
  overlay on the base and stack plan the way the design-token presets overlay the stack:
  same-path replacement plus additions. It may replace only seeded files, so `update` never
  meets two owners for one path. `init --with-demo` plans it and records `"demo": true` in
  the manifest; a default `init` records `"demo": false`, and `init --force` carries the
  recorded choice. `update` overlays it only where the manifest records it, so a default
  install is never handed a demo file. `eject` (with `--dry-run`) removes it in three parts:
  it deletes each demo file that still holds the bytes its record names, gives each shared
  file the demo replaced the default bytes back, and trims the register rows the generated
  sidecar `template/demo-index.json` lists, as `{file, jsonPointer}` pairs or, for
  `PARITY.md`, `{file, rowKey}`, each with a `restore` twin for a default row the demo
  changed. A drifted file or a re-recorded fork is kept, and its record dropped, as `disable`
  does; a changed shared file keeps the project's bytes and parks the default copy under
  `.harness/pending/`; a register row is deleted only while it equals the shipped demo row,
  array rows in descending order. It re-derives `tsconfig.json`'s references, clears the
  build output of a package it removed whole, and exits non-zero on an install without the
  demo, changing nothing (#85).
- **`eject` deletes the example's migrations on the record.** Each one is recorded with the
  sha256 of the bytes it deleted under `ejectedMigrations` in `.harness/manifest.json`, and
  `migrations` accepts the deletion of exactly those bytes with a NOTE naming the runbook. A
  deletion of other bytes, an edit, and a malformed record all still red (#85).
- **A factory check keeps the sidecar index honest: `scripts/check-demo-index.mjs`.** It
  derives the index from the trees (every row where the demo's copy of a seeded register
  differs from the default's, both ways) and reds a demo row the index misses, an index row
  that resolves to nothing or to a row both copies share, an index that is not in its
  generated form, a demo file that replaces a non-seeded file, and an owned file in its scope
  that names a demo path: a path only the demo ships, or `@app/notes`. Its scope is the owned
  files of base, stack, the presets and the modules, outside `*.md` and `docs/`; a JSON object
  marked `"demo": true` is skipped, and the slots the default tree keeps for the first
  vertical (`packages/verticals`, `apps/web/lib/app-data`, `supabase/seeds`) are not demo
  paths. `--write` regenerates the index. It runs in `lint.yml`'s machinery block, in
  CONTRIBUTING's Local development list and in the factory Stop hook, and each case has a red
  fixture in `tests/gates/check-demo-index.test.mjs`, registered in `#factoryGates` (#85).
- **A selftest lane for the round trip: `demo-eject`.** It runs `init --with-demo`, validates,
  runs the RLS suite and Canaries 17 and 24 on the live stack, stops the stack, runs `eject`,
  requires the tree to equal a fresh default `init` byte for byte outside `.harness/`,
  reinstalls and validates again, requiring a `migrations` NOTE for each deleted migration.
  It is registered in `#factoryLanes` (#85).
- **Reviewed empty states for the gates whose only subject was the example.** `schema-rls`
  accepts MFA helpers no policy uses only under a `tools/rls-exempt.json` `mfaRailUnused` row
  with a reason and a review date, and reds that row once a policy uses the rail.
  `query-shapes` accepts a tree with no `packages/verticals/*` when the manifest records
  nothing, and reds a manifest that still records shapes. `db-perf` and the shipped
  `db-scale` adoption step stand down on a manifest with no read shape. `rate-limits` takes an
  optional `unmapped` bucket that must be declared and must be what both seams return for a
  surface no row maps. The default registers carry the rows (#85).
- **`maestro/journeys/session.yaml`, the default device journey.** It signs in through the
  app's own screen, reads the security screen's second-factor list, relaunches and reads it
  again, so the persisted session and an authenticated server read are proven on every
  scaffold. The example's mutation journey ships with the demo, and `tools/ci/device-lane.sh`
  runs every journey in the directory (#85).

### Security

- **The `next` floor on the 16 line moves to 16.3.6, and the catalog pins 16.3.6.**
  GHSA-vcvr-r3jv-pc5j (CVE-2026-94545, Critical, published upstream on 2026-09-22) is remote
  code execution in the Node.js `ImageResponse` of `next/og` when an app passes
  attacker-controlled values into the SVG content, attributes or styles it renders, through
  an upstream vulnerability in satori. It affects `>= 16.2.0 < 16.3.6`, so it covered the
  16.3.3 floor and the 16.3.5 pin that every release from 1.0.2 to 1.1.0 shipped. The 15 line
  is outside the range, and its floor stays 15.5.24. The scaffold imports nothing from
  `next/og`, and the floor moves anyway, because an Open Graph image route is one import
  away for a consumer. `tools/framework-floor.json` records the advisory under its GHSA id,
  because OSV lists the CVE as related rather than as an alias, and its review window moves
  to 2026-10-02 through 2026-11-01. The pin bump is Renovate's security update, merged with
  the file's header comment kept where Renovate's rewrite had dropped it. Existing installs
  red `version-sync` until they raise the seeded pin, from 16.3.5 a patch on the same minor;
  the runbook's 2.0.0 section gives the remedy, and the `template/migrations.json` record
  says why there is no `catalogPinFloors` entry. This is the maintainer's decision on the
  `floor-advisories` lane's first finding, which 1.1.0 left open. The register-freshness
  test that assumed the floor's window closes before the eol register's now derives which
  one closes first (#81).

### Fixed

- **`reviewer-verdicts` no longer prints a remedy that does not work for a mis-shaped ledger
  line.** A line of the current prompt that lacks `agent_type` or `verdict` fails closed, and
  the step said to re-run the reviewer, because "a fresh well-formed PASS supersedes the torn
  line". It never did: the reader stops at that line, so the error lasted until the next
  prompt whatever ran. 2.0.0 keeps that lifetime and corrects the remedy: a re-run does not
  clear it, the next prompt does, and the agent should end the turn and tell the user. With
  the session as the whole key the error would otherwise have lasted the rest of the session,
  with nothing the agent could do about it (decision 3) (#87).
- **A release whose CHANGELOG section is over GitHub's release body limit still publishes.
  1.1.0 is a tag with no release.** `release.yml` published the section for the tag as the
  GitHub Release's body, and GitHub refuses one over 125000 characters. The 1.1.0 section is
  over 166000, so the v1.1.0 build packed and attested the tarball and then failed at
  `gh release create` with HTTP 422. `publish-npm` needs that job and was skipped, so 1.1.0
  has no GitHub Release and no npm version. The workflow runs from the tagged commit, so the
  build could not be repeated without moving a published tag, and the lineage goes on to
  2.0.0 instead. The `v1.1.0` tag stands, and the 1.1.0 records in this file, the upgrade
  runbook and `template/shas` describe it as before. An install below 1.1.0 that wants the
  1.1.0 NOTEs before 2.0.0 makes them hard can still update from the tag through the
  `github:` form (`#v1.1.0`). The step now runs `scripts/ci/release-notes.mjs`. A section
  within the limit is the body unchanged. One over it keeps the opening paragraphs and every
  heading, shortens each entry to its bold lead and issue references, and links this file at
  the tag for the full text. A section still over the limit after that, or a missing one,
  fails the step. `tests/gates/release-notes.test.mjs` pins those verdicts and bounds this
  file's section for the version in `package.json`, so a section that cannot be published
  fails a pull request instead of a tag build. Nothing changes for an install.

### Changed

- **Owned configuration derives from the tree instead of naming the example.**
  `eslint.config.mjs` applies the chart ban to every feature directory holding a
  `perfSubject.tsx`; `vitest.config.ts` finds the mobile suites and their measured siblings
  under `apps/mobile/src`, and excludes the web read seams by convention
  (`apps/web/lib/app-data/!(*-model).ts`), which `diff-coverage` now reads (it supports one
  `!(…)` group per segment); `knip.json` names a workspace glob and the perf-subject entry
  instead of the example's files. `tsconfig.json`'s references stay derived at install, so an
  install with the example keeps its reference. The conformance map's notes say "a vertical"
  where they said "notes", and the 15.3.1 proof cites `.claude/agents/security-reviewer.md`.
  The authoring skill's `scaffold-slice.mjs` stubs cite the skill's generated references,
  which are now generated from `template/demo/` (#85).
- **`boundaries` reads the `@app/notes` wall as the example's.** Its `tools/exports-walls.json`
  row is marked `"demo": true`, and a demo row is dormant on an install whose manifest records
  `"demo": false`. Where the manifest records the demo or no choice (every install from before
  2.0.0), the row is live and reds as stale once the package is gone, naming `eject` and the
  runbook (#85).
- **`tools/generated/event-catalog.json` is seeded and write-guarded.** The default and demo
  trees commit different catalogs, and `update` re-planting the owned file would hand a default
  install's catalog to an install with the example. It joins its two generated siblings, which
  1.1.0 made seeded for the same reason, and the new guard rule `event-catalog-manifest` (147
  rule ids) protects it like them. This closes the 1.1.0 item that called it still owned (#85).
- **The factory canaries that inject into the example run on an `init --with-demo` scaffold.**
  The `canary` and `day0-empty-states` jobs initialise with `--with-demo`, and Canaries 3, 4, 5,
  14, 22 and 28 first check their target exists, so on a tree without the example they red at
  the injection rather than creating the file they meant to edit. Canaries 17 and 24 moved
  from `bootstrap-linux` to `demo-eject`, and `maestro-smoke` initialises with `--with-demo`
  for the mutation journey. No job was renamed, and no canary was deleted (#85).
- **Default scaffold leftovers of the example are gone or put to use.** The perf harness
  shows the design system's `Spinner` while a run is in progress, so the default scaffold
  consumes it; the i18n seam's two formatters are marked `@public` seam API; and the default
  suppression census counts one `org-id-from-session-only` directive where the example added
  a second (#85).

- **The NOTE fleet 1.1.0 opened is now enforcing for installs below 1.1.0.** The eighteen
  sites above expire at 2.0.0, as their obligations rows said they would. The 2.0.0 record's
  `rampExpiry` names their population, copied from `check-ramp-ledger`'s output at 2.0.0, and
  the ten rows that carried them are deleted: `docs-sync-severity-contract-ramp-expiry`,
  `docs-sync-verdict-demand-ramp-expiry`, `docs-sync-gate-list-ramp-expiry`,
  `workflow-hardening-project-workflows-ramp-expiry`, `sql-history-fold-ramp-expiry`,
  `grant-bound-ramp-expiry`, `web-compile-ramp-expiry`,
  `route-manifest-browser-closure-ramp-expiry`, `edge-functions-surface-ramp-expiry` and
  `gate-integrity-planted-escape-list-ramp-expiry`. Nothing new is demanded: the sweep is the
  1.1.0 one, and the runbook's 2.0.0 section lists what arrives and points to each part of it.
  `SWEEPS['2.0.0']` is a reviewed empty entry (#86).
- **The uuid 7 acceptance is re-affirmed and moved to 2.1.0, and its arrival ramp re-opens at
  2.0.0.** `tools/eol.json` dated its re-review 1.2.0, which arrives here, and
  `check-eol-target` reds a production-scope target the version has reached. The re-review on
  2026-09-30 found the discharge condition unmet: `xcode` 3.0.1 is still the latest and still
  declares `uuid: ^7.0.3`, `@expo/config-plugins` depends on it at both `latest` (57.0.9) and
  `next` (58.0.4), and a registry sweep of a fresh strict-tier scaffold (1581 pairs, 0 errors)
  found the same seven deprecations the register carries. The vendor's message now also warns
  that uuid@11 will likely be deprecated in 2028. The register is seeded, so every 1.1.0 install
  still holds `"removalTarget": "1.2.0"`. The standing rule is paid in full: a
  `seededSourceFixes` probe on that literal parks the re-affirmation, a `rampExtensions` entry
  moves `version-sync`'s arrival escape from (1.1.0, 1.2.0) to (2.0.0, 2.1.0), and the
  obligations row `version-sync-eol-arrival-ramp-expiry` is re-targeted to 2.1.0 (#86).
- **`reviewer-verdicts`' round budget moves to 2.1.0, beside the ledger v2 it judges by.** The
  budget counts review rounds over the reviewer ledger v2's change set and closes a loop only
  on the same run's PASS over an unmoving tree. On an install below 1.1.0, v2 stays a NOTE until
  2.1.0 and the 1.0.x judgement decides, under which a later prompt's PASS from any run clears
  a BLOCK; expiring the budget there at 2.0.0 would red a loop the governing verdict calls
  closed. The obligations row asked the 2.0.0 record to weigh this, and a reviewed
  `rampExtensions` entry moves the budget from 1.2.0 to 2.1.0 at its old minVersion. Nothing an
  install sees changes but the date in its NOTE, and the row is re-targeted to 2.1.0 (#86).
- **The Supabase CLI config census moves to 2.1.0.** The `auth-posture-cli-census` deferral
  targeted 1.2.0, and `docs-sync` reds an arrived deferral on every install, fresh scaffolds
  included. Re-checked on 2026-09-30: supabase/cli#5894 is still open with no milestone, no
  linked pull request and no comments, and the CLI reference still documents `config push` as
  the only `config` subcommand. npm latest is 2.119.0, but the catalog pin stays 2.118.0, so the
  pin-bump clause did not fire. By the entry's standing rule the date moves one release, in the
  ledger, the obligations row and the three files the entry lists (#86).

- **Breaking: `prompt_id` leaves the reviewer ledger key, and every entry carries a format
  stamp.** Under the reviewer ledger v2 a PASS is current while its dispatch and stop digests
  match the tree, so the prompt only forced re-runs. The SubagentStop hook now stamps each
  entry with `v: "2.0.0"` (`LEDGER_FORMAT` in `tools/lib/reviewer-verdicts.mjs`), and v2
  reads the session's entries by session and format (`readSessionEntries`). An entry in
  another format never counts as a PASS, and never clears a BLOCK; a BLOCK in any format
  still stands until the same run passes in the current format; and a reviewer whose
  entries are all in another format reds with a finding that names the format and asks for
  one re-run, where it would otherwise read as "did not run". That is the breaking part:
  after `update`, no PASS a 1.1.x hook recorded counts, so each owed reviewer runs once
  more, and a kept fork of the hook or the lib writes unstamped entries until its parked
  copy is merged (the runbook's 2.0.0 section). The step requires `HARNESS_SESSION_ID`
  alone. The Stop hook still passes `HARNESS_PROMPT_ID` and the hook still records
  `prompt_id`: the 1.0.x judgement, which decides with no merge base and below `baseVersion`
  1.1.0 until 2.1.0, keeps the prompt in its key, because its `path_state` leaves deletions
  out and has no dispatch digest; a 1.1.x step still requires it; and it dates a mis-shaped
  line. Where the 1.0.x judgement decides with no prompt id, the step now reds and says why,
  where it used to skip loudly outside CI. `readLedger` and `readSessionLedger` keep their
  names, signatures and meaning, for that judgement and for a step forked at 1.1.x. The round
  budget counts entries of every format. Not ramped: this is the major's key, and the format
  finding is a v2 finding, under v2's ramp (#87).
- **`ROADMAP.md` and the field-report design record say where each item was built.**
  `design/FIELD-UPGRADES-2026-09.md` gains a dated status table and, under each section's
  heading, a status line naming the issue, pull request, stack position and release that
  built it. `ROADMAP.md` gains a work-plan section listing the stack's other positions, and
  each field-report bullet names its pull request. `tests/gates/work-plan-status.test.mjs`
  holds the three to each other, every position of the stack to one issue and pull request
  in release order, and the stated tag positions to each release's last one. Factory docs:
  nothing reaches an install (#37).
- **The open-source software steward question is decided, and the two re-dated calendar rows
  are accepted.** On 2026-10-02 the maintainer decided that Cogvera Labs is an open-source
  software steward of this harness under the EU Cyber Resilience Act, Art. 3(14), where
  `design/CONFORMANCE-FACTS.md` §4 had recorded the question as open. The steward's reporting
  duties under Art. 24(3) apply from 2027-12-11, and its cybersecurity policy and reporting
  route have to be in place by then; `conformance-cra-art14-application` falls due on
  2027-06-11 to prepare them. The maintainer also accepted the re-dating of that row and of
  `conformance-play-target-api-window` (2027-05-31), which 1.0.4 left pending the
  maintainer's approval. §2 and §4, both rows' reasons and `ROADMAP.md` record the decisions.
  Factory docs: nothing reaches an install (#54).

### Removed

- **Breaking: the worked example, from the default scaffold.** A fresh `init` writes no
  `packages/verticals/notes`, no notes or matrix screens, no notes route, Server Action or
  read seam, no notes router, none of the four notes migrations, and none of the example's
  register rows (its query shapes, mutation survivors, perf subject, rate-limit rows, PARITY
  rows and the rest `template/demo-index.json` lists). The rails the spine attached to
  `public.notes` (audit, quota, the AAL2 policy and the three-role grant) move out of the
  spine migrations into the demo's own `20260930000100_notes_rails.sql`, timestamped after
  every migration that defines one, so the spine is the same file in every install and the
  demo's history leaves as a unit. These are seeded files, so the change reaches fresh
  scaffolds only. An existing install keeps its example and its spine; `update` gives it the
  default owned files, which are green with the example present, and two owned files that
  moved into the demo (`maestro/flows/matrix.yaml`, `maestro/journeys/mutation.yaml`) stay
  in place, no longer updated. The runbook's 2.0.0 section says how to remove the example
  by hand from such an install, which `eject` refuses (#85).
- **Breaking: the event-catalog generator's compatibility entry for `@app/notes`.** 1.1.0
  kept it until the example left. An install whose `packages/verticals/notes/src/client.ts`
  does not export `EVENT_CATALOG` (one created before 1.1.0 that never adopted the line) now
  meets `contracts` red on the example's three rows until it adds the line the 1.1.0 runbook
  section shows (#85).

- **Breaking: the `i18n` gate's 1.0.x regular expressions, and the `{"site": "file:line"}`
  allowlist entry.** 1.1.0 ran them beside the syntax-tree walk for one release, behind two
  ramps due 1.2.0, and the obligations row `i18n-syntax-tree-ramp-expiry` said the release that
  meets that deadline deletes what the ramps carried. The walk is now the only scan, with no
  ramp, on every install. A `site` entry fails the step as malformed everywhere, and the message
  says the finding's FAIL line prints the `key` entry that replaces it. A string only the
  expressions reported (`title = "…"` as a plain assignment in a `.ts` module) no longer reds,
  so a `key` entry kept for one reds as stale. Without `typescript` the copy and `Intl`-boundary
  checks go unjudged, with a loud NOTE locally and a failure in CI, where 1.1.x fell back to the
  expressions. `tests/gates/i18n-tree.test.mjs`'s fixture parity, the row's precondition, stays
  as the walk's spec. The two sites leave the ramp fleet and `scripts/ci/stop-side-expiries.json`
  (#86).
- **Breaking: the dated `lint` exemption for `supabase/functions/delete-account/index.ts`.**
  1.1.0 kept that seeded file, which measures 16 on every 1.0.x install, out of the Edge
  Function complexity block for one release, paired with a `seededSourceFixes` entry that parks
  the handler split. The row `edge-functions-complexity-seeded-exemption` named the discharge:
  remove the line once the fix has had a release to land. An install that has not pulled the
  split meets `lint` red on that file, and the runbook's 2.0.0 section names the pull (#86).
- **Breaking: `.claude/rules/e2ee.md` from installs without the `e2ee` module.** The full
  encryption rule (the envelope and AAD construction, the wrapped-key erase lever, the export
  stance, the audit-capture refusal) is stored in `template/modules/e2ee/` now, with the same
  bytes and install path, so `enable e2ee` installs it and an install without the module does
  not carry it; the always-loaded stub `.claude/rules/encryption.md` stays everywhere and says
  so. The `"2.0.0"` record's `removed` entry deletes the base copy on `update` before the plan
  loop, sha- and provenance-guarded, and on an `e2ee` install the loop plants the module copy
  back recorded with `module: "e2ee"`, so `disable e2ee` now removes it. A fork stays with a
  note; the runbook's 2.0.0 section says what to do with it on each kind of install. Base files
  cite the stub, and a factory test fails any base, stack or preset file that names a rule
  only a module ships, outside four reviewed exemptions. Five conformance-map notes that named
  the full rule as if every install had it are reworded, `docs/harness/README.md` and the
  module README say where it lives, and `update --dry-run` now reports the re-planted file
  under `written` exactly as the real run does: `applyFileMigrations` returns the paths it
  removes, and the plan loop reads them as absent. `update()`'s cognitive complexity drops
  from 61 to 59 with it, and the ratchet records the drop (#86).

### What stays open, honestly

- **An install created before 2.0.0 cannot `eject`.** Its spine migrations name
  `public.notes`, so removing the example there takes a new migration and hand edits, which
  the runbook lists. `eject` refuses it rather than leave a schema that cannot replay (#85).
- **A later demo addition is not judged for the auto-plant hazard.** `check-seeded-migrations`
  skips `template/demo/` additions: no install recorded the demo before this release, so
  nothing could receive one. The first release that adds a demo file meets demo installs that
  do, and that release owes the judgement (#85).
- **`eject` leaves the database alone.** A database that applied the example's migrations
  keeps its tables; the runbook gives the migration that drops them (#85).

- **uuid 7 is re-dated, not discharged.** Nothing in this tree can move `xcode`'s major. The
  2.1.0 record owes either the arrival ramp's expiry or the next re-open (#86).
- **The CLI config census is re-dated, not built.** It waits on supabase/cli#5894 (#86).
- **The 2.1.0 record owes three `reviewer-verdicts` expiries at once**: the reviewer ledger v2,
  the security-reviewer model check and the round budget (#86).
- **Nothing in an install notices a base file that cites a module-only rule.** The provenance
  gate reads `SOURCE:` payloads only in `.ts`/`.tsx` and `.sql` files, so the closure is the
  factory's (`tests/installer/e2ee-rule-module.test.mjs`); a consumer who writes such a
  citation into their own files is not told (#86).
- **`upgrade-linux` installs core only**, so the `e2ee` half of the move is proven by the
  in-process installer tests, not by a lane leg (#86).
- **No lane runs `reviewer-verdicts` against a real ledger.** The Stop-chain runs in CI
  execute it on a clean scaffold, where nothing is owed, so the 2.0.0 ledger key is proven by
  the unit fixtures in `tests/gates/check-reviewer-verdicts.test.mjs` and
  `tests/hooks/subagent-verdict-pathstate.test.mjs` alone (#87).
- **The 1.0.x judgement still keys on the prompt** wherever it decides: with no merge base,
  for good, and below `baseVersion` 1.1.0 until 2.1.0. B03's relaxation needs v2's digest
  pair, which that judgement does not have (#87).
- **A mis-shaped ledger line still lasts its prompt.** Decision 3 kept the lifetime and
  corrected the remedy. Nothing lets the agent clear such a line inside its prompt, by design:
  the line cannot be attributed to a reviewer, and the ledger is write-guarded (#87).
- **The dispatch records carry no format stamp.** `.harness/reviewer-dispatch.jsonl` is keyed
  by session and `agent_id`, and its one field means what it meant at 1.1.0; a change to it
  would need a stamp of its own (#87).
- **The i18n catalog pair's accepted clone is keyed on its extent.** `duplication`
  normalizes every string, so the mobile and web catalogs match over the type preamble plus
  their opening rows, and the accepted fingerprint changes whenever either catalog's first rows
  change shape. A project that edits them meets the clone again under a new fingerprint and
  re-accepts it. The gate is unchanged here: a cut is no place to redesign a detector (#37).
- **The work plan's status record is dated.** It names pull requests that are open on
  2026-10-01 and says no release is tagged. Once the maintainer merges the stack and pushes
  the tags it describes the past, and it is re-dated or retired then. Its test holds the
  records to each other, not to GitHub (#37).
- **What was proven where.** With `package.json` at 2.0.0 and nothing discharged,
  `check-obligations` was red on the fourteen rows targeting 1.2.0, `check-ramp-ledger` on the
  missing `1.1.0` vintage and the missing `"2.0.0"` `rampExpiry`, `check-eol-target` on the
  arrived uuid target, and `check-release-lockstep` and `check-released-shas` on the version
  sites and the missing 2.0.0 table. The rewritten `i18n`, round-budget, lint-exemption and
  sweep tests were each red on the tree before their change. After the fixed cost each check
  is clean. The v1.1.0 tag is local until the maintainer pushes it, so the tag-reading checks
  on this pull request's CI compare against v1.0.3, and `check-ramp-ledger`'s vintage closure
  there reports `1.0.4` and `1.1.0` as not yet released; the local run with the tags present
  is the one that proves this commit (#86). For the encryption rule's move, the eight cases of
  `tests/installer/e2ee-rule-module.test.mjs` written first were red on the tree before it (the
  template half, the empty closure, and every upgrade case), and a ninth, a fork on an install
  whose version shipped other rule bytes, was added after the move to pin the parked copy the
  runbook describes. The dry-run case stayed red after the move until `applyFileMigrations`
  returned its removals, and the `e2ee` round-trip and npm-pack additions to
  `lifecycle.test.mjs` were red on the tree before the move. A zero-edit core
  scaffold carries no `.claude/rules/e2ee.md` and validates, a `--modules e2ee` scaffold
  records it with `module: "e2ee"`, and upgrade-lane legs A (v1.1.0), N (v1.0.4) and E (v0.3.0,
  swept) pass locally; leg A's plant-vs-withhold check needed a fix first, because a v1.1.0
  baseline seeds `tools/surfaces.json` at init and `update` never planted it (#86).
  For the example's move, the installer cases of `tests/installer/demo-eject.test.mjs`
  (default `init` plans no demo path, `--with-demo` plans every one, `eject` leaves a default
  `init`'s bytes outside `.harness/`, keeps a drifted file and a fork, trims only the rows a
  project left as shipped, and refuses an install without the demo) were red on the tree
  before it. So were sixteen of the seventeen cases in `tests/gates/check-demo-index.test.mjs`,
  and the new cases for `mfaRailUnused`, the `query-shapes` empty state, the `unmapped`
  bucket, the `@app/notes` wall, the `ejectedMigrations` record and the event-catalog
  generator. Zero-edit
  scaffolds validate with and without `--with-demo`. Replayed locally from `selftest.yml`, the
  `demo-eject` steps pass (Canaries 17 and 24 red for their own reasons on the live stack, and
  validate is green after `eject` with four `migrations` NOTEs), and so do every step of the
  `canary` and `day0-empty-states` jobs on their `--with-demo` scaffolds. On a default
  scaffold, Canaries 3, 4, 5, 14, 22 and 28 now red at their target check. A full Stryker run
  leaves 50 survivors on a default scaffold and 80 on a `--with-demo` one, each within its
  committed baseline. Upgrade-lane leg A (a v1.1.0 install with its example, updated to this
  tree) validates on 37 steps and graduates (#85).
  For the ledger key, fifteen cases written first were red on the tree before the change: the
  session-only headline and its stale canary, the earlier-prompt BLOCK, the older-format
  finding and the older-format PASS that must not clear a BLOCK, decision 3's remedy (a re-run
  in the same prompt stayed red while the remedy said it would clear it), the two identity
  cases, the reader and judge units, the parked-lib finding, the fail-closed canary's remedy,
  and the hook's stamp in both hook files. After the change the step's suite, the hook's,
  `hook-contract` and `run-stop-chain` are green (#87).
  For the work plan's record, the first five cases of `tests/gates/work-plan-status.test.mjs`
  ran on the records before the change: the dated table, a row for every section and a pull
  request in every field-report bullet were red, and the uniqueness and coverage cases passed
  on an empty table. The two stack-position cases came with the records, and each was red on a
  copy of the documents with a position's row dropped or a tag position moved. A local replay
  of the merge procedure, from `main` through positions 1 to 52 with merge commits, met no
  conflict, the final tree equalled this position's, and the local tags v1.0.4, v1.1.0 and
  v2.0.0 were all in its history (#37).
  At the cut, CI on the release commit found six reds that the Local development list
  cannot see, all from the default scaffold #85 introduced and the lanes around it. Each was
  reproduced here before its fix. `actionlint` reported two shellcheck findings in
  `selftest.yml` (Canary 14's target check and demo-eject's grep). They were reproduced with
  shellcheck 0.10 and rewritten without a directive. `demo-eject`'s byte comparison differed on
  every file that carries the project owner, because `init` reads the owner from the enclosing
  repository's origin and the comparison scaffold sat outside the checkout. It now sits
  inside, and a replay with the factory worktree as `GITHUB_WORKSPACE` ends on "the ejected
  tree equals a default init". Behind it, the lane's validate after `eject` reddened
  `gate-integrity` on every register `eject` had trimmed: the documented order was validate,
  then commit, and an uncommitted escape list is red. The builder's replay had
  `HARNESS_ALLOW_SELF_EDIT=1` in its environment, which skips that rule. `eject`'s next steps,
  the runbook and `docs/cli.md` now say commit, then validate. The lane commits and judges the
  deletions against the scaffold baseline, as a pull request would, and a replay without the
  flag ends on "migrations accepted 4 deletion(s)". `bootstrap-linux`'s Stop chain reddened on `duplication`: the
  default catalogs match over a new span. The shipped allow list gains its fingerprint, and a
  new case in `tests/gates/check-duplication.test.mjs` renders a default and a `--with-demo`
  init and runs the gate over each; it was red on the default before the entry.
  `integration`'s live proof read no `profiles` row, because nothing creates one at signup. It
  now writes the caller's own row first, and a replay of the lane on a default scaffold against
  a local stack went from one failing case to all three passing, with Canary C01 still red on
  "authentication required". Upgrade leg E (v0.3.0, swept) failed `types` because the sweep
  adopted only the demo's part of `apps/web/lib/i18n/`. It also failed on three things a
  pre-2.0.0 install carrying the example needs: the runbook's `EVENT_CATALOG` line, and the
  remedies for the two registers `update` plants as 2.0.0's default copies. The sweep now
  adopts a directory as the union of the template's roots and runs those three steps, each
  pinned in `tests/gates/upgrade-sweep.test.mjs`. Leg E replayed with the local tags ends on
  "graduate advancing baseVersion 0.3.0 -> 2.0.0", and leg N (v1.0.4) on its expected
  expiries (#37).
  For the `next` floor, `check-floor-advisories` against live OSV was red on
  GHSA-vcvr-r3jv-pc5j at the 16.3.3 floor before the change, and after it OSV names no
  advisory on any probe. The upstream feed refused the local request, so the first scheduled
  run after the merge is the first to read both feeds against the new floor. The two
  register-freshness cases were red on the moved review window before the test derived which
  register closes first, and they are red again when both windows end on the same day (#81).
