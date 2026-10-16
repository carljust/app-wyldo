# Regeln für Codex und weitere Coding-Agenten

- **Source of truth:** Lies `docs/master/12_ENTSCHEIDUNGEN_V1_2.md` und die übrigen Masterspezifikationen. Bei Widerspruch haben die neueren V1.2-Dateien Vorrang vor V1.1, dann V1.1 vor V1.0; innerhalb V1.2 gelten Sicherheits-/Datenschutzanforderungen immer.
- **Neustart:** Keine Migration, kein Copy-Paste und keine UI-/Architektur-Übernahme aus `wanderquest`, außer der Nutzer genehmigt es ausdrücklich später.
- **Design:** Adult-friendly, kinderzugängliches hochwertiges Adventure-Game. Original-Wyldo aus `docs/master/design/fox/`; PNG ist kein Animator-Rig. Nicht eigenständig andersartige Fuchsfigur erfinden.
- **Karten:** Globale Karte = exakt EIN Startpin je Quest. Detailkarte = kompletter vorhandener GPX-Track. Aktive Navigation = eigener Bildschirm. Vertrauliche/ungeprüfte Stationen auf öffentlicher Karte NIE zeigen.
- **Rätsel:** Lösung in der realen Umgebung suchen. Keine obligatorischen Trivia-Quizze, keine komplett am Bildschirm lösbaren Ersatzaufgaben. Unverifizierte Rätsel nur als ausdrücklich beschriftete Simulation.
- **GPS-Sicherheit:** Eine GPX-Kurve erlaubt keine Aussage über Sicht auf Felsen, Bäume, Kästen oder tatsächliche Sicherheit. Keine fiktiven Live-Ankünfte oder bestätigten Wegpunkte. Kein Abkürzen durch Naturgebiete.
- **Security:** Kein Supabase `service_role` im Client. RLS, serverseitig idempotente XP-Vergabe, keine Lösungen im öffentlich ausgelieferten Content, Schutz vor Replay/Offline-Doppelvergaben.
- **Lieferung:** Jede Phase mit echten Screenshots, Befehlen/Testresultaten, Abweichungsliste, offenen Punkten. Keine Tests oder Features als bestanden behaupten, die nicht ausgeführt wurden.
- **Stop-Gate:** Zuerst nur Phase 1–2, danach **STOP und Nutzerfreigabe** vor Backend, Questengine, Livesystem und Produktiv-Track.
