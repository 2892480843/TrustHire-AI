import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { config } from "../../config.js";
import { AiProviderError, AppError, ValidationAppError } from "../../errors.js";
import { assertResumeText, extractResumeText } from "../resume/resumeParser.js";
import type { AnalysisAiClient } from "./analysisService.js";

const bodySchemas = {
  analyzeJob: z.object({ jdText: z.string().trim().min(20, "JD 内容至少需要 20 个字符。") }),
  evidence: z.object({ jobAnalysis: z.unknown(), resumeAnalysis: z.unknown() }),
  score: z.object({ jobAnalysis: z.unknown(), resumeAnalysis: z.unknown(), evidenceAnalysis: z.unknown() }),
  interview: z.object({ jobAnalysis: z.unknown(), resumeAnalysis: z.unknown(), evidenceAnalysis: z.unknown(), matchScore: z.unknown() }),
  report: z.object({
    jobAnalysis: z.unknown(),
    resumeAnalysis: z.unknown(),
    evidenceAnalysis: z.unknown(),
    matchScore: z.unknown(),
    interviewTasks: z.unknown()
  })
};

export function createAnalysisRouter(aiClient: AnalysisAiClient) {
  const router = Router();
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: config.maxUploadBytes, files: 1 }
  });

  async function callAi<T>(operation: () => Promise<T>) {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AiProviderError();
    }
  }

  router.post("/analyze-job", async (req, res, next) => {
    try {
      const input = bodySchemas.analyzeJob.parse(req.body);
      res.json(await callAi(() => aiClient.analyzeJob(input.jdText)));
    } catch (error) {
      next(error);
    }
  });

  router.post("/analyze-resume", upload.single("file"), async (req, res, next) => {
    try {
      if (!req.file) {
        throw new ValidationAppError("请上传一个简历文件。");
      }
      const file = req.file;
      const text = await extractResumeText(file);
      assertResumeText(text);
      res.json(await callAi(() => aiClient.analyzeResume(text, file.originalname)));
    } catch (error) {
      next(error);
    }
  });

  router.post("/evidence-analysis", async (req, res, next) => {
    try {
      const input = bodySchemas.evidence.parse(req.body);
      res.json(await callAi(() => aiClient.analyzeEvidence(input.jobAnalysis as never, input.resumeAnalysis as never)));
    } catch (error) {
      next(error);
    }
  });

  router.post("/match-score", async (req, res, next) => {
    try {
      const input = bodySchemas.score.parse(req.body);
      res.json(await callAi(() => aiClient.scoreMatch(input.jobAnalysis as never, input.resumeAnalysis as never, input.evidenceAnalysis as never)));
    } catch (error) {
      next(error);
    }
  });

  router.post("/interview-tasks", async (req, res, next) => {
    try {
      const input = bodySchemas.interview.parse(req.body);
      res.json(
        await callAi(() => aiClient.generateInterviewTasks({
          jobAnalysis: input.jobAnalysis as never,
          resumeAnalysis: input.resumeAnalysis as never,
          evidenceAnalysis: input.evidenceAnalysis as never,
          matchScore: input.matchScore as never
        }))
      );
    } catch (error) {
      next(error);
    }
  });

  router.post("/match-report", async (req, res, next) => {
    try {
      const input = bodySchemas.report.parse(req.body);
      res.json(
        await callAi(() => aiClient.generateReport({
          jobAnalysis: input.jobAnalysis as never,
          resumeAnalysis: input.resumeAnalysis as never,
          evidenceAnalysis: input.evidenceAnalysis as never,
          matchScore: input.matchScore as never,
          interviewTasks: input.interviewTasks as never
        }))
      );
    } catch (error) {
      next(error);
    }
  });

  return router;
}
