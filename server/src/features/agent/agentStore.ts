import { randomUUID } from "node:crypto";
import { AppError } from "../../errors.js";
import { agentStageKeys, type AgentJob, type AgentResults, type AgentStageKey } from "./agentTypes.js";

const stageLabels: Record<AgentStageKey, string> = {
  jobAnalysis: "JD 解析",
  resumeAnalysis: "简历解析",
  evidenceAnalysis: "证据链分析",
  matchScore: "人岗匹配评分",
  interviewTasks: "面试任务生成",
  matchReport: "匹配报告生成"
};

const emptyResults: AgentResults = {
  jobAnalysis: null,
  resumeAnalysis: null,
  evidenceAnalysis: null,
  matchScore: null,
  interviewTasks: null,
  matchReport: null
};

export class AgentJobNotFoundError extends AppError {
  constructor() {
    super("AGENT_JOB_NOT_FOUND", "未找到指定 Agent 任务。", 404);
  }
}

export class AgentJobStore {
  private readonly jobs = new Map<string, AgentJob>();

  create() {
    const now = new Date().toISOString();
    const job: AgentJob = {
      id: randomUUID(),
      status: "queued",
      currentStage: null,
      stages: agentStageKeys.map((key) => ({
        key,
        label: stageLabels[key],
        status: "pending",
        startedAt: null,
        completedAt: null
      })),
      results: { ...emptyResults },
      error: null,
      createdAt: now,
      updatedAt: now
    };
    this.jobs.set(job.id, job);
    return this.snapshot(job);
  }

  get(id: string) {
    const job = this.jobs.get(id);
    if (!job) throw new AgentJobNotFoundError();
    return this.snapshot(job);
  }

  markRunning(id: string) {
    const job = this.requireJob(id);
    job.status = "running";
    job.updatedAt = new Date().toISOString();
    return this.snapshot(job);
  }

  startStage(id: string, stageKey: AgentStageKey) {
    const job = this.requireJob(id);
    const now = new Date().toISOString();
    job.status = "running";
    job.currentStage = stageKey;
    job.updatedAt = now;
    job.stages = job.stages.map((stage) =>
      stage.key === stageKey ? { ...stage, status: "running", startedAt: stage.startedAt ?? now } : stage
    );
    return this.snapshot(job);
  }

  completeStage<K extends AgentStageKey>(id: string, stageKey: K, result: AgentResults[K]) {
    const job = this.requireJob(id);
    const now = new Date().toISOString();
    job.results = { ...job.results, [stageKey]: result };
    job.updatedAt = now;
    job.stages = job.stages.map((stage) =>
      stage.key === stageKey ? { ...stage, status: "completed", completedAt: now } : stage
    );
    return this.snapshot(job);
  }

  complete(id: string) {
    const job = this.requireJob(id);
    job.status = "completed";
    job.currentStage = null;
    job.updatedAt = new Date().toISOString();
    job.error = null;
    return this.snapshot(job);
  }

  fail(id: string, stageKey: AgentStageKey, error: { code: string; message: string }) {
    const job = this.requireJob(id);
    const now = new Date().toISOString();
    job.status = "failed";
    job.currentStage = stageKey;
    job.updatedAt = now;
    job.error = error;
    job.stages = job.stages.map((stage) =>
      stage.key === stageKey ? { ...stage, status: "failed", completedAt: now } : stage
    );
    return this.snapshot(job);
  }

  private requireJob(id: string) {
    const job = this.jobs.get(id);
    if (!job) throw new AgentJobNotFoundError();
    return job;
  }

  private snapshot(job: AgentJob): AgentJob {
    return {
      ...job,
      stages: job.stages.map((stage) => ({ ...stage })),
      results: { ...job.results },
      error: job.error ? { ...job.error } : null
    };
  }
}
