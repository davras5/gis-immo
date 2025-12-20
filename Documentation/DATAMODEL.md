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

## Entity: Building

The building is the core entity representing a physical structure in the portfolio.

### Schema Definition

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| **buildingId** | string | Unique identifier; must either originate from the previous system or be explicitly defined. | **mandatory**, minLength: 1, maxLength: 50 |
| **name** | string | User specific building name (e.g., "Bundeshaus West", "EMEA Headquarter"). | **mandatory**, minLength: 1, maxLength: 200 |
| **siteId** | string | Refers to the site which the building belongs to. | **mandatory**, minLength: 1, maxLength: 50 |
| **primaryTypeOfBuilding** | string, enum | Primary type of building use. See [Building Types](#building-types). | **mandatory** |
| **typeOfOwnership** | string, enum | Is the building owned or leased? Options: `Owner`, `Tenant` | **mandatory** |
| **validFrom** | string | The record can be used from this date onwards. ISO 8601 format: `yyyy-mm-ddThh:mm:ssZ` | **mandatory**, minLength: 20 |
| **validUntil** | string | The record is valid until this date. ISO 8601 format: `yyyy-mm-ddThh:mm:ssZ` | **mandatory**, minLength: 20 (null allowed for currently valid records) |
| addressIds | array[string] | Array of address IDs linked to this building. | minLength: 1, maxLength: 50 per ID |
| airConditioning | boolean | Does the building have air conditioning? | |
| buildingCode | string | User specific building code. | minLength: 1, maxLength: 70 |
| buildingPermitDate | string | Building permit date. ISO 8601 format. | minLength: 20 |
| certificateIds | array[string] | Array of certificate IDs. | minLength: 1, maxLength: 50 per ID |
| constructionYear | string | Year of construction. ISO 8601 format. Use `yyyy-01-01T00:00:00Z` if only year is known. | minLength: 20 |
| electricVehicleChargingStations | number | Number of EV charging stations. | maximum: 9999 |
| energyEfficiencyClass | string | Energy Efficiency Class of Building (e.g., "A", "B", "C"). | minLength: 1, maxLength: 50 |
| energyRatingIds | array[string] | Array of energy rating IDs. | minLength: 1, maxLength: 50 per ID |
| eventType | string, enum | Type of the event as domain event. Options: `BuildingAdded`, `BuildingUpdated`, `BuildingDeleted` | |
| expectedLifeEndDate | string | Expected end date of building lifecycle. ISO 8601 format. | minLength: 20 |
| extensionData | object | Extension data for storing any custom data. | JSON object |
| fossilFuelExposure | string, enum | Fossil fuel exposure type. Options: `Extraction`, `Storage`, `Transport`, `Manufacture`, `Other`, `Not exposed` | |
| monumentProtection | boolean | Is the building declared as a protected monument? | |
| netZeroEnergyBuilding | boolean | Is the building a net zero energy building? | |
| numberOfEmployees | number | Number of employees. | maximum: 999999 |
| numberOfFloors | number | Number of floors/stories in the building. | |
| parkingSpaces | number | Number of parking spaces. | maximum: 9999 |
| percentageOfOwnership | number | Percentage of ownership. | maximum: 100 |
| primaryEnergyType | string, enum | Primary type of energy used. See [Energy Types](#energy-types). | |
| primaryWaterType | string | Type of water used. | minLength: 1, maxLength: 50 |
| secondaryHeatingType | string, enum | Secondary type of heating. See [Heating Types](#heating-types). | |
| secondaryTypeOfBuilding | string, enum | Secondary type of building use. See [Building Types](#building-types). | |
| selfUse | boolean | Is the building self-used? | |
| status | string | Status of building (e.g., "In Betrieb", "In Renovation"). | minLength: 1, maxLength: 50 |
| tenantStructure | string, enum | Tenant structure. Options: `Single-tenant`, `Multi-tenant` | |
| valuationIds | array[string] | Array of valuation IDs. | minLength: 1, maxLength: 50 per ID |
| yearOfLastRefurbishment | string | Year of last refurbishment. ISO 8601 format. | minLength: 20 |

### Swiss-Specific Fields (BBL Extension)

These fields are specific to the Swiss context and stored in `extensionData`:

| Field | Type | Description |
|-------|------|-------------|
| egid | string | Eidgenössischer Gebäudeidentifikator (Federal Building Identifier) |
| egrid | string | Eidgenössischer Grundstücksidentifikator (Federal Property Identifier) |
| grundstueckId | string | Property/parcel ID |
| grundstueckName | string | Property/parcel name |
| teilportfolio | string | Sub-portfolio category (e.g., "Verwaltungsgebäude") |
| teilportfolioGruppe | string | Sub-portfolio group (e.g., "Bundesverwaltung") |
| region | string | Region/Canton |
| heatingSource | string | Heating source (Wärmequelle) |
| hotWater | string | Hot water system description |
| heatingGenerator | string | Heating generator type (Wärmeerzeuger) |

### Mapping: Current GeoJSON → Target Schema

| Current Field (GeoJSON) | Target Field | Notes |
|------------------------|--------------|-------|
| `id` | `buildingId` | Direct mapping |
| `name` | `name` | Direct mapping |
| `grundstueck_id` | `siteId` | Map to site entity |
| `objektart1` | `primaryTypeOfBuilding` | Needs value mapping |
| `objektart2` | `secondaryTypeOfBuilding` | Needs value mapping |
| `eigentum` | `typeOfOwnership` | "Eigentum Bund" → "Owner", "Miete" → "Tenant" |
| `gueltig_von` | `validFrom` | Convert to ISO 8601 |
| `gueltig_bis` | `validUntil` | Convert to ISO 8601 |
| `baujahr` | `constructionYear` | Convert year to ISO 8601 |
| `baubewilligung` | `buildingPermitDate` | Convert to ISO 8601 |
| `sanierung` | `yearOfLastRefurbishment` | Convert to ISO 8601 |
| `energieklasse` | `energyEfficiencyClass` | Direct mapping |
| `ladestationen` | `electricVehicleChargingStations` | Direct mapping |
| `parkplaetze` | `parkingSpaces` | Direct mapping |
| `geschosse` | `numberOfFloors` | Custom field (extensionData) |
| `denkmalschutz` | `monumentProtection` | "Ja" → true, "Nein" → false |
| `status` | `status` | Direct mapping |
| `waermeerzeuger` | `extensionData.heatingGenerator` | Swiss-specific |
| `waermequelle` | `extensionData.heatingSource` | Swiss-specific |
| `warmwasser` | `extensionData.hotWater` | Swiss-specific |
| `egid` | `extensionData.egid` | Swiss-specific |
| `egrid` | `extensionData.egrid` | Swiss-specific |
| `teilportfolio` | `extensionData.teilportfolio` | Swiss-specific |
| `teilportfolio_gruppe` | `extensionData.teilportfolioGruppe` | Swiss-specific |
| `region` | `extensionData.region` | Swiss-specific |

---

## Enumerations

### Building Types

Primary and secondary building type options:

**Retail**
- `Retail`
- `Retail High Street`
- `Retail Retail Centers`
- `Retail Shopping Center`
- `Retail Strip Mall`
- `Retail Lifestyle Center`
- `Retail Warehouse`
- `Retail Restaurants/Bars`
- `Retail Other`

**Office**
- `Office`
- `Office Corporate`
- `Office Low-Rise Office`
- `Office Mid-Rise Office`
- `Office High-Rise Office`
- `Office Medical Office`
- `Office Business Park`
- `Office Other`

**Industrial**
- `Industrial`
- `Industrial Distribution Warehouse`
- `Industrial Industrial Park`
- `Industrial Manufacturing`
- `Industrial Refrigerated Warehouse`
- `Industrial Non-refrigerated Warehouse`
- `Industrial Other`

**Residential**
- `Residential`
- `Residential Multi-Family`
- `Residential Low-Rise Multi-Family`
- `Residential Mid-Rise Multi-Family`
- `Residential High-Rise Multi-Family`
- `Residential Family Homes`
- `Residential Student Housing`
- `Residential Retirement Living`
- `Residential Other`

**Lodging / Hotel**
- `Hotel`
- `Lodging`
- `Lodging Leisure & Recreation`
- `Lodging Indoor Arena`
- `Lodging Fitness Center`
- `Lodging Performing Arts`
- `Lodging Swimming Center`
- `Lodging Museum/Gallery`
- `Lodging Leisure & Recreation Other`

**Education**
- `Education`
- `Education School`
- `Education University`
- `Education Library`
- `Education Other`

**Technology / Science**
- `Technology/Science`
- `Technology/Science Data Center`
- `Technology/Science Laboratory/Life sciences`
- `Technology/Science Other`

**Health Care**
- `Health Care`
- `Health Care Health Care Center`
- `Health Care Senior Homes`
- `Health Care Other`

**Mixed Use**
- `Mixed Use`
- `Mixed Use Office/Retail`
- `Mixed Use Office/Residential`
- `Mixed Use Office/Industrial`
- `Mixed Use Other`

**Other**
- `Other`
- `Other Parking (Indoors)`
- `Other Self-Storage`

### Energy Types

Options for `primaryEnergyType`:

- `Natural Gas`
- `Coal`
- `Nuclear`
- `Petroleum`
- `Hydropower`
- `Wind`
- `Biomass`
- `Geothermal`
- `Solar`

### Heating Types

Options for `secondaryHeatingType`:

- `District heating`
- `Natural gas`
- `Oil-based fuels`
- `Solar thermal`
- `Unspecified`
- `Heat pump`
- `Electricity (radiator)`
- `Biomass`
- `Micro combined heat and power`

---

## Example: Building Object

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

## Related Entities (Preview)

The following entities are related to buildings and will be documented in separate sections:

| Entity | Description | Relationship |
|--------|-------------|--------------|
| **Site** | A logical grouping of buildings (e.g., campus, property) | 1 Site → n Buildings |
| **Address** | Physical address of a building | 1 Building → n Addresses |
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

---

## References

- [SIA 416](https://www.sia.ch/) - Swiss Standard for areas in building construction
- [ISO 8601](https://www.iso.org/iso-8601-date-and-time-format.html) - Date and time format
- [GeoJSON Specification](https://geojson.org/) - Geographic JSON format
- EGID/EGRID - Swiss Federal Building/Property Identifiers
