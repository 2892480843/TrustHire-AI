import cors from "cors";
import express from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { config } from "./config.js";
import { errorHandler } from "./errors.js";
import { createAgentRouter } from "./features/agent/agentRoutes.js";
import { createAnalysisRouter } from "./features/analysis/analysisRoutes.js";
import { DeepSeekAnalysisClient, type AnalysisAiClient } from "./features/analysis/analysisService.js";

export function createApp(options: { aiClient?: AnalysisAiClient } = {}) {
  const app = express();
  const aiClient: AnalysisAiClient = options.aiClient ?? new DeepSeekAnalysisClient();

  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json({ limit: "1mb" }));
  app.use(
    pinoHttp({
      redact: ["req.headers.authorization", "req.body.jdText", "req.body.resumeText"]
    })
  );

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api", createAnalysisRouter(aiClient));
  app.use("/api/agent", createAgentRouter(aiClient));
  app.use(errorHandler);

  return app;
}
