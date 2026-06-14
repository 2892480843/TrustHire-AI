"use strict";
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

const outDir = path.join(__dirname, "demo-screenshots");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--lang=zh-CN"],
    defaultViewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({ "Accept-Language": "zh-CN,zh;q=0.9" });

  // 1. 进入 Dashboard 并注入样例数据
  await page.goto("http://localhost:5173/#/dashboard", { waitUntil: "networkidle2", timeout: 20000 });
  await new Promise(r => setTimeout(r, 2000));

  // 点击"使用样例数据（演示）"按钮
  try {
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const target = btns.find(b => b.textContent && b.textContent.includes("使用样例数据"));
      if (target) target.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    console.log("已注入样例数据");
  } catch (e) {
    console.log("注入样例数据失败:", e.message);
  }

  // 截图 Dashboard
  await page.screenshot({ path: path.join(outDir, "01-dashboard.png") });
  console.log("截图: 01-dashboard");

  // 2. 其他页面（数据已通过 React Context 共享）
  const pages = [
    { hash: "#/job",       name: "02-jd-parse" },
    { hash: "#/resume",    name: "03-resume" },
    { hash: "#/evidence",  name: "04-evidence" },
    { hash: "#/score",     name: "05-score" },
    { hash: "#/interview", name: "06-interview" },
    { hash: "#/report",    name: "07-report" },
  ];

  for (const p of pages) {
    await page.evaluate((hash) => { window.location.hash = hash; }, p.hash);
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(outDir, `${p.name}.png`) });
    console.log("截图:", p.name);
  }

  await browser.close();
  console.log("全部完成");
})();
