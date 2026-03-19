/**
 * Copilot-generierter Code
 * Codestelle: wasch-service/src/controllers/waschprogramme.controller.js
 * Prompt: "Based on the structure of the kleidung service, build the wasch service with the defined endpoints in wasch-service.yaml"
 */

import {
  findAllWaschprogramme,
  findWaschprogrammById,
  createWaschprogramm,
  updateWaschprogramm,
  patchWaschprogramm,
  deleteWaschprogramm,
} from "../services/waschprogramme.service.js";
import { throwError, throwNotFound } from "../utils.js";

/**
 * @param {Express.App} app
 */
export default function registerRoutes(app) {
  app.get("/waschprogramme", getAllWaschprogramme);
  app.get("/waschprogramme/:id", getWaschprogrammById);
  app.post("/waschprogramme", createWaschprogrammRoute);
  app.put("/waschprogramme/:id", updateWaschprogrammRoute);
  app.patch("/waschprogramme/:id", patchWaschprogrammRoute);
  app.delete("/waschprogramme/:id", deleteWaschprogrammRoute);
}

function getAllWaschprogramme(req, res) {
  const result = findAllWaschprogramme();
  res.status(200);
  res.send(result);
}

function getWaschprogrammById(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    throwError("INVALID-ID", "Ungültige ID", 400);
  }

  const item = findWaschprogrammById(id);

  if (!item) {
    throwNotFound();
  }

  res.status(200);
  res.send(item);
}

function createWaschprogrammRoute(req, res) {
  const { name, temperatur, dauer } = req.body;

  if (!name || !Number.isInteger(temperatur) || !Number.isInteger(dauer)) {
    throwError(
      "MISSING-FIELDS",
      "Erforderliche Felder: name, temperatur (int), dauer (int)",
      400,
    );
  }

  const result = createWaschprogramm(name, temperatur, dauer);

  res.status(201);
  res.send({ id: result.lastInsertRowid, name, temperatur, dauer });
}

function updateWaschprogrammRoute(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    throwError("INVALID-ID", "Ungültige ID", 400);
  }

  const { name, temperatur, dauer } = req.body;

  if (!name || !Number.isInteger(temperatur) || !Number.isInteger(dauer)) {
    throwError(
      "MISSING-FIELDS",
      "Erforderliche Felder: name, temperatur (int), dauer (int)",
      400,
    );
  }

  const item = findWaschprogrammById(id);

  if (!item) {
    throwNotFound();
  }

  const result = updateWaschprogramm(id, name, temperatur, dauer);

  if (result.changes === 0) {
    throwError("UPDATE-FAILED", "Update fehlgeschlagen", 500);
  }

  res.status(200);
  res.send({ id, name, temperatur, dauer });
}

function patchWaschprogrammRoute(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    throwError("INVALID-ID", "Ungültige ID", 400);
  }

  const { name, temperatur, dauer } = req.body;

  if (
    (name !== undefined && typeof name !== "string") ||
    (temperatur !== undefined && !Number.isInteger(temperatur)) ||
    (dauer !== undefined && !Number.isInteger(dauer))
  ) {
    throwError("INVALID-FIELDS", "Ungültige Feldwerte", 400);
  }

  const item = findWaschprogrammById(id);

  if (!item) {
    throwNotFound();
  }

  const result = patchWaschprogramm(id, req.body);

  if (result.changes === 0) {
    throwError("PATCH-FAILED", "Patch fehlgeschlagen", 500);
  }

  const updated = findWaschprogrammById(id);
  res.status(200);
  res.send(updated);
}

function deleteWaschprogrammRoute(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    throwError("INVALID-ID", "Ungültige ID", 400);
  }

  const item = findWaschprogrammById(id);

  if (!item) {
    throwNotFound();
  }

  const result = deleteWaschprogramm(id);

  if (result.changes === 0) {
    throwError("DELETE-FAILED", "Delete fehlgeschlagen", 500);
  }

  res.status(200);
  res.send({ message: "Erfolgreich gelöscht" });
}
