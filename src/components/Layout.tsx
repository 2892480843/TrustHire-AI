import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import type { PageKey } from "../types";

export function Layout({
  activePage,
  onNavigate,
  onToast,
  children
}: {
  activePage: PageKey;
  onNavigate: (page: PageKey) => void;
  onToast: (message: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-[100dvh] text-slate-900">
      <Sidebar activePage={activePage} onNavigate={onNavigate} onToast={onToast} />
      <div className="flex min-w-0 flex-1 flex-col lg:pl-[258px]">
        <Topbar activePage={activePage} onNavigate={onNavigate} onToast={onToast} />
        <main role="main" className="min-w-0 flex-1 overflow-x-hidden px-4 py-4 sm:px-5 lg:px-6 lg:py-6">
          <div className="mx-auto w-full max-w-[1440px] space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
