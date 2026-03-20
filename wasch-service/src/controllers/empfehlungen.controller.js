import {
  findAllEmpfehlungen,
  findEmpfehlungByKategorieId,
  createEmpfehlung,
  updateEmpfehlungByKategorieId,
  patchEmpfehlungByKategorieId,
  deleteEmpfehlungByKategorieId,
} from "../services/empfehlungen.service.js";
import { throwError, throwNotFound } from "../utils.js";

/**
 * @param {Express.App} app
 */
export default function registerRoutes(app) {
  app.get("/empfehlungen", getAllEmpfehlungen);
  app.get("/empfehlungen/:kategorieId", getEmpfehlungByKategorieId);
  app.post("/empfehlungen", createEmpfehlungRoute);
  app.put("/empfehlungen/:kategorieId", updateEmpfehlungRoute);
  app.patch("/empfehlungen/:kategorieId", patchEmpfehlungRoute);
  app.delete("/empfehlungen/:kategorieId", deleteEmpfehlungRoute);
}

function getAllEmpfehlungen(req, res) {
  const result = findAllEmpfehlungen();
  res.status(200);
  res.send(result);
}

function getEmpfehlungByKategorieId(req, res) {
  const kategorieId = Number(req.params.kategorieId);

  if (!Number.isInteger(kategorieId) || kategorieId < 1) {
    throwError("INVALID-KATEGORIE-ID", "Ungültige Kategorie-ID", 400);
  }

  const item = findEmpfehlungByKategorieId(kategorieId);

  if (!item) {
    throwNotFound();
  }

  res.status(200);
  res.send(item);
}

function createEmpfehlungRoute(req, res) {
  const { kategorieId, waschprogrammId } = req.body;

  if (!Number.isInteger(kategorieId) || !Number.isInteger(waschprogrammId)) {
    throwError(
      "MISSING-FIELDS",
      "Erforderliche Felder: kategorieId (int), waschprogrammId (int)",
      400,
    );
  }

  const result = createEmpfehlung(kategorieId, waschprogrammId);

  res.status(201);
  res.send({
    id: result.lastInsertRowid,
    kategorieId,
    waschprogrammId,
  });
}

function updateEmpfehlungRoute(req, res) {
  const routeKategorieId = Number(req.params.kategorieId);

  if (!Number.isInteger(routeKategorieId) || routeKategorieId < 1) {
    throwError("INVALID-KATEGORIE-ID", "Ungültige Kategorie-ID", 400);
  }

  const { kategorieId, waschprogrammId } = req.body;

  if (!Number.isInteger(kategorieId) || !Number.isInteger(waschprogrammId)) {
    throwError(
      "MISSING-FIELDS",
      "Erforderliche Felder: kategorieId (int), waschprogrammId (int)",
      400,
    );
  }

  if (kategorieId !== routeKategorieId) {
    throwError(
      "KATEGORIE-ID-MISMATCH",
      "kategorieId im Body muss der URL entsprechen",
      400,
    );
  }

  const item = findEmpfehlungByKategorieId(routeKategorieId);

  if (!item) {
    throwNotFound();
  }

  const result = updateEmpfehlungByKategorieId(
    routeKategorieId,
    waschprogrammId,
  );

  if (result.changes === 0) {
    throwError("UPDATE-FAILED", "Update fehlgeschlagen", 500);
  }

  const updated = findEmpfehlungByKategorieId(routeKategorieId);
  res.status(200);
  res.send(updated);
}

function patchEmpfehlungRoute(req, res) {
  const kategorieId = Number(req.params.kategorieId);

  if (!Number.isInteger(kategorieId) || kategorieId < 1) {
    throwError("INVALID-KATEGORIE-ID", "Ungültige Kategorie-ID", 400);
  }

  const { waschprogrammId } = req.body;

  if (waschprogrammId === undefined) {
    throwError(
      "MISSING-FIELDS",
      "Erforderliches Feld: waschprogrammId (int)",
      400,
    );
  }

  if (!Number.isInteger(waschprogrammId)) {
    throwError("INVALID-FIELDS", "Ungültige Feldwerte", 400);
  }

  const item = findEmpfehlungByKategorieId(kategorieId);

  if (!item) {
    throwNotFound();
  }

  const result = patchEmpfehlungByKategorieId(kategorieId, req.body);

  if (result.changes === 0) {
    throwError("PATCH-FAILED", "Patch fehlgeschlagen", 500);
  }

  const updated = findEmpfehlungByKategorieId(kategorieId);
  res.status(200);
  res.send(updated);
}

function deleteEmpfehlungRoute(req, res) {
  const kategorieId = Number(req.params.kategorieId);

  if (!Number.isInteger(kategorieId) || kategorieId < 1) {
    throwError("INVALID-KATEGORIE-ID", "Ungültige Kategorie-ID", 400);
  }

  const item = findEmpfehlungByKategorieId(kategorieId);

  if (!item) {
    throwNotFound();
  }

  const result = deleteEmpfehlungByKategorieId(kategorieId);

  if (result.changes === 0) {
    throwError("DELETE-FAILED", "Delete fehlgeschlagen", 500);
  }

  res.status(200);
  res.send({ message: "Erfolgreich gelöscht" });
}
