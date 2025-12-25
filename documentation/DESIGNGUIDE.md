# Design Guide

**BBL GIS Immobilienportfolio**
Version 1.0 | Last Updated: December 2024

---

## Design Philosophy

### Vision

Create a **professional, efficient, and accessible** geographic information system that empowers users to manage Switzerland's federal real estate portfolio with clarity and confidence.

### Core Values

| Value | Description |
|-------|-------------|
| **Clarity** | Information hierarchy guides users to what matters most |
| **Efficiency** | Minimize clicks and cognitive load for common tasks |
| **Reliability** | Consistent patterns build user trust and muscle memory |
| **Accessibility** | Every user can access and use the system effectively |
| **Swiss Quality** | Precision, neutrality, and professional excellence |

### Design Language

Our design language is **functional Swiss modernism**—clean lines, purposeful spacing, and restrained color usage that lets content speak for itself. We avoid decorative elements in favor of meaningful visual communication.

---

## Design Principles

### 1. Content First
The map and property data are the heroes. UI elements should support, not compete with, content visibility.

```
DO: Use subtle borders and backgrounds
DON'T: Add heavy shadows or bright colors to UI chrome
```

### 2. Progressive Disclosure
Show essential information immediately; reveal details on demand.

```
DO: Use accordions, tabs, and expandable sections
DON'T: Overwhelm users with all data at once
```

### 3. Spatial Consistency
Maintain predictable spacing relationships throughout the interface.

```
DO: Use the 4px spacing scale consistently
DON'T: Use arbitrary pixel values (13px, 17px, 23px)
```

### 4. Meaningful Color
Reserve color for status, interaction, and emphasis—never decoration.

```
DO: Use status colors to convey building states
DON'T: Add color gradients for visual interest
```

### 5. Accessible by Default
Accessibility is not an afterthought; it's built into every decision.

```
DO: Ensure 4.5:1 contrast ratios, 44px touch targets
DON'T: Rely solely on color to convey information
```

---

## Design Tokens

Design tokens are the foundation of our visual language. All values are defined as CSS custom properties in `:root` for consistency and maintainability.

### Token Categories

| Category | Purpose | Example |
|----------|---------|---------|
| Color | Brand, semantic, and UI colors | `--primary-red`, `--grey-600` |
| Typography | Font sizes, weights, line heights | `--text-base`, `--font-medium` |
| Spacing | Margins, padding, gaps | `--space-4`, `--space-8` |
| Radius | Border corner rounding | `--radius-md`, `--radius-lg` |
| Shadow | Elevation and depth | `--shadow-md`, `--shadow-lg` |
| Motion | Transition timing | `--transition-fast` |

### Usage Rules

1. **Always use tokens** — Never hardcode values
2. **Semantic naming** — Use purpose-based names when available
3. **Fallback values** — Provide fallbacks for older browsers

```css
/* Correct */
color: var(--grey-900);
padding: var(--space-4);

/* Incorrect */
color: #2D3236;
padding: 16px;
```

---

## Typography

### Font Stack

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

We use system fonts for:
- **Performance** — No font loading delay
- **Native feel** — Matches platform conventions
- **Legibility** — Optimized for screens

### Type Scale

Based on a **1.25 ratio (Major Third)** for harmonious progression.

| Token | Size | Use Case |
|-------|------|----------|
| `--text-xs` | 12px | Minimum size, captions, badges |
| `--text-sm` | 14px | Body text, table content, UI labels |
| `--text-base` | 16px | Primary body text |
| `--text-lg` | 18px | Section headers, emphasis |
| `--text-xl` | 20px | Page section titles |
| `--text-2xl` | 24px | Primary headings |

### Font Weights

| Token | Weight | Use Case |
|-------|--------|----------|
| `--font-normal` | 400 | Body text |
| `--font-medium` | 500 | Labels, badges |
| `--font-semibold` | 600 | Subheadings, emphasis |
| `--font-bold` | 700 | Primary headings |

### Line Heights

| Token | Value | Use Case |
|-------|-------|----------|
| `--leading-tight` | 1.25 | Headings |
| `--leading-snug` | 1.375 | Subheadings |
| `--leading-normal` | 1.5 | Body text |
| `--leading-relaxed` | 1.625 | Long-form content |

### Heading Hierarchy

