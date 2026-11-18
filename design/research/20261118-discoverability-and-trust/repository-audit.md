# Repository audit follow-ups, as of 2026-11-18

Audits a1 to a7 read the repository at `3902a3b` (v2.0.8) on 2026-11-18, read-only; a8 diagnosed
the red nightly CI. This list holds their findings that no workstream in this branch executes
([README.md](README.md) lists the workstreams). Where a workstream covers part of a finding, only
the rest is listed. Line numbers are at `3902a3b`.

Classes: **seeded** files change only for new installs (existing installs need a note in the
upgrade runbook); **owned** files reach installs through `update` and need
`node scripts/generate-released-shas.mjs --current`; **protected** paths need a human-approved
session (`HARNESS_ALLOW_SELF_EDIT=1`); **new shipped file** needs a record in the protected
`template/migrations.json`.

## 1. Engineering fixes in the scaffold (a6)

| # | Finding | Where | Class |
|---|---|---|---|
| S1 | The service-role warrant regex rejects every ADR name the `/adr` command writes (`YYYYMMDD-slug.md`) and accepts `0000-adr-template.md`; its test uses an off-convention path | [`service-role.ts`](../../../template/stack/packages/platform/supabase/src/service-role.ts) lines 27, 90-91, 145; `service-role.test.ts:13-15`; messages in `template/base/tools/check-migrations.mjs:220,240,254` | seeded; the messages are protected |
| S2 | The only Edge Function builds its elevated client with plain `createClient`; the factory has no production call site, yet the instructions call it the way to reach `service_role` | `template/stack/supabase/functions/delete-account/index.ts:16,24` | seeded |
| S3 | One fact, stated differently: three transport throws called one or two; "never add a `./client` subpath" for a package that ships one; per-user tenancy; `NNNN` ADR names; missing paths | `template/stack/packages/api/AGENTS.md:6,22-24,34-36`; `template/stack/packages/platform/supabase/AGENTS.md:38,46-48`; `template/stack/packages/platform/errors/src/index.ts:30-34`; `template/stack/packages/api/src/trpc.ts:164`; `template/stack/supabase/AGENTS.md:20-21,47-50`; `template/base/PARITY.md:15-16`; `template/base/github/CODEOWNERS:27`; `template/base/specs/_template.md:34`. E8 covers the files under `template/base/.claude/` and `template/base/docs/` | seeded |
| S4 | `@app/design-system-native` is imported by nothing, apps/mobile duplicates its components, and coverage excuses it with a control that does not apply | `template/stack/packages/design-system-native/src/index.ts:1-35`; `template/base/vitest.config.ts:122-136` | seeded to document; adopting or dropping it touches protected `tools/` |
| S5 | Small checkable errors: an RFC 5321 comment where 320 is "of" 256; an orphaned JSDoc; a misplaced JSDoc; a duplicated comment; two `getVerifiedUser` with different signatures | `template/stack/packages/contracts/src/index.ts:26-28,160-165`; `template/stack/apps/web/app/actions/orgs.ts:28-40,63-65,111-113`; `template/stack/apps/web/lib/supabase/server.ts:98` | seeded |
| S6 | 48 `SOURCE:` citations of harness-only `design/*.md` files, absent from every scaffold | 26 in seeded and owned files; 22 in `template/base/tools/**` and `template/base/.claude/hooks/**` | seeded, owned, protected |
| S7 | Seeded code narrates the harness's history ("used to", "the inherited shell", 38 version-tagged lines); a fresh project ships 13 migrations, corrections included | `template/stack/apps/web/app/api/trpc/[trpc]/route.ts:71-80`; `template/stack/apps/mobile/app/_layout.tsx:30-37`; `template/stack/supabase/migrations/20260920000000_authenticated_write_revoke.sql:27-34` | seeded; a squashed baseline for fresh installs is protected |
| S8 | No README in the generated repository; apps/web and apps/mobile have no README and no `description` | a seeded `template/base/README.md.tmpl` with a `SEEDED_FILES` entry in `installer/lib/layout.mjs`; `template/stack/apps/{web,mobile}/package.json.tmpl` | new shipped file; protected |
| S9 | Nested `AGENTS.md` files never load in Claude Code's default mode, because a root `CLAUDE.md` exists (report 13) | a sibling `CLAUDE.md` (`@AGENTS.md`) in `supabase/`, `packages/api/` and `packages/platform/supabase/` | new shipped files |
| S10 | First run omits `cp .env.example .env`, starting the apps, and replacing `@your-github-owner` in 18 files | `init`'s next steps in `installer/commands/init.mjs` | protected |
| S11 | A default `init` plants no example, yet instructions point at demo-only paths | `template/stack/supabase/AGENTS.md:7,33`, or a product decision to make the demo the default; E8 covers the shipped instruction files | seeded; the installer change is protected |

