import QRCode from 'qrcode'

export type QrInput = { text?: string; size?: number; margin?: number; errorCorrection?: 'L' | 'M' | 'Q' | 'H'; dark?: string; light?: string }
export type QrResult = { svg: string; url?: string; width: number; height: number; text: string }

export async function toDataUrl({ text, size = 512, margin = 1, errorCorrection = 'M', dark = '#000000', light = '#ffffff' }: QrInput): Promise<QrResult> {
  const data = (text ?? '').trim()
  if (!data) throw new Error('Enter text or a URL to encode.')
  const url = await QRCode.toDataURL(data, {
    width: size, margin, errorCorrectionLevel: errorCorrection,
    color: { dark, light },
  })
  return { svg: '', url, width: size, height: size, text: data }
}

export async function toSvg({ text, size = 512, margin = 1, errorCorrection = 'M', dark = '#000000', light = '#ffffff' }: QrInput): Promise<QrResult> {
  const data = (text ?? '').trim()
  if (!data) throw new Error('Enter text or a URL to encode.')
  const svg = await QRCode.toString(data, {
    type: 'svg', width: size, margin, errorCorrectionLevel: errorCorrection, color: { dark, light },
  })
  return { svg, url: '', width: size, height: size, text: data }
}

function param(k: string, v: string, quoted = true): string {
  return `${k}=${quoted ? encodeURIComponent(v) : encodeURIComponent(v)}`
}

export function wifiPayload(opts: { ssid: string; password?: string; encryption?: 'WEP' | 'WPA' | 'nopass'; hidden?: boolean }): string {
  const { ssid, password = '', encryption = 'WPA', hidden = false } = opts
  const esc = (s: string) => s.replace(/([\\;"])/g, '\\$1')
  const type = encryption === 'nopass' || !password ? 'WPA' : encryption
  return `WIFI:T:${type};S:${esc(ssid)};P:${esc(password)};${hidden ? 'H:true;' : ''};`
}

export function vcardPayload(c: { name?: string; first?: string; last?: string; org?: string; title?: string; phone?: string; mobile?: string; email?: string; url?: string; addr?: string; note?: string }): string {
  const l: string[] = ['BEGIN:VCARD', 'VERSION:3.0']
  if (c.name) l.push(`FN:${c.name.replace(/[\\;,]/g, '')}`)
  else if (c.first || c.last) l.push(`FN:${[c.first, c.last].filter(Boolean).join(' ')}`)
  const n = `${c.last ?? ''};${c.first ?? ''};;;`
  if (c.last || c.first) l.push(`N:${n}`)
  if (c.org) l.push(`ORG:${c.org}`)
  if (c.title) l.push(`TITLE:${c.title}`)
  if (c.phone) l.push(`TEL;TYPE=WORK,VOICE:${c.phone}`)
  if (c.mobile) l.push(`TEL;TYPE=CELL:${c.mobile}`)
  if (c.email) l.push(`EMAIL:${c.email}`)
  if (c.url) l.push(`URL:${c.url}`)
  if (c.addr) l.push(`ADR;TYPE=WORK:;;${c.addr};;;;`)
  if (c.note) l.push(`NOTE:${c.note.replace(/\r?\n/g, '\\n')}`)
  l.push('END:VCARD')
  return l.join('\n')
}

export function mqttPayload(topic: string, payload: string): string {
  return `mqtt://${topic}?payload=${encodeURIComponent(payload)}`
}

export function mpesaPayload(opts: { till?: string; paybill?: string; amount?: string; name?: string; phone?: string; reference?: string }): string {
  const l: string[] = ['MPESAQR:1']
  if (opts.name) l.push(`N:${opts.name}`)
  if (opts.till) l.push(`TILL:${opts.till}`)
  if (opts.paybill) l.push(`PAYBILL:${opts.paybill}`)
  if (opts.phone) l.push(`P:${opts.phone}`)
  if (opts.amount) l.push(`A:${opts.amount}`)
  if (opts.reference) l.push(`REF:${opts.reference}`)
  l.push('')
  return l.join(';')
}

export function urlPayload(u: string): string {
  const trimmed = u.trim()
  if (!trimmed) throw new Error('Enter a URL.')
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

export async function readFromBlob(file: File): Promise<{ text: string | null; chunks: { data: Uint8Array; binaryData: number[] }[] }> {
  const { default: jsQR } = await import('jsqr')
  const buf = await file.arrayBuffer()
  const bmp = await createImageBitmap(blob)
  const w = bmp.width, h = bmp.height
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not read image.')
  ctx.drawImage(bmp, 0, 0)
  const imageData = ctx.getImageData(0, 0, w, h)
  const res = jsQR(imageData.data, w, h)
  bmp.close()
  return { text: res ? res.data : null, chunks: res ? res.chunks.map((c) => ({ data: c.data, binaryData: Array.from(c.binaryData) })) : [] }
}
