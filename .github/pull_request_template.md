## What and why

<!-- One or two sentences. Link the issue or gate proposal if there is one. -->

## Evidence

Paste real output, not a statement that it passed. CONTRIBUTING.md, "Local
development", lists every check CI blocks on.

```
$ GITHUB_BASE_REF=main CI=true node --test "tests/**/*.test.mjs"
<paste the summary lines>
```

## AI assistance

<!-- "None", or which AI tools helped and with which part of the change. Then
what you checked yourself: the diff you read, the commands you ran, the
behaviour you confirmed. CONTRIBUTING.md, "Using AI tools", says why. -->

## What I could not verify

<!-- What you could not run or check, and why: a platform you do not have, a
lane that needs credentials, a check that skipped. Write "Nothing" only if it
is true. -->

## Checklist

- [ ] I ran the full "Local development" list in CONTRIBUTING.md, not a subset.
- [ ] A new or changed gate lands with its can-fail proof, registered in
      `tests/canary/injections.json` (ground rule 6).
- [ ] Nothing project-specific entered `template/` (ground rule 2), and `installer/`
      still has zero runtime dependencies (ground rule 3).
- [ ] Any number I changed in README, CHANGELOG or the shipped docs is one
      `node scripts/check-claims.mjs` can recompute.
- [ ] If this changes what a consumer receives on `update`, `template/migrations.json`
      records it.
- [ ] No credentials, tokens or private data in the diff or in pasted output.
- [ ] I understand every change in this diff and can answer for it, including
      any part an AI tool wrote.
