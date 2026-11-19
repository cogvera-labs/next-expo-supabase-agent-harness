# next-expo-supabase-agent-harness

[![npm version](https://img.shields.io/npm/v/next-expo-supabase-agent-harness)](https://www.npmjs.com/package/next-expo-supabase-agent-harness)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/cogvera-labs/next-expo-supabase-agent-harness/badge)](https://scorecard.dev/viewer/?uri=github.com/cogvera-labs/next-expo-supabase-agent-harness)
[![OpenSSF Baseline](https://www.bestpractices.dev/projects/14727/baseline)](https://www.bestpractices.dev/projects/14727)

**Quality is a deterministic gate, not a request.**

A Next.js + Expo (React Native) monorepo starter on Supabase with a Claude Code harness:
hooks that send the agent back to work while a quality gate fails. Guard hooks check
commands and file writes before they run, CI re-runs the gates, and `update` brings later
releases into an existing project.

[Documentation](https://cogvera-labs.github.io/next-expo-supabase-agent-harness/) ·
[Get started](docs/getting-started.md) · [How it works](docs/how-it-works.md) ·
[FAQ](docs/faq.md) · [Evidence](docs/evidence.md) · [Changelog](CHANGELOG.md)

```sh
npx --yes next-expo-supabase-agent-harness@latest init
```

![A terminal recording: init writes a project, the Bash guard denies a force-push, the secrets gate goes red on a service-role key in a tracked file and green once it is removed](docs/media/harness-demo.gif)

No model runs in the recording: the hooks and gates are programs, and what they print is
what the agent sees. It is rendered from
[docs/media/harness-demo.tape](docs/media/harness-demo.tape), whose commands a test
replays on every pull request.

**Status: stable (2.0.x).** CI proves the scaffold on Linux, and on macOS without
the database gates. The installer's unit tests run on Linux, Windows and macOS.
`pnpm validate` has never run in CI on Windows. See [Limitations](#limitations).

## What it stops

| Complaint about coding agents | What answers it here |
|---|---|
| The agent says the tests pass when they do not. | When it tries to stop, the Stop hook runs the gates and tests itself and sends it back while any is red, up to Claude Code's block cap. |
| It weakens, skips or deletes tests. | `test-quality` (no `.only`, unreviewed `.skip` or test without assertions), `diff-coverage` (each changed source file needs a test) and a CI mutation-testing job (a new surviving mutant fails). |
| It adds `eslint-disable` or `@ts-ignore`. | `suppressions`: `@ts-ignore`, `@ts-nocheck` and a rule-less `eslint-disable` fail; any other directive needs a reason and a reviewed allowlist entry. |
| It edits the check instead of the code. | Write protection on gate scripts and hooks, `gate-integrity` hashes, and a frozen CI gate list that a project cannot quietly shrink. |
| It runs `rm -rf`, `git reset --hard`, a force-push or `--no-verify`. | The bash guard denies these, `.env` reads and destructive SQL outside migrations before they run: a tripwire on command text, not a sandbox. |
| It puts the service-role key in client code or a commit. | The write guard refuses it in web and package code; the `secrets` gate scans every tracked file. |
| It ignores `CLAUDE.md`. | `CLAUDE.md` is context; hooks, gates and CI enforce the same rules either way. |
| It gets row-level security wrong. | `schema-rls` and `tenancy` (forced RLS, tenant-scoped policies, exact grants), then pgTAP and supabase-js isolation suites against the local Postgres before a turn ends. |
| The project is stuck on the template version it began with. | `update`: it replaces untouched harness files, leaves the new version of each edited one for you to merge, and `--rollback` undoes it. |

## Quick start

<a id="requirements"></a>You need Node 22 or newer, pnpm 11 (`corepack enable` picks up the
pinned version), Docker for the local Supabase stack, and Claude Code. If `corepack` is not on
your PATH (Node.js 25 and later no longer bundle it), run `npm install -g corepack` first. In
an empty folder:

```sh
npx --yes next-expo-supabase-agent-harness@latest init
```

`init` asks for the project's details, each with a default, and writes the scaffold into
the folder. Then:

```sh
git init          # first: the prepare script (lefthook install) needs a repository
pnpm install
git add -A && git commit -m "chore: scaffold"   # the first commit must include pnpm-lock.yaml
pnpm db:up        # with Docker running; the first run downloads the Supabase images
pnpm validate
claude            # Claude Code: ask for one small change
```

That turn's Stop hook sends the agent back while any gate, the RLS tests included, is red.
[First run](https://cogvera-labs.github.io/next-expo-supabase-agent-harness/runbooks/first-run/)
shows the turn with the local stack running and without it.

<details>
<summary>Install globally, pin a release, or answer the prompts up front</summary>

`npx` downloads the CLI and runs it in one step. To install it once instead:

```sh
npm i -g next-expo-supabase-agent-harness
next-expo-supabase-agent-harness init
```

Use `-g`: a local `npm i` writes a `package-lock.json` into the folder, and `init` stops
when it finds one. A global install stays at the version you installed, and `update`,
`enable`, `disable` and `eject` refuse to run from a CLI older than the project, so run
`npm i -g next-expo-supabase-agent-harness@latest` before `update`.

To pin a release, take a version from the
[Releases](https://github.com/cogvera-labs/next-expo-supabase-agent-harness/releases) page
(the tag without its `v`) and use it in place of `latest`.

`init` asks for the project name, package name, app identifier, Supabase project ref,
GitHub owner and a few more. `init --set NAME=value` answers one in advance, and
`init --yes` accepts every default. [docs/cli.md](docs/cli.md) lists them and every flag.

The `gitleaks` binary is optional: without it, the pre-commit secrets scan prints a skip
notice. On Windows, also install the Supabase CLI on `PATH`, at the version the catalog
pins: there the Stop hook's RLS step does not use the copy in `node_modules/.bin`.

</details>

<details>
<summary>Add the harness to an existing pnpm monorepo</summary>

`init` retrofits a pnpm workspace that has `apps/web` or `apps/mobile`. It keeps your
configs and parks its own beside them as `<name>.harness.<ext>` files, and `gate-integrity`
stays red until each one is merged or accepted after review. It keeps a workflow file you
already have, so your own `ci.yml` runs no harness gate until you add the chain to it, and
an existing `lefthook.yml` is one of the parked configs. The Claude Code hooks are merged
into your `.claude/settings.json`. A repository on npm, yarn or bun, or without
`pnpm-workspace.yaml`, is refused.

</details>

## How it works

Instructions (`AGENTS.md`, which `CLAUDE.md` imports, and `.claude/rules/`) describe the
rules; hooks, gate scripts and CI enforce them.

```text
 +--> agent: a command, a file edit or an MCP call
 |      |
 |      v
 +--- PreToolUse guards: deny, with the reason
 |      | allowed
 |      v
 |    the call runs; PostToolUse checks report on each edit
 |      |
 |      v
 |    agent tries to end the turn
 |      |
 |      v
 +--- Stop hook: runs the gates and test suites; red = exit 2, with the failures
        | green
        v
      turn ends --> commit hooks --> pull request --> CI runs the frozen gate list
```

- **Before a tool runs.** PreToolUse guards check every shell command, file write and MCP
  call against 151 guard-rule ids, and deny a match with the rule's message, which says why.
- **Before a turn ends.** The Stop hook runs the validate chain, the RLS isolation suites,
  the unit suites with coverage and its other steps itself, and exits 2 while one is red. A
  turn still red at Claude Code's block cap ends, and the next turn is told.
- **The gates.** `pnpm validate` runs 37 gates, cheapest first: formatting and secrets
  early, row-level security and migrations in the middle, both apps' builds near the end.
  Each gate has a can-fail proof, a recorded way to make it fail
  ([gates catalog](template/base/docs/harness/gates-catalog.md)), and this repository's CI
  refuses a gate or guard rule without one. 38 canaries, numbered CI steps, break a real
  scaffold to watch the matching check go red.
- **Before a merge.** CI runs the chain against `tools/validate.floor.json`, a frozen,
  hash-pinned copy of the gate list (the CI floor), so a project cannot quietly remove a
  gate. A gate missing its database or toolchain skips loudly on a laptop and fails in CI.

Nine hooks ship in all; the
[hook map](template/base/docs/harness/README.md#the-hook-map-deterministic-enforcement) says
when each runs and what it enforces.

The [harness doctrine](template/base/docs/harness/README.md) says why each mechanism exists
and where it stops.

## What you get

```text
apps/web               Next.js 16 App Router; serves the tRPC API to both apps
apps/mobile            Expo SDK 57 with Expo Router, React Native 0.86
packages/api           framework-neutral tRPC 11 router
packages/contracts     zod schemas shared by both apps
packages/platform/*    env, errors, events, observability, rate limiting, Supabase clients
packages/verticals/*   your features: none until you add one, or init --with-demo
packages/design-*      design tokens, a web design system and a native one
supabase/              SQL-first schema, migrations, RLS policies, pgTAP tests, an Edge Function
tools/ .claude/ .github/ docs/   the gates, hooks, workflows and docs described here
```

Postgres row-level security is the one authorization boundary for both apps, multi-tenant
from the start: every tenant table carries an `org_id`, and policies admit members of that
organization through helpers that read `auth.uid()`. The apps share the API, the
contracts and the design tokens, not their screens. Versions are declared in one pnpm
catalog (`pnpm-workspace.yaml`): exact pins for the frameworks, ranges for most tooling.
`init --with-demo` adds a worked feature end to end, and `eject` removes it.

Also included: read-only reviewer subagents whose verdicts the Stop hook checks, slash
commands and skills that build a feature from migration to screen, lefthook commit hooks,
and workflows pinned to commit SHAs and audited by zizmor. Opt-in modules add web deploy,
app-store release, EAS Update, device tests, crash reporting, push notifications,
end-to-end encryption and build provenance.

## Who this is for

Teams that ship a web app and a mobile app on one Supabase backend, let Claude Code write
much of the code, and want its rules enforced rather than requested: harness engineering,
applied to one stack.

- **Cursor, Codex, GitHub Copilot or another agent.** `AGENTS.md`, the commit hooks,
  `pnpm validate` and CI apply, but the `.claude/` hooks run only under Claude Code, so a
  violation surfaces at the commit or in the pull request.
- **A web-only app.** Not a fit today. Without `apps/mobile`, `expo-policy`, `native-deps`
  and `parity` fail in CI, and the frozen gate list keeps them.
- **An existing pnpm monorepo.** `init` can retrofit one; see the second note under
  [Quick start](#quick-start).

<a id="compared-with-other-starters"></a>

## Compared with alternatives

| Instead of | It is better at | This repository adds |
|---|---|---|
| A starter you copy once, such as [create-t3-turbo](https://github.com/t3-oss/create-t3-turbo), or a library that shares screens, such as [Solito](https://github.com/nandorojo/solito) | Fewer moving parts, a far larger community | Row-level security tested against Postgres, an agent held to the rules, and `update` |
| Agent instructions: `AGENTS.md`, rules, skill packs | Nothing to run, and they work with many agents | Hooks and gates that refuse what instructions can only ask |
| Generic guard hooks, such as [failproofai](https://github.com/FailproofAI/failproofai), [destructive_command_guard](https://github.com/Dicklesworthstone/destructive_command_guard) or [cc-safety-net](https://github.com/kenryu42/cc-safety-net) | Many coding agents, any stack | Gates that know the schema and both apps, a can-fail proof for each, a CI floor, and the starter |

[docs/comparison.md](docs/comparison.md) compares more projects, with dates and sources.

## How this repository is built

Coding agents (Claude Code) write most changes here, under this repository's own hooks:
the shipped bash guard, a write guard over its enforcement code, and a Stop hook running
its checks. Agent-written commits carry a `Co-Authored-By: Claude` trailer; to count them
against the total:

```sh
git log --format='%(trailers:key=Co-Authored-By,valueonly,separator=%x2C)' | grep -c Claude
git rev-list --count HEAD
```

The maintainer sets the scope, reviews and merges the pull requests, cuts the releases, and
answers for what ships. Since 1.0.0 every change to `main` has come through a pull request,
and on each one CI recomputes this README's counts and refuses a timing that no committed CI
measurement backs (`scripts/check-claims.mjs`).
Releases are built by CI from a tag, attested, and published to npm through trusted
publishing. [Building with agents](docs/building-with-agents.md) describes the process, and
[Evidence](docs/evidence.md) gives a command for each claim.

## Limitations

- **The guards are tamper-evident, not tamper-proof.** Shell access can get around the
  local layers, and obfuscation can evade the bash guard; CI and code-owner review are the
  backstop ([SECURITY.md](SECURITY.md)).
- **The database gates are proven on Linux only.** Every CI job with a Supabase stack runs
  on Linux; `macos-scaffold` runs `pnpm validate` without Docker and fails if any gate but
  `types-drift` skips. No CI job runs a scaffold on Windows.
- **A fresh install takes the newest allowed versions.** No lockfile ships and most catalog
  entries are ranges, so an upstream release can break a new scaffold until the catalog
  moves; a [nightly CI run](https://github.com/cogvera-labs/next-expo-supabase-agent-harness/actions/workflows/selftest.yml?query=event%3Aschedule)
  builds one to catch it.
- **Rate limiting covers the application layer only:** the tRPC router and Server Actions,
  not direct PostgREST calls with a user's JWT or Supabase Auth's sign-in and sign-up. It
  fails open if its backend and its in-process fallback both fail.
- **The `e2ee` module ships building blocks, not an encrypted app.** No shipped feature is
  encrypted, and the worked example stores plaintext.
- **Device tests are not on every pull request.** In a project, the Android emulator lane
  runs when a pull request touches the mobile app (unless the project has deferred its mobile
  surface), nightly and on manual dispatch; this repository's own device job runs only
  nightly and on dispatch.
- **Outcomes are not measured yet.** Nothing yet shows how much the harness changes what an
  agent ships;
  [#170](https://github.com/cogvera-labs/next-expo-supabase-agent-harness/issues/170)
  tracks a with-and-without evaluation.
- **No independent review.** One maintainer reviews changes, and the maintainer or the
  collaborator merges them; the branch rules require passing CI rather than a second
  reviewer, and the [security assurance case](docs/security/assurance-case.md) has had no
  outside review.

## Commands

| Command | What it does |
|---|---|
| `init` | Scaffold a project: `--tier`, `--modules`, `--set VAR=value`, `--with-demo`, `--yes`, `--dry-run`. |
| `update` | Apply a newer release to an install; `--dry-run` reports first, `--rollback` undoes it. |
| `doctor` | Report whether an install is healthy. |
| `enable <module>` / `disable <module>` | Add or remove an opt-in module. |
| `graduate` | Raise the install's base version once no newer gate is still printing grace-period notes. |
| `eject` | Remove the worked example `init --with-demo` added, keeping and listing files you changed. |
| `apply-proposal [<id>]` | Apply, as a human in a terminal, a register edit an agent staged in `harness-proposals/`, after showing its reason and diff. No id lists them. |

Every flag, tier, placeholder and exit code: [docs/cli.md](docs/cli.md), or `--help`.

## Claude Code plugin

The agents, slash commands and skills also come as a Claude Code plugin, for sessions
outside a harness-installed project. It carries no hooks, gates or permissions; those come
with `init`. See [plugin/README.md](plugin/README.md).

```sh
claude plugin marketplace add cogvera-labs/next-expo-supabase-agent-harness
claude plugin install next-expo-supabase-agent-harness@next-expo-supabase-agent-harness
```

## Compliance mappings

Two shipped registers map published requirements to the gate, hook or test that addresses
each, including those the scaffold does not meet. They are mappings, not certifications,
and the project claims no conformance level. The gates print:

```
149 ML3 requirements: 8 effective, 13 alternate-control, 11 not-implemented, 61 not-applicable, 56 organisation-boundary; 8 shared clauses
392 mapped requirements: 11 covered, 149 partial, 105 not-covered, 127 not-applicable — ASVS 5.0.0 (345), MASVS 2.1 (24), CRA Annex I (23)
```

The first line counts ASD's Essential Eight requirements at Maturity Level Three (ML3)
([register](template/base/docs/compliance/essential-eight.md)); the second, those of OWASP
ASVS 5.0.0, OWASP MASVS 2.1 and Annex I of the EU Cyber Resilience Act
([crosswalk](template/base/docs/compliance/controls-crosswalk.md)).

## Measured cost

Recorded by CI on a GitHub-hosted Linux x64 runner on 2026-10-02 and committed in
`scripts/chain-budget.json`: `pnpm validate` took warm ≈ 27 s (26881 ms) on a repeat run
and cold ≈ 145 s (145363 ms) on a fresh clone, and the Stop hook's full turn end took
54.8 s (54815 ms). They are that runner's numbers, not a promise about your machine.

## Repository layout

The npm package is `installer/` and `template/`; the rest builds, tests and documents
them.

| Path | What it holds |
|---|---|
| [`installer/`](installer/) | The CLI, with no runtime dependencies; [`cli.mjs`](installer/cli.mjs) is the entry point |
| [`template/`](template/) | What `init` writes: `base/`, `stack/`, `demo/`, `modules/` and `presets/`, explained in [template/README.md](template/README.md) |
| [`scripts/`](scripts/), [`tests/`](tests/) | This repository's own checks and tests |
| [`.claude/`](.claude/), [`.github/`](.github/) | This repository's own hooks and CI, not the shipped ones, which are under `template/base/` |
| [`plugin/`](plugin/) | The Claude Code plugin, generated from `template/base/.claude/` |
| [`docs/`](docs/), [`docs-site/`](docs-site/), [`design/`](design/) | Pages about this repository, the documentation site's source, design records |

A path in the shipped docs, such as `tools/check-secrets.mjs`, is under `template/base/`
here. [docs/architecture.md](docs/architecture.md) has the full map, and
[AGENTS.md](AGENTS.md) is the briefing for agents working on this repository.

## Documentation

The [documentation site](https://cogvera-labs.github.io/next-expo-supabase-agent-harness/)
renders the doctrine, gates catalog, runbooks and module guides every scaffold receives.
[docs/README.md](docs/README.md) indexes this repository's own docs; see also the
[glossary](docs/glossary.md), [governance](GOVERNANCE.md) and the [roadmap](ROADMAP.md).

## Contributing and feedback

- Bugs and gate proposals: [open an issue](https://github.com/cogvera-labs/next-expo-supabase-agent-harness/issues/new/choose)
- Questions: [Discussions](https://github.com/cogvera-labs/next-expo-supabase-agent-harness/discussions); [SUPPORT.md](SUPPORT.md) says where to ask what
- Pull requests: read [CONTRIBUTING.md](CONTRIBUTING.md), which lists every check CI blocks on and how AI-assisted changes are handled
- Vulnerabilities: report privately, as described in [SECURITY.md](SECURITY.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)

To fork the harness into a sibling for another stack, follow
[docs/forking.md](docs/forking.md). This repository is descended from the retired
`expo-postgres-agent-harness` and `tauri-postgres-agent-harness`.

## License

Apache-2.0 for the repository. Everything under `template/**` is
"Apache-2.0 OR 0BSD": recipients choose either, so scaffolded code carries no
attribution requirement.
