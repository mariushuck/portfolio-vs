import express from "express";
import qs from "qs";

import controllers from "../../src/controllers/index.js";
import { db_ws } from "../../src/database.js";
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

export function resetWaschDb() {
  db_ws.prepare("DELETE FROM waschgaenge").run();
  db_ws.prepare("DELETE FROM empfehlungen").run();
  db_ws.prepare("DELETE FROM waschprogramme").run();

  db_ws
    .prepare(
      "INSERT INTO waschprogramme(id, name, temperatur, dauer) VALUES (1, ?, 30, 45), (2, ?, 20, 35), (3, ?, 40, 60)",
    )
    .run("Feinwaesche 30 Grad", "Wolle 20 Grad", "Jeans 40 Grad");

  db_ws
    .prepare(
      "INSERT INTO waschgaenge(id, waschprogramm_id, zeitstempel, status) VALUES (1, 1, ?, ?), (2, 2, ?, ?), (3, 3, ?, ?)",
    )
    .run(
      "2026-03-10T08:15:00.000Z",
      "abgeschlossen",
      "2026-03-11T10:30:00.000Z",
      "in_bearbeitung",
      "2026-03-12T07:45:00.000Z",
      "geplant",
    );

  db_ws
    .prepare(
      "INSERT INTO empfehlungen(id, kategorie_id, waschprogramm_id) VALUES (1, 1, 1), (2, 2, 2), (3, 3, 3)",
    )
    .run();
}
