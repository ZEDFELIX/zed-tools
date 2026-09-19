import type { LucideIcon } from 'lucide-react'

export type ToolCategoryId =
  | 'design'
  | 'qr'
  | 'image'
  | 'pdf'
  | 'business'
  | 'developer'
  | 'web'
  | 'text'
  | 'productivity'

export type ToolStatus = 'production' | 'beta' | 'experimental' | 'disabled'

export interface ToolProcessing {
  local?: string
  server?: string
}

export interface Tool {
  id: string
  name: string
  shortName?: string
  slug: string
  category: ToolCategoryId
  description: string
  longDescription?: string
  icon: string
  features?: string[]
  supportedInputs?: string[]
  supportedOutputs?: string[]
  status?: ToolStatus
  processing: ToolProcessing
  seoTitle?: string
  seoDescription?: string
  tips?: string[]
  related?: string[]
  component: () => Promise<{ default: React.ComponentType }>
}

export interface ToolCategory {
  id: ToolCategoryId
  name: string
  icon: string
  description: string
}

export interface ToolUsageRecord {
  toolId: string
  name: string
  slug: string
  category: ToolCategoryId
  icon: string
  lastUsed: number
  count: number
}

export interface StoredProject {
  id: string
  name: string
  type: string
  toolId: string
  data: unknown
  createdAt: number
  updatedAt: number
}

export interface FileUploadResult {
  file: File
  url: string
  width?: number
  height?: number
  size: number
  type: string
}

export interface ToolCategoryWithFeather { name: string; icon: LucideIcon; description: string }