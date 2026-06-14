import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "../app.js";
import type { AnalysisAiClient } from "../features/analysis/analysisService.js";

const jobAnalysis = {
  jobTitle: "Java Backend Intern",
  summary: "Build backend APIs and support system optimization.",
  abilities: [
    { category: "Programming", name: "Java", description: "Java fundamentals", weight: 40 },
    { category: "Framework", name: "Spring Boot", description: "Backend service development", weight: 30 },
    { category: "Database", name: "MySQL", description: "SQL and schema design", weight: 30 }
  ],
  portrait: ["Engineering-oriented intern"],
  screeningAdvice: ["Verify real Spring Boot project experience"]
};

const resumeAnalysis = {
  candidate: {
    name: "Zhang San",
    school: "Example University",
    major: "Software Engineering",
    education: "Bachelor",
    targetJob: "Java Backend Intern",
    city: "Shanghai",
    expectedArrival: "Within one month"
  },
  skills: ["Java", "Spring Boot", "MySQL"],
  education: [{ school: "Example University", major: "Software Engineering", degree: "Bachelor", period: "2021-2025" }],
  projects: [
    {
      name: "Campus Trading Platform",
      role: "Backend Developer",
      period: "2024",
      description: "Implemented login and order APIs.",
      technologies: ["Java", "Spring Boot", "MySQL"]
    }
  ],
  internships: [],
  certificates: [],
  risks: [],
  summary: "Candidate has Java backend project experience.",
  rawTextPreview: "Zhang San Java Spring Boot MySQL"
};

const evidenceAnalysis = {
  mappings: [
    {
      ability: "Java",
      evidence: "Campus Trading Platform backend APIs",
      strength: "strong",
      source: "project",
      judgement: "Supports backend development requirement"
    }
  ],
  risks: [],
  followUpQuestions: ["Explain the order API transaction flow."]
};

const matchScore = {
  totalScore: 84,
  recommendationLevel: "Recommended for first interview",
  summary: "Good overall match.",
  dimensions: [{ key: "skill", label: "Skill match", value: 86, benchmark: 70 }],
  advantages: ["Relevant Java backend project"],
  weaknesses: ["Limited production experience"],
  hrAdvice: "Proceed to technical interview."
};

const interviewTasks = {
  tasks: [
    { id: 1, category: "Technical", question: "Explain your API design.", focus: "API design", difficulty: "Medium", duration: "8 min", tags: ["API"], basis: "Job requires backend APIs" },
    { id: 2, category: "Project", question: "Describe your project layers.", focus: "Project authenticity", difficulty: "Medium", duration: "8 min", tags: ["Spring"], basis: "Resume project evidence" },
    { id: 3, category: "Practical", question: "Design an order API.", focus: "Modeling", difficulty: "Hard", duration: "15 min", tags: ["Design"], basis: "Ability gap check" },
    { id: 4, category: "Risk", question: "How did you use MySQL indexes?", focus: "Risk validation", difficulty: "Medium", duration: "6 min", tags: ["MySQL"], basis: "Database requirement" }
  ]
};

const matchReport = {
  candidateName: "Zhang San",
  jobTitle: "Java Backend Intern",
  totalScore: 84,
  recommendationLevel: "Recommended for first interview",
  strengths: ["Relevant Java backend project"],
  risks: ["Limited production experience"],
  gaps: ["Production troubleshooting"],
  interviewAdvice: ["Verify API design and database fundamentals"],
  finalAdvice: "Proceed to first interview."
};

function createAiClient(overrides: Partial<AnalysisAiClient> = {}): AnalysisAiClient {
  return {
    analyzeJob: vi.fn().mockResolvedValue(jobAnalysis),
    analyzeResume: vi.fn().mockResolvedValue(resumeAnalysis),
    analyzeEvidence: vi.fn().mockResolvedValue(evidenceAnalysis),
    scoreMatch: vi.fn().mockResolvedValue(matchScore),
    generateInterviewTasks: vi.fn().mockResolvedValue(interviewTasks),
    generateReport: vi.fn().mockResolvedValue(matchReport),
    ...overrides
  };
}

async function waitForJob(app: ReturnType<typeof createApp>, jobId: string, status: "completed" | "failed") {
  for (let i = 0; i < 30; i += 1) {
    const response = await request(app).get(`/api/agent/jobs/${jobId}`).expect(200);
    if (response.body.status === status) return response;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  throw new Error(`Agent job did not reach ${status}`);
}

describe("agent API", () => {
  it("creates a task job and completes the full hiring analysis flow", async () => {
    const aiClient = createAiClient();
    const app = createApp({ aiClient });

    const created = await request(app)
      .post("/api/agent/jobs")
      .field("jdText", "We need a Java backend intern familiar with Spring Boot and MySQL.")
      .attach("file", Buffer.from("Zhang San Java Spring Boot MySQL backend project", "utf8"), {
        filename: "resume.txt",
        contentType: "text/plain"
      })
      .expect(202);

    expect(created.body.jobId).toEqual(expect.any(String));
    expect(created.body.status).toMatch(/queued|running/);
    expect(created.body.stages.map((stage: { key: string }) => stage.key)).toEqual([
      "jobAnalysis",
      "resumeAnalysis",
      "evidenceAnalysis",
      "matchScore",
      "interviewTasks",
      "matchReport"
    ]);

    const completed = await waitForJob(app, created.body.jobId, "completed");

    expect(completed.body.results.matchReport.finalAdvice).toBe("Proceed to first interview.");
    expect(aiClient.analyzeJob).toHaveBeenCalledWith(expect.stringContaining("Java backend intern"));
    expect(aiClient.analyzeResume).toHaveBeenCalledWith(expect.stringContaining("Spring Boot"), "resume.txt");
    expect(aiClient.generateReport).toHaveBeenCalledTimes(1);
  });

  it("marks the job failed at the failing stage without losing prior results", async () => {
    const aiClient = createAiClient({
      scoreMatch: vi.fn().mockRejectedValue(new Error("score model failed"))
    });
    const app = createApp({ aiClient });

    const created = await request(app)
      .post("/api/agent/jobs")
      .field("jdText", "We need a Java backend intern familiar with Spring Boot and MySQL.")
      .attach("file", Buffer.from("Zhang San Java Spring Boot MySQL backend project", "utf8"), {
        filename: "resume.txt",
        contentType: "text/plain"
      })
      .expect(202);

    const failed = await waitForJob(app, created.body.jobId, "failed");

    expect(failed.body.currentStage).toBe("matchScore");
    expect(failed.body.error.message).toContain("AI 服务调用失败");
    expect(failed.body.results.jobAnalysis.jobTitle).toBe("Java Backend Intern");
    expect(failed.body.results.evidenceAnalysis.mappings).toHaveLength(1);
    expect(failed.body.results.matchScore).toBeNull();
  });

  it("rejects unsupported resume file types before creating a job", async () => {
    const app = createApp({ aiClient: createAiClient() });

    const response = await request(app)
      .post("/api/agent/jobs")
      .field("jdText", "We need a Java backend intern familiar with Spring Boot and MySQL.")
      .attach("file", Buffer.from("not allowed", "utf8"), {
        filename: "resume.png",
        contentType: "image/png"
      })
      .expect(415);

    expect(response.body.error.code).toBe("UNSUPPORTED_FILE_TYPE");
  });
});
