# CLAUDE.md - AI Assistant Context

This document provides context for AI assistants working on the BBL Immobilienportfolio GIS application.

## Project Overview

**BBL Immobilienportfolio - GIS POC** is a proof-of-concept single-page web application for visualizing and managing the Swiss Federal Office of Buildings and Logistics (BBL) real estate portfolio. The application provides interactive map, table, and gallery views of federal properties.

- **Repository:** github.com/davras5/gis-immo
- **Live Demo:** davras5.github.io/gis-immo
- **Language:** German (de)
- **License:** MIT

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Vanilla JavaScript | ES6+ | Application logic |
| Mapbox GL JS | v3.4.0 | Interactive WebGL maps |
| CSS3 | Modern | Styling with CSS Variables |
| GeoJSON | Standard | Geospatial building data |
| Swisstopo API | v3 | Swiss location search |
| Material Symbols | Latest | Icon library |

**Key Characteristics:**
- No build tools or bundlers - pure static files
- No package.json or node_modules
- No framework dependencies
- Deployment via static hosting (GitHub Pages)

## Project Structure

```
gis-immo/
├── index.html              # Main HTML (1,824 lines) - all markup
├── js/
│   └── app.js              # Application logic (2,804 lines)
├── css/
│   └── main.css            # Design system (3,460 lines)
├── data/
│   ├── buildings.geojson   # Portfolio buildings (GeoJSON)
│   ├── area-measurements.json
│   ├── documents.json
│   ├── contacts.json
│   ├── contracts.json
│   ├── costs.json
│   └── assets.json
├── assets/
│   └── images/             # Preview screenshots
├── documentation/
│   ├── CLAUDE.md           # This file
│   ├── DESIGNGUIDE.md      # Design system documentation
│   └── DATAMODEL.md        # Complete entity schemas
├── README.md
└── LICENSE
```

## Architecture

### Single-File JavaScript Architecture

The application uses procedural ES6 code organized through semantic comments:

```javascript
// ===== SECTION NAME =====
```

Key sections in `js/app.js`:
1. Global state variables
2. Data fetching and initialization
3. Filter system
4. View rendering (map/list/gallery/detail)
5. Search functionality
6. Entity table factory
7. UI components (toast, loading)
8. Event listeners

### Data Flow

```
Page Load → loadAllData() [7 parallel fetches]
    ↓
Initialize filters from URL parameters
    ↓
applyFilters() → Update filteredData
    ↓
Render current view (map/list/gallery)
    ↓
Initialize event listeners
```

### Global State Variables

```javascript
portfolioData              // GeoJSON FeatureCollection
filteredData               // Filtered buildings array
currentDetailBuilding      // Currently viewed building
activeFilters              // Active filter state object
allAreaMeasurements        // Area measurements array
allDocuments               // Documents array
allContacts                // Contacts array
allContracts               // Contracts array
allAssets                  // Assets array
allCosts                   // Costs array
currentView                // 'map' | 'list' | 'gallery' | 'detail'
selectedBuildingId         // Currently selected building ID
map                        // Mapbox GL instance
miniMap                    // Detail view map instance
```

## Key Patterns

### URL State Management

The application persists state in URL parameters for deep linking:

```
?view=detail&id=BBL-001&lat=46.9465&lng=7.4441&zoom=8
?filter_status=In+Betrieb,In+Renovation&filter_land=CH
```

Key functions:
- `getFiltersFromURL()` - Parse filter state from URL
- `setFiltersInURL(filters)` - Persist filter state to URL
- `updateURLParams()` - Update map position in URL

### Filter System

6 filter categories with AND logic between categories, OR logic within:
- Status (In Betrieb, In Renovation, etc.)
- Ownership Type (Eigentum, Miete)
- Portfolio (Zivil, Militär, etc.)
- Building Type (Bürogebäude, etc.)
- Country (CH, DE, etc.)
- Region (Bern, Zürich, etc.)

### Entity Table Factory

Reusable table component for detail view tabs:

```javascript
const table = createEntityTable({
    containerId: 'container-id',
    data: dataArray,
    columns: [...],
    searchFields: [...],
    emptyMessage: 'No data found'
});
table.init();
```

### View Dirty Flags

Optimization pattern to prevent unnecessary re-renders:

```javascript
listViewDirty = false
galleryViewDirty = false
```

## Key Functions Reference

### Data Operations

| Function | Purpose |
|----------|---------|
| `fetchWithErrorHandling(url, options)` | Fetch with error handling |
| `loadAllData()` | Parallel load all data files |
| `getNestedProperty(obj, path)` | Deep property access |

### View Management

| Function | Purpose |
|----------|---------|
| `switchView(view)` | Switch between views |
| `renderListView()` | Build table rows |
| `renderGalleryView()` | Build gallery cards |
| `showDetailView(buildingId)` | Show property detail |

### Filter System

| Function | Purpose |
|----------|---------|
| `applyFilters()` | Apply filter logic |
| `getFiltersFromURL()` | Parse URL filters |
| `setFiltersInURL(filters)` | Save filters to URL |
| `updateFilterCounts()` | Update filter badges |

