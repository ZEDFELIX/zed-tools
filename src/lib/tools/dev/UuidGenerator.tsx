import { useState } from 'react'
import { Field, inputClass, buttonPrimary, buttonSecondary, cx, Export, FileUploader } from '../../../components/ui'
import { countWords } from '../../../lib/engines/textEngine'

export default function UuidGenerator() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  
  function run() {
    try { setError(''); setOutput((() => { const s = input.trim(); if (!s) return ''; try { return JSON.stringify(JSON.parse(s), null, 2) } catch { return s } })()) }
    catch (e) { setError(e instanceof Error ? e.message : String(e)) }
  }
  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <FileUploader onFile={(name, text) => { setInput(text); setOutput('') }} accept="*/*" />
      <Field label="Input">
        <textarea className={cx(inputClass, 'min-h-[120px] font-mono text-sm')} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste input here" />
      </Field>
      <div className="flex gap-2">
        <button type="button" className={buttonPrimary} onClick={run}>Run</button>
        <button type="button" className={buttonSecondary} onClick={() => { setInput(''); setOutput('') }}>Clear</button>
      </div>
      {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
      <Field label="Output">
        <pre className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-900 p-3 text-xs text-slate-100 dark:border-slate-700">{output}</pre>
      </Field>
      <Export fileName="UuidGenerator-output.txt" data={output} disabled={!output} />
    </div>
  )
}
