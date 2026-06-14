import { describe, expect, it, vi } from "vitest";
import { getErrorMessage } from "../services/apiClient";
import { analyzeJobDescription, analyzeResumeFile } from "../services/analysisService";

describe("analysisService HTTP client", () => {
  it("throws a readable API error when JD analysis fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        json: vi.fn().mockResolvedValue({ error: { code: "AI_PROVIDER_ERROR", message: "AI 服务调用失败，请稍后重试。" } })
      })
    );

    await expect(analyzeJobDescription("Java 后端实习生")).rejects.toThrow("AI 服务调用失败，请稍后重试。");
  });

  it("keeps backend validation errors readable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValue({ error: { code: "VALIDATION_ERROR", message: "JD 内容至少需要 20 个字符。" } })
      })
    );

    await expect(analyzeJobDescription("太短")).rejects.toThrow("JD 内容至少需要 20 个字符。");
  });

  it("keeps unsupported resume file errors readable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 415,
        json: vi.fn().mockResolvedValue({ error: { code: "UNSUPPORTED_FILE_TYPE", message: "仅支持 PDF / DOCX / TXT 简历文件。" } })
      })
    );

    await expect(analyzeResumeFile(new File(["not a resume"], "resume.png", { type: "image/png" }))).rejects.toThrow("仅支持 PDF / DOCX / TXT 简历文件。");
  });

  it("maps API connection failures to the demo startup hint", () => {
    expect(getErrorMessage(new TypeError("fetch failed"))).toBe("无法连接后端服务，请确认 server 已启动。");
  });

  it("maps timeout aborts to a user-facing AI timeout hint", () => {
    expect(getErrorMessage(new DOMException("The operation was aborted.", "AbortError"))).toBe("AI 服务响应超时，请稍后重试，或先使用样例数据完成演示。");
  });
});
