import type {
  EvidenceAnalysisResult,
  InterviewTasksResult,
  JobAnalysisResult,
  MatchReport,
  MatchScoreResult,
  ResumeAnalysisResult,
  AgentJob,
  CreateAgentJobResponse
} from "../types";
import { getJson, postForm, postJson } from "./apiClient";

export function analyzeJobDescription(jdText: string) {
  return postJson<JobAnalysisResult>("/api/analyze-job", { jdText });
}

export function analyzeResumeFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return postForm<ResumeAnalysisResult>("/api/analyze-resume", formData);
}

export function analyzeEvidence(jobAnalysis: JobAnalysisResult, resumeAnalysis: ResumeAnalysisResult) {
  return postJson<EvidenceAnalysisResult>("/api/evidence-analysis", { jobAnalysis, resumeAnalysis });
}

export function calculateMatchScore(
  jobAnalysis: JobAnalysisResult,
  resumeAnalysis: ResumeAnalysisResult,
  evidenceAnalysis: EvidenceAnalysisResult
) {
  return postJson<MatchScoreResult>("/api/match-score", { jobAnalysis, resumeAnalysis, evidenceAnalysis });
}

export function generateInterviewTasks(input: {
  jobAnalysis: JobAnalysisResult;
  resumeAnalysis: ResumeAnalysisResult;
  evidenceAnalysis: EvidenceAnalysisResult;
  matchScore: MatchScoreResult;
}) {
  return postJson<InterviewTasksResult>("/api/interview-tasks", input);
}

export function generateMatchReport(input: {
  jobAnalysis: JobAnalysisResult;
  resumeAnalysis: ResumeAnalysisResult;
  evidenceAnalysis: EvidenceAnalysisResult;
  matchScore: MatchScoreResult;
  interviewTasks: InterviewTasksResult;
}) {
  return postJson<MatchReport>("/api/match-report", input);
}

export function startAgentJob(input: { jdText: string; file: File }) {
  const formData = new FormData();
  formData.append("jdText", input.jdText);
  formData.append("file", input.file);
  return postForm<CreateAgentJobResponse>("/api/agent/jobs", formData);
}

export function getAgentJob(jobId: string) {
  return getJson<AgentJob>(`/api/agent/jobs/${jobId}`);
}
