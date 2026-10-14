// Dev-only end-to-end check: runs the plugin with a fake context against the live repo.
import plugin from "./index"

const callbacks = new Map<string, (event: any) => unknown>()
const ctx = {
  session: {
    hook: (name: string, callback: (event: any) => unknown) => {
      callbacks.set(name, callback)
      return Promise.resolve({ dispose: () => Promise.resolve() })
    },
  },
}

await plugin.setup(ctx as any)

const context = callbacks.get("context")
if (!context) throw new Error("context hook not registered")

const deepseek = { model: { providerID: "opencode-go", id: "deepseek-v4.1-flash" }, system: [] as { type: string; text: string }[] }
await context(deepseek)
const part = deepseek.system.at(-1)
console.log(`deepseek-v4.1-flash -> ${deepseek.system.length} part(s), ${part?.text.length ?? 0} chars`)
console.log(`starts: ${JSON.stringify(part?.text.slice(0, 60))}`)

if (deepseek.system.length !== 1) throw new Error("expected exactly 1 injected part")
if (!part!.text.includes("Assistant Operating Specification")) throw new Error("deepseek file content mismatch")

const llama = { model: { providerID: "x", id: "llama-4-70b" }, system: [] as { type: string; text: string }[] }
await context(llama)
if (llama.system.length !== 0) throw new Error("unmatched model must inject nothing")

console.log("SMOKE OK")
