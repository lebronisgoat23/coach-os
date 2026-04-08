/**
 * CSV Export Utility for Vitrion
 * Exports user data as downloadable CSV files
 */

interface ExportableRow {
  [key: string]: string | number | boolean | null;
}

/**
 * Convert array of objects to CSV string
 */
function toCSV(rows: ExportableRow[], headers?: string[]): string {
  if (rows.length === 0) return "";

  const keys = headers || Object.keys(rows[0]);
  const headerLine = keys.join(",");

  const dataLines = rows.map((row) =>
    keys
      .map((key) => {
        const val = row[key];
        if (val === null || val === undefined) return "";
        if (typeof val === "string" && (val.includes(",") || val.includes('"') || val.includes("\n"))) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return String(val);
      })
      .join(",")
  );

  return [headerLine, ...dataLines].join("\n");
}

/**
 * Trigger a file download in the browser
 */
function downloadFile(content: string, filename: string, mimeType: string = "text/csv") {
  const blob = new Blob(["\uFEFF" + content], { type: `${mimeType};charset=utf-8` }); // BOM for Excel
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export quest completion history as CSV
 */
export function exportQuestHistory(quests: ExportableRow[]) {
  const csv = toCSV(
    quests.map((q) => ({
      日期: q.questDate,
      補給品: q.itemName,
      劑量: q.dose,
      已完成: q.isCompleted ? "是" : "否",
      完成時間: q.completedAt || "",
      獲得XP: q.xpReward,
      增益類型: q.buffType || "",
      增益數值: q.buffValue || 0,
    }))
  );

  const date = new Date().toISOString().split("T")[0];
  downloadFile(csv, `vitrion-quests-${date}.csv`);
}

/**
 * Export all user status data as CSV
 */
export function exportStatusHistory(
  status: ExportableRow,
  quests: ExportableRow[],
  confounders: ExportableRow[]
) {
  // Status summary
  const statusCSV = toCSV([
    {
      等級: status.level,
      稱號: status.title,
      XP: status.xp,
      XP上限: status.xpToNext,
      STR力量: status.currentStr,
      VIT體力: status.currentVit,
      AGI敏捷: status.currentAgi,
      匯出時間: new Date().toISOString(),
    },
  ]);

  // Quest history
  const questCSV = toCSV(
    quests.map((q) => ({
      日期: q.questDate,
      補給品: q.itemName,
      劑量: q.dose,
      完成: q.isCompleted ? "是" : "否",
      XP: q.xpReward,
    }))
  );

  // Confounders
  const confCSV = toCSV(
    confounders.map((c) => ({
      日期: c.recordedAt,
      類型: c.tag,
      嚴重度: c.severity,
      備註: c.note || "",
    }))
  );

  const combined = `[角色狀態]\n${statusCSV}\n\n[每日任務]\n${questCSV}\n\n[干擾因素]\n${confCSV}`;

  const date = new Date().toISOString().split("T")[0];
  downloadFile(combined, `vitrion-全部資料-${date}.csv`);
}
