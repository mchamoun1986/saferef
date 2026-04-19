const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const {
  FaShieldAlt, FaRobot, FaServer, FaCheckCircle, FaTimesCircle,
  FaExclamationTriangle, FaBolt, FaClock, FaUsers, FaLock,
  FaChartLine, FaFileAlt, FaTools, FaGavel, FaEye, FaDollarSign,
  FaStar, FaArrowRight, FaUserTie, FaGraduationCap
} = require("react-icons/fa");

// ── Icon Helper ──────────────────────────────────────────────────────
function renderIconSvg(IconComponent, color = "#000000", size = 256) {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
}

async function iconToBase64Png(IconComponent, color, size = 256) {
  const svg = renderIconSvg(IconComponent, color, size);
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + pngBuffer.toString("base64");
}

// ── Colors ───────────────────────────────────────────────────────────
const C = {
  navy:       "16354B",
  navyLight:  "1E4A6A",
  red:        "E63946",
  green:      "2E7D32",
  greenLight: "A7C031",
  white:      "FFFFFF",
  offWhite:   "F5F7FA",
  gray100:    "F1F3F5",
  gray200:    "DEE2E6",
  gray400:    "868E96",
  gray600:    "495057",
  gray800:    "212529",
  amber:      "F59E0B",
  amberLight: "FEF3C7",
  redLight:   "FEE2E6",
  greenBg:    "E8F5E9",
};

// ── Reusable helpers ─────────────────────────────────────────────────
const mkShadow = () => ({ type: "outer", blur: 6, offset: 2, angle: 135, color: "000000", opacity: 0.12 });

function addFooter(slide, pageNum, totalPages) {
  slide.addText("SafeRef — Confidential", { x: 0.5, y: 5.15, w: 5, h: 0.35, fontSize: 8, color: C.gray400, fontFace: "Calibri" });
  slide.addText(`${pageNum} / ${totalPages}`, { x: 8.5, y: 5.15, w: 1, h: 0.35, fontSize: 8, color: C.gray400, fontFace: "Calibri", align: "right" });
}

function addRedBar(slide) {
  slide.addShape(slide._slideLayout ? undefined : "rect", null);
}

function makeHeaderRow(cols) {
  return cols.map(text => ({
    text,
    options: { bold: true, color: C.white, fill: { color: C.navy }, fontSize: 10, fontFace: "Calibri", align: text === cols[0] ? "left" : "center", valign: "middle" }
  }));
}

function makeDataRow(cells, isEven) {
  const bg = isEven ? C.gray100 : C.white;
  return cells.map((cell, ci) => ({
    text: cell,
    options: {
      fontSize: 10, fontFace: "Calibri",
      fill: { color: bg },
      color: ci === 0 ? C.gray800 : (ci === 1 ? C.green : C.red),
      align: ci === 0 ? "left" : "center",
      valign: "middle",
      bold: ci === 1
    }
  }));
}

function addCallout(slide, text, y, accentColor, bgColor, textColor) {
  slide.addShape("rect", { x: 0.5, y, w: 9.0, h: 0.6, fill: { color: bgColor } });
  slide.addShape("rect", { x: 0.5, y, w: 0.06, h: 0.6, fill: { color: accentColor } });
  slide.addText(text, {
    x: 0.8, y, w: 8.5, h: 0.6, fontSize: 11.5, fontFace: "Calibri",
    color: textColor || accentColor, italic: true, valign: "middle", margin: 0
  });
}

