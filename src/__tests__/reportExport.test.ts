import { describe, expect, it, vi } from "vitest";
import { exportMarkdownReport } from "../utils/reportExport";
import type { MatchReport } from "../types";

describe("report export", () => {
  it("downloads Markdown with a .md filename and text/markdown content", () => {
    const createObjectURL = vi.fn((blob: Blob) => {
      expect(blob).toBeInstanceOf(Blob);
      return "blob:markdown-report";
    });
    const revokeObjectURL = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    Object.defineProperty(window.URL, "createObjectURL", { configurable: true, value: createObjectURL });
    Object.defineProperty(window.URL, "revokeObjectURL", { configurable: true, value: revokeObjectURL });

    const report: MatchReport = {
      candidateName: "张同学",
      jobTitle: "Java 后端实习生",
      totalScore: 82,
      recommendationLevel: "建议进入一面",
      strengths: ["Java 基础扎实"],
      risks: ["Redis 证据不足"],
      gaps: ["缓存实践"],
      interviewAdvice: ["追问 Redis 使用场景"],
      finalAdvice: "建议进入一面"
    };

    const result = exportMarkdownReport(report, "C001");
    const calls = createObjectURL.mock.calls as Array<[Blob]>;
    const blob = calls[0][0];

    expect(result.filename).toBe("TrustHire-C001-匹配报告.md");
    expect(blob.type).toBe("text/markdown;charset=utf-8");
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:markdown-report");
  });
});
