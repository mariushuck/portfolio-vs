import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { buildApp, resetWaschDb } from "./support/test-app.js";

describe("REST /empfehlungen", () => {
  const app = buildApp();

  beforeEach(() => {
    resetWaschDb();
  });

  it("GET /empfehlungen liefert alle Empfehlungen", async () => {
    const res = await request(app).get("/empfehlungen");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    expect(res.body[0]).toMatchObject({ kategorie_id: 1, waschprogramm_id: 1 });
  });

  it("GET /empfehlungen/:kategorieId validiert ID", async () => {
    const res = await request(app).get("/empfehlungen/abc");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("INVALID-KATEGORIE-ID");
  });

  it("GET /empfehlungen/:kategorieId liefert 404 wenn nicht vorhanden", async () => {
    const res = await request(app).get("/empfehlungen/999");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("NOT-FOUND");
  });

  it("POST /empfehlungen erstellt neue Empfehlung", async () => {
    const res = await request(app)
      .post("/empfehlungen")
      .send({ kategorieId: 4, waschprogrammId: 1 });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ kategorieId: 4, waschprogrammId: 1 });

    const verify = await request(app).get("/empfehlungen/4");
    expect(verify.status).toBe(200);
    expect(verify.body).toMatchObject({ kategorie_id: 4, waschprogramm_id: 1 });
  });

  it("POST /empfehlungen validiert Pflichtfelder", async () => {
    const res = await request(app)
      .post("/empfehlungen")
      .send({ kategorieId: 4 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("MISSING-FIELDS");
  });

  it("PUT /empfehlungen/:kategorieId aktualisiert Empfehlung", async () => {
    const res = await request(app)
      .put("/empfehlungen/2")
      .send({ kategorieId: 2, waschprogrammId: 1 });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ kategorie_id: 2, waschprogramm_id: 1 });
  });

  it("PUT /empfehlungen/:kategorieId validiert kategorieId-Mismatch", async () => {
    const res = await request(app)
      .put("/empfehlungen/2")
      .send({ kategorieId: 3, waschprogrammId: 1 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("KATEGORIE-ID-MISMATCH");
  });

  it("PATCH /empfehlungen/:kategorieId aktualisiert waschprogrammId", async () => {
    const res = await request(app)
      .patch("/empfehlungen/3")
      .send({ waschprogrammId: 2 });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ kategorie_id: 3, waschprogramm_id: 2 });
  });

  it("PATCH /empfehlungen/:kategorieId validiert Feldtyp", async () => {
    const res = await request(app)
      .patch("/empfehlungen/3")
      .send({ waschprogrammId: "2" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("INVALID-FIELDS");
  });

  it("DELETE /empfehlungen/:kategorieId entfernt Datensatz", async () => {
    const res = await request(app).delete("/empfehlungen/1");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Erfolgreich gelöscht");

    const verify = await request(app).get("/empfehlungen/1");
    expect(verify.status).toBe(404);
  });
});
