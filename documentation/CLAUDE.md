# CLAUDE.md - BBL GIS Immobilienportfolio

## Projektübersicht

**BBL Immobilienportfolio - GIS POC** ist eine Single-Page-Web-Anwendung zur Verwaltung und Visualisierung des Schweizer Immobilienportfolios des Bundesamt für Bauten und Logistik (BBL).

**Live-Demo:** https://davras5.github.io/gis-immo/

### Hauptfunktionen
- Interaktive Kartenvisualisierung mit 3 Kartenstilen (Light, Standard, Satellite)
- Vier Anzeigemodi: Map, List, Gallery, Detail
- Detailansicht mit 7 Tabs: Übersicht, Bemessungen, Dokumente, Kosten, Verträge, Kontakte, Ausstattung
- Ortssuche via Swisstopo API
- URL-basierte Navigation mit Deep-Linking
- Export-Funktionen (CSV, Excel, GeoJSON)
- Responsive Design mit Accessibility-Features

## Tech-Stack

| Technologie | Version | Verwendung |
|-------------|---------|------------|
| Vanilla JavaScript | ES6+ | Anwendungslogik |
| Mapbox GL JS | v3.4.0 | Kartenvisualisierung mit WebGL |
| CSS3 | - | Styling (Flexbox, Grid, CSS Variables) |
| GeoJSON | - | Datenformat für Geodaten |
| Swisstopo API | v3 | Ortssuche (Locations + Layers) |
| Geo Admin API | - | Schweizer Geodaten-Katalog |
| Material Symbols | Google Fonts | Icon-Bibliothek |

**Wichtig:** Keine Build-Tools, keine Frameworks - reine statische Dateien.

## Projektstruktur

```
gis-immo/
├── index.html                    # HTML-Struktur (~1,100 Zeilen)
├── js/
│   └── app.js                    # Anwendungslogik (~2,800 Zeilen)
├── css/
│   └── main.css                  # Styles & Design-System (~3,400 Zeilen)
├── data/
│   ├── buildings.geojson         # Portfolio-Daten (10+ Gebäude)
│   ├── area-measurements.json    # Flächenmessungen nach SIA 416
│   ├── documents.json            # Pläne, Zertifikate, Genehmigungen
│   ├── contacts.json             # Personal & Ansprechpartner
│   ├── contracts.json            # Service- und Wartungsverträge
│   ├── costs.json                # Betriebskosten
│   └── assets.json               # Ausstattung & Inventar
├── assets/
│   └── images/
│       ├── preview1.jpg          # Screenshot Map-View
│       ├── preview2.jpg          # Screenshot List-View
│       └── preview3.jpg          # Screenshot Detail-View
├── documentation/
│   ├── CLAUDE.md                 # Diese Datei
│   ├── DATAMODEL.md              # Detailliertes Datenmodell
│   └── DESIGNGUIDE.md            # Design-System & Komponenten
├── README.md                     # Projekt-README
└── LICENSE                       # MIT-Lizenz
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

### Browser-Anforderungen
- WebGL-Unterstützung (für Mapbox GL JS)
- ES6+ JavaScript
- LocalStorage
- Modernes CSS (Grid, Flexbox, Variables)

## Wichtige Konfiguration

### Mapbox Token (js/app.js, Zeile 5)
```javascript
mapboxgl.accessToken = 'pk.eyJ1IjoiZGF2aWRyYXNuZXI1IiwiYSI6...'
```

### Status-Farben (js/app.js, Zeilen 8-13)
```javascript
var statusColors = {
    'In Betrieb': '#2e7d32',        // Grün - aktiv
    'In Renovation': '#ef6c00',     // Orange - in Renovation
    'In Planung': '#1976d2',        // Blau - geplant
    'Ausser Betrieb': '#6C757D'     // Grau - inaktiv
};
```

### CSS Design-System (css/main.css, Zeilen 5-99)
```css
:root {
    /* Farben */
    --primary-red: #c00;
    --grey-900: #2D3236;
    --accent-panel: #6C757D;

    /* Status-Farben */
    --status-active: #2e7d32;      /* Grün - In Betrieb */
    --status-renovation: #ef6c00;   /* Orange - In Renovation */
    --status-planning: #1976d2;     /* Blau - In Planung */
    --status-inactive: #6C757D;     /* Grau - Ausser Betrieb */

    /* Typografie */
    --text-xs: 0.75rem;
    --text-sm: 0.875rem;
    --text-base: 1rem;
    --text-lg: 1.125rem;
    --text-xl: 1.25rem;
    --text-2xl: 1.5rem;

    /* Spacing */
    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-4: 1rem;
    --space-8: 2rem;

    /* Radien & Touch Targets */
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --touch-target-min: 44px;
}
```

### Status-Farben Übersicht
| Status | Farbe | CSS Variable |
|--------|-------|--------------|
| In Betrieb | `#2e7d32` (Grün) | `--status-active` |
| In Renovation | `#ef6c00` (Orange) | `--status-renovation` |
| In Planung | `#1976d2` (Blau) | `--status-planning` |
| Ausser Betrieb | `#6C757D` (Grau) | `--status-inactive` |

