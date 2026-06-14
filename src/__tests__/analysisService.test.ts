import { beforeEach, describe, expect, it, vi } from "vitest";
import { analyzeJobDescription, analyzeResumeFile, generateInterviewTasks, getAgentJob, startAgentJob } from "../services/analysisService";

describe("analysisService HTTP API", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("posts JD text to the backend and returns structured job analysis", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        jobTitle: "Java 后端实习生",
        summary: "负责后端接口开发。",
        abilities: [{ category: "后端", name: "Spring Boot", description: "接口开发", weight: 100 }],
        portrait: ["工程实践导向"],
        screeningAdvice: ["关注项目经验"]
      })
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await analyzeJobDescription("招聘 Java 后端实习生，要求熟悉 Spring Boot 和 MySQL。");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/api/analyze-job",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ jdText: "招聘 Java 后端实习生，要求熟悉 Spring Boot 和 MySQL。" })
      })
    );
    expect(result.jobTitle).toBe("Java 后端实习生");
  });

  it("uploads resume files with multipart form data", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        candidate: { name: "张同学", school: "", major: "", education: "", targetJob: "", city: "", expectedArrival: "" },
        skills: ["Java"],
        education: [],
        projects: [],
        internships: [],
        certificates: [],
        risks: [],
        summary: "具备 Java 基础。",
        rawTextPreview: "Java"
      })
    });
    vi.stubGlobal("fetch", fetchMock);

    await analyzeResumeFile(new File(["Java"], "resume.txt", { type: "text/plain" }));
    const [, options] = fetchMock.mock.calls[0];

    expect(options.method).toBe("POST");
    expect(options.body).toBeInstanceOf(FormData);
    expect(options.headers).toBeUndefined();
  });

  it("starts and fetches task-based agent jobs", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          jobId: "agent-job-1",
          status: "running",
          currentStage: "jobAnalysis",
          stages: [],
          results: {},
          error: null,
          createdAt: "2026-06-12T00:00:00.000Z",
          updatedAt: "2026-06-12T00:00:00.000Z"
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          id: "agent-job-1",
          status: "completed",
          currentStage: null,
          stages: [],
          results: {},
          error: null,
          createdAt: "2026-06-12T00:00:00.000Z",
          updatedAt: "2026-06-12T00:00:01.000Z"
        })
      });
    vi.stubGlobal("fetch", fetchMock);

    const created = await startAgentJob({
      jdText: "We need a Java backend intern familiar with Spring Boot and MySQL.",
      file: new File(["Java Spring Boot"], "resume.txt", { type: "text/plain" })
    });
    const fetched = await getAgentJob(created.jobId);

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "http://localhost:3001/api/agent/jobs",
      expect.objectContaining({ method: "POST", body: expect.any(FormData) })
    );
    expect(fetchMock.mock.calls[0][1]?.headers).toBeUndefined();
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "http://localhost:3001/api/agent/jobs/agent-job-1",
      expect.objectContaining({ method: "GET" })
    );
    expect(fetched.status).toBe("completed");
  });

  it("generates interview tasks from prior analysis results", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          tasks: [
            { id: 1, category: "技术追问", question: "Q1", focus: "接口设计", difficulty: "中等", duration: "8 分钟", tags: [], basis: "岗位要求" },
            { id: 2, category: "项目验证", question: "Q2", focus: "项目", difficulty: "中等", duration: "8 分钟", tags: [], basis: "证据链" },
            { id: 3, category: "实操任务", question: "Q3", focus: "建模", difficulty: "较高", duration: "15 分钟", tags: [], basis: "能力缺口" },
            { id: 4, category: "风险追问", question: "Q4", focus: "风险", difficulty: "中等", duration: "6 分钟", tags: [], basis: "风险点" }
          ]
        })
      })
    );

    const result = await generateInterviewTasks({
      jobAnalysis: { jobTitle: "Java 后端实习生", summary: "岗位", abilities: [], portrait: [], screeningAdvice: [] },
      resumeAnalysis: {
        candidate: { name: "张同学", school: "", major: "", education: "", targetJob: "", city: "", expectedArrival: "" },
        skills: [],
        education: [],
        projects: [],
        internships: [],
        certificates: [],
        risks: [],
        summary: "简历",
        rawTextPreview: ""
      },
      evidenceAnalysis: { mappings: [], risks: [], followUpQuestions: [] },
      matchScore: { totalScore: 80, recommendationLevel: "建议进入一面", summary: "评分", dimensions: [], advantages: ["A"], weaknesses: [], hrAdvice: "建议" }
    });

    expect(result.tasks).toHaveLength(4);
    expect(result.tasks.map((item) => item.category)).toEqual(["技术追问", "项目验证", "实操任务", "风险追问"]);
  });
});
