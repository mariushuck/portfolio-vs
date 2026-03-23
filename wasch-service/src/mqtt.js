import mqtt from "mqtt";

/**
 * MQTT-Client zum Importieren in den anderen Quelldateien. Ist allerdings
 * nur gesetzt, nachdem `connect()` aufgerufen und erfolgreich eine Verbindung
 * hergestellt wurde.
 */
export let mqttClient = undefined;

/**
 * Konstanten für die abonnierten Topics (um Schreibfehler bei der wiederholten
 * Verwendung derselben Werte zu vermeiden).
 */
export const mqttTopics = {
  hello: "wwi24b2/schulmeister/hello",
};

/**
 * Verbindung zum Message Broker herstellen.
 * @param {string} broker MQTT Broker URL
 * @param {string} username Benutzername (optional)
 * @param {string} password Passwort (optional)
 */
export async function connect(broker, username, password) {
  mqttClient = await mqtt.connectAsync(broker, { username, password });

  return mqttClient;
}

/**
 * Verbindung zum MQTT-Broker trennen.
 */
export function close() {
  mqttClient?.end();
}
