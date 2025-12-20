# BBL GIS Immobilienportfolio - Data Model

This document describes the data model for the BBL Immobilienportfolio application. While the current demo implementation uses a single GeoJSON file (`data/buildings.geojson`), the underlying data model consists of multiple related entities.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Demo Stage Implementation](#2-demo-stage-implementation)
3. [Entity: Site](#3-entity-site)
4. [Entity: Address (Adresse)](#4-entity-address-adresse)
5. [Entity: Land (Grundstück)](#5-entity-land-grundstück)
6. [Entity: Building (Gebäude)](#6-entity-building-gebäude)
7. [Entity: Area Measurement (Bemessung)](#7-entity-area-measurement-bemessung)
8. [Entity: Document (Dokument)](#8-entity-document-dokument)
9. [Entity: Contact (Kontakt)](#9-entity-contact-kontakt)
10. [Entity: Asset (Ausstattung)](#10-entity-asset-ausstattung)
11. [Entity: Contract (Vertrag)](#11-entity-contract-vertrag)
12. [Entity: Cost (Kosten)](#12-entity-cost-kosten)
13. [Entity: Operational Measurement (Preview)](#13-entity-operational-measurement-preview)
14. [Related Entities (Preview)](#14-related-entities-preview)
15. [Version History](#15-version-history)
16. [References](#16-references)

---

## 1. Overview

```mermaid
erDiagram
    Site ||--o{ Building : contains
    Site ||--o{ Land : contains
    Building ||--o{ Address : "has"
    Building ||--o{ AreaMeasurement : "has"
    Building ||--o{ Document : "has"
    Building ||--o{ Contact : "has"
    Building ||--o{ Contract : "has"
    Building ||--o{ Certificate : "has"
    Building ||--o{ Asset : "has"
    Building ||--o{ Cost : "has"
    Building ||--o{ OperationalMeasurement : "has"

    Site {
        string siteId PK
        string name
        string type
        string status
    }

    Building {
        string buildingId PK
        string siteId FK
        string name
        string primaryTypeOfBuilding
        string typeOfOwnership
        string status
    }

    Land {
        string landId PK
        string siteId FK
        string name
        string typeOfOwnership
    }

    Address {
        string addressId PK
        string streetName
        string houseNumber
        string postalCode
        string city
        string country
    }

    AreaMeasurement {
        string areaMeasurementId PK
        string type
        number value
        string unit
    }

    Document {
        string documentId PK
        string name
        string type
    }

    Contact {
        string contactId PK
        string name
        string role
    }

    Contract {
        string contractId PK
        string type
        date validFrom
    }

    Certificate {
        string certificateId PK
        string type
        string level
    }

    Asset {
        string assetId PK
        string name
        string category
        string manufacturer
    }

    Cost {
        string costId PK
        string costGroup
        string costType
        number amount
    }

    OperationalMeasurement {
        string operationalMeasurementId PK
        string buildingId FK
        string type
        string subType
        number value
    }
```

## 2. Demo Stage Implementation

For the demo stage, all entities are stored in a single GeoJSON file:

```
data/buildings.geojson
```

Related entities (Bemessungen, Dokumente, Kontakte, Verträge) are embedded as arrays within each building's properties. In a production system, these would be separate entities with foreign key relationships.

---

## Entity: Site (Standort)

> **Note:** This entity is not currently implemented in the demo. It is documented here for future implementation planning.

A site represents a logical grouping of buildings, such as a campus, property, or land parcel. Buildings belong to exactly one site.

### Schema Definition

| Field | PK/FK | Type | Description | Constraints | Alias (EN) | Alias (DE) | Comment |
|-------|-------|------|-------------|-------------|------------|------------|---------|
| **siteId** | PK | string | Unique identifier; must either originate from the previous system or be explicitly defined. | **mandatory**, minLength: 1, maxLength: 50 | Site ID | Standort-ID | Not used in current demo |
| **name** | | string | Name of the site. | **mandatory**, minLength: 1, maxLength: 50 | Site Name | Standortbezeichnung | Not used in current demo |
| **type** | | string, enum | Type of site. See [Site Types](#site-types). | **mandatory** | Site Type | Standortart | Derived from `teilportfolio` or `objektart1` |
| **addressIds** | FK | array[string] | Array of address IDs linked to this site. | **mandatory**, minLength: 1, maxLength: 50 per ID | Addresses | Adressen | Collect from linked buildings |
| **validFrom** | | string | The record can be used from this date onwards. ISO 8601 format: `yyyy-mm-ddThh:mm:ssZ` | **mandatory**, minLength: 20 | Valid From | Gültig von | Source: `gueltig_von`, convert to ISO 8601 |
| **validUntil** | | string | The record is valid until this date. ISO 8601 format: `yyyy-mm-ddThh:mm:ssZ` | **mandatory**, minLength: 20, null allowed | Valid Until | Gültig bis | Source: `gueltig_bis`, convert to ISO 8601 |
| energyRatingIds | FK | array[string] | Array of energy rating IDs. | minLength: 1, maxLength: 50 per ID | Energy Ratings | Energiebewertungen | |
| eventType | | string, enum | Type of the event as domain event. Options: `SiteAdded`, `SiteUpdated`, `SiteDeleted` | | Event Type | Ereignistyp | |
| extensionData | | object | Extension data for storing any custom data. | JSON object | Extension Data | Erweiterungsdaten | Container for Swiss-specific fields |
| siteCode | | string | User specific site code. | minLength: 1, maxLength: 70 | Site Code | Standortcode | |
| status | | string | Status of site. | minLength: 1, maxLength: 50 | Status | Status | |
| extensionData.egrid | | string | Eidgenössischer Grundstücksidentifikator (Federal Property Identifier) | | EGRID | EGRID | Swiss extension. Source: `egrid` |
| extensionData.parzellenNummer | | string | Official parcel number | | Parcel Number | Parzellennummer | Swiss extension |
| extensionData.grundbuchKreis | | string | Land registry district | | Land Registry | Grundbuchkreis | Swiss extension |
| extensionData.katasterNummer | | string | Cadastral number | | Cadastral No. | Katasternummer | Swiss extension |
| extensionData.teilportfolioGruppe | | string | Sub-portfolio group (e.g., "Bundesverwaltung") | | Portfolio Group | Teilportfolio Gruppe | Swiss extension. Source: `teilportfolio_gruppe` |

### Site Types

Options for Site `type` field:

`Education`, `Health Care`, `Hotel`, `Industrial`, `Lodging`, `Leisure & Recreation`, `Mixed Use`, `Office`, `Residential`, `Retail`, `Technology/Science`, `Other`

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

## 4. Entity: Address (Adresse)

Addresses represent the physical location of a building. A building can have multiple addresses (e.g., corner buildings with entrances on different streets).

### Schema Definition

| Field | PK/FK | Type | Description | Constraints | Alias (EN) | Alias (DE) | Comment |
|-------|-------|------|-------------|-------------|------------|------------|---------|
| **addressId** | PK | string | Unique identifier; must either originate from the previous system or be explicitly defined. | **mandatory**, minLength: 1, maxLength: 50 | Address ID | Adress-ID | Generated: buildingId + "-ADDR-1" |
| **city** | | string | Any official settlement including cities, towns, villages, hamlets, localities, etc. | **mandatory**, minLength: 1, maxLength: 100 | City | Ort | Source: `ort` |
| **country** | | string, enum | Sovereign nations with ISO-3166 code. Common: `CH`, `DE`, `FR`, `IT`, `AT`, `BE`, `US` | **mandatory** | Country | Land | Source: `land` (already ISO-3166) |
| **type** | | string, enum | Type of address. See [Address Types](#address-types). | **mandatory** | Address Type | Adressart | Default: "Primary" for main address |
| **geoCoordinates.geoCoordinateId** | PK | string | Unique identifier for the coordinate set. | **mandatory**, minLength: 1, maxLength: 50 | Coordinate ID | Koordinaten-ID | Generated: buildingId + "-GEO-1" |
| geoCoordinates.coordinateReferenceSystem | | string | Specific coordinate reference system used (e.g., "WGS84", "LV95"). | minLength: 1, maxLength: 50 | Reference System | Referenzsystem | Default: "WGS84" for GeoJSON |
| geoCoordinates.latitude | | number | Latitude coordinate (WGS84: -90 to 90). | | Latitude | Breitengrad | Source: `geometry.coordinates[1]` |
| geoCoordinates.longitude | | number | Longitude coordinate (WGS84: -180 to 180). | | Longitude | Längengrad | Source: `geometry.coordinates[0]` |
| additionalInformation | | string | Additional information (building name, door number, etc.). | minLength: 1, maxLength: 500 | Additional Info | Zusatzinformation | |
| apartmentOrUnit | | string | Unit or apartment number. | minLength: 1, maxLength: 50 | Unit/Apt | Wohnung/Einheit | |
| district | | string | Borough or district within a city. | minLength: 1, maxLength: 50 | District | Bezirk | |
| eventType | | string, enum | Type of the event as domain event. Options: `AddressAdded`, `AddressUpdated` | | Event Type | Ereignistyp | |
| extensionData | | object | Extension data for storing any custom data. | JSON object | Extension Data | Erweiterungsdaten | Container for country-specific fields |
| houseNumber | | string | House number of the street. | minLength: 1, maxLength: 50 | House Number | Hausnummer | Source: `hausnummer` |
| postalCode | | string | Postal code for mail sorting. | minLength: 1, maxLength: 15 | Postal Code | PLZ | Source: `plz` |
| stateProvincePrefecture | | string | First-level administrative division (state, province, canton). | minLength: 1, maxLength: 50 | State/Province | Region/Kanton | Source: `region` |
| streetName | | string | Name of the street. | minLength: 1, maxLength: 150 | Street | Strasse | Extracted from `adresse` |
| extensionData.formattedAddress | | string | Pre-formatted full address string | | Full Address | Vollständige Adresse | Source: `adresse` |

### Address Types

Options for Address `type` field:

`Primary`, `Other`

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
    "formattedAddress": "Bundesplatz 3, 3003 Bern"
  }
}
```

---

## 5. Entity: Land (Grundstück)

Land represents a parcel of land or plot that belongs to a site. In the current demo, land information is partially embedded in building properties (`grundstueck_id`, `grundstueck_name`). In a production system, Land would be a separate entity allowing multiple land parcels per site.

### Schema Definition

| Field | PK/FK | Type | Description | Constraints | Alias (EN) | Alias (DE) | Comment |
|-------|-------|------|-------------|-------------|------------|------------|---------|
| **landId** | PK | string | Unique identifier; must either originate from the previous system or be explicitly defined. | **mandatory**, minLength: 1, maxLength: 50 | Land ID | Grundstück-ID | Source: `grundstueck_id` or generated |
| **name** | | string | Name of land (e.g., park, garden, parking). | **mandatory**, minLength: 1, maxLength: 200 | Land Name | Grundstückbezeichnung | Source: `grundstueck_name` |
| **siteId** | FK | string | Refers to the site which the land belongs to. | **mandatory**, minLength: 1, maxLength: 50 | Site ID | Standort-ID | Not used in current demo (Site entity not implemented) |
| **typeOfOwnership** | | string, enum | Is the land owned or leased? See [Ownership Types](#ownership-types). | **mandatory** | Ownership | Eigentum | Source: `eigentum`. "Eigentum Bund" → Owner |
| **validFrom** | | string | The record can be used from this date onwards. ISO 8601 format: `yyyy-mm-ddThh:mm:ssZ` | **mandatory**, minLength: 20 | Valid From | Gültig von | Source: `gueltig_von`, convert to ISO 8601 |
| **validUntil** | | string | The record is valid until this date. ISO 8601 format: `yyyy-mm-ddThh:mm:ssZ` | **mandatory**, minLength: 20, null allowed | Valid Until | Gültig bis | Source: `gueltig_bis`, convert to ISO 8601 |
| addressIds | FK | array[string] | Array of address IDs linked to this land. | minLength: 1, maxLength: 50 per ID | Addresses | Adressen | |
| eventType | | string, enum | Type of the event as domain event. Options: `LandAdded`, `LandUpdated`, `LandDeleted` | | Event Type | Ereignistyp | |
| extensionData | | object | Extension data for storing any custom data. | JSON object | Extension Data | Erweiterungsdaten | Container for country-specific fields |
| landCode | | string | User specific land code. | minLength: 1, maxLength: 70 | Land Code | Grundstückcode | |
| landCoverage | | string | Development level of land. | minLength: 1, maxLength: 50 | Land Coverage | Bebauungsgrad | |
| landParcelNr | | string | District/zoning number registered for the plot of land. | minLength: 1, maxLength: 50 | Parcel Number | Parzellennummer | |
| selfUse | | boolean | Is the land self-used? | | Self Use | Eigennutzung | |
| status | | string | Status of land. | minLength: 1, maxLength: 50 | Status | Status | |
| tenantStructure | | string, enum | Tenant structure. See [Tenant Structure](#tenant-structure). | | Tenant Structure | Mieterstruktur | |
| valuationIds | FK | array[string] | Array of valuation IDs. | minLength: 1, maxLength: 50 per ID | Valuations | Bewertungen | |
| extensionData.egrid | | string | Federal property identifier (country-specific) | | EGRID | EGRID | Source: `egrid` |

### Ownership Types

Options for `typeOfOwnership` field:

`Owner`, `Tenant`

### Tenant Structure

Options for `tenantStructure` field:

`Single-tenant`, `Multi-tenant`

### Example: Land Object

```json
{
  "landId": "BE-3003-1001",
  "name": "Bundesplatz Parzelle A",
  "typeOfOwnership": "Owner",
  "validFrom": "1900-01-01T00:00:00Z",
  "validUntil": null,
  "addressIds": ["BBL-001-ADDR-1"],
  "status": "Aktiv",
  "extensionData": {
    "egrid": "CH123456789012"
  }
}
```

---

## 6. Entity: Building (Gebäude)

The building is the core entity representing a physical structure in the portfolio.

### Schema Definition

| Field | PK/FK | Type | Description | Constraints | Alias (EN) | Alias (DE) | Comment |
|-------|-------|------|-------------|-------------|------------|------------|---------|
| **buildingId** | PK | string | Unique identifier; must either originate from the previous system or be explicitly defined. | **mandatory**, minLength: 1, maxLength: 50 | Building ID | Objekt-ID | Source: `id` |
| **name** | | string | User specific building name (e.g., "Bundeshaus West", "EMEA Headquarter"). | **mandatory**, minLength: 1, maxLength: 200 | Building Name | Bezeichnung | Source: `name` |
| **siteId** | FK | string | Refers to the site which the building belongs to. | **mandatory**, minLength: 1, maxLength: 50 | Site ID | Standort-ID | Not used in current demo (Site entity not implemented) |
| **primaryTypeOfBuilding** | | string, enum | Primary type of building use. See [Building Types](#building-types). | **mandatory** | Building Type | Objektart 1 | Source: `objektart1`, needs value mapping |
| **typeOfOwnership** | | string, enum | Is the building owned or leased? See [Ownership Types](#ownership-types). | **mandatory** | Ownership | Art Eigentum | Source: `eigentum`. "Eigentum Bund" → Owner, "Miete" → Tenant |
| **validFrom** | | string | The record can be used from this date onwards. ISO 8601 format: `yyyy-mm-ddThh:mm:ssZ` | **mandatory**, minLength: 20 | Valid From | Gültig von | Source: `gueltig_von`, convert to ISO 8601 |
| **validUntil** | | string | The record is valid until this date. ISO 8601 format: `yyyy-mm-ddThh:mm:ssZ` | **mandatory**, minLength: 20, null allowed | Valid Until | Gültig bis | Source: `gueltig_bis`, convert to ISO 8601 |
| addressIds | FK | array[string] | Array of address IDs linked to this building. | minLength: 1, maxLength: 50 per ID | Addresses | Adressen | |
| airConditioning | | boolean | Does the building have air conditioning? | | Air Conditioning | Klimaanlage | |
| buildingCode | | string | User specific building code. | minLength: 1, maxLength: 70 | Building Code | Objektcode | |
| buildingPermitDate | | string | Building permit date. ISO 8601 format. | minLength: 20 | Permit Date | Baubewilligung | Source: `baubewilligung`, convert to ISO 8601 |
| certificateIds | FK | array[string] | Array of certificate IDs. | minLength: 1, maxLength: 50 per ID | Certificates | Zertifikate | |
| constructionYear | | string | Year of construction. ISO 8601 format. Use `yyyy-01-01T00:00:00Z` if only year is known. | minLength: 20 | Construction Year | Baujahr | Source: `baujahr`, convert year to ISO 8601 |
| electricVehicleChargingStations | | number | Number of EV charging stations. | maximum: 9999 | EV Charging | E-Ladestationen | Source: `ladestationen` |
| energyEfficiencyClass | | string | Energy Efficiency Class of Building (e.g., "A", "B", "C"). | minLength: 1, maxLength: 50 | Energy Class | Energieklasse | Source: `energieklasse` |
| energyRatingIds | FK | array[string] | Array of energy rating IDs. | minLength: 1, maxLength: 50 per ID | Energy Ratings | Energiebewertungen | |
| eventType | | string, enum | Type of the event as domain event. Options: `BuildingAdded`, `BuildingUpdated`, `BuildingDeleted` | | Event Type | Ereignistyp | |
| expectedLifeEndDate | | string | Expected end date of building lifecycle. ISO 8601 format. | minLength: 20 | Life End Date | Nutzungsende | |
| extensionData | | object | Extension data for storing any custom data. | JSON object | Extension Data | Erweiterungsdaten | Container for Swiss-specific fields |
| fossilFuelExposure | | string, enum | Fossil fuel exposure type. See [Fossil Fuel Exposure](#fossil-fuel-exposure). | | Fossil Fuel Exposure | Fossile Brennstoffe | |
| monumentProtection | | boolean | Is the building declared as a protected monument? | | Monument Protection | Denkmalschutz | Source: `denkmalschutz`. "Ja" → true, "Nein" → false |
| netZeroEnergyBuilding | | boolean | Is the building a net zero energy building? | | Net Zero Building | Nullenergiegebäude | |
| numberOfEmployees | | number | Number of employees. | maximum: 999999 | Employees | Mitarbeiter | |
| parkingSpaces | | number | Number of parking spaces. | maximum: 9999 | Parking Spaces | Parkplätze | Source: `parkplaetze` |
| percentageOfOwnership | | number | Percentage of ownership. | maximum: 100 | Ownership % | Eigentumsanteil | |
| primaryEnergyType | | string, enum | Primary type of energy used. See [Energy Types](#energy-types). | | Energy Type | Energieart | |
| primaryWaterType | | string | Type of water used. | minLength: 1, maxLength: 50 | Water Type | Wasserart | |
| secondaryHeatingType | | string, enum | Secondary type of heating. See [Heating Types](#heating-types). | | Heating Type | Heizungsart | |
| secondaryTypeOfBuilding | | string, enum | Secondary type of building use. See [Building Types](#building-types). | | Building Type 2 | Objektart 2 | Source: `objektart2`, needs value mapping |
| selfUse | | boolean | Is the building self-used? | | Self Use | Eigennutzung | |
| status | | string | Status of building (e.g., "In Betrieb", "In Renovation"). | minLength: 1, maxLength: 50 | Status | Status | Source: `status` |
| tenantStructure | | string, enum | Tenant structure. See [Tenant Structure](#tenant-structure). | | Tenant Structure | Mieterstruktur | |
| valuationIds | FK | array[string] | Array of valuation IDs. | minLength: 1, maxLength: 50 per ID | Valuations | Bewertungen | |
| yearOfLastRefurbishment | | string | Year of last refurbishment. ISO 8601 format. | minLength: 20 | Refurbishment | Sanierung | Source: `sanierung`, convert to ISO 8601 |
| extensionData.numberOfFloors | | number | Number of floors/stories in the building | | Floors | Anzahl Geschosse | Source: `geschosse` |
| extensionData.responsiblePerson | | string | Name of responsible person for the building | | Responsible | Verantwortlich | Source: `verantwortlich` |
| extensionData.egid | | string | Federal building identifier (country-specific) | | EGID | EGID | Source: `egid` |
| extensionData.egrid | | string | Federal property identifier (country-specific) | | EGRID | EGRID | Source: `egrid` |
| extensionData.portfolio | | string | Sub-portfolio category | | Portfolio | Teilportfolio | Source: `teilportfolio` |
| extensionData.portfolioGroup | | string | Portfolio group | | Portfolio Group | Teilportfolio Gruppe | Source: `teilportfolio_gruppe` |
| extensionData.heatingGenerator | | string | Heating generator type | | Heating System | Wärmeerzeuger | Source: `waermeerzeuger` |
| extensionData.heatingSource | | string | Heating source | | Heat Source | Wärmequelle | Source: `waermequelle` |
| extensionData.hotWater | | string | Hot water system description | | Hot Water | Warmwasser | Source: `warmwasser` |

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

### Fossil Fuel Exposure

Options for `fossilFuelExposure` field:

`Extraction`, `Storage`, `Transport`, `Manufacture`, `Other`, `Not exposed`

### Energy Types

Options for `primaryEnergyType` field:

`Natural Gas`, `Coal`, `Nuclear`, `Petroleum`, `Hydropower`, `Wind`, `Biomass`, `Geothermal`, `Solar`

### Heating Types

Options for `secondaryHeatingType` field:

`District heating`, `Natural gas`, `Oil-based fuels`, `Solar thermal`, `Unspecified`, `Heat pump`, `Electricity (radiator)`, `Biomass`, `Micro combined heat and power`

### Example: Building Object

```json
{
  "buildingId": "BBL-001",
  "name": "Bundeshaus West",
  "primaryTypeOfBuilding": "Office Corporate",
  "secondaryTypeOfBuilding": "Mixed Use Office/Retail",
  "typeOfOwnership": "Owner",
  "validFrom": "1902-06-01T00:00:00Z",
  "validUntil": null,
  "addressIds": ["ADDR-001"],
  "constructionYear": "1902-01-01T00:00:00Z",
  "buildingPermitDate": "1898-03-15T00:00:00Z",
  "yearOfLastRefurbishment": "2019-01-01T00:00:00Z",
  "parkingSpaces": 45,
  "electricVehicleChargingStations": 8,
  "monumentProtection": true,
  "status": "In Betrieb",
  "energyEfficiencyClass": "C",
  "extensionData": {
    "numberOfFloors": 5,
    "egid": "301001234",
    "portfolio": "Verwaltungsgebäude",
    "portfolioGroup": "Bundesverwaltung",
    "heatingGenerator": "Fernwärme",
    "heatingSource": "Fernwärmenetz Stadt Bern",
    "hotWater": "Zentral (Fernwärme)"
  }
}
```

---

## 7. Entity: Area Measurement (Bemessung)

Area measurements capture floor areas, volumes, and other quantitative measurements for buildings, floors, spaces, or sites. In the current demo, measurements are embedded in the `bemessungen` array within each building.

### Schema Definition

| Field | PK/FK | Type | Description | Constraints | Alias (EN) | Alias (DE) | Comment |
|-------|-------|------|-------------|-------------|------------|------------|---------|
| **areaMeasurementId** | PK | string | Unique identifier; must either originate from the previous system or be explicitly defined. | **mandatory**, minLength: 1, maxLength: 50 | Measurement ID | Bemessungs-ID | Source: `bemessungen[].id` |
| **type** | | string, enum | Type of the standard area. See [Area Types](#area-types). | **mandatory** | Area Type | Flächenart | Source: `bemessungen[].areaType`, needs value mapping |
| **value** | | number | Value of measurement. | **mandatory** | Value | Wert | Source: `bemessungen[].value` |
| **unit** | | string, enum | Unit area is measured with. See [Area Measurement Units](#area-measurement-units). | **mandatory** | Unit | Einheit | Source: `bemessungen[].unit`. "m²" → sqm |
| **validFrom** | | string | The record can be used from this date onwards. ISO 8601 format: `yyyy-mm-ddThh:mm:ssZ` | **mandatory**, minLength: 20 | Valid From | Gültig von | Source: `bemessungen[].validFrom`, convert to ISO 8601 |
| **validUntil** | | string | The record is valid until this date. ISO 8601 format: `yyyy-mm-ddThh:mm:ssZ` | **mandatory**, minLength: 20, null allowed | Valid Until | Gültig bis | Source: `bemessungen[].validUntil`, convert to ISO 8601 |
| **bmEstimation** | | boolean | Is the data estimated by BuildingMinds? | **mandatory** | BM Estimation | BM-Schätzung | Default: false for imported data |
| accuracy | | string, enum | Accuracy of area measurement. See [Area Measurement Accuracy](#area-measurement-accuracy). | | Accuracy | Genauigkeit | Source: `bemessungen[].accuracy`. "Gemessen" → Measured, "Geschätzt" → Estimated, "Berechnet" → Estimated, "Aggregiert" → Aggregated |
| buildingIds | FK | array[string] | Array of building IDs this measurement belongs to. | minLength: 1, maxLength: 50 per ID | Buildings | Gebäude | Derived from parent building |
| eventType | | string, enum | Type of the event as domain event. Options: `AreaMeasurementAdded`, `AreaMeasurementUpdated`, `AreaMeasurementDeleted` | | Event Type | Ereignistyp | |
| extensionData | | object | Extension data for storing any custom data. | JSON object | Extension Data | Erweiterungsdaten | Container for Swiss-specific fields |
| floorIds | FK | array[string] | Array of floor IDs. | minLength: 1, maxLength: 50 per ID | Floors | Geschosse | |
| landIds | FK | array[string] | Array of land IDs. | minLength: 1, maxLength: 50 per ID | Land Parcels | Grundstücke | |
| rentalUnit | FK | array[string] | Array of rental unit IDs. | minLength: 1, maxLength: 50 per ID | Rental Units | Mieteinheiten | |
| siteIds | FK | array[string] | Array of site IDs. | minLength: 1, maxLength: 50 per ID | Sites | Standorte | |
| spaceIds | FK | array[string] | Array of space IDs. | minLength: 1, maxLength: 50 per ID | Spaces | Räume | |
| standard | | string, enum | Area measurement standard. See [Area Measurement Standards](#area-measurement-standards). | | Standard | Norm | Source: `bemessungen[].standard`. "SIA 416" → extensionData, "DIN 277" → DIN 277-1 |
| extensionData.siaStandard | | string | Swiss SIA standard reference (e.g., "SIA 416", "SIA 380/1") | | SIA Standard | SIA-Norm | Swiss extension. Source: `bemessungen[].standard` |
| extensionData.source | | string | Data source (e.g., "CAD/BIM", "Vermessung", "Schätzmodell", "Manuell") | | Source | Quelle | Swiss extension. Source: `bemessungen[].source` |
| extensionData.originalUnit | | string | Original unit before conversion (e.g., "m²", "m³", "Stk") | | Original Unit | Urspr. Einheit | Swiss extension. Source: `bemessungen[].unit` |
| extensionData.originalType | | string | Original German area type name | | Original Type | Urspr. Flächenart | Swiss extension. Source: `bemessungen[].areaType` |

### Area Measurement Units

| Value | Description |
|-------|-------------|
| `sqm` | Square meters (m²) |
| `sqft` | Square feet (ft²) |
| `acr` | Acres |

### Area Measurement Accuracy

| Value | Description |
|-------|-------------|
| `Estimated` | Estimated or calculated value |
| `Measured` | Directly measured value |
| `Aggregated` | Aggregated from multiple sources |
| `Unknown` | Accuracy not specified |

### Area Measurement Standards

| Value | Description |
|-------|-------------|
| `DIN 277-1` | German standard for floor areas |
| `MFG` | Mietflächenrichtlinie für gewerblichen Raum |
| `IPMS` | International Property Measurement Standards |
| `RICS` | Royal Institution of Chartered Surveyors |
| `BOMA` | Building Owners and Managers Association |
| `NA` | Not applicable / Other standard |

### Area Types

Options for the `type` field, grouped by standard:

| Category | Values |
|----------|--------|
| DIN 277 / General | `Gross floor area`, `Construction area`, `Net room area`, `Circulation area`, `Net usable area`, `Technical area` |
| Usage-specific | `Living/residence area`, `Office area`, `Production/laboratory area`, `Storage/distribution/selling area`, `Education/teaching/culture area`, `Healing/care area`, `Other uses` |
| IPMS | `Gross external area`, `External Wall area`, `Gross internal area`, `A-Vertical penetrations`, `B-Structural elements`, `C-Technical services`, `D-Hygiene areas`, `E-Circulation areas`, `F-Amenities`, `G-Workspace`, `H-Other areas` |
| BOMA / Rental | `Rentable area`, `Rentable exclusion`, `Boundary area`, `Rentable area common occupancy`, `Rentable area exclusive occupancy`, `Building amenity area`, `Building service area`, `Floor service area`, `Tenant ancillary area`, `Tenant area`, `Landlord area` |
| Site / Land | `Land area`, `Total surface area`, `Vegetated area`, `Non-vegetated area`, `Green ground area`, `Green roof area`, `Green wall area`, `Green terrace area` |
| Other | `Major vertical penetrations`, `Occupant Storage area`, `Parking area`, `Unenclosed Building Feature: Covered Gallery`, `Vacant area`, `Energy reference area`, `NA` |

### Type Mapping: Current GeoJSON → Target

| Current `areaType` (German) | Target `type` | Comment |
|-----------------------------|---------------|---------|
| Bruttogeschossfläche | `Gross floor area` | SIA 416: BGF |
| Nettogeschossfläche | `Net room area` | SIA 416: NGF |
| Energiebezugsfläche | `Energy reference area` | SIA 380/1: EBF |
| Nutzfläche | `Net usable area` | SIA 416: NF |
| Verkehrsfläche | `Circulation area` | SIA 416: VF |
| Funktionsfläche | `Technical area` | SIA 416: FF |
| Konstruktionsfläche | `Construction area` | SIA 416: KF |
| Volumen | `NA` | Store as extensionData (not an area) |
| Arbeitsplätze | `NA` | Store as extensionData (count, not area) |
| Reinigungsfläche | `NA` | Store as extensionData (Swiss-specific) |

### Example: Area Measurement Object

```json
{
  "areaMeasurementId": "BBL-001-M1",
  "type": "Gross floor area",
  "value": 15000,
  "unit": "sqm",
  "validFrom": "2019-03-15T00:00:00Z",
  "validUntil": null,
  "bmEstimation": false,
  "accuracy": "Measured",
  "standard": "NA",
  "buildingIds": ["BBL-001"],
  "extensionData": {
    "siaStandard": "SIA 416",
    "source": "CAD/BIM",
    "originalUnit": "m²",
    "originalType": "Bruttogeschossfläche"
  }
}
```

### Example: Volume Measurement (Swiss Extension)

For measurements that don't fit the standard area types (volumes, counts):

```json
{
  "areaMeasurementId": "BBL-001-M4",
  "type": "NA",
  "value": 52500,
  "unit": "sqm",
  "validFrom": "2019-03-15T00:00:00Z",
  "validUntil": null,
  "bmEstimation": false,
  "accuracy": "Measured",
  "standard": "NA",
  "buildingIds": ["BBL-001"],
  "extensionData": {
    "siaStandard": "SIA 416",
    "source": "CAD/BIM",
    "originalUnit": "m³",
    "originalType": "Volumen",
    "measurementCategory": "volume"
  }
}
```

---

## 8. Entity: Document (Dokument)

Documents represent files and records associated with a building, such as floor plans, certificates, permits, and technical documentation.

### Schema Definition

| Field | PK/FK | Type | Description | Constraints | Alias (EN) | Alias (DE) | Comment |
|-------|-------|------|-------------|-------------|------------|------------|---------|
| **documentId** | PK | string | Unique identifier for the document. | **mandatory**, minLength: 1, maxLength: 50 | Document ID | Dokument-ID | Source: `dokumente[].id` |
| **name** | | string | Title or name of the document. | **mandatory**, minLength: 1, maxLength: 200 | Document Name | Dokumentname | Source: `dokumente[].titel` |
| **type** | | string, enum | Type of document. See [Document Types](#document-types). | **mandatory** | Document Type | Dokumenttyp | Source: `dokumente[].dokumentTyp` |
| **buildingIds** | FK | array[string] | Array of building IDs this document belongs to. | **mandatory**, minLength: 1 | Buildings | Gebäude | Derived from parent building |
| **validFrom** | | string | Document date or effective date. ISO 8601 format. | **mandatory**, minLength: 20 | Valid From | Gültig von | Source: `dokumente[].datum`, convert to ISO 8601 |
| eventType | | string, enum | Type of the event as domain event. Options: `DocumentAdded`, `DocumentUpdated`, `DocumentDeleted` | | Event Type | Ereignistyp | |
| extensionData | | object | Extension data for storing any custom data. | JSON object | Extension Data | Erweiterungsdaten | Container for Swiss-specific fields |
| fileFormat | | string | File format (e.g., "PDF", "DWG", "IFC"). | minLength: 1, maxLength: 20 | File Format | Dateiformat | Source: `dokumente[].dateiformat` |
| fileSize | | string | File size as string (e.g., "2.4 MB"). | minLength: 1, maxLength: 20 | File Size | Dateigrösse | Source: `dokumente[].dateigroesse` |
| url | | string | URL or path to the document file. | minLength: 1, maxLength: 500 | URL | URL | Source: `dokumente[].url` |
| description | | string | Description or notes about the document. | minLength: 1, maxLength: 1000 | Description | Beschreibung | |
| version | | string | Document version identifier. | minLength: 1, maxLength: 20 | Version | Version | |
| validUntil | | string | Expiry date for time-limited documents. ISO 8601 format. | minLength: 20, null allowed | Valid Until | Gültig bis | |

### Document Types

Common document types for buildings:

| Type | Description |
|------|-------------|
| `Grundriss` | Floor plan |
| `Bauplan` | Construction/building plan |
| `Energieausweis` | Energy certificate (GEAK, etc.) |
| `Baubewilligung` | Building permit |
| `Brandschutzkonzept` | Fire protection concept |
| `Mietvertrag` | Lease agreement |
| `Wartungsprotokoll` | Maintenance protocol |
| `Foto` | Photograph |
| `Sonstige` | Other |

### Example: Document Object

```json
{
  "documentId": "BBL-001-D1",
  "name": "Grundriss Erdgeschoss",
  "type": "Grundriss",
  "buildingIds": ["BBL-001"],
  "validFrom": "2019-03-15T00:00:00Z",
  "fileFormat": "PDF",
  "fileSize": "2.4 MB",
  "url": "/documents/BBL-001/grundriss-eg.pdf"
}
```

---

## 9. Entity: Contact (Kontakt)

Contacts represent persons associated with a building, such as property managers, caretakers, or portfolio managers.

### Schema Definition

| Field | PK/FK | Type | Description | Constraints | Alias (EN) | Alias (DE) | Comment |
|-------|-------|------|-------------|-------------|------------|------------|---------|
| **contactId** | PK | string | Unique identifier for the contact. | **mandatory**, minLength: 1, maxLength: 50 | Contact ID | Kontakt-ID | Source: `kontakte[].id` |
| **name** | | string | Full name of the contact person. | **mandatory**, minLength: 1, maxLength: 200 | Name | Name | Source: `kontakte[].name` |
| **role** | | string, enum | Role or function of the contact. See [Contact Roles](#contact-roles). | **mandatory** | Role | Rolle | Source: `kontakte[].rolle` |
| **buildingIds** | FK | array[string] | Array of building IDs this contact is associated with. | **mandatory**, minLength: 1 | Buildings | Gebäude | Derived from parent building |
| eventType | | string, enum | Type of the event as domain event. Options: `ContactAdded`, `ContactUpdated`, `ContactDeleted` | | Event Type | Ereignistyp | |
| extensionData | | object | Extension data for storing any custom data. | JSON object | Extension Data | Erweiterungsdaten | Container for Swiss-specific fields |
| organisation | | string | Organisation or department. | minLength: 1, maxLength: 200 | Organisation | Organisation | Source: `kontakte[].organisation` |
| phone | | string | Phone number. | minLength: 1, maxLength: 30 | Phone | Telefon | Source: `kontakte[].telefon` |
| email | | string | Email address. | minLength: 1, maxLength: 100, format: email | Email | E-Mail | Source: `kontakte[].email` |
| isPrimary | | boolean | Is this the primary contact for the building? | | Primary Contact | Hauptkontakt | |
| validFrom | | string | Contact assignment start date. ISO 8601 format. | minLength: 20 | Valid From | Gültig von | |
| validUntil | | string | Contact assignment end date. ISO 8601 format. | minLength: 20, null allowed | Valid Until | Gültig bis | |

### Contact Roles

Common contact roles for buildings:

| Role | Description |
|------|-------------|
| `Objektverantwortliche` | Property manager |
| `Hauswart` | Caretaker/janitor |
| `Portfolioverantwortliche` | Portfolio manager |
| `Technischer Leiter` | Technical manager |
| `Sicherheitsbeauftragter` | Security officer |
| `Notfallkontakt` | Emergency contact |
| `Mietervertreter` | Tenant representative |
| `Sonstige` | Other |

### Example: Contact Object

```json
{
  "contactId": "BBL-001-K1",
  "name": "Anna Müller",
  "role": "Objektverantwortliche",
  "buildingIds": ["BBL-001"],
  "organisation": "BBL Immobilienmanagement",
  "phone": "+41 58 462 12 34",
  "email": "anna.mueller@bbl.admin.ch",
  "isPrimary": true
}
```

---

## 10. Entity: Asset (Ausstattung)

Assets represent technical equipment, installations, and building components that require maintenance or tracking.

### Schema Definition

| Field | PK/FK | Type | Description | Constraints | Alias (EN) | Alias (DE) | Comment |
|-------|-------|------|-------------|-------------|------------|------------|---------|
| **assetId** | PK | string | Unique identifier for the asset. | **mandatory**, minLength: 1, maxLength: 50 | Asset ID | Ausstattungs-ID | Source: `ausstattung[].id` |
| **name** | | string | Name or designation of the asset. | **mandatory**, minLength: 1, maxLength: 200 | Asset Name | Bezeichnung | Source: `ausstattung[].bezeichnung` |
| **category** | | string, enum | Category of the asset. See [Asset Categories](#asset-categories). | **mandatory** | Category | Kategorie | Source: `ausstattung[].kategorie` |
| **buildingIds** | FK | array[string] | Array of building IDs this asset belongs to. | **mandatory**, minLength: 1 | Buildings | Gebäude | Derived from parent building |
| eventType | | string, enum | Type of the event as domain event. Options: `AssetAdded`, `AssetUpdated`, `AssetDeleted` | | Event Type | Ereignistyp | |
| extensionData | | object | Extension data for storing any custom data. | JSON object | Extension Data | Erweiterungsdaten | Container for Swiss-specific fields |
| manufacturer | | string | Manufacturer or vendor. | minLength: 1, maxLength: 200 | Manufacturer | Hersteller | Source: `ausstattung[].hersteller` |
| installationYear | | number | Year of installation. | minimum: 1800, maximum: 2100 | Installation Year | Einbaujahr | Source: `ausstattung[].baujahr` |
| location | | string | Location within the building. | minLength: 1, maxLength: 200 | Location | Standort | Source: `ausstattung[].standort` |
| serialNumber | | string | Serial number or asset tag. | minLength: 1, maxLength: 100 | Serial Number | Seriennummer | |
| status | | string | Current status (e.g., "In Betrieb", "Ausser Betrieb"). | minLength: 1, maxLength: 50 | Status | Status | |
| maintenanceInterval | | string | Maintenance interval (e.g., "Jährlich", "Monatlich"). | minLength: 1, maxLength: 50 | Maintenance Interval | Wartungsintervall | |
| lastMaintenanceDate | | string | Date of last maintenance. ISO 8601 format. | minLength: 20 | Last Maintenance | Letzte Wartung | |
| nextMaintenanceDate | | string | Date of next scheduled maintenance. ISO 8601 format. | minLength: 20 | Next Maintenance | Nächste Wartung | |

### Asset Categories

Common asset categories for buildings:

| Category | Description |
|----------|-------------|
| `HVAC` | Heating, ventilation, and air conditioning |
| `Aufzüge` | Elevators and lifts |
| `Brandschutz` | Fire protection systems |
| `Elektro` | Electrical systems |
| `Sanitär` | Plumbing and sanitary |
| `Sicherheit` | Security systems |
| `IT/Kommunikation` | IT and communication infrastructure |
| `Gebäudeautomation` | Building automation |
| `Sonstige` | Other |

### Example: Asset Object

```json
{
  "assetId": "BBL-001-A1",
  "name": "Fernwärmeübergabestation",
  "category": "HVAC",
  "buildingIds": ["BBL-001"],
  "manufacturer": "Siemens AG",
  "installationYear": 2019,
  "location": "Untergeschoss Technikraum",
  "status": "In Betrieb",
  "maintenanceInterval": "Jährlich"
}
```

---

## 11. Entity: Contract (Vertrag)

Contracts represent service agreements, maintenance contracts, and other contractual arrangements associated with a building.

### Schema Definition

| Field | PK/FK | Type | Description | Constraints | Alias (EN) | Alias (DE) | Comment |
|-------|-------|------|-------------|-------------|------------|------------|---------|
| **contractId** | PK | string | Unique identifier for the contract. | **mandatory**, minLength: 1, maxLength: 50 | Contract ID | Vertrags-ID | Source: `vertraege[].id` |
| **type** | | string, enum | Type of contract. See [Contract Types](#contract-types). | **mandatory** | Contract Type | Vertragsart | Source: `vertraege[].vertragsart` |
| **buildingIds** | FK | array[string] | Array of building IDs this contract belongs to. | **mandatory**, minLength: 1 | Buildings | Gebäude | Derived from parent building |
| **validFrom** | | string | Contract start date. ISO 8601 format. | **mandatory**, minLength: 20 | Valid From | Vertragsbeginn | Source: `vertraege[].vertragsbeginn`, convert to ISO 8601 |
| eventType | | string, enum | Type of the event as domain event. Options: `ContractAdded`, `ContractUpdated`, `ContractDeleted` | | Event Type | Ereignistyp | |
| extensionData | | object | Extension data for storing any custom data. | JSON object | Extension Data | Erweiterungsdaten | Container for country-specific fields |
| contractPartner | | string | Name of the contract partner or vendor. | minLength: 1, maxLength: 200 | Contract Partner | Vertragspartner | Source: `vertraege[].vertragspartner` |
| validUntil | | string | Contract end date. ISO 8601 format. | minLength: 20, null allowed | Valid Until | Vertragsende | Source: `vertraege[].vertragsende`, convert to ISO 8601 |
| amount | | number | Contract value or annual amount. | | Amount | Betrag | Source: `vertraege[].betrag` |
| currency | | string | Currency code (ISO 4217). | minLength: 3, maxLength: 3 | Currency | Währung | Default: "CHF" for Swiss contracts |
| status | | string | Current contract status (e.g., "Aktiv", "Beendet"). | minLength: 1, maxLength: 50 | Status | Status | Source: `vertraege[].status` |

### Contract Types

Common contract types for buildings:

| Type | Description |
|------|-------------|
| `Wartungsvertrag` | Maintenance contract |
| `Reinigungsvertrag` | Cleaning contract |
| `Sicherheitsdienst` | Security services |
| `Mietvertrag` | Lease agreement |
| `Servicevertrag` | General service contract |
| `Versicherung` | Insurance contract |
| `Sonstige` | Other |

### Example: Contract Object

```json
{
  "contractId": "BBL-001-V1",
  "type": "Wartungsvertrag",
  "buildingIds": ["BBL-001"],
  "validFrom": "2020-01-01T00:00:00Z",
  "validUntil": "2025-12-31T00:00:00Z",
  "contractPartner": "Siemens Building Technologies AG",
  "amount": 85000,
  "currency": "CHF",
  "status": "Aktiv"
}
```

---

## 12. Entity: Cost (Kosten)

Costs represent operating expenses, utility costs, and other recurring costs associated with a building. Costs are typically categorized using standard cost group codes.

### Schema Definition

| Field | PK/FK | Type | Description | Constraints | Alias (EN) | Alias (DE) | Comment |
|-------|-------|------|-------------|-------------|------------|------------|---------|
| **costId** | PK | string | Unique identifier for the cost entry. | **mandatory**, minLength: 1, maxLength: 50 | Cost ID | Kosten-ID | Source: `kosten[].id` |
| **costGroup** | | string | Cost group code (e.g., DIN 18960 or Swiss SN 506 511). | **mandatory**, minLength: 1, maxLength: 10 | Cost Group | Kostengruppe | Source: `kosten[].kostengruppe` |
| **costType** | | string | Description of the cost type. | **mandatory**, minLength: 1, maxLength: 200 | Cost Type | Kostenart | Source: `kosten[].kostenart` |
| **buildingIds** | FK | array[string] | Array of building IDs this cost belongs to. | **mandatory**, minLength: 1 | Buildings | Gebäude | Derived from parent building |
| eventType | | string, enum | Type of the event as domain event. Options: `CostAdded`, `CostUpdated`, `CostDeleted` | | Event Type | Ereignistyp | |
| extensionData | | object | Extension data for storing any custom data. | JSON object | Extension Data | Erweiterungsdaten | Container for country-specific fields |
| amount | | number | Cost amount. | | Amount | Betrag | Source: `kosten[].betrag` |
| unit | | string | Unit of the cost (e.g., "CHF/Jahr", "CHF/Monat"). | minLength: 1, maxLength: 20 | Unit | Einheit | Source: `kosten[].einheit` |
| currency | | string | Currency code (ISO 4217). | minLength: 3, maxLength: 3 | Currency | Währung | Extracted from `kosten[].einheit`, e.g., "CHF" |
| period | | string, enum | Cost period. See [Cost Periods](#cost-periods). | | Period | Periode | Derived from `kosten[].einheit` |
| referenceDate | | string | Reference date for the cost entry. ISO 8601 format. | minLength: 20 | Reference Date | Stichtag | Source: `kosten[].stichtag`, convert to ISO 8601 |

### Cost Periods

| Value | Description |
|-------|-------------|
| `Annual` | Yearly cost |
| `Monthly` | Monthly cost |
| `Quarterly` | Quarterly cost |
| `OneTime` | One-time cost |

### Cost Groups (Swiss SN 506 511)

Common cost group codes for building operations:

| Code | Category | Description |
|------|----------|-------------|
| 311 | Operating | Electricity supply |
| 312 | Operating | Heating energy |
| 313 | Operating | Water supply |
| 321 | Operating | Wastewater disposal |
| 330 | Operating | Interior cleaning |
| 350 | Operating | Security services |
| 410 | Maintenance | Building construction maintenance |
| 420 | Maintenance | Technical installations maintenance |

### Example: Cost Object

```json
{
  "costId": "BBL-001-K1",
  "costGroup": "311",
  "costType": "Stromversorgung",
  "buildingIds": ["BBL-001"],
  "amount": 185000,
  "unit": "CHF/Jahr",
  "currency": "CHF",
  "period": "Annual",
  "referenceDate": "2024-12-01T00:00:00Z"
}
```

---

## 13. Entity: Operational Measurement (Preview)

> **Note:** This entity is not currently implemented in the demo. It is documented here for future implementation planning.

Operational measurements track resource consumption (energy, water, waste) and emissions data for buildings. This entity enables ESG reporting, carbon footprint calculations, and sustainability monitoring.

### Schema Definition

| Field | PK/FK | Type | Description | Constraints | Alias (EN) | Alias (DE) | Comment |
|-------|-------|------|-------------|-------------|------------|------------|---------|
| **operationalMeasurementId** | PK | string | Unique identifier; must either originate from the previous system or be explicitly defined. | **mandatory**, minLength: 1, maxLength: 50 | Measurement ID | Betriebs-ID | |
| **buildingId** | FK | string | Unique identifier of the building this measurement belongs to. | **mandatory**, minLength: 1, maxLength: 50 | Building ID | Objekt-ID | |
| **type** | | string, enum | General type of operational measurement. See [Operational Measurement Types](#operational-measurement-types). | **mandatory** | Type | Art | |
| **subType** | | string, enum | Specific type of operational measurement. See [Operational Measurement SubTypes](#operational-measurement-subtypes). | **mandatory** | Sub Type | Unterart | |
| **value** | | number | Value of the measurement. | **mandatory** | Value | Wert | |
| **unit** | | string, enum | Unit of measurement. See [Operational Measurement Units](#operational-measurement-units). | **mandatory** | Unit | Einheit | |
| **validFrom** | | string | Date validity starts. ISO 8601 format: `yyyy-mm-ddThh:mm:ssZ` | **mandatory**, minLength: 20 | Valid From | Gültig von | |
| **validUntil** | | string | Date validity ends. ISO 8601 format: `yyyy-mm-ddThh:mm:ssZ` | **mandatory**, minLength: 20 | Valid Until | Gültig bis | |
| **procuredBy** | | string, enum | Operational control information. See [Procurement Types](#procurement-types). | **mandatory** | Procured By | Beschaffung | |
| **purpose** | | string, enum | Purpose of resource consumption. See [Purpose Types](#purpose-types). | **mandatory** | Purpose | Verwendungszweck | |
| **spaceType** | | string, enum | Reference to specific space type. See [Space Types](#space-types). | **mandatory** | Space Type | Raumtyp | |
| accuracy | | string, enum | Accuracy of measurement. See [Accuracy Options](#accuracy-options). | | Accuracy | Genauigkeit | |
| customerInfoSource | | string, enum | Source of data. See [Data Source Types](#data-source-types). | | Data Source | Datenquelle | |
| dataProvider | | string | Name of the data provider. | minLength: 1, maxLength: 50 | Data Provider | Datenanbieter | |
| eventType | | string, enum | Type of the event as domain event. Options: `OperationalMeasurementAdded`, `OperationalMeasurementUpdated`, `OperationalMeasurementDeleted` | | Event Type | Ereignistyp | |
| extensionData | | object | Extension data for storing any custom data. | JSON object | Extension Data | Erweiterungsdaten | |
| isAutoApproved | | boolean | Determines whether this value is auto approved or requires approval. | | Auto Approved | Auto-genehmigt | |
| lifeCycleAssessment | | array[string] | Life cycle assessment stages (ISO 14040). Options: `A1`, `A2`, `A3`, `A4`, `A5`, `B1`, `B2`, `B3`, `B4`, `B5`, `B6`, `B7`, `C1`, `C2`, `C3`, `C4`, `D` | | LCA Stages | LCA-Phasen | |
| measurementDate | | string | Date measurement was taken. ISO 8601 format. | minLength: 20 | Measurement Date | Messdatum | |
| name | | string | Any descriptive name. | | Name | Bezeichnung | |
| parentId | FK | string | Parent entity ID. | | Parent ID | Übergeordnete ID | |
| postingDate | | string | Date measurement was posted. ISO 8601 format. | minLength: 20 | Posting Date | Buchungsdatum | |
| sensorId | | string | ID of meter for this reading. | | Sensor ID | Zähler-ID | |
| valuationIds | FK | array[string] | Array of valuation IDs. | | Valuations | Bewertungen | |

### Operational Measurement Types

| Value | Description |
|-------|-------------|
| `Energy` | Energy consumption (electricity, gas, heating, etc.) |
| `Water` | Water consumption and discharge |
| `Waste` | Waste generation and disposal |
| `Fugitive` | Fugitive emissions (refrigerants, gases) |

### Operational Measurement Units

| Value | Description |
|-------|-------------|
| `kWh` | Kilowatt-hours (energy) |
| `cubm` | Cubic meters (m³) - water, gas |
| `kg` | Kilograms (waste, emissions) |

### Procurement Types

Options for `procuredBy` field:

`Procured by third party`, `Self-procured`, `Unspecified`

### Purpose Types

Options for `purpose` field:

`Space heating`, `Water heating`, `Heating (unspecified)`, `Cooling`, `Lighting`, `Elevator`, `Appliances`, `Other`, `Unspecified`, `Heat pump`, `EV charging`

### Space Types

Options for `spaceType` field:

`Shared services/Common spaces`, `Tenant space`, `Landlord space`, `Whole building`, `Unspecified`, `Shared services`, `Common spaces`, `Outdoor`, `Exterior area`, `Parking`

### Data Source Types

| Value | Description |
|-------|-------------|
| `Export` | Exported from external system |
| `Survey` | Collected via survey |
| `Meter` | Read from meter |
| `Invoice` | Extracted from invoice |

### Operational Measurement SubTypes

| Category | SubTypes |
|----------|----------|
| Electricity | `Electricity from grid (green electricity contract)`, `Electricity from grid (normal contract)`, `Electricity self-generated & exported`, `Electricity self-generated & consumed`, `Electricity (unspecified)`, `REC` |
| Gas | `Natural gas (standard mix)`, `Green natural gas`, `Natural gas (unspecified)` |
| Other Energy | `Oil-based fuels`, `Fuel (unspecified)`, `District heating`, `District heating (green contract)`, `District cooling`, `District cooling (green contract)`, `Biomass`, `Solar thermal`, `Geothermal` |
| Water | `Fresh water (municipal water supply)`, `Ground water (collected on site)`, `Rain water (collected on site)`, `Reclaimed water`, `Water discharge`, `Water consumption (unspecified)`, `Water supply` |
| Waste (Non-hazardous) | `Recycling: non-hazardous`, `Incineration: non-hazardous`, `Waste to energy: non-hazardous`, `Landfill: non-hazardous`, `Reuse: non-hazardous`, `Other/Unknown: non-hazardous` |
| Waste (Hazardous) | `Recycling: hazardous`, `Incineration: hazardous`, `Waste to energy: hazardous`, `Landfill: hazardous`, `Reuse: hazardous`, `Other/Unknown: hazardous` |
| Fugitive Emissions | `Carbon dioxide (CO2)`, `Methane (CH4)`, `Nitrous oxide (N2O)`, `Sulfur hexafluoride (SF6)`, `Nitrogen trifluoride (NF3)`, various refrigerants (R-11, R-12, R-22, R-134a, etc.) |

### Accuracy Options

| Category | Options |
|----------|---------|
| Direct | `Missing`, `Estimated`, `Metered`, `Extrapolated`, `Planned`, `Simulated`, `Unspecified`, `Normalised`, `Implausible` |
| Calculated | `Calculated based on estimated data`, `Calculated based on metered data`, `Calculated based on extrapolated data`, `Calculated based on planned data`, `Calculated based on simulated data`, `Calculated based on data with unspecified accuracy`, `Calculated based on normalised data`, `Calculated based on implausible data` |
| Projection | `Projection based on estimated data`, `Projection based on metered data`, `Projection based on extrapolated data`, `Projection based on planned data`, `Projection based on simulated data`, `Projection based on data with unspecified accuracy`, `Projection based on normalised data`, `Projection based on implausible data` |
| Calculated from Projection | `Calculated based on projected estimated data`, `Calculated based on projected metered data`, `Calculated based on projected extrapolated data`, `Calculated based on projected planned data`, `Calculated based on projected simulated data`, `Calculated based on projected data with unspecified accuracy`, `Calculated based on projected normalised data` |
| Other | `Retrofit scenario` |

### Example: Operational Measurement Object

```json
{
  "operationalMeasurementId": "BBL-001-OPM-001",
  "buildingId": "BBL-001",
  "type": "Energy",
  "subType": "District heating",
  "value": 125000,
  "unit": "kWh",
  "validFrom": "2024-01-01T00:00:00Z",
  "validUntil": "2024-12-31T00:00:00Z",
  "procuredBy": "Procured by third party",
  "purpose": "Space heating",
  "spaceType": "Whole building",
  "accuracy": "Metered",
  "customerInfoSource": "Invoice",
  "dataProvider": "Energie Wasser Bern",
  "measurementDate": "2024-12-01T00:00:00Z",
  "lifeCycleAssessment": ["B6"]
}
```

---

## 14. Related Entities (Preview)

The following entities are related to buildings and will be documented in separate sections:

| Entity | Description | Relationship |
|--------|-------------|--------------|
| ~~**Site**~~ | ~~A logical grouping of buildings~~ | *(documented above)* |
| ~~**Address**~~ | ~~Physical address of a building~~ | *(documented above)* |
| ~~**Area Measurement**~~ | ~~Area and volume measurements~~ | *(documented above)* |
| ~~**Land**~~ | ~~Land parcels~~ | *(documented above)* |
| ~~**Document**~~ | ~~Related documents (plans, certificates)~~ | *(documented above)* |
| ~~**Contact**~~ | ~~Contact persons for the building~~ | *(documented above)* |
| ~~**Asset**~~ | ~~Technical equipment and installations~~ | *(documented above)* |
| ~~**Contract**~~ | ~~Service and maintenance contracts~~ | *(documented above)* |
| ~~**Cost**~~ | ~~Operating expenses and utility costs~~ | *(documented above)* |
| ~~**Operational Measurement**~~ | ~~Energy, water, waste consumption data~~ | *(documented above - preview)* |
| **Certificate** | Building certifications (LEED, BREEAM, etc.) | 1 Building → n Certificates |
| **Valuation** | Property valuations | 1 Building → n Valuations |

---

## 15. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1.0 | 2024-XX-XX | - | Initial draft - Building entity |
| 0.2.0 | 2024-XX-XX | - | Added Address entity with Swiss extensions |
| 0.3.0 | 2024-XX-XX | - | Added Site entity with Swiss extensions |
| 0.4.0 | 2024-XX-XX | - | Consolidated to single schema table per entity with Comment column |
| 0.5.0 | 2024-XX-XX | - | Added Area Measurement (Bemessung) entity with SIA type mappings |
| 0.6.0 | 2024-XX-XX | - | Added Land (Grundstück) entity with Swiss cadastral extensions |

---

## 16. References

- [SIA 416](https://www.sia.ch/) - Swiss Standard for areas in building construction
- [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) - Date and time format
- [ISO 3166](https://www.iso.org/iso-3166-country-codes.html) - Country codes
- [GeoJSON Specification](https://geojson.org/) - Geographic JSON format
- [LV95](https://www.swisstopo.admin.ch/en/knowledge-facts/surveying-geodesy/reference-frames/local/lv95.html) - Swiss coordinate reference system
- EGID/EGRID - Swiss Federal Building/Property Identifiers
