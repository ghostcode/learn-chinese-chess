import { useEffect } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { LEVELS, type Level } from '../data/lessons'
import { GameBoard } from '../components/GameBoard'
import { LevelTabs, PageHeader } from '../components/Layout'

export function LevelPage() {
  const { levelId } = useParams<{ levelId: string }>()
  const level: Level | undefined = LEVELS.find((l) => l.id === levelId)

  useEffect(() => {
    if (level) {
      const hash = window.location.hash.replace('#', '')
      if (hash) {
        const el = document.getElementById(hash)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }, [level, levelId])

  // :levelId 是动态段，会匹配任意单段路径（如 /foobar）。
  // 非法路径直接回首页，避免出现「未找到课程」的死角。
  if (!level) {
    return <Navigate to="/" replace />
  }

  return (
    <div>
      <LevelTabs active={level.id} />
      <PageHeader
        eyebrow={level.name}
        title={level.subtitle}
        subtitle={level.intro}
      />

      <div className="space-y-12">
        {level.chapters.map((c, i) => (
          <article key={c.id} id={c.id} className="card-classic scroll-mt-24 p-6 sm:p-8">
            <header className="mb-4 flex items-baseline gap-3">
              <span className="font-kai text-2xl text-[var(--color-cinnabar)]">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h2 className="font-kai text-2xl font-semibold text-[var(--color-ink)]">
                {c.title}
              </h2>
            </header>
            <p className="mb-5 text-sm text-[var(--color-ink-2)]">{c.summary}</p>

            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <div className="space-y-5">
                {c.sections.map((s, j) => (
                  <section key={j}>
                    <h3 className="mb-2 font-kai text-lg font-semibold text-[var(--color-ink)]">
                      {s.heading}
                    </h3>
                    <p className="leading-relaxed text-[var(--color-ink-2)]">{s.body}</p>
                    {s.bullets && (
                      <ul className="mt-2 space-y-1.5 text-sm text-[var(--color-ink-2)]">
                        {s.bullets.map((b, k) => (
                          <li key={k} className="flex gap-2">
                            <span className="mt-2 inline-block h-1 w-1 flex-shrink-0 rounded-full bg-[var(--color-cinnabar)]" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                ))}
              </div>

              <aside className="space-y-4">
                {c.board && (
                  <div className="rounded border border-[var(--color-line)] bg-[var(--color-paper)] p-3">
                    <p className="mb-2 text-center text-xs tracking-widest text-[var(--color-ink-3)]">
                      互 动 棋 盘
                    </p>
                    <GameBoard
                      fen={c.board.fen}
                      notation={c.board.notation}
                      interactive
                      notes={c.board.notes}
                    />
                  </div>
                )}
              </aside>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
