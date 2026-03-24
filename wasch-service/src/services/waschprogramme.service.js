import { db_ws } from "../database.js";
import { mqttClient, mqttTopics } from "../mqtt.js";
import { logger } from "../utils.js";

const findAllWaschprogrammeStmt = db_ws.prepare(`
  SELECT id,
         name,
         temperatur,
         dauer
    FROM waschprogramme
   ORDER BY id
`);

const findWaschprogrammByIdStmt = db_ws.prepare(`
  SELECT id,
         name,
         temperatur,
         dauer
    FROM waschprogramme
   WHERE id = ?
`);

const createWaschprogrammStmt = db_ws.prepare(`
  INSERT INTO waschprogramme (name, temperatur, dauer)
    VALUES (?, ?, ?)
`);

const updateWaschprogrammStmt = db_ws.prepare(`
  UPDATE waschprogramme
     SET name = ?,
         temperatur = ?,
         dauer = ?
   WHERE id = ?
`);

const patchWaschprogrammNameStmt = db_ws.prepare(`
  UPDATE waschprogramme SET name = ? WHERE id = ?
`);

const patchWaschprogrammTemperaturStmt = db_ws.prepare(`
  UPDATE waschprogramme SET temperatur = ? WHERE id = ?
`);

const patchWaschprogrammDauerStmt = db_ws.prepare(`
  UPDATE waschprogramme SET dauer = ? WHERE id = ?
`);

const deleteWaschprogrammStmt = db_ws.prepare(`
  DELETE FROM waschprogramme
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
        entity: "Waschprogramm",
        id: String(id),
        data,
      }),
      { qos: 1 },
    );
  } catch (error) {
    logger.error("MQTT publish fehlgeschlagen (Waschprogramm):", error);
  }
}

export function findAllWaschprogramme() {
  return findAllWaschprogrammeStmt.all();
}

export function findWaschprogrammById(id) {
  return findWaschprogrammByIdStmt.get(id);
}

export function createWaschprogramm(name, temperatur, dauer) {
  const result = createWaschprogrammStmt.run(name, temperatur, dauer);
  const created = findWaschprogrammById(result.lastInsertRowid);

  void publishWaschEvent("create", result.lastInsertRowid, created);

  return result;
}

export function updateWaschprogramm(id, name, temperatur, dauer) {
  const result = updateWaschprogrammStmt.run(name, temperatur, dauer, id);

  if (result.changes > 0) {
    const updated = findWaschprogrammById(id);
    void publishWaschEvent("update", id, updated);
  }

  return result;
}

export function patchWaschprogramm(id, updates) {
  const { name, temperatur, dauer } = updates;
  const hasName = name !== undefined;
  const hasTemperatur = temperatur !== undefined;
  const hasDauer = dauer !== undefined;

  if (hasName && hasTemperatur && hasDauer) {
    const result = updateWaschprogrammStmt.run(name, temperatur, dauer, id);

    if (result.changes > 0) {
      const updated = findWaschprogrammById(id);
      void publishWaschEvent("update", id, updated);
    }

    return result;
  }

  if (hasName && !hasTemperatur && !hasDauer) {
    const result = patchWaschprogrammNameStmt.run(name, id);

    if (result.changes > 0) {
      const updated = findWaschprogrammById(id);
      void publishWaschEvent("update", id, updated);
    }

    return result;
  }

  if (!hasName && hasTemperatur && !hasDauer) {
    const result = patchWaschprogrammTemperaturStmt.run(temperatur, id);

    if (result.changes > 0) {
      const updated = findWaschprogrammById(id);
      void publishWaschEvent("update", id, updated);
    }

    return result;
  }

  if (!hasName && !hasTemperatur && hasDauer) {
    const result = patchWaschprogrammDauerStmt.run(dauer, id);

    if (result.changes > 0) {
      const updated = findWaschprogrammById(id);
      void publishWaschEvent("update", id, updated);
    }

    return result;
  }

  if (hasName || hasTemperatur || hasDauer) {
    const current = findWaschprogrammById(id);

    if (!current) {
      return { changes: 0 };
    }

    const result = updateWaschprogrammStmt.run(
      hasName ? name : current.name,
      hasTemperatur ? temperatur : current.temperatur,
      hasDauer ? dauer : current.dauer,
      id,
    );

    if (result.changes > 0) {
      const updated = findWaschprogrammById(id);
      void publishWaschEvent("update", id, updated);
    }

    return result;
  }

  return { changes: 0 };
}

export function deleteWaschprogramm(id) {
  const deleted = findWaschprogrammById(id);
  const result = deleteWaschprogrammStmt.run(id);

  if (result.changes > 0) {
    void publishWaschEvent("delete", id, deleted);
  }

  return result;
}
