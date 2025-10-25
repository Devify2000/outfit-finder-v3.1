import fs from "fs";
import path from "path";

const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "usage.log");

export function logUsage(event, data = {}) {
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    const line =
      JSON.stringify({ ts: new Date().toISOString(), event, ...data }) + "\n";
    fs.appendFile(LOG_FILE, line, () => {});
  } catch {}
}