### UI Components

| Function | Purpose |
|----------|---------|
| `showToast(options)` | Show notification |
| `showLoadingOverlay(text)` | Show loading spinner |
| `hideLoadingOverlay()` | Hide loading spinner |
| `performSearch(term)` | Execute search (debounced) |

## Data Model

### Core Entities

1. **Building** - Main portfolio unit (GeoJSON Feature)
2. **Address** - Location information
3. **Area Measurement** - SIA 416 compliant areas
4. **Document** - Plans, permits, certificates
5. **Contact** - Personnel with roles
6. **Contract** - Service agreements
7. **Cost** - Operational expenses
8. **Asset** - Equipment inventory

### Swiss Standards

| Standard | Purpose |
|----------|---------|
| SIA 416 | Building area measurements (BGF, NGF, EBF) |
| SIA 380/1 | Energy reference area |
| EGID | Federal Building Identifier |
| EGRID | Federal Property Identifier |
| SN 506 511 | Building cost classification |
| LV95 | Swiss coordinate system |

### Relationships

- 1:N from Building to all supporting entities
- `buildingIds` array in entities enables many-to-many
- `extensionData` object for Swiss-specific fields

## CSS Architecture

### Design Tokens

All values use CSS custom properties defined in `:root`:
- Colors (status, grey scale, interactive, brand)
- Typography (scale, weights, line heights)
- Spacing (4px base unit scale)
- Shadows, borders, radii

### Naming Conventions

- BEM-like naming: `.gallery-card`, `.status-badge`
- State classes: `.active`, `.hidden`, `.visible`
- View-specific prefixes: `.map-`, `.list-`, `.gallery-`, `.detail-`

## Development

### Local Server Required

Due to CORS restrictions for API calls:

```bash
# Python
python -m http.server 8000

# Node.js
npx http-server

# PHP
php -S localhost:8000
```

### No Build Process

- Edit files directly
- Refresh browser to see changes
- No compilation or bundling needed

## Common Tasks

### Adding a New Filter Category

1. Add filter UI in `index.html` within `#filterPanel`
2. Add filter key to `activeFilters` object in `app.js`
3. Update `getFiltersFromURL()` and `setFiltersInURL()`
4. Add filter logic in `applyFilters()`
5. Update `populateFilterOptions()` if dynamic

### Adding a New Detail Tab

1. Add tab button in `index.html` `#detailTabNav`
2. Add tab content container with matching `data-tab` attribute
3. Create entity table configuration in `showDetailView()`
4. Initialize table in tab switch handler

### Adding a New Data Field

1. Update data file in `/data/`
2. Add field to entity schema in `DATAMODEL.md`
3. Update relevant rendering functions
4. Add to export if needed

### Modifying Map Styles

1. Update `mapStyles` object in `app.js`
2. Add style button in `index.html` if new style
3. Update `initializeMap()` for default style

## Testing

No automated testing framework. Manual testing approach:
- Test in browser console
- Verify all views render correctly
- Check filter combinations
- Validate URL state persistence
- Test export functionality

## External Dependencies

| Resource | URL/Token |
|----------|-----------|
| Mapbox GL JS | api.mapbox.com/mapbox-gl-js/v3.4.0/ |
| Mapbox Token | Embedded in app.js |
| Material Symbols | Google Fonts API |
| Swisstopo API | api3.geo.admin.ch |
| Placeholder Images | Unsplash URLs |

## File Editing Tips

### index.html

- Structured with clear section comments
- All views contained in `#mainContent`
- Detail view has 7 tab containers
- Filter panel in header

### js/app.js

- Navigate by section comments (`===== SECTION =====`)
- Global variables at top
- Initialization at bottom (`DOMContentLoaded`)
- Functions grouped by feature

### css/main.css

- CSS variables in `:root` (first ~300 lines)
- Base/reset styles
- Component styles grouped by feature
- Responsive styles at end of sections

## Code Conventions

### JavaScript
- Procedural ES6 (no classes/modules)
- Semicolon-terminated
- camelCase for functions and variables
- Promise chains for async
- Comments for section headers

### HTML
- Semantic elements with ARIA
- data-* attributes for JS coupling
- German labels (Karte, Tabelle, Galerie)
- Material Symbols for icons

### CSS
- CSS custom properties for all values
- BEM-like naming
- No preprocessor
- Mobile-responsive design

## Important Notes

1. **Mapbox Token**: The access token is embedded in `app.js`. For production, consider environment-based configuration.

2. **Data Files**: All data is static JSON. For real implementation, these would be API endpoints.

3. **German Language**: UI is entirely in German. Text strings are hardcoded, not externalized.

4. **Browser Support**: Modern browsers with ES6 support required.

5. **No Error Boundaries**: Errors may cause view failures. Check console for debugging.

## Related Documentation

- **DESIGNGUIDE.md** - Complete design system, components, patterns
- **DATAMODEL.md** - Entity schemas, relationships, Swiss standards
- **README.md** - Project overview and getting started
