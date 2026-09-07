import { Link, useParams } from 'react-router-dom'
import { OPENINGS } from '../data/openings'
import { GameBoard } from '../components/GameBoard'
import { PageHeader } from '../components/Layout'

const CATEGORIES = ['炮类', '马类', '兵类', '相类'] as const
const LEVELS = ['入门', '中级', '高级'] as const

export function OpeningsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="OPENINGS"
        title="经典开局"
        subtitle="收錄象棋最常見的开局布局，每套含原理、优劣势、运子要点與互动棋谱。"
      />

      {CATEGORIES.map((cat) => {
        const list = OPENINGS.filter((o) => o.category === cat)
        if (list.length === 0) return null
        return (
          <section key={cat} className="mb-10">
            <h2 className="mb-3 flex items-baseline gap-3">
              <span className="font-kai text-xl text-[var(--color-cinnabar)]">{cat}</span>
              <span className="text-xs text-[var(--color-ink-3)]">{list.length} 套</span>
              <span className="h-px flex-1 bg-[var(--color-line)]" />
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((o) => (
                <Link
                  key={o.id}
                  to={`/openings/${o.id}`}
                  className="card-classic group block p-4 transition-colors hover:border-[var(--color-cinnabar)]"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-kai text-lg font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-cinnabar)]">
                      {o.name}
                    </h3>
                    <span className="text-xs text-[var(--color-cinnabar)]">{o.level}</span>
                  </div>
                  {o.alias && (
                    <p className="mt-1 text-xs text-[var(--color-ink-3)]">{o.alias}</p>
                  )}
                  <p className="mt-3 line-clamp-2 text-sm text-[var(--color-ink-2)]">
                    {o.idea}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )
      })}

      <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-[var(--color-line)] pt-6 text-xs text-[var(--color-ink-3)]">
        <span>难度标识：</span>
        {LEVELS.map((lv) => (
          <span key={lv} className="rounded border border-[var(--color-line)] px-2 py-0.5">
            {lv}
          </span>
        ))}
      </div>
    </div>
  )
}

export function OpeningDetail() {
  const { id } = useParams<{ id: string }>()
  const o = OPENINGS.find((x) => x.id === id)
  if (!o) {
    return (
      <div className="card-classic p-8 text-center text-[var(--color-ink-2)]">
        未找到该开局：{id}
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`${o.category} · ${o.level}`}
        title={o.name}
        subtitle={o.alias}
        meta={<span>{o.notation.length} 着 · 互动棋谱可试擺变化</span>}
      />

      <div className="card-classic p-5 sm:p-6">
        <h2 className="font-kai text-lg font-semibold text-[var(--color-ink)]">布局思想</h2>
        <p className="mt-2 leading-relaxed text-[var(--color-ink-2)]">{o.idea}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="card-classic p-4 sm:p-5">
          <h2 className="mb-3 font-kai text-lg font-semibold text-[var(--color-ink)]">互动棋谱</h2>
          <GameBoard notation={o.notation} notes={o.notes} interactive />
        </div>
        <div className="space-y-5">
          <div className="card-classic p-5">
            <h3 className="mb-3 font-kai text-base font-semibold text-[var(--color-ink)]">优劣势</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-xs tracking-widest text-[var(--color-cinnabar)]">优势</p>
                <ul className="space-y-1 text-sm text-[var(--color-ink-2)]">
                  {o.pros.map((p, i) => (
                    <li key={i} className="flex gap-2"><span>+</span><span>{p}</span></li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-1 text-xs tracking-widest text-[var(--color-ink-3)]">劣势</p>
                <ul className="space-y-1 text-sm text-[var(--color-ink-2)]">
                  {o.cons.map((p, i) => (
                    <li key={i} className="flex gap-2"><span>−</span><span>{p}</span></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="card-classic p-5">
            <h3 className="mb-3 font-kai text-base font-semibold text-[var(--color-ink)]">运子要点</h3>
            <ul className="space-y-2 text-sm text-[var(--color-ink-2)]">
              {o.keypoints.map((k, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-[var(--color-cinnabar)]">▍</span>
                  <span>{k}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="pt-2 text-sm">
        <Link to="/openings" className="text-[var(--color-cinnabar)] hover:underline">
          ← 返回开局庫
        </Link>
      </div>
    </div>
  )
}
