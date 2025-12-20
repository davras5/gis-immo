# BBL GIS Immobilienportfolio - Data Model

This document describes the data model for the BBL Immobilienportfolio application. While the current demo implementation uses a single GeoJSON file (`data/buildings.geojson`), the underlying data model consists of multiple related entities.

## Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA MODEL OVERVIEW                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────┐         ┌─────────────┐         ┌─────────────┐          │
│   │    Site     │ 1    n  │  Building   │ 1    n  │   Address   │          │
│   │             │────────▶│             │────────▶│             │          │
│   └─────────────┘         └──────┬──────┘         └─────────────┘          │
│                                  │                                          │
│                    ┌─────────────┼─────────────┐                           │
│                    │             │             │                           │
│                    ▼             ▼             ▼                           │
│             ┌───────────┐ ┌───────────┐ ┌───────────┐                      │
│             │ Bemessung │ │ Dokument  │ │  Kontakt  │                      │
│             │  (Area)   │ │(Document) │ │ (Contact) │                      │
│             └───────────┘ └───────────┘ └───────────┘                      │
│                                                                              │
│             ┌───────────┐ ┌───────────┐ ┌───────────┐                      │
│             │  Vertrag  │ │Certificate│ │  Energy   │                      │
│             │(Contract) │ │           │ │  Rating   │                      │
│             └───────────┘ └───────────┘ └───────────┘                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Demo Stage Implementation

For the demo stage, all entities are stored in a single GeoJSON file:

```
data/buildings.geojson
```

Related entities (Bemessungen, Dokumente, Kontakte, Verträge) are embedded as arrays within each building's properties. In a production system, these would be separate entities with foreign key relationships.

---

## Entity: Site

A site represents a logical grouping of buildings, such as a campus, property, or land parcel. Buildings belong to exactly one site.

### Schema Definition

| Field | Type | Description | Constraints | Comment |
|-------|------|-------------|-------------|---------|
| **siteId** | string | Unique identifier; must either originate from the previous system or be explicitly defined. | **mandatory**, minLength: 1, maxLength: 50 | Source: `grundstueck_id` |
| **name** | string | Name of the site. | **mandatory**, minLength: 1, maxLength: 50 | Source: `grundstueck_name` |
| **type** | string, enum | Type of site. Options: `Education`, `Health Care`, `Hotel`, `Industrial`, `Lodging`, `Leisure & Recreation`, `Mixed Use`, `Office`, `Residential`, `Retail`, `Technology/Science`, `Other` | **mandatory** | Derived from `teilportfolio` or `objektart1` |
| **addressIds** | array[string] | Array of address IDs linked to this site. | **mandatory**, minLength: 1, maxLength: 50 per ID | Collect from linked buildings |
| **validFrom** | string | The record can be used from this date onwards. ISO 8601 format: `yyyy-mm-ddThh:mm:ssZ` | **mandatory**, minLength: 20 | Source: `gueltig_von`, convert to ISO 8601 |
| **validUntil** | string | The record is valid until this date. ISO 8601 format: `yyyy-mm-ddThh:mm:ssZ` | **mandatory**, minLength: 20, null allowed | Source: `gueltig_bis`, convert to ISO 8601 |
| energyRatingIds | array[string] | Array of energy rating IDs. | minLength: 1, maxLength: 50 per ID | |
| eventType | string, enum | Type of the event as domain event. Options: `SiteAdded`, `SiteUpdated`, `SiteDeleted` | | |
| extensionData | object | Extension data for storing any custom data. | JSON object | Container for Swiss-specific fields |
| siteCode | string | User specific site code. | minLength: 1, maxLength: 70 | |
| status | string | Status of site. | minLength: 1, maxLength: 50 | |
| extensionData.egrid | string | Eidgenössischer Grundstücksidentifikator (Federal Property Identifier) | | Swiss extension. Source: `egrid` |
| extensionData.parzellenNummer | string | Official parcel number | | Swiss extension |
| extensionData.grundbuchKreis | string | Land registry district | | Swiss extension |
| extensionData.katasterNummer | string | Cadastral number | | Swiss extension |
| extensionData.teilportfolioGruppe | string | Sub-portfolio group (e.g., "Bundesverwaltung") | | Swiss extension. Source: `teilportfolio_gruppe` |

