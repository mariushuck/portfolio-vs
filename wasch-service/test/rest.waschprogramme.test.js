import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { buildApp, resetWaschDb } from "./support/test-app.js";

describe("REST /waschprogramme", () => {
  const app = buildApp();

  beforeEach(() => {
    resetWaschDb();
  });

  it("GET /waschprogramme liefert alle Programme", async () => {
    const res = await request(app).get("/waschprogramme");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    expect(res.body[0]).toMatchObject({ id: 1, name: "Feinwaesche 30 Grad" });
  });

  it("GET /waschprogramme/:id liefert 400 bei ungueltiger ID", async () => {
    const res = await request(app).get("/waschprogramme/abc");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("INVALID-ID");
  });

  it("GET /waschprogramme/:id liefert 404 bei unbekanntem Datensatz", async () => {
    const res = await request(app).get("/waschprogramme/9999");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("NOT-FOUND");
  });

  it("POST /waschprogramme erstellt Datensatz", async () => {
    const payload = { name: "Eco 30", temperatur: 30, dauer: 50 };

    const res = await request(app).post("/waschprogramme").send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(payload);
    expect(Number.isInteger(res.body.id)).toBe(true);

    const verify = await request(app).get(`/waschprogramme/${res.body.id}`);
    expect(verify.status).toBe(200);
    expect(verify.body).toMatchObject(payload);
  });

  it("POST /waschprogramme validiert Feldtypen", async () => {
    const res = await request(app)
      .post("/waschprogramme")
      .send({ name: "Eco 30", temperatur: "30", dauer: 50 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("MISSING-FIELDS");
  });

  it("PUT /waschprogramme/:id aktualisiert Datensatz", async () => {
    const payload = { name: "Schnell 20", temperatur: 20, dauer: 20 };

    const res = await request(app).put("/waschprogramme/2").send(payload);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 2, ...payload });

    const verify = await request(app).get("/waschprogramme/2");
    expect(verify.body).toEqual({ id: 2, ...payload });
  });

  it("PATCH /waschprogramme/:id aktualisiert Teilfeld", async () => {
    const res = await request(app)
      .patch("/waschprogramme/3")
      .send({ dauer: 70 });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 3, name: "Jeans 40 Grad", dauer: 70 });
  });

  it("PATCH /waschprogramme/:id validiert Feldtypen", async () => {
    const res = await request(app)
      .patch("/waschprogramme/3")
      .send({ temperatur: "40" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("INVALID-FIELDS");
  });

  it("DELETE /waschprogramme/:id loescht Datensatz", async () => {
    const created = await request(app)
      .post("/waschprogramme")
      .send({ name: "Kurz", temperatur: 25, dauer: 15 });

    const res = await request(app).delete(`/waschprogramme/${created.body.id}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Erfolgreich gelöscht");

    const verify = await request(app).get(`/waschprogramme/${created.body.id}`);
    expect(verify.status).toBe(404);
  });
});
