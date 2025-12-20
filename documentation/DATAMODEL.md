# BBL GIS Immobilienportfolio - Data Model

This document describes the data model for the BBL Immobilienportfolio application.

---

## Table of Contents

1. [Introduction](#1-introduction)
   - 1.1 [Purpose & Scope](#11-purpose--scope)
   - 1.2 [Design Principles](#12-design-principles)
   - 1.3 [Swiss Context](#13-swiss-context)
   - 1.4 [BuildingMinds Alignment](#14-buildingminds-alignment)
2. [Architecture Overview](#2-architecture-overview)
   - 2.1 [Entity Relationship Diagram](#21-entity-relationship-diagram)
   - 2.2 [Entity Hierarchy](#22-entity-hierarchy)
   - 2.3 [Demo vs. Production Implementation](#23-demo-vs-production-implementation)
3. [Core Entities](#3-core-entities)
   - 3.1 [Site (Standort) [Preview]](#31-site-standort-preview)
   - 3.2 [Land (Grundstück)](#32-land-grundstück)
   - 3.3 [Building (Gebäude)](#33-building-gebäude)
   - 3.4 [Address (Adresse)](#34-address-adresse)
   - 3.5 [Floor (Geschoss)](#35-floor-geschoss)
   - 3.6 [Space (Raum)](#36-space-raum)
4. [Measurement Entities](#4-measurement-entities)
   - 4.1 [Area Measurement (Bemessung)](#41-area-measurement-bemessung)
   - 4.2 [Operational Measurement (Betriebsmessung) [Preview]](#42-operational-measurement-betriebsmessung-preview)
5. [Supporting Entities](#5-supporting-entities)
   - 5.1 [Document (Dokument)](#51-document-dokument)
   - 5.2 [Contact (Kontakt)](#52-contact-kontakt)
   - 5.3 [Asset (Ausstattung)](#53-asset-ausstattung)
   - 5.4 [Contract (Vertrag)](#54-contract-vertrag)
   - 5.5 [Cost (Kosten)](#55-cost-kosten)
6. [Future Entities [Preview]](#6-future-entities-preview)
   - 6.1 [Certificate (Zertifikat)](#61-certificate-zertifikat)
   - 6.2 [Valuation (Bewertung)](#62-valuation-bewertung)
7. [Appendix A: Reference Tables](#7-appendix-a-reference-tables)
   - A.1 [Shared Enumerations](#a1-shared-enumerations)
   - A.2 [Building Types](#a2-building-types)
   - A.3 [Area Types & SIA Mappings](#a3-area-types--sia-mappings)
   - A.4 [Operational Measurement Types](#a4-operational-measurement-types)
   - A.5 [Document, Contact & Contract Types](#a5-document-contact--contract-types)
   - A.6 [Asset Categories & Cost Groups](#a6-asset-categories--cost-groups)
8. [Appendix B: Data Transformation Guide](#8-appendix-b-data-transformation-guide)
   - B.1 [Value Conversions](#b2-value-conversions)
   - B.2 [ISO 8601 Date Handling](#b3-iso-8601-date-handling)
9. [Version History](#9-version-history)
10. [References](#10-references)

---

## 1. Introduction

### 1.1 Purpose & Scope

This document defines the canonical data model for the BBL Immobilienportfolio application, covering the federal real estate portfolio managed by the Swiss Federal Office for Buildings and Logistics (BBL). The model supports:

- Portfolio visualization and GIS-based exploration
- Building master data management
- Area measurements according to Swiss standards
- Operational data tracking (energy, water, waste)
- Document and contract management

### 1.2 Design Principles

The data model follows these core principles:

| Principle | Description |
|-----------|-------------|
| **Extensibility** | Swiss-specific fields are stored in `extensionData` objects, preserving compatibility with the base schema |
| **Traceability** | All entities include `validFrom`/`validUntil` for temporal tracking and `eventType` for domain events |
| **Standards Compliance** | Uses ISO 8601 for dates, ISO 3166 for countries, and aligns with Swiss SIA standards for measurements |
| **Separation of Concerns** | Core building data is separate from operational measurements, documents, and contracts |
| **Bilingual Support** | All enumerations provide both English (EN) and German (DE) values; the current demo uses German values |

### 1.3 Swiss Context

The model incorporates several Switzerland-specific standards and identifiers:

| Standard/Identifier | Description | Usage |
|---------------------|-------------|-------|
| **EGID** | Eidgenössischer Gebäudeidentifikator (Federal Building Identifier) | Unique building identification across federal systems |
| **EGRID** | Eidgenössischer Grundstücksidentifikator (Federal Property Identifier) | Unique land parcel identification |
| **SIA 416** | Swiss standard for areas and volumes in building construction | Area measurement types (BGF, NGF, EBF, etc.) |
| **SIA 380/1** | Energy performance of buildings | Energy reference area (Energiebezugsfläche) |
| **LV95** | Swiss coordinate reference system | Alternative to WGS84 for precise Swiss coordinates |
| **SN 506 511** | Swiss standard for building operating costs | Cost group classification |

### 1.4 BuildingMinds Alignment

This data model is designed for compatibility with the BuildingMinds platform schema. Key alignment points:

- Entity structure follows BuildingMinds conventions (PK/FK relationships, mandatory fields)
- Standard enumerations match BuildingMinds value sets where applicable
- Swiss-specific extensions are isolated in `extensionData` to maintain portability
- Event types follow domain event patterns (`EntityAdded`, `EntityUpdated`, `EntityDeleted`)

---

## 2. Architecture Overview

### 2.1 Entity Relationship Diagram

```mermaid
erDiagram
    Site ||--o{ Building : contains
    Site ||--o{ Land : contains
    Building ||--o{ Address : "has"
    Building ||--o{ Floor : "has"
    Building ||--o{ AreaMeasurement : "has"
    Building ||--o{ Document : "has"
    Building ||--o{ Contact : "has"
    Building ||--o{ Contract : "has"
    Building ||--o{ Certificate : "has"
    Building ||--o{ Asset : "has"
    Building ||--o{ Cost : "has"
    Building ||--o{ OperationalMeasurement : "has"
    Floor ||--o{ Space : "has"

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

    Floor {
        string floorId PK
        string buildingId FK
        string name
        number floorNumber
    }

    Space {
        string spaceId PK
        string floorId FK
        string name
        string type
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

### 2.2 Entity Hierarchy

Entities are organized into functional groups:

| Layer | Entities | Description |
|-------|----------|-------------|
| **Core** | Site, Land, Building, Address, Floor, Space | Primary real estate objects, their locations, and internal structures |
| **Measurement** | Area Measurement, Operational Measurement | Quantitative data (areas, volumes, consumption) |
| **Supporting** | Document, Contact, Asset, Contract, Cost | Administrative and operational associations |
| **Future** | Certificate, Valuation | Planned entities for certifications and appraisals |

### 2.3 Demo vs. Production Implementation

**Current Demo Implementation:**

For the demo stage, all entities are stored in a single GeoJSON file:

```
data/buildings.geojson
```

Related entities (Bemessungen, Dokumente, Kontakte, Verträge) are embedded as arrays within each building's properties.

**Production Implementation:**

In a production system, these would be separate entities with foreign key relationships, enabling:

- Independent lifecycle management per entity
- Many-to-many relationships (e.g., one contact managing multiple buildings)
- Efficient querying and filtering
- Event sourcing for audit trails

---

## 3. Core Entities

### 3.1 Site (Standort) [Preview]

> **Note:** This entity is not currently implemented in the demo. It is documented here for future implementation planning.

A site represents a logical grouping of buildings, such as a campus, property, or land parcel. Buildings belong to exactly one site.

#### Schema Definition

| Field | PK/FK | Type | Description | Constraints | Alias (EN) | Alias (DE) |
|-------|-------|------|-------------|-------------|------------|------------|
| **siteId** | PK | string | Unique identifier; must either originate from the previous system or be explicitly defined. | **mandatory**, minLength: 1, maxLength: 50 | Site ID | Standort-ID |
| **name** | | string | Name of the site. | **mandatory**, minLength: 1, maxLength: 50 | Site Name | Standortbezeichnung |
| **type** | | string, enum | Type of site. See [Site Types](#a1-shared-enumerations). | **mandatory** | Site Type | Standortart |
| **addressIds** | FK | array[string] | Array of address IDs linked to this site. | **mandatory**, minLength: 1, maxLength: 50 per ID | Addresses | Adressen |
| **validFrom** | | string | The record can be used from this date onwards. ISO 8601 format: `yyyy-mm-ddThh:mm:ssZ` | **mandatory**, minLength: 20 | Valid From | Gültig von |
| **validUntil** | | string | The record is valid until this date. ISO 8601 format: `yyyy-mm-ddThh:mm:ssZ` | **mandatory**, minLength: 20, null allowed | Valid Until | Gültig bis |
| energyRatingIds | FK | array[string] | Array of energy rating IDs. | minLength: 1, maxLength: 50 per ID | Energy Ratings | Energiebewertungen |
| eventType | | string, enum | Type of the event as domain event. Options: `SiteAdded`, `SiteUpdated`, `SiteDeleted` | | Event Type | Ereignistyp |
| extensionData | | object | Extension data for storing any custom data. | JSON object | Extension Data | Erweiterungsdaten |
| siteCode | | string | User specific site code. | minLength: 1, maxLength: 70 | Site Code | Standortcode |
| status | | string | Status of site. | minLength: 1, maxLength: 50 | Status | Status |

#### Swiss Extension Fields (extensionData)

| Field | PK/FK | Type | Description | Constraints | Alias (EN) | Alias (DE) |
|-------|-------|------|-------------|-------------|------------|------------|
| extensionData.egrid | FK | string | Eidgenössischer Grundstücksidentifikator (Federal Property Identifier). Reference to national Swiss cadastre. | minLength: 14, maxLength: 14 | EGRID | EGRID |
| extensionData.parzellenNummer | | string | Official parcel number. | | Parcel Number | Parzellennummer |
| extensionData.grundbuchKreis | | string | Land registry district. | | Land Registry | Grundbuchkreis |
| extensionData.katasterNummer | | string | Cadastral number. | | Cadastral No. | Katasternummer |
| extensionData.teilportfolioGruppe | | string | Sub-portfolio group (e.g., "Bundesverwaltung"). | | Portfolio Group | Teilportfolio Gruppe |

#### Example: Site Object

```json
{
  "siteId": "BE-3003-1001",
  "name": "Bundesplatz Parzelle A",
  "type": "Büro",
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

> **Note:** The demo uses German values (e.g., `"type": "Büro"`). For English implementations, use `"type": "Office"`.

---

### 3.2 Land (Grundstück)

Land represents a parcel of land or plot that belongs to a site. In the current demo, land information is partially embedded in building properties (`grundstueck_id`, `grundstueck_name`). In a production system, Land would be a separate entity allowing multiple land parcels per site.

#### Schema Definition

| Field | PK/FK | Type | Description | Constraints | Alias (EN) | Alias (DE) |
|-------|-------|------|-------------|-------------|------------|------------|
| **landId** | PK | string | Unique identifier; must either originate from the previous system or be explicitly defined. | **mandatory**, minLength: 1, maxLength: 50 | Land ID | Grundstück-ID |
| **name** | | string | Name of land (e.g., park, garden, parking). | **mandatory**, minLength: 1, maxLength: 200 | Land Name | Grundstückbezeichnung |
| **siteId** | FK | string | Refers to the site which the land belongs to. | **mandatory**, minLength: 1, maxLength: 50 | Site ID | Standort-ID |
| **typeOfOwnership** | | string, enum | Is the land owned or leased? See [Ownership Types](#a1-shared-enumerations). | **mandatory** | Ownership | Eigentum |
| **validFrom** | | string | The record can be used from this date onwards. ISO 8601 format: `yyyy-mm-ddThh:mm:ssZ` | **mandatory**, minLength: 20 | Valid From | Gültig von |
| **validUntil** | | string | The record is valid until this date. ISO 8601 format: `yyyy-mm-ddThh:mm:ssZ` | **mandatory**, minLength: 20, null allowed | Valid Until | Gültig bis |
| addressIds | FK | array[string] | Array of address IDs linked to this land. | minLength: 1, maxLength: 50 per ID | Addresses | Adressen |
| eventType | | string, enum | Type of the event as domain event. Options: `LandAdded`, `LandUpdated`, `LandDeleted` | | Event Type | Ereignistyp |
| extensionData | | object | Extension data for storing any custom data. | JSON object | Extension Data | Erweiterungsdaten |
| landCode | | string | User specific land code. | minLength: 1, maxLength: 70 | Land Code | Grundstückcode |
| landCoverage | | string | Development level of land. | minLength: 1, maxLength: 50 | Land Coverage | Bebauungsgrad |
| landParcelNr | | string | District/zoning number registered for the plot of land. | minLength: 1, maxLength: 50 | Parcel Number | Parzellennummer |
| selfUse | | boolean | Is the land self-used? | | Self Use | Eigennutzung |
| status | | string | Status of land. | minLength: 1, maxLength: 50 | Status | Status |
| tenantStructure | | string, enum | Tenant structure. See [Tenant Structure](#a1-shared-enumerations). | | Tenant Structure | Mieterstruktur |
| valuationIds | FK | array[string] | Array of valuation IDs. | minLength: 1, maxLength: 50 per ID | Valuations | Bewertungen |

#### Swiss Extension Fields (extensionData)

| Field | PK/FK | Type | Description | Constraints | Alias (EN) | Alias (DE) |
|-------|-------|------|-------------|-------------|------------|------------|
| extensionData.egrid | FK | string | Eidgenössischer Grundstücksidentifikator (Federal Property Identifier). Reference to national Swiss cadastre. | minLength: 14, maxLength: 14 | EGRID | EGRID |

#### Example: Land Object

```json
{
  "landId": "BE-3003-1001",
  "name": "Bundesplatz Parzelle A",
  "typeOfOwnership": "Eigentümer",
  "validFrom": "1900-01-01T00:00:00Z",
  "validUntil": null,
  "addressIds": ["BBL-001-ADDR-1"],
  "status": "Aktiv",
  "extensionData": {
    "egrid": "CH123456789012"
  }
}
```

> **Note:** The demo uses German values (e.g., `"typeOfOwnership": "Eigentümer"`). For English implementations, use `"typeOfOwnership": "Owner"`.

---

### 3.3 Building (Gebäude)

The building is the core entity representing a physical structure in the portfolio.

#### Schema Definition

| Field | PK/FK | Type | Description | Constraints | Alias (EN) | Alias (DE) |
|-------|-------|------|-------------|-------------|------------|------------|
| **buildingId** | PK | string | Unique identifier; must either originate from the previous system or be explicitly defined. | **mandatory**, minLength: 1, maxLength: 50 | Building ID | Objekt-ID |
| **name** | | string | User specific building name (e.g., "Bundeshaus West", "EMEA Headquarter"). | **mandatory**, minLength: 1, maxLength: 200 | Building Name | Bezeichnung |
| **siteId** | FK | string | Refers to the site which the building belongs to. | **mandatory**, minLength: 1, maxLength: 50 | Site ID | Standort-ID |
| **primaryTypeOfBuilding** | | string, enum | Primary type of building use. See [Building Types](#a2-building-types). | **mandatory** | Building Type | Objektart 1 |
| **typeOfOwnership** | | string, enum | Is the building owned or leased? See [Ownership Types](#a1-shared-enumerations). | **mandatory** | Ownership | Art Eigentum |
| **validFrom** | | string | The record can be used from this date onwards. ISO 8601 format: `yyyy-mm-ddThh:mm:ssZ` | **mandatory**, minLength: 20 | Valid From | Gültig von |
| **validUntil** | | string | The record is valid until this date. ISO 8601 format: `yyyy-mm-ddThh:mm:ssZ` | **mandatory**, minLength: 20, null allowed | Valid Until | Gültig bis |
| addressIds | FK | array[string] | Array of address IDs linked to this building. | minLength: 1, maxLength: 50 per ID | Addresses | Adressen |
| airConditioning | | boolean | Does the building have air conditioning? | | Air Conditioning | Klimaanlage |
| buildingCode | | string | User specific building code. | minLength: 1, maxLength: 70 | Building Code | Objektcode |
| buildingPermitDate | | string | Building permit date. ISO 8601 format. | minLength: 20 | Permit Date | Baubewilligung |
| certificateIds | FK | array[string] | Array of certificate IDs. | minLength: 1, maxLength: 50 per ID | Certificates | Zertifikate |
| constructionYear | | string | Year of construction. ISO 8601 format. Use `yyyy-01-01T00:00:00Z` if only year is known. | minLength: 20 | Construction Year | Baujahr |
| electricVehicleChargingStations | | number | Number of EV charging stations. | maximum: 9999 | EV Charging | E-Ladestationen |
| energyEfficiencyClass | | string | Energy Efficiency Class of Building (e.g., "A", "B", "C"). | minLength: 1, maxLength: 50 | Energy Class | Energieklasse |
| energyRatingIds | FK | array[string] | Array of energy rating IDs. | minLength: 1, maxLength: 50 per ID | Energy Ratings | Energiebewertungen |
| eventType | | string, enum | Type of the event as domain event. Options: `BuildingAdded`, `BuildingUpdated`, `BuildingDeleted` | | Event Type | Ereignistyp |
| expectedLifeEndDate | | string | Expected end date of building lifecycle. ISO 8601 format. | minLength: 20 | Life End Date | Nutzungsende |
| extensionData | | object | Extension data for storing any custom data. | JSON object | Extension Data | Erweiterungsdaten |
| fossilFuelExposure | | string, enum | Fossil fuel exposure type. See [Fossil Fuel Exposure](#a1-shared-enumerations). | | Fossil Fuel Exposure | Fossile Brennstoffe |
| monumentProtection | | boolean | Is the building declared as a protected monument? | | Monument Protection | Denkmalschutz |
| netZeroEnergyBuilding | | boolean | Is the building a net zero energy building? | | Net Zero Building | Nullenergiegebäude |
| numberOfEmployees | | number | Number of employees. | maximum: 999999 | Employees | Mitarbeiter |
| parkingSpaces | | number | Number of parking spaces. | maximum: 9999 | Parking Spaces | Parkplätze |
| percentageOfOwnership | | number | Percentage of ownership. | maximum: 100 | Ownership % | Eigentumsanteil |
| primaryEnergyType | | string, enum | Primary type of energy used. See [Energy Types](#a1-shared-enumerations). | | Energy Type | Energieart |
| primaryWaterType | | string | Type of water used. | minLength: 1, maxLength: 50 | Water Type | Wasserart |
| secondaryHeatingType | | string, enum | Secondary type of heating. See [Heating Types](#a1-shared-enumerations). | | Heating Type | Heizungsart |
| secondaryTypeOfBuilding | | string, enum | Secondary type of building use. See [Building Types](#a2-building-types). | | Building Type 2 | Objektart 2 |
| selfUse | | boolean | Is the building self-used? | | Self Use | Eigennutzung |
| status | | string | Status of building (e.g., "In Betrieb", "In Renovation"). | minLength: 1, maxLength: 50 | Status | Status |
| tenantStructure | | string, enum | Tenant structure. See [Tenant Structure](#a1-shared-enumerations). | | Tenant Structure | Mieterstruktur |
| valuationIds | FK | array[string] | Array of valuation IDs. | minLength: 1, maxLength: 50 per ID | Valuations | Bewertungen |
| yearOfLastRefurbishment | | string | Year of last refurbishment. ISO 8601 format. | minLength: 20 | Refurbishment | Sanierung |

#### Swiss Extension Fields (extensionData)

| Field | PK/FK | Type | Description | Constraints | Alias (EN) | Alias (DE) |
|-------|-------|------|-------------|-------------|------------|------------|
| extensionData.egid | FK | string | Eidgenössischer Gebäudeidentifikator (Federal Building Identifier). Reference to national Swiss building register. | minLength: 1, maxLength: 9 | EGID | EGID |
| extensionData.egrid | FK | string | Eidgenössischer Grundstücksidentifikator (Federal Property Identifier). Reference to national Swiss cadastre. | minLength: 14, maxLength: 14 | EGRID | EGRID |
| extensionData.numberOfFloors | | number | Number of floors/stories in the building. | minimum: 1, maximum: 999 | Floors | Anzahl Geschosse |
| extensionData.responsiblePerson | | string | Name of responsible person for the building. | | Responsible | Verantwortlich |
| extensionData.portfolio | | string | Sub-portfolio category. | | Portfolio | Teilportfolio |
| extensionData.portfolioGroup | | string | Portfolio group. | | Portfolio Group | Teilportfolio Gruppe |
| extensionData.heatingGenerator | | string | Heating generator type. | | Heating System | Wärmeerzeuger |
| extensionData.heatingSource | | string | Heating source. | | Heat Source | Wärmequelle |
| extensionData.hotWater | | string | Hot water system description. | | Hot Water | Warmwasser |

#### Example: Building Object

```json
{
  "buildingId": "BBL-001",
  "name": "Bundeshaus West",
  "primaryTypeOfBuilding": "Büro Unternehmenssitz",
  "secondaryTypeOfBuilding": "Mischnutzung Büro/Einzelhandel",
  "typeOfOwnership": "Eigentümer",
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

> **Note:** The demo uses German values (e.g., `"typeOfOwnership": "Eigentümer"`, `"primaryTypeOfBuilding": "Büro Unternehmenssitz"`). For English implementations, use `"typeOfOwnership": "Owner"`, `"primaryTypeOfBuilding": "Office Corporate"`.

---

### 3.4 Address (Adresse)

Addresses represent the physical location of a building. A building can have multiple addresses (e.g., corner buildings with entrances on different streets).

#### Schema Definition

| Field | PK/FK | Type | Description | Constraints | Alias (EN) | Alias (DE) |
|-------|-------|------|-------------|-------------|------------|------------|
| **addressId** | PK | string | Unique identifier; must either originate from the previous system or be explicitly defined. | **mandatory**, minLength: 1, maxLength: 50 | Address ID | Adress-ID |
| **city** | | string | Any official settlement including cities, towns, villages, hamlets, localities, etc. | **mandatory**, minLength: 1, maxLength: 100 | City | Ort |
| **country** | | string, enum | Sovereign nations with ISO-3166 code. Common: `CH`, `DE`, `FR`, `IT`, `AT`, `BE`, `US` | **mandatory** | Country | Land |
| **type** | | string, enum | Type of address. See [Address Types](#a1-shared-enumerations). | **mandatory** | Address Type | Adressart |
| **geoCoordinates.geoCoordinateId** | PK | string | Unique identifier for the coordinate set. | **mandatory**, minLength: 1, maxLength: 50 | Coordinate ID | Koordinaten-ID |
| geoCoordinates.coordinateReferenceSystem | | string | Specific coordinate reference system used (e.g., "WGS84", "LV95"). | minLength: 1, maxLength: 50 | Reference System | Referenzsystem |
| geoCoordinates.latitude | | number | Latitude coordinate (WGS84: -90 to 90). | | Latitude | Breitengrad |
| geoCoordinates.longitude | | number | Longitude coordinate (WGS84: -180 to 180). | | Longitude | Längengrad |
| additionalInformation | | string | Additional information (building name, door number, etc.). | minLength: 1, maxLength: 500 | Additional Info | Zusatzinformation |
| apartmentOrUnit | | string | Unit or apartment number. | minLength: 1, maxLength: 50 | Unit/Apt | Wohnung/Einheit |
| district | | string | Borough or district within a city. | minLength: 1, maxLength: 50 | District | Bezirk |
| eventType | | string, enum | Type of the event as domain event. Options: `AddressAdded`, `AddressUpdated` | | Event Type | Ereignistyp |
| extensionData | | object | Extension data for storing any custom data. | JSON object | Extension Data | Erweiterungsdaten |
| houseNumber | | string | House number of the street. | minLength: 1, maxLength: 50 | House Number | Hausnummer |
| postalCode | | string | Postal code for mail sorting. | minLength: 1, maxLength: 15 | Postal Code | PLZ |
| stateProvincePrefecture | | string | First-level administrative division (state, province, canton). | minLength: 1, maxLength: 50 | State/Province | Region/Kanton |
| streetName | | string | Name of the street. | minLength: 1, maxLength: 150 | Street | Strasse |

#### Swiss Extension Fields (extensionData)

| Field | PK/FK | Type | Description | Constraints | Alias (EN) | Alias (DE) |
|-------|-------|------|-------------|-------------|------------|------------|
| extensionData.formattedAddress | | string | Pre-formatted full address string. | | Full Address | Vollständige Adresse |

#### Example: Address Object

```json
{
  "addressId": "BBL-001-ADDR-1",
  "type": "Primär",
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

> **Note:** The demo uses German values (e.g., `"type": "Primär"`). For English implementations, use `"type": "Primary"`.

---

### 3.5 Floor (Geschoss)

A floor represents a level within a building. Spaces belong to exactly one floor.

#### Schema Definition

| Field | PK/FK | Type | Description | Constraints | Alias (EN) | Alias (DE) |
|-------|-------|------|-------------|-------------|------------|------------|
| **floorId** | PK | string | Unique identifier; must either originate from the previous system or be explicitly defined. | **mandatory**, minLength: 1, maxLength: 50 | Floor ID | Geschoss-ID |
| **buildingId** | FK | string | Reference to the building which the floor belongs to. | **mandatory**, minLength: 1, maxLength: 50 | Building ID | Objekt-ID |
| **name** | | string | Name of floor (e.g., Erdgeschoss, Untergeschoss 1, 1. Obergeschoss). | **mandatory**, minLength: 1, maxLength: 200 | Floor Name | Geschossbezeichnung |
| **validFrom** | | string | The record can be used from this date onwards. ISO 8601 format: `yyyy-mm-ddThh:mm:ssZ` | **mandatory**, minLength: 20 | Valid From | Gültig von |
| **validUntil** | | string | The record is valid until this date. ISO 8601 format: `yyyy-mm-ddThh:mm:ssZ` | **mandatory**, minLength: 20 | Valid Until | Gültig bis |
| energyRatingIds | FK | array[string] | Array of energy rating IDs. | minLength: 1, maxLength: 50 per ID | Energy Ratings | Energiebewertungen |
| eventType | | string, enum | Type of the event as domain event. Options: `FloorAdded`, `FloorUpdated`, `FloorDeleted` | | Event Type | Ereignistyp |
| extensionData | | object | Extension data for storing any custom data. | JSON object | Extension Data | Erweiterungsdaten |
| floorCode | | string | User specific floor code. | minLength: 1, maxLength: 70 | Floor Code | Geschosscode |
| floorNumber | | string | Number of floor. | | Floor Number | Geschossnummer |
| workAreaIds | FK | array[string] | Array of work area IDs. | minLength: 1, maxLength: 50 per ID | Work Areas | Arbeitsbereiche |

#### Example: Floor Object

```json
{
  "floorId": "BBL-001-FL-EG",
  "buildingId": "BBL-001",
  "name": "Erdgeschoss",
  "floorNumber": "0",
  "floorCode": "EG",
  "validFrom": "1902-06-01T00:00:00Z",
  "validUntil": null
}
```

---

### 3.6 Space (Raum)

A space represents a room or area within a floor. Spaces are the smallest spatial units in the building hierarchy and can be used for tracking occupancy, climate control, and area measurements.

#### Schema Definition

| Field | PK/FK | Type | Description | Constraints | Alias (EN) | Alias (DE) |
|-------|-------|------|-------------|-------------|------------|------------|
| **spaceId** | PK | string | Unique identifier; must either originate from the previous system or be explicitly defined. | **mandatory**, minLength: 1, maxLength: 50 | Space ID | Raum-ID |
| **floorId** | FK | string | Reference to the floor which the space belongs to. | **mandatory**, minLength: 1, maxLength: 50 | Floor ID | Geschoss-ID |
| **name** | | string | User-specific space name. | **mandatory**, minLength: 1, maxLength: 200 | Space Name | Raumbezeichnung |
| **type** | | string | Type of space. | **mandatory**, minLength: 1, maxLength: 70 | Space Type | Raumtyp |
| **validFrom** | | string | The record can be used from this date onwards. ISO 8601 format: `yyyy-mm-ddThh:mm:ssZ` | **mandatory**, minLength: 20 | Valid From | Gültig von |
| **validUntil** | | string | The record is valid until this date. ISO 8601 format: `yyyy-mm-ddThh:mm:ssZ` | **mandatory**, minLength: 20, null allowed | Valid Until | Gültig bis |
| climateCooled | | boolean | Is the space climate cooled? | | Climate Cooled | Klimatisiert (Kühlung) |
| climateHeated | | boolean | Is the space climate heated? | | Climate Heated | Klimatisiert (Heizung) |
| coUseArea | | boolean | Is the space being used by multiple tenants? | | Co-Use Area | Gemeinschaftsnutzung |
| effectZonesCooling | | number | Area that is cooled. | minimum: 1, maximum: 9999 | Cooling Zone Area | Kühlzonenbereich |
| effectZonesHeating | | number | Area that is heated. | minimum: 1, maximum: 9999 | Heating Zone Area | Heizzonenbereich |
| effectZonesVentilation | | number | Area that is ventilated. | minimum: 1, maximum: 9999 | Ventilation Zone Area | Lüftungszonenbereich |
| energyRatingIds | FK | array[string] | Array of energy rating IDs. | minLength: 1, maxLength: 50 per ID | Energy Ratings | Energiebewertungen |
| eventType | | string, enum | Type of the event as domain event. Options: `SpaceAdded`, `SpaceUpdated`, `SpaceDeleted` | | Event Type | Ereignistyp |
| extensionData | | object | Extension data for storing any custom data. | JSON object | Extension Data | Erweiterungsdaten |
| maximumOccupancy | | number | Define maximum occupancy of space. | minimum: 1, maximum: 9000 | Maximum Occupancy | Maximale Belegung |
| primaryCeilingMaterial | | string | Material of ceiling. | minLength: 1, maxLength: 75 | Ceiling Material | Deckenmaterial |
| primaryFloorMaterial | | string | Material of floor. | minLength: 1, maxLength: 75 | Floor Material | Bodenmaterial |
| primaryWallMaterial | | string | Material of wall. | minLength: 1, maxLength: 75 | Wall Material | Wandmaterial |
| rentability | | boolean | Status of the space; is the space eligible for renting out? | | Rentability | Vermietbarkeit |
| spaceCode | | string | User specific space code. | minLength: 1, maxLength: 70 | Space Code | Raumcode |
| spaceHeight | | number | Actual space height (e.g., 3.6 m). | minimum: 2, maximum: 999 | Space Height | Raumhöhe |
| spaceHeightUsable | | number | Usable height of space. | minimum: 2, maximum: 999 | Usable Height | Nutzbare Höhe |
| spaceNumber | | number | Number of space. | minimum: 1, maximum: 99999 | Space Number | Raumnummer |
| spaceVolumeGross | | number | Gross volume of space including surrounding walls. | minimum: 1, maximum: 999999 | Gross Volume | Bruttovolumen |
| spaceVolumeNet | | number | Net volume of space excluding surrounding walls. | minimum: 1, maximum: 999999 | Net Volume | Nettovolumen |
| ventilationType | | string, enum | Define the ventilation type. Options: `Exhaust`, `Supply`, `Balanced`, `Heat-recovery` | | Ventilation Type | Lüftungsart |
| workAreaIds | FK | array[string] | Array of work area IDs. | minLength: 1, maxLength: 50 per ID | Work Areas | Arbeitsbereiche |

#### Ventilation Types

| Value (EN) | Value (DE) | Description |
|------------|------------|-------------|
| `Exhaust` | `Abluft` | Exhaust-only ventilation |
| `Supply` | `Zuluft` | Supply-only ventilation |
| `Balanced` | `Zu-/Abluft` | Balanced supply and exhaust |
| `Heat-recovery` | `Wärmerückgewinnung` | Ventilation with heat recovery |

#### Swiss Extension Fields (extensionData)

| Field | PK/FK | Type | Description | Constraints | Alias (EN) | Alias (DE) |
|-------|-------|------|-------------|-------------|------------|------------|
| | | | *No Swiss-specific extension fields are currently defined.* | | | |

#### Example: Space Object

```json
{
  "spaceId": "BBL-001-SP-101",
  "floorId": "BBL-001-FL-EG",
  "name": "Konferenzraum A",
  "type": "Besprechungsraum",
  "validFrom": "2019-01-01T00:00:00Z",
  "validUntil": null,
  "spaceNumber": 101,
  "spaceCode": "EG-KR-A",
  "spaceHeight": 3.2,
  "spaceHeightUsable": 3.0,
  "spaceVolumeNet": 96,
  "maximumOccupancy": 12,
  "climateHeated": true,
  "climateCooled": true,
  "ventilationType": "Zu-/Abluft",
  "rentability": true,
  "coUseArea": false,
  "primaryFloorMaterial": "Parkett",
  "primaryWallMaterial": "Gipskarton",
  "primaryCeilingMaterial": "Akustikdecke"
}
```

> **Note:** The demo uses German values (e.g., `"type": "Besprechungsraum"`, `"ventilationType": "Zu-/Abluft"`). For English implementations, use `"type": "Meeting room"`, `"ventilationType": "Balanced"`.

---

## 4. Measurement Entities

### 4.1 Area Measurement (Bemessung)

Area measurements capture floor areas, volumes, and other quantitative measurements for buildings, floors, spaces, or sites. In the current demo, measurements are embedded in the `bemessungen` array within each building.

#### Schema Definition

| Field | PK/FK | Type | Description | Constraints | Alias (EN) | Alias (DE) |
|-------|-------|------|-------------|-------------|------------|------------|
| **areaMeasurementId** | PK | string | Unique identifier; must either originate from the previous system or be explicitly defined. | **mandatory**, minLength: 1, maxLength: 50 | Measurement ID | Bemessungs-ID |
| **type** | | string, enum | Type of the standard area. See [Area Types](#a3-area-types--sia-mappings). | **mandatory** | Area Type | Flächenart |
| **value** | | number | Value of measurement. | **mandatory** | Value | Wert |
| **unit** | | string, enum | Unit area is measured with. See [Area Measurement Units](#a3-area-types--sia-mappings). | **mandatory** | Unit | Einheit |
| **validFrom** | | string | The record can be used from this date onwards. ISO 8601 format: `yyyy-mm-ddThh:mm:ssZ` | **mandatory**, minLength: 20 | Valid From | Gültig von |
| **validUntil** | | string | The record is valid until this date. ISO 8601 format: `yyyy-mm-ddThh:mm:ssZ` | **mandatory**, minLength: 20, null allowed | Valid Until | Gültig bis |
| **bmEstimation** | | boolean | Is the data estimated by BuildingMinds? | **mandatory** | BM Estimation | BM-Schätzung |
| accuracy | | string, enum | Accuracy of area measurement. See [Area Measurement Accuracy](#a3-area-types--sia-mappings). | | Accuracy | Genauigkeit |
| buildingIds | FK | array[string] | Array of building IDs this measurement belongs to. | minLength: 1, maxLength: 50 per ID | Buildings | Gebäude |
| eventType | | string, enum | Type of the event as domain event. Options: `AreaMeasurementAdded`, `AreaMeasurementUpdated`, `AreaMeasurementDeleted` | | Event Type | Ereignistyp |
| extensionData | | object | Extension data for storing any custom data. | JSON object | Extension Data | Erweiterungsdaten |
| floorIds | FK | array[string] | Array of floor IDs. | minLength: 1, maxLength: 50 per ID | Floors | Geschosse |
| landIds | FK | array[string] | Array of land IDs. | minLength: 1, maxLength: 50 per ID | Land Parcels | Grundstücke |
| rentalUnit | FK | array[string] | Array of rental unit IDs. | minLength: 1, maxLength: 50 per ID | Rental Units | Mieteinheiten |
| siteIds | FK | array[string] | Array of site IDs. | minLength: 1, maxLength: 50 per ID | Sites | Standorte |
| spaceIds | FK | array[string] | Array of space IDs. | minLength: 1, maxLength: 50 per ID | Spaces | Räume |
| standard | | string, enum | Area measurement standard. See [Area Measurement Standards](#a3-area-types--sia-mappings). | | Standard | Norm |

#### Swiss Extension Fields (extensionData)

| Field | PK/FK | Type | Description | Constraints | Alias (EN) | Alias (DE) |
|-------|-------|------|-------------|-------------|------------|------------|
| extensionData.source | | string | Data source (e.g., "CAD/BIM", "Vermessung", "Schätzmodell", "Manuell"). | | Source | Quelle |
| extensionData.originalUnit | | string | Original unit before conversion (e.g., "m²", "m³", "Stk"). | | Original Unit | Urspr. Einheit |
| extensionData.measurementCategory | | string | Category for non-standard measurements (e.g., "volume", "count"). | | Category | Kategorie |

#### Example: Area Measurement Object

```json
{
  "areaMeasurementId": "BBL-001-M1",
  "type": "Bruttogeschossfläche",
  "value": 15000,
  "unit": "m²",
  "validFrom": "2019-03-15T00:00:00Z",
  "validUntil": null,
  "bmEstimation": false,
  "accuracy": "Gemessen",
  "standard": "SIA 416",
  "buildingIds": ["BBL-001"],
  "extensionData": {
    "source": "CAD/BIM",
    "originalUnit": "m²"
  }
}
```

> **Note:** The demo uses German values (e.g., `"type": "Bruttogeschossfläche"`, `"accuracy": "Gemessen"`). For English implementations, use `"type": "Gross floor area"`, `"accuracy": "Measured"`.

#### Example: Volume Measurement (Swiss Extension)

For measurements that don't fit the standard area types (volumes, counts):

```json
{
  "areaMeasurementId": "BBL-001-M4",
  "type": "Volumen",
  "value": 52500,
  "unit": "m³",
  "validFrom": "2019-03-15T00:00:00Z",
  "validUntil": null,
  "bmEstimation": false,
  "accuracy": "Gemessen",
  "standard": "SIA 416",
  "buildingIds": ["BBL-001"],
  "extensionData": {
    "source": "CAD/BIM",
    "originalUnit": "m³",
    "measurementCategory": "volume"
  }
}
```

---

### 4.2 Operational Measurement (Betriebsmessung) [Preview]

> **Note:** This entity is not currently implemented in the demo. It is documented here for future implementation planning.

Operational measurements track resource consumption (energy, water, waste) and emissions data for buildings. This entity enables ESG reporting, carbon footprint calculations, and sustainability monitoring.

#### Schema Definition

| Field | PK/FK | Type | Description | Constraints | Alias (EN) | Alias (DE) |
|-------|-------|------|-------------|-------------|------------|------------|
| **operationalMeasurementId** | PK | string | Unique identifier; must either originate from the previous system or be explicitly defined. | **mandatory**, minLength: 1, maxLength: 50 | Measurement ID | Betriebs-ID |
| **buildingId** | FK | string | Unique identifier of the building this measurement belongs to. | **mandatory**, minLength: 1, maxLength: 50 | Building ID | Objekt-ID |
| **type** | | string, enum | General type of operational measurement. See [Operational Measurement Types](#a4-operational-measurement-types). | **mandatory** | Type | Art |
| **subType** | | string, enum | Specific type of operational measurement. See [Operational Measurement SubTypes](#a4-operational-measurement-types). | **mandatory** | Sub Type | Unterart |
| **value** | | number | Value of the measurement. | **mandatory** | Value | Wert |
| **unit** | | string, enum | Unit of measurement. See [Operational Measurement Units](#a4-operational-measurement-types). | **mandatory** | Unit | Einheit |
| **validFrom** | | string | Date validity starts. ISO 8601 format: `yyyy-mm-ddThh:mm:ssZ` | **mandatory**, minLength: 20 | Valid From | Gültig von |
| **validUntil** | | string | Date validity ends. ISO 8601 format: `yyyy-mm-ddThh:mm:ssZ` | **mandatory**, minLength: 20 | Valid Until | Gültig bis |
| **procuredBy** | | string, enum | Operational control information. See [Procurement Types](#a4-operational-measurement-types). | **mandatory** | Procured By | Beschaffung |
| **purpose** | | string, enum | Purpose of resource consumption. See [Purpose Types](#a4-operational-measurement-types). | **mandatory** | Purpose | Verwendungszweck |
| **spaceType** | | string, enum | Reference to specific space type. See [Space Types](#a4-operational-measurement-types). | **mandatory** | Space Type | Raumtyp |
| accuracy | | string, enum | Accuracy of measurement. See [Accuracy Options](#a4-operational-measurement-types). | | Accuracy | Genauigkeit |
| customerInfoSource | | string, enum | Source of data. See [Data Source Types](#a4-operational-measurement-types). | | Data Source | Datenquelle |
| dataProvider | | string | Name of the data provider. | minLength: 1, maxLength: 50 | Data Provider | Datenanbieter |
| eventType | | string, enum | Type of the event as domain event. Options: `OperationalMeasurementAdded`, `OperationalMeasurementUpdated`, `OperationalMeasurementDeleted` | | Event Type | Ereignistyp |
| extensionData | | object | Extension data for storing any custom data. | JSON object | Extension Data | Erweiterungsdaten |
| isAutoApproved | | boolean | Determines whether this value is auto approved or requires approval. | | Auto Approved | Auto-genehmigt |
| lifeCycleAssessment | | array[string] | Life cycle assessment stages (ISO 14040). Options: `A1`, `A2`, `A3`, `A4`, `A5`, `B1`, `B2`, `B3`, `B4`, `B5`, `B6`, `B7`, `C1`, `C2`, `C3`, `C4`, `D` | | LCA Stages | LCA-Phasen |
| measurementDate | | string | Date measurement was taken. ISO 8601 format. | minLength: 20 | Measurement Date | Messdatum |
| name | | string | Any descriptive name. | | Name | Bezeichnung |
| parentId | FK | string | Parent entity ID. | | Parent ID | Übergeordnete ID |
| postingDate | | string | Date measurement was posted. ISO 8601 format. | minLength: 20 | Posting Date | Buchungsdatum |
| sensorId | | string | ID of meter for this reading. | | Sensor ID | Zähler-ID |
| valuationIds | FK | array[string] | Array of valuation IDs. | | Valuations | Bewertungen |

#### Example: Operational Measurement Object

```json
{
  "operationalMeasurementId": "BBL-001-OPM-001",
  "buildingId": "BBL-001",
  "type": "Energie",
  "subType": "Fernwärme",
  "value": 125000,
  "unit": "kWh",
  "validFrom": "2024-01-01T00:00:00Z",
  "validUntil": "2024-12-31T00:00:00Z",
  "procuredBy": "Fremdbezug",
  "purpose": "Raumheizung",
  "spaceType": "Gesamtes Gebäude",
  "accuracy": "Gemessen",
  "customerInfoSource": "Rechnung",
  "dataProvider": "Energie Wasser Bern",
  "measurementDate": "2024-12-01T00:00:00Z",
  "lifeCycleAssessment": ["B6"]
}
```

> **Note:** The demo uses German values (e.g., `"type": "Energie"`, `"subType": "Fernwärme"`). For English implementations, use `"type": "Energy"`, `"subType": "District heating"`.

---

## 5. Supporting Entities

### 5.1 Document (Dokument)

Documents represent files and records associated with a building, such as floor plans, certificates, permits, and technical documentation.

#### Schema Definition

| Field | PK/FK | Type | Description | Constraints | Alias (EN) | Alias (DE) |
|-------|-------|------|-------------|-------------|------------|------------|
| **documentId** | PK | string | Unique identifier for the document. | **mandatory**, minLength: 1, maxLength: 50 | Document ID | Dokument-ID |
| **name** | | string | Title or name of the document. | **mandatory**, minLength: 1, maxLength: 200 | Document Name | Dokumentname |
| **type** | | string, enum | Type of document. See [Document Types](#a5-document-contact--contract-types). | **mandatory** | Document Type | Dokumenttyp |
| **buildingIds** | FK | array[string] | Array of building IDs this document belongs to. | **mandatory**, minLength: 1 | Buildings | Gebäude |
| **validFrom** | | string | Document date or effective date. ISO 8601 format. | **mandatory**, minLength: 20 | Valid From | Gültig von |
| eventType | | string, enum | Type of the event as domain event. Options: `DocumentAdded`, `DocumentUpdated`, `DocumentDeleted` | | Event Type | Ereignistyp |
| extensionData | | object | Extension data for storing any custom data. | JSON object | Extension Data | Erweiterungsdaten |
| fileFormat | | string | File format (e.g., "PDF", "DWG", "IFC"). | minLength: 1, maxLength: 20 | File Format | Dateiformat |
| fileSize | | string | File size as string (e.g., "2.4 MB"). | minLength: 1, maxLength: 20 | File Size | Dateigrösse |
| url | | string | URL or path to the document file. | minLength: 1, maxLength: 500 | URL | URL |
| description | | string | Description or notes about the document. | minLength: 1, maxLength: 1000 | Description | Beschreibung |
| version | | string | Document version identifier. | minLength: 1, maxLength: 20 | Version | Version |
| validUntil | | string | Expiry date for time-limited documents. ISO 8601 format. | minLength: 20, null allowed | Valid Until | Gültig bis |

#### Example: Document Object

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

> **Note:** The demo uses German values (e.g., `"type": "Grundriss"`). For English implementations, use `"type": "Floor plan"`.

---

### 5.2 Contact (Kontakt)

Contacts represent persons associated with a building, such as property managers, caretakers, or portfolio managers.

#### Schema Definition

| Field | PK/FK | Type | Description | Constraints | Alias (EN) | Alias (DE) |
|-------|-------|------|-------------|-------------|------------|------------|
| **contactId** | PK | string | Unique identifier for the contact. | **mandatory**, minLength: 1, maxLength: 50 | Contact ID | Kontakt-ID |
| **name** | | string | Full name of the contact person. | **mandatory**, minLength: 1, maxLength: 200 | Name | Name |
| **role** | | string, enum | Role or function of the contact. See [Contact Roles](#a5-document-contact--contract-types). | **mandatory** | Role | Rolle |
| **buildingIds** | FK | array[string] | Array of building IDs this contact is associated with. | **mandatory**, minLength: 1 | Buildings | Gebäude |
| eventType | | string, enum | Type of the event as domain event. Options: `ContactAdded`, `ContactUpdated`, `ContactDeleted` | | Event Type | Ereignistyp |
| extensionData | | object | Extension data for storing any custom data. | JSON object | Extension Data | Erweiterungsdaten |
| organisation | | string | Organisation or department. | minLength: 1, maxLength: 200 | Organisation | Organisation |
| phone | | string | Phone number. | minLength: 1, maxLength: 30 | Phone | Telefon |
| email | | string | Email address. | minLength: 1, maxLength: 100, format: email | Email | E-Mail |
| isPrimary | | boolean | Is this the primary contact for the building? | | Primary Contact | Hauptkontakt |
| validFrom | | string | Contact assignment start date. ISO 8601 format. | minLength: 20 | Valid From | Gültig von |
| validUntil | | string | Contact assignment end date. ISO 8601 format. | minLength: 20, null allowed | Valid Until | Gültig bis |

#### Example: Contact Object

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

> **Note:** The demo uses German values (e.g., `"role": "Objektverantwortliche"`). For English implementations, use `"role": "Property manager"`.

---

### 5.3 Asset (Ausstattung)

Assets represent technical equipment, installations, and building components that require maintenance or tracking.

#### Schema Definition

| Field | PK/FK | Type | Description | Constraints | Alias (EN) | Alias (DE) |
|-------|-------|------|-------------|-------------|------------|------------|
| **assetId** | PK | string | Unique identifier for the asset. | **mandatory**, minLength: 1, maxLength: 50 | Asset ID | Ausstattungs-ID |
| **name** | | string | Name or designation of the asset. | **mandatory**, minLength: 1, maxLength: 200 | Asset Name | Bezeichnung |
| **category** | | string, enum | Category of the asset. See [Asset Categories](#a6-asset-categories--cost-groups). | **mandatory** | Category | Kategorie |
| **buildingIds** | FK | array[string] | Array of building IDs this asset belongs to. | **mandatory**, minLength: 1 | Buildings | Gebäude |
| eventType | | string, enum | Type of the event as domain event. Options: `AssetAdded`, `AssetUpdated`, `AssetDeleted` | | Event Type | Ereignistyp |
| extensionData | | object | Extension data for storing any custom data. | JSON object | Extension Data | Erweiterungsdaten |
| manufacturer | | string | Manufacturer or vendor. | minLength: 1, maxLength: 200 | Manufacturer | Hersteller |
| installationYear | | number | Year of installation. | minimum: 1800, maximum: 2100 | Installation Year | Einbaujahr |
| location | | string | Location within the building. | minLength: 1, maxLength: 200 | Location | Standort |
| serialNumber | | string | Serial number or asset tag. | minLength: 1, maxLength: 100 | Serial Number | Seriennummer |
| status | | string | Current status (e.g., "In Betrieb", "Ausser Betrieb"). | minLength: 1, maxLength: 50 | Status | Status |
| maintenanceInterval | | string | Maintenance interval (e.g., "Jährlich", "Monatlich"). | minLength: 1, maxLength: 50 | Maintenance Interval | Wartungsintervall |
| lastMaintenanceDate | | string | Date of last maintenance. ISO 8601 format. | minLength: 20 | Last Maintenance | Letzte Wartung |
| nextMaintenanceDate | | string | Date of next scheduled maintenance. ISO 8601 format. | minLength: 20 | Next Maintenance | Nächste Wartung |

#### Example: Asset Object

```json
{
  "assetId": "BBL-001-A1",
  "name": "Fernwärmeübergabestation",
  "category": "HLK",
  "buildingIds": ["BBL-001"],
  "manufacturer": "Siemens AG",
  "installationYear": 2019,
  "location": "Untergeschoss Technikraum",
  "status": "In Betrieb",
  "maintenanceInterval": "Jährlich"
}
```

> **Note:** The demo uses German values (e.g., `"category": "HLK"`). For English implementations, use `"category": "HVAC"`.

---

### 5.4 Contract (Vertrag)

Contracts represent service agreements, maintenance contracts, and other contractual arrangements associated with a building.

#### Schema Definition

| Field | PK/FK | Type | Description | Constraints | Alias (EN) | Alias (DE) |
|-------|-------|------|-------------|-------------|------------|------------|
| **contractId** | PK | string | Unique identifier for the contract. | **mandatory**, minLength: 1, maxLength: 50 | Contract ID | Vertrags-ID |
| **type** | | string, enum | Type of contract. See [Contract Types](#a5-document-contact--contract-types). | **mandatory** | Contract Type | Vertragsart |
| **buildingIds** | FK | array[string] | Array of building IDs this contract belongs to. | **mandatory**, minLength: 1 | Buildings | Gebäude |
| **validFrom** | | string | Contract start date. ISO 8601 format. | **mandatory**, minLength: 20 | Valid From | Vertragsbeginn |
| eventType | | string, enum | Type of the event as domain event. Options: `ContractAdded`, `ContractUpdated`, `ContractDeleted` | | Event Type | Ereignistyp |
| extensionData | | object | Extension data for storing any custom data. | JSON object | Extension Data | Erweiterungsdaten |
| contractPartner | | string | Name of the contract partner or vendor. | minLength: 1, maxLength: 200 | Contract Partner | Vertragspartner |
| validUntil | | string | Contract end date. ISO 8601 format. | minLength: 20, null allowed | Valid Until | Vertragsende |
| amount | | number | Contract value or annual amount. | | Amount | Betrag |
| currency | | string | Currency code (ISO 4217). | minLength: 3, maxLength: 3 | Currency | Währung |
| status | | string | Current contract status (e.g., "Aktiv", "Beendet"). | minLength: 1, maxLength: 50 | Status | Status |

#### Example: Contract Object

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

> **Note:** The demo uses German values (e.g., `"type": "Wartungsvertrag"`). For English implementations, use `"type": "Maintenance contract"`.

---

### 5.5 Cost (Kosten)

Costs represent operating expenses, utility costs, and other recurring costs associated with a building. Costs are typically categorized using standard cost group codes.

#### Schema Definition

| Field | PK/FK | Type | Description | Constraints | Alias (EN) | Alias (DE) |
|-------|-------|------|-------------|-------------|------------|------------|
| **costId** | PK | string | Unique identifier for the cost entry. | **mandatory**, minLength: 1, maxLength: 50 | Cost ID | Kosten-ID |
| **costGroup** | | string | Cost group code (e.g., DIN 18960 or Swiss SN 506 511). | **mandatory**, minLength: 1, maxLength: 10 | Cost Group | Kostengruppe |
| **costType** | | string | Description of the cost type. | **mandatory**, minLength: 1, maxLength: 200 | Cost Type | Kostenart |
| **buildingIds** | FK | array[string] | Array of building IDs this cost belongs to. | **mandatory**, minLength: 1 | Buildings | Gebäude |
| eventType | | string, enum | Type of the event as domain event. Options: `CostAdded`, `CostUpdated`, `CostDeleted` | | Event Type | Ereignistyp |
| extensionData | | object | Extension data for storing any custom data. | JSON object | Extension Data | Erweiterungsdaten |
| amount | | number | Cost amount. | | Amount | Betrag |
| unit | | string | Unit of the cost (e.g., "CHF/Jahr", "CHF/Monat"). | minLength: 1, maxLength: 20 | Unit | Einheit |
| currency | | string | Currency code (ISO 4217). | minLength: 3, maxLength: 3 | Currency | Währung |
| period | | string, enum | Cost period. See [Cost Periods](#a6-asset-categories--cost-groups). | | Period | Periode |
| referenceDate | | string | Reference date for the cost entry. ISO 8601 format. | minLength: 20 | Reference Date | Stichtag |

#### Example: Cost Object

```json
{
  "costId": "BBL-001-K1",
  "costGroup": "311",
  "costType": "Stromversorgung",
  "buildingIds": ["BBL-001"],
  "amount": 185000,
  "unit": "CHF/Jahr",
  "currency": "CHF",
  "period": "Jährlich",
  "referenceDate": "2024-12-01T00:00:00Z"
}
```

> **Note:** The demo uses German values (e.g., `"period": "Jährlich"`). For English implementations, use `"period": "Annual"`.

---

## 6. Future Entities [Preview]

The following entities are planned for future implementation:

### 6.1 Certificate (Zertifikat)

Building certifications (LEED, BREEAM, Minergie, etc.) with associated levels and validity periods.

**Relationship:** 1 Building → n Certificates

### 6.2 Valuation (Bewertung)

Property valuations including market value, book value, and appraisal data.

**Relationship:** 1 Building → n Valuations

---

## 7. Appendix A: Reference Tables

### A.1 Shared Enumerations

#### Ownership Types

Used by: Land, Building

| Value (EN) | Value (DE) | Description |
|------------|------------|-------------|
| `Owner` | `Eigentümer` | Property is owned |
| `Tenant` | `Mieter` | Property is leased/rented |

#### Tenant Structure

Used by: Land, Building

| Value (EN) | Value (DE) | Description |
|------------|------------|-------------|
| `Single-tenant` | `Einzelmieter` | Single tenant occupancy |
| `Multi-tenant` | `Mehrfachmieter` | Multiple tenant occupancy |

#### Address Types

Used by: Address

| Value (EN) | Value (DE) | Description |
|------------|------------|-------------|
| `Primary` | `Primär` | Primary/main address |
| `Other` | `Andere` | Secondary or alternative address |

#### Site Types

Used by: Site

| Value (EN) | Value (DE) | Description |
|------------|------------|-------------|
| `Education` | `Bildung` | Educational facilities |
| `Health Care` | `Gesundheitswesen` | Healthcare facilities |
| `Hotel` | `Hotel` | Hotel properties |
| `Industrial` | `Industrie` | Industrial sites |
| `Lodging` | `Beherbergung` | Lodging facilities |
| `Leisure & Recreation` | `Freizeit & Erholung` | Leisure and recreation |
| `Mixed Use` | `Mischnutzung` | Mixed-use developments |
| `Office` | `Büro` | Office buildings |
| `Residential` | `Wohnen` | Residential properties |
| `Retail` | `Einzelhandel` | Retail properties |
| `Technology/Science` | `Technologie/Wissenschaft` | Technology and science facilities |
| `Other` | `Andere` | Other property types |

#### Fossil Fuel Exposure

Used by: Building

| Value (EN) | Value (DE) | Description |
|------------|------------|-------------|
| `Extraction` | `Förderung` | Involved in fuel extraction |
| `Storage` | `Lagerung` | Fuel storage facilities |
| `Transport` | `Transport` | Fuel transport facilities |
| `Manufacture` | `Herstellung` | Fuel manufacturing |
| `Other` | `Andere` | Other exposure types |
| `Not exposed` | `Nicht exponiert` | No fossil fuel exposure |

#### Energy Types

Used by: Building (`primaryEnergyType`)

| Value (EN) | Value (DE) | Description |
|------------|------------|-------------|
| `Natural Gas` | `Erdgas` | Natural gas energy |
| `Coal` | `Kohle` | Coal energy |
| `Nuclear` | `Kernenergie` | Nuclear energy |
| `Petroleum` | `Erdöl` | Petroleum-based energy |
| `Hydropower` | `Wasserkraft` | Hydroelectric power |
| `Wind` | `Windkraft` | Wind energy |
| `Biomass` | `Biomasse` | Biomass energy |
| `Geothermal` | `Geothermie` | Geothermal energy |
| `Solar` | `Solarenergie` | Solar energy |

#### Heating Types

Used by: Building (`secondaryHeatingType`)

| Value (EN) | Value (DE) | Description |
|------------|------------|-------------|
| `District heating` | `Fernwärme` | District/central heating |
| `Natural gas` | `Erdgas` | Natural gas heating |
| `Oil-based fuels` | `Ölbasierte Brennstoffe` | Oil-based heating |
| `Solar thermal` | `Solarthermie` | Solar thermal heating |
| `Unspecified` | `Nicht spezifiziert` | Unspecified heating type |
| `Heat pump` | `Wärmepumpe` | Heat pump systems |
| `Electricity (radiator)` | `Elektro (Radiator)` | Electric radiators |
| `Biomass` | `Biomasse` | Biomass heating |
| `Micro combined heat and power` | `Mikro-Blockheizkraftwerk` | Micro CHP systems |

---

### A.2 Building Types

Primary and secondary building type options for `primaryTypeOfBuilding` and `secondaryTypeOfBuilding`:

#### Retail

| Value (EN) | Value (DE) |
|------------|------------|
| `Retail` | `Einzelhandel` |
| `Retail High Street` | `Einzelhandel Einkaufsstrasse` |
| `Retail Retail Centers` | `Einzelhandel Einkaufszentren` |
| `Retail Shopping Center` | `Einzelhandel Einkaufszentrum` |
| `Retail Strip Mall` | `Einzelhandel Ladenzeile` |
| `Retail Lifestyle Center` | `Einzelhandel Lifestyle-Center` |
| `Retail Warehouse` | `Einzelhandel Lagerhaus` |
| `Retail Restaurants/Bars` | `Einzelhandel Restaurants/Bars` |
| `Retail Other` | `Einzelhandel Andere` |

#### Office

| Value (EN) | Value (DE) |
|------------|------------|
| `Office` | `Büro` |
| `Office Corporate` | `Büro Unternehmenssitz` |
| `Office Low-Rise Office` | `Büro Niedrigbau` |
| `Office Mid-Rise Office` | `Büro Mittelhochbau` |
| `Office High-Rise Office` | `Büro Hochhaus` |
| `Office Medical Office` | `Büro Arztpraxis` |
| `Office Business Park` | `Büro Gewerbepark` |
| `Office Other` | `Büro Andere` |

#### Industrial

| Value (EN) | Value (DE) |
|------------|------------|
| `Industrial` | `Industrie` |
| `Industrial Distribution Warehouse` | `Industrie Distributionslager` |
| `Industrial Industrial Park` | `Industrie Industriepark` |
| `Industrial Manufacturing` | `Industrie Fertigung` |
| `Industrial Refrigerated Warehouse` | `Industrie Kühllager` |
| `Industrial Non-refrigerated Warehouse` | `Industrie Lager (nicht gekühlt)` |
| `Industrial Other` | `Industrie Andere` |

#### Residential

| Value (EN) | Value (DE) |
|------------|------------|
| `Residential` | `Wohnen` |
| `Residential Multi-Family` | `Wohnen Mehrfamilienhaus` |
| `Residential Low-Rise Multi-Family` | `Wohnen Mehrfamilienhaus Niedrigbau` |
| `Residential Mid-Rise Multi-Family` | `Wohnen Mehrfamilienhaus Mittelhochbau` |
| `Residential High-Rise Multi-Family` | `Wohnen Mehrfamilienhaus Hochhaus` |
| `Residential Family Homes` | `Wohnen Einfamilienhäuser` |
| `Residential Student Housing` | `Wohnen Studentenwohnheim` |
| `Residential Retirement Living` | `Wohnen Seniorenwohnen` |
| `Residential Other` | `Wohnen Andere` |

#### Lodging

| Value (EN) | Value (DE) |
|------------|------------|
| `Hotel` | `Hotel` |
| `Lodging` | `Beherbergung` |
| `Lodging Leisure & Recreation` | `Beherbergung Freizeit & Erholung` |
| `Lodging Indoor Arena` | `Beherbergung Hallenstadion` |
| `Lodging Fitness Center` | `Beherbergung Fitnesscenter` |
| `Lodging Performing Arts` | `Beherbergung Veranstaltungsort` |
| `Lodging Swimming Center` | `Beherbergung Schwimmbad` |
| `Lodging Museum/Gallery` | `Beherbergung Museum/Galerie` |
| `Lodging Leisure & Recreation Other` | `Beherbergung Freizeit & Erholung Andere` |

#### Education

| Value (EN) | Value (DE) |
|------------|------------|
| `Education` | `Bildung` |
| `Education School` | `Bildung Schule` |
| `Education University` | `Bildung Universität` |
| `Education Library` | `Bildung Bibliothek` |
| `Education Other` | `Bildung Andere` |

#### Technology/Science

| Value (EN) | Value (DE) |
|------------|------------|
| `Technology/Science` | `Technologie/Wissenschaft` |
| `Technology/Science Data Center` | `Technologie/Wissenschaft Rechenzentrum` |
| `Technology/Science Laboratory/Life sciences` | `Technologie/Wissenschaft Labor/Biowissenschaften` |
| `Technology/Science Other` | `Technologie/Wissenschaft Andere` |

#### Health Care

| Value (EN) | Value (DE) |
|------------|------------|
| `Health Care` | `Gesundheitswesen` |
| `Health Care Health Care Center` | `Gesundheitswesen Gesundheitszentrum` |
| `Health Care Senior Homes` | `Gesundheitswesen Altersheim` |
| `Health Care Other` | `Gesundheitswesen Andere` |

#### Mixed Use

| Value (EN) | Value (DE) |
|------------|------------|
| `Mixed Use` | `Mischnutzung` |
| `Mixed Use Office/Retail` | `Mischnutzung Büro/Einzelhandel` |
| `Mixed Use Office/Residential` | `Mischnutzung Büro/Wohnen` |
| `Mixed Use Office/Industrial` | `Mischnutzung Büro/Industrie` |
| `Mixed Use Other` | `Mischnutzung Andere` |

#### Other

| Value (EN) | Value (DE) |
|------------|------------|
| `Other` | `Andere` |
| `Other Parking (Indoors)` | `Andere Parkhaus (Innen)` |
| `Other Self-Storage` | `Andere Selfstorage` |

---

### A.3 Area Types & SIA Mappings

#### Area Measurement Units

| Value (EN) | Value (DE) | Description |
|------------|------------|-------------|
| `sqm` | `m²` | Square meters |
| `sqft` | `ft²` | Square feet |
| `acr` | `Acre` | Acres |

#### Area Measurement Accuracy

| Value (EN) | Value (DE) | Description |
|------------|------------|-------------|
| `Estimated` | `Geschätzt` | Estimated or calculated value |
| `Measured` | `Gemessen` | Directly measured value |
| `Aggregated` | `Aggregiert` | Aggregated from multiple sources |
| `Unknown` | `Unbekannt` | Accuracy not specified |

#### Area Measurement Standards

| Value (EN) | Value (DE) | Description |
|------------|------------|-------------|
| `SIA 416` | `SIA 416` | Swiss standard for areas and volumes in building construction |
| `DIN 277-1` | `DIN 277-1` | German standard for floor areas |
| `MFG` | `MFG` | Mietflächenrichtlinie für gewerblichen Raum |
| `IPMS` | `IPMS` | International Property Measurement Standards |
| `RICS` | `RICS` | Royal Institution of Chartered Surveyors |
| `BOMA` | `BOMA` | Building Owners and Managers Association |
| `NA` | `k.A.` | Not applicable / Other standard |

#### Area Types

##### SIA 416 (Swiss)

| Value (EN) | Value (DE) | Abbreviation |
|------------|------------|--------------|
| `Gross floor area` | `Bruttogeschossfläche` | BGF |
| `Net floor area` | `Nettogeschossfläche` | NGF |
| `Usable area` | `Nutzfläche` | NF |
| `Circulation area` | `Verkehrsfläche` | VF |
| `Technical area` | `Funktionsfläche` | FF |
| `Construction area` | `Konstruktionsfläche` | KF |

##### SIA 380/1 (Swiss)

| Value (EN) | Value (DE) | Abbreviation |
|------------|------------|--------------|
| `Energy reference area` | `Energiebezugsfläche` | EBF |

##### DIN 277 / General

| Value (EN) | Value (DE) |
|------------|------------|
| `Gross floor area` | `Brutto-Grundfläche` |
| `Construction area` | `Konstruktions-Grundfläche` |
| `Net room area` | `Netto-Raumfläche` |
| `Circulation area` | `Verkehrsfläche` |
| `Net usable area` | `Nutzungsfläche` |
| `Technical area` | `Technikfläche` |

##### Usage-specific

| Value (EN) | Value (DE) |
|------------|------------|
| `Living/residence area` | `Wohnfläche` |
| `Office area` | `Bürofläche` |
| `Production/laboratory area` | `Produktions-/Laborfläche` |
| `Storage/distribution/selling area` | `Lager-/Verkaufsfläche` |
| `Education/teaching/culture area` | `Bildungs-/Kulturfläche` |
| `Healing/care area` | `Pflege-/Heilfläche` |
| `Other uses` | `Sonstige Nutzung` |

##### IPMS

| Value (EN) | Value (DE) |
|------------|------------|
| `Gross external area` | `Brutto-Aussenfläche` |
| `External Wall area` | `Aussenwandfläche` |
| `Gross internal area` | `Brutto-Innenfläche` |
| `A-Vertical penetrations` | `A-Vertikale Durchdringungen` |
| `B-Structural elements` | `B-Tragende Elemente` |
| `C-Technical services` | `C-Technische Anlagen` |
| `D-Hygiene areas` | `D-Sanitärbereiche` |
| `E-Circulation areas` | `E-Verkehrsflächen` |
| `F-Amenities` | `F-Gemeinschaftsflächen` |
| `G-Workspace` | `G-Arbeitsflächen` |
| `H-Other areas` | `H-Sonstige Flächen` |

##### BOMA / Rental

| Value (EN) | Value (DE) |
|------------|------------|
| `Rentable area` | `Mietfläche` |
| `Rentable exclusion` | `Mietflächenausschluss` |
| `Boundary area` | `Grenzfläche` |
| `Rentable area common occupancy` | `Mietfläche Gemeinschaftsnutzung` |
| `Rentable area exclusive occupancy` | `Mietfläche Exklusivnutzung` |
| `Building amenity area` | `Gebäude-Gemeinschaftsfläche` |
| `Building service area` | `Gebäude-Servicefläche` |
| `Floor service area` | `Geschoss-Servicefläche` |
| `Tenant ancillary area` | `Mieter-Nebenfläche` |
| `Tenant area` | `Mieterfläche` |
| `Landlord area` | `Vermieterfläche` |

##### Site / Land

| Value (EN) | Value (DE) |
|------------|------------|
| `Land area` | `Grundstücksfläche` |
| `Total surface area` | `Gesamtfläche` |
| `Vegetated area` | `Begrünte Fläche` |
| `Non-vegetated area` | `Nicht begrünte Fläche` |
| `Green ground area` | `Grünfläche Boden` |
| `Green roof area` | `Dachbegrünung` |
| `Green wall area` | `Fassadenbegrünung` |
| `Green terrace area` | `Terrassenbegrünung` |

##### Other / Swiss-specific

| Value (EN) | Value (DE) |
|------------|------------|
| `Major vertical penetrations` | `Vertikale Hauptdurchdringungen` |
| `Occupant Storage area` | `Mieterlager` |
| `Parking area` | `Parkfläche` |
| `Unenclosed Building Feature: Covered Gallery` | `Offener Gebäudeteil: Überdachte Galerie` |
| `Vacant area` | `Leerfläche` |
| `Volume` | `Volumen` |
| `Workplaces` | `Arbeitsplätze` |
| `Cleaning area` | `Reinigungsfläche` |
| `Not applicable` | `Nicht anwendbar` |

---

### A.4 Operational Measurement Types

#### Measurement Types

| Value (EN) | Value (DE) | Description |
|------------|------------|-------------|
| `Energy` | `Energie` | Energy consumption (electricity, gas, heating, etc.) |
| `Water` | `Wasser` | Water consumption and discharge |
| `Waste` | `Abfall` | Waste generation and disposal |
| `Fugitive` | `Flüchtige Emissionen` | Fugitive emissions (refrigerants, gases) |

#### Measurement Units

| Value (EN) | Value (DE) | Description |
|------------|------------|-------------|
| `kWh` | `kWh` | Kilowatt-hours (energy) |
| `cubm` | `m³` | Cubic meters - water, gas |
| `kg` | `kg` | Kilograms (waste, emissions) |

#### Procurement Types

| Value (EN) | Value (DE) | Description |
|------------|------------|-------------|
| `Procured by third party` | `Fremdbezug` | Third-party procurement |
| `Self-procured` | `Eigenbezug` | Self-procured resources |
| `Unspecified` | `Nicht spezifiziert` | Not specified |

#### Purpose Types

| Value (EN) | Value (DE) | Description |
|------------|------------|-------------|
| `Space heating` | `Raumheizung` | Heating of spaces |
| `Water heating` | `Warmwasserbereitung` | Water heating |
| `Heating (unspecified)` | `Heizung (nicht spezifiziert)` | Unspecified heating |
| `Cooling` | `Kühlung` | Cooling/air conditioning |
| `Lighting` | `Beleuchtung` | Lighting |
| `Elevator` | `Aufzug` | Elevator operation |
| `Appliances` | `Geräte` | Appliances |
| `Other` | `Andere` | Other purposes |
| `Unspecified` | `Nicht spezifiziert` | Not specified |
| `Heat pump` | `Wärmepumpe` | Heat pump operation |
| `EV charging` | `Elektrofahrzeug-Laden` | Electric vehicle charging |

#### Space Types

| Value (EN) | Value (DE) | Description |
|------------|------------|-------------|
| `Shared services/Common spaces` | `Gemeinschaftsflächen` | Shared/common areas |
| `Tenant space` | `Mieterfläche` | Tenant-occupied space |
| `Landlord space` | `Vermieterfläche` | Landlord-managed space |
| `Whole building` | `Gesamtes Gebäude` | Entire building |
| `Unspecified` | `Nicht spezifiziert` | Not specified |
| `Shared services` | `Gemeinschaftsdienste` | Shared services areas |
| `Common spaces` | `Allgemeinflächen` | Common areas |
| `Outdoor` | `Aussenbereich` | Outdoor areas |
| `Exterior area` | `Aussenfläche` | Exterior spaces |
| `Parking` | `Parkierung` | Parking areas |

#### Data Source Types

| Value (EN) | Value (DE) | Description |
|------------|------------|-------------|
| `Export` | `Export` | Exported from external system |
| `Survey` | `Erhebung` | Collected via survey |
| `Meter` | `Zähler` | Read from meter |
| `Invoice` | `Rechnung` | Extracted from invoice |

#### Measurement SubTypes

##### Electricity

| Value (EN) | Value (DE) |
|------------|------------|
| `Electricity from grid (green electricity contract)` | `Netzstrom (Ökostromvertrag)` |
| `Electricity from grid (normal contract)` | `Netzstrom (Normalvertrag)` |
| `Electricity self-generated & exported` | `Eigenstrom (eingespeist)` |
| `Electricity self-generated & consumed` | `Eigenstrom (verbraucht)` |
| `Electricity (unspecified)` | `Strom (nicht spezifiziert)` |
| `REC` | `HKN` |

##### Gas

| Value (EN) | Value (DE) |
|------------|------------|
| `Natural gas (standard mix)` | `Erdgas (Standardmix)` |
| `Green natural gas` | `Biogas` |
| `Natural gas (unspecified)` | `Erdgas (nicht spezifiziert)` |

##### Other Energy

| Value (EN) | Value (DE) |
|------------|------------|
| `Oil-based fuels` | `Ölbasierte Brennstoffe` |
| `Fuel (unspecified)` | `Brennstoff (nicht spezifiziert)` |
| `District heating` | `Fernwärme` |
| `District heating (green contract)` | `Fernwärme (Ökovertrag)` |
| `District cooling` | `Fernkälte` |
| `District cooling (green contract)` | `Fernkälte (Ökovertrag)` |
| `Biomass` | `Biomasse` |
| `Solar thermal` | `Solarthermie` |
| `Geothermal` | `Geothermie` |

##### Water

| Value (EN) | Value (DE) |
|------------|------------|
| `Fresh water (municipal water supply)` | `Frischwasser (Wasserversorgung)` |
| `Ground water (collected on site)` | `Grundwasser (vor Ort)` |
| `Rain water (collected on site)` | `Regenwasser (vor Ort)` |
| `Reclaimed water` | `Aufbereitetes Wasser` |
| `Water discharge` | `Abwasser` |
| `Water consumption (unspecified)` | `Wasserverbrauch (nicht spezifiziert)` |
| `Water supply` | `Wasserversorgung` |

##### Waste (Non-hazardous)

| Value (EN) | Value (DE) |
|------------|------------|
| `Recycling: non-hazardous` | `Recycling: ungefährlich` |
| `Incineration: non-hazardous` | `Verbrennung: ungefährlich` |
| `Waste to energy: non-hazardous` | `Energetische Verwertung: ungefährlich` |
| `Landfill: non-hazardous` | `Deponie: ungefährlich` |
| `Reuse: non-hazardous` | `Wiederverwendung: ungefährlich` |
| `Other/Unknown: non-hazardous` | `Andere/Unbekannt: ungefährlich` |

##### Waste (Hazardous)

| Value (EN) | Value (DE) |
|------------|------------|
| `Recycling: hazardous` | `Recycling: gefährlich` |
| `Incineration: hazardous` | `Verbrennung: gefährlich` |
| `Waste to energy: hazardous` | `Energetische Verwertung: gefährlich` |
| `Landfill: hazardous` | `Deponie: gefährlich` |
| `Reuse: hazardous` | `Wiederverwendung: gefährlich` |
| `Other/Unknown: hazardous` | `Andere/Unbekannt: gefährlich` |

##### Fugitive Emissions

| Value (EN) | Value (DE) |
|------------|------------|
| `Carbon dioxide (CO2)` | `Kohlendioxid (CO2)` |
| `Methane (CH4)` | `Methan (CH4)` |
| `Nitrous oxide (N2O)` | `Distickstoffoxid (N2O)` |
| `Sulfur hexafluoride (SF6)` | `Schwefelhexafluorid (SF6)` |
| `Nitrogen trifluoride (NF3)` | `Stickstofftrifluorid (NF3)` |
| Various refrigerants (R-11, R-12, R-22, R-134a, etc.) | Diverse Kältemittel (R-11, R-12, R-22, R-134a, etc.) |

#### Accuracy Options

##### Direct

| Value (EN) | Value (DE) |
|------------|------------|
| `Missing` | `Fehlend` |
| `Estimated` | `Geschätzt` |
| `Metered` | `Gemessen` |
| `Extrapolated` | `Extrapoliert` |
| `Planned` | `Geplant` |
| `Simulated` | `Simuliert` |
| `Unspecified` | `Nicht spezifiziert` |
| `Normalised` | `Normalisiert` |
| `Implausible` | `Unplausibel` |

##### Calculated

| Value (EN) | Value (DE) |
|------------|------------|
| `Calculated based on estimated data` | `Berechnet auf Basis geschätzter Daten` |
| `Calculated based on metered data` | `Berechnet auf Basis gemessener Daten` |
| `Calculated based on extrapolated data` | `Berechnet auf Basis extrapolierter Daten` |
| `Calculated based on planned data` | `Berechnet auf Basis geplanter Daten` |
| `Calculated based on simulated data` | `Berechnet auf Basis simulierter Daten` |
| `Calculated based on data with unspecified accuracy` | `Berechnet auf Basis nicht spezifizierter Daten` |
| `Calculated based on normalised data` | `Berechnet auf Basis normalisierter Daten` |
| `Calculated based on implausible data` | `Berechnet auf Basis unplausibler Daten` |

##### Projection

| Value (EN) | Value (DE) |
|------------|------------|
| `Projection based on estimated data` | `Projektion auf Basis geschätzter Daten` |
| `Projection based on metered data` | `Projektion auf Basis gemessener Daten` |
| `Projection based on extrapolated data` | `Projektion auf Basis extrapolierter Daten` |
| `Projection based on planned data` | `Projektion auf Basis geplanter Daten` |
| `Projection based on simulated data` | `Projektion auf Basis simulierter Daten` |
| `Projection based on data with unspecified accuracy` | `Projektion auf Basis nicht spezifizierter Daten` |
| `Projection based on normalised data` | `Projektion auf Basis normalisierter Daten` |
| `Projection based on implausible data` | `Projektion auf Basis unplausibler Daten` |

##### Calculated from Projection

| Value (EN) | Value (DE) |
|------------|------------|
| `Calculated based on projected estimated data` | `Berechnet auf Basis projizierter geschätzter Daten` |
| `Calculated based on projected metered data` | `Berechnet auf Basis projizierter gemessener Daten` |
| `Calculated based on projected extrapolated data` | `Berechnet auf Basis projizierter extrapolierter Daten` |
| `Calculated based on projected planned data` | `Berechnet auf Basis projizierter geplanter Daten` |
| `Calculated based on projected simulated data` | `Berechnet auf Basis projizierter simulierter Daten` |
| `Calculated based on projected data with unspecified accuracy` | `Berechnet auf Basis projizierter nicht spezifizierter Daten` |
| `Calculated based on projected normalised data` | `Berechnet auf Basis projizierter normalisierter Daten` |

##### Other

| Value (EN) | Value (DE) |
|------------|------------|
| `Retrofit scenario` | `Sanierungsszenario` |

---

### A.5 Document, Contact & Contract Types

#### Document Types

| Value (EN) | Value (DE) | Description |
|------------|------------|-------------|
| `Floor plan` | `Grundriss` | Floor plan |
| `Building plan` | `Bauplan` | Construction/building plan |
| `Energy certificate` | `Energieausweis` | Energy certificate (GEAK, etc.) |
| `Building permit` | `Baubewilligung` | Building permit |
| `Fire protection concept` | `Brandschutzkonzept` | Fire protection concept |
| `Lease agreement` | `Mietvertrag` | Lease agreement |
| `Maintenance protocol` | `Wartungsprotokoll` | Maintenance protocol |
| `Photograph` | `Foto` | Photograph |
| `Other` | `Sonstige` | Other |

#### Contact Roles

| Value (EN) | Value (DE) | Description |
|------------|------------|-------------|
| `Property manager` | `Objektverantwortliche` | Property manager |
| `Caretaker` | `Hauswart` | Caretaker/janitor |
| `Portfolio manager` | `Portfolioverantwortliche` | Portfolio manager |
| `Technical manager` | `Technischer Leiter` | Technical manager |
| `Security officer` | `Sicherheitsbeauftragter` | Security officer |
| `Emergency contact` | `Notfallkontakt` | Emergency contact |
| `Tenant representative` | `Mietervertreter` | Tenant representative |
| `Other` | `Sonstige` | Other |

#### Contract Types

| Value (EN) | Value (DE) | Description |
|------------|------------|-------------|
| `Maintenance contract` | `Wartungsvertrag` | Maintenance contract |
| `Cleaning contract` | `Reinigungsvertrag` | Cleaning contract |
| `Security services` | `Sicherheitsdienst` | Security services |
| `Lease agreement` | `Mietvertrag` | Lease agreement |
| `Service contract` | `Servicevertrag` | General service contract |
| `Insurance` | `Versicherung` | Insurance contract |
| `Other` | `Sonstige` | Other |

---

### A.6 Asset Categories & Cost Groups

#### Asset Categories

| Value (EN) | Value (DE) | Description |
|------------|------------|-------------|
| `HVAC` | `HLK` | Heating, ventilation, and air conditioning |
| `Elevators` | `Aufzüge` | Elevators and lifts |
| `Fire protection` | `Brandschutz` | Fire protection systems |
| `Electrical` | `Elektro` | Electrical systems |
| `Plumbing` | `Sanitär` | Plumbing and sanitary |
| `Security` | `Sicherheit` | Security systems |
| `IT/Communication` | `IT/Kommunikation` | IT and communication infrastructure |
| `Building automation` | `Gebäudeautomation` | Building automation |
| `Other` | `Sonstige` | Other |

#### Cost Periods

| Value (EN) | Value (DE) | Description |
|------------|------------|-------------|
| `Annual` | `Jährlich` | Yearly cost |
| `Monthly` | `Monatlich` | Monthly cost |
| `Quarterly` | `Quartalsweise` | Quarterly cost |
| `OneTime` | `Einmalig` | One-time cost |

#### Cost Groups (Swiss SN 506 511)

Common cost group codes for building operations:

| Code | Category (EN) | Category (DE) | Description (EN) | Description (DE) |
|------|---------------|---------------|------------------|------------------|
| 311 | Operating | Betrieb | Electricity supply | Stromversorgung |
| 312 | Operating | Betrieb | Heating energy | Heizenergie |
| 313 | Operating | Betrieb | Water supply | Wasserversorgung |
| 321 | Operating | Betrieb | Wastewater disposal | Abwasserentsorgung |
| 330 | Operating | Betrieb | Interior cleaning | Innenreinigung |
| 350 | Operating | Betrieb | Security services | Sicherheitsdienste |
| 410 | Maintenance | Instandhaltung | Building construction maintenance | Bauliche Instandhaltung |
| 420 | Maintenance | Instandhaltung | Technical installations maintenance | Technische Instandhaltung |

---

### B.1 Value Conversions

> **Note:** The demo uses German enum values. See [Appendix A](#7-appendix-a-reference-tables) for complete EN/DE mappings.

#### Ownership Type Mapping

| Source Value | Target Value (DE) | Target Value (EN) |
|--------------|-------------------|-------------------|
| Eigentum Bund | `Eigentümer` | `Owner` |
| Miete | `Mieter` | `Tenant` |

#### Monument Protection Mapping

| Source Value | Target Value |
|--------------|--------------|
| Ja | `true` |
| Nein | `false` |

#### Area Measurement Accuracy Mapping

| Source Value | Target Value (DE) | Target Value (EN) |
|--------------|-------------------|-------------------|
| Gemessen | `Gemessen` | `Measured` |
| Geschätzt | `Geschätzt` | `Estimated` |
| Berechnet | `Geschätzt` | `Estimated` |
| Aggregiert | `Aggregiert` | `Aggregated` |

#### Unit Conversion

| Source Unit | Target Unit (DE) | Target Unit (EN) |
|-------------|------------------|------------------|
| m² | `m²` | `sqm` |
| ft² | `ft²` | `sqft` |
| m³ | `m³` | `cubm` |

---

### B.2 ISO 8601 Date Handling

All dates must be converted to ISO 8601 format: `yyyy-mm-ddThh:mm:ssZ`

#### Conversion Rules

| Source Format | Conversion Rule | Example |
|---------------|-----------------|---------|
| Year only (e.g., "2019") | Use January 1st: `yyyy-01-01T00:00:00Z` | "2019" → "2019-01-01T00:00:00Z" |
| Date only (e.g., "2019-03-15") | Add time: `yyyy-mm-ddT00:00:00Z` | "2019-03-15" → "2019-03-15T00:00:00Z" |
| German format (e.g., "15.03.2019") | Parse and convert | "15.03.2019" → "2019-03-15T00:00:00Z" |
| Null or empty | Use `null` for optional fields | "" → `null` |

#### Timestamp Handling

- All timestamps should be in UTC (suffix `Z`)
- For Swiss local time, convert to UTC before storing
- Preserve original format in extensionData if precision is lost

---

## 9. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1.0 | 2024-XX-XX | - | Initial draft - Building entity |
| 0.2.0 | 2024-XX-XX | - | Added Address entity with Swiss extensions |
| 0.3.0 | 2024-XX-XX | - | Added Site entity with Swiss extensions |
| 0.4.0 | 2024-XX-XX | - | Consolidated to single schema table per entity with Comment column |
| 0.5.0 | 2024-XX-XX | - | Added Area Measurement (Bemessung) entity with SIA type mappings |
| 0.6.0 | 2024-XX-XX | - | Added Land (Grundstück) entity with Swiss cadastral extensions |
| 0.7.0 | 2024-XX-XX | - | Restructured document: grouped entities by function, consolidated enumerations to Appendix A, separated transformation rules to Appendix B |
| 0.8.0 | 2024-XX-XX | - | Added Floor (Geschoss) and Space (Raum) entities with climate, ventilation, and occupancy fields |

---

## 10. References

- [SIA 416](https://www.sia.ch/) - Swiss Standard for areas in building construction
- [SIA 380/1](https://www.sia.ch/) - Swiss Standard for energy performance of buildings
- [SN 506 511](https://www.snv.ch/) - Swiss Standard for building operating costs
- [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) - Date and time format
- [ISO 3166](https://www.iso.org/iso-3166-country-codes.html) - Country codes
- [ISO 4217](https://www.iso.org/iso-4217-currency-codes.html) - Currency codes
- [ISO 14040](https://www.iso.org/standard/37456.html) - Life cycle assessment principles
- [GeoJSON Specification](https://geojson.org/) - Geographic JSON format
- [LV95](https://www.swisstopo.admin.ch/en/knowledge-facts/surveying-geodesy/reference-frames/local/lv95.html) - Swiss coordinate reference system
- [EGID/EGRID](https://www.bfs.admin.ch/bfs/de/home/register/gebaeude-wohnungsregister.html) - Swiss Federal Building/Property Identifiers
- [BuildingMinds Platform](https://www.buildingminds.com/) - Real estate data platform
