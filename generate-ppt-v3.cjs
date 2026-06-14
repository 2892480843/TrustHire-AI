"use strict";
const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10" × 5.625"

// ══════════════════════════════════════════
//  设计系统：电紫蓝单色调 + 深空底色
// ══════════════════════════════════════════
const C = {
  bg:    "060914",  // 极暗深蓝底
  s1:    "0D1220",  // 卡片表面
  s2:    "111829",  // 悬浮卡片
  line:  "1C2940",  // 边框/分隔
  dim:   "141D2E",  // 极暗分隔

  text:  "EEF2FF",  // 主文字（暖白）
  sub:   "8B9DC0",  // 次级文字
  muted: "445478",  // 弱化文字

  // 主色：电紫蓝（全程只用这一个系列）
  ac:    "6366F1",  // indigo-500
  acL:   "A5B4FC",  // indigo-300（大字高亮）
  acD:   "3730A3",  // indigo-800（深底渐变）
  acGlow:"4338CA",  // 光晕色

  // 状态色：翡翠绿（仅"已验证/通过"场景）
  ok:    "10B981",  // emerald-500
  okL:   "34D399",  // emerald-400

  white: "FFFFFF",
};

// ══════════════════════════════════════════
//  加载截图
// ══════════════════════════════════════════
const SS_DIR = path.join(__dirname, "demo-screenshots");
function loadImg(name) {
  const p = path.join(SS_DIR, name);
  if (!fs.existsSync(p)) return null;
  return "image/png;base64," + fs.readFileSync(p).toString("base64");
}
const I = {
  dash: loadImg("01-dashboard.png"),
  jd:   loadImg("02-jd-parse.png"),
  res:  loadImg("03-resume.png"),
  evi:  loadImg("04-evidence.png"),
  scr:  loadImg("05-score.png"),
  itv:  loadImg("06-interview.png"),
  rep:  loadImg("07-report.png"),
};

// ══════════════════════════════════════════
//  布局工具函数
// ══════════════════════════════════════════

// 背景底色 + 氛围光晕（每张幻灯片调用）
function bg(s, gx = 7.4, gy = -1.2) {
  s.background = { color: C.bg };
  s.addShape(pres.shapes.OVAL, {
    x: gx, y: gy, w: 5.5, h: 5.5,
    fill: { color: C.acGlow, transparency: 92 },
    line: { color: "none" }
  });
  s.addShape(pres.shapes.OVAL, {
    x: -2.2, y: 3.8, w: 4.5, h: 4.5,
    fill: { color: C.acD, transparency: 96 },
    line: { color: "none" }
  });
}

// 章节标签（左上角小字）
function lbl(s, en, zh) {
  s.addText(`${en}  ·  ${zh}`, {
    x: 0.5, y: 0.2, w: 6, h: 0.2,
    fontSize: 8, color: C.muted, fontFace: "Segoe UI", charSpacing: 2.5
  });
}

// 主标题
function ttl(s, text, y = 0.48, sz = 33) {
  s.addText(text, {
    x: 0.5, y, w: 9, h: 0.72,
    fontSize: sz, color: C.text, fontFace: "Segoe UI",
    bold: true, valign: "middle"
  });
}

// 副标题
function stl(s, text, y = 1.32) {
  s.addText(text, {
    x: 0.5, y, w: 8.5, h: 0.25,
    fontSize: 11.5, color: C.sub, fontFace: "Segoe UI"
  });
}

// 基础卡片
function crd(s, x, y, w, h) {
  s.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h,
    fill: { color: C.s1 },
    line: { color: C.line, width: 0.6 },
    shadow: { type: "outer", color: "000000", blur: 12, offset: 3, angle: 90, opacity: 0.2 }
  });
}

// 带左色条卡片（替代彩虹边框）
function acrd(s, x, y, w, h, col = C.ac) {
  crd(s, x, y, w, h);
  s.addShape(pres.shapes.RECTANGLE, {
    x, y: y + 0.1, w: 0.04, h: h - 0.2,
    fill: { color: col }, line: { color: "none" }
  });
}

// 极简浏览器框架
function frm(s, img, x, y, w, h) {
  const bh = 0.22;
  s.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h: h + bh,
    fill: { color: "06090F" },
    line: { color: C.line, width: 0.75 },
    shadow: { type: "outer", color: "000000", blur: 24, offset: 6, angle: 90, opacity: 0.45 }
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h: bh, fill: { color: "040710" }, line: { color: "none" }
  });
  [0.08, 0.19, 0.30].forEach(ox =>
    s.addShape(pres.shapes.OVAL, {
      x: x + ox, y: y + 0.07, w: 0.08, h: 0.08,
      fill: { color: C.line }, line: { color: "none" }
    })
  );
  s.addShape(pres.shapes.RECTANGLE, {
    x: x + 0.44, y: y + 0.045, w: w - 0.54, h: 0.13,
    fill: { color: "0B1020" }, line: { color: C.line, width: 0.4 }
  });
  s.addText("localhost:5173", {
    x: x + 0.46, y: y + 0.05, w: w - 0.58, h: 0.11,
    fontSize: 6.5, color: C.muted, fontFace: "Segoe UI", align: "left", margin: 0
  });
  if (img) s.addImage({ data: img, x, y: y + bh, w, h });
}

// 页脚
function foot(s) {
  s.addShape(pres.shapes.LINE, {
    x: 0.5, y: 5.37, w: 9, h: 0,
    line: { color: C.line, width: 0.4 }
  });
  s.addText("证聘 AI  ·  TrustHire AI  ·  AI + 人才服务赛道", {
    x: 0.5, y: 5.41, w: 9, h: 0.15,
    fontSize: 7, color: C.muted, fontFace: "Segoe UI", align: "center"
  });
}

