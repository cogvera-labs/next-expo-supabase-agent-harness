# Understandability, discoverability and reputation research, 2026-11-18

The research behind the branch that makes this repository easier to understand, find and trust.
The maintainer asked how to make it best in class on three goals: **understandability**
(structure, pleasant to read, easy to navigate), **discoverability** (the people who want this
find it) and **reputational capital** (a visitor recognizes serious agentic-engineering
discipline). Claude Code agents did the research and the edits; the maintainer reviews, merges
and answers for them.

Internal facts refer to v2.0.8 (`3902a3b`), the head of `main`. External facts hold as of
2026-11-18.

## Method

1. **Research.** On 2026-11-17 and 2026-11-18, fourteen research agents answered one
   question each on competitors, vocabulary, search and listings, credibility, or the audience.
2. **Audit.** Seven audit agents read the repository at `3902a3b`, read-only, from navigability
   and prose to the scaffold and the history's evidence; an eighth diagnosed the red nightly CI.
3. **Plan.** The main session wrote one plan from those documents.
4. **Execution.** Ten agents, each owning a set of files, carried out the plan under shared rules
   (enforcement surface untouched, numbers recomputable or pinned to a tag, no compliance-level
   or hype claims); the integrator cherry-picks their commits onto one branch.

The source reports stayed in scratch space; these briefs condense them and keep their links.

## Limits

- **Search.** The shared web-search budget ran out, so Google rankings were not measured (GitHub
  and npm ranks were), and the baseline ran 21 of 25 planned web queries.
- **Unreachable hosts.** www.npmjs.com, api.npmjs.org, bestpractices.dev, api.scorecard.dev, the
  live docs site, Reddit, Hacker News and several vendor sites. Scorecard came from the
  repository's own workflow log and the docs site from a rebuild of the deployed commit; facts
  resting on search extracts are marked.
- **Re-runs.** A first wave of agents stopped on a usage limit and was re-run.
- **Worktrees.** The factory write guard resolves paths against the main checkout, so it refused
  every write in the agents' worktrees under `.claude/worktrees/` as `.claude/**`. The agents
  moved to scratch clones outside the project instead of working around it; the guard fix is a
  protected follow-up. With the worktrees present, untracked and unignored, hygiene's file sweep
  also failed with EISDIR on each worktree's directory entry, so this branch ignores
  `.claude/worktrees/` in `.gitignore` and `eslint.config.mjs`.
