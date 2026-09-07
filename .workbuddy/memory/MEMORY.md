# learn-chinese-chess

中国象棋学习网站（弈境）。Vite 8 + React 19 + TypeScript 6 + Tailwind v4 + React Router 7。

## 启动

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 类型检查 + 生产构建
node scripts/verify.mjs   # 校验开局/杀法棋谱数据合法性
```

## 架构

```
src/
├── engine/             # 纯 TS 规则引擎（不依赖 React）
│   ├── types.ts        # 类型、坐标转换、九宫/河界判定
│   ├── board.ts        # FEN 解析、合法走法、将帅照面、胜负
│   ├── notation.ts     # 中文记谱法双向解析（炮二平五 ⇄ 走法）
│   └── useGame.ts      # 棋局 Hook：预置谱 + 手动走子 + 自动播放
├── components/
│   ├── ChessBoard.tsx  # 古典风格 SVG 棋盘（宣纸木色 + 楚河汉界 + 标记点）
│   ├── GameBoard.tsx   # 棋盘 + 棋谱列表 + 控制条（复用组件）
│   └── Layout.tsx      # 顶部导航 + 页面 Header
├── pages/              # 路由页：Home / Level / Openings / Tactics / Review / Notation
├── data/
│   ├── pieces.ts       # 棋子图鉴数据
│   ├── openings.ts     # 10 套经典开局（含棋谱）
│   ├── tactics.ts      # 12 种杀法（含 FEN 典型局面）
│   └── lessons.ts      # 入门/中级/高级 课程文案
└── index.css           # Tailwind v4 + 古典主题（宣纸/水墨/朱印）
scripts/verify.mjs      # 用 Vite SSR 加载 TS 模块，校验所有棋谱
```

## 关键设计

### 坐标与记谱

- 棋盘：row 0 = 黑方底线，row 9 = 红方底线；col 0..8 红方视角自左向右
- 纵线换算：红 file = 9 - col；黑 file = col + 1（黑方视角自右向左数）
- 记谱解析：先按棋子+纵线+动作+目标四段定位，再在同纵线多子时支持「前/中/后」和「一二三四五」

### 引擎规则要点

- 照面：当成 `isAttacked` 的特例（将/帅沿纵线可"飞"对方将）→ `isInCheck` 自动覆盖
- 马腿/象眼/炮翻山/九宫/河界/兵过河 全部在 `generatePseudoMoves` 中实现
- 合法走法 = 伪合法 ∩ 走完后己方不被将军
- 记谱法双向：每步走法都能反生成标准记谱文本，校验脚本据此对账

### 古典主题

- CSS 变量定义在 `index.css @theme`（paper / ink / cinnabar / jade / board）
- 全局宣纸纹理（CSS turbulence 噪点）
- 卡片 `card-classic` 渐变 + 细边 + 微阴影
- 按钮 `btn-classic` 与印章 `seal` 提供统一组件
- 棋子：米黄底 + 朱红/墨黑双圈 + 楷体字（KaiTi）

## 数据维护

- 所有开局/杀法 FEN 与着法都用 `scripts/verify.mjs` 自动校验（vite ssrLoadModule 加载 TS）
- 校验项：可解析、合法（不走自杀着法）、记谱反向生成与原数据一致
- 杀法中标注 `mate: true` 的会在校验时进一步检查黑方是否无合法着法
- 改数据后跑 `node scripts/verify.mjs` 即可

## 已验证的绝杀局面

马后炮、铁门栓、钓鱼马、重炮、卧槽马、大刀剜心、二鬼拍门（6 个）
其余杀法以「典型形态 + 演示谱」展示，配合文字讲解。
