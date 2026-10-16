# Neue Abnahmekriterien V1.2 – globaler Quest-Pin und Detail-Routenkartenausschnitt

## Design-/UI-Abnahme (Gate 2)
1. Neue Expo-App aus leerem Projekt, **keine alten Komponenten importiert**.
2. Entdecken, Karte, Rucksack, Profil als echte 4 Tabs zugänglich.
3. Allgemeiner Karte-Tab: pro veröffentlichter Testquest **exakt ein Pin an deren Startort**, auch wenn mehrere Stationen in Fixture gespeichert sind.
4. Pin antippen öffnet Quest-Vorschau; `Quest entdecken` führt zur richtigen Detailseite. Auch zwei Quests unabhängig testen.
5. **Keine Routenlinien oder GPS-Stationsmarker** auf globaler Quest-Karte; Cluster bei eng nebeneinanderliegenden Pinpositionen.
6. Quest-Detailseite: **vollständige gespeicherte GeoJSON-/GPX-Polyline**, keine gezeichnete Luftlinie zwischen Kandidatenstationen. Map fit-to-bounds bei zwei Bildschirmgrößen.
7. OH!6-Rundweg zeigt **einen gemeinsamen Start/Zielmarker**, keine doppelt übereinanderliegenden Marker.
8. 8 noch ungeprüfte Stationen werden weder auf allgemeiner noch Detailkarte verraten.
9. Route wird als `Entwurf – noch nicht vor Ort geprüft` gezeigt; keine Möglichkeit zur Produktiv-Questaktivierung.
10. Startnavigation: Karte und Richtung umschaltbar, Richtungsdistanz als **Luftlinie**, nicht Gehstrecke; keine erfundenen Wegabbieger.
11. Fehlende Standortberechtigung, keine Route, fehlende Kacheln, Offline, langsame Ladezustände sinnvoll dargestellt; keine Fake-Karte als erfolgreiche Onlinekarte.
12. Screenshotvergleich zu `design/mockups/01...03` plus 12-Screen-Storyboard; bekannte Unterschiede auflisten.
13. iPhone-groß (390×844), Standard-Android (360×800), klein (320×640) – responsive, keine horizontalen Überläufe.
14. UI-Elemente funktional oder klar als in dieser Phase deaktivierte Vorschau ausgewiesen.
15. Bereits in Phase 2 offene Live-Funktionen nicht als implementiert oder verifiziert behaupten.

## Automatische Tests (mindestens)
- `one published quest → one global start pin`; `draft quest → zero public pins`.
- `two quests → independent previews and correct detail route`.
- `global map shows no polylines or stage pins`.
- `detail page projects whole LineString`, including track segments and bends.
- `start ≈ end → merged start/finish pin`.
- `missing route → empty/error state, never synthetic route`.
- `navigation direction distance is air distance and labelled as such`.
- `unverified stage coordinates are absent from publishable content`.

## Abnahmeprotokoll
Für jeden PR: Branch, Commit, Screenshots, gebaute Ansicht, Tests (Befehl+Ergebnis), ungeprüfte Plattformen, fehlende Assets/Konfiguration, Abweichungen gegen Mockups, Link zur Dokumentation. **STOP nach dieser Phase; nächster Schritt braucht explizite Freigabe.**
