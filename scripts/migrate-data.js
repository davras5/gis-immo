#!/usr/bin/env node
/**
 * Migration Script: Split buildings.geojson into separate entity files
 *
 * This script extracts embedded arrays from buildings.geojson and creates
 * separate JSON files for each entity type with proper FK references.
 *
 * Schema aligned with DATAMODEL.md specifications.
 *
 * Usage: node scripts/migrate-data.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Paths
const DATA_DIR = path.join(__dirname, '..', 'data');
const SOURCE_FILE = path.join(DATA_DIR, 'buildings.geojson.backup');
const BUILDINGS_OUTPUT = path.join(DATA_DIR, 'buildings.geojson');

/**
 * Generate a UUID v4
 */
function generateUUID() {
  return crypto.randomUUID();
}

/**
 * Convert date from DD.MM.YYYY to ISO 8601 format
 */
function convertToISO8601(dateStr) {
  if (!dateStr) return null;

  // Already in ISO format
  if (dateStr.includes('T') || /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    if (!dateStr.includes('T')) {
      return dateStr + 'T00:00:00Z';
    }
    return dateStr;
  }

  // DD.MM.YYYY format
  const match = dateStr.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (match) {
    return `${match[3]}-${match[2]}-${match[1]}T00:00:00Z`;
  }

  // Try to parse other formats
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date.toISOString();
  }

  return dateStr; // Return as-is if can't parse
}

/**
 * Extract currency from unit string (e.g., "CHF/Jahr" -> "CHF")
 */
function extractCurrency(unit) {
  if (!unit) return 'CHF';
  const parts = unit.split('/');
  return parts[0].trim() || 'CHF';
}

/**
 * Extract period from unit string (e.g., "CHF/Jahr" -> "Jährlich")
 */
function extractPeriod(unit) {
  if (!unit) return 'Jährlich';
  if (unit.includes('Jahr')) return 'Jährlich';
  if (unit.includes('Monat')) return 'Monatlich';
  if (unit.includes('Quartal')) return 'Quartalsweise';
  return 'Jährlich';
}

/**
 * Transform Area Measurement to DATAMODEL.md schema
 */
function transformAreaMeasurement(item, buildingId, index) {
  const id = generateUUID();
  return {
    areaMeasurementId: id,
    type: item.areaType,
    value: item.value,
    unit: item.unit,
    validFrom: convertToISO8601(item.validFrom),
    validUntil: item.validUntil ? convertToISO8601(item.validUntil) : null,
    bmEstimation: false,
    accuracy: item.accuracy || 'Geschätzt',
    standard: item.standard || 'SIA 416',
    buildingIds: [buildingId],
    legacyId: item.id,
    extensionData: {
      source: item.source || 'Manuell',
      originalUnit: item.unit
    }
  };
}

/**
 * Transform Document to DATAMODEL.md schema
 */
function transformDocument(item, buildingId, index) {
  const id = generateUUID();
  return {
    documentId: id,
    name: item.titel,
    type: item.dokumentTyp,
    buildingIds: [buildingId],
    validFrom: convertToISO8601(item.datum),
    validUntil: null,
    fileFormat: item.dateiformat,
    fileSize: item.dateigroesse,
    url: item.url || '#',
    description: `${item.dokumentTyp} für Gebäude ${buildingId}`,
    version: '1.0',
    legacyId: item.id,
    extensionData: {}
  };
}

/**
 * Transform Contact to DATAMODEL.md schema
 */
function transformContact(item, buildingId, index) {
  const id = generateUUID();
  const isPrimary = item.rolle === 'Objektverantwortliche' ||
                    item.rolle === 'Objektverantwortlicher' ||
                    index === 0;
  return {
    contactId: id,
    name: item.name,
    role: item.rolle,
    buildingIds: [buildingId],
    organisation: item.organisation,
    phone: item.telefon,
    email: item.email,
    isPrimary: isPrimary,
    validFrom: '2020-01-01T00:00:00Z',
    validUntil: null,
    legacyId: item.id,
    extensionData: {}
  };
}

/**
 * Transform Contract to DATAMODEL.md schema
 */
