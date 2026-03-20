import { db_ks } from "../database.js";

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
  return createKleidungsstueckStmt.run(name, kategorie_id, farbe);
}

/**
 * @param {number} id
 * @param {string} name
 * @param {number} kategorie_id
 * @param {string} farbe
 * @returns {object}
 */
export function updateKleidungsstueck(id, name, kategorie_id, farbe) {
  return updateKleidungsstueckStmt.run(name, kategorie_id, farbe, id);
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
    return { changes: 0 };
  }
}

/**
 * @param {number} id
 * @returns {object}
 */
export function deleteKleidungsstueck(id) {
  return deleteKleidungsstueckStmt.run(id);
}
