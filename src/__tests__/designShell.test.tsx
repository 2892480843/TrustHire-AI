import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "../App";
import { Button } from "../components/ui/Button";

describe("TrustHire AI design shell", () => {
  it("does not lock the application to a desktop-only viewport", () => {
    const css = readFileSync(join(process.cwd(), "src", "index.css"), "utf8");

    expect(css).not.toContain("min-width: 1180px");
    expect(css).not.toContain("min-width: 1024px");
    expect(css).toContain("overflow-x: hidden");
  });

  it("announces transient toast messages as polite status updates", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "使用样例数据（演示）" }));

    expect(screen.getByRole("status")).toHaveTextContent("已加载演示样例数据");
  });

  it("keeps shared buttons keyboard-visible with focus styling", () => {
    render(<Button>保存设置</Button>);

    const buttonClass = screen.getByRole("button", { name: "保存设置" }).className;

    expect(buttonClass).toContain("hover:");
    expect(buttonClass).toContain("active:");
    expect(buttonClass).toContain("focus-visible:");
  });

  it("extends the claymorphism visual system across shared feature pages", () => {
    const files = [
      "src/index.css",
      "src/components/PageHeader.tsx",
      "src/components/ui/Button.tsx",
      "src/components/ui/Card.tsx",
      "src/components/ui/EmptyState.tsx",
      "src/components/ui/Modal.tsx",
      "src/components/ui/ProgressBar.tsx",
      "src/pages/JobAnalysis.tsx",
      "src/pages/ResumeAnalysis.tsx",
      "src/pages/EvidenceAnalysis.tsx",
      "src/pages/MatchingScore.tsx",
      "src/pages/InterviewTasks.tsx",
      "src/pages/MatchingReport.tsx"
    ];
    const source = files.map((file) => readFileSync(join(process.cwd(), file), "utf8")).join("\n");

    expect(source).toContain("clay-page-header");
    expect(source).toContain("clay-card");
    expect(source).toContain("clay-primary-button");
    expect(source).toContain("clay-secondary-button");
    expect(source).toContain("clay-textarea");
    expect(source).toContain("clay-table");
    expect(source).not.toContain("bg-[#08172f]");
    expect(source).not.toContain("rounded-lg border border-stone-200/90 bg-white");
  });

  it("keeps every workflow page polished with soft detail systems", () => {
    const files = [
      "src/index.css",
      "src/pages/Dashboard.tsx",
      "src/pages/JobAnalysis.tsx",
      "src/pages/ResumeAnalysis.tsx",
      "src/pages/EvidenceAnalysis.tsx",
      "src/pages/MatchingScore.tsx",
      "src/pages/InterviewTasks.tsx",
      "src/pages/MatchingReport.tsx"
    ];
    const source = files.map((file) => readFileSync(join(process.cwd(), file), "utf8")).join("\n");

    expect(source).toContain("clay-detail-tile");
    expect(source).toContain("clay-page-note");
    expect(source).toContain("clay-step-dot");
    expect(source).toContain("clay-soft-divider");
    expect(source).toContain("clay-dashboard-rhythm");
  });

  it("keeps the responsive shell guarded against horizontal overflow", () => {
    render(<App />);

    expect(screen.getByRole("main").className).toContain("overflow-x-hidden");
    expect(screen.getByRole("navigation", { name: "移动导航" }).className).toContain("overflow-x-auto");
  });

  it("surfaces the trusted AI recruiting cockpit language on the dashboard", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "可信 AI 招聘驾驶舱" })).toBeInTheDocument();
    expect(screen.getByText("AI 招聘智能体")).toBeInTheDocument();
    expect(screen.getByText("证据链闭环")).toBeInTheDocument();
    expect(screen.getByText("人岗匹配决策")).toBeInTheDocument();
  });

  it("presents the claymorphism career workspace preview", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "AI 为你匹配未来职业机会" })).toBeInTheDocument();
    expect(screen.getByText("岗位推荐")).toBeInTheDocument();
    expect(screen.getByText("简历优化")).toBeInTheDocument();
    expect(screen.getAllByText("AI 面试").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("企业招聘")).toBeInTheDocument();
    expect(screen.getAllByText("92% 匹配").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("heading", { name: "求职者成长空间" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "企业招聘协作舱" })).toBeInTheDocument();
  });

  it("declares a mobile browser theme color", () => {
    const html = readFileSync(join(process.cwd(), "index.html"), "utf8");

    expect(html).toMatch(/<meta\s+name="theme-color"\s+content="[^"]+"\s*\/?>/);
  });

  it("keeps project image tags sized with intrinsic dimensions", () => {
    const files = ["src/components/Sidebar.tsx", "src/pages/Dashboard.tsx", "src/pages/JobAnalysis.tsx", "src/pages/MatchingReport.tsx"];

    files.forEach((file) => {
      const source = readFileSync(join(process.cwd(), file), "utf8");
      const imageTags = source.match(/<img\b[\s\S]*?\/>/g) ?? [];

      imageTags.forEach((tag, index) => {
        expect(`${file}#${index}:${tag}`).toMatch(/\bwidth=/);
        expect(`${file}#${index}:${tag}`).toMatch(/\bheight=/);
      });
    });
  });

  it("keeps upload controls, focus states, and animated progress accessible", () => {
    const css = readFileSync(join(process.cwd(), "src", "index.css"), "utf8");
    const resumeSource = readFileSync(join(process.cwd(), "src", "pages", "ResumeAnalysis.tsx"), "utf8");
    const progressSource = readFileSync(join(process.cwd(), "src", "components", "ui", "ProgressBar.tsx"), "utf8");

    expect(resumeSource).toMatch(/<input[\s\S]*type="file"[\s\S]*aria-label=/);
    expect(progressSource).not.toContain("transition-all");
    expect(progressSource).toContain("transition-[width]");
    expect(css).toContain(".clay-primary-button:focus-visible");
    expect(css).toContain(".clay-textarea:focus-visible");
  });

  it("uses a single typographic ellipsis in visible placeholders", () => {
    const files = ["src/components/Topbar.tsx", "src/pages/Dashboard.tsx", "src/pages/InterviewTasks.tsx", "src/pages/JobAnalysis.tsx"];
    const source = files.map((file) => readFileSync(join(process.cwd(), file), "utf8")).join("\n");

    expect(source).not.toMatch(/placeholder=(?:"[^"]*\.\.\.[^"]*"|{`[^`]*\.\.\.[^`]*`})/);
    expect(source).not.toContain("解析中...");
  });

  it("keeps the enterprise boundary panel pinned to the bottom of the fixed desktop sidebar", () => {
    const sidebarSource = readFileSync(join(process.cwd(), "src", "components", "Sidebar.tsx"), "utf8");
    const layoutSource = readFileSync(join(process.cwd(), "src", "components", "Layout.tsx"), "utf8");

    const enterpriseIndex = sidebarSource.indexOf("企业版");
    const navLabelIndex = sidebarSource.indexOf("AI Recruit Ops");
    const navCloseIndex = sidebarSource.indexOf("</nav>");

    expect(sidebarSource).toContain("fixed");
    expect(sidebarSource).toContain("left-0");
    expect(sidebarSource).toContain("top-0");
    expect(layoutSource).toContain("lg:pl-[258px]");
    expect(enterpriseIndex).toBeGreaterThan(-1);
    expect(navLabelIndex).toBeGreaterThan(-1);
    expect(navCloseIndex).toBeGreaterThan(navLabelIndex);
    expect(enterpriseIndex).toBeGreaterThan(navCloseIndex);
    expect(sidebarSource).toContain("mt-auto");
  });

  it("keeps the cockpit palette intentional without temporary image tinting styles", () => {
    const files = [
      "src/index.css",
      "src/App.tsx",
      "src/components/Sidebar.tsx",
      "src/components/Topbar.tsx",
      "src/components/PageHeader.tsx",
      "src/components/ui/Button.tsx",
      "src/components/ui/Card.tsx",
      "src/components/ui/StatCard.tsx",
      "src/pages/Dashboard.tsx",
      "src/pages/JobAnalysis.tsx",
      "src/pages/MatchingScore.tsx",
      "src/pages/MatchingReport.tsx",
      "src/state/AnalysisFlowContext.tsx"
    ];
    const source = files.map((file) => readFileSync(join(process.cwd(), file), "utf8")).join("\n");

    expect(source).toMatch(/\b(?:bg|text|border|from|via|to|ring|shadow)-(?:blue|indigo|violet|purple|sky)-/);
    expect(source).toMatch(/\b(?:bg|text|border|from|via|to|ring|shadow)-emerald-/);
    expect(source).toMatch(/\b(?:bg|text|border|from|via|to|ring|shadow)-(?:amber|orange)-/);
    expect(source).not.toMatch(/\b(?:hue-rotate|filter:|backdrop-blur|glassmorphism)\b/);
  });
});