function transformContract(item, buildingId, index) {
  const id = generateUUID();
  return {
    contractId: id,
    type: item.vertragsart,
    buildingIds: [buildingId],
    validFrom: convertToISO8601(item.vertragsbeginn),
    validUntil: item.vertragsende ? convertToISO8601(item.vertragsende) : null,
    contractPartner: item.vertragspartner,
    amount: item.betrag,
    currency: 'CHF',
    status: item.status || 'Aktiv',
    legacyId: item.id,
    extensionData: {
      paymentTerms: 'Jährlich im Voraus',
      autoRenewal: item.vertragsende === null
    }
  };
}

/**
 * Transform Asset to DATAMODEL.md schema
 */
function transformAsset(item, buildingId, index) {
  const id = generateUUID();
  // Generate plausible maintenance dates based on installation year
  const installYear = item.baujahr || 2020;
  const lastMaintenance = new Date(2024, Math.floor(Math.random() * 12),
                                   Math.floor(Math.random() * 28) + 1);
  const nextMaintenance = new Date(lastMaintenance);
  nextMaintenance.setFullYear(nextMaintenance.getFullYear() + 1);

  return {
    assetId: id,
    name: item.bezeichnung,
    category: item.kategorie,
    buildingIds: [buildingId],
    manufacturer: item.hersteller,
    installationYear: item.baujahr,
    location: item.standort,
    status: 'In Betrieb',
    serialNumber: `SN-${buildingId}-${String(index + 1).padStart(3, '0')}`,
    maintenanceInterval: 'Jährlich',
    lastMaintenanceDate: lastMaintenance.toISOString().split('T')[0] + 'T00:00:00Z',
    nextMaintenanceDate: nextMaintenance.toISOString().split('T')[0] + 'T00:00:00Z',
    legacyId: item.id,
    extensionData: {
      warrantyUntil: installYear + 5 <= 2024 ? null : `${installYear + 5}-12-31T00:00:00Z`,
      technicalLifespan: 20
    }
  };
}

/**
 * Transform Cost to DATAMODEL.md schema
 */
function transformCost(item, buildingId, index) {
  const id = generateUUID();
  const currency = extractCurrency(item.einheit);
  const period = extractPeriod(item.einheit);

  return {
    costId: id,
    costGroup: item.kostengruppe,
    costType: item.kostenart,
    buildingIds: [buildingId],
    amount: item.betrag,
    unit: item.einheit,
    currency: currency,
    period: period,
    referenceDate: convertToISO8601(item.stichtag),
    legacyId: item.id,
    extensionData: {
      budgetYear: 2024,
      costCenter: `CC-${buildingId}`
    }
  };
}

/**
 * Main migration function
 */