```css
h1 { font-size: var(--text-2xl); font-weight: var(--font-bold); line-height: var(--leading-tight); }
h2 { font-size: var(--text-xl); font-weight: var(--font-semibold); line-height: var(--leading-snug); }
h3 { font-size: var(--text-lg); font-weight: var(--font-semibold); line-height: var(--leading-snug); }
h4 { font-size: var(--text-base); font-weight: var(--font-semibold); line-height: var(--leading-normal); }
```

---

## Color System

### Color Philosophy

Our color palette is intentionally restrained:
- **Neutral greys** for UI structure
- **Brand red** for primary actions
- **Status colors** for semantic meaning
- **Interactive blue** for links and focus

### Grey Scale

A cool blue-grey palette that feels professional and Swiss.

| Token | Hex | Use Case |
|-------|-----|----------|
| `--grey-900` | #2D3236 | Primary text, headings |
| `--grey-800` | #3D4347 | Dark backgrounds |
| `--grey-700` | #4E555A | Secondary text |
| `--grey-600` | #5E666B | Muted text, icons |
| `--grey-500` | #6C757D | Panel headers, accents |
| `--grey-300` | #C5CCD1 | Borders, dividers |
| `--grey-200` | #DDE2E6 | Light borders |
| `--grey-100` | #F3F5F7 | Light backgrounds |
| `--grey-50` | #F9FAFB | Subtle backgrounds |
| `--white` | #FFFFFF | Base background |

### Brand Colors

| Token | Hex | Use Case |
|-------|-----|----------|
| `--primary-red` | #CC0000 | Primary actions, brand accent |
| `--primary-red-dark` | #AA0000 | Hover state |
| `--accent-panel` | #6C757D | Panel headers |

### Status Colors

Status colors communicate building lifecycle states at a glance.

| Status | Token | Background | Text | Icon |
|--------|-------|------------|------|------|
| In Betrieb | `--status-active` | #E8F5E9 | #1B5E20 | check_circle |
| In Renovation | `--status-renovation` | #FFF3E0 | #E65100 | build |
| In Planung | `--status-planning` | #E3F2FD | #0D47A1 | schedule |
| Ausser Betrieb | `--status-inactive` | #F3F5F7 | #5E666B | close |

### Interactive Colors

| Token | Hex | Use Case |
|-------|-----|----------|
| `--interactive-blue` | #005EA8 | Links, focus rings |
| `--focus-ring` | #005EA8 | Keyboard focus indicator |

### Color Accessibility

All color combinations must meet WCAG AA standards (4.5:1 for normal text).

| Combination | Contrast | Rating |
|-------------|----------|--------|
| Grey-900 on white | 13.6:1 | AAA |
| Grey-600 on white | 5.6:1 | AA |
| Interactive blue on white | 7.8:1 | AAA |
| Status text on status bg | 4.5:1+ | AA |

---

## Spacing & Layout

### Spacing Scale

Based on a **4px base unit** for consistent rhythm.

| Token | Value | Use Case |
|-------|-------|----------|
| `--space-0` | 0 | No spacing |
| `--space-1` | 4px | Minimal gaps |
| `--space-2` | 8px | Tight spacing |
| `--space-3` | 12px | Compact padding |
| `--space-4` | 16px | Standard padding |
| `--space-5` | 20px | Comfortable padding |
| `--space-6` | 24px | Section spacing |
| `--space-8` | 32px | Major sections |
| `--space-10` | 40px | Large gaps |
| `--space-12` | 48px | Page sections |
| `--space-16` | 64px | Major divisions |

### Border Radius

| Token | Value | Use Case |
|-------|-------|----------|
| `--radius-sm` | 4px | Buttons, inputs |
| `--radius-md` | 8px | Cards, panels |
| `--radius-lg` | 12px | Large containers |
| `--radius-full` | 9999px | Pills, badges |

### Shadow System

| Token | Value | Use Case |
|-------|-------|----------|
| `--shadow-sm` | 0 1px 3px rgba(0,0,0,0.1) | Subtle depth |
| `--shadow-md` | 0 2px 8px rgba(0,0,0,0.15) | Cards, dropdowns |
| `--shadow-lg` | 0 4px 12px rgba(0,0,0,0.15) | Floating elements |
| `--shadow-xl` | 0 4px 16px rgba(0,0,0,0.2) | Modals, panels |

### Layout Structure

```
┌─────────────────────────────────────────────────────┐
│ Header (90px)                                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Main Content Area                      Filter     │
│  (Map/List/Gallery/Detail)             Pane       │
│                                        (340px)     │
│                                                     │
├─────────────────────────────────────────────────────┤
│ Footer                                              │
└─────────────────────────────────────────────────────┘
```

### Grid Systems

