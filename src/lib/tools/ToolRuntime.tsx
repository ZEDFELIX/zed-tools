import { useEffect, useState, type ReactNode } from 'react'
import QRCode from 'qrcode'
import jsQR from 'jsqr'
import { jsPDF } from 'jspdf'
import { PDFDocument, degrees } from 'pdf-lib'

type Props = { toolId: string }

const btn = 'rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-white dark:text-slate-900'
const input = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900'
const card = 'rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950'

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = name; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
function downloadText(text: string, name: string, type='text/plain') {
  downloadBlob(new Blob([text], { type }), name)
}
function useFile() {
  const [file, setFile] = useState<File | null>(null)
  return { file, input: <input className={input} type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} />, setFile }
}
function downloadDataUrl(dataUrl: string, name: string) {
  const [head, body] = dataUrl.split(',')
  const mime = head.match(/:(.*?);/)?.[1] ?? 'application/octet-stream'
  const bin = atob(body); const bytes = new Uint8Array(bin.length)
  for (let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i)
  downloadBlob(new Blob([bytes], {type:mime}), name)
}
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve,reject) => {
    const img = new Image()
    img.onload=()=>{ URL.revokeObjectURL(img.src); resolve(img) }
    img.onerror=reject; img.src=URL.createObjectURL(file)
  })
}
function Field({label,children}:{label:string,children:ReactNode}) {
  return <label className="block space-y-1"><span className="text-xs font-medium text-slate-500">{label}</span>{children}</label>
}
function Layout({children}:{children:React.ReactNode}) {
  return <div className="mx-auto w-full max-w-4xl space-y-4">{children}</div>
}

function TextTool({toolId}:{toolId:string}) {
  const [value,setValue]=useState('')
  const [second,setSecond]=useState('')
  const [result,setResult]=useState('')
  const run=()=>{
    try {
      let out=''
      if(toolId==='json-formatter'||toolId==='json-validator'||toolId==='json-minifier'){
        const parsed=JSON.parse(value); out=toolId==='json-minifier'?JSON.stringify(parsed):JSON.stringify(parsed,null,2)
      } else if(toolId==='base64-encoder') out=btoa(unescape(encodeURIComponent(value)))
      else if(toolId==='base64-decoder') out=decodeURIComponent(escape(atob(value)))
      else if(toolId==='url-encoder') out=encodeURIComponent(value)
      else if(toolId==='url-decoder') out=decodeURIComponent(value)
      else if(toolId==='slug-generator') out=value.toLowerCase().trim().normalize('NFKD').replace(/[^\w\s-]/g,'').replace(/[\s_-]+/g,'-').replace(/^-+|-+$/g,'')
      else if(toolId==='case-converter') out=value.toLowerCase().replace(/\b\w/g,m=>m.toUpperCase())
      else if(toolId==='remove-duplicate-lines') out=[...new Set(value.split(/\r?\n/))].join('\n')
      else if(toolId==='text-sorter') out=value.split(/\r?\n/).filter(Boolean).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true})).join('\n')
      else if(toolId==='text-cleaner') out=value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).join('\n')
      else if(toolId==='find-replace') out=value.split(second).join(result || second)
      else if(toolId==='text-diff') {
        const a=value.split(/\s+/), b=second.split(/\s+/); out=b.map(x=>a.includes(x)?x:`[+${x}]`).join(' ')
      } else if(toolId==='word-counter'||toolId==='character-counter') {
        const words=value.trim()?value.trim().split(/\s+/).length:0
        out=`Words: ${words}\nCharacters: ${value.length}\nCharacters (no spaces): ${value.replace(/\s/g,'').length}\nLines: ${value?value.split(/\r?\n/).length:0}`
      } else if(toolId==='lorem-ipsum-generator') out=('Lorem ipsum dolor sit amet, consectetur adipiscing elit. ').repeat(Math.max(1,Number(value)||3)).trim()
      else if(toolId==='markdown-previewer') out=value.replace(/^# (.*)$/gm,'$1\n').replace(/\*\*(.*?)\*\*/g,'$1')
      else if(toolId==='regex-tester') { const m=value.match(new RegExp(second||'.*','g')); out=JSON.stringify(m??[],null,2) }
      else if(toolId==='html-formatter'||toolId==='css-formatter'||toolId==='javascript-formatter') out=value.replace(/>\s*</g,'>\\n<').replace(/;\s*/g,';\\n').trim()
      else out=value
      setResult(out)
    } catch(e) { setResult(e instanceof Error?e.message:String(e)) }
  }
  return <Layout>
    <Field label="Input"><textarea className={input+' min-h-40 font-mono'} value={value} onChange={e=>setValue(e.target.value)} /></Field>
    {['find-replace','text-diff','regex-tester'].includes(toolId) && <Field label={toolId==='regex-tester'?'Regular expression':'Second value'}><input className={input} value={second} onChange={e=>setSecond(e.target.value)} /></Field>}
    <div className="flex gap-2"><button className={btn} onClick={run}>Run</button><button className={btn} onClick={()=>{setValue('');setSecond('');setResult('')}}>Clear</button></div>
    <Field label="Result"><textarea className={input+' min-h-40 font-mono'} readOnly value={result}/></Field>
    <button className={btn} disabled={!result} onClick={()=>downloadText(result,`${toolId}-result.txt`)}>Download result</button>
  </Layout>
}

