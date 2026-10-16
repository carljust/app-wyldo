# CODEX-PROMPT – Neues Wyldo-Projekt (Copy & Paste)

Erstelle **ein neues, eigenständiges Repository `wyldo-app`**. Verwende NICHT den alten Quellcode aus `carljust/wanderquest` als Projektgrundlage. Dieses Masterpaket im neuen Repository (`docs/master/`) ist die einzige fachliche/visuelle Quelle.

Du bist Senior React Native Engineer, Game UX Designer und Mobile Softwarearchitekt. Lies vor jeder Implementierung `docs/master/00_START_HIER.md` bis `docs/master/07_ROADMAP.md`, die Quest-JSON und alle Referenzgrafiken. Melde fehlende Dateien ausdrücklich, statt Inhalte zu erfinden.

Wyldo ist ein echtes GPS-basiertes Adventure Game für Familien und Kinder; der orangefarbene Fuchs Wyldo begleitet nur Intro, Ereignisse und Rätsel. Vier Tabs Entdecken, Karte, Rucksack, Profil. Erste Mission mit 8 Kapiteln und 4 Steinsiegeln: `Der verlorene Schatz der Externsteine`.

Nutze React Native/Expo, TypeScript, Expo Router; Supabase als zukünftiges zentrales Backend und SQLite für Offline-Fortschritt. Wähle kompatible Paketversionen, dokumentiere Alternativen bei fehlender SDK-Unterstützung. Kein komplettes Übernehmen alter Komponenten. Ziel: saubere datengetriebene Quest-Engine, sichere GPX-basierte Navigation, Karte/Pfeilmodus, Story, Rätsel, Abzeichen, XP und Resume.

**Arbeite jetzt NUR in zwei Schritten:**
1. Erstelle Projektarchitektur, Daten-/Questkontrakte, Routingstruktur, UI-Komponentenplan und konkrete Abweichungs-/Risikoliste. Verwende noch keine ungeprüften GPS-Trigger.
2. Baue das Designsystem und die drei freigegebenen Hauptmasken (Entdecken, Questdetails, Navigation Karte/Richtung) sowie sichtbare vier Haupttabs. Erstelle Screenshots bei 360x800 und 390x844, vergleiche mit Mockups, teste TypeScript/Lint/UI und dokumentiere Abweichungen. Ersetze keine notwendigen Bilder durch Emojis/Stock-Placeholder, die als final gelten.

**STOP nach Designphase und fordere explizit meine Freigabe an.** Nicht eigenmächtig ganze Questengine oder Backend live schalten. Änderungen nur über nachvollziehbaren Feature-Branch und Pull Request. Offen gebliebene Ressourcen ehrlich kennzeichnen.

**Quest-Prinzip V1.1 (verbindlich für spätere Phasen):** Kinder lösen alle Hauptaufgaben durch Beobachtung der echten Umgebung. Siehe `docs/master/05_QUEST_EXTERNSSTEINE.md` und `quest/externsteine_v1_draft.json`. Die Aufgaben sind vor Ort nicht validiert, GPS-Trigger bleiben null, daher nur Dev-Simulation vor Feldfreigabe. Keine abstrakten Allgemeinwissensquizze als reguläre Quest-Aufgaben.
