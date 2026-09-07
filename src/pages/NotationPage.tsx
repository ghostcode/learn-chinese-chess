import { GameBoard } from '../components/GameBoard'
import { PIECES, NOTATION_RULES } from '../data/pieces'
import { ChessBoard } from '../components/ChessBoard'
import { createInitialBoard } from '../engine/board'
import { PageHeader } from '../components/Layout'
import { useState } from 'react'

export function NotationPage() {
  return (
    <div>
      <PageHeader
        eyebrow="NOTATION"
        title="記譜法"
        subtitle="四字記一著：棋子名 + 所在縱線 + 進/退/平 + 目標。學會記譜，是讀懂棋書、自行打譜的基礎。"
      />

      {/* 棋子速查 */}
      <section className="card-classic mb-8 p-5">
        <h2 className="mb-4 font-kai text-lg font-semibold text-[var(--color-ink)]">棋子速查</h2>
        <PieceGrid />
      </section>

      {/* 记谱规则 */}
      <section className="card-classic mb-8 p-5">
        <h2 className="mb-4 font-kai text-lg font-semibold text-[var(--color-ink)]">記譜規則</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {NOTATION_RULES.map((r, i) => (
            <div key={i} className="rounded border border-[var(--color-line)] p-4">
              <h3 className="mb-2 font-kai text-base font-semibold text-[var(--color-cinnabar)]">
                {r.title}
              </h3>
              <p className="text-sm leading-relaxed text-[var(--color-ink-2)]">{r.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 示例 */}
      <section className="card-classic p-5">
        <h2 className="mb-4 font-kai text-lg font-semibold text-[var(--color-ink)]">互動示例：中炮開局</h2>
        <GameBoard
          notation={['炮二平五', '马8进7', '马二进三', '车9平8']}
          notes={{
            0: '「炮二平五」：紅方二路炮（col7）平到中路（col4），即當頭炮。',
            1: '「马8进7」：黑方 8 路马（col7）前进到 7 路（col6），構成屏風马。',
            2: '「马二进三」：紅方二路马（col7）前进到三路（col6），与红方三路马呼应。',
            3: '「车9平8」：黑方 9 路车（col8）平到 8 路（col7），准备出直车。',
          }}
          interactive
        />
      </section>
    </div>
  )
}

function PieceGrid() {
  const [hover, setHover] = useState<string | null>(null)
  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {PIECES.map((p) => (
          <button
            key={p.type}
            className={`flex flex-col items-center gap-2 rounded border p-3 transition-colors ${
              hover === p.type
                ? 'border-[var(--color-cinnabar)] bg-[var(--color-paper)]'
                : 'border-[var(--color-line)] hover:border-[var(--color-cinnabar)]'
            }`}
            onMouseEnter={() => setHover(p.type)}
            onMouseLeave={() => setHover(null)}
          >
            <div className="flex gap-2">
              <span
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 text-lg font-bold"
                style={{
                  borderColor: 'var(--color-cinnabar)',
                  color: 'var(--color-cinnabar)',
                  background: '#f7ecd6',
                }}
              >
                {p.redName}
              </span>
              <span
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 text-lg font-bold"
                style={{
                  borderColor: 'var(--color-jade)',
                  color: 'var(--color-jade)',
                  background: '#f7ecd6',
                }}
              >
                {p.blackName}
              </span>
            </div>
            <p className="text-center text-xs leading-snug text-[var(--color-ink-2)]">
              {p.move}
            </p>
            {p.proverb && (
              <p className="font-kai text-center text-[11px] text-[var(--color-cinnabar)]">
                {p.proverb}
              </p>
            )}
          </button>
        ))}
      </div>
      <div>
        {hover ? (
          <PieceDetail type={hover} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-[var(--color-ink-3)]">
            <p>懸浮查看棋子詳情，或直接瀏覽下方棋盤：</p>
            <div className="w-full max-w-[340px]">
              <ChessBoard board={createInitialBoard()} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function PieceDetail({ type }: { type: string }) {
  const p = PIECES.find((x) => x.type === type)
  if (!p) return null
  return (
    <div className="card-classic p-5">
      <h3 className="font-kai text-xl font-semibold text-[var(--color-ink)]">
        {p.redName} ／ {p.blackName}
      </h3>
      <p className="mt-1 text-sm text-[var(--color-ink-2)]">{p.move}</p>
      <ul className="mt-3 space-y-2 text-sm text-[var(--color-ink-2)]">
        {p.feature.map((f, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-[var(--color-cinnabar)]">▍</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 border-t border-[var(--color-line)] pt-3 text-sm text-[var(--color-ink-2)]">
        <span className="font-kai text-[var(--color-cinnabar)]">要點 · </span>
        {p.tips}
      </p>
    </div>
  )
}
