import {
  findAllKategorien,
  findKategorieById,
  createKategorie,
  updateKategorie,
  patchKategorie,
  deleteKategorie,
} from "../services/kategorien.service.js";
import { throwError, throwNotFound } from "../utils.js";

/**
 * @param {Express.App} app
 */
export default function registerRoutes(app) {
  app.get("/kategorien", getAllKategorien);
  app.get("/kategorien/:id", getKategorieById);
  app.post("/kategorien", createKategorieRoute);
  app.put("/kategorien/:id", updateKategorieRoute);
  app.patch("/kategorien/:id", patchKategorieRoute);
  app.delete("/kategorien/:id", deleteKategorieRoute);
}

/**
 * GET /kategorien
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
function getAllKategorien(req, res) {
  let result = findAllKategorien();

  res.status(200);
  res.send(result);
}

/**
 * GET /kategorien/:id
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
function getKategorieById(req, res) {
  let id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    throwError("INVALID-ID", "Ungültige ID", 400);
  }

  let item = findKategorieById(id);

  if (!item) {
    throwNotFound();
  }

  res.status(200);
  res.send(item);
}

/**
 * POST /kategorien
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
function createKategorieRoute(req, res) {
  let { bezeichnung, materialtyp } = req.body;

  if (!bezeichnung || !materialtyp) {
    throwError(
      "MISSING-FIELDS",
      "Erforderliche Felder: bezeichnung, materialtyp",
      400,
    );
  }

  let result = createKategorie(bezeichnung, materialtyp);

  res.status(201);
  res.send({ id: result.lastInsertRowid, bezeichnung, materialtyp });
}

/**
 * PUT /kategorien/:id
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
function updateKategorieRoute(req, res) {
  let id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    throwError("INVALID-ID", "Ungültige ID", 400);
  }

  let { bezeichnung, materialtyp } = req.body;

  if (!bezeichnung || !materialtyp) {
    throwError(
      "MISSING-FIELDS",
      "Erforderliche Felder: bezeichnung, materialtyp",
      400,
    );
  }

  let item = findKategorieById(id);

  if (!item) {
    throwNotFound();
  }

  let result = updateKategorie(id, bezeichnung, materialtyp);

  if (result.changes === 0) {
    throwError("UPDATE-FAILED", "Update fehlgeschlagen", 500);
  }

  res.status(200);
  res.send({ id, bezeichnung, materialtyp });
}

/**
 * PATCH /kategorien/:id
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
function patchKategorieRoute(req, res) {
  let id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    throwError("INVALID-ID", "Ungültige ID", 400);
  }

  let item = findKategorieById(id);

  if (!item) {
    throwNotFound();
  }

  let result = patchKategorie(id, req.body);

  if (result.changes === 0) {
    throwError("PATCH-FAILED", "Patch fehlgeschlagen", 500);
  }

  const updated = findKategorieById(id);
  res.status(200);
  res.send(updated);
}

/**
 * DELETE /kategorien/:id
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
function deleteKategorieRoute(req, res) {
  let id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    throwError("INVALID-ID", "Ungültige ID", 400);
  }

  let item = findKategorieById(id);

  if (!item) {
    throwNotFound();
  }

  let result = deleteKategorie(id);

  if (result.changes === 0) {
    throwError("DELETE-FAILED", "Delete fehlgeschlagen", 500);
  }

  res.status(200);
  res.send({ message: "Erfolgreich gelöscht" });
}