// ══════════════════════════════════════════
//  Slide 01 · 封面
// ══════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, 6.0, -1.8);

  // 品牌标签
  s.addText("TRUSTHIRE AI", {
    x: 0.5, y: 0.28, w: 4, h: 0.2,
    fontSize: 9, color: C.muted, fontFace: "Segoe UI", charSpacing: 4
  });

  // 主标题：大字、强对比
  s.addText("证聘 AI", {
    x: 0.45, y: 0.6, w: 5.4, h: 0.95,
    fontSize: 62, color: C.text, fontFace: "Segoe UI", bold: true, valign: "middle"
  });

  // 靛蓝强调线
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.6, w: 2.6, h: 0.035,
    fill: { color: C.ac }, line: { color: "none" }
  });

  s.addText("让招聘从关键词匹配走向证据驱动", {
    x: 0.5, y: 1.76, w: 5.2, h: 0.34,
    fontSize: 16.5, color: C.sub, fontFace: "Segoe UI"
  });
  s.addText("面向高校毕业生与企业校招场景的可信招聘智能体", {
    x: 0.5, y: 2.18, w: 5.2, h: 0.25,
    fontSize: 11.5, color: C.muted, fontFace: "Segoe UI"
  });

  // 赛道徽章
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 2.6, w: 1.78, h: 0.27, rectRadius: 0.06,
    fill: { color: C.ac, transparency: 80 },
    line: { color: C.ac, width: 0.6 }
  });
  s.addText("AI + 人才服务赛道", {
    x: 0.5, y: 2.6, w: 1.78, h: 0.27,
    fontSize: 9.5, color: C.acL, fontFace: "Segoe UI",
    bold: true, align: "center", valign: "middle"
  });

  // 右侧产品截图叠层（控制高度，留出底部统计栏空间）
  if (I.scr) frm(s, I.scr, 5.15, 0.2, 4.55, 3.1);
  if (I.rep) frm(s, I.rep, 5.78, 1.82, 3.95, 2.45);

  // 底部统计栏
  s.addShape(pres.shapes.LINE, {
    x: 0.5, y: 4.48, w: 9, h: 0, line: { color: C.line, width: 0.5 }
  });
  [["5 个", "AI 智能体模块"], ["4 级", "证据强度体系"], ["5 维", "可解释评分"],
    ["3 端", "HR / 学生 / 高校"], ["82+", "匹配度精准评分"]].forEach(([n, l], i) => {
    const x = 0.55 + i * 1.82;
    s.addText(n, {
      x, y: 4.56, w: 1.65, h: 0.42,
      fontSize: 28, color: C.acL, fontFace: "Segoe UI", bold: true, align: "center"
    });
    s.addText(l, {
      x, y: 4.98, w: 1.65, h: 0.16,
      fontSize: 7.5, color: C.sub, fontFace: "Segoe UI", align: "center"
    });
  });
}

// ══════════════════════════════════════════
//  Slide 02 · 时代背景与痛点
// ══════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s);
  lbl(s, "PROBLEM CONTEXT", "时代背景");
  ttl(s, "AI 爆发时代，招聘信任危机正在加剧");
  stl(s, "生成式 AI 让简历越来越漂亮，但真实能力越来越难判断——这正是证聘 AI 要解决的核心问题。");
  foot(s);

  const cards = [
    { num: "73%", lab: "HR 认为简历可信度下降", title: "简历虚假包装", body: "AI 辅助优化已成常态，技能栏堆砌关键词，项目描述夸大，HR 无从辨别真实能力。" },
    { num: "60%+", lab: "企业招聘精准度不足", title: "筛选效率低下", body: "校招季企业收到海量简历，传统关键词匹配精准度不足，误筛与漏筛普遍存在。" },
    { num: "45%", lab: "到岗 3 个月内离职率", title: "能力验证缺失", body: "面试前无法预判候选人真实水平，靠感觉决策，误招成本高昂，试用后才发现不匹配。" },
  ];

  cards.forEach(({ num, lab, title, body }, i) => {
    const x = 0.5 + i * 3.05;
    acrd(s, x, 1.66, 2.88, 3.32);
    s.addText(`0${i + 1}`, {
      x: x + 0.12, y: 1.78, w: 0.5, h: 0.35,
      fontSize: 13, color: C.muted, fontFace: "Segoe UI", bold: true
    });
    s.addText(title, {
      x: x + 0.12, y: 2.08, w: 2.6, h: 0.3,
      fontSize: 16, color: C.text, fontFace: "Segoe UI", bold: true
    });
    s.addShape(pres.shapes.LINE, {
      x: x + 0.12, y: 2.42, w: 2.6, h: 0,
      line: { color: C.line, width: 0.4 }
    });
    s.addText(body, {
      x: x + 0.12, y: 2.5, w: 2.64, h: 0.85,
      fontSize: 11, color: C.sub, fontFace: "Segoe UI"
    });
    s.addText(num, {
      x: x + 0.12, y: 3.38, w: 2.64, h: 0.45,
      fontSize: 34, color: C.acL, fontFace: "Segoe UI", bold: true
    });
    s.addText(lab, {
      x: x + 0.12, y: 3.82, w: 2.64, h: 0.2,
      fontSize: 9.5, color: C.muted, fontFace: "Segoe UI"
    });
  });

  // 底部观点句
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 5.05, w: 9, h: 0.22,
    fill: { color: C.s1 }, line: { color: C.line, width: 0.4 }
  });
  s.addText("传统招聘系统的根本缺陷：只匹配「关键词」，不验证「证据」——这正是证聘 AI 的切入点。", {
    x: 0.55, y: 5.06, w: 8.9, h: 0.2,
    fontSize: 10, color: C.sub, fontFace: "Segoe UI",
    italic: true, align: "center", valign: "middle"
  });
}