## 2. Red nightly CI (a8)

This branch already pins `typescript-eslint: 8.72.2` in the seeded catalog (`1522083`), which a8
expects to turn the eight fresh-scaffold `lint` jobs green. The rest:

| # | Finding | Fix | Class |
|---|---|---|---|
| C1 | Upgrade legs A and E stay red despite the pin, because `update` never writes `pnpm-workspace.yaml` | A fixed upstream release; the pin applied in `scripts/ci/upgrade-lane.sh`; or a version-guarded override in `template/base/eslint.config.mjs` with `scripts/rule-integrity.json` re-recorded | protected |
| C2 | `maestro-smoke` fails its RTL journey after the Expo patch wave of 2026-11-12: the seeded `ar-XB` locale is not read; the culprit is unproven | Download artifact 14035497167 (run 43418168911) before 2026-11-20 12:21 UTC; bisect with `workflow_dispatch` on a branch pinning the 2026-11-12 wave; pin the culprit | seeded; the device-lane scripts are protected |
| C3 | Two `astro` advisories in `docs-site/pnpm-lock.yaml` red the OSV scan | Merge Renovate #300, then #283 | maintainer |
| C4 | `corpus-fidelity` fails on one `www.postgresql.org` page a day: an intermittent fetch, not a dead link | Re-run; if it recurs, fetch per host with a retry and print `e.cause` in `scripts/check-corpus-fidelity.mjs` | protected |
| C5 | Published 2.0.8 scaffolds still fail `pnpm validate` on `lint` | 2.0.9: the hook version stamps, `VINTAGES` in `scripts/lib/ramp-sites.mjs`, a `template/migrations.json` record | protected |

## 3. Enforcement surface, beyond the README's protected-path list

- Found during execution: the factory write guard resolves paths against `CLAUDE_PROJECT_DIR`, so
  every file in a worktree under `.claude/worktrees/` reads as `.claude/**` and is refused
  (`.claude/hooks/pretool-write-guard.mjs`). The execution agents moved to scratch clones outside
  the project. Resolving each path against its own git top level would make worktrees writable
  and keep their `.claude/` protected.
- The same guard's header lists six surfaces while its table protects more
  (`.claude/hooks/pretool-write-guard.mjs:12-22`; a1).
- The factory Stop hook's timeout (`.claude/settings.json:49`) can be reached on a small machine,
  where the hook's own steps come close to it (a4).
- The protected-path pattern has no left anchor and matched a scratch folder named `tools/`
  (`template/base/.claude/hooks/lib/guard-rules.mjs:25`; a5). The settings accept such false
  positives on purpose; weigh before changing.
- A generated gate index (step, script, test, can-fail proof, catalog anchor) with a `--check`
  mode (a1).
- A selftest that renders a default scaffold and fails on any instruction path or `SOURCE:`
  citation absent from it (a6).
- Unit red-proofs for `docs-site/src/harness-docs/corpus.mjs` and `site-index.mjs`, and
  `release.yml` waiting for `pages.yml` (a3).
- A check that the headline in `README.md`, `package.json`, the docs home and
  `docs/media/social-preview.svg` agree (a3).
- The factory's own Stop gate does not require the reviewer-agent verdicts that a consumer's Stop
  chain requires (`.claude/hooks/stop-factory-gate.mjs`; a7); running `torvalds-reviewer` and
  `citation-verifier` on this repository's pull requests would close that.
