import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);
const score = z.number().min(0).max(100);

export const jobAbilitySchema = z.object({
  category: nonEmptyString,
  name: nonEmptyString,
  description: nonEmptyString,
  weight: z.number().min(0).max(100)
});

export const jobAnalysisSchema = z.object({
  jobTitle: nonEmptyString,
  summary: nonEmptyString,
  abilities: z.array(jobAbilitySchema).min(1),
  portrait: z.array(nonEmptyString).min(1),
  screeningAdvice: z.array(nonEmptyString).min(1)
});

export const resumeAnalysisSchema = z.object({
  candidate: z.object({
    name: nonEmptyString,
    school: z.string(),
    major: z.string(),
    education: z.string(),
    targetJob: z.string(),
    city: z.string(),
    expectedArrival: z.string()
  }),
  skills: z.array(nonEmptyString),
  education: z
    .array(
      z.object({
        school: z.string(),
        major: z.string(),
        degree: z.string(),
        period: z.string()
      })
    ),
  projects: z
    .array(
      z.object({
        name: nonEmptyString,
        role: z.string(),
        period: z.string(),
        description: z.string(),
        technologies: z.array(z.string())
      })
    ),
  internships: z.array(z.string()),
  certificates: z.array(z.string()),
  risks: z.array(z.string()),
  summary: nonEmptyString,
  rawTextPreview: z.string()
});

export const evidenceAnalysisSchema = z.object({
  mappings: z
    .array(
      z.object({
        ability: nonEmptyString,
        evidence: nonEmptyString,
        strength: nonEmptyString,
        source: nonEmptyString,
        judgement: nonEmptyString
      })
    )
    .min(1),
  risks: z.array(z.string()),
  followUpQuestions: z.array(z.string())
});

export const matchScoreSchema = z.object({
  totalScore: score,
  recommendationLevel: nonEmptyString,
  summary: nonEmptyString,
  dimensions: z
    .array(
      z.object({
        key: nonEmptyString,
        label: nonEmptyString,
        value: score,
        benchmark: score
      })
    )
    .min(1),
  advantages: z.array(nonEmptyString).min(1),
  weaknesses: z.array(nonEmptyString),
  hrAdvice: nonEmptyString
});

export const interviewTasksSchema = z.object({
  tasks: z
    .array(
      z.object({
        id: z.number().int().positive(),
        category: nonEmptyString,
        question: nonEmptyString,
        focus: nonEmptyString,
        difficulty: nonEmptyString,
        duration: nonEmptyString,
        tags: z.array(nonEmptyString),
        basis: z.string()
      })
    )
    .min(4)
    .max(6)
});

export const matchReportSchema = z.object({
  candidateName: nonEmptyString,
  jobTitle: nonEmptyString,
  totalScore: score,
  recommendationLevel: nonEmptyString,
  strengths: z.array(nonEmptyString),
  risks: z.array(nonEmptyString),
  gaps: z.array(nonEmptyString),
  interviewAdvice: z.array(nonEmptyString),
  finalAdvice: nonEmptyString
});

export type JobAnalysis = z.infer<typeof jobAnalysisSchema>;
export type ResumeAnalysis = z.infer<typeof resumeAnalysisSchema>;
export type EvidenceAnalysis = z.infer<typeof evidenceAnalysisSchema>;
export type MatchScore = z.infer<typeof matchScoreSchema>;
export type InterviewTasks = z.infer<typeof interviewTasksSchema>;
export type MatchReport = z.infer<typeof matchReportSchema>;