// ══════════════════════════════════════════
//  Slide 03 · 产品定位
// ══════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, 8.5, -0.8);
  lbl(s, "PRODUCT POSITIONING", "产品定位");
  ttl(s, "证聘 AI · 可信招聘智能体");
  stl(s, "以「证据驱动」替代「关键词匹配」，面向高校毕业生与企业校招场景");
  foot(s);

  // 左侧：前 vs 后对比
  crd(s, 0.5, 1.66, 4.1, 3.42);
  // 传统方式区
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.66, w: 4.1, h: 0.3,
    fill: { color: C.dim }, line: { color: "none" }
  });
  s.addText("传统方式", {
    x: 0.55, y: 1.66, w: 1.5, h: 0.3,
    fontSize: 10, color: C.muted, fontFace: "Segoe UI", bold: true, valign: "middle"
  });
  ["关键词堆叠匹配", "无法判断真实能力", "误筛漏筛普遍存在", "候选人靠包装胜出"].forEach((t, i) => {
    s.addText("✕", {
      x: 0.65, y: 2.08 + i * 0.3, w: 0.2, h: 0.26,
      fontSize: 10, color: C.muted, fontFace: "Segoe UI", bold: true, valign: "middle"
    });
    s.addText(t, {
      x: 0.9, y: 2.08 + i * 0.3, w: 3.4, h: 0.26,
      fontSize: 12, color: C.muted, fontFace: "Segoe UI", valign: "middle"
    });
  });

  // 箭头
  s.addShape(pres.shapes.LINE, {
    x: 0.5, y: 3.3, w: 4.1, h: 0, line: { color: C.ac, width: 0.5 }
  });
  s.addText("证聘 AI 做到了", {
    x: 0.55, y: 3.3, w: 4, h: 0.25,
    fontSize: 9, color: C.ac, fontFace: "Segoe UI", bold: true
  });
  [["证据链驱动匹配", C.ok], ["能力可信度可验证", C.ok],
    ["精准推荐排序", C.ok], ["真实能力脱颖而出", C.ok]].forEach(([t, col], i) => {
    s.addText("✓", {
      x: 0.65, y: 3.6 + i * 0.28, w: 0.2, h: 0.24,
      fontSize: 10, color: col, fontFace: "Segoe UI", bold: true, valign: "middle"
    });
    s.addText(t, {
      x: 0.9, y: 3.6 + i * 0.28, w: 3.4, h: 0.24,
      fontSize: 12, color: C.text, fontFace: "Segoe UI", valign: "middle"
    });
  });

  // 右侧：4 大能力支柱
  const pillars = [
    { title: "岗位要求可计算", desc: "JD → 结构化能力图谱 + 权重" },
    { title: "简历能力可解释", desc: "4 级证据体系判断可信度" },
    { title: "匹配结果可追溯", desc: "5 维度加权评分，透明决策" },
    { title: "面试验证可针对", desc: "基于短板生成个性化问题" },
  ];
  pillars.forEach(({ title, desc }, i) => {
    const y = 1.66 + i * 0.87;
    acrd(s, 4.85, y, 4.65, 0.76);
    s.addText(title, {
      x: 5.02, y: y + 0.1, w: 4.3, h: 0.28,
      fontSize: 14, color: C.text, fontFace: "Segoe UI", bold: true
    });
    s.addText(desc, {
      x: 5.02, y: y + 0.38, w: 4.3, h: 0.25,
      fontSize: 11, color: C.sub, fontFace: "Segoe UI"
    });
    // 序号徽章
    s.addShape(pres.shapes.OVAL, {
      x: 9.15, y: y + 0.1, w: 0.24, h: 0.24,
      fill: { color: C.acD }, line: { color: C.ac, width: 0.5 }
    });
    s.addText(`${i + 1}`, {
      x: 9.15, y: y + 0.1, w: 0.24, h: 0.24,
      fontSize: 8, color: C.acL, fontFace: "Segoe UI", bold: true, align: "center", valign: "middle"
    });
  });
}

