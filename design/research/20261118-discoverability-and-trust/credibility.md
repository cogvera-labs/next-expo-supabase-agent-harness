# Credibility, as of 2026-11-18

Condensed from research reports 09 (what persuades skeptical engineers), 10 (trust credentials)
and 12 (audience questions), and from audit a7 (the evidence in this repository's history).
Internal figures are at v2.0.8 (`3902a3b`). bestpractices.dev, api.scorecard.dev and
api.npmjs.org were unreachable; the Scorecard result was read from the repository's own workflow
log. *(s)* marks a fact taken from a search summary and not checked against the primary page.

## What persuades skeptical engineers

- **Maintainers reject unaccountable AI, not AI.** The permissive policies ask for disclosure and
  for a human who understands the change and answers for it:
  [curl](https://github.com/curl/curl/blob/master/docs/CONTRIBUTE.md);
  [Ghostty](https://github.com/ghostty-org/ghostty/blob/main/AI_POLICY.md), "All AI usage in any
  form must be disclosed";
  [LLVM](https://github.com/llvm/llvm-project/blob/main/llvm/docs/AIToolPolicy.md), where the
  contributor "is always the author and is fully accountable"; the
  [Linux kernel](https://github.com/torvalds/linux/blob/master/Documentation/process/generated-content.rst),
  "Indicate what could not be done"; the
  [ASF](https://github.com/apache/www-site/blob/main/content/legal/generative-tooling.md).
  Gentoo, NetBSD, QEMU and Zig restrict or ban it *(s)*.
- **Trust follows verifiability.** In Stack Overflow's 2026 survey the largest group trusts AI
  output when checking it is cheap *(s)*. Make checking cheap rather than asserting quality.
- **Claims that outran the evidence hurt well-known agent-built projects:** a compiler README
  example that did not compile *(s)*; a claim of line-by-line review beside a history without
  review artifacts *(s)*; functional test parity read as if it covered security, answered by
  [validated security findings](https://hacktron.ai/blog/hacking-cloudflare-vinext) *(s)*.
- **"The tests pass" is weak evidence.** [ImpossibleBench](https://arxiv.org/abs/2510.20270)
  showed models passing tests that contradict the spec *(s)*, and Anthropic names "Claude's
  tendency to mark a feature as complete without proper testing"
  ([post](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)). A
  proof that each check can fail, and that agents cannot weaken it, is the counter-signal
  experienced engineers recognize.
- **Prose is evidence too.** curl: "if someone can spot that the contribution was made with the
  help of AI, you have more work to do."

**Counter-signals, strongest first:** cheap verification of every claim; visible human
accountability (Scorecard: reviews by AI bots "do not count as code review",
[checks.md](https://github.com/ossf/scorecard/blob/main/docs/checks.md#code-review)); proof that
checks can fail; specific limits; disclosure in the record; small changes; a public failure ledger
with the mechanism that stops repeats; independent scrutiny. The `Co-Authored-By: Claude …`
trailer already used here fits the ASF guidance; keep it and document what it means.

## Trust credentials

**OpenSSF Scorecard 8.4** (v5.3.0, 2026-11-16, on `3902a3b`):

| Check | Score | What would move it |
|---|---|---|
| Code-Review | 0 ("0/11 approved changesets") | Approval by someone other than the author; AI reviews do not count |
| Branch-Protection | 4 | 1 required approval with last-push approval reaches 8 |
| CII-Best-Practices | 2 ("InProgress") | "Passing" scores 5 |
| Vulnerabilities | 8 | Two `astro` advisories in `docs-site/`; Renovate #300 fixes both |
| Contributors | 6 | Grows only with outside contributors |
| 13 other checks | 10 | |

Projected aggregate, cumulatively: 8.6 after #300; 8.9 with a required approval and last-push
approval; 9.6 if every change is genuinely reviewed.

- **OpenSSF Best Practices:** metal level "in progress"; the Baseline level 1 the repository
  claims could not be re-read. Silver needs access continuity, which one administrator cannot
  show.
- **SLSA:** attestation inside the building workflow supports Build L2, not L3
  ([GitHub Docs](https://docs.github.com/en/actions/concepts/security/artifact-attestations)).
  Say so in prose with the basis, not as a badge.
- **Off today:** immutable releases, DCO sign-off, signed tags; v2.0.8 ships no SBOM. `reuse lint`
  6.3.0 passes.
- **Badges.** Of 25 well-known npm tools read, 13 show 0 to 3 badges. Recommended row: npm
  version, Scorecard, Best Practices Baseline, then REUSE once registered; a CI badge only after a
  run of green nights. No stars, downloads, coverage percentages or "made with Claude". A badge
  that turns red costs more than no badge.

## The repository's own evidence

| Fact at v2.0.8 | Value |
|---|---|
| Commits with a Claude co-author trailer | 804 of 846 |
| Non-merge commits with it | 583 of 595 |
| Changes on `main`'s first-parent line since v1.0.0 that arrived by pull request | 108 of 108 (73 merges, 35 squashes) |
| Required status checks on `main`, and required approvals | 10, and 0 |
| Guard-rule ids, each with its own deny or allow test | 151 |
| Complexity ratchet total; `init()` | 502 at the fork commit, 453 now; 130 to 117 |
| npm versions with SLSA provenance | 2.0.0 to 2.0.8 |

```sh
git rev-list --count v2.0.8
git log v2.0.8 --format='%(trailers:key=Co-Authored-By,valueonly,separator=%x2C)' | grep -c Claude
git log v2.0.8 --no-merges --format='%(trailers:key=Co-Authored-By,valueonly,separator=%x2C)' | grep -c Claude
git log --first-parent --merges --format=%s v1.0.0..v2.0.8 | grep -c '^Merge pull request #'
git log --first-parent --no-merges --format=%s v1.0.0..v2.0.8 | grep -cE '\(#[0-9]+\)$'
node scripts/check-canary-coverage.mjs --no-spawn
git show e552d6e:scripts/complexity-ratchet.json | jq '[.functions[]]|add'
git show v2.0.8:scripts/complexity-ratchet.json | jq '[.functions[]]|add'
```

**Stories a reader can check in the CHANGELOG:** a CI lane, not review, found a missing write
revoke in 1.0.2; a keyset-pagination bug was measured on 1.1 million rows in 0.2.0, and the
`query-shapes` gate now fails its shape; since 0.2.0 this repository runs the shipped bash guard
on its own sessions; the first audit of its own control plane found three live bypasses (0.6.0);
it said in public that its nightly alarm was broken ("an alarm that is always on is not an
alarm"); its release pipeline refused `v0.11.0`, and 0.11.1 shipped the same day; five releases
carry "Corrections to the record", and old entries are never rewritten.

## The critic's list

| Criticism | Facts | Honest response |
|---|---|---|
| Bus factor of one | "There is no named successor today" ([GOVERNANCE.md](../../../GOVERNANCE.md)); one account merged 133 of 134 merged PRs | Say it first; point to what survives (the licences, the fork guide, releases that need no secret); add a second administrator |
| No review | 124 of 134 merged PRs had no non-author review; the collaborator has no review on record | Say that review here means gates, required CI and the maintainer's merge; lead with what the gates caught; get real review |
| A 687 KB changelog | 1.1.0 alone exceeded GitHub's release-body limit, so `v1.1.0` has no Release | Keep the audit trail; add short summaries and an archive |
| Comment walls | 31 to 45% of machinery lines are comments; 1,270 cite versions or issues | Keep the why, move the history ([repository-audit.md](repository-audit.md)) |
| Unverified claims | No outcome measured (#170); evals built, no results committed | "Built, not yet run"; no outcome claim before one is recorded |
| "Green out of the box"? | The nightly fresh-scaffold job failed `lint` on 2026-11-17 | This branch pins typescript-eslint 8.72.2 (`1522083`); show nightly status; fix forward |
| Real users? | 8 stars; every human-filed issue is the maintainer's | Say "early-stage"; invite field reports |
| History shape | 64% of commits fall on four days; pre-1.0 releases were squashed | Explain the stacked work plan |
| Self-assessment | The [assurance case](../../../docs/security/assurance-case.md) "has had no independent review" | Keep the admissions prominent; get one outside reading |
| Self-attested trailers | Session links may be private | Present trailers as disclosure; proof is what CI recomputes |

## What users ask

Title-keyword counts over 107,467 `anthropics/claude-code` issues (2025-01-01 to 2026-11-18;
matches overlap, so read them as orders of magnitude): "fabricated" 199, "destructive" 217,
"ignores instructions" 235, "stop hook" 350. Reddit and Stack Overflow were unreachable, so
their sentiment is secondhand.

| Theme | In their words | What answers it |
|---|---|---|
| "Done" while tests fail | "repeatedly fabricated test suite results, reporting ALL PASSED" ([#46940](https://github.com/anthropics/claude-code/issues/46940)) | The Stop hook runs the checks itself |
| Tampering | "Inserting this into hundreds of files to try and get around the ESLint max lines function" ([#12326](https://github.com/anthropics/claude-code/issues/12326)) | `test-quality`, `suppressions`, diff coverage, the mutation lane |
| `CLAUDE.md` ignored | instructions "are fundamentally advisory" ([#14417](https://github.com/anthropics/claude-code/issues/14417)) | Hooks, gates and CI enforce; rules are context |
| Destructive commands | `git reset --hard` "on session startup — TWICE" ([#34327](https://github.com/anthropics/claude-code/issues/34327)) | The bash guard, a tripwire rather than a sandbox |
| Secrets | reads `.env` "then hardcodes them" ([#24185](https://github.com/anthropics/claude-code/issues/24185)) | `.env` denies, the `secrets` gate |
| Hook gaps | hooks "are not enforced when subagents spawned via the Task tool make their own tool calls" ([#21460](https://github.com/anthropics/claude-code/issues/21460)) | Not yet documented |
| RLS returns 403 | "RLS Policy Violation (403 Forbidden) Despite Correct User ID and Permissions" ([supabase#35153](https://github.com/supabase/supabase/issues/35153)) | Grants before policies, asserted by pgTAP |
| Updating a starter | "stuck on the version you created on" ([create-t3-app#1353](https://github.com/t3-oss/create-t3-app/issues/1353)) | `update`, `--dry-run`, `--rollback` |

**Gaps found:** no FAQ; no page names Cursor, Codex or Copilot; no guidance on guard false
positives; nothing on Claude Code's subagent and auto-mode hook coverage; no Metro and pnpm
troubleshooting. There is no SOC 2 mapping, and nothing here claims SOC 2 status. During this
research the guards denied three harmless commands (a search whose text contained `rm -rf`,
another containing `.env`, and an inline interpreter), with clear deny messages: good FAQ
material.
