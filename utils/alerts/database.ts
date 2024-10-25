import { Database } from "sqlite3";
import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "database", "alerts", "allAlerts.db");

if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  fs.writeFileSync(dbPath, "");
}

const db = new Database(dbPath);

// Initialize the database tables
db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS alerts (id TEXT PRIMARY KEY, timestamp INTEGER, directDelete INTEGER, expires INTEGER, alertData TEXT)"
  );
  db.run("CREATE TABLE IF NOT EXISTS deleted_alerts (id TEXT PRIMARY KEY)");
});

// Helper function to check if an alert is expired
function isExpired(unformattedExpires: number) {
  const expires = new Date(unformattedExpires).getTime();
  return expires < Date.now();
}

// Add alert
function addAlert(
  id: string,
  directDelete: boolean,
  unformattedExpires: number,
  alertData: string | object
) {
  const expires = new Date(unformattedExpires).getTime();
  return new Promise((resolve, reject) => {
    // Check if the alert is in the deleted_alerts table
    db.get("SELECT id FROM deleted_alerts WHERE id = ?", [id], (err, row) => {
      if (err) {
        reject(err);
      } else if (row) {
        resolve(false); // Alert is in deleted_alerts, don't add it
      } else {
        // Check if the alert is expired
        if (isExpired(expires)) {
          resolve(false); // Alert is expired, don't add it
        } else {
          const currentTimestamp = new Date().getTime();
          // Add the alert to the alerts table
          db.run(
            "INSERT OR REPLACE INTO alerts (id, timestamp, directDelete, expires, alertData) VALUES (?, ?, ?, ?, ?)",
            [
              id,
              currentTimestamp,
              directDelete ? 1 : 0,
              expires,
              JSON.stringify(alertData),
            ],
            (err) => {
              if (err) {
                reject(err);
              } else {
                resolve(true);
              }
            }
          );
        }
      }
    });
  });
}

// Delete alert
function deleteAlert(id: string) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT directDelete FROM alerts WHERE id = ?",
      [id],
      (err, row: { directDelete: number }) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(false); // Alert not found
        } else {
          if (row.directDelete === 1) {
            // Directly delete the alert
            db.run("DELETE FROM alerts WHERE id = ?", [id], (err) => {
              if (err) {
                reject(err);
              } else {
                resolve(true);
              }
            });
          } else {
            // Move the alert to deleted_alerts
            db.run(
              "INSERT OR REPLACE INTO deleted_alerts (id) VALUES (?)",
              [id],
              (err) => {
                if (err) {
                  reject(err);
                } else {
                  db.run("DELETE FROM alerts WHERE id = ?", [id], (err) => {
                    if (err) {
                      reject(err);
                    } else {
                      resolve(true);
                    }
                  });
                }
              }
            );
          }
        }
      }
    );
  });
}

// List all alerts
function listAllAlerts() {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM alerts",
      (
        err,
        rows: Array<{
          id: string;
          timestamp: number;
          directDelete: number;
          expires: number;
          alertData: string | object;
        }>
      ) => {
        if (err) {
          reject(err);
        } else {
          resolve(
            rows.map(
              (row: { directDelete: number; alertData: string | object }) => ({
                ...row,
                directDelete: row.directDelete === 1,
                alertData: JSON.parse(row.alertData as string),
              })
            )
          );
        }
      }
    );
  });
}

// Get alert
function getAlert(id: string) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM alerts WHERE id = ?",
      [id],
      (err, row: { directDelete: number; alertData: string | object }) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          resolve({
            ...row,
            directDelete: row.directDelete === 1,
            alertData: JSON.parse(row.alertData as string),
          });
        }
      }
    );
  });
}

// Handle expired alerts
function handleExpiredAlerts() {
  return new Promise<void>((resolve, reject) => {
    const now = Date.now();
    db.run("DELETE FROM alerts WHERE expires <= ?", [now], (err) => {
      if (err) {
        reject(err);
      } else {
        db.run(
          "DELETE FROM deleted_alerts WHERE id IN (SELECT id FROM alerts WHERE expires <= ?)",
          [now],
          (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          }
        );
      }
    });
  });
}

export { addAlert, deleteAlert, listAllAlerts, getAlert, handleExpiredAlerts };
