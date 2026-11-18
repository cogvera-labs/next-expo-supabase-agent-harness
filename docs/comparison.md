# Comparison

How this harness compares with other Next.js and Expo starters and with Claude Code workflow
and guard tools, as of November 2026, and when to choose each.

Every statement about another project comes from its public repository, README or
documentation as read on 2026-11-18. Two vendor sites, MakerKit's and supastarter's, could
not be loaded; their entries quote the vendors as search results showed them, and say so.
This page publishes no star or download counts. Projects change faster than this page: to
correct an entry,
[open an issue](https://github.com/cogvera-labs/next-expo-supabase-agent-harness/issues/new/choose).

## In short

- **Choose this project** when you want a Next.js app and an Expo app on one Supabase backend,
  row-level security tested against a real Postgres, Claude Code as the agent, and checks the
  agent cannot end a turn without passing.
- **Choose another starter** when you want a different stack, screens shared between web and
  native, or SaaS features such as billing and teams ready-made.
- **Add a general guard** when you use several agents, or want command protection in every
  repository. Claude Code runs every hook that matches a tool call, so a guard can sit beside
  this project's own.
- **Add an instruction-based workflow** when you want a method for planning and reviewing work.
  It shapes how the agent works; this project decides whether the result may end the turn.

## Starters

As of November 2026:

| Project | Stack | License or price | Updating an existing project | Agent support |
|---|---|---|---|---|
| This project | Next.js 16 and Expo 57 on one Supabase backend (Postgres row-level security and Auth), tRPC 11, a pnpm monorepo | Apache-2.0; the scaffolded files are Apache-2.0 OR 0BSD | `update`, with `--dry-run` and `--rollback`; files you changed are kept, and the new version is parked for you to merge | Instructions, plus hooks that block tool calls, a Stop hook that re-runs the gates, and CI against a frozen gate list |
| [create-t3-turbo](https://github.com/t3-oss/create-t3-turbo) | Turborepo with an Expo app and a Next.js or TanStack Start web app; tRPC, Better Auth, and Drizzle on a Supabase Postgres database | MIT | None: you start from a copy | None in the repository |
| [Solito](https://github.com/nandorojo/solito) | A library that unifies navigation between React Native and Next.js; `create-solito-app` writes an example monorepo | MIT (the npm package) | The library updates as a dependency; the example monorepo is a copy | None in the repository |
| [MakerKit's Expo kit](https://makerkit.dev/react-native-supabase) | An Expo app beside a Next.js app on one Supabase project, in a Turborepo monorepo (the vendor's description) | Paid; the public "lite" kits are MIT | `git pull` from MakerKit's repository (the vendor's documentation) | Instructions: `AGENTS.md` and `CLAUDE.md` files and MCP configuration (the vendor's description) |
| [supastarter](https://supastarter.dev) | A SaaS starter kit; its site could not be loaded, so its stack is not described here | Paid | `git pull upstream` with a rebase (the vendor's documentation) | Instructions: `AGENTS.md`, Agent Skills and `.cursorrules` (the vendor's description) |
| [next-forge](https://github.com/vercel/next-forge) | A Turborepo template for Next.js apps, with Clerk, Stripe, Resend, Sentry and more; no mobile app | MIT | `npx next-forge@latest update` copies the new files in, then you merge by hand | Instructions: a skill file, a `.cursorrules` example and `llms.txt` docs |
| [Open SaaS](https://github.com/wasp-lang/open-saas) | A web SaaS template on Wasp (React, Node.js, Prisma), with payments, an admin dashboard and a docs site; no mobile app | Free and open source | Its documentation page on the subject is titled "How (Not) to Update Your Open SaaS App" | Instructions and skills: `AGENTS.md`, skills and a Claude Code plugin |

Of the starters whose code could be inspected, none blocks a tool call, re-runs the checks
before the agent stops, or keeps a gate from being removed with a CI floor. The paid kits'
code is not public, so for them this page reports what the vendors say.

### create-t3-turbo

In its own words, a "clean and simple starter repo using the T3 Stack along with Expo React
Native", with a choice of web framework (Next.js or TanStack Start) and an auth and database
layer (Better Auth and Drizzle) that is not tied to Supabase Auth or row-level security. It
has no agent hooks and far less to learn. Its own FAQ says that "the
main purpose of this repo is not the integration between Next.js and Expo."
**Choose it** when you want the T3 stack and plan to bring your own agent workflow.

### Solito

Solito unifies navigation between React Native and Next.js, and in its default example
monorepo both apps render the same screens from a shared package. This project shares no
screens, by design: its two apps share the API, the contracts and the design tokens, and each
has its own screens. As a library, Solito can be added to an app you already have.
**Choose it** when one UI codebase for web and native matters more to you than a shared
authorization layer and agent gates.

### MakerKit's Expo kit

A commercial kit on the same stack, with a vendor behind it. MakerKit's full kits add SaaS
features this starter does not ship, such as billing and subscriptions, team accounts and an
admin panel, according to the README of its public
[Next.js lite kit](https://github.com/makerkit/nextjs-saas-starter-kit-lite).
**Choose it** when you would rather buy those features than build them. Its agent support, as
the vendor describes it, instructs the agent; a general guard from the list below can add
blocking.

### supastarter

A paid SaaS starter kit that addresses agent users directly: "The SaaS starter kit your coding
agent deserves", as search results quote its site. The site could not be loaded for this page,
so its features are not compared here.
**Choose it** after comparing its feature list with your needs; for agents, it describes
instruction files and skills.

### next-forge

next-forge wires a broad set of services into a web monorepo: authentication, payments, email,
analytics, error tracking, feature flags and more. It is also one of the few starters with an
`update` command.
**Choose it** for a web-only product where those integrations matter more than a mobile app or
agent gates.

### Open SaaS

A free web SaaS template on Wasp, with payments, an admin dashboard, a docs site, a live demo
and a one-click deploy to Railway. This project has no live demo or deploy button yet
([#164](https://github.com/cogvera-labs/next-expo-supabase-agent-harness/issues/164)).
**Choose it** for a web-only SaaS when Wasp suits you.

### Others on this stack

Two small open-source projects also pair Next.js and Expo on Supabase:
[Nexpo](https://github.com/JoeSlain/Nexpo), which ships pgTAP and Maestro, and
[Dream Starter Kit](https://github.com/vpv-group/dream-starter-kit), whose web and mobile apps
share one Supabase backend. A few small templates also ship deterministic gates for agents,
such as [claude-code-nextjs-starter](https://github.com/real-case/claude-code-nextjs-starter)
on Next.js and Supabase, whose `check:gates` requires that "each custom rule must reject its
own violator." As of November 2026 those gated templates are copied once, with no update path.

## Agent tools

### Instruction-based workflows

These shape how the agent plans and works, through skills, commands, agents and process
documents. What they enforce, they enforce through the agent's context. They complement this
project rather than replace it: a workflow decides how the agent approaches the work, and this
harness decides whether the result may end the turn.

- **[superpowers](https://github.com/obra/superpowers)** (MIT) is "a complete software
  development methodology for your coding agents, built on top of a set of composable skills
  and some initial instructions that make sure your agent uses them." Its one hook
  ([`hooks.json`](https://github.com/obra/superpowers/blob/main/hooks/hooks.json)) runs at
  session start and injects instructions. It installs into many agents, including Claude Code (from
  Anthropic's official plugin marketplace), Codex, Cursor, Gemini CLI and GitHub Copilot CLI.
  **It does better:** a working method that travels with you across agents and repositories.
  **Choose it** for that method, and keep this harness's own reviewers for the verdicts its
  Stop chain counts.
- **[spec-kit](https://github.com/github/spec-kit)** (MIT) is "an open source toolkit that
  gives AI coding agents structured processes, reusable templates, and documented outcomes,"
  starting with Spec-Driven Development; its extensions can add commands, hooks and quality
  gates. **It does better:** carrying a specification through planning and implementation.
  This project's spec-first rule is a single template, `specs/_template.md`.
  **Choose it** when the hard part is deciding what to build.
- **[BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD)** (MIT) is "Agile Ai Driven
  Development" that covers "what to build, how it holds together, and how it changes as you
  learn," through agents, skills and workflows. **It does better:** product and architecture
  planning across the whole effort, not only the code. **Choose it** when you want that
  process around your agent.

### General deterministic guards

These block a tool call before it runs, in any repository and, for most of them, in several
agents. They know shell commands, file patterns and secrets, not your schema: none ships
checks for one stack, such as row-level security suites against a live Postgres, or a CI floor
that keeps a gate from being removed.

- **[failproofai](https://github.com/FailproofAI/failproofai)** offers "Observability and
  enforcement for every harness your agents run in." Its built-in policies block dangerous tool
  calls before they run, across many agent tools including Claude Code, Codex, GitHub Copilot
  CLI and Cursor's agent CLI, with turn-end gates on some of them, policies you write in code,
  a history of every session, and a hosted product. Its license is MIT with the Commons Clause:
  "free for internal and personal use; commercial resale of failproofai itself requires a
  separate agreement." **It does better:** one policy layer and one run history across many
  agents and repositories. **Choose it** when you run more than one agent, or want to observe
  every run.
- **[destructive_command_guard](https://github.com/Dicklesworthstone/destructive_command_guard)**
  (dcg) is a Rust hook that "blocks destructive shell, git, and filesystem commands before AI
  coding agents run them," with optional rule packs for databases and other tools, for Claude
  Code, Codex CLI, Gemini CLI, GitHub Copilot CLI, Cursor and more. Its installer checks a
  pinned SHA-256 checksum and a Minisign signature, and it carries a custom license. Its README
  states a limit that applies to every hook-based guard, this project's included: "the model
  can still write scripts to disk to bypass hook-based blocking." **It does better:** breadth
  of destructive-command knowledge across many agents, and a verified install. **Choose it**
  for destructive-command protection in every repository you work in.
- **[cc-safety-net](https://github.com/kenryu42/cc-safety-net)** (MIT) "blocks destructive
  commands and access to secrets such as SSH keys and `.env` files before the tool call runs.
  It parses what the command does. Wrapping the command or reordering flags does not hide it."
  It supports Claude Code, Codex, Cursor, Gemini CLI, GitHub Copilot CLI, OpenCode and others,
  and states that it is not a sandbox. **It does better:** it parses commands, where this
  project's bash guard matches text with regular expressions, which the doctrine calls "a
  high-value tripwire, NOT a sandbox"; a parser is harder to evade by rephrasing.
  **Choose it** for a command guard that parses, in every repository and CLI.
- **[tdd-guard](https://github.com/nizos/tdd-guard)** and its successor
  **[Probity](https://github.com/nizos/probity)** (both MIT) enforce test-driven development.
  tdd-guard "grew into Probity: the same TDD enforcement, now for Claude Code, Codex, and
  GitHub Copilot CLI." Probity "checks every file write and shell command before it happens,"
  and its rules "can be deterministic, matching commands or file content by string or regex,
  or AI-validated." **It does better:** it holds the agent to test-first development while it
  writes, which this project does not do; this project judges tests at the end of the turn
  (test quality and per-file coverage) and in CI (the mutation lane).
  **Choose it** when you want red-green-refactor enforced at write time.

## What this project combines

Among the public projects reviewed for this page, none combines what this project ships
together:

- gates for its own stack that run when the agent tries to end a turn, including row-level
  security suites against a live Postgres;
- a can-fail proof for every gate, guard rule and CI job;
- a CI floor that keeps a project from removing a gate;
- `update`, with `--dry-run` and `--rollback`, for projects that already exist;
- supply-chain controls and compliance mappings inside the scaffold.

The idea is spreading, in small templates such as the ones named above, so this describes
November 2026, not a permanent position.

## Where this project is weaker

- **One stack.** Next.js, Expo and Supabase together; a web-only app is not a fit today.
- **One agent for blocking.** The hooks that deny a command or send the agent back run only in
  Claude Code; other agents meet the checks at the commit and the pull request.
- **More machinery.** Docker and a local Supabase stack, and a longer wait at the end of each
  turn than a starter without checks.
- **No product features.** No billing, payments, teams or admin panel.
- **No demo yet.** No live demo, app screenshots or one-click deploy
  ([#164](https://github.com/cogvera-labs/next-expo-supabase-agent-harness/issues/164)).
- **Unmeasured outcomes and one maintainer.** Its effect on an agent's output has not been
  measured ([#170](https://github.com/cogvera-labs/next-expo-supabase-agent-harness/issues/170)),
  and one maintainer reviews every change. See the [FAQ](faq.md) and
  [How it works](how-it-works.md) for the limits of each layer.