**Gallery Grid:**
```css
display: grid;
grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
gap: var(--space-6);
```

**Detail Grid:**
```css
display: grid;
grid-template-columns: 1fr 1fr;
gap: var(--space-6);
```

**Data Grid:**
```css
display: grid;
grid-template-columns: 1fr 1fr;
gap: var(--space-8);
```

---

## Components

### Buttons

#### Primary Button
For main actions—one per view maximum.

```css
.btn-primary {
  background: var(--grey-900);
  color: white;
  padding: var(--space-2) var(--space-5);
  border-radius: var(--radius-sm);
  min-height: 44px; /* Touch target */
}
```

**States:**
- Hover: `background: var(--grey-700)`
- Active: `background: var(--grey-900)`
- Disabled: `opacity: 0.5; cursor: not-allowed`

#### Secondary Button
For secondary actions alongside primary.

```css
.btn-secondary {
  background: white;
  color: var(--grey-900);
  border: 1px solid var(--grey-300);
  padding: var(--space-2) var(--space-5);
  border-radius: var(--radius-sm);
  min-height: 44px;
}
```

#### Tertiary Button
For low-emphasis actions.

```css
.btn-tertiary {
  background: transparent;
  color: var(--grey-700);
  border: none;
  padding: var(--space-2) var(--space-3);
}
```

#### Icon Button
For toolbar and floating actions.

```css
.icon-btn {
  background: white;
  border: 1px solid var(--grey-300);
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  height: 40px;
  display: flex;
  align-items: center;
  gap: 6px;
}
```

### Status Badges

Pill-shaped badges indicating building state.

```css
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
}

.status-badge.status-active {
  background: var(--status-active-bg);
  color: var(--status-active-text);
}
```

### Cards

#### Gallery Card
For grid view property display.

```css
.gallery-card {
  background: white;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s, transform 0.2s;
}

.gallery-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

#### Detail Section
For grouped information display.

```css
.detail-section {
  background: white;
  border: 1px solid var(--grey-300);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.detail-section-header {
  background: var(--grey-100);
  padding: var(--space-3) var(--space-4);
  font-weight: var(--font-semibold);
  border-bottom: 1px solid var(--grey-300);
}
```

### Tables

```css
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.data-table th {
  position: sticky;
  top: 0;
  background: white;
  padding: 12px 16px;
  border-bottom: 1px solid var(--grey-300);
  font-weight: var(--font-medium);
  color: var(--grey-600);
  text-align: left;
}

.data-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--grey-100);
}

.data-table tr:hover {
  background: var(--grey-50);
}
```

### Tabs

```css
.tabs {
  display: flex;
  border-bottom: 1px solid var(--grey-300);
  background: white;
}

.tab {
  padding: 14px 20px;
  font-size: var(--text-sm);
  color: var(--grey-600);
  border-bottom: 3px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.tab:hover {
  color: var(--grey-900);
  background: var(--grey-50);
}

.tab.active {
  color: var(--primary-red);
  border-bottom-color: var(--primary-red);
  font-weight: var(--font-medium);
}
```

### Accordions

```css
.accordion-header {
  padding: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
}

.accordion-arrow {
  transition: transform 0.3s;
}

.accordion-header.active .accordion-arrow {
  transform: rotate(90deg);
}

.accordion-content {
  display: none;
  padding: 12px 16px;
}

.accordion-content.show {
  display: block;
}
```

### Form Inputs

```css
.input {
  height: 44px;
  border: 1px solid var(--grey-300);
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  transition: border-color 0.2s;
}

.input:hover {
  border-color: var(--grey-500);
}

.input:focus {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
  border-color: var(--interactive-blue);
}
```

### Dropdowns

```css
.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid var(--grey-200);
  border-radius: 6px;
  box-shadow: var(--shadow-lg);
  min-width: 200px;
  z-index: 1000;
}

.dropdown-item {
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.15s;
}

.dropdown-item:hover {
  background: var(--grey-50);
}
```

---

## Patterns

### View Toggle Pattern

```html
<div class="view-toggle">
  <button class="view-toggle-btn active" data-view="map">
    <span class="material-symbols-outlined">map</span>
    <span class="view-label">Karte</span>
  </button>
  <button class="view-toggle-btn" data-view="list">
    <span class="material-symbols-outlined">view_list</span>
    <span class="view-label">Liste</span>
  </button>