function DeveloperTool({toolId}:{toolId:string}) {
  const [value,setValue]=useState('')
  const [result,setResult]=useState('')
  const run=async()=>{
    try {
      if(toolId==='uuid-generator') setResult(Array.from({length:Math.max(1,Number(value)||5)},()=>crypto.randomUUID()).join('\n'))
      else if(toolId==='password-generator') {
        const n=Math.max(8,Number(value)||16), chars='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*'
        const a=new Uint32Array(n); crypto.getRandomValues(a); setResult(Array.from(a,x=>chars[x%chars.length]).join(''))
      } else if(toolId==='hash-generator') {
        const data=new TextEncoder().encode(value); const h=await crypto.subtle.digest('SHA-256',data); setResult(Array.from(new Uint8Array(h),x=>x.toString(16).padStart(2,'0')).join(''))
      } else if(toolId==='timestamp-converter') {
        const n=Number(value); setResult(Number.isFinite(n)?new Date(n<1e12?n*1000:n).toISOString():new Date(value).getTime().toString())
      } else if(toolId==='url-parser') { const u=new URL(value); setResult(JSON.stringify({href:u.href,protocol:u.protocol,host:u.host,path:u.pathname,query:u.search,hash:u.hash},null,2)) }
      else if(toolId==='jwt-decoder') { const parts=value.trim().split('.'); if(parts.length!==3) throw new Error('Invalid JWT: expected three segments.'); const decode=(s:string)=>JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g,'+').replace(/_/g,'/'))))); setResult(JSON.stringify({header:decode(parts[0]),payload:decode(parts[1]),signature:parts[2]},null,2)) }
      else setResult(value)
    } catch(e){setResult(e instanceof Error?e.message:String(e))}
  }
  return <Layout><Field label={toolId==='password-generator'?'Length':'Input'}><input className={input} value={value} onChange={e=>setValue(e.target.value)} placeholder={toolId==='uuid-generator'?'Number of UUIDs':undefined}/></Field><button className={btn} onClick={run}>Generate</button><Field label="Result"><textarea className={input+' min-h-32 font-mono'} readOnly value={result}/></Field><button className={btn} disabled={!result} onClick={()=>downloadText(result,`${toolId}-result.txt`)}>Download</button></Layout>
}

