"use strict";
const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

// ── 读取截图为 base64 ──────────────────────────────
const ssDir = path.join(__dirname, "demo-screenshots");
function img(name) {
  const f = path.join(ssDir, name);
  if (!fs.existsSync(f)) return null;
  return "image/png;base64," + fs.readFileSync(f).toString("base64");
}
const SS = {
  dashboard: img("01-dashboard.png"),
  jd:        img("02-jd-parse.png"),
  resume:    img("03-resume.png"),
  evidence:  img("04-evidence.png"),
  score:     img("05-score.png"),
  interview: img("06-interview.png"),
  report:    img("07-report.png"),
};

// ── 颜色主题（深空极暗风） ─────────────────────────
const C = {
  bg:        "040C1E",   // 极暗蓝底
  navy:      "081535",   // 深海蓝卡片背景
  card:      "0B1D3A",   // 卡片
  cardBright:"0F2348",
  blue:      "4F8EFF",   // 主蓝
  blueDark:  "1A4FBF",
  cyan:      "00D4FF",   // 霓虹青
  purple:    "A855F7",   // 紫
  purpleD:   "7C3AED",
  emerald:   "10B981",   // 翡翠绿
  amber:     "F59E0B",   // 琥珀
  red:       "EF4444",
  white:     "FFFFFF",
  slate:     "94A3B8",
  slateL:    "CBD5E1",
  border:    "1E3A5F",
};

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.title  = "证聘AI TrustHire AI · AI+人才服务解决方案";

// ── 通用辅助函数 ───────────────────────────────────
const makeShadow = () => ({ type:"outer", color:"000000", blur:20, offset:6, angle:135, opacity:0.35 });
const makeGlow   = (color) => ({ type:"outer", color, blur:18, offset:0, angle:0, opacity:0.5 });

function bg(slide) {
  slide.background = { color: C.bg };
  slide.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:10, h:0.04, fill:{ color:C.blue } });
}

function card(slide, x, y, w, h, color, opts = {}) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h,
    fill: { color: color || C.card },
    line: { color: opts.borderColor || C.border, width: opts.borderW || 0.8 },
    shadow: opts.shadow ? makeShadow() : undefined,
  });
}

// 带发光边框的卡片
function glowCard(slide, x, y, w, h, color) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h,
    fill: { color: C.card },
    line: { color: color, width: 1.5 },
    shadow: { type:"outer", color, blur:14, offset:0, angle:0, opacity:0.4 },
  });
}

// section label
function label(slide, text, color) {
  slide.addText(text, {
    x:0.55, y:0.18, w:8, h:0.32,
    fontSize:9.5, color: color||C.cyan, fontFace:"Calibri",
    bold:true, charSpacing:4, align:"left", margin:0,
  });
}

// 浏览器截图框（模拟 Chrome frame）
function browserFrame(slide, imgData, x, y, w, h) {
  if (!imgData) return;
  const chromeH = 0.22;
  // 浏览器主体
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h: h + chromeH,
    fill:{ color:"1A1F2E" },
    line:{ color:C.border, width:0.8 },
    shadow: makeShadow(),
  });
  // 标题栏
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h: chromeH,
    fill:{ color:"161B28" },
    line:{ color:C.border, width:0 },
  });
  // 红黄绿圆点
  const dots = [C.red, C.amber, C.emerald];
  dots.forEach((col, i) => {
    slide.addShape(pres.shapes.OVAL, {
      x: x + 0.1 + i*0.15, y: y + 0.06, w:0.1, h:0.1,
      fill:{ color:col },
    });
  });
  // 地址栏
  slide.addShape(pres.shapes.RECTANGLE, {
    x: x+0.55, y: y+0.04, w: w-0.7, h: 0.14,
    fill:{ color:"0D1221" }, line:{ color:C.border, width:0.5 },
  });
  slide.addText("localhost:5173", {
    x: x+0.58, y: y+0.05, w: w-0.76, h: 0.12,
    fontSize:7, color:C.slate, fontFace:"Calibri", align:"left", margin:0,
  });
  // 截图内容
  slide.addImage({ data: imgData, x, y: y+chromeH, w, h });
}

// 数字大卡片
function statCard(slide, x, y, w, h, val, label2, color) {
  glowCard(slide, x, y, w, h, color);
  slide.addText(val, {
    x, y: y+0.06, w, h: h*0.62,
    fontSize:26, bold:true, color, fontFace:"Calibri", align:"center", margin:0,
  });
  slide.addText(label2, {
    x, y: y+h*0.62, w, h: h*0.38,
    fontSize:10, color:C.slate, fontFace:"Calibri", align:"center", margin:0,
  });
}

