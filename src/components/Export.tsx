import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function Export({
  label = 'Export',
  disabled,
  className,
  children,
  onClick,
  ...rest
}: {
  label?: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-disabled={disabled}
      className={className}
      {...rest}
    >
      {children ?? label}
    </button>
  )
}

export default Export