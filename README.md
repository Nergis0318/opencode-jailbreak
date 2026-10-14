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

```
opencode plugin add opencode-jailbreak@git+https://github.com/Nergis0318/opencode-jailbreak.git
```

That writes the entry into `~/.config/opencode/opencode.jsonc`:

```jsonc
"plugins": [..., "opencode-jailbreak@git+https://github.com/Nergis0318/opencode-jailbreak.git"]
```

No dependencies are installed — the entry (`index.ts`, via `main`/`exports`)
is loaded straight from the git checkout in opencode's package cache.
After pushing new commits: `opencode plugin update opencode-jailbreak`.

For local development against this checkout, point the config at the folder
instead (`"/home/nergis/Dev/opencode-jailbreak"`); after editing plugin code,
`opencode service restart`.

## Dev

```sh
bun test        # matcher unit tests
bun smoke.ts    # end-to-end run with fake context against the live repo
```