- `tests/gates/` split by subject and `RULE_CANARIES` moved into a data module; both edit
  `tests/canary/injections.json` or `scripts/check-canary-coverage.mjs` (a5).

## 4. Comment style (a5)

CONTRIBUTING gains a comment style in this branch (E6); applying it to the code is protected work.

- **Ten comments contradict the code**, for example a ramp described as live that 0.4.0 deleted
  (`template/base/tools/harness.config.mjs:118`), "only two" roles beside a list of six and the
  wrong SQLSTATE (`template/base/tools/check-tenancy.mjs:746,863`), a header naming three of seven
  sweeps (`scripts/hygiene.mjs:2-9`), and a walker said to match one that behaves differently
  (`installer/lib/fs-walk.mjs:3-5`).
- **32 comment lines date work to 2.1.0** that the CHANGELOG records in 2.0.3 and 2.0.4 (for
  example `template/base/tools/lib/gate.mjs:196`).
- **Headers ordered by release** in `subagent-verdict.mjs`, `check-reviewer-verdicts.mjs` and
  `stop-validate-gate.mjs`; rewrite the ten longest to at most 12 lines each (what it decides,
  reads and writes, its outcomes, where the long form lives).
- `harness.config.mjs` explains its one-line injection rule six times, with 3.43 comment lines per
  code line; about 50 places use internal IDs nothing defines (`G16`, `W5b`, `plan v2 §11 A`).
- Unprotected: give the moved rationale a home in
  `template/base/docs/harness/gates-catalog.md`; shared test helpers in `tests/helpers/`; release
  labels out of 245 test names.

## 5. Complexity and structure (a5)

- [`scripts/complexity-ratchet.json`](../../../scripts/complexity-ratchet.json) holds 12 functions
  over the limit of 15 the harness enforces on users: `init` 117, `update` 59, `doctor` 54,
  `enable` 44. Splitting them into named phases (plan, merge, write, record, report) also removes
  the one-element `.filter(() => …)` arrays in `installer/commands/init.mjs:357-371`, written so
  the score would not grow.
- 80 scripts keep most of their code at module scope, which neither ESLint's complexity rule nor
  the ratchet measures (`check-docs-sync.mjs` has 740 such lines). Move the logic into pure
  judgement modules with thin runners, the repository's own pattern
  (`scripts/lib/ramp-verdict.mjs` with `scripts/ci/ramp-verdict.mjs`).
- The factory typechecks with `strict: false` (`tsconfig.json`); users get `strictTypeChecked`.

## 6. Behaviour changes, to plan as release items (a5)

- Retire the 73 expired ramps through the ramp ledger.
- Use the configured names instead of the hard-coded `'app_audit_writer'` and `actor_id`
  (`check-tenancy.mjs:1115,1274`).
- Agree one behaviour for the two `walkFiles`.
- Gate messages: the finding on one line, the rationale on the next; no release history in the
  `chmod` deny (`guard-rules.mjs:182`). Tests match message text.
- Replace nine hand-written `parseArgs` with `node:util`'s.

## 7. Documents outside this branch's plan (a1, a2, a6)

- Restructure the doctrine (`template/base/docs/harness/README.md`): thesis and limits first,
  present tense, history last, every anchor kept. E8 adds only a "Start here" map and the tenancy
  fix.
- Rewrite `ROADMAP.md` under 1,000 words; `tests/gates/work-plan-status.test.mjs` pins its
  structure.
- CHANGELOG: an `## [Unreleased]` section and a three-line "who must act" summary per release.
- `docs/cli.md`: lead each command with its common case.
- Move CONTRIBUTING's release procedure to a `docs/releasing.md`.
- One home for the security invariants, stated twice in always-loaded context
  (`template/base/AGENTS.md:109-201` and `template/base/.claude/rules/security-invariants.md`),
  and less all-caps emphasis.
- Map `template/base/tools/` (126 flat entries) in the doctrine rather than moving files.
- Mark `tests/evals/b/fixture/**` vendored in `.gitattributes`; its 271 files count as source
  today.
- Optional: rename `torvalds-reviewer` (triggers, ledger, `agents.lock`); drop the "honest"
  self-labels.