// ══════════════════════════════════════════════════
// SLIDE 1  封面
// ══════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };

  // 顶部蓝线
  slide.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:10, h:0.04, fill:{ color:C.blue } });

  // 背景装饰：大渐变光晕
  slide.addShape(pres.shapes.OVAL, { x:-1.5, y:-1,   w:6, h:6, fill:{ color:C.blue,   transparency:93 } });
  slide.addShape(pres.shapes.OVAL, { x:6.5,  y:2,    w:5, h:5, fill:{ color:C.purple, transparency:91 } });
  slide.addShape(pres.shapes.OVAL, { x:4,    y:-0.5, w:3, h:3, fill:{ color:C.cyan,   transparency:93 } });

  // 左侧暗蓝色块
  slide.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:5.2, h:5.625, fill:{ color:"06101F" } });
  slide.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:0.22, h:5.625, fill:{ color:C.blue } });

  // 英文标识
  slide.addText("TRUSTHIRE AI", {
    x:0.45, y:0.55, w:4.5, h:0.35,
    fontSize:10, color:C.cyan, fontFace:"Calibri", bold:true,
    charSpacing:6, align:"left", margin:0,
  });

  // 主标题
  slide.addText("证聘 AI", {
    x:0.42, y:0.92, w:4.6, h:1.15,
    fontSize:58, bold:true, color:C.white, fontFace:"Calibri",
    align:"left", margin:0,
  });

  // 副标题
  slide.addText("让招聘从关键词匹配\n走向证据驱动", {
    x:0.42, y:2.18, w:4.5, h:0.8,
    fontSize:17, color:C.slateL, fontFace:"Calibri", align:"left", margin:0,
  });

  // 分隔线
  slide.addShape(pres.shapes.RECTANGLE, { x:0.42, y:3.12, w:4.0, h:0.025, fill:{ color:C.border } });

  // 定位描述
  slide.addText("面向高校毕业生与企业校招场景的可信招聘智能体", {
    x:0.42, y:3.25, w:4.5, h:0.32,
    fontSize:11.5, color:C.slate, fontFace:"Calibri", align:"left", margin:0,
  });

  // 赛道徽章
  slide.addShape(pres.shapes.RECTANGLE, {
    x:0.42, y:3.7, w:1.85, h:0.3,
    fill:{ color:C.blue, transparency:20 }, line:{ color:C.blue, width:0.8 },
  });
  slide.addText("AI + 人才服务赛道", {
    x:0.42, y:3.7, w:1.85, h:0.3,
    fontSize:9.5, color:C.white, fontFace:"Calibri", bold:true, align:"center", margin:0,
  });

  // 右侧：截图 MOSAIC（小缩略图叠放）
  if (SS.score) {
    slide.addShape(pres.shapes.RECTANGLE, {
      x:5.1, y:0.4, w:4.6, h:3.2,
      fill:{ color:"0B1529" }, line:{ color:C.border, width:0.8 },
      shadow: makeShadow(),
    });
    slide.addImage({ data: SS.score, x:5.1, y:0.4, w:4.6, h:3.2 });
    // 亮框
    slide.addShape(pres.shapes.RECTANGLE, {
      x:5.1, y:0.4, w:4.6, h:3.2,
      fill:{ color:"FFFFFF", transparency:100 }, line:{ color:C.cyan, width:1.2 },
    });
  }
  if (SS.report) {
    slide.addShape(pres.shapes.RECTANGLE, {
      x:6.2, y:2.7, w:3.3, h:2.2,
      fill:{ color:"0B1529" }, line:{ color:C.border, width:0.8 },
      shadow: makeShadow(),
    });
    slide.addImage({ data: SS.report, x:6.2, y:2.7, w:3.3, h:2.2 });
    slide.addShape(pres.shapes.RECTANGLE, {
      x:6.2, y:2.7, w:3.3, h:2.2,
      fill:{ color:"FFFFFF", transparency:100 }, line:{ color:C.purple, width:1.2 },
    });
  }

  // 底部数据带
  slide.addShape(pres.shapes.RECTANGLE, { x:0, y:5.0, w:10, h:0.625, fill:{ color:"060F22" } });
  slide.addShape(pres.shapes.RECTANGLE, { x:0, y:5.0, w:10, h:0.025, fill:{ color:C.border } });

  const stats = [
    { val:"5 个", label:"AI 智能体模块" },
    { val:"4 级", label:"证据强度体系" },
    { val:"5 维", label:"可解释评分" },
    { val:"3 端", label:"HR / 学生 / 高校" },
    { val:"82+", label:"匹配度精准评分" },
  ];
  stats.forEach((s, i) => {
    const sx = 0.5 + i * 1.93;
    slide.addText(s.val, {
      x:sx, y:5.05, w:1.7, h:0.3,
      fontSize:18, bold:true, color:C.cyan, fontFace:"Calibri", align:"center", margin:0,
    });
    slide.addText(s.label, {
      x:sx, y:5.35, w:1.7, h:0.22,
      fontSize:9, color:C.slate, fontFace:"Calibri", align:"center", margin:0,
    });
    if (i < 4) {
      slide.addShape(pres.shapes.RECTANGLE, { x:sx+1.7, y:5.12, w:0.025, h:0.4, fill:{ color:C.border } });
    }
  });
}

// ══════════════════════════════════════════════════
// SLIDE 2  问题背景
// ══════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  bg(slide);
  label(slide, "PROBLEM CONTEXT  ·  时代背景");

  slide.addText("AI 爆发时代，招聘信任危机正在加剧", {
    x:0.55, y:0.5, w:9, h:0.85,
    fontSize:34, bold:true, color:C.white, fontFace:"Calibri", align:"left", margin:0,
  });
  slide.addText("生成式 AI 让简历越来越漂亮，但真实能力越来越难判断——这正是证聘 AI 要解决的核心问题。", {
    x:0.55, y:1.38, w:9, h:0.38,
    fontSize:13, color:C.slateL, fontFace:"Calibri", align:"left", margin:0,
  });

  // 三张痛点卡
  const pains = [
    { icon:"01", title:"简历虚假包装", body:"AI 辅助优化已成常态，技能栏堆砌关键词，项目描述夸大，HR 无从分辨真实能力。", stat:"73%", statLabel:"HR 认为简历可信度下降", color:C.red },
    { icon:"02", title:"筛选效率低下", body:"校招季企业收到海量简历，传统关键词匹配精准度不足，误筛与漏筛普遍存在。", stat:"60%+", statLabel:"企业招聘精准度不足", color:C.amber },
    { icon:"03", title:"能力验证缺失", body:"面试前无法预判候选人真实水平，靠「感觉」决策，误招成本高昂，试用后才发现不匹配。", stat:"45%", statLabel:"到岗 3 个月内离职率", color:C.purple },
  ];

  pains.forEach((p, i) => {
    const px = 0.55 + i * 3.15;
    glowCard(slide, px, 1.9, 2.88, 3.45, p.color);
    // 顶部色条
    slide.addShape(pres.shapes.RECTANGLE, { x:px, y:1.9, w:2.88, h:0.04, fill:{ color:p.color } });
    // 编号
    slide.addText(p.icon, {
      x:px+0.18, y:2.0, w:0.55, h:0.55,
      fontSize:22, bold:true, color:p.color, fontFace:"Calibri", align:"left", margin:0,
    });
    slide.addText(p.title, {
      x:px+0.18, y:2.62, w:2.52, h:0.42,
      fontSize:16, bold:true, color:C.white, fontFace:"Calibri", align:"left", margin:0,
    });
    slide.addText(p.body, {
      x:px+0.18, y:3.1, w:2.52, h:0.95,
      fontSize:11, color:C.slateL, fontFace:"Calibri", align:"left", margin:0,
    });
    // 数据引用
    slide.addShape(pres.shapes.RECTANGLE, { x:px+0.18, y:4.1, w:2.52, h:0.025, fill:{ color:p.color, transparency:50 } });
    slide.addText(p.stat, {
      x:px+0.18, y:4.15, w:1.2, h:0.42,
      fontSize:22, bold:true, color:p.color, fontFace:"Calibri", align:"left", margin:0,
    });
    slide.addText(p.statLabel, {
      x:px+0.18, y:4.58, w:2.52, h:0.28,
      fontSize:9.5, color:C.slate, fontFace:"Calibri", align:"left", margin:0,
    });
  });

  // 底部结论
  card(slide, 0.55, 5.08, 8.9, 0.38, "080F20");
  slide.addText("传统招聘系统的根本缺陷：只匹配「关键词」，不验证「证据」——这正是证聘 AI 的切入点。", {
    x:0.72, y:5.12, w:8.56, h:0.3,
    fontSize:11.5, color:C.cyan, fontFace:"Calibri", italic:true, align:"center", margin:0,
  });
}

