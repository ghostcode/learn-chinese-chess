/**
 * 中国象棋核心类型定义
 * 棋盘：10 行 × 9 列。row 0 = 黑方底线，row 9 = 红方底线。
 * col 0..8 从左到右（红方视角），与记谱法纵线对应。
 */

export type Side = 'red' | 'black'

/** 棋子类型（红黑共用，用 side 区分阵营） */
export type PieceType = 'K' | 'A' | 'B' | 'N' | 'R' | 'C' | 'P'
// K=将/帅  A=士/仕  B=象/相  N=马/傌  R=车/俥  C=炮  P=卒/兵

export interface Piece {
  type: PieceType
  side: Side
  /** 唯一 id，便于动画与 React key */
  id: string
}

/** 棋盘：(Piece | null)[10][9] */
export type Board = (Piece | null)[][]

export interface Position {
  row: number
  col: number
}

export interface Move {
  from: Position
  to: Position
  piece: Piece
  captured?: Piece | null
}

/** 一步棋 + 其记谱文本 */
export interface MoveRecord extends Move {
  /** 中文记谱，如「炮二平五」「马8进7」 */
  notation: string
  /** 走完此步后的 FEN，便于任意跳转 */
  fenAfter: string
}

export const BOARD_ROWS = 10
export const BOARD_COLS = 9

export const other = (s: Side): Side => (s === 'red' ? 'black' : 'red')

/** 红方汉字数字 / 黑方阿拉伯数字（记谱法约定） */
export const CN_NUM = ['一', '二', '三', '四', '五', '六', '七', '八', '九'] as const
export const AR_NUM = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const

export const PIECE_NAME_RED: Record<PieceType, string> = {
  K: '帅',
  A: '仕',
  B: '相',
  N: '马',
  R: '车',
  C: '炮',
  P: '兵',
}

export const PIECE_NAME_BLACK: Record<PieceType, string> = {
  K: '将',
  A: '士',
  B: '象',
  N: '马',
  R: '车',
  C: '炮',
  P: '卒',
}

export const pieceName = (p: Pick<Piece, 'type' | 'side'>): string =>
  p.side === 'red' ? PIECE_NAME_RED[p.type] : PIECE_NAME_BLACK[p.type]

/** 走直线（车）与斜线（马/象/士）的基础方向 */
export const ROOK_DIRS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
] as const

export const KNIGHT_DELTAS = [
  [-2, -1],
  [-2, 1],
  [-1, -2],
  [-1, 2],
  [1, -2],
  [1, 2],
  [2, -1],
  [2, 1],
] as const

export const BISHOP_DELTAS = [
  [-2, -2],
  [-2, 2],
  [2, -2],
  [2, 2],
] as const

export const ADVISOR_DELTAS = [
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1],
] as const

/** 九宫格（row, col）合法坐标 */
export const PALACE_RED: Position[] = [
  { row: 7, col: 3 },
  { row: 7, col: 5 },
  { row: 8, col: 4 },
  { row: 7, col: 4 },
  { row: 9, col: 3 },
  { row: 9, col: 5 },
  { row: 9, col: 4 },
  { row: 8, col: 3 },
  { row: 8, col: 5 },
]

export const PALACE_BLACK: Position[] = [
  { row: 0, col: 3 },
  { row: 0, col: 5 },
  { row: 1, col: 4 },
  { row: 0, col: 4 },
  { row: 2, col: 3 },
  { row: 2, col: 5 },
  { row: 2, col: 4 },
  { row: 1, col: 3 },
  { row: 1, col: 5 },
]

export const inPalace = (pos: Position, side: Side): boolean => {
  const list = side === 'red' ? PALACE_RED : PALACE_BLACK
  return list.some((p) => p.row === pos.row && p.col === pos.col)
}

/** 是否已过河（兵/卒可横走的前提） */
export const crossedRiver = (pos: Position, side: Side): boolean =>
  side === 'red' ? pos.row <= 4 : pos.row >= 5

export const inBoard = (row: number, col: number): boolean =>
  row >= 0 && row < BOARD_ROWS && col >= 0 && col < BOARD_COLS
