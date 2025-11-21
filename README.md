# PolySurge - Polymarket 实时异动监控终端

PolySurge 是一个专为 Polymarket 预测市场打造的实时数据分析与异动监控平台。它旨在帮助交易者发现潜在的市场机会，通过算法自动检测交易量激增、巨鲸入场等异常行为，并提供专业的金融终端级用户体验。

## 核心功能

### 1. 实时异动监控 (Live Anomaly Feed)
系统通过轮询 Polymarket 的实时交易数据，利用统计学算法自动识别以下市场异动：
- **Volume Spike (成交量激增)**：短时间内成交量显著超过历史平均水平。
- **Whale Trade (巨鲸交易)**：单笔大额交易（如 > $5000）。
- **Wallet Surge (地址数激增)**：短时间内参与交易的独立钱包数量异常增加。
- **Price Move (价格剧烈波动)**：价格在短时间内发生大幅偏移。

### 2. 市场概览仪表盘 (Dashboard)
- **全市场核心指标**：实时展示 24小时总交易量、活跃市场数、当前异动数量等。
- **热门市场排行**：按 24小时交易量排序的 Top Markets 列表。
- **实时搜索**：支持按关键词快速检索市场。

### 3. 深度市场详情 (Market Details)
- **专业 K 线/走势图**：基于真实交易数据的价格历史走势。
- **市场规则与元数据**：完整的市场描述、结束时间、Condition ID 等合约信息。
- **多维度数据**：流动性 (Liquidity)、24小时交易量、各选项当前概率。
- **链上信息**：集成 Polygon 链上的 Token ID 信息，方便合约交互。

## 技术架构与实现原理

本项目采用现代化的全栈 Web 架构：

- **框架**: [Next.js 15](https://nextjs.org/) (App Router) - 提供高性能的服务端渲染 (SSR) 和 API 路由。
- **UI 组件库**: [Shadcn/UI](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/) - 打造极简、专业的金融终端界面。
- **数据状态管理**: [TanStack Query (React Query)](https://tanstack.com/query/latest) - 处理复杂的数据获取、缓存和自动轮询。
- **图表库**: [Recharts](https://recharts.org/) - 绘制高性能的交互式图表。
- **API 集成**:
    - **Gamma API**: 获取市场元数据 (Question, Description, Images)。
    - **Data API**: 获取历史交易流 (Trades) 和 K 线数据。
    - **CLOB API**: 获取订单簿 (Orderbook) 和流动性数据。
- **异动检测算法**:
    - 位于 `src/lib/analysis.ts`。
    - 采用滑动窗口统计法，计算交易量和频率的 Z-Score。
    - 综合评分系统 (0-100分) 评估异动显著性。

## 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装与运行

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd PolySurge
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **访问应用**
   打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 未来规划 (Roadmap)

- [ ] **服务端异动检测**：将目前的客户端轮询检测迁移至服务端 (Cron Job/Worker)，实现 24/7 监控并推送到数据库。
- [ ] **实时推送**：集成 WebSocket 或 Server-Sent Events (SSE)，实现毫秒级的数据更新，替代轮询机制。
- [ ] **自选列表 (Watchlist)**：允许用户收藏关注的市场，定制专属监控面板。
- [ ] **盈亏计算器 (PnL Calculator)**：基于当前赔率快速计算潜在回报。
- [ ] **多链支持**：扩展支持除 Polygon 外的其他预测市场链（如有）。
- [ ] **用户系统**：支持钱包登录 (Metamask/Rainbow)，保存用户偏好设置。

## 目录结构

```
src/
├── app/                 # Next.js App Router 页面与 API 路由
│   ├── api/             # 后端 API 代理 (解决跨域与数据聚合)
│   ├── market/[id]/     # 市场详情页
│   └── page.tsx         # 仪表盘主页
├── components/          # UI 组件 (Shadcn + 自定义组件)
├── hooks/               # 自定义 React Hooks (usePolymarket)
├── lib/                 # 核心逻辑库
│   ├── analysis.ts      # 异动检测算法
│   ├── polymarket-api.ts# API 统一封装
│   └── types.ts         # TypeScript 类型定义
└── styles/              # 全局样式
```

---
Built with ❤️ for the prediction market community.
