# Documentation about this repository

The pages in `docs/` describe this repository and its CLI. A project's own documentation lives under `template/` and on the documentation site.

## Start here

| Page | What it is for |
|---|---|
| [getting-started.md](getting-started.md) | A tutorial from an empty folder to a first Claude Code turn under the harness |
| [how-it-works.md](how-it-works.md) | The enforcement loop, the layers, and what each layer cannot do |
| [faq.md](faq.md) | Short answers to the questions people ask first, each with a source |
| [comparison.md](comparison.md) | How this compares with other starters and with other agent guardrails, dated and sourced |
| [glossary.md](glossary.md) | The project's terms, each with a definition and the name the code uses for it |

## Reference

| Page | What it is for |
|---|---|
| [cli.md](cli.md) | Every command, flag, placeholder and exit code of the CLI |
| [architecture.md](architecture.md) | How the repository is laid out: a map of every top-level entry, where a project's files come from, and where to find a hook, a gate or its proof |

## The project

| Page | What it is for |
|---|---|
| [evidence.md](evidence.md) | A command, a passing output and a can-fail proof for each claim, and what is not established |
| [building-with-agents.md](building-with-agents.md) | Who writes the changes, who answers for them, one change traced end to end, and what the gates caught |
| [security/assurance-case.md](security/assurance-case.md) | The harness's security requirements, trust boundaries and residual risks |
| [forking.md](forking.md) | Starting a sibling harness for another stack from this one |
| [changelog/](changelog/) | The release notes for releases before 2.0.0; 2.x is in [CHANGELOG.md](../CHANGELOG.md) |
| [media/](media/) | The README's terminal recording ([harness-demo.gif](media/harness-demo.gif), rendered by vhs from [harness-demo.tape](media/harness-demo.tape)) and the social preview image, with its SVG source |

## Elsewhere

- **What a project receives.** The doctrine, the gates catalog, the runbooks and the ADRs are
  in [template/base/docs/](../template/base/docs/), starting with the
  [harness doctrine](../template/base/docs/harness/README.md) and the
  [gates catalog](../template/base/docs/harness/gates-catalog.md). Each module documents
  itself under `template/modules/<name>/docs/`.
- **The documentation site**,
  [cogvera-labs.github.io/next-expo-supabase-agent-harness](https://cogvera-labs.github.io/next-expo-supabase-agent-harness/),
  renders those pages and most of this folder from the same files.
- **Design records** are in [design/](../design/): dated facts verified against primary
  sources, the stack contract, proposals and research.
- **Release notes**: [CHANGELOG.md](../CHANGELOG.md) for 2.x and [changelog/](changelog/)
  for earlier releases.
- **How to take part**: [CONTRIBUTING.md](../CONTRIBUTING.md),
  [GOVERNANCE.md](../GOVERNANCE.md), [SECURITY.md](../SECURITY.md),
  [SUPPORT.md](../SUPPORT.md) and [ROADMAP.md](../ROADMAP.md).
