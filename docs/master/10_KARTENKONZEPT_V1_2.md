# Verbindliche Kartenkonzeption (neu, V1.2)

## A — Globale Karte aller Quests (`Karte`-Tab)
- **Genau ein Pin pro veröffentlichter Quest** auf der Karte, **am festgelegten Startpunkt**.
- Kein Rundweg, keine Routenpolyline, keine Kapitel-/Rätselmarker auf dieser Karte.
- Marker in räumlicher Nähe clustern; beim Hineinzoomen entclustern, ohne zusätzliche Quest-Marker zu erfinden.
- Tap auf Pin → Mini-Karte mit Questbild, Titel, empfohlener Altersgruppe, Schwierigkeit, Gehstrecke/Dauer (nur sofern freigegeben), Entfernung **zum Start** als klar gekennzeichnete Luftlinie und CTA `Quest entdecken` → Detailseite.
- Anzeige für fehlende Standortberechtigung; Karte und Quest-Pins bleiben ohne Standortberechtigung nutzbar. Entfernung/„in der Nähe“ nur mit zulässigen Standortdaten.
- Pro veröffentlichtem Datensatz ist `startPoint` erforderlich. Entwürfe niemals in öffentlicher Discovery anzeigen.

## B — Quest-Detailseite
- Eigene interaktive Kartenansicht mit **vollständiger Route als Track-Polyline**, geladen aus Geometrie der **ausgewählten Quest**, nicht aus Luftlinien zwischen Stationen.
- Automa­tisches Fit-to-bounds mit Padding für Titel, Overlay und CTA; manuelles Zoomen/Schwenken möglich.
- Deutliches Startsymbol und Zielsymbol; wenn identisch/nahe beieinander, **ein gemeinsamer Start/Ziel-Pin**.
- Kein Spoilern: Kapitel-/Rätselpositionen, Siegel-/Schatzpositionen, Geheimantworten standardmäßig verborgen. Optional künftig nur öffentlich freigegebene, nicht geheime POIs.
- Wenn keine freigegebene Route vorhanden ist: ehrlicher Zustand `Route wird noch geprüft`; **keine Fake-Route**. Für die OH!6-Quest darf der importierte **unverifizierte Kandidat** nur mit Kennzeichnung `Routenentwurf – noch nicht vor Ort geprüft` in der Dev-Vorschau erscheinen.
- Eine Übersicht aus Gebiet, Strecke, ca. Dauer, Schwierigkeitsgrad nur mit klar belegter Freigabe; Angaben aus altem Mockup sind Illustrationen, keine Datengrundlage.

## C — Navigation zum Start und in der laufenden Quest
- Eigene Navigationsansicht mit **Kartenmodus** und **Richtungsmodus**. Nicht mit Quest-Übersichtskarte verwechseln.
- Kartenmodus mit Nutzerposition, Ziel, freigegebenem Track; Richtungsmodus mit Peilung/Heading und **Luftlinien**entfernung. Ständig `Auf markierten Wegen bleiben`.
- Während der Quest nur aktuelles freigegebenes Ziel anzeigen; geheime Folgeziele nicht vorzeitig aufdecken.
- Keine automatischen GPS-Auslösungen für unverifizierte Kapitel-Punkte. Simulator nur deutlich als Entwicklungsmodus und nur in Dev-Builds.
- GPS-Berechtigung/Qualität, Genauigkeitskreis, Pausieren/Fortsetzen und Offline-Fallback explizit behandeln.

## Designpriorität
Der V1.1-Mockup der Questdetails kann eine illustrierte oder falsche Karte zeigen. **Tatsächlicher freigegebener Track und diese V1.2-Regeln schlagen die Illustration.** Werbliche Hintergrundgrafiken bleiben erlaubt, dürfen jedoch nicht als GPS-Route erscheinen.
