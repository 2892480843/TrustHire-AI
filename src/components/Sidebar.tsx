import { navItems } from "../data/mockData";
import { asset } from "../utils/asset";
import type { PageKey } from "../types";

export function Sidebar({
  activePage,
  onNavigate
}: {
  activePage: PageKey;
  onNavigate: (page: PageKey) => void;
  onToast: (message: string) => void;
}) {
  return (
    <aside className="fixed bottom-0 left-0 top-0 hidden w-[258px] shrink-0 flex-col overflow-hidden border-r border-white/60 bg-[#f3f8ef]/92 px-4 py-5 text-slate-800 shadow-[18px_0_46px_rgba(122,143,138,0.14),inset_-8px_0_18px_rgba(255,255,255,0.56)] lg:flex">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_18%_18%,rgba(202,243,219,0.86),transparent_36%),radial-gradient(circle_at_90%_8%,rgba(238,229,255,0.84),transparent_34%)]" />

      <div className="relative mb-8 flex items-center gap-3 rounded-[1.7rem] bg-white/58 p-2.5 shadow-[10px_12px_26px_rgba(122,143,138,0.12),-7px_-7px_18px_rgba(255,255,255,0.82),inset_5px_5px_12px_rgba(154,166,164,0.07),inset_-6px_-6px_14px_rgba(255,255,255,0.76)]">
        <img
          src={asset("images/brand-mark.png")}
          alt="智聘未来品牌标识"
          width={512}
          height={512}
          className="h-11 w-11 rounded-[1.2rem] object-cover shadow-[0_10px_24px_rgba(113,142,132,0.2)]"
        />
        <div>
          <div className="text-lg font-black leading-tight">智聘未来</div>
          <div className="text-xs font-semibold text-emerald-700">TrustHire AI</div>
        </div>
      </div>

      <div className="relative mb-3 px-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">AI Recruit Ops</div>
      <nav aria-label="主导航" className="relative space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.key === activePage;
          return (
            <button
              key={item.key}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => onNavigate(item.key)}
              className={`group flex min-h-11 w-full items-center gap-3 rounded-[1.35rem] px-3.5 text-left text-sm font-black transition-[background-color,color,box-shadow,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f3f8ef] active:translate-y-px ${
                active
                  ? "bg-[#dff8ec] text-emerald-800 shadow-[10px_12px_24px_rgba(105,146,128,0.16),inset_5px_5px_12px_rgba(90,142,117,0.12),inset_-6px_-6px_14px_rgba(255,255,255,0.78)]"
                  : "text-slate-500 hover:bg-white/60 hover:text-slate-900 hover:shadow-[8px_10px_20px_rgba(122,143,138,0.1),inset_4px_4px_10px_rgba(154,166,164,0.07),inset_-5px_-5px_12px_rgba(255,255,255,0.76)] active:bg-white/70"
              }`}
            >
              <span className={`grid h-8 w-8 place-items-center rounded-[1rem] transition ${active ? "bg-white/60 text-emerald-700" : "bg-white/46 text-slate-400 group-hover:text-emerald-700"}`}>
                <Icon size={17} strokeWidth={2} />
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="relative mt-auto rounded-[1.8rem] bg-[#e4f7ed] p-4 text-xs font-semibold leading-5 text-emerald-900 shadow-[inset_8px_8px_16px_rgba(98,143,122,0.12),inset_-8px_-8px_18px_rgba(255,255,255,0.72)]">
        <div className="mb-2 flex items-center justify-between">
          <div className="font-black text-slate-900">企业版</div>
          <span className="rounded-full bg-white/66 px-2 py-0.5 text-[11px] font-black text-emerald-700">已启用</span>
        </div>
        <div className="mb-3 text-emerald-800/75">有效期至 2026-06-30</div>
        <div className="mb-1 font-black text-slate-900">数据边界</div>
        文件解析与模型调用在服务端执行，前端仅展示结构化结果。
      </div>
    </aside>
  );
}
