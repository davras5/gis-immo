# BBL Immobilienportfolio - GIS POC

A single-page web application for geographic information systems (GIS) designed to visualize and manage the real estate portfolio of BBL (Bundesamt für Bauten und Logistik - Swiss Federal Office of Buildings and Logistics).

## Features

### Multiple View Modes
- **Map View** - Interactive Mapbox GL JS map with property markers, navigation controls, and multiple map styles (Light, Standard, Satellite)
- **List View** - Tabular display with sortable columns and detailed property information
- **Gallery View** - Grid layout with property cards and portfolio category tags
- **Detail View** - Comprehensive property information with tabbed interface

### Property Details
- **Overview** - Address, area, year built, status
- **Measurements (Bemessungen)** - Detailed area measurements table with sorting and multi-select
- Mini-map with location marker
- Image carousel functionality

### Search Functionality
- Real-time search with debouncing
- Searches across property names and addresses
- Search result dropdown with section headers

## Technologies

- **Mapbox GL JS v3.4.0** - Interactive mapping
- **Vanilla JavaScript** - Core application logic
- **Modern CSS3** - Styling with flexbox and CSS variables
- **Material Design Icons** - Icon library
- **GeoJSON** - Geographic data format

## Project Structure

```
gis-immo/
├── index.html              # Main application (HTML, CSS, JavaScript)
├── README.md               # This file
└── data/
    └── buildings.geojson   # Property dataset
```

## Getting Started

### Prerequisites

- Any modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server

### Running Locally

**Using Python:**
```bash
python -m http.server 8000
# Visit http://localhost:8000
```

**Using Node.js:**
```bash
npx http-server
# Or: npx serve
```

**Using PHP:**
```bash
php -S localhost:8000
```

### Deployment

No build process is required. The application can be deployed to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- Apache/Nginx
- Any static file server

## Data Structure

Properties are stored in `data/buildings.geojson` as a GeoJSON FeatureCollection:

```json
{
  "type": "Feature",
  "properties": {
    "id": "BBL-001",
    "name": "Bundeshaus West",
    "adresse": "Bundesplatz 3, 3003 Bern",
    "ort": "Bern",
    "land": "CH",
    "teilportfolio": "Verwaltungsgebäude",
    "verantwortlich": "Anna Müller",
    "flaeche_ngf": 12500,
    "baujahr": 1902,
    "status": "In Betrieb"
  },
  "geometry": {
    "type": "Point",
    "coordinates": [7.4441, 46.9465]
  }
}
```

### Property Fields

| Field | Description |
|-------|-------------|
| `id` | Unique property identifier |
| `name` | Property name |
| `adresse` | Full address |
| `ort` | City |
| `land` | Country code |
| `teilportfolio` | Portfolio category |
| `verantwortlich` | Responsible person |
| `flaeche_ngf` | Usable floor area (m²) |
| `baujahr` | Year built |
| `status` | Operational status |

### Portfolio Categories

- Verwaltungsgebäude (Administration buildings)
- Diplomatische Vertretung (Diplomatic representation)
- Logistikzentrum (Logistics center)
- Bildungseinrichtung (Educational institutions)

## Configuration

The Mapbox access token is configured in `index.html`. To use your own token:

1. Create a free account at [Mapbox](https://www.mapbox.com/)
2. Generate an access token
3. Replace the existing token in the JavaScript section of `index.html`

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

This project is a proof of concept for BBL (Bundesamt für Bauten und Logistik).
