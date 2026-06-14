import {
  BookOpenCheck,
  ClipboardCheck,
  FileSearch,
  FileText,
  Gauge,
  LayoutDashboard,
  MessageSquareText
} from "lucide-react";
import type { NavItem } from "../types";

export const navItems: NavItem[] = [
  { key: "dashboard", label: "仪表盘", path: "#/dashboard", icon: LayoutDashboard },
  { key: "job", label: "JD 解析", path: "#/job", icon: FileSearch },
  { key: "resume", label: "简历分析", path: "#/resume", icon: FileText },
  { key: "evidence", label: "证据链分析", path: "#/evidence", icon: ClipboardCheck },
  { key: "score", label: "匹配评分", path: "#/score", icon: Gauge },
  { key: "interview", label: "面试任务", path: "#/interview", icon: MessageSquareText },
  { key: "report", label: "匹配报告", path: "#/report", icon: BookOpenCheck }
];

export const pageSubtitles: Record<string, string> = {
  dashboard: "从岗位理解、简历解析、证据链到报告导出的本地全栈 AI 流程",
  job: "将岗位 JD 转换为结构化能力模型",
  resume: "上传 PDF / DOCX / TXT 简历并提取结构化候选人信息",
  evidence: "把岗位能力要求与简历事实逐项对齐",
  score: "基于岗位、简历和证据链生成匹配分",
  interview: "按风险和能力缺口生成面试任务",
  report: "生成 HR 可读的结构化匹配报告并导出 Markdown"
};

export const sampleJd = `岗位名称：Java 后端实习生

岗位职责：
1. 参与公司后端业务系统的设计与开发；
2. 参与接口设计、编码实现、单元测试与文档编写；
3. 协助优化系统性能，定位并解决线上问题；
4. 与产品、前端及测试团队紧密合作，完成项目交付。

任职要求：
1. 熟悉 Java 基础、集合、多线程等；
2. 熟悉 Spring Boot 开发，了解常用组件；
3. 熟悉 MySQL，了解 SQL 优化；
4. 具备接口开发经验，了解 RESTful 规范；
5. 有项目经验优先；
6. 具备良好的沟通协作能力和学习能力。`;
