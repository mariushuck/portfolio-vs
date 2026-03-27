import { beforeEach, describe, expect, it, vi } from "vitest";

import registerWaschgaengeHandler from "../src/mqtt_handlers/waschgaenge.mqtt_handler.js";
import { mqttTopics } from "../src/mqtt.js";
import { logger } from "../src/utils.js";

function createFakeMqttClient() {
  const handlers = new Map();

  return {
    subscribeAsync: vi.fn(async () => {}),
    on: vi.fn((event, callback) => {
      handlers.set(event, callback);
    }),
    emitMessage(topic, payload) {
      const callback = handlers.get("message");

      if (callback) {
        callback(topic, Buffer.from(payload, "utf-8"));
      }
    },
  };
}

describe("MQTT Handler waschgaenge", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("abonniert das Waschgaenge-Topic mit QoS 1", async () => {
    const client = createFakeMqttClient();

    await registerWaschgaengeHandler(client);

    expect(client.subscribeAsync).toHaveBeenCalledWith(mqttTopics.waschgaenge, {
      qos: 1,
    });
    expect(client.on).toHaveBeenCalledWith("message", expect.any(Function));
  });

  it("verarbeitet gueltige Eventnachrichten auf dem richtigen Topic", async () => {
    const client = createFakeMqttClient();
    const infoSpy = vi.spyOn(logger, "info").mockImplementation(() => {});

    await registerWaschgaengeHandler(client);
    client.emitMessage(
      mqttTopics.waschgaenge,
      JSON.stringify({ event: "create", entity: "Waschgang", id: "7" }),
    );

    expect(infoSpy).toHaveBeenCalledWith(
      "MQTT Wasch-Event empfangen: event=create, entity=Waschgang, id=7",
    );
  });

  it("ignoriert Nachrichten auf anderen Topics", async () => {
    const client = createFakeMqttClient();
    const infoSpy = vi.spyOn(logger, "info").mockImplementation(() => {});

    await registerWaschgaengeHandler(client);
    client.emitMessage(
      "anderes/topic",
      JSON.stringify({ event: "create", entity: "Waschgang", id: "8" }),
    );

    expect(infoSpy).not.toHaveBeenCalledWith(
      expect.stringContaining("MQTT Wasch-Event empfangen"),
    );
  });

  it("protokolliert Warnung bei unbekanntem Event", async () => {
    const client = createFakeMqttClient();
    const warnSpy = vi.spyOn(logger, "warn").mockImplementation(() => {});

    await registerWaschgaengeHandler(client);
    client.emitMessage(
      mqttTopics.waschgaenge,
      JSON.stringify({ event: "noop", entity: "Waschgang", id: "9" }),
    );

    expect(warnSpy).toHaveBeenCalledWith(
      "Unbekannter MQTT-Eventtyp auf Wasch-Topic: noop",
    );
  });

  it("protokolliert Fehler bei ungueltigem JSON", async () => {
    const client = createFakeMqttClient();
    const errorSpy = vi.spyOn(logger, "error").mockImplementation(() => {});

    await registerWaschgaengeHandler(client);
    client.emitMessage(mqttTopics.waschgaenge, "{invalid-json");

    expect(errorSpy).toHaveBeenCalledWith(
      "Ungültige MQTT-Nachricht auf waschgaenge-Topic:",
      expect.any(Error),
    );
  });
});
