/**
 * Copilot-generierter Code
 * Codestelle: wasch-service/src/services/empfehlungen.service.js
 * Prompt: "Based on the structure of the kleidung service, build the wasch service with the defined endpoints in wasch-service.yaml"
 */

import { db_ws } from "../database.js";

const findAllEmpfehlungenStmt = db_ws.prepare(`
  SELECT e.id,
         e.kategorie_id,
         e.waschprogramm_id,
         e.hinweise,
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
         e.hinweise,
         w.name AS waschprogramm_name,
         w.temperatur,
         w.dauer
    FROM empfehlungen e
    JOIN waschprogramme w
      ON w.id = e.waschprogramm_id
   WHERE e.kategorie_id = ?
`);

const createEmpfehlungStmt = db_ws.prepare(`
  INSERT INTO empfehlungen (kategorie_id, waschprogramm_id, hinweise)
    VALUES (?, ?, ?)
`);

const updateEmpfehlungByKategorieIdStmt = db_ws.prepare(`
  UPDATE empfehlungen
     SET waschprogramm_id = ?,
         hinweise = ?
   WHERE kategorie_id = ?
`);

const patchEmpfehlungWaschprogrammStmt = db_ws.prepare(`
  UPDATE empfehlungen SET waschprogramm_id = ? WHERE kategorie_id = ?
`);

const patchEmpfehlungHinweiseStmt = db_ws.prepare(`
  UPDATE empfehlungen SET hinweise = ? WHERE kategorie_id = ?
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

export function createEmpfehlung(kategorieId, waschprogrammId, hinweise) {
  return createEmpfehlungStmt.run(
    kategorieId,
    waschprogrammId,
    hinweise || null,
  );
}

export function updateEmpfehlungByKategorieId(
  kategorieId,
  waschprogrammId,
  hinweise,
) {
  return updateEmpfehlungByKategorieIdStmt.run(
    waschprogrammId,
    hinweise || null,
    kategorieId,
  );
}

export function patchEmpfehlungByKategorieId(kategorieId, updates) {
  const { waschprogrammId, hinweise } = updates;
  const hasWaschprogrammId = waschprogrammId !== undefined;
  const hasHinweise = hinweise !== undefined;

  if (hasWaschprogrammId && hasHinweise) {
    return updateEmpfehlungByKategorieId(
      kategorieId,
      waschprogrammId,
      hinweise,
    );
  }

  if (hasWaschprogrammId && !hasHinweise) {
    return patchEmpfehlungWaschprogrammStmt.run(waschprogrammId, kategorieId);
  }

  if (!hasWaschprogrammId && hasHinweise) {
    return patchEmpfehlungHinweiseStmt.run(hinweise, kategorieId);
  }

  return { changes: 0 };
}

export function deleteEmpfehlungByKategorieId(kategorieId) {
  return deleteEmpfehlungByKategorieIdStmt.run(kategorieId);
}