// ══════════════════════════════════════════════════
// SLIDE 3  产品定位 & 核心价值
// ══════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  bg(slide);
  label(slide, "PRODUCT POSITIONING  ·  产品定位");

  slide.addText("证聘 AI", {
    x:0.55, y:0.45, w:5, h:0.9,
    fontSize:46, bold:true, color:C.white, fontFace:"Calibri", align:"left", margin:0,
  });
  slide.addText("可信招聘智能体", {
    x:0.55, y:1.35, w:5, h:0.52,
    fontSize:22, color:C.cyan, fontFace:"Calibri", bold:true, align:"left", margin:0,
  });
  slide.addText("面向高校毕业生与企业校招场景\n以「证据驱动」替代「关键词匹配」", {
    x:0.55, y:1.95, w:4.8, h:0.75,
    fontSize:13.5, color:C.slateL, fontFace:"Calibri", align:"left", margin:0,
  });

  // 旧 vs 新对比
  slide.addShape(pres.shapes.RECTANGLE, { x:0.55, y:2.85, w:2.3, h:1.85, fill:{ color:"140A0A" }, line:{ color:C.red, width:0.8 } });
  slide.addShape(pres.shapes.RECTANGLE, { x:0.55, y:2.85, w:2.3, h:0.04, fill:{ color:C.red } });
  slide.addText("传统方式", { x:0.65, y:2.93, w:2.1, h:0.3, fontSize:12, bold:true, color:C.red, fontFace:"Calibri", align:"left", margin:0 });
  ["关键词堆叠匹配", "无法判断真实能力", "误筛漏筛普遍", "候选人靠包装胜出"].forEach((t, i) => {
    slide.addText("✗  " + t, { x:0.65, y:3.3+i*0.33, w:2.1, h:0.3, fontSize:10.5, color:C.slateL, fontFace:"Calibri", align:"left", margin:0 });
  });

  slide.addText("→", { x:2.95, y:3.52, w:0.6, h:0.4, fontSize:22, bold:true, color:C.border, fontFace:"Calibri", align:"center", margin:0 });

  slide.addShape(pres.shapes.RECTANGLE, { x:3.55, y:2.85, w:2.3, h:1.85, fill:{ color:"07140D" }, line:{ color:C.emerald, width:0.8 } });
  slide.addShape(pres.shapes.RECTANGLE, { x:3.55, y:2.85, w:2.3, h:0.04, fill:{ color:C.emerald } });
  slide.addText("证聘 AI", { x:3.65, y:2.93, w:2.1, h:0.3, fontSize:12, bold:true, color:C.emerald, fontFace:"Calibri", align:"left", margin:0 });
  ["证据链驱动匹配", "能力可信度可验证", "精准推荐排序", "真实能力脱颖而出"].forEach((t, i) => {
    slide.addText("✓  " + t, { x:3.65, y:3.3+i*0.33, w:2.1, h:0.3, fontSize:10.5, color:C.white, fontFace:"Calibri", align:"left", margin:0 });
  });

  // 右侧 4 大价值主张
  const values = [
    { t:"岗位要求可计算", d:"JD → 结构化能力图谱 + 权重", color:C.blue },
    { t:"简历能力可解释", d:"4 级证据体系判断可信度", color:C.cyan },
    { t:"匹配结果可追溯", d:"5 维度加权评分，透明决策", color:C.purple },
    { t:"面试验证可针对", d:"基于短板生成个性化问题", color:C.emerald },
  ];
  values.forEach((v, i) => {
    const vy = 0.55 + i * 1.2;
    glowCard(slide, 6.15, vy, 3.4, 1.0, v.color);
    slide.addShape(pres.shapes.RECTANGLE, { x:6.15, y:vy, w:0.07, h:1.0, fill:{ color:v.color } });
    slide.addText(v.t, { x:6.32, y:vy+0.12, w:3.1, h:0.38, fontSize:14, bold:true, color:C.white, fontFace:"Calibri", align:"left", margin:0 });
    slide.addText(v.d, { x:6.32, y:vy+0.52, w:3.1, h:0.32, fontSize:10.5, color:C.slate, fontFace:"Calibri", align:"left", margin:0 });
  });
}

// ══════════════════════════════════════════════════
// SLIDE 4  系统架构
// ══════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  bg(slide);
  label(slide, "SYSTEM ARCHITECTURE  ·  系统架构");

  slide.addText("多 Agent 协同驱动的全链路分析引擎", {
    x:0.55, y:0.45, w:9, h:0.72,
    fontSize:30, bold:true, color:C.white, fontFace:"Calibri", align:"left", margin:0,
  });

  // 技术栈徽章
  const techs = [
    { t:"React + Vite",    c:C.blue },
    { t:"TypeScript",      c:C.cyan },
    { t:"Tailwind CSS",    c:C.purple },
    { t:"Express.js",      c:C.emerald },
    { t:"DeepSeek API",    c:C.amber },
  ];
  techs.forEach((tc, i) => {
    const tx = 0.55 + i * 1.88;
    slide.addShape(pres.shapes.RECTANGLE, {
      x:tx, y:1.28, w:1.7, h:0.3,
      fill:{ color:tc.c, transparency:82 }, line:{ color:tc.c, width:0.8 },
    });
    slide.addText(tc.t, { x:tx, y:1.28, w:1.7, h:0.3, fontSize:9.5, color:C.white, fontFace:"Calibri", bold:true, align:"center", margin:0 });
  });

  // Pipeline 流程
  const pipeY = 1.82;
  // 输入
  card(slide, 0.3, pipeY, 1.3, 1.55, "09142A");
  slide.addShape(pres.shapes.RECTANGLE, { x:0.3, y:pipeY, w:1.3, h:0.03, fill:{ color:C.blue } });
  slide.addText("输入", { x:0.3, y:pipeY+0.06, w:1.3, h:0.28, fontSize:10, bold:true, color:C.blue, fontFace:"Calibri", align:"center", margin:0 });
  slide.addText("JD 文本\n简历文件\n.txt/.docx/.pdf", { x:0.3, y:pipeY+0.38, w:1.3, h:0.85, fontSize:9, color:C.slateL, fontFace:"Calibri", align:"center", margin:0 });

  slide.addShape(pres.shapes.LINE, { x:1.6, y:pipeY+0.78, w:0.32, h:0, line:{ color:C.blue, width:2 } });

  // 5 个 Agent
  const agents = [
    { name:"JD 解析\nAgent",    color:C.blue },
    { name:"简历解析\nAgent",   color:C.cyan },
    { name:"证据链分析\nAgent", color:C.purple },
    { name:"匹配评分\nAgent",   color:C.emerald },
    { name:"面试生成\nAgent",   color:C.amber },
  ];
  agents.forEach((a, i) => {
    const ax = 1.95 + i * 1.48;
    glowCard(slide, ax, pipeY, 1.32, 1.55, a.color);
    slide.addShape(pres.shapes.RECTANGLE, { x:ax, y:pipeY, w:1.32, h:0.035, fill:{ color:a.color } });
    slide.addText(a.name, { x:ax, y:pipeY+0.1, w:1.32, h:1.25, fontSize:11, bold:true, color:a.color, fontFace:"Calibri", align:"center", margin:0 });
    if (i < 4) {
      slide.addShape(pres.shapes.LINE, { x:ax+1.32, y:pipeY+0.78, w:0.16, h:0, line:{ color:C.border, width:1.5 } });
    }
  });

  // 输出
  slide.addShape(pres.shapes.LINE, { x:9.27, y:pipeY+0.78, w:0.32, h:0, line:{ color:C.emerald, width:2 } });
  card(slide, 9.6, pipeY, 0.38, 1.55, "0A1A10");
  slide.addShape(pres.shapes.RECTANGLE, { x:9.6, y:pipeY, w:0.38, h:0.03, fill:{ color:C.emerald } });
  slide.addText("输\n出", { x:9.6, y:pipeY+0.15, w:0.38, h:1.2, fontSize:10, bold:true, color:C.emerald, fontFace:"Calibri", align:"center", margin:0 });

  // 输出物清单
  slide.addText("系统输出产物", { x:0.55, y:3.6, w:4, h:0.34, fontSize:12, bold:true, color:C.white, fontFace:"Calibri", align:"left", margin:0 });
  const outputs = [
    { t:"岗位能力图谱", c:C.blue },
    { t:"简历结构化数据", c:C.cyan },
    { t:"证据链分析报告", c:C.purple },
    { t:"人岗匹配评分", c:C.emerald },
    { t:"AI 面试问题集", c:C.amber },
  ];
  outputs.forEach((o, i) => {
    const ox = 0.55 + i * 1.88;
    slide.addShape(pres.shapes.RECTANGLE, {
      x:ox, y:4.0, w:1.7, h:0.35,
      fill:{ color:o.c, transparency:80 }, line:{ color:o.c, width:0.8 },
    });
    slide.addText(o.t, { x:ox, y:4.0, w:1.7, h:0.35, fontSize:10, color:C.white, fontFace:"Calibri", align:"center", margin:0 });
  });

  // 技术特点
  const feats = [
    { t:"OpenAI 兼容 SDK",    d:"无缝接入主流大模型" },
    { t:"Agent 异步任务队列",  d:"多步骤并发分析" },
    { t:"多格式简历解析",      d:"TXT / DOCX / PDF" },
    { t:"可解释评分引擎",      d:"每维度有证据说明" },
  ];
  feats.forEach((f, i) => {
    const fx = 0.55 + i * 2.38;
    card(slide, fx, 4.52, 2.1, 0.82, C.navy);
    slide.addText(f.t, { x:fx+0.14, y:4.6, w:1.82, h:0.3, fontSize:11, bold:true, color:C.cyan, fontFace:"Calibri", align:"left", margin:0 });
    slide.addText(f.d, { x:fx+0.14, y:4.9, w:1.82, h:0.28, fontSize:9.5, color:C.slate, fontFace:"Calibri", align:"left", margin:0 });
  });
}