// ══════════════════════════════════════════
//  Slide 04 · 系统架构
// ══════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, 7.5, -2);
  lbl(s, "SYSTEM ARCHITECTURE", "系统架构");
  ttl(s, "多 Agent 协同 · 全链路分析引擎");
  foot(s);

  // 技术栈标签（顶部水平排列）
  const techs = ["React + Vite", "TypeScript", "Tailwind CSS", "Express.js", "DeepSeek API"];
  techs.forEach((t, i) => {
    const x = 0.5 + i * 1.82;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.32, w: 1.7, h: 0.22, rectRadius: 0.04,
      fill: { color: C.s1 }, line: { color: C.line, width: 0.5 }
    });
    s.addText(t, {
      x, y: 1.32, w: 1.7, h: 0.22,
      fontSize: 8.5, color: C.sub, fontFace: "Segoe UI", align: "center", valign: "middle"
    });
  });

  // Pipeline：输入 → 5 Agent → 输出
  const agents = [
    { name: "JD 解析", sub: "Agent 01" },
    { name: "简历解析", sub: "Agent 02" },
    { name: "证据链分析", sub: "Agent 03" },
    { name: "匹配评分", sub: "Agent 04" },
    { name: "面试生成", sub: "Agent 05" },
  ];

  // 输入节点
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.82, w: 0.78, h: 1.08,
    fill: { color: C.s2 }, line: { color: C.line, width: 0.5 }
  });
  s.addText("输入", {
    x: 0.5, y: 1.9, w: 0.78, h: 0.22,
    fontSize: 10, color: C.sub, fontFace: "Segoe UI", bold: true, align: "center"
  });
  s.addText("JD 文本\n简历文件\n.txt/.docx/.pdf", {
    x: 0.5, y: 2.1, w: 0.78, h: 0.72,
    fontSize: 8, color: C.muted, fontFace: "Segoe UI", align: "center"
  });

  // Agent 节点
  agents.forEach(({ name, sub }, i) => {
    const x = 1.45 + i * 1.66;
    // 连接箭头
    s.addShape(pres.shapes.LINE, {
      x: i === 0 ? 1.28 : x - 0.12, y: 2.36,
      w: i === 0 ? 0.17 : 0.12, h: 0,
      line: { color: C.ac, width: 1.2 }
    });

    // Agent 矩形（靛蓝主题）
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.82, w: 1.45, h: 1.08,
      fill: { color: C.acD, transparency: 70 },
      line: { color: C.ac, width: 0.8 },
      shadow: { type: "outer", color: C.acGlow, blur: 8, offset: 0, angle: 0, opacity: 0.3 }
    });
    s.addText(sub, {
      x, y: 1.88, w: 1.45, h: 0.2,
      fontSize: 7.5, color: C.acL, fontFace: "Segoe UI", align: "center", charSpacing: 1
    });
    s.addText(name, {
      x, y: 2.08, w: 1.45, h: 0.36,
      fontSize: 14, color: C.text, fontFace: "Segoe UI", bold: true, align: "center", valign: "middle"
    });
    s.addText("Agent", {
      x, y: 2.52, w: 1.45, h: 0.22,
      fontSize: 8, color: C.muted, fontFace: "Segoe UI", align: "center"
    });
  });

  // 最后箭头 + 输出节点
  s.addShape(pres.shapes.LINE, {
    x: 9.0, y: 2.36, w: 0.18, h: 0,
    line: { color: C.ac, width: 1.2 }
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 9.18, y: 1.82, w: 0.78, h: 1.08,
    fill: { color: C.ok, transparency: 85 },
    line: { color: C.ok, width: 0.6 }
  });
  s.addText("输出", {
    x: 9.18, y: 1.9, w: 0.78, h: 0.22,
    fontSize: 10, color: C.okL, fontFace: "Segoe UI", bold: true, align: "center"
  });
  s.addText("匹配报告\n面试任务\n决策建议", {
    x: 9.18, y: 2.1, w: 0.78, h: 0.72,
    fontSize: 8, color: C.ok, fontFace: "Segoe UI", align: "center"
  });

  // 产出物标签行
  const outputs = ["岗位能力图谱", "简历结构化数据", "证据链分析报告", "人岗匹配评分", "AI 面试问题集"];
  outputs.forEach((t, i) => {
    const x = 1.45 + i * 1.66;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 3.05, w: 1.45, h: 0.25, rectRadius: 0.04,
      fill: { color: C.s1 }, line: { color: C.line, width: 0.4 }
    });
    s.addText(t, {
      x, y: 3.05, w: 1.45, h: 0.25,
      fontSize: 8.5, color: C.sub, fontFace: "Segoe UI", align: "center", valign: "middle"
    });
  });

  // 底部 4 大技术亮点
  const highlights = [
    { title: "OpenAI 兼容 SDK", desc: "无缝接入主流大模型" },
    { title: "Agent 异步任务队列", desc: "多步骤并发分析" },
    { title: "多格式简历解析", desc: "TXT / DOCX / PDF" },
    { title: "可解释评分引擎", desc: "每维度有证据说明" },
  ];
  highlights.forEach(({ title, desc }, i) => {
    const x = 0.5 + i * 2.38;
    acrd(s, x, 3.5, 2.22, 0.78);
    s.addText(title, {
      x: x + 0.12, y: 3.58, w: 2.0, h: 0.25,
      fontSize: 11.5, color: C.text, fontFace: "Segoe UI", bold: true
    });
    s.addText(desc, {
      x: x + 0.12, y: 3.84, w: 2.0, h: 0.2,
      fontSize: 10, color: C.sub, fontFace: "Segoe UI"
    });
  });
}

// ══════════════════════════════════════════
//  Slide 05 · Demo 01 · JD 智能解析
// ══════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, 8.8, -0.5);
  lbl(s, "LIVE DEMO  ·  产品实拍页面  01 / 04", "");
  ttl(s, "产品 Demo · JD 智能解析");
  stl(s, "输入岗位描述 → AI 自动提取结构化能力模型 → 生成带权重的岗位能力图谱");
  foot(s);

  if (I.jd) frm(s, I.jd, 0.5, 1.64, 5.6, 3.38);

  const features = [
    { title: "自动解析 JD", desc: "将自然语言岗位描述拆解为结构化能力清单" },
    { title: "权重智能分配", desc: "根据岗位侧重自动为每项能力分配权重（总和 100%）" },
    { title: "能力分类标注", desc: "按编程基础 / 框架 / 数据库 / 工程能力分类展示" },
    { title: "实时可视化图谱", desc: "进度条 + 标签形式直观呈现岗位要求全貌" },
  ];
  features.forEach(({ title, desc }, i) => {
    const y = 1.64 + i * 0.89;
    acrd(s, 6.3, y, 3.4, 0.78);
    s.addText(title, {
      x: 6.46, y: y + 0.1, w: 3.1, h: 0.28,
      fontSize: 13, color: C.text, fontFace: "Segoe UI", bold: true
    });
    s.addText(desc, {
      x: 6.46, y: y + 0.4, w: 3.1, h: 0.3,
      fontSize: 10.5, color: C.sub, fontFace: "Segoe UI"
    });
  });

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 5.05, w: 9, h: 0.22,
    fill: { color: C.s1 }, line: { color: C.line, width: 0.4 }
  });
  s.addText("示例：输入「Java 后端实习生」→ 自动生成：Java基础20% · Spring Boot25% · MySQL20% · 接口开发20% · 项目经验15%", {
    x: 0.55, y: 5.06, w: 8.9, h: 0.2,
    fontSize: 9, color: C.sub, fontFace: "Segoe UI", italic: true, align: "center", valign: "middle"
  });
}

