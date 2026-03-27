import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { buildApp, resetWaschDb } from "./support/test-app.js";

describe("REST /waschgaenge", () => {
  const app = buildApp();

  beforeEach(() => {
    resetWaschDb();
  });

  it("GET /waschgaenge liefert alle Waschgaenge", async () => {
    const res = await request(app).get("/waschgaenge");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    expect(res.body[0]).toMatchObject({ id: 1, status: "abgeschlossen" });
  });

  it("GET /waschgaenge/:id liefert 400 bei ungueltiger ID", async () => {
    const res = await request(app).get("/waschgaenge/0");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("INVALID-ID");
  });

  it("GET /waschgaenge/:id liefert 404 bei unbekannter ID", async () => {
    const res = await request(app).get("/waschgaenge/9999");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("NOT-FOUND");
  });

  it("POST /waschgaenge erstellt neuen Waschgang", async () => {
    const res = await request(app)
      .post("/waschgaenge")
      .send({ waschprogrammId: 1 });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ waschprogramm_id: 1, status: "geplant" });
    expect(Number.isInteger(res.body.id)).toBe(true);
  });

  it("POST /waschgaenge validiert waschprogrammId", async () => {
    const res = await request(app)
      .post("/waschgaenge")
      .send({ waschprogrammId: "1" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("MISSING-FIELDS");
  });

  it("PUT /waschgaenge/:id aktualisiert Datensatz", async () => {
    const payload = {
      waschprogrammId: 2,
      zeitstempel: "2026-03-20T12:00:00.000Z",
      status: "in_bearbeitung",
    };

    const res = await request(app).put("/waschgaenge/1").send(payload);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: 1,
      waschprogramm_id: 2,
      status: "in_bearbeitung",
      zeitstempel: "2026-03-20T12:00:00.000Z",
    });
  });

  it("PUT /waschgaenge/:id validiert status", async () => {
    const res = await request(app).put("/waschgaenge/1").send({
      waschprogrammId: 2,
      zeitstempel: "2026-03-20T12:00:00.000Z",
      status: "falsch",
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("MISSING-FIELDS");
  });

  it("PATCH /waschgaenge/:id aktualisiert waschprogrammId", async () => {
    const res = await request(app)
      .patch("/waschgaenge/2")
      .send({ waschprogrammId: 3 });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 2, waschprogramm_id: 3 });
  });

  it("PATCH /waschgaenge/:id validiert Feldwerte", async () => {
    const res = await request(app)
      .patch("/waschgaenge/2")
      .send({ waschprogrammId: "3" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("INVALID-FIELDS");
  });

  it("DELETE /waschgaenge/:id entfernt Datensatz", async () => {
    const res = await request(app).delete("/waschgaenge/3");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Erfolgreich gelöscht");

    const verify = await request(app).get("/waschgaenge/3");
    expect(verify.status).toBe(404);
  });
});
