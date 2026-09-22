import { useEffect, useMemo, useState } from 'react'
import { HashRouter, Link, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowRight, Check, ChevronRight, Command, Moon, Search, Sparkles, Sun,
  Wrench, X, Zap,
} from 'lucide-react'
import { getCategories, getCategoryTools, getPopularTools, getRelatedTools, getTool, searchTools } from './lib/tools'
import { CATEGORY_META } from './lib/categoryMeta'
import { getIcon } from './lib/icons'
import type { ToolCategoryId } from './lib/types'
import './App.css'

function Layout() {
  const [dark, setDark] = useState(() => localStorage.getItem('zed-theme') === 'dark')
  const [query, setQuery] = useState('')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('zed-theme', dark ? 'dark' : 'light')
  }, [dark])

  const results = useMemo(() => searchTools(query).slice(0, 8), [query])

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link to="/" className="brand" aria-label="ZED Tools home">
          <span className="brand-mark"><Wrench size={17} /></span>
          <span>ZED <b>Tools</b></span>
        </Link>

        <div className="header-search">
          <Search size={17} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && setQuery('')}
            placeholder="Search tools..."
            aria-label="Search tools"
          />
          {query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={16} /></button>}
          {!query && <kbd><Command size={12} /> K</kbd>}
          {query && results.length > 0 && (
            <div className="search-popover">
              {results.map((tool) => (
                <Link key={tool.id} to={'/tools/' + tool.slug} onClick={() => setQuery('')}>
                  <span className="mini-icon">{getIcon(tool.icon, 'w-4 h-4')}</span>
                  <span><strong>{tool.name}</strong><small>{CATEGORY_META[tool.category].name}</small></span>
                  <ChevronRight size={15} />
                </Link>
              ))}
              <div className="search-footer">{searchTools(query).length} matching tools</div>
            </div>
          )}
        </div>

        <nav className="top-nav">
          <Link to="/categories">Categories</Link>
          <Link to="/tools">All tools</Link>
          <button className="theme-toggle" onClick={() => setDark(!dark)} aria-label="Toggle theme">
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </nav>
      </header>

      <main><Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tools" element={<ToolsPage />} />
        <Route path="/tools/:slug" element={<ToolPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/categories/:category" element={<CategoryPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes></main>

      <footer className="site-footer">
        <div><strong>ZED Tools</strong><span>Useful tools. No clutter.</span></div>
        <span>Built for creators, businesses & everyday work.</span>
      </footer>
    </div>
  )
}

function Home() {
  const popular = getPopularTools(8)
  const categories = getCategories()
  return <div>
    <section className="hero-section">
      <div className="hero-glow" />
      <div className="eyebrow"><Sparkles size={15} /> ZED TOOLS</div>
      <h1>Powerful tools.<br /><span>Simple to use.</span></h1>
      <p>Design, images, PDFs, QR codes, business and productivity tools — all in one clean workspace.</p>
      <div className="hero-actions">
        <Link className="button primary" to="/tools">Explore all tools <ArrowRight size={17} /></Link>
        <Link className="button secondary" to="/categories">Browse categories</Link>
      </div>
      <div className="hero-note"><Check size={14} /> Browser-first &nbsp; <Check size={14} /> Fast &nbsp; <Check size={14} /> No clutter</div>
    </section>

    <section className="content-section">
      <div className="section-heading"><div><span className="section-kicker">START HERE</span><h2>Popular tools</h2></div><Link to="/tools">View all <ArrowRight size={16} /></Link></div>
      <div className="tool-grid">{popular.map((tool) => <ToolCard key={tool.id} tool={tool} />)}</div>
    </section>

    <section className="content-section category-section">
      <div className="section-heading"><div><span className="section-kicker">ORGANIZED</span><h2>Find the right tool</h2></div><Link to="/categories">All categories <ArrowRight size={16} /></Link></div>
      <div className="category-grid">{categories.map((category) => {
        const count = getCategoryTools(category.id).length
        return <Link className="category-card" key={category.id} to={'/categories/' + category.id}>
          <span className="category-icon">{getIcon(category.icon, 'w-5 h-5')}</span>
          <span><strong>{category.name}</strong><small>{category.description}</small><em>{count} tools <ArrowRight size={13} /></em></span>
        </Link>
      })}</div>
    </section>
  </div>
}

