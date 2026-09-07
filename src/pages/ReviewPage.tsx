import { useMemo, useState } from 'react'
import { GameBoard } from '../components/GameBoard'
import { PageHeader } from '../components/Layout'
import { TACTICS } from '../data/tactics'
import { OPENINGS } from '../data/openings'

const PRESETS = [
  { id: 'empty', label: '空盤（自由走棋）', notation: [] as string[] },
  { id: 't-mahoupao', label: '馬後炮', notation: TACTICS.find((t) => t.id === 'mahoupao')!.notation, fen: TACTICS.find((t) => t.id === 'mahoupao')!.fen },
  { id: 't-tiemenshuan', label: '鐵門栓', notation: TACTICS.find((t) => t.id === 'tiemenshuan')!.notation, fen: TACTICS.find((t) => t.id === 'tiemenshuan')!.fen },
  { id: 't-dadaowanxin', label: '大刀剜心', notation: TACTICS.find((t) => t.id === 'dadaowanxin')!.notation, fen: TACTICS.find((t) => t.id === 'dadaowanxin')!.fen },
  { id: 'o-zhongpao', label: '中炮對屏風馬', notation: OPENINGS[0].notation },
]

export function ReviewPage() {
  const [presetId, setPresetId] = useState('t-mahoupao')
  const [text, setText] = useState(PRESETS.find((p) => p.id === 't-mahoupao')!.notation.join(' '))
  const preset = useMemo(() => PRESETS.find((p) => p.id === presetId) ?? PRESETS[0], [presetId])

  const parsed = useMemo(() => {
    const tokens = text
      .split(/[\s,，；;。]+/)
      .map((t) => t.trim())
      .filter(Boolean)
    return tokens
  }, [text])

  return (
    <div>
      <PageHeader
        eyebrow="REVIEW"
        title="打譜"
        subtitle="載入或貼上棋譜，逐步推演局面；亦可從庫中挑選範例。"
      />

      <div className="card-classic mb-6 p-5">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <span className="text-sm text-[var(--color-ink-2)]">範例：</span>
          {PRESETS.map((p) => (
            <button
              key={p.id}
              className="btn-classic"
              data-active={presetId === p.id}
              onClick={() => {
                setPresetId(p.id)
                setText(p.notation.join(' '))
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
        <label className="block text-sm text-[var(--color-ink-2)]">
          <span className="mb-1 block">貼上棋譜（以空格 / 頓號分隔，如「炮二平五 馬8进7」）</span>
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              setPresetId('custom')
            }}
            className="w-full resize-y rounded border border-[var(--color-line)] bg-[var(--color-paper)] p-3 font-kai text-sm leading-relaxed focus:border-[var(--color-cinnabar)] focus:outline-none"
            rows={3}
            placeholder="例如：炮二平五 马8进7 马二进三 车9平8"
          />
        </label>
        <p className="mt-2 text-xs text-[var(--color-ink-3)]">
          已識別 {parsed.length} 著。可在棋盤上直接點擊棋子試擺變化，按「復位」回到原譜。
        </p>
      </div>

      <div className="card-classic p-4 sm:p-5">
        <GameBoard
          fen={preset.fen}
          notation={parsed}
          interactive
        />
      </div>
    </div>
  )
}