// ══════════════════════════════════════════
//  Slide 06 · Demo 02 · 简历分析 + 证据链
// ══════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, 8.5, -1);
  lbl(s, "LIVE DEMO  ·  产品实拍页面  02 / 04", "核心创新");
  ttl(s, "简历分析 · 证据链分析");
  stl(s, "不只识别关键词——深度判断每项能力背后的「证据强度」，这是证聘 AI 的核心创新");
  foot(s);

  if (I.res) frm(s, I.res, 0.5, 1.66, 4.4, 3.22);
  if (I.evi) frm(s, I.evi, 5.1, 1.66, 4.4, 3.22);

  // 证据强度图例（干净版）
  const legend = [
    { label: "强证据", desc: "能力出现在具体项目中", col: C.ok },
    { label: "中证据", desc: "经历支撑，描述较模糊", col: C.ac },
    { label: "弱证据", desc: "仅出现在技能栏", col: C.sub },
    { label: "缺证据", desc: "简历未体现该能力", col: C.muted },
  ];
  legend.forEach(({ label, desc, col }, i) => {
    const x = 0.5 + i * 2.28;
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 4.98, w: 2.12, h: 0.28,
      fill: { color: C.s1 }, line: { color: col, width: 0.6 }
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 4.99, w: 0.04, h: 0.26,
      fill: { color: col }, line: { color: "none" }
    });
    s.addText(label, {
      x: x + 0.1, y: 4.99, w: 0.75, h: 0.26,
      fontSize: 10, color: col, fontFace: "Segoe UI", bold: true, valign: "middle"
    });
    s.addText(desc, {
      x: x + 0.85, y: 4.99, w: 1.2, h: 0.26,
      fontSize: 8.5, color: C.muted, fontFace: "Segoe UI", valign: "middle"
    });
  });
}

// ══════════════════════════════════════════
//  Slide 07 · Demo 03 · 人岗匹配评分
// ══════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, 9, -0.8);
  lbl(s, "LIVE DEMO  ·  产品实拍页面  03 / 04", "");
  ttl(s, "人岗匹配评分 · 可解释决策支持");
  foot(s);

  if (I.scr) frm(s, I.scr, 0.5, 1.64, 5.8, 3.6);

  // 关键数字展示
  const nums = [
    { n: "82", u: "/100", lab: "综合匹配度" },
    { n: "86", u: "", lab: "技能匹配度" },
    { n: "84", u: "", lab: "项目相关度" },
    { n: "76", u: "", lab: "证据可信度" },
  ];
  nums.forEach(({ n, u, lab }, i) => {
    const y = 1.64 + i * 0.92;
    acrd(s, 6.55, y, 3.15, 0.8, i === 0 ? C.ac : C.line);
    s.addText(n, {
      x: 6.7, y: y + 0.08, w: 1.0, h: 0.48,
      fontSize: i === 0 ? 38 : 32, color: i === 0 ? C.acL : C.text,
      fontFace: "Segoe UI", bold: true, valign: "middle"
    });
    if (u) s.addText(u, {
      x: 7.55, y: y + 0.3, w: 0.5, h: 0.22,
      fontSize: 11, color: C.sub, fontFace: "Segoe UI", valign: "middle"
    });
    s.addText(lab, {
      x: 7.85, y: y + 0.26, w: 1.65, h: 0.28,
      fontSize: 11.5, color: C.sub, fontFace: "Segoe UI", valign: "middle"
    });
  });

  // 推荐徽章
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 6.55, y: 5.02, w: 3.15, h: 0.28, rectRadius: 0.05,
    fill: { color: C.ok, transparency: 75 },
    line: { color: C.ok, width: 0.6 }
  });
  s.addText("✓  建议进入一面", {
    x: 6.55, y: 5.02, w: 3.15, h: 0.28,
    fontSize: 11.5, color: C.okL, fontFace: "Segoe UI",
    bold: true, align: "center", valign: "middle"
  });

  stl(s, "综合分 = 技能35% + 项目25% + 证据20% + 潜力10% + 表达10%");

  foot(s);
}

// ══════════════════════════════════════════
//  Slide 08 · Demo 04 · 面试任务 + HR 报告
// ══════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, 8, -1.5);
  lbl(s, "LIVE DEMO  ·  产品实拍页面  04 / 04", "");
  ttl(s, "AI 面试任务 · HR 匹配报告");
  stl(s, "基于短板自动生成针对性面试问题，输出完整结构化 HR 决策报告");
  foot(s);

  if (I.itv) frm(s, I.itv, 0.5, 1.66, 4.4, 3.25);
  if (I.rep) frm(s, I.rep, 5.1, 1.66, 4.4, 3.25);

  // 两个特性说明
  const feats = [
    { x: 0.5, title: "针对性面试任务", desc: "4 类问题：技术追问 / 项目核验 / 实操任务 / 风险验证，覆盖 Redis、事务边界等薄弱项" },
    { x: 5.1, title: "结构化 HR 报告", desc: "候选人概况 · 综合评分 · 核心优势 · 风险点 · 面试建议，支持 Markdown 导出" },
  ];
  feats.forEach(({ x, title, desc }) => {
    acrd(s, x, 4.98, 4.4, 0.3);
    s.addText(title, {
      x: x + 0.1, y: 5.0, w: 1.4, h: 0.26,
      fontSize: 10, color: C.acL, fontFace: "Segoe UI", bold: true, valign: "middle"
    });
    s.addText(desc, {
      x: x + 1.5, y: 5.0, w: 2.85, h: 0.26,
      fontSize: 9, color: C.sub, fontFace: "Segoe UI", valign: "middle"
    });
  });
}

