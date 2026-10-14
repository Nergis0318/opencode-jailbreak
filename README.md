# opencode-jailbreak

OpenCode V2 plugin: for every model call, picks the file from
[togg53192-cmd/jailbreaks](https://github.com/togg53192-cmd/jailbreaks)
matching the session's model (closest match if there is no exact one) and
appends it to the system message of the outgoing request.

- Exact/normalized match first (`deepseek-v4.1-flash` → `deepseek-4-1.md`),
  otherwise the closest file by token overlap (`mistral-large-5` →
  `Mistral-Large-4.md`). Models sharing no name with any file get nothing.
- The repo tree is refreshed at startup (bundled snapshot as offline fallback);
  file contents are fetched from `raw.githubusercontent.com` once per model and
  cached in memory.
- Injected per request only; nothing is written to session history or config.

## Install

Already wired in `~/.config/opencode/opencode.jsonc`:

```jsonc
"plugins": ["/home/nergis/Dev/opencode-jailbreak"]
```

After editing plugin code: `opencode service restart`.

## Dev

```sh
bun test        # matcher unit tests
bun smoke.ts    # end-to-end run with fake context against the live repo
```