### Example: Site Object

```json
{
  "siteId": "BE-3003-1001",
  "name": "Bundesplatz Parzelle A",
  "type": "Office",
  "addressIds": ["BBL-001-ADDR-1"],
  "validFrom": "1900-01-01T00:00:00Z",
  "validUntil": null,
  "siteCode": "BPL-A",
  "status": "Aktiv",
  "extensionData": {
    "egrid": "CH123456789012",
    "teilportfolioGruppe": "Bundesverwaltung",
    "grundbuchKreis": "Bern",
    "parzellenNummer": "1001"
  }
}
```

---

## Entity: Building

The building is the core entity representing a physical structure in the portfolio.

### Schema Definition

| Field | Type | Description | Constraints | Comment |
|-------|------|-------------|-------------|---------|
| **buildingId** | string | Unique identifier; must either originate from the previous system or be explicitly defined. | **mandatory**, minLength: 1, maxLength: 50 | Source: `id` |
| **name** | string | User specific building name (e.g., "Bundeshaus West", "EMEA Headquarter"). | **mandatory**, minLength: 1, maxLength: 200 | Source: `name` |
| **siteId** | string | Refers to the site which the building belongs to. | **mandatory**, minLength: 1, maxLength: 50 | Source: `grundstueck_id` |
| **primaryTypeOfBuilding** | string, enum | Primary type of building use. See [Building Types](#building-types). | **mandatory** | Source: `objektart1`, needs value mapping |
| **typeOfOwnership** | string, enum | Is the building owned or leased? Options: `Owner`, `Tenant` | **mandatory** | Source: `eigentum`. "Eigentum Bund" → Owner, "Miete" → Tenant |
| **validFrom** | string | The record can be used from this date onwards. ISO 8601 format: `yyyy-mm-ddThh:mm:ssZ` | **mandatory**, minLength: 20 | Source: `gueltig_von`, convert to ISO 8601 |
| **validUntil** | string | The record is valid until this date. ISO 8601 format: `yyyy-mm-ddThh:mm:ssZ` | **mandatory**, minLength: 20, null allowed | Source: `gueltig_bis`, convert to ISO 8601 |
| addressIds | array[string] | Array of address IDs linked to this building. | minLength: 1, maxLength: 50 per ID | |
| airConditioning | boolean | Does the building have air conditioning? | | |
| buildingCode | string | User specific building code. | minLength: 1, maxLength: 70 | |
| buildingPermitDate | string | Building permit date. ISO 8601 format. | minLength: 20 | Source: `baubewilligung`, convert to ISO 8601 |
| certificateIds | array[string] | Array of certificate IDs. | minLength: 1, maxLength: 50 per ID | |
| constructionYear | string | Year of construction. ISO 8601 format. Use `yyyy-01-01T00:00:00Z` if only year is known. | minLength: 20 | Source: `baujahr`, convert year to ISO 8601 |
| electricVehicleChargingStations | number | Number of EV charging stations. | maximum: 9999 | Source: `ladestationen` |
| energyEfficiencyClass | string | Energy Efficiency Class of Building (e.g., "A", "B", "C"). | minLength: 1, maxLength: 50 | Source: `energieklasse` |
| energyRatingIds | array[string] | Array of energy rating IDs. | minLength: 1, maxLength: 50 per ID | |
| eventType | string, enum | Type of the event as domain event. Options: `BuildingAdded`, `BuildingUpdated`, `BuildingDeleted` | | |
| expectedLifeEndDate | string | Expected end date of building lifecycle. ISO 8601 format. | minLength: 20 | |
| extensionData | object | Extension data for storing any custom data. | JSON object | Container for Swiss-specific fields |
| fossilFuelExposure | string, enum | Fossil fuel exposure type. Options: `Extraction`, `Storage`, `Transport`, `Manufacture`, `Other`, `Not exposed` | | |
| monumentProtection | boolean | Is the building declared as a protected monument? | | Source: `denkmalschutz`. "Ja" → true, "Nein" → false |
| netZeroEnergyBuilding | boolean | Is the building a net zero energy building? | | |
| numberOfEmployees | number | Number of employees. | maximum: 999999 | |
| numberOfFloors | number | Number of floors/stories in the building. | | Source: `geschosse` |
| parkingSpaces | number | Number of parking spaces. | maximum: 9999 | Source: `parkplaetze` |
| percentageOfOwnership | number | Percentage of ownership. | maximum: 100 | |
| primaryEnergyType | string, enum | Primary type of energy used. See [Energy Types](#energy-types). | | |
| primaryWaterType | string | Type of water used. | minLength: 1, maxLength: 50 | |
| secondaryHeatingType | string, enum | Secondary type of heating. See [Heating Types](#heating-types). | | |
| secondaryTypeOfBuilding | string, enum | Secondary type of building use. See [Building Types](#building-types). | | Source: `objektart2`, needs value mapping |
| selfUse | boolean | Is the building self-used? | | |
| status | string | Status of building (e.g., "In Betrieb", "In Renovation"). | minLength: 1, maxLength: 50 | Source: `status` |
| tenantStructure | string, enum | Tenant structure. Options: `Single-tenant`, `Multi-tenant` | | |
| valuationIds | array[string] | Array of valuation IDs. | minLength: 1, maxLength: 50 per ID | |
| yearOfLastRefurbishment | string | Year of last refurbishment. ISO 8601 format. | minLength: 20 | Source: `sanierung`, convert to ISO 8601 |
| extensionData.egid | string | Eidgenössischer Gebäudeidentifikator (Federal Building Identifier) | | Swiss extension. Source: `egid` |
| extensionData.egrid | string | Eidgenössischer Grundstücksidentifikator (Federal Property Identifier) | | Swiss extension. Source: `egrid` |
| extensionData.teilportfolio | string | Sub-portfolio category (e.g., "Verwaltungsgebäude") | | Swiss extension. Source: `teilportfolio` |
| extensionData.teilportfolioGruppe | string | Sub-portfolio group (e.g., "Bundesverwaltung") | | Swiss extension. Source: `teilportfolio_gruppe` |
| extensionData.region | string | Region/Canton | | Swiss extension. Source: `region` |
| extensionData.heatingGenerator | string | Heating generator type (Wärmeerzeuger) | | Swiss extension. Source: `waermeerzeuger` |
| extensionData.heatingSource | string | Heating source (Wärmequelle) | | Swiss extension. Source: `waermequelle` |
| extensionData.hotWater | string | Hot water system description | | Swiss extension. Source: `warmwasser` |

### Example: Building Object

```json
{
  "buildingId": "BBL-001",
  "name": "Bundeshaus West",
  "siteId": "BE-3003-1001",
  "primaryTypeOfBuilding": "Office Corporate",
  "secondaryTypeOfBuilding": "Mixed Use Office/Retail",
  "typeOfOwnership": "Owner",
  "validFrom": "1902-06-01T00:00:00Z",
  "validUntil": null,
  "addressIds": ["ADDR-001"],
  "buildingCode": "BHW-BERN",
  "constructionYear": "1902-01-01T00:00:00Z",
  "buildingPermitDate": "1898-03-15T00:00:00Z",
  "yearOfLastRefurbishment": "2019-01-01T00:00:00Z",
  "numberOfFloors": 5,
  "parkingSpaces": 45,
  "electricVehicleChargingStations": 8,
  "monumentProtection": true,
  "status": "In Betrieb",
  "energyEfficiencyClass": "C",
  "primaryEnergyType": "District heating",
  "extensionData": {
    "egid": "301001234",
    "egrid": "CH123456789012",
    "teilportfolio": "Verwaltungsgebäude",
    "teilportfolioGruppe": "Bundesverwaltung",
    "region": "Kanton Bern",
    "heatingGenerator": "Fernwärme",
    "heatingSource": "Fernwärmenetz Stadt Bern",
    "hotWater": "Zentral (Fernwärme)"
  }
}
```

---

## Entity: Address

Addresses represent the physical location of a building. A building can have multiple addresses (e.g., corner buildings with entrances on different streets).

### Schema Definition

| Field | Type | Description | Constraints | Comment |
|-------|------|-------------|-------------|---------|
| **addressId** | string | Unique identifier; must either originate from the previous system or be explicitly defined. | **mandatory**, minLength: 1, maxLength: 50 | Generated: buildingId + "-ADDR-1" |
| **city** | string | Any official settlement including cities, towns, villages, hamlets, localities, etc. | **mandatory**, minLength: 1, maxLength: 100 | Source: `ort` |
| **country** | string, enum | Sovereign nations with ISO-3166 code. Common: `CH`, `DE`, `FR`, `IT`, `AT`, `BE`, `US` | **mandatory** | Source: `land` (already ISO-3166) |
| **type** | string, enum | Type of address. Options: `Primary`, `Other` | **mandatory** | Default: "Primary" for main address |
| **geoCoordinates.geoCoordinateId** | string | Unique identifier for the coordinate set. | **mandatory**, minLength: 1, maxLength: 50 | Generated: buildingId + "-GEO-1" |
| geoCoordinates.coordinateReferenceSystem | string | Specific coordinate reference system used (e.g., "WGS84", "LV95"). | minLength: 1, maxLength: 50 | Default: "WGS84" for GeoJSON |
| geoCoordinates.latitude | number | Latitude coordinate (WGS84: -90 to 90). | | Source: `geometry.coordinates[1]` |
| geoCoordinates.longitude | number | Longitude coordinate (WGS84: -180 to 180). | | Source: `geometry.coordinates[0]` |
| additionalInformation | string | Additional information (building name, door number, etc.). | minLength: 1, maxLength: 500 | |
| apartmentOrUnit | string | Unit or apartment number. | minLength: 1, maxLength: 50 | |
| district | string | Borough or district within a city. | minLength: 1, maxLength: 50 | |
| eventType | string, enum | Type of the event as domain event. Options: `AddressAdded`, `AddressUpdated` | | |
| extensionData | object | Extension data for storing any custom data. | JSON object | Container for Swiss-specific fields |
| houseNumber | string | House number of the street. | minLength: 1, maxLength: 50 | Source: `hausnummer` |
| postalCode | string | Postal code for mail sorting. | minLength: 1, maxLength: 15 | Source: `plz` |
| stateProvincePrefecture | string | First-level administrative division (canton, state, province). | minLength: 1, maxLength: 50 | Source: `region` |
| streetName | string | Name of the street. | minLength: 1, maxLength: 150 | Extracted from `adresse` |
| extensionData.formattedAddress | string | Pre-formatted full address string (e.g., "Bundesplatz 3, 3003 Bern") | | Swiss extension. Source: `adresse` |
| extensionData.canton | string | Swiss canton code (e.g., "BE", "ZH", "GE") | | Swiss extension. Extracted from `region` |
| extensionData.gemeinde | string | Municipality name | | Swiss extension |
| extensionData.gemeindeNummer | string | Official municipality number (BFS-Nr.) | | Swiss extension |
| extensionData.lv95East | number | Swiss LV95 East coordinate (E) | | Swiss extension |
| extensionData.lv95North | number | Swiss LV95 North coordinate (N) | | Swiss extension |

### Example: Address Object

```json
{
  "addressId": "BBL-001-ADDR-1",
  "type": "Primary",
  "streetName": "Bundesplatz",
  "houseNumber": "3",
  "postalCode": "3003",
  "city": "Bern",
  "stateProvincePrefecture": "Kanton Bern",
  "country": "CH",
  "geoCoordinates": {
    "geoCoordinateId": "BBL-001-GEO-1",
    "coordinateReferenceSystem": "WGS84",
    "latitude": 46.9466,
    "longitude": 7.4448
  },
  "extensionData": {
    "formattedAddress": "Bundesplatz 3, 3003 Bern",
    "canton": "BE",
    "lv95East": 2600000,
    "lv95North": 1200000
  }
}
```

---

## Enumerations

### Building Types

Primary and secondary building type options:

| Category | Values |
|----------|--------|
| Retail | `Retail`, `Retail High Street`, `Retail Retail Centers`, `Retail Shopping Center`, `Retail Strip Mall`, `Retail Lifestyle Center`, `Retail Warehouse`, `Retail Restaurants/Bars`, `Retail Other` |
| Office | `Office`, `Office Corporate`, `Office Low-Rise Office`, `Office Mid-Rise Office`, `Office High-Rise Office`, `Office Medical Office`, `Office Business Park`, `Office Other` |
| Industrial | `Industrial`, `Industrial Distribution Warehouse`, `Industrial Industrial Park`, `Industrial Manufacturing`, `Industrial Refrigerated Warehouse`, `Industrial Non-refrigerated Warehouse`, `Industrial Other` |
| Residential | `Residential`, `Residential Multi-Family`, `Residential Low-Rise Multi-Family`, `Residential Mid-Rise Multi-Family`, `Residential High-Rise Multi-Family`, `Residential Family Homes`, `Residential Student Housing`, `Residential Retirement Living`, `Residential Other` |
| Lodging | `Hotel`, `Lodging`, `Lodging Leisure & Recreation`, `Lodging Indoor Arena`, `Lodging Fitness Center`, `Lodging Performing Arts`, `Lodging Swimming Center`, `Lodging Museum/Gallery`, `Lodging Leisure & Recreation Other` |
| Education | `Education`, `Education School`, `Education University`, `Education Library`, `Education Other` |
| Technology/Science | `Technology/Science`, `Technology/Science Data Center`, `Technology/Science Laboratory/Life sciences`, `Technology/Science Other` |
| Health Care | `Health Care`, `Health Care Health Care Center`, `Health Care Senior Homes`, `Health Care Other` |
| Mixed Use | `Mixed Use`, `Mixed Use Office/Retail`, `Mixed Use Office/Residential`, `Mixed Use Office/Industrial`, `Mixed Use Other` |
| Other | `Other`, `Other Parking (Indoors)`, `Other Self-Storage` |

### Energy Types

Options for `primaryEnergyType`:

`Natural Gas`, `Coal`, `Nuclear`, `Petroleum`, `Hydropower`, `Wind`, `Biomass`, `Geothermal`, `Solar`

### Heating Types

Options for `secondaryHeatingType`:

`District heating`, `Natural gas`, `Oil-based fuels`, `Solar thermal`, `Unspecified`, `Heat pump`, `Electricity (radiator)`, `Biomass`, `Micro combined heat and power`

---

## Related Entities (Preview)

The following entities are related to buildings and will be documented in separate sections:

| Entity | Description | Relationship |
|--------|-------------|--------------|
| ~~**Site**~~ | ~~A logical grouping of buildings~~ | *(documented above)* |
| ~~**Address**~~ | ~~Physical address of a building~~ | *(documented above)* |
| **Bemessung (Area Measurement)** | Area and volume measurements | 1 Building → n Measurements |
| **Dokument (Document)** | Related documents (plans, certificates) | 1 Building → n Documents |
| **Kontakt (Contact)** | Contact persons for the building | 1 Building → n Contacts |
| **Vertrag (Contract)** | Service and maintenance contracts | 1 Building → n Contracts |
| **Certificate** | Building certifications (LEED, BREEAM, etc.) | 1 Building → n Certificates |
| **EnergyRating** | Energy performance ratings | 1 Building → n Ratings |
| **Valuation** | Property valuations | 1 Building → n Valuations |

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1.0 | 2024-XX-XX | - | Initial draft - Building entity |
| 0.2.0 | 2024-XX-XX | - | Added Address entity with Swiss extensions |
| 0.3.0 | 2024-XX-XX | - | Added Site entity with Swiss extensions |
| 0.4.0 | 2024-XX-XX | - | Consolidated to single schema table per entity with Comment column |

---

## References

- [SIA 416](https://www.sia.ch/) - Swiss Standard for areas in building construction
- [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) - Date and time format
- [ISO 3166](https://www.iso.org/iso-3166-country-codes.html) - Country codes
- [GeoJSON Specification](https://geojson.org/) - Geographic JSON format
- [LV95](https://www.swisstopo.admin.ch/en/knowledge-facts/surveying-geodesy/reference-frames/local/lv95.html) - Swiss coordinate reference system
- EGID/EGRID - Swiss Federal Building/Property Identifiers
