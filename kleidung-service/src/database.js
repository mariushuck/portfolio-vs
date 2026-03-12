import Database from "better-sqlite3";
import path from "node:path";
import url from "node:url";

const sourceDir = path.dirname(url.fileURLToPath(import.meta.url));
const dbPath = path.join(sourceDir, "..", "db-ks.sqlite");

export const db = new Database(dbPath);

db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS kategorien (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bezeichnung TEXT NOT NULL,
    materialtyp TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS kleidungsstuecke (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    kategorie_id INTEGER NOT NULL,
    farbe TEXT NOT NULL,
    FOREIGN KEY (kategorie_id) REFERENCES kategorien (id)
      ON UPDATE CASCADE
      ON DELETE RESTRICT
  );
`);

console.log(`SQLite-Datenbank initialisiert: ${dbPath}`);
db.close();
