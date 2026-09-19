import { useState, useRef } from 'react'
import QRCode from 'qrcode'
import { Field, inputClass, buttonPrimary, buttonSecondary, cx, Export } from '../../../components/ui'

export default function QrGeneratorPage() {
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [dataUrl, setDataUrl] = useState('')
  const [size, setSize] = useState(512)
  const [ec, setEc] = useState<'L' | 'M' | 'Q' | 'H'>('M')
  const [dark, setDark] = useState('#0f172a')
  const [light, setLight] = useState('#ffffff')
  const [busy, setBusy] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  async function run() {
    const text = input.trim()
    if (!text) { setError('Enter text or a URL to encode.'); setDataUrl(''); return }
    setError(''); setBusy(true)
    try {
      const url = await QRCode.toDataURL(text, { width: size, margin: 1, errorCorrectionLevel: ec, color: { dark, light } })
      setDataUrl(url)
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); setDataUrl('') }
    finally { setBusy(false) }
  }

  function download(fmt: 'png' | 'jpeg') {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `qr-generator-${fmt}.${fmt === 'jpeg' ? 'jpg' : 'png'}`
    a.click()
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <Field label="Text or URL" hint="Anything: a URL, plain text, or structured data.">
        <textarea className={cx(inputClass, 'min-h-[120px] font-mono text-sm')} value={input}
          onChange={(e) => setInput(e.target.value)} placeholder="https://example.com or Hello, world" />
      </Field>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label="Size">
          <input type="number" className={inputClass} value={size} min={64} max={2048} onChange={(e) => setSize(Math.max(64, Number(e.target.value) || 512))} />
        </Field>
        <Field label="Correction">
          <select className={inputClass} value={ec} onChange={(e) => setEc(e.target.value as 'L' | 'M' | 'Q' | 'H')}>
            <option value="L">L – low</option><option value="M">M – medium</option><option value="Q">Q – good</option><option value="H">H – high</option>
          </select>
        </Field>
        <Field label="Foreground">
          <input type="color" className="h-10 w-full rounded-lg border border-slate-200 bg-white dark:border-slate-700" value={dark} onChange={(e) => setDark(e.target.value)} />
        </Field>
        <Field label="Background">
          <input type="color" className="h-10 w-full rounded-lg border border-slate-200 bg-white dark:border-slate-700" value={light} onChange={(e) => setLight(e.target.value)} />
        </Field>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={buttonPrimary} onClick={run} disabled={busy || !input.trim()}>{busy ? 'Generating…' : 'Generate QR'}</button>
        <button type="button" className={buttonSecondary} onClick={() => download('png')} disabled={!dataUrl}>Download PNG</button>
        <button type="button" className={buttonSecondary} onClick={() => download('jpeg')} disabled={!dataUrl}>Download JPEG</button>
        <button type="button" className={buttonSecondary} onClick={() => { setInput(''); setDataUrl(''); setError('') }}>Clear</button>
      </div>
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      {dataUrl && (
        <Field label="Preview">
          <div className="inline-block rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700">
            <img src={dataUrl} alt="Generated QR code" className="mx-auto" style={{ width: Math.min(size, 320), height: Math.min(size, 320) }} />
          </div>
        </Field>
      )}
    </div>
  )
}
