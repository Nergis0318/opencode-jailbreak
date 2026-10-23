import type { Context } from "@opencode/plugin"
import { REPO_FILES, bestMatch, pickFiles } from "./match"

// Injects the jailbreak file matching the session's model into the system
// message of every agent-loop model call. Source: togg53192-cmd/jailbreaks.
const REPO = "togg53192-cmd/jailbreaks"
const TREE_URL = `https://api.github.com/repos/${REPO}/git/trees/main?recursive=1`
const RAW_URL = `https://raw.githubusercontent.com/${REPO}/main/`

// Plain { id, setup } default export: no runtime imports, so the plugin works
// installed straight from git without any dependency install step.
export default {
  id: "opencode-jailbreaks",
  async setup(ctx: Context) {
    let files: readonly string[] = REPO_FILES

    // Refresh the file list in the background; the snapshot stays until it lands.
    fetch(TREE_URL, { headers: { accept: "application/vnd.github+json" } })
      .then((res) => (res.ok ? res.json() : undefined))
      .then((tree: { tree?: { type: string; path: string }[] } | undefined) => {
        const next = pickFiles((tree?.tree ?? []).filter((entry) => entry.type === "blob").map((entry) => entry.path))
        if (next.length > 0) files = next
      })
      .catch(() => {})

    const content = new Map<string, string | null>() // model id -> text, null = no file, missing = unresolved

    let enabled = true

    await ctx.session.hook("context", async (event) => {
      if (!enabled) return
      try {
        const key = event.model.id
        let text = content.get(key)
        if (text === undefined) {
          const file = bestMatch(key, files)
          if (file === null) {
            content.set(key, null)
          } else {
            const res = await fetch(RAW_URL + encodeURIComponent(file), { signal: AbortSignal.timeout(15_000) })
            if (res.ok) {
              text = await res.text()
              content.set(key, text)
            }
          }
        }
        if (text) event.system.push({ type: "text", text })
      } catch (error) {
        console.error("[opencode-jailbreaks]", error)
      }
    })

    // /jailbreak toggles injection on/off (optional "on"/"off" argument).
    if (ctx.command?.transform) {
      await ctx.command.transform((editor) => {
        editor.add({
          name: "jailbreak",
          description: "Toggle jailbreak injection on/off",
          execute: async (input) => {
            const arg = (input.prompt?.text ?? "").trim().toLowerCase()
            if (arg === "on") enabled = true
            else if (arg === "off") enabled = false
            else enabled = !enabled
            const state = enabled ? "on" : "off"
            try {
              await ctx.session.synthetic({
                sessionID: input.sessionID,
                text: `Jailbreak ${state}.`,
                description: `Jailbreak ${state}.`,
                delivery: input.delivery ?? "steer",
                resume: false,
              } as any)
            } catch (error) {
              console.error("[opencode-jailbreaks]", error)
            }
          },
        })
      })
    }
  },
}