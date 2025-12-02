# CLAUDE.md - BBL GIS Immobilienportfolio

## Projektübersicht

**BBL Immobilienportfolio - GIS POC** ist eine Single-Page-Web-Anwendung zur Verwaltung und Visualisierung des Schweizer Immobilienportfolios des Bundesamt für Bauten und Logistik (BBL).

**Live-Demo:** https://davras5.github.io/gis-immo/

### Hauptfunktionen
- Interaktive Kartenvisualisierung von Liegenschaften weltweit
- Vier Anzeigemodi: Map, List, Gallery, Detail
- Detailansicht mit Stammdaten, Flächenbemessungen, Energiedaten
- Ortssuche via Swisstopo API
- URL-basierte Navigation

## Tech-Stack

| Technologie | Version | Verwendung |
|-------------|---------|------------|
| Vanilla JavaScript | ES6+ | Anwendungslogik |
| Mapbox GL JS | v3.4.0 | Kartenvisualisierung |
| CSS3 | - | Styling (Flexbox, CSS Variables) |
| GeoJSON | - | Datenformat |
| Swisstopo API | - | Ortssuche |

**Wichtig:** Keine Build-Tools, keine Frameworks - reine statische Dateien.

## Projektstruktur

```
gis-immo/
├── index.html              # Komplette App (HTML + CSS + JavaScript)
├── data/
│   └── buildings.geojson   # Portfolio-Daten (10 Gebäude)
├── assets/
│   └── images/             # Preview-Screenshots
├── README.md               # Projektdokumentation
└── CLAUDE.md               # Diese Datei
```

## Lokale Entwicklung

```bash
# Python
python -m http.server 8000

# Node.js
npx http-server

# PHP
php -S localhost:8000
```

Dann http://localhost:8000 öffnen.

## Wichtige Konfiguration

### Mapbox Token (index.html:1979)
```javascript
mapboxgl.accessToken = 'pk.eyJ1IjoiZGF2aWRyYXNuZXI1IiwiYSI6...'
```

### CSS Variables (index.html:15-25)
```css
:root {
    --grey-900: #333;
    --grey-600: #666;
    --primary-red: #c00;
    --accent-panel: #6B747C;
}
```

### Status-Farben
| Status | Farbe |
|--------|-------|
| In Betrieb | `#2e7d32` (Grün) |
| In Renovation | `#f57c00` (Orange) |
| In Planung | `#1976d2` (Blau) |
| Ausser Betrieb | `#757575` (Grau) |

## Datenmodell (buildings.geojson)

### Gebäude-Properties
```javascript
{
  id: "BBL-001",              // Eindeutige ID
  name: "Bundeshaus West",    // Name
  adresse: "...",             // Vollständige Adresse
  ort: "Bern",                // Stadt
  land: "CH",                 // Ländercode
  teilportfolio: "...",       // Kategorie
  flaeche_ngf: 12500,         // Nutzfläche m²
  status: "In Betrieb",       // Status
  baujahr: 1902,              // Baujahr
  energieklasse: "C",         // A-E
  bemessungen: [...]          // Flächenmessungen
}
```

### Bemessungen-Array
```javascript
{
  id: "BBL-001-M1",
  areaType: "Bruttogeschossfläche",
  value: 15000,
  unit: "m²",
  accuracy: "Gemessen|Berechnet|Geschätzt",
  standard: "SIA 416|DIN 277",
  source: "CAD/BIM|Vermessung",
  validFrom: "15.03.2019",
  validUntil: null
}
```

## Code-Konventionen

### JavaScript
- **Variablen:** `var` (kein const/let)
- **Funktionen:** camelCase (`switchView`, `renderListView`)
- **DOM-Zugriff:** `document.getElementById()`
- **Event-Handler:** `addEventListener` Pattern

### CSS
- **Classes:** kebab-case (`.gallery-card`, `.status-badge`)
- **IDs:** kebab-case (`#map-view`, `#info-panel`)
- **Layout:** Flexbox, CSS Grid für Galerie

### HTML
- **Data-Attributes:** `data-view`, `data-id`, `data-sort`
- **Semantische Tags:** `<header>`, `<main>`, `<nav>`, `<aside>`

## Wichtige Funktionen

### View-Management
```javascript
switchView(view)      // Wechselt zwischen map/list/gallery/detail
showDetailView(id)    // Öffnet Detail-Ansicht für Gebäude
setViewInURL(view)    // Speichert View in URL
```

### Daten-Rendering
```javascript
renderListView()            // Rendert Tabellen-Ansicht
renderGalleryView()         // Rendert Galerie-Ansicht
renderMeasurementsTable()   // Rendert Bemessungen-Tab
```

### Karte
```javascript
addMapLayers()        // Fügt GeoJSON-Layer hinzu
selectBuilding(id)    // Wählt Gebäude auf Karte
initMiniMap()         // Initialisiert 3D-Mini-Karte
```

### Suche
```javascript
performSearch(query)      // Führt lokale + API-Suche durch
renderSearchResults()     // Zeigt Suchergebnisse
handleSearchClick(type, id)  // Globale Handler-Funktion
```

## Hinweise für Entwicklung

1. **Single-File-Architektur:** Alle Änderungen erfolgen in `index.html`
2. **Kein Build:** Änderungen sind sofort sichtbar nach Reload
3. **Mapbox-Abhängigkeit:** WebGL erforderlich, Token muss gültig sein
4. **Daten:** GeoJSON wird lokal von `/data/buildings.geojson` geladen
5. **URL-State:** View wird in URL gespeichert (`?view=list`)
6. **LocalStorage:** Map-Style wird persistent gespeichert

## Schweizer Standards

- **SIA 416:** Schweizer Norm für Flächen im Hochbau
- **EGID:** Eidgenössischer Gebäudeidentifikator
- **EGRID:** Eidgenössischer Grundstücksidentifikator
- **Swisstopo:** Schweizer Geodaten-API

## Deployment

GitHub Pages: Push zu `main` deployt automatisch.

Alternativ: Beliebiger Static Host (Netlify, Vercel, Apache, Nginx).
