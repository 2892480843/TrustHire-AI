import { useEffect, useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Layout } from "./components/Layout";
import { navItems } from "./data/mockData";
import { Dashboard } from "./pages/Dashboard";
import { EvidenceAnalysis } from "./pages/EvidenceAnalysis";
import { InterviewTasks } from "./pages/InterviewTasks";
import { JobAnalysis } from "./pages/JobAnalysis";
import { MatchingReport } from "./pages/MatchingReport";
import { MatchingScore } from "./pages/MatchingScore";
import { ResumeAnalysis } from "./pages/ResumeAnalysis";
import { AnalysisFlowProvider } from "./state/AnalysisFlowContext";
import type { PageKey } from "./types";

const pages: Record<PageKey, string> = {
  dashboard: "#/dashboard",
  job: "#/job",
  resume: "#/resume",
  evidence: "#/evidence",
  score: "#/score",
  interview: "#/interview",
  report: "#/report"
};

function getHashPath() {
  return window.location.hash.split("?")[0];
}

function getReportIdFromHash() {
  const [, query = ""] = window.location.hash.split("?");
  return new URLSearchParams(query).get("reportId");
}

function parseHash(): PageKey {
  const match = navItems.find((item) => item.path === getHashPath());
  return match?.key ?? "dashboard";
}

export default function App() {
  const [activePage, setActivePage] = useState<PageKey>(() => parseHash());
  const [reportId, setReportId] = useState<string | null>(() => getReportIdFromHash());
  const [toast, setToast] = useState("");

  useEffect(() => {
    const handleHash = () => {
      setActivePage(parseHash());
      setReportId(getReportIdFromHash());
    };
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const navigate = (page: PageKey) => {
    setActivePage(page);
    window.location.hash = pages[page];
  };

  const content = useMemo(() => {
    switch (activePage) {
      case "job":
        return <JobAnalysis onToast={setToast} />;
      case "resume":
        return <ResumeAnalysis onToast={setToast} />;
      case "evidence":
        return <EvidenceAnalysis />;
      case "score":
        return <MatchingScore />;
      case "interview":
        return <InterviewTasks onToast={setToast} onNavigate={navigate} />;
      case "report":
        return <MatchingReport onToast={setToast} reportId={reportId} />;
      case "dashboard":
      default:
        return <Dashboard onNavigate={navigate} onToast={setToast} />;
    }
  }, [activePage, reportId]);

  return (
    <AnalysisFlowProvider>
      <Layout activePage={activePage} onNavigate={navigate} onToast={setToast}>
        {content}
      </Layout>
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-4 right-4 z-50 mx-auto flex max-w-md items-center gap-3 rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 shadow-[0_14px_36px_rgba(31,41,51,0.14)] sm:left-auto sm:right-6 sm:top-20 sm:bottom-auto"
        >
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}
    </AnalysisFlowProvider>
  );
}
