import { beforeEach, describe, expect, it, vi } from "vitest";

import registerKleidungHandler from "../src/mqtt_handlers/kleidung.mqtt_handler.js";
import { mqttTopics } from "../src/mqtt.js";
import { findEmpfehlungByKategorieId } from "../src/services/empfehlungen.service.js";
import { logger } from "../src/utils.js";
import { resetWaschDb } from "./support/test-app.js";

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

describe("MQTT Handler kleidung", () => {
  beforeEach(() => {
    resetWaschDb();
    vi.restoreAllMocks();
  });

  it("abonniert das Kleidung-Topic mit QoS 1", async () => {
    const client = createFakeMqttClient();

    await registerKleidungHandler(client);

    expect(client.subscribeAsync).toHaveBeenCalledWith(mqttTopics.kleidung, {
      qos: 1,
    });
    expect(client.on).toHaveBeenCalledWith("message", expect.any(Function));
  });

  it("fuehrt Cleanup bei Kategorie-Delete-Event aus", async () => {
    const client = createFakeMqttClient();

    expect(findEmpfehlungByKategorieId(2)).toBeTruthy();

    await registerKleidungHandler(client);
    client.emitMessage(
      mqttTopics.kleidung,
      JSON.stringify({ event: "delete", entity: "Kategorie", id: "2" }),
    );

    expect(findEmpfehlungByKategorieId(2)).toBeUndefined();
  });

  it("protokolliert Warnung bei unbekanntem Event", async () => {
    const client = createFakeMqttClient();
    const warnSpy = vi.spyOn(logger, "warn").mockImplementation(() => {});

    await registerKleidungHandler(client);
    client.emitMessage(
      mqttTopics.kleidung,
      JSON.stringify({ event: "noop", entity: "Kategorie", id: "2" }),
    );

    expect(warnSpy).toHaveBeenCalledWith(
      "Unbekannter MQTT-Eventtyp auf Kleidung-Topic: noop",
    );
  });

  it("ignoriert Nachrichten auf anderen Topics", async () => {
    const client = createFakeMqttClient();

    await registerKleidungHandler(client);
    client.emitMessage(
      "anderes/topic",
      JSON.stringify({ event: "delete", entity: "Kategorie", id: "1" }),
    );

    expect(findEmpfehlungByKategorieId(1)).toBeTruthy();
  });

  it("protokolliert Fehler bei ungueltigem JSON", async () => {
    const client = createFakeMqttClient();
    const errorSpy = vi.spyOn(logger, "error").mockImplementation(() => {});

    await registerKleidungHandler(client);
    client.emitMessage(mqttTopics.kleidung, "{invalid-json");

    expect(errorSpy).toHaveBeenCalledWith(
      "Ungueltige MQTT-Nachricht auf kleidung-Topic:",
      expect.any(Error),
    );
  });
});
