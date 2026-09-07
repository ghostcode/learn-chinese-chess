import { ChessBoard } from './ChessBoard'
import { useGame } from '../engine/useGame'
import type { Side } from '../engine/types'

interface Props {
  fen?: string
  notation?: string[]
  firstSide?: Side
  interactive?: boolean
  /** 棋谱注解：索引 = 着法序号 - 1 */
  notes?: Record<number, string>
}

const SPEEDS = [
  { label: '慢', value: 2400 },
  { label: '中', value: 1500 },
  { label: '快', value: 800 },
]

export function GameBoard({ fen, notation = [], firstSide = 'red', interactive = true, notes }: Props) {
  const game = useGame({ fen, notation, firstSide, interactive })
  const { history, cursor } = game

  // 按回合分组（红先黑后）
  const rounds: { no: number; red?: number; black?: number }[] = []
  for (let i = 0; i < history.length; i++) {
    if (i % 2 === 0) rounds.push({ no: i / 2 + 1, red: i })
    else if (rounds[rounds.length - 1]) rounds[rounds.length - 1].black = i
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[auto_1fr] items-start">
      {/* 棋盘 */}
      <div className="card-classic p-3 sm:p-4 mx-auto w-full max-w-[540px]">
        <ChessBoard
          board={game.board}
          selected={game.selected}
          targets={game.targets}
          lastMove={game.lastMove}
          checkAt={game.checkAt}
          flip={game.flip}
          interactive={interactive}
          onPointClick={game.clickPoint}
          showCoords
        />

        {/* 控制条 */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 border-t border-[var(--color-line)] pt-3">
          <button className="btn-classic" onClick={game.first} disabled={!game.canPrev} title="回到开局">
            ⏮
          </button>
          <button className="btn-classic" onClick={game.prev} disabled={!game.canPrev} title="上一步">
            ◀
          </button>
          <button
            className="btn-classic"
            data-active={game.playing}
            onClick={game.togglePlay}
            disabled={history.length === 0}
            title="自动播放"
          >
            {game.playing ? '❚❚ 暂停' : '▶ 播放'}
          </button>
          <button className="btn-classic" onClick={game.next} disabled={!game.canNext} title="下一步">
            ▶
          </button>
          <button className="btn-classic" onClick={game.last} disabled={!game.canNext} title="跳到终局">
            ⏭
          </button>
          <span className="mx-1 h-5 w-px bg-[var(--color-line)]" />
          {SPEEDS.map((s) => (
            <button
              key={s.value}
              className="btn-classic"
              data-active={game.speed === s.value}
              onClick={() => game.setSpeed(s.value)}
            >
              {s.label}
            </button>
          ))}
          <span className="mx-1 h-5 w-px bg-[var(--color-line)]" />
          <button className="btn-classic" onClick={() => game.setFlip(!game.flip)} title="翻转棋盘">
            ⇅ 翻转
          </button>
          <button className="btn-classic" onClick={game.reset} title="恢复原谱">
            ↺ 复位
          </button>
        </div>

        <div className="mt-2 text-center text-xs text-[var(--color-ink-3)]">
          第 <span className="text-[var(--color-cinnabar)]">{cursor}</span> / {game.total} 着
          {game.status === 'checkmate' && <span className="ml-2 text-[var(--color-cinnabar)]">将死！</span>}
          {game.status === 'check' && <span className="ml-2 text-[var(--color-cinnabar)]">将军！</span>}
          {game.status === 'stalemate' && <span className="ml-2">困毙</span>}
        </div>
      </div>

      {/* 棋谱 */}
      <div className="card-classic p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-kai text-lg tracking-widest text-[var(--color-ink)]">棋 谱</h3>
          <span className="text-xs text-[var(--color-ink-3)]">
            {firstSide === 'red' ? '红先黑后' : '黑先红后'}
          </span>
        </div>
        <div className="max-h-[520px] overflow-y-auto pr-1 text-sm">
          {history.length === 0 && (
            <p className="py-6 text-center text-[var(--color-ink-3)]">
              尚未开始 · 点击「播放」或棋盘上的棋子自行试摆
            </p>
          )}
          <div className="grid grid-cols-[2.4rem_1fr_1fr] items-center gap-x-1 gap-y-0.5">
            {rounds.map((r) => (
              <div key={r.no} className="contents">
                <span className="text-xs text-[var(--color-ink-3)]">{r.no}.</span>
                <Cell
                  index={r.red}
                  cursor={cursor}
                  text={r.red !== undefined ? history[r.red].notation : ''}
                  side="red"
                  onClick={() => r.red !== undefined && game.goTo(r.red! + 1)}
                />
                <Cell
                  index={r.black}
                  cursor={cursor}
                  text={r.black !== undefined ? history[r.black].notation : ''}
                  side="black"
                  onClick={() => r.black !== undefined && game.goTo(r.black! + 1)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 当前着注解 */}
        {cursor > 0 && notes?.[cursor - 1] && (
          <div className="mt-3 border-l-2 border-[var(--color-cinnabar)] bg-[var(--color-paper-2)] px-3 py-2 text-sm leading-relaxed text-[var(--color-ink-2)]">
            <span className="mr-1 text-[var(--color-cinnabar)]">注</span>
            {notes[cursor - 1]}
          </div>
        )}
        {interactive && (
          <p className="mt-3 text-xs leading-relaxed text-[var(--color-ink-3)]">
            提示：可直接点击棋子试摆变化，新着法将覆盖原谱后续着法；「复位」恢复原谱。
          </p>
        )}
      </div>
    </div>
  )
}

function Cell({
  index,
  cursor,
  text,
  side,
  onClick,
}: {
  index?: number
  cursor: number
  text: string
  side: Side
  onClick: () => void
}) {
  if (index === undefined) return <span />
  const active = cursor === index + 1
  return (
    <span
      className="move-item"
      data-active={active}
      onClick={onClick}
      style={{ color: active ? undefined : side === 'red' ? 'var(--color-cinnabar)' : 'var(--color-jade)' }}
      title={text}
    >
      {text}
    </span>
  )
}
