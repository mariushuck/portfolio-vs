import mqtt from "mqtt";

const KS_URL = "http://localhost:1234";
const WS_URL = "http://localhost:4321";

// Hilfsfunktion: Wartet kurz, damit asynchrone MQTT-Nachrichten im Log nicht überlappen
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Hilfsfunktion für HTTP-Requests
async function request(url, method = "GET", body = null) {
  const options = { method, headers: {} };
  if (body) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }
  const response = await fetch(url, options);
  const isJson = response.headers
    .get("content-type")
    ?.includes("application/json");
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status} bei ${method} ${url} - Error: ${JSON.stringify(data)}`,
    );
  }
  return data;
}

async function runTests() {
  console.log("🚀 Starte API & MQTT End-to-End Tests...\n");

  // ==========================================
  // 0. MQTT BROKER VERBINDUNG AUFBAUEN
  // ==========================================
  console.log("📡 Verbinde mit MQTT-Broker");
  const mqttClient = mqtt.connect("wss://mqtt.zimolong.eu", {
    username: "dhbw",
    password: "dhbw",
  });

  await new Promise((resolve, reject) => {
    mqttClient.on("connect", () => {
      console.log("✅ MQTT verbunden! Lausche auf alle Events ('#')\n");
      mqttClient.subscribe("#");
      resolve();
    });
    mqttClient.on("error", (err) => reject(err));
  });

  // Globaler Listener für alle eintreffenden MQTT-Nachrichten
  mqttClient.on("message", (topic, message) => {
    console.log(
      `   [📡 MQTT EVENT EMPFANGEN] Topic: "${topic}" | Payload: ${message.toString()}`,
    );
  });

  try {
    // ==========================================
    // 1. TESTS FÜR KLEIDUNG-SERVICE (Port 1234)
    // ==========================================
    console.log("--- 👕 Starte Kleidung-Service Tests ---");

    console.log("Test: POST /kleidungsstuecke ...");
    const newKleidung = await request(`${KS_URL}/kleidungsstuecke`, "POST", {
      name: "Test T-Shirt",
      kategorieId: 1,
      farbe: "Rot",
    });
    console.log("✅ Erstellt:", newKleidung);
    await sleep(200); // Kurz warten, um das MQTT-Event abzufangen

    const kId = newKleidung.id;

    console.log(`Test: PUT /kleidungsstuecke/${kId} ...`);
    await request(`${KS_URL}/kleidungsstuecke/${kId}`, "PUT", {
      name: "Test T-Shirt Premium",
      kategorieId: 1,
      farbe: "Blau",
    });
    await sleep(200);

    console.log(`Test: DELETE /kleidungsstuecke/${kId} ...`);
    await request(`${KS_URL}/kleidungsstuecke/${kId}`, "DELETE");
    await sleep(200);

    // ==========================================
    // 2. TESTS FÜR WASCH-SERVICE (Port 4321)
    // ==========================================
    console.log("\n--- 🧼 Starte Wasch-Service Tests ---");

    console.log("Test: POST /waschgaenge ...");
    const newWaschgang = await request(`${WS_URL}/waschgaenge`, "POST", {
      waschprogrammId: 1,
    });
    console.log("✅ Erstellt:", newWaschgang);
    await sleep(200);

    const wId = newWaschgang.id;

    console.log(`Test: PUT /waschgaenge/${wId} ...`);
    await request(`${WS_URL}/waschgaenge/${wId}`, "PUT", {
      waschprogrammId: 2,
      zeitstempel: new Date().toISOString(),
      status: "in_bearbeitung",
    });
    await sleep(200);

    console.log(`Test: DELETE /waschgaenge/${wId} ...`);
    await request(`${WS_URL}/waschgaenge/${wId}`, "DELETE");
    await sleep(200);

    // ==========================================
    // 3. AKTIVER MQTT INBOUND TEST (Microservice-Reaktion)
    // ==========================================
    console.log("\n--- 📨 Teste MQTT-Handler der Services ---");
    console.log("Wir publishen jetzt ein Lösch-Event für eine Kategorie.");
    console.log(
      "Der Wasch-Service sollte laut Architektur darauf reagieren (z.B. Empfehlungen löschen).",
    );

    const testEventTopic = "Kategorie/delete"; // Passe dieses Topic an, falls du es in src/mqtt_handlers anders benannt hast!
    const testEventPayload = JSON.stringify({ id: 999 });

    console.log(
      `Publishe Topic: "${testEventTopic}" mit Payload: ${testEventPayload}`,
    );
    mqttClient.publish(testEventTopic, testEventPayload);

    await sleep(500); // Dem Microservice Zeit geben, die Datenbank-Logik auszuführen

    console.log("\n🎉 ALLE REST- UND MQTT-TESTS WURDEN DURCHGEFÜHRT!");
  } catch (error) {
    console.error("\n❌ FEHLER BEIM TESTEN:");
    console.error(error.message);
  } finally {
    // Verbindung sauber trennen, damit das Skript sich beendet
    mqttClient.end();
  }
}

// Skript ausführen (Da in ES6, Top-Level Await möglich, aber so ist es kompatibler)
runTests();
