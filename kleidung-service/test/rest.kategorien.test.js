import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { buildApp, resetKleidungDb } from "./support/test-app.js";

describe("REST /kategorien", () => {
  const app = buildApp();

  beforeEach(() => {
    resetKleidungDb();
  });

  it("GET /kategorien liefert alle Kategorien", async () => {
    const res = await request(app).get("/kategorien");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    expect(res.body[0]).toMatchObject({ id: 1, bezeichnung: "T-Shirt" });
  });

  it("GET /kategorien/:id liefert 400 bei ungueltiger ID", async () => {
    const res = await request(app).get("/kategorien/abc");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("INVALID-ID");
  });

  it("GET /kategorien/:id liefert 404 bei unbekannter ID", async () => {
    const res = await request(app).get("/kategorien/9999");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("NOT-FOUND");
  });

  it("POST /kategorien erstellt eine neue Kategorie", async () => {
    const payload = { bezeichnung: "Hemd", materialtyp: "Leinen" };

    const res = await request(app).post("/kategorien").send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(payload);
    expect(Number.isInteger(res.body.id)).toBe(true);

    const verify = await request(app).get(`/kategorien/${res.body.id}`);
    expect(verify.status).toBe(200);
    expect(verify.body).toMatchObject(payload);
  });

  it("POST /kategorien liefert 400 bei fehlenden Feldern", async () => {
    const res = await request(app)
      .post("/kategorien")
      .send({ bezeichnung: "Hemd" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("MISSING-FIELDS");
  });

  it("PUT /kategorien/:id aktualisiert komplett", async () => {
    const payload = { bezeichnung: "Hose", materialtyp: "Synthetik" };

    const res = await request(app).put("/kategorien/1").send(payload);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 1, ...payload });

    const verify = await request(app).get("/kategorien/1");
    expect(verify.body).toEqual({ id: 1, ...payload });
  });

  it("PATCH /kategorien/:id aktualisiert Teilfelder", async () => {
    const res = await request(app)
      .patch("/kategorien/2")
      .send({ materialtyp: "Kaschmir" });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: 2,
      bezeichnung: "Pullover",
      materialtyp: "Kaschmir",
    });
  });

  it("PATCH /kategorien/:id liefert 500 bei leerem Patch", async () => {
    const res = await request(app).patch("/kategorien/2").send({});

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("PATCH-FAILED");
  });

  it("DELETE /kategorien/:id loescht Kategorie", async () => {
    const created = await request(app)
      .post("/kategorien")
      .send({ bezeichnung: "Socken", materialtyp: "Baumwolle" });

    const res = await request(app).delete(`/kategorien/${created.body.id}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Erfolgreich gelöscht");

    const verify = await request(app).get(`/kategorien/${created.body.id}`);
    expect(verify.status).toBe(404);
  });
});
