import { Specimens } from './specimens'

/**
 * Scratch surface for the primitives. Both themes render at once — the token
 * layer scopes every semantic variable to `[data-theme]`, so a nested panel
 * re-points the whole palette without any client state.
 */
export const metadata = { title: 'Style guide · Coffee Bar' }

export default function StyleGuidePage() {
  return (
    <main className="flex-1">
      <h1 className="text-title p-gutter">Style guide</h1>
      <div className="grid gap-px bg-hairline md:grid-cols-2">
        <Panel theme="light" />
        <Panel theme="dark" />
      </div>
    </main>
  )
}

function Panel({ theme }: { theme: 'light' | 'dark' }) {
  return (
    <div data-theme={theme} className="bg-ground text-primary p-gutter py-10">
      <p className="text-spec wdth-condensed text-tertiary mb-8">{theme}</p>
      <Specimens />
    </div>
  )
}
