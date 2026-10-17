# Phase 4 einrichten und prüfen

## Lokale Vorschau

Bestehende ignorierte `.env.local` erhalten. Node 24 verwenden, `npm ci`, `npm run typecheck`, `npm test`, `npm run test:db`. Datenbanktests laufen ausschließlich in einem isolierten temporären PostgreSQL-Container mit lokalen Auth-/Storage-Stubs, nie im gehosteten Projekt.

```sh
CI=1 EXPO_NO_TELEMETRY=1 EXPO_OFFLINE=1 npm_config_cache=/tmp/wyldo-npm npm run web -- --host localhost --port 8083
# Zweites Terminal:
npm run test:navigation-ui
```

Dev-Vorschau Externsteine öffnen → Richtung → Startbereich simulieren → bewusst starten → Intro. Pausieren, neu laden, im Rucksack fortsetzen. Im konfigurierten Projekt bleibt die veröffentlichte Questliste korrekt leer. CI deaktiviert Watch-Modus; nach Codeänderungen den Server neu starten.

## Neue Supabase-Migration

Die bereits erfolgreich ausgeführte Foundation-Migration **nicht erneut ausführen**. Für spätere Live-Checkpoint-Synchronisierung ist ausschließlich die neue Datei nötig:

[`supabase/migrations/202610170002_navigation_checkpoints.sql`](../../../supabase/migrations/202610170002_navigation_checkpoints.sql)

Sie ergänzt eine eigene Navigations-Checkpoint-Tabelle, private Operationsbelege sowie die RPC `save_navigation_checkpoint`. Vorhandene Nutzerdaten und Questtabellen werden nicht migriert oder umgeschrieben; keine Quest wird veröffentlicht. Die Transaktion bricht bei Namenskonflikten vollständig ab. Zweck: Offline-Wiederholungen sicher quittieren, Nutzer voneinander trennen und ältere Stände am Überschreiben hindern. Keine XP-Vergabe und kein Beweis echter Standortanwesenheit.

Die Datei ist lokal mit echtem PostgreSQL/RLS getestet, aber **noch nicht im gehosteten Projekt ausgeführt**. Mit einem Publishable Key kann diese DDL nicht ausgeführt werden. Projektadministrator kann den vollständigen Inhalt einmal im Supabase SQL Editor ausführen. Keine Dateien unter `supabase/tests/` gehostet ausführen.

Danach rein lesend prüfen:

```sql
select to_regclass('public.navigation_checkpoints') as checkpoint_table;
select p.proname, pg_get_function_identity_arguments(p.oid) as arguments
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname='save_navigation_checkpoint';
select relrowsecurity from pg_class where oid='public.navigation_checkpoints'::regclass;
```

Erwartet: Tabelle vorhanden, eine RPC mit sieben Argumenten einschließlich `p_owner_id`, RLS `true`. Das bestätigt nur die Installation. Echter Live-Sync braucht zusätzlich reale Anmeldung und eine separat feldgeprüfte, veröffentlichte Quest samt Route. Externsteine dafür nicht umdeklarieren.

Ohne neue RPC funktioniert die Dev-Simulation unverändert lokal. Für berechtigte Live-Sitzungen bleiben Checkpoints bei Fehlern in der Outbox. Niemals Service-Role-Schlüssel im Client hinterlegen.