// ══════════════════════════════════════════════════
// SLIDE 5  Demo 实拍 ① — Dashboard + JD 解析
// ══════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  bg(slide);
  label(slide, "LIVE DEMO  ·  产品实拍页面  01 / 03", C.blue);

  slide.addText("产品 Demo · JD 智能解析", {
    x:0.55, y:0.42, w:9, h:0.65,
    fontSize:30, bold:true, color:C.white, fontFace:"Calibri", align:"left", margin:0,
  });
  slide.addText("输入岗位描述 → AI 自动提取结构化能力模型 → 生成带权重的岗位能力图谱", {
    x:0.55, y:1.1, w:9, h:0.32,
    fontSize:12, color:C.slateL, fontFace:"Calibri", align:"left", margin:0,
  });

  // 左：JD 解析截图
  if (SS.jd) browserFrame(slide, SS.jd, 0.45, 1.5, 5.5, 3.5);

  // 右：功能说明
  const points = [
    { t:"自动解析 JD", d:"将自然语言岗位描述拆解为结构化能力清单", color:C.blue },
    { t:"权重智能分配", d:"根据岗位侧重自动为每项能力分配权重（总和 100%）", color:C.cyan },
    { t:"能力分类标注", d:"按编程基础 / 框架 / 数据库 / 工程能力分类展示", color:C.purple },
    { t:"实时可视化图谱", d:"进度条 + 标签形式直观呈现岗位要求全貌", color:C.emerald },
  ];
  points.forEach((p, i) => {
    const py = 1.55 + i * 0.88;
    glowCard(slide, 6.15, py, 3.4, 0.72, p.color);
    slide.addShape(pres.shapes.RECTANGLE, { x:6.15, y:py, w:0.06, h:0.72, fill:{ color:p.color } });
    slide.addText(p.t, { x:6.3, y:py+0.06, w:3.1, h:0.28, fontSize:12, bold:true, color:p.color, fontFace:"Calibri", align:"left", margin:0 });
    slide.addText(p.d, { x:6.3, y:py+0.36, w:3.1, h:0.28, fontSize:10, color:C.slateL, fontFace:"Calibri", align:"left", margin:0 });
  });

  // 底部引用示例
  card(slide, 0.45, 5.1, 9.1, 0.36, "080E1E");
  slide.addText("示例：输入「Java 后端实习生」→ 自动生成：Java基础20% · Spring Boot25% · MySQL20% · 接口开发20% · 项目经验15%", {
    x:0.62, y:5.14, w:8.76, h:0.28,
    fontSize:10.5, color:C.cyan, fontFace:"Calibri", italic:true, align:"center", margin:0,
  });
}

// ══════════════════════════════════════════════════
// SLIDE 6  Demo 实拍 ② — 简历分析 + 证据链（核心创新）
// ══════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  bg(slide);
  label(slide, "LIVE DEMO  ·  产品实拍页面  02 / 03  ·  核心创新", C.purple);

  slide.addText("简历分析 · 证据链分析", {
    x:0.55, y:0.42, w:9, h:0.65,
    fontSize:30, bold:true, color:C.white, fontFace:"Calibri", align:"left", margin:0,
  });
  slide.addText("不只识别关键词 — 深度判断每项能力背后的「证据强度」，这是证聘 AI 的核心创新", {
    x:0.55, y:1.1, w:9, h:0.32,
    fontSize:12, color:C.slateL, fontFace:"Calibri", align:"left", margin:0,
  });

  // 左：简历分析页截图
  if (SS.resume) {
    slide.addText("简历结构化解析", { x:0.45, y:1.48, w:4.4, h:0.28, fontSize:10, bold:true, color:C.cyan, fontFace:"Calibri", align:"center", margin:0 });
    browserFrame(slide, SS.resume, 0.45, 1.78, 4.4, 2.6);
  }

  // 右：证据链分析截图
  if (SS.evidence) {
    slide.addText("证据链分析（核心创新）", { x:5.05, y:1.48, w:4.5, h:0.28, fontSize:10, bold:true, color:C.purple, fontFace:"Calibri", align:"center", margin:0 });
    browserFrame(slide, SS.evidence, 5.05, 1.78, 4.5, 2.6);
  }

  // 证据等级说明
  const levels = [
    { t:"强证据", d:"能力出现在具体项目中", c:C.emerald },
    { t:"中证据", d:"经历支撑，描述较模糊", c:C.amber },
    { t:"弱证据", d:"仅出现在技能栏", c:C.red },
    { t:"缺证据", d:"简历未体现该能力", c:C.slate },
  ];
  levels.forEach((l, i) => {
    const lx = 0.45 + i * 2.38;
    slide.addShape(pres.shapes.RECTANGLE, {
      x:lx, y:4.55, w:2.1, h:0.72,
      fill:{ color:l.c, transparency:88 }, line:{ color:l.c, width:0.8 },
    });
    slide.addText(l.t, { x:lx+0.1, y:4.6, w:1.9, h:0.28, fontSize:12, bold:true, color:l.c, fontFace:"Calibri", align:"left", margin:0 });
    slide.addText(l.d, { x:lx+0.1, y:4.9, w:1.9, h:0.28, fontSize:9.5, color:C.slateL, fontFace:"Calibri", align:"left", margin:0 });
  });
}

