// Model-file matching for https://github.com/togg53192-cmd/jailbreaks.
// Pure logic, no runtime deps — index.ts feeds it the repo file list.

// Fallback snapshot, used when the GitHub tree fetch fails at startup.
export const REPO_FILES = [
  "Gemini-4-Argon.md",
  "Grok build.md",
  "Mistral-Large-4.md",
  "Muse spark 1.3.md",
  "Muse-spark-1-3-v2.md",
  "Sonnet v2.md",
  "Step-5-preview.md",
  "deepseek v3.md",
  "deepseek v4.md",
  "deepseek-4-1.md",
  "gemma4.md",
  "glm-5-3-flash.md",
  "glm-5.2.md",
  "glm-zcode-5.2.md",
  "glm-zcode-5.3-AGENTS.md",
  "glm-zcode-5.3.md",
  "glm5-3opencode.md",
  "gpt-oss-20b.md",
  "grok-4.7.md",
  "grok-config.txt",
  "kimi-k2.md",
  "kimi-k3-agents.md",
  "longcat-agents.md",
  "mimo-2.6-agents.md",
  "muse-ai-AGENTS.md",
  "opus v1.md",
  "opus v2.md",
  "qwen-3.7.md",
  "qwen-preferences.md",
  "sonnet v1.md",
  "spacebunny-agents.md",
]

/** Lowercased alphanumeric tokens; "v4" and "4" collapse to the same token. */
function tokens(name: string): Set<string> {
  return new Set(
    name
      .replace(/\.(md|txt)$/i, "")
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(Boolean)
      .map((t) => (/^v\d/.test(t) ? t.slice(1) : t)),
  )
}

/** Basenames of .md/.txt blobs, READMEs dropped. */
export function pickFiles(paths: readonly string[]): string[] {
  return paths
    .map((p) => p.split("/").pop() as string)
    .filter((n) => /\.(md|txt)$/i.test(n) && !/^readme/i.test(n))
}

/**
 * Best file for a model id, by Dice token overlap. Needs at least one shared
 * alphabetic token, so unrelated models get null instead of a random file.
 * Ties: shorter name first, then lexical.
 */
export function bestMatch(modelID: string, files: readonly string[]): string | null {
  const model = tokens(modelID.split("/").pop() as string)
  let best: string | null = null
  let bestScore = 0
  for (const file of files) {
    const t = tokens(file)
    let shared = 0
    let alpha = false
    for (const x of t) {
      if (!model.has(x)) continue
      shared++
      if (/[a-z]/.test(x)) alpha = true
    }
    if (!alpha) continue
    const score = (2 * shared) / (t.size + model.size)
    if (
      best === null ||
      score > bestScore ||
      (score === bestScore && (file.length < best.length || (file.length === best.length && file < best)))
    ) {
      best = file
      bestScore = score
    }
  }
  return best
}
