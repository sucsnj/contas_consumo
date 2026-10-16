interface CampoValorProps {
  id: string
  valor: string
  aoAlterar: (valor: string) => void
  aoConfirmar?: () => void
  placeholder?: string
  className?: string
}

export function CampoValor({
  id,
  valor,
  aoAlterar,
  aoConfirmar,
  placeholder,
  className,
}: CampoValorProps) {
  return (
    <input
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
