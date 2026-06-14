import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
  }
}

export class ValidationAppError extends AppError {
  constructor(message = "请求参数不合法。") {
    super("VALIDATION_ERROR", message, 400);
  }
}

export class UnsupportedFileTypeError extends AppError {
  constructor() {
    super("UNSUPPORTED_FILE_TYPE", "仅支持 PDF / DOCX / TXT 简历文件。", 415);
  }
}

export class AiProviderError extends AppError {
  constructor(message = "AI 服务调用失败，请稍后重试。") {
    super("AI_PROVIDER_ERROR", message, 502);
  }
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "请求参数不合法。",
        details: err.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }))
      }
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message
      }
    });
  }

  return res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "服务器处理失败，请稍后重试。"
    }
  });
}
