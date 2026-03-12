#import "@preview/clean-dhbw:0.3.1": *

#show: clean-dhbw.with(
  title: "Verteiltes System zur intelligenten Textilpflege",
  authors: (
    (name: "Marius Huck", student-id: "3391238", 
     course: "WWI24B2", course-of-studies: "Wirtschaftsinformatik", 
    ),
  ),
  city: "Karlsruhe",
  at-university: true, 
  type-of-thesis: "Portfolioarbeit",
  show-confidentiality-statement: false, 
  show-declaration-of-authorship: false,
  date: datetime.today(),
  language: "de",                      
  supervisor: (
    university: "Dennis Schulmeister-Zimolong"
  ),
  university: "Duale Hochschule Baden-Württemberg",
  university-location: "Karlsruhe",
  university-short: "DHBW",
)

= Aufgabe 1: Datenmodell

== Problemstellung und Anwendungsfall

Viele Nutzer sind unsicher, welches Waschprogramm für welche Kleidungsstücke am besten geeignet ist, um das Material zu schonen. Diese Anwendung soll dabei unterstützen eine digitale Garderobe zu verwalten und für jedes Kleidungsstück – basierend auf seinem Material – das optimale Waschprogramm zu finden und Waschvorgänge zu dokumentieren.

== Anforderungen (User Stories)

Zur Abbildung des funktionalen Umfangs der Anwendung wurden folgende Anforderungen definiert:

- *Als Nutzer* möchte ich neue *Kleidungsstücke* mit Name und Material anlegen, um meine Garderobe digital abzubilden.
- *Als Nutzer* möchte ich *Kategorien* (z. B. Wolle, Baumwolle) verwalten, um Kleidung effizient nach Materialtyp zu sortieren.
- *Als Nutzer* möchte ich verschiedene *Waschprogramme* einsehen können, um die verfügbaren Optionen meiner Waschmaschine zu kennen.
- *Als Nutzer* möchte ich eine *Empfehlung* erhalten, welches Programm für welche Materialkategorie optimal geeignet ist.
- *Als Nutzer* möchte ich einen *Waschgang* starten und protokollieren, um den Zeitpunkt der letzten Reinigung nachzuvollziehen.

== Entwurf des Datenmodells

Die Anwendung ist in zwei eigenständige Microservices unterteilt, die jeweils eine eigene SQLite-Datenbank zur Datenhaltung nutzen.

#image("./assets/datenmodell.png", width: auto)

=== Microservice: Kleidung-Service

Dieser Dienst verwaltet das Inventar und die Materialstammdaten.
- *Entität Kleidungsstück*: Besteht aus `ID` (PK), `Name` (String), `KategorieID` (FK) und `Farbe` (String).
- *Entität Kategorie*: Besteht aus `ID` (PK), `Bezeichnung` (String, z. B. "Feinwäsche") und `Materialtyp` (String).

=== Microservice: Wasch-Service

Dieser Dienst steuert die Logik der Waschvorgänge und verknüpft diese mit den Materialdaten.
- *Entität Waschprogramm*: Besteht aus `ID` (PK), `Name` (String), `Temperatur` (Integer) und `Dauer` (Integer).
- *Entität Waschgang*: Besteht aus `ID` (PK), `WaschprogrammID` (FK), `Zeitstempel` (DateTime) und `Status` (String).
- *Entität Empfehlung*: Dient als Verknüpfung und besteht aus `ID` (PK), `KategorieID` (FK - Referenz auf Kleidung-Service) und `WaschprogrammID` (FK).

/*

= Aufgabe 2: REST-Schnittstelle

== Entwurf der REST-Schnittstellen

Gemäß der Microservice-Architektur besitzt jeder Service eine eigenständige REST-Schnittstelle für den öffentlichen Zugriff auf seine Daten und Funktionen. Die Schnittstellen sind vollständig im OpenAPI-Format in der Version 3.1.0 dokumentiert und bieten weitreichende Operationen zur Verwaltung der Entitäten an.

=== Schnittstelle: Kleidung-Service

Der *Kleidung-Service* stellt Endpunkte zur Verwaltung von Kleidungsstücken und Materialkategorien bereit. Über die HTTP-Methoden `GET`, `POST`, `PUT`, `PATCH` und `DELETE` können nun sowohl Kleidungsstücke als auch Kategorien nicht nur abgerufen und angelegt, sondern auch vollständig oder teilweise aktualisiert sowie gelöscht werden. Zudem liefert der Endpunkt `/kategorien` eine Liste aller Materialkategorien, welche auch vom Wasch-Service benötigt wird. 

=== Schnittstelle: Wasch-Service

Die REST-Schnittstelle des *Wasch-Services* umfasst die Verwaltung von Waschprogrammen, Empfehlungen und Waschgängen. Ein zentraler Endpunkt (`/empfehlungen/{kategorieId}`) liefert auf Basis einer übergebenen Kategorie-ID aus dem Kleidung-Service die passende Programmempfehlung. Neue Waschgänge können über einen `POST`-Aufruf gestartet werden, welcher im Erfolgsfall mit dem HTTP-Statuscode 201 bestätigt wird. Im Gegensatz zu früheren Entwürfen ist nun auch eine tiefergehende Bearbeitung historischer Waschgänge, Programme und Empfehlungen durch das UI oder andere Services möglich, da für all diese Ressourcen vollständige `PUT`-, `PATCH`- und `DELETE`-Methoden implementiert wurden.

Bei der Konzeption wurde darauf geachtet, dass jede Entität eine eindeutige URL besitzt. Alle REST-Aufrufe werden im Erfolgsfall mit dem Statuscode 200 oder bei Erstellungen mit 201 beantwortet. Bei fehlerhaften Anfragen (wie ungültigen Eingabedaten) wird ein 400er-Code zurückgegeben, während nicht gefundene Ressourcen konsequent mit einem 404-Fehler behandelt werden.

= Aufgabe 3: Implementierung

= Aufgabe 4: Docker Compose

*/