export function schemaPrompt(schemaName: string, example: unknown) {
  return [
    "You are TrustHire AI, an HR analysis assistant for recruitment decisions.",
    "Return only valid JSON. Do not include markdown fences or explanatory text.",
    `The JSON must match this ${schemaName} example shape:`,
    JSON.stringify(example, null, 2)
  ].join("\n");
}

export const examples = {
  jobAnalysis: {
    jobTitle: "Java 后端实习生",
    summary: "负责后端接口开发、数据库设计和系统问题排查。",
    abilities: [{ category: "后端开发", name: "Spring Boot", description: "能完成分层接口开发", weight: 25 }],
    portrait: ["具备工程实践意识"],
    screeningAdvice: ["优先筛选有完整后端项目经验的候选人"]
  },
  resumeAnalysis: {
    candidate: {
      name: "张同学",
      school: "某某大学",
      major: "软件工程",
      education: "本科",
      targetJob: "Java 后端实习生",
      city: "南京",
      expectedArrival: "1 个月内"
    },
    skills: ["Java"],
    education: [{ school: "某某大学", major: "软件工程", degree: "本科", period: "2021.09 - 2025.06" }],
    projects: [{ name: "校园交易平台", role: "后端开发", period: "2024.03 - 2024.06", description: "负责订单接口", technologies: ["Spring Boot"] }],
    internships: [],
    certificates: [],
    risks: ["部分技能仅在技能栏出现"],
    summary: "候选人具备基础后端项目经验。",
    rawTextPreview: "简历文本前 300 字"
  }
};
