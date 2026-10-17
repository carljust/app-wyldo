# Wyldo Phase 3: Supabase-Datenmodell und Auth-Grundlagen

Nach der Designfreigabe ergänzt dieser auf PR #1 aufbauende PR die Supabase-Anbindung: E-Mail-Magic-Link, Google-OAuth-Codepfad mit PKCE, Sessionpersistenz, Abmeldung, Konfigurations-/Fehlerzustände und einen echten asynchronen Quest-Repositoryadapter. Bei konfiguriertem Backend werden Ladefehler nicht durch Testquests ersetzt. Serverseitige Schlüssel werden als Clientkonfiguration abgelehnt.

Die atomare SQL-Migration liefert versionierte Quests, Routen, Profile, private Stationen, Assets/Storage, persönliche Sessions und gesperrte Reward-/Outbox-Strukturen. RLS und Datenbankconstraints verhindern querlesende Konten, Client-XP-/Fortschrittsmutationen, ungeprüfte Publikation und Replay-Duplikate. Kein Rewardservice und keine Quest-Engine implementiert.

Geprüft: TypeScript und Formatierung, 19 Unit-/Domänentests, echte lokale PostgreSQL-17-RLS-/Storagepolicy-Tests, 45 Browserregressionen sowie Auth-/Backendzustände in drei Viewports. Web- und beide Native-JS-/Hermes-Exports erfolgreich; 3 Produktions-Sperrprüfungen bestanden. Neue Auth-Screenshots und Grenzen: [Phase-3-Review](https://github.com/carljust/app-wyldo/blob/feat/wyldo-supabase-auth/docs/implementation/phase3/REVIEW.md).

Das bereitgestellte Supabase-Projekt ist lesend erreichbar: E-Mail ist aktiviert, Google deaktiviert. Preflight und Migration wurden inzwischen vom Nutzer ausgeführt. Questübersicht, Quests und Routen liefern HTTP 200 mit leerem Katalog; anonyme Profilzugriffe werden abgewiesen. Der Agent hat keine externen Schreiboperationen oder Testmails ausgeführt. Dokumentierte Einrichtung: [Einrichtung](https://github.com/carljust/app-wyldo/blob/feat/wyldo-supabase-auth/docs/implementation/phase3/SETUP.md).

Offen: echte getrennte Auth-Konten, Magic-Link-Zustellung/Session-Neustart, Google-Provider/Redirects, Storage-HTTP-Dateien sowie native Geräteprüfung. Die lokale PostgreSQL-Prüfung simuliert Auth-Claims und Storage-Metadaten und ersetzt keine vollständige Supabase-Live-Abnahme. Kein produktiver Queststart, kein XP-Endpunkt und keine Outdoor-Freigabe.
