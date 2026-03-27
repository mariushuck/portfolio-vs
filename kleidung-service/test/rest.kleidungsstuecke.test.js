import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { buildApp, resetKleidungDb } from "./support/test-app.js";

describe("REST /kleidungsstuecke", () => {
  const app = buildApp();

  beforeEach(() => {
    resetKleidungDb();
  });

  it("GET /kleidungsstuecke liefert alle Datensaetze", async () => {
    const res = await request(app).get("/kleidungsstuecke");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    expect(res.body[0]).toMatchObject({
      id: 1,
      name: "Weisses Basic Shirt",
      kategorie_id: 1,
    });
  });

  it("GET /kleidungsstuecke/:id liefert 400 bei ungueltiger ID", async () => {
    const res = await request(app).get("/kleidungsstuecke/-1");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("INVALID-ID");
  });

  it("GET /kleidungsstuecke/:id liefert 404 wenn nicht vorhanden", async () => {
    const res = await request(app).get("/kleidungsstuecke/9999");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("NOT-FOUND");
  });

  it("POST /kleidungsstuecke erstellt Datensatz", async () => {
    const payload = { name: "Dunkles Hemd", kategorieId: 1, farbe: "schwarz" };

    const res = await request(app).post("/kleidungsstuecke").send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(payload);
    expect(Number.isInteger(res.body.id)).toBe(true);

    const verify = await request(app).get(`/kleidungsstuecke/${res.body.id}`);
    expect(verify.status).toBe(200);
    expect(verify.body.name).toBe(payload.name);
    expect(verify.body.farbe).toBe(payload.farbe);
  });

  it("POST /kleidungsstuecke validiert Pflichtfelder", async () => {
    const res = await request(app)
      .post("/kleidungsstuecke")
      .send({ name: "Dunkles Hemd" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("MISSING-FIELDS");
  });

  it("POST /kleidungsstuecke validiert kategorieId", async () => {
    const res = await request(app)
      .post("/kleidungsstuecke")
      .send({ name: "Dunkles Hemd", kategorieId: "x" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("INVALID-KATEGORIE-ID");
  });

  it("PUT /kleidungsstuecke/:id aktualisiert vollstaendig", async () => {
    const payload = { name: "Sommerhemd", kategorieId: 2, farbe: "beige" };

    const res = await request(app).put("/kleidungsstuecke/1").send(payload);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 1, ...payload });

    const verify = await request(app).get("/kleidungsstuecke/1");
    expect(verify.body).toMatchObject({
      id: 1,
      name: "Sommerhemd",
      kategorie_id: 2,
      farbe: "beige",
    });
  });

  it("PATCH /kleidungsstuecke/:id aktualisiert Teilfelder", async () => {
    const res = await request(app)
      .patch("/kleidungsstuecke/3")
      .send({ name: "Relaxed Jeans" });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: 3,
      name: "Relaxed Jeans",
      kategorie_id: 3,
    });
  });

  it("PATCH /kleidungsstuecke/:id liefert 500 bei leerem Patch", async () => {
    const res = await request(app).patch("/kleidungsstuecke/1").send({});

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("PATCH-FAILED");
  });

  it("DELETE /kleidungsstuecke/:id entfernt Datensatz", async () => {
    const res = await request(app).delete("/kleidungsstuecke/1");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Erfolgreich gelöscht");

    const verify = await request(app).get("/kleidungsstuecke/1");
    expect(verify.status).toBe(404);
  });
});
