Gespeicherte Navigation lässt sich jetzt pausieren und nach einem Neustart über den Rucksack fortsetzen. Ein expliziter Zustandsautomat verlangt stabile Ankunft und bewussten Start, zeigt Wyldos Intro und wartet anschließend auf ein freigegebenes Ziel. Die Externsteine bleiben eine lokale Dev-Simulation ohne GPS-Berechtigung oder Upload.

Native SQLite und Web IndexedDB speichern Zustand und Outbox atomar. Live-Checkpoint-Sync bindet Nutzer und Questversion, bestätigt Wiederholungen idempotent und verhindert das Überschreiben neuerer Revisionen. Die neue SQL-Migration vergibt keine XP und ist noch nicht im gehosteten Projekt installiert.

Validierung: 34 Unit-/SQLite-Tests, echte PostgreSQL-RLS-/Replay-Tests, 45 Karten-/UI-Prüfungen, Navigation und Auth in drei Viewports, Produktionssperren sowie Web-/iOS-/Android-JS-Exports bestanden. 18 neue Screenshots und Einschränkungen: [Phase-4-Review](https://github.com/carljust/app-wyldo/blob/feat/wyldo-navigation-state/docs/implementation/phase4/REVIEW.md). Native Geräteortung, echter Login und authentifizierter Hosted-Sync bleiben offen.

Aufbauend auf PR #2 (`feat/wyldo-supabase-auth`); vor dem Merge die gestapelten Vorgänger berücksichtigen. Keine vollständige Acht-Kapitel-Engine oder Belohnungen.
