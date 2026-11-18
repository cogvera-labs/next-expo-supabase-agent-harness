# Glossary

The terms this project uses, each with a short definition, where it is defined or
implemented, and the other names the code and docs use for it.

Paths are the ones in a scaffolded project; the links open the template copy in this
repository. Three words carry several meanings here, [floor](#floor), [register](#register)
and [tier](#tier), and their entries list each one.

## A

### AGENTS.md and CLAUDE.md

The project's instructions for coding agents: the stack, the commands, the validate contract
and the security invariants. In a scaffold, `CLAUDE.md` is the single line `@AGENTS.md`, so
Claude Code reads the same advisory text other agents read, and the `wiring` gate fails if
that changes.

- **Where:** [`AGENTS.md`](../template/base/AGENTS.md); the `wiring` section of the
  [gates catalog](../template/base/docs/harness/gates-catalog.md#3-wiring--node-toolscheck-wiringmjs).
- **Also called:** project memory, instructions.

### Append-only migrations

A committed file under `supabase/migrations/` is never edited or deleted: a schema change is
a new timestamped migration, and destructive DDL must name a decision record in an `-- adr:`
marker. The write guard refuses an edit to a committed migration, and the `migrations` gate
judges the committed history.

- **Where:** [security invariants](../template/base/.claude/rules/security-invariants.md);
  the doctrine's [write guard](../template/base/docs/harness/README.md#pretool-write-guard)
  section.

## B

### Block cap

The number of consecutive Stop-hook blocks after which Claude Code ends a turn anyway, set by
`CLAUDE_CODE_STOP_HOOK_BLOCK_CAP` in `.claude/settings.json` (eight in the shipped settings).
The harness marks the last allowed block `LAST CHANCE`, records the outcome in
`.harness/turn-outcomes.jsonl`, and tells the next turn.

- **Where:** the doctrine's
  [stop-validate-gate](../template/base/docs/harness/README.md#stop-validate-gate) section;
  the [first-run runbook](../template/base/docs/runbooks/first-run.md).
- **Also called:** the cap; a turn that "ended red at the cap".

### Bootstrap and retrofit

The two ways `init` installs: bootstrap writes a new scaffold into an empty folder, and
retrofit installs into an existing pnpm workspace that has `apps/web` or `apps/mobile`. A
retrofit keeps your configs and parks the harness's copies beside them as
`<name>.harness.<ext>` files for you to merge.

- **Where:** [`installer/lib/detect.mjs`](../installer/lib/detect.mjs); the
  [README](../README.md), "Who this is for".
- **Also called:** mode (the session-start brief prints `bootstrap` or `retrofit`).

## C

### Can-fail proof

A recorded way to make a check fail on purpose (inject the violation, watch the check turn
red), which shows that the check is not decoration. Every gate, guard rule and CI job has one,
and this repository's CI runs them.

- **Where:** the "Anti-vacuity" line of each section of the
  [gates catalog](../template/base/docs/harness/gates-catalog.md); the registry
  [`tests/canary/injections.json`](../tests/canary/injections.json), held complete by
  [`scripts/check-canary-coverage.mjs`](../scripts/check-canary-coverage.mjs).
- **Also called:** anti-vacuity proof (the gates catalog), red-proof, canary (the registry's
  name for each entry, and for the CI job that injects them into a real scaffold).

### Chain

The ordered list of gates that `pnpm validate` runs, cheapest first, defined as
`VALIDATE_STEPS` in `tools/harness.config.mjs`. The Stop hook and CI run it too; the
[README](../README.md) and the gates catalog give its current length.

- **Where:** [`tools/harness.config.mjs`](../template/base/tools/harness.config.mjs); the
  [gates catalog](../template/base/docs/harness/gates-catalog.md).
- **Also called:** the validate chain, `pnpm validate`, `VALIDATE_STEPS`. It is not the
  [Stop chain](#stop-hook-and-stop-chain).

### CI floor

The frozen copy of the chain's step list, `tools/validate.floor.json`, which CI runs with
`node tools/validate.mjs --min-floor` and trusts over the local config, so a project can add
gates but cannot remove one. `tools/stop.floor.json` does the same for the Stop chain: the
Stop hook runs the local list joined with it.

- **Where:** the doctrine's
  [one gate config, three enforcement layers](../template/base/docs/harness/README.md#one-gate-config-three-enforcement-layers).
- **Also called:** step floor, frozen floor, `--min-floor`. See also [floor](#floor).

### Closure

A check that two lists agree in both directions, so that nothing is missing from either side.
For example, `mobile-perf --closure` requires a Maestro flow and a startup-budget row for every
registered screen, and no flow or row for a screen that is gone.

- **Where:** the
  [mobile-perf](../template/base/docs/harness/gates-catalog.md#mobile-perf--node-toolscheck-mobile-perfmjs---closure)
  section of the gates catalog.
- **Also called:** a check that "closes both ways".

### Consumer and factory

A consumer is a project the harness was installed into. The factory is this repository, whose
installer, template, scripts, tests and CI hold both to the standard the template sets, and
which runs the shipped bash guard and equivalent write and Stop guards on its own agent
sessions.

- **Where:** [architecture](architecture.md).
- **Also called:** install, scaffold or project (a consumer); dogfooding (the factory running
  its own guards).

## D

### Doctrine

The harness's design document: why each enforcement mechanism exists, which script implements
it, and where its limits are. It ships into every scaffold as `docs/harness/README.md`, and
every `// SOURCE: docs/harness/README.md` comment in the code points to it.

- **Where:** [`docs/harness/README.md`](../template/base/docs/harness/README.md).
- **Also called:** the harness doctrine.

## E

### Enforcement surface

The paths the harness's enforcement depends on, listed as data: the gate scripts and registers
under `tools/`, the agent configuration under `.claude/`, the workflows, the install record
under `.harness/`, `supabase/`, the RLS tests and a few root configs such as `lefthook.yml`.
The `wiring` gate requires a CODEOWNERS rule with a real owner over all of it, and the guards
protect its enforcing files from an agent's writes.

- **Where:**
  [`tools/lib/enforcement-surface.mjs`](../template/base/tools/lib/enforcement-surface.mjs);
  the doctrine's
  [tamper evidence](../template/base/docs/harness/README.md#tamper-evidence-honest-limits)
  section.
- **Also called:** protected paths; harness-owned files (its owned part).

### Escape list

A reviewed data file that exempts specific code from a gate or raises a budget, such as
`tools/rls-exempt.json` or `tools/suppressions-allow.json`. A change to one must be committed
for review (`gate-integrity` fails on one that is modified but not committed), and an agent
cannot edit one: for most it can stage a [proposal](#proposal) for a human to apply.

- **Where:** `ESCAPE_LISTS` in
  [`tools/lib/enforcement-surface.mjs`](../template/base/tools/lib/enforcement-surface.mjs);
  the
  [gate-integrity](../template/base/docs/harness/gates-catalog.md#2-gate-integrity--node-toolscheck-gate-integritymjs)
  section of the gates catalog.
- **Also called:** allowlist; [register](#register) (one sense of it).

## F

### Fail closed and skip loudly

A gate that cannot run its real check because a prerequisite is missing prints
`SKIPPED — <reason> (this gate FAILS CLOSED in CI)` on your machine and fails in CI, where
`CI=true` or `HARNESS_REQUIRE_TOOLCHAINS=1` is set. A skip is never a pass, and
`node tools/validate.mjs --ci-parity` shows CI's verdict on your machine.

- **Where:** the doctrine's
  [skip-local / fail-closed-CI asymmetry](../template/base/docs/harness/README.md#skip-local--fail-closed-ci-asymmetry).
- **Also called:** toolchain asymmetry; CI parity.

### FIX, NOTE, SKIPPED and STAMPED lines

Markers in gate output: a failing harness gate ends with `FIX[<gate>]:` and the command that
reproduces it, `NOTE` reports a finding that does not fail (such as a ramped check), and
`SKIPPED` means the gate could not run here and fails closed in CI. `STAMPED` means the gate's
inputs are unchanged since its last green run on this machine, so it did not run again; CI
never honours a stamp.

- **Where:** the introduction of the
  [gates catalog](../template/base/docs/harness/gates-catalog.md); the doctrine's
  [stamped gates](../template/base/docs/harness/README.md#stamped-gates) section.
- **Also called:** stamp; field note (`FIELD-NOTE[<gate>]:`, a project's own line under a FIX
  line, from `tools/field-notes.json`).

### Floor

An overloaded word in this project, so always qualify it. Its senses:

- **Step floor:** the frozen step lists `tools/validate.floor.json` and
  `tools/stop.floor.json`; see [CI floor](#ci-floor).
- **Security floor:** the lowest reviewed patch version of a framework
  (`tools/framework-floor.json`), and the floors a release records for catalog pins, which
  `update` reports as `CATALOG PIN FLOOR` and `doctor` warns about. A raised security floor
  reaches every install at once; it is never ramped.
- **Claude Code floor:** the minimum Claude Code version, derived from the published advisories
  that `tools/cc-floor.json` records.
- **Coverage floor:** the per-file coverage minimum that `diff-coverage` holds each changed
  source file to.
- **Others:** the store-policy floor (`tools/store-policy.json`), the row floor below which the
  database-performance lane will not judge a query plan, the rank floor in write policies
  (`private.member_ranks()`), the mutation-scope floor, and the accessibility floor (lint plus
  component tests).

**Where:** the [doctrine](../template/base/docs/harness/README.md); [`update`](cli.md#update)
and `doctor` in the CLI reference; [`AGENTS.md`](../template/base/AGENTS.md).

## G

### Gate

A deterministic check program that exits non-zero when it finds a violation; what it prints is
what the agent is shown. The chain runs the gates in order, the Stop hook and CI run them
again, and the gates catalog documents each one with its can-fail proof.

- **Where:** the [gates catalog](../template/base/docs/harness/gates-catalog.md); the gate
  scripts under [`tools/`](../template/base/tools/).
- **Also called:** quality gate, check, step. A check "goes red" when it fails and "green"
  when it passes, and the CHANGELOG also uses "reds" as a verb.

### gate-integrity

The chain's second step, which re-hashes every harness-owned enforcement file against its
record in `.harness/manifest.json` and fails on any mismatch, so an edit that went around the
guards fails the next validate. It also checks the hook commands, the Stop floor, that
`baseVersion` never went backwards, and that escape lists are committed.

- **Where:** the
  [gate-integrity](../template/base/docs/harness/gates-catalog.md#2-gate-integrity--node-toolscheck-gate-integritymjs)
  section of the gates catalog.

### Guard

A Claude Code `PreToolUse` hook that checks a tool call before it runs and denies it, with a
reason, when it matches a rule: the bash guard (Bash, Monitor and PowerShell commands), the
write guard (file edits) and the MCP guard (MCP calls). The rules are data, each with an id,
and the doctrine is plain about their reach: "Guards are tripwires, not sandboxes."

- **Where:** the doctrine's
  [hook map](../template/base/docs/harness/README.md#the-hook-map-deterministic-enforcement);
  [`.claude/hooks/lib/guard-rules.mjs`](../template/base/.claude/hooks/lib/guard-rules.mjs);
  the [threat model](../template/base/docs/security/threat-model.md#agent-time-refusals),
  which lists every rule.
- **Also called:** guard hook, PreToolUse guard; a guard rule is one entry in the tables. The
  doctrine also says "guard hooks" for every hook started through the fail-closed launcher.

## H

### Harness

Here, everything `init` installs around the app to hold a coding agent to the project's
checks: the hooks, gates, CI workflows, rules and docs. "Claude Code harness" is the precise
name, because "agent harness" alone usually means an agent's runtime, and harness engineering
is the practice of building such a harness rather than relying on instructions alone.

- **Where:** the [README](../README.md); the
  [doctrine](../template/base/docs/harness/README.md). On the term, see Birgitta Böckeler's
  [Harness engineering for coding agent users](https://www.martinfowler.com/articles/harness-engineering.html).
- **Also called:** Claude Code harness; the template (the files it installs).

### HARNESS_ALLOW_SELF_EDIT=1

A human-only escape hatch: set in the environment a session starts from, it relaxes a listed
set of write-guard, bash-guard and `gate-integrity` checks so that a person can change the
harness's own files. It does not lift the permission denies, nothing records that it was set,
and the committed diff, reviewed under CODEOWNERS, is the record.

- **Where:** the doctrine's
  [What HARNESS_ALLOW_SELF_EDIT=1 relaxes](../template/base/docs/harness/README.md#what-harness_allow_self_edit1-relaxes).

### Hermetic

A gate is hermetic when its verdict depends only on the repository, never on a live
third-party endpoint, so an untouched commit cannot turn red overnight. Checks whose verdict
depends on the date or the network ("clockful" checks) run on a schedule instead, where they
cannot fail an unrelated pull request.

- **Where:** [CONTRIBUTING.md](../CONTRIBUTING.md) (gate proposals);
  [architecture](architecture.md).
- **Related:** clockless, for a check whose verdict never depends on the date or the network,
  and clockful, for one whose verdict does.

### Hook

A program Claude Code runs on an event and whose exit code it obeys: 0 lets the action
proceed, 2 blocks it and feeds the hook's message to the model (on Stop, the turn continues),
and any other code is a non-blocking error. So the harness's hooks block on their own
failures, and every one except the session-start brief starts through `launch.mjs`, which
blocks if the hook cannot load.

- **Where:** the doctrine's
  [hook map](../template/base/docs/harness/README.md#the-hook-map-deterministic-enforcement);
  [`.claude/settings.json`](../template/base/.claude/settings.json); Claude Code's
  [hooks reference](https://code.claude.com/docs/en/hooks).
- **Also called:** Claude Code hook; the launcher (`launch.mjs`). Not the git hooks that
  lefthook installs, which these docs call commit hooks.

## L

### Lane

A CI job, or a group of jobs, with one purpose, such as the `static` job that runs the chain,
`runtime-rls`, or the Android emulator lane. A path-filtered lane runs only when a pull request
touches its paths.

- **Where:** [`quality-gate.yml`](../template/base/github/workflows/quality-gate.yml);
  [enforcement tiers](../template/base/docs/harness/enforcement-tiers.md).
- **Also called:** CI job. The scaffold's `AGENTS.md` also says "unit lanes" for the two
  unit-test suites.

### Lethal trifecta

An agent with access to private data, exposure to untrusted content and a way to communicate
externally can be tricked into leaking the data. The doctrine requires breaking at least one
leg for any agent that touches real data: the harness denies network commands, keeps the
service-role key out of the apps, and gives reviewer subagents read-only tools.

- **Where:** the doctrine's
  [lethal-trifecta posture](../template/base/docs/harness/README.md#the-lethal-trifecta-posture);
  [sandbox and supply chain](../template/base/docs/security/sandbox-and-supply-chain.md). The
  term is Simon Willison's.

## M

### Managed settings

Claude Code settings that an administrator deploys to a system location or through device
management. Hooks set there are the only hooks that a `disableAllHooks` setting in user,
project or local settings cannot switch off.

- **Where:** [managed settings](../template/base/docs/security/managed-settings.md).

### Manifest

`.harness/manifest.json` in a scaffold: the release that last wrote the install
(`harnessVersion`), the release whose rules it has fully adopted (`baseVersion`), the tier,
the modules and the placeholder answers, and a mode and sha256 for every installed file. It is
what makes `update`, `doctor` and `gate-integrity` possible.

- **Where:** [architecture](architecture.md).
- **Also called:** install record.

### Module

An opt-in partial tree that `init` overlays on an install, such as `ci-provenance`,
`device-e2e` or `e2ee`. The install tier picks a set, and `enable <module>` and
`disable <module>` change it later.

- **Where:** [Modules](cli.md#modules) in the CLI reference.

## O

### Owned, seeded and config files

The mode the manifest records for each installed file, which decides what `update` may do:
owned files are harness machinery that `update` replaces while they still match their record,
and seeded files are yours (app code, the pnpm catalog, reviewed allowlists), never touched
again unless you ask with `--refresh-seeded`. The one config file,
`tools/harness.config.mjs`, changes only through recorded steps, so a new gate can be added
without overwriting your additions.

- **Where:** [architecture](architecture.md).
- **Also called:** file mode; harness-owned (an owned file).

## P

### pgTAP

A unit-testing framework for Postgres. The scaffold's pgTAP suites under `supabase/tests/`
assert row-level security, grants and table structure; `pnpm db:test` runs them, and the Stop
hook's `rls-isolation` step runs them with a supabase-js suite against the local stack.

- **Where:** the doctrine's
  [RLS testing doctrine](../template/base/docs/harness/README.md#rls-testing-doctrine).

### Proposal

A register edit that an agent stages instead of making: the whole proposed file, with its
reason, as one JSON document in `harness-proposals/<id>.json`, which no gate reads. A human
applies it with `apply-proposal <id>`, which shows the reason and the diff and writes the file
only after the human types its path.

- **Where:** [`apply-proposal`](cli.md#apply-proposal-id) in the CLI reference; the doctrine's
  [tamper evidence](../template/base/docs/harness/README.md#tamper-evidence-honest-limits)
  section.
- **Also called:** register proposal; `apply-proposal`.

### Provenance

The rule that a non-trivial decision in code (a row-level security policy, token verification,
a timeout, a mobile security setting) carries a `// SOURCE:` comment naming its authority, with
`[corpus: <id>]` when that authority is pinned in the project's citation corpus. A PostToolUse
hook checks each edit, the `provenance` gate checks the tree, and the `citation-verifier`
subagent checks that each citation exists and supports the decision.

- **Where:** the doctrine's
  [provenance pipeline](../template/base/docs/harness/README.md#the-provenance-pipeline);
  [`.claude/rules/provenance.md`](../template/base/.claude/rules/provenance.md).
- **Also called:** SOURCE comment, citation, corpus. Not the signed build provenance on each
  release of the CLI, which [SECURITY.md](../SECURITY.md) describes.

## R

### Ramp

A grace period for a new gate on an existing install: while the install's `baseVersion`
predates the gate, its findings print as NOTE lines until a named release, and they fail after
it. `graduate` moves `baseVersion` up once no ramp note remains, and a raised security floor
is never ramped.

- **Where:** [architecture](architecture.md); the
  [upgrade runbook](../template/base/docs/runbooks/harness-upgrade.md).
- **Also called:** ramp note, `rampNote`; graduation.

### Register

An overloaded word in this project, so always qualify it. Its senses:

- **A reviewed data file** under `tools/` that a gate reads: an allowlist, a budget or an
  inventory, such as `tools/i18n-allow.json` or `tools/approved-tools.json`. An agent cannot
  edit one; for most it can [propose](#proposal) a change for a human to apply.
- **A compliance register** that maps a standard's requirements to checks: the
  [Essential Eight register](../template/base/docs/compliance/essential-eight.md) and the
  conformance map behind the
  [controls crosswalk](../template/base/docs/compliance/controls-crosswalk.md).
- **The obligations register**, [`scripts/obligations.json`](../scripts/obligations.json):
  this repository's dated commitments, which block a release or turn the nightly run red when
  they fall due.
- **Unrelated:** the design guidance's "three registers" of an error message: what failed, why,
  then the raw text and the request id
  ([state choreography](../template/base/.claude/skills/designing-mobile-ui/references/state-choreography.md)).

**Where:** [`apply-proposal`](cli.md#apply-proposal-id) in the CLI reference; the
[README](../README.md), "Compliance mappings".

### Reviewer verdict

Reviewer subagents are read-only and end their reply with `VERDICT: PASS` or
`VERDICT: BLOCK`, which the SubagentStop hook records in the reviewer ledger. The Stop chain's
last step, `reviewer-verdicts`, requires a PASS from each reviewer whose trigger paths the
diff touches, and some reviewers are owed on every non-empty diff.

- **Where:** the
  [reviewer-verdicts](../template/base/docs/harness/gates-catalog.md#reviewer-verdicts--node-toolscheck-reviewer-verdictsmjs)
  section of the gates catalog; the doctrine's
  [adversarial review](../template/base/docs/harness/README.md#adversarial-review-the-agent-roster)
  section; [`tools/reviewer-triggers.json`](../template/base/tools/reviewer-triggers.json).
- **Also called:** reviewer ledger (`.harness/reviewer-ledger.jsonl`); reviewers owed.

### Row-level security (RLS)

Postgres policies that decide, row by row, what a database role may read or write. In the
scaffold, RLS scoped by `org_id`, through membership helpers that read `auth.uid()`, is the one
authorization boundary for both apps, and every table turns it on and forces it, with
per-operation policies and exact grants, in the migration that creates it.

- **Where:** [security invariants](../template/base/.claude/rules/security-invariants.md); the
  doctrine's
  [RLS testing doctrine](../template/base/docs/harness/README.md#rls-testing-doctrine).
- **Also called:** RLS; tenancy (the `tenancy` gate); `rls-isolation` (the Stop step that
  proves isolation).

## S

### Service role and warrant

The Supabase `service_role` key bypasses row-level security, so in the scaffold it may live
only in an Edge Function governed by a decision record (ADR). The client that uses it is built
through `createServiceRoleClient_BYPASSES_RLS(warrant)`, where the warrant names the ADR and
the reason.

- **Where:** [security invariants](../template/base/.claude/rules/security-invariants.md);
  [`service-role.ts`](../template/stack/packages/platform/supabase/src/service-role.ts).
- **Also called:** `SUPABASE_SERVICE_ROLE_KEY`; an `sb_secret_` key, the shape the `secrets`
  gate scans for.

### Session-start brief

What the SessionStart hook prints into the agent's context when a session starts, resumes,
clears, compacts or forks: the harness version and base, the tier and mode, parked upgrades,
how the last turn in the folder ended, the reviewers the diff owes, and a hint when the local
database is not answering. It cannot block, and `node tools/harness-status.mjs` prints the
same text.

- **Where:** the doctrine's
  [session-start brief](../template/base/docs/harness/README.md#the-session-start-brief)
  section.

### Stop hook and Stop chain

The Stop hook (`.claude/hooks/stop-validate-gate.mjs`) runs when the agent tries to end its
turn, and while any step of the Stop chain fails it exits 2, which sends the agent back to
work. The Stop chain is `STOP_HOOK_STEPS` in `tools/harness.config.mjs` joined with the frozen
`tools/stop.floor.json`: the validate chain, then the RLS isolation suites, both unit suites
with coverage and further checks, ending with `reviewer-verdicts`.

- **Where:** the doctrine's
  [stop-validate-gate](../template/base/docs/harness/README.md#stop-validate-gate) section;
  the gates catalog's
  [Stop-hook runtime suites](../template/base/docs/harness/gates-catalog.md#stop-hook-runtime-suites-stop_hook_steps).
- **Also called:** the Stop gate; `STOP_HOOK_STEPS`.

## T

### Tamper-evident, not tamper-proof

The claim the harness makes about its own protections: anyone with shell access can change
the working tree, but doing so takes a deliberate override, leaves a diff a human reviews, and
is caught by CI. CI and code-owner review are the boundary; the local guards make tampering
visible.

- **Where:** the doctrine's
  [tamper evidence](../template/base/docs/harness/README.md#tamper-evidence-honest-limits)
  section; [SECURITY.md](../SECURITY.md).

### Tier

Two different things, so always qualify the word. An install tier (`core`, `standard`, which
is the default, or `strict`) chooses which opt-in modules `init` installs; an enforcement tier
is a declared place where an enforcement layer covers one of the two apps and not the other,
with the reason and the control that stands in for it.

- **Where:** [Tiers](cli.md#tiers) in the CLI reference;
  [enforcement tiers](../template/base/docs/harness/enforcement-tiers.md).
- **Also called:** install tier; enforcement tier.

### Turn

One Claude Code agent turn, from a message to the agent's final answer. The Stop hook decides
whether a turn may end, and a turn that ends at the block cap with a step failing is a red
turn.

- **Where:** the [doctrine](../template/base/docs/harness/README.md);
  [How it works](how-it-works.md#the-stop-hook).

## U

### update and rollback

`update` applies a newer harness release to an existing project: owned files that still match
their record are replaced, and a file you changed is kept while the incoming version is parked
under `.harness/pending/` for you to merge. `--dry-run` reports without writing, and
`update --rollback` restores the tree recorded before the last update.

- **Where:** [`update`](cli.md#update) in the CLI reference; the
  [upgrade runbook](../template/base/docs/runbooks/harness-upgrade.md).
- **Also called:** upgrade; a parked file (the incoming version that `update` did not apply).

## V

### Vertical slice

One feature built end to end in one turn, in a fixed order: the migration and its row-level
security, the RLS tests, the data function, the tRPC procedure, the web screen, the mobile
screen, tests, provenance and a green gate. A vertical is the feature's package under
`packages/verticals/`, with a server barrel and a Metro-safe `./client` barrel, and verticals
never import each other.

- **Where:** the
  [vertical-slice skill](../template/base/.claude/skills/authoring-vertical-slice/SKILL.md);
  [`AGENTS.md`](../template/base/AGENTS.md).
- **Also called:** slice, vertical; the `/new-feature` command builds one.

## W

### Worked example

The `@app/notes` vertical, its web and mobile screens, routes and migrations, and its rows in
the registers, which `init --with-demo` adds and `eject` removes. A default `init` writes no
example feature.

- **Where:** [`eject`](cli.md#eject) in the CLI reference.
- **Also called:** the demo; `--with-demo`.
