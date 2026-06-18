import { useState } from "react";
import { AlertTriangle, BrainCircuit, CheckCircle2, Loader2, Network, RotateCcw, SlidersHorizontal } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { ProgressBar } from "../components/ui/ProgressBar";
import { RadarChart } from "../components/ui/RadarChart";
import { sampleJd } from "../data/mockData";
import { getErrorMessage } from "../services/apiClient";
import { analyzeJobDescription } from "../services/analysisService";
import { useAnalysisFlow } from "../state/AnalysisFlowContext";
import { asset } from "../utils/asset";

export function JobAnalysis({ onToast }: { onToast: (message: string) => void }) {
  const { jobAnalysis, setJobAnalysis } = useAnalysisFlow();
  const [jd, setJd] = useState(sampleJd);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyze() {
    if (jd.trim().length < 20) {
      setError("JD 内容至少需要 20 个字符。");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await analyzeJobDescription(jd);
      setJobAnalysis(result);
      onToast("岗位能力模型已生成");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    if (!jd.trim()) {
      onToast("JD 内容已为空");
      return;
    }
    setJd("");
  }

  const abilities = jobAnalysis?.abilities ?? [];
  const weightTotal = abilities.reduce((total, item) => total + item.weight, 0);
  const abilityRadarData = abilities.map((ability) => ({
    subject: ability.category,
    candidate: Math.min(100, ability.weight * 4),
    standard: 70
  }));

  return (
    <>
      <PageHeader title="岗位 JD 智能解析" subtitle="调用后端 /api/analyze-job，将岗位描述转为结构化能力模型与筛选建议。" />

      <section className="grid gap-5 xl:grid-cols-[1.05fr_1fr]">
        <Card
          title="岗位 JD 输入"
          action={
            <button className="clay-ghost-button min-h-8 px-3 py-1 text-xs text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400" type="button" onClick={handleClear}>
              清空内容
            </button>
          }
          variant="panel"
        >
          <div className="p-5">
            <label htmlFor="job-description" className="sr-only">岗位 JD 输入</label>
            <textarea
              id="job-description"
              value={jd}
              onChange={(event) => setJd(event.target.value)}
              className="clay-textarea min-h-[280px] w-full resize-none p-4 text-sm leading-7 outline-none transition"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
              <span>输入越完整，能力模型越稳定</span>
              <span>{jd.length}/3000</span>
            </div>
            <div className="clay-page-note mt-4 grid gap-3 px-4 py-3 text-xs font-semibold leading-5 text-slate-600 sm:grid-cols-3">
              {["职责边界", "能力关键词", "筛选信号"].map((label, index) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="clay-step-dot">{index + 1}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
            {error && (
                <div className="mt-4 flex items-start gap-2 rounded-[1.25rem] bg-[#ffe7e4] px-4 py-3 text-sm text-red-700 shadow-[inset_5px_5px_12px_rgba(194,86,74,0.1),inset_-6px_-6px_14px_rgba(255,255,255,0.72)]">
                <AlertTriangle className="mt-0.5 shrink-0" size={17} />
                <span>{error}</span>
              </div>
            )}
            <div className="mt-4 flex justify-center">
              <Button variant="ai" onClick={handleAnalyze} disabled={loading} className="w-full max-w-[360px]" icon={loading ? <Loader2 className="animate-spin" size={18} /> : <SlidersHorizontal size={18} />}>
                {loading ? "解析中…" : "解析岗位能力"}
              </Button>
            </div>
          </div>
        </Card>

        <Card title="岗位能力模型" action={<span className="text-xs font-bold text-slate-400">权重合计 {weightTotal}%</span>} variant="panel">
          <div className={loading ? "p-5 opacity-60" : "p-5"}>
            {!jobAnalysis ? (
              <EmptyState
                title="等待生成岗位能力模型"
                description="粘贴完整 JD 后点击“解析岗位能力”，这里会展示能力项、权重和筛选建议。"
                nextStep="解析岗位能力"
                value="把自由文本 JD 转成可评分的人才画像"
                action={
                  <img
                    src={asset("images/empty-analysis.png")}
                    alt="等待生成岗位能力模型"
                    width={1024}
                    height={1024}
                    className="clay-soft-panel hidden h-24 w-24 rounded-[1.5rem] object-cover sm:block"
                  />
                }
              />
            ) : (
              <div className="space-y-4">
                <div className="clay-page-note px-4 py-3 text-sm font-semibold leading-6 text-slate-600">
                  能力权重会作为后续证据链、匹配评分和面试任务的共同基准。
                </div>
                {abilities.map((ability) => (
                  <div key={ability.name} className="clay-soft-panel grid gap-4 px-4 py-3 sm:grid-cols-[120px_1fr_72px] sm:items-center">
                    <div>
                      <div className="font-bold text-slate-950">{ability.category}</div>
                      <div className="text-xs text-slate-500">{ability.name}</div>
                    </div>
                    <ProgressBar value={ability.weight} color={ability.color ?? "#3158f5"} label={ability.description} rightLabel={`${ability.weight}%`} />
                    <span className="text-sm font-black text-slate-950 sm:text-right">{ability.weight}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </section>

      {jobAnalysis && (
        <>
          <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
            <Card title="岗位能力图谱" variant="panel">
              <div className="p-5">
                <div className="clay-inset-panel relative min-h-[270px] overflow-hidden p-5">
                  <div className="absolute left-1/2 top-1/2 grid h-28 w-48 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[1.75rem] bg-[#d8e9ff] px-4 text-center text-sm font-black text-slate-800 shadow-[12px_14px_30px_rgba(94,121,151,0.16),inset_7px_7px_16px_rgba(112,132,155,0.1),inset_-8px_-8px_18px_rgba(255,255,255,0.72)]">
                    <Network size={22} />
                    <span>{jobAnalysis.jobTitle}</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {abilities.map((ability, index) => (
                      <div
                        key={ability.name}
                        className={`clay-soft-panel relative z-10 px-3 py-2 ${
                          index % 3 === 0 ? "text-sky-800" : index % 3 === 1 ? "text-emerald-800" : "text-orange-800"
                        }`}
                      >
                        <div className="text-xs font-black text-slate-950">{ability.category}</div>
                        <div className="mt-1 text-xs font-semibold text-slate-500">{ability.name}</div>
                        <div className="clay-mini-chip mt-2 text-[11px]">{ability.weight}% 权重</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <Card title="能力要求分布" variant="panel">
              <div className="p-5">
                <RadarChart data={abilityRadarData} height={280} />
              </div>
            </Card>
          </section>

          <section className="grid gap-5 lg:grid-cols-2">
            <Card title={jobAnalysis.jobTitle} variant="panel">
              <div className="space-y-3 p-5 text-sm leading-7 text-slate-600">
                <div className="clay-inset-panel flex items-start gap-3 px-4 py-3">
                  <BrainCircuit className="mt-1 shrink-0 text-blue-700" size={18} />
                  <p>{jobAnalysis.summary}</p>
                </div>
                {jobAnalysis.portrait.map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-1 shrink-0 text-emerald-600" size={16} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card title="筛选建议" variant="panel">
              <div className="grid gap-3 p-5">
                {jobAnalysis.screeningAdvice.map((item, index) => (
                  <div key={item} className="clay-soft-panel flex items-start gap-3 px-4 py-3 text-sm text-orange-800">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#ffd7b8] text-xs font-bold text-orange-800 shadow-[inset_3px_3px_8px_rgba(175,102,61,0.12),inset_-4px_-4px_9px_rgba(255,255,255,0.75)]">{index + 1}</span>
                    {item}
                  </div>
                ))}
                <Button variant="secondary" icon={<RotateCcw size={17} />} onClick={handleAnalyze} disabled={loading}>
                  重试生成
                </Button>
              </div>
            </Card>
          </section>
        </>
      )}
    </>
  );
}
