import { Link } from 'react-router-dom'
import { LEVELS } from '../data/lessons'
import { OPENINGS } from '../data/openings'
import { TACTICS } from '../data/tactics'
import { ChessBoard } from '../components/ChessBoard'
import { createInitialBoard } from '../engine/board'
import { PageHeader } from '../components/Layout'

export function HomePage() {
  return (
    <div className="space-y-14">
      {/* Hero */}
      <section className="card-classic relative overflow-hidden p-6 sm:p-10">
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="mb-2 text-xs tracking-[0.4em] text-[var(--color-cinnabar)]">
              從零到精通 · 系統化課程
            </p>
            <h1 className="font-kai text-4xl font-bold leading-tight text-[var(--color-ink)] sm:text-5xl">
              中國象棋
              <br />
              <span className="text-[var(--color-cinnabar)]">習弈之境</span>
            </h1>
            <p className="mt-5 max-w-lg leading-relaxed text-[var(--color-ink-2)]">
              從識棋盤、明走法、懂記譜，到中局戰術、殘局基礎、經典殺法，
              兼具互動棋盤與完整打譜，一站式踏入中國象棋的世界。
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/basics" className="btn-classic" data-active="true" style={{ padding: '0.6rem 1.4rem' }}>
                開始入門 →
              </Link>
              <Link to="/openings" className="btn-classic" style={{ padding: '0.6rem 1.4rem' }}>
                瀏覽開局庫
              </Link>
              <Link to="/tactics" className="btn-classic" style={{ padding: '0.6rem 1.4rem' }}>
                經典殺法
              </Link>
            </div>
          </div>
          <div className="mx-auto w-full max-w-[460px]">
            <ChessBoard board={createInitialBoard()} showCoords />
          </div>
        </div>
      </section>

      {/* 课程卡片 */}
      <section>
        <PageHeader
          eyebrow="三 階 進 階"
          title="系統課程"
          subtitle="由淺入深，每一階皆含互動棋盤。"
        />
        <div className="grid gap-5 md:grid-cols-3">
          {LEVELS.map((l) => (
            <Link
              key={l.id}
              to={`/${l.id}`}
              className="card-classic group block p-6 transition-transform hover:-translate-y-0.5"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="seal rounded-sm px-2 py-1 text-xs">{l.name}</span>
                <span className="text-xs text-[var(--color-ink-3)]">{l.chapters.length} 章</span>
              </div>
              <h3 className="font-kai text-xl font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-cinnabar)]">
                {l.subtitle}
              </h3>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[var(--color-ink-2)]">
                {l.intro}
              </p>
              <p className="mt-4 text-sm text-[var(--color-cinnabar)]">開始學習 →</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 开局与杀法 */}
      <section className="grid gap-5 lg:grid-cols-2">
        <div className="card-classic p-6">
          <h3 className="font-kai text-xl font-semibold text-[var(--color-ink)]">
            經典開局
          </h3>
          <p className="mt-1 text-sm text-[var(--color-ink-3)]">
            收錄 {OPENINGS.length} 套常見佈局，每套附原理、優劣勢與互動棋譜。
          </p>
          <ul className="mt-4 divide-y divide-[var(--color-line)]">
            {OPENINGS.slice(0, 5).map((o) => (
              <li key={o.id} className="py-2.5">
                <Link
                  to={`/openings/${o.id}`}
                  className="flex items-baseline justify-between gap-3 hover:text-[var(--color-cinnabar)]"
                >
                  <span>
                    <span className="font-kai">{o.name}</span>
                    {o.alias && (
                      <span className="ml-2 text-xs text-[var(--color-ink-3)]">
                        {o.alias}
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-[var(--color-cinnabar)]">{o.level}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/openings" className="mt-4 inline-block text-sm text-[var(--color-cinnabar)]">
            查看全部開局 →
          </Link>
        </div>

        <div className="card-classic p-6">
          <h3 className="font-kai text-xl font-semibold text-[var(--color-ink)]">
            經典殺法
          </h3>
          <p className="mt-1 text-sm text-[var(--color-ink-3)]">
            收錄 {TACTICS.length} 種常用殺法，附原理講解、著法演示與互動局面。
          </p>
          <ul className="mt-4 divide-y divide-[var(--color-line)]">
            {TACTICS.slice(0, 5).map((t) => (
              <li key={t.id} className="py-2.5">
                <Link
                  to={`/tactics/${t.id}`}
                  className="flex items-baseline justify-between gap-3 hover:text-[var(--color-cinnabar)]"
                >
                  <span>
                    <span className="font-kai">{t.name}</span>
                    {t.mate && (
                      <span className="ml-2 text-xs text-[var(--color-cinnabar)]">絕殺</span>
                    )}
                  </span>
                  <span className="text-xs text-[var(--color-cinnabar)]">{t.level}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/tactics" className="mt-4 inline-block text-sm text-[var(--color-cinnabar)]">
            查看全部殺法 →
          </Link>
        </div>
      </section>

      {/* 名言 */}
      <section className="card-classic relative px-6 py-10 text-center sm:px-12">
        <p className="font-kai text-2xl leading-relaxed text-[var(--color-ink-2)] sm:text-3xl">
          「一車十子寒，雙車必勝士象全。」
        </p>
        <p className="mt-3 text-sm tracking-widest text-[var(--color-ink-3)]">
          — 象棋古諺
        </p>
      </section>
    </div>
  )
}
