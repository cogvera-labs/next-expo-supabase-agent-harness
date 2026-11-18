---
title: Claude Code harness for Next.js, Expo and Supabase
description: 'A Next.js + Expo (React Native) monorepo starter on Supabase with a Claude Code harness: hooks that send the agent back to work while a quality gate fails.'
template: splash
head:
  - tag: title
    content: Claude Code harness for Next.js, Expo and Supabase
  - tag: meta
    attrs:
      property: og:type
      content: website
hero:
  tagline: 'A Next.js + Expo (React Native) monorepo starter on Supabase with a Claude Code harness: hooks that send the agent back to work while a quality gate fails.'
  actions:
    - text: Get started
      link: /next-expo-supabase-agent-harness/getting-started/
      icon: right-arrow
    - text: How it works
      link: /next-expo-supabase-agent-harness/how-it-works/
      variant: secondary
    - text: GitHub
      link: https://github.com/cogvera-labs/next-expo-supabase-agent-harness
      variant: minimal
      icon: external
---

`next-expo-supabase-agent-harness` is the npm package and its CLI. Create a project from an
empty folder:

```sh
npx --yes next-expo-supabase-agent-harness@latest init
```

`init` asks for the project's details, then writes a pnpm monorepo: a Next.js web app and an
Expo mobile app on one Supabase backend, the gates that judge them, and the Claude Code hooks
that run the gates. [Getting started](/next-expo-supabase-agent-harness/getting-started/)
goes from there to a first agent turn that ends green.

## What the harness enforces

Quality is a deterministic gate, not a request. `AGENTS.md` and `CLAUDE.md` tell the agent
what is expected; hooks, gate scripts and CI decide whether a change stands.

- **Guard hooks.** PreToolUse hooks check each shell command, file write and MCP call
  against {{guard-rule-ids}} guard-rule ids before it runs. They deny destructive commands,
  secret reads, writes that break an invariant or touch the harness's own files, and MCP
  calls nobody approved.
- **The Stop hook.** When the agent tries to end its turn, the Stop hook runs a fixed chain
  of checks, from the validate chain and the row-level security tests to the reviewers'
  verdicts, and sends the agent back to work while any of them fails.
- **The validate chain.** `pnpm validate` runs {{gates}} gates, cheapest first. Each has at
  least one registered can-fail proof, a test or CI leg that makes it fail
  ({{can-fail-proofs}} registered for the {{gates}} gates), and the
  [gates catalog](/next-expo-supabase-agent-harness/harness/gates-catalog/) shows how to
  watch each one go red.
- **The CI floor.** CI runs the same chain against a frozen copy of its step list, so a
  project can add a gate but cannot quietly drop one. A gate that needs a database or a
  toolchain skips loudly on a laptop and fails closed in CI.
- **Row-level security, tested.** Postgres row-level security is the one authorization
  boundary for both apps. pgTAP and supabase-js suites run against a real Postgres and prove
  that one tenant cannot read another's rows
  ([why it is org-scoped](/next-expo-supabase-agent-harness/adr/20260201-org-scoped-tenancy/)).
- **`update`.** `update` moves an existing project to a later release. It replaces the files
  the harness owns, keeps any you changed and parks the new version beside them for you to
  merge, and leaves your own code alone. `--rollback` restores the tree from before the last
  update.

## Check it yourself

- [Evidence](/next-expo-supabase-agent-harness/evidence/): each public claim, the command
  that checks it and the can-fail proof that turns it red, and what is not measured yet.
- [Building with agents](/next-expo-supabase-agent-harness/building-with-agents/): how
  coding agents write most changes to this repository under the same hooks and gates, and
  how a maintainer reviews, merges, releases and answers for them.

**Limits.** The guards are tamper-evident, not tamper-proof; the Stop hook sends the agent
back only until Claude Code's block cap, after which the turn ends and the next turn is told;
the database gates are proven on Linux only; and only Claude Code runs the hooks, so another
agent meets the gates at the commit and in CI.
[How it works](/next-expo-supabase-agent-harness/how-it-works/) says where each layer stops.

The source is on [GitHub](https://github.com/cogvera-labs/next-expo-supabase-agent-harness)
under Apache-2.0 (the code a scaffold receives is Apache-2.0 or 0BSD, your choice), the CLI
is on [npm](https://www.npmjs.com/package/next-expo-supabase-agent-harness), and
[llms.txt](/next-expo-supabase-agent-harness/llms.txt) indexes these pages for language
models. The groups from Harness onward are the docs `init` writes into every project; where
one shows a placeholder in double braces, `init` fills in the project's own value. The site
follows the main branch, so it can describe changes that are not released yet.
