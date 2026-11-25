/**
 * Branded PNG Proposal Card Renderer (HTML5 Canvas @ 2x DPI)
 * Dalal Investments — Private Wealth Desk
 */

const loadImage = (src) =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

const drawRoundedRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

const wrapText = (ctx, text, maxWidth) => {
  const words = String(text || "").split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
};

export const generateBrandedPngCard = async ({
  logoSrc,
  clientName,
  sharePayload,
  pinnedPlanA,
}) => {
  const width = 1080;
  const hasPlanA = Boolean(pinnedPlanA);
  const hasMilestones =
    Array.isArray(sharePayload?.milestones) && sharePayload.milestones.length >= 2;

  const height = 1060 + (hasPlanA ? 185 : 0) + (hasMilestones ? 170 : 0);
  const scale = 2;

  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, width, height);

  // Outer Card Container
  drawRoundedRect(ctx, 32, 32, width - 64, height - 64, 28);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#e2e8f0";
  ctx.stroke();

  // Top Emerald Accent Strip
  ctx.save();
  drawRoundedRect(ctx, 32, 32, width - 64, 14, 14);
  ctx.fillStyle = "#059669";
  ctx.fill();
  ctx.restore();

  // Header: Logo + Brand Name + Date
  let cursorY = 82;
  const logoImg = await loadImage(logoSrc);
  if (logoImg) {
    const aspect = logoImg.width / Math.max(1, logoImg.height);
    const drawH = 54;
    const drawW = drawH * aspect;
    ctx.drawImage(logoImg, 72, cursorY, drawW, drawH);
  }

  const brandTextX = logoImg ? 148 : 72;
  ctx.fillStyle = "#0f172a";
  ctx.font = 'bold 28px Georgia, "Times New Roman", serif';
  ctx.fillText("Dalal Investments", brandTextX, cursorY + 26);

  ctx.fillStyle = "#059669";
  ctx.font = "800 12px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText("PRIVATE WEALTH DESK  •  ADVISORY ILLUSTRATION", brandTextX, cursorY + 48);

  const todayStr = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  ctx.textAlign = "right";
  ctx.fillStyle = "#64748b";
  ctx.font = "600 13px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText("Illustration Date", width - 72, cursorY + 20);
  ctx.fillStyle = "#0f172a";
  ctx.font = "800 15px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(todayStr, width - 72, cursorY + 42);
  ctx.textAlign = "left";

  cursorY += 86;

  // Divider
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(72, cursorY);
  ctx.lineTo(width - 72, cursorY);
  ctx.stroke();

  cursorY += 36;

  // Client Badge (if present)
  if (clientName && clientName.trim()) {
    const badgeText = `Prepared Exclusively For: ${clientName.trim()}`;
    ctx.font = "700 15px -apple-system, BlinkMacSystemFont, sans-serif";
    const textW = ctx.measureText(badgeText).width;
    drawRoundedRect(ctx, 72, cursorY - 22, textW + 32, 36, 10);
    ctx.fillStyle = "#ecfdf5";
    ctx.fill();
    ctx.strokeStyle = "#a7f3d0";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "#065f46";
    ctx.fillText(badgeText, 88, cursorY + 1);
    cursorY += 42;
  }

  // Document Title & Subtitle
  ctx.fillStyle = "#0f172a";
  ctx.font = "900 28px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(sharePayload.title || "Wealth Illustration", 72, cursorY);
  cursorY += 28;

  if (sharePayload.subtitle) {
    ctx.fillStyle = "#475569";
    ctx.font = "500 16px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(sharePayload.subtitle, 72, cursorY);
    cursorY += 32;
  }

  // Hero Highlight Banner (Dark Slate)
  const highlights = sharePayload.highlights || [];
  const heroItem = highlights.find((h) => h.isHero) || highlights[highlights.length - 1];
  const secondaryItems = highlights.filter((h) => h !== heroItem).slice(0, 3);

  drawRoundedRect(ctx, 72, cursorY, width - 144, 175, 20);
  ctx.fillStyle = "#0f172a";
  ctx.fill();

  if (heroItem) {
    ctx.fillStyle = "#6ee7b7";
    ctx.font = "800 13px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText((heroItem.label || "").toUpperCase(), 104, cursorY + 42);

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 44px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(heroItem.value || "", 104, cursorY + 98);

    if (heroItem.sub) {
      ctx.fillStyle = "#94a3b8";
      ctx.font = "500 15px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(heroItem.sub, 104, cursorY + 136);
    }
  }

  cursorY += 198;

  // Secondary KPI Cards (up to 3)
  if (secondaryItems.length > 0) {
    const gap = 16;
    const cardW = (width - 144 - gap * (secondaryItems.length - 1)) / secondaryItems.length;

    secondaryItems.forEach((item, idx) => {
      const cardX = 72 + idx * (cardW + gap);
      drawRoundedRect(ctx, cardX, cursorY, cardW, 112, 16);
      ctx.fillStyle = "#f8fafc";
      ctx.fill();
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = "#64748b";
      ctx.font = "700 12px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText((item.label || "").slice(0, 28), cardX + 20, cursorY + 32);

      ctx.fillStyle = "#0f172a";
      ctx.font = "900 22px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText((item.value || "").split("(")[0].trim(), cardX + 20, cursorY + 66);

      if (item.sub) {
        ctx.fillStyle = "#059669";
        ctx.font = "600 12px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillText(item.sub.slice(0, 34), cardX + 20, cursorY + 92);
      }
    });

    cursorY += 136;
  }

  // Optional Plan A vs. Plan B Comparison Strip
  if (hasPlanA && pinnedPlanA) {
    const heroA =
      (pinnedPlanA.highlights || []).find((h) => h.isHero) ||
      (pinnedPlanA.highlights || []).slice(-1)[0];

    drawRoundedRect(ctx, 72, cursorY, width - 144, 155, 16);
    ctx.fillStyle = "#eef2ff";
    ctx.fill();
    ctx.strokeStyle = "#c7d2fe";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#3730a3";
    ctx.font = "800 13px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("SIDE-BY-SIDE SCENARIO COMPARISON (PLAN A vs. PLAN B)", 96, cursorY + 32);

    // Plan A Column
    ctx.fillStyle = "#4f46e5";
    ctx.font = "800 12px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("PINNED PLAN A", 96, cursorY + 64);
    ctx.fillStyle = "#0f172a";
    ctx.font = "900 22px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText((heroA?.value || "—").split("(")[0].trim(), 96, cursorY + 94);
    ctx.fillStyle = "#475569";
    ctx.font = "600 12px -apple-system, BlinkMacSystemFont, sans-serif";
    const summaryA = (pinnedPlanA.assumptions || [])
      .slice(0, 3)
      .map((a) => `${a.label}: ${a.value}`)
      .join("  •  ");
    ctx.fillText(summaryA.slice(0, 52), 96, cursorY + 122);

    // Plan B Column
    const midX = width / 2 + 16;
    ctx.fillStyle = "#059669";
    ctx.font = "800 12px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("CURRENT PLAN B", midX, cursorY + 64);
    ctx.fillStyle = "#0f172a";
    ctx.font = "900 22px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText((heroItem?.value || "—").split("(")[0].trim(), midX, cursorY + 94);
    ctx.fillStyle = "#475569";
    ctx.font = "600 12px -apple-system, BlinkMacSystemFont, sans-serif";
    const summaryB = (sharePayload.assumptions || [])
      .slice(0, 3)
      .map((a) => `${a.label}: ${a.value}`)
      .join("  •  ");
    ctx.fillText(summaryB.slice(0, 52), midX, cursorY + 122);

    cursorY += 180;
  }

  // Parameters Row
  const assumptions = (sharePayload.assumptions || []).slice(0, 4);
  if (assumptions.length > 0) {
    const gap = 14;
    const boxW = (width - 144 - gap * (assumptions.length - 1)) / assumptions.length;
    assumptions.forEach((a, idx) => {
      const bx = 72 + idx * (boxW + gap);
      drawRoundedRect(ctx, bx, cursorY, boxW, 74, 12);
      ctx.fillStyle = "#f1f5f9";
      ctx.fill();

      ctx.fillStyle = "#64748b";
      ctx.font = "600 12px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(a.label.slice(0, 24), bx + 16, cursorY + 28);

      ctx.fillStyle = "#0f172a";
      ctx.font = "800 15px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(String(a.value).slice(0, 24), bx + 16, cursorY + 54);
    });
    cursorY += 98;
  }

  // Optional Milestone Sparkline / Progress Strip
  if (hasMilestones) {
    const items = sharePayload.milestones.slice(0, 5);
    drawRoundedRect(ctx, 72, cursorY, width - 144, 140, 16);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#0f172a";
    ctx.font = "800 13px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("PROJECTED MILESTONE SNAPSHOT", 96, cursorY + 30);

    const colW = (width - 192) / items.length;
    items.forEach((m, idx) => {
      const cx = 96 + idx * colW;
      ctx.fillStyle = "#6366f1";
      ctx.font = "800 13px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(`Yr ${m.year}`, cx, cursorY + 62);

      ctx.fillStyle = "#0f172a";
      ctx.font = "900 17px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(String(m.total).split("(")[0].trim(), cx, cursorY + 90);

      ctx.fillStyle = "#059669";
      ctx.font = "600 12px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(String(m.profit).slice(0, 18), cx, cursorY + 114);
    });

    cursorY += 165;
  }

  // Executive Takeaway Box
  if (sharePayload.takeaway) {
    drawRoundedRect(ctx, 72, cursorY, width - 144, 108, 14);
    ctx.fillStyle = "#ecfdf5";
    ctx.fill();

    ctx.fillStyle = "#059669";
    ctx.fillRect(72, cursorY + 12, 6, 84);

    ctx.fillStyle = "#065f46";
    ctx.font = "600 15px -apple-system, BlinkMacSystemFont, sans-serif";
    const lines = wrapText(ctx, sharePayload.takeaway, width - 195).slice(0, 3);
    lines.forEach((line, idx) => {
      ctx.fillText(line, 96, cursorY + 36 + idx * 24);
    });
    cursorY += 130;
  }

  // Footer Disclaimer
  ctx.fillStyle = "#94a3b8";
  ctx.font = "500 11.5px -apple-system, BlinkMacSystemFont, sans-serif";
  const discLines = wrapText(
    ctx,
    sharePayload.disclaimer ||
      "Mutual Fund investments are subject to market risks, read all scheme related documents carefully.",
    width - 144
  ).slice(0, 2);
  discLines.forEach((line, idx) => {
    ctx.fillText(line, 72, height - 68 + idx * 17);
  });

  return canvas.toDataURL("image/png");
};