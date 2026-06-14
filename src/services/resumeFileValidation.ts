const supportedResumeExtensions = new Set(["txt", "docx", "pdf"]);
const supportedResumeTypes = new Set([
  "text/plain",
  "application/octet-stream",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);

export function validateResumeFile(file: File): string | null {
  const extension = file.name.toLowerCase().split(".").pop() ?? "";
  const hasSupportedExtension = supportedResumeExtensions.has(extension);
  const hasSupportedType = !file.type || supportedResumeTypes.has(file.type);

  if (!hasSupportedExtension || !hasSupportedType) {
    return "仅支持 PDF / DOCX / TXT 简历文件。";
  }

  if (file.size === 0) {
    return "简历文件为空，请上传包含文本内容的 PDF / DOCX / TXT 简历。";
  }

  return null;
}

function readFileText(file: File): Promise<string> {
  if (typeof file.text === "function") {
    return file.text();
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("无法读取简历文本。"));
    reader.readAsText(file);
  });
}

export async function validateReadableTextResume(file: File): Promise<string | null> {
  const basicError = validateResumeFile(file);
  if (basicError) return basicError;

  if (file.name.toLowerCase().endsWith(".txt")) {
    const text = await readFileText(file);
    if (!text.trim()) {
      return "简历文件为空，请上传包含文本内容的 PDF / DOCX / TXT 简历。";
    }
  }

  return null;
}