// ── Build Presentation ──────────────────────────────────────────────
async function build() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Marwan Chamoun — Orchitech";
  pres.title = "SafeRef vs AI Chatbot — SAMON Pitch";

  const TOTAL = 10;

  // ── Pre-render icons ──────────────────────────────────────────────
  const icons = {
    shield:   await iconToBase64Png(FaShieldAlt, `#${C.navy}`),
    shieldW:  await iconToBase64Png(FaShieldAlt, `#${C.white}`),
    robot:    await iconToBase64Png(FaRobot, `#${C.gray600}`),
    robotW:   await iconToBase64Png(FaRobot, `#${C.white}`),
    server:   await iconToBase64Png(FaServer, `#${C.gray600}`),
    serverW:  await iconToBase64Png(FaServer, `#${C.white}`),
    check:    await iconToBase64Png(FaCheckCircle, `#${C.green}`),
    cross:    await iconToBase64Png(FaTimesCircle, `#${C.red}`),
    warn:     await iconToBase64Png(FaExclamationTriangle, `#${C.amber}`),
    bolt:     await iconToBase64Png(FaBolt, `#${C.red}`),
    clock:    await iconToBase64Png(FaClock, `#${C.navy}`),
    users:    await iconToBase64Png(FaUsers, `#${C.navy}`),
    lock:     await iconToBase64Png(FaLock, `#${C.navy}`),
    chart:    await iconToBase64Png(FaChartLine, `#${C.navy}`),
    file:     await iconToBase64Png(FaFileAlt, `#${C.navy}`),
    tools:    await iconToBase64Png(FaTools, `#${C.navy}`),
    gavel:    await iconToBase64Png(FaGavel, `#${C.red}`),
    dollar:   await iconToBase64Png(FaDollarSign, `#${C.green}`),
    star:     await iconToBase64Png(FaStar, `#${C.amber}`),
    arrow:    await iconToBase64Png(FaArrowRight, `#${C.white}`),
    userTie:  await iconToBase64Png(FaUserTie, `#${C.red}`),
    userTieW: await iconToBase64Png(FaUserTie, `#${C.white}`),
    grad:     await iconToBase64Png(FaGraduationCap, `#${C.navy}`),
    dollarR:  await iconToBase64Png(FaDollarSign, `#${C.red}`),
  };

  // ════════════════════════════════════════════════════════════════════
  // SLIDE 1 — TITLE
  // ════════════════════════════════════════════════════════════════════
  let s1 = pres.addSlide();
  s1.background = { color: C.navy };
  s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.red } });

  s1.addText([
    { text: "Safe", options: { color: C.red, fontSize: 48, fontFace: "Georgia", bold: true } },
    { text: "Ref", options: { color: C.white, fontSize: 48, fontFace: "Georgia", bold: true } },
  ], { x: 0.8, y: 1.0, w: 8.4, h: 1.0, margin: 0 });

  s1.addText("vs AI Chatbot", {
    x: 0.8, y: 1.9, w: 8.4, h: 0.6, fontSize: 32, fontFace: "Calibri Light", color: C.gray200, margin: 0
  });

  s1.addText("Deterministic compliance engine vs AI-generated answers\nfor gas detection sizing in HVAC & Refrigeration", {
    x: 0.8, y: 2.8, w: 8.4, h: 0.9, fontSize: 15, fontFace: "Calibri", color: C.gray400, margin: 0
  });

  s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.0, w: 10, h: 0.625, fill: { color: C.navyLight } });
  s1.addText("Confidential — Orchitech x SAMON", { x: 0.8, y: 5.05, w: 5, h: 0.5, fontSize: 10, color: C.gray400, fontFace: "Calibri" });
  s1.addText("April 2026", { x: 7, y: 5.05, w: 2.2, h: 0.5, fontSize: 10, color: C.gray400, fontFace: "Calibri", align: "right" });

  // ════════════════════════════════════════════════════════════════════
  // SLIDE 2 — THE CHALLENGE
  // ════════════════════════════════════════════════════════════════════
  let s2 = pres.addSlide();
  s2.background = { color: C.offWhite };
  s2.addText("The Challenge", { x: 0.6, y: 0.35, w: 8.8, h: 0.55, fontSize: 26, fontFace: "Georgia", bold: true, color: C.navy, margin: 0 });
  s2.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 0.95, w: 1.2, h: 0.04, fill: { color: C.red } });

  const problems = [
    { title: "Manual Process", desc: "Engineers use PDFs, Excel sheets, and\npaper catalogs. Slow, error-prone,\nand untraceable.", icon: icons.file },
    { title: "No Dedicated Tool", desc: "No competitor offers an integrated\ncompliance + product selection\ntool for gas detection.", icon: icons.tools },
    { title: "Safety-Critical", desc: "R717 (ammonia), R290 (propane),\nR744 (CO2): a wrong calculation\ncan have lethal consequences.", icon: icons.gavel },
    { title: "Lost Sales", desc: "Long sales cycles: customers wait\ndays for a manually built quote.\nCompetitors move faster.", icon: icons.clock },
  ];

  problems.forEach((p, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.6 + col * 4.5;
    const y = 1.3 + row * 1.85;
    s2.addShape(pres.shapes.RECTANGLE, { x, y, w: 4.1, h: 1.55, fill: { color: C.white }, shadow: mkShadow() });
    s2.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.06, h: 1.55, fill: { color: C.red } });
    s2.addImage({ data: p.icon, x: x + 0.3, y: y + 0.25, w: 0.4, h: 0.4 });
    s2.addText(p.title, { x: x + 0.85, y: y + 0.2, w: 3.0, h: 0.35, fontSize: 15, fontFace: "Georgia", bold: true, color: C.navy, margin: 0 });
    s2.addText(p.desc, { x: x + 0.85, y: y + 0.6, w: 3.0, h: 0.8, fontSize: 11, fontFace: "Calibri", color: C.gray600, margin: 0 });
  });

  addFooter(s2, 2, TOTAL);

  // ════════════════════════════════════════════════════════════════════
  // SLIDE 3 — THREE APPROACHES
  // ════════════════════════════════════════════════════════════════════
  let s3 = pres.addSlide();
  s3.background = { color: C.offWhite };
  s3.addText("Three Possible Approaches", { x: 0.6, y: 0.35, w: 8.8, h: 0.55, fontSize: 26, fontFace: "Georgia", bold: true, color: C.navy, margin: 0 });
  s3.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 0.95, w: 1.2, h: 0.04, fill: { color: C.red } });

  const solutions = [
    {
      label: "A", title: "SafeRef", subtitle: "Deterministic Engine",
      desc: "Hard-coded calculation engines\n(EN378, ASHRAE 15, ISO 5149),\nstructured product database,\nmulti-step wizard, PDF quotes.",
      color: C.navy, icon: icons.shieldW
    },
    {
      label: "B", title: "API Chatbot", subtitle: "GPT-4 / Claude API",
      desc: "Chat interface powered by an\nexternal AI API, prompted with\ncatalog data and regulation\ndocuments.",
      color: C.gray600, icon: icons.robotW
    },
    {
      label: "C", title: "Self-hosted LLM", subtitle: "Llama / Mistral on-prem",
      desc: "AI model running on SAMON's\nown GPU servers, no external\ndependency but significant\ninfrastructure investment.",
      color: C.gray400, icon: icons.serverW
    },
  ];

  solutions.forEach((sol, i) => {
    const x = 0.5 + i * 3.15;
    const w = 2.9;
    s3.addShape(pres.shapes.RECTANGLE, { x, y: 1.3, w, h: 3.5, fill: { color: C.white }, shadow: mkShadow() });
    s3.addShape(pres.shapes.RECTANGLE, { x, y: 1.3, w, h: 1.1, fill: { color: sol.color } });
    s3.addImage({ data: sol.icon, x: x + 0.2, y: 1.45, w: 0.5, h: 0.5 });
    s3.addText(sol.title, { x: x + 0.8, y: 1.4, w: 1.9, h: 0.35, fontSize: 18, fontFace: "Georgia", bold: true, color: C.white, margin: 0 });
    s3.addText(sol.subtitle, { x: x + 0.8, y: 1.8, w: 1.9, h: 0.3, fontSize: 11, fontFace: "Calibri", color: C.gray200, margin: 0 });
    s3.addText(sol.desc, { x: x + 0.25, y: 2.65, w: w - 0.5, h: 1.4, fontSize: 12, fontFace: "Calibri", color: C.gray600, margin: 0 });
  });

  addFooter(s3, 3, TOTAL);

  // ════════════════════════════════════════════════════════════════════
  // SLIDE 4 — THE HIDDEN COST: AI TALENT
  // ════════════════════════════════════════════════════════════════════
  let s4 = pres.addSlide();
  s4.background = { color: C.offWhite };
  s4.addText("The Hidden Cost: AI Talent", { x: 0.6, y: 0.35, w: 8.8, h: 0.55, fontSize: 26, fontFace: "Georgia", bold: true, color: C.navy, margin: 0 });
  s4.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 0.95, w: 1.2, h: 0.04, fill: { color: C.red } });

  // 3 talent cards
  const talents = [
    {
      role: "Web Developer",
      need: "SafeRef",
      salary: "40-60k\u20AC/yr",
      availability: "Easy to hire",
      note: "Standard skills.\nAny dev agency can maintain it.",
      color: C.green, bg: C.greenBg, icon: icons.tools
    },
    {
      role: "Prompt Engineer",
      need: "API Chatbot",
      salary: "50-80k\u20AC/yr",
      availability: "Moderate",
      note: "New discipline, few proven experts.\nMust understand HVAC domain.",
      color: C.amber, bg: C.amberLight, icon: icons.userTie
    },
    {
      role: "ML / AI Engineer",
      need: "Self-hosted LLM",
      salary: "80-150k\u20AC/yr",
      availability: "Very scarce",
      note: "Top talent goes to Google, Meta,\nOpenAI. Not to gas detection.",
      color: C.red, bg: C.redLight, icon: icons.grad
    },
  ];

  talents.forEach((t, i) => {
    const x = 0.5 + i * 3.15;
    const w = 2.9;
    s4.addShape(pres.shapes.RECTANGLE, { x, y: 1.2, w, h: 3.5, fill: { color: C.white }, shadow: mkShadow() });
    // Colored top strip
    s4.addShape(pres.shapes.RECTANGLE, { x, y: 1.2, w, h: 0.08, fill: { color: t.color } });
    // Icon
    s4.addImage({ data: t.icon, x: x + (w / 2 - 0.25), y: 1.45, w: 0.5, h: 0.5 });
    // Role
    s4.addText(t.role, { x, y: 2.05, w, h: 0.35, fontSize: 15, fontFace: "Georgia", bold: true, color: C.navy, align: "center", margin: 0 });
    // Needed for
    s4.addText(`Required for: ${t.need}`, { x, y: 2.4, w, h: 0.25, fontSize: 10, fontFace: "Calibri", color: C.gray400, align: "center", margin: 0 });
    // Salary big
    s4.addText(t.salary, { x, y: 2.75, w, h: 0.5, fontSize: 26, fontFace: "Georgia", bold: true, color: t.color, align: "center", margin: 0 });
    // Availability
    s4.addText(`Availability: ${t.availability}`, { x, y: 3.3, w, h: 0.25, fontSize: 11, fontFace: "Calibri", bold: true, color: t.color, align: "center", margin: 0 });
    // Note
    s4.addText(t.note, { x: x + 0.2, y: 3.65, w: w - 0.4, h: 0.8, fontSize: 10.5, fontFace: "Calibri", color: C.gray600, align: "center", margin: 0 });
  });

  addCallout(s4, "SAMON has zero AI staff today. Hiring even one ML engineer costs more than 2 years of SafeRef hosting.", 4.85, C.red, C.redLight, C.red);

  addFooter(s4, 4, TOTAL);

  // ════════════════════════════════════════════════════════════════════
  // SLIDE 5 — TOTAL COST OF OWNERSHIP
  // ════════════════════════════════════════════════════════════════════
  let s5 = pres.addSlide();
  s5.background = { color: C.offWhite };
  s5.addText("Total Cost of Ownership (3-Year)", { x: 0.6, y: 0.35, w: 8.8, h: 0.55, fontSize: 26, fontFace: "Georgia", bold: true, color: C.navy, margin: 0 });
  s5.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 0.95, w: 1.2, h: 0.04, fill: { color: C.red } });

  const tcoHeaders = [makeHeaderRow(["Cost Item", "SafeRef", "API Chatbot", "Self-hosted LLM"])];
  const tcoRows = [
    ["Development", "Already built", "\u20AC3-8k", "\u20AC15-50k"],
    ["Hosting / month", "\u20AC20-50", "\u20AC0 (third-party)", "\u20AC500-2,000 (GPU)"],
    ["AI talent / year", "\u20AC0 (web dev)", "\u20AC50-80k (prompt eng.)", "\u20AC80-150k (ML eng.)"],
    ["API cost / year", "\u20AC0", "\u20AC5-30k (usage)", "\u20AC0"],
    ["Hardware", "None", "None", "\u20AC5-15k GPU upfront"],
    ["Product updates", "\u20AC0 (admin panel)", "Re-index docs", "\u20AC500-2k (re-train)"],
    ["3-year total", "~\u20AC2k", "\u20AC170-280k", "\u20AC280-530k"],
  ];

  const tcoData = [...tcoHeaders, ...tcoRows.map((r, i) => {
    const bg = i % 2 === 0 ? C.gray100 : C.white;
    const isLast = i === tcoRows.length - 1;
    return r.map((cell, ci) => ({
      text: cell,
      options: {
        fontSize: isLast ? 11 : 10,
        fontFace: "Calibri",
        fill: { color: isLast ? C.navy : bg },
        color: isLast ? C.white : (ci === 0 ? C.gray800 : (ci === 1 ? C.green : C.red)),
        align: ci === 0 ? "left" : "center",
        valign: "middle",
        bold: ci === 1 || isLast
      }
    }));
  })];

  s5.addTable(tcoData, {
    x: 0.5, y: 1.15, w: 9.0, colW: [2.3, 2.2, 2.3, 2.2],
    border: { pt: 0.5, color: C.gray200 },
    rowH: [0.4, 0.38, 0.38, 0.38, 0.38, 0.38, 0.38, 0.42],
  });

  addCallout(s5, "Including talent costs, a chatbot is 100x more expensive than SafeRef over 3 years.", 4.55, C.red, C.redLight, C.red);

  addFooter(s5, 5, TOTAL);

  // ════════════════════════════════════════════════════════════════════
  // SLIDE 6 — RELIABILITY & ACCURACY
  // ════════════════════════════════════════════════════════════════════
  let s6 = pres.addSlide();
  s6.background = { color: C.offWhite };
  s6.addText("Reliability & Accuracy", { x: 0.6, y: 0.35, w: 8.8, h: 0.55, fontSize: 26, fontFace: "Georgia", bold: true, color: C.navy, margin: 0 });
  s6.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 0.95, w: 1.2, h: 0.04, fill: { color: C.red } });

  const relHeaders = [makeHeaderRow(["Criterion", "SafeRef", "API Chatbot", "Self-hosted LLM"])];
  const relRows = [
    ["Determinism", "100% reproducible", "Variable output", "Variable output"],
    ["Hallucination risk", "0%", "2-10%", "5-20%"],
    ["Arithmetic accuracy", "100% (code)", "95-98%", "85-95%"],
    ["Multi-zone handling", "10+ zones, structured", "Loses track at 2-3", "Loses track at 1-2"],
    ["Unit test coverage", "154 tests passing", "Impossible", "Impossible"],
    ["Same result in 5 years?", "Yes", "No \u2014 model changes", "No \u2014 model frozen"],
  ];

  const relData = [...relHeaders, ...relRows.map((r, i) => makeDataRow(r, i % 2 === 0))];
  s6.addTable(relData, {
    x: 0.5, y: 1.15, w: 9.0, colW: [2.3, 2.2, 2.3, 2.2],
    border: { pt: 0.5, color: C.gray200 },
    rowH: [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4],
  });

  addCallout(s6, "A chatbot says \u201Cprobably compliant.\u201D SafeRef says \u201CYES or NO \u2014 here is the exact calculation per EN378 \u00A7C.3.\u201D", 4.25, C.red, C.redLight, C.red);

  addFooter(s6, 6, TOTAL);

  // ════════════════════════════════════════════════════════════════════
  // SLIDE 7 — REGULATORY COMPLIANCE & LIABILITY
  // ════════════════════════════════════════════════════════════════════
  let s7 = pres.addSlide();
  s7.background = { color: C.offWhite };
  s7.addText("Regulatory Compliance & Liability", { x: 0.6, y: 0.35, w: 8.8, h: 0.55, fontSize: 26, fontFace: "Georgia", bold: true, color: C.navy, margin: 0 });
  s7.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 0.95, w: 1.2, h: 0.04, fill: { color: C.red } });

  const compHeaders = [makeHeaderRow(["Criterion", "SafeRef", "API Chatbot", "Self-hosted LLM"])];
  const compRows = [
    ["Calculation traceability", "Full trace (EN378 \u00A7C.3)", "None", "None"],
    ["Certifiable by authority", "Yes (deterministic code)", "No", "No"],
    ["Legal liability", "Clear \u2014 signed document", "Unclear \u2014 \u201Cthe bot said...\u201D", "Unclear"],
    ["EN378 implemented", "Yes \u2014 tested code", "Partial knowledge", "Very partial"],
    ["ASHRAE 15 implemented", "Yes \u2014 tested code", "Partial knowledge", "Very partial"],
    ["ISO 5149 implemented", "Yes \u2014 tested code", "Partial knowledge", "Very partial"],
    ["Data privacy (GDPR)", "Compliant \u2014 own servers", "Risk \u2014 data leaves EU", "Compliant"],
    ["Vendor dependency", "None", "Total (API provider)", "None"],
  ];

  const compData = [...compHeaders, ...compRows.map((r, i) => makeDataRow(r, i % 2 === 0))];
  s7.addTable(compData, {
    x: 0.5, y: 1.15, w: 9.0, colW: [2.3, 2.2, 2.3, 2.2],
    border: { pt: 0.5, color: C.gray200 },
    rowH: [0.38, 0.36, 0.36, 0.36, 0.36, 0.36, 0.36, 0.36, 0.36],
  });

  addCallout(s7, "If an installer has an incident and says \u201Cthe SAMON chatbot told me 2 detectors were enough,\u201D who is liable?", 4.5, C.red, C.redLight, C.red);

  addFooter(s7, 7, TOTAL);

  // ════════════════════════════════════════════════════════════════════
  // SLIDE 8 — PERFORMANCE & REAL-WORLD SCENARIOS
  // ════════════════════════════════════════════════════════════════════
  let s8 = pres.addSlide();
  s8.background = { color: C.offWhite };
  s8.addText("Performance & Real-World Scenarios", { x: 0.6, y: 0.35, w: 8.8, h: 0.55, fontSize: 26, fontFace: "Georgia", bold: true, color: C.navy, margin: 0 });
  s8.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 0.95, w: 1.2, h: 0.04, fill: { color: C.red } });

  // Big stats
  const stats = [
    { value: "50 ms", label: "SafeRef\nper request", color: C.green, bg: C.greenBg },
    { value: "3-12 s", label: "API Chatbot\nper request", color: C.amber, bg: C.amberLight },
    { value: "5-30 s", label: "Self-hosted LLM\nper request", color: C.red, bg: C.redLight },
  ];

  stats.forEach((st, i) => {
    const x = 0.5 + i * 3.15;
    s8.addShape(pres.shapes.RECTANGLE, { x, y: 1.2, w: 2.9, h: 1.35, fill: { color: st.bg }, shadow: mkShadow() });
    s8.addText(st.value, { x, y: 1.22, w: 2.9, h: 0.7, fontSize: 34, fontFace: "Georgia", bold: true, color: st.color, align: "center", valign: "middle", margin: 0 });
    s8.addText(st.label, { x, y: 1.92, w: 2.9, h: 0.5, fontSize: 10.5, fontFace: "Calibri", color: C.gray600, align: "center", valign: "middle", margin: 0 });
  });

  // Scenario table
  const scenHeaders = [makeHeaderRow(["Scenario", "SafeRef", "API Chatbot", "Self-hosted LLM"])];
  const scenRows = [
    ["5-zone project", "5-10 sec (clicks)", "1-2 min (dialogue)", "3-5 min (dialogue)"],
    ["100 concurrent users", "No issue", "Rate limiting / queue", "GPU saturated"],
    ["Trade show (weak WiFi)", "Works offline", "Blocked", "Requires VPN"],
    ["50 demos in a day", "\u20AC0", "~\u20AC50 API cost", "GPU overloaded by noon"],
    ["Lifespan", "5-10 years", "1-2 years (model changes)", "2-3 years (model frozen)"],
  ];

  const scenData = [...scenHeaders, ...scenRows.map((r, i) => makeDataRow(r, i % 2 === 0))];
  s8.addTable(scenData, {
    x: 0.5, y: 2.8, w: 9.0, colW: [2.3, 2.2, 2.3, 2.2],
    border: { pt: 0.5, color: C.gray200 },
    rowH: [0.38, 0.36, 0.36, 0.36, 0.36, 0.36],
  });

  addFooter(s8, 8, TOTAL);

  // ════════════════════════════════════════════════════════════════════
  // SLIDE 9 — THE VERDICT
  // ════════════════════════════════════════════════════════════════════
  let s9 = pres.addSlide();
  s9.background = { color: C.navy };
  s9.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.red } });
  s9.addText("The Verdict", { x: 0.6, y: 0.35, w: 8.8, h: 0.55, fontSize: 28, fontFace: "Georgia", bold: true, color: C.white, margin: 0 });

  const verdicts = [
    { title: "SafeRef", score: "9/10", verdict: "Primary Tool", desc: "Compliance, sales, audit,\ndemos, training", color: C.green, bg: C.greenBg },
    { title: "API Chatbot", score: "5/10", verdict: "FAQ Companion", desc: "Pre-sales support,\ngeneral questions", color: C.amber, bg: C.amberLight },
    { title: "Self-hosted LLM", score: "2/10", verdict: "Not Recommended", desc: "Massive cost, mediocre\nresults, no team to run it", color: C.red, bg: C.redLight },
  ];

  verdicts.forEach((v, i) => {
    const x = 0.5 + i * 3.15;
    s9.addShape(pres.shapes.RECTANGLE, { x, y: 1.15, w: 2.9, h: 2.5, fill: { color: v.bg }, shadow: mkShadow() });
    s9.addText(v.title, { x, y: 1.3, w: 2.9, h: 0.35, fontSize: 16, fontFace: "Georgia", bold: true, color: C.navy, align: "center", margin: 0 });
    s9.addText(v.score, { x, y: 1.65, w: 2.9, h: 0.65, fontSize: 40, fontFace: "Georgia", bold: true, color: v.color, align: "center", margin: 0 });
    s9.addText(v.verdict, { x, y: 2.35, w: 2.9, h: 0.35, fontSize: 13, fontFace: "Calibri", bold: true, color: v.color, align: "center", margin: 0 });
    s9.addText(v.desc, { x, y: 2.75, w: 2.9, h: 0.7, fontSize: 11, fontFace: "Calibri", color: C.gray600, align: "center", margin: 0 });
  });

  // Key message box
  s9.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 3.9, w: 9.0, h: 1.0, fill: { color: C.navyLight } });
  s9.addText([
    { text: "AI is a powerful technology \u2014 but it\u2019s the wrong tool for safety-critical calculations.\n", options: { fontSize: 14, fontFace: "Georgia", bold: true, color: C.white } },
    { text: "SafeRef IS the engine that any future chatbot would need behind it.", options: { fontSize: 13, fontFace: "Calibri", color: C.gray200 } },
  ], { x: 0.8, y: 3.95, w: 8.4, h: 0.9, align: "center", valign: "middle", margin: 0 });

  addFooter(s9, 9, TOTAL);

  // ════════════════════════════════════════════════════════════════════
  // SLIDE 10 — RECOMMENDED PATH FORWARD
  // ════════════════════════════════════════════════════════════════════
  let s10 = pres.addSlide();
  s10.background = { color: C.navy };
  s10.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.red } });
  s10.addText("Recommended Path Forward", { x: 0.6, y: 0.35, w: 8.8, h: 0.55, fontSize: 28, fontFace: "Georgia", bold: true, color: C.white, margin: 0 });

  const steps = [
    { num: "1", title: "Live Demo", desc: "Present SafeRef to SAMON sales team with real-world cases (R717, R744, R290)" },
    { num: "2", title: "Pilot Program", desc: "3-month trial with 5-10 sales engineers on actual customer projects" },
    { num: "3", title: "Feedback & Iterate", desc: "Refine UX, add missing products, and optimize for field conditions" },
    { num: "4", title: "Full Deployment", desc: "Company-wide rollout with training, production hosting, and ongoing support" },
  ];

  steps.forEach((step, i) => {
    const y = 1.1 + i * 1.0;
    s10.addShape(pres.shapes.OVAL, { x: 0.7, y: y + 0.1, w: 0.5, h: 0.5, fill: { color: C.red } });
    s10.addText(step.num, { x: 0.7, y: y + 0.1, w: 0.5, h: 0.5, fontSize: 18, fontFace: "Georgia", bold: true, color: C.white, align: "center", valign: "middle", margin: 0 });
    s10.addText(step.title, { x: 1.5, y: y + 0.05, w: 7.5, h: 0.3, fontSize: 16, fontFace: "Georgia", bold: true, color: C.white, margin: 0 });
    s10.addText(step.desc, { x: 1.5, y: y + 0.38, w: 7.5, h: 0.35, fontSize: 12, fontFace: "Calibri", color: C.gray400, margin: 0 });
  });

  s10.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.0, w: 10, h: 0.625, fill: { color: C.navyLight } });
  s10.addText("Marwan Chamoun \u2014 Orchitech \u2014 marwanchamoun@hotmail.com", { x: 0.8, y: 5.05, w: 8.4, h: 0.5, fontSize: 11, color: C.gray400, fontFace: "Calibri", align: "center" });

  // ── Save ──────────────────────────────────────────────────────────
  const outPath = "C:/1- Marwan/Claude/20_SAFEREF/SafeRef_vs_AI_Chatbot_Pitch_EN.pptx";
  await pres.writeFile({ fileName: outPath });
  console.log("OK \u2192", outPath);
}

build().catch(e => { console.error(e); process.exit(1); });
