/**
 * Copilot-generierter Code
 * Codestelle: wasch-service/src/services/waschgaenge.service.js
 * Prompt: "Based on the structure of the kleidung service, build the wasch service with the defined endpoints in wasch-service.yaml"
 */

import { db_ws } from "../database.js";

const findAllWaschgaengeStmt = db_ws.prepare(`
  SELECT wg.id,
         wg.waschprogramm_id,
         wg.zeitstempel,
         wg.status,
         w.name AS waschprogramm_name,
         w.temperatur,
         w.dauer
    FROM waschgaenge wg
    JOIN waschprogramme w
      ON w.id = wg.waschprogramm_id
   ORDER BY wg.id
`);

const findWaschgangByIdStmt = db_ws.prepare(`
  SELECT wg.id,
         wg.waschprogramm_id,
         wg.zeitstempel,
         wg.status,
         w.name AS waschprogramm_name,
         w.temperatur,
         w.dauer
    FROM waschgaenge wg
    JOIN waschprogramme w
      ON w.id = wg.waschprogramm_id
   WHERE wg.id = ?
`);

const createWaschgangStmt = db_ws.prepare(`
  INSERT INTO waschgaenge (waschprogramm_id, zeitstempel, status)
    VALUES (?, ?, ?)
`);

const updateWaschgangStmt = db_ws.prepare(`
  UPDATE waschgaenge
     SET waschprogramm_id = ?,
         zeitstempel = ?,
         status = ?
   WHERE id = ?
`);

const patchWaschgangWaschprogrammStmt = db_ws.prepare(`
  UPDATE waschgaenge SET waschprogramm_id = ? WHERE id = ?
`);

const deleteWaschgangStmt = db_ws.prepare(`
  DELETE FROM waschgaenge
   WHERE id = ?
`);

export function findAllWaschgaenge() {
  return findAllWaschgaengeStmt.all();
}

export function findWaschgangById(id) {
  return findWaschgangByIdStmt.get(id);
}

export function createWaschgang(waschprogrammId) {
  return createWaschgangStmt.run(
    waschprogrammId,
    new Date().toISOString(),
    "geplant",
  );
}

export function updateWaschgang(id, waschprogrammId, zeitstempel, status) {
  return updateWaschgangStmt.run(waschprogrammId, zeitstempel, status, id);
}

export function patchWaschgang(id, updates) {
  const { waschprogrammId } = updates;

  if (waschprogrammId !== undefined) {
    return patchWaschgangWaschprogrammStmt.run(waschprogrammId, id);
  }

  return { changes: 0 };
}

export function deleteWaschgang(id) {
  return deleteWaschgangStmt.run(id);
}
