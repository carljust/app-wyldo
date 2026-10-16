# Supabase verbinden · Phase 3

Projekt: `https://sfijiillaiojpceginvj.supabase.co`. Der Nutzer hat den öffentlichen Publishable Key bereitgestellt; er liegt nur in der ignorierten lokalen Konfiguration, nicht in dieser Anleitung. Kein Service-Role-/Server-Key gehört in die App.

## Verifizierter Projektzustand

- `GET /auth/v1/settings` mit dem bereitgestellten öffentlichen Key: **HTTP 200**, E-Mail aktiviert, Google deaktiviert, Registrierung erlaubt.
- `GET /rest/v1/quest_summaries?select=id&limit=1`: **HTTP 404, PGRST205**. Die Wyldo-Übersicht existiert noch nicht.
- Keine Schreibanfrage, keine Testmail, kein OAuth-Login und keine externe Migration durch den Agenten ausgeführt.

## Datenbank im vorhandenen Projekt vorbereiten

1. In Supabase den SQL Editor des genannten Projekts öffnen und zuerst [PREFLIGHT.sql](../../../supabase/PREFLIGHT.sql) ausführen. Das ist eine reine Metadatenprüfung. Bei Ergebnissen **stoppen und Objektnamen klären**, nichts löschen oder vorhandene App-Tabellen ersetzen.
2. Nur bei kollisionsfreiem Projekt die vollständige [Migration](../../../supabase/migrations/202610170001_foundation.sql) als einen SQL-Lauf ausführen. Die Migration ist ausdrücklich mit `BEGIN`/`COMMIT` abgesichert; ein Konflikt bricht ab. Sie legt Tabellen, RLS, Profiltrigger, eine reine Summary-Ansicht und den privaten Storage-Bucket `wyldo-quest-media` an. Ungeprüfte Externsteine-Inhalte werden nicht veröffentlicht oder als Seed eingetragen.
3. Zurückmelden, dass die Migration ausgeführt wurde. Danach lässt sich das echte Leseverhalten und die Trennung tatsächlicher Testkonten prüfen. Der Publishable Key erlaubt keine DDL; die Migration kann damit nicht vom Client aus ausgeführt werden.

Die lokalen Sicherheitstests verwenden echten PostgreSQL 17 mit minimalen lokalen Auth-/Storage-Schema-Stubs. Sie beweisen Datenbankregeln, **keinen** vollständig gestarteten Supabase-Auth-/Storage-Stack. Die SQL-Tests sind Testfixtures und dürfen nicht im Produktivprojekt ausgeführt werden.

## App-Konfiguration

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://sfijiillaiojpceginvj.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
EXPO_PUBLIC_GOOGLE_AUTH_ENABLED=false
```

Die vorhandene `.env.local` enthält bereits den bereitgestellten öffentlichen Key und wird von Git ignoriert. Für spätere Umgebungen die entsprechenden Variablen in den Umgebungseinstellungen setzen. Nach Änderungen Expo neu starten. Öffentliche Expo-Variablen werden in den Client-Build eingebettet. Serverseitige Secrets sind dafür nicht geeignet.

Bei vollständiger Konfiguration lädt Entdecken den Supabase-Katalog. Backendfehler werden angezeigt, **nicht** durch Testquests verdeckt. Ohne Konfiguration bleibt der klar beschriftete Fixture-Katalog als Designvorschau nutzbar. Die Externsteine-Dev-Vorschau bleibt gesondert und durch `__DEV__` geschützt.

## E-Mail und Google

- In Supabase unter Authentication → URL Configuration die tatsächlich verwendeten Web-Callbackadressen sowie `wyldo://auth/callback` für den nativen Development Build eintragen. Keine offenen Wildcards für Produktiv-Redirects. Der Code verwendet exakt `/auth/callback` auf dem Web-Origin und den registrierten `wyldo`-Scheme auf dem Gerät.
- E-Mail nutzt Supabase Magic Link mit PKCE. Der Link muss auf demselben Gerät/Browser geöffnet werden, das ihn angefordert hat. Die App erstellt bei der ersten E-Mail-Anmeldung ein Konto; sie richtet sich an erwachsene Begleitpersonen. Echtes E-Mail-Zustellverhalten und Session-Wiederherstellung sind noch zu testen.
- Google ist im Projekt nachweislich deaktiviert. Provider im Supabase-Dashboard mit den eigenen Google-OAuth-Daten einrichten; Client Secret bleibt dort. Die von Supabase angezeigte Provider-Callbackadresse in der Google Console registrieren. Erst danach `EXPO_PUBLIC_GOOGLE_AUTH_ENABLED=true` setzen und den echten Flow testen.
- Native OAuth-Redirects erfordern einen Development Build; Expo Go ist hier nicht als funktionierender OAuth-Client geprüft.
- Native Sessionpersistenz verwendet Expo SecureStore, Web verwendet Same-Origin-localStorage. Native PKCE erhält CSPRNG und SHA-256 über Expo Crypto, damit keine Math.random-/Plain-PKCE-Fallbacks verwendet werden. SecureStore-Speicherlimits und echte große Sessions auf iOS/Android sind noch nicht auf Geräten geprüft.

## Lokale Prüfungen

```sh
npm run typecheck
npm test
npm run test:db
npm run format:check
```

`test:db` startet einen isolierten PostgreSQL-17-Container ohne Netzwerkzugriff und ohne freigegebene Ports, mit flüchtigem tmpfs-Datenverzeichnis. Das nur dort verwendete Trust-Login ist nicht über das Hostnetz erreichbar. Der Container wird am Testende entfernt. Docker-Image per SHA-256-Digest festgeschrieben.

Für Konfigurationsfehler-/Fixture-Browsertests `npm run test:fixture-ui` ausführen. Port 8081 muss frei sein. Der Helfer sichert `.env.local` im selben Verzeichnis unter einem ignorierten, vorher auf Existenz geprüften Backupnamen, startet ohne Backendkonfiguration einen eigenen Testserver und stellt Datei und Prozesse im `finally`-Block wieder her. Zusätzliche echte dotenv-Dateien führen zum sicheren Abbruch. Verschiedene Backendkonfigurationen nicht parallel im selben Expo-Checkout starten; die transformierte Umgebung kann sonst aus dem gemeinsamen Cache übernommen werden. Für die konfigurierte Ansicht anschließend einen eigenen Server auf 8083 starten; `npm run test:backend-ui` prüft dort ausschließlich Lesefehler/Bedienzustände und versendet keine E-Mail.

Live-Login, tatsächliche Storage-Dateien, serverseitige Sessionanlage, Quest-Engine, XP-Vergabe und Offline-Synchronisierung werden nicht durch diese Prüfungen als fertig bezeichnet.
