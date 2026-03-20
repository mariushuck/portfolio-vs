import { db_ws } from "../database.js";

const findAllEmpfehlungenStmt = db_ws.prepare(`
  SELECT e.id,
         e.kategorie_id,
         e.waschprogramm_id,
         w.name AS waschprogramm_name,
         w.temperatur,
         w.dauer
    FROM empfehlungen e
    JOIN waschprogramme w
      ON w.id = e.waschprogramm_id
   ORDER BY e.kategorie_id
`);

const findEmpfehlungByKategorieIdStmt = db_ws.prepare(`
  SELECT e.id,
         e.kategorie_id,
         e.waschprogramm_id,
         w.name AS waschprogramm_name,
         w.temperatur,
         w.dauer
    FROM empfehlungen e
    JOIN waschprogramme w
      ON w.id = e.waschprogramm_id
   WHERE e.kategorie_id = ?
`);

const createEmpfehlungStmt = db_ws.prepare(`
  INSERT INTO empfehlungen (kategorie_id, waschprogramm_id)
    VALUES (?, ?)
`);

const updateEmpfehlungByKategorieIdStmt = db_ws.prepare(`
  UPDATE empfehlungen
    SET waschprogramm_id = ?
   WHERE kategorie_id = ?
`);

const patchEmpfehlungWaschprogrammStmt = db_ws.prepare(`
  UPDATE empfehlungen SET waschprogramm_id = ? WHERE kategorie_id = ?
`);

const deleteEmpfehlungByKategorieIdStmt = db_ws.prepare(`
  DELETE FROM empfehlungen
   WHERE kategorie_id = ?
`);

export function findAllEmpfehlungen() {
  return findAllEmpfehlungenStmt.all();
}

export function findEmpfehlungByKategorieId(kategorieId) {
  return findEmpfehlungByKategorieIdStmt.get(kategorieId);
}

export function createEmpfehlung(kategorieId, waschprogrammId) {
  return createEmpfehlungStmt.run(kategorieId, waschprogrammId);
}

export function updateEmpfehlungByKategorieId(kategorieId, waschprogrammId) {
  return updateEmpfehlungByKategorieIdStmt.run(waschprogrammId, kategorieId);
}

export function patchEmpfehlungByKategorieId(kategorieId, updates) {
  const { waschprogrammId } = updates;
  const hasWaschprogrammId = waschprogrammId !== undefined;

  if (hasWaschprogrammId) {
    return patchEmpfehlungWaschprogrammStmt.run(waschprogrammId, kategorieId);
  }

  return { changes: 0 };
}

export function deleteEmpfehlungByKategorieId(kategorieId) {
  return deleteEmpfehlungByKategorieIdStmt.run(kategorieId);
}
