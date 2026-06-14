import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { config } from "../../config.js";
import { ValidationAppError } from "../../errors.js";
import type { AnalysisAiClient } from "../analysis/analysisService.js";
import { assertResumeText, extractResumeText } from "../resume/resumeParser.js";
import { AgentRunner } from "./agentService.js";
import { AgentJobStore } from "./agentStore.js";

const createJobSchema = z.object({
  jdText: z.string().trim().min(20, "JD 内容至少需要 20 个字符。")
});

export function createAgentRouter(aiClient: AnalysisAiClient, store = new AgentJobStore()) {
  const router = Router();
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: config.maxUploadBytes, files: 1 }
  });
  const runner = new AgentRunner(aiClient, store);

  router.post("/jobs", upload.single("file"), async (req, res, next) => {
    try {
      const input = createJobSchema.parse({ jdText: req.body.jdText });
      if (!req.file) {
        throw new ValidationAppError("请上传一份简历文件。");
      }

      const resumeText = await extractResumeText(req.file);
      assertResumeText(resumeText);

      const job = runner.start({
        jdText: input.jdText,
        resumeText,
        filename: req.file.originalname
      });

      res.status(202).json({
        jobId: job.id,
        status: job.status,
        currentStage: job.currentStage,
        stages: job.stages,
        results: job.results,
        error: job.error,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt
      });
    } catch (error) {
      next(error);
    }
  });

  router.get("/jobs/:id", (req, res, next) => {
    try {
      res.json(runner.get(req.params.id));
    } catch (error) {
      next(error);
    }
  });

  return router;
}