function ToolCard({ tool }: { tool: ReturnType<typeof getPopularTools>[number] }) {
  return <Link className="tool-card" to={'/tools/' + tool.slug}>
    <div className="tool-card-top"><span className="tool-icon">{getIcon(tool.icon, 'w-5 h-5')}</span><span className="status">{tool.status ?? 'production'}</span></div>
    <strong>{tool.name}</strong>
    <p>{tool.description}</p>
    <span className="tool-open">Open tool <ArrowRight size={14} /></span>
  </Link>
}

function ToolsPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<'all' | ToolCategoryId>('all')
  const categories = getCategories()
  const tools = category === 'all'
    ? (query ? searchTools(query) : getPopularTools(100))
    : getCategoryTools(category).filter((tool) => !query || searchTools(query).some((x) => x.id === tool.id))
  const all = category === 'all' && !query ? Object.values(categories).flatMap((c) => getCategoryTools(c.id)) : tools

  return <section className="listing-page">
    <div className="page-heading"><span className="section-kicker">ZED TOOLS</span><h1>All tools</h1><p>Everything you need, organized in one place.</p></div>
    <div className="filter-bar">
      <div className="inline-search"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search every tool..." /></div>
      <select value={category} onChange={(e) => setCategory(e.target.value as typeof category)}><option value="all">All categories</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
    </div>
    <div className="tool-grid">{all.map((tool) => <ToolCard key={tool.id} tool={tool} />)}</div>
    {!all.length && <Empty text="No tools match that search." />}
  </section>
}

function CategoriesPage() {
  return <section className="listing-page"><div className="page-heading"><span className="section-kicker">EXPLORE</span><h1>Categories</h1><p>Pick a category and get straight to work.</p></div>
    <div className="category-grid large">{getCategories().map((c) => <Link className="category-card" key={c.id} to={'/categories/' + c.id}><span className="category-icon">{getIcon(c.icon, 'w-5 h-5')}</span><span><strong>{c.name}</strong><small>{c.description}</small><em>{getCategoryTools(c.id).length} tools <ArrowRight size={13} /></em></span></Link>)}</div>
  </section>
}

function CategoryPage() {
  const { category } = useParams()
  const meta = category ? CATEGORY_META[category as ToolCategoryId] : undefined
  const tools = category && meta ? getCategoryTools(category as ToolCategoryId) : []
  if (!meta) return <NotFound />
  return <section className="listing-page"><Link className="back-link" to="/categories">← All categories</Link><div className="page-heading"><span className="category-icon heading-icon">{getIcon(meta.icon, 'w-6 h-6')}</span><h1>{meta.name}</h1><p>{meta.description}</p></div><div className="tool-grid">{tools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}</div></section>
}

function ToolPage() {
  const { slug } = useParams()
  const tool = slug ? getTool(slug) : undefined
  const navigate = useNavigate()
  const [Component, setComponent] = useState<React.ComponentType | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    if (!tool) return
    setComponent(null)
    setError(false)
    tool.component().then((mod) => active && setComponent(() => mod.default)).catch(() => active && setError(true))
    return () => { active = false }
  }, [tool])

  if (!tool) return <NotFound />
  const related = getRelatedTools(tool, 4)
  return <section className="tool-page">
    <button className="back-link buttonless" onClick={() => navigate(-1)}>← Back</button>
    <div className="tool-page-heading"><div><span className="tool-icon big">{getIcon(tool.icon, 'w-6 h-6')}</span></div><div><span className="section-kicker">{CATEGORY_META[tool.category].name}</span><h1>{tool.name}</h1><p>{tool.description}</p></div></div>
    <div className="tool-workspace">
      {error ? <Empty text="This tool could not be loaded. Try refreshing the page." /> : Component ? <Component /> : <div className="loading"><span className="loader" />Loading tool...</div>}
    </div>
    {related.length > 0 && <div className="related"><div className="section-heading"><div><span className="section-kicker">KEEP GOING</span><h2>Related tools</h2></div></div><div className="tool-grid">{related.map((item) => <ToolCard key={item.id} tool={item} />)}</div></div>}
  </section>
}

function Empty({ text }: { text: string }) { return <div className="empty"><Zap size={22} /><p>{text}</p></div> }
function NotFound() { return <section className="not-found"><Wrench size={34} /><h1>Page not found</h1><p>The page you're looking for doesn't exist.</p><Link className="button primary" to="/">Back home</Link></section> }

export default function App() {
  return <HashRouter><Layout /></HashRouter>
}
