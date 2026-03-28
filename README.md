# Portfolio Verteilte Systeme

Microservice-Demo mit zwei Node.js/Express-Backends, SQLite und einem Frontend-Gateway.

- `kleidung-service`: Verwaltung von Kategorien und Kleidungsstuecken
- `wasch-service`: Verwaltung von Waschprogrammen, Waschgaengen und Empfehlungen
- `frontend`: UI + Reverse Proxy fuer beide APIs

## Architektur (Stand: 28.03.2026)

- `kleidung-service` laeuft auf Port `1234`
- `wasch-service` laeuft auf Port `4321`
- `frontend` laeuft auf Port `8080`
- Frontend-Proxy-Routen:
  - `/api/kleidung/*` -> `kleidung-service:1234/*`
  - `/api/wasch/*` -> `wasch-service:4321/*`

Die Services publizieren/abonnieren zusaetzlich MQTT-Events (Broker via `.env`).

## Projektstruktur

- `frontend/` Frontend-Server und statische Web-App
- `kleidung-service/` API fuer Kategorien und Kleidungsstuecke
- `wasch-service/` API fuer Waschprogramme, Waschgaenge und Empfehlungen
- `docker-compose.yml` Full-Stack Start (beide Services + Frontend)
- `document/` Projektdokumentation (Typst)

## Voraussetzungen

- Node.js 20+
- npm 10+
- Optional (empfohlen fuer Full-Stack): Docker + Docker Compose

## Schnellstart (empfohlen) mit Docker Compose

Im Projektverzeichnis:

```bash
docker compose up --build
```

Danach ist erreichbar:

- Frontend (empfohlen): `http://localhost:8080`
- Kleidung-API direkt: `http://localhost:1234`
- Wasch-API direkt: `http://localhost:4321`

Stoppen:

```bash
docker compose down
```

Persistente SQLite-Dateien (Host-Mounts):

- `kleidung-service/db_ks.sqlite`
- `wasch-service/db_ws.sqlite`

## Lokaler Start ohne Docker (Backends)

### 1) Kleidung-Service

```bash
cd kleidung-service
npm install
npm run start
```

### 2) Wasch-Service

In einem zweiten Terminal:

```bash
cd wasch-service
npm install
npm run start
```

Die Backends lesen ihre Konfiguration aus `.env` (Host, Port, MQTT-Broker).

Hinweis: Das Frontend ist fuer Compose-Netzwerkziele (`kleidung-service`, `wasch-service`) konfiguriert. Fuer den lokalen Entwicklungsbetrieb der APIs koennen die Backends direkt auf `1234` und `4321` genutzt werden.

## npm-Skripte

### `kleidung-service` und `wasch-service`

- `npm run start` Server starten
- `npm run watch` Server mit `nodemon` starten
- `npm run debug` Start im Node-Debug-Modus
- `npm run init-db` DB initialisieren
- `npm run test` Vitest-Testlauf

### `frontend`

- `npm run start` Frontend-Server starten
- `npm run dev` Frontend-Server im Watch-Modus

## API-Uebersicht

Die Endpunkte sind entweder direkt ueber die Service-Ports oder ueber das Frontend erreichbar:

- Kleidung ueber Frontend: `http://localhost:8080/api/kleidung/...`
- Waschen ueber Frontend: `http://localhost:8080/api/wasch/...`

### Kleidung-Service

#### Kategorien

- `GET /kategorien`
- `GET /kategorien/:id`
- `POST /kategorien`
- `PUT /kategorien/:id`
- `PATCH /kategorien/:id`
- `DELETE /kategorien/:id`

Beispiel `POST /kategorien`:

```json
{
  "bezeichnung": "Hemd",
  "materialtyp": "Baumwolle"
}
```

#### Kleidungsstuecke

- `GET /kleidungsstuecke`
- `GET /kleidungsstuecke/:id`
- `POST /kleidungsstuecke`
- `PUT /kleidungsstuecke/:id`
- `PATCH /kleidungsstuecke/:id`
- `DELETE /kleidungsstuecke/:id`

Beispiel `POST /kleidungsstuecke`:

```json
{
  "name": "Blaues Hemd",
  "kategorieId": 1,
  "farbe": "blau"
}
```

### Wasch-Service

#### Waschprogramme

- `GET /waschprogramme`
- `GET /waschprogramme/:id`
- `POST /waschprogramme`
- `PUT /waschprogramme/:id`
- `PATCH /waschprogramme/:id`
- `DELETE /waschprogramme/:id`

Beispiel `POST /waschprogramme`:

```json
{
  "name": "Feinwaesche 30 Grad",
  "temperatur": 30,
  "dauer": 45
}
```

#### Empfehlungen

- `GET /empfehlungen`
- `GET /empfehlungen/:kategorieId`
- `POST /empfehlungen`
- `PUT /empfehlungen/:kategorieId`
- `PATCH /empfehlungen/:kategorieId`
- `DELETE /empfehlungen/:kategorieId`

Beispiel `POST /empfehlungen`:

```json
{
  "kategorieId": 1,
  "waschprogrammId": 1
}
```

#### Waschgaenge

- `GET /waschgaenge`
- `GET /waschgaenge/:id`
- `POST /waschgaenge`
- `PUT /waschgaenge/:id`
- `PATCH /waschgaenge/:id`
- `DELETE /waschgaenge/:id`

Beispiel `POST /waschgaenge`:

```json
{
  "waschprogrammId": 1
}
```

## Schnelltests mit curl

Ueber das Frontend-Gateway:

```bash
curl http://localhost:8080/api/kleidung/kategorien
curl http://localhost:8080/api/kleidung/kleidungsstuecke
curl http://localhost:8080/api/wasch/waschprogramme
curl http://localhost:8080/api/wasch/empfehlungen
curl http://localhost:8080/api/wasch/waschgaenge
```

## Tests ausfuehren

```bash
cd kleidung-service && npm test
cd wasch-service && npm test
```

## Lizenz

ISC
