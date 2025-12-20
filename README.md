# BBL Immobilienportfolio - GIS POC

A single-page web application for visualizing and managing the Swiss Federal Office of Buildings and Logistics (BBL) real estate portfolio.

- Deployed [davras5.github.io/gis-immo](https://davras5.github.io/gis-immo/)

<p align="center">
  <img src="assets/images/preview1.jpg" width="90%"/>
</p>

<p align="center">
  <img src="assets/images/preview2.jpg" width="45%" style="vertical-align: top;"/>
  <img src="assets/images/preview3.jpg" width="45%" style="vertical-align: top;"/>
</p>

## Features

- **Map View** - Interactive Mapbox map with property markers and multiple styles (Light, Standard, Satellite)
- **List View** - Sortable table with filtering
- **Gallery View** - Grid layout with property cards
- **Detail View** - Comprehensive property info with tabs (Overview, Measurements, Documents)
- **Search** - Real-time search with Swisstopo API integration for Swiss locations

## Tech Stack

| Technology | Usage |
|------------|-------|
| Vanilla JavaScript (ES6+) | Application logic |
| Mapbox GL JS v3.4.0 | Map visualization |
| CSS3 | Styling (Flexbox, Grid, Variables) |
| GeoJSON | Data format |
| Swisstopo API | Location search |

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
├── index.html              # Complete app (HTML + CSS + JS)
├── data/
│   └── buildings.geojson   # Portfolio data (10 buildings)
├── assets/
│   └── images/             # Preview screenshots
├── README.md
└── CLAUDE.md               # Development docs
```

## License

Licensed under [MIT](https://opensource.org/licenses/MIT)

---

*Unofficial mockup for demonstration purposes.*
