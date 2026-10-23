import type { Context } from "@opencode/plugin/tui"

// TUI-side companion to index.ts: surfaces the server-side /jailbreak toggle
// as a toast whenever a "Jailbreak on/off." synthetic message is emitted.
export default {
  id: "opencode-jailbreaks",
  setup(ctx: Context) {
    const unsub = ctx.data.on("session.synthetic", (event) => {
      const text = event.data?.text ?? ""
      if (!text.startsWith("Jailbreak")) return
      ctx.ui.toast.show({ message: text, variant: "info", duration: 3000 })
    })
    return () => unsub()
  },
}