## Datenmodell

Siehe [DATAMODEL.md](./DATAMODEL.md) für das vollständige Datenmodell.

### Daten-Dateien

| Datei | Beschreibung | Schlüsselfelder |
|-------|--------------|-----------------|
| `buildings.geojson` | Hauptdaten der Gebäude | buildingId, name, status, geometry |
| `area-measurements.json` | Flächenmessungen | areaMeasurementId, type, value, unit |
| `documents.json` | Dokumente & Pläne | documentId, name, type, fileFormat |
| `contacts.json` | Ansprechpersonen | contactId, name, role, email |
| `contracts.json` | Verträge | contractId, type, contractPartner, status |
| `costs.json` | Betriebskosten | costId, costGroup, amount |
| `assets.json` | Ausstattung | assetId, name, category, manufacturer |

### Gebäude-Entity (Hauptfelder in buildings.geojson)
```javascript
{
  // Identifikation
  buildingId: "BBL-001",
  siteId: "SITE-BBL-001",
  name: "Bundeshaus West",

  // Klassifizierung
  primaryTypeOfBuilding: "Bürogebäude",
  secondaryTypeOfBuilding: "Parlamentsgebäude",
  typeOfOwnership: "Eigentümer",
  status: "In Betrieb",

  // Adresse
  streetName: "Bundesplatz 3, 3003 Bern",
  houseNumber: "3",
  postalCode: "3003",
  city: "Bern",
  stateProvincePrefecture: "Kanton Bern",
  country: "CH",

  // Konstruktion
  constructionYear: "1902-01-01T00:00:00Z",
  yearOfLastRefurbishment: "2019-01-01T00:00:00Z",

  // Technisch
  energyEfficiencyClass: "C",
  monumentProtection: true,
  parkingSpaces: 45,
  electricVehicleChargingStations: 8,

  // Schweizer Erweiterungen
  extensionData: {
    egid: "301001234",
    egrid: "CH123456789012",
    numberOfFloors: 5,
    responsiblePerson: "Anna Müller",
    portfolio: "Verwaltungsgebäude",
    portfolioGroup: "Bundesverwaltung",
    heatingGenerator: "Fernwärme",
    heatingSource: "Fernwärmenetz Stadt Bern",
    netFloorArea: 12500,
    plotName: "Bundesplatz Parzelle A",
    plotId: "BE-3003-1001"
  },

  // Geometrie (GeoJSON Point)
  geometry: {
    type: "Point",
    coordinates: [7.4441, 46.9465]
  }
}
```

## View-System

### Vier Hauptansichten

| View | URL-Parameter | Beschreibung |
|------|---------------|--------------|
| **Map** | `?view=map` | Interaktive Karte mit Gebäude-Markern |
| **List** | `?view=list` | Sortierbare Tabelle mit Export |
| **Gallery** | `?view=gallery` | Karten-Grid mit Vorschaubildern |
| **Detail** | `?view=detail&buildingId=BBL-001` | Detailansicht mit Tabs |

### Detail-View Tabs
1. **Übersicht** - Stammdaten, Bild-Carousel, Mini-Karte
2. **Bemessungen** - Flächentabelle nach SIA-Standards
3. **Dokumente** - Grundrisse, Pläne, GEAK-Zertifikate
4. **Kosten** - Betriebskosten nach Kostengruppen
5. **Verträge** - Wartungs-, Reinigungs-, Sicherheitsverträge
6. **Kontakte** - Objektverantwortliche, Hauswart, etc.
7. **Ausstattung** - Gebäudetechnik und Inventar

## Externe APIs

### Swisstopo Location Search
```
GET https://api3.geo.admin.ch/rest/services/ech/SearchServer
?type=locations&limit=5&sr=4326&searchText=<query>&lang=de
```

### Swisstopo Layer Search
```
GET https://api3.geo.admin.ch/rest/services/ech/SearchServer
?type=layers&limit=5&lang=de&searchText=<query>
```

### Mapbox Map Tiles
```
https://api.mapbox.com/mapbox-gl-js/v3.4.0/
Styles: light-v11, standard-v12, satellite-v9
```

## Code-Konventionen

### JavaScript (js/app.js)
- **Variablen:** `var` (Legacy-Kompatibilität)
- **Funktionen:** camelCase (`switchView`, `renderListView`)
- **DOM-Zugriff:** `document.getElementById()`
- **Event-Handler:** `addEventListener` Pattern
- **Globale State:** `portfolioData`, `filteredData`, `selectedBuildingId`

### CSS (css/main.css)
- **Classes:** kebab-case (`.gallery-card`, `.status-badge`)
- **IDs:** kebab-case (`#map-view`, `#info-panel`)
- **Layout:** Flexbox für 1D, CSS Grid für 2D
- **Variables:** Alle Design-Tokens in `:root`

### HTML (index.html)
- **Data-Attributes:** `data-view`, `data-id`, `data-sort`, `data-filter`
- **Semantische Tags:** `<header>`, `<main>`, `<nav>`, `<aside>`, `<section>`
- **Accessibility:** `role`, `aria-label`, `tabindex`

