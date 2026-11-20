// src/apps/recipes/components/Recipies/printMenuUtils.js
import { formatDurationCompact } from "./recipeMenuUtils";

const WRITE_IN_SLOTS_PER_CATEGORY = 5;

const escapeHtml = (str) =>
  String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const getDietaryBadgesHtml = (item) => {
  const flags = item.dietaryFlags || {};
  const badges = [];
  if (flags.isJain) badges.push(`<span class="badge badge-j">J</span>`);
  if (flags.isSwaminarayan) badges.push(`<span class="badge badge-sw">SW</span>`);
  if (flags.isVegan) badges.push(`<span class="badge badge-vg">VG</span>`);
  if (flags.isGlutenFree) badges.push(`<span class="badge badge-gf">GF</span>`);
  return badges.length ? `<span class="badges">${badges.join("")}</span>` : "";
};

export const printRecipeMenu = ({
  mode = "BISTRO", // "BISTRO" | "CARTE"
  groupedSections = [],
  groupBy = "CUISINE",
  activeFiltersLabel = "",
}) => {
  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const isCarte = mode === "CARTE";
  const editionTitle = isCarte ? "Chef’s Tasting Carte" : "Bistro Edition";

  const sectionsHtml = groupedSections
    .map(({ groupName, items }) => {
      const printedDishesHtml = items
        .map((item, idx) => {
          const title = escapeHtml(item.title);
          const duration = escapeHtml(formatDurationCompact(item));
          const course = escapeHtml(item.courseType || "Main");
          const cuisinePrefix =
            groupBy !== "CUISINE" && item.cuisine
              ? `${escapeHtml(item.cuisine)} · `
              : "";
          const badges = getDietaryBadgesHtml(item);

          if (isCarte) {
            return `
              <div class="carte-row">
                <div class="carte-left">
                  <span class="carte-num">${String(idx + 1).padStart(2, "0")}.</span>
                  <span class="carte-title">${title}</span>
                  ${badges}
                </div>
                <div class="carte-right">
                  <span class="carte-course">${cuisinePrefix}${course}</span>
                  <span class="carte-time">${duration}</span>
                </div>
              </div>
            `;
          }

          return `
            <div class="bistro-item">
              <div class="bistro-title-wrap">
                <span class="bistro-title">${title}</span>
                ${badges}
              </div>
              <span class="bistro-time">${duration}</span>
            </div>
          `;
        })
        .join("");

      const blankSlotsHtml = Array.from(
        { length: WRITE_IN_SLOTS_PER_CATEGORY },
        (_, slotIdx) => {
          const nextNum = String(items.length + slotIdx + 1).padStart(2, "0");

          if (isCarte) {
            return `
              <div class="carte-row carte-blank-row" aria-hidden="true">
                <div class="carte-left">
                  <span class="carte-num">${nextNum}.</span>
                  <span class="carte-blank-space">&nbsp;</span>
                </div>
                <div class="carte-right">
                  <span class="carte-blank-time">____m</span>
                </div>
              </div>
            `;
          }

          return `
            <div class="bistro-item bistro-blank-item" aria-hidden="true">
              <div class="bistro-title-wrap">
                <span class="bistro-blank-space">&nbsp;</span>
              </div>
              <span class="bistro-blank-time">____m</span>
            </div>
          `;
        }
      ).join("");

      if (isCarte) {
        return `
          <section class="carte-section">
            <div class="carte-sec-head">
              <span class="carte-jp">おまかせ</span>
              <span class="carte-dot">•</span>
              <h2>${escapeHtml(groupName)}</h2>
            </div>
            <div class="carte-list">
              ${printedDishesHtml}
              ${blankSlotsHtml}
            </div>
          </section>
        `;
      }

      return `
        <section class="bistro-box">
          <div class="bistro-box-head">
            <h2>${escapeHtml(groupName)}</h2>
          </div>
          <div class="bistro-list">
            ${printedDishesHtml}
            ${blankSlotsHtml}
          </div>
        </section>
      `;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Off The Menu — ${editionTitle}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 14mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, Helvetica, Arial, sans-serif;
      background: #F4F1EA;
      color: #14110E;
      line-height: 1.32;
    }

    .preview-shell {
      width: 210mm;
      margin: 0 auto 24px;
      background: #FFFFFF;
      padding: 12mm 14mm;
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.08);
    }

    @media print {
      body {
        background: #FFFFFF;
      }
      .preview-shell {
        width: 100%;
        margin: 0;
        padding: 0;
        box-shadow: none;
      }
      .no-print {
        display: none !important;
      }
    }

    .no-print {
      width: 210mm;
      margin: 12px auto 10px;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }

    .print-btn {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      background: #14110E;
      color: #FFFFFF;
      border: 1.5px solid #14110E;
      padding: 7px 14px;
      cursor: pointer;
    }

    .print-btn:hover {
      background: #B45309;
      border-color: #B45309;
    }

    /* ============================================================ */
    /* REPEATING PAGE TABLE LAYOUT                                  */
    /* ============================================================ */
    table.print-layout {
      width: 100%;
      border-collapse: collapse;
    }

    table.print-layout thead {
      display: table-header-group;
    }

    table.print-layout tfoot {
      display: table-footer-group;
    }

    table.print-layout th,
    table.print-layout td {
      padding: 0;
      text-align: left;
      vertical-align: top;
      font-weight: normal;
    }

    /* ============================================================ */
    /* REPEATING MASTHEAD                                           */
    /* ============================================================ */
    .masthead {
      text-align: center;
      padding-bottom: 11px;
      margin-bottom: 16px;
      border-bottom: 2px solid #14110E;
      position: relative;
    }

    .masthead::after {
      content: "";
      display: block;
      position: absolute;
      left: 0;
      right: 0;
      bottom: -4.5px;
      border-bottom: 1px solid #D6D3D1;
    }

    .eyebrow {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 8px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.26em;
      color: #B45309;
      margin-bottom: 4px;
    }

    h1 {
      font-size: 28px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: -0.03em;
      line-height: 0.95;
      color: #14110E;
    }

    h1 span {
      color: #B45309;
    }

    .masthead-sub {
      margin-top: 6px;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
      gap: 7px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 7.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: #57534E;
    }

    .masthead-sep {
      color: #D6D3D1;
    }

    .filter-note {
      margin-top: 4px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 7.5px;
      font-weight: 800;
      color: #B45309;
      text-transform: uppercase;
      letter-spacing: 0.12em;
    }

    /* DIETARY BADGES */
    .badges {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      margin-left: 5px;
      vertical-align: middle;
    }

    .badge {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 6.8px;
      font-weight: 800;
      padding: 0.5px 3.5px;
      border-radius: 2px;
      border: 1px solid #A8A29E;
    }

    .badge-j { background: #ECFDF5; border-color: #6EE7B7; color: #065F46; }
    .badge-sw { background: #FFFBEB; border-color: #FCD34D; color: #92400E; }
    .badge-vg { background: #F7FEE7; border-color: #BEF264; color: #3F6212; }
    .badge-gf { background: #F0F9FF; border-color: #7DD3FC; color: #075985; }

    /* ============================================================ */
    /* BISTRO PRINT ARCHITECTURE (UNIFIED FULL-WIDTH ROW DIVIDERS)  */
    /* ============================================================ */
    .bistro-columns {
      column-count: ${groupedSections.length === 1 ? 1 : 2};
      column-gap: 14px;
      padding-top: 2px;
    }

    .bistro-box {
      break-inside: avoid;
      page-break-inside: avoid;
      border: 2px solid #14110E;
      background: #FAF9F6;
      padding: 10px 12px 10px;
      margin-bottom: 13px;
    }

    .bistro-box-head {
      border-bottom: 2px solid #14110E;
      padding-bottom: 5px;
      margin-bottom: 4px;
    }

    .bistro-box-head h2 {
      font-size: 13px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: -0.02em;
      color: #14110E;
      line-height: 1.05;
    }

    .bistro-list {
      ${
        groupedSections.length === 1
          ? "display: grid; grid-template-columns: 1fr 1fr; column-gap: 20px;"
          : ""
      }
    }

    .bistro-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      min-height: 24px;
      padding: 5px 0;
      border-bottom: 1px solid #D6D3D1;
      break-inside: avoid;
    }

    .bistro-item:last-child {
      border-bottom: none;
    }

    .bistro-title-wrap {
      flex: 1;
      min-width: 0;
    }

    .bistro-title {
      font-size: 9.8px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: -0.01em;
      color: #14110E;
    }

    .bistro-time {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 7.5px;
      font-weight: 800;
      padding: 1px 5px;
      background: #FEF3C7;
      border: 1px solid #F59E0B;
      color: #92400E;
      white-space: nowrap;
      flex-shrink: 0;
    }

    /* Bistro Empty Write-In Row — Identical Full-Width Row Line */
    .bistro-blank-item {
      align-items: flex-end;
      padding: 7px 0 4px;
    }

    .bistro-blank-space {
      display: inline-block;
      font-size: 9.8px;
      line-height: 1.2;
    }

    .bistro-blank-time {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 7.5px;
      font-weight: 700;
      color: #A8A29E;
      letter-spacing: 0.04em;
      line-height: 1;
      white-space: nowrap;
      flex-shrink: 0;
    }

    /* ============================================================ */
    /* CARTE PRINT ARCHITECTURE (UNIFIED FULL-WIDTH ROW DIVIDERS)   */
    /* ============================================================ */
    .carte-columns {
      column-count: ${groupedSections.length === 1 ? 1 : 2};
      column-gap: 28px;
      padding-top: 2px;
    }

    .carte-section {
      break-inside: avoid;
      page-break-inside: avoid;
      margin-bottom: 16px;
    }

    .carte-sec-head {
      display: flex;
      align-items: baseline;
      gap: 6px;
      border-bottom: 1.5px solid #14110E;
      padding-bottom: 4px;
      margin-bottom: 3px;
    }

    .carte-jp {
      font-size: 8.5px;
      color: #B45309;
      font-weight: 700;
    }

    .carte-dot {
      color: #A8A29E;
      font-size: 8.5px;
    }

    .carte-sec-head h2 {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.22em;
      color: #14110E;
    }

    .carte-list {
      ${
        groupedSections.length === 1
          ? "display: grid; grid-template-columns: 1fr 1fr; column-gap: 28px;"
          : ""
      }
    }

    .carte-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 10px;
      min-height: 23px;
      padding: 5px 0;
      border-bottom: 1px solid #E7E5E4;
      break-inside: avoid;
    }

    .carte-row:last-child {
      border-bottom: none;
    }

    .carte-left {
      display: flex;
      align-items: baseline;
      gap: 5px;
      min-width: 0;
      flex: 1;
    }

    .carte-num {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 8px;
      font-weight: 700;
      color: #A8A29E;
      flex-shrink: 0;
      line-height: 1;
    }

    .carte-title {
      font-size: 9.6px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #14110E;
    }

    .carte-right {
      display: flex;
      align-items: baseline;
      gap: 7px;
      flex-shrink: 0;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }

    .carte-course {
      font-size: 7px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #78716C;
    }

    .carte-time {
      font-size: 8.6px;
      font-weight: 800;
      color: #92400E;
    }

    /* Carte Empty Write-In Row — Identical Full-Width Row Line */
    .carte-blank-row {
      align-items: flex-end;
      padding: 7px 0 4px;
    }

    .carte-blank-space {
      display: inline-block;
      font-size: 9.6px;
      line-height: 1.2;
    }

    .carte-blank-time {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 7.5px;
      font-weight: 700;
      color: #A8A29E;
      letter-spacing: 0.04em;
      line-height: 1;
      white-space: nowrap;
      flex-shrink: 0;
    }

    /* REPEATING PAGE FOOTER */
    .print-footer {
      margin-top: 14px;
      padding-top: 6px;
      border-top: 1px solid #E7E5E4;
      display: flex;
      justify-content: space-between;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 7.2px;
      font-weight: 700;
      color: #A8A29E;
      text-transform: uppercase;
      letter-spacing: 0.12em;
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button type="button" class="print-btn" onclick="window.print()">
      Print / Save PDF
    </button>
  </div>

  <div class="preview-shell">
    <table class="print-layout">
      <thead>
        <tr>
          <th>
            <header class="masthead">
              <div class="eyebrow">शाही रसोई • ${editionTitle}</div>
              <h1>Off The <span>Menu</span></h1>
              <div class="masthead-sub">
                <span>[J] Jain</span>
                <span class="masthead-sep">•</span>
                <span>[SW] Swaminarayan</span>
                <span class="masthead-sep">•</span>
                <span>[VG] Vegan</span>
                <span class="masthead-sep">•</span>
                <span>[GF] Gluten-Free</span>
              </div>
              ${
                activeFiltersLabel
                  ? `<div class="filter-note">${escapeHtml(activeFiltersLabel)}</div>`
                  : ""
              }
            </header>
          </th>
        </tr>
      </thead>

      <tbody>
        <tr>
          <td>
            <main class="${isCarte ? "carte-columns" : "bistro-columns"}">
              ${sectionsHtml}
            </main>
          </td>
        </tr>
      </tbody>

      <tfoot>
        <tr>
          <td>
            <footer class="print-footer">
              <span>Sous Chef Kitchen Archive</span>
              <span>${dateStr}</span>
            </footer>
          </td>
        </tr>
      </tfoot>
    </table>
  </div>

  <script>
    window.onload = function () {
      setTimeout(function () {
        window.print();
      }, 150);
    };
  </script>
</body>
</html>`;

  const printWindow = window.open("", "_blank", "width=1024,height=840");
  if (!printWindow) {
    return false;
  }
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  return true;
};