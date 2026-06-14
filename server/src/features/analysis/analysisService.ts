import { DeepSeekJsonClient } from "../../ai/deepseekClient.js";
import { examples, schemaPrompt } from "../../ai/prompts.js";
import {
  evidenceAnalysisSchema,
  interviewTasksSchema,
  jobAnalysisSchema,
  matchReportSchema,
  matchScoreSchema,
  resumeAnalysisSchema,
  type EvidenceAnalysis,
  type InterviewTasks,
  type JobAnalysis,
  type MatchReport,
  type MatchScore,
  type ResumeAnalysis
} from "../../schemas/analysisSchemas.js";

export interface AnalysisAiClient {
  analyzeJob(jdText: string): Promise<JobAnalysis>;
  analyzeResume(resumeText: string, filename: string): Promise<ResumeAnalysis>;
  analyzeEvidence(jobAnalysis: JobAnalysis, resumeAnalysis: ResumeAnalysis): Promise<EvidenceAnalysis>;
  scoreMatch(jobAnalysis: JobAnalysis, resumeAnalysis: ResumeAnalysis, evidenceAnalysis: EvidenceAnalysis): Promise<MatchScore>;
  generateInterviewTasks(input: {
    jobAnalysis: JobAnalysis;
    resumeAnalysis: ResumeAnalysis;
    evidenceAnalysis: EvidenceAnalysis;
    matchScore: MatchScore;
  }): Promise<InterviewTasks>;
  generateReport(input: {
    jobAnalysis: JobAnalysis;
    resumeAnalysis: ResumeAnalysis;
    evidenceAnalysis: EvidenceAnalysis;
    matchScore: MatchScore;
    interviewTasks: InterviewTasks;
  }): Promise<MatchReport>;
}

export class DeepSeekAnalysisClient implements AnalysisAiClient {
  private readonly jsonClient = new DeepSeekJsonClient();

  analyzeJob(jdText: string) {
    return this.jsonClient.completeJson({
      schema: jobAnalysisSchema,
      system: schemaPrompt("JobAnalysis", examples.jobAnalysis),
      user: `Analyze this job description and produce a weighted ability model. The ability weights must sum to 100.\n\n${jdText}`
    });
  }

  analyzeResume(resumeText: string, filename: string) {
    return this.jsonClient.completeJson({
      schema: resumeAnalysisSchema,
      system: schemaPrompt("ResumeAnalysis", examples.resumeAnalysis),
      user: `Parse this resume text from file "${filename}". Extract facts only. Mark uncertain or missing evidence as risks.\n\n${resumeText.slice(0, 20_000)}`
    });
  }

  analyzeEvidence(jobAnalysis: JobAnalysis, resumeAnalysis: ResumeAnalysis) {
    return this.jsonClient.completeJson({
      schema: evidenceAnalysisSchema,
      system: schemaPrompt("EvidenceAnalysis", {
        mappings: [{ ability: "Spring Boot", evidence: "项目中负责后端接口", strength: "强证据", source: "项目经历", judgement: "能支撑岗位要求" }],
        risks: ["Redis 仅在技能栏出现"],
        followUpQuestions: ["请说明 Redis 在项目中的具体使用场景。"]
      }),
      user: JSON.stringify({ jobAnalysis, resumeAnalysis })
    });
  }

  scoreMatch(jobAnalysis: JobAnalysis, resumeAnalysis: ResumeAnalysis, evidenceAnalysis: EvidenceAnalysis) {
    return this.jsonClient.completeJson({
      schema: matchScoreSchema,
      system: schemaPrompt("MatchScore", {
        totalScore: 82,
        recommendationLevel: "建议进入一面",
        summary: "整体匹配度较高。",
        dimensions: [{ key: "skill", label: "技能匹配", value: 86, benchmark: 70 }],
        advantages: ["Java 基础扎实"],
        weaknesses: ["Redis 项目证据不足"],
        hrAdvice: "建议验证接口设计能力。"
      }),
      user: JSON.stringify({ jobAnalysis, resumeAnalysis, evidenceAnalysis })
    });
  }

  generateInterviewTasks(input: {
    jobAnalysis: JobAnalysis;
    resumeAnalysis: ResumeAnalysis;
    evidenceAnalysis: EvidenceAnalysis;
    matchScore: MatchScore;
  }) {
    return this.jsonClient.completeJson({
      schema: interviewTasksSchema,
      system: schemaPrompt("InterviewTasks", {
        tasks: [
          {
            id: 1,
            category: "技术追问",
            question: "请说明订单接口的主要字段、业务流程和异常处理。",
            focus: "接口设计",
            difficulty: "中等",
            duration: "8-10 分钟",
            tags: ["RESTful", "异常处理"],
            basis: "岗位要求接口开发，简历有相关项目。"
          },
          {
            id: 2,
            category: "项目验证",
            question: "请介绍一个 Spring Boot 项目的分层设计。",
            focus: "项目真实性",
            difficulty: "中等",
            duration: "8-10 分钟",
            tags: ["Spring Boot"],
            basis: "验证后端框架能力。"
          },
          {
            id: 3,
            category: "实操任务",
            question: "设计一个商品发布接口。",
            focus: "建模能力",
            difficulty: "较高",
            duration: "15-20 分钟",
            tags: ["接口建模"],
            basis: "验证工程能力。"
          },
          {
            id: 4,
            category: "风险追问",
            question: "请说明 Redis 的实际使用场景。",
            focus: "风险验证",
            difficulty: "中等",
            duration: "6-8 分钟",
            tags: ["Redis"],
            basis: "技能证据不足。"
          }
        ]
      }),
      user: JSON.stringify(input),
      maxTokens: 2600
    });
  }

  generateReport(input: {
    jobAnalysis: JobAnalysis;
    resumeAnalysis: ResumeAnalysis;
    evidenceAnalysis: EvidenceAnalysis;
    matchScore: MatchScore;
    interviewTasks: InterviewTasks;
  }) {
    return this.jsonClient.completeJson({
      schema: matchReportSchema,
      system: schemaPrompt("MatchReport", {
        candidateName: "张同学",
        jobTitle: "Java 后端实习生",
        totalScore: 82,
        recommendationLevel: "建议进入一面",
        strengths: ["Java 基础扎实"],
        risks: ["Redis 证据不足"],
        gaps: ["缓存实践"],
        interviewAdvice: ["追问 Redis 使用场景"],
        finalAdvice: "建议进入一面"
      }),
      user: JSON.stringify(input)
    });
  }
}
