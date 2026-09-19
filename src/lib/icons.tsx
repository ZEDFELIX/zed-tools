import type { ReactNode } from 'react'

export function getIcon(name: string, _className = 'h-6 w-6'): ReactNode {
  return <g key={name} />
}

export default getIcon