// ══════════════════════════════════════════════════
// SLIDE 7  Demo 实拍 ③ — 匹配评分（大屏展示）
// ══════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  bg(slide);
  label(slide, "LIVE DEMO  ·  产品实拍页面  03 / 03", C.emerald);

  slide.addText("人岗匹配评分 · 可解释决策支持", {
    x:0.55, y:0.42, w:8, h:0.65,
    fontSize:30, bold:true, color:C.white, fontFace:"Calibri", align:"left", margin:0,
  });

  // 大截图（居中展示评分页）
  if (SS.score) {
    browserFrame(slide, SS.score, 0.45, 1.15, 6.0, 3.8);
  }

  // 右侧数字解读
  slide.addText("关键数据解读", { x:6.65, y:1.15, w:3.0, h:0.32, fontSize:12, bold:true, color:C.white, fontFace:"Calibri", align:"left", margin:0 });

  const scoreItems = [
    { val:"82", unit:"/100", label:"综合匹配度", color:C.emerald },
    { val:"86", unit:"", label:"技能匹配度", color:C.blue },
    { val:"84", unit:"", label:"项目相关度", color:C.cyan },
    { val:"76", unit:"", label:"证据可信度", color:C.purple },
  ];
  scoreItems.forEach((s, i) => {
    const sy = 1.55 + i * 0.9;
    card(slide, 6.65, sy, 3.0, 0.78, C.navy);
    slide.addShape(pres.shapes.RECTANGLE, { x:6.65, y:sy, w:0.05, h:0.78, fill:{ color:s.color } });
    slide.addText(s.val, { x:6.78, y:sy+0.06, w:0.85, h:0.48, fontSize:28, bold:true, color:s.color, fontFace:"Calibri", align:"left", margin:0 });
    slide.addText(s.unit, { x:7.58, y:sy+0.26, w:0.4, h:0.28, fontSize:13, color:C.slate, fontFace:"Calibri", align:"left", margin:0 });
    slide.addText(s.label, { x:7.95, y:sy+0.06, w:1.6, h:0.6, fontSize:11, color:C.slateL, fontFace:"Calibri", align:"left", margin:0 });
  });

  // 推荐等级标签
  slide.addShape(pres.shapes.RECTANGLE, {
    x:6.65, y:5.18, w:3.0, h:0.28,
    fill:{ color:C.emerald, transparency:15 }, line:{ color:C.emerald, width:1 },
    shadow: { type:"outer", color:C.emerald, blur:12, offset:0, angle:0, opacity:0.5 },
  });
  slide.addText("✓  建议进入一面", {
    x:6.65, y:5.18, w:3.0, h:0.28,
    fontSize:12, bold:true, color:C.white, fontFace:"Calibri", align:"center", margin:0,
  });

  // 底部评分公式
  card(slide, 0.45, 5.08, 6.0, 0.38, "080E1E");
  slide.addText("综合分 = 技能35% + 项目25% + 证据20% + 潜力10% + 表达10%", {
    x:0.58, y:5.12, w:5.74, h:0.3,
    fontSize:10.5, color:C.blue, fontFace:"Calibri", italic:true, align:"center", margin:0,
  });
}

// ══════════════════════════════════════════════════
// SLIDE 8  Demo 实拍 — AI 面试任务 + 匹配报告
// ══════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  bg(slide);
  label(slide, "LIVE DEMO  ·  面试任务 & HR 决策报告", C.amber);

  slide.addText("AI 面试任务生成 · HR 匹配报告", {
    x:0.55, y:0.42, w:9, h:0.65,
    fontSize:30, bold:true, color:C.white, fontFace:"Calibri", align:"left", margin:0,
  });
  slide.addText("基于证据链短板，自动生成个性化面试验证题 · 最终输出完整 HR 决策报告", {
    x:0.55, y:1.1, w:9, h:0.32,
    fontSize:12, color:C.slateL, fontFace:"Calibri", align:"left", margin:0,
  });

  // 左：面试任务
  if (SS.interview) {
    slide.addText("AI 个性化面试任务", { x:0.45, y:1.48, w:4.4, h:0.28, fontSize:10, bold:true, color:C.amber, fontFace:"Calibri", align:"center", margin:0 });
    browserFrame(slide, SS.interview, 0.45, 1.78, 4.4, 2.5);
  }

  // 问题类型说明
  const qtypes = [
    { t:"技术追问", c:C.blue  },
    { t:"项目验证", c:C.cyan  },
    { t:"实操任务", c:C.purple },
    { t:"风险追问", c:C.red   },
  ];
  qtypes.forEach((qt, i) => {
    slide.addShape(pres.shapes.RECTANGLE, {
      x:0.45 + i*1.1, y:4.38, w:0.95, h:0.25,
      fill:{ color:qt.c, transparency:80 }, line:{ color:qt.c, width:0.7 },
    });
    slide.addText(qt.t, { x:0.45+i*1.1, y:4.38, w:0.95, h:0.25, fontSize:9, color:C.white, fontFace:"Calibri", align:"center", margin:0 });
  });

  // 右：匹配报告
  if (SS.report) {
    slide.addText("HR 完整匹配决策报告", { x:5.05, y:1.48, w:4.5, h:0.28, fontSize:10, bold:true, color:C.cyan, fontFace:"Calibri", align:"center", margin:0 });
    browserFrame(slide, SS.report, 5.05, 1.78, 4.5, 2.5);
  }

  // 报告包含要素
  const reportItems = ["候选人基本信息", "综合匹配度评分", "核心优势总结", "主要风险提示", "面试验证建议", "最终决策建议"];
  reportItems.forEach((item, i) => {
    const col = i < 3 ? C.emerald : C.amber;
    slide.addShape(pres.shapes.OVAL, { x:5.08+(i%3)*1.52, y:4.42+Math.floor(i/3)*0.3, w:0.1, h:0.1, fill:{ color:col } });
    slide.addText(item, { x:5.22+(i%3)*1.52, y:4.36+Math.floor(i/3)*0.3, w:1.4, h:0.26, fontSize:9.5, color:C.slateL, fontFace:"Calibri", align:"left", margin:0 });
  });

  // 底部完整链路说明
  card(slide, 0.45, 4.78, 9.1, 0.64, "080E1E");
  const flow = ["JD 解析", "简历分析", "证据链", "匹配评分", "面试任务", "HR 报告"];
  flow.forEach((f, i) => {
    const fx = 0.72 + i * 1.5;
    slide.addShape(pres.shapes.RECTANGLE, {
      x:fx, y:4.9, w:1.2, h:0.24,
      fill:{ color:i===5?C.emerald:C.blue, transparency:i===5?10:75 }, line:{ color:i===5?C.emerald:C.blue, width:0.8 },
    });
    slide.addText(f, { x:fx, y:4.9, w:1.2, h:0.24, fontSize:9, color:C.white, fontFace:"Calibri", align:"center", margin:0 });
    if (i < 5) slide.addText("→", { x:fx+1.2, y:4.88, w:0.3, h:0.28, fontSize:10, color:C.slate, fontFace:"Calibri", align:"center", margin:0 });
  });
}

