import { db_ks } from "../database.js";
import { mqttClient, mqttTopics } from "../mqtt.js";
import { logger } from "../utils.js";

const findAllKategorienStmt = db_ks.prepare(`
  SELECT id,
         bezeichnung,
         materialtyp
    FROM kategorien
   ORDER BY id
`);

const findKategorieByIdStmt = db_ks.prepare(`
  SELECT id,
         bezeichnung,
         materialtyp
    FROM kategorien
   WHERE id = ?
`);

const createKategorieStmt = db_ks.prepare(`
  INSERT INTO kategorien (bezeichnung, materialtyp)
    VALUES (?, ?)
`);

const updateKategorieStmt = db_ks.prepare(`
  UPDATE kategorien
    SET bezeichnung = ?,
        materialtyp = ?
  WHERE id = ?
`);

const patchKategorieBezeichnungStmt = db_ks.prepare(`
  UPDATE kategorien SET bezeichnung = ? WHERE id = ?
`);

const patchKategorieMaterialtypStmt = db_ks.prepare(`
  UPDATE kategorien SET materialtyp = ? WHERE id = ?
`);

const deleteKategorieStmt = db_ks.prepare(`
  DELETE FROM kategorien
   WHERE id = ?
`);

async function publishKleidungEvent(event, id, data) {
  if (!mqttClient) {
    return;
  }

  try {
    await mqttClient.publishAsync(
      mqttTopics.kleidung,
      JSON.stringify({
        event,
        entity: "Kategorie",
        id: String(id),
        data,
      }),
      { qos: 1 },
    );
  } catch (error) {
    logger.error("MQTT publish fehlgeschlagen (Kategorie):", error);
  }
}

/**
 * @returns {Array<object>}
 */
export function findAllKategorien() {
  return findAllKategorienStmt.all();
}

/**
 * @param {number} id
 * @returns {object | undefined}
 */
export function findKategorieById(id) {
  return findKategorieByIdStmt.get(id);
}

/**
 * @param {string} bezeichnung
 * @param {string} materialtyp
 * @returns {object}
 */
export function createKategorie(bezeichnung, materialtyp) {
  const result = createKategorieStmt.run(bezeichnung, materialtyp);
  const created = findKategorieById(result.lastInsertRowid);

  void publishKleidungEvent("create", result.lastInsertRowid, created);

  return result;
}

/**
 * @param {number} id
 * @param {string} bezeichnung
 * @param {string} materialtyp
 * @returns {object}
 */
export function updateKategorie(id, bezeichnung, materialtyp) {
  const result = updateKategorieStmt.run(bezeichnung, materialtyp, id);

  if (result.changes > 0) {
    const updated = findKategorieById(id);
    void publishKleidungEvent("update", id, updated);
  }

  return result;
}

/**
 * @param {number} id
 * @param {object} updates
 * @returns {object}
 */
export function patchKategorie(id, updates) {
  const { bezeichnung, materialtyp } = updates;
  const hasBezeichnung = bezeichnung !== undefined;
  const hasMaterialtyp = materialtyp !== undefined;

  let result;

  if (hasBezeichnung && hasMaterialtyp) {
    result = updateKategorieStmt.run(bezeichnung, materialtyp, id);
  } else if (hasBezeichnung) {
    result = patchKategorieBezeichnungStmt.run(bezeichnung, id);
  } else if (hasMaterialtyp) {
    result = patchKategorieMaterialtypStmt.run(materialtyp, id);
  } else {
    result = { changes: 0 };
  }

  if (result.changes > 0) {
    const updated = findKategorieById(id);
    void publishKleidungEvent("update", id, updated);
  }

  return result;
}

/**
 * @param {number} id
 * @returns {object}
 */
export function deleteKategorie(id) {
  const deleted = findKategorieById(id);
  const result = deleteKategorieStmt.run(id);

  if (result.changes > 0) {
    void publishKleidungEvent("delete", id, deleted);
  }

  return result;
}
