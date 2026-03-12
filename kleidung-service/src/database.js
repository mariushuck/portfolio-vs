import sqlite from "better-sqlite3";

export const db_ks = sqlite("db_ks.sqlite");
db_ks.pragma("journal_mode = WAL");
db_ks.pragma("foreign_keys = ON");

//Tabellen anlegen

const createKategorienTable = db_ks.prepare(`
  CREATE TABLE IF NOT EXISTS kategorien (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bezeichnung TEXT NOT NULL,
    materialtyp TEXT NOT NULL
  )
`);

const createKleidungsstueckeTable = db_ks.prepare(`
  CREATE TABLE IF NOT EXISTS kleidungsstuecke (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    kategorie_id INTEGER NOT NULL,
    farbe TEXT NOT NULL,
    FOREIGN KEY (kategorie_id) REFERENCES kategorien (id)
      ON UPDATE CASCADE
      ON DELETE RESTRICT
  )
`);

createKategorienTable.run();
createKleidungsstueckeTable.run();

//Demodaten anlegen

const fillKategorienTable = db_ks.prepare(`
    INSERT INTO kategorien(id, bezeichnung, materialtyp)
        VALUES (1, 'T-Shirt',  'Baumwolle'),
               (2, 'Pullover', 'Wolle'),
               (3, 'Jeans',    'Denim')
               
        -- Schon vorhandene Datensätze aktualisieren
        ON CONFLICT(id) DO UPDATE SET bezeichnung = excluded.bezeichnung,
                                      materialtyp = excluded.materialtyp
`);

const fillKleidungsstueckeTable = db_ks.prepare(`
    INSERT INTO kleidungsstuecke(id, name, kategorie_id, farbe)
        VALUES (1, 'Weisses Basic Shirt',   1, 'weiss'),
               (2, 'Grauer Winterpullover', 2, 'grau'),
               (3, 'Blaue Slim Fit Jeans',  3, 'blau')
               
        -- Schon vorhandene Datensätze aktualisieren
        ON CONFLICT(id) DO UPDATE SET name         = excluded.name,
                                      kategorie_id = excluded.kategorie_id,
                                      farbe        = excluded.farbe
`);

fillKategorienTable.run();
fillKleidungsstueckeTable.run();
