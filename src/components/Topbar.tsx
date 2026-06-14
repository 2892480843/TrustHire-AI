import { useState } from "react";
import { Bell, Search, ShieldCheck, Sparkles } from "lucide-react";
import { navItems, pageSubtitles } from "../data/mockData";
import type { PageKey } from "../types";

const topbarTitles: Record<PageKey, string> = {
  dashboard: "AI 职业工作台",
  job: "JD 解析",
  resume: "简历分析",
  evidence: "证据链分析",
  score: "匹配评分",
  interview: "面试任务",
  report: "匹配报告"
};

const searchTargets: Array<{ page: PageKey; keywords: string[] }> = [
  { page: "dashboard", keywords: ["仪表盘", "dashboard"] },
  { page: "job", keywords: ["jd", "岗位", "解析"] },
  { page: "resume", keywords: ["简历", "候选人", "上传"] },
  { page: "evidence", keywords: ["证据", "证据链"] },
  { page: "score", keywords: ["匹配", "评分"] },
  { page: "interview", keywords: ["面试", "任务"] },
  { page: "report", keywords: ["报告", "导出", "markdown"] }
];

function normalizeKeyword(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

export function Topbar({
  activePage,
  onNavigate,
  onToast
}: {
  activePage: PageKey;
  onNavigate: (page: PageKey) => void;
  onToast: (message: string) => void;
}) {
  const [searchValue, setSearchValue] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  function handleSearch() {
    const keyword = normalizeKeyword(searchValue);
    if (!keyword) return;
    const target = searchTargets.find((item) => item.keywords.some((candidate) => normalizeKeyword(candidate).includes(keyword) || keyword.includes(normalizeKeyword(candidate))));
    if (!target) {
      onToast("未找到相关功能");
      return;
    }
    onNavigate(target.page);
    setSearchValue("");
    onToast("已跳转到相关功能");
  }

  return (
    <div className="sticky top-0 z-30 shrink-0 border-b border-white/50 bg-[#fbfbf6]/86 shadow-[0_10px_28px_rgba(122,143,138,0.08)]">
      <header className="flex min-h-[68px] items-center justify-between gap-4 px-4 py-3 sm:px-5 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-[1.25rem] bg-[#e3f8ed] text-emerald-700 shadow-[inset_5px_5px_12px_rgba(82,139,111,0.12),inset_-6px_-6px_14px_rgba(255,255,255,0.76)]">
            <ShieldCheck size={18} />
          </div>
          <div className="min-w-0">
            <div className="truncate text-xl font-black tracking-normal text-slate-950 sm:text-2xl">{topbarTitles[activePage]}</div>
            <div className="truncate text-xs text-slate-500 sm:text-sm">{pageSubtitles[activePage]}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full bg-[#e3f8ed] px-3 py-2 text-xs font-black text-emerald-700 shadow-[inset_5px_5px_12px_rgba(82,139,111,0.1),inset_-6px_-6px_14px_rgba(255,255,255,0.76)] xl:flex">
            <Sparkles size={15} />
            可信证据链在线
          </div>
          <label className="relative hidden md:block">
            <span className="sr-only">搜索功能</span>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              name="shell-search"
              autoComplete="off"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSearch();
              }}
              className="h-11 w-[260px] rounded-full border-0 bg-[#f2f5ef] pl-10 pr-4 text-sm font-semibold outline-none shadow-[inset_7px_7px_16px_rgba(143,153,151,0.14),inset_-8px_-8px_18px_rgba(255,255,255,0.84)] transition-[background-color,box-shadow] placeholder:text-slate-400 focus:bg-[#f8faf5] focus:shadow-[inset_7px_7px_16px_rgba(118,145,135,0.16),inset_-8px_-8px_18px_rgba(255,255,255,0.88),0_0_0_4px_rgba(160,232,193,0.32)] focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white lg:w-[320px]"
              placeholder="搜索岗位、候选人、功能…"
            />
          </label>
          <div className="relative">
            <button
              type="button"
              aria-label="通知"
              aria-expanded={showNotifications}
              onClick={() => setShowNotifications((value) => !value)}
              className="relative grid h-11 w-11 place-items-center rounded-[1.35rem] border-0 bg-white/72 text-slate-500 shadow-[8px_10px_20px_rgba(122,143,138,0.1),-6px_-6px_16px_rgba(255,255,255,0.8),inset_4px_4px_10px_rgba(154,166,164,0.07),inset_-5px_-5px_12px_rgba(255,255,255,0.76)] transition-[background-color,color,box-shadow,transform] hover:-translate-y-0.5 hover:text-emerald-700 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-12 z-40 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-[1.6rem] bg-white shadow-[0_18px_48px_rgba(122,143,138,0.18),inset_6px_6px_14px_rgba(154,166,164,0.06),inset_-7px_-7px_16px_rgba(255,255,255,0.76)]">
                <div className="bg-[#f1f8ee] px-4 py-3 text-sm font-black text-slate-950">通知中心</div>
                <div className="px-4 py-3 text-sm leading-6 text-slate-600">后端 API 已接入。执行真实分析前，请确认服务端和模型配置可用。</div>
              </div>
            )}
          </div>
        </div>
      </header>

      <nav aria-label="移动导航" className="scrollbar-none flex gap-2 overflow-x-auto px-4 pb-3 sm:px-5 lg:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.key === activePage;
          return (
            <button
              key={item.key}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => onNavigate(item.key)}
              className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full border-0 px-3 text-xs font-black transition-[background-color,color,box-shadow,transform] active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
                active ? "bg-[#dff8ec] text-emerald-800 shadow-[8px_10px_20px_rgba(105,146,128,0.14),inset_4px_4px_10px_rgba(90,142,117,0.1),inset_-5px_-5px_12px_rgba(255,255,255,0.78)]" : "bg-white/70 text-slate-600 shadow-[inset_4px_4px_10px_rgba(154,166,164,0.07),inset_-5px_-5px_12px_rgba(255,255,255,0.76)] hover:text-emerald-700"
              }`}
            >
              <Icon size={15} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
