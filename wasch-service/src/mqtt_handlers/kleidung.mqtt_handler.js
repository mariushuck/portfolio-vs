import { deleteEmpfehlungByKategorieId } from "../services/empfehlungen.service.js";
import { logger } from "../utils.js";
import { mqttTopics } from "../mqtt.js";

/**
 * Abonniert Kleidung-Events vom kleidung-service.
 * @param {mqtt.Client} mqttClient MQTT client
 */
export default async function registerKleidungHandler(mqttClient) {
  await mqttClient.subscribeAsync(mqttTopics.kleidung, { qos: 1 });

  mqttClient.on("message", (topic, payloadBuffer) => {
    if (topic !== mqttTopics.kleidung) {
      return;
    }

    handleKleidungEvent(payloadBuffer);
  });
}

function handleKleidungEvent(payloadBuffer) {
  try {
    const payload = JSON.parse(payloadBuffer.toString("utf-8"));
    const { event, entity, id } = payload;

    if (!["create", "update", "delete"].includes(event)) {
      logger.warn(`Unbekannter MQTT-Eventtyp auf Kleidung-Topic: ${event}`);
      return;
    }

    // Bei Kategorie-Loeschung muessen lokale Empfehlungen bereinigt werden.
    if (entity === "Kategorie" && event === "delete") {
      const kategorieId = Number(id);

      if (Number.isInteger(kategorieId) && kategorieId > 0) {
        const result = deleteEmpfehlungByKategorieId(kategorieId);
        logger.info(
          `Empfehlungs-Cleanup nach Kategorie-Delete: kategorie_id=${kategorieId}, changes=${result.changes}`,
        );
      }
      return;
    }

    // Weitere Events koennen bei Bedarf fuer Schattenkopien genutzt werden.
    logger.info(`MQTT Kleidung-Event empfangen: ${JSON.stringify(payload)}`);
  } catch (error) {
    logger.error("Ungueltige MQTT-Nachricht auf kleidung-Topic:", error);
  }
}
