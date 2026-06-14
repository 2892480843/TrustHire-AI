import { AiProviderError, AppError } from "../../errors.js";
import type { AnalysisAiClient } from "../analysis/analysisService.js";
import type { AgentJobStore } from "./agentStore.js";
import type { AgentRunInput, AgentStageKey } from "./agentTypes.js";

export class AgentRunner {
  constructor(
    private readonly aiClient: AnalysisAiClient,
    private readonly store: AgentJobStore
  ) {}

  start(input: AgentRunInput) {
    const job = this.store.create();
    queueMicrotask(() => {
      void this.run(job.id, input);
    });
    return job;
  }

  get(jobId: string) {
    return this.store.get(jobId);
  }

  private async run(jobId: string, input: AgentRunInput) {
    this.store.markRunning(jobId);

    try {
      this.store.startStage(jobId, "jobAnalysis");
      const jobAnalysis = await this.aiClient.analyzeJob(input.jdText);
      this.store.completeStage(jobId, "jobAnalysis", jobAnalysis);

      this.store.startStage(jobId, "resumeAnalysis");
      const resumeAnalysis = await this.aiClient.analyzeResume(input.resumeText, input.filename);
      this.store.completeStage(jobId, "resumeAnalysis", resumeAnalysis);

      this.store.startStage(jobId, "evidenceAnalysis");
      const evidenceAnalysis = await this.aiClient.analyzeEvidence(jobAnalysis, resumeAnalysis);
      this.store.completeStage(jobId, "evidenceAnalysis", evidenceAnalysis);

      this.store.startStage(jobId, "matchScore");
      const matchScore = await this.aiClient.scoreMatch(jobAnalysis, resumeAnalysis, evidenceAnalysis);
      this.store.completeStage(jobId, "matchScore", matchScore);

      this.store.startStage(jobId, "interviewTasks");
      const interviewTasks = await this.aiClient.generateInterviewTasks({
        jobAnalysis,
        resumeAnalysis,
        evidenceAnalysis,
        matchScore
      });
      this.store.completeStage(jobId, "interviewTasks", interviewTasks);

      this.store.startStage(jobId, "matchReport");
      const matchReport = await this.aiClient.generateReport({
        jobAnalysis,
        resumeAnalysis,
        evidenceAnalysis,
        matchScore,
        interviewTasks
      });
      this.store.completeStage(jobId, "matchReport", matchReport);

      this.store.complete(jobId);
    } catch (error) {
      const failedStage = this.getCurrentStage(jobId);
      const appError = error instanceof AppError ? error : new AiProviderError();
      this.store.fail(jobId, failedStage, {
        code: appError.code,
        message: appError.message
      });
    }
  }

  private getCurrentStage(jobId: string): AgentStageKey {
    return this.store.get(jobId).currentStage ?? "jobAnalysis";
  }
}
