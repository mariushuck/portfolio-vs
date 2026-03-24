import { db_ws } from "../database.js";
import { mqttClient, mqttTopics } from "../mqtt.js";
import { logger } from "../utils.js";

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

async function publishWaschEvent(event, id, data) {
  if (!mqttClient) {
    return;
  }

  try {
    await mqttClient.publishAsync(
      mqttTopics.waschgaenge,
      JSON.stringify({
        event,
        entity: "Waschgang",
        id: String(id),
        data,
      }),
      { qos: 1 },
    );
  } catch (error) {
    logger.error("MQTT publish fehlgeschlagen (Waschgang):", error);
  }
}

export function findAllWaschgaenge() {
  return findAllWaschgaengeStmt.all();
}

export function findWaschgangById(id) {
  return findWaschgangByIdStmt.get(id);
}

export function createWaschgang(waschprogrammId) {
  const result = createWaschgangStmt.run(
    waschprogrammId,
    new Date().toISOString(),
    "geplant",
  );

  const created = findWaschgangById(result.lastInsertRowid);
  void publishWaschEvent("create", result.lastInsertRowid, created);

  return result;
}

export function updateWaschgang(id, waschprogrammId, zeitstempel, status) {
  const result = updateWaschgangStmt.run(waschprogrammId, zeitstempel, status, id);

  if (result.changes > 0) {
    const updated = findWaschgangById(id);
    void publishWaschEvent("update", id, updated);
  }

  return result;
}

export function patchWaschgang(id, updates) {
  const { waschprogrammId } = updates;

  if (waschprogrammId !== undefined) {
    const result = patchWaschgangWaschprogrammStmt.run(waschprogrammId, id);

    if (result.changes > 0) {
      const updated = findWaschgangById(id);
      void publishWaschEvent("update", id, updated);
    }

    return result;
  }

  return { changes: 0 };
}

export function deleteWaschgang(id) {
  const deleted = findWaschgangById(id);
  const result = deleteWaschgangStmt.run(id);

  if (result.changes > 0) {
    void publishWaschEvent("delete", id, deleted);
  }

  return result;
}
