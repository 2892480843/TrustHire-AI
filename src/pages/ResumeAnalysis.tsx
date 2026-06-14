import { useRef, useState } from "react";
import { AlertTriangle, CloudUpload, ExternalLink, FileCheck2, Loader2, UserRound } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { Modal } from "../components/ui/Modal";
import { getErrorMessage } from "../services/apiClient";
import { analyzeResumeFile } from "../services/analysisService";
import { validateReadableTextResume } from "../services/resumeFileValidation";
import { useAnalysisFlow } from "../state/AnalysisFlowContext";

export function ResumeAnalysis({ onToast }: { onToast: (message: string) => void }) {
  const { resumeAnalysis, loadSampleFlow } = useAnalysisFlow();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("等待上传真实简历");
  const [error, setError] = useState("");
  const [resumeOpen, setResumeOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const flow = useAnalysisFlow();

  async function handleSample() {
    loadSampleFlow();
    setStatus("已加载样例数据（演示）");
    setError("");
    onToast("已加载样例数据（演示）");
  }

  async function handleFileChange(file: File | undefined) {
    if (!file) return;
    const validationError = await validateReadableTextResume(file);
    if (validationError) {
      setError(validationError);
      setStatus("上传解析失败，可重试");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setLoading(true);
    setError("");
    setStatus(`正在上传并解析：${file.name}`);
    try {
      const result = await analyzeResumeFile(file);
      flow.setResumeAnalysis(result);
      setStatus("简历上传解析完成");
      onToast("简历上传解析已完成");
    } catch (err) {
      setError(getErrorMessage(err));
      setStatus("上传解析失败，可重试");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const candidate = resumeAnalysis?.candidate;

  return (
    <>
      <PageHeader title="简历分析" subtitle="上传 PDF / DOCX / TXT 简历，提取候选人基础信息、项目经历、技能标签和风险点。" compact />

      <section className="clay-card rounded-[2rem] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <input
            ref={fileInputRef}
            type="file"
            aria-label="上传简历文件"
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            className="hidden"
            onChange={(event) => void handleFileChange(event.target.files?.[0])}
          />
          <div>
            <div className="text-sm font-black text-stone-950">候选人简历</div>
            <div className="mt-1 text-sm font-medium text-stone-500">支持 PDF / DOCX / TXT，默认限制见 MAX_UPLOAD_MB</div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center [&>button]:w-full sm:[&>button]:w-auto">
            <Button icon={loading ? <Loader2 className="animate-spin" size={18} /> : <CloudUpload size={18} />} onClick={() => fileInputRef.current?.click()} disabled={loading}>
              上传简历
            </Button>
            <Button variant="secondary" icon={<FileCheck2 size={18} />} onClick={handleSample} disabled={loading}>
              使用样例数据（演示）
            </Button>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {["PDF / DOCX / TXT", "结构化抽取", "风险点复核"].map((label, index) => (
            <div key={label} className="clay-detail-tile flex items-center gap-3 px-4 py-3 text-xs font-bold text-stone-600">
              <span className="clay-step-dot">{index + 1}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
        <div className="clay-inset-panel mt-4 px-4 py-3 text-sm font-medium text-stone-600">{status}</div>
        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-[1.25rem] bg-[#ffe7e4] px-4 py-3 text-sm text-red-700 shadow-[inset_5px_5px_12px_rgba(194,86,74,0.1),inset_-6px_-6px_14px_rgba(255,255,255,0.72)]">
            <AlertTriangle className="mt-0.5 shrink-0" size={17} />
            <span>{error}</span>
          </div>
        )}
      </section>

      {!resumeAnalysis ? (
        <Card title="结构化解析结果">
          <div className="p-5">
            <EmptyState title="等待简历上传" description="上传文件后，后端会提取文本并调用 AI 返回结构化简历摘要。" />
          </div>
        </Card>
      ) : (
        <>
          <section className="grid gap-5 xl:grid-cols-[0.8fr_1.4fr_0.8fr]">
            <Card title="候选人概览">
              <div className="space-y-5 p-5">
                <div className="flex items-center gap-5">
                  <div className="grid h-24 w-24 place-items-center rounded-full bg-[#dff8ec] text-3xl font-black text-emerald-700 shadow-[12px_14px_28px_rgba(105,146,128,0.16),inset_8px_8px_18px_rgba(90,142,117,0.11),inset_-9px_-9px_20px_rgba(255,255,255,0.78)]">
                    {candidate?.name?.slice(0, 1) ?? "候"}
                  </div>
                  <div className="grid flex-1 gap-2 text-sm">
                    {[
                      ["姓名", candidate?.name],
                      ["学校", candidate?.school],
                      ["专业", candidate?.major],
                      ["学历", candidate?.education],
                      ["目标岗位", candidate?.targetJob]
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between gap-4">
                        <span className="text-stone-500">{label}</span>
                        <span className="font-semibold text-stone-950">{value || "未提取"}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <hr className="clay-soft-divider" />
                <div className="clay-page-note px-4 py-3 text-sm font-semibold leading-6 text-stone-600">
                  简历画像会用于岗位匹配、证据链映射和面试问题生成，建议先复核关键信息是否准确。
                </div>
                <Button variant="secondary" className="w-full" icon={<ExternalLink size={17} />} onClick={() => setResumeOpen(true)}>
                  查看完整简历结构
                </Button>
              </div>
            </Card>

            <Card title="结构化解析结果">
              <div className="grid gap-5 p-5 lg:grid-cols-2">
                <section>
                  <h3 className="mb-3 font-bold text-stone-950">教育背景</h3>
                  <div className="space-y-3">
                    {resumeAnalysis.education.map((item) => (
                      <div key={`${item.school}-${item.period}`} className="clay-inset-panel p-4 text-sm leading-7 text-stone-600">
                        {item.period} {item.school} {item.major} {item.degree}
                      </div>
                    ))}
                  </div>
                  <h3 className="mb-3 mt-5 font-bold text-stone-950">技能标签</h3>
                  <div className="flex flex-wrap gap-2">
                    {resumeAnalysis.skills.map((skill) => (
                      <span key={skill} className="clay-mini-chip text-xs font-bold text-emerald-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
                <section>
                  <h3 className="mb-3 font-bold text-stone-950">项目经历</h3>
                  <div className="space-y-3">
                    {resumeAnalysis.projects.map((project) => (
                      <div key={project.name} className="clay-soft-panel p-4">
                        <div className="font-bold text-emerald-900">{project.name}</div>
                        <div className="mt-1 text-xs text-stone-500">{project.role} · {project.period}</div>
                        <p className="mt-3 text-sm leading-6 text-stone-600">{project.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </Card>

            <Card title="风险点">
              <div className="space-y-3 p-5">
                {resumeAnalysis.risks.length ? resumeAnalysis.risks.map((risk) => (
                  <div key={risk} className="clay-soft-panel px-4 py-3 text-sm font-semibold text-orange-700">
                    {risk}
                  </div>
                )) : <div className="text-sm text-stone-500">未识别到明显风险点。</div>}
              </div>
            </Card>
          </section>

          <Card title="结构化简历摘要">
            <div className="grid gap-4 p-5 lg:grid-cols-6">
              {[
                ["基本信息", `${candidate?.city || "城市未提取"} / ${candidate?.expectedArrival || "到岗未提取"}`],
                ["技能数量", `${resumeAnalysis.skills.length} 项`],
                ["项目数量", `${resumeAnalysis.projects.length} 段`],
                ["实习经历", `${resumeAnalysis.internships.length} 段`],
                ["证书竞赛", `${resumeAnalysis.certificates.length} 项`],
                ["摘要", resumeAnalysis.summary]
              ].map(([title, desc]) => (
                <div key={title} className="clay-soft-panel p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-bold text-stone-950">
                    <UserRound size={16} className="text-emerald-600" /> {title}
                  </div>
                  <div className="text-xs leading-5 text-stone-500">{desc}</div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {resumeOpen && resumeAnalysis && (
        <Modal title={`${resumeAnalysis.candidate.name} 完整简历结构`} size="xl" onClose={() => setResumeOpen(false)}>
          <div className="space-y-5 text-sm leading-7 text-stone-600">
            <pre className="clay-inset-panel max-h-[520px] overflow-auto p-4 text-xs text-slate-700">{JSON.stringify(resumeAnalysis, null, 2)}</pre>
          </div>
        </Modal>
      )}
    </>
  );
}