</div>
```

### Search Pattern

```html
<div class="search-container">
  <button class="search-icon-btn">
    <span class="material-symbols-outlined">search</span>
  </button>
  <input type="search" class="search-input" placeholder="Suchen...">
  <button class="search-clear-btn">
    <span class="material-symbols-outlined">close</span>
  </button>
</div>
```

### Filter Panel Pattern

```html
<aside class="filter-pane">
  <header class="filter-header">
    <h2>Filter</h2>
    <button class="close-btn">
      <span class="material-symbols-outlined">close</span>
    </button>
  </header>

  <div class="filter-content">
    <section class="filter-section">
      <button class="filter-section-header">
        <span>Status</span>
        <span class="material-symbols-outlined">expand_more</span>
      </button>
      <div class="filter-section-content">
        <label class="filter-option">
          <input type="checkbox" checked>
          <span>In Betrieb</span>
        </label>
      </div>
    </section>
  </div>

  <footer class="filter-footer">
    <button class="btn-secondary">Zurücksetzen</button>
    <button class="btn-primary">Anwenden</button>
  </footer>
</aside>
```

### Empty State Pattern

```html
<div class="empty-state">
  <span class="material-symbols-outlined empty-icon">search_off</span>
  <h3>Keine Ergebnisse</h3>
  <p>Versuchen Sie andere Suchkriterien</p>
</div>
```

### Loading State Pattern

```html
<div class="loading-state">
  <div class="spinner"></div>
  <p>Laden...</p>
</div>
```

### Breadcrumb Pattern

```html
<nav class="breadcrumb" aria-label="Breadcrumb">
  <a href="#">Übersicht</a>
  <span class="material-symbols-outlined">chevron_right</span>
  <a href="#">Portfolio</a>
  <span class="material-symbols-outlined">chevron_right</span>
  <span class="current">Gebäude Details</span>
</nav>
```

---

## Accessibility

### Core Requirements

| Requirement | Standard | Implementation |
|-------------|----------|----------------|
| Color Contrast | WCAG AA (4.5:1) | All text meets minimum |
| Touch Targets | 44x44px minimum | Buttons, inputs sized appropriately |
| Focus Indicators | Visible 2px outline | Blue focus ring on all interactive |
| Keyboard Navigation | Full support | Tab order, skip links, ARIA |
| Screen Readers | ARIA labels | Semantic HTML, alt text |

### Skip Link

```html
<a class="skip-link" href="#main-content">
  Zum Hauptinhalt springen
</a>
```

### Focus Visible Styles

```css
*:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
```

### ARIA Usage

| Pattern | ARIA Attributes |
|---------|-----------------|
| Tabs | `role="tablist"`, `role="tab"`, `aria-selected` |
| Accordions | `aria-expanded`, `aria-controls` |
| Modals | `role="dialog"`, `aria-modal`, `aria-labelledby` |
| Live regions | `aria-live="polite"` |
| Icons | `aria-hidden="true"` (decorative) |

### Semantic HTML

```html
<!-- Use semantic elements -->
<header>
<nav>
<main>
<aside>
<section>
<article>
<footer>

<!-- Use buttons for actions -->
<button type="button">Action</button>

<!-- Use links for navigation -->
<a href="/page">Navigate</a>
```

---

## Responsive Design

### Breakpoints

| Name | Max Width | Target |
|------|-----------|--------|
| Desktop | > 1024px | Large screens, default |
| Tablet | ≤ 1024px | iPads, small laptops |
| Mobile | ≤ 767px | Phones, portrait |
| Small Mobile | ≤ 479px | Small phones |

### Responsive Patterns

**Header Transformation (Mobile):**
```css
@media (max-width: 767px) {
  #header {
    flex-wrap: wrap;
    height: auto;
    padding: 12px 16px;
  }

  #logo-area { order: 1; }
  #header-right { order: 2; margin-left: auto; }
  #search-area { order: 3; width: 100%; }
}
```

**Grid Collapse (Mobile):**
```css
@media (max-width: 767px) {
  .detail-grid,
  .data-grid,
  .gallery-grid {
    grid-template-columns: 1fr;
  }
}
```

**Bottom Sheet Pattern (Mobile):**
```css
@media (max-width: 767px) {
  .panel {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    max-height: 70vh;
    border-radius: 16px 16px 0 0;
  }
}
```

### Mobile-First Approach

Write base styles for mobile, then enhance for larger screens:

```css
/* Mobile-first base */
.component {
  padding: var(--space-3);
}

/* Tablet enhancement */
@media (min-width: 768px) {
  .component {
    padding: var(--space-4);
  }
}

