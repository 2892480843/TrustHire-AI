import { describe, expect, it } from "vitest";
import { matchScoreSchema } from "../schemas/analysisSchemas.js";

describe("analysis schemas", () => {
  it("validates a correct match score payload", () => {
    const result = matchScoreSchema.safeParse({
      totalScore: 82,
      recommendationLevel: "建议进入一面",
      summary: "候选人整体匹配度较高。",
      dimensions: [
        { key: "skill", label: "技能匹配", value: 86, benchmark: 70 },
        { key: "project", label: "项目相关度", value: 80, benchmark: 65 }
      ],
      advantages: ["Java 基础扎实"],
      weaknesses: ["Redis 项目证据不足"],
      hrAdvice: "建议在面试中验证接口设计和缓存实践。"
    });

    expect(result.success).toBe(true);
  });

  it("rejects match score outside 0-100", () => {
    const result = matchScoreSchema.safeParse({
      totalScore: 108,
      recommendationLevel: "建议进入一面",
      summary: "候选人整体匹配度较高。",
      dimensions: [{ key: "skill", label: "技能匹配", value: 86, benchmark: 70 }],
      advantages: ["Java 基础扎实"],
      weaknesses: ["Redis 项目证据不足"],
      hrAdvice: "建议验证。"
    });

    expect(result.success).toBe(false);
  });
});
