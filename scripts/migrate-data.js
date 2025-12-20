#!/usr/bin/env node
/**
 * Migration Script: Split buildings.geojson into separate entity files
 *
 * This script extracts embedded arrays from buildings.geojson and creates
 * separate JSON files for each entity type with proper FK references.
 *
 * Usage: node scripts/migrate-data.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Paths
const DATA_DIR = path.join(__dirname, '..', 'data');
const SOURCE_FILE = path.join(DATA_DIR, 'buildings.geojson');
const BACKUP_FILE = path.join(DATA_DIR, 'buildings.geojson.backup');

// Entity mapping: embedded field name -> output file config
const ENTITY_MAPPING = {
  bemessungen: {
    outputFile: 'area-measurements.json',
    rootKey: 'areaMeasurements',
    idField: 'id',
    newIdField: 'id'
  },
  dokumente: {
    outputFile: 'documents.json',
    rootKey: 'documents',
    idField: 'id',
    newIdField: 'id'
  },
  kontakte: {
    outputFile: 'contacts.json',
    rootKey: 'contacts',
    idField: 'id',
    newIdField: 'id'
  },
  vertraege: {
    outputFile: 'contracts.json',
    rootKey: 'contracts',
    idField: 'id',
    newIdField: 'id'
  },
  ausstattung: {
    outputFile: 'assets.json',
    rootKey: 'assets',
    idField: 'id',
    newIdField: 'id'
  },
  kosten: {
    outputFile: 'costs.json',
    rootKey: 'costs',
    idField: 'id',
    newIdField: 'id'
  }
};

/**
 * Generate a UUID v4
 */
function generateUUID() {
  return crypto.randomUUID();
}

/**
 * Main migration function
 */
function migrate() {
  console.log('Starting migration...\n');

  // Read source file
  console.log(`Reading: ${SOURCE_FILE}`);
  const sourceData = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf8'));

  // Create backup
  console.log(`Creating backup: ${BACKUP_FILE}`);
  fs.writeFileSync(BACKUP_FILE, JSON.stringify(sourceData, null, 2));

  // Initialize entity collections
  const entities = {};
  for (const key of Object.keys(ENTITY_MAPPING)) {
    entities[key] = [];
  }

  // Track ID mappings (old ID -> new UUID)
  const idMappings = {};

  // Process each building
  console.log(`\nProcessing ${sourceData.features.length} buildings...\n`);

  for (const feature of sourceData.features) {
    const buildingId = feature.properties.id;
    console.log(`  Processing: ${buildingId} - ${feature.properties.name}`);

    // Extract each entity type
    for (const [embeddedKey, config] of Object.entries(ENTITY_MAPPING)) {
      const embeddedArray = feature.properties[embeddedKey];

      if (embeddedArray && Array.isArray(embeddedArray)) {
        for (const item of embeddedArray) {
          const oldId = item[config.idField];
          const newId = generateUUID();

          // Track mapping
          if (!idMappings[embeddedKey]) {
            idMappings[embeddedKey] = {};
          }
          idMappings[embeddedKey][oldId] = newId;

          // Create new entity with UUID and FK reference
          // Spread item first, then override id with UUID
          const newEntity = {
            ...item,
            [config.newIdField]: newId,
            legacyId: oldId,  // Keep old ID for reference
            buildingIds: [buildingId]
          };

          // Remove the old id field if it differs from newIdField
          if (config.idField !== config.newIdField) {
            delete newEntity[config.idField];
          } else {
            // id field is same, we already set it to UUID above
            // just need to make sure we don't duplicate
          }

          entities[embeddedKey].push(newEntity);
        }
      }

      // Remove embedded array from building
      delete feature.properties[embeddedKey];
    }
  }

  // Write entity files
  console.log('\nWriting entity files:');
  for (const [embeddedKey, config] of Object.entries(ENTITY_MAPPING)) {
    const outputPath = path.join(DATA_DIR, config.outputFile);
    const outputData = {
      [config.rootKey]: entities[embeddedKey]
    };

    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
    console.log(`  ${config.outputFile}: ${entities[embeddedKey].length} entities`);
  }

  // Write slimmed buildings.geojson
  console.log(`\nWriting slimmed: ${SOURCE_FILE}`);
  fs.writeFileSync(SOURCE_FILE, JSON.stringify(sourceData, null, 2));

  // Write ID mappings for reference
  const mappingsFile = path.join(DATA_DIR, 'id-mappings.json');
  fs.writeFileSync(mappingsFile, JSON.stringify(idMappings, null, 2));
  console.log(`Writing ID mappings: ${mappingsFile}`);

  // Summary
  console.log('\n=== Migration Complete ===\n');
  console.log('Files created:');
  for (const config of Object.values(ENTITY_MAPPING)) {
    console.log(`  - data/${config.outputFile}`);
  }
  console.log('  - data/id-mappings.json (legacy ID reference)');
  console.log('  - data/buildings.geojson.backup (original backup)');
  console.log('\nBuildings.geojson has been slimmed (embedded arrays removed).');
}

// Run migration
try {
  migrate();
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}
