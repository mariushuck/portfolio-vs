/**
 * Copilot-generierter Code
 * Codestelle: wasch-service/src/controllers/waschgaenge.controller.js
 * Prompt: "Based on the structure of the kleidung service, build the wasch service with the defined endpoints in wasch-service.yaml"
 */

import {
  findAllWaschgaenge,
  findWaschgangById,
  createWaschgang,
  updateWaschgang,
  patchWaschgang,
  deleteWaschgang,
} from "../services/waschgaenge.service.js";
import { throwError, throwNotFound } from "../utils.js";

/**
 * @param {Express.App} app
 */
export default function registerRoutes(app) {
  app.get("/waschgaenge", getAllWaschgaenge);
  app.get("/waschgaenge/:id", getWaschgangById);
  app.post("/waschgaenge", createWaschgangRoute);
  app.put("/waschgaenge/:id", updateWaschgangRoute);
  app.patch("/waschgaenge/:id", patchWaschgangRoute);
  app.delete("/waschgaenge/:id", deleteWaschgangRoute);
}

function getAllWaschgaenge(req, res) {
  const result = findAllWaschgaenge();
  res.status(200);
  res.send(result);
}

function getWaschgangById(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    throwError("INVALID-ID", "Ungültige ID", 400);
  }

  const item = findWaschgangById(id);

  if (!item) {
    throwNotFound();
  }

  res.status(200);
  res.send(item);
}

function createWaschgangRoute(req, res) {
  const { waschprogrammId } = req.body;

  if (!Number.isInteger(waschprogrammId)) {
    throwError(
      "MISSING-FIELDS",
      "Erforderliches Feld: waschprogrammId (int)",
      400,
    );
  }

  const result = createWaschgang(waschprogrammId);

  const created = findWaschgangById(result.lastInsertRowid);

  res.status(201);
  res.send(created);
}

function updateWaschgangRoute(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    throwError("INVALID-ID", "Ungültige ID", 400);
  }

  const { waschprogrammId } = req.body;

  if (!Number.isInteger(waschprogrammId)) {
    throwError(
      "MISSING-FIELDS",
      "Erforderliches Feld: waschprogrammId (int)",
      400,
    );
  }

  const item = findWaschgangById(id);

  if (!item) {
    throwNotFound();
  }

  const result = updateWaschgang(
    id,
    waschprogrammId,
    item.zeitstempel,
    item.status,
  );

  if (result.changes === 0) {
    throwError("UPDATE-FAILED", "Update fehlgeschlagen", 500);
  }

  const updated = findWaschgangById(id);
  res.status(200);
  res.send(updated);
}

function patchWaschgangRoute(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    throwError("INVALID-ID", "Ungültige ID", 400);
  }

  const { waschprogrammId } = req.body;

  if (waschprogrammId !== undefined && !Number.isInteger(waschprogrammId)) {
    throwError("INVALID-FIELDS", "Ungültige Feldwerte", 400);
  }

  const item = findWaschgangById(id);

  if (!item) {
    throwNotFound();
  }

  const result = patchWaschgang(id, req.body);

  if (result.changes === 0) {
    throwError("PATCH-FAILED", "Patch fehlgeschlagen", 500);
  }

  const updated = findWaschgangById(id);
  res.status(200);
  res.send(updated);
}

function deleteWaschgangRoute(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    throwError("INVALID-ID", "Ungültige ID", 400);
  }

  const item = findWaschgangById(id);

  if (!item) {
    throwNotFound();
  }

  const result = deleteWaschgang(id);

  if (result.changes === 0) {
    throwError("DELETE-FAILED", "Delete fehlgeschlagen", 500);
  }

  res.status(200);
  res.send({ message: "Erfolgreich gelöscht" });
}
