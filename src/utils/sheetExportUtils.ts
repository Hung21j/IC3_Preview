/**
 * Utility functions for Vietnamese name normalization, username generation, and CSV/Excel sheet export.
 */

/**
 * Remove Vietnamese accents/diacritics and return pure ascii lowercase string.
 * Example: "Nguyễn Hoàng Long" -> "nguyen hoang long"
 */
export function removeVietnameseAccents(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, (m) => (m === "đ" ? "d" : "D"))
    .toLowerCase();
}

/**
 * Generates an IC3 student username from Vietnamese full name.
 * Rule:
 *  - Họ tên: "Nguyễn Hoàng Long"
 *  - Chữ cái đầu họ và các tên đệm: "n", "h"
 *  - Toàn bộ tên chính: "long"
 *  - Kết quả username: "nhlong"
 * 
 * If single word (e.g. "Long"): "long"
 * Non-alphanumeric characters are stripped.
 */
export function generateUsernameFromFullName(fullName: string): string {
  const clean = removeVietnameseAccents(fullName.trim())
    .replace(/[^a-z0-9\s]/g, "")
    .trim();

  if (!clean) return "user" + Math.floor(100 + Math.random() * 900);

  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0];
  }

  // Last part is first name
  const firstName = parts[parts.length - 1];
  // Other parts are surname and middle names
  const prefix = parts
    .slice(0, parts.length - 1)
    .map((p) => p[0])
    .join("");

  return `${prefix}${firstName}`;
}

/**
 * Parses a bulk student list pasted from Google Sheets or Excel.
 * Supports:
 *  - Tab-separated rows (from copy-pasting spreadsheet cells)
 *  - Comma-separated rows (CSV)
 *  - Or plain list of student names (one name per line)
 *
 * Columns can be:
 *  Format 1: [Họ và tên] (Default class and school applied)
 *  Format 2: [Họ và tên, Lớp]
 *  Format 3: [Họ và tên, Lớp, Trường]
 *  Format 4: [STT, Họ và tên, Lớp, Trường]
 */
export interface ParsedStudentRow {
  name: string;
  className: string;
  school: string;
  username: string;
  password: string;
  status: "ready" | "duplicate_in_input" | "invalid";
  error?: string;
}

export function parseBulkStudentsInput(
  rawText: string,
  defaultClass: string = "",
  defaultSchool: string = "",
  existingUsernames: Set<string> = new Set()
): ParsedStudentRow[] {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  const results: ParsedStudentRow[] = [];
  const generatedMap = new Map<string, number>();

  for (const line of lines) {
    // Detect delimiter: Tab if spreadsheet copy, else comma or semicolon
    let delimiter = "\t";
    if (!line.includes("\t")) {
      if (line.includes(",")) delimiter = ",";
      else if (line.includes(";")) delimiter = ";";
    }

    const tokens = line.split(delimiter).map((t) => t.trim().replace(/^["']|["']$/g, ""));
    if (tokens.length === 0 || !tokens.some((t) => t.length > 0)) continue;

    // Skip potential header rows
    const firstColLower = tokens[0].toLowerCase();
    if (
      firstColLower === "họ và tên" ||
      firstColLower === "ho va ten" ||
      firstColLower === "họ tên" ||
      firstColLower === "stt" ||
      firstColLower === "name"
    ) {
      // Check if second column is name
      if (tokens.length > 1 && tokens[1].toLowerCase().includes("tên")) {
        continue; // Header row
      }
      if (firstColLower !== "stt") {
        continue;
      }
    }

    let name = "";
    let className = defaultClass;
    let school = defaultSchool;

    // Check if col 0 is a number (STT)
    if (/^\d+$/.test(tokens[0]) && tokens.length > 1) {
      name = tokens[1];
      if (tokens[2]) className = tokens[2];
      if (tokens[3]) school = tokens[3];
    } else {
      name = tokens[0];
      if (tokens[1]) className = tokens[1];
      if (tokens[2]) school = tokens[2];
    }

    if (!name || name.length < 2) {
      continue;
    }

    // Generate base username (e.g. "nhlong")
    let baseUser = generateUsernameFromFullName(name);
    let finalUser = baseUser;

    // Handle collision in current batch or existing db
    let count = generatedMap.get(baseUser) || 0;
    while (existingUsernames.has(finalUser) || (count > 0 && finalUser === baseUser)) {
      count++;
      finalUser = `${baseUser}${count}`;
    }
    generatedMap.set(baseUser, count + 1);

    results.push({
      name,
      className: className || defaultClass,
      school: school || defaultSchool,
      username: finalUser,
      password: "123",
      status: "ready"
    });
  }

  return results;
}

/**
 * Exports data to a CSV sheet file with UTF-8 BOM so Excel & Google Sheets open Vietnamese perfectly.
 */
export function exportToCsvSheet(filename: string, headers: string[], rows: (string | number)[][]) {
  const escapeCsv = (val: string | number) => {
    const s = String(val ?? "").replace(/"/g, '""');
    return `"${s}"`;
  };

  const csvContent =
    "\uFEFF" + // UTF-8 BOM for Microsoft Excel / Sheets
    [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) => row.map(escapeCsv).join(","))
    ].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
