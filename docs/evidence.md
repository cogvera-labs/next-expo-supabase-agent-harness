# Verify the claims yourself

The repository's claims about itself, each with a command to run, what a pass prints, the proof the check can fail, and the CI job that runs it.

This page is for a reader who would rather check than trust. Every command on it was run on
2026-11-18 against the tree tagged `v2.0.8` (`3902a3b`), and "A pass looks like" quotes what
it printed, with `<n>` standing for a count that changes as the project does. The page states no
live counts: run the command to see the current figure. Figures about history are pinned to
the `v2.0.8` tag. Where a check could not be run while writing, the page says so.

## Before you start

- **A plain clone**, which also fetches the release tags several commands compare against:
  `git clone https://github.com/cogvera-labs/next-expo-supabase-agent-harness.git`
- **Node 22 or newer.** The `node` commands need nothing installed, except the one row that
  says `pnpm install` (pnpm 11, which `corepack enable` provides). If `corepack` is not on
  your PATH (Node.js 25 and later no longer bundle it), run `npm install -g corepack` first.
- **[`jq`](https://jqlang.org/), the [GitHub CLI](https://cli.github.com/) (`gh`) and npm**
  for the rows that read JSON, GitHub and the npm registry.
- **Docker** only for the database lanes, which this page leaves to CI (see
  [Not run for this page](#not-run-for-this-page)).
- **CI's environment for test files.** The test commands below start with
  `GITHUB_BASE_REF=main CI=true`, as CI runs them; [CONTRIBUTING.md](../CONTRIBUTING.md)
  explains how a plain shell can pass a test that fails on a pull request.

A **can-fail proof** is a test or a CI step that breaks what a check guards and asserts that
the check goes red. The registry that lists them,
[tests/canary/injections.json](../tests/canary/injections.json), calls them canaries. A
check without one may be unable to fail at all, so CI refuses a new gate, guard rule or CI
job that has none.

## Enforcement

| Claim | Run | A pass looks like | Can-fail proof | CI job |
|---|---|---|---|---|
| A guard hook judges a shell command before it runs | `node template/base/.claude/hooks/pretool-bash-guard.mjs < payload.json`, with the payload below | One line of JSON with `"permissionDecision":"deny"` and the rule's message. With `pnpm install` as the command it prints nothing, which allows it | [tests/hooks/hook-contract.test.mjs](../tests/hooks/hook-contract.test.mjs) | `installer-unit` |
| Every guard-rule id has a deny or allow case, and each case runs | `GITHUB_BASE_REF=main CI=true node --test tests/hooks/hook-contract.test.mjs` | `# fail 0` in the closing summary | Its test "every guard rule id has a behavioral canary" fails for a rule with no case | `installer-unit` |
| Every validate and Stop step, every factory gate and every CI job, here and in what projects receive, has a registered can-fail proof | `node scripts/check-canary-coverage.mjs --no-spawn` | `CANARY COVERAGE: CLEAN (<n> steps each carry a red-proof; …)` | [tests/gates/check-canary-coverage.test.mjs](../tests/gates/check-canary-coverage.test.mjs) | `installer-unit`, which runs it without `--no-spawn` |
| A gate fails on the violation it exists for; the secrets gate, for example | `GITHUB_BASE_REF=main CI=true node --test tests/gates/check-secrets.test.mjs` | `# fail 0`. Its red cases plant a service-role key, a private key and a remote database URL with credentials, and expect the gate to fail | Selftest step "Canary 26: an sb_secret_ key in a tracked file → secrets must FAIL" | `installer-unit`, `canary` |
| CI breaks a real scaffold on purpose, once per numbered canary, and expects the named gate to fail | `grep -nE 'Canary [0-9]+:' .github/workflows/selftest.yml` | One line per canary step, such as `Canary 5: remove FORCE RLS from the migration → schema-rls must FAIL`. A few more live in the helpers under [scripts/ci/](../scripts/ci/) | The steps are the proofs | `canary`, and the other `selftest.yml` jobs that hold a canary |
| CI runs a frozen copy of the step list, so a project can add a gate but cannot quietly remove one | `node scripts/generate-floor.mjs --check` | `generate-floor --check: OK (VALIDATE_STEPS: <n>, STOP_HOOK_STEPS: <n> in lockstep)` | [tests/gates/floor-lockstep.test.mjs](../tests/gates/floor-lockstep.test.mjs): a floor out of step reds, and `--min-floor` fails closed when the floor is missing or corrupt | `installer-unit`; in a project, the `static` job of `quality-gate.yml` runs `validate --min-floor` |

The payload for the first row, saved as `payload.json`:

```json
{"hook_event_name":"PreToolUse","tool_name":"Bash","tool_input":{"command":"pnpm update"}}
```

What these rows do not show:

- `check-canary-coverage` without `--no-spawn` runs every proof file and requires each to
  pass with real tests. As its own output says, that is not proof the file turns its gate
  red. That part rests on each proof's author, and on the selftest canaries, which break a
  real scaffold and watch the gate fail.
- The guards are tamper-evident, not tamper-proof. They match command text and paths, so a
  spelling they do not anticipate can pass. CI and the pull request are the boundary
  ([assurance case](security/assurance-case.md), residual risk 1).
- The Stop hook sends the agent back to work while a check fails, until Claude Code's block
  cap; then the turn ends, and the next turn is told what was left red
  ([harness doctrine](../template/base/docs/harness/README.md)).

## Honesty of the numbers

| Claim | Run | A pass looks like | Can-fail proof | CI job |
|---|---|---|---|---|
| The README's counts, compliance figures and timings match their sources, and the compliance sentence cannot be deleted | `node scripts/check-claims.mjs` | `CLAIMS: CLEAN (chain <n> steps, …)` | [tests/gates/check-claims.test.mjs](../tests/gates/check-claims.test.mjs): a stale count, a too-generous compliance figure, a deleted sentence, and a stale count split across two lines each turn it red | `hygiene`, a required check on `main` |
| No Essential Eight maturity claim anywhere in the repository, and no ASVS, MASVS or CRA standing claim in the README, the CHANGELOG or the shipped docs, in the phrasings the checks know | `node scripts/hygiene.mjs` | `HYGIENE: CLEAN (…)`. A local run first says the private-name check skipped, because that list is a repository secret | [tests/gates/hygiene.test.mjs](../tests/gates/hygiene.test.mjs) and [tests/gates/standards-claim.test.mjs](../tests/gates/standards-claim.test.mjs) plant a claim and expect red, and keep a sentence that denies the claim green | `hygiene`, `installer-unit` |
| A published timing is a committed CI measurement, not an estimate | `jq -c '.measurement' scripts/chain-budget.json` | `{"recordedOn":"<date>","runner":"Linux/X64 (selftest)","chainSteps":<n>,"stepsMeasured":<n>}`, with the two counts equal | [tests/gates/chain-budget.test.mjs](../tests/gates/chain-budget.test.mjs); `check-claims` refuses every timing while the record and the live step list differ | `hygiene`; `bootstrap-linux` holds each step to its recorded ceiling |
| The installer's own complexity debt is recorded, and may shrink but not grow | `pnpm install --frozen-lockfile`, then `node scripts/check-complexity-ratchet.mjs` | `COMPLEXITY RATCHET: CLEAN (<n> recorded function(s), none grew; worst is installer/commands/init.mjs::init at <n>)` | [tests/gates/check-complexity-ratchet.test.mjs](../tests/gates/check-complexity-ratchet.test.mjs) | `machinery-lint` |
| Dated promises are rows in a register that a check reads, not sentences in a changelog | `node scripts/check-obligations.mjs` | `OBLIGATIONS: CLEAN (…)` | [tests/gates/obligations.test.mjs](../tests/gates/obligations.test.mjs) | `machinery-lint`; the dated rows in the nightly `obligations-clockful` job of `hygiene.yml` |

The complexity record's history up to `v2.0.8`, newest first: each commit that changed
[scripts/complexity-ratchet.json](../scripts/complexity-ratchet.json), its date, and the sum
of the recorded scores. No total is larger than the one below it.

```sh
git log --format='%h %ad' --date=short v2.0.8 -- scripts/complexity-ratchet.json | while read -r h d; do echo "$h $d $(git show "$h:scripts/complexity-ratchet.json" | jq '[.functions[]] | add')"; done
```

The worst recorded function, the installer's `init()`, is far over the complexity limit the
harness holds a project's own code to. The record makes that debt visible and stops it
growing; it has not paid it off.

`check-claims` reads the README, CONTRIBUTING.md, the CHANGELOG, `design/` and the shipped
docs. It does not read the pages under `docs/`, which is why they give commands instead of
counts.

## Supply chain and releases

| Claim | Run | A pass looks like | Can-fail proof | CI job |
|---|---|---|---|---|
| The npm tarball is the GitHub Release asset, byte for byte | [Same bytes](#same-bytes), below | The two SHA-256 digests are identical | `publish-npm` publishes the release's own tarball and fails unless the registry reports those bytes ([tests/gates/npm-publish.test.mjs](../tests/gates/npm-publish.test.mjs)) | `publish-npm` |
| Each 2.0.x version on npm carries a SLSA provenance statement that names this repository, the release workflow, the tag and the commit | `npm view 'next-expo-supabase-agent-harness@2.0' dist.attestations.provenance.predicateType`, then [What the provenance names](#what-the-provenance-names), below | One `'https://slsa.dev/provenance/v1'` line per 2.0.x version; the statement names `refs/tags/v2.0.8`, `.github/workflows/release.yml` and the commit that `git rev-parse 'v2.0.8^{commit}'` prints | `publish-npm` fails on a missing or wrong provenance statement, or another publisher (same test file) | `publish-npm` |
| The signatures verify. Not run for this page: see below | `npm audit signatures` in a project that installed the package, and `gh attestation verify` on the release tarball, as [SECURITY.md](../SECURITY.md) gives them ("Verifying a release") | Exit status 0 | `publish-npm` verifies the tarball against its attestation bundle before it publishes | `release`, `publish-npm` |
| Every GitHub Action is pinned to a full commit SHA, in this repository's workflows and in those projects receive | [Pinned actions](#pinned-actions), below | `0`: no `uses:` line without a SHA | [tests/gates/ci-preconditions.test.mjs](../tests/gates/ci-preconditions.test.mjs) for the shipped workflows; `zizmor` for this repository's ([assurance case](security/assurance-case.md), R8) | `machinery-lint`, `zizmor` |
| The CLI has no runtime dependencies and runs no install script | `jq '{dependencies, scripts}' package.json` | `"dependencies": null`, and only the `bootstrap` and `test` scripts | None: [CONTRIBUTING.md](../CONTRIBUTING.md) ground rule 3 states it, and no check enforces it | none |
| One version across the package, the plugin, the hook stamps, the citation file and the changelog | `node scripts/check-release-lockstep.mjs` | `release lockstep: OK (v<version> everywhere)` | [tests/gates/check-release-lockstep.test.mjs](../tests/gates/check-release-lockstep.test.mjs) | `installer-unit`, `release` |
| Licensing is machine-checked | `node scripts/check-reuse.mjs` | `REUSE: OK (<n> annotations cover <n> files; …)` | [tests/gates/check-reuse.test.mjs](../tests/gates/check-reuse.test.mjs) | `reuse-lint`, which also runs the REUSE tool itself |

### Same bytes

```sh
mkdir release registry
(cd release && curl -sSLO https://github.com/cogvera-labs/next-expo-supabase-agent-harness/releases/download/v2.0.8/next-expo-supabase-agent-harness-2.0.8.tgz)
(cd registry && npm pack next-expo-supabase-agent-harness@2.0.8)
sha256sum release/*.tgz registry/*.tgz      # on macOS: shasum -a 256
```

### What the provenance names

This reads what the statement says. It does not check the statement's signature; the next
row of the table does.

```sh
curl -sS https://registry.npmjs.org/-/npm/v1/attestations/next-expo-supabase-agent-harness@2.0.8 \
  | jq -r '.attestations[] | select(.predicateType == "https://slsa.dev/provenance/v1") | .bundle.dsseEnvelope.payload' \
  | base64 -d \
  | jq '.predicate.buildDefinition.externalParameters.workflow, .predicate.buildDefinition.resolvedDependencies[0].digest'
git rev-parse 'v2.0.8^{commit}'
```

### Pinned actions

```sh
grep -hE '^\s+(- )?uses: ' .github/workflows/*.yml template/base/github/workflows/*.yml template/modules/*/github/workflows/*.yml \
  | grep -vcE '@[0-9a-f]{40}'
```

`grep -c` exits 1 when its count is zero, so the printed `0` is the pass, not the exit
status.

### Signatures

Neither signature check was run for this page. Both need Sigstore's trust root, the network
this page was written on refused that host, and each command stopped before it verified
anything. The [assurance case](security/assurance-case.md) (R7) records the
`gh attestation verify` commands run against the v1.0.3 assets on 2026-09-29, and the
`publish-npm` job verifies every release before it publishes it. A version published outside
the workflow would carry no provenance, and `npm audit signatures` does not report a missing
statement; the `npm view` row above does.

## History and process

| Claim | Run | A pass looks like | Can-fail proof | CI job |
|---|---|---|---|---|
| Since v1.0.0, every change on `main` arrived as a pull-request merge or squash | [Pull requests only](#pull-requests-only), below | `0`: no entry on `main`'s first-parent line that is neither | None in the repository; the ruleset on `main` refuses a direct push | Repository ruleset |
| `main` requires a pull request and the required checks, and blocks force-pushes and deletion. It requires no approving review | [The ruleset](#the-ruleset), below | The rule types `deletion`, `non_fast_forward`, `pull_request` and `required_status_checks`; `0` required approvals; then the names of the required checks | None | Repository ruleset |
| AI assistance is disclosed in commit trailers | [Trailers](#trailers), below | At `v2.0.8`: 804 of the 846 commits carry a `Co-Authored-By` trailer naming a Claude model | None: the committing tool writes the trailer, so it is a disclosure, not a proof | none |
| A tag whose CI is red is not published: v0.11.0 was refused | [The refused tag](#the-refused-tag), below | `Not Found (HTTP 404)` for the release, and `failure` for the tag's `release.yml` run | [tests/gates/wait-for-workflows.test.mjs](../tests/gates/wait-for-workflows.test.mjs) | `release` waits for green `selftest` and `lint` runs on the tagged commit |
| Mistakes are corrected in a later entry, not rewritten | `grep -rn '### Corrections to the record' CHANGELOG.md docs/changelog/` | One line per release that carries the section | None: a convention | none |
| Upgrades from older releases are rehearsed on every pull request | `grep -E '^ +baseline: ' .github/workflows/selftest.yml` | One line per leg: `''` is the previous release, and the others are older tags back to `v0.1.3` | [tests/gates/ramp-verdict.test.mjs](../tests/gates/ramp-verdict.test.mjs), [tests/gates/upgrade-sweep.test.mjs](../tests/gates/upgrade-sweep.test.mjs) | `upgrade-linux` |

[Building with agents](building-with-agents.md) traces one change from the alarm that
prompted it to its merge, and lists what the gates and CI lanes caught.

### Pull requests only

To include changes after `v2.0.8`, replace it with `origin/main`.

```sh
git log --first-parent --format=%s v1.0.0..v2.0.8 | grep -vcE '^Merge pull request #|\(#[0-9]+\)$'
```

### The ruleset

```sh
gh api repos/cogvera-labs/next-expo-supabase-agent-harness/rules/branches/main --jq '.[].type'
gh api repos/cogvera-labs/next-expo-supabase-agent-harness/rules/branches/main \
  --jq '.[] | select(.type == "pull_request") | .parameters.required_approving_review_count'
gh api repos/cogvera-labs/next-expo-supabase-agent-harness/rules/branches/main \
  --jq '.[] | select(.type == "required_status_checks") | .parameters.required_status_checks[].context'
```

### Trailers

```sh
git rev-list --count v2.0.8   # 846
git log v2.0.8 --format='%(trailers:key=Co-Authored-By,valueonly,separator=%x2C)' | grep -c Claude   # 804
```

### The refused tag

```sh
gh api repos/cogvera-labs/next-expo-supabase-agent-harness/releases/tags/v0.11.0
gh api 'repos/cogvera-labs/next-expo-supabase-agent-harness/actions/workflows/release.yml/runs?per_page=100' \
  --jq '.workflow_runs[] | select(.head_branch == "v0.11.0") | .conclusion'
```

## What is not established

- **Outcomes.** Nothing measures whether the harness changes what an agent ships: fewer
  defects, less rework, or anything else. Issue
  [#170](https://github.com/cogvera-labs/next-expo-supabase-agent-harness/issues/170) plans a
  pre-registered evaluation with and without it. Until that reports, the project states no
  outcome figure.
- **The evals are built, and none has a recorded result.**
  [Eval A](../scripts/eval-a.mjs) scores the duplication sweep's detector. Its development
  split runs offline with no model call, but its labels come from how each case was built,
  none is confirmed by the maintainer yet, no run is recorded, and its holdout refuses to run
  until `tests/evals/a/frozen.json` exists
  ([#194](https://github.com/cogvera-labs/next-expo-supabase-agent-harness/issues/194)).
  [Eval B](../scripts/eval-b.mjs) measures the same sweep's precision on a frozen app tree;
  the third command below counts its labels by verdict, and a `pending` label is a hit
  nobody has judged yet
  ([#195](https://github.com/cogvera-labs/next-expo-supabase-agent-harness/issues/195)). The
  [reviewer eval](../scripts/reviewer-eval.mjs) scores the reviewer agents against seeded
  cases; its `--live` mode spends model calls on the maintainer's machine, no recorded
  replies are committed, and it gates nothing.

  ```sh
  ls tests/evals/a                         # inputs only: no dated run record, no frozen.json
  jq -c '[.labels[] | .by] | group_by(.) | map({(.[0]): length}) | add' tests/evals/a/labels.json
  jq -c '[.labels[] | .verdict] | group_by(.) | map({(.[0]): length}) | add' tests/evals/b/labels.json
  node scripts/reviewer-eval.mjs --check   # checks the cases are well formed; scores nothing
  ```

- **No independent review today.** The ruleset on `main` requires no approving review
  ([above](#the-ruleset)), and [SECURITY.md](../SECURITY.md) lists Code-Review among its open
  Scorecard findings because no change is approved by a second person. The maintainer reads
  and merges; the gates and CI judge. The
  [security assurance case](security/assurance-case.md) says it "has had no independent
  review". To count the merged pull requests that have an approving review:

  ```sh
  gh api 'search/issues?q=repo:cogvera-labs/next-expo-supabase-agent-harness+is:pr+is:merged+review:approved' --jq '.total_count'
  ```

- **One maintainer.** [GOVERNANCE.md](../GOVERNANCE.md): "There is no named successor
  today." It also lists what does not depend on the maintainer: the license, a written
  [fork procedure](forking.md), releases that need no secret handed over, and installs that
  carry their own gates.
- **Nightly status.** The scheduled runs install a fresh scaffold, which ships no lockfile,
  so it resolves the newest versions its catalog's ranges allow; they also run the checks that
  need the network or the date. They can therefore go red with no change in this repository,
  and catching that is their job. See their current state on the Actions pages for
  [selftest](https://github.com/cogvera-labs/next-expo-supabase-agent-harness/actions/workflows/selftest.yml?query=event%3Aschedule)
  and
  [hygiene](https://github.com/cogvera-labs/next-expo-supabase-agent-harness/actions/workflows/hygiene.yml?query=event%3Aschedule),
  or with:

  ```sh
  gh run list -R cogvera-labs/next-expo-supabase-agent-harness --workflow selftest.yml --event schedule --limit 5
  gh run list -R cogvera-labs/next-expo-supabase-agent-harness --workflow hygiene.yml --event schedule --limit 5
  ```

- **Windows.** `pnpm validate` has never run in CI on Windows. The installer's unit tests run
  on Windows, Linux and macOS, and one eval check runs on Windows; no job renders or
  validates a scaffold there, and the database gates are proven on Linux only.
  `grep -nE 'runs-on: windows|os: \[.*windows' .github/workflows/*.yml` prints the lines
  that put a job on Windows: `eval-digest-windows` in `lint.yml` and the `installer-unit`
  matrix in `selftest.yml`.
- **Other agents.** The guard hooks bind Claude Code. An agent that is not Claude Code meets
  the commit hooks, `pnpm validate` and CI, not the guards.
- **The trailers.** The tool that makes a commit writes its trailers, so they disclose AI
  involvement without proving how a change was made.

## Not run for this page

- **Signature verification** (`npm audit signatures`, `gh attestation verify`): Sigstore's
  trust root was out of reach, as [Signatures](#signatures) describes.
- **The zero-edit scaffold**, the last command in [CONTRIBUTING.md](../CONTRIBUTING.md)'s
  list: it renders a project, installs its dependencies and runs its whole chain, and the
  database gates need Docker. `bootstrap-linux` runs it on every pull request,
  `demo-eject` and `metal-bootstrap` run variants of it, and `macos-scaffold` runs it without
  Docker.
- **The database and device lanes**: they need Docker and an Android emulator.
  `bootstrap-linux` and `integration` run the database suites on every pull request;
  `maestro-smoke` runs the device lane on a schedule and on demand.

## See also

- [Building with agents](building-with-agents.md): who writes the changes, who answers for
  them, and what the gates caught.
- [Security assurance case](security/assurance-case.md): the requirements, the trust
  boundaries and the residual risks.
- [How it works](how-it-works.md): the enforcement loop, and what each layer cannot do.
- [Architecture](architecture.md): where each file mentioned here lives.
