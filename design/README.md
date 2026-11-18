# design/

Design records for this repository: the facts the template and the gates were written
against, the contracts and proposals behind them, and the research that informed them.
"Design" here means engineering design, why the harness is built the way it is. The mobile
app's visual design rules ship as the
[designing-mobile-ui skill](../template/base/.claude/skills/designing-mobile-ui/SKILL.md).

Nothing here ships to a project, and nothing here is an instruction. Each file's opening lines
give its date and status, and a record describes what was true when it was checked, so
re-verify a fact before relying on it. Code cites a record with a `// SOURCE: design/…` line.

## Fact records

Facts read from primary sources, each dated and each saying when to re-verify it.

| Record | What it pins down |
|---|---|
| [CONTROL-PLANE-FACTS.md](CONTROL-PLANE-FACTS.md) | What Claude Code hands a hook and how it treats the hook's answer, probed in a real install where it could be |
| [EXPO-FACTS.md](EXPO-FACTS.md) | The Expo SDK, EAS and React Native facts behind the mobile template and its gates |
| [CI-LANE-FACTS.md](CI-LANE-FACTS.md) | What the device and end-to-end CI lanes depend on: Maestro and the Android emulator |
| [RELEASE-FACTS.md](RELEASE-FACTS.md) | What the modules' release and store workflows depend on: EAS Build and Submit |
| [CONFORMANCE-FACTS.md](CONFORMANCE-FACTS.md) | What the mapped standards, platform rules and deadlines say, and whether each row was shipped, targeted or cut. Not a legal opinion |

## Specs and proposals

| Record | Subject and status |
|---|---|
| [W1-STACK-SPEC.md](W1-STACK-SPEC.md) | The contract for the reference app in `template/stack/`: workspace layout, package names, exports and dependency directions |
| [FIELD-UPGRADES-2026-09.md](FIELD-UPGRADES-2026-09.md) | Upgrade proposals from a field report, each stated against this repository's code, with a dated table of where each was built. The roadmap's "Field-report upgrades" section links into it |
| [SINGLE-HOME-2026-10.md](SINGLE-HOME-2026-10.md) | A proposal, not a commitment: one home per fact and one meaning per concept. The duplication sweep and its [evals](../tests/evals/README.md) come from it |
| [PORT-SPEC.md](PORT-SPEC.md) | Historical: the port record of an ancestor harness. It does not describe this repository |

## Research

Research rounds, kept as written. Each says how it was done, and none commits the project to
anything.

| Folder or file | Subject |
|---|---|
| [research/20261118-discoverability-and-trust/](research/20261118-discoverability-and-trust/README.md) | Making the repository easier to understand, find and trust: the research, the plan it produced, and what the branch that followed changed |
| [research/20261002-distribution/](research/20261002-distribution/README.md) | Publishing to npm with trusted publishing, plugin distribution, and making the project easier to find, try and contribute to |
| [research/20261001-context-paradigm/](research/20261001-context-paradigm/README.md) | The research and design rounds behind SINGLE-HOME-2026-10.md |
| [research/20260813-harness-landscape.md](research/20260813-harness-landscape.md) | Other agent harnesses and what to take from them, with its data in [20260813-harness-landscape.json](research/20260813-harness-landscape.json) |
| [research/20260813-benchmark-options.md](research/20260813-benchmark-options.md) | Whether a public benchmark could measure this harness |
| [research/essential-eight-ml3-research.json](research/essential-eight-ml3-research.json) | The frozen research data behind the Essential Eight register in `template/base/tools/essential-eight.json` |

## Adding or changing a record

- Name a fact record `<TOPIC>-FACTS.md` and a proposal `<TOPIC>-<year>-<month>.md`, and put a
  research round in a dated `research/` folder with its own README. Date the record in its
  opening lines and state its status.
- [check-claims.mjs](../scripts/check-claims.mjs) reads every Markdown file here as
  present-tense prose, so a chain length, a compliance partition or a chain timing written
  here must be the current one. Leave history, such as old changelog entries, in the
  CHANGELOG.
- Some sentences in CONFORMANCE-FACTS.md and CONTROL-PLANE-FACTS.md are anchors that
  [check-obligations.mjs](../scripts/check-obligations.mjs) matches as raw text, so
  re-wrapping one breaks the check, and
  [work-plan-status.test.mjs](../tests/gates/work-plan-status.test.mjs) holds
  FIELD-UPGRADES-2026-09.md and the roadmap to each other.
- Shipped files and the roadmap cite records by path, so do not rename or move a record.
