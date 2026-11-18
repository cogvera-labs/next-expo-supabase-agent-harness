# The landscape and its vocabulary, as of 2026-11-18

Condensed from research reports 01 (starters), 02 (harness and guard tools) and 03 (vocabulary
and demand). Star counts come from the GitHub REST search API on 2026-11-18. Vendor sites were
blocked, so claims from search extracts are marked *(extract)*; they are vendor self-reports. The
web-search budget ran out, so no search-volume figure appears here.
[20260813-harness-landscape.md](../20260813-harness-landscape.md) covers agent runtimes; this
brief covers what a visitor would compare this repository with.

## Starters

| Project | In its own words | Stars | Update path | Agent support |
|---|---|---|---|---|
| [create-t3-turbo](https://github.com/t3-oss/create-t3-turbo) | "Clean and simple starter repo using the T3 Stack along with Expo React Native" | 6,114 | none | none |
| [Solito](https://github.com/nandorojo/solito) | "React Native + Next.js, unified." | 4,092 | none | none |
| [next-forge](https://github.com/vercel/next-forge) | "Production-grade Turborepo template for Next.js apps." | 7,788 | `update`, then a manual merge | a skill, `llms.txt` |
| [Open SaaS](https://github.com/wasp-lang/open-saas) | "A 100% free modern JS SaaS boilerplate … AI-ready" | 16,347 | advises against updating | `AGENTS.md`, skills, a plugin |
| [Ignite](https://github.com/infinitered/ignite) | "the battle-tested React Native boilerplate" | 19,956 | third-party diff tools | none |
| MakerKit Expo kit (paid) | "The React Native SaaS Starter Kit for Expo, Supabase, and the web" *(extract)* | private | `git pull upstream` *(extract)* | per-package `AGENTS.md`, `.mcp.json` |
| supastarter (paid) | "The SaaS starter kit your coding agent deserves" *(extract)* | private | `git pull upstream` *(extract)* | `AGENTS.md`, skills *(extract)* |
| [Nexpo](https://github.com/JoeSlain/Nexpo) | "Easiest way to create apps for web and mobile" | 78 | none | an LLM simplifier on `PostToolUse` |
| [Dream Starter Kit](https://github.com/vpv-group/dream-starter-kit) | "Free forever. Open source." | 11 | merge from `upstream` | a `SessionStart` hook |
| this repository | | 8 | `update`, `--dry-run`, `--rollback` | blocking hooks, gates with can-fail proofs, a CI floor |

- **The Next.js + Expo + Supabase niche has no open-source leader.** create-t3-turbo uses
  Supabase only as a Postgres host, and its FAQ says "the main purpose of this repo is not the
  integration between Next.js and Expo". Open-source projects on this exact stack have fewer
  than 100 stars, Supabase publishes no Next.js + Expo monorepo example, and the one sold kit on
  it is MakerKit's *(extract)*. [Takeout](https://github.com/tamagui/takeout2) moved to One,
  without Expo or Supabase.
- **"AI-ready" no longer sets anyone apart.** Next.js writes an `AGENTS.md` itself
  ([source](https://github.com/vercel/next.js/blob/canary/packages/next/src/server/lib/generate-agent-files.ts));
  supastarter, TurboStarter and Open SaaS sell agent support.
- **No other starter blocks its agent.** Of 30 repositories inspected file by file, four touch
  Claude Code hooks; none wires a deny guard, re-runs validation in a `Stop` hook, or keeps its
  gates with a CI floor.
- **Few offer an update path.** Open SaaS publishes "How (Not) to Update Your Open SaaS App";
  next-forge warns "you'll likely need to manually merge".
- **Visitors expect** a live demo, pictures of both apps and a one-click deploy (seen across
  next-forge, Open SaaS, Nexpo and the Next.js
  [with-supabase](https://github.com/vercel/next.js/tree/canary/examples/with-supabase) example).
  This repository has a terminal recording and none of the three.

## Harness and guard tools

"Deterministic" means code decides (an exit code, a parser, a test); "instructed" means the model
is asked through context.

- **Deterministic guards are generic.**
  [destructive_command_guard](https://github.com/Dicklesworthstone/destructive_command_guard)
  (6,369 stars), [cc-safety-net](https://github.com/kenryu42/cc-safety-net) (2,065),
  [failproofai](https://github.com/FailproofAI/failproofai) (9,632; MIT plus Commons Clause) and
  [tdd-guard](https://github.com/nizos/tdd-guard) (2,382) block commands or writes across many
  agents. They know `git push --force` and `DROP TABLE`, not your schema. The strongest lines
  admit limits: Trail of Bits' [claude-code-config](https://github.com/trailofbits/claude-code-config)
  says "Hooks are not a security boundary … Guardrails, not walls."
- **Workflow packs are instructed.** [superpowers](https://github.com/obra/superpowers) (319,332),
  [spec-kit](https://github.com/github/spec-kit) (150,295),
  [BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD) (55,485), SuperClaude,
  [ECC](https://github.com/affaan-m/ECC) and [ruflo](https://github.com/ruvnet/ruflo) shape
  process through context; superpowers' only hook injects instructions at `SessionStart`.
- **Attention and enforcement are two orders of magnitude apart:** prompt and skill collections
  hold hundreds of thousands of stars, the deterministic tools under 10,000 each.
- **Stack-specific deterministic starters exist only as tiny, fork-once repositories:**
  [real-case/claude-code-nextjs-starter](https://github.com/real-case/claude-code-nextjs-starter)
  (0 stars; "each custom rule must reject its own violator"), agent-ready-android-starter (0) and
  [agents-scaffold](https://github.com/LeeYudok/agents-scaffold) (39).
- **"Harness" is crowded.** ruflo ("The original agent harness"), ECC and failproofai use it.
  [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) relaunched
  without a Hooks category, and this repository is on neither its current nor its legacy list.
- **Anthropic's position:** "A real guardrail needs to be deterministic"
  ([Steering Claude Code](https://claude.com/blog/steering-claude-code-skills-hooks-rules-subagents-and-more),
  2026-06-18).

## The gap

Among about 40 projects reviewed, none combines what this repository has: gates that run the
project's own tests against a live Postgres before the agent stops; a registered proof that every
gate can fail; a CI floor that forbids removing a gate; an `update` and `--rollback` path; and
supply-chain controls and compliance mappings shipped inside the scaffold. The idea is converging
(the tiny starters above, [lights-on-software-factory](https://github.com/gojko/lights-on-software-factory)),
so the opening is to be seen first with proof, not to invent it.

Engineering-led projects differ from prompt packs: a mechanism claim instead of a transformation
claim, code and model kept apart, stated limits, dated and sourced numbers, a recording of a
block rather than of generation, verifiable distribution, and none of the prompt-pack tells
(count tables, star badges, "Eval Score 100%").

## Vocabulary

Origins and dates rest mostly on search extracts (openai.com and martinfowler.com were blocked),
so they are as reported, not verified.

| Term | Origin, as reported | Standing | Use here |
|---|---|---|---|
| Harness engineering | Mitchell Hashimoto, "Engineer the harness" ([post](https://mitchellh.com/writing/my-ai-adoption-journey), 2026-02-05); OpenAI's Ryan Lopopolo ([post](https://openai.com/index/harness-engineering/), 2026-02-11); Birgitta Böckeler's guides and sensors, computational or inferential ([article](https://www.martinfowler.com/articles/harness-engineering.html), 2026-04-02); Addy Osmani's ratchet ([post](https://addyosmani.com/blog/agent-harness-engineering/), 2026-04-19) | The 2026 category term | The discipline: this repository is an outer harness, almost entirely computational |
| Agent harness | Anthropic ([post](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents), 2025-11-26); LangChain, "Agent = Model + Harness" (2026-03-10) | Largest, overloaded: usually the runtime | Pair with "Claude Code" |
| Context engineering | Tobi Lütke and Andrej Karpathy (June 2025); Simon Willison's [write-up](https://simonwillison.net/2025/Jun/27/context-engineering/) | Standard, flat | `AGENTS.md`, skills and subagents only |
| Agentic engineering | Karpathy (February 2026); Willison's [patterns](https://simonwillison.net/2026/Feb/23/agentic-engineering-patterns/) | The professional practice | How this repository is built |
| Agentic coding | Claude Code's own description | Neutral | Anywhere |
| Guardrails | no single source | Overloaded by LLM input and output libraries | "deterministic guardrails", in prose |
| Backpressure | Geoffrey Huntley; HumanLayer's [post](https://humanlayer.dev/blog/context-efficient-backpressure) | Insider jargon | Explain first; it describes the Stop hook |
| Quality gates | an old CI term, revived for agents | The fastest-growing plain term | Use, with "deterministic" |
| Spec-driven development | Kiro, spec-kit, OpenSpec; Böckeler's [taxonomy](https://www.martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html) | Large | Not this method; do not claim |
| Ralph loop | Huntley (July 2025) | Many users meet Stop hooks here | Contrast: this Stop hook ends on gates, not on the model's judgement |
| `AGENTS.md` | Stewarded by the Agentic AI Foundation under the Linux Foundation ([agents.md](https://github.com/agentsmd/agents.md)) | About 1.28M files on GitHub (code-search estimate) | Say that the scaffold's `CLAUDE.md` imports it |

**Demand.** New GitHub repositories per quarter with the phrase in their name or description:

| Phrase | 25Q1 | 25Q3 | 26Q1 | 26Q2 | 26Q3 |
|---|---|---|---|---|---|
| harness engineering | 1 | 3 | 272 | 986 | 827 |
| claude code harness | 0 | 0 | 49 | 250 | 265 |
| claude code hooks | 0 | 84 | 348 | 471 | 428 |
| quality gates | 26 | 77 | 684 | 1,087 | 2,145 |
| AGENTS.md | 5 | 69 | 583 | 1,305 | 1,765 |
| vibe coding | 658 | 5,107 | 12,177 | 14,335 | 11,763 |

In `anthropics/claude-code`, 3,870 issues mention PreToolUse and 2,574 mention "stop hook". These
measure people building and labelling, not searches; many recent repositories were generated by
agents.

## Keyword map

- **Primary** (name, description, first heading): "Claude Code harness", with "harness
  engineering" as the discipline (the `claude-code-harness` topic had 6 repositories); "Claude
  Code hooks", with Stop hook and PreToolUse; "Next.js + Expo monorepo on Supabase", adding
  "React Native".
- **Secondary:** quality gates; `AGENTS.md` and `CLAUDE.md`; Supabase row-level security with
  pgTAP; tRPC; Expo Router; pnpm monorepo; Claude Code plugin, subagents and skills; agentic
  coding; SLSA provenance; OpenSSF Scorecard; npm trusted publishing.
- **Long tail**, from issue titles rather than autocomplete: "claude code stop hook run tests
  before finishing", "stop hook exit code 2", "block git push --force in claude code", "AGENTS.md
  vs CLAUDE.md", "how to test supabase rls policies", "share code between Next.js and Expo",
  "stop coding agents weakening tests".

## Terms to avoid in metadata and headings

| Term | Why |
|---|---|
| vibe coding | Defined as not reading the code; contrast only |
| AI slop | Pejorative and defensive; show evidence instead |
| spec-driven development | Not this repository's method |
| compound engineering | One company's method brand ([plugin](https://github.com/EveryInc/compound-engineering-plugin)); cite, do not adopt |
| claude code template | Means configuration bundles; say "starter" or "scaffold" |
| production-ready, battle-tested, bulletproof, 10x | Hype |
