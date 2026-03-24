import { db_ks } from "../database.js";
import { mqttClient, mqttTopics } from "../mqtt.js";
import { logger } from "../utils.js";

const findAllKleidungsstueckeStmt = db_ks.prepare(`
  SELECT ks.id,
         ks.name,
         ks.farbe,
         ks.kategorie_id,
         k.bezeichnung AS kategorie,
         k.materialtyp
    FROM kleidungsstuecke ks
    JOIN kategorien k
      ON k.id = ks.kategorie_id
   ORDER BY ks.id
`);

const findKleidungsstueckByIdStmt = db_ks.prepare(`
  SELECT ks.id,
         ks.name,
         ks.farbe,
         ks.kategorie_id,
         k.bezeichnung AS kategorie,
         k.materialtyp
    FROM kleidungsstuecke ks
    JOIN kategorien k
      ON k.id = ks.kategorie_id
   WHERE ks.id = ?
`);

const createKleidungsstueckStmt = db_ks.prepare(`
  INSERT INTO kleidungsstuecke (name, kategorie_id, farbe)
    VALUES (?, ?, ?)
`);

const updateKleidungsstueckStmt = db_ks.prepare(`
  UPDATE kleidungsstuecke
    SET name = ?,
        kategorie_id = ?,
        farbe = ?
  WHERE id = ?
`);

const patchKleidungsstueckNameStmt = db_ks.prepare(`
  UPDATE kleidungsstuecke SET name = ? WHERE id = ?
`);

const patchKleidungsstueckKategorieFarbeStmt = db_ks.prepare(`
  UPDATE kleidungsstuecke SET kategorie_id = ?, farbe = ? WHERE id = ?
`);

const patchKleidungsstueckKategorieStmt = db_ks.prepare(`
  UPDATE kleidungsstuecke SET kategorie_id = ? WHERE id = ?
`);

const patchKleidungsstueckNamFarbeStmt = db_ks.prepare(`
  UPDATE kleidungsstuecke SET name = ?, farbe = ? WHERE id = ?
`);

const patchKleidungsstueckFarbeStmt = db_ks.prepare(`
  UPDATE kleidungsstuecke SET farbe = ? WHERE id = ?
`);

const deleteKleidungsstueckStmt = db_ks.prepare(`
  DELETE FROM kleidungsstuecke
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
        entity: "Kleidung",
        id: String(id),
        data,
      }),
      { qos: 1 },
    );
  } catch (error) {
    logger.error("MQTT publish fehlgeschlagen (Kleidung):", error);
  }
}

/**
 * @returns {Array<object>}
 */
export function findAllKleidungsstuecke() {
  return findAllKleidungsstueckeStmt.all();
}

/**
 * @param {number} id
 * @returns {object | undefined}
 */
export function findKleidungsstueckById(id) {
  return findKleidungsstueckByIdStmt.get(id);
}

/**
 * @param {string} name
 * @param {number} kategorie_id
 * @param {string} farbe
 * @returns {object}
 */
export function createKleidungsstueck(name, kategorie_id, farbe) {
  const result = createKleidungsstueckStmt.run(name, kategorie_id, farbe);
  const created = findKleidungsstueckById(result.lastInsertRowid);

  void publishKleidungEvent("create", result.lastInsertRowid, created);

  return result;
}

/**
 * @param {number} id
 * @param {string} name
 * @param {number} kategorie_id
 * @param {string} farbe
 * @returns {object}
 */
export function updateKleidungsstueck(id, name, kategorie_id, farbe) {
  const result = updateKleidungsstueckStmt.run(name, kategorie_id, farbe, id);

  if (result.changes > 0) {
    const updated = findKleidungsstueckById(id);
    void publishKleidungEvent("update", id, updated);
  }

  return result;
}

/**
 * @param {number} id
 * @param {object} updates
 * @returns {object}
 */
export function patchKleidungsstueck(id, updates) {
  const { name, kategorieId, farbe } = updates;
  const hasName = name !== undefined;
  const hasKategorie = kategorieId !== undefined;
  const hasFarbe = farbe !== undefined;

  let result;

  if (hasName && !hasKategorie && !hasFarbe) {
    result = patchKleidungsstueckNameStmt.run(name, id);
  } else if (!hasName && hasKategorie && hasFarbe) {
    result = patchKleidungsstueckKategorieFarbeStmt.run(kategorieId, farbe, id);
  } else if (!hasName && hasKategorie && !hasFarbe) {
    result = patchKleidungsstueckKategorieStmt.run(kategorieId, id);
  } else if (hasName && !hasKategorie && hasFarbe) {
    result = patchKleidungsstueckNamFarbeStmt.run(name, farbe, id);
  } else if (!hasName && !hasKategorie && hasFarbe) {
    result = patchKleidungsstueckFarbeStmt.run(farbe, id);
  } else if (hasName && hasKategorie && hasFarbe) {
    result = updateKleidungsstueckStmt.run(name, kategorieId, farbe, id);
  } else if (hasName && hasKategorie && !hasFarbe) {
    const current = findKleidungsstueckById(id);
    result = updateKleidungsstueckStmt.run(
      name,
      kategorieId,
      current?.farbe || null,
      id,
    );
  } else {
    result = { changes: 0 };
  }

  if (result.changes > 0) {
    const updated = findKleidungsstueckById(id);
    void publishKleidungEvent("update", id, updated);
  }

  return result;
}

/**
 * @param {number} id
 * @returns {object}
 */
export function deleteKleidungsstueck(id) {
  const deleted = findKleidungsstueckById(id);
  const result = deleteKleidungsstueckStmt.run(id);

  if (result.changes > 0) {
    void publishKleidungEvent("delete", id, deleted);
  }

  return result;
}