function Productivity({toolId}:{toolId:string}) {
  const [a,setA]=useState(''),[b,setB]=useState(''),[result,setResult]=useState(''),[seconds,setSeconds]=useState(0),[running,setRunning]=useState(false)
  useEffect(()=>{ if(!running || seconds<=0) return; const id=window.setInterval(()=>setSeconds(s=>s-1),1000); return ()=>window.clearInterval(id)},[running,seconds])
  useEffect(()=>{ if(seconds===0) setRunning(false) },[seconds])
  const run=()=>{
    const x=Number(a), y=Number(b)
    if(toolId==='percentage-calculator') setResult(`${x} of ${y} = ${y?x/y*100:0}%`)
    else if(toolId==='tip-calculator') setResult(`Tip: ${x*y/100}\\nTotal: ${x+x*y/100}`)
    else if(toolId==='unit-converter') setResult((x*Number(b||1)).toString())
    else if(toolId==='age-calculator'){const d=new Date(a);const now=new Date();let age=now.getFullYear()-d.getFullYear();if(now<new Date(now.getFullYear(),d.getMonth(),d.getDate()))age--;setResult(String(age))}
    else if(toolId==='date-calculator'){const d1=new Date(a),d2=new Date(b);setResult(String(Math.round((d2.getTime()-d1.getTime())/86400000)))}
    else if(toolId==='timezone-converter') { const zone=b||'Africa/Nairobi'; try{setResult(new Intl.DateTimeFormat(undefined,{dateStyle:'full',timeStyle:'long',timeZone:zone}).format(new Date(a||Date.now())))}catch{setResult('Invalid IANA timezone. Example: Africa/Nairobi')}}
    else if(toolId==='currency-converter') setResult(`${x} × ${y||1} = ${x*(y||1)}`)
    else if(toolId==='pomodoro-timer'||toolId==='countdown-timer') { const n=Math.max(1,Math.floor(x||25))*60; setSeconds(n); setRunning(true); setResult('Timer started.') }
    else if(toolId==='stopwatch') { setSeconds(0); setRunning(true); setResult('Stopwatch started.') }
    else setResult(String(x+y))
  }
  return <Layout><Field label="Value / date / amount"><input className={input} value={a} onChange={e=>setA(e.target.value)} placeholder={toolId==='age-calculator'?'YYYY-MM-DD':toolId==='timezone-converter'?'Date/time':toolId.includes('timer')?'Minutes':''}/></Field><Field label={toolId==='timezone-converter'?'Target timezone (IANA)':'Second value / rate'}><input className={input} value={b} onChange={e=>setB(e.target.value)} placeholder={toolId==='timezone-converter'?'Africa/Nairobi':''}/></Field><div className="flex flex-wrap gap-2"><button className={btn} onClick={run}>{toolId.includes('timer')||toolId==='stopwatch'?'Start':'Calculate'}</button>{(toolId.includes('timer')||toolId==='stopwatch')&&<button className={btn} onClick={()=>{setRunning(false);setSeconds(0)}}>Reset</button>}</div>{(toolId.includes('timer')||toolId==='stopwatch')&&<div className={card+' text-center text-4xl font-bold tabular-nums'}>{Math.floor(seconds/60).toString().padStart(2,'0')}:{(seconds%60).toString().padStart(2,'0')}</div>}<div className={card+' whitespace-pre-wrap'}>{result||'Result will appear here.'}</div></Layout>
}

function ImageTool({toolId}:{toolId:string}) {
  const {file,input:fileInput}=useFile(); const [result,setResult]=useState(''); const [url,setUrl]=useState('')
  const [width,setWidth]=useState(''),[height,setHeight]=useState(''),[quality,setQuality]=useState('0.8'),[format,setFormat]=useState('png'),[ratio,setRatio]=useState('free')
  const run=async()=>{
    if(!file) return
    const img=await loadImage(file); let w=Number(width)||img.naturalWidth, h=Number(height)||img.naturalHeight
    if(toolId==='image-cropper' && ratio!=='free'){ const [rw,rh]=ratio.split(':').map(Number); if(w/h>rw/rh) w=Math.round(h*rw/rh); else h=Math.round(w*rh/rw) }
    const canvas=document.createElement('canvas'); canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d')!
    ctx.drawImage(img,0,0,w,h)
    if(toolId==='image-color-extractor'){const sample=ctx.getImageData(0,0,w,h).data;let r=0,g=0,b=0,n=0;for(let i=0;i<sample.length;i+=Math.max(4,Math.floor(sample.length/12000))*4){r+=sample[i];g+=sample[i+1];b+=sample[i+2];n++}setResult(`Dominant sample: #${[r/n,g/n,b/n].map(x=>Math.round(x).toString(16).padStart(2,'0')).join('')}`);return}
    if(toolId==='background-remover'){const d=ctx.getImageData(0,0,w,h),p=d.data;for(let i=0;i<p.length;i+=4){if(p[i]>235&&p[i+1]>235&&p[i+2]>235)p[i+3]=0}ctx.putImageData(d,0,0)}
    const type=format==='jpg'?'image/jpeg':format==='webp'?'image/webp':'image/png'
    const out=canvas.toDataURL(type,Number(quality)||.8);setUrl(out);setResult(`${w} × ${h} • ${format.toUpperCase()}`)
  }
  return <Layout>{fileInput}<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><input className={input} placeholder="Width" value={width} onChange={e=>setWidth(e.target.value)}/><input className={input} placeholder="Height" value={height} onChange={e=>setHeight(e.target.value)}/><select className={input} value={format} onChange={e=>setFormat(e.target.value)}><option value="png">PNG</option><option value="jpg">JPG</option><option value="webp">WebP</option></select><input className={input} placeholder="Quality 0-1" value={quality} onChange={e=>setQuality(e.target.value)}/></div><select className={input} value={ratio} onChange={e=>setRatio(e.target.value)}><option value="free">Crop: Free</option><option value="1:1">Crop: 1:1</option><option value="4:5">Crop: 4:5</option><option value="16:9">Crop: 16:9</option></select><button className={btn} disabled={!file} onClick={run}>Process image</button>{url&&<img className="max-h-96 rounded-lg border object-contain" src={url}/>}<div className={card}>{result||'Choose an image to begin.'}</div>{url&&<button className={btn} onClick={()=>downloadDataUrl(url,`${toolId}.${format}`)}>Download image</button>}</Layout>
}

