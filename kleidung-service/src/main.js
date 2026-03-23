import dotenv from "dotenv";
import express from "express";
import qs from "qs";
import path from "node:path";
import url from "node:url";
import process from "node:process";

import { db_ks } from "./database.js";
import { logRequest } from "./middleware.js";
import { handleError } from "./middleware.js";
import { logger } from "./utils.js";
import controllers from "./controllers/index.js";

/**
 * Konfiguration aus den Umgebungsvariablen des Betriebssystems einlesen
 * bzw. der .env-Datei, wenn sie existiert.
 */
dotenv.config();

const config = {
  host: process.env.LISTEN_HOST || "localhost",
  port: process.env.LISTEN_PORT || 1234,
};

/**
 * Zentrales App-Objekt der Express-Anwendung. Dies ist der eigentliche Webserver.
 * Mit diesem Objekt müssen wir unten die Handler-Funktionen registrieren, um auf
 * HTTP-Anfragen reagieren zu können.
 */
const app = express();

app.set("query parser", (str) => qs.parse(str));
app.set("trust proxy", true);

const sourceDir = path.dirname(url.fileURLToPath(import.meta.url));
const staticDir = path.join(sourceDir, "..", "static");

app.use(logRequest(logger));
app.use(express.static(staticDir));
app.use(express.json());

for (let controller of controllers || []) {
  controller(app);
}

app.use(handleError(logger));

/**
 * Webserver starten, damit er auf Verbindungsanfragen reagiert und HTTP-Requests
 * anfängt zu bearbeiten.
 */
const server = app.listen(config.port, config.host, () => {
  console.log(`Der Server lauscht auf ${config.host}:${config.port}`);
});

/**
 * Graceful Shutdown: Alle Verbindungen sauber schließen, wenn der Serverprozess
 * beendet wird.
 */
process.on("exit", () => {
  console.log("Server wird beendet ...");
  server.close();
  db_ks.close();
});

process.on("SIGHUP", () => process.exit(128 + 1));
process.on("SIGINT", () => process.exit(128 + 2));
process.on("SIGTERM", () => process.exit(128 + 3));