- **Disk.** The test suites leave `mkdtemp` directories behind in the OS temp folder (issue
  #276). With several agents running the suites at once, they filled the volume, about 30 GB
  in some 36,000 directories, and writes failed until the integrator removed the ones older than
  30 minutes. With agents in the loop, #276 is no longer cosmetic.
- **Drift.** Live figures are as of 2026-11-18; git counts are pinned to v2.0.8, with commands
  in [credibility.md](credibility.md).

## Key findings

**Understandability.**
- No entry point maps the repository: `template/` (901 of 1,668 tracked files) has no README, the
  shipped docs name code in code spans rather than links, and "floor" has four meanings.
- The prose has no slop (no emoji, none of 23 hype words in 15 documents); its problem is
  insider shorthand and history inside instructions.
- The docs site reads like an internal handbook: 35 of 50 titles exceed 60 characters, 44 of 50
  descriptions are cut mid-sentence, and there is no getting-started, CLI, FAQ or comparison page.
- The changelog is 687 KB; the roadmap still says "Next: 2.0.0".

**Discoverability.**
- 8 stars; 18 unique visitors in 14 days, 2 of them from Google.
- Absent from all 18 generic web queries; GitHub search misses it for "react native supabase
  starter", "template" and "boilerplate", words its name, description and topics lack.
- npm ranks it first for "next expo supabase", 63rd for "claude code hooks", and outside the top
  1,000 for "claude code".
- It is on no awesome list and not in the plugin directory.

**Reputational capital.**
- Unusual evidence: CI refuses a gate without a registered proof that it can fail; the guards
  check every command, write and MCP call against 151 guard-rule ids; CI runs a frozen floor;
  `update`, with `--rollback`, moves installs forward;
  [scripts/check-claims.mjs](../../../scripts/check-claims.mjs) recomputes the README's numbers.
  At v2.0.8, 804 of 846 commits carry a Claude co-author trailer, and since v1.0.0 every change
  to `main` arrived by pull request with 10 required checks.
- No other starter blocks its agent; no guard tool is stack-specific, tests row-level security
  against a real Postgres, or ships a CI floor.
- A skeptic can attack: no independent review (0 required approvals; 124 of 134 merged pull
  requests had no non-author review), red nightly CI, unmeasured outcomes (#170), comment walls,
  a single maintainer.
- **CI.** Scheduled `selftest` has been red since 2026-11-13 and `hygiene` since 2026-11-14: an
  Expo patch wave broke `maestro-smoke`, typescript-eslint 8.73.0 crashes `lint` in fresh
  scaffolds (this branch pins 8.72.2 in `1522083`), and two `astro` advisories await Renovate
  #300.

## Decisions

- **Positioning.** A Claude Code harness plus an upgradeable Next.js + Expo + Supabase starter;
  "harness engineering" names the discipline, and "agent harness", usually a runtime, is paired
  with "Claude Code".
- **One description everywhere:** "A Next.js + Expo (React Native) monorepo starter on Supabase
  with a Claude Code harness: hooks that send the agent back to work while a quality gate
  fails." Thesis, unchanged: "Quality is a deterministic gate, not a request."
- **No renames.** Moving `design/` touches 197 lines in 73 files; renaming `scripts/` touches
  1,147 lines in 287 files. Maps, indexes and folder READMEs navigate instead.
- **Evidence by command.** Every public claim gets a command, limits sit next to claims, and AI
  authorship is disclosed with who reviews and who answers.
- **The enforcement surface waits for a human-approved session.** Hooks, gate scripts,
  `scripts/`, the installer and workflows are write-protected for agents on purpose.

## Files

| File | Subject |
|---|---|
| [landscape.md](landscape.md) | Starters, harness tools, the gap, vocabulary |
| [discoverability.md](discoverability.md) | Search, listings, launch channels, the baseline |
| [credibility.md](credibility.md) | What persuades skeptics, credentials, evidence, the critic's list, user questions |
| [repository-audit.md](repository-audit.md) | Audit findings this branch does not execute |

## Plan and status

The integrator fills in Status.

| ID | Workstream executed in this branch | Status |
|---|---|---|
| E1 | README rewrite | done |
| E2 | Docs site as a front door | done |
| E3 | User pages under `docs/`: getting started, how it works, FAQ, comparison, glossary | done |
| E4 | Evidence, building-with-agents, architecture, CLI and index pages under `docs/` | done |
| E5 | Navigation: root `AGENTS.md` and `CLAUDE.md`, folder READMEs, `.gitattributes` | done |
| E6 | Community and trust files, PR template, issue chooser | done |
| E7 | Package and plugin metadata | done; the integrator narrowed the CITATION abstract to "building blocks for end-to-end encryption" |
| E8 | Accuracy and links in shipped docs and agent instructions | done; the ambiguous items it left are in [repository-audit.md](repository-audit.md) |
| E9 | Changelog archive | done; 2.x stays in `CHANGELOG.md`, 0.x and 1.x moved verbatim to `docs/changelog/` |
| E10 | This research record | done |

| # | Maintainer action, in order | Status |
|---|---|---|
| 1 | Nightly lanes: save the maestro-smoke artifact before 2026-11-20 12:21 UTC and pin the culprit; merge #300, then #283; re-run corpus-fidelity; cut 2.0.9, as published scaffolds still crash `lint`; legs A and E wait on upstream or the protected lane; calendar reds 2026-12-01 and 12-09 | in part: this branch pins typescript-eslint 8.72.2 in the seeded catalog; the rest is pending |
| 2 | About set to the shared description; the 20 topics; the repository pinned on the org profile | pending |
| 3 | npm: a release after this branch (new README on npm, changelog entries); deprecate below 2.0.8, `0.0.0-stage` included; a second maintainer with 2FA | pending |
| 4 | Verify the docs site in Search Console and Bing, with the sitemap; consider an org root site or custom domain | pending |
| 5 | After the example: awesome-claude-code by its web form; harness-engineering lists, affiliation disclosed; the plugin directory; Context7; a claudepluginhub re-index | pending |
| 6 | Example project (#164): deployed web app, screenshots of both apps, its CI, a public `update` pull request | pending |
| 7 | Real review, then required approval with last-push approval; a second admin; Best Practices "passing"; immutable releases; REUSE; a Zenodo DOI; an outside reading of the assurance case | pending |
| 8 | Pre-register and run the #170 with/without pilot; publish either way | pending |
| 9 | Launch late January 2027: a write-up in the maintainer's words, Show HN, then communities and newsletters; skip r/programming and r/opensource | pending |

| # | Follow-up for a human-approved session (protected paths) | Status |
|---|---|---|
| 1 | READMEs for `installer/`, `scripts/`, `.claude/` | pending |
| 2 | `check-claims` extended to `docs/**` and the site, computing the trailer count and can-fail-proof figures; its vacuous README-versus-CHANGELOG timing comparison fixed | pending |
| 3 | `pages.yml` builds pull requests touching `docs/**`; `docs-build` required | pending |
| 4 | The ten stale comments and 32 "(2.1.0, …)" labels fixed; history moved to the CHANGELOG | pending |
| 5 | `init()`, `update()`, `doctor()` split into named phases | pending |
| 6 | `init` detects a local `npm i`; the scaffold gets a root README; the service-role warrant accepts `YYYYMMDD-slug.md` ADRs | pending |
| 7 | Descriptive release titles (`release.yml`) | pending |
| 8 | Decide `argument-hint` and the Agent Skills standard (`scripts/lib/plugin-folder.mjs`) | pending |
| 9 | The write guard judges each path against its own checkout (found during execution; see Limits) | pending |

Earlier records: [20261002-distribution](../20261002-distribution/README.md) and
[20260813-harness-landscape.md](../20260813-harness-landscape.md).
