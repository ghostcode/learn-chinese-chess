import { Link, NavLink, Outlet } from 'react-router-dom'
import { LEVELS } from '../data/lessons'

const NAV: { to: string; label: string }[] = [
  { to: '/', label: '首页' },
  { to: '/basics', label: '入门' },
  { to: '/intermediate', label: '中级' },
  { to: '/advanced', label: '高级' },
  { to: '/openings', label: '开局库' },
  { to: '/tactics', label: '杀法库' },
  { to: '/review', label: '打谱' },
  { to: '/notation', label: '记谱法' },
]

export function Layout() {
  return (
    <div className="relative min-h-screen">
      {/* 顶部水墨装饰条 */}
      <div
        className="pointer-events-none absolute top-0 right-0 left-0 h-1"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, var(--color-cinnabar) 50%, transparent 100%)',
          opacity: 0.7,
        }}
      />

      <header className="border-b border-[var(--color-line)] bg-[var(--color-paper-2)]/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="seal h-10 w-10 rounded-sm text-base">弈</span>
            <div>
              <div className="font-kai text-2xl font-bold leading-none text-[var(--color-ink)]">
                弈 境
              </div>
              <div className="mt-1 text-xs tracking-widest text-[var(--color-ink-3)]">
                CHINESE CHESS · LEARN
              </div>
            </div>
          </Link>
          <nav className="flex flex-wrap gap-1 text-sm">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === '/'}
                className={({ isActive }) =>
                  `px-3 py-1.5 transition-colors ${
                    isActive
                      ? 'border-b-2 border-[var(--color-cinnabar)] text-[var(--color-cinnabar)]'
                      : 'border-b-2 border-transparent text-[var(--color-ink-2)] hover:text-[var(--color-cinnabar)]'
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
        {/* 双线分隔 */}
        <div className="rule-double mx-auto max-w-7xl" />
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-5 py-8">
        <Outlet />
      </main>

      <footer className="mt-16 border-t border-[var(--color-line)] bg-[var(--color-paper-2)]/60 py-6">
        <div className="mx-auto max-w-7xl px-5 text-center text-xs text-[var(--color-ink-3)]">
          <p>弈 境 · 中国象棋学习 · 一车十子寒，双车必胜士象全</p>
          <p className="mt-1 opacity-70">
            内容仅供学习参考 · 规则与定式如有出入以正式赛事规则为准
          </p>
        </div>
      </footer>
    </div>
  )
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  meta,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  meta?: React.ReactNode
}) {
  return (
    <header className="mb-8">
      {eyebrow && (
        <p className="mb-1 text-xs tracking-[0.4em] text-[var(--color-cinnabar)]">{eyebrow}</p>
      )}
      <h1 className="font-kai text-4xl font-bold text-[var(--color-ink)]">{title}</h1>
      {subtitle && (
        <p className="mt-2 text-base text-[var(--color-ink-2)]">{subtitle}</p>
      )}
      {meta && <div className="mt-3 text-sm text-[var(--color-ink-3)]">{meta}</div>}
    </header>
  )
}

export function LevelTabs({ active }: { active?: string }) {
  return (
    <div className="mb-6 flex flex-wrap gap-1 border-b border-[var(--color-line)]">
      {LEVELS.map((l) => (
        <NavLink
          key={l.id}
          to={`/${l.id}`}
          className={({ isActive }) =>
            `px-4 py-2 text-sm transition-colors ${
              isActive || active === l.id
                ? '-mb-px border-b-2 border-[var(--color-cinnabar)] text-[var(--color-cinnabar)]'
                : 'border-b-2 border-transparent text-[var(--color-ink-2)] hover:text-[var(--color-cinnabar)]'
            }`
          }
        >
          {l.name}
          <span className="ml-2 text-xs text-[var(--color-ink-3)]">{l.subtitle}</span>
        </NavLink>
      ))}
    </div>
  )
}
