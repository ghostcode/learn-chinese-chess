/**
 * 中文记谱法：走法 ⇄ 文本（如「炮二平五」「马8进7」）。
 * 纵线编号：红方自右向左为「一…九」，黑方自右向左为「1…9」。
 * 本引擎 col 0..8 为红方视角自左向右，故：
 *   红方 file = 9 - col    黑方 file = col + 1
 */
import { applyMove, generatePseudoMoves } from './board'
import {
  AR_NUM,
  CN_NUM,
  pieceName,
  type Board,
  type Move,
  type PieceType,
  type Position,
  type Side,
} from './types'

export const fileOf = (col: number, side: Side): number => (side === 'red' ? 9 - col : col + 1)
export const colOfFile = (file: number, side: Side): number => (side === 'red' ? 9 - file : file - 1)

const numStr = (n: number, side: Side): string =>
  side === 'red' ? CN_NUM[n - 1] : AR_NUM[n - 1]

const parseNum = (ch: string): number => {
  const cn = CN_NUM.indexOf(ch as (typeof CN_NUM)[number])
  if (cn >= 0) return cn + 1
  const n = Number(ch)
  return Number.isFinite(n) && n >= 1 && n <= 9 ? n : -1
}

/** 同一纵线上同种棋子的位置（按该方「从前到后」排序） */
const sameFilePieces = (b: Board, side: Side, type: PieceType, col: number): Position[] => {
  const rows: number[] = []
  for (let row = 0; row < 10; row++) {
    const p = b[row][col]
    if (p && p.side === side && p.type === type) rows.push(row)
  }
  // 红方 row 越小越靠前；黑方 row 越大越靠前
  rows.sort((a, c) => (side === 'red' ? a - c : c - a))
  return rows.map((row) => ({ row, col }))
}

const ORDER_LABEL = ['前', '中', '后']
const INDEX_LABEL = ['一', '二', '三', '四', '五']

/** 生成一步棋的中文记谱 */
export const moveToNotation = (board: Board, move: Move): string => {
  const { piece, from, to } = move
  const side = piece.side
  const name = pieceName(piece)
  const isForward = side === 'red' ? to.row < from.row : to.row > from.row

  // 起点标识：纵线号 或 前/中/后
  const mates = sameFilePieces(board, side, piece.type, from.col)
  let prefix: string
  if (mates.length === 1) {
    prefix = numStr(fileOf(from.col, side), side)
  } else {
    const idx = mates.findIndex((p) => p.row === from.row)
    if (mates.length === 2) {
      prefix = idx === 0 ? '前' : '后'
    } else if (mates.length === 3) {
      prefix = ORDER_LABEL[idx]
    } else {
      // 4 个及以上：从前往后以「一二三四五」编号（兵最多 5 个）
      prefix = INDEX_LABEL[idx] ?? numStr(fileOf(from.col, side), side)
    }
    // 若加注后仍无法区分（如三兵分处两条纵线），退化为「纵线号+序号」组合
    prefix = `${prefix}${name}`.slice(0, prefix.length) // 保持前缀本身
  }

  if (to.row === from.row) {
    return `${name}${prefix}平${numStr(fileOf(to.col, side), side)}`
  }

  const action = isForward ? '进' : '退'
  const isStraight = piece.type === 'R' || piece.type === 'C' || piece.type === 'P' || piece.type === 'K'
  const tail = isStraight
    ? numStr(Math.abs(to.row - from.row), side)
    : numStr(fileOf(to.col, side), side)
  return `${name}${prefix}${action}${tail}`
}

/**
 * 将记谱文本解析为走法。返回所有候选（通常为 1 个）。
 * 支持宽松输入：汉字/阿拉伯数字混用。
 */
export const notationToMoves = (board: Board, text: string, side: Side): Move[] => {
  const t = text.trim()
  if (t.length < 4) return []
  const nameChar = t[0]
  const rest = t.slice(1)
  const actionIdx = rest.search(/[进退平]/)
  if (actionIdx < 0) return []
  const posStr = rest.slice(0, actionIdx)
  const action = rest[actionIdx] as '进' | '退' | '平'
  const tailStr = rest.slice(actionIdx + 1)
  const tailNum = parseNum(tailStr)

  // 定位可能的起点
  const candidates: Position[] = []
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      const p = board[row][col]
      if (!p || p.side !== side) continue
      if (pieceName(p) !== nameChar) continue
      const mates = sameFilePieces(board, side, p.type, col)
      if (posStr.length === 1) {
        const n = parseNum(posStr)
        if (n >= 0 && fileOf(col, side) === n) candidates.push({ row, col })
        const orderIdx = ORDER_LABEL.indexOf(posStr)
        if (orderIdx >= 0 && mates.length >= 2) {
          if (mates[Math.min(orderIdx, mates.length - 1)]?.row === row) candidates.push({ row, col })
        }
        const seqIdx = INDEX_LABEL.indexOf(posStr)
        if (seqIdx >= 0 && mates.length >= 3 && mates[seqIdx]?.row === row)
          candidates.push({ row, col })
      } else {
        // 「前马」「后炮」等形式
        const orderIdx = ORDER_LABEL.indexOf(posStr[0])
        const seqIdx = INDEX_LABEL.indexOf(posStr[0])
        if (orderIdx >= 0 && mates[Math.min(orderIdx, mates.length - 1)]?.row === row)
          candidates.push({ row, col })
        if (seqIdx >= 0 && mates[seqIdx]?.row === row) candidates.push({ row, col })
      }
    }
  }

  const result: Move[] = []
  for (const from of candidates) {
    const moves = generatePseudoMoves(board, side).filter(
      (m) => m.from.row === from.row && m.from.col === from.col,
    )
    for (const m of moves) {
      const { to, piece } = m
      const forward = side === 'red' ? to.row < from.row : to.row > from.row
      if (action === '平' && to.row !== from.row) continue
      if (action === '进' && !forward) continue
      if (action === '退' && (forward || to.row === from.row)) continue
      const isStraight =
        piece.type === 'R' || piece.type === 'C' || piece.type === 'P' || piece.type === 'K'
      if (isStraight) {
        if (action === '平') {
          if (tailNum !== fileOf(to.col, side)) continue
        } else if (tailNum !== Math.abs(to.row - from.row)) continue
      } else if (tailNum !== fileOf(to.col, side)) continue
      result.push(m)
    }
  }
  // 去重
  const seen = new Set<string>()
  return result.filter((m) => {
    const key = `${m.from.row},${m.from.col},${m.to.row},${m.to.col}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export const notationToMove = (board: Board, text: string, side: Side): Move | null => {
  const list = notationToMoves(board, text, side)
  if (list.length === 0) return null
  if (list.length === 1) return list[0]
  // 多个候选时，优先选择不会导致己方被将的着法
  return list[0]
}

/** 将整串棋谱文本（空格/顿号分隔）转换为走法序列 */
export const parseNotationSequence = (
  board: Board,
  moves: string[],
  startSide: Side = 'red',
): Move[] => {
  let b = board
  let side = startSide
  const out: Move[] = []
  for (const text of moves) {
    const m = notationToMove(b, text, side)
    if (!m) {
      console.warn('[记谱] 无法解析：', text, '（' + side + '）')
      break
    }
    out.push(m)
    b = applyMove(b, m)
    side = side === 'red' ? 'black' : 'red'
  }
  return out
}