// ══════════════════════════════════════════════════
// SLIDE 9  应用场景
// ══════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  bg(slide);
  label(slide, "USE CASES  ·  应用场景");

  slide.addText("三类核心用户，覆盖校招全链路", {
    x:0.55, y:0.42, w:9, h:0.72,
    fontSize:32, bold:true, color:C.white, fontFace:"Calibri", align:"left", margin:0,
  });

  const users = [
    {
      role:"企业 HR", icon:"👔", color:C.blue,
      scene:"校招季批量候选人筛选",
      gains:["一键生成岗位能力图谱", "自动证据链筛选简历", "匹配报告辅助面试决策", "减少误招降低用人成本"],
      pain:"筛选效率低、误招成本高",
    },
    {
      role:"高校毕业生", icon:"🎓", color:C.cyan,
      scene:"求职准备与简历优化",
      gains:["了解岗位真正需要什么", "识别自身能力缺口", "获取可执行优化建议", "针对岗位精准备考面试"],
      pain:"不知道自己差在哪里",
    },
    {
      role:"高校就业中心", icon:"🏫", color:C.purple,
      scene:"就业服务精准化升级",
      gains:["批量分析学生-岗位匹配度", "数据驱动就业指导", "精准辅导简历优化方向", "提升院校整体就业率"],
      pain:"就业辅导效率低、精准度差",
    },
  ];

  users.forEach((u, i) => {
    const ux = 0.5 + i * 3.15;
    glowCard(slide, ux, 1.3, 2.9, 4.1, u.color);
    slide.addShape(pres.shapes.RECTANGLE, { x:ux, y:1.3, w:2.9, h:0.04, fill:{ color:u.color } });

    // 角色标题
    slide.addText(u.icon + "  " + u.role, { x:ux+0.18, y:1.38, w:2.54, h:0.48, fontSize:17, bold:true, color:u.color, fontFace:"Calibri", align:"left", margin:0 });
    slide.addText("场景：" + u.scene, { x:ux+0.18, y:1.88, w:2.54, h:0.28, fontSize:10, color:C.slate, fontFace:"Calibri", italic:true, align:"left", margin:0 });

    // 核心痛点
    slide.addShape(pres.shapes.RECTANGLE, { x:ux+0.18, y:2.22, w:2.54, h:0.02, fill:{ color:C.border } });
    slide.addText("核心痛点：" + u.pain, { x:ux+0.18, y:2.28, w:2.54, h:0.28, fontSize:10, color:C.red, fontFace:"Calibri", align:"left", margin:0 });

    // 获得价值
    slide.addText("证聘 AI 带来：", { x:ux+0.18, y:2.65, w:2.54, h:0.28, fontSize:10, bold:true, color:u.color, fontFace:"Calibri", align:"left", margin:0 });
    u.gains.forEach((g, j) => {
      slide.addShape(pres.shapes.OVAL, { x:ux+0.18, y:2.98+j*0.38+0.1, w:0.1, h:0.1, fill:{ color:u.color } });
      slide.addText(g, { x:ux+0.35, y:2.98+j*0.38, w:2.37, h:0.35, fontSize:10.5, color:C.slateL, fontFace:"Calibri", align:"left", margin:0 });
    });
  });
}

// ══════════════════════════════════════════════════
// SLIDE 10  竞争优势
// ══════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  bg(slide);
  label(slide, "COMPETITIVE ADVANTAGE  ·  竞争优势");

  slide.addText("证据驱动匹配 — 行业差异化护城河", {
    x:0.55, y:0.42, w:9, h:0.72,
    fontSize:30, bold:true, color:C.white, fontFace:"Calibri", align:"left", margin:0,
  });

  // 对比表
  const headers = [
    { text:"维度", options:{ bold:true, color:C.white, fill:{ color:"0A1428" }, fontSize:11 } },
    { text:"传统招聘平台", options:{ bold:true, color:C.red, fill:{ color:"0A1428" }, fontSize:11 } },
    { text:"AI 简历优化工具", options:{ bold:true, color:C.amber, fill:{ color:"0A1428" }, fontSize:11 } },
    { text:"证聘 AI ✦", options:{ bold:true, color:C.emerald, fill:{ color:"0D1E10" }, fontSize:11 } },
  ];
  const rows = [
    ["岗位能力图谱",   "✗ 无（仅关键词）",   "✗ 无",     "✓ 结构化权重模型"],
    ["简历证据链分析", "✗ 关键词匹配",       "✗ 无",     "✓ 四级证据强度判断"],
    ["能力可信度评估", "✗ 无",               "✗ 无",     "✓ 可解释多维评分"],
    ["AI 面试任务",    "✗ 无",               "✗ 无",     "✓ 短板驱动个性化"],
    ["HR 决策报告",    "△ 简单排名",         "✗ 无",     "✓ 完整决策报告"],
    ["学生能力反馈",   "✗ 无",               "△ 简历建议", "✓ 精准能力缺口分析"],
  ];

  const allRows = [headers, ...rows.map(r => [
    { text:r[0], options:{ color:C.slateL, fontSize:10 } },
    { text:r[1], options:{ color:r[1].startsWith("✗")?C.red:C.amber, fontSize:10 } },
    { text:r[2], options:{ color:r[2].startsWith("✗")?C.red:r[2].startsWith("△")?C.amber:C.emerald, fontSize:10 } },
    { text:r[3], options:{ color:C.emerald, bold:true, fontSize:10 } },
  ])];

  slide.addTable(allRows, {
    x:0.55, y:1.32, w:9, h:3.0,
    border:{ pt:0.5, color:"1A2E4A" },
    rowH:0.43,
    colW:[2.2, 2.3, 2.3, 2.2],
  });

  // 四大技术护城河
  slide.addText("核心技术壁垒", { x:0.55, y:4.45, w:4, h:0.32, fontSize:13, bold:true, color:C.white, fontFace:"Calibri", align:"left", margin:0 });

  const moats = [
    { t:"能力要求可量化", d:"JD → 带权重结构化模型", c:C.blue },
    { t:"证据体系标准化", d:"四级强度统一判断标准", c:C.cyan },
    { t:"评分结果可解释", d:"每维度均有证据支撑说明", c:C.purple },
    { t:"面试验证闭环化", d:"分析 → 验证形成完整链路", c:C.emerald },
  ];
  moats.forEach((m, i) => {
    const mx = 0.55 + i * 2.38;
    glowCard(slide, mx, 4.85, 2.1, 0.62, m.c);
    slide.addShape(pres.shapes.RECTANGLE, { x:mx, y:4.85, w:2.1, h:0.04, fill:{ color:m.c } });
    slide.addText(m.t, { x:mx+0.14, y:4.93, w:1.82, h:0.28, fontSize:11, bold:true, color:m.c, fontFace:"Calibri", align:"left", margin:0 });
    slide.addText(m.d, { x:mx+0.14, y:5.22, w:1.82, h:0.22, fontSize:9, color:C.slate, fontFace:"Calibri", align:"left", margin:0 });
  });
}

