# 证聘 AI TrustHire AI Web Demo 任务计划

## 目标

在当前目录完成一个可本地运行的证聘 AI TrustHire AI 比赛 Demo，包含 React + Vite + TypeScript 前端、Express 后端 API、7 个后台式产品页面、AI 分析接口、Agent 串联流程、简历文本解析、集中演示数据、模拟/真实分析交互和本地验收文档。

## 当前环境

- 系统/平台：已由环境上下文和本地命令确认，Windows + PowerShell
- 工作区：`E:\dy\1\智聘未来`
- Git：当前目录不是 Git 仓库
- 设计稿：7 张 PNG，均为 1672 x 941，16:9 桌面端演示稿

## 阶段计划

| 阶段 | 状态 | 验收口径 |
|---|---|---|
| 资料理解与视觉提取 | complete | 已读取需求说明书、设计稿 README，并查看 7 张页面设计图 |
| 工程初始化 | complete | `package.json`、Vite、TS、Tailwind、测试配置齐全 |
| 测试先行 | complete | mock/service 与页面导航至少有可运行测试，先观察失败再实现 |
| 共享组件与数据 | complete | 完成 Layout、Sidebar、Topbar、StatCard、ProgressBar、ScoreRing、RadarChart、EvidenceBadge、PageHeader 等组件 |
| 7 页实现 | complete | Dashboard、JD 解析、简历分析、证据链分析、匹配评分、面试任务、匹配报告均可路由访问 |
| 交互实现 | complete | JD loading、简历模拟上传/选择样例、任务刷新、报告 toast |
| 验证与修复 | complete | 依赖安装、构建、开发服务器、浏览器检查 7 页、修复控制台与布局问题 |
| 后端 API 与 Agent 流程 | complete | Express API、DeepSeek/OpenAI 兼容客户端、简历解析、Agent 任务状态、后端测试齐全 |
| Demo 稳定化文档 | complete | README、验收清单、真实 AI 端到端手测路径与风险边界同步 |
| Demo 异常场景加固与比赛脚本 | complete | 前端异常提示、Agent 失败展示、异常测试、`DEMO_SCRIPT.md` 与验收文档完成 |
| 比赛前本地彩排 | complete | 浏览器巡检 7 页、JD 过短异常、完整样例兜底报告和最终验证命令均通过 |

## 实现约束

- 采用 React + Vite + TypeScript + Tailwind CSS。
- 使用 `lucide-react` 图标，使用 Recharts 绘制环形图、雷达图、条形图。
- mock 数据集中放在 `src/data/mockData.ts`。
- `src/services/analysisService.ts` 已改为调用后端 `/api/*` 接口；真实 AI 请求由后端 `server/src/features/analysis/analysisService.ts` 与 `server/src/ai/deepseekClient.ts` 负责。
- 后端通过 OpenAI 兼容 SDK 调用 DeepSeek，配置来自 `.env`，不得在文档、日志或提交内容中暴露真实密钥。
- Agent 任务当前使用内存状态存储，适合比赛 Demo；生产化需改为数据库/队列持久化。
- 页面直接进入产品后台，不做营销落地页。
- 视觉优先复刻设计稿：深色 Sidebar、白色内容区、蓝紫渐变、卡片、标签、进度条、评分圆环、雷达图、环形图、流程图。

## 验证命令

```powershell
npm install
npm run test
npm run test:server
npm run build
npm run build:server
npm run dev:full
```

## 已知风险

- 这是比赛 Demo，真实登录、权限、数据库、任务队列、生产部署不在当前 MVP 范围。
- 简历解析已支持 `txt`、`docx`、`pdf` 文本解析；扫描版 PDF/OCR 暂不支持。
- 真实 AI 接口已具备调用链路，但仍需使用真实 JD + 简历执行端到端验收，确认模型返回 JSON 稳定性、耗时与错误处理。
- 本地 `.env` 可能包含真实密钥，分享或初始化 Git 仓库前应确认 `.gitignore` 生效，并建议轮换演示密钥。
- 设计稿为静态 PNG，需要用 CSS/组件近似还原而非像素级复刻。

## 下一阶段建议

| 优先级 | 事项 | 验收口径 |
|---|---|---|
| P0 | 赛前现场环境复查 | 开场前确认前端、后端、投屏、`.env` 隐私边界和 `sample-resume.txt` 均正常 |
| P0 | 最终验收命令复跑 | 当前已通过；如比赛机器或依赖变化，再运行 `npm run test`、`npm run test:server`、`npm run build`、`npm run build:server` |
| P1 | 真实 AI 稳定性观察 | 赛前重新跑一次真实 Agent，确认耗时、JSON 稳定性和失败提示 |
| P2 | 生产化路线设计 | 明确登录、数据库、任务持久化、部署和监控方案，不抢占 Demo 收口 |
