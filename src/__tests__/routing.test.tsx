import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import App from "../App";

function seedCompletedFlowForInterview() {
  window.localStorage.setItem(
    "trusthire.analysisFlow.v1",
    JSON.stringify({
      jobAnalysis: { jobTitle: "Backend Intern", summary: "Backend APIs", abilities: [], portrait: [], screeningAdvice: [] },
      resumeAnalysis: {
        candidate: { name: "Alex", school: "", major: "", education: "", targetJob: "", city: "", expectedArrival: "" },
        skills: [],
        education: [],
        projects: [],
        internships: [],
        certificates: [],
        risks: [],
        summary: "Candidate profile",
        rawTextPreview: ""
      },
      evidenceAnalysis: { mappings: [], risks: [], followUpQuestions: [] },
      matchScore: {
        totalScore: 82,
        recommendationLevel: "Recommended",
        summary: "Good match",
        dimensions: [],
        advantages: [],
        weaknesses: [],
        hrAdvice: "Proceed"
      },
      interviewTasks: {
        tasks: [{ id: 1, category: "Technical", question: "Question", focus: "Focus", difficulty: "Medium", duration: "8 min", tags: [], basis: "Evidence" }]
      },
      matchReport: null
    })
  );
}

function seedLocalSharedReport(reportId = "local-report-1") {
  window.localStorage.setItem(
    "trusthire.sharedReports.v1",
    JSON.stringify({
      [reportId]: {
        id: reportId,
        createdAt: "2026-06-13T00:00:00.000Z",
        report: {
          candidateName: "Local Candidate",
          jobTitle: "Demo Backend Engineer",
          totalScore: 88,
          recommendationLevel: "建议推进",
          strengths: ["项目证据清晰"],
          risks: ["缓存细节需复核"],
          gaps: ["线上排障"],
          interviewAdvice: ["追问 Redis 一致性"],
          finalAdvice: "本地分享报告可读"
        },
        resumeSnapshot: {
          name: "Local Candidate",
          school: "本地大学",
          major: "软件工程",
          targetJob: "Demo Backend Engineer"
        },
        matchDimensions: [{ key: "backend", label: "后端基础", value: 88, benchmark: 70 }],
        interviewNotes: "本地分享记录仅在当前浏览器可用。"
      }
    })
  );
}

describe("TrustHire AI routing shell", () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = "#/dashboard";
  });

  it("renders all seven navigation entries and opens Dashboard by default", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: /可信 AI 招聘驾驶舱/ })).toBeInTheDocument();
    const sidebar = screen.getByRole("navigation", { name: "主导航" });
    expect(within(sidebar).getByRole("button", { name: /仪表盘/ })).toHaveAttribute("aria-current", "page");

    ["JD 解析", "简历分析", "证据链分析", "匹配评分", "面试任务", "匹配报告"].forEach((label) => {
      expect(within(sidebar).getByRole("button", { name: new RegExp(label) })).toBeInTheDocument();
    });
  });

  it("switches to the matching score page from the sidebar", () => {
    render(<App />);

    fireEvent.click(within(screen.getByRole("navigation", { name: "主导航" })).getByRole("button", { name: /匹配评分/ }));

    expect(screen.getByText("请先完成 JD 解析、简历分析和证据链分析，再生成匹配评分。")).toBeInTheDocument();
  });

  it.each(["#/evidence", "#/score", "#/interview", "#/report"])("renders a page-level h1 for empty state route %s", (hash) => {
    window.location.hash = hash;

    render(<App />);

    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("provides a programmable label for the JD textarea", () => {
    window.location.hash = "#/job";

    render(<App />);

    expect(screen.getByRole("textbox", { name: "岗位 JD 输入" })).toBeInTheDocument();
  });

  it("provides a programmable label for interviewer notes", () => {
    seedCompletedFlowForInterview();
    window.location.hash = "#/interview";

    render(<App />);

    expect(screen.getByRole("textbox", { name: "面试官记录" })).toBeInTheDocument();
  });

  it("renders project image assets in the shell and empty states", () => {
    render(<App />);

    expect(screen.getByRole("img", { name: "智聘未来品牌标识" })).toHaveAttribute("src", "/images/brand-mark.png");
    expect(screen.getByRole("img", { name: "TrustHire AI 招聘分析工作台" })).toHaveAttribute("src", "/images/dashboard-hero.png");

    fireEvent.click(within(screen.getByRole("navigation", { name: "主导航" })).getByRole("button", { name: /JD 解析/ }));
    expect(screen.getByRole("img", { name: "等待生成岗位能力模型" })).toHaveAttribute("src", "/images/empty-analysis.png");

    fireEvent.click(within(screen.getByRole("navigation", { name: "主导航" })).getByRole("button", { name: /匹配报告/ }));
    expect(screen.getByRole("img", { name: "HR 匹配报告封面" })).toHaveAttribute("src", "/images/report-cover.png");
  });

  it("opens a local shared report from a reportId hash query", () => {
    seedLocalSharedReport();
    window.location.hash = "#/report?reportId=local-report-1";

    render(<App />);

    expect(screen.getByText("本地演示分享报告")).toBeInTheDocument();
    expect(screen.getByText("Local Candidate")).toBeInTheDocument();
    expect(screen.getAllByText("本地分享报告可读").length).toBeGreaterThan(0);
    expect(screen.getByText("本地分享记录仅在当前浏览器可用。")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "分享报告" })).toBeDisabled();
  });

  it("shows a clear empty state when a local shared report is missing", () => {
    window.location.hash = "#/report?reportId=missing-report";

    render(<App />);

    expect(screen.getByText("未找到本地分享报告")).toBeInTheDocument();
    expect(screen.getByText("请在生成报告的浏览器中打开或重新生成。")).toBeInTheDocument();
  });
});