function migrate() {
  console.log('Starting migration with DATAMODEL.md schema alignment...\n');

  // Read source file (backup)
  console.log(`Reading: ${SOURCE_FILE}`);
  if (!fs.existsSync(SOURCE_FILE)) {
    console.error('Backup file not found. Please ensure buildings.geojson.backup exists.');
    process.exit(1);
  }
  const sourceData = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf8'));

  // Initialize entity collections
  const entities = {
    areaMeasurements: [],
    documents: [],
    contacts: [],
    contracts: [],
    assets: [],
    costs: []
  };

  // Track ID mappings (old ID -> new UUID)
  const idMappings = {
    areaMeasurements: {},
    documents: {},
    contacts: {},
    contracts: {},
    assets: {},
    costs: {}
  };

  // Process each building
  console.log(`\nProcessing ${sourceData.features.length} buildings...\n`);

  const slimmedFeatures = [];

  for (const feature of sourceData.features) {
    const buildingId = feature.properties.id;
    console.log(`  Processing: ${buildingId} - ${feature.properties.name}`);

    // Create slimmed building (without embedded arrays)
    const slimmedProperties = { ...feature.properties };
    delete slimmedProperties.bemessungen;
    delete slimmedProperties.dokumente;
    delete slimmedProperties.kontakte;
    delete slimmedProperties.vertraege;
    delete slimmedProperties.ausstattung;
    delete slimmedProperties.kosten;

    slimmedFeatures.push({
      type: 'Feature',
      properties: slimmedProperties,
      geometry: feature.geometry
    });

    // Transform and collect Area Measurements
    if (feature.properties.bemessungen) {
      feature.properties.bemessungen.forEach((item, index) => {
        const transformed = transformAreaMeasurement(item, buildingId, index);
        entities.areaMeasurements.push(transformed);
        idMappings.areaMeasurements[item.id] = transformed.areaMeasurementId;
      });
    }

    // Transform and collect Documents
    if (feature.properties.dokumente) {
      feature.properties.dokumente.forEach((item, index) => {
        const transformed = transformDocument(item, buildingId, index);
        entities.documents.push(transformed);
        idMappings.documents[item.id] = transformed.documentId;
      });
    }

    // Transform and collect Contacts
    if (feature.properties.kontakte) {
      feature.properties.kontakte.forEach((item, index) => {
        const transformed = transformContact(item, buildingId, index);
        entities.contacts.push(transformed);
        idMappings.contacts[item.id] = transformed.contactId;
      });
    }

    // Transform and collect Contracts
    if (feature.properties.vertraege) {
      feature.properties.vertraege.forEach((item, index) => {
        const transformed = transformContract(item, buildingId, index);
        entities.contracts.push(transformed);
        idMappings.contracts[item.id] = transformed.contractId;
      });
    }

    // Transform and collect Assets
    if (feature.properties.ausstattung) {
      feature.properties.ausstattung.forEach((item, index) => {
        const transformed = transformAsset(item, buildingId, index);
        entities.assets.push(transformed);
        idMappings.assets[item.id] = transformed.assetId;
      });
    }

    // Transform and collect Costs
    if (feature.properties.kosten) {
      feature.properties.kosten.forEach((item, index) => {
        const transformed = transformCost(item, buildingId, index);
        entities.costs.push(transformed);
        idMappings.costs[item.id] = transformed.costId;
      });
    }
  }

  // Write entity files
  console.log('\nWriting entity files (DATAMODEL.md schema):');

  const outputFiles = [
    { file: 'area-measurements.json', key: 'areaMeasurements', data: entities.areaMeasurements },
    { file: 'documents.json', key: 'documents', data: entities.documents },
    { file: 'contacts.json', key: 'contacts', data: entities.contacts },
    { file: 'contracts.json', key: 'contracts', data: entities.contracts },
    { file: 'assets.json', key: 'assets', data: entities.assets },
    { file: 'costs.json', key: 'costs', data: entities.costs }
  ];

  for (const { file, key, data } of outputFiles) {
    const outputPath = path.join(DATA_DIR, file);
    fs.writeFileSync(outputPath, JSON.stringify({ [key]: data }, null, 2));
    console.log(`  ${file}: ${data.length} entities`);
  }

  // Write slimmed buildings.geojson
  const slimmedData = {
    type: 'FeatureCollection',
    name: sourceData.name,
    features: slimmedFeatures
  };
  console.log(`\nWriting slimmed: ${BUILDINGS_OUTPUT}`);
  fs.writeFileSync(BUILDINGS_OUTPUT, JSON.stringify(slimmedData, null, 2));

  // Write ID mappings for reference
  const mappingsFile = path.join(DATA_DIR, 'id-mappings.json');
  fs.writeFileSync(mappingsFile, JSON.stringify(idMappings, null, 2));
  console.log(`Writing ID mappings: ${mappingsFile}`);

  // Summary
  console.log('\n=== Migration Complete (DATAMODEL.md Schema) ===\n');
  console.log('Schema changes applied:');
  console.log('  - Renamed ID fields (id → areaMeasurementId, documentId, etc.)');
  console.log('  - Renamed German fields to English (titel → name, rolle → role, etc.)');
  console.log('  - Converted dates to ISO 8601 format');
  console.log('  - Added mandatory fields (bmEstimation, currency, etc.)');
  console.log('  - Moved source data to extensionData objects');
  console.log('  - Added plausible test data for optional fields');
  console.log('\nFiles created:');
  for (const { file } of outputFiles) {
    console.log(`  - data/${file}`);
  }
  console.log('  - data/id-mappings.json');
}

// Run migration
try {
  migrate();
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}
