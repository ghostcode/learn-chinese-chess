import { PIECE_NAME_BLACK, PIECE_NAME_RED, type Board, type Move, type Position } from '../engine/types'

export const CELL = 56
export const MARGIN = 30
export const BOARD_W = MARGIN * 2 + CELL * 8
export const BOARD_H = MARGIN * 2 + CELL * 9

export const toX = (col: number) => MARGIN + col * CELL
export const toY = (row: number) => MARGIN + row * CELL

const PAWN_POINTS: Position[] = [
  { row: 3, col: 0 },
  { row: 3, col: 2 },
  { row: 3, col: 4 },
  { row: 3, col: 6 },
  { row: 3, col: 8 },
  { row: 6, col: 0 },
  { row: 6, col: 2 },
  { row: 6, col: 4 },
  { row: 6, col: 6 },
  { row: 6, col: 8 },
]

const CANNON_POINTS: Position[] = [
  { row: 2, col: 1 },
  { row: 2, col: 7 },
  { row: 7, col: 1 },
  { row: 7, col: 7 },
]

/** 位置标记（L 形角标） */
function PointMark({ row, col }: Position) {
  const x = toX(col)
  const y = toY(row)
  const d = 5
  const l = 12
  const marks: string[] = []
  if (col > 0) {
    marks.push(`M ${x - d - l} ${y - d} L ${x - d} ${y - d} L ${x - d} ${y - d - l}`)
    marks.push(`M ${x - d - l} ${y + d} L ${x - d} ${y + d} L ${x - d} ${y + d + l}`)
  }
  if (col < 8) {
    marks.push(`M ${x + d + l} ${y - d} L ${x + d} ${y - d} L ${x + d} ${y - d - l}`)
    marks.push(`M ${x + d + l} ${y + d} L ${x + d} ${y + d} L ${x + d} ${y + d + l}`)
  }
  return (
    <path
      d={marks.join(' ')}
      fill="none"
      stroke="var(--color-board-line)"
      strokeWidth={1.4}
      opacity={0.85}
    />
  )
}

interface PieceProps {
  type: keyof typeof PIECE_NAME_RED
  side: 'red' | 'black'
  x: number
  y: number
  animate?: boolean
}

export function PieceGlyph({ type, side, x, y, animate }: PieceProps) {
  const r = CELL * 0.42
  const label = side === 'red' ? PIECE_NAME_RED[type] : PIECE_NAME_BLACK[type]
  const main = side === 'red' ? 'var(--color-cinnabar)' : 'var(--color-jade)'
  return (
    <g className={animate ? 'piece-drop' : undefined} style={{ transformOrigin: `${x}px ${y}px` }}>
      <ellipse cx={x} cy={y + 2.5} rx={r} ry={r * 0.97} fill="rgba(60,45,25,0.22)" />
      <circle cx={x} cy={y} r={r} fill="#f7ecd6" stroke={main} strokeWidth={1.6} />
      <circle cx={x} cy={y} r={r - 3.5} fill="none" stroke={main} strokeWidth={0.7} opacity={0.55} />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={CELL * 0.52}
        fontFamily="var(--font-kai)"
        fontWeight={600}
        fill={main}
        style={{ userSelect: 'none' }}
      >
        {label}
      </text>
    </g>
  )
}

interface BoardProps {
  board: Board
  selected?: Position | null
  targets?: Position[]
  lastMove?: Move | null
  checkAt?: Position | null
  flip?: boolean
  interactive?: boolean
  onPointClick?: (pos: Position) => void
  /** 棋盘边注：显示纵线编号 */
  showCoords?: boolean
}

