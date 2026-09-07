/**
 * 中国象棋规则引擎：局面表示、走法生成、将军/胜负判定。
 * 约定：row 0 为黑方底线，row 9 为红方底线；col 0..8 自左向右（红方视角）。
 */
import {
  ADVISOR_DELTAS,
  BISHOP_DELTAS,
  BOARD_COLS,
  BOARD_ROWS,
  KNIGHT_DELTAS,
  ROOK_DIRS,
  crossedRiver,
  inBoard,
  inPalace,
  other,
  type Board,
  type Move,
  type Piece,
  type PieceType,
  type Position,
  type Side,
} from './types'

let pieceSeq = 0

export const makePiece = (type: PieceType, side: Side): Piece => ({
  type,
  side,
  id: `${side}-${type}-${pieceSeq++}`,
})

export const emptyBoard = (): Board =>
  Array.from({ length: BOARD_ROWS }, () => Array.from({ length: BOARD_COLS }, () => null))

export const cloneBoard = (b: Board): Board => b.map((row) => row.map((p) => (p ? { ...p } : null)))

export const pieceAt = (b: Board, p: Position): Piece | null => {
  if (!inBoard(p.row, p.col)) return null
  return b[p.row][p.col]
}

/** 初始局面（红方在下） */
export const createInitialBoard = (): Board => {
  const b = emptyBoard()
  const backRank: PieceType[] = ['R', 'N', 'B', 'A', 'K', 'A', 'B', 'N', 'R']
  backRank.forEach((t, col) => {
    b[0][col] = makePiece(t, 'black')
    b[9][col] = makePiece(t, 'red')
  })
  b[2][1] = makePiece('C', 'black')
  b[2][7] = makePiece('C', 'black')
  b[7][1] = makePiece('C', 'red')
  b[7][7] = makePiece('C', 'red')
  for (let col = 0; col < BOARD_COLS; col += 2) {
    b[3][col] = makePiece('P', 'black')
    b[6][col] = makePiece('P', 'red')
  }
  return b
}

export const INITIAL_FEN =
  'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1'

/* ---------------------------------- FEN ---------------------------------- */

const CHAR_TO_TYPE: Record<string, PieceType> = {
  k: 'K',
  a: 'A',
  b: 'B',
  n: 'N',
  r: 'R',
  c: 'C',
  p: 'P',
}

export const parseFen = (fen: string): { board: Board; turn: Side } => {
  const [placement, turn] = fen.trim().split(/\s+/)
  const board = emptyBoard()
  placement.split('/').forEach((line, row) => {
    let col = 0
    for (const ch of line) {
      if (/\d/.test(ch)) {
        col += Number(ch)
      } else {
        const type = CHAR_TO_TYPE[ch.toLowerCase()]
        board[row][col] = makePiece(type, ch === ch.toUpperCase() ? 'red' : 'black')
        col += 1
      }
    }
  })
  return { board, turn: turn === 'b' ? 'black' : 'red' }
}

export const toFen = (board: Board, turn: Side): string => {
  const rows = board.map((row) => {
    let out = ''
    let gap = 0
    for (const p of row) {
      if (!p) {
        gap += 1
      } else {
        if (gap) {
          out += gap
          gap = 0
        }
        const ch = p.type.toLowerCase()
        out += p.side === 'red' ? ch.toUpperCase() : ch
      }
    }
    if (gap) out += gap
    return out
  })
  return `${rows.join('/')} ${turn === 'red' ? 'w' : 'b'} - - 0 1`
}

/* ------------------------------ 走法生成 ------------------------------ */

const findKing = (b: Board, side: Side): Position | null => {
  for (let row = 0; row < BOARD_ROWS; row++) {
    for (let col = 0; col < BOARD_COLS; col++) {
      const p = b[row][col]
      if (p && p.type === 'K' && p.side === side) return { row, col }
    }
  }
  return null
}

