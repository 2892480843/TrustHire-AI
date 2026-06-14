import OpenAI from "openai";
import { ZodSchema } from "zod";
import { config } from "../config.js";
import { AiProviderError } from "../errors.js";

export class DeepSeekJsonClient {
  private readonly client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: config.openaiApiKey || "missing-api-key",
      baseURL: config.openaiBaseUrl,
      timeout: config.openaiTimeoutMs
    });
  }

  async completeJson<T>(params: { system: string; user: string; schema: ZodSchema<T>; maxTokens?: number }): Promise<T> {
    if (!config.openaiApiKey) {
      throw new AiProviderError("未配置 OPENAI_API_KEY，无法调用 DeepSeek AI 服务。");
    }

    try {
      const response = await this.client.chat.completions.create({
        model: config.openaiModel,
        messages: [
          { role: "system", content: params.system },
          { role: "user", content: params.user }
        ],
        response_format: { type: "json_object" },
        max_tokens: params.maxTokens ?? 2200,
        stream: false
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new AiProviderError("AI 服务返回空内容，请重试。");
      }

      return params.schema.parse(JSON.parse(content));
    } catch (error) {
      if (error instanceof AiProviderError) throw error;
      throw new AiProviderError();
    }
  }
}