// ══════════════════════════════════════════════════
// SLIDE 11  商业模式
// ══════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  bg(slide);
  label(slide, "BUSINESS MODEL  ·  商业模式 & 市场落地");

  slide.addText("可落地的多元商业化路径", {
    x:0.55, y:0.42, w:9, h:0.72,
    fontSize:32, bold:true, color:C.white, fontFace:"Calibri", align:"left", margin:0,
  });

  const models = [
    {
      icon:"💼", model:"企业 SaaS 订阅",
      target:"中大型企业 HR 部门",
      desc:"按月/年订阅，提供校招全流程 AI 分析服务，包含 JD 解析、批量简历分析、证据链报告、面试任务生成。",
      price:"3 万 - 20 万元 / 年",
      tag:"核心收入来源",
      color:C.blue,
    },
    {
      icon:"🏫", model:"高校合作服务",
      target:"高校就业指导中心",
      desc:"与高校就业中心签约合作，为学生提供免费匹配分析，向学校收取数据洞察和精准就业服务费。",
      price:"5 万 - 50 万元 / 校 / 年",
      tag:"规模扩张核心",
      color:C.purple,
    },
    {
      icon:"🔗", model:"招聘平台 API",
      target:"智联 / BOSS / 校招通",
      desc:"以 OpenAPI 形式接入主流招聘平台，提供可信匹配能力增值服务，按 API 调用量或功能使用计费。",
      price:"按调用量 + 分成",
      tag:"生态入口",
      color:C.cyan,
    },
  ];

  models.forEach((m, i) => {
    const mx = 0.5 + i * 3.15;
    glowCard(slide, mx, 1.3, 2.9, 3.55, m.color);
    slide.addShape(pres.shapes.RECTANGLE, { x:mx, y:1.3, w:2.9, h:0.04, fill:{ color:m.color } });

    // 标签
    slide.addShape(pres.shapes.RECTANGLE, { x:mx+0.18, y:1.38, w:1.5, h:0.24, fill:{ color:m.color, transparency:80 }, line:{ color:m.color, width:0.7 } });
    slide.addText(m.tag, { x:mx+0.18, y:1.38, w:1.5, h:0.24, fontSize:8.5, color:m.color, fontFace:"Calibri", bold:true, align:"center", margin:0 });

    slide.addText(m.icon + "  " + m.model, { x:mx+0.18, y:1.7, w:2.54, h:0.42, fontSize:15, bold:true, color:C.white, fontFace:"Calibri", align:"left", margin:0 });
    slide.addText("目标：" + m.target, { x:mx+0.18, y:2.14, w:2.54, h:0.25, fontSize:9.5, color:C.slate, fontFace:"Calibri", align:"left", margin:0 });
    slide.addText(m.desc, { x:mx+0.18, y:2.45, w:2.54, h:1.0, fontSize:10, color:C.slateL, fontFace:"Calibri", align:"left", margin:0 });
    slide.addShape(pres.shapes.RECTANGLE, { x:mx+0.18, y:3.5, w:2.54, h:0.02, fill:{ color:m.color, transparency:50 } });
    slide.addText("定价参考：" + m.price, { x:mx+0.18, y:3.56, w:2.54, h:0.28, fontSize:10.5, bold:true, color:m.color, fontFace:"Calibri", align:"left", margin:0 });
  });

  // 市场规模数据
  const mktStats = [
    { val:"1076 万", label:"2024 届毕业生", c:C.blue },
    { val:"6000 亿+", label:"人才服务市场规模", c:C.purple },
    { val:"80%+", label:"HR 呼吁效率提升", c:C.cyan },
  ];
  mktStats.forEach((s, i) => {
    const sx = 0.55 + i * 3.15;
    card(slide, sx, 4.98, 2.9, 0.52, C.navy);
    slide.addText(s.val, { x:sx+0.18, y:5.02, w:1.6, h:0.32, fontSize:18, bold:true, color:s.c, fontFace:"Calibri", align:"left", margin:0 });
    slide.addText(s.label, { x:sx+1.78, y:5.06, w:0.94, h:0.26, fontSize:9, color:C.slate, fontFace:"Calibri", align:"left", margin:0 });
  });
}