## Wichtige Funktionen (js/app.js)

### View-Management
```javascript
switchView(view)              // Wechselt zwischen map/list/gallery/detail
showDetailView(id)            // Öffnet Detail-Ansicht für Gebäude
setViewInURL(view)            // Speichert View in URL
getViewFromURL()              // Liest View aus URL
getBuildingIdFromURL()        // Liest Building-ID aus URL
```

### Daten-Rendering
```javascript
renderListView()              // Rendert Tabellen-Ansicht
renderGalleryView()           // Rendert Galerie-Karten
renderMeasurementsTable()     // Rendert Bemessungen-Tab
renderDocumentsTable()        // Rendert Dokumente-Tab
renderContactsTable()         // Rendert Kontakte-Tab
renderContractsTable()        // Rendert Verträge-Tab
renderFacilitiesTable()       // Rendert Ausstattung-Tab
```

### Karte
```javascript
addMapLayers()                // Fügt GeoJSON-Layer zur Karte hinzu
selectBuilding(id)            // Wählt Gebäude auf Karte
flyToBuilding(id)             // Fliegt zu Gebäude
initMiniMap()                 // Initialisiert Mini-Karte in Detail-View
setMapStyle(style)            // Wechselt Kartenstil
```

### Filter & Suche
```javascript
applyFilters()                // Wendet alle aktiven Filter an
initFilterOptions()           // Initialisiert Filter-Dropdowns
performSearch(query)          // Führt lokale + API-Suche durch
renderSearchResults()         // Zeigt Suchergebnisse an
handleSearchClick(type, id)   // Globale Handler für Suchergebnisse
```

### Export
```javascript
exportToCSV()                 // Exportiert gefilterte Daten als CSV
exportToJSON()                // Exportiert gefilterte Daten als JSON (GeoJSON)
```

## Accessibility-Features

- **Skip-Links** für Tastaturnavigation
- **Focus-Visible Styles** für Tastaturbenutzer
- **WCAG Farbkontrast** für Lesbarkeit
- **Semantisches HTML** für Screen Reader
- **Touch-Target Minimum** 44px für Mobile
- **ARIA-Labels** für interaktive Elemente

## Hinweise für Entwicklung

1. **Getrennte Dateien:** HTML in `index.html`, JavaScript in `js/app.js`, CSS in `css/main.css`
2. **Kein Build:** Änderungen sind sofort sichtbar nach Browser-Reload
3. **Mapbox-Abhängigkeit:** WebGL erforderlich, Token muss gültig sein
4. **Daten:** GeoJSON und JSON-Dateien werden bei Seitenladung von `/data/` geladen
5. **URL-State:** View und Building-ID werden in URL gespeichert
6. **LocalStorage:** Map-Style wird persistent gespeichert

### Code-Struktur
| Datei | Zeilen | Inhalt |
|-------|--------|--------|
| `index.html` | ~1,100 | HTML-Struktur, CDN-Links |
| `js/app.js` | ~2,800 | Anwendungslogik |
| `css/main.css` | ~3,400 | Design-System, Komponenten-Styles |

## Schweizer Standards

| Standard | Beschreibung |
|----------|--------------|
| **SIA 416** | Schweizer Norm für Flächen und Volumen im Hochbau |
| **SIA 380/1** | Energiebedarf von Gebäuden |
| **EGID** | Eidgenössischer Gebäudeidentifikator |
| **EGRID** | Eidgenössischer Grundstücksidentifikator |
| **LV95** | Schweizer Koordinatenreferenzsystem |
| **Swisstopo** | Bundesamt für Landestopografie |
| **SN 506 511** | Baukostenplan Schweiz |

## Deployment

**GitHub Pages:** Push zu `main` deployt automatisch nach https://davras5.github.io/gis-immo/

**Alternativ:** Beliebiger Static Host (Netlify, Vercel, Apache, Nginx, CloudFlare).

**Performance:**
- Total: ~7,300 Zeilen Code (HTML + JS + CSS)
- Daten: 7 JSON-Dateien mit ~145 KB
- Schnelle Ladezeiten mit GZIP-Komprimierung
- Client-seitiges Filtern ohne Netzwerk-Calls

## Statistiken

| Metrik | Wert |
|--------|------|
| Dateien | 14 (1 HTML, 1 JS, 1 CSS, 7 JSON, 3 Images, 1 License) |
| HTML-Grösse | ~1,100 Zeilen |
| JavaScript-Grösse | ~2,800 Zeilen (~95 KB) |
| CSS-Grösse | ~3,400 Zeilen (~95 KB) |
| Daten-Grösse | ~145 KB (7 JSON-Dateien) |
| Funktionen | 50+ |
| Views | 4 (Map, List, Gallery, Detail) |
| Gebäude | 10+ mit vollständigen Daten |
| Externe APIs | 3 (Mapbox, Swisstopo x2) |
| CSS Variables | 30+ |
| Event Listeners | 54+ |
