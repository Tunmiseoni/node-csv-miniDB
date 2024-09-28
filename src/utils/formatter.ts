export function format(data: string | string[]): string[] {
  // if (data === null || data === undefined) throw new Error("Data does not exist");
  if (Array.isArray(data)) return data.map((el) => quote(el));
  return [quote(data)];
}

export function deformat(data: string): string[] {
  const result = [];
  let currentField = "";
  let insideQuotes = false;

  for (let i = 0; i < data.length; i++) {
    const char = data[i];

    if (char === '"') {
      if (insideQuotes && data[i + 1] === '"') {
        currentField += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      result.push(currentField);
      currentField = "";
    } else {
      currentField += char;
    }
  }
  result.push(currentField);

  return result;
}

function quote(data: string): string {
  if (data.includes(",") || data.includes('"') || data.includes("\n"))
    return `"${data.replace(/"/g, '""')}"`;

  return data;
}
