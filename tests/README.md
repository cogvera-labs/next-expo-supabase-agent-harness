# tests/

This repository's own tests, written for `node --test`. Node alone runs them; the cases that
read TypeScript need a root `pnpm install` and skip by name without it. Nothing here ships.
The tests a project gets are in the template ([template/README.md](../template/README.md)).

## The suites

| Directory | What it proves | Where it runs |
|---|---|---|
| [gates/](gates/) | That each gate fails on the violation it exists for and passes a clean tree, and that the libraries behind the gates behave. It covers the gates projects get (`template/base/tools/`, module `tools/`) and this repository's own checks in `scripts/` alike. Many tests read the real docs and registers, so a doc edit can turn this suite red. | The factory Stop gate; `selftest.yml` `installer-unit` on Linux, Windows and macOS; `lint.yml` for the cases that read TypeScript |
| [hooks/](hooks/) | The Claude Code hooks: the guards, the Stop hook and the other hooks a project gets, and this repository's own hooks in `.claude/hooks/`. [hook-contract.test.mjs](hooks/hook-contract.test.mjs) holds a deny case and an allow case for every guard-rule id. | The factory Stop gate; `installer-unit` |
| [installer/](installer/) | Every CLI command run against real scratch directories (`init`, `update`, `doctor`, `graduate`, `enable` and `disable`, `eject`, `apply-proposal`), the installer library, the npm package's contents, and the README recording: [readme-recording.test.mjs](installer/readme-recording.test.mjs) replays [docs/media/harness-demo.tape](../docs/media/harness-demo.tape). | `installer-unit`, with a coverage floor on `installer/`. Not in the Stop gate |
| [canary/](canary/) | The can-fail-proof registry, described below. | [check-canary-coverage.mjs](../scripts/check-canary-coverage.mjs): its closure in the Stop gate, its full run in `installer-unit` |
| [evals/](evals/) | Evals A and B of the duplication sweep, and the digests that keep the sweep's output identical across machines ([evals/README.md](evals/README.md)). | `lint.yml` with the parser installed; a Windows job for the digests; `installer-unit` without the parser cases |
| [fixtures/](fixtures/) | `released/<version>/`: files exactly as an earlier release shipped them, stored as `*.txt`, for tests of how `update` and the gates treat an old copy. `reviewer-eval/<case>/`: the reviewer eval's corpus ([evals/README.md](evals/README.md)). | Read by the suites above |

`release.yml` runs every suite again on a release tag before anything is published.

## Running them the CI way

CI runs the suites with `GITHUB_BASE_REF` and `CI` set, and a local run without them checks
less. With both set, the diff-scoped and CI-strict branches of the gates run their CI halves,
as they do on a pull request. A gate fixture builds a throwaway git repository with no remote,
so there a gate that resolves a diff base fails closed, and a gate whose toolchain is missing
fails instead of skipping: a test that passes only in a plain shell goes red on the pull
request. Run with `HARNESS_ALLOW_SELF_EDIT` unset, as the factory Stop gate does, because the
guard tests read it. `pnpm test` runs every file, without these variables.

```sh
# Everything, as CONTRIBUTING.md's list runs it
GITHUB_BASE_REF=main CI=true node --test "tests/**/*.test.mjs"

# One suite, or one file
GITHUB_BASE_REF=main CI=true node --test "tests/gates/**/*.test.mjs"
GITHUB_BASE_REF=main CI=true node --test "tests/hooks/**/*.test.mjs"
GITHUB_BASE_REF=main CI=true node --test "tests/installer/**/*.test.mjs"
GITHUB_BASE_REF=main CI=true node --test tests/gates/check-secrets.test.mjs

# The evals as lint.yml runs them, after a root `pnpm install`. Without the parser their
# parser cases skip by name; HARNESS_TEST_REQUIRE_TYPESCRIPT=1 turns that skip into a failure.
GITHUB_BASE_REF=main CI=true HARNESS_TEST_REQUIRE_TYPESCRIPT=1 node --test "tests/evals/*.test.mjs"

# The registry: its closure alone, then a full run that also executes every proof file
node scripts/check-canary-coverage.mjs --no-spawn
node scripts/check-canary-coverage.mjs
```

Which suites to run for which kind of change is in the root [AGENTS.md](../AGENTS.md) and in
[CONTRIBUTING.md](../CONTRIBUTING.md#local-development).

## The can-fail-proof registry

[canary/injections.json](canary/injections.json) holds at least one proof that each of these
can go red: every step of the validate and Stop chains, every CI job of the shipped workflows
(base and modules), and every factory check and factory CI job. The registry calls these
proofs canaries. A proof is usually a test here that runs the real gate on an injected
violation (`fixture`), or a named leg of `.github/workflows/selftest.yml` that injects the
violation into a real scaffold (`selftest`, the "Canary" steps); the file's own comments list
every kind. Guard rules are proved in [hooks/hook-contract.test.mjs](hooks/hook-contract.test.mjs)
instead, with a deny and an allow case for each rule id.

[check-canary-coverage.mjs](../scripts/check-canary-coverage.mjs) fails on a step, job, check
or rule with no proof, and on an entry whose subject or proof no longer exists. The registry
is write-protected: deleting a row is how a gate would stop being falsifiable while every
count still added up, so an edit needs `HARNESS_ALLOW_SELF_EDIT=1`, which is a human's
decision.
