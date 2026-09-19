export function toCase(s: string, mode: string): string {
  if (mode === 'upper') return s.toUpperCase()
  if (mode === 'lower') return s.toLowerCase()
  if (mode === 'title') return s.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
  if (mode === 'sentence') return s.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (m) => m.toUpperCase())
  if (mode === 'camel') return s.toLowerCase().replace(/[^a-z0-9]+(.)/g, (_, c) => c.toUpperCase()).trim()
  if (mode === 'pascal') { const c = toCase(s, 'camel'); return c ? c[0].toUpperCase() + c.slice(1) : '' }
  if (mode === 'snake') return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
  if (mode === 'kebab') return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  if (mode === 'constant') return s.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '')
  return s
}
export function countChars(s: string) { return s.length }
export function countWords(s: string) { return s.trim() ? s.trim().split(/\s+/).length : 0 }
export function countLines(s: string) { return s ? s.split(/\r?\n/).length : 0 }
export function countSentences(s: string) { return s ? (s.match(/[^.!?]+[.!?]+/g) ?? []).length : 0 }
export function countParagraphs(s: string) { return s ? s.split(/\n\s*\n/).filter((p) => p.trim()).length : 0 }
export function readingTime(s: string, wpm = 200) { const w = countWords(s); return Math.max(1, Math.ceil(w / wpm)) }
export function speakingTime(s: string, wps = 3) { const w = countWords(s); return Math.max(1, Math.ceil(w / wps)) }
export function syllableCount(word: string) { const w = word.toLowerCase().replace(/[^a-z]/g, ''); if (!w) return 0; let c = 0; let prev = false; for (const ch of w) { if ('aeiouy'.includes(ch)) { if (!prev) c++; prev = true } else prev = false } return Math.max(1, c) }
export function fleschScore(s: string) { const w = countWords(s); const sent = countSentences(s); const syl = s.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(Boolean).reduce((n, wd) => n + syllableCount(wd), 0); if (!w || !sent) return 0; return 206.835 - 1.015 * (w / sent) - 84.6 * (syl / w) }
export function countCharsNoSpaces(s: string) { return s.replace(/\s/g, '').length }
export function stripTags(s: string, _keepOrder = true): string { void _keepOrder;  return s.replace(/<[^>]*>/g, '') }
export function stripDuplicates(s: string, _keepOrder = true) { const seen = new Set<string>(); const out: string[] = []; for (const line of s.split(/\r?\n/)) { const k = line; if (!seen.has(k)) { seen.add(k); out.push(line) } } return out.join('\n') }
export function sortLines(s: string, dir: 'asc' | 'desc', numeric = false) { const lines = s.split(/\r?\n/); lines.sort((a, b) => { const x = numeric ? parseFloat(a) || 0 : a; const y = numeric ? parseFloat(b) || 0 : b; return x < y ? -1 : x > y ? 1 : 0 }); if (dir === 'desc') lines.reverse(); return lines.join('\n') }
export function slugify(s: string) { return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '') }
export function cleanText(s: string) { return s.replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ').replace(/\s*,\s*/g, ', ').replace(/\n{3,}/g, '\n\n').trim() }
export function replaceAll(s: string, find: string, rep: string, ci = false) { if (!find) return s; const r = ci ? new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi') : new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'); return s.replace(r, rep) }
export function lcs(a: string, b: string): { added: { line: string; i: number }[]; removed: { line: string; i: number }[] } {
  const A = a.split(/\r?\n/), B = b.split(/\r?\n/)
  const n = A.length, m = B.length
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
  const added = [], removed = []; let i = 0, j = 0
  while (i < n && j < m) { if (A[i] === B[j]) { i++; j++ } else if (dp[i + 1][j] >= dp[i][j + 1]) { removed.push({ line: A[i], i }); i++ } else { added.push({ line: B[j], i: j }); j++ } }
  while (i < n) { removed.push({ line: A[i], i }); i++ }
  while (j < m) { added.push({ line: B[j], i: j }); j++ }
  return { added, removed }
}