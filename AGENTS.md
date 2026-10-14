# AGENTS.md

OpenCode V2 plugin (`@opencode/plugin` 2.0.28). Injects a model-matched jailbreak file fetched from `togg53192-cmd/jailbreaks` into the system message of every agent-loop request. `README.md` covers install/user-facing behavior; this file is the agent-facing context.

## Commands

- `bun test` — matcher unit tests (`match.test.ts`).
- `bun smoke.ts` — end-to-end against the **live** GitHub repo (needs network). Run after touching `index.ts` fetch logic.
- No lint, typecheck, or CI; nothing else to run.

## Hard constraint: entry stays dependency-free

`package.json` points `main`/`exports` at `index.ts` directly, and installs happen via git without `bun install`. `index.ts` must import **only types** (`import type`) plus `./match`. Adding a runtime import (or a build step) breaks git-based installs. `match.ts` must stay dependency-free pure logic for the same reason.

## Matcher semantics (easy to misread)

- Tokens are lowercased alphanumerics; a leading `v` is stripped, so `v4` and `4` are the same token.
- A candidate needs ≥1 shared **alphabetic** token (`alpha` check in `bestMatch`), so version-only overlap never matches. Family name is mandatory by design: no shared name → `null` → inject nothing. Don't "fix" this to widen matching.
- Tie-break order: score, then shorter filename, then lexical.
- `REPO_FILES` in `match.ts` (offline fallback) and `FILES` in `match.test.ts` (test fixture) are the same snapshot but deliberately duplicated when the upstream repo updates. Keep them in sync.
- Provider path prefixes (`providerID/modelID`) are ignored via `split("/").pop()`.

## Gotchas

- `smoke.ts` fetches live content and asserts the injected file contains `"Assistant Operating Specification"`. Upstream rewrites of `deepseek-4-1.md` can break smoke even when local code is correct.
- Tree refresh at startup is background and fire-and-forget: snapshot stays live until the fetch lands; failures are swallowed intentionally.
- Per-model content cache (`Map`, `null` = unmatched) is in-memory only; a failed fetch stays `undefined` and retries next request.
- Local dev: point the opencode config plugins array at this folder path, then `opencode service restart` after edits.