function QRTool({toolId}:{toolId:string}) {
  const {file,input:fileInput}=useFile()
  const [value,setValue]=useState(''),[url,setUrl]=useState(''),[extra,setExtra]=useState(''),[result,setResult]=useState('')
  const scanner=toolId==='qr-scanner'||toolId==='qr-scanner-web'
  const run=async()=>{
    if(scanner){
      if(!file)return
      const img=await loadImage(file), canvas=document.createElement('canvas')
      canvas.width=img.naturalWidth; canvas.height=img.naturalHeight
      const ctx=canvas.getContext('2d')!; ctx.drawImage(img,0,0)
      const d=ctx.getImageData(0,0,canvas.width,canvas.height), code=jsQR(d.data,d.width,d.height)
      setResult(code?.data??'No QR code found'); return
    }
    let payload=value
    if(toolId==='whatsapp-qr') payload=`https://wa.me/${value.replace(/\D/g,'')}?${extra?`text=${encodeURIComponent(extra)}`:''}`
    if(toolId==='wifi-qr') payload=`WIFI:T:WPA;S:${value};P:${extra};;`
    if(toolId==='vcard-qr') payload=`BEGIN:VCARD\\nVERSION:3.0\\nFN:${value}\\nTEL:${extra}\\nEND:VCARD`
    setUrl(await QRCode.toDataURL(payload,{width:600,margin:2})); setResult(payload)
  }
  if(scanner)return <Layout>{fileInput}<button className={btn} disabled={!file} onClick={run}>Scan QR</button><div className={card}>{result||'Select a QR image.'}</div></Layout>
  return <Layout><Field label={toolId==='wifi-qr'?'Wi-Fi name / SSID':toolId==='vcard-qr'?'Full name':'Text or URL'}><input className={input} value={value} onChange={e=>setValue(e.target.value)}/></Field><Field label={toolId==='wifi-qr'?'Wi-Fi password':toolId==='vcard-qr'?'Phone':'Optional message'}><input className={input} value={extra} onChange={e=>setExtra(e.target.value)}/></Field><button className={btn} onClick={run}>Generate QR</button>{url&&<div className={card}><img src={url} className="mx-auto w-80"/><button className={btn+' mt-3'} onClick={()=>downloadDataUrl(url,`${toolId}.png`)}>Download PNG</button></div>}</Layout>
}

