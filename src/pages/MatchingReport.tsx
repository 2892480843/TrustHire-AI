import { useState } from "react";
import { AlertTriangle, CheckCircle2, Download, FileText, Loader2, Send, Star } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { ScoreRing } from "../components/ui/ScoreRing";
import { getErrorMessage } from "../services/apiClient";
import { generateMatchReport } from "../services/analysisService";
import { useAnalysisFlow } from "../state/AnalysisFlowContext";
import { asset } from "../utils/asset";
import { exportMarkdownReport } from "../utils/reportExport";
import { getSharedReport, saveSharedReport } from "../utils/sharedReports";

export function MatchingReport({ onToast, reportId }: { onToast: (message: string) => void; reportId?: string | null }) {
  const { jobAnalysis, resumeAnalysis, evidenceAnalysis, matchScore, interviewTasks, matchReport, interviewNotes, setMatchReport } = useAnalysisFlow();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const sharedReport = reportId ? getSharedReport(reportId) : null;
  const isSharedView = Boolean(reportId);
  const report = sharedReport?.report ?? matchReport;
  const displayedNotes = sharedReport?.interviewNotes ?? interviewNotes;
  const resumeSnapshot = sharedReport?.resumeSnapshot ?? {
    name: resumeAnalysis?.candidate.name ?? report?.candidateName ?? "",
    school: resumeAnalysis?.candidate.school ?? "",
    major: resumeAnalysis?.candidate.major ?? "",
    targetJob: resumeAnalysis?.candidate.targetJob ?? report?.jobTitle ?? ""
  };
  const dimensions = sharedReport?.matchDimensions ?? matchScore?.dimensions ?? [];

  async function handleGenerate() {
    if (!jobAnalysis || !resumeAnalysis || !evidenceAnalysis || !matchScore || !interviewTasks) return;
    setLoading(true);
    setError("");
    try {
      setMatchReport(await generateMatchReport({ jobAnalysis, resumeAnalysis, evidenceAnalysis, matchScore, interviewTasks }));
      onToast("匹配报告已生成");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function handleExport() {
    if (!report) return;
    exportMarkdownReport(report, resumeSnapshot.name || report.candidateName || "candidate", displayedNotes);
    onToast("Markdown 报告已下载");
  }

  async function handleShare() {
    if (!matchReport || !matchScore) return;
    const shared = saveSharedReport({
      report: matchReport,
      resumeAnalysis,
      matchDimensions: matchScore.dimensions,
      interviewNotes
    });
    const shareUrl = `${window.location.origin}/#/report?reportId=${encodeURIComponent(shared.id)}`;
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        onToast("本地演示分享链接已复制");
        return;
      } catch {
        onToast(`本地演示分享链接：${shareUrl}`);
        return;
      }
    }
    onToast(`本地演示分享链接：${shareUrl}`);
  }

  if (isSharedView && !sharedReport) {
    return (
      <>
        <PageHeader title="HR 匹配报告" subtitle="本地演示链接仅能在生成报告的同一浏览器或同一 localStorage 环境中打开。" />
        <Card title="本地分享报告" variant="panel">
          <div className="grid gap-5 p-5 text-sm leading-6 text-slate-600 md:grid-cols-[180px_1fr] md:items-center">
            <img
              src={asset("images/report-cover.png")}
              alt="HR 匹配报告封面"
              width={1536}
              height={1024}
              className="clay-soft-panel h-32 w-full rounded-[1.5rem] object-cover"
            />
            <EmptyState
              title="未找到本地分享报告"
              description="请在生成报告的浏览器中打开或重新生成。"
              nextStep="返回完整流程重新生成报告"
              value="本地 Demo 不伪造公网可访问链接"
            />
          </div>
        </Card>
      </>
    );
  }

  if (!isSharedView && (!jobAnalysis || !resumeAnalysis || !evidenceAnalysis || !matchScore || !interviewTasks)) {
    return (
      <>
        <PageHeader title="HR 匹配报告" subtitle="基于全流程结构化结果生成，可导出 Markdown 文件。" />
        <Card title="匹配报告" variant="panel">
          <div className="grid gap-5 p-5 text-sm leading-6 text-slate-600 md:grid-cols-[180px_1fr] md:items-center">
            <img
              src={asset("images/report-cover.png")}
              alt="HR 匹配报告封面"
              width={1536}
              height={1024}
              className="clay-soft-panel h-32 w-full rounded-[1.5rem] object-cover"
            />
            <EmptyState
              title="报告生成还缺少面试任务"
              description="请先完成面试任务生成，再生成最终匹配报告。"
              nextStep="生成面试任务"
              value="把评分结论转成可执行的面试验证清单"
            />
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="HR 匹配报告"
        subtitle={isSharedView ? "本地演示分享报告，仅能在生成报告的同一浏览器或同一 localStorage 环境中查看。" : "基于全流程结构化结果生成，可导出 Markdown 文件。"}
        actions={
          <>
            {!isSharedView && (
              <Button variant="secondary" icon={loading ? <Loader2 className="animate-spin" size={18} /> : <Star size={18} />} onClick={handleGenerate} disabled={loading}>
                {report ? "重新生成报告" : "生成匹配报告"}
              </Button>
            )}
            <Button variant="secondary" icon={<Download size={18} />} onClick={handleExport} disabled={!report}>
              导出 Markdown
            </Button>
            <Button variant="ai" icon={<Send size={18} />} onClick={handleShare} disabled={isSharedView || !matchReport}>
              分享报告
            </Button>
          </>
        }
      />

      {error && <div className="rounded-[1.25rem] bg-[#ffe7e4] px-4 py-3 text-sm text-red-700 shadow-[inset_5px_5px_12px_rgba(194,86,74,0.1),inset_-6px_-6px_14px_rgba(255,255,255,0.72)]">{error}</div>}

      {!report ? (
        <Card title="等待生成" variant="panel">
          <div className="grid gap-5 p-5 text-sm leading-6 text-slate-600 md:grid-cols-[180px_1fr] md:items-center">
            <img
              src={asset("images/report-cover.png")}
              alt="HR 匹配报告封面"
              width={1536}
              height={1024}
              className="clay-soft-panel h-32 w-full rounded-[1.5rem] object-cover"
            />
            <EmptyState
              title="生成可交付给招聘团队的决策摘要"
              description="点击“生成匹配报告”后，后端会输出候选人、岗位、匹配分、优势、风险、能力缺口、面试建议和最终建议。"
              nextStep="生成匹配报告"
              value="沉淀可下载、可分享、可复盘的 HR 决策摘要"
            />
          </div>
        </Card>
      ) : (
        <>
          <Card variant="hero">
            <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.55fr_0.65fr] lg:items-center">
              <div className="flex min-w-0 items-start gap-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[1.5rem] bg-[#d8e9ff] text-2xl font-black text-sky-800 shadow-[12px_14px_30px_rgba(94,121,151,0.16),inset_7px_7px_16px_rgba(112,132,155,0.1),inset_-8px_-8px_18px_rgba(255,255,255,0.72)]">
                  {report.candidateName.slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <div className="clay-mini-chip mb-2 text-sky-700">{isSharedView ? "本地演示分享报告" : "HR 决策摘要"}</div>
                  <h2 className="truncate text-3xl font-black text-slate-950">{report.candidateName}</h2>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
                    {resumeSnapshot.school && <span>{resumeSnapshot.school}</span>}
                    {resumeSnapshot.major && <span>{resumeSnapshot.major}</span>}
                    <span>目标岗位：{report.jobTitle}</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-slate-500">综合匹配度</div>
                <div className="mt-1 text-6xl font-black text-blue-700">{report.totalScore}<span className="text-2xl text-slate-500"> /100</span></div>
              </div>
              <div className="flex items-center justify-center gap-4">
                <div>
                  <div className="text-sm font-semibold text-slate-500">推荐等级</div>
                  <div className="clay-mini-chip mt-2 px-4 py-2 text-lg font-black text-emerald-700">{report.recommendationLevel}</div>
                </div>
              </div>
            </div>
            <div className="px-6 pb-6">
              <div className="clay-page-note grid gap-3 px-4 py-3 text-sm font-semibold leading-6 text-slate-600 md:grid-cols-3">
                {[
                  ["报告来源", "岗位、简历、证据链、面试任务"],
                  ["复核重点", `${report.risks.length} 个风险点`],
                  ["交付状态", report.recommendationLevel]
                ].map(([label, value], index) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="clay-step-dot">{index + 1}</span>
                    <span><strong className="text-slate-900">{label}</strong>：{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <section className="grid gap-5 xl:grid-cols-[1.25fr_0.85fr]">
            <div className="space-y-4">
              {[
                { title: "核心优势", items: report.strengths, color: "green", icon: CheckCircle2 },
                { title: "主要风险", items: report.risks, color: "orange", icon: AlertTriangle },
                { title: "能力缺口", items: report.gaps, color: "blue", icon: AlertTriangle },
                { title: "面试建议", items: report.interviewAdvice, color: "blue", icon: Star },
                ...(displayedNotes.trim() ? [{ title: "面试官记录", items: [displayedNotes.trim()], color: "blue", icon: FileText }] : []),
                { title: "最终建议", items: [report.finalAdvice], color: "green", icon: CheckCircle2 }
              ].map(({ title, items, color, icon: Icon }, sectionIndex) => (
                <Card key={title} variant="panel">
                  <div className="grid gap-4 p-5 md:grid-cols-[170px_1fr] md:items-start">
                    <div className="flex items-center gap-3">
                      <span className={`grid h-9 w-9 place-items-center rounded-[1rem] text-sm font-black shadow-[inset_4px_4px_10px_rgba(112,132,127,0.12),inset_-5px_-5px_12px_rgba(255,255,255,0.7)] ${color === "green" ? "bg-[#dff8ec] text-emerald-700" : color === "orange" ? "bg-[#fff1df] text-orange-700" : "bg-[#d8e9ff] text-sky-700"}`}>
                        <Icon size={17} />
                      </span>
                      <div>
                        <div className="text-xs font-bold text-slate-400">0{sectionIndex + 1}</div>
                        <h2 className="text-lg font-black text-slate-950">{title}</h2>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm leading-7 text-slate-700">
                      {items.map((item) => (
                         <div key={item} className="clay-detail-tile flex items-start gap-2 px-3 py-2">
                           <span className={`mt-3 h-1.5 w-1.5 shrink-0 rounded-full ${color === "green" ? "bg-emerald-500" : color === "orange" ? "bg-orange-500" : "bg-blue-500"}`} />
                           <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card title="岗位匹配摘要" variant="panel">
              <div className="grid gap-4 p-5">
                <ScoreRing value={report.totalScore} size={160} suffix="%" color="#3158f5" />
                {dimensions.map((item) => (
                  <div key={item.key} className="clay-soft-panel flex items-center justify-between gap-4 px-3 py-2 text-sm">
                    <span className="font-semibold text-slate-700">{item.label}</span>
                    <span className="font-black text-slate-950">{item.value}<span className="text-slate-400"> /100</span></span>
                  </div>
                ))}
                <div className="clay-inset-panel px-4 py-3 text-sm font-semibold leading-6 text-emerald-800">
                  {report.finalAdvice}
                </div>
              </div>
            </Card>
          </section>
        </>
      )}
    </>
  );
}