// ══════════════════════════════════════════
//  Slide 09 · 应用场景
// ══════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, 8, -1);
  lbl(s, "USE CASES", "应用场景");
  ttl(s, "三类核心用户，覆盖校招全链路");
  foot(s);

  const cases = [
    {
      role: "企业 HR",
      scene: "场景：校招季批量候选人筛选",
      pain: "筛选效率低、误招成本高",
      items: ["一键生成岗位能力图谱", "自动证据链筛选简历", "匹配报告辅助面试决策", "减少误招降低用人成本"],
    },
    {
      role: "高校毕业生",
      scene: "场景：求职准备与简历优化",
      pain: "不知道自己差在哪里",
      items: ["了解岗位真正需要什么", "识别自身能力缺口", "获取可执行优化建议", "针对岗位精准备考面试"],
    },
    {
      role: "高校就业中心",
      scene: "场景：就业服务精准化升级",
      pain: "就业辅导效率低、精准度差",
      items: ["批量分析学生-岗位匹配度", "数据驱动就业指导", "精准辅导简历优化方向", "提升院校整体就业率"],
    },
  ];

  cases.forEach(({ role, scene, pain, items }, i) => {
    const x = 0.5 + i * 3.1;
    acrd(s, x, 1.6, 2.92, 3.6, i === 0 ? C.ac : i === 1 ? C.acL : C.ok);

    s.addText(role, {
      x: x + 0.12, y: 1.72, w: 2.6, h: 0.32,
      fontSize: 17, color: C.text, fontFace: "Segoe UI", bold: true
    });
    s.addText(scene, {
      x: x + 0.12, y: 2.04, w: 2.6, h: 0.2,
      fontSize: 9.5, color: C.muted, fontFace: "Segoe UI", italic: true
    });
    s.addShape(pres.shapes.LINE, {
      x: x + 0.12, y: 2.28, w: 2.68, h: 0,
      line: { color: C.line, width: 0.4 }
    });
    s.addText(`核心痛点：${pain}`, {
      x: x + 0.12, y: 2.32, w: 2.68, h: 0.22,
      fontSize: 9.5, color: i === 0 ? C.acL : i === 1 ? C.acL : C.okL,
      fontFace: "Segoe UI", bold: true
    });
    s.addText("证聘 AI 带来：", {
      x: x + 0.12, y: 2.58, w: 2.68, h: 0.22,
      fontSize: 9.5, color: C.sub, fontFace: "Segoe UI", bold: true
    });
    items.forEach((item, j) => {
      s.addText(`·  ${item}`, {
        x: x + 0.16, y: 2.8 + j * 0.3, w: 2.6, h: 0.26,
        fontSize: 10.5, color: C.sub, fontFace: "Segoe UI"
      });
    });
  });
}

// ══════════════════════════════════════════
//  Slide 10 · 竞争优势
// ══════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, 8.5, -1.2);
  lbl(s, "COMPETITIVE ADVANTAGE", "竞争优势");
  ttl(s, "证据驱动匹配 — 行业差异化护城河");
  foot(s);

  // 表头
  crd(s, 0.5, 1.58, 9, 0.3);
  [["维度", 0.5, 1.5], ["传统招聘平台", 2.5, 2.5], ["AI 简历优化工具", 5.15, 2.5], ["证聘 AI", 7.7, 1.8]].forEach(([t, x, w]) => {
    s.addText(t, {
      x, y: 1.6, w, h: 0.26,
      fontSize: 10, color: t === "证聘 AI" ? C.acL : C.sub,
      fontFace: "Segoe UI", bold: t === "证聘 AI", align: "center", valign: "middle"
    });
  });

  // 高亮列背景
  s.addShape(pres.shapes.RECTANGLE, {
    x: 7.7, y: 1.58, w: 1.8, h: 3.25,
    fill: { color: C.acD, transparency: 82 },
    line: { color: C.ac, width: 0.5 }
  });

  const rows = [
    ["岗位能力图谱", "✕ 无（仅关键词）", "✕ 无", "✓ 结构化权重模型"],
    ["简历证据链分析", "✕ 关键词匹配", "✕ 无", "✓ 四级证据强度判断"],
    ["能力可信度评估", "✕ 无", "✕ 无", "✓ 可解释多维评分"],
    ["AI 面试任务", "✕ 无", "✕ 无", "✓ 短板驱动个性化"],
    ["HR 决策报告", "△ 简单排名", "✕ 无", "✓ 完整决策报告"],
    ["学生能力反馈", "✕ 无", "△ 简历建议", "✓ 精准能力缺口分析"],
  ];
  rows.forEach((row, ri) => {
    const y = 1.92 + ri * 0.42;
    const rowBg = ri % 2 === 0 ? C.dim : C.bg;
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.5, y, w: 9, h: 0.4,
      fill: { color: rowBg }, line: { color: "none" }
    });
    const cols = [[0.5, 1.9], [2.5, 2.5], [5.15, 2.5], [7.7, 1.8]];
    row.forEach((cell, ci) => {
      const isOk = cell.startsWith("✓");
      const isWarn = cell.startsWith("△");
      s.addText(cell, {
        x: cols[ci][0], y: y + 0.02, w: cols[ci][1], h: 0.36,
        fontSize: 10.5, fontFace: "Segoe UI",
        color: isOk ? C.okL : isWarn ? C.acL : ci === 0 ? C.sub : C.muted,
        bold: isOk, align: ci === 0 ? "left" : "center", valign: "middle"
      });
    });
  });

  // 核心技术壁垒
  s.addText("核心技术壁垒", {
    x: 0.5, y: 4.45, w: 2, h: 0.22,
    fontSize: 11, color: C.sub, fontFace: "Segoe UI", bold: true
  });
  const moats = [
    { t: "能力要求可量化", d: "JD → 带权重结构化模型" },
    { t: "证据体系标准化", d: "四级强度统一判断标准" },
    { t: "评分结果可解释", d: "每维度均有证据支撑说明" },
    { t: "面试验证闭环化", d: "分析 → 验证形成完整链路" },
  ];
  moats.forEach(({ t, d }, i) => {
    const x = 0.5 + i * 2.38;
    acrd(s, x, 4.68, 2.22, 0.56);
    s.addText(t, {
      x: x + 0.12, y: 4.72, w: 2.0, h: 0.22,
      fontSize: 10.5, color: C.text, fontFace: "Segoe UI", bold: true
    });
    s.addText(d, {
      x: x + 0.12, y: 4.92, w: 2.0, h: 0.2,
      fontSize: 9, color: C.sub, fontFace: "Segoe UI"
    });
  });
}

