import type { MatchReport } from "../types";

export function buildMarkdownReport(report: MatchReport, interviewNotes = "") {
  const lines = [
    "# TrustHire AI 匹配报告",
    "",
    `候选人：${report.candidateName}`,
    `岗位：${report.jobTitle}`,
    `匹配分：${report.totalScore}/100`,
    `推荐等级：${report.recommendationLevel}`,
    "",
    "## 核心优势",
    ...report.strengths.map((item) => `- ${item}`),
    "",
    "## 主要风险",
    ...report.risks.map((item) => `- ${item}`),
    "",
    "## 能力缺口",
    ...report.gaps.map((item) => `- ${item}`),
    "",
    "## 面试建议",
    ...report.interviewAdvice.map((item) => `- ${item}`),
    "",
    "## 最终建议",
    report.finalAdvice
  ];

  if (interviewNotes.trim()) {
    lines.push("", "## 面试官记录", interviewNotes.trim());
  }

  return lines.join("\n");
}

export function exportMarkdownReport(report: MatchReport, candidateId = report.candidateName, interviewNotes = "") {
  const filename = `TrustHire-${candidateId}-匹配报告.md`;
  const blob = new Blob([buildMarkdownReport(report, interviewNotes)], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return { filename };
}