function DocumentTool({toolId}:{toolId:string}) {
  const [business,setBusiness]=useState(''),[customer,setCustomer]=useState(''),[items,setItems]=useState(''),[result,setResult]=useState('')
  const run=()=>{
    const lines=items.split('\n').filter(Boolean); const doc=new jsPDF(); doc.setFontSize(20);doc.text(toolId==='cv-builder'?'RESUME':toolId.replace(/-/g,' ').toUpperCase(),20,20)
    doc.setFontSize(11);doc.text(business||'Business / Name',20,32);doc.text(customer||'Customer / Contact',20,42)
    let y=55; for(const line of lines){doc.text(line.slice(0,100),20,y);y+=7;if(y>275){doc.addPage();y=20}}
    const blob=doc.output('blob');downloadBlob(blob,`${toolId}.pdf`);setResult('PDF generated successfully.')
  }
  return <Layout><Field label="Business / name"><input className={input} value={business} onChange={e=>setBusiness(e.target.value)}/></Field><Field label="Customer / contact"><input className={input} value={customer} onChange={e=>setCustomer(e.target.value)}/></Field><Field label="Items / details (one per line)"><textarea className={input+' min-h-40'} value={items} onChange={e=>setItems(e.target.value)}/></Field><button className={btn} onClick={run}>Generate PDF</button><div>{result}</div></Layout>
}

function PdfTool({toolId}:{toolId:string}) {
  const {file,input:fileInput}=useFile(); const [files,setFiles]=useState<File[]>([]); const [pages,setPages]=useState(''); const [result,setResult]=useState('')
  const run=async()=>{
    try{
      if(toolId==='images-to-pdf'){
        const selected=files; if(!selected.length)return
        const doc=new jsPDF()
        for(let i=0;i<selected.length;i++){const img=await loadImage(selected[i]);const w=190,h=w*img.naturalHeight/img.naturalWidth;if(i)doc.addPage();doc.addImage(img,'JPEG',10,10,w,Math.min(275,h))}
        downloadBlob(doc.output('blob'),'images-to-pdf.pdf');setResult('PDF created.')
        return
      }
      if(!file)return
      const src=await PDFDocument.load(await file.arrayBuffer()), indices=src.getPageIndices()
      let selected=indices
      if(pages.trim()) selected=pages.split(',').flatMap(part=>{const [s,e]=part.trim().split('-').map(Number);const from=Math.max(1,s||1),to=Math.min(indices.length,e||s||1);return Array.from({length:Math.max(0,to-from+1)},(_,i)=>from+i-1)}).filter(i=>i>=0&&i<indices.length)
      if(toolId==='pdf-delete-pages') selected=indices.filter(i=>!selected.includes(i))
      if(toolId==='pdf-reorder') selected=[...selected].reverse()
      if(toolId==='pdf-split'||toolId==='pdf-extract') selected=selected.length?selected:[0]
      const out=await PDFDocument.create(); const copy=await out.copyPages(src,selected)
      copy.forEach((p,i)=>{if(toolId==='pdf-rotate')p.setRotation(degrees(90));out.addPage(p)})
      const bytes=await out.save();downloadBlob(new Blob([bytes as unknown as BlobPart],{type:'application/pdf'}),`${toolId}.pdf`);setResult(`Processed ${selected.length} page(s).`)
    }catch(e){setResult(e instanceof Error?e.message:String(e))}
  }
  return <Layout>{toolId==='images-to-pdf'?<input className={input} type="file" accept="image/*" multiple onChange={e=>setFiles(Array.from(e.target.files??[]))}/>:fileInput}<Field label="Pages (e.g. 1-3,5)"><input className={input} value={pages} onChange={e=>setPages(e.target.value)} placeholder="Leave blank for all pages"/></Field><button className={btn} disabled={toolId==='images-to-pdf'?!files.length:!file} onClick={run}>{toolId==='images-to-pdf'?'Create PDF':'Process PDF'}</button><div className={card}>{result||'Choose your files to begin.'}</div></Layout>
}

function WebTool({toolId}:{toolId:string}) {
  const [url,setUrl]=useState(''),[result,setResult]=useState('')
  const run=async()=>{
    try{
      if(toolId==='url-parser'){const u=new URL(url);setResult(JSON.stringify({protocol:u.protocol,host:u.host,path:u.pathname,query:u.search,hash:u.hash},null,2));return}
      if(toolId==='robots-txt-generator')setResult(`User-agent: *\\nAllow: /\\nSitemap: ${url.replace(/\\/$/,'')}/sitemap.xml`)
      else if(toolId==='sitemap-generator')setResult(`<?xml version="1.0" encoding="UTF-8"?>\\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\\n<url><loc>${url}</loc></url>\\n</urlset>`)
      else if(toolId==='meta-tag-generator'||toolId==='open-graph-generator')setResult(`<meta name="description" content="${url}">\\n<meta property="og:title" content="${url}">`)
      else {const t=performance.now();await fetch(url,{mode:'no-cors'});setResult(`Request completed in ${Math.round(performance.now()-t)} ms (browser CORS may limit response details).`)}
    }catch(e){setResult(e instanceof Error?e.message:String(e))}
  }
  return <Layout><Field label="URL"><input className={input} value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://example.com"/></Field><button className={btn} onClick={run}>Run</button><pre className={card+' whitespace-pre-wrap'}>{result}</pre><button className={btn} disabled={!result} onClick={()=>downloadText(result,`${toolId}.txt`)}>Download</button></Layout>
}

