# 弈境 · 中国象棋学习网站

> 楚河汉界，方寸见天地。  
> 一个面向入门、中级、高级学习者的中国象棋教学网站，汇集经典开局、杀法招式与互动打谱。

![tech](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)
![tech](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![tech](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript)
![tech](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwindcss)
![license](https://img.shields.io/badge/license-MIT-8B7355)

## 概览

弈境（YiJing）是一个完整的中国象棋学习网站，采用古典、克制的设计语言——宣纸底色、墨色朱砂点缀、木质棋盘纹理。内置规则引擎与记谱法解析，所有棋谱数据均经引擎反向验证。

### 包含内容

| 板块 | 数量 | 说明 |
| :--- | ---: | :--- |
| 课程章节 | 12 章 | 入门 4 章 · 中级 4 章 · 高级 4 章 |
| 经典开局 | 10 套 | 屏风马、顺炮、列炮、飞相、仙人指路、起马、过宫炮、士角炮、反宫马、五七炮 |
| 经典杀法 | 12 种 | 马后炮、铁门栓、重炮、双车错、卧槽马、钓鱼马、沉底炮、夹车炮、大刀剜心、二鬼拍门、天地炮、八角马 |
| 已验证绝杀 | 6 个 | 经引擎反向推演确认的杀招定式 |

## 特性

- 🎯 **真实规则引擎** — 马腿、象眼、炮翻山、九宫限制、将帅照面、困毙、绝杀全部支持
- 📜 **中文记谱法双向解析** — `炮二平五`、`马8进7` 等中文着法与内部 FEN 双向转换
- 🎬 **互动打谱** — 前一步/下一步/自动播放/速度控制/跳转到任意回合
- 🎨 **古典视觉** — SVG 棋盘、宣纸纹理、楚河汉界、棋子红黑、注释高亮
- ⚡ **零依赖校验脚本** — 启动时即可校验所有棋谱着法合法性

## 技术栈

| 类别 | 技术 | 版本 |
| :--- | :--- | :--- |
| 构建工具 | Vite | 8.2 |
| 前端框架 | React | 19.2 |
| 开发语言 | TypeScript | 6.0 |
| 样式方案 | Tailwind CSS | 4.3 |
| 路由 | React Router | 7.18 |
| 状态管理 | Zustand | 5.0 |
| 代码检查 | Oxlint | 1.79 |

## 快速开始

### 环境要求

- Node.js ≥ 22
- npm ≥ 10

### 安装与运行

```bash
# 克隆项目
git clone <repo-url> learn-chinese-chess
cd learn-chinese-chess

# 安装依赖
npm install

# 启动开发服务器
npm run dev
# 默认地址：http://localhost:5173/

# 生产构建
npm run build

# 预览构建产物
npm run preview

# 代码检查
npm run lint

# 校验全部棋谱数据
node scripts/verify.mjs
```

## 项目结构

```
learn-chinese-chess/
├── index.html                # 入口 HTML（含中文字体、SEO）
├── vite.config.ts            # Vite 配置（Tailwind v4 插件）
├── tsconfig*.json           # TypeScript 配置
├── package.json
├── scripts/
│   └── verify.mjs           # 棋谱数据校验脚本（Vite SSR 加载 TS）
└── src/
    ├── main.tsx             # 应用入口
    ├── App.tsx              # 路由配置
    ├── index.css            # 全局样式（Tailwind v4 + 古典主题变量）
    ├── engine/              # ⚙️ 纯 TS 规则引擎
    │   ├── types.ts         #   棋盘 / 棋子 / 走法类型
    │   ├── board.ts         #   FEN / 合法走法生成 / 将帅照面 / 绝杀判定
    │   ├── notation.ts      #   中文记谱法 ↔ Move 双向转换
    │   └── useGame.ts       #   React Hook（棋谱回放 + 手动试摆）
    ├── components/
    │   ├── Layout.tsx       # 古典导航与页头
    │   ├── ChessBoard.tsx   # SVG 棋盘组件（可读只、可交互）
    │   └── GameBoard.tsx    # 棋盘 + 控制条（前进/后退/自动播放）
    ├── data/                # 📚 教学内容数据
    │   ├── pieces.ts        #   七种棋子图鉴
    │   ├── lessons.ts       #   三级课程
    │   ├── openings.ts      #   10 套经典开局
    │   └── tactics.ts       #   12 种经典杀法
    └── pages/               # 🗂️ 路由页面
        ├── HomePage.tsx     # 首页
        ├── LevelPage.tsx    # 入门 / 中级 / 高级
        ├── OpeningsPage.tsx # 开局库
        ├── TacticsPage.tsx  # 杀法库
        ├── ReviewPage.tsx   # 打谱页
        └── NotationPage.tsx # 记谱法速查
```

## 核心模块说明

### 规则引擎（`src/engine/`）

完全使用纯 TypeScript 实现，无任何第三方依赖，便于复用与单测：

- **FEN 解析** — 支持 `rnbakabnr/...` 紧凑标记与扩展 FEN（含走子方 / 步数）
- **合法走法生成** — 帅/仕/相/车/马/炮/兵各自的规则均独立实现，重要细节：
  - 马：检测「马腿」是否被阻
  - 相/象：检测「象眼」是否被占，且不过河
  - 炮：翻山（隔一子吃子）
  - 仕/相/帅：九宫/河界约束
  - 将/帅：禁止「将帅照面」（长照判负）
- **中文记谱法** — 支持「平/进/退 + 数字」与「前/后 + 方向」两种写法
- **胜负判定** — 困毙（无子可走且未被将军）、将杀、被吃将帅

### 教学数据

所有开局 / 杀法数据均存放在 `src/data/`，每个棋谱包含：

- `id` — 唯一标识
- `name` — 名称
- `category` — 类别
- `fen` — 起始局面（可为空表示标准开局）
- `notation` — 中文着法数组
- `notes` — 按着法编号可选的注释
- `mate` — 最后一手是否绝杀（用于标注）

### 棋谱校验脚本

`scripts/verify.mjs` 使用 Vite SSR 加载 TS 源码，对 `openings.ts` 与 `tactics.ts` 中的每一条棋谱：

1. 解析起始局面 → 校验 FEN 列数
2. 按顺序执行中文着法 → 校验每步是否合法
3. 反向生成记谱 → 与原文对比
4. 报告问题（行号 + 着法 + 原因）

```bash
node scripts/verify.mjs
# ✓ 全部 119 着通过
```

## 设计语言

- **配色** — 宣纸 `#F4ECD8` / 墨色 `#1C1A17` / 朱砂 `#9F2B22` / 古铜 `#8B7355`
- **字体** — 系统衬线（思源宋体 / Noto Serif CJK SC）
- **棋盘** — SVG 绘制，9 × 10 网格 + 楚河汉界 + 九宫斜线
- **棋子** — 红黑双色 + 楷体阴刻效果 + 圆角木纹底

## 路线图

- [ ] 添加残局专题（七星不靠、千里独行等经典残局）
- [ ] 引入简易 AI（α-β 剪枝 / 局面评估）
- [ ] 添加导入 / 导出 UCCI 棋谱
- [ ] PWA 离线支持
- [ ] 名局赏析（古代名手对局）

## 贡献

欢迎提交 PR / Issue 完善棋谱与课程内容。新增杀法时务必运行：

```bash
node scripts/verify.mjs
```

以确保所有着法经引擎校验通过。

## 许可

MIT License — 你可以自由使用、修改、分发本项目的代码与内容。