// ══════════════════════════════════════════
//  Slide 11 · 商业模式
// ══════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, 8, -1.5);
  lbl(s, "BUSINESS MODEL", "商业模式 & 市场落地");
  ttl(s, "可落地的多元商业化路径");
  foot(s);

  const models = [
    {
      tag: "核心收入来源", title: "企业 SaaS 订阅",
      target: "目标：中大型企业 HR 部门",
      desc: "按月/年订阅，提供校招全流程 AI 分析服务，包含 JD 解析、批量简历分析、证据链报告、面试任务生成。",
      price: "定价参考：3 万 - 20 万元 / 年"
    },
    {
      tag: "规模扩张核心", title: "高校合作服务",
      target: "目标：高校就业指导中心",
      desc: "与高校就业中心签约合作，为学生提供免费匹配分析，向学校收取数据洞察和精准就业服务费。",
      price: "定价参考：5 万 - 50 万元 / 校 / 年"
    },
    {
      tag: "生态入口", title: "招聘平台 API",
      target: "目标：智联 / BOSS / 校招通",
      desc: "以 OpenAPI 形式接入主流招聘平台，提供可信匹配能力增值服务，按 API 调用量或功能使用计费。",
      price: "定价参考：按调用量 + 分成"
    },
  ];

  models.forEach(({ tag, title, target, desc, price }, i) => {
    const x = 0.5 + i * 3.1;
    acrd(s, x, 1.6, 2.92, 3.3);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.08, y: 1.68, w: 1.4, h: 0.2, rectRadius: 0.04,
      fill: { color: C.acD, transparency: 60 },
      line: { color: C.ac, width: 0.4 }
    });
    s.addText(tag, {
      x: x + 0.08, y: 1.68, w: 1.4, h: 0.2,
      fontSize: 8, color: C.acL, fontFace: "Segoe UI", align: "center", valign: "middle"
    });
    s.addText(title, {
      x: x + 0.12, y: 1.94, w: 2.7, h: 0.34,
      fontSize: 16.5, color: C.text, fontFace: "Segoe UI", bold: true
    });
    s.addText(target, {
      x: x + 0.12, y: 2.3, w: 2.7, h: 0.2,
      fontSize: 9.5, color: C.muted, fontFace: "Segoe UI", italic: true
    });
    s.addShape(pres.shapes.LINE, {
      x: x + 0.12, y: 2.54, w: 2.68, h: 0,
      line: { color: C.line, width: 0.4 }
    });
    s.addText(desc, {
      x: x + 0.12, y: 2.58, w: 2.7, h: 0.84,
      fontSize: 10.5, color: C.sub, fontFace: "Segoe UI"
    });
    s.addText(price, {
      x: x + 0.12, y: 3.48, w: 2.7, h: 0.26,
      fontSize: 11, color: C.acL, fontFace: "Segoe UI", bold: true
    });
  });

  // 底部市场数据（左数字 + 右标签分开放置）
  const mstats = [
    { n: "1076 万", l: "2024 届毕业生" },
    { n: "6000 亿+", l: "人才服务市场规模" },
    { n: "80%+", l: "HR 呼吁效率提升" },
  ];
  mstats.forEach(({ n, l }, i) => {
    const x = 0.5 + i * 3.1;
    s.addShape(pres.shapes.LINE, {
      x, y: 4.98, w: 2.92, h: 0, line: { color: C.line, width: 0.4 }
    });
    s.addText(n, {
      x: x + 0.08, y: 5.04, w: 1.55, h: 0.26,
      fontSize: 20, color: C.acL, fontFace: "Segoe UI", bold: true
    });
    s.addText(l, {
      x: x + 1.67, y: 5.06, w: 1.2, h: 0.22,
      fontSize: 10, color: C.muted, fontFace: "Segoe UI", valign: "middle"
    });
  });
}

// ══════════════════════════════════════════
//  Slide 12 · 发展路线
// ══════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, 8, -1);
  lbl(s, "ROADMAP", "未来规划");
  ttl(s, "三阶段演进 · 从 Demo 到规模化落地");
  foot(s);

  const phases = [
    {
      ph: "Phase 1", time: "当前阶段", title: "Demo 验证",
      col: C.ok,
      items: ["完整 7 页面 Demo 系统", "JD 解析 + 证据链 + 评分闭环", "DeepSeek API 真实接入", "多格式简历解析支持", "比赛演示 & 评委验收"],
    },
    {
      ph: "Phase 2", time: "6 个月内", title: "产品化落地",
      col: C.ac,
      items: ["真实登录 & 权限系统", "数据库持久化存储", "批量简历上传处理", "学生端完整链路", "首批高校就业中心合作"],
    },
    {
      ph: "Phase 3", time: "1-2 年内", title: "规模化平台",
      col: C.acL,
      items: ["主流招聘平台 API 接入", "企业 SaaS 商业化运营", "自研招聘场景专属模型", "多城市高校规模覆盖", "构建可信招聘行业标准"],
    },
  ];

  phases.forEach(({ ph, time, title, col, items }, i) => {
    const x = 0.5 + i * 3.1;
    crd(s, x, 1.6, 2.92, 3.45);
    // 顶部色条
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.6, w: 2.92, h: 0.035,
      fill: { color: col }, line: { color: "none" }
    });
    s.addText(ph, {
      x: x + 0.12, y: 1.7, w: 1.4, h: 0.22,
      fontSize: 9.5, color: col, fontFace: "Segoe UI", bold: true, charSpacing: 0.5
    });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: x + 1.8, y: 1.68, w: 1.0, h: 0.22, rectRadius: 0.04,
      fill: { color: col, transparency: 80 }, line: { color: col, width: 0.5 }
    });
    s.addText(time, {
      x: x + 1.8, y: 1.68, w: 1.0, h: 0.22,
      fontSize: 8.5, color: col, fontFace: "Segoe UI", align: "center", valign: "middle"
    });
    s.addText(title, {
      x: x + 0.12, y: 1.94, w: 2.7, h: 0.38,
      fontSize: 20, color: C.text, fontFace: "Segoe UI", bold: true
    });
    s.addShape(pres.shapes.LINE, {
      x: x + 0.12, y: 2.35, w: 2.68, h: 0,
      line: { color: C.line, width: 0.4 }
    });
    items.forEach((item, j) => {
      s.addShape(pres.shapes.OVAL, {
        x: x + 0.15, y: 2.46 + j * 0.3, w: 0.08, h: 0.08,
        fill: { color: col, transparency: 30 }, line: { color: "none" }
      });
      s.addText(item, {
        x: x + 0.3, y: 2.42 + j * 0.3, w: 2.5, h: 0.26,
        fontSize: 10.5, color: C.sub, fontFace: "Segoe UI"
      });
    });
  });

  // 时间轴线条
  s.addShape(pres.shapes.LINE, {
    x: 0.98, y: 5.15, w: 8.04, h: 0,
    line: { color: C.line, width: 1 }
  });
  [["当前", 0.82], ["6 个月", 3.92], ["1-2 年", 7.02]].forEach(([t, x]) => {
    s.addShape(pres.shapes.OVAL, {
      x, y: 5.1, w: 0.1, h: 0.1,
      fill: { color: C.ac }, line: { color: "none" }
    });
    s.addText(t, {
      x: x - 0.2, y: 5.2, w: 0.7, h: 0.16,
      fontSize: 8.5, color: C.muted, fontFace: "Segoe UI", align: "center"
    });
  });
}

