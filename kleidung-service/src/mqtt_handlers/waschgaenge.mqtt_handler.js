import { logger } from "../utils.js";
import { mqttTopics } from "../mqtt.js";

/**
 * Abonniert Wasch-Events vom wasch-service.
 * @param {mqtt.Client} mqttClient MQTT client
 */
export default async function registerWaschgaengeHandler(mqttClient) {
  await mqttClient.subscribeAsync(mqttTopics.waschgaenge, { qos: 1 });

  mqttClient.on("message", (topic, payloadBuffer) => {
    if (topic !== mqttTopics.waschgaenge) {
      return;
    }

    handleWaschEvent(payloadBuffer);
  });
}

function handleWaschEvent(payloadBuffer) {
  try {
    const payload = JSON.parse(payloadBuffer.toString("utf-8"));
    const { event, entity, id } = payload;

    if (!["create", "update", "delete"].includes(event)) {
      logger.warn(`Unbekannter MQTT-Eventtyp auf Wasch-Topic: ${event}`);
      return;
    }

    // Aktuell keine persistente Schattenkopie im kleidung-service vorhanden.
    logger.info(
      `MQTT Wasch-Event empfangen: event=${event}, entity=${entity}, id=${id}`,
    );
  } catch (error) {
    logger.error("Ungültige MQTT-Nachricht auf waschgaenge-Topic:", error);
  }
}
