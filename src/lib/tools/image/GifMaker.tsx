import { useState } from 'react'
import { Field, inputClass, buttonPrimary, cx, Export } from '../../../components/ui'

export default function GifMaker() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function run() {
    setBusy(true); setError(''); setOutput('')
    try { setOutput(transform(input)) } catch (e) { setError(e instanceof Error ? e.message : String(e)) }
    setBusy(false)
  }

  function transform(raw: string): string {
    return raw
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <Field label="Input">
        <textarea className={inputClass} value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Enter input to GifMaker..." />
      </Field>
      <div className="flex items-center gap-3">
        <button type="button" className={buttonPrimary} onClick={run} disabled={busy}>{busy ? 'Working…' : 'Run'}</button>
        <Export data={output} disabled={!output} label="Download output" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Field label="Output">
        <textarea readOnly className={inputClass} value={output} placeholder="Output appears here" />
      </Field>
    </div>
  )
}
