import { Link, useParams } from 'react-router-dom'
import { TACTICS } from '../data/tactics'
import { GameBoard } from '../components/GameBoard'
import { PageHeader } from '../components/Layout'

export function TacticsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="TACTICS"
        title="經典殺法"
        subtitle="收錄象棋實戰中最常見的殺法與戰術，附原理、著法演示、互動局面。"
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TACTICS.map((t) => (
          <Link
            key={t.id}
            to={`/tactics/${t.id}`}
            className="card-classic group relative block p-4 transition-colors hover:border-[var(--color-cinnabar)]"
          >
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-kai text-lg font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-cinnabar)]">
                {t.name}
              </h3>
              <span className="text-xs text-[var(--color-cinnabar)]">{t.level}</span>
            </div>
            <p className="mt-1 text-xs text-[var(--color-ink-3)]">{t.kind}</p>
            <p className="mt-3 line-clamp-2 text-sm text-[var(--color-ink-2)]">
              {t.desc}
            </p>
            {t.mate && (
              <span className="absolute top-3 right-3 rounded-sm border border-[var(--color-cinnabar)] px-1.5 py-0.5 text-[10px] text-[var(--color-cinnabar)]">
                絕殺
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}

export function TacticDetail() {
  const { id } = useParams<{ id: string }>()
  const t = TACTICS.find((x) => x.id === id)
  if (!t) {
    return (
      <div className="card-classic p-8 text-center text-[var(--color-ink-2)]">
        未找到該殺法：{id}
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`${t.kind} · ${t.level}${t.mate ? ' · 絕殺' : ''}`}
        title={t.name}
        subtitle={t.desc}
      />

      <div className="card-classic p-5 sm:p-6">
        <h2 className="font-kai text-lg font-semibold text-[var(--color-ink)]">原理</h2>
        <p className="mt-2 leading-relaxed text-[var(--color-ink-2)]">{t.principle}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="card-classic p-4 sm:p-5">
          <h2 className="mb-3 font-kai text-lg font-semibold text-[var(--color-ink)]">
            互動局面
          </h2>
          <GameBoard
            fen={t.fen}
            notation={t.notation}
            notes={t.notes}
            interactive
          />
        </div>
        <div className="card-classic p-5">
          <h3 className="mb-3 font-kai text-base font-semibold text-[var(--color-ink)]">運用要點</h3>
          <ul className="space-y-2 text-sm text-[var(--color-ink-2)]">
            {t.points.map((k, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-[var(--color-cinnabar)]">▍</span>
                <span>{k}</span>
              </li>
            ))}
          </ul>
          {t.notation.length === 0 && (
            <p className="mt-3 text-xs text-[var(--color-ink-3)]">
              此殺法以典型局面展示，可自行嘗試。
            </p>
          )}
        </div>
      </div>

      <div className="pt-2 text-sm">
        <Link to="/tactics" className="text-[var(--color-cinnabar)] hover:underline">
          ← 返回殺法庫
        </Link>
      </div>
    </div>
  )
}