// ══════════════════════════════════════════
//  Slide 13 · 结语
// ══════════════════════════════════════════
{
  const s = pres.addSlide();
  bg(s, 6.5, -2.0);

  // 品牌标签
  s.addText("TRUSTHIRE AI", {
    x: 0.5, y: 0.28, w: 4, h: 0.2,
    fontSize: 9, color: C.muted, fontFace: "Segoe UI", charSpacing: 4
  });

  // 产品名 + 使命
  s.addText("证聘 AI", {
    x: 0.45, y: 0.6, w: 5, h: 0.82,
    fontSize: 52, color: C.text, fontFace: "Segoe UI", bold: true
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.46, w: 2.0, h: 0.035,
    fill: { color: C.ac }, line: { color: "none" }
  });
  const missions = ["让企业看到真实能力", "让学生获得公平机会", "让招聘回归证据驱动"];
  missions.forEach((m, i) => {
    s.addText(m, {
      x: 0.5, y: 1.62 + i * 0.3, w: 4.8, h: 0.26,
      fontSize: 14.5, color: C.sub, fontFace: "Segoe UI"
    });
  });

  // 功能要点列表
  const pts = [
    ["⚡", "5 大 AI 智能体协同工作"],
    ["◎", "4 级证据链能力判断体系"],
    ["▣", "5 维度可解释人岗匹配评分"],
    ["❍", "覆盖 HR / 学生 / 高校三端"],
  ];
  pts.forEach(([icon, text], i) => {
    s.addText(`${icon}  ${text}`, {
      x: 0.5, y: 2.65 + i * 0.3, w: 4.5, h: 0.26,
      fontSize: 12, color: C.muted, fontFace: "Segoe UI"
    });
  });

  // 右侧使命卡片
  crd(s, 5.15, 0.5, 4.55, 2.25);
  s.addText("我们的使命", {
    x: 5.28, y: 0.64, w: 4.3, h: 0.24,
    fontSize: 10, color: C.muted, fontFace: "Segoe UI"
  });
  s.addText("简历越来越漂亮，\n但真实能力越来越难判断。\n\n证聘 AI 要让每一份\n有真实能力的简历被看见。", {
    x: 5.28, y: 0.94, w: 4.3, h: 1.6,
    fontSize: 13.5, color: C.sub, fontFace: "Segoe UI",
    italic: true, valign: "middle"
  });

  // 四个价值卡（2×2 格）
  const values = [
    { word: "可信", desc: "证据驱动，能力看得见", col: C.ac },
    { word: "高效", desc: "AI 加持，10 秒完成筛选", col: C.acL },
    { word: "公平", desc: "真实能力，非包装胜出", col: C.ok },
    { word: "落地", desc: "对接企业、高校、平台", col: C.okL },
  ];
  values.forEach(({ word, desc, col }, i) => {
    const x = 5.15 + (i % 2) * 2.35;
    const y = 2.95 + Math.floor(i / 2) * 1.0;
    crd(s, x, y, 2.18, 0.88);
    s.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 2.18, h: 0.035,
      fill: { color: col }, line: { color: "none" }
    });
    s.addText(word, {
      x: x + 0.12, y: y + 0.08, w: 1.8, h: 0.34,
      fontSize: 22, color: col, fontFace: "Segoe UI", bold: true
    });
    s.addText(desc, {
      x: x + 0.12, y: y + 0.45, w: 1.95, h: 0.25,
      fontSize: 10, color: C.sub, fontFace: "Segoe UI"
    });
  });

  // 页底通栏
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 5.29, w: 10, h: 0.335,
    fill: { color: C.s1 }, line: { color: "none" }
  });
  s.addShape(pres.shapes.LINE, {
    x: 0, y: 5.29, w: 10, h: 0, line: { color: C.ac, width: 0.6 }
  });
  s.addText("AI + 人才服务赛道  ·  证聘 AI TrustHire AI  ·  让招聘从关键词匹配走向证据驱动匹配", {
    x: 0.5, y: 5.3, w: 9, h: 0.3,
    fontSize: 8.5, color: C.muted, fontFace: "Segoe UI", align: "center", valign: "middle"
  });
}

// ══════════════════════════════════════════
//  输出文件
// ══════════════════════════════════════════
const OUT = path.join(__dirname, "证聘AI-TrustHireAI-演示PPT-V3.pptx");
pres.writeFile({ fileName: OUT }).then(() => {
  console.log("✓ V3 PPT 已生成：" + OUT);
}).catch(err => {
  console.error("生成失败：", err);
});
