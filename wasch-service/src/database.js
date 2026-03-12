import Database from "better-sqlite3";
import path from "node:path";
import url from "node:url";

const sourceDir = path.dirname(url.fileURLToPath(import.meta.url));
const dbPath = path.join(sourceDir, "..", "db-ws.sqlite");

export const db = new Database(dbPath);

db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS waschprogramme (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    temperatur INTEGER NOT NULL,
    dauer INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS waschgaenge (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    waschprogramm_id INTEGER NOT NULL,
    zeitstempel TEXT NOT NULL,
    status TEXT NOT NULL,
    FOREIGN KEY (waschprogramm_id) REFERENCES waschprogramme (id)
      ON UPDATE CASCADE
      ON DELETE RESTRICT
  );

  CREATE TABLE IF NOT EXISTS empfehlungen (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kategorie_id INTEGER NOT NULL,
    waschprogramm_id INTEGER NOT NULL,
    FOREIGN KEY (waschprogramm_id) REFERENCES waschprogramme (id)
      ON UPDATE CASCADE
      ON DELETE RESTRICT
  );
`);

console.log(`SQLite-Datenbank initialisiert: ${dbPath}`);
db.close();
