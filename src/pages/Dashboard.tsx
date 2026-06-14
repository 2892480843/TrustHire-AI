import { useMemo, useRef, useState, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bot,
  Briefcase,
  Building2,
  CalendarCheck,
  CheckCircle2,
  CircleDashed,
  Clock3,
  FileSearch,
  FileText,
  Gauge,
  GraduationCap,
  Loader2,
  MessageCircle,
  Search,
  Sparkles,
  Target,
  UploadCloud,
  UserCheck,
  Users
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { sampleJd } from "../data/mockData";
import { getErrorMessage } from "../services/apiClient";
import { getAgentJob, startAgentJob } from "../services/analysisService";
import { validateReadableTextResume } from "../services/resumeFileValidation";
import { useAnalysisFlow } from "../state/AnalysisFlowContext";
import type { AgentJob, AgentStage, PageKey } from "../types";

const steps: Array<{ key: keyof ReturnType<typeof useAnalysisFlow>; label: string; page: PageKey }> = [
  { key: "jobAnalysis", label: "JD 解析", page: "job" },
  { key: "resumeAnalysis", label: "简历分析", page: "resume" },
  { key: "evidenceAnalysis", label: "证据链", page: "evidence" },
  { key: "matchScore", label: "匹配评分", page: "score" },
  { key: "interviewTasks", label: "面试任务", page: "interview" },
  { key: "matchReport", label: "匹配报告", page: "report" }
];

const idleStages: AgentStage[] = [
  { key: "jobAnalysis", label: "JD 解析", status: "pending", startedAt: null, completedAt: null },
  { key: "resumeAnalysis", label: "简历解析", status: "pending", startedAt: null, completedAt: null },
  { key: "evidenceAnalysis", label: "证据链分析", status: "pending", startedAt: null, completedAt: null },
  { key: "matchScore", label: "人岗匹配评分", status: "pending", startedAt: null, completedAt: null },
  { key: "interviewTasks", label: "面试任务生成", status: "pending", startedAt: null, completedAt: null },
  { key: "matchReport", label: "匹配报告生成", status: "pending", startedAt: null, completedAt: null }
];

const productNavItems = ["岗位推荐", "简历优化", "AI 面试", "企业招聘"];

const filterTags = ["远程友好", "成长空间", "AI 产品", "杭州", "实习可转正"];

const recommendedJobs = [
  {
    title: "AI 产品运营实习生",
    company: "星桥智能",
    city: "杭州",
    salary: "12K-18K",
    match: 92,
    tone: "mint",
    tags: ["用户研究", "AIGC", "数据分析"],
    filters: ["远程友好", "成长空间", "AI 产品", "杭州", "实习可转正"]
  },
  {
    title: "后端开发工程师",
    company: "云杉科技",
    city: "南京",
    salary: "18K-28K",
    match: 86,
    tone: "blue",
    tags: ["Spring Boot", "MySQL", "接口设计"],
    filters: ["成长空间", "实习可转正"]
  },
  {
    title: "数据分析实习生",
    company: "澄海数据",
    city: "上海",
    salary: "10K-15K",
    match: 84,
    tone: "peach",
    tags: ["SQL", "指标体系", "BI"],
    filters: ["远程友好", "成长空间"]
  }
];

const seekerFeatures: Array<
  | { title: string; desc: string; icon: typeof Briefcase; tone: string; action: "navigate"; page: PageKey }
  | { title: string; desc: string; icon: typeof Briefcase; tone: string; action: "career" }
> = [
  { title: "智能岗位推荐", desc: "根据简历、偏好和成长目标，筛出更适合探索的机会。", icon: Briefcase, tone: "mint", action: "navigate", page: "job" },
  { title: "简历诊断", desc: "把优势、待优化点和下一步动作拆成清晰小任务。", icon: FileText, tone: "peach", action: "navigate", page: "resume" },
  { title: "AI 面试练习", desc: "模拟追问、复盘表达，让练习过程更低压力。", icon: MessageCircle, tone: "lilac", action: "navigate", page: "interview" },
  { title: "职业路径建议", desc: "用阶段目标连接能力成长、岗位机会和学习计划。", icon: GraduationCap, tone: "blue", action: "career" }
];

const DEMO_USER_STORAGE_KEY = "trusthire.demoUser.v1";

type DemoUserRole = "求职者" | "HR";

interface DemoUser {
  name: string;
  role: DemoUserRole;
  organization: string;
}

function readDemoUser() {
  try {
    const raw = localStorage.getItem(DEMO_USER_STORAGE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<DemoUser>;
    if (!value.name || !value.role || !value.organization) return null;
    return {
      name: value.name,
      role: value.role === "HR" ? "HR" : "求职者",
      organization: value.organization
    } satisfies DemoUser;
  } catch {
    return null;
  }
}

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

function jobMatchesKeyword(job: (typeof recommendedJobs)[number], keyword: string) {
  if (!keyword) return true;
  const haystack = [job.title, job.company, job.city, ...job.tags, ...job.filters].join(" ").toLowerCase();
  return haystack.includes(keyword);
}

const recruiterFeatures = [
  { title: "人才匹配", desc: "从能力证据和岗位画像中发现真正合适的人。", icon: UserCheck, value: "48 位" },
  { title: "候选人筛选", desc: "用轻量标签呈现风险、亮点和待追问问题。", icon: Users, value: "12 位" },
  { title: "面试流程管理", desc: "把邀约、面试、反馈和 offer 状态串成柔和进度。", icon: CalendarCheck, value: "4 阶段" },
  { title: "招聘数据概览", desc: "只保留关键趋势，避免让 HR 被密集表格淹没。", icon: Gauge, value: "86%" }
];

function stageText(status: AgentStage["status"]) {
  if (status === "completed") return "已完成";
  if (status === "running") return "运行中";
  if (status === "failed") return "失败";
  return "等待";
}

function findStageLabel(stages: AgentStage[], stageKey: AgentStage["key"] | null) {
  if (!stageKey) return "";
  return stages.find((stage) => stage.key === stageKey)?.label ?? stageKey;
}

function toneClass(tone: string) {
  const tones: Record<string, string> = {
    mint: "bg-[#dff8ec] text-emerald-800 shadow-[inset_7px_7px_14px_rgba(89,142,118,0.14),inset_-8px_-8px_16px_rgba(255,255,255,0.72)]",
    peach: "bg-[#ffe2cf] text-orange-800 shadow-[inset_7px_7px_14px_rgba(189,116,74,0.14),inset_-8px_-8px_16px_rgba(255,255,255,0.66)]",
    lilac: "bg-[#eee5ff] text-violet-800 shadow-[inset_7px_7px_14px_rgba(118,91,159,0.14),inset_-8px_-8px_16px_rgba(255,255,255,0.72)]",
    blue: "bg-[#deedff] text-sky-800 shadow-[inset_7px_7px_14px_rgba(74,115,158,0.14),inset_-8px_-8px_16px_rgba(255,255,255,0.7)]"
  };
  return tones[tone] ?? tones.mint;
}

function SoftIcon({ children, tone = "mint" }: { children: ReactNode; tone?: string }) {
  return <span className={`grid h-12 w-12 place-items-center rounded-[1.4rem] ${toneClass(tone)}`}>{children}</span>;
}

function SoftProgress({ value, tone = "mint" }: { value: number; tone?: "mint" | "peach" | "blue" }) {
  const fill =
    tone === "peach"
      ? "linear-gradient(90deg,#ffb38a,#ffd7a3)"
      : tone === "blue"
        ? "linear-gradient(90deg,#a7c8ff,#d8c7ff)"
        : "linear-gradient(90deg,#9ee7c5,#caf3db)";

  return (
    <div className="clay-progress" aria-label={`匹配度 ${value}%`}>
      <span style={{ width: `${value}%`, background: fill }} />
    </div>
  );
}

function StageTone({ status }: { status: AgentStage["status"] }) {
  if (status === "completed") return <CheckCircle2 size={18} className="text-emerald-600" />;
  if (status === "running") return <Loader2 size={18} className="animate-spin text-sky-600" />;
  if (status === "failed") return <AlertTriangle size={18} className="text-orange-600" />;
  return <CircleDashed size={18} className="text-slate-400" />;
}

export function Dashboard({
  onNavigate,
  onToast
}: {
  onNavigate: (page: PageKey) => void;
  onToast: (message: string) => void;
}) {
  const flow = useAnalysisFlow();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const jobsSectionRef = useRef<HTMLDivElement | null>(null);
  const candidatesSectionRef = useRef<HTMLDivElement | null>(null);
  const interviewSectionRef = useRef<HTMLElement | null>(null);
  const recruitersSectionRef = useRef<HTMLElement | null>(null);
  const [activeProductNav, setActiveProductNav] = useState(productNavItems[0]);
  const [demoUser, setDemoUser] = useState<DemoUser | null>(() => readDemoUser());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCareerModal, setShowCareerModal] = useState(false);
  const [loginForm, setLoginForm] = useState<DemoUser>(() => demoUser ?? { name: "", role: "求职者", organization: "" });
  const [loginError, setLoginError] = useState("");
  const [searchDraft, setSearchDraft] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [agentJdText, setAgentJdText] = useState(sampleJd);
  const [agentFile, setAgentFile] = useState<File | null>(null);
  const [agentJob, setAgentJob] = useState<AgentJob | null>(null);
  const [agentError, setAgentError] = useState("");
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const completedCount = steps.filter((step) => Boolean(flow[step.key])).length;
  const nextStep = steps.find((step) => !flow[step.key]);
  const riskCount = (flow.resumeAnalysis?.risks.length ?? 0) + (flow.evidenceAnalysis?.risks.length ?? 0) + (flow.matchReport?.risks.length ?? 0);
  const currentStages = agentJob?.stages ?? idleStages;
  const failedStageLabel = agentJob?.status === "failed" ? findStageLabel(currentStages, agentJob.currentStage) : "";
  const failedReason = agentJob?.error?.message ?? (agentError || "Agent 分析失败，请稍后重试。");
  const hasCareerData = Boolean(flow.resumeAnalysis || flow.jobAnalysis || flow.matchScore || flow.matchReport);
  const careerName = flow.resumeAnalysis?.candidate.name ?? flow.matchReport?.candidateName ?? "当前候选人";
  const careerTarget = flow.resumeAnalysis?.candidate.targetJob || flow.jobAnalysis?.jobTitle || flow.matchReport?.jobTitle || "目标岗位";
  const careerScore = flow.matchScore?.totalScore ?? flow.matchReport?.totalScore;
  const careerGaps = flow.matchReport?.gaps.length
    ? flow.matchReport.gaps
    : flow.matchScore?.weaknesses.length
      ? flow.matchScore.weaknesses
      : flow.evidenceAnalysis?.risks ?? [];
  const filteredJobs = useMemo(() => {
    const keyword = normalizeSearch(appliedSearch);
    return recommendedJobs.filter((job) => jobMatchesKeyword(job, keyword) && selectedTags.every((tag) => job.filters.includes(tag)));
  }, [appliedSearch, selectedTags]);

  const scrollTargets: Record<string, { current: HTMLElement | null }> = {
    岗位推荐: jobsSectionRef,
    简历优化: candidatesSectionRef,
    "AI 面试": interviewSectionRef,
    企业招聘: recruitersSectionRef
  };

  const handleProductNav = (item: string) => {
    setActiveProductNav(item);
    scrollTargets[item]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleApplySearch = () => {
    setAppliedSearch(searchDraft.trim());
  };

  const toggleFilterTag = (tag: string) => {
    setSelectedTags((current) => (current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]));
  };

  const clearJobFilters = () => {
    setSearchDraft("");
    setAppliedSearch("");
    setSelectedTags([]);
  };

  const openLoginModal = () => {
    setLoginForm(demoUser ?? { name: "", role: "求职者", organization: "" });
    setLoginError("");
    setShowLoginModal(true);
  };

  const saveDemoLogin = () => {
    const nextUser = {
      name: loginForm.name.trim(),
      role: loginForm.role,
      organization: loginForm.organization.trim()
    };

    if (!nextUser.name || !nextUser.organization) {
      setLoginError("请填写姓名和公司或学校。");
      return;
    }

    localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(nextUser));
    setDemoUser(nextUser);
    setShowLoginModal(false);
    onToast("已保存本地 Demo 身份");
  };

  const logoutDemoUser = () => {
    localStorage.removeItem(DEMO_USER_STORAGE_KEY);
    setDemoUser(null);
    onToast("已退出本地 Demo 登录");
  };

  const pollAgentJob = async (jobId: string) => {
    for (let attempt = 0; attempt < 120; attempt += 1) {
      const nextJob = await getAgentJob(jobId);
      setAgentJob(nextJob);

      if (nextJob.status === "completed") {
        flow.setFullFlow(nextJob.results);
        onToast("Agent 分析完成，已写入完整流程结果");
        return;
      }

      if (nextJob.status === "failed") {
        throw new Error(nextJob.error?.message ?? "Agent 分析失败，请稍后重试。");
      }

      await new Promise((resolve) => window.setTimeout(resolve, 1500));
    }

    throw new Error("Agent 任务仍在运行，请稍后刷新任务状态。");
  };

  const runAgent = async () => {
    if (!agentJdText.trim()) {
      setAgentError("请先输入岗位 JD。");
      return;
    }

    if (!agentFile) {
      setAgentError("请先上传 PDF / DOCX / TXT 简历。");
      return;
    }

    const validationError = await validateReadableTextResume(agentFile);
    if (validationError) {
      setAgentError(validationError);
      return;
    }

    setAgentError("");
    setIsAgentRunning(true);

    try {
      const created = await startAgentJob({ jdText: agentJdText, file: agentFile });
      setAgentJob({
        id: created.jobId,
        status: created.status,
        currentStage: created.currentStage,
        stages: created.stages,
        results: created.results,
        error: created.error,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt
      });
      await pollAgentJob(created.jobId);
    } catch (error) {
      setAgentError(getErrorMessage(error));
    } finally {
      setIsAgentRunning(false);
    }
  };

  return (
    <>
    <div className="clay-page space-y-7">
      <section className="clay-hero relative overflow-hidden rounded-[2.5rem] px-4 py-3 sm:px-6 sm:py-4 xl:px-7">
        <div className="pointer-events-none absolute -left-16 top-24 h-48 w-48 rounded-full bg-[#dff8ec] opacity-70 blur-3xl" />
        <div className="pointer-events-none absolute right-5 top-20 h-56 w-56 rounded-full bg-[#eee5ff] opacity-80 blur-3xl" />

        <nav aria-label="产品导航" className="relative z-10 flex flex-col gap-3 rounded-[2rem] bg-white/45 px-4 py-2.5 shadow-[inset_8px_8px_18px_rgba(157,170,180,0.08),inset_-10px_-10px_20px_rgba(255,255,255,0.62)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/images/brand-mark.png"
              alt=""
              aria-hidden="true"
              width={512}
              height={512}
              className="h-11 w-11 rounded-[1.25rem] object-cover shadow-[0_12px_28px_rgba(126,151,145,0.22)]"
            />
            <div>
              <div className="text-lg font-black text-slate-900">智聘未来</div>
              <div className="text-xs font-semibold text-slate-500">柔软 AI 招聘空间</div>
            </div>
          </div>

          <div className="scrollbar-none flex gap-2 overflow-x-auto">
            {productNavItems.map((item) => {
              const active = item === activeProductNav;
              return (
              <button
                key={item}
                type="button"
                aria-current={active ? "true" : undefined}
                className={`clay-nav-button ${active ? "clay-nav-button-active" : ""}`}
                onClick={() => handleProductNav(item)}
              >
                {item}
              </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2">
            {demoUser ? (
              <>
                <div className="inline-flex max-w-full items-center rounded-full bg-white/70 px-4 py-2 text-xs font-black text-slate-700 shadow-[inset_4px_4px_10px_rgba(150,158,168,0.1),inset_-5px_-5px_12px_rgba(255,255,255,0.76)]">
                  <span className="truncate">
                    {demoUser.name} · {demoUser.role} · {demoUser.organization}
                  </span>
                </div>
                <button type="button" className="clay-ghost-button" onClick={logoutDemoUser}>
                  退出登录
                </button>
              </>
            ) : (
              <button type="button" className="clay-ghost-button" onClick={openLoginModal}>
                登录
              </button>
            )}
            <button type="button" className="clay-primary-button" onClick={() => onNavigate("job")}>
              开始体验
            </button>
          </div>
        </nav>

        <div className="relative z-10 grid gap-5 pb-2 pt-5 xl:grid-cols-[minmax(0,1fr)_minmax(390px,0.84fr)] xl:items-center">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#e3fbef] px-4 py-2 text-xs font-black text-emerald-800 shadow-[inset_5px_5px_12px_rgba(75,139,107,0.12),inset_-6px_-6px_14px_rgba(255,255,255,0.75)]">
              <Sparkles size={15} />
              AI Career Companion
            </div>
            <h1 className="mt-4 max-w-3xl text-balance text-4xl font-black leading-tight text-slate-950 sm:text-5xl xl:text-[3.35rem]">
              AI 为你匹配未来职业机会
            </h1>
            <p className="mt-4 max-w-2xl text-base font-semibold leading-8 text-slate-600">
              把岗位推荐、简历优化、AI 面试模拟和人才匹配放进一个柔软明亮的空间，让求职和招聘都变得更轻松、更可信。
            </p>

            <div className="mt-5 max-w-2xl rounded-[1.75rem] bg-[#f4f7f4] p-2 shadow-[inset_10px_10px_22px_rgba(154,166,160,0.18),inset_-10px_-10px_24px_rgba(255,255,255,0.82)] sm:rounded-full">
              <div className="flex min-h-12 flex-col items-stretch gap-2 rounded-[1.5rem] px-3 py-2 sm:flex-row sm:items-center sm:rounded-full sm:px-4 sm:py-0">
                <label className="flex min-w-0 flex-1 items-center gap-3">
                  <Search size={20} className="text-emerald-700" />
                  <span className="sr-only">搜索岗位、技能或城市</span>
                  <input
                    aria-label="搜索岗位、技能或城市"
                    value={searchDraft}
                    onChange={(event) => setSearchDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") handleApplySearch();
                    }}
                    className="min-w-0 flex-1 rounded-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f4f7f4]"
                    placeholder="搜索岗位、技能或城市…"
                  />
                </label>
                <button type="button" className="clay-primary-button w-full sm:w-auto" onClick={handleApplySearch}>
                  智能探索
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {filterTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={selectedTags.includes(tag)}
                  className={`clay-chip ${selectedTags.includes(tag) ? "clay-chip-active" : ""}`}
                  onClick={() => toggleFilterTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button type="button" className="clay-primary-button min-h-12 px-5" onClick={() => onNavigate("job")}>
                生成岗位推荐
                <ArrowRight size={17} />
              </button>
              <button
                type="button"
                className="clay-secondary-button min-h-12 px-5"
                onClick={() => {
                  flow.loadSampleFlow();
                  onToast("已加载演示样例数据");
                }}
              >
                使用样例数据（演示）
              </button>
            </div>
          </div>

          <div className="relative min-w-0">
            <div className="clay-card p-3 sm:p-4">
              <div className="grid gap-3 sm:grid-cols-[0.86fr_1.14fr]">
                <div className="relative overflow-hidden rounded-[2rem] bg-[#eaf8f1] p-3 shadow-[inset_8px_8px_16px_rgba(104,142,124,0.12),inset_-8px_-8px_18px_rgba(255,255,255,0.7)]">
                  <img
                    src="/images/dashboard-hero.png"
                    alt="TrustHire AI 招聘分析工作台"
                    width={1536}
                    height={1024}
                    className="h-44 w-full rounded-[1.6rem] bg-white/55 object-cover object-left shadow-[0_18px_38px_rgba(115,145,135,0.18)] sm:h-52 xl:h-48"
                  />
                  <div className="absolute bottom-5 left-5 rounded-full bg-white/90 px-4 py-2 text-sm font-black text-emerald-800 shadow-[0_14px_26px_rgba(87,125,108,0.2)]">
                    92% 匹配
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-[1.75rem] bg-[#fff4e9] p-3.5 shadow-[inset_8px_8px_18px_rgba(182,119,76,0.12),inset_-9px_-9px_20px_rgba(255,255,255,0.76)]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-black text-orange-700">AI 推荐卡片</div>
                        <div className="mt-1 text-lg font-black text-slate-950">AI 产品运营实习生</div>
                        <div className="mt-1 text-sm font-semibold text-slate-500">星桥智能 · 杭州 · 12K-18K</div>
                      </div>
                      <SoftIcon tone="peach">
                        <Bot size={22} />
                      </SoftIcon>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {["AIGC", "用户研究", "增长实验"].map((tag) => (
                        <span key={tag} className="clay-mini-chip">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] bg-[#eef1ff] p-3.5 shadow-[inset_8px_8px_18px_rgba(105,101,156,0.12),inset_-9px_-9px_20px_rgba(255,255,255,0.7)]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-black text-violet-800">候选人画像</div>
                        <div className="mt-2 text-sm font-semibold leading-6 text-slate-600">偏产品思维，具备内容策略与数据分析基础，适合从 AI 工具运营切入。</div>
                      </div>
                      <div className="clay-avatar">
                        <span />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] bg-white/76 p-3.5 shadow-[0_14px_28px_rgba(112,132,143,0.12),inset_8px_8px_18px_rgba(160,171,176,0.08),inset_-8px_-8px_18px_rgba(255,255,255,0.72)]">
                    <div className="flex items-center justify-between text-sm font-black text-slate-700">
                      <span>成长匹配度</span>
                      <span className="text-emerald-700">92%</span>
                    </div>
                    <div className="mt-3">
                      <SoftProgress value={92} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
        <div ref={candidatesSectionRef} className="clay-card scroll-mt-24 p-5 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black text-emerald-700">For Candidates</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">求职者成长空间</h2>
            </div>
            <p className="max-w-xl text-sm font-semibold leading-6 text-slate-500">从“我能做什么”走向“我适合去哪”，每个模块都用轻量反馈陪用户往前一步。</p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {seekerFeatures.map((item) => {
              const Icon = item.icon;
              const handleClick = () => {
                if (item.action === "navigate") {
                  onNavigate(item.page);
                  return;
                }
                setShowCareerModal(true);
              };

              return (
                <button key={item.title} type="button" className="clay-feature-card group text-left" onClick={handleClick}>
                  <SoftIcon tone={item.tone}>
                    <Icon size={22} />
                  </SoftIcon>
                  <div className="mt-4 text-lg font-black text-slate-950">{item.title}</div>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{item.desc}</p>
                  <div className="mt-4 inline-flex items-center gap-1 text-xs font-black text-emerald-700">
                    继续探索
                    <ArrowRight size={14} className="transition group-hover:translate-x-1" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div ref={jobsSectionRef} className="clay-card scroll-mt-24 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black text-orange-700">Recommended Jobs</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">AI 推荐岗位</h2>
              {(appliedSearch || selectedTags.length > 0) && (
                <p className="mt-2 text-xs font-black text-slate-500">
                  当前筛选：{[appliedSearch && `关键词「${appliedSearch}」`, ...selectedTags].filter(Boolean).join(" / ")}
                </p>
              )}
            </div>
            <SoftIcon tone="mint">
              <Sparkles size={22} />
            </SoftIcon>
          </div>

          <div className="mt-5 space-y-4">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <article key={job.title} className="clay-job-card">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-950">{job.title}</h3>
                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        {job.company} · {job.city} · {job.salary}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1.5 text-xs font-black ${job.tone === "mint" ? "bg-[#dcf8e9] text-emerald-800" : "bg-[#deedff] text-sky-800"}`}>
                      {job.match}% 匹配
                    </span>
                  </div>
                  <div className="mt-4">
                    <SoftProgress value={job.match} tone={job.tone === "peach" ? "peach" : job.tone === "mint" ? "mint" : "blue"} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.tags.map((tag) => (
                      <span key={tag} className="clay-mini-chip">
                        {tag}
                      </span>
                    ))}
                    {job.filters.map((tag) => (
                      <span key={tag} className="clay-mini-chip text-emerald-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              ))
            ) : (
              <div className="clay-inset-panel px-5 py-8 text-center">
                <div className="text-lg font-black text-slate-900">没有找到匹配岗位</div>
                <p className="mx-auto mt-2 max-w-sm text-sm font-semibold leading-6 text-slate-500">换个关键词，或减少筛选标签后再试一次。</p>
                <button type="button" className="clay-secondary-button mt-4" onClick={clearJobFilters}>
                  清除筛选
                </button>
              </div>
            )}
            {filteredJobs.length > 0 && (appliedSearch || selectedTags.length > 0) && (
              <div className="flex justify-end">
                <button type="button" className="clay-ghost-button" onClick={clearJobFilters}>
                  清除筛选
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section ref={recruitersSectionRef} className="clay-card clay-dashboard-rhythm scroll-mt-24 p-5 pl-7 sm:p-6 sm:pl-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black text-violet-700">For Recruiters</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">企业招聘协作舱</h2>
          </div>
          <p className="max-w-xl text-sm font-semibold leading-6 text-slate-500">保持专业判断，但把筛选、面试和进度追踪变成更轻盈的协作体验。</p>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-4">
          {recruiterFeatures.map((item, index) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="clay-recruiter-card">
                <div className="flex items-start justify-between gap-3">
                  <SoftIcon tone={index % 2 ? "blue" : "lilac"}>
                    <Icon size={22} />
                  </SoftIcon>
                  <span className="rounded-full bg-white/72 px-3 py-1.5 text-xs font-black text-slate-600 shadow-[inset_4px_4px_10px_rgba(150,158,168,0.12),inset_-5px_-5px_12px_rgba(255,255,255,0.82)]">
                    {item.value}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-black text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{item.desc}</p>
              </article>
            );
          })}
        </div>

        <div className="clay-page-note mt-5 flex flex-col gap-3 px-4 py-3 text-sm font-semibold leading-6 text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="clay-step-dot">AI</span>
            <span>AI 先做轻量排序，HR 再复核关键证据与候选人动机。</span>
          </div>
          <span className="clay-mini-chip text-emerald-700">低压力协作流</span>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[0.94fr_1.06fr]">
          <div className="rounded-[2rem] bg-[#f0f8ff] p-4 shadow-[inset_9px_9px_20px_rgba(106,142,174,0.12),inset_-9px_-9px_20px_rgba(255,255,255,0.75)]">
            <div className="mb-4 flex items-center justify-between">
              <div className="font-black text-slate-900">候选人推荐</div>
              <span className="rounded-full bg-[#e2f5ff] px-3 py-1 text-xs font-black text-sky-800">轻量筛选</span>
            </div>
            {[
              ["张同学", "Java 后端实习生", 82],
              ["林同学", "AI 产品助理", 91],
              ["陈同学", "数据分析实习生", 88]
            ].map(([name, role, score]) => (
              <div key={name} className="mb-3 rounded-[1.5rem] bg-white/78 p-3 shadow-[0_12px_24px_rgba(104,128,151,0.1)] last:mb-0">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-black text-slate-900">{name}</div>
                    <div className="text-xs font-semibold text-slate-500">{role}</div>
                  </div>
                  <div className="text-sm font-black text-emerald-700">{score}%</div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-[2rem] bg-[#fff4ea] p-4 shadow-[inset_9px_9px_20px_rgba(173,121,80,0.12),inset_-9px_-9px_20px_rgba(255,255,255,0.72)]">
            <div className="mb-5 flex items-center justify-between">
              <div className="font-black text-slate-900">招聘流程状态</div>
              <span className="rounded-full bg-white/76 px-3 py-1 text-xs font-black text-orange-700">本周更新</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              {["已推荐", "HR 初筛", "AI 面试", "发起 Offer"].map((label, index) => (
                <div key={label} className="rounded-[1.5rem] bg-white/76 p-3 text-center shadow-[0_12px_24px_rgba(160,118,82,0.1)]">
                  <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-[#ffe5d3] text-sm font-black text-orange-700 shadow-[inset_5px_5px_12px_rgba(177,111,70,0.12),inset_-5px_-5px_12px_rgba(255,255,255,0.72)]">
                    {index + 1}
                  </div>
                  <div className="mt-3 text-sm font-black text-slate-800">{label}</div>
                  <div className="mt-2">
                    <SoftProgress value={[100, 76, 48, 22][index]} tone="peach" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-4">
        {[
          { label: "流程进度", value: `${completedCount}/6`, desc: "已完成 Agent 阶段", icon: CheckCircle2, tone: "mint" },
          { label: "下一动作", value: nextStep ? nextStep.label : "导出报告", desc: nextStep ? "继续补齐分析链路" : "流程已经闭环", icon: Clock3, tone: "blue" },
          { label: "匹配评分", value: flow.matchScore?.totalScore ?? "--", desc: flow.matchScore?.recommendationLevel ?? "等待生成评分", icon: Target, tone: "lilac" },
          { label: "需复核风险", value: riskCount, desc: riskCount ? "需要 HR 复核" : "证据链生成后汇总", icon: AlertTriangle, tone: "peach" }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.label} className="clay-stat-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-black text-slate-500">{item.label}</div>
                  <div className="mt-2 text-3xl font-black text-slate-950">{item.value}</div>
                </div>
                <SoftIcon tone={item.tone}>
                  <Icon size={22} />
                </SoftIcon>
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-500">{item.desc}</p>
            </article>
          );
        })}
      </section>

      <section ref={interviewSectionRef} className="clay-card clay-dashboard-rhythm scroll-mt-24 p-5 pl-7 sm:p-6 sm:pl-8">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black text-sky-700">Workflow</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">可信 AI 招聘驾驶舱</h2>
          </div>
          <p className="max-w-xl text-sm font-semibold leading-6 text-slate-500">AI 招聘智能体、证据链闭环和人岗匹配决策仍在后台支撑真实分析流程。</p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {[
            { title: "AI 招聘智能体", desc: "一键串联 6 个分析阶段", icon: Bot, tone: "blue" },
            { title: "证据链闭环", desc: "每个判断都有事实来源", icon: FileSearch, tone: "mint" },
            { title: "人岗匹配决策", desc: flow.matchScore ? `${flow.matchScore.totalScore}/100 ${flow.matchScore.recommendationLevel}` : "评分后输出 HR 建议", icon: Target, tone: "peach" }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="clay-mini-panel">
                <SoftIcon tone={item.tone}>
                  <Icon size={21} />
                </SoftIcon>
                <div className="mt-4 text-base font-black text-slate-950">{item.title}</div>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{item.desc}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="clay-card p-5 sm:p-6">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black text-emerald-700">Agent Studio</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">任务式 Agent</h2>
          </div>
          <p className="max-w-xl text-sm font-semibold leading-6 text-slate-500">上传岗位 JD 和简历，真实执行岗位、简历、证据链、评分、面试任务与报告生成。</p>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.16fr_0.84fr]">
          <div className="space-y-4">
            <div className="rounded-[1.6rem] bg-[#eaf8f1] px-4 py-3 shadow-[inset_8px_8px_16px_rgba(99,143,123,0.12),inset_-8px_-8px_18px_rgba(255,255,255,0.72)]">
              <div className="flex items-center gap-2 text-sm font-black text-emerald-800">
                <Activity size={17} />
                一键执行完整 AI 招聘分析链路
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-black text-slate-600">Agent JD 输入</span>
              <textarea
                aria-label="Agent JD 输入"
                value={agentJdText}
                onChange={(event) => setAgentJdText(event.target.value)}
                className="clay-textarea min-h-44 w-full resize-y px-4 py-3 text-sm leading-6 outline-none"
              />
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileInputRef}
                aria-label="Agent 简历上传"
                type="file"
                accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                className="sr-only"
                onChange={(event) => setAgentFile(event.target.files?.[0] ?? null)}
              />
              <Button variant="secondary" icon={<UploadCloud size={18} />} className="clay-button" onClick={() => fileInputRef.current?.click()}>
                选择简历
              </Button>
              {agentFile && <span className="rounded-full bg-white/70 px-3 py-2 text-sm font-semibold text-slate-600 shadow-[inset_4px_4px_10px_rgba(150,158,168,0.1),inset_-5px_-5px_12px_rgba(255,255,255,0.75)]">{agentFile.name}</span>}
              <Button variant="ai" icon={isAgentRunning ? <Loader2 size={18} className="animate-spin" /> : <Bot size={18} />} disabled={isAgentRunning} className="clay-button clay-agent-button" onClick={runAgent}>
                一键 Agent 分析
              </Button>
            </div>

            {agentError && <div className="rounded-[1.4rem] bg-[#fff0e8] px-4 py-3 text-sm font-semibold text-orange-800 shadow-[inset_7px_7px_14px_rgba(187,107,69,0.12),inset_-7px_-7px_16px_rgba(255,255,255,0.7)]">{agentError}</div>}
          </div>

          <div className="rounded-[2rem] bg-[#f7f8f3] p-4 shadow-[inset_10px_10px_22px_rgba(148,160,151,0.14),inset_-10px_-10px_24px_rgba(255,255,255,0.82)]">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-black text-slate-900">Agent 任务进度</div>
              <span className="rounded-full bg-white/78 px-3 py-1 text-xs font-black text-slate-500">Live</span>
            </div>
            {agentJob?.status === "failed" && (
              <div className="mb-3 rounded-[1.4rem] bg-[#fff0e8] px-3 py-2 text-sm font-semibold text-orange-800 shadow-[inset_6px_6px_14px_rgba(187,107,69,0.12),inset_-7px_-7px_15px_rgba(255,255,255,0.72)]">
                <div>失败阶段：{failedStageLabel || "未识别阶段"}</div>
                <div className="mt-1">失败原因：{failedReason}</div>
              </div>
            )}
            <div className="space-y-3">
              {currentStages.map((stage) => (
                <div key={stage.key} className="flex items-center justify-between gap-3 rounded-[1.35rem] bg-white/72 px-3 py-2 text-sm shadow-[0_10px_20px_rgba(118,134,128,0.08),inset_5px_5px_12px_rgba(155,164,160,0.08),inset_-6px_-6px_14px_rgba(255,255,255,0.8)]">
                  <span className="flex min-w-0 items-center gap-2 font-black text-slate-700">
                    <StageTone status={stage.status} />
                    {stage.label}
                  </span>
                  <span className="shrink-0 text-xs font-black text-slate-500">{stageText(stage.status)}</span>
                </div>
              ))}
            </div>
            {agentJob && <div className="mt-4 rounded-[1.2rem] bg-white/70 px-3 py-2 text-xs font-semibold text-slate-500 shadow-[inset_5px_5px_12px_rgba(155,164,160,0.08),inset_-6px_-6px_14px_rgba(255,255,255,0.78)]">任务 ID：{agentJob.id}</div>}
          </div>
        </div>
      </section>
    </div>

    {showLoginModal && (
      <Modal
        title="本地 Demo 登录"
        size="md"
        onClose={() => setShowLoginModal(false)}
        footer={
          <>
            <button type="button" className="clay-ghost-button" onClick={() => setShowLoginModal(false)}>
              取消
            </button>
            <button type="button" className="clay-primary-button" onClick={saveDemoLogin}>
              保存 Demo 身份
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-[1.5rem] bg-[#eaf8f1] px-4 py-3 text-sm font-semibold leading-6 text-emerald-800 shadow-[inset_7px_7px_14px_rgba(99,143,123,0.12),inset_-7px_-7px_16px_rgba(255,255,255,0.72)]">
            仅保存到当前浏览器的 localStorage，用于本地演示身份展示，不连接真实后端。
          </div>
          <label className="block">
            <span className="mb-2 block text-sm font-black text-slate-600">姓名</span>
            <input
              aria-label="姓名"
              value={loginForm.name}
              onChange={(event) => setLoginForm((current) => ({ ...current, name: event.target.value }))}
              className="clay-textarea min-h-12 w-full px-4 py-3 text-sm font-semibold outline-none"
              placeholder="例如：陈同学"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-black text-slate-600">角色</span>
            <select
              aria-label="角色"
              value={loginForm.role}
              onChange={(event) => setLoginForm((current) => ({ ...current, role: event.target.value === "HR" ? "HR" : "求职者" }))}
              className="clay-textarea min-h-12 w-full px-4 py-3 text-sm font-semibold outline-none"
            >
              <option value="求职者">求职者</option>
              <option value="HR">HR</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-black text-slate-600">公司或学校</span>
            <input
              aria-label="公司或学校"
              value={loginForm.organization}
              onChange={(event) => setLoginForm((current) => ({ ...current, organization: event.target.value }))}
              className="clay-textarea min-h-12 w-full px-4 py-3 text-sm font-semibold outline-none"
              placeholder="例如：未来大学 / 星桥智能"
            />
          </label>
          {loginError && <div className="rounded-[1.3rem] bg-[#fff0e8] px-4 py-3 text-sm font-semibold text-orange-800">{loginError}</div>}
        </div>
      </Modal>
    )}

    {showCareerModal && (
      <Modal
        title="职业路径建议"
        size="lg"
        onClose={() => setShowCareerModal(false)}
        footer={
          <>
            {!hasCareerData && (
              <button
                type="button"
                className="clay-secondary-button"
                onClick={() => {
                  flow.loadSampleFlow();
                  onToast("已加载演示样例数据");
                }}
              >
                加载样例数据
              </button>
            )}
            <button type="button" className="clay-primary-button" onClick={() => setShowCareerModal(false)}>
              知道了
            </button>
          </>
        }
      >
        {hasCareerData ? (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="clay-detail-tile p-4">
                <div className="text-xs font-black text-slate-500">候选人</div>
                <div className="mt-2 text-lg font-black text-slate-950">{careerName}</div>
              </div>
              <div className="clay-detail-tile p-4">
                <div className="text-xs font-black text-slate-500">目标岗位</div>
                <div className="mt-2 text-lg font-black text-slate-950">{careerTarget}</div>
              </div>
              <div className="clay-detail-tile p-4">
                <div className="text-xs font-black text-slate-500">当前匹配</div>
                <div className="mt-2 text-lg font-black text-emerald-700">{careerScore ? `${careerScore} 分` : "待评分"}</div>
              </div>
            </div>

            <div className="clay-inset-panel p-4">
              <div className="text-sm font-black text-slate-900">建议路径</div>
              <ol className="mt-3 space-y-3 text-sm font-semibold leading-6 text-slate-600">
                <li>
                  <span className="font-black text-emerald-700">1. 近 2 周：</span>
                  补齐岗位核心能力证据，把项目经历拆成问题、动作、结果三段。
                </li>
                <li>
                  <span className="font-black text-emerald-700">2. 1 个月内：</span>
                  围绕面试任务练习表达，优先验证弱证据能力和项目真实性。
                </li>
                <li>
                  <span className="font-black text-emerald-700">3. 2-3 个月：</span>
                  沉淀一个可展示项目，连接目标岗位的业务场景与工程交付。
                </li>
              </ol>
            </div>

            <div className="clay-soft-panel p-4">
              <div className="text-sm font-black text-slate-900">优先补强项</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(careerGaps.length ? careerGaps : ["岗位能力证据", "面试表达结构", "项目复盘材料"]).map((gap) => (
                  <span key={gap} className="clay-mini-chip text-orange-700">
                    {gap}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="clay-inset-panel p-6 text-center">
            <div className="text-xl font-black text-slate-950">暂无流程数据</div>
            <p className="mx-auto mt-3 max-w-md text-sm font-semibold leading-6 text-slate-500">
              请先加载样例数据，或完成 JD 解析、简历分析和匹配评分流程后，再查看更贴合当前候选人的职业路径建议。
            </p>
          </div>
        )}
      </Modal>
    )}
    </>
  );
}
