/**
 * Copilot-generierter Code
 * Codestelle: kleidung-service/src/services/kleidung.service.js
 * Prompt: "finish this kleidung-service. note the prewritten code. one controller and service for each database entity"
 */

import { db_ks } from "../database.js";

// ==================== READ Statements ====================

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

// ==================== CREATE Statement ====================

const createKleidungsstueckStmt = db_ks.prepare(`
  INSERT INTO kleidungsstuecke (name, kategorie_id, farbe)
    VALUES (?, ?, ?)
`);

// ==================== UPDATE Statement ====================

const updateKleidungsstueckStmt = db_ks.prepare(`
  UPDATE kleidungsstuecke
    SET name = ?,
        kategorie_id = ?,
        farbe = ?
  WHERE id = ?
`);

// ==================== PATCH Statements (Partial Update) ====================

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

// ==================== DELETE Statement ====================

const deleteKleidungsstueckStmt = db_ks.prepare(`
  DELETE FROM kleidungsstuecke
   WHERE id = ?
`);

// ==================== READ ====================

/**
 * Finds all Kleidungsstücke with their Kategorie information
 * @returns {Array<object>}
 */
export function findAllKleidungsstuecke() {
  return findAllKleidungsstueckeStmt.all();
}

/**
 * Finds a specific Kleidungsstück by ID
 * @param {number} id
 * @returns {object | undefined}
 */
export function findKleidungsstueckById(id) {
  return findKleidungsstueckByIdStmt.get(id);
}

// ==================== CREATE ====================

/**
 * Creates a new Kleidungsstück
 * @param {string} name
 * @param {number} kategorie_id
 * @param {string} farbe
 * @returns {object}
 */
export function createKleidungsstueck(name, kategorie_id, farbe) {
  return createKleidungsstueckStmt.run(name, kategorie_id, farbe);
}

// ==================== UPDATE ====================

/**
 * Updates an existing Kleidungsstück
 * @param {number} id
 * @param {string} name
 * @param {number} kategorie_id
 * @param {string} farbe
 * @returns {object}
 */
export function updateKleidungsstueck(id, name, kategorie_id, farbe) {
  return updateKleidungsstueckStmt.run(name, kategorie_id, farbe, id);
}

// ==================== PATCH ====================

/**
 * Partially updates a Kleidungsstück with only provided fields
 * @param {number} id
 * @param {object} updates - Object with fields: name, kategorieId, farbe
 * @returns {object}
 */
export function patchKleidungsstueck(id, updates) {
  const { name, kategorieId, farbe } = updates;
  const hasName = name !== undefined;
  const hasKategorie = kategorieId !== undefined;
  const hasFarbe = farbe !== undefined;

  if (hasName && !hasKategorie && !hasFarbe) {
    return patchKleidungsstueckNameStmt.run(name, id);
  } else if (!hasName && hasKategorie && hasFarbe) {
    return patchKleidungsstueckKategorieFarbeStmt.run(kategorieId, farbe, id);
  } else if (!hasName && hasKategorie && !hasFarbe) {
    return patchKleidungsstueckKategorieStmt.run(kategorieId, id);
  } else if (hasName && !hasKategorie && hasFarbe) {
    return patchKleidungsstueckNamFarbeStmt.run(name, farbe, id);
  } else if (!hasName && !hasKategorie && hasFarbe) {
    return patchKleidungsstueckFarbeStmt.run(farbe, id);
  } else if (hasName && hasKategorie && hasFarbe) {
    return updateKleidungsstueck(id, name, kategorieId, farbe);
  } else if (hasName && hasKategorie && !hasFarbe) {
    const current = findKleidungsstueckById(id);
    return updateKleidungsstueck(id, name, kategorieId, current?.farbe || null);
  } else {
    // No valid updates
    return { changes: 0 };
  }
}

// ==================== DELETE ====================

/**
 * Deletes a Kleidungsstück by ID
 * @param {number} id
 * @returns {object}
 */
export function deleteKleidungsstueck(id) {
  return deleteKleidungsstueckStmt.run(id);
}
