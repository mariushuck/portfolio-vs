import { db_ks } from "../database.js";

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
  return createKategorieStmt.run(bezeichnung, materialtyp);
}

/**
 * @param {number} id
 * @param {string} bezeichnung
 * @param {string} materialtyp
 * @returns {object}
 */
export function updateKategorie(id, bezeichnung, materialtyp) {
  return updateKategorieStmt.run(bezeichnung, materialtyp, id);
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

/**
 * @param {number} id
 * @returns {object}
 */
export function deleteKategorie(id) {
  return deleteKategorieStmt.run(id);
}
