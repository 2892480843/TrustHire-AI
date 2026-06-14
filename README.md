# 证聘 AI TrustHire AI

面向高校毕业生与企业校招场景的可信招聘智能体 Demo。项目提供 7 个后台式产品页面，并通过后端 API 串联 JD 解析、简历分析、证据链分析、人岗匹配评分、AI 面试任务生成和匹配报告。

## 当前定位

| 项目 | 内容 |
|---|---|
| 阶段 | 比赛 Demo / 本地演示版本 |
| 前端 | React + Vite + TypeScript + Tailwind CSS |
| 后端 | Express + TypeScript |
| AI 调用 | OpenAI 兼容 SDK，默认面向 DeepSeek API |
| 简历解析 | 支持 `txt`、`docx`、`pdf` 文本解析 |
| 状态存储 | Agent 任务使用内存 Map，服务重启后丢失 |
| Git 状态 | 当前目录不是 Git 仓库 |

## 功能范围

| 类型 | 已包含 |
|---|---|
| 前端页面 | Dashboard、JD 解析、简历分析、证据链分析、匹配评分、面试任务、匹配报告 |
| 后端接口 | `/health`、`/api/analyze-job`、`/api/analyze-resume`、`/api/evidence-analysis`、`/api/match-score`、`/api/interview-tasks`、`/api/match-report` |
| Agent 流程 | `/api/agent/jobs` 创建任务，`/api/agent/jobs/:id` 查询任务 |
| 自动化测试 | 前端交互/路由/service 测试，后端 schema/API/Agent 测试 |
| 演示素材 | `public/images` 与 `src/data/mockData.ts` 中的演示数据 |
| 端到端样例 | `sample-resume.txt` 脱敏文本简历，可配合 Dashboard 的 Agent 流程验收；`使用样例数据（演示）` 可直接注入完整兜底链路并进入匹配报告 |
| 演示脚本 | `DEMO_SCRIPT.md`，包含比赛讲解路线、Agent 步骤和异常兜底话术 |

## 本地启动

1. 安装依赖：

```powershell
npm install
```

2. 配置环境变量：

```powershell
Copy-Item .env.example .env
```

然后在 `.env` 中填写真实配置。不要把 `.env` 或真实密钥写入文档、截图或提交内容。

3. 同时启动前后端：

```powershell
npm run dev:full
```

默认地址：

| 服务 | 地址 |
|---|---|
| 前端 | `http://localhost:5173` |
| 后端健康检查 | `http://localhost:3001/health` |

## 验证命令

```powershell
npm run test
npm run test:server
npm run build
npm run build:server
```

## 比赛演示

比赛现场建议按 `DEMO_SCRIPT.md` 执行。脚本覆盖：

- 演示目标、启动命令和标准页面路线。
- 使用 `sample-resume.txt` 的 Agent 一键分析步骤。
- Dashboard `使用样例数据（演示）` 的完整兜底链路，可直达匹配报告并演示导出。
- 每个页面的讲解重点。
- 后端未启动、JD 过短、文件格式不支持、空简历、AI 服务失败/超时、Agent 失败等异常兜底话术。
- 演示前安全检查，避免展示 `.env` 或真实密钥。

## Demo 手测主线

| 步骤 | 操作 | 预期 |
|---:|---|---|
| 1 | 打开 `http://localhost:5173` | Dashboard 正常显示 |
| 2 | 打开 `http://localhost:3001/health` | 返回 `{"status":"ok"}` |
| 3 | 在 JD 解析页输入岗位描述 | 能返回岗位能力模型，或给出清晰错误 |
| 4 | 在简历分析页上传 `txt/docx/pdf` | 能解析文本并返回候选人结构化信息 |
| 5 | 运行 Agent 完整流程 | 依次完成 JD、简历、证据链、评分、面试任务、报告 |
| 6 | 查看匹配报告 | 能展示候选人、分数、风险、建议与证据 |
| 7 | 点击导出/分享 | 有明确反馈，不出现白屏或控制台错误 |

## 已知边界

- 当前不是生产系统，不包含真实登录、权限、数据库持久化和生产部署。
- Agent 任务在内存中保存，后端重启后任务状态会丢失。
- 扫描版 PDF/OCR 暂不支持。
- 真实 AI 返回 JSON 已完成一次端到端验收，结果保存于 `output/last-agent-job.json`；比赛前仍建议重新跑一遍确认网络和模型状态。
- 本地 `.env` 可能包含真实密钥，公开分享前建议轮换演示密钥。

## 推荐下一步

1. 比赛前按 `DEMO_ACCEPTANCE_CHECKLIST.md` 和 `DEMO_SCRIPT.md` 重新走一遍演示路线。
2. 根据更多真实模型返回结果继续补强 schema 和重试策略。
3. 如需生产化，再设计数据库、任务队列、登录权限和部署方案。
