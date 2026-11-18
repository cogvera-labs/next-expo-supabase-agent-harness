# tests/evals/

Offline evals of the duplication sweep, the detector that the Single Home proposal
([design/SINGLE-HOME-2026-10.md](../../design/SINGLE-HOME-2026-10.md)) specifies. The sweep
reports code that has a second home, an exact or near copy of code that exists elsewhere, and
a project prints it with `node tools/check-duplication.mjs --sweep --json`; its code is
[template/base/tools/lib/sweep.mjs](../../template/base/tools/lib/sweep.mjs). Both evals are
deterministic and call no model. The `*.test.mjs` files here check the evals' inputs and
machinery. No eval applies a bar to its score yet.

The reviewer eval measures the reviewer agents instead. Its corpus is in
[../fixtures/reviewer-eval/](../fixtures/reviewer-eval/), and it is described here too.

| Eval | What it measures | Status on 2026-11-18 |
|---|---|---|
| A, the detector eval | Whether the sweep finds the duplicates it should, and only those | Built; the development split runs in CI; the holdout cannot run yet; no recorded run committed |
| B, all-hits precision | The precision of every hit the sweep reports on a frozen tree | Built; runs in CI; labels the plan did not verify wait for the maintainer; no recorded run committed |
| The reviewer eval | Whether a reviewer agent blocks an incomplete change and passes the complete one | Built; its corpus is checked in CI; replies are recorded only by hand, and none are committed |

To see the current state, run `node scripts/eval-a.mjs`, `node scripts/eval-b.mjs` (it counts
the labels still pending) and `node scripts/reviewer-eval.mjs --check`.

## Eval A: the detector eval

Helper functions taken from eval B's fixture are changed by scripted mutators, so each mutant
is a true duplicate by construction. Decoys and planted cases join them, each case is swept in
a tree of its own, and every hit is scored against its label.

- **Files** in [a/](a/): `corpus.json` (the helpers), `plantings.json` (decoys and plantings),
  `split.json` (the development and holdout split, from a committed seed), `labels.json` (a
  verdict per hit), `dev.sha256` (the digest of the development run) and
  `blind-vertical.prompt.md`, the prompt for a held-out vertical slice that an agent writes in
  a fresh install without seeing the sweep's rules.
- **Status.** Every label comes from the construction; the maintainer has confirmed none yet.
  The holdout split refuses to run: it needs `a/frozen.json`, the constants frozen from a
  development run, and the blind verticals that `split.json` names, and neither is committed.
- **Run** `node scripts/eval-a.mjs` for the development split. `--strict` also fails on a
  pending label, and `--write` records the run as `a/<date>.json`.
  `node scripts/eval-a-freeze-vertical.mjs --from <install> --n <k>` freezes a blind vertical,
  and `--check <dir>` checks a frozen one.

## Eval B: all-hits precision

Every hit the sweep reports on a frozen tree is labelled true, false or deliberate, and the
eval prints the precision per family and tier. A family with many hits is labelled on a
stratified sample.

- **Files** in [b/](b/): `fixture/` is a frozen copy of the files the sweep reads in an
  `init --with-demo` tree from an earlier commit, taken before this repository removed the
  duplicates the eval counts. It is not the live template, so do not update it with the
  template; [eval-b-fixture.mjs](../../scripts/lib/eval-b-fixture.mjs) says what it keeps and
  why. `fixture.sha256` is its digest manifest, `labels.json` holds the verdicts, `expect.json`
  the duplicates the eval must find, and `sweep.sha256` the digest of the sweep's output over
  the fixture.
- **Status.** The hits the Single Home plan already verified are labelled (`by: plan`); the
  rest wait for the maintainer as `pending`, so `--strict` fails.
- **Run** `node scripts/eval-b.mjs`. `--strict` also fails on a pending label, `--write`
  records the run as `b/<date>.json`, and `--write-labels` adds a `pending` label for each new
  hit. `--freeze` rebuilds the fixture from its source commit; it is not for routine use.

## The cross-machine check

[sweep-digest.test.mjs](sweep-digest.test.mjs) recomputes the digests of the sweep over eval
B's fixture and of eval A's development run, and compares them with `b/sweep.sha256` and
`a/dev.sha256`. `lint.yml` runs it on Linux and its `eval-digest-windows` job on Windows, so
the sweep's output has to be byte-identical on both.

## The reviewer eval

Each case is a change a reviewer must judge. An absence case leaves out something the change
must bring, and the reviewer must answer BLOCK and name the missing rows of its "WHAT MUST
ACCOMPANY IT" table. Its control twin is the complete change, and the reviewer must answer
PASS. Every kind of change the corpus covers (a table, a function, an Edge Function, a web
page, a screen) has both, so a reviewer that always answers PASS, or always BLOCK, scores at
most half.

- **Files** in [../fixtures/reviewer-eval/](../fixtures/reviewer-eval/): one folder per case,
  with `case.json` and an `overlay/` of files stored as `*.txt`.
- **Status.** [reviewer-eval.test.mjs](../gates/reviewer-eval.test.mjs) checks the corpus and
  the scoring in CI, without a model. Recording replies spends model calls and needs
  credentials, so only a maintainer runs it, by hand; no replies or scores are committed. The
  eval gates nothing.
- **Run** `node scripts/reviewer-eval.mjs --check` to check the corpus offline, `--score <dir>`
  to score recorded replies, and `--live <dir>` to record them with Claude Code (model calls;
  a maintainer's machine only).

## Running the tests here

After a root `pnpm install`, because the sweep reads TypeScript through the root's
`typescript` (without it the parser cases skip by name):

```sh
GITHUB_BASE_REF=main CI=true HARNESS_TEST_REQUIRE_TYPESCRIPT=1 node --test "tests/evals/*.test.mjs"
```

## What these evals do not measure

They measure a detector and the reviewers, not whether the harness changes what an agent
ships. That outcome evaluation, a pre-registered comparison with and without the harness, is
open: [issue #170](https://github.com/cogvera-labs/next-expo-supabase-agent-harness/issues/170).
