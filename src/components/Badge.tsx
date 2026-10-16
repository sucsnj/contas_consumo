import type { ReactNode } from 'react'
import type { Tom } from '../lib/situacao'

interface BadgeProps {
  tom: Tom
  children: ReactNode
}

export function Badge({ tom, children }: BadgeProps) {
  return <span className={`badge badge-${tom}`}>{children}</span>
}