// ══════════════════════════════════════════════════
// SLIDE 12  未来规划
// ══════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  bg(slide);
  label(slide, "ROADMAP  ·  未来规划");

  slide.addText("三阶段演进 · 从 Demo 到规模化落地", {
    x:0.55, y:0.42, w:9, h:0.72,
    fontSize:30, bold:true, color:C.white, fontFace:"Calibri", align:"left", margin:0,
  });

  const phases = [
    {
      phase:"Phase 1", tag:"当前阶段",
      title:"Demo 验证",
      color:C.emerald,
      items:["完整 7 页面 Demo 系统", "JD 解析 + 证据链 + 评分闭环", "DeepSeek API 真实接入", "多格式简历解析支持", "比赛演示 & 评委验收"],
    },
    {
      phase:"Phase 2", tag:"6 个月内",
      title:"产品化落地",
      color:C.blue,
      items:["真实登录 & 权限系统", "数据库持久化存储", "批量简历上传处理", "学生端完整链路", "首批高校就业中心合作"],
    },
    {
      phase:"Phase 3", tag:"1-2 年内",
      title:"规模化平台",
      color:C.purple,
      items:["主流招聘平台 API 接入", "企业 SaaS 商业化运营", "自研招聘场景专属模型", "多城市高校规模覆盖", "构建可信招聘行业标准"],
    },
  ];

  phases.forEach((ph, i) => {
    const px = 0.5 + i * 3.15;
    glowCard(slide, px, 1.32, 2.9, 3.8, ph.color);
    slide.addShape(pres.shapes.RECTANGLE, { x:px, y:1.32, w:2.9, h:0.05, fill:{ color:ph.color } });

    slide.addText(ph.phase, { x:px+0.18, y:1.42, w:1.5, h:0.28, fontSize:11, bold:true, color:ph.color, fontFace:"Calibri", align:"left", margin:0 });
    slide.addShape(pres.shapes.RECTANGLE, { x:px+1.72, y:1.44, w:1.0, h:0.22, fill:{ color:ph.color, transparency:80 }, line:{ color:ph.color, width:0.7 } });
    slide.addText(ph.tag, { x:px+1.72, y:1.44, w:1.0, h:0.22, fontSize:8.5, color:ph.color, fontFace:"Calibri", align:"center", margin:0 });

    slide.addText(ph.title, { x:px+0.18, y:1.76, w:2.54, h:0.46, fontSize:20, bold:true, color:C.white, fontFace:"Calibri", align:"left", margin:0 });
    slide.addShape(pres.shapes.RECTANGLE, { x:px+0.18, y:2.28, w:2.54, h:0.02, fill:{ color:C.border } });

    ph.items.forEach((item, j) => {
      slide.addShape(pres.shapes.OVAL, { x:px+0.2, y:2.38+j*0.48+0.14, w:0.1, h:0.1, fill:{ color:ph.color } });
      slide.addText(item, { x:px+0.36, y:2.38+j*0.48, w:2.36, h:0.42, fontSize:10.5, color:C.slateL, fontFace:"Calibri", align:"left", margin:0 });
    });
  });

  // 时间轴
  slide.addShape(pres.shapes.LINE, { x:0.55, y:5.28, w:8.9, h:0, line:{ color:C.border, width:1, dashType:"sysDot" } });
  [{ x:0.55, l:"当前" }, { x:4.8, l:"6 个月" }, { x:9.45, l:"1-2 年" }].forEach(n => {
    slide.addShape(pres.shapes.OVAL, { x:n.x-0.1, y:5.22, w:0.18, h:0.18, fill:{ color:C.blue } });
    slide.addText(n.l, { x:n.x-0.5, y:5.44, w:1.2, h:0.22, fontSize:9, color:C.slate, fontFace:"Calibri", align:"center", margin:0 });
  });
}

// ══════════════════════════════════════════════════
// SLIDE 13  总结收尾
// ══════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  slide.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:10, h:0.04, fill:{ color:C.blue } });

  // 背景光晕
  slide.addShape(pres.shapes.OVAL, { x:-1, y:-1, w:7, h:7, fill:{ color:C.blue, transparency:93 } });
  slide.addShape(pres.shapes.OVAL, { x:5.5, y:1.5, w:6, h:6, fill:{ color:C.purple, transparency:91 } });

  // 左侧暗色块
  slide.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:5.0, h:5.625, fill:{ color:"05101F" } });
  slide.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:0.22, h:5.625, fill:{ color:C.cyan } });

  // 左侧内容
  slide.addText("TRUSTHIRE AI", { x:0.45, y:0.55, w:4.3, h:0.32, fontSize:10, color:C.cyan, fontFace:"Calibri", bold:true, charSpacing:6, align:"left", margin:0 });
  slide.addText("证聘 AI", { x:0.42, y:0.9, w:4.3, h:1.0, fontSize:54, bold:true, color:C.white, fontFace:"Calibri", align:"left", margin:0 });

  slide.addText("让企业看到真实能力\n让学生获得公平机会\n让招聘回归证据驱动", {
    x:0.42, y:2.05, w:4.3, h:1.0,
    fontSize:16, color:C.slateL, fontFace:"Calibri", align:"left", margin:0,
  });

  slide.addShape(pres.shapes.RECTANGLE, { x:0.42, y:3.18, w:3.8, h:0.02, fill:{ color:C.border } });

  // 核心总结项
  const sumItems = [
    { icon:"⚡", t:"5 大 AI 智能体协同工作" },
    { icon:"🔍", t:"4 级证据链能力判断体系" },
    { icon:"📊", t:"5 维度可解释人岗匹配评分" },
    { icon:"🎯", t:"覆盖 HR / 学生 / 高校三端" },
  ];
  sumItems.forEach((s, i) => {
    slide.addText(s.icon + "  " + s.t, { x:0.42, y:3.32+i*0.42, w:4.3, h:0.38, fontSize:12.5, color:C.slateL, fontFace:"Calibri", align:"left", margin:0 });
  });

  // 右侧使命卡片
  glowCard(slide, 5.15, 0.55, 4.4, 2.25, C.blue);
  slide.addText("我们的使命", { x:5.35, y:0.72, w:4.0, h:0.32, fontSize:12, color:C.slate, fontFace:"Calibri", bold:true, align:"left", margin:0 });
  slide.addText("简历越来越漂亮，\n但真实能力越来越难判断。\n\n证聘 AI 要让每一份\n有真实能力的简历被看见。", {
    x:5.35, y:1.1, w:4.0, h:1.55,
    fontSize:14, color:C.white, fontFace:"Calibri", italic:true, align:"center", margin:0,
  });

  // 四大价值卡片
  const vals = [
    { t:"可信", d:"证据驱动，能力看得见", c:C.emerald },
    { t:"高效", d:"AI 加持，10 秒完成筛选", c:C.blue },
    { t:"公平", d:"真实能力，非包装胜出", c:C.cyan },
    { t:"落地", d:"对接企业、高校、平台", c:C.purple },
  ];
  vals.forEach((v, i) => {
    const vx = 5.15 + (i%2)*2.22;
    const vy = 3.0 + Math.floor(i/2)*1.0;
    glowCard(slide, vx, vy, 2.0, 0.82, v.c);
    slide.addShape(pres.shapes.RECTANGLE, { x:vx, y:vy, w:0.06, h:0.82, fill:{ color:v.c } });
    slide.addText(v.t, { x:vx+0.18, y:vy+0.06, w:1.7, h:0.36, fontSize:20, bold:true, color:v.c, fontFace:"Calibri", align:"left", margin:0 });
    slide.addText(v.d, { x:vx+0.18, y:vy+0.46, w:1.7, h:0.28, fontSize:9.5, color:C.slate, fontFace:"Calibri", align:"left", margin:0 });
  });

  // 底部
  slide.addShape(pres.shapes.RECTANGLE, { x:0, y:5.25, w:10, h:0.375, fill:{ color:"060F22" } });
  slide.addShape(pres.shapes.RECTANGLE, { x:0, y:5.25, w:10, h:0.02, fill:{ color:C.border } });
  slide.addText("AI + 人才服务赛道  ·  证聘 AI TrustHire AI  ·  让招聘从关键词匹配走向证据驱动匹配", {
    x:0, y:5.3, w:10, h:0.3,
    fontSize:9, color:C.slate, fontFace:"Calibri", align:"center", margin:0,
  });
}

// ── 输出 ──────────────────────────────────────────
const out = "E:/dy/1/智聘未来/证聘AI-TrustHireAI-演示PPT-V2.pptx";
pres.writeFile({ fileName: out }).then(() => {
  console.log("PPT V2 已生成：" + out);
}).catch(err => console.error("失败：", err));
