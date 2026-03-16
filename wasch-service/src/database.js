import sqlite from "better-sqlite3";

export const db_ws = sqlite("db_ws.sqlite");
db_ws.pragma("journal_mode = WAL");
db_ws.pragma("foreign_keys = ON");

// Tabellen anlegen

const createWaschprogrammeTable = db_ws.prepare(`
  CREATE TABLE IF NOT EXISTS waschprogramme (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    temperatur INTEGER NOT NULL,
    dauer INTEGER NOT NULL
  )
`);

const createWaschgaengeTable = db_ws.prepare(`
  CREATE TABLE IF NOT EXISTS waschgaenge (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    waschprogramm_id INTEGER NOT NULL,
    zeitstempel TEXT NOT NULL,
    status TEXT NOT NULL,
    FOREIGN KEY (waschprogramm_id) REFERENCES waschprogramme (id)
      ON UPDATE CASCADE
      ON DELETE RESTRICT
  )
`);

const createEmpfehlungenTable = db_ws.prepare(`
  CREATE TABLE IF NOT EXISTS empfehlungen (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kategorie_id INTEGER NOT NULL,
    waschprogramm_id INTEGER NOT NULL,
    FOREIGN KEY (waschprogramm_id) REFERENCES waschprogramme (id)
      ON UPDATE CASCADE
      ON DELETE RESTRICT
  )
`);

createWaschprogrammeTable.run();
createWaschgaengeTable.run();
createEmpfehlungenTable.run();

// Demodaten anlegen

const fillWaschprogrammeTable = db_ws.prepare(`
    INSERT INTO waschprogramme(id, name, temperatur, dauer)
        VALUES (1, 'Feinwaesche 30 Grad', 30, 45),
               (2, 'Wolle 20 Grad',       20, 35),
               (3, 'Jeans 40 Grad',       40, 60)
               
        -- Schon vorhandene Datensätze aktualisieren (GitHub Copilot)
        ON CONFLICT(id) DO UPDATE SET name       = excluded.name,
                                      temperatur = excluded.temperatur,
                                      dauer      = excluded.dauer
`);

const fillWaschgaengeTable = db_ws.prepare(`
    INSERT INTO waschgaenge(id, waschprogramm_id, zeitstempel, status)
        VALUES (1, 1, '2026-03-10T08:15:00.000Z', 'abgeschlossen'),
               (2, 2, '2026-03-11T10:30:00.000Z', 'in_bearbeitung'),
               (3, 3, '2026-03-12T07:45:00.000Z', 'geplant')
               
        -- Schon vorhandene Datensätze aktualisieren (GitHub Copilot)
        ON CONFLICT(id) DO UPDATE SET waschprogramm_id = excluded.waschprogramm_id,
                                      zeitstempel      = excluded.zeitstempel,
                                      status           = excluded.status
`);

const fillEmpfehlungenTable = db_ws.prepare(`
    INSERT INTO empfehlungen(id, kategorie_id, waschprogramm_id)
        VALUES (1, 1, 1),
               (2, 2, 2),
               (3, 3, 3)
               
        -- Schon vorhandene Datensätze aktualisieren (GitHub Copilot)
        ON CONFLICT(id) DO UPDATE SET kategorie_id     = excluded.kategorie_id,
                                      waschprogramm_id = excluded.waschprogramm_id
`);

fillWaschprogrammeTable.run();
fillWaschgaengeTable.run();
fillEmpfehlungenTable.run();
