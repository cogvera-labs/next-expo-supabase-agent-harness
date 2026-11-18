# How it works

How the harness holds a Claude Code agent to the project's checks: what each layer checks,
when it runs, and what it cannot bind.

The thesis of the [harness doctrine](../template/base/docs/harness/README.md) is that "quality
is a deterministic gate, not a request." Instructions tell the agent what good work looks like;
hooks, gate scripts and CI decide whether its work stands. One file,
[`tools/harness.config.mjs`](../template/base/tools/harness.config.mjs), defines the
[chain](glossary.md#chain) of gates, and `pnpm validate`, the Stop hook and CI all read it, so
they cannot disagree about what "done" means. Every gate and guard rule has a
[can-fail proof](glossary.md#can-fail-proof), a recorded way to make it fail, and so does
every job in the workflows a project receives; this repository's CI runs them (the registry
calls these proofs canaries).

Paths on this page are the ones in a scaffolded project. The links open the template copy in
this repository.

## The loop

```text
 AGENTS.md, .claude/rules/, skills         advisory context: read, not enforced
        |
        v
 +--> agent picks a tool call
 |      |
 |      +-- PreToolUse guards (bash, write, MCP) --> deny, with the reason
 |      v
 |    tool runs
 |      |
 |      +-- PostToolUse checks --> feedback on the file the tool wrote
 |      v
 |    agent tries to end the turn
 |      |
 |      +-- Stop hook runs the Stop chain
 |      |
 +------+ red: exit 2, and the failures go back to the agent
        |
        | green (or the block cap: the turn ends red, and is recorded)
        v
 commit, push     lefthook: Biome, gitleaks, commitlint; tsc, ESLint, knip
        |
        v
 pull request     CI: the chain against its frozen floor, RLS on a live stack
        |
        v
 merge            CODEOWNERS sign-off, where branch protection requires it
```

## The layers at a glance

| Layer | When it runs | What it binds | What it does not bind |
|---|---|---|---|
| Instructions | Loaded into the agent's context | Nothing; they inform | Any outcome |
| PreToolUse guards | Before each Claude Code tool call | Commands, file writes and MCP calls that match a rule | Forms no rule anticipates; other agents |
| PostToolUse checks | After each file edit | Feedback on the edit | Undoing it |
| Stop hook | When the agent tries to end a turn | The end of the turn, until the Stop chain is green | Turns past Claude Code's block cap; other agents |
| Commit hooks | `git commit` and `git push` | Every committer, person or agent | A commit made with `--no-verify` |
| CI | Every pull request and push | What merges, when its checks are required | Settings outside the repository |
| `gate-integrity` and `update` | Every validate; each upgrade | Silent edits to harness-owned files | A fork recorded on purpose and reviewed |

## Instructions: advisory context

[`AGENTS.md`](../template/base/AGENTS.md) holds the project's instructions for any coding
agent: the stack, the commands, the validate contract and the security invariants. The
scaffold's `CLAUDE.md` is the single line `@AGENTS.md`, so Claude Code reads the same file,
and the `wiring` gate fails if `CLAUDE.md` becomes anything else. The rules under
[`.claude/rules/`](../template/base/.claude/rules/), the skills and the slash commands add the
details and the recipes, such as the order in which to build a feature.

They raise the odds that the agent's code passes the first time, and they bind nothing. A
model can skip or misread an instruction, and a rule scoped to some paths loads only when the
agent works with a matching file and drops out of context at compaction (see the
[control-plane facts](../design/CONTROL-PLANE-FACTS.md)). So the doctrine's rule is never to
rely on an instruction for anything a gate could enforce deterministically.

## Guards before each tool call

The guard hooks are Claude Code `PreToolUse` hooks: they run before a tool call and can deny
it. The reason goes back to the model, and the call never runs.

- **The bash guard** checks every Bash, Monitor and PowerShell command. It denies recursive
  force-deletes, force-push, `git reset --hard`, `--no-verify`, reading or sourcing `.env`
  files, destructive SQL outside a migration, contact with app-signing credentials, shell
  writes to the harness's own files and the `apply-proposal` command, among others.
- **The write guard** checks every Edit, Write, MultiEdit and NotebookEdit call. It denies
  edits to harness-owned paths, edits to a committed migration, and content that breaks a
  security invariant, such as the Supabase service-role key in web code or `getSession()` in
  server code.
- **The MCP guard** checks every MCP tool call against the registry in
  [`tools/approved-tools.json`](../template/base/tools/approved-tools.json). It denies an
  unregistered server, a tool outside a server's list, and a write-shaped tool on a server
  registered read-only, and it fails closed when the registry is missing.

The rules are data in
[`.claude/hooks/lib/guard-rules.mjs`](../template/base/.claude/hooks/lib/guard-rules.mjs),
each with an id, the message the agent sees and a test that proves it fires; the
[threat model](../template/base/docs/security/threat-model.md#agent-time-refusals) lists them
all. Each guard hook starts through `launch.mjs`, which blocks the call if the hook cannot
load, so a broken guard does not wave a call through. Behind the guards stand the permission
deny list in [`.claude/settings.json`](../template/base/.claude/settings.json) and, at the
end, CI.

**What the guards cannot do.** They match text, and the doctrine calls the bash guard "a
high-value tripwire, NOT a sandbox": an obfuscated or unanticipated spelling can pass, and a
harmless command whose text contains a denied shape is refused (see
[A guard blocked a harmless command](faq.md#a-guard-blocked-a-harmless-command-why)). They
judge a call before it runs, not what the program does once it is running. They exist only in
Claude Code sessions.

## Checks after each edit

The `PostToolUse` hooks run after each Edit, Write or MultiEdit. One runs Biome on the file
and reports what it finds without blocking. The other checks provenance: when an edit adds a
decision in a mandatory class (a row-level security policy, token verification,
cryptography, a mobile security setting) without a `// SOURCE:` citation, it exits 2 and the
model is told to cite or change it. A `PostToolUse` hook cannot undo the edit; it can only
report on it. The doctrine's [hook map](../template/base/docs/harness/README.md#the-hook-map-deterministic-enforcement)
lists every hook, its event and what it enforces.

## The Stop hook

When the agent tries to end its turn,
[`.claude/hooks/stop-validate-gate.mjs`](../template/base/.claude/hooks/stop-validate-gate.mjs)
runs the [Stop chain](glossary.md#stop-hook-and-stop-chain): every step that
`STOP_HOOK_STEPS` in `tools/harness.config.mjs` lists, joined with the frozen list in
[`tools/stop.floor.json`](../template/base/tools/stop.floor.json), so a project can add a
step but not quietly remove one. The chain starts with the validate chain, reporting every
red at once, and goes on to the RLS isolation suites against the local database, both unit
suites with coverage, and the checks after them, ending with `reviewer-verdicts`. The
[gates catalog](../template/base/docs/harness/gates-catalog.md#stop-hook-runtime-suites-stop_hook_steps)
documents each step.

The hook runs each step itself, never through a `package.json` script, so redefining
`validate` as `true` changes nothing. While a step fails, it exits 2: Claude Code feeds the
message back to the model, and the turn continues. The message carries the head and the tail
of each failing step's output and the path of the full log under `.harness/stop-output/`.
When the turn ends green, the hook shows you the NOTE lines and the steps that were skipped or
stamped.

A gate whose prerequisite is missing skips loudly on your machine and fails closed in CI. The
RLS step is stricter: under the Stop hook it fails closed on your machine too, once the
project has migrations, because cross-tenant isolation would otherwise be unproven. A gate
whose inputs are unchanged since its last green run may print `STAMPED` locally and skip its
check; CI never honours a stamp.

### The block cap

Claude Code stops honouring a Stop hook after a run of consecutive blocks, so a turn that
cannot get green still ends. That limit is the [block cap](glossary.md#block-cap); the shipped
`.claude/settings.json` sets it with `CLAUDE_CODE_STOP_HOOK_BLOCK_CAP`. The harness keeps the
cap and makes a capped turn visible:

- the last block it is allowed says `LAST CHANCE`;
- every outcome of the Stop hook is appended to `.harness/turn-outcomes.jsonl`;
- the next turn is told which gates the capped turn left red, even if the tree is green by
  then. In the same session, a turn that would end green is sent back once to say so; in a
  new session, the session-start brief says it.

Two other cases can end a turn without a green chain: the hook reaching its timeout, and an
exit 2 whose message says a file is missing, which Claude Code treats as a non-blocking
error. The doctrine's
[stop-validate-gate](../template/base/docs/harness/README.md#stop-validate-gate) section
describes both.

**What the Stop hook cannot do.** It decides whether the tree passes the chain, not whether
the change is the one you asked for, and a test can be weakened and still pass. `test-quality`,
per-file diff coverage and the mutation lane in CI narrow that gap; "no test edits in the same
turn as the fix" is a review rule, because a real feature adds code and tests together. The
Stop hook runs only in Claude Code.

## Commit hooks

`pnpm install` installs lefthook's git hooks from
[`lefthook.yml`](../template/base/lefthook.yml). Before a commit, Biome formats the staged
files and gitleaks scans them (with a skip notice if gitleaks is not installed); commitlint
checks the message; before a push, `tsc -b`, ESLint and knip run. They apply to every
committer, a person or any agent.

**What they cannot do.** A commit made with `--no-verify`, or with lefthook switched off
through its environment variables, skips them. The bash guard denies both to Claude Code;
anyone else can skip them, and CI judges the pushed tree regardless.

## CI and the frozen floor

The shipped
[`quality-gate.yml`](../template/base/github/workflows/quality-gate.yml) workflow runs the
chain with `node tools/validate.mjs --min-floor`. That flag reads
[`tools/validate.floor.json`](../template/base/tools/validate.floor.json), a frozen copy of
the chain's step list that CI trusts over the local config, and fails closed if the copy is
missing or corrupt. A project can add gates to its chain; it cannot quietly remove one,
because the floor is a harness-owned, hash-pinned file: dropping a step means changing that
file in a commit a reviewer can see. This is the [CI floor](glossary.md#ci-floor). In CI,
every gate that would skip on a laptop fails instead, and no stamp is honoured.

Other jobs run the unit suites, the RLS suites against a live Supabase stack and the mutation
lane. Some lanes run on a pull request only when it touches their paths, such as the browser
tests, the database-scale plan checks and the Android emulator lane; these also run nightly
and on manual dispatch. Separate workflows run gitleaks after a push, OSV-Scanner on the
lockfile and CodeQL. To see CI's verdict before you push, run
`node tools/validate.mjs --ci-parity`.

**What CI cannot do.** It blocks a merge only when your repository requires its checks.
Branch protection, like the rest of your hosting settings, lives outside the repository.

## gate-integrity and update

`gate-integrity` is the second step of the chain, so a tampered gate does not get to run. It
re-hashes every harness-owned enforcement file against its record in `.harness/manifest.json`
and fails on any mismatch, so an edit that went around the guards (a shell redirect, an
external editor) fails the next validate. It also checks that every hook command in
`.claude/settings.json` runs `node` on a file that exists, that the Stop chain keeps every
step of its floor, that `baseVersion` never went backwards, and that changes to escape lists
and threshold configs are committed. `doctor` re-hashes the tree on demand. The
[gates catalog](../template/base/docs/harness/gates-catalog.md#2-gate-integrity--node-toolscheck-gate-integritymjs)
gives the details.

`update` moves an install to a newer release without losing your work. Owned files that still
match their record are replaced, a file you changed is kept with the incoming version parked
under `.harness/pending/`, the tree is snapshotted first so that `--rollback` can restore it,
and a new gate can arrive with a [ramp](glossary.md#ramp). See [`update`](cli.md#update).

**What they cannot do.** To keep a deliberate change to an owned file, you re-record its
sha256 in a reviewed commit, and `update` then parks the new version instead of overwriting
yours. A fork recorded that way is accepted by design, so the review of that commit, under
CODEOWNERS, is what catches a fork made to quiet a gate.

## What the harness cannot bind

### Tampering is evident, not prevented

The guards are [tamper-evident, not tamper-proof](glossary.md#tamper-evident-not-tamper-proof).
An agent or a person with shell access can change anything in the working tree. The design
makes that take a deliberate override, leave a diff a human reviews, and fail in CI even if
the local session was compromised (the doctrine's
[tamper evidence](../template/base/docs/harness/README.md#tamper-evidence-honest-limits)
section). `HARNESS_ALLOW_SELF_EDIT=1`, set in the environment a session starts from, is the
documented human escape hatch: it relaxes a listed set of protections, nothing records that
it was set, and the committed diff is the record. The launcher narrows the fail-open surface
to one small file, and `launch.mjs` still fails open if it is the file that cannot load
([assurance case](security/assurance-case.md#residual-risks)).

### Hooks switched off

A `disableAllHooks` setting in a user, project or local settings file stops every hook that
is not set in managed settings, and nothing in the repository can notice. The permission deny
list still applies, and `pnpm validate`, the commit hooks and CI still run. A team that needs
the hooks to survive a developer deploys them through
[managed settings](../template/base/docs/security/managed-settings.md).

### Agents other than Claude Code

The `.claude/` hooks run only in Claude Code. With Cursor, Codex, Copilot or another agent,
the commit hooks, `pnpm validate` and CI apply as they do to a person, and `AGENTS.md` carries
the same instructions. But nothing denies a command before it runs or sends the agent back
while a check fails: a violation is caught at the commit or at the pull request instead.

### Subagents and shell writes

Reviewer subagents have hooks of their own: `SubagentStart` records the tree each reviewer
is dispatched on, and `SubagentStop` reads the reviewer's `VERDICT:` line, blocks a
reviewer that gave none, and records the verdict for the Stop chain's `reviewer-verdicts`
step. Reviewers hold read-only tools, and the `docs-sync` gate fails if one is given a write
tool.

Author subagents, such as the ones `/new-feature` hands the migration, the data layer and the
tests to, write files, so their tool calls are the ones the guards must see. Claude Code's
[hooks reference](https://code.claude.com/docs/en/hooks) says `PreToolUse` and `PostToolUse`
hooks fire inside subagents; users have reported versions where they did not
([anthropics/claude-code#21460](https://github.com/anthropics/claude-code/issues/21460)). The
[control-plane facts](../design/CONTROL-PLANE-FACTS.md) record this repository's observations
of the `SubagentStart` and `SubagentStop` payloads, not of a guard firing inside a subagent.
Whatever wrote a file, the Stop hook judges the tree when the main turn tries to end, and the
commit hooks and CI judge it again.

An agent can also change a file through the Bash tool, with `sed`, a heredoc or a short
script. That is not an Edit or Write call, so the write guard's content checks do not see it.
The bash guard still denies the shell writes to the harness's own files that its rules match,
and the doctrine enforces the security invariants in layers (hooks, lint, dependency rules and
gates), so a file written through the shell still meets the lint rules and gates that judge
the whole tree at the Stop hook and in CI.

### The network

The guards judge a command's text before it runs; they do not confine what the process does
next. The shipped settings deny `curl` and `wget`, and web fetches outside a short list of
documentation domains ask for permission first. The harness does not turn on Claude Code's
sandbox, the one control that binds child processes. The
[sandbox notes](../template/base/docs/security/sandbox-and-supply-chain.md) explain how to
turn it on, and why a host allowlist bounds where data can go, not whether it goes.

### Devices

The Stop chain runs the mobile app's tests under Node with jest-expo: Hermes, native modules
and the OS keychain do not run, so a turn can end green without the app ever starting on a
device. The device lane covers that half in CI: on a pull request that touches the mobile
app, unless the project has deferred its mobile surface, and nightly. The
[gates catalog](../template/base/docs/harness/gates-catalog.md) states this, with the limit of
the accessibility checks, before its list of gates.

### Everything outside the repository

Branch protection, account security and your hosting platform's settings are yours to
configure; the harness can only recommend them. The
[assurance case](security/assurance-case.md#residual-risks) lists the residual risks in full.

## Further reading

- [Harness doctrine](../template/base/docs/harness/README.md): why each mechanism exists,
  which script implements it, and where its limits are.
- [Gates catalog](../template/base/docs/harness/gates-catalog.md): every gate, with its
  can-fail proof.
- [Threat model](../template/base/docs/security/threat-model.md): every guard rule, and the
  requirements the layers do not reach.
- [Enforcement tiers](../template/base/docs/harness/enforcement-tiers.md): where a layer
  covers only one of the two apps, and what stands in for it.
- [Security assurance case](security/assurance-case.md) and [SECURITY.md](../SECURITY.md).
- [Glossary](glossary.md) and [FAQ](faq.md).
