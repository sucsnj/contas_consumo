import { useEffect, useRef } from 'react'

interface CampoValorProps {
  id: string
  valor: string
  aoAlterar: (valor: string) => void
  aoConfirmar?: () => void
  placeholder?: string
  className?: string
  autoFocar?: boolean
}

export function CampoValor({
  id,
  valor,
  aoAlterar,
  aoConfirmar,
  placeholder,
  className,
  autoFocar = false,
}: CampoValorProps) {
  const referencia = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!autoFocar) return
    referencia.current?.focus()
    referencia.current?.select()
  }, [autoFocar])

  return (
    <input
      ref={referencia}
      id={id}
      className={className === undefined ? 'input' : `input ${className}`}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={valor}
      placeholder={placeholder}
      onChange={(evento) => aoAlterar(evento.target.value)}
      onKeyDown={(evento) => {
        if (evento.key === 'Enter' && aoConfirmar !== undefined) aoConfirmar()
      }}
    />
  )
}