/** 某个位置是否被 side 方攻击（含将帅照面「飞将」） */
export const isAttacked = (b: Board, target: Position, bySide: Side): boolean => {
  // 车 / 炮
  for (const [dr, dc] of ROOK_DIRS) {
    let row = target.row + dr
    let col = target.col + dc
    let screen = 0
    while (inBoard(row, col)) {
      const p = b[row][col]
      if (p) {
        if (p.side === bySide) {
          if (p.type === 'R' && screen === 0) return true
          if (p.type === 'C' && screen === 1) return true
          if (p.type === 'K' && screen === 0 && dc === 0) return true // 将帅照面（同纵线）
        }
        screen += 1
        if (screen >= 2) break
      }
      row += dr
      col += dc
    }
  }
  // 马（含蹩马腿）
  for (const [dr, dc] of KNIGHT_DELTAS) {
    const row = target.row + dr
    const col = target.col + dc
    if (!inBoard(row, col)) continue
    const p = b[row][col]
    if (p && p.side === bySide && p.type === 'N') {
      // 马腿：从马的位置看，朝目标方向的相邻正交格
      const legRow = row + (Math.abs(dr) === 2 ? -Math.sign(dr) : 0)
      const legCol = col + (Math.abs(dc) === 2 ? -Math.sign(dc) : 0)
      if (!b[legRow][legCol]) return true
    }
  }
  // 兵 / 卒
  const pawnRow = bySide === 'red' ? target.row + 1 : target.row - 1
  for (const dc of [-1, 1]) {
    const col = target.col + dc
    if (inBoard(pawnRow, col)) {
      const p = b[pawnRow][col]
      if (p && p.side === bySide && p.type === 'P') return true
    }
  }
  if (inBoard(pawnRow, target.col)) {
    const p = b[pawnRow][target.col]
    if (p && p.side === bySide && p.type === 'P') return true
  }
  // 象 / 士（不会攻击到本方将，但为完整性保留；象士无法攻击河界对面，故实际很少命中）
  for (const [dr, dc] of BISHOP_DELTAS) {
    const row = target.row + dr
    const col = target.col + dc
    if (!inBoard(row, col)) continue
    const p = b[row][col]
    if (p && p.side === bySide && p.type === 'B' && !b[target.row + dr / 2][target.col + dc / 2])
      return true
  }
  for (const [dr, dc] of ADVISOR_DELTAS) {
    const row = target.row + dr
    const col = target.col + dc
    if (!inBoard(row, col)) continue
    const p = b[row][col]
    if (p && p.side === bySide && p.type === 'A') return true
  }
  return false
}

export const isInCheck = (b: Board, side: Side): boolean => {
  const king = findKing(b, side)
  if (!king) return false
  return isAttacked(b, king, other(side))
}

