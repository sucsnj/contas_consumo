import { History, RotateCcw } from 'lucide-react'
import { formatarMoeda } from '../lib/calc/format'
import { useContas } from '../store/useContas'

export function HistoricoEstados() {
  const { estado, despachar } = useContas()
  const estados = [...estado.estados].reverse()

  return (
    <section className="card">
      <h2 className="card-title">
        <History size={16} /> Histórico de estados
      </h2>
      <p className="campo-dica">No máximo 3 estados guardados para reversão.</p>

      {estados.length === 0 ? (
        <p className="vazio">Nenhum estado salvo ainda.</p>
      ) : (
        <ul className="historico-lista">
          {estados.map((registro) => (
            <li key={registro.id} className="historico-item">
              <span className="historico-desc">
                <span>
                  <span className="historico-titulo">{registro.rotulo}</span>
                  <span className="historico-meta">
                    {new Date(registro.em).toLocaleString('pt-BR')} - saldo{' '}
                    {formatarMoeda(registro.estado.saldo)} - reserva{' '}
                    {formatarMoeda(registro.estado.reserva)} - saldo2{' '}
                    {formatarMoeda(registro.estado.saldo2)}
                  </span>
                </span>
              </span>
              <button
                type="button"
                className="btn btn-outline btn-mini"
                onClick={() => despachar({ tipo: 'reverter', estado: registro.estado })}
              >
                <RotateCcw size={14} />
                Reverter
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}