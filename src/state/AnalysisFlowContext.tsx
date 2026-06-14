import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type {
  AnalysisFlowState,
  EvidenceAnalysisResult,
  InterviewTasksResult,
  JobAnalysisResult,
  MatchReport,
  MatchScoreResult,
  ResumeAnalysisResult
} from "../types";

const STORAGE_KEY = "trusthire.analysisFlow.v1";

const initialState: AnalysisFlowState = {
  jobAnalysis: null,
  resumeAnalysis: null,
  evidenceAnalysis: null,
  matchScore: null,
  interviewTasks: null,
  matchReport: null,
  interviewNotes: ""
};

interface AnalysisFlowContextValue extends AnalysisFlowState {
  setJobAnalysis: (value: JobAnalysisResult | null) => void;
  setResumeAnalysis: (value: ResumeAnalysisResult | null) => void;
  setEvidenceAnalysis: (value: EvidenceAnalysisResult | null) => void;
  setMatchScore: (value: MatchScoreResult | null) => void;
  setInterviewTasks: (value: InterviewTasksResult | null) => void;
  setMatchReport: (value: MatchReport | null) => void;
  setInterviewNotes: (value: string) => void;
  setFullFlow: (value: AnalysisFlowState) => void;
  loadSampleFlow: () => void;
  resetFlow: () => void;
}

const AnalysisFlowContext = createContext<AnalysisFlowContextValue | null>(null);

function readStoredState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    return { ...initialState, ...JSON.parse(raw) } as AnalysisFlowState;
  } catch {
    return initialState;
  }
}

export function AnalysisFlowProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AnalysisFlowState>(() => readStoredState());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo<AnalysisFlowContextValue>(
    () => ({
      ...state,
      setJobAnalysis: (jobAnalysis) =>
        setState((current) => ({
          ...current,
          jobAnalysis,
          evidenceAnalysis: null,
          matchScore: null,
          interviewTasks: null,
          matchReport: null
        })),
      setResumeAnalysis: (resumeAnalysis) =>
        setState((current) => ({
          ...current,
          resumeAnalysis,
          evidenceAnalysis: null,
          matchScore: null,
          interviewTasks: null,
          matchReport: null
        })),
      setEvidenceAnalysis: (evidenceAnalysis) =>
        setState((current) => ({ ...current, evidenceAnalysis, matchScore: null, interviewTasks: null, matchReport: null })),
      setMatchScore: (matchScore) => setState((current) => ({ ...current, matchScore, interviewTasks: null, matchReport: null })),
      setInterviewTasks: (interviewTasks) => setState((current) => ({ ...current, interviewTasks, matchReport: null })),
      setMatchReport: (matchReport) => setState((current) => ({ ...current, matchReport })),
      setInterviewNotes: (interviewNotes) => setState((current) => ({ ...current, interviewNotes })),
      setFullFlow: (nextState) => setState({ ...initialState, ...nextState }),
      loadSampleFlow: () =>
        setState({
          jobAnalysis: {
            jobTitle: "Java 后端实习生",
            summary: "参与后端接口开发、数据库设计与系统优化。",
            abilities: [
              { category: "编程基础", name: "Java 基础", description: "语法、集合、多线程", weight: 20, color: "#059669" },
              { category: "后端框架", name: "Spring Boot", description: "分层开发与常用组件", weight: 25, color: "#0f766e" },
              { category: "数据库", name: "MySQL", description: "SQL 与表设计", weight: 20, color: "#10b981" },
              { category: "工程能力", name: "接口开发", description: "RESTful 与测试", weight: 20, color: "#f97316" },
              { category: "项目经验", name: "后端项目经验", description: "问题定位与交付", weight: 15, color: "#0d9488" }
            ],
            portrait: ["工程实践导向", "具备后端基础和学习能力"],
            screeningAdvice: ["优先关注 Spring Boot 项目经验", "面试验证数据库设计能力"]
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
            skills: ["Java", "Spring Boot", "MySQL", "Redis", "Git"],
            education: [{ school: "某某大学", major: "软件工程", degree: "本科", period: "2021.09 - 2025.06" }],
            projects: [
              {
                name: "校园二手交易平台",
                role: "后端开发",
                period: "2024.03 - 2024.06",
                description: "负责登录、商品发布和订单接口开发。",
                technologies: ["Spring Boot", "MySQL", "Redis"]
              }
            ],
            internships: ["某某科技有限公司后端开发实习生"],
            certificates: ["CET-4", "计算机二级 Java"],
            risks: ["Redis 仅有较少项目细节", "部署经验描述不足"],
            summary: "候选人具备 Java 后端基础和课程/项目经历。",
            rawTextPreview: "张同学 软件工程 Java Spring Boot MySQL"
          },
          evidenceAnalysis: {
            mappings: [
              {
                ability: "Java 基础",
                evidence: "计算机二级 Java，校园二手交易平台后端接口开发",
                strength: "强证据",
                source: "证书 / 项目",
                judgement: "能支撑 Java 基础与接口开发要求"
              },
              {
                ability: "Spring Boot",
                evidence: "校园二手交易平台使用 Spring Boot 完成登录、商品发布和订单接口",
                strength: "强证据",
                source: "项目经历",
                judgement: "与岗位后端框架要求高度相关"
              },
              {
                ability: "MySQL",
                evidence: "项目涉及商品、订单等基础表设计",
                strength: "中证据",
                source: "项目经历",
                judgement: "能支撑基础 SQL 与表设计，但需要面试追问索引和事务"
              },
              {
                ability: "Redis",
                evidence: "简历仅列出 Redis 技能，项目细节较少",
                strength: "弱证据",
                source: "技能标签",
                judgement: "需要通过面试验证真实使用场景"
              }
            ],
            risks: ["Redis 只有技能标签，缺少缓存设计细节", "部署和线上问题定位经验描述不足"],
            followUpQuestions: ["请说明订单接口中事务边界如何设计。", "Redis 在项目中具体缓存了什么数据，如何处理一致性？"]
          },
          matchScore: {
            totalScore: 82,
            recommendationLevel: "建议进入一面",
            summary: "候选人与 Java 后端实习生岗位整体匹配度较高，项目经历能支撑基础后端开发要求。",
            dimensions: [
              { key: "java", label: "Java 基础", value: 86, benchmark: 70 },
              { key: "framework", label: "Spring Boot", value: 84, benchmark: 70 },
              { key: "database", label: "MySQL", value: 78, benchmark: 68 },
              { key: "project", label: "项目相关性", value: 80, benchmark: 65 },
              { key: "risk", label: "风险可控性", value: 74, benchmark: 65 }
            ],
            advantages: ["Java 与 Spring Boot 项目证据较明确", "目标岗位与项目经历方向一致"],
            weaknesses: ["Redis 和部署经验证据偏弱", "线上问题定位经历需要进一步验证"],
            hrAdvice: "建议进入一面，重点追问接口设计、数据库事务、Redis 使用细节和项目真实性。"
          },
          interviewTasks: {
            tasks: [
              {
                id: 1,
                category: "技术追问",
                question: "请说明校园二手交易平台中登录接口的鉴权流程，以及如何处理异常返回。",
                focus: "接口设计与 Java 后端基础",
                difficulty: "中等",
                duration: "8 分钟",
                tags: ["Java", "接口设计"],
                basis: "岗位要求 RESTful 接口开发，简历中有登录接口经历"
              },
              {
                id: 2,
                category: "项目核验",
                question: "商品发布到订单创建的核心表结构是什么？订单状态流转如何设计？",
                focus: "项目真实性与数据库设计",
                difficulty: "中等",
                duration: "8 分钟",
                tags: ["MySQL", "项目经历"],
                basis: "简历提到商品发布和订单接口，但数据库细节不足"
              },
              {
                id: 3,
                category: "实操任务",
                question: "现场设计一个创建订单 API，说明请求参数、幂等处理和事务边界。",
                focus: "后端建模与工程实现",
                difficulty: "较高",
                duration: "15 分钟",
                tags: ["Spring Boot", "事务"],
                basis: "岗位要求接口开发和系统稳定性"
              },
              {
                id: 4,
                category: "风险追问",
                question: "你在项目里如何使用 Redis？如果缓存和数据库不一致，你会如何处理？",
                focus: "弱证据能力验证",
                difficulty: "中等",
                duration: "6 分钟",
                tags: ["Redis", "风险验证"],
                basis: "Redis 只有技能标签，缺少项目细节"
              }
            ]
          },
          matchReport: {
            candidateName: "张同学",
            jobTitle: "Java 后端实习生",
            totalScore: 82,
            recommendationLevel: "建议进入一面",
            strengths: ["Java 与 Spring Boot 项目证据较明确", "项目方向与岗位职责匹配", "具备基础数据库设计经历"],
            risks: ["Redis 使用细节不足", "部署和线上问题定位经验需要核验"],
            gaps: ["缓存一致性实践", "复杂 SQL 优化经验", "生产环境排障经验"],
            interviewAdvice: ["优先验证项目真实性", "追问订单 API 的事务边界", "通过 Redis 场景题确认技能深度"],
            finalAdvice: "建议进入一面，面试重点放在接口设计、数据库事务和 Redis 真实使用经验。"
          },
          interviewNotes: ""
        }),
      resetFlow: () => setState(initialState)
    }),
    [state]
  );

  return <AnalysisFlowContext.Provider value={value}>{children}</AnalysisFlowContext.Provider>;
}

export function useAnalysisFlow() {
  const value = useContext(AnalysisFlowContext);
  if (!value) {
    throw new Error("useAnalysisFlow must be used inside AnalysisFlowProvider");
  }
  return value;
}