function DesignTool({toolId}:{toolId:string}) {
  const [title,setTitle]=useState(toolId.replace(/-/g,' ')),[body,setBody]=useState(''),[bg,setBg]=useState('#111827'),[fg,setFg]=useState('#ffffff')
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080"><rect width="100%" height="100%" fill="${bg}"/><text x="80" y="180" fill="${fg}" font-family="Arial" font-size="72" font-weight="700">${title}</text><text x="80" y="300" fill="${fg}" font-family="Arial" font-size="34">${body}</text></svg>`
  return <Layout><Field label="Title"><input className={input} value={title} onChange={e=>setTitle(e.target.value)}/></Field><Field label="Text"><textarea className={input} value={body} onChange={e=>setBody(e.target.value)}/></Field><div className="flex gap-3"><input type="color" value={bg} onChange={e=>setBg(e.target.value)}/><input type="color" value={fg} onChange={e=>setFg(e.target.value)}/></div><div className={card}><div style={{background:bg,color:fg}} className="min-h-72 p-10"><h2 className="text-4xl font-bold">{title}</h2><p className="mt-5 text-xl">{body}</p></div></div><button className={btn} onClick={()=>downloadText(svg,`${toolId}.svg`,'image/svg+xml')}>Download SVG</button></Layout>
}

export default function ToolRuntime({toolId}:Props) {
  const category = toolId.includes('image')||toolId.includes('background')||toolId.includes('upscaler')?'image':
    toolId.startsWith('pdf-')||toolId==='images-to-pdf'?'pdf':
    ['qr-generator','dynamic-qr','whatsapp-qr','wifi-qr','vcard-qr','qr-landing-page','m-pesa-qr','qr-scanner-web','qr-scanner'].includes(toolId)?'qr':
    ['invoice-generator','quotation-generator','receipt-generator','payment-voucher','cv-builder','digital-business-card','link-in-bio','menu-builder'].includes(toolId)?'business':
    ['color-palette-generator','gradient-generator','font-pairing-tool','business-card-maker','id-card-maker','certificate-maker','logo-mockup-generator','screenshot-mockup-generator','social-media-post-maker','flyer-maker','poster-maker','letterhead-maker','brand-kit-generator'].includes(toolId)?'design':
    ['meta-tag-generator','open-graph-generator','robots-txt-generator','sitemap-generator','url-parser','http-header-viewer','website-performance-checker','url-shortener'].includes(toolId)?'web':
    ['uuid-generator','password-generator','hash-generator','timestamp-converter','regex-tester','markdown-previewer','html-formatter','css-formatter','javascript-formatter','json-formatter','json-validator','json-minifier','base64-encoder','base64-decoder','url-encoder','url-decoder','jwt-decoder'].includes(toolId)?'developer':
    ['word-counter','character-counter','case-converter','remove-duplicate-lines','text-sorter','text-cleaner','slug-generator','text-diff','find-replace','lorem-ipsum-generator','checklist-maker'].includes(toolId)?'text':'productivity'
  if(category==='image') return <ImageTool toolId={toolId}/>
  if(category==='pdf') return <PdfTool toolId={toolId}/>
  if(category==='qr') return <QRTool toolId={toolId}/>
  if(category==='business') return <DocumentTool toolId={toolId}/>
  if(category==='design') return <DesignTool toolId={toolId}/>
  if(category==='web') return <WebTool toolId={toolId}/>
  if(category==='developer') return <DeveloperTool toolId={toolId}/>
  if(category==='text') return <TextTool toolId={toolId}/>
  return <Productivity toolId={toolId}/>
}
