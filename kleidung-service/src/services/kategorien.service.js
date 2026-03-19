/**
 * Copilot-generierter Code
 * Codestelle: kleidung-service/src/services/kategorien.service.js
 * Prompt: "finish this kleidung-service. note the prewritten code. one controller and service for each database entity"
 */

import { db_ks } from "../database.js";

// ==================== READ Statements ====================

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

// ==================== CREATE Statement ====================

const createKategorieStmt = db_ks.prepare(`
  INSERT INTO kategorien (bezeichnung, materialtyp)
    VALUES (?, ?)
`);

// ==================== UPDATE Statement ====================

const updateKategorieStmt = db_ks.prepare(`
  UPDATE kategorien
    SET bezeichnung = ?,
        materialtyp = ?
  WHERE id = ?
`);

// ==================== PATCH Statements (Partial Update) ====================

const patchKategorieBezeichnungStmt = db_ks.prepare(`
  UPDATE kategorien SET bezeichnung = ? WHERE id = ?
`);

const patchKategorieMaterialtypStmt = db_ks.prepare(`
  UPDATE kategorien SET materialtyp = ? WHERE id = ?
`);

// ==================== DELETE Statement ====================

const deleteKategorieStmt = db_ks.prepare(`
  DELETE FROM kategorien
   WHERE id = ?
`);

// ==================== READ ====================

/**
 * Finds all Kategorien
 * @returns {Array<object>}
 */
export function findAllKategorien() {
  return findAllKategorienStmt.all();
}

/**
 * Finds a specific Kategorie by ID
 * @param {number} id
 * @returns {object | undefined}
 */
export function findKategorieById(id) {
  return findKategorieByIdStmt.get(id);
}

// ==================== CREATE ====================

/**
 * Creates a new Kategorie
 * @param {string} bezeichnung
 * @param {string} materialtyp
 * @returns {object}
 */
export function createKategorie(bezeichnung, materialtyp) {
  return createKategorieStmt.run(bezeichnung, materialtyp);
}

// ==================== UPDATE ====================

/**
 * Updates an existing Kategorie
 * @param {number} id
 * @param {string} bezeichnung
 * @param {string} materialtyp
 * @returns {object}
 */
export function updateKategorie(id, bezeichnung, materialtyp) {
  return updateKategorieStmt.run(bezeichnung, materialtyp, id);
}

// ==================== PATCH ====================

/**
 * Partially updates a Kategorie with only provided fields
 * @param {number} id
 * @param {object} updates - Object with fields: bezeichnung, materialtyp
 * @returns {object}
 */
export function patchKategorie(id, updates) {
  const { bezeichnung, materialtyp } = updates;
  const hasBezeichnung = bezeichnung !== undefined;
  const hasMaterialtyp = materialtyp !== undefined;

  if (hasBezeichnung && hasMaterialtyp) {
    return updateKategorie(id, bezeichnung, materialtyp);
  } else if (hasBezeichnung) {
    return patchKategorieBezeichnungStmt.run(bezeichnung, id);
  } else if (hasMaterialtyp) {
    return patchKategorieMaterialtypStmt.run(materialtyp, id);
  } else {
    return { changes: 0 };
  }
}

// ==================== DELETE ====================

/**
 * Deletes a Kategorie by ID
 * @param {number} id
 * @returns {object}
 */
export function deleteKategorie(id) {
  return deleteKategorieStmt.run(id);
}
