import { useState } from "react";
import { AlertTriangle, CheckCircle2, HelpCircle, Loader2 } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { EvidenceBadge } from "../components/ui/EvidenceBadge";
import { getErrorMessage } from "../services/apiClient";
import { analyzeEvidence } from "../services/analysisService";
import { useAnalysisFlow } from "../state/AnalysisFlowContext";

export function EvidenceAnalysis() {
  const { jobAnalysis, resumeAnalysis, evidenceAnalysis, setEvidenceAnalysis } = useAnalysisFlow();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    if (!jobAnalysis || !resumeAnalysis) return;
    setLoading(true);
    setError("");
    try {
      setEvidenceAnalysis(await analyzeEvidence(jobAnalysis, resumeAnalysis));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (!jobAnalysis || !resumeAnalysis) {
    return (
      <>
        <PageHeader title="证据链分析" subtitle="把岗位能力要求与简历事实逐项对齐，生成可复核的证据映射、风险提示和追问点。" />
        <Card title="证据链分析">
          <div className="p-5">
            <EmptyState title="需要岗位与简历两类输入" description="请先完成 JD 解析和简历分析，再生成能力证据映射。" />
          </div>
        </Card>
      </>
    );
  }

  const mappings = evidenceAnalysis?.mappings ?? [];

  return (
    <>
      <PageHeader title="证据链分析" subtitle="把岗位能力要求与简历事实逐项对齐，生成可复核的证据映射、风险提示和追问点。" />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <div className="text-lg font-black text-stone-950">能力证据链</div>
            <div className="mt-1 text-sm text-stone-500">岗位：{jobAnalysis.jobTitle} · 候选人：{resumeAnalysis.candidate.name}</div>
          </div>
          <Button onClick={handleGenerate} disabled={loading} icon={loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}>
            {evidenceAnalysis ? "重新生成证据链" : "生成证据链分析"}
          </Button>
        </div>
        <div className="mx-5 mb-5 grid gap-3 md:grid-cols-3">
          {[
            ["能力项", `${jobAnalysis.abilities.length} 个要求`],
            ["简历事实", `${resumeAnalysis.projects.length + resumeAnalysis.internships.length} 段经历`],
            ["复核重点", evidenceAnalysis ? `${evidenceAnalysis.risks.length} 个风险` : "等待生成"]
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
        {error && (
          <div className="mx-5 mb-5 flex items-start gap-2 rounded-[1.25rem] bg-[#ffe7e4] px-4 py-3 text-sm text-red-700 shadow-[inset_5px_5px_12px_rgba(194,86,74,0.1),inset_-6px_-6px_14px_rgba(255,255,255,0.72)]">
            <AlertTriangle className="mt-0.5 shrink-0" size={17} />
            <span>{error}</span>
          </div>
        )}
      </Card>

      {!evidenceAnalysis ? (
        <Card title="等待生成">
          <div className="p-5">
            <EmptyState title="生成能力证据链" description="点击按钮后，后端会基于岗位分析和简历分析生成证据映射、风险提示和追问点。" />
          </div>
        </Card>
      ) : (
        <>
          <section className="grid gap-5 xl:grid-cols-[1.55fr_0.9fr]">
            <Card title="能力证据映射">
              <div className="overflow-hidden p-5">
                <div className="clay-page-note mb-4 px-4 py-3 text-sm font-semibold leading-6 text-stone-600">
                  每条映射都保留能力项、简历事实、证据强度和系统判断，方便 HR 快速复核。
                </div>
                <div className="clay-table overflow-x-auto">
                  <table className="w-full min-w-[780px] text-left text-sm">
                    <thead>
                      <tr>
                        <th className="px-4 py-4 font-semibold">能力项</th>
                        <th className="px-4 py-4 font-semibold">简历证据</th>
                        <th className="px-4 py-4 font-semibold">证据强度</th>
                        <th className="px-4 py-4 font-semibold">系统判断</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mappings.map((item) => (
                        <tr key={`${item.ability}-${item.source}`}>
                          <td className="px-4 py-4 font-bold text-stone-950">{item.ability}</td>
                          <td className="px-4 py-4 text-stone-600">{item.evidence}</td>
                          <td className="px-4 py-4"><EvidenceBadge level={item.strength} /></td>
                          <td className="px-4 py-4 font-semibold text-stone-700">{item.judgement}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>

            <div className="space-y-5">
              <Card title="风险提示">
                <div className="space-y-3 p-5">
                  {evidenceAnalysis.risks.map((risk) => (
                    <div key={risk} className="flex items-start gap-3 rounded-[1.25rem] bg-[#ffe7e4] px-4 py-3 text-sm leading-6 text-red-700 shadow-[inset_5px_5px_12px_rgba(194,86,74,0.1),inset_-6px_-6px_14px_rgba(255,255,255,0.72)]">
                      <AlertTriangle className="mt-0.5 shrink-0" size={17} />
                      <span>{risk}</span>
                    </div>
                  ))}
                </div>
              </Card>
              <Card title="建议追问点">
                <div className="space-y-3 p-5">
                  {evidenceAnalysis.followUpQuestions.map((question, index) => (
                    <div key={question} className="flex items-start gap-3 text-sm leading-6 text-stone-700">
                      <span className="clay-step-dot shrink-0">{index + 1}</span>
                      <span>{question}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </section>

          <Card>
            <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
              <div className="grid h-12 w-12 place-items-center rounded-[1.25rem] bg-[#dff8ec] text-emerald-600 shadow-[inset_5px_5px_12px_rgba(90,142,117,0.1),inset_-6px_-6px_14px_rgba(255,255,255,0.76)]">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h2 className="text-lg font-black text-stone-950">判断依据来自结构化证据，而不是关键词匹配</h2>
                <p className="mt-1 text-sm leading-6 text-stone-600">每个能力项都要求给出证据、来源、强度和追问建议，便于 HR 复核。</p>
              </div>
              <HelpCircle className="ml-auto hidden text-emerald-600 md:block" size={28} />
            </div>
          </Card>
        </>
      )}
    </>
  );
}
