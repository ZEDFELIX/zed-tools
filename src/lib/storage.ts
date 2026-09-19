import type { ToolUsageRecord, StoredProject } from './types'

const FAVORITES_KEY = 'zed:favorites'
const RECENT_KEY = 'zed:recent'
const THEME_KEY = 'zed:theme'
const HISTORY_KEY = 'zed:history'
const PROJECTS_KEY = 'zed:projects'

export function getFavorites(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function isFavorite(id: string): boolean {
  return getFavorites().includes(id)
}

export function toggleFavorite(id: string): boolean {
  const favorites = getFavorites()
  const index = favorites.indexOf(id)
  if (index >= 0) {
    favorites.splice(index, 1)
  } else {
    favorites.push(id)
  }
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  return index < 0
}

export function recordToolUsage(record: Omit<ToolUsageRecord, 'lastUsed' | 'count'>) {
  try {
    const recent = getRecent()
    const existing = recent.find((r) => r.toolId === record.toolId)
    if (existing) {
      existing.lastUsed = Date.now()
      existing.count += 1
    } else {
      recent.unshift({ ...record, lastUsed: Date.now(), count: 1 })
    }
    const sorted = recent.sort((a, b) => b.lastUsed - a.lastUsed).slice(0, 20)
    localStorage.setItem(RECENT_KEY, JSON.stringify(sorted))
  } catch {
    // storage unavailable
  }
}

export function getRecent(): ToolUsageRecord[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function getTheme(): 'light' | 'dark' | 'system' {
  try {
    const value = localStorage.getItem(THEME_KEY)
    return value === 'light' || value === 'dark' || value === 'system' ? value : 'system'
  } catch {
    return 'system'
  }
}

export function setTheme(theme: 'light' | 'dark' | 'system') {
  localStorage.setItem(THEME_KEY, theme)
}

export function resolveTheme(theme: 'light' | 'dark' | 'system'): 'light' | 'dark' {
  if (theme !== 'system') return theme
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function getHistory(toolId: string): Array<{ id: string; name: string; dataUrl: string; createdAt: number }> {
  try {
    const all = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '{}')
    return Array.isArray(all[toolId]) ? all[toolId] : []
  } catch {
    return []
  }
}

export function addHistory(toolId: string, name: string, dataUrl: string) {
  try {
    const all = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '{}')
    if (!Array.isArray(all[toolId])) all[toolId] = []
    all[toolId].unshift({ id: crypto.randomUUID?.() ?? String(Date.now()), name, dataUrl, createdAt: Date.now() })
    all[toolId] = all[toolId].slice(0, 30)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(all))
  } catch {
    // ignore quota errors
  }
}

export function deleteHistory(toolId: string, id: string) {
  try {
    const all = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '{}')
    all[toolId] = (all[toolId] ?? []).filter((item: { id: string }) => item.id !== id)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(all))
  } catch {
    // ignore
  }
}

export function getProjects(): StoredProject[] {
  try {
    return JSON.parse(localStorage.getItem(PROJECTS_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function saveProject(project: StoredProject) {
  const projects = getProjects()
  const index = projects.findIndex((p) => p.id === project.id)
  const updated = { ...project, updatedAt: Date.now() }
  if (index >= 0) {
    projects[index] = updated
  } else {
    projects.unshift(updated)
  }
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects.slice(0, 100)))
  return updated
}

export function deleteProject(id: string) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(getProjects().filter((p) => p.id !== id)))
}

export function duplicateProject(id: string): StoredProject | undefined {
  const project = getProjects().find((p) => p.id === id)
  if (!project) return undefined
  const copy: StoredProject = {
    ...project,
    id: crypto.randomUUID?.() ?? String(Date.now()),
    name: `${project.name} (Copy)`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  saveProject(copy)
  return copy
}