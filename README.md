# Portfolio-VS

Ein kleines Microservice-Beispiel mit zwei Node.js/Express-Services und SQLite:

- `kleidung-service`: Verwaltung von Kategorien und Kleidungsstuecken
- `wasch-service`: Verwaltung von Waschprogrammen, Waschgaengen und Empfehlungen

Beide Services enthalten Demodaten und liefern statische Inhalte unter `static/` aus.

## Projektstruktur

- `kleidung-service/` API fuer Kleidung
- `wasch-service/` API fuer Waschen
- `docker-compose.yml` Gemeinsamer Start beider Services
- `document/` Dokumente (Typst)

## Voraussetzungen

- Node.js 20+ (empfohlen)
- npm 10+ (empfohlen)
- Optional: Docker + Docker Compose

## Schnellstart mit Docker Compose

Im Projektverzeichnis:

```bash
docker compose up --build
```

Danach laufen die Services unter:

- Kleidung: `http://localhost:9000`
- Waschen: `http://localhost:4321`

Beenden:

```bash
docker compose down
```

Hinweis: Die SQLite-Dateien werden als Volumes eingebunden:

- `kleidung-service/db_ks.sqlite`
- `wasch-service/db_ws.sqlite`

## Lokaler Start ohne Docker

### 1) Kleidung-Service

```bash
cd kleidung-service
npm install
npm run start
```

Standard-Port: `9000`

### 2) Wasch-Service

In einem zweiten Terminal:

```bash
cd wasch-service
npm install
npm run start
```

Standard-Port: `4321`

## Verfuegbare npm-Skripte (pro Service)

- `npm run start` Startet den Server
- `npm run watch` Startet mit `nodemon`
- `npm run debug` Startet mit Node-Debugger
- `npm run init-db` Initialisiert die DB (optional)

## API-Uebersicht

### Kleidung-Service (`http://localhost:9000`)

#### Kategorien

- `GET /kategorien`
- `GET /kategorien/:id`
- `POST /kategorien`
- `PUT /kategorien/:id`
- `PATCH /kategorien/:id`
- `DELETE /kategorien/:id`

Beispiel-Body fuer `POST /kategorien`:

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

Beispiel-Body fuer `POST /kleidungsstuecke`:

```json
{
  "name": "Blaues Hemd",
  "kategorieId": 1,
  "farbe": "blau"
}
```

### Wasch-Service (`http://localhost:4321`)

#### Waschprogramme

- `GET /waschprogramme`
- `GET /waschprogramme/:id`
- `POST /waschprogramme`
- `PUT /waschprogramme/:id`
- `PATCH /waschprogramme/:id`
- `DELETE /waschprogramme/:id`

Beispiel-Body fuer `POST /waschprogramme`:

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

Beispiel-Body fuer `POST /empfehlungen`:

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

Beispiel-Body fuer `POST /waschgaenge`:

```json
{
  "waschprogrammId": 1
}
```

## Testaufrufe mit curl

```bash
curl http://localhost:9000/kategorien
curl http://localhost:9000/kleidungsstuecke
curl http://localhost:4321/waschprogramme
curl http://localhost:4321/empfehlungen
curl http://localhost:4321/waschgaenge
```

## Lizenz

ISC
