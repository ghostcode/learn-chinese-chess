import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  INITIAL_FEN,
  applyMove,
  createInitialBoard,
  generateLegalMoves,
  isCheckmate,
  isInCheck,
  isStalemate,
  parseFen,
} from './board'
import { moveToNotation, parseNotationSequence } from './notation'
import { other, type Board, type Move, type MoveRecord, type Position, type Side } from './types'

export interface UseGameOptions {
  /** 起始 FEN，默认初始局面 */
  fen?: string
  /** 先手方 */
  firstSide?: Side
  /** 预置棋谱（中文记谱文本序列），用于打谱 / 开局 / 杀法演示 */
  notation?: string[]
  /** 是否允许手动走子试摆变化 */
  interactive?: boolean
}

/**
 * 棋局状态：支持预置棋谱回放 + 手动试摆（手动走子会截断后续谱着）。
 * boards[i] 表示第 i 步之后的局面，cursor 指向当前显示的局面。
 */
export function useGame(options: UseGameOptions = {}) {
  const { fen = INITIAL_FEN, firstSide = 'red', notation = [], interactive = true } = options

  const preset = useMemo(() => {
    const board = fen === INITIAL_FEN ? createInitialBoard() : parseFen(fen).board
    const moves = parseNotationSequence(board, notation, firstSide)
    const boards: Board[] = [board]
    const records: MoveRecord[] = []
    let b = board
    for (const m of moves) {
      records.push({ ...m, notation: moveToNotation(b, m), fenAfter: '' })
      b = applyMove(b, m)
      boards.push(b)
    }
    return { boards, records }
  }, [fen, notation, firstSide])

  const [boards, setBoards] = useState<Board[]>(preset.boards)
  const [history, setHistory] = useState<MoveRecord[]>(preset.records)
  const [cursor, setCursor] = useState(0)
  const [selected, setSelected] = useState<Position | null>(null)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1500)
  const [flip, setFlip] = useState(false)

  // 局面来源变化时（切换棋谱）重置
  const presetRef = useRef(preset)
  useEffect(() => {
    if (presetRef.current !== preset) {
      presetRef.current = preset
      setBoards(preset.boards)
      setHistory(preset.records)
      setCursor(0)
      setSelected(null)
      setPlaying(false)
    }
  }, [preset])

  const board = boards[cursor]
  const sideToMove: Side = cursor % 2 === 0 ? firstSide : other(firstSide)

  const targets = useMemo(() => {
    if (!selected) return []
    const p = board[selected.row]?.[selected.col]
    if (!p || p.side !== sideToMove) return []
    return findMove(board, selected)
  }, [board, selected, sideToMove])

  const lastMove: Move | null = cursor > 0 ? (history[cursor - 1] ?? null) : null
  const check = useMemo(() => isInCheck(board, sideToMove), [board, sideToMove])

  const kingPos = useMemo(() => {
    if (!check) return null
    for (let r = 0; r < 10; r++)
      for (let c = 0; c < 9; c++) {
        const p = board[r][c]
        if (p && p.type === 'K' && p.side === sideToMove) return { row: r, col: c }
      }
    return null
  }, [board, check, sideToMove])

  const goTo = useCallback(
    (index: number) => {
      setCursor(() => {
        const max = boards.length - 1
        const next = Math.max(0, Math.min(index, max))
        return next
      })
      setSelected(null)
    },
    [boards.length],
  )

  const doMove = useCallback(
    (move: Move) => {
      const nb = applyMove(board, move)
      const record: MoveRecord = { ...move, notation: moveToNotation(board, move), fenAfter: '' }
      setBoards((prev) => [...prev.slice(0, cursor + 1), nb])
      setHistory((prev) => [...prev.slice(0, cursor), record])
      setCursor((c) => c + 1)
      setSelected(null)
    },
    [board, cursor],
  )

  const clickPoint = useCallback(
    (pos: Position) => {
      if (!interactive) return
      if (selected) {
        const m = targets.find((t) => t.to.row === pos.row && t.to.col === pos.col)
        if (m) {
          doMove(m)
          return
        }
      }
      const p = board[pos.row][pos.col]
      if (p && p.side === sideToMove) {
        setSelected(pos)
      } else {
        setSelected(null)
      }
    },
    [board, selected, targets, sideToMove, doMove, interactive],
  )

  const next = useCallback(() => {
    setCursor((c) => Math.min(c + 1, boards.length - 1))
    setSelected(null)
  }, [boards.length])

  const prev = useCallback(() => {
    setCursor((c) => Math.max(c - 1, 0))
    setSelected(null)
  }, [])

  const reset = useCallback(() => {
    setBoards(preset.boards)
    setHistory(preset.records)
    setCursor(0)
    setSelected(null)
    setPlaying(false)
  }, [preset])

  /** 回退到起始局面（清空所有变化） */
  const restart = useCallback(() => {
    setBoards([preset.boards[0]])
    setHistory([])
    setCursor(0)
    setSelected(null)
    setPlaying(false)
  }, [preset])

  const timer = useRef<number | null>(null)
  useEffect(() => {
    if (!playing) return
    if (cursor >= boards.length - 1) {
      setPlaying(false)
      return
    }
    timer.current = window.setTimeout(next, speed)
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [playing, cursor, boards.length, speed, next])

  const status = check
    ? isCheckmate(board, sideToMove)
      ? 'checkmate'
      : 'check'
    : isStalemate(board, sideToMove)
      ? 'stalemate'
      : 'playing'

  return {
    board,
    boards,
    history,
    cursor,
    turn: sideToMove,
    selected,
    targets: targets.map((m) => m.to),
    lastMove,
    check,
    checkAt: kingPos,
    status,
    playing,
    speed,
    flip,
    setFlip,
    total: boards.length - 1,
    canPrev: cursor > 0,
    canNext: cursor < boards.length - 1,
    goTo,
    next,
    prev,
    first: () => goTo(0),
    last: () => goTo(boards.length - 1),
    reset,
    restart,
    clickPoint,
    doMove,
    play: () => {
      if (cursor >= boards.length - 1) setCursor(0)
      setPlaying(true)
    },
    pause: () => setPlaying(false),
    togglePlay: () => setPlaying((v) => !v),
    setSpeed,
  }
}

function findMove(board: Board, from: Position): Move[] {
  const piece = board[from.row][from.col]
  if (!piece) return []
  return generateLegalMoves(board, piece.side).filter(
    (m) => m.from.row === from.row && m.from.col === from.col,
  )
}

export type GameApi = ReturnType<typeof useGame>
