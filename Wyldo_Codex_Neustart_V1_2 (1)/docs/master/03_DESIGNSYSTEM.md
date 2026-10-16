# 3 – Visuelles Master-Design

**Referenz:** die drei vom Nutzer freigegebenen Hauptmasken und der später freigegebene zwölfteilige Storyboard-Flow in `design/mockups/`. Diese sind Inspirations- und Layoutreferenzen, keine direkt extrahierbaren UI-Komponenten. Schriftfehler oder dekorative Fantasiekarten werden NICHT übernommen.

## Stil
Modernes **familienfreundliches Adventure Game**; hochwertig illustrierte Natur, plastischer originaler orangefarbener Wyldo mit grünem Schal, Rucksack und Kompass, tiefe Waldgrüntöne, sonniges Gold, cremefarbene Cards, abgerundete Formen, klare lebendige Gaming-Akzente. Kinder begeistert, Erwachsene nehmen es ernst. Nicht minimalistisch-neutrale Wander-App, nicht überladene Mittelalter-/Fantasy-Menüs.

## Design-Tokens – Ausgangswerte, visuell anzupassen
- `forest` #183D32; `pine` #28614B; `gold` #E4B85C; `cream` #F7F0DE; `ink` #24342B; `sky` #B6DCE6; `success` #55A56A.
- Große Hero-Panels mit Illustrationen, Buttons mindestens 48 dp hoch, abgerundete 16–24dp Cards.
- Lesbare UI-Sans-Serif für Funktionslabels, ausdrucksvollere Display-Typografie sparsam für Questtitel.
- Motion: weiche Übergänge, hörbar/optisch bestätigte Siegel und XP, reduzierte Bewegung respektieren.

## Assets und Realitätsstatus
- `design/fox/`: bestehender Fuchs und Modellblatt = **Look-Referenz**, nicht zusammengesetztes 2D-Rig, nicht animierbar.
- `design/mockups/01..03`: freigegebene **Hauptscreen-Referenzen**.
- `design/mockups/storyboard/`: aus Gesamtbild geschnittene Einzelkacheln = **Storyfluss-Referenz**, keine fertigen UI-Exportdateien.
- Für echte App: Hintergrundillustration, Cover, Quest-Pins, Siegel, Kristall, XP-Badge, App-Icon und Rive/Lottie-Animationen separat und konsistent produzieren. Keine Screenshots als unflexible App-Oberfläche einbauen.
- Die App muss auf 320, 360, 390 und breiten Geräteansichten getestet werden; Bild/Text getrennte Ebenen, kein Text in Hintergrundgrafiken.

## Qualitäts-Gate
UI-Screenshot pro Hauptscreen + visuelle Gegenüberstellung; leere Flächen, typografische Brüche, fehlende Icons, falscher Charakter, abgeschnittene Buttons oder nur Placeholder-Cards sind **nicht abgenommen**.