export function ChessBoard({
  board,
  selected,
  targets = [],
  lastMove,
  checkAt,
  flip = false,
  interactive = true,
  onPointClick,
  showCoords = false,
}: BoardProps) {
  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!interactive || !onPointClick) return
    const rect = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - rect.left) * (BOARD_W / rect.width)
    const py = (e.clientY - rect.top) * (BOARD_H / rect.height)
    const col = Math.round((px - MARGIN) / CELL)
    const row = Math.round((py - MARGIN) / CELL)
    if (row < 0 || row > 9 || col < 0 || col > 8) return
    onPointClick(
      flip ? { row: 9 - row, col: 8 - col } : { row, col },
    )
  }

  const view = (p: Position): Position => (flip ? { row: 9 - p.row, col: 8 - p.col } : p)

  return (
    <svg
      viewBox={`0 0 ${BOARD_W} ${BOARD_H}`}
      width="100%"
      style={{ maxWidth: BOARD_W, cursor: interactive && onPointClick ? 'pointer' : 'default' }}
      onClick={handleClick}
      role="img"
      aria-label="中国象棋棋盘"
    >
      <defs>
        <radialGradient id="boardWood" cx="50%" cy="40%" r="75%">
          <stop offset="0%" stopColor="#f0dcb0" />
          <stop offset="100%" stopColor="#dcc088" />
        </radialGradient>
        <filter id="boardShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="#5a4526" floodOpacity="0.28" />
        </filter>
      </defs>

      {/* 棋盘底 */}
      <rect
        x={4}
        y={4}
        width={BOARD_W - 8}
        height={BOARD_H - 8}
        rx={4}
        fill="url(#boardWood)"
        stroke="#a8874f"
        strokeWidth={2}
        filter="url(#boardShadow)"
      />
      <rect
        x={10}
        y={10}
        width={BOARD_W - 20}
        height={BOARD_H - 20}
        rx={2}
        fill="none"
        stroke="var(--color-board-line)"
        strokeWidth={1}
        opacity={0.5}
      />

      {/* 横线 */}
      {Array.from({ length: 10 }, (_, i) => (
        <line
          key={`h${i}`}
          x1={toX(0)}
          y1={toY(i)}
          x2={toX(8)}
          y2={toY(i)}
          stroke="var(--color-board-line)"
          strokeWidth={1.4}
        />
      ))}

      {/* 竖线（河界处断开，最外两列不断） */}
      {Array.from({ length: 9 }, (_, i) => (
        <g key={`v${i}`}>
          {i === 0 || i === 8 ? (
            <line
              x1={toX(i)}
              y1={toY(0)}
              x2={toX(i)}
              y2={toY(9)}
              stroke="var(--color-board-line)"
              strokeWidth={1.4}
            />
          ) : (
            <>
              <line
                x1={toX(i)}
                y1={toY(0)}
                x2={toX(i)}
                y2={toY(4)}
                stroke="var(--color-board-line)"
                strokeWidth={1.4}
              />
              <line
                x1={toX(i)}
                y1={toY(5)}
                x2={toX(i)}
                y2={toY(9)}
                stroke="var(--color-board-line)"
                strokeWidth={1.4}
              />
            </>
          )}
        </g>
      ))}

      {/* 九宫斜线 */}
      <line x1={toX(3)} y1={toY(0)} x2={toX(5)} y2={toY(2)} stroke="var(--color-board-line)" strokeWidth={1.4} />
      <line x1={toX(5)} y1={toY(0)} x2={toX(3)} y2={toY(2)} stroke="var(--color-board-line)" strokeWidth={1.4} />
      <line x1={toX(3)} y1={toY(7)} x2={toX(5)} y2={toY(9)} stroke="var(--color-board-line)" strokeWidth={1.4} />
      <line x1={toX(5)} y1={toY(7)} x2={toX(3)} y2={toY(9)} stroke="var(--color-board-line)" strokeWidth={1.4} />

      {/* 位置标记 */}
      {[...CANNON_POINTS, ...PAWN_POINTS].map((p, i) => (
        <PointMark key={i} row={p.row} col={p.col} />
      ))}

      {/* 楚河汉界 */}
      <g
        fill="#6b5433"
        opacity={0.72}
        fontFamily="var(--font-kai)"
        fontSize={26}
        letterSpacing="10"
        style={{ userSelect: 'none' }}
      >
        <text x={toX(1)} y={toY(4) + CELL / 2 + 9} textAnchor="middle">
          楚 河
        </text>
        <text x={toX(7)} y={toY(4) + CELL / 2 + 9} textAnchor="middle">
          汉 界
        </text>
      </g>

      {/* 纵线编号（边注） */}
      {showCoords && (
        <g fontSize={12} fill="var(--color-ink-3)" fontFamily="var(--font-kai)">
          {Array.from({ length: 9 }, (_, i) => (
            <text key={`bc${i}`} x={toX(i)} y={BOARD_H - 10} textAnchor="middle">
              {['一', '二', '三', '四', '五', '六', '七', '八', '九'][8 - i]}
            </text>
          ))}
          {Array.from({ length: 9 }, (_, i) => (
            <text key={`tc${i}`} x={toX(i)} y={16} textAnchor="middle">
              {i + 1}
            </text>
          ))}
        </g>
      )}

      {/* 上一步标记 */}
      {lastMove &&
        [lastMove.from, lastMove.to].map((p, i) => {
          const v = view(p)
          return (
            <rect
              key={`lm${i}`}
              x={toX(v.col) - CELL * 0.46}
              y={toY(v.row) - CELL * 0.46}
              width={CELL * 0.92}
              height={CELL * 0.92}
              fill="none"
              stroke="var(--color-cinnabar)"
              strokeWidth={2}
              opacity={0.75}
              rx={2}
            />
          )
        })}

      {/* 将军提示 */}
      {checkAt &&
        (() => {
          const v = view(checkAt)
          return (
            <circle
              cx={toX(v.col)}
              cy={toY(v.row)}
              r={CELL * 0.5}
              fill="none"
              stroke="var(--color-cinnabar)"
              strokeWidth={2.5}
              opacity={0.9}
            />
          )
        })()}

      {/* 可走点 */}
      {targets.map((p) => {
        const v = view(p)
        const occupied = board[p.row][p.col]
        const cx = toX(v.col)
        const cy = toY(v.row)
        return occupied ? (
          <circle
            key={`t${p.row},${p.col}`}
            cx={cx}
            cy={cy}
            r={CELL * 0.46}
            fill="none"
            stroke="var(--color-cinnabar)"
            strokeWidth={2.5}
            strokeDasharray="5 4"
            opacity={0.85}
          />
        ) : (
          <circle
            key={`t${p.row},${p.col}`}
            cx={cx}
            cy={cy}
            r={6}
            fill="var(--color-cinnabar)"
            opacity={0.55}
          />
        )
      })}

      {/* 选中框 */}
      {selected &&
        (() => {
          const v = view(selected)
          return (
            <rect
              x={toX(v.col) - CELL * 0.48}
              y={toY(v.row) - CELL * 0.48}
              width={CELL * 0.96}
              height={CELL * 0.96}
              fill="rgba(158,43,37,0.08)"
              stroke="var(--color-cinnabar)"
              strokeWidth={2.5}
              rx={3}
            />
          )
        })()}

      {/* 棋子 */}
      {board.map((row, r) =>
        row.map((piece, c) => {
          if (!piece) return null
          const v = view({ row: r, col: c })
          const isLast = lastMove?.to.row === r && lastMove?.to.col === c
          return (
            <PieceGlyph
              key={piece.id}
              type={piece.type}
              side={piece.side}
              x={toX(v.col)}
              y={toY(v.row)}
              animate={isLast}
            />
          )
        }),
      )}
    </svg>
  )
}
