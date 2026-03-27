import express from "express";
import qs from "qs";

import controllers from "../../src/controllers/index.js";
import { db_ks } from "../../src/database.js";
import { handleError, logRequest } from "../../src/middleware.js";
import { logger } from "../../src/utils.js";

export function buildApp() {
  const app = express();

  app.set("query parser", (str) => qs.parse(str));
  app.use(logRequest(logger));
  app.use(express.json());

  for (const controller of controllers) {
    controller(app);
  }

  app.use(handleError(logger));

  return app;
}

export function resetKleidungDb() {
  db_ks.prepare("DELETE FROM kleidungsstuecke").run();
  db_ks.prepare("DELETE FROM kategorien").run();

  db_ks
    .prepare(
      "INSERT INTO kategorien(id, bezeichnung, materialtyp) VALUES (1, ?, ?), (2, ?, ?), (3, ?, ?)",
    )
    .run("T-Shirt", "Baumwolle", "Pullover", "Wolle", "Jeans", "Denim");

  db_ks
    .prepare(
      "INSERT INTO kleidungsstuecke(id, name, kategorie_id, farbe) VALUES (1, ?, 1, ?), (2, ?, 2, ?), (3, ?, 3, ?)",
    )
    .run(
      "Weisses Basic Shirt",
      "weiss",
      "Grauer Winterpullover",
      "grau",
      "Blaue Slim Fit Jeans",
      "blau",
    );
}
