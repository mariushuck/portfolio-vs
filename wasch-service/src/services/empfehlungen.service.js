import { db_ws } from "../database.js";
import { mqttClient, mqttTopics } from "../mqtt.js";
import { logger } from "../utils.js";

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

async function publishWaschEvent(event, id, data) {
  if (!mqttClient) {
    return;
  }

  try {
    await mqttClient.publishAsync(
      mqttTopics.waschgaenge,
      JSON.stringify({
        event,
        entity: "Empfehlung",
        id: String(id),
        data,
      }),
      { qos: 1 },
    );
  } catch (error) {
    logger.error("MQTT publish fehlgeschlagen (Empfehlung):", error);
  }
}

export function findAllEmpfehlungen() {
  return findAllEmpfehlungenStmt.all();
}

export function findEmpfehlungByKategorieId(kategorieId) {
  return findEmpfehlungByKategorieIdStmt.get(kategorieId);
}

export function createEmpfehlung(kategorieId, waschprogrammId) {
  const result = createEmpfehlungStmt.run(kategorieId, waschprogrammId);
  const created = findEmpfehlungByKategorieId(kategorieId);

  void publishWaschEvent("create", kategorieId, created);

  return result;
}

export function updateEmpfehlungByKategorieId(kategorieId, waschprogrammId) {
  const result = updateEmpfehlungByKategorieIdStmt.run(waschprogrammId, kategorieId);

  if (result.changes > 0) {
    const updated = findEmpfehlungByKategorieId(kategorieId);
    void publishWaschEvent("update", kategorieId, updated);
  }

  return result;
}

export function patchEmpfehlungByKategorieId(kategorieId, updates) {
  const { waschprogrammId } = updates;
  const hasWaschprogrammId = waschprogrammId !== undefined;

  if (hasWaschprogrammId) {
    const result = patchEmpfehlungWaschprogrammStmt.run(
      waschprogrammId,
      kategorieId,
    );

    if (result.changes > 0) {
      const updated = findEmpfehlungByKategorieId(kategorieId);
      void publishWaschEvent("update", kategorieId, updated);
    }

    return result;
  }

  return { changes: 0 };
}

export function deleteEmpfehlungByKategorieId(kategorieId) {
  const deleted = findEmpfehlungByKategorieId(kategorieId);
  const result = deleteEmpfehlungByKategorieIdStmt.run(kategorieId);

  if (result.changes > 0) {
    void publishWaschEvent("delete", kategorieId, deleted);
  }

  return result;
}
