import mammoth from "mammoth";
import pdf from "pdf-parse";
import { UnsupportedFileTypeError, ValidationAppError } from "../../errors.js";

const txtTypes = new Set(["text/plain", "application/octet-stream"]);
const docxTypes = new Set(["application/vnd.openxmlformats-officedocument.wordprocessingml.document"]);
const pdfTypes = new Set(["application/pdf"]);

function ext(filename: string) {
  return filename.toLowerCase().split(".").pop() ?? "";
}

export function ensureSupportedResumeFile(file: Express.Multer.File) {
  const extension = ext(file.originalname);
  const ok =
    (extension === "txt" && txtTypes.has(file.mimetype)) ||
    (extension === "docx" && docxTypes.has(file.mimetype)) ||
    (extension === "pdf" && pdfTypes.has(file.mimetype));

  if (!ok) {
    throw new UnsupportedFileTypeError();
  }
}

export async function extractResumeText(file: Express.Multer.File) {
  ensureSupportedResumeFile(file);
  const extension = ext(file.originalname);

  if (extension === "txt") {
    return file.buffer.toString("utf8");
  }

  if (extension === "docx") {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value;
  }

  if (extension === "pdf") {
    const result = await pdf(file.buffer);
    return result.text;
  }

  throw new UnsupportedFileTypeError();
}

export function assertResumeText(text: string) {
  if (!text.trim()) {
    throw new ValidationAppError("简历文件未解析出可用文本；扫描版 PDF/OCR 暂不支持。");
  }
}
