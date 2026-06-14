import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "../app.js";
import type { AnalysisAiClient } from "../features/analysis/analysisService.js";

function createAiClient(overrides: Partial<AnalysisAiClient> = {}): AnalysisAiClient {
  return {
    analyzeJob: vi.fn().mockResolvedValue({
      jobTitle: "Java 后端实习生",
      summary: "参与后端接口开发与系统优化。",
      abilities: [
        { category: "编程基础", name: "Java 基础", description: "语法、集合、多线程", weight: 25 },
        { category: "后端框架", name: "Spring Boot", description: "常用组件与分层开发", weight: 25 },
        { category: "数据库", name: "MySQL", description: "SQL 与表设计", weight: 20 },
        { category: "工程能力", name: "接口开发", description: "RESTful API 与测试", weight: 20 },
        { category: "协作能力", name: "沟通协作", description: "跨角色交付", weight: 10 }
      ],
      portrait: ["工程实践导向", "学习能力强"],
      screeningAdvice: ["优先关注 Spring Boot 项目经验"]
    }),
    analyzeResume: vi.fn().mockResolvedValue({
      candidate: {
        name: "张同学",
        school: "某某大学",
        major: "软件工程",
        education: "本科",
        targetJob: "Java 后端实习生",
        city: "南京",
        expectedArrival: "1 个月内"
      },
      skills: ["Java", "Spring Boot", "MySQL"],
      education: [{ school: "某某大学", major: "软件工程", degree: "本科", period: "2021.09 - 2025.06" }],
      projects: [],
      internships: [],
      certificates: [],
      risks: [],
      summary: "候选人具备 Java 后端基础。",
      rawTextPreview: "张同学 软件工程 Java"
    }),
    analyzeEvidence: vi.fn(),
    scoreMatch: vi.fn().mockResolvedValue({
      totalScore: 82,
      recommendationLevel: "建议进入一面",
      summary: "整体匹配度较高。",
      dimensions: [
        { key: "skill", label: "技能匹配", value: 86, benchmark: 70 },
        { key: "project", label: "项目相关", value: 80, benchmark: 65 }
      ],
      advantages: ["Java 基础较扎实"],
      weaknesses: ["Redis 证据不足"],
      hrAdvice: "建议验证接口设计能力。"
    }),
    generateInterviewTasks: vi.fn(),
    generateReport: vi.fn(),
    ...overrides
  };
}

describe("analysis API", () => {
  it("returns structured job analysis for valid JD text", async () => {
    const aiClient = createAiClient();
    const app = createApp({ aiClient });

    const response = await request(app)
      .post("/api/analyze-job")
      .send({ jdText: "招聘 Java 后端实习生，要求熟悉 Spring Boot 和 MySQL。" })
      .expect(200);

    expect(response.body.jobTitle).toBe("Java 后端实习生");
    expect(response.body.abilities.reduce((total: number, item: { weight: number }) => total + item.weight, 0)).toBe(100);
    expect(aiClient.analyzeJob).toHaveBeenCalledWith(expect.stringContaining("Java 后端"));
  });

  it("returns a readable error when JD analysis fails", async () => {
    const aiClient = createAiClient({
      analyzeJob: vi.fn().mockRejectedValue(new Error("model unavailable"))
    });
    const app = createApp({ aiClient });

    const response = await request(app)
      .post("/api/analyze-job")
      .send({ jdText: "招聘 Java 后端实习生，要求熟悉 Spring Boot 和 MySQL。" })
      .expect(502);

    expect(response.body.error.code).toBe("AI_PROVIDER_ERROR");
    expect(response.body.error.message).toContain("AI 服务调用失败");
  });

  it("accepts TXT resume upload and returns structured resume analysis", async () => {
    const aiClient = createAiClient();
    const app = createApp({ aiClient });

    const response = await request(app)
      .post("/api/analyze-resume")
      .attach("file", Buffer.from("张同学\nJava Spring Boot MySQL", "utf8"), {
        filename: "resume.txt",
        contentType: "text/plain"
      })
      .expect(200);

    expect(response.body.candidate.name).toBe("张同学");
    expect(aiClient.analyzeResume).toHaveBeenCalledWith(expect.stringContaining("Java Spring Boot"), "resume.txt");
  });

  it("rejects unsupported resume file type", async () => {
    const app = createApp({ aiClient: createAiClient() });

    const response = await request(app)
      .post("/api/analyze-resume")
      .attach("file", Buffer.from("not allowed", "utf8"), {
        filename: "resume.png",
        contentType: "image/png"
      })
      .expect(415);

    expect(response.body.error.code).toBe("UNSUPPORTED_FILE_TYPE");
  });
});
