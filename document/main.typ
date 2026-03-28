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