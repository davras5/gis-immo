# Refactoring Plan: German → English Naming Standardization

## Overview

This plan outlines a systematic approach to refactor German naming conventions to English across the codebase. The refactoring is organized into **phases** with clear dependencies to minimize risk of introducing bugs.

---

## Dependency Analysis

### Critical Dependency Chain

```
HTML IDs/Classes ←→ CSS Selectors ←→ JavaScript DOM Queries
       ↓                                      ↓
  data-* attributes            ←→      JS string comparisons
```

**Rule**: When renaming, ALL references must be updated simultaneously within a phase.

---

## Phase 1: Status Badge Classes (Low Risk)

**Files affected**: `js/app.js`, `css/main.css`, `documentation/DESIGNGUIDE.md`

### 1.1 Building Status Badges

| Current (German) | New (English) | Files |
|------------------|---------------|-------|
| `.status-badge.in-betrieb` | `.status-badge.status-active` | CSS, JS |
| `.status-badge.in-renovation` | `.status-badge.status-renovation` | CSS, JS |
| `.status-badge.in-planung` | `.status-badge.status-planning` | CSS, JS |
| `.status-badge.ausser-betrieb` | `.status-badge.status-inactive` | CSS, JS |

**JS Changes** (`app.js:1357-1359`):
```javascript
// Before
var statusClass = props.status === 'In Betrieb' ? 'in-betrieb' :
                  props.status === 'In Renovation' ? 'in-renovation' :
                  props.status === 'In Planung' ? 'in-planung' : 'ausser-betrieb';

// After
var statusClass = props.status === 'In Betrieb' ? 'status-active' :
                  props.status === 'In Renovation' ? 'status-renovation' :
                  props.status === 'In Planung' ? 'status-planning' : 'status-inactive';
```

**CSS Changes** (`main.css:714-732`, `main.css:2780-2798`):
- Rename all `.status-badge.in-*` selectors
- Update accessibility icon selectors

### 1.2 Contract Status Badges

| Current (German) | New (English) | Files |
|------------------|---------------|-------|
| `.vertrag-status` | `.contract-status` | CSS, JS |
| `.vertrag-status.aktiv` | `.contract-status.status-active` | CSS, JS |
| `.vertrag-status.gekuendigt` | `.contract-status.status-terminated` | CSS, JS |
| `.vertrag-status.ausgelaufen` | `.contract-status.status-expired` | CSS, JS |

**JS Changes** (`app.js:2556-2563`, `app.js:2749`):
```javascript
// Before
function getStatusClass(status) {
    if (s === 'aktiv') return 'aktiv';
    if (s === 'gekündigt') return 'gekuendigt';
    if (s === 'ausgelaufen') return 'ausgelaufen';
}

// After
function getContractStatusClassName(status) {
    if (s === 'aktiv') return 'status-active';
    if (s === 'gekündigt') return 'status-terminated';
    if (s === 'ausgelaufen') return 'status-expired';
}
```

---

## Phase 2: Tab System (Medium Risk)

**Files affected**: `index.html`, `js/app.js`

### 2.1 Tab Identifiers

| Current (German) | New (English) |
|------------------|---------------|
| `data-tab="uebersicht"` | `data-tab="overview"` |
| `data-tab="bemessungen"` | `data-tab="measurements"` |
| `data-tab="kosten"` | `data-tab="costs"` |
| `data-tab="vertraege"` | `data-tab="contracts"` |
| `data-tab="ausstattung"` | `data-tab="assets"` |
| `data-tab="dokumente"` | `data-tab="documents"` |
| `data-tab="kontakte"` | `data-tab="contacts"` |

**Affected locations**:
- `index.html:321-327` (data-tab attributes)
- `index.html:333, 513, 588, 661, 738, 811, 878` (data-content attributes)
- `app.js:2178-2203` (targetTab comparisons)

---

## Phase 3: Entity Table System (High Risk - Most Complex)

This phase has the most dependencies and must be done carefully.

### 3.1 Table Variable Names (JS)

| Current | New |
|---------|-----|
| `kontakteTable` | `contactsTable` |
| `kostenTable` | `costsTable` |
| `vertraegeTable` | `contractsTable` |
| `ausstattungTable` | `assetsTable` |

### 3.2 Function Names (JS)

| Current | New |
|---------|-----|
| `loadKontakteForBuilding` | `loadContactsForBuilding` |
| `loadKostenForBuilding` | `loadCostsForBuilding` |
| `loadVertraegeForBuilding` | `loadContractsForBuilding` |
| `loadAusstattungForBuilding` | `loadAssetsForBuilding` |
| `renderKontakteTable` | `renderContactsTable` |
| `renderKostenTable` | `renderCostsTable` |
| `renderVertraegeTable` | `renderContractsTable` |
| `renderAusstattungTable` | `renderAssetsTable` |

### 3.3 HTML Element IDs

