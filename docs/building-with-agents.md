# Building with agents

AI coding agents write most changes here; a human maintainer reviews, merges, releases and answers for them, and the same gates judge both.

This page says how that works: the figures, pinned to a release so anyone can recompute
them; who does what; the guards the maintainers' own sessions run under; one change followed
from the alarm that prompted it to its merge; the defects the gates and CI lanes caught; and
what none of this proves. [Verify the claims yourself](evidence.md) has the commands for the
rest of the repository's claims.

## The facts at v2.0.8

Each figure is pinned to the `v2.0.8` tag (`3902a3b`, 2026-11-11).

| Figure at v2.0.8 | What it means |
|---|---|
| 804 of 846 commits carry the trailer; so do 583 of the 595 non-merge commits | The trailer is `Co-Authored-By`, naming a Claude model. The non-merge commits without one are release squashes up to 1.0, git's own revert messages, Renovate updates and one outside contribution; the last command below lists them. |
| 609 commits name Claude as author | Most of the rest name a person as author and carry the trailer as well: the author field records whose git identity made the commit, and the trailer records that Claude Code took part. |
| 660 commits carry a `Claude-Session` link | The link names the session that produced the commit ([what that means](#what-the-commit-trailers-mean)). |
| 30 release tags, v0.1.3 to v2.0.8 | One per release this lineage tagged; the ancestor's versions, up to 0.1.2, have none. |
| `e552d6e` adds 511 files: it imports the ancestor harness | The first commit, on 2026-07-22, imports the harness this one was forked from. The [CHANGELOG](../CHANGELOG.md)'s lineage note says so, and the oldest changelog entries are the ancestor's. |
| Up to v1.0.0: 72 entries, one of them a pull request | Before 1.0, changes reached `main` as direct commits, including whole releases squashed into one, so the per-change trail is coarse there. |
| v1.0.0 to v2.0.8: 108 entries, 73 merges and 35 squashes | Since 1.0, every change reached `main` through a pull request. |

To reproduce each figure, run these in a clone that has the tags:

```sh
git rev-list --count v2.0.8   # 846
git rev-list --no-merges --count v2.0.8   # 595
git log v2.0.8 --format='%(trailers:key=Co-Authored-By,valueonly,separator=%x2C)' | grep -c Claude   # 804
git log --no-merges v2.0.8 --format='%(trailers:key=Co-Authored-By,valueonly,separator=%x2C)' | grep -c Claude   # 583
git log v2.0.8 --format=%an | grep -c '^Claude$'   # 609
git log v2.0.8 --format='%(trailers:key=Claude-Session,valueonly,separator=%x2C)' | grep -c 'claude.ai/code/session_'   # 660
git tag --merged v2.0.8 | grep -c '^v'   # 30
git show --shortstat --format= e552d6e   # 511 files changed, 67933 insertions(+)
git rev-list --first-parent --count v1.0.0   # 72
git log --first-parent --format=%s v1.0.0 | grep -cE '^Merge pull request #|\(#[0-9]+\)$'   # 1
git rev-list --first-parent --count v1.0.0..v2.0.8   # 108
git log --first-parent --merges --format=%s v1.0.0..v2.0.8 | grep -c '^Merge pull request #'   # 73
git log --first-parent --no-merges --format=%s v1.0.0..v2.0.8 | grep -cE '\(#[0-9]+\)$'   # 35
```

To list the non-merge commits that carry no trailer:

```sh
git log --no-merges v2.0.8 --format='%(trailers:key=Co-Authored-By,valueonly,separator=%x2C)%x09%h %s' | awk -F'\t' '$1 !~ /Claude/ {print $2}'
```

## Who does what

| Who | What they do |
|---|---|
| **Agents** (Claude Code sessions) | Write most changes: code, tests, docs, commit messages, and pull-request descriptions with pasted command output. They work on branches, under the guards described below. |
| **The maintainer** | Decides what is worth doing; reads and merges pull requests; makes the calls an agent is not trusted to make alone, such as a reviewed row for a new dependency or a change to the enforcement surface; cuts each release by pushing its tag; and answers for every change, whoever typed it. Holds repository administration and receives security reports ([GOVERNANCE.md](../GOVERNANCE.md)). |
| **The collaborator** | Holds write access and may merge a pull request that passes the required checks ([GOVERNANCE.md](../GOVERNANCE.md)). |
| **Renovate and outside contributors** | Dependency updates and outside pull requests, through the same checks. |
| **The gates and CI** | Judge every change the same way, whoever wrote it. The required checks on `main` apply to the maintainer's pull requests too: the ruleset on `main` names no bypass actor ([SECURITY.md](../SECURITY.md)). An administrator could still change the ruleset itself. |

Review here means the maintainer reading a pull request and deciding to merge it, with the
gates and CI as the judge of what they test. No rule requires a second person's approval;
[What is not established](evidence.md#what-is-not-established) has the command that counts
the approvals on record.

## The maintainers' own guards

Sessions that work on this repository run under its own Claude Code hooks, wired in
[.claude/settings.json](../.claude/settings.json). These are not the hooks a project
receives; those live in [template/base/.claude/](../template/base/.claude/). The settings
file's notes say these hooks block maintenance turns, and that this is the point: a turn
blocked here is one a project would have had blocked, and it happens on the machine of the
person who can fix the guard.

| Hook | Event | What it does |
|---|---|---|
| [pretool-bash-guard.mjs](../.claude/hooks/pretool-bash-guard.mjs) | Before a `Bash`, `Monitor` or `PowerShell` call | Re-exports the shipped [bash guard](../template/base/.claude/hooks/pretool-bash-guard.mjs) instead of copying it, so the maintainers run the bytes a project gets. Its command rules apply here: recursive forced deletes, force-pushes, hard resets, skipped commit hooks, reads of environment and credential files, bulk dependency updates, `knip --fix` and destructive raw SQL. Its rules about a project's paths mostly do not match, because those paths live under `template/base/` here. |
| [pretool-write-guard.mjs](../.claude/hooks/pretool-write-guard.mjs) | Before an `Edit`, `Write`, `MultiEdit` or `NotebookEdit` call | Denies edits to the factory's enforcement surface: [template/base/tools/](../template/base/tools/), [template/base/.claude/hooks/](../template/base/.claude/hooks/), [scripts/](../scripts/), [installer/](../installer/), [template/migrations.json](../template/migrations.json), [.github/workflows/](../.github/workflows/), [tests/canary/injections.json](../tests/canary/injections.json) and [.claude/](../.claude/). A person lifts it by starting the session with `HARNESS_ALLOW_SELF_EDIT=1`, the same human-in-the-loop escape a project has, so a change to the machinery is deliberate and shows in the pull request. |
| [stop-factory-gate.mjs](../.claude/hooks/stop-factory-gate.mjs) | When a turn ends | Runs the factory's own checks (hygiene, can-fail coverage, rule integrity, the claims check, the floor lockstep, the complexity ratchet and the rest of its `STEPS` list), then ESLint, tsc, knip, Biome over the shipped trees, and the `tests/gates` and `tests/hooks` suites in CI's shape. A failure sends the session back to work with every red step listed. The toolchain steps skip, and say so, when `node_modules` is absent. If Claude Code's block cap ends a turn while steps are red, the next turn that is otherwise green is held once, until it says what was left red. |
| [posttool-factory-check.mjs](../.claude/hooks/posttool-factory-check.mjs) | After an edit | Runs the shipped per-edit citation check on each edit under a template layer, translating the repository path to the path the file has in a project. |
| [session-start-cloud.sh](../.claude/hooks/session-start-cloud.sh) | When a session starts | In a cloud session only, fetches the full history and tags and installs the workspace, which the Stop gate's checks need. It always exits 0 and checks nothing. |

The same settings deny force-pushes, hard resets, `sudo`, and reads of environment files and
keys, and they switch off Claude Code's bypass-permissions mode.

What these guards leave out:

- The Stop gate does not run the installer suite, the full can-fail run (it runs the static
  closure) or the checks that need the network; CI runs those. It does not ask for the
  reviewer-agent verdicts that a project's Stop chain requires.
- The guards bind Claude Code sessions. A person, another tool, or a command spelled in a way
  the rules do not anticipate gets past them; CI and the pull request are the boundary.
- `HARNESS_ALLOW_SELF_EDIT=1` lifts the write guard for the whole session, not for one file.

## One change, end to end

[Pull request #279](https://github.com/cogvera-labs/next-expo-supabase-agent-harness/pull/279)
is a small, recent change, followed here from the alarm to the record.

1. **The alarm.** GHSA-g3hv-75wg-m249, published on 2026-10-30, covers every `minimatch`
   below 11.0.1. From 31 October the nightly OSV scan in `hygiene.yml` was red on the two
   vulnerable copies this repository's own dev tooling resolved through ESLint and its
   plugins. Nothing a project receives was involved.
2. **The session.** A Claude Code session wrote the fix on a branch: a pnpm override in the
   root [pnpm-workspace.yaml](../pnpm-workspace.yaml), the regenerated lockfile, reviewed
   rows in [scripts/sbom-additions.json](../scripts/sbom-additions.json) for the two
   packages the override brings in, a row in
   [scripts/obligations.json](../scripts/obligations.json) that says when the override
   goes, and the CHANGELOG entry.
3. **The pull request.** Opened on 2026-11-01, it follows the
   [pull request template](../.github/pull_request_template.md). It says what changed and
   why; what the maintainer had to decide (the two new SBOM rows, which the maintainer had
   approved with #278); and that nothing changes for an install. Under "Evidence" it pastes
   real output: the gate test suite, the factory checks, a frozen install that resolves one
   `minimatch`, an OSV query that finds no advisory on the branch and two on `main`, ESLint
   giving the same results on both, and a planted violation still going red. It names what
   it did not run.
4. **CI.** On the pull request's last commit, `0588973`, every job that runs on a pull
   request passed: the required checks, the scaffold builds, the canaries, every upgrade
   leg, and the installer's unit tests on Linux, Windows and macOS. The nightly-only jobs
   were skipped.
5. **The merge.** The maintainer squash-merged it on 2026-11-03 as `57a8d77`, which keeps
   the `Co-Authored-By` trailer. No review is recorded on the pull request: review was the
   maintainer reading it and deciding to merge, with CI as the judge of what it tests.
6. **The record.** The [CHANGELOG](../CHANGELOG.md)'s 2.0.6 entry describes the change, and
   the obligations row stays until the override can be removed.

```sh
git show --stat 57a8d77
gh api repos/cogvera-labs/next-expo-supabase-agent-harness/pulls/279 --jq '.body'
gh api 'repos/cogvera-labs/next-expo-supabase-agent-harness/commits/058897341b4bb2827b18eff58e1d21dede36bef1/check-runs?per_page=100' \
  --jq '.check_runs[] | "\(.conclusion) \(.name)"'
gh api repos/cogvera-labs/next-expo-supabase-agent-harness/pulls/279/reviews --jq 'length'    # 0
```

## What the gates and CI caught

Each CHANGELOG entry says how that release's defects were found. These are some that a gate
or a CI lane caught, and what each added. Entries for releases before 2.0.0 are in
[docs/changelog/1.x.md](changelog/1.x.md) and [docs/changelog/0.x.md](changelog/0.x.md);
2.x is in [CHANGELOG.md](../CHANGELOG.md).

| Release | What was caught | How it was found | What it added |
|---|---|---|---|
| 0.2.0 ([0.x](changelog/0.x.md)) | The shipped data layer's keyset pagination cited the right tutorial, but wrote its cursor as one `OR`, which PostgreSQL cannot use as an index range, so every page still scanned from the tenant's newest row. | A new query-plan probe against a large seeded table, not review. | The `query-shapes` gate reds a keyset query with no range predicate on its leading sort column. |
| 0.3.0 ([0.x](changelog/0.x.md)) | Three release-blocking defects no fresh scaffold could show: an update left the agent-surface lock describing old bytes, `docs-sync` failed an install over a step the harness itself had added, and `gate-integrity` read a newly planted register as a widening. | The new upgrade lane: install an older release, run `update`, run the chain. | `update` re-records only what it wrote, and the two gates classify those cases. The lane unsets `HARNESS_ALLOW_SELF_EDIT`, which it had inherited from the maintainer's shell, because a project does not hold that escape. |
| 0.6.0 ([0.x](changelog/0.x.md)) | A shipped gate script was one line over the formatter's width: invisible in a maintainer's turn, red on step one of every upgraded project. | The upgrade lane. | The factory Stop gate runs Biome over the shipped trees with the template's own configuration. |
| 0.6.0 ([0.x](changelog/0.x.md)) | Nine tests of one gate passed in every maintainer's shell and failed only on a pull request, where `GITHUB_BASE_REF` reached the gate and it failed closed. | CI on the release pull request. | Run the suites in CI's shape, `GITHUB_BASE_REF=main CI=true node --test …`, as [CONTRIBUTING.md](../CONTRIBUTING.md) and the pull request template now say. |
| 0.11.0 ([0.x](changelog/0.x.md)) | Two upgrade defects on the tagged commit, after every local check had passed: an escape that could not reach the installs it was written for, and withheld files with no reviewed sweep. | The upgrade lane on the tag. `release.yml` refused to publish, and v0.11.0 has no GitHub Release. | 0.11.1, the same day, whose entry says: "0.11.0 was tagged before it ran. That ordering was the mistake." |
| 1.0.2 ([1.x](changelog/1.x.md)) | `authenticated` kept the platform's default write privileges on seven tables it may only read. Row security still refused every client write, so a layer was missing, not a door open. | `bootstrap-linux` on the release pull request. A test that had passed since 0.2.0 went red on an unchanged tree once CI's local Supabase stack applied the platform's default privileges. | A migration that revokes everything and grants exactly `SELECT`, an [ADR](../template/base/docs/adr/20260920-authenticated-write-revoke.md), and an exact-privilege test. The [reviewer eval](../scripts/reviewer-eval.mjs) exists because review missed it. |
| 2.0.0 ([CHANGELOG](../CHANGELOG.md)) | The documented order after `eject`, validate and then commit, left trimmed registers uncommitted, which `gate-integrity` rightly reds. The local replay had `HARNESS_ALLOW_SELF_EDIT=1` in its environment, which skips that rule. | `demo-eject`, in CI on the release commit. | `eject`'s next steps, the upgrade runbook and the [CLI reference](cli.md) say commit, then validate; the lane commits and judges the deletions as a pull request would. |

## What the commit trailers mean

- **`Co-Authored-By: Claude <model> <noreply@anthropic.com>`** is added by Claude Code to a
  commit it wrote or helped write, and names the model. GitHub shows Claude as a co-author on
  the commit. The committing tool writes it, so it is a disclosure that an agent took part,
  not proof of how the change was made or checked.
- **`Claude-Session: https://claude.ai/code/session_…`** links the Claude Code session that
  produced the commit. The sessions belong to the maintainer's account and are private: a
  reader who follows the link cannot open it. It lets the maintainer return to the
  conversation behind a change. It is not a published transcript, and nothing on this page
  or in [Verify the claims yourself](evidence.md) depends on it.
- **"Generated with Claude Code"** at the end of a pull-request description marks a
  description an agent wrote.

## What this does not prove

- **That the code is correct or safe.** The gates prove what they test. The
  [security assurance case](security/assurance-case.md) lists what they do not cover, and
  says it has had no independent review.
- **That a second person read any change.** No rule requires it, and
  [SECURITY.md](../SECURITY.md) records that no change is approved by a second person.
- **That agents do better work with the harness than without it.** Nothing measures that
  yet ([#170](https://github.com/cogvera-labs/next-expo-supabase-agent-harness/issues/170)).
- **That the trailers are complete or accurate.** The tool that makes a commit writes them.
- **That nothing got through.** Two misses on the record:
  - The scaffold's `next` pin sat below two critical advisories from the vendor's security
    release on 2026-08-25 until 1.0.2 on 2026-09-21. Inside the floor's review window
    nothing prompted a re-read, and when the window lapsed the nightly reported it inside a
    run that had already been red every night for other reasons. In the 1.0.2 entry's
    words, "an alarm that is always on is not an alarm". 1.1.0 added the nightly
    `floor-advisories` lane, which compares the floor with published advisories
    ([docs/changelog/1.x.md](changelog/1.x.md)).
  - The Claude Code advisory snapshot that every project's scheduled `floor-review` job
    checks lapsed on 2026-09-29, so that job was red in every install from 2026-09-30. This
    repository's own nightly read the other registers but not that one, so nothing here
    noticed until 2.0.8 (2026-11-11), which re-took the snapshot and made the nightly read it
    ([CHANGELOG.md](../CHANGELOG.md), 2.0.8).

## Check it yourself

[Verify the claims yourself](evidence.md) gives a command, the output of a pass and the
can-fail proof for each claim, and lists what is not established. To see how the pieces
fit, read [Architecture](architecture.md).
