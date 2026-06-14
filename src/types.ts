import type { LucideIcon } from "lucide-react";

export type PageKey =
  | "dashboard"
  | "job"
  | "resume"
  | "evidence"
  | "score"
  | "interview"
  | "report";

export type EvidenceLevel = "强证据" | "中证据" | "弱证据" | "缺证据";

export interface NavItem {
  key: PageKey;
  label: string;
  path: string;
  icon: LucideIcon;
}

export interface JobAbility {
  category: string;
  name: string;
  description: string;
  weight: number;
  color?: string;
}

export interface CandidateProject {
  projectName: string;
  role: string;
  period: string;
  description: string;
  tags: string[];
}

export interface Candidate {
  candidateId: string;
  name: string;
  school: string;
  major: string;
  education: string;
  targetJob: string;
  city: string;
  expectedArrival: string;
  skills: string[];
  projects: CandidateProject[];
  internships: string[];
  certificates: string[];
  courses: string[];
  risks: string[];
}

export interface EvidenceItem {
  ability: string;
  evidence: string;
  level: EvidenceLevel;
  judgement: string;
  source: string;
}

export interface ScoreDimension {
  key: string;
  label: string;
  value: number;
  benchmark: number;
  color?: string;
}

export interface InterviewTask {
  id: number;
  category: string;
  question: string;
  focus: string;
  difficulty: string;
  duration: string;
  tags: string[];
  basis?: string;
}

export interface JobAnalysisResult {
  jobTitle: string;
  summary: string;
  abilities: JobAbility[];
  portrait: string[];
  screeningAdvice: string[];
}

export interface ResumeEducation {
  school: string;
  major: string;
  degree: string;
  period: string;
}

export interface ResumeProject {
  name: string;
  role: string;
  period: string;
  description: string;
  technologies: string[];
}

export interface ResumeAnalysisResult {
  candidate: {
    name: string;
    school: string;
    major: string;
    education: string;
    targetJob: string;
    city: string;
    expectedArrival: string;
  };
  skills: string[];
  education: ResumeEducation[];
  projects: ResumeProject[];
  internships: string[];
  certificates: string[];
  risks: string[];
  summary: string;
  rawTextPreview: string;
}

export interface EvidenceAnalysisResult {
  mappings: Array<{
    ability: string;
    evidence: string;
    strength: EvidenceLevel | string;
    source: string;
    judgement: string;
  }>;
  risks: string[];
  followUpQuestions: string[];
}

export interface MatchScoreResult {
  totalScore: number;
  recommendationLevel: string;
  summary: string;
  dimensions: Array<{
    key: string;
    label: string;
    value: number;
    benchmark: number;
  }>;
  advantages: string[];
  weaknesses: string[];
  hrAdvice: string;
}

export interface InterviewTasksResult {
  tasks: InterviewTask[];
}

export interface MatchReport {
  candidateName: string;
  jobTitle: string;
  totalScore: number;
  recommendationLevel: string;
  strengths: string[];
  risks: string[];
  gaps: string[];
  interviewAdvice: string[];
  finalAdvice: string;
}

export interface AnalysisFlowState {
  jobAnalysis: JobAnalysisResult | null;
  resumeAnalysis: ResumeAnalysisResult | null;
  evidenceAnalysis: EvidenceAnalysisResult | null;
  matchScore: MatchScoreResult | null;
  interviewTasks: InterviewTasksResult | null;
  matchReport: MatchReport | null;
  interviewNotes: string;
}

export interface SharedReport {
  id: string;
  createdAt: string;
  report: MatchReport;
  resumeSnapshot: {
    name: string;
    school: string;
    major: string;
    targetJob: string;
  };
  matchDimensions: MatchScoreResult["dimensions"];
  interviewNotes: string;
}

export type AgentStageKey =
  | "jobAnalysis"
  | "resumeAnalysis"
  | "evidenceAnalysis"
  | "matchScore"
  | "interviewTasks"
  | "matchReport";

export type AgentJobStatus = "queued" | "running" | "completed" | "failed";
export type AgentStageStatus = "pending" | "running" | "completed" | "failed";

export interface AgentStage {
  key: AgentStageKey;
  label: string;
  status: AgentStageStatus;
  startedAt: string | null;
  completedAt: string | null;
}

export interface AgentJob {
  id: string;
  jobId?: string;
  status: AgentJobStatus;
  currentStage: AgentStageKey | null;
  stages: AgentStage[];
  results: AnalysisFlowState;
  error: { code: string; message: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgentJobResponse extends Omit<AgentJob, "id"> {
  jobId: string;
}
