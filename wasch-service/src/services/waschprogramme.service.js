import { db_ws } from "../database.js";

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

export function findAllWaschprogramme() {
  return findAllWaschprogrammeStmt.all();
}

export function findWaschprogrammById(id) {
  return findWaschprogrammByIdStmt.get(id);
}

export function createWaschprogramm(name, temperatur, dauer) {
  return createWaschprogrammStmt.run(name, temperatur, dauer);
}

export function updateWaschprogramm(id, name, temperatur, dauer) {
  return updateWaschprogrammStmt.run(name, temperatur, dauer, id);
}

export function patchWaschprogramm(id, updates) {
  const { name, temperatur, dauer } = updates;
  const hasName = name !== undefined;
  const hasTemperatur = temperatur !== undefined;
  const hasDauer = dauer !== undefined;

  if (hasName && hasTemperatur && hasDauer) {
    return updateWaschprogramm(id, name, temperatur, dauer);
  }

  if (hasName && !hasTemperatur && !hasDauer) {
    return patchWaschprogrammNameStmt.run(name, id);
  }

  if (!hasName && hasTemperatur && !hasDauer) {
    return patchWaschprogrammTemperaturStmt.run(temperatur, id);
  }

  if (!hasName && !hasTemperatur && hasDauer) {
    return patchWaschprogrammDauerStmt.run(dauer, id);
  }

  if (hasName || hasTemperatur || hasDauer) {
    const current = findWaschprogrammById(id);

    if (!current) {
      return { changes: 0 };
    }

    return updateWaschprogramm(
      id,
      hasName ? name : current.name,
      hasTemperatur ? temperatur : current.temperatur,
      hasDauer ? dauer : current.dauer,
    );
  }

  return { changes: 0 };
}

export function deleteWaschprogramm(id) {
  return deleteWaschprogrammStmt.run(id);
}
