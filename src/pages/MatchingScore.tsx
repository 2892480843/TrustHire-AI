import { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Scale, ThumbsUp } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { ProgressBar } from "../components/ui/ProgressBar";
import { RadarChart } from "../components/ui/RadarChart";
import { ScoreRing } from "../components/ui/ScoreRing";
import { getErrorMessage } from "../services/apiClient";
import { calculateMatchScore } from "../services/analysisService";
import { useAnalysisFlow } from "../state/AnalysisFlowContext";

export function MatchingScore() {
  const { jobAnalysis, resumeAnalysis, evidenceAnalysis, matchScore, setMatchScore } = useAnalysisFlow();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    if (!jobAnalysis || !resumeAnalysis || !evidenceAnalysis) return;
    setLoading(true);
    setError("");
    try {
      setMatchScore(await calculateMatchScore(jobAnalysis, resumeAnalysis, evidenceAnalysis));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (!jobAnalysis || !resumeAnalysis || !evidenceAnalysis) {
    return (
      <>
        <PageHeader title="人岗匹配评分" subtitle="基于岗位模型、简历解析和证据链生成结构化评分，不从前端计算或解析自由文本。" />
        <Card title="匹配评分" variant="panel">
          <div className="p-5">
            <EmptyState
              title="先补齐评分所需证据"
              description="请先完成 JD 解析、简历分析和证据链分析，再生成匹配评分。"
              nextStep="完成证据链分析"
              value="保证匹配分有岗位模型和事实证据支撑"
            />
          </div>
        </Card>
      </>
    );
  }

  const radarData = matchScore?.dimensions.map((dimension) => ({
    subject: dimension.label,
    candidate: dimension.value,
    standard: dimension.benchmark
  })) ?? [];

  return (
    <>
      <PageHeader title="人岗匹配评分" subtitle="基于岗位模型、简历解析和证据链生成结构化评分，不从前端计算或解析自由文本。" />

      <Card variant="panel">
        <div className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="text-sm font-semibold text-slate-500">候选人：{resumeAnalysis.candidate.name} · 岗位：{jobAnalysis.jobTitle}</div>
          <Button variant="ai" onClick={handleGenerate} disabled={loading} icon={loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}>
            {matchScore ? "重新生成评分" : "生成匹配评分"}
          </Button>
        </div>
        <div className="mx-5 mb-5 grid gap-3 md:grid-cols-4">
          {[
            ["岗位模型", `${jobAnalysis.abilities.length} 项能力`],
            ["简历画像", resumeAnalysis.candidate.education],
            ["证据映射", `${evidenceAnalysis.mappings.length} 条`],
            ["推荐状态", matchScore?.recommendationLevel ?? "待评分"]
          ].map(([label, value], index) => (
            <div key={label} className="clay-detail-tile px-4 py-3">
              <div className="mb-2 flex items-center gap-2">
                <span className="clay-step-dot">{index + 1}</span>
                <span className="text-xs font-bold text-slate-500">{label}</span>
              </div>
              <div className="text-sm font-black text-slate-900">{value}</div>
            </div>
          ))}
        </div>
        {error && (
          <div className="mx-5 mb-5 flex items-start gap-2 rounded-[1.25rem] bg-[#ffe7e4] px-4 py-3 text-sm text-red-700 shadow-[inset_5px_5px_12px_rgba(194,86,74,0.1),inset_-6px_-6px_14px_rgba(255,255,255,0.72)]">
            <AlertTriangle className="mt-0.5 shrink-0" size={17} />
            <span>{error}</span>
          </div>
        )}
      </Card>

      {!matchScore ? (
        <Card title="等待生成" variant="panel">
          <div className="p-5">
            <EmptyState
              title="生成后用于进入面试决策"
              description="点击按钮后生成总分、推荐等级、维度评分、优势、短板和 HR 建议。"
              nextStep="生成匹配评分"
              value="把证据链转化为可解释的 HR 决策建议"
            />
          </div>
        </Card>
      ) : (
        <>
          <section className="grid gap-5 xl:grid-cols-[1.45fr_0.75fr]">
            <Card variant="hero">
              <div className="grid gap-8 p-6 lg:grid-cols-[240px_1fr] lg:items-center">
                <div className="flex justify-center">
                  <ScoreRing value={matchScore.totalScore} size={220} label="综合匹配度" color="#3158f5" />
                </div>
                <div className="min-w-0">
                  <div className="mb-5 flex flex-wrap items-center gap-3">
                    <span className="text-xl font-black text-slate-950">推荐等级</span>
                    <span className="clay-mini-chip px-4 py-2 text-lg font-black text-emerald-700">{matchScore.recommendationLevel}</span>
                  </div>
                  <p className="mb-6 text-sm leading-7 text-slate-600">{matchScore.summary}</p>
                  <div className="clay-page-note mb-5 px-4 py-3 text-sm font-semibold leading-6 text-slate-600">
                    综合分由岗位能力权重、简历证据强度和维度基准共同组成，建议配合下方雷达图复核。
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {matchScore.dimensions.map((dimension) => (
                      <div key={dimension.key} className="clay-soft-panel p-3">
                        <div className="whitespace-nowrap text-xs font-bold text-slate-800">{dimension.label}</div>
                        <div className="mt-3 text-2xl font-black text-blue-700">{dimension.value}<span className="text-xs text-slate-500"> /100</span></div>
                        <ProgressBar value={dimension.value} color="#3158f5" className="mt-3" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <Card title="HR 决策建议" variant="panel">
              <div className="space-y-4 p-5">
                <div className="clay-inset-panel flex items-center gap-3 px-4 py-3 text-sm font-semibold leading-6 text-emerald-800">
                  <Scale size={18} />
                  {matchScore.recommendationLevel}
                </div>
                <div className="text-sm leading-7 text-slate-700">{matchScore.hrAdvice}</div>
              </div>
            </Card>
          </section>

          <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <Card title="匹配维度雷达" variant="panel">
              <div className="p-5">
                <RadarChart data={radarData} height={300} />
              </div>
            </Card>
            <Card title="与岗位基准对比" variant="panel">
              <div className="space-y-4 p-5">
                {matchScore.dimensions.map((dimension) => (
                  <div key={dimension.key} className="clay-soft-panel px-4 py-3">
                    <div className="mb-3 flex items-center justify-between gap-3 text-sm">
                      <span className="font-black text-slate-900">{dimension.label}</span>
                      <span className="font-black text-slate-950">{dimension.value}<span className="text-slate-400"> / {dimension.benchmark}</span></span>
                    </div>
                    <ProgressBar value={dimension.value} color="#3158f5" />
                    <ProgressBar value={dimension.benchmark} color="#94a3b8" className="mt-2" />
                  </div>
                ))}
              </div>
            </Card>
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <Card title="能力优势" variant="panel">
              <div className="grid gap-4 p-5 md:grid-cols-2">
                {matchScore.advantages.map((item) => (
                  <div key={item} className="clay-soft-panel p-4">
                    <div className="mb-3 flex items-center gap-2 font-black text-slate-950">
                      <ThumbsUp className="text-emerald-600" size={18} /> 优势
                    </div>
                    <p className="text-sm leading-6 text-slate-600">{item}</p>
                  </div>
                ))}
              </div>
            </Card>
            <Card title="主要短板" variant="panel">
              <div className="grid gap-4 p-5 md:grid-cols-2">
                {matchScore.weaknesses.map((item) => (
                  <div key={item} className="clay-soft-panel p-4">
                    <div className="mb-3 flex items-center gap-2 font-black text-slate-950">
                      <AlertTriangle className="text-red-500" size={18} /> 风险
                    </div>
                    <p className="text-sm leading-6 text-slate-600">{item}</p>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        </>
      )}
    </>
  );
}