/** 生成某方所有伪合法走法（未过滤自杀） */
export const generatePseudoMoves = (b: Board, side: Side): Move[] => {
  const moves: Move[] = []
  for (let row = 0; row < BOARD_ROWS; row++) {
    for (let col = 0; col < BOARD_COLS; col++) {
      const piece = b[row][col]
      if (!piece || piece.side !== side) continue
      const from = { row, col }
      const push = (r: number, c: number) => {
        if (!inBoard(r, c)) return
        const target = b[r][c]
        if (target && target.side === side) return
        moves.push({ from, to: { row: r, col: c }, piece, captured: target ?? null })
      }

      switch (piece.type) {
        case 'R': {
          for (const [dr, dc] of ROOK_DIRS) {
            let r = row + dr
            let c = col + dc
            while (inBoard(r, c)) {
              const t = b[r][c]
              if (!t) {
                moves.push({ from, to: { row: r, col: c }, piece, captured: null })
              } else {
                if (t.side !== side)
                  moves.push({ from, to: { row: r, col: c }, piece, captured: t })
                break
              }
              r += dr
              c += dc
            }
          }
          break
        }
        case 'C': {
          for (const [dr, dc] of ROOK_DIRS) {
            let r = row + dr
            let c = col + dc
            let jumped = false
            while (inBoard(r, c)) {
              const t = b[r][c]
              if (!jumped) {
                if (!t) {
                  moves.push({ from, to: { row: r, col: c }, piece, captured: null })
                } else {
                  jumped = true
                }
              } else if (t) {
                if (t.side !== side)
                  moves.push({ from, to: { row: r, col: c }, piece, captured: t })
                break
              }
              r += dr
              c += dc
            }
          }
          break
        }
        case 'N': {
          for (const [dr, dc] of KNIGHT_DELTAS) {
            const r = row + dr
            const c = col + dc
            if (!inBoard(r, c)) continue
            // 蹩马腿
            const legRow = row + (Math.abs(dr) === 2 ? Math.sign(dr) : 0)
            const legCol = col + (Math.abs(dc) === 2 ? Math.sign(dc) : 0)
            if (b[legRow][legCol]) continue
            push(r, c)
          }
          break
        }
        case 'B': {
          for (const [dr, dc] of BISHOP_DELTAS) {
            const r = row + dr
            const c = col + dc
            if (!inBoard(r, c)) continue
            // 塞象眼
            if (b[row + dr / 2][col + dc / 2]) continue
            // 象不过河
            if (side === 'red' ? r < 5 : r > 4) continue
            push(r, c)
          }
          break
        }
        case 'A': {
          for (const [dr, dc] of ADVISOR_DELTAS) {
            const r = row + dr
            const c = col + dc
            if (!inBoard(r, c)) continue
            if (!inPalace({ row: r, col: c }, side)) continue
            push(r, c)
          }
          break
        }
        case 'K': {
          for (const [dr, dc] of ROOK_DIRS) {
            const r = row + dr
            const c = col + dc
            if (!inBoard(r, c)) continue
            if (!inPalace({ row: r, col: c }, side)) continue
            push(r, c)
          }
          // 飞将（照面）：同纵线且中间无子 → 直接吃掉对方将
          {
            const dir = side === 'red' ? -1 : 1
            let r = row + dir
            while (inBoard(r, col)) {
              const t = b[r][col]
              if (t) {
                if (t.type === 'K' && t.side !== side)
                  moves.push({ from, to: { row: r, col }, piece, captured: t })
                break
              }
              r += dir
            }
          }
          break
        }
        case 'P': {
          const forward = side === 'red' ? -1 : 1
          push(row + forward, col)
          if (crossedRiver({ row, col }, side)) {
            push(row, col - 1)
            push(row, col + 1)
          }
          break
        }
      }
    }
  }
  return moves
}

export const applyMove = (b: Board, move: Move): Board => {
  const nb = cloneBoard(b)
  nb[move.to.row][move.to.col] = nb[move.from.row][move.from.col]
  nb[move.from.row][move.from.col] = null
  return nb
}

/** 生成某方所有合法走法（过滤走后被将军的着法） */
export const generateLegalMoves = (b: Board, side: Side): Move[] =>
  generatePseudoMoves(b, side).filter((m) => !isInCheck(applyMove(b, m), side))

export const getLegalMovesFrom = (b: Board, from: Position): Move[] => {
  const piece = pieceAt(b, from)
  if (!piece) return []
  return generateLegalMoves(b, piece.side).filter(
    (m) => m.from.row === from.row && m.from.col === from.col,
  )
}

export const isCheckmate = (b: Board, side: Side): boolean =>
  isInCheck(b, side) && generateLegalMoves(b, side).length === 0

export const isStalemate = (b: Board, side: Side): boolean =>
  !isInCheck(b, side) && generateLegalMoves(b, side).length === 0

export const findMove = (b: Board, from: Position, to: Position): Move | undefined =>
  getLegalMovesFrom(b, from).find((m) => m.to.row === to.row && m.to.col === to.col)
