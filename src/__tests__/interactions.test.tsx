import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";

const mainNavigation = () => screen.getByRole("navigation", { name: "主导航" });

describe("TrustHire AI interactions", () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = "#/dashboard";
    vi.restoreAllMocks();
  });

  it("jumps to a feature page from the top search box", () => {
    render(<App />);

    fireEvent.change(screen.getByPlaceholderText("搜索岗位、候选人、功能…"), { target: { value: "报告" } });
    fireEvent.keyDown(screen.getByPlaceholderText("搜索岗位、候选人、功能…"), { key: "Enter" });

    expect(window.location.hash).toBe("#/report");
    expect(screen.getByText("请先完成面试任务生成，再生成最终匹配报告。")).toBeInTheDocument();
  });

  it("clears the JD input and warns when it is already empty", () => {
    render(<App />);

    fireEvent.click(within(mainNavigation()).getByRole("button", { name: "JD 解析" }));
    const textarea = screen.getByDisplayValue(/岗位名称：Java 后端实习生/) as HTMLTextAreaElement;

    expect(textarea.value.length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "清空内容" }));
    expect(textarea.value).toBe("");

    fireEvent.click(screen.getByRole("button", { name: "清空内容" }));
    expect(screen.getByText("JD 内容已为空")).toBeInTheDocument();
  });

  it("shows frontend error message when JD analysis API fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        json: vi.fn().mockResolvedValue({ error: { code: "AI_PROVIDER_ERROR", message: "AI 服务调用失败，请稍后重试。" } })
      })
    );

    render(<App />);
    fireEvent.click(within(mainNavigation()).getByRole("button", { name: "JD 解析" }));
    fireEvent.click(screen.getByRole("button", { name: "解析岗位能力" }));

    expect(await screen.findByText("AI 服务调用失败，请稍后重试。")).toBeInTheDocument();
  });

  it("shows backend startup hint when the API cannot be reached", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));

    render(<App />);
    fireEvent.click(within(mainNavigation()).getByRole("button", { name: "JD 解析" }));
    fireEvent.click(screen.getByRole("button", { name: "解析岗位能力" }));

    expect(await screen.findByText("无法连接后端服务，请确认 server 已启动。")).toBeInTheDocument();
  });

  it("shows local validation when JD text is too short", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(<App />);
    fireEvent.click(within(mainNavigation()).getByRole("button", { name: "JD 解析" }));
    fireEvent.change(screen.getByLabelText("岗位 JD 输入"), { target: { value: "太短" } });
    fireEvent.click(screen.getByRole("button", { name: "解析岗位能力" }));

    expect(await screen.findByText("JD 内容至少需要 20 个字符。")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("opens file picker when uploading resume", () => {
    render(<App />);
    fireEvent.click(within(mainNavigation()).getByRole("button", { name: "简历分析" }));

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const click = vi.spyOn(input, "click").mockImplementation(() => undefined);

    fireEvent.click(screen.getByRole("button", { name: "上传简历" }));
    expect(click).toHaveBeenCalledTimes(1);
  });

  it("exposes the hidden resume file input to assistive technology", () => {
    window.location.hash = "#/resume";
    render(<App />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    expect(input).toHaveAttribute("aria-label");
    expect(input.getAttribute("aria-label")?.trim().length).toBeGreaterThan(0);
  });

  it("shows readable resume upload validation before calling the backend", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(<App />);
    fireEvent.click(within(mainNavigation()).getByRole("button", { name: "简历分析" }));

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, {
      target: { files: [new File(["not allowed"], "resume.png", { type: "image/png" })] }
    });

    expect(await screen.findByText("仅支持 PDF / DOCX / TXT 简历文件。")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows readable empty resume text validation before calling the backend", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(<App />);
    fireEvent.click(within(mainNavigation()).getByRole("button", { name: "简历分析" }));

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, {
      target: { files: [new File(["   "], "empty.txt", { type: "text/plain" })] }
    });

    expect(await screen.findByText("简历文件为空，请上传包含文本内容的 PDF / DOCX / TXT 简历。")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows failed agent stage and reason on the dashboard", async () => {
    const runningJob = {
      jobId: "agent-job-1",
      status: "running",
      currentStage: "jobAnalysis",
      stages: [
        { key: "jobAnalysis", label: "JD 解析", status: "running", startedAt: null, completedAt: null },
        { key: "resumeAnalysis", label: "简历解析", status: "pending", startedAt: null, completedAt: null },
        { key: "evidenceAnalysis", label: "证据链分析", status: "pending", startedAt: null, completedAt: null },
        { key: "matchScore", label: "人岗匹配评分", status: "pending", startedAt: null, completedAt: null },
        { key: "interviewTasks", label: "面试任务生成", status: "pending", startedAt: null, completedAt: null },
        { key: "matchReport", label: "匹配报告生成", status: "pending", startedAt: null, completedAt: null }
      ],
      results: {},
      error: null,
      createdAt: "2026-06-12T00:00:00.000Z",
      updatedAt: "2026-06-12T00:00:00.000Z"
    };
    const failedJob = {
      id: "agent-job-1",
      status: "failed",
      currentStage: "matchScore",
      stages: [
        { key: "jobAnalysis", label: "JD 解析", status: "completed", startedAt: null, completedAt: null },
        { key: "resumeAnalysis", label: "简历解析", status: "completed", startedAt: null, completedAt: null },
        { key: "evidenceAnalysis", label: "证据链分析", status: "completed", startedAt: null, completedAt: null },
        { key: "matchScore", label: "人岗匹配评分", status: "failed", startedAt: null, completedAt: null },
        { key: "interviewTasks", label: "面试任务生成", status: "pending", startedAt: null, completedAt: null },
        { key: "matchReport", label: "匹配报告生成", status: "pending", startedAt: null, completedAt: null }
      ],
      results: {
        jobAnalysis: { jobTitle: "Java Backend Intern", summary: "Backend APIs", abilities: [], portrait: [], screeningAdvice: [] },
        resumeAnalysis: {
          candidate: { name: "Zhang San", school: "", major: "", education: "", targetJob: "", city: "", expectedArrival: "" },
          skills: ["Java"],
          education: [],
          projects: [],
          internships: [],
          certificates: [],
          risks: [],
          summary: "Java candidate",
          rawTextPreview: "Java"
        },
        evidenceAnalysis: { mappings: [], risks: [], followUpQuestions: [] },
        matchScore: null,
        interviewTasks: null,
        matchReport: null
      },
      error: { code: "AI_PROVIDER_ERROR", message: "AI 服务调用失败，请稍后重试。" },
      createdAt: "2026-06-12T00:00:00.000Z",
      updatedAt: "2026-06-12T00:00:01.000Z"
    };

    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(runningJob)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(failedJob)
        })
    );

    render(<App />);
    fireEvent.change(screen.getByLabelText("Agent JD 输入"), {
      target: { value: "We need a Java backend intern familiar with Spring Boot and MySQL." }
    });
    fireEvent.change(screen.getByLabelText("Agent 简历上传"), {
      target: { files: [new File(["Java Spring Boot"], "resume.txt", { type: "text/plain" })] }
    });
    fireEvent.click(screen.getByRole("button", { name: "一键 Agent 分析" }));

    expect(await screen.findByText("失败阶段：人岗匹配评分")).toBeInTheDocument();
    expect(screen.getByText("失败原因：AI 服务调用失败，请稍后重试。")).toBeInTheDocument();
  });

  it("runs the task-based agent from the dashboard and stores completed flow results", async () => {
    const completedJob = {
      id: "agent-job-1",
      status: "completed",
      currentStage: null,
      stages: [
        { key: "jobAnalysis", label: "JD 解析", status: "completed", startedAt: null, completedAt: null },
        { key: "resumeAnalysis", label: "简历解析", status: "completed", startedAt: null, completedAt: null },
        { key: "evidenceAnalysis", label: "证据链分析", status: "completed", startedAt: null, completedAt: null },
        { key: "matchScore", label: "人岗匹配评分", status: "completed", startedAt: null, completedAt: null },
        { key: "interviewTasks", label: "面试任务生成", status: "completed", startedAt: null, completedAt: null },
        { key: "matchReport", label: "匹配报告生成", status: "completed", startedAt: null, completedAt: null }
      ],
      results: {
        jobAnalysis: { jobTitle: "Java Backend Intern", summary: "Backend APIs", abilities: [], portrait: [], screeningAdvice: [] },
        resumeAnalysis: {
          candidate: { name: "Zhang San", school: "", major: "", education: "", targetJob: "", city: "", expectedArrival: "" },
          skills: ["Java"],
          education: [],
          projects: [],
          internships: [],
          certificates: [],
          risks: [],
          summary: "Java candidate",
          rawTextPreview: "Java"
        },
        evidenceAnalysis: { mappings: [{ ability: "Java", evidence: "Project", strength: "strong", source: "project", judgement: "supports" }], risks: [], followUpQuestions: [] },
        matchScore: { totalScore: 84, recommendationLevel: "Recommended", summary: "Good", dimensions: [], advantages: ["Java"], weaknesses: [], hrAdvice: "Interview" },
        interviewTasks: {
          tasks: [
            { id: 1, category: "Technical", question: "Q1", focus: "API", difficulty: "Medium", duration: "8 min", tags: [], basis: "" },
            { id: 2, category: "Project", question: "Q2", focus: "Project", difficulty: "Medium", duration: "8 min", tags: [], basis: "" },
            { id: 3, category: "Practical", question: "Q3", focus: "Design", difficulty: "Hard", duration: "15 min", tags: [], basis: "" },
            { id: 4, category: "Risk", question: "Q4", focus: "Risk", difficulty: "Medium", duration: "6 min", tags: [], basis: "" }
          ]
        },
        matchReport: {
          candidateName: "Zhang San",
          jobTitle: "Java Backend Intern",
          totalScore: 84,
          recommendationLevel: "Recommended",
          strengths: ["Java"],
          risks: [],
          gaps: [],
          interviewAdvice: ["Ask APIs"],
          finalAdvice: "Proceed"
        }
      },
      error: null,
      createdAt: "2026-06-12T00:00:00.000Z",
      updatedAt: "2026-06-12T00:00:01.000Z"
    };
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue({ ...completedJob, jobId: "agent-job-1", status: "running" })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(completedJob)
        })
    );

    render(<App />);
    fireEvent.change(screen.getByLabelText("Agent JD 输入"), {
      target: { value: "We need a Java backend intern familiar with Spring Boot and MySQL." }
    });
    fireEvent.change(screen.getByLabelText("Agent 简历上传"), {
      target: { files: [new File(["Java Spring Boot"], "resume.txt", { type: "text/plain" })] }
    });
    fireEvent.click(screen.getByRole("button", { name: "一键 Agent 分析" }));

    expect(await screen.findByText("Agent 分析完成，已写入完整流程结果")).toBeInTheDocument();
    const stored = JSON.parse(window.localStorage.getItem("trusthire.analysisFlow.v1") ?? "{}");
    expect(stored.matchReport.finalAdvice).toBe("Proceed");
  });

  it("exports Markdown after loading sample data and generating report state", async () => {
    const createObjectURL = vi.fn(() => "blob:mock-report");
    const revokeObjectURL = vi.fn();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    Object.defineProperty(window.URL, "createObjectURL", { configurable: true, value: createObjectURL });
    Object.defineProperty(window.URL, "revokeObjectURL", { configurable: true, value: revokeObjectURL });
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          candidateName: "张同学",
          jobTitle: "Java 后端实习生",
          totalScore: 82,
          recommendationLevel: "建议进入一面",
          strengths: ["Java 基础扎实"],
          risks: ["Redis 证据不足"],
          gaps: ["缓存实践"],
          interviewAdvice: ["追问 Redis"],
          finalAdvice: "建议进入一面"
        })
      })
    );

    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "使用样例数据（演示）" }));
    window.localStorage.setItem(
      "trusthire.analysisFlow.v1",
      JSON.stringify({
        jobAnalysis: { jobTitle: "Java 后端实习生", summary: "岗位", abilities: [], portrait: [], screeningAdvice: [] },
        resumeAnalysis: {
          candidate: { name: "张同学", school: "某某大学", major: "软件工程", education: "本科", targetJob: "Java 后端实习生", city: "", expectedArrival: "" },
          skills: [],
          education: [],
          projects: [],
          internships: [],
          certificates: [],
          risks: [],
          summary: "简历",
          rawTextPreview: ""
        },
        evidenceAnalysis: { mappings: [{ ability: "Java", evidence: "项目", strength: "强证据", source: "项目", judgement: "支持" }], risks: [], followUpQuestions: [] },
        matchScore: { totalScore: 82, recommendationLevel: "建议进入一面", summary: "评分", dimensions: [], advantages: ["A"], weaknesses: [], hrAdvice: "建议" },
        interviewTasks: { tasks: [{ id: 1, category: "技术追问", question: "Q", focus: "F", difficulty: "中等", duration: "8 分钟", tags: [], basis: "" }] },
        matchReport: {
          candidateName: "张同学",
          jobTitle: "Java 后端实习生",
          totalScore: 82,
          recommendationLevel: "建议进入一面",
          strengths: ["Java 基础扎实"],
          risks: ["Redis 证据不足"],
          gaps: ["缓存实践"],
          interviewAdvice: ["追问 Redis"],
          finalAdvice: "建议进入一面"
        }
      })
    );

    cleanup();
    render(<App />);
    fireEvent.click(within(mainNavigation()).getByRole("button", { name: "匹配报告" }));
    fireEvent.click(screen.getByRole("button", { name: "导出 Markdown" }));

    await waitFor(() => expect(createObjectURL).toHaveBeenCalledTimes(1));
    expect(screen.getByText("Markdown 报告已下载")).toBeInTheDocument();
  });

  it("loads a complete sample flow that can show the final report directly", async () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "使用样例数据（演示）" }));
    fireEvent.click(within(mainNavigation()).getByRole("button", { name: "匹配报告" }));

    expect(await screen.findByText("张同学")).toBeInTheDocument();
    expect(screen.getByText("建议进入一面")).toBeInTheDocument();
    expect(screen.queryByText("请先完成面试任务生成，再生成最终匹配报告。")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "导出 Markdown" })).toBeEnabled();
  });

  it("saves, reloads, and clears interviewer notes in the analysis flow", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "使用样例数据（演示）" }));
    fireEvent.click(within(mainNavigation()).getByRole("button", { name: "面试任务" }));

    const notes = screen.getByRole("textbox", { name: "面试官记录" }) as HTMLTextAreaElement;
    fireEvent.change(notes, { target: { value: "候选人能说明事务边界，但 Redis 一致性回答偏弱。" } });
    fireEvent.click(screen.getByRole("button", { name: "保存记录" }));

    expect(screen.getByText("面试官记录已保存")).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("trusthire.analysisFlow.v1") ?? "{}").interviewNotes).toBe("候选人能说明事务边界，但 Redis 一致性回答偏弱。");

    cleanup();
    render(<App />);
    fireEvent.click(within(mainNavigation()).getByRole("button", { name: "面试任务" }));
    expect(screen.getByRole("textbox", { name: "面试官记录" })).toHaveValue("候选人能说明事务边界，但 Redis 一致性回答偏弱。");

    fireEvent.click(screen.getByRole("button", { name: "清空记录" }));
    expect(screen.getByRole("textbox", { name: "面试官记录" })).toHaveValue("");
    expect(JSON.parse(localStorage.getItem("trusthire.analysisFlow.v1") ?? "{}").interviewNotes).toBe("");
  });

  it("shows interviewer notes in the report page and Markdown export", async () => {
    const createObjectURL = vi.fn(() => "blob:mock-report-with-notes");
    const revokeObjectURL = vi.fn();
    const blobTexts: string[] = [];
    const OriginalBlob = globalThis.Blob;
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    class CapturingBlob extends OriginalBlob {
      constructor(parts?: BlobPart[], options?: BlobPropertyBag) {
        super(parts, options);
        blobTexts.push((parts ?? []).map((part) => String(part)).join(""));
      }
    }

    Object.defineProperty(globalThis, "Blob", { configurable: true, value: CapturingBlob });
    Object.defineProperty(window.URL, "createObjectURL", { configurable: true, value: createObjectURL });
    Object.defineProperty(window.URL, "revokeObjectURL", { configurable: true, value: revokeObjectURL });

    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "使用样例数据（演示）" }));
    fireEvent.click(within(mainNavigation()).getByRole("button", { name: "面试任务" }));
    fireEvent.change(screen.getByRole("textbox", { name: "面试官记录" }), {
      target: { value: "候选人对订单事务回答清楚，Redis 需要复核。" }
    });
    fireEvent.click(screen.getByRole("button", { name: "保存记录" }));
    fireEvent.click(within(mainNavigation()).getByRole("button", { name: "匹配报告" }));

    expect(screen.getByRole("heading", { name: "面试官记录" })).toBeInTheDocument();
    expect(screen.getByText("候选人对订单事务回答清楚，Redis 需要复核。")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "导出 Markdown" }));

    await waitFor(() => expect(createObjectURL).toHaveBeenCalledTimes(1));
    expect(blobTexts[0]).toContain("## 面试官记录");
    expect(blobTexts[0]).toContain("候选人对订单事务回答清楚，Redis 需要复核。");

    Object.defineProperty(globalThis, "Blob", { configurable: true, value: OriginalBlob });
  });

  it("creates a stable local demo share link for the current report", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });

    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "使用样例数据（演示）" }));
    fireEvent.click(within(mainNavigation()).getByRole("button", { name: "匹配报告" }));

    fireEvent.click(screen.getByRole("button", { name: "分享报告" }));
    fireEvent.click(screen.getByRole("button", { name: "分享报告" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(2));
    const firstLink = writeText.mock.calls[0][0] as string;
    const secondLink = writeText.mock.calls[1][0] as string;

    expect(firstLink).toBe(secondLink);
    expect(firstLink).toMatch(new RegExp(`^${window.location.origin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/#/report\\?reportId=`));
    expect(firstLink).not.toContain(["trusthire", "ai"].join("."));
    expect(screen.getByText("本地演示分享链接已复制")).toBeInTheDocument();

    const reportId = new URLSearchParams(new URL(firstLink).hash.split("?")[1]).get("reportId");
    const sharedReports = JSON.parse(localStorage.getItem("trusthire.sharedReports.v1") ?? "{}");
    expect(reportId).toBeTruthy();
    expect(sharedReports[reportId as string].report.finalAdvice).toBe("建议进入一面，面试重点放在接口设计、数据库事务和 Redis 真实使用经验。");
  });

  it("falls back to showing the local demo share link when clipboard copy fails", async () => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: vi.fn().mockRejectedValue(new Error("blocked")) } });

    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "使用样例数据（演示）" }));
    fireEvent.click(within(mainNavigation()).getByRole("button", { name: "匹配报告" }));

    fireEvent.click(screen.getByRole("button", { name: "分享报告" }));

    expect(await screen.findByText(/^本地演示分享链接：http:\/\/localhost:3000\/#\/report\?reportId=/)).toBeInTheDocument();
  });

  it("generates a missing match report from the interview page before navigating", async () => {
    const generatedReport = {
      candidateName: "张同学",
      jobTitle: "Java 后端实习生",
      totalScore: 83,
      recommendationLevel: "建议进入一面",
      strengths: ["项目经历匹配"],
      risks: ["Redis 需要复核"],
      gaps: ["缓存一致性"],
      interviewAdvice: ["追问 Redis 场景"],
      finalAdvice: "建议进入一面，并结合面试记录复核风险。"
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(generatedReport)
      })
    );

    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "使用样例数据（演示）" }));
    window.localStorage.setItem(
      "trusthire.analysisFlow.v1",
      JSON.stringify({
        ...JSON.parse(window.localStorage.getItem("trusthire.analysisFlow.v1") ?? "{}"),
        matchReport: null
      })
    );

    cleanup();
    render(<App />);
    fireEvent.click(within(mainNavigation()).getByRole("button", { name: "面试任务" }));
    fireEvent.click(screen.getByRole("button", { name: "生成匹配报告" }));

    expect(await screen.findByText("匹配报告已生成")).toBeInTheDocument();
    expect(window.location.hash).toBe("#/report");
    expect(screen.getAllByText("建议进入一面，并结合面试记录复核风险。").length).toBeGreaterThan(0);
    expect(JSON.parse(localStorage.getItem("trusthire.analysisFlow.v1") ?? "{}").matchReport.finalAdvice).toBe("建议进入一面，并结合面试记录复核风险。");
  });

  it("shows an error when generating a report from the interview page fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        json: vi.fn().mockResolvedValue({ error: { code: "AI_PROVIDER_ERROR", message: "AI 服务调用失败，请稍后重试。" } })
      })
    );

    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "使用样例数据（演示）" }));
    window.localStorage.setItem(
      "trusthire.analysisFlow.v1",
      JSON.stringify({
        ...JSON.parse(window.localStorage.getItem("trusthire.analysisFlow.v1") ?? "{}"),
        matchReport: null
      })
    );

    cleanup();
    render(<App />);
    fireEvent.click(within(mainNavigation()).getByRole("button", { name: "面试任务" }));
    fireEvent.click(screen.getByRole("button", { name: "生成匹配报告" }));

    expect(await screen.findByText("AI 服务调用失败，请稍后重试。")).toBeInTheDocument();
    expect(window.location.hash).toBe("#/interview");
  });

  it("filters dashboard jobs by keyword search, Enter key, tags, and reset", () => {
    render(<App />);

    const dashboardSearch = screen.getByRole("textbox", { name: "搜索岗位、技能或城市" });
    fireEvent.change(dashboardSearch, { target: { value: "后端" } });
    fireEvent.keyDown(dashboardSearch, { key: "Enter" });

    expect(screen.getByRole("heading", { name: "后端开发工程师" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "AI 产品运营实习生" })).not.toBeInTheDocument();

    fireEvent.change(dashboardSearch, { target: { value: "不存在岗位" } });
    fireEvent.click(screen.getByRole("button", { name: "智能探索" }));

    expect(screen.getByText("没有找到匹配岗位")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "清除筛选" }));
    fireEvent.click(screen.getByRole("button", { name: "远程友好" }));

    expect(screen.getByRole("heading", { name: "AI 产品运营实习生" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "后端开发工程师" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "远程友好" }));
    expect(screen.getByRole("heading", { name: "后端开发工程师" })).toBeInTheDocument();
  });

  it("keeps the dashboard smart search button available on mobile-sized screens", () => {
    render(<App />);

    expect(screen.getByRole("button", { name: "智能探索" }).className).not.toContain("hidden");
  });

  it("saves and clears a local demo login identity from the dashboard", () => {
    render(<App />);

    const productNav = screen.getByRole("navigation", { name: "产品导航" });
    fireEvent.click(within(productNav).getByRole("button", { name: "登录" }));

    expect(screen.getByRole("dialog", { name: "本地 Demo 登录" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("姓名"), { target: { value: "陈同学" } });
    fireEvent.change(screen.getByLabelText("角色"), { target: { value: "求职者" } });
    fireEvent.change(screen.getByLabelText("公司或学校"), { target: { value: "未来大学" } });
    fireEvent.click(screen.getByRole("button", { name: "保存 Demo 身份" }));

    expect(JSON.parse(localStorage.getItem("trusthire.demoUser.v1") ?? "{}")).toMatchObject({
      name: "陈同学",
      role: "求职者",
      organization: "未来大学"
    });
    expect(screen.getByText("陈同学 · 求职者 · 未来大学")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "退出登录" }));
    expect(localStorage.getItem("trusthire.demoUser.v1")).toBeNull();
    expect(within(productNav).getByRole("button", { name: "登录" })).toBeInTheDocument();
  });

  it("uses top product navigation to scroll and mark the active dashboard section", () => {
    const scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: scrollIntoView });

    render(<App />);

    const productNav = screen.getByRole("navigation", { name: "产品导航" });
    const recruiterButton = within(productNav).getByRole("button", { name: "企业招聘" });

    fireEvent.click(recruiterButton);

    expect(scrollIntoView).toHaveBeenCalled();
    expect(recruiterButton).toHaveAttribute("aria-current", "true");
  });

  it.each([
    ["智能岗位推荐", "#/job"],
    ["简历诊断", "#/resume"],
    ["AI 面试练习", "#/interview"]
  ])("opens the expected workflow page from the %s card", (cardTitle, expectedHash) => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: new RegExp(cardTitle) }));

    expect(window.location.hash).toBe(expectedHash);
  });

  it("opens career path guidance and can base it on sample flow data", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /职业路径建议/ }));
    expect(screen.getByRole("dialog", { name: "职业路径建议" })).toBeInTheDocument();
    expect(screen.getByText("暂无流程数据")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "加载样例数据" }));

    const careerDialog = screen.getByRole("dialog", { name: "职业路径建议" });
    expect(within(careerDialog).getByText("张同学")).toBeInTheDocument();
    expect(within(careerDialog).getByText("Java 后端实习生")).toBeInTheDocument();
    expect(within(careerDialog).getByText("缓存一致性实践")).toBeInTheDocument();
  });
});
