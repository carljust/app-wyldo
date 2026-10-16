# 6 – Qualität, Tests und Abnahme

## Gate A: Designfreigabe
Screens S02 Entdecken, S03 Details, S04/S05 Karten-/Pfeilnavigation müssen auf 320/360/390px und echtem Android/iOS plausibel sein. Screenshot gegen Masterreferenz, UI muss ein *Spiel* vermitteln (Quest-, XP-, Story- und Fuchs-Sprache), nicht ein Outdoor-Portal. Alle sichtbaren Buttons führen zu sinnvoller Aktion oder sind klar als deaktiviert markiert.

## Gate B: Vertical Slice im Simulator
Echte Benutzerführung vom Login (oder eindeutigem Dev-Login) bis zum Schatzfund. Acht Kapitel, vier Siegel, Hilfe-/Falschantworten, Pause/Resume, kein Verlust nach Neustart, keine doppelten XP, alle Dialoge, Fortschritte und Inventargegenstände persistieren. GPS-Simulation aktiviert nur in Dev-Build. Keine externen Live-GPS-Behauptungen.

## Gate C: Zentrale Backend-Verbindung
Nachweis: 2 Testnutzer haben getrennte Daten; Google-Login/Session funktioniert auf Testgerät; RLS-Test, idempotente XP-Vergabe, Offline→Online-Sync mit App-Neustart, Storage-Dateien erreichbar, keine Secret-Leaks.

## Gate D: Outdoor-Abnahme
GPX + Stationen manuell geprüft; Ankünfte mit Gerätetests, unbekannte GPS-Genauigkeit löst nicht unbemerkt aus; Richtungskompass verständlich, auf Wegen bleiben; Offline-Test; Unterbrechung; echte Familien-Testgruppe. Ohne Gate D **keine** Kennzeichnung `outdoor_playable` oder Veröffentlichung.

## Pflichtnachweise je Codex-PR
Änderungsprotokoll, neue/angepasste Screenshots, Abweichungsliste vs Mockup, konkrete Testbefehle und Ergebnisse, offene Lücken, Git-Branch/PR. Keine grünen Fertigmeldungen aus reinen Web-/Exporttests als Gerätezusage.

## Gate E: Outdoor-Rätsel (neu, verbindlich)
Jedes Haupt-Rätsel verlangt eine am wirklichen Standort notwendige, eindeutig erkennbare Beobachtung. Testprotokoll dokumentiert sicher erreichbaren Wegpunkt, Perspektive/Fotoreferenz, Eindeutigkeit, jahreszeitliche Robustheit, Hinweisstufen, alternative vor-Ort-Aufgabe sowie kindgerechte Verständlichkeit. Keine reine Wissens-, Symbolsortier- oder Bildschirmaufgabe als Hauptstation. Ohne diesen Nachweis nicht veröffentlichen.
