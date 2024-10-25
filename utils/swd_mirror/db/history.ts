import fs from "fs";
import path from "path";

interface TempestHistory {
  station_id: number | string;
  type: "station_stats";
  first_ob_day_local: string;
  last_ob_day_local: string;
  stats_day: NestedArray;
  stats_month: NestedArray;
  stats_year: NestedArray;
  stats_alltime: NestedArray;
  stats_day_time: NestedArray;
  stats_month_time: NestedArray;
  stats_year_time: NestedArray;
  stats_alltime_time: NestedArray;
  status: {
    status_code: number;
    status_message: string;
  };
}

type NestedArray = Array<Array<string | number | Date>>;

const databasePath = path.join(process.cwd(), "database", "swd_recent");
const databaseFile = path.join(databasePath, "history.json");

export default function getHistory() {
  return JSON.parse(fs.readFileSync(databaseFile, "utf8"));
}

export function setHistory(history: TempestHistory) {
  fs.writeFileSync(databaseFile, JSON.stringify(history));
}

export function checkDatabase() {
  if (!fs.existsSync(databasePath)) {
    fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  }

  if (!fs.existsSync(databaseFile)) {
    fs.writeFileSync(databaseFile, JSON.stringify({}));
  }
}

checkDatabase();
