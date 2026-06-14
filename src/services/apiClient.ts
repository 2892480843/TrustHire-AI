const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code = "API_ERROR"
  ) {
    super(message);
  }
}

async function parseError(response: Response) {
  const body = await response.json().catch(() => null);
  return {
    code: body?.error?.code ?? "API_ERROR",
    message: body?.error?.message ?? `请求失败，状态码 ${response.status}`
  };
}

export async function postJson<T>(path: string, data: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await parseError(response);
    throw new ApiError(response.status, error.message, error.code);
  }

  return response.json() as Promise<T>;
}

export async function postForm<T>(path: string, formData: FormData): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    const error = await parseError(response);
    throw new ApiError(response.status, error.message, error.code);
  }

  return response.json() as Promise<T>;
}

export async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET"
  });

  if (!response.ok) {
    const error = await parseError(response);
    throw new ApiError(response.status, error.message, error.code);
  }

  return response.json() as Promise<T>;
}

function isAbortError(error: unknown) {
  return typeof error === "object" && error !== null && "name" in error && error.name === "AbortError";
}

export function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  if (isAbortError(error)) return "AI 服务响应超时，请稍后重试，或先使用样例数据完成演示。";
  if (error instanceof TypeError) return "无法连接后端服务，请确认 server 已启动。";
  if (error instanceof Error) return error.message;
  return "操作失败，请稍后重试。";
}
