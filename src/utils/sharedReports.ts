import type { MatchReport, MatchScoreResult, ResumeAnalysisResult, SharedReport } from "../types";

export const SHARED_REPORTS_STORAGE_KEY = "trusthire.sharedReports.v1";

type SharedReportStore = Record<string, SharedReport>;

function readSharedReportStore(): SharedReportStore {
  try {
    const raw = localStorage.getItem(SHARED_REPORTS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as SharedReportStore) : {};
  } catch {
    return {};
  }
}

function writeSharedReportStore(store: SharedReportStore) {
  localStorage.setItem(SHARED_REPORTS_STORAGE_KEY, JSON.stringify(store));
}

function slugifyPart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function createStableReportId(report: MatchReport) {
  const readablePart = [report.candidateName, report.jobTitle].map(slugifyPart).filter(Boolean).join("-");
  const signature = JSON.stringify({
    candidateName: report.candidateName,
    jobTitle: report.jobTitle,
    totalScore: report.totalScore,
    recommendationLevel: report.recommendationLevel,
    finalAdvice: report.finalAdvice
  });
  let hash = 0;
  for (let index = 0; index < signature.length; index += 1) {
    hash = (hash * 31 + signature.charCodeAt(index)) >>> 0;
  }
  return `local-${readablePart || "report"}-${hash.toString(36)}`;
}

export function saveSharedReport({
  report,
  resumeAnalysis,
  matchDimensions,
  interviewNotes
}: {
  report: MatchReport;
  resumeAnalysis: ResumeAnalysisResult | null;
  matchDimensions: MatchScoreResult["dimensions"];
  interviewNotes: string;
}) {
  const id = createStableReportId(report);
  const existing = readSharedReportStore();
  const sharedReport: SharedReport = {
    id,
    createdAt: existing[id]?.createdAt ?? new Date().toISOString(),
    report,
    resumeSnapshot: {
      name: resumeAnalysis?.candidate.name ?? report.candidateName,
      school: resumeAnalysis?.candidate.school ?? "",
      major: resumeAnalysis?.candidate.major ?? "",
      targetJob: resumeAnalysis?.candidate.targetJob ?? report.jobTitle
    },
    matchDimensions,
    interviewNotes
  };
  writeSharedReportStore({ ...existing, [id]: sharedReport });
  return sharedReport;
}

export function getSharedReport(reportId: string | null) {
  if (!reportId) return null;
  return readSharedReportStore()[reportId] ?? null;
}
