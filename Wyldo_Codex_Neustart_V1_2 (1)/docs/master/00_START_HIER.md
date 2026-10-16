# WYLDO – Masterpaket V1.1
**Stand:** 16.10.2026 · **Status:** verbindliches Produktziel / noch nicht technisch abgenommen

## Wichtigste Regel
**Dieses Paket ist die einzige fachliche und visuelle Referenz für den Neustart.** Alte `wanderquest`-Implementierungen, alte Wander-App-Oberflächen und frühere Konzepte sind NICHT verbindlich. Das alte Repository dient nur als möglicher Fundus für unabhängig geprüfte technische Lösungen, nicht als Vorlage zum Kopieren.

## Was ist bereits entschieden?
- Marken-/Appname **Wyldo**, der orangefarbene Fuchs heißt ebenfalls **Wyldo** (grüner Schal, Rucksack, Kompass).
- Ziel: **Familien mit Kindern** wieder in die Natur bringen, indem Spaziergänge wie ein echtes Adventure Game erlebt werden.
- Visuelle Richtung: **modernes hochwertiges Adventure Game** – lebendig, farbig, atmosphärisch, belohnend, keine nüchterne Outdoor-App und keine Kleinkinder-Comicoberfläche.
- Haupttabs **Entdecken / Karte / Rucksack / Profil**.
- Spielerischer Ablauf: Quest finden → Details → zum Start navigieren (Karte/Pfeil) → am Start Wyldo + bewusster Start → Intro → zum nächsten Punkt navigieren → Wyldo-Aufgabe → Belohnung → wiederholen → Finale + XP + Abzeichen.
- Erste Mission: **Der verlorene Schatz der Externsteine**, acht Storykapitel, vier Steinsiegel, Runa (Steinkauz), Kristall-Schatz.
- **Verbindliches Quest-Prinzip:** Kinder finden die Lösungen **in der echten Umgebung**. Keine abstrakten Wissensquizze oder vollständig am Smartphone lösbaren Hauptaufgaben. Beobachtungsorte erst nach Geländeprüfung freigeben.
- Quest jederzeit pausieren und später wieder aufnehmen; zentrale DB Supabase; offline-taugliche Questarchitektur.

## Verzeichnis
- `01_PRODUKTVISION.md`: Zielgruppe und Prinzipien
- `02_UX_FLOW_UND_MASKEN.md`: exakte Benutzerwege, Masken, Zustände
- `03_DESIGNSYSTEM.md`: grafische Regeln und Designreferenzen
- `04_TECHNIK_UND_DATEN.md`: Architektur, Offline, GPS, Security
- `05_QUEST_EXTERNSSTEINE.md`: vollständiger Storyentwurf, Dialoge und Rätsel
- `06_ABNAHME_UND_TESTS.md`: messbare Abnahmekriterien
- `07_ROADMAP.md`: Phasen, Gates und Liefergegenstände
- `08_CODEX_STARTPROMPT.md`: kopierbarer Auftrag für neues Repository
- `quest/externsteine_v1_draft.json`: maschinenlesbare Quest, noch nicht zur Veröffentlichung freigegeben
- `design/mockups/`: freigegebene Referenzen plus Storyboard-Ausschnitte
- `design/fox/`: verbindliche Fuchs-Designreferenzen, **keine** riggbaren Animator-Assets
- `09_CHANGELOG_V1_1.md`: verbindliche Aktualisierung zu umgebungsbasierten Rätseln

## Verbindlich vs. offen
**Verbindlich:** UX-Sequenz, Markenfigur, Haupttabs, Queststory-Kern, Designrichtung, Daten- und Sicherheitsregeln.
**Offen und NICHT freigegeben:** präzise Koordinaten jeder Station, amtlicher GPX-Abgleich, reale Gehstrecke der finalen Quest, Offline-Kartenlizenz, finaler Sprach-/Animationssatz, endgültige XP-Balance, Google-OAuth-Konfiguration.

Die illustrierte Karte in Mockups ist kein Wegnachweis. Bildschriften/Details in generierten Mockups können fehlerhaft sein. Implementierung folgt den Textspezifikationen, wenn sich Mockup-Text und Anforderungen widersprechen.
