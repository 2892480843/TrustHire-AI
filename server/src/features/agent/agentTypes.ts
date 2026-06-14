import type {
  EvidenceAnalysis,
  InterviewTasks,
  JobAnalysis,
  MatchReport,
  MatchScore,
  ResumeAnalysis
} from "../../schemas/analysisSchemas.js";

export const agentStageKeys = [
  "jobAnalysis",
  "resumeAnalysis",
  "evidenceAnalysis",
  "matchScore",
  "interviewTasks",
  "matchReport"
] as const;

export type AgentStageKey = (typeof agentStageKeys)[number];
export type AgentJobStatus = "queued" | "running" | "completed" | "failed";
export type AgentStageStatus = "pending" | "running" | "completed" | "failed";

export interface AgentStage {
  key: AgentStageKey;
  label: string;
  status: AgentStageStatus;
  startedAt: string | null;
  completedAt: string | null;
}

export interface AgentResults {
  jobAnalysis: JobAnalysis | null;
  resumeAnalysis: ResumeAnalysis | null;
  evidenceAnalysis: EvidenceAnalysis | null;
  matchScore: MatchScore | null;
  interviewTasks: InterviewTasks | null;
  matchReport: MatchReport | null;
}

export interface AgentJobError {
  code: string;
  message: string;
}

export interface AgentJob {
  id: string;
  status: AgentJobStatus;
  currentStage: AgentStageKey | null;
  stages: AgentStage[];
  results: AgentResults;
  error: AgentJobError | null;
  createdAt: string;
  updatedAt: string;
}

export interface AgentRunInput {
  jdText: string;
  resumeText: string;
  filename: string;
}
