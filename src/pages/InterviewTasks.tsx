import { useState } from "react";
import { BookMarked, ClipboardList, Clock3, FileText, Loader2, RefreshCw } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { Modal } from "../components/ui/Modal";
import { ProgressBar } from "../components/ui/ProgressBar";
import { getErrorMessage } from "../services/apiClient";
import { generateInterviewTasks, generateMatchReport } from "../services/analysisService";
import { useAnalysisFlow } from "../state/AnalysisFlowContext";
import type { PageKey } from "../types";

export function InterviewTasks({
  onToast,
  onNavigate
}: {
  onToast: (message: string) => void;
  onNavigate: (page: PageKey) => void;
}) {
  const {
    jobAnalysis,
    resumeAnalysis,
    evidenceAnalysis,
    matchScore,
    interviewTasks,
    matchReport,
    interviewNotes,
    setInterviewTasks,
    setInterviewNotes,
    setMatchReport
  } = useAnalysisFlow();
  const [activeCategory, setActiveCategory] = useState("");
  const [notesDraft, setNotesDraft] = useState(interviewNotes);
  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [error, setError] = useState("");

  async function handleRegenerate() {
    if (!jobAnalysis || !resumeAnalysis || !evidenceAnalysis || !matchScore) return;
    setLoading(true);
    setError("");
    try {
      const result = await generateInterviewTasks({ jobAnalysis, resumeAnalysis, evidenceAnalysis, matchScore });
      setInterviewTasks(result);
      setActiveCategory(result.tasks[0]?.category ?? "");
      onToast("面试任务已生成");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function handleSaveNotes() {
    setInterviewNotes(notesDraft);
    onToast("面试官记录已保存");
  }

  function handleClearNotes() {
    setNotesDraft("");
    setInterviewNotes("");
    onToast("面试官记录已清空");
  }

  async function handleOpenReport() {
    if (!jobAnalysis || !resumeAnalysis || !evidenceAnalysis || !matchScore || !interviewTasks) return;

    if (matchReport) {
      onNavigate("report");
      return;
    }

    setReportLoading(true);
    setError("");
    try {
      const result = await generateMatchReport({ jobAnalysis, resumeAnalysis, evidenceAnalysis, matchScore, interviewTasks });
      setMatchReport(result);
      onToast("匹配报告已生成");
      onNavigate("report");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setReportLoading(false);
    }
  }

  if (!jobAnalysis || !resumeAnalysis || !evidenceAnalysis || !matchScore) {
    return (
      <>
        <PageHeader title="面试任务" subtitle="基于匹配评分和证据链生成结构化面试问题、考察点与记录入口。" />
        <Card title="面试任务">
          <div className="p-5">
            <EmptyState title="等待匹配评分" description="请先完成匹配评分，再生成 4-6 道面试任务。" />
          </div>
        </Card>
      </>
    );
  }

  const tasks = interviewTasks?.tasks ?? [];
  const categories = Array.from(new Set(tasks.map((task) => task.category)));
  const selectedCategory = activeCategory || categories[0] || "";

  return (
    <>
      <PageHeader title="面试任务" subtitle="基于匹配评分和证据链生成结构化面试问题、考察点与记录入口。" />

      <Card>
        <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_1fr_1.2fr_auto] lg:items-center">
          <div>
            <div className="text-2xl font-black text-stone-950">{resumeAnalysis.candidate.name}</div>
            <div className="mt-1 text-sm text-stone-500">{resumeAnalysis.candidate.education} | {resumeAnalysis.candidate.major}</div>
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold text-stone-500">目标岗位</div>
            <div className="flex items-center gap-3 text-xl font-black text-stone-950">
              <ClipboardList className="text-emerald-600" size={24} />
              {jobAnalysis.jobTitle}
            </div>
          </div>
          <div>
            <div className="mb-2 flex justify-between text-sm font-semibold text-stone-500">
              <span>匹配得分</span>
              <span>{matchScore.totalScore}%</span>
            </div>
            <ProgressBar value={matchScore.totalScore} color="#10b981" className="mt-2" />
          </div>
          <Button variant="secondary" icon={loading ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />} onClick={handleRegenerate} disabled={loading}>
            {tasks.length ? "重新生成任务" : "生成面试任务"}
          </Button>
        </div>
        <div className="mx-6 mb-5 grid gap-3 md:grid-cols-3">
          {[
            ["问题来源", "岗位能力 + 证据链"],
            ["面试节奏", tasks.length ? `${tasks.length} 道问题` : "等待生成"],
            ["记录用途", "沉淀复核依据"]
          ].map(([label, value], index) => (
            <div key={label} className="clay-detail-tile flex items-center gap-3 px-4 py-3">
              <span className="clay-step-dot">{index + 1}</span>
              <div>
                <div className="text-xs font-bold text-stone-500">{label}</div>
                <div className="mt-0.5 text-sm font-black text-stone-900">{value}</div>
              </div>
            </div>
          ))}
        </div>
        {error && <div className="mx-6 mb-5 rounded-[1.25rem] bg-[#ffe7e4] px-4 py-3 text-sm text-red-700 shadow-[inset_5px_5px_12px_rgba(194,86,74,0.1),inset_-6px_-6px_14px_rgba(255,255,255,0.72)]">{error}</div>}
      </Card>

      {!tasks.length ? (
        <Card title="等待生成">
          <div className="p-5">
            <EmptyState title="生成面试任务清单" description="点击生成后会展示任务类别、问题、考察点、难度、预计时长和生成依据。" />
          </div>
        </Card>
      ) : (
        <section className="grid gap-5 xl:grid-cols-[1.5fr_0.72fr]">
          <div className="space-y-5">
            <Card>
              <div className="grid grid-cols-2 gap-2 p-3 md:grid-cols-4">
                {categories.map((category, index) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`clay-secondary-button flex h-14 items-center justify-center gap-2 px-3 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                      selectedCategory === category ? "bg-[#dff8ec] text-emerald-700" : "text-stone-500"
                    }`}
                  >
                    <span className="grid h-6 w-6 place-items-center rounded-full border border-current text-xs">{index + 1}</span>
                    {category}
                  </button>
                ))}
              </div>
              <div className="space-y-4 p-5">
                {tasks.map((task) => (
                  <article key={task.id} className={`clay-soft-panel p-5 transition ${task.category === selectedCategory ? "bg-[#eefaf3]" : ""}`}>
                    <div className="grid gap-4 lg:grid-cols-[42px_1fr_auto]">
                      <div className="grid h-10 w-10 place-items-center rounded-[1.1rem] bg-[#dff8ec] text-lg font-black text-emerald-700 shadow-[inset_4px_4px_10px_rgba(90,142,117,0.11),inset_-5px_-5px_12px_rgba(255,255,255,0.76)]">{task.id}</div>
                      <div>
                        <h2 className="text-base font-black leading-7 text-stone-950">{task.question}</h2>
                        <div className="mt-2 text-sm text-stone-500">考察点：{task.focus}</div>
                        <div className="mt-2 text-xs leading-5 text-stone-500">依据：{task.basis}</div>
                      </div>
                      <div className="flex flex-wrap items-center gap-5 text-xs font-semibold text-stone-500 lg:justify-end">
                        <span>难度：{task.difficulty}</span>
                        <span className="flex items-center gap-1"><Clock3 size={15} /> {task.duration}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </Card>

            <Card title="面试官记录">
              <div className="p-5">
                <label htmlFor="interview-notes" className="sr-only">面试官记录</label>
                <textarea
                  id="interview-notes"
                  value={notesDraft}
                  onChange={(event) => setNotesDraft(event.target.value)}
                  className="clay-textarea min-h-[112px] w-full resize-none p-4 text-sm outline-none transition placeholder:text-stone-400"
                  placeholder="记录候选人回答要点…"
                />
                <div className="clay-page-note mt-4 px-4 py-3 text-sm font-semibold leading-6 text-stone-600">
                  建议记录事实回答、追问依据和待复核点，避免只留下主观印象。
                </div>
                <div className="mt-4 flex flex-wrap justify-end gap-3">
                  <Button variant="secondary" onClick={handleSaveNotes}>保存记录</Button>
                  <Button variant="secondary" onClick={handleClearNotes}>清空记录</Button>
                  <Button variant="secondary" icon={<BookMarked size={18} />} onClick={() => setPreviewOpen(true)}>预览问题清单</Button>
                  <Button icon={reportLoading ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />} onClick={handleOpenReport} disabled={reportLoading}>
                    {reportLoading ? "生成中" : "生成匹配报告"}
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <Card title="任务生成依据">
            <div className="space-y-3 p-5 text-sm leading-6 text-stone-600">
              <p>岗位模型：{jobAnalysis.summary}</p>
              <p>匹配摘要：{matchScore.summary}</p>
              <p>证据链风险：{evidenceAnalysis.risks.join("；") || "暂无"}</p>
            </div>
          </Card>
        </section>
      )}

      {previewOpen && (
        <Modal title="面试问题清单" size="xl" onClose={() => setPreviewOpen(false)}>
          <div className="clay-table overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr><th className="px-4 py-3">类别</th><th className="px-4 py-3">问题</th><th className="px-4 py-3">重点</th><th className="px-4 py-3">难度</th><th className="px-4 py-3">时长</th></tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td className="whitespace-nowrap px-4 py-4 font-bold text-emerald-700">{task.category}</td>
                    <td className="px-4 py-4 leading-6 text-stone-700">{task.question}</td>
                    <td className="whitespace-nowrap px-4 py-4 font-semibold text-stone-700">{task.focus}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-stone-600">{task.difficulty}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-stone-600">{task.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}
    </>
  );
}
