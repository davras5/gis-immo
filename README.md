# BBL Immobilienportfolio - GIS POC

A single-page web application for visualizing and managing the Swiss Federal Office of Buildings and Logistics (BBL) real estate portfolio. This proof-of-concept demonstrates GIS capabilities for federal property management with an interactive map-based interface, plus complementary table and gallery views.

**Live Demo:** [davras5.github.io/gis-immo](https://davras5.github.io/gis-immo/)

<p align="center">
  <img src="assets/images/preview1.jpg" width="90%"/>
</p>

<p align="center">
  <img src="assets/images/preview2.jpg" width="45%" style="vertical-align: top;"/>
  <img src="assets/images/preview3.jpg" width="45%" style="vertical-align: top;"/>
</p>

## Features

### Core Views
- **Map View** - Interactive Mapbox map with color-coded property markers, 3 map styles (Light, Standard, Satellite), and sidebar accordion for sharing/export
- **List View** - Sortable table with search, filtering, configurable columns, and export to CSV/Excel/GeoJSON
- **Gallery View** - Responsive 3-column grid with property cards and status badges
- **Detail View** - Comprehensive property dashboard with 7 tabbed sections:
  - Overview (images, basic info, mini-map)
  - Measurements (SIA 416 compliant area data)
  - Documents (plans, certificates, permits)
  - Costs (operational expenses by category)
  - Contracts (service & maintenance agreements)
  - Contacts (personnel & stakeholders)
  - Facilities (equipment & infrastructure inventory)

### Search & Filtering
- Multi-source search: Local buildings + Swisstopo location API + Geokatalog layers
- 6 filter categories: Status, Ownership Type, Portfolio, Building Type, Country, Region
- Deep linking with URL-based navigation and filter persistence

### Data Export
- CSV, Excel (.xlsx), and GeoJSON export
- Custom column selection before export

## Tech Stack

| Technology | Version | Usage |
|------------|---------|-------|
| Vanilla JavaScript | ES6+ | Application logic |
| Mapbox GL JS | v3.4.0 | Interactive WebGL map |
| CSS3 | Modern | Styling (Flexbox, Grid, CSS Variables) |
| GeoJSON | Standard | Geospatial data format |
| Swisstopo API | v3 | Swiss location search |
| Material Symbols | Google | Icon library |

No build tools or frameworks - pure static files.

## Getting Started

```bash
# Python
python -m http.server 8000

# Node.js
npx http-server

# PHP
php -S localhost:8000
```

Then open http://localhost:8000

## Project Structure

```
gis-immo/
├── index.html                    # HTML structure
├── js/
│   └── app.js                    # Application logic (2,800 lines)
├── css/
│   └── main.css                  # Styles & design system (3,400 lines)
├── data/
│   ├── buildings.geojson         # Core portfolio data (10+ buildings)
│   ├── area-measurements.json    # SIA 416 area measurements
│   ├── documents.json            # Plans, certificates, permits
│   ├── contacts.json             # Personnel & stakeholders
│   ├── contracts.json            # Service agreements
│   ├── costs.json                # Operational expenses
│   └── assets.json               # Equipment inventory
├── assets/
│   └── images/                   # Preview screenshots
├── documentation/
│   ├── CLAUDE.md                 # Development guide
│   ├── DATAMODEL.md              # Complete entity schema
│   └── DESIGNGUIDE.md            # Design system & components
├── README.md
└── LICENSE
```

## Swiss Standards

This application incorporates Swiss building and property standards:

| Standard | Description |
|----------|-------------|
| SIA 416 | Building area measurements (BGF, NGF, EBF) |
| SIA 380/1 | Energy reference area |
| EGID | Federal Building Identifier |
| EGRID | Federal Property Identifier |
| SN 506 511 | Building cost classification |

## Deployment

**GitHub Pages:** Push to `main` deploys automatically.

**Alternatives:** Netlify, Vercel, CloudFlare Pages, or any static file server.

## License

Licensed under [MIT](https://opensource.org/licenses/MIT)

---

*Unofficial mockup for demonstration purposes.*
