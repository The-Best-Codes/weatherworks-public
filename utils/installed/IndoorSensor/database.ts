import fs from "fs";
import path from "path";
import sqlite3 from "sqlite3";

const databaseDir = path.join(
  process.cwd(),
  "database",
  "installed",
  "IndoorSensor"
);
const databasePath = path.join(databaseDir, "obs.db");

if (!fs.existsSync(databasePath)) {
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  fs.writeFileSync(databasePath, "");
}

// Initialize the database
const db = new sqlite3.Database(databasePath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    db.run("PRAGMA journal_mode=WAL");
  }
});

db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS indoorData (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp INTEGER, temperature REAL, humidity REAL, pressure REAL, gas REAL, accessUrl TEXT, received INTEGER)"
  );
});

function validateData(data: {
  timestamp: number;
  temperature: number;
  humidity: number;
  pressure: number;
  gas: number;
  accessUrl: string;
  received: number;
}) {
  const requiredFields = [
    "timestamp",
    "temperature",
    "humidity",
    "pressure",
    "gas",
    "accessUrl",
    "received",
  ];
  for (const field of requiredFields) {
    if (!(field in data)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}

export function getLatest() {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM indoorData ORDER BY received DESC LIMIT 1",
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      }
    );
  });
}

export function getHistory(limit = 100) {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM indoorData ORDER BY timestamp DESC LIMIT ?",
      [limit],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      }
    );
  });
}

export function addHistory(data: {
  timestamp: number;
  temperature: number;
  humidity: number;
  pressure: number;
  gas: number;
  accessUrl: string;
  received: number;
}) {
  return new Promise((resolve, reject) => {
    try {
      validateData(data);
      db.serialize(() => {
        db.run(
          "INSERT INTO indoorData (timestamp, temperature, humidity, pressure, gas, accessUrl, received) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [
            data.timestamp,
            data.temperature,
            data.humidity,
            data.pressure,
            data.gas,
            data.accessUrl,
            data.received,
          ],
          (err) => {
            if (err) {
              reject(err);
            } else {
              // Check file size and data age
              checkAndClipData().then(resolve).catch(reject);
            }
          }
        );
      });
    } catch (error) {
      reject(error);
    }
  });
}

function checkAndClipData() {
  return new Promise<void>((resolve, reject) => {
    db.serialize(() => {
      // Check file size
      const stats = fs.statSync(databasePath);
      const fileSizeInMB = stats.size / (1024 * 1024);

      // Check data age
      const twentyFiveYearsAgo = Date.now() - 25 * 365 * 24 * 60 * 60 * 1000;

      if (fileSizeInMB > 100 || twentyFiveYearsAgo > 0) {
        db.get(
          "SELECT MIN(timestamp) as oldestTimestamp FROM indoorData",
          (err, row: { oldestTimestamp: number }) => {
            if (err) {
              reject(err);
            } else {
              const oldestTimestamp = row.oldestTimestamp;
              if (oldestTimestamp < twentyFiveYearsAgo) {
                db.run(
                  "DELETE FROM indoorData WHERE timestamp <= ?",
                  [twentyFiveYearsAgo],
                  (err) => {
                    if (err) {
                      reject(err);
                    } else {
                      resolve();
                    }
                  }
                );
              } else {
                resolve();
              }
            }
          }
        );
      } else {
        resolve();
      }
    });
  });
}
