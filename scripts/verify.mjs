/**
 * 棋谱数据校验：确认所有开局 / 杀法谱的每一着都能被正确解析且合法（不自杀）。
 * 运行：node scripts/verify.mjs
 */
import { createServer } from 'vite'

const server = await createServer({
  root: process.cwd(),
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

const board = await server.ssrLoadModule('/src/engine/board.ts')
const notation = await server.ssrLoadModule('/src/engine/notation.ts')
const { OPENINGS } = await server.ssrLoadModule('/src/data/openings.ts')
const { TACTICS } = await server.ssrLoadModule('/src/data/tactics.ts')
const { INITIAL_FEN, createInitialBoard, applyMove, isInCheck, generateLegalMoves, parseFen } = board
const { notationToMove, moveToNotation } = notation

let errors = 0
let checked = 0

function checkSequence(label, startBoard, moves, firstSide = 'red') {
  let b = startBoard
  let side = firstSide
  moves.forEach((text, i) => {
    checked++
    const m = notationToMove(b, text, side)
    if (!m) {
      console.error(`  ✗ [${label}] 第 ${i + 1} 着「${text}」无法解析（${side}方）`)
      errors++
      return
    }
    const nb = applyMove(b, m)
    if (isInCheck(nb, side)) {
      console.error(`  ✗ [${label}] 第 ${i + 1} 着「${text}」导致己方被将（自杀着法）`)
      errors++
    }
    // 反向校验记谱生成
    const gen = moveToNotation(b, m)
    if (gen !== text) {
      console.error(`  ✗ [${label}] 第 ${i + 1} 着记谱不一致：数据「${text}」 vs 引擎生成「${gen}」`)
      errors++
    }
    b = nb
    side = side === 'red' ? 'black' : 'red'
  })
  return b
}

console.log('\n=== 开局库校验 ===')
for (const o of OPENINGS) {
  const start = createInitialBoard()
  const before = errors
  const endBoard = checkSequence(o.name, start, o.notation)
  const mark = errors === before ? '✓' : '✗'
  console.log(`  ${mark} ${o.name}（${o.notation.length} 着）`)
  // 终局状态提示
  const legalRed = generateLegalMoves(endBoard, 'red').length
  const legalBlack = generateLegalMoves(endBoard, 'black').length
  if (legalRed === 0 || legalBlack === 0) {
    console.error(`    ⚠ 终局无合法着法（红 ${legalRed} / 黑 ${legalBlack}）`)
  }
}

console.log('\n=== 杀法库校验 ===')
for (const t of TACTICS) {
  const before = errors
  const { board: startBoard } = parseFen(t.fen)
  const endBoard = checkSequence(t.name, startBoard, t.notation)
  const mate =
    t.notation.length > 0 &&
    (() => {
      const side = t.notation.length % 2 === 0 ? 'black' : 'red' // 最后一手的行棋方
      return generateLegalMoves(endBoard, side === 'red' ? 'black' : 'red').length === 0
    })()
  const mark = errors === before ? '✓' : '✗'
  const mateFlag = t.mate ? (mate ? '(绝杀 ✓)' : '(标称绝杀但校验未成立 ⚠)') : mate ? '(实际绝杀)' : ''
  console.log(`  ${mark} ${t.name}（${t.notation.length} 着） ${mateFlag}`)
  if (t.mate && !mate) errors++
}

console.log(`\n合计校验 ${checked} 着，错误 ${errors} 处\n`)
await server.close()
process.exit(errors > 0 ? 1 : 0)