**Contacts Table**:
| Current | New |
|---------|-----|
| `#kontakte-table` | `#contacts-table` |
| `#kontakte-tbody` | `#contacts-tbody` |
| `#kontakte-filter` | `#contacts-filter` |
| `#select-all-kontakte` | `#select-all-contacts` |
| `#btn-add-kontakt` | `#btn-add-contact` |
| `.kontakte-action` | `.contacts-action` |
| `.kontakt-checkbox` | `.contact-checkbox` |

**Costs Table**:
| Current | New |
|---------|-----|
| `#kosten-table` | `#costs-table` |
| `#kosten-tbody` | `#costs-tbody` |
| `#kosten-filter` | `#costs-filter` |
| `#select-all-kosten` | `#select-all-costs` |
| `#btn-add-kosten` | `#btn-add-cost` |
| `.kosten-action` | `.costs-action` |
| `.kosten-checkbox` | `.cost-checkbox` |

**Contracts Table**:
| Current | New |
|---------|-----|
| `#vertraege-table` | `#contracts-table` |
| `#vertraege-tbody` | `#contracts-tbody` |
| `#vertraege-filter` | `#contracts-filter` |
| `#select-all-vertraege` | `#select-all-contracts` |
| `#btn-add-vertrag` | `#btn-add-contract` |
| `.vertraege-action` | `.contracts-action` |
| `.vertrag-checkbox` | `.contract-checkbox` |

**Assets Table**:
| Current | New |
|---------|-----|
| `#ausstattung-table` | `#assets-table` |
| `#ausstattung-tbody` | `#assets-tbody` |
| `#ausstattung-filter` | `#assets-filter` |
| `#select-all-ausstattung` | `#select-all-assets` |
| `#btn-add-ausstattung` | `#btn-add-asset` |
| `.ausstattung-action` | `.assets-action` |
| `.ausstattung-checkbox` | `.asset-checkbox` |

### 3.4 CSS Column Classes

**Contacts**:
- `.col-kontakt-id` → `.col-contact-id`
- `.col-kontakt-name` → `.col-contact-name`
- `.col-kontakt-rolle` → `.col-contact-role`
- `.col-kontakt-org` → `.col-contact-org`
- `.col-kontakt-telefon` → `.col-contact-phone`
- `.col-kontakt-email` → `.col-contact-email`

**Costs**:
- `.col-kosten-id` → `.col-cost-id`
- `.col-kosten-gruppe` → `.col-cost-group`
- `.col-kosten-art` → `.col-cost-type`
- `.col-kosten-betrag` → `.col-cost-amount`
- `.col-kosten-einheit` → `.col-cost-unit`
- `.col-kosten-stichtag` → `.col-cost-date`

**Contracts**:
- `.col-vertrag-id` → `.col-contract-id`
- `.col-vertrag-art` → `.col-contract-type`
- `.col-vertrag-partner` → `.col-contract-partner`
- `.col-vertrag-beginn` → `.col-contract-start`
- `.col-vertrag-ende` → `.col-contract-end`
- `.col-vertrag-betrag` → `.col-contract-amount`
- `.col-vertrag-status` → `.col-contract-status`

**Assets**:
- `.col-ausstattung-id` → `.col-asset-id`
- `.col-ausstattung-bezeichnung` → `.col-asset-name`
- `.col-ausstattung-kategorie` → `.col-asset-category`
- `.col-ausstattung-hersteller` → `.col-asset-manufacturer`
- `.col-ausstattung-baujahr` → `.col-asset-year`
- `.col-ausstattung-standort` → `.col-asset-location`

---

## Phase 4: Documentation Updates (Low Risk)

Update `documentation/DESIGNGUIDE.md`:
- Update status badge examples to use new class names

---

## Implementation Order

1. **Phase 1.1** - Building status badges (CSS + JS)
2. **Phase 1.2** - Contract status badges (CSS + JS)
3. **Phase 2** - Tab system (HTML + JS)
4. **Phase 3.1-3.2** - JS table variables and functions
5. **Phase 3.3** - HTML element IDs
6. **Phase 3.4** - CSS column classes
7. **Phase 4** - Documentation

---

## Testing Checklist

After each phase, verify:

- [ ] Application loads without console errors
- [ ] List view renders correctly with status badges
- [ ] Gallery view renders correctly
- [ ] Detail view tabs switch correctly
- [ ] Measurements table works (filter, sort, select)
- [ ] Documents table works
- [ ] Contacts table works
- [ ] Costs table works
- [ ] Contracts table works
- [ ] Assets table works
- [ ] Filter pane opens/closes
- [ ] Map markers display correctly

---

## Rollback Strategy

Each phase will be committed separately. If issues are found:
1. Revert the specific phase commit
2. Fix the issue
3. Re-apply changes

---

## Estimated Changes

| File | Approximate Changes |
|------|---------------------|
| `js/app.js` | ~50 lines |
| `css/main.css` | ~60 lines |
| `index.html` | ~80 lines |
| `documentation/DESIGNGUIDE.md` | ~5 lines |

**Total**: ~195 line changes across 4 files
