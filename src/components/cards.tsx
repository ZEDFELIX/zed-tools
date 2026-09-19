import { Link } from 'react-router-dom'
import { getIcon } from '../lib/icons'
import { StatusBadge } from './ui'
import type { ToolCategoryId } from '../lib/types'
import { CATEGORY_META } from '../lib/categoryMeta'

export function ToolCard({ icon, name, slug, description, status, category }: {
  icon: string
  name: string
  slug: string
  description: string
  status?: string
  category?: ToolCategoryId
}) {
  return (
    <Link
      to={`/tools/${slug}`}
      className="group relative flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-600"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-500/10 dark:text-brand-400">
          {getIcon(icon, 'h-5 w-5')}
        </div>
        <StatusBadge status={status ?? 'production'} />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{name}</h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
      {category && (
        <span className="mt-auto inline-flex text-[11px] font-medium text-slate-400 dark:text-slate-500">
          {CATEGORY_META[category]?.name}
        </span>
      )}
    </Link>
  )
}

export function CategoryCard({ id, tools, onAll }: {
  id: ToolCategoryId
  tools: number
  onAll?: boolean
}) {
  const meta = CATEGORY_META[id]
  const href = onAll ? `/categories/${id}` : `/categories/${id}`
  return (
    <Link
      to={href}
      className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-600"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white">
        {getIcon(meta.icon, 'h-6 w-6')}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{meta.name}</h3>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{meta.description}</p>
        <p className="mt-1 text-[11px] font-medium text-brand-600 dark:text-brand-400">
          {tools} tools
        </p>
      </div>
    </Link>
  )
}