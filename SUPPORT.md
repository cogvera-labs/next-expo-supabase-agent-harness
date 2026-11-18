# Support

Where to ask about this harness, and what answer to expect from a project with
one maintainer ([GOVERNANCE.md](GOVERNANCE.md)).

## Where to ask

| You have | Go to |
|---|---|
| A question about using the harness, choosing an option, or whether it should do something | [Discussions](https://github.com/cogvera-labs/next-expo-supabase-agent-harness/discussions) |
| A problem setting up a project or getting the first run green | The [documentation site](https://cogvera-labs.github.io/next-expo-supabase-agent-harness/), its [FAQ](https://cogvera-labs.github.io/next-expo-supabase-agent-harness/faq/) and the [first-run runbook](https://cogvera-labs.github.io/next-expo-supabase-agent-harness/runbooks/first-run/), then Discussions |
| A bug in the installer, a gate, a hook or a scaffolded project | The "Bug report" form in the [issue chooser](https://github.com/cogvera-labs/next-expo-supabase-agent-harness/issues/new/choose) |
| An idea for a new gate | The "Gate proposal" form in the same chooser, before any code ([CONTRIBUTING.md](CONTRIBUTING.md), ground rule 6) |
| A security vulnerability | A private security advisory, as [SECURITY.md](SECURITY.md) describes. Never a public issue or discussion. |
| A conduct problem | The reporting address in the [Code of Conduct](CODE_OF_CONDUCT.md) |

Questions about Claude Code, Supabase, Expo or Next.js themselves, rather than
about how this harness uses them, get better answers from those projects' own
documentation and communities.

## Before you ask

- **Update first.** The latest release and `main` are the supported versions
  ([SECURITY.md](SECURITY.md)). In an installed project,
  `npx --yes next-expo-supabase-agent-harness@latest update` brings the harness
  up to date, and `npx --yes next-expo-supabase-agent-harness@latest doctor`
  reports whether the install is healthy.
- **Read the gate's own message.** A failing gate prints a `FIX[<gate>]:`
  line that gives the command that reproduces the failure and points to the
  gate's section of `docs/harness/gates-catalog.md` in your project, which
  explains the gate and how it can fail.
- **Bring the facts.** The harness version (`harnessVersion` in
  `.harness/manifest.json`), your OS, and your Node and pnpm versions, as the
  bug form asks. Paste the full output of the failing command, not a summary
  of it. Never paste credentials, tokens or private data.

## What to expect

- **Answers are best effort.** One person maintains this project. There is no
  response-time target for questions, bug reports or pull requests.
- **Security reports are the exception.** They have stated times for
  acknowledgement, assessment and updates, in [SECURITY.md](SECURITY.md).
- **Support happens in public.** Questions and answers stay in Discussions and
  issues, so the next person with the same problem finds them.
- **A fix arrives as a release.** Installed projects pick it up with `update`.
  The [CHANGELOG](CHANGELOG.md) says what each release changes and whether an
  install has to act.

If you are using an AI assistant to write your question or report, read
[CONTRIBUTING.md](CONTRIBUTING.md), "Using AI tools", first.
