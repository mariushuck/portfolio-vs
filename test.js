const KLEIDUNG_URL = "http://localhost:9000";
const WASCH_URL = "http://localhost:4321";

// Hilfsfunktion für saubere Konsolenausgaben und Fehlerbehandlung
async function fetchTest(method, url, body = null) {
  const options = { method, headers: {} };
  if (body) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);
  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = await res.text();
  }

  if (!res.ok) {
    console.error(
      `❌ FEHLER bei ${method} ${url} (Status: ${res.status}):`,
      data,
    );
    throw new Error(`Test fehlgeschlagen bei ${method} ${url}`);
  }

  console.log(`✅ ${method} ${url} -> Status: ${res.status}`);
  return data;
}

async function runFullTests() {
  console.log("🚀 STARTE VOLLSTÄNDIGEN ENDPUNKT-TEST...\n");

  try {
    // ==========================================
    // 1. KATEGORIEN (Kleidung-Service)
    // ==========================================
    console.log("--- 🏷️ TEST: Kategorien ---");
    let kat = await fetchTest("POST", `${KLEIDUNG_URL}/kategorien`, {
      bezeichnung: "Test",
      materialtyp: "Baumwolle",
    });
    const katId = kat.id || kat.lastInsertRowid; // Fallback je nach Ihrem Controller-Return

    await fetchTest("GET", `${KLEIDUNG_URL}/kategorien`);
    await fetchTest("GET", `${KLEIDUNG_URL}/kategorien/${katId}`);
    await fetchTest("PUT", `${KLEIDUNG_URL}/kategorien/${katId}`, {
      bezeichnung: "Test-Update",
      materialtyp: "Seide",
    });
    await fetchTest("PATCH", `${KLEIDUNG_URL}/kategorien/${katId}`, {
      bezeichnung: "Test-Patch",
    });

    // ==========================================
    // 2. KLEIDUNGSSTÜCKE (Kleidung-Service)
    // ==========================================
    console.log("\n--- 👕 TEST: Kleidungsstücke ---");
    let kleidung = await fetchTest("POST", `${KLEIDUNG_URL}/kleidungsstuecke`, {
      name: "Socke",
      kategorieId: katId,
      farbe: "Weiß",
    });
    const kId = kleidung.id || kleidung.lastInsertRowid;

    await fetchTest("GET", `${KLEIDUNG_URL}/kleidungsstuecke`);
    await fetchTest("GET", `${KLEIDUNG_URL}/kleidungsstuecke/${kId}`);
    await fetchTest("PUT", `${KLEIDUNG_URL}/kleidungsstuecke/${kId}`, {
      name: "Socke Neu",
      kategorieId: katId,
      farbe: "Schwarz",
    });
    await fetchTest("PATCH", `${KLEIDUNG_URL}/kleidungsstuecke/${kId}`, {
      farbe: "Bunt",
    });

    // ==========================================
    // 3. WASCHPROGRAMME (Wasch-Service)
    // ==========================================
    console.log("\n--- 🧼 TEST: Waschprogramme ---");
    let prog = await fetchTest("POST", `${WASCH_URL}/waschprogramme`, {
      name: "Kochwäsche",
      temperatur: 90,
      dauer: 120,
    });
    const progId = prog.id || prog.lastInsertRowid;

    await fetchTest("GET", `${WASCH_URL}/waschprogramme`);
    await fetchTest("GET", `${WASCH_URL}/waschprogramme/${progId}`);
    await fetchTest("PUT", `${WASCH_URL}/waschprogramme/${progId}`, {
      name: "Kochwäsche Eco",
      temperatur: 95,
      dauer: 140,
    });
    await fetchTest("PATCH", `${WASCH_URL}/waschprogramme/${progId}`, {
      dauer: 150,
    });

    // ==========================================
    // 4. EMPFEHLUNGEN (Wasch-Service)
    // Hinweis: Laut YAML ist der Pfad-Parameter hier die kategorieId!
    // ==========================================
    console.log("\n--- 💡 TEST: Empfehlungen ---");
    await fetchTest("POST", `${WASCH_URL}/empfehlungen`, {
      kategorieId: katId,
      waschprogrammId: progId,
    });

    await fetchTest("GET", `${WASCH_URL}/empfehlungen`);
    await fetchTest("GET", `${WASCH_URL}/empfehlungen/${katId}`);
    await fetchTest("PUT", `${WASCH_URL}/empfehlungen/${katId}`, {
      kategorieId: katId,
      waschprogrammId: progId,
    }); // ID ändert sich evtl. nicht, nur zum Test des Endpunkts
    await fetchTest("PATCH", `${WASCH_URL}/empfehlungen/${katId}`, {
      waschprogrammId: progId,
    });

    // ==========================================
    // 5. WASCHGÄNGE (Wasch-Service)
    // ==========================================
    console.log("\n--- 🔄 TEST: Waschgänge ---");
    let waschgang = await fetchTest("POST", `${WASCH_URL}/waschgaenge`, {
      waschprogrammId: progId,
    });
    const wgId = waschgang.id || waschgang.lastInsertRowid;

    await fetchTest("GET", `${WASCH_URL}/waschgaenge`);
    await fetchTest("GET", `${WASCH_URL}/waschgaenge/${wgId}`);
    await fetchTest("PUT", `${WASCH_URL}/waschgaenge/${wgId}`, {
      waschprogrammId: progId,
    });
    await fetchTest("PATCH", `${WASCH_URL}/waschgaenge/${wgId}`, {
      waschprogrammId: progId,
    });

    // ==========================================
    // 6. DELETE (Aufräumen in der richtigen Reihenfolge)
    // (Abhängige Daten zuerst löschen wegen Foreign Keys)
    // ==========================================
    console.log("\n--- 🧹 TEST: DELETE (Cleanup) ---");
    await fetchTest("DELETE", `${WASCH_URL}/waschgaenge/${wgId}`);
    await fetchTest("DELETE", `${WASCH_URL}/empfehlungen/${katId}`);
    await fetchTest("DELETE", `${WASCH_URL}/waschprogramme/${progId}`);

    await fetchTest("DELETE", `${KLEIDUNG_URL}/kleidungsstuecke/${kId}`);
    await fetchTest("DELETE", `${KLEIDUNG_URL}/kategorien/${katId}`);

    console.log("\n🎉 ALLE ENDPUNKTE ERFOLGREICH GETESTET!");
  } catch (error) {
    console.error("\n❌ TEST ABGEBROCHEN:", error.message);
  }
}

runFullTests();
