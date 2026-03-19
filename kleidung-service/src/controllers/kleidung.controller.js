/**
 * Copilot-generierter Code
 * Codestelle: kleidung-service/src/controllers/kleidung.controller.js
 * Prompt: "use the endpoints described in the kleidung-service.yaml"
 */

import {
  findAllKleidungsstuecke,
  findKleidungsstueckById,
  createKleidungsstueck,
  updateKleidungsstueck,
  patchKleidungsstueck,
  deleteKleidungsstueck,
} from "../services/kleidung.service.js";
import { throwError, throwNotFound } from "../utils.js";

/**
 * @param {Express.App} app
 */
export default function registerRoutes(app) {
  app.get("/kleidungsstuecke", getAllKleidungsstuecke);
  app.get("/kleidungsstuecke/:id", getKleidungsstueckById);
  app.post("/kleidungsstuecke", createKleidungsstueckRoute);
  app.put("/kleidungsstuecke/:id", updateKleidungsstueckRoute);
  app.patch("/kleidungsstuecke/:id", patchKleidungsstueckRoute);
  app.delete("/kleidungsstuecke/:id", deleteKleidungsstueckRoute);
}

/**
 * GET /kleidungsstuecke - Returns array of all Kleidungsstücke
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
function getAllKleidungsstuecke(req, res) {
  let result = findAllKleidungsstuecke();

  res.status(200);
  res.send(result);
}

/**
 * GET /kleidungsstuecke/:id
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
function getKleidungsstueckById(req, res) {
  let id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    throwError("INVALID-ID", "Ungültige ID", 400);
  }

  let item = findKleidungsstueckById(id);

  if (!item) {
    throwNotFound();
  }

  res.status(200);
  res.send(item);
}

/**
 * POST /kleidungsstuecke
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
function createKleidungsstueckRoute(req, res) {
  let { name, kategorieId, farbe } = req.body;

  if (!name || !kategorieId) {
    throwError(
      "MISSING-FIELDS",
      "Erforderliche Felder: name, kategorieId",
      400,
    );
  }

  if (!Number.isInteger(kategorieId) || kategorieId < 1) {
    throwError("INVALID-KATEGORIE-ID", "Ungültige Kategorie-ID", 400);
  }

  let result = createKleidungsstueck(name, kategorieId, farbe || null);

  res.status(201);
  res.send({
    id: result.lastInsertRowid,
    name,
    kategorieId,
    farbe: farbe || null,
  });
}

/**
 * PUT /kleidungsstuecke/:id
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
function updateKleidungsstueckRoute(req, res) {
  let id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    throwError("INVALID-ID", "Ungültige ID", 400);
  }

  let { name, kategorieId, farbe } = req.body;

  if (!name || !kategorieId) {
    throwError(
      "MISSING-FIELDS",
      "Erforderliche Felder: name, kategorieId",
      400,
    );
  }

  if (!Number.isInteger(kategorieId) || kategorieId < 1) {
    throwError("INVALID-KATEGORIE-ID", "Ungültige Kategorie-ID", 400);
  }

  let item = findKleidungsstueckById(id);

  if (!item) {
    throwNotFound();
  }

  let result = updateKleidungsstueck(id, name, kategorieId, farbe || null);

  if (result.changes === 0) {
    throwError("UPDATE-FAILED", "Update fehlgeschlagen", 500);
  }

  res.status(200);
  res.send({ id, name, kategorieId, farbe: farbe || null });
}

/**
 * PATCH /kleidungsstuecke/:id
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
function patchKleidungsstueckRoute(req, res) {
  let id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    throwError("INVALID-ID", "Ungültige ID", 400);
  }

  let item = findKleidungsstueckById(id);

  if (!item) {
    throwNotFound();
  }

  let result = patchKleidungsstueck(id, req.body);

  if (result.changes === 0) {
    throwError("PATCH-FAILED", "Patch fehlgeschlagen", 500);
  }

  const updated = findKleidungsstueckById(id);
  res.status(200);
  res.send(updated);
}

/**
 * DELETE /kleidungsstuecke/:id
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
function deleteKleidungsstueckRoute(req, res) {
  let id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    throwError("INVALID-ID", "Ungültige ID", 400);
  }

  let item = findKleidungsstueckById(id);

  if (!item) {
    throwNotFound();
  }

  let result = deleteKleidungsstueck(id);

  if (result.changes === 0) {
    throwError("DELETE-FAILED", "Delete fehlgeschlagen", 500);
  }

  res.status(200);
  res.send({ message: "Erfolgreich gelöscht" });
}
