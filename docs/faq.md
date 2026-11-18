# FAQ

Short answers to the questions people ask about the harness, from agents that claim to be done
too early to Cursor, Windows, upgrades and audits.

Each answer links the document that backs it. Terms are defined in the
[glossary](glossary.md), and [How it works](how-it-works.md) walks through every layer.

## The agent and the gates

### Will Claude Code still say "done" while tests fail?

Not without being sent back first. When the agent tries to end its turn, the
[Stop hook](how-it-works.md#the-stop-hook) runs the Stop chain itself (the validate gates,
the RLS isolation suites against your local database, both unit suites with coverage, and the
checks after them) and exits 2 with the failures until every step is green. The exception is
Claude Code's block cap: after a run of consecutive blocks the turn ends anyway, and the
harness records that and tells the next turn, as the
[first-run runbook](../template/base/docs/runbooks/first-run.md) shows.

### Why not put the rules in CLAUDE.md?

Instructions are advisory: the model reads them and can still skip or misread them, and rules
scoped to some paths drop out of context at compaction. The thesis of the
[harness doctrine](../template/base/docs/harness/README.md#the-gate-is-the-enforcement) is
that quality is a deterministic gate, not a request, so `AGENTS.md` and `.claude/rules/`
restate the invariants to keep the agent from tripping a gate, and the hooks, gate scripts and
CI are what refuse. In a scaffold, `CLAUDE.md` is the single line `@AGENTS.md`, and the
`wiring` gate keeps it that way.

### What stops the agent deleting, skipping or weakening tests?

`test-quality` fails a committed `.only`, a `.skip` or `.todo` without a reviewed reason, and a
test with no assertion, and `diff-coverage` fails a changed source file that no test covers to
its per-file floor. In CI, the mutation lane changes the code on purpose and fails when a
change survives every test and is not already in the reviewed baseline. "No test edits in the
same turn as the fix" is a review rule rather than a hook, because a real feature adds code
and tests together and a deterministic ban cannot tell the two apart (the doctrine's
[validate contract](../template/base/docs/harness/README.md#the-validate-contract) and the
[gates catalog](../template/base/docs/harness/gates-catalog.md#test-quality--node-toolscheck-test-qualitymjs)).

### How do I stop eslint-disable and @ts-ignore from spreading?

The `suppressions` gate fails on a rule-less `eslint-disable`, on `@ts-ignore` and on
`@ts-nocheck`; `@ts-expect-error` is the allowed form. Every other directive must name its
rule, carry an inline reason, and match a reviewed row in `tools/suppressions-allow.json`, an
escape list that an agent can propose a change to but not edit
([gates catalog](../template/base/docs/harness/gates-catalog.md#7-suppressions--node-toolscheck-suppressionsmjs)).

### Which commands does it block?

The bash guard checks every Bash, Monitor and PowerShell command before it runs. It denies
recursive force-deletes, force-push, `git reset --hard`, `--no-verify`, reading or sourcing
`.env` files, destructive SQL outside a migration, contact with app-signing credentials and
shell writes to the harness's own files, among others; the
[threat model](../template/base/docs/security/threat-model.md#agent-time-refusals) lists every
rule with the message the agent sees. The permission deny list in `.claude/settings.json` adds
`curl`, `wget` and reads of secret files, and does not depend on the guard's patterns.

### A guard blocked a harmless command. Why?

The rules match command text, not intent, so a harmless command that contains a denied shape
is refused too: `grep -rn "process.env" src` matches the rule against reading `.env` files,
and a search string that contains a recursive force-delete matches that rule. The deny message
says why the command was blocked, and some messages name what to run instead. Rephrase the
command so its text no longer matches; the
[assurance case](security/assurance-case.md#residual-risks) records this trade-off as a known
limit.

### Can the Stop hook loop forever?

No. Claude Code's block cap ends a turn after a run of consecutive Stop-hook blocks (the
shipped `.claude/settings.json` sets `CLAUDE_CODE_STOP_HOOK_BLOCK_CAP`), so a stuck session
terminates. The harness's last allowed block says `LAST CHANCE`, every outcome goes to
`.harness/turn-outcomes.jsonl`, and the next turn reports a predecessor that ended at the cap,
even if the tree is green by then (the doctrine's
[stop-validate-gate](../template/base/docs/harness/README.md#stop-validate-gate) section).

### Can the agent switch its own guardrails off?

Not without leaving evidence: the guardrails are tamper-evident, not tamper-proof. Hooks,
settings, gate scripts and workflows are write-protected, `gate-integrity` re-hashes them on
every validate, CI runs a frozen copy of the gate list that a project can add to but not
shrink, and CODEOWNERS review covers those paths (the doctrine's
[tamper evidence](../template/base/docs/harness/README.md#tamper-evidence-honest-limits)
section). A `disableAllHooks` setting does stop every hook that is not set in managed
settings, which is why a team deploys the hooks through
[managed settings](../template/base/docs/security/managed-settings.md) when they must survive a
developer.

### How slow is it?

The Measured cost section of the [README](../README.md) gives the wall times CI recorded for a
warm and a cold `pnpm validate` and for a full Stop hook run on a GitHub-hosted Linux runner;
they are that runner's numbers, not a promise about your machine. Locally, the gates that
support stamps skip their check and print `STAMPED` when their inputs have not changed since
their last green run, and CI never honours a stamp
([stamped gates](../template/base/docs/harness/README.md#stamped-gates)).

## Supabase and security

### Can the agent leak my Supabase service-role key?

Several layers stand in the way, though none of them is a sandbox. Reading `.env` files is
denied; the `secrets` gate scans every tracked file for `sb_secret_` keys, credentialed
Postgres URLs and similar shapes without printing what it finds, and gitleaks scans after a
push. The key may live only in an Edge Function governed by a decision record: the write guard
and lint deny it in web code, and the build checks keep it out of the client bundles
([gates catalog](../template/base/docs/harness/gates-catalog.md#4-secrets--node-toolscheck-secretsmjs),
[security invariants](../template/base/.claude/rules/security-invariants.md)).

### Is it safe to connect the Supabase MCP server?

MCP calls are default-deny: the MCP guard refuses an unregistered server, a tool outside a
server's list, and a write-shaped tool such as `apply_migration` or `execute_sql` on a server
registered read-only, and it fails closed if the registry is missing. Schema changes are meant
to arrive as migration files, because an MCP `apply_migration` goes around the write guard's
SQL rules, the schema gates and review. Registering a server is a human edit to
`tools/approved-tools.json`, and [Approved tools](../template/base/docs/security/approved-tools.md)
says never to hand an MCP server the direct database URL or the service-role key.

### How is row-level security tested?

The `schema-rls` and `tenancy` gates check that every table's policies exist in the allowed
shapes, and the `rls-isolation` step proves they isolate. It runs pgTAP and supabase-js suites
against the local stack: user A sees its own row first, a cross-user read returns zero rows,
an insert that smuggles another user's id fails with SQLSTATE 42501, and no identity survives
on a pooled connection. With no stack running, once the project has migrations, it fails under
the Stop hook and in CI (the doctrine's
[RLS testing doctrine](../template/base/docs/harness/README.md#rls-testing-doctrine)).

### Why does my RLS policy return 403 or 42501?

Postgres checks table privileges before row security, so a policy for a role that has no
GRANT on the table never runs, and the statement fails with 42501, which PostgREST returns as
HTTP 403. The harness requires revoking the default privileges and granting exactly what the
policies admit, in the same migration that creates the table, and asserts the result with
generated pgTAP. Supabase's default grants on new tables stop applying to newer projects, so a
migration that leaned on them can work in one project and fail in the next
([security invariants](../template/base/.claude/rules/security-invariants.md)).

### Can the agent apply a migration to production?

No shipped rule pre-approves it, and none denies it outright. Schema changes reach the
repository as append-only migration files, which the write guard and the `migrations` gate
judge (destructive DDL must name a decision record), and the bash guard denies destructive raw
SQL through `psql`. A command such as `supabase db push` is on no allow list, so your Claude
Code permission settings decide whether it runs; keep production credentials out of the
session
([privileged database access](../template/base/docs/security/approved-tools.md#privileged-database-access-the-direct-db--service-role-carve-out)).

## Fit

### Does it work with Cursor, Codex or Copilot?

Partly. The commit hooks, `pnpm validate` and CI apply to any agent as they do to a person,
and `AGENTS.md` holds the project's instructions in a file that other coding agents can read.
The `.claude/` hooks run only in Claude Code, so with another agent nothing denies a command
before it runs or sends the agent back while a check fails: a violation is caught at the commit
or at the pull request instead
([How it works](how-it-works.md#agents-other-than-claude-code)).

### Does it work on Windows or macOS?

On macOS, CI runs `init` and `pnpm validate` without Docker and fails if any gate skips except
`types-drift`, which needs the database; the database gates are proven on Linux only. Windows
is not proven: the installer's unit tests run there, but no CI lane runs a scaffold, and
`pnpm validate` has never run in CI on Windows (the README's Limitations). The
[first-run runbook](../template/base/docs/runbooks/first-run.md) also asks Windows users to put
the Supabase CLI on PATH, because the RLS step does not use the workspace copy there.

### Do I need Docker?

Yes, for the database checks. `pnpm db:up` starts the local Supabase stack in containers, and
under the Stop hook the RLS isolation step fails closed without it once the project has
migrations, so a turn cannot end green. `pnpm validate` itself needs the database only for
`types-drift`, which skips without it
([Local development](../template/base/docs/runbooks/local-development.md)).

### Can I add it to an existing project?

If it is a pnpm workspace with a Next.js app in `apps/web` or an Expo app in `apps/mobile`,
yes: `init` retrofits it, keeps your configs, parks the harness's copies beside them as
`<name>.harness.<ext>` files, and merges its Claude Code hooks into your
`.claude/settings.json`. `gate-integrity` stays red until each parked config is merged or
accepted after review, and an existing workflow file is kept, so your CI runs no harness gate
until you add the chain to it. A repository on npm, yarn or bun, or without
`pnpm-workspace.yaml`, is refused (the [README](../README.md), "Who this is for").

### Can I use it for a web-only app?

Not today. `init` writes both apps, and the mobile gates judge `apps/mobile`: without it,
`expo-policy` and `native-deps` skip on a laptop but fail closed in CI, and `parity` fails on
the mobile paths its register names. CI runs the frozen step list, so a project cannot drop
those gates (the [README](../README.md), "Who this is for").

### Do I need the Claude Code plugin?

Not inside a project that `init` created: `init` already writes the same agents, commands and
skills into its `.claude/` folder, and only those count toward the reviewer ledger. The plugin
is for sessions in other repositories, where it brings the agents, slash commands and skills
without hooks, gates or permission rules ([plugin README](../plugin/README.md)).

## Upgrades, audits and evidence

### How do I keep my project up to date with the template?

Commit, then run `npx --yes next-expo-supabase-agent-harness@latest update --dry-run` to see
what would change, and the same command without `--dry-run` to apply it. Owned files that still
match their record are replaced; a file you changed is kept, with the new version parked under
`.harness/pending/`; and `update --rollback` restores the tree from before the last update. A
new gate can arrive as NOTE lines with a deadline (a ramp), while a raised security floor
applies at once ([CLI reference](cli.md#update),
[upgrade runbook](../template/base/docs/runbooks/harness-upgrade.md)).

### What can I show an auditor (SOC 2, ASVS, the Essential Eight)?

Mappings, not certifications. The scaffold ships a register for ASD's Essential Eight and a
crosswalk for OWASP ASVS 5.0.0, OWASP MASVS 2.1 and EU CRA Annex I; each maps the requirements
to the gate, hook or test that bears on them, lists the ones the scaffold does not meet, and
claims no conformance level
([Essential Eight register](../template/base/docs/compliance/essential-eight.md),
[controls crosswalk](../template/base/docs/compliance/controls-crosswalk.md)). There is no
SOC 2 mapping. Each release of the CLI also carries a signed build provenance attestation that
you can verify, as [SECURITY.md](../SECURITY.md) describes.

### Is there evidence that it makes agents write better code?

Not yet. What the repository shows is that each gate, guard rule and CI job fails when its
violation is injected, and that its maintainers' own agent sessions run under the shipped bash
guard and equivalent write and Stop guards; the effect on an agent's output has not been
measured. A pre-registered evaluation with and without the harness is tracked in
[issue #170](https://github.com/cogvera-labs/next-expo-supabase-agent-harness/issues/170), and
the [evidence page](evidence.md) lists what is and is not measured.

### This repository was written mostly by agents. Who answers for it?

Agents write most changes; a human maintainer reviews, merges and releases them and answers
for them, and the gates judge both. There is one maintainer, so no change is approved by a
second person, but every change to `main` lands through a pull request whose required checks
nobody can bypass ([SECURITY.md](../SECURITY.md),
[Building with agents](building-with-agents.md)).

### Do I have to credit the harness in my app?

No. The repository is licensed Apache-2.0, and everything under `template/`, which is what
`init` writes into your project, is "Apache-2.0 OR 0BSD": you may choose either, so
scaffolded code carries no attribution requirement (the [README](../README.md) and
[REUSE.toml](../REUSE.toml)).
