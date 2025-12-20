# CLAUDE.md

This file provides context for AI assistants working with this codebase.

## Project Overview

**BBL Immobilienportfolio - GIS POC** is a single-page web application for visualizing and managing the Swiss Federal Office of Buildings and Logistics (BBL) real estate portfolio. It's a proof-of-concept demonstrating GIS capabilities with an interactive map-based interface.

**Live Demo**: https://davras5.github.io/gis-immo/

## Tech Stack

- **Vanilla JavaScript** (ES6+) - No frameworks
- **CSS3** with CSS custom properties (design tokens)
- **HTML5**
- **Mapbox GL JS** v3.4.0 - Map rendering
- **Material Symbols** - Icons
- **Swisstopo APIs** - Swiss location search

No build tools, bundlers, or package managers are used. Pure static files.

## Quick Start

```bash
# Start any static file server
python -m http.server 8000
# or
npx http-server
# or
php -S localhost:8000

# Open http://localhost:8000
```

## Project Structure

```
gis-immo/
├── index.html          # Main HTML (1,133 lines)
├── js/app.js           # All application logic (2,804 lines)
├── css/main.css        # All styles with design tokens (3,460 lines)
├── data/               # JSON/GeoJSON data files
│   ├── buildings.geojson   # Core building data
│   ├── area-measurements.json
│   ├── documents.json
│   ├── contacts.json
│   ├── contracts.json
│   ├── costs.json
│   └── assets.json
└── documentation/      # Developer guides
    ├── DATAMODEL.md    # Entity schemas
    ├── DESIGNGUIDE.md  # Design system
    └── DESIGN_REVIEW.md
```

## Key Files

| File | Purpose |
|------|---------|
| `js/app.js` | All JS logic - data loading, views, filters, map, search, export |
| `css/main.css` | Design tokens at `:root`, all component styles |
| `index.html` | HTML structure, external CDN imports |
| `data/buildings.geojson` | Primary building data with coordinates |

## Code Conventions

### JavaScript
- **Naming**: camelCase for variables/functions
- **Organization**: Grouped by feature with comment headers like `// ===== FILTER STATE =====`
- **Data**: GeoJSON features with `properties` containing building data
- **Views**: Tracked via `currentView` variable, URL-based navigation
- **Error handling**: `fetchWithErrorHandling()` wrapper, toast notifications

### CSS
- **Design Tokens**: All values as CSS custom properties in `:root`
  - Colors: `--grey-900` to `--grey-50`, `--blue-600`, status colors
  - Typography: `--text-xs` to `--text-2xl` (1.25 ratio scale)
  - Spacing: 4px base unit (`--space-1` to `--space-16`)
  - Radii: `--radius-sm`, `--radius-md`, `--radius-lg`
- **Class naming**: kebab-case (`.search-container`, `.filter-pane`)
- **State classes**: `.active`, `.hidden`, `.disabled`
- **Layout**: Flexbox and CSS Grid, no CSS frameworks

### HTML
- **Language**: German (`lang="de"`)
- **IDs**: Prefixed descriptively (`#search-input`, `#map-view`)

## Key Patterns

### View System
Three main views: Map, List (table), Gallery. Detail view as overlay.
```javascript
currentView // 'map' | 'list' | 'gallery'
showView(viewName) // Switch views
showDetailView(buildingId) // Open detail overlay
```

### Filter System
Six filter categories: Status, Ownership, Portfolio, Building Type, Country, Region.
```javascript
activeFilters // Object with filter state
applyFilters() // Apply and update URL
```

### Data Loading
All data loaded at startup via parallel `fetch()` calls:
```javascript
Promise.all([
  fetch('data/buildings.geojson'),
  fetch('data/area-measurements.json'),
  // ... other data files
])
```

### URL State
Filters and view state persisted in URL query params for deep linking.

## External APIs

| API | Purpose | Auth |
|-----|---------|------|
| Mapbox GL JS | Map rendering | Token in app.js (public) |
| Swisstopo Search | Swiss location search | None (public) |
| Swisstopo Geokatalog | Layer catalog | None (public) |

## Swiss Standards

- **SIA 416**: Building area measurements (BGF, NGF, EBF)
- **EGID**: Federal Building Identifier
- **EGRID**: Federal Property Identifier
- **SN 506 511**: Building cost classification

## Testing

No automated tests configured. Manual testing only.

To test manually:
- Check all views (Map, List, Gallery, Detail)
- Test filters and search
- Test export (CSV, Excel, GeoJSON)
- Test responsive design
- Check browser console for errors

## Deployment

GitHub Pages with automatic deployment on push to `main` branch.

## Common Tasks

### Adding a new building
1. Add feature to `data/buildings.geojson` with coordinates and properties
2. Add related data to other JSON files (measurements, documents, etc.)

### Modifying styles
1. Use existing design tokens from `css/main.css` `:root` section
2. Prefer tokens over hardcoded values for consistency

### Adding new filter category
1. Add filter config in `js/app.js` `filterConfig` object
2. Add filter UI in `index.html` filter pane
3. Update `applyFilters()` function

### Adding new data entity
1. Create JSON file in `data/` directory
2. Add fetch in data loading section
3. Create entity table config in `entityTabConfigs`
4. Add tab in detail view HTML

## Important Notes

- **No build step**: Edit files directly, refresh browser
- **Mapbox token**: Hardcoded in `app.js` line 5 (public token is acceptable)
- **Language**: UI is in German (Deutsch)
- **Number format**: Swiss German (`de-CH`)
- **Monolithic files**: All JS in one file, all CSS in one file
- **Client-side only**: No backend, all data in static JSON files