/* Desktop enhancement */
@media (min-width: 1025px) {
  .component {
    padding: var(--space-5);
  }
}
```

---

## Motion & Animation

### Timing Guidelines

| Duration | Use Case |
|----------|----------|
| 0.15s | Micro-interactions (hover, focus) |
| 0.2s | Standard transitions (background, color) |
| 0.25s | Panel slides |
| 0.3s | Larger transitions (accordion, panels) |

### Easing Functions

| Easing | Use Case |
|--------|----------|
| `ease` | General purpose |
| `ease-in-out` | Panel open/close |
| `linear` | Spinners, continuous |

### Common Transitions

```css
/* Hover effects */
transition: background 0.2s;
transition: background 0.2s, border-color 0.2s;

/* Panel animations */
transition: width 0.3s ease, min-width 0.3s ease;
transition: opacity 0.25s ease, transform 0.25s ease;

/* Card hover lift */
transition: box-shadow 0.2s, transform 0.2s;
```

### Animations

**Spinner:**
```css
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.spinner {
  animation: spin 1s linear infinite;
}
```

**Panel Slide-In:**
```css
.panel {
  opacity: 0;
  transform: translateX(10px);
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.panel.show {
  opacity: 1;
  transform: translateX(0);
}
```

### Motion Reduction

Respect user preferences for reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Iconography

### Icon Library

We use **Google Material Symbols Outlined** for consistent, professional iconography.

```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet">
```

### Usage

```html
<span class="material-symbols-outlined" aria-hidden="true">icon_name</span>
```

### Icon Sizes

| Context | Size | Token |
|---------|------|-------|
| Inline text | 16px | `--text-base` |
| Buttons | 18px | — |
| Header | 20px | — |
| Navigation | 24px | — |
| Empty states | 64px | — |

### Common Icons

| Action | Icon |
|--------|------|
| Search | `search` |
| Filter | `filter_list` |
| Close | `close` |
| Menu | `menu` |
| Expand | `expand_more` |
| Chevron | `chevron_right` |
| Map | `map` |
| List | `view_list` |
| Grid | `grid_view` |
| Info | `info` |
| Edit | `edit` |
| Delete | `delete` |
| Download | `download` |
| Share | `share` |

### Icon Accessibility

Decorative icons should be hidden from screen readers:

```html
<!-- Decorative icon -->
<span class="material-symbols-outlined" aria-hidden="true">info</span>

<!-- Icon-only button needs label -->
<button aria-label="Close panel">
  <span class="material-symbols-outlined" aria-hidden="true">close</span>
</button>
```

---

## Best Practices

### Do's

- **Use design tokens** — Never hardcode colors, spacing, or typography values
- **Maintain consistency** — Same component = same styling throughout
- **Test on devices** — Verify responsive behavior on real devices
- **Check accessibility** — Test with keyboard and screen readers
- **Keep it simple** — Avoid unnecessary decorative elements
- **Optimize performance** — Use CSS transforms for animations

### Don'ts

- **Don't use arbitrary values** — No 13px, 17px, or custom colors
- **Don't skip focus states** — Every interactive element needs visible focus
- **Don't rely on color alone** — Always pair with text/icons
- **Don't animate layout properties** — Avoid animating width, height, margin
- **Don't nest too deep** — Keep CSS specificity manageable
- **Don't duplicate styles** — Reuse existing component classes

### Code Style

```css
/* Component structure */
.component {
  /* Layout */
  display: flex;
  align-items: center;

  /* Spacing */
  padding: var(--space-4);
  gap: var(--space-2);

  /* Visual */
  background: white;
  border: 1px solid var(--grey-300);
  border-radius: var(--radius-md);

  /* Typography */
  font-size: var(--text-sm);
  color: var(--grey-900);

  /* Interactive */
  cursor: pointer;
  transition: background 0.2s;
}

.component:hover {
  background: var(--grey-50);
}
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | Kebab-case | `.gallery-card` |
| Modifiers | BEM-inspired | `.btn-primary` |
| States | Simple classes | `.active`, `.show`, `.open` |
| Layout | Semantic | `.header`, `.main`, `.sidebar` |
| Utilities | Purpose-based | `.visually-hidden`, `.text-center` |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Dec 2024 | Initial design guide release |

---

## Contributing

When adding new components or patterns:

1. Follow existing token usage and naming conventions
2. Ensure WCAG AA accessibility compliance
3. Test across all breakpoints
4. Document in this guide
5. Update version history

---

*This guide is a living document. Update it as the design system evolves.*
