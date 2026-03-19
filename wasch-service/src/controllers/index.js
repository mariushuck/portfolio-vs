/**
 * Copilot-generierter Code
 * Codestelle: wasch-service/src/controllers/index.js
 * Prompt: "Based on the structure of the kleidung service, build the wasch service with the defined endpoints in wasch-service.yaml"
 */

import waschprogrammeController from "./waschprogramme.controller.js";
import empfehlungenController from "./empfehlungen.controller.js";
import waschgaengeController from "./waschgaenge.controller.js";

export default [
  waschprogrammeController,
  empfehlungenController,
  waschgaengeController,
];
