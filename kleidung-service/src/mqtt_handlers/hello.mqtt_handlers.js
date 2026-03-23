import { logger } from "../utils.js";
import { mqttTopics } from "../mqtt.js";

/**
 * Topics abonnieren und Nachrichtenverarbeitung anstoßen.
 * @param {mqtt.Client} mqttClient MQTT Client
 */
export default async function registerHandlers(mqttClient) {
  await mqttClient.subscribeAsync(mqttTopics.hello);

  mqttClient.on("message", (topic, payload) => {
    if (topic === mqttTopics.hello) handleHello(mqttClient, topic, payload);
  });
}

/**
 * Nachricht auf dem Hallo-Topic verarbeiten.
 */
function handleHello(mqttClient, topic, payload) {
  logger.info(`Empfange Nachricht – Topic ${topic}: ${payload}`);
  payload = JSON.parse(payload);
}
