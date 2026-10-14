import { describe, expect, test } from "bun:test"
import { bestMatch, pickFiles } from "./match"

// Snapshot of https://github.com/togg53192-cmd/jailbreaks (main)
const FILES = [
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

describe("pickFiles", () => {
  test("keeps .md/.txt basenames and drops README", () => {
    expect(pickFiles(["docs/README.md", "deepseek-4-1.md", "grok-config.txt", "pic.png"])).toEqual([
      "deepseek-4-1.md",
      "grok-config.txt",
    ])
  })
})

describe("bestMatch", () => {
  test("picks the versioned file over older versions", () => {
    expect(bestMatch("deepseek-v4.1-flash", FILES)).toBe("deepseek-4-1.md")
  })

  test("picks the versioned file for a custom -free model id", () => {
    expect(bestMatch("deepseek-v4-1-flash-free", FILES)).toBe("deepseek-4-1.md")
  })

  test("exact normalized match wins", () => {
    expect(bestMatch("grok-4.7", FILES)).toBe("grok-4.7.md")
  })

  test("dot and dash versions are equivalent", () => {
    expect(bestMatch("glm-5.3-flash", FILES)).toBe("glm-5-3-flash.md")
  })

  test("plain file beats its -AGENTS variant", () => {
    expect(bestMatch("glm-zcode-5.3", FILES)).toBe("glm-zcode-5.3.md")
  })

  test("falls back to the closest family when the version is absent", () => {
    expect(bestMatch("mistral-large-5", FILES)).toBe("Mistral-Large-4.md")
  })

  test("ignores a provider path prefix", () => {
    expect(bestMatch("opencode-go/deepseek-v4.1-flash", FILES)).toBe("deepseek-4-1.md")
  })

  test("v-prefixed variant suffix normalizes", () => {
    expect(bestMatch("muse-spark-1.3-v2", FILES)).toBe("Muse-spark-1-3-v2.md")
  })

  test("returns null when no file shares the family name", () => {
    expect(bestMatch("llama-4-70b", FILES)).toBeNull()
  })

  test("ties break on shorter name then lexical order", () => {
    expect(bestMatch("alpha-1", ["alpha-1.txt", "Alpha 1.md"])).toBe("Alpha 1.md")
  })
})
