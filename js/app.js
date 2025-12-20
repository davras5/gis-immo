// BBL GIS Immobilienportfolio - Main Application Script
// Extracted from index.html for better maintainability

// Mapbox Access Token
        mapboxgl.accessToken = 'pk.eyJ1IjoiZGF2aWRyYXNuZXI1IiwiYSI6ImNtMm5yamVkdjA5MDcycXMyZ2I2MHRhamgifQ.m651j7WIX7MyxNh8KIQ1Gg';
        
        // Status Farben (synchronized with CSS --status-* variables)
        var statusColors = {
            'In Betrieb': '#2e7d32',      // --status-active
            'In Renovation': '#ef6c00',   // --status-renovation
            'In Planung': '#1976d2',      // --status-planning
            'Ausser Betrieb': '#6C757D'   // --status-inactive
        };
        
        // Placeholder images
        var placeholderImages = [
            'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1554435493-93422e8220c8?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop'
        ];
        
        // Variables
        var portfolioData = null;
        var filteredData = null;
        var currentDetailBuilding = null;

        // Entity data stores (loaded from separate JSON files)
        var allAreaMeasurements = [];
        var allDocuments = [];
        var allContacts = [];
        var allContracts = [];
        var allAssets = [];
        var allCosts = [];
        var currentCarouselIndex = 0;
        var miniMap = null;
        var previousView = 'gallery';
        var selectedBuildingId = null;
        var searchMarker = null;

        // View dirty flags - track if view needs re-render after filter change
        var listViewDirty = false;
        var galleryViewDirty = false;

        // ===== UTILITY FUNCTIONS =====

        function escapeHtml(text) {
            if (text == null) return '';
            var div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // ===== TOAST NOTIFICATION SYSTEM =====

        var toastIcons = {
            error: 'error',
            warning: 'warning',
            success: 'check_circle',
            info: 'info'
        };

        function showToast(options) {
            var container = document.getElementById('toast-container');
            if (!container) return;

            var type = options.type || 'info';
            var title = options.title || '';
            var message = options.message || '';
            var duration = options.duration !== undefined ? options.duration : 5000;
            var actions = options.actions || [];

            var toast = document.createElement('div');
            toast.className = 'toast toast-' + type;

            var html = '<div class="toast-icon"><span class="material-symbols-outlined">' + toastIcons[type] + '</span></div>';
            html += '<div class="toast-content">';
            if (title) {
                html += '<div class="toast-title">' + escapeHtml(title) + '</div>';
            }
            if (message) {
                html += '<div class="toast-message">' + escapeHtml(message) + '</div>';
            }
            if (actions.length > 0) {
                html += '<div class="toast-actions">';
                actions.forEach(function(action, index) {
                    html += '<button class="toast-action-btn ' + (action.primary ? 'primary' : 'secondary') + '" data-action="' + index + '">' + escapeHtml(action.label) + '</button>';
                });
                html += '</div>';
            }
            html += '</div>';
            html += '<button class="toast-close" aria-label="Schliessen"><span class="material-symbols-outlined">close</span></button>';

            toast.innerHTML = html;
            container.appendChild(toast);

            // Handle close button
            var closeBtn = toast.querySelector('.toast-close');
            closeBtn.addEventListener('click', function() {
                hideToast(toast);
            });

            // Handle action buttons
            actions.forEach(function(action, index) {
                var btn = toast.querySelector('[data-action="' + index + '"]');
                if (btn && action.onClick) {
                    btn.addEventListener('click', function() {
                        action.onClick();
                        hideToast(toast);
                    });
                }
            });

            // Auto-hide after duration (if not 0)
            if (duration > 0) {
                setTimeout(function() {
                    hideToast(toast);
                }, duration);
            }

            return toast;
        }

        function hideToast(toast) {
            if (!toast || !toast.parentNode) return;
            toast.classList.add('hiding');
            setTimeout(function() {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }

        function showError(title, message, retryCallback) {
            var actions = [];
            if (retryCallback) {
                actions.push({
                    label: 'Erneut versuchen',
                    primary: true,
                    onClick: retryCallback
                });
            }
            return showToast({
                type: 'error',
                title: title,
                message: message,
                duration: retryCallback ? 0 : 8000,
                actions: actions
            });
        }

        function showWarning(title, message) {
            return showToast({
                type: 'warning',
                title: title,
                message: message,
                duration: 6000
            });
        }

        function showSuccess(title, message) {
            return showToast({
                type: 'success',
                title: title,
                message: message,
                duration: 4000
            });
        }

        function showInfo(title, message) {
            return showToast({
                type: 'info',
                title: title,
                message: message,
                duration: 5000
            });
        }

        // ===== LOADING OVERLAY =====

        function showLoadingOverlay(text) {
            var overlay = document.getElementById('loading-overlay');
            if (overlay) {
                var textEl = overlay.querySelector('.loading-text');
                if (textEl && text) {
                    textEl.textContent = text;
                }
                overlay.classList.remove('hidden');
            }
        }

        function hideLoadingOverlay() {
            var overlay = document.getElementById('loading-overlay');
            if (overlay) {
                overlay.classList.add('hidden');
            }
        }

        // ===== ERROR STATE MANAGEMENT =====

        function showErrorState(viewId) {
            var errorState = document.getElementById(viewId + '-error-state');
            if (errorState) {
                errorState.style.display = 'flex';
            }
        }

        function hideErrorState(viewId) {
            var errorState = document.getElementById(viewId + '-error-state');
            if (errorState) {
                errorState.style.display = 'none';
            }
        }

        function hideAllErrorStates() {
            hideErrorState('map');
            hideErrorState('list');
            hideErrorState('gallery');
        }

        // Map retry function (called from error state button)
        function retryMapLoad() {
            hideErrorState('map');
            // If map exists, try to reload the style
            if (window.map) {
                try {
                    window.map.setStyle(window.map.getStyle());
                } catch (e) {
                    // If that fails, reload the page
                    window.location.reload();
                }
            } else {
                window.location.reload();
            }
        }

        // Make loadAllData globally available for retry buttons
        window.loadAllData = null; // Will be set when loadAllData is defined

        // ===== SKELETON LOADING =====

        function showListSkeleton() {
            var listBody = document.getElementById('list-body');
            if (!listBody) return;

            var skeletonHtml = '';
            for (var i = 0; i < 8; i++) {
                skeletonHtml += '<tr class="skeleton-row-item">' +
                    '<td><div class="skeleton skeleton-cell small"></div></td>' +
                    '<td><div class="skeleton skeleton-cell medium"></div></td>' +
                    '<td><div class="skeleton skeleton-cell small"></div></td>' +
                    '<td><div class="skeleton skeleton-cell medium"></div></td>' +
                    '<td><div class="skeleton skeleton-cell medium"></div></td>' +
                    '<td><div class="skeleton skeleton-cell medium"></div></td>' +
                    '<td><div class="skeleton skeleton-cell small"></div></td>' +
                    '<td><div class="skeleton skeleton-cell medium"></div></td>' +
                '</tr>';
            }
            listBody.innerHTML = skeletonHtml;
        }

        function showGallerySkeleton() {
            var galleryGrid = document.getElementById('gallery-grid');
            if (!galleryGrid) return;

            var skeletonHtml = '';
            for (var i = 0; i < 6; i++) {
                skeletonHtml += '<div class="gallery-skeleton-card">' +
                    '<div class="skeleton gallery-skeleton-image"></div>' +
                    '<div class="gallery-skeleton-content">' +
                        '<div class="skeleton skeleton-text medium"></div>' +
                        '<div class="skeleton skeleton-text short"></div>' +
                        '<div style="display: flex; gap: 8px; margin-top: 12px;">' +
                            '<div class="skeleton skeleton-text" style="width: 60px; height: 20px; border-radius: 10px;"></div>' +
                            '<div class="skeleton skeleton-text" style="width: 80px; height: 20px; border-radius: 10px;"></div>' +
                        '</div>' +
                    '</div>' +
                '</div>';
            }
            galleryGrid.innerHTML = skeletonHtml;
        }

        function showAllSkeletons() {
            showListSkeleton();
            showGallerySkeleton();
        }

        // ===== BUTTON LOADING STATE =====

        function setButtonLoading(button, isLoading) {
            if (!button) return;

            if (isLoading) {
                button.classList.add('btn-loading');
                button.setAttribute('aria-busy', 'true');
                // Store original text for restoration
                if (!button.dataset.originalText) {
                    button.dataset.originalText = button.innerHTML;
                }
            } else {
                button.classList.remove('btn-loading');
                button.removeAttribute('aria-busy');
            }
        }

        // ===== FETCH WITH ERROR HANDLING =====

        function fetchWithErrorHandling(url, options) {
            return fetch(url, options)
                .then(function(response) {
                    if (!response.ok) {
                        throw new Error('HTTP ' + response.status + ': ' + response.statusText);
                    }
                    return response.json();
                });
        }

        // ===== FILTER STATE =====
        var activeFilters = {
            status: [],
            eigentum: [],
            teilportfolio: [],
            gebaeudeart: [],
            land: [],
            region: []
        };

        // Filter configuration - maps filter keys to data properties
        var filterConfig = {
            status: { property: 'status', label: 'Status' },
            eigentum: { property: 'typeOfOwnership', label: 'Art Eigentum' },
            teilportfolio: { property: 'extensionData.portfolio', label: 'Teilportfolio' },
            gebaeudeart: { property: 'primaryTypeOfBuilding', label: 'Gebäudeart' },
            land: { property: 'country', label: 'Land' },
            region: { property: 'stateProvincePrefecture', label: 'Region' }
        };

        // ===== FILTER FUNCTIONS =====

        function getFiltersFromURL() {
            var params = new URLSearchParams(window.location.search);
            var filters = {
                status: [],
                eigentum: [],
                teilportfolio: [],
                gebaeudeart: [],
                land: [],
                region: []
            };

            Object.keys(filters).forEach(function(key) {
                var value = params.get('filter_' + key);
                if (value) {
                    filters[key] = value.split(',').map(function(v) {
                        return decodeURIComponent(v);
                    });
                }
            });

            return filters;
        }

        function setFiltersInURL(filters) {
            var url = new URL(window.location);

            // Remove all filter params first
            Object.keys(filters).forEach(function(key) {
                url.searchParams.delete('filter_' + key);
            });

            // Add active filters
            Object.keys(filters).forEach(function(key) {
                if (filters[key].length > 0) {
                    var encoded = filters[key].map(function(v) {
                        return encodeURIComponent(v);
                    }).join(',');
                    url.searchParams.set('filter_' + key, encoded);
                }
            });

            window.history.pushState({}, '', url);
        }

        function getActiveFilterCount() {
            var count = 0;
            Object.keys(activeFilters).forEach(function(key) {
                count += activeFilters[key].length;
            });
            return count;
        }

        // Helper: Get nested property value (e.g., "extensionData.portfolio")
        function getNestedProperty(obj, path) {
            var parts = path.split('.');
            var current = obj;
            for (var i = 0; i < parts.length; i++) {
                if (current == null) return undefined;
                current = current[parts[i]];
            }
            return current;
        }

        function applyFilters() {
            if (!portfolioData) return;

            // Filter the data
            filteredData = {
                type: portfolioData.type,
                name: portfolioData.name,
                features: portfolioData.features.filter(function(feature) {
                    var props = feature.properties;

                    // Check each filter category (AND between categories)
                    for (var filterKey in activeFilters) {
                        var filterValues = activeFilters[filterKey];
                        if (filterValues.length === 0) continue;

                        var propKey = filterConfig[filterKey].property;
                        var propValue = getNestedProperty(props, propKey);

                        // OR within category - at least one must match
                        var matches = filterValues.some(function(filterValue) {
                            return propValue === filterValue;
                        });

                        if (!matches) return false;
                    }

                    return true;
                })
            };

            // Update URL
            setFiltersInURL(activeFilters);

            // Update object count
            updateObjectCount();

            // Update filter button state
            updateFilterButtonState();

            // Re-render current view
            renderCurrentView();

            // Update map layer filter if on map view
            if (currentView === 'map' && window.map && map.getLayer('portfolio-points')) {
                updateMapFilter();
            }
        }

        function updateMapFilter() {
            if (!map || !map.getLayer('portfolio-points')) return;

            // If no active filters, show all buildings
            if (getActiveFilterCount() === 0) {
                map.setFilter('portfolio-points', null);
                if (map.getLayer('portfolio-labels')) {
                    map.setFilter('portfolio-labels', null);
                }
                return;
            }

            var filteredIds = filteredData.features.map(function(f) {
                return f.properties.buildingId;
            });

            // Apply filter to show only filtered buildings
            map.setFilter('portfolio-points', ['in', ['get', 'buildingId'], ['literal', filteredIds]]);

            // Also filter labels layer if it exists
            if (map.getLayer('portfolio-labels')) {
                map.setFilter('portfolio-labels', ['in', ['get', 'buildingId'], ['literal', filteredIds]]);
            }

            // Zoom to fit filtered points
            zoomToFilteredPoints();
        }

        function zoomToFilteredPoints() {
            if (!filteredData || filteredData.features.length === 0) return;

            var features = filteredData.features;

            if (features.length === 1) {
                // Single point - fly to it with a reasonable zoom level
                var coords = features[0].geometry.coordinates;
                map.flyTo({
                    center: coords,
                    zoom: 14,
                    duration: 1000
                });
            } else {
                // Multiple points - fit bounds
                var bounds = new mapboxgl.LngLatBounds();
                features.forEach(function(feature) {
                    bounds.extend(feature.geometry.coordinates);
                });
                map.fitBounds(bounds, {
                    padding: 80,
                    duration: 1000,
                    maxZoom: 16
                });
            }
        }

        function resetFilters() {
            activeFilters = {
                status: [],
                eigentum: [],
                teilportfolio: [],
                gebaeudeart: [],
                land: [],
                region: []
            };

            // Uncheck all checkboxes
            document.querySelectorAll('#filter-pane input[type="checkbox"]').forEach(function(cb) {
                cb.checked = false;
            });

            applyFilters();
        }

        // Global alias for empty state buttons
        window.resetAllFilters = resetFilters;

        function navigateToAllObjects() {
            resetFilters();
            switchView(previousView || 'gallery');
        }

        function navigateWithLandFilter() {
            if (!currentDetailBuilding) return;
            var land = currentDetailBuilding.properties.country;
            if (!land) return;

            // Reset all filters and set only land filter
            resetFilters();
            activeFilters.land = [land];

            // Update checkbox state
            var checkbox = document.querySelector('#filter-pane input[data-filter="land"][data-value="' + land + '"]');
            if (checkbox) checkbox.checked = true;

            applyFilters();
            switchView(previousView || 'gallery');
        }

        function navigateWithRegionFilter() {
            if (!currentDetailBuilding) return;
            var region = currentDetailBuilding.properties.stateProvincePrefecture;
            if (!region) return;

            // Reset all filters and set only region filter
            resetFilters();
            activeFilters.region = [region];

            // Update checkbox state
            var checkbox = document.querySelector('#filter-pane input[data-filter="region"][data-value="' + region + '"]');
            if (checkbox) checkbox.checked = true;

            applyFilters();
            switchView(previousView || 'gallery');
        }

        function updateObjectCount() {
            var count = filteredData ? filteredData.features.length : (portfolioData ? portfolioData.features.length : 0);
            var countEl = document.getElementById('object-count');
            if (countEl) {
                countEl.textContent = count + ' Objekte';
            }
        }

        function updateFilterButtonState() {
            var filterBtn = document.getElementById('filter-btn');
            var count = getActiveFilterCount();

            if (count > 0) {
                // Add active filters highlight
                filterBtn.classList.add('has-active-filters');
                // Add or update count badge
                var badge = filterBtn.querySelector('.filter-count');
                if (!badge) {
                    badge = document.createElement('span');
                    badge.className = 'filter-count';
                    filterBtn.appendChild(badge);
                }
                badge.textContent = count;
            } else {
                // Remove active filters highlight
                filterBtn.classList.remove('has-active-filters');
                // Remove count badge
                var badge = filterBtn.querySelector('.filter-count');
                if (badge) {
                    badge.remove();
                }
            }
        }

        function renderCurrentView() {
            // Mark non-current views as dirty (they'll re-render when switched to)
            if (currentView !== 'list') {
                listViewDirty = true;
            }
            if (currentView !== 'gallery') {
                galleryViewDirty = true;
            }

            // Render current view and clear its dirty flag
            if (currentView === 'list') {
                renderListView();
                listViewDirty = false;
            } else if (currentView === 'gallery') {
                renderGalleryView();
                galleryViewDirty = false;
            }
            // Map view updates via updateMapFilter()
        }

        function toggleFilterPane(open) {
            var pane = document.getElementById('filter-pane');
            var filterBtn = document.getElementById('filter-btn');

            if (open === undefined) {
                open = !pane.classList.contains('open');
            }

            if (open) {
                pane.classList.add('open');
                filterBtn.classList.add('pane-open');
                filterBtn.setAttribute('aria-expanded', 'true');
            } else {
                pane.classList.remove('open');
                filterBtn.classList.remove('pane-open');
                filterBtn.setAttribute('aria-expanded', 'false');
            }

            // Resize map after transition completes
            if (window.map) {
                setTimeout(function() {
                    map.resize();
                }, 350); // Slightly longer than CSS transition (300ms)
            }
        }

        function initFilterOptions() {
            if (!portfolioData) return;

            // Collect unique values for each filter category
            var uniqueValues = {
                status: new Set(),
                eigentum: new Set(),
                teilportfolio: new Set(),
                gebaeudeart: new Set(),
                land: new Set(),
                region: new Set()
            };

            portfolioData.features.forEach(function(feature) {
                var props = feature.properties;
                var ext = props.extensionData || {};
                if (props.status) uniqueValues.status.add(props.status);
                if (props.typeOfOwnership) uniqueValues.eigentum.add(props.typeOfOwnership);
                if (ext.portfolio) uniqueValues.teilportfolio.add(ext.portfolio);
                if (props.primaryTypeOfBuilding) uniqueValues.gebaeudeart.add(props.primaryTypeOfBuilding);
                if (props.country) uniqueValues.land.add(props.country);
                if (props.stateProvincePrefecture) uniqueValues.region.add(props.stateProvincePrefecture);
            });

            // Render options for each filter
            Object.keys(uniqueValues).forEach(function(filterKey) {
                var container = document.getElementById('filter-' + filterKey + '-options');
                if (!container) return;

                var values = Array.from(uniqueValues[filterKey]).sort();
                var html = '';

                values.forEach(function(value) {
                    var id = 'filter-' + filterKey + '-' + value.replace(/[^a-zA-Z0-9]/g, '_');
                    var checked = activeFilters[filterKey].includes(value) ? 'checked' : '';

                    html += '<div class="filter-option">' +
                        '<input type="checkbox" id="' + id + '" data-filter="' + filterKey + '" data-value="' + value + '" ' + checked + '>' +
                        '<label for="' + id + '">' + value + '</label>' +
                        '</div>';
                });

                container.innerHTML = html;

                // Add event listeners to checkboxes
                container.querySelectorAll('input[type="checkbox"]').forEach(function(checkbox) {
                    checkbox.addEventListener('change', function() {
                        var filterKey = this.dataset.filter;
                        var value = this.dataset.value;

                        if (this.checked) {
                            if (!activeFilters[filterKey].includes(value)) {
                                activeFilters[filterKey].push(value);
                            }
                        } else {
                            activeFilters[filterKey] = activeFilters[filterKey].filter(function(v) {
                                return v !== value;
                            });
                        }

                        applyFilters();
                    });
                });
            });
        }

        function initFilterPane() {
            // Toggle filter pane
            document.getElementById('filter-btn').addEventListener('click', function() {
                toggleFilterPane();
            });

            // Close filter pane
            document.getElementById('filter-close-btn').addEventListener('click', function() {
                toggleFilterPane(false);
            });

            // Reset filters (button inside pane)
            document.getElementById('filter-reset-btn').addEventListener('click', function() {
                resetFilters();
            });

            // Filter section accordion toggle
            document.querySelectorAll('.filter-section-header').forEach(function(header) {
                header.addEventListener('click', function() {
                    var section = this.parentElement;
                    section.classList.toggle('open');
                });
            });

            // Close on Escape key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    toggleFilterPane(false);
                }
            });

            // Logo click - navigate to main page
            document.getElementById('logo-area').addEventListener('click', function() {
                navigateToAllObjects();
            });
        }

        // ===== LIST VIEW TOOLBAR FUNCTIONS =====

        // Dropdown Toggle Function
        function toggleDropdown(dropdownId) {
            var menu = document.getElementById(dropdownId);
            var isOpen = menu.classList.contains('show');

            // Close all dropdowns first
            document.querySelectorAll('.dropdown-menu').forEach(function(dropdown) {
                dropdown.classList.remove('show');
            });

            // Toggle the clicked one
            if (!isOpen) {
                menu.classList.add('show');
            }
        }

        // Close dropdowns when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.dropdown-container')) {
                document.querySelectorAll('.dropdown-menu').forEach(function(dropdown) {
                    dropdown.classList.remove('show');
                });
            }
        });

        // Export Handler (Platzhalter/Demo)
        function handleExport(format) {
            var formatNames = {
                'csv': 'CSV (.csv)',
                'excel': 'Excel (.xlsx)',
                'geojson': 'GeoJSON (.geojson)'
            };
            alert('Export als ' + formatNames[format] + '\n\nDiese Funktion ist ein Platzhalter und wird in einer zukünftigen Version implementiert.');

            // Close dropdown
            document.querySelectorAll('.dropdown-menu').forEach(function(dropdown) {
                dropdown.classList.remove('show');
            });
        }

        // ===== SHARE FUNCTIONS =====
        function getShareUrl() {
            var baseUrl = window.location.origin + window.location.pathname;
            var params = new URLSearchParams(window.location.search);

            // Add current map position if map exists
            if (typeof map !== 'undefined' && map) {
                var center = map.getCenter();
                var zoom = map.getZoom();
                params.set('lng', center.lng.toFixed(5));
                params.set('lat', center.lat.toFixed(5));
                params.set('zoom', zoom.toFixed(2));
            }

            // Add selected building if one is selected
            if (selectedBuildingId) {
                params.set('id', selectedBuildingId);
            } else {
                params.delete('id');
            }

            return baseUrl + '?' + params.toString();
        }

        function updateShareLink() {
            var input = document.getElementById('share-link-input');
            if (input) {
                input.value = getShareUrl();
            }
        }

        function shareViaEmail() {
            var url = getShareUrl();
            var subject = encodeURIComponent('BBL Immobilienportfolio - Kartenansicht');
            var body = encodeURIComponent('Schauen Sie sich diese Kartenansicht an:\n\n' + url);
            window.open('mailto:?subject=' + subject + '&body=' + body, '_self');
        }

        function shareViaFacebook() {
            var url = encodeURIComponent(getShareUrl());
            window.open('https://www.facebook.com/sharer/sharer.php?u=' + url, '_blank', 'width=600,height=400');
        }

        function shareViaLinkedIn() {
            var url = encodeURIComponent(getShareUrl());
            window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + url, '_blank', 'width=600,height=400');
        }

        function shareViaX() {
            var url = encodeURIComponent(getShareUrl());
            var text = encodeURIComponent('BBL Immobilienportfolio - Kartenansicht');
            window.open('https://twitter.com/intent/tweet?url=' + url + '&text=' + text, '_blank', 'width=600,height=400');
        }

        function copyShareLink() {
            var input = document.getElementById('share-link-input');
            var button = document.querySelector('.share-copy-btn');

            if (input && navigator.clipboard) {
                navigator.clipboard.writeText(input.value).then(function() {
                    button.textContent = 'Kopiert!';
                    button.classList.add('copied');
                    setTimeout(function() {
                        button.textContent = 'Link kopieren';
                        button.classList.remove('copied');
                    }, 2000);
                });
            } else if (input) {
                // Fallback for older browsers
                input.select();
                document.execCommand('copy');
                button.textContent = 'Kopiert!';
                button.classList.add('copied');
                setTimeout(function() {
                    button.textContent = 'Link kopieren';
                    button.classList.remove('copied');
                }, 2000);
            }
        }

        // Column Toggle Handler
        function handleColumnToggle(checkbox) {
            var columnClass = checkbox.getAttribute('data-column');
            var isVisible = checkbox.checked;

            // Toggle visibility of header and body cells
            document.querySelectorAll('.' + columnClass).forEach(function(cell) {
                cell.style.display = isVisible ? '' : 'none';
            });
        }

        // Toggle All Columns (Alle/Keine)
        function toggleAllColumns(showAll) {
            var checkboxes = document.querySelectorAll('#columns-dropdown-menu input[type="checkbox"]');

            checkboxes.forEach(function(checkbox) {
                checkbox.checked = showAll;
                handleColumnToggle(checkbox);
            });
        }

        // List Search Handler
        function handleListSearch(query) {
            var searchTerm = query.toLowerCase().trim();
            var rows = document.querySelectorAll('#list-body tr');

            rows.forEach(function(row) {
                var text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        }

        // Initialize List View Toolbar Event Listeners
        function initListToolbar() {
            // Dropdown buttons
            var exportBtn = document.getElementById('export-dropdown-btn');
            var columnsBtn = document.getElementById('columns-dropdown-btn');

            if (exportBtn) {
                exportBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    toggleDropdown('export-dropdown-menu');
                });
            }

            if (columnsBtn) {
                columnsBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    toggleDropdown('columns-dropdown-menu');
                });
            }

            // Column checkboxes
            document.querySelectorAll('#columns-dropdown-menu input[type="checkbox"]').forEach(function(checkbox) {
                checkbox.addEventListener('change', function() {
                    handleColumnToggle(this);
                });
            });

            // Search input
            var searchInput = document.getElementById('list-search-input');
            if (searchInput) {
                searchInput.addEventListener('input', function() {
                    handleListSearch(this.value);
                });
            }
        }

        // Daten laden (parallel fetch of all entity files with error handling)
        function loadAllData() {
            showLoadingOverlay('Daten werden geladen...');

            // Show skeleton loaders in list and gallery views
            showAllSkeletons();

            Promise.all([
                fetchWithErrorHandling('data/buildings.geojson'),
                fetchWithErrorHandling('data/area-measurements.json'),
                fetchWithErrorHandling('data/documents.json'),
                fetchWithErrorHandling('data/contacts.json'),
                fetchWithErrorHandling('data/contracts.json'),
                fetchWithErrorHandling('data/assets.json'),
                fetchWithErrorHandling('data/costs.json')
            ])
                .then(function(results) {
                    // Validate and destructure results
                    portfolioData = results[0];

                    // Safely access nested arrays with fallbacks
                    allAreaMeasurements = (results[1] && results[1].areaMeasurements) || [];
                    allDocuments = (results[2] && results[2].documents) || [];
                    allContacts = (results[3] && results[3].contacts) || [];
                    allContracts = (results[4] && results[4].contracts) || [];
                    allAssets = (results[5] && results[5].assets) || [];
                    allCosts = (results[6] && results[6].costs) || [];

                    // Validate portfolio data
                    if (!portfolioData || !portfolioData.features) {
                        throw new Error('Ungültiges Datenformat: Gebäudedaten fehlen');
                    }

                    // Initialize filters from URL
                    activeFilters = getFiltersFromURL();

                    // Initialize filter pane with options
                    initFilterOptions();
                    initFilterPane();

                    // Apply initial filters (this sets filteredData and updates count)
                    applyFilters();

                    renderListView();
                    renderGalleryView();
                    initListToolbar();

                    if (map.loaded()) {
                        addMapLayers();
                    } else {
                        map.on('load', addMapLayers);
                    }

                    // Check if URL has detail view
                    var initialView = getViewFromURL();
                    var buildingId = getBuildingIdFromURL();
                    if (initialView === 'detail' && buildingId) {
                        showDetailView(buildingId);
                    } else if (initialView !== 'map') {
                        switchView(initialView);
                    } else {
                        // Map view is default - show style switcher
                        var styleSwitcher = document.getElementById('style-switcher');
                        if (styleSwitcher) {
                            styleSwitcher.classList.add('visible');
                        }
                    }

                    // Hide loading overlay on success
                    hideLoadingOverlay();
                })
                .catch(function(error) {
                    console.error('Fehler beim Laden der Daten:', error);
                    hideLoadingOverlay();

                    // Show inline error states in list and gallery views
                    showErrorState('list');
                    showErrorState('gallery');

                    // Show user-friendly error with retry option
                    showError(
                        'Fehler beim Laden der Daten',
                        'Die Portfoliodaten konnten nicht geladen werden. Bitte überprüfen Sie Ihre Internetverbindung.',
                        function() {
                            hideAllErrorStates();
                            loadAllData(); // Retry
                        }
                    );
                });
        }

        // Make loadAllData globally available for retry buttons
        window.loadAllData = loadAllData;

        // Start initial data load
        loadAllData();
        
        // ===== VIEW MANAGEMENT =====
        var currentView = 'map';

        // Store scroll positions for each view
        var viewScrollPositions = {
            list: 0,
            gallery: 0,
            detail: 0
        };

        function saveScrollPosition(view) {
            var viewElement = document.getElementById(view + '-view');
            if (viewElement) {
                viewScrollPositions[view] = viewElement.scrollTop;
            }
        }

        function restoreScrollPosition(view) {
            var viewElement = document.getElementById(view + '-view');
            if (viewElement && viewScrollPositions[view] !== undefined) {
                // Use setTimeout to ensure the view is visible before scrolling
                setTimeout(function() {
                    viewElement.scrollTop = viewScrollPositions[view];
                }, 10);
            }
        }

        function getViewFromURL() {
            var params = new URLSearchParams(window.location.search);
            return params.get('view') || 'map';
        }
        
        function getBuildingIdFromURL() {
            var params = new URLSearchParams(window.location.search);
            return params.get('id');
        }
        
        function setViewInURL(view, buildingId) {
            var url = new URL(window.location);
            url.searchParams.set('view', view);
            if (buildingId) {
                url.searchParams.set('id', buildingId);
            } else {
                url.searchParams.delete('id');
            }
            window.history.pushState({}, '', url);
        }
        
        function switchView(view) {
            // Save scroll position of current view before switching
            if (currentView !== 'map') {
                saveScrollPosition(currentView);
            }

            if (view !== 'detail') {
                previousView = currentView !== 'detail' ? currentView : previousView;
            }
            currentView = view;
            setViewInURL(view);

            // Update toggle buttons and ARIA attributes
            document.querySelectorAll('.view-toggle-btn').forEach(function(btn) {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
                if (btn.dataset.view === view) {
                    btn.classList.add('active');
                    btn.setAttribute('aria-selected', 'true');
                }
            });

            // Show/hide views
            document.getElementById('map-view').classList.remove('active');
            document.getElementById('list-view').classList.remove('active');
            document.getElementById('gallery-view').classList.remove('active');
            document.getElementById('detail-view').classList.remove('active');

            var viewElement = document.getElementById(view + '-view');
            if (viewElement) {
                viewElement.classList.add('active');
            }

            // Show/hide style switcher based on view (only visible in map view)
            var styleSwitcher = document.getElementById('style-switcher');
            if (styleSwitcher) {
                styleSwitcher.classList.toggle('visible', view === 'map');
            }

            // Resize map if switching to map view
            if (view === 'map' && window.map) {
                setTimeout(function() {
                    map.resize();
                    // Apply filters to map when switching to map view
                    if (map.getLayer('portfolio-points')) {
                        updateMapFilter();
                    }
                }, 100);
            }

            // Re-render list view if dirty (filters changed while on another view)
            if (view === 'list' && listViewDirty) {
                renderListView();
                listViewDirty = false;
            }

            // Re-render gallery view if dirty (filters changed while on another view)
            if (view === 'gallery' && galleryViewDirty) {
                renderGalleryView();
                galleryViewDirty = false;
            }

            // Restore scroll position of new view
            if (view !== 'map') {
                restoreScrollPosition(view);
            }
        }

        function showDetailView(buildingId) {
            if (!portfolioData) return;
            
            // Find building by ID
            var building = portfolioData.features.find(function(f) {
                return f.properties.buildingId === buildingId;
            });
            
            if (!building) {
                console.error('Building not found:', buildingId);
                return;
            }
            
            currentDetailBuilding = building;
            
            // Store previous view if not already in detail
            if (currentView !== 'detail') {
                previousView = currentView;
            }
            
            // Update URL
            setViewInURL('detail', buildingId);
            currentView = 'detail';
            
            // Hide all views, show detail
            document.getElementById('map-view').classList.remove('active');
            document.getElementById('list-view').classList.remove('active');
            document.getElementById('gallery-view').classList.remove('active');
            document.getElementById('detail-view').classList.add('active');

            // Hide style switcher in detail view
            var styleSwitcher = document.getElementById('style-switcher');
            if (styleSwitcher) {
                styleSwitcher.classList.remove('visible');
            }

            // Clear active state from view toggle buttons
            document.querySelectorAll('.view-toggle-btn').forEach(function(btn) {
                btn.classList.remove('active');
            });
            
            // Populate detail view
            populateDetailView(building);
        }
        
        function populateDetailView(building) {
            var props = building.properties;
            var coords = building.geometry.coordinates;
            
            // Helper to access extensionData safely
            var ext = props.extensionData || {};

            // Breadcrumb
            document.getElementById('breadcrumb-name').textContent = props.name;
            document.getElementById('breadcrumb-country').textContent = props.country || '—';
            document.getElementById('breadcrumb-region').textContent = props.stateProvincePrefecture || '—';

            // Objekt Stammdaten
            document.getElementById('detail-name').textContent = props.name;
            document.getElementById('detail-id').textContent = props.buildingId;
            document.getElementById('detail-teilportfolio').textContent = ext.portfolio || '—';
            document.getElementById('detail-baujahr').textContent = extractYear(props.constructionYear) || '—';

            // Address
            document.getElementById('detail-country').textContent = props.country;
            document.getElementById('detail-region').textContent = props.stateProvincePrefecture || '—';
            document.getElementById('detail-city').textContent = props.city;

            // Read address parts directly from properties, parse street from address
            var addressParts = parseAddress(props.streetName);
            document.getElementById('detail-plz').textContent = props.postalCode || '—';
            document.getElementById('detail-street').textContent = addressParts.street || '—';
            document.getElementById('detail-housenumber').textContent = props.houseNumber || '—';

            // Gebäudedaten
            document.getElementById('detail-sanierung').textContent = extractYear(props.yearOfLastRefurbishment) || '—';
            document.getElementById('detail-ladestationen').textContent = props.electricVehicleChargingStations !== undefined ? props.electricVehicleChargingStations : '—';
            document.getElementById('detail-denkmalschutz').textContent = formatBoolean(props.monumentProtection);
            document.getElementById('detail-parkplaetze').textContent = props.parkingSpaces !== undefined ? props.parkingSpaces : '—';
            document.getElementById('detail-geschosse').textContent = ext.numberOfFloors !== undefined ? ext.numberOfFloors : '—';
            document.getElementById('detail-baubewilligung').textContent = formatDate(props.buildingPermitDate) || '—';

            // Energie
            document.getElementById('detail-energieklasse').textContent = props.energyEfficiencyClass || '—';
            document.getElementById('detail-waermeerzeuger').textContent = ext.heatingGenerator || '—';
            document.getElementById('detail-waermequelle').textContent = ext.heatingSource || '—';
            document.getElementById('detail-warmwasser').textContent = ext.hotWater || '—';

            // Grundstück
            document.getElementById('detail-grundstueck-name').textContent = ext.plotName || '—';
            document.getElementById('detail-grundstueck-id').textContent = ext.plotId || '—';
            document.getElementById('detail-egid').textContent = ext.egid || '—';
            document.getElementById('detail-egrid').textContent = ext.egrid || '—';
            document.getElementById('detail-gueltig-von').textContent = formatDate(props.validFrom) || '—';
            document.getElementById('detail-gueltig-bis').textContent = formatDate(props.validUntil) || 'Keine Angabe';

            // Klassifizierung
            document.getElementById('detail-objektart1').textContent = props.primaryTypeOfBuilding || '—';
            document.getElementById('detail-teilportfolio-gruppe').textContent = ext.portfolioGroup || '—';
            document.getElementById('detail-objektart2').textContent = props.secondaryTypeOfBuilding || '—';
            document.getElementById('detail-eigentum').textContent = props.typeOfOwnership || '—';

            // Load measurements for this building
            loadMeasurementsForBuilding(building);

            // Load documents for this building
            loadDocumentsForBuilding(building);

            // Load kontakte for this building
            loadKontakteForBuilding(building);

            // Load kosten for this building
            loadKostenForBuilding(building);

            // Load vertraege for this building
            loadVertraegeForBuilding(building);

            // Load ausstattung for this building
            loadAusstattungForBuilding(building);

            // Initialize carousel
            initCarousel();

            // Initialize mini map
            initMiniMap(coords);
        }
        
        // Helper: Extract year from ISO 8601 date string (e.g., "1902-01-01T00:00:00Z" → "1902")
        function extractYear(isoDate) {
            if (!isoDate) return null;
            var match = isoDate.match(/^(\d{4})/);
            return match ? match[1] : null;
        }

        // Helper: Format ISO 8601 date to DD.MM.YYYY
        function formatDate(isoDate) {
            if (!isoDate) return null;
            var match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
            return match ? match[3] + '.' + match[2] + '.' + match[1] : null;
        }

        // Helper: Format boolean for display (true → "Ja", false → "Nein")
        function formatBoolean(value) {
            if (value === true) return 'Ja';
            if (value === false) return 'Nein';
            return '—';
        }

        function parseAddress(address) {
            // Parse address into street, house number, and PLZ
            // Expected formats: "Strasse Nr, PLZ Stadt" or "Nr Strasse, Stadt, State PLZ"
            var street = '';
            var number = '';
            var plz = '';

            if (!address) {
                return { street: street, number: number, plz: plz };
            }

            // Split by comma to separate street+number from PLZ+city
            var commaParts = address.split(',');
            var streetPart = commaParts[0].trim();

            // Extract PLZ from the part after the comma
            if (commaParts.length > 1) {
                var restPart = commaParts.slice(1).join(',').trim();
                // Look for PLZ patterns: Swiss (4 digits), German (5 digits), US (5 digits), etc.
                var plzMatch = restPart.match(/\b(\d{4,5})\b/);
                if (plzMatch) {
                    plz = plzMatch[1];
                }
            }

            // Parse street and house number from the first part
            // Check for number at the end (European style: "Strasse 123")
            var endNumberMatch = streetPart.match(/^(.+?)\s+(\d+[A-Za-z]?)$/);
            if (endNumberMatch) {
                street = endNumberMatch[1];
                number = endNumberMatch[2];
            } else {
                // Check for number at the beginning (US/UK style: "123 Street")
                var startNumberMatch = streetPart.match(/^(\d+[A-Za-z]?)\s+(.+)$/);
                if (startNumberMatch) {
                    number = startNumberMatch[1];
                    street = startNumberMatch[2];
                } else {
                    // No clear number found, use entire part as street
                    street = streetPart;
                }
            }

            return { street: street, number: number, plz: plz };
        }
        
        function initCarousel() {
            currentCarouselIndex = 0;
            updateCarouselImage();
            
            // Create dots
            var dotsContainer = document.getElementById('carousel-dots');
            dotsContainer.innerHTML = '';
            placeholderImages.forEach(function(_, index) {
                var dot = document.createElement('div');
                dot.className = 'carousel-dot' + (index === 0 ? ' active' : '');
                dot.onclick = function() {
                    currentCarouselIndex = index;
                    updateCarouselImage();
                };
                dotsContainer.appendChild(dot);
            });
        }
        
        function updateCarouselImage() {
            var imageEl = document.getElementById('carousel-image');
            imageEl.style.backgroundImage = 'url(' + placeholderImages[currentCarouselIndex] + ')';
            
            // Update dots
            document.querySelectorAll('.carousel-dot').forEach(function(dot, index) {
                dot.classList.toggle('active', index === currentCarouselIndex);
            });
        }
        
        function carouselPrev() {
            currentCarouselIndex = (currentCarouselIndex - 1 + placeholderImages.length) % placeholderImages.length;
            updateCarouselImage();
        }
        
        function carouselNext() {
            currentCarouselIndex = (currentCarouselIndex + 1) % placeholderImages.length;
            updateCarouselImage();
        }
        
        function initMiniMap(coords) {
            // Destroy existing map if any
            if (miniMap) {
                miniMap.remove();
                miniMap = null;
            }
            
            // Create new mini map
            miniMap = new mapboxgl.Map({
                container: 'mini-map',
                style: 'mapbox://styles/mapbox/light-v11',
                center: coords,
                zoom: 17,
                pitch: 50,
                bearing: -17
            });
            
            // Add 3D buildings layer
            miniMap.on('load', function() {
                // Add 3D buildings
                var layers = miniMap.getStyle().layers;
                var labelLayerId;
                for (var i = 0; i < layers.length; i++) {
                    if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
                        labelLayerId = layers[i].id;
                        break;
                    }
                }
                
                miniMap.addLayer({
                    'id': '3d-buildings',
                    'source': 'composite',
                    'source-layer': 'building',
                    'filter': ['==', 'extrude', 'true'],
                    'type': 'fill-extrusion',
                    'minzoom': 15,
                    'paint': {
                        'fill-extrusion-color': '#A8B0B7',
                        'fill-extrusion-height': [
                            'interpolate', ['linear'], ['zoom'],
                            15, 0,
                            15.05, ['get', 'height']
                        ],
                        'fill-extrusion-base': [
                            'interpolate', ['linear'], ['zoom'],
                            15, 0,
                            15.05, ['get', 'min_height']
                        ],
                        'fill-extrusion-opacity': 0.6
                    }
                }, labelLayerId);
                
                // Add marker
                new mapboxgl.Marker({ color: '#c00' })
                    .setLngLat(coords)
                    .addTo(miniMap);
            });
            
            // Add navigation controls
            miniMap.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
        }
        
        // View toggle click handlers
        document.querySelectorAll('.view-toggle-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                switchView(this.dataset.view);
            });
        });
        
        // Back button handler
        document.getElementById('btn-back').addEventListener('click', function() {
            switchView(previousView || 'gallery');
        });
        
        // Handle browser back/forward
        window.addEventListener('popstate', function() {
            var view = getViewFromURL();
            var buildingId = getBuildingIdFromURL();
            if (view === 'detail' && buildingId) {
                showDetailView(buildingId);
            } else {
                switchView(view);
            }
        });
        
        // ===== RENDER LIST VIEW =====
        function renderListView() {
            if (!portfolioData) return;

            var dataToRender = filteredData || portfolioData;
            var listBody = document.getElementById('list-body');
            var tableWrapper = document.querySelector('#list-view .list-table-wrapper');
            var html = '';

            // Handle empty state
            if (dataToRender.features.length === 0) {
                listBody.innerHTML = '';
                // Check if empty state already exists
                var existingEmpty = document.querySelector('#list-view .empty-state');
                if (!existingEmpty) {
                    var emptyHtml = '<div class="empty-state">' +
                        '<span class="material-symbols-outlined empty-state-icon" aria-hidden="true">search_off</span>' +
                        '<h3 class="empty-state-title">Keine Objekte gefunden</h3>' +
                        '<p class="empty-state-message">Die aktuellen Filter ergeben keine Treffer. Passen Sie die Filterkriterien an oder setzen Sie die Filter zurück.</p>' +
                        '<button class="empty-state-action" onclick="resetAllFilters()">' +
                            '<span class="material-symbols-outlined" aria-hidden="true">filter_alt_off</span>' +
                            'Filter zurücksetzen' +
                        '</button>' +
                    '</div>';
                    tableWrapper.insertAdjacentHTML('afterend', emptyHtml);
                }
                return;
            } else {
                // Remove empty state if it exists
                var existingEmpty = document.querySelector('#list-view .empty-state');
                if (existingEmpty) existingEmpty.remove();
            }

            dataToRender.features.forEach(function(feature) {
                var props = feature.properties;
                var ext = props.extensionData || {};
                var statusClass = props.status === 'In Betrieb' ? 'in-betrieb' :
                                  props.status === 'In Renovation' ? 'in-renovation' :
                                  props.status === 'In Planung' ? 'in-planung' : 'ausser-betrieb';
                var flaeche = Number(ext.netFloorArea || 0).toLocaleString('de-CH');

                html += '<tr data-id="' + props.buildingId + '" tabindex="0" role="row">' +
                    '<td class="col-id">' + props.buildingId + '</td>' +
                    '<td class="col-name">' + props.name + '</td>' +
                    '<td class="col-land">' + props.country + '</td>' +
                    '<td class="col-ort">' + props.city + '</td>' +
                    '<td class="col-adresse">' + props.streetName + '</td>' +
                    '<td class="col-portfolio">' + (ext.portfolio || '—') + '</td>' +
                    '<td class="col-flaeche">' + flaeche + ' m²</td>' +
                    '<td class="col-status"><span class="status-badge ' + statusClass + '"><span class="status-icon" aria-hidden="true"></span>' + props.status + '</span></td>' +
                '</tr>';
            });

            listBody.innerHTML = html;

            // Add click and keyboard handlers
            document.querySelectorAll('#list-body tr').forEach(function(row) {
                row.addEventListener('click', function() {
                    var buildingId = this.dataset.id;
                    showDetailView(buildingId);
                });
                row.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        var buildingId = this.dataset.id;
                        showDetailView(buildingId);
                    }
                });
            });
        }
        
        // ===== RENDER GALLERY VIEW =====
        function renderGalleryView() {
            if (!portfolioData) return;

            var dataToRender = filteredData || portfolioData;
            var galleryGrid = document.getElementById('gallery-grid');
            var html = '';

            // Handle empty state
            if (dataToRender.features.length === 0) {
                galleryGrid.innerHTML = '<div class="empty-state">' +
                    '<span class="material-symbols-outlined empty-state-icon" aria-hidden="true">search_off</span>' +
                    '<h3 class="empty-state-title">Keine Objekte gefunden</h3>' +
                    '<p class="empty-state-message">Die aktuellen Filter ergeben keine Treffer. Passen Sie die Filterkriterien an oder setzen Sie die Filter zurück.</p>' +
                    '<button class="empty-state-action" onclick="resetAllFilters()">' +
                        '<span class="material-symbols-outlined" aria-hidden="true">filter_alt_off</span>' +
                        'Filter zurücksetzen' +
                    '</button>' +
                '</div>';
                return;
            }

            dataToRender.features.forEach(function(feature, index) {
                var props = feature.properties;
                var ext = props.extensionData || {};
                var flaeche = Number(ext.netFloorArea || 0).toLocaleString('de-CH');
                var baujahr = extractYear(props.constructionYear) || '—';
                // Use placeholder images
                var imageUrl = placeholderImages[index % placeholderImages.length];

                html += '<div class="gallery-card" data-id="' + props.buildingId + '" tabindex="0" role="article" aria-label="' + props.name + '">' +
                    '<div class="gallery-image" style="background-image: url(' + imageUrl + ')" role="img" aria-label="Bild von ' + props.name + '">' +
                        '<div class="gallery-image-label">' + props.country + '</div>' +
                    '</div>' +
                    '<div class="gallery-content">' +
                        '<div class="gallery-title">' + props.name + '</div>' +
                        '<div class="gallery-subtitle">' + props.streetName + '</div>' +
                        '<div class="gallery-meta">' +
                            '<span class="gallery-tag">' + (ext.portfolio || '—') + '</span>' +
                            '<span class="gallery-tag">' + flaeche + ' m²</span>' +
                        '</div>' +
                        '<div class="gallery-footer">' +
                            '<span>Baujahr ' + baujahr + '</span>' +
                            '<a href="#" class="gallery-link" onclick="event.stopPropagation();" aria-label="Details zu ' + props.name + ' anzeigen">Details <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span></a>' +
                        '</div>' +
                    '</div>' +
                '</div>';
            });

            galleryGrid.innerHTML = html;

            // Add click and keyboard handlers
            document.querySelectorAll('.gallery-card').forEach(function(card) {
                card.addEventListener('click', function() {
                    var buildingId = this.dataset.id;
                    showDetailView(buildingId);
                });
                card.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        var buildingId = this.dataset.id;
                        showDetailView(buildingId);
                    }
                });
            });
        }
        
        // ===== INITIALIZE MAP =====
        
        // 1. Parse URL parameters for map state
        var urlParams = new URLSearchParams(window.location.search);
        var initialLat = parseFloat(urlParams.get('lat'));
        var initialLng = parseFloat(urlParams.get('lng'));
        var initialZoom = parseFloat(urlParams.get('zoom'));

        // Defaults (Switzerland)
        var startCenter = [8.2275, 46.8182];
        var startZoom = 2;

        // Override defaults if URL params exist
        if (!isNaN(initialLat) && !isNaN(initialLng) && !isNaN(initialZoom)) {
            startCenter = [initialLng, initialLat];
            startZoom = initialZoom;
        }

        var map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/light-v11',
            center: startCenter,
            zoom: startZoom
        });

        // Make map globally available for error handling
        window.map = map;

        // Handle map errors
        map.on('error', function(e) {
            console.error('Map error:', e.error);
            // Show map error state for critical errors
            if (e.error && (e.error.status === 401 || e.error.status === 403 || e.error.message.includes('style'))) {
                showErrorState('map');
            }
        });

        map.addControl(new mapboxgl.NavigationControl(), 'top-right');
        map.addControl(new mapboxgl.ScaleControl({ maxWidth: 200 }), 'bottom-left');

        // Home button control
        var HomeControl = function() {};
        HomeControl.prototype.onAdd = function(map) {
            this._map = map;
            this._container = document.createElement('div');
            this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';

            var button = document.createElement('button');
            button.className = 'map-home-btn';
            button.type = 'button';
            button.title = 'Zur Startansicht';
            button.innerHTML = '<span class="material-symbols-outlined">home</span>';
            button.onclick = function() {
                map.flyTo({
                    center: [8.2275, 46.8182],
                    zoom: 2,
                    duration: 1000
                });
            };

            this._container.appendChild(button);
            return this._container;
        };
        HomeControl.prototype.onRemove = function() {
            this._container.parentNode.removeChild(this._container);
            this._map = undefined;
        };

        map.addControl(new HomeControl(), 'top-right');

        // 2. Update URL on map move/zoom
        map.on('moveend', function() {
            if (currentView !== 'map') return; // Don't update if not in map view
            
            var center = map.getCenter();
            var zoom = map.getZoom();
            
            var url = new URL(window.location);
            url.searchParams.set('lng', center.lng.toFixed(5));
            url.searchParams.set('lat', center.lat.toFixed(5));
            url.searchParams.set('zoom', zoom.toFixed(2));
            
            // Use replaceState to update URL without adding to history stack
            window.history.replaceState({}, '', url);
        });

        map.on('mousemove', function(e) {
            var lng = e.lngLat.lng.toFixed(5);
            var lat = e.lngLat.lat.toFixed(5);
            document.getElementById('coordinates').textContent = 'WGS 84 | Koordinaten: ' + lng + ', ' + lat;
        });
        
        function addMapLayers() {
            if (!portfolioData) return;
            
            map.addSource('portfolio', {
                type: 'geojson',
                data: portfolioData
            });
            
            // Main points layer
            map.addLayer({
                id: 'portfolio-points',
                type: 'circle',
                source: 'portfolio',
                paint: {
                    'circle-radius': 10,
                    'circle-color': [
                        'match',
                        ['get', 'status'],
                        'In Betrieb', statusColors['In Betrieb'],
                        'In Renovation', statusColors['In Renovation'],
                        'In Planung', statusColors['In Planung'],
                        'Ausser Betrieb', statusColors['Ausser Betrieb'],
                        '#6C757D'  // fallback
                    ],
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#ffffff'
                }
            });

            // Selected point highlight layer - outer ring
            map.addLayer({
                id: 'portfolio-selected',
                type: 'circle',
                source: 'portfolio',
                filter: ['==', ['get', 'buildingId'], ''],
                paint: {
                    'circle-radius': 18,
                    'circle-color': 'transparent',
                    'circle-stroke-width': 3,
                    'circle-stroke-color': '#c00',  // primary-red
                    'circle-stroke-opacity': 0.9
                }
            });

            // Selected point pulse animation layer
            map.addLayer({
                id: 'portfolio-selected-pulse',
                type: 'circle',
                source: 'portfolio',
                filter: ['==', ['get', 'buildingId'], ''],
                paint: {
                    'circle-radius': 24,
                    'circle-color': 'transparent',
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#c00',
                    'circle-stroke-opacity': 0.4
                }
            });

            // Animate the pulse layer
            var pulseRadius = 24;
            var pulseOpacity = 0.4;
            var pulseDirection = 1;

            function animatePulse() {
                pulseRadius += 0.3 * pulseDirection;
                pulseOpacity -= 0.01 * pulseDirection;

                if (pulseRadius >= 32) {
                    pulseDirection = -1;
                } else if (pulseRadius <= 24) {
                    pulseDirection = 1;
                }

                if (map.getLayer('portfolio-selected-pulse')) {
                    map.setPaintProperty('portfolio-selected-pulse', 'circle-radius', pulseRadius);
                    map.setPaintProperty('portfolio-selected-pulse', 'circle-stroke-opacity', Math.max(0.1, pulseOpacity));
                }

                requestAnimationFrame(animatePulse);
            }

            animatePulse();
            
            map.on('mouseenter', 'portfolio-points', function() {
                map.getCanvas().style.cursor = 'pointer';
            });
            
            map.on('mouseleave', 'portfolio-points', function() {
                map.getCanvas().style.cursor = '';
            });
            
            // CLICK HANDLER
            map.on('click', 'portfolio-points', function(e) {
                var props = e.features[0].properties;
                // UPDATED: Pass 'false' so map does NOT zoom on click
                selectBuilding(props.buildingId, false);
            });
            
            // Click on map (not on a point) to deselect
            map.on('click', function(e) {
                var features = map.queryRenderedFeatures(e.point, { layers: ['portfolio-points'] });
                if (features.length === 0) {
                    selectedBuildingId = null;
                    updateSelectedBuilding();
                    updateUrlWithSelection();
                    document.getElementById('info-panel').classList.remove('show');
                }
            });

            // Apply initial filters to map if any
            if (filteredData && getActiveFilterCount() > 0) {
                updateMapFilter();
            }

            // Select building from URL parameter if present
            var urlBuildingId = urlParams.get('id');
            if (urlBuildingId) {
                var building = portfolioData.features.find(function(f) {
                    return f.properties.buildingId === urlBuildingId;
                });
                if (building) {
                    selectBuilding(urlBuildingId, true);
                }
            }
        }

        // Reusable function to select a building
        // UPDATED: Added flyToBuilding parameter (default false)
        function selectBuilding(buildingId, flyToBuilding = false) {
            // Find feature props
            var building = portfolioData.features.find(function(f) { return f.properties.buildingId === buildingId; });
            if (!building) return;
            
            var props = building.properties;
            var ext = props.extensionData || {};
            var flaeche = Number(ext.netFloorArea || 0).toLocaleString('de-CH');
            var baujahr = extractYear(props.constructionYear) || '—';
            var statusColor = statusColors[props.status] || '#8B949C';

            // Update selected ID
            selectedBuildingId = buildingId;
            updateSelectedBuilding();
            updateUrlWithSelection();

            // Find building index for placeholder image
            var buildingIndex = portfolioData.features.findIndex(function(f) {
                return f.properties.buildingId === buildingId;
            });
            var imageUrl = placeholderImages[buildingIndex % placeholderImages.length];

            // Set preview image
            document.getElementById('info-preview-image').style.backgroundImage = 'url(' + imageUrl + ')';

            var infoHtml =
                '<div class="info-section-title">' + (ext.portfolio || '—') + '</div>' +
                '<div class="info-location">' + props.city + ', ' + props.country + '</div>' +
                '<div class="info-row"><span class="info-label">Objekt-ID</span><span class="info-value">' + props.buildingId + '</span></div>' +
                '<div class="info-row"><span class="info-label">Name</span><span class="info-value">' + props.name + '</span></div>' +
                '<div class="info-row"><span class="info-label">Adresse</span><span class="info-value">' + props.streetName + '</span></div>' +
                '<div class="info-row"><span class="info-label">Fläche NGF</span><span class="info-value">' + flaeche + ' m²</span></div>' +
                '<div class="info-row"><span class="info-label">Baujahr</span><span class="info-value">' + baujahr + '</span></div>' +
                '<div class="info-row"><span class="info-label">Verantwortlich</span><span class="info-value">' + (ext.responsiblePerson || '—') + '</span></div>' +
                '<div class="info-row"><span class="info-label">Status</span><span class="info-value" style="color:' + statusColor + '; font-weight: 600;">' + props.status + '</span></div>' +
                '<div class="info-footer">' +
                    '<button class="info-detail-link" onclick="showDetailView(\'' + props.buildingId + '\')">' +
                        '<span class="material-symbols-outlined">open_in_new</span>' +
                        'Details anzeigen' +
                    '</button>' +
                '</div>';
            
            document.getElementById('info-body').innerHTML = infoHtml;
            document.getElementById('info-panel').classList.add('show');
            
            // UPDATED: Only fly to building if explicitly requested (e.g. from Search)
            if (map && flyToBuilding) {
                map.flyTo({
                    center: building.geometry.coordinates,
                    zoom: 16
                });
            }
        }
        
        function updateSelectedBuilding() {
            if (map && map.getLayer('portfolio-selected')) {
                map.setFilter('portfolio-selected', ['==', ['get', 'buildingId'], selectedBuildingId || '']);
            }
            if (map && map.getLayer('portfolio-selected-pulse')) {
                map.setFilter('portfolio-selected-pulse', ['==', ['get', 'buildingId'], selectedBuildingId || '']);
            }
        }

        function updateUrlWithSelection() {
            var url = new URL(window.location);
            if (selectedBuildingId) {
                url.searchParams.set('id', selectedBuildingId);
            } else {
                url.searchParams.delete('id');
            }
            window.history.replaceState({}, '', url);
        }

        // ===== SEARCH FUNCTIONALITY =====
        var searchInput = document.getElementById('search-input');
        var searchResults = document.getElementById('search-results');
        var searchSpinner = document.getElementById('search-spinner');
        var searchClearBtn = document.getElementById('search-clear-btn');
        var searchDebounceTimer;
        
        // Listen for input
        searchInput.addEventListener('input', function(e) {
            clearTimeout(searchDebounceTimer);
            var val = e.target.value.trim();
            
            // Toggle clear button visibility
            if (val.length > 0) {
                searchClearBtn.classList.add('visible');
            } else {
                searchClearBtn.classList.remove('visible');
            }
            
            if (val.length < 2) {
                searchResults.classList.remove('active');
                searchSpinner.style.display = 'none';
                return;
            }
            
            searchSpinner.style.display = 'block';
            searchDebounceTimer = setTimeout(function() {
                performSearch(val);
            }, 300);
        });

        // Clear Button Click Listener
        searchClearBtn.addEventListener('click', function() {
            searchInput.value = '';
            searchClearBtn.classList.remove('visible');
            searchResults.classList.remove('active');
            searchInput.focus();
            
            // Remove the search marker if it exists
            if (searchMarker) {
                searchMarker.remove();
                searchMarker = null;
            }
        });
        
        // Close search on click outside
        document.addEventListener('click', function(e) {
            if (!document.getElementById('search-wrapper').contains(e.target)) {
                searchResults.classList.remove('active');
            }
        });

        // Close search on Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                searchResults.classList.remove('active');
            }
        });
        
        function performSearch(term) {
            var promises = [];
            
            // 1. Local Search
            promises.push(new Promise(function(resolve) {
                var matches = [];
                if (portfolioData) {
                    var lowerTerm = term.toLowerCase();
                    matches = portfolioData.features.filter(function(f) {
                        var p = f.properties;
                        return (p.name && p.name.toLowerCase().includes(lowerTerm)) ||
                               (p.streetName && p.streetName.toLowerCase().includes(lowerTerm)) ||
                               (p.city && p.city.toLowerCase().includes(lowerTerm));
                    });
                }
                resolve({ type: 'local', data: matches });
            }));
            
            // 2. Swisstopo Locations
            promises.push(fetch('https://api3.geo.admin.ch/rest/services/ech/SearchServer?type=locations&limit=5&sr=4326&searchText=' + encodeURIComponent(term))
                .then(r => r.json())
                .then(data => ({ type: 'locations', data: data.results }))
                .catch(e => ({ type: 'locations', data: [] })));
                
            // 3. Swisstopo Layers
            promises.push(fetch('https://api3.geo.admin.ch/rest/services/ech/SearchServer?type=layers&limit=5&lang=de&searchText=' + encodeURIComponent(term))
                .then(r => r.json())
                .then(data => ({ type: 'layers', data: data.results }))
                .catch(e => ({ type: 'layers', data: [] })));
                
            Promise.all(promises).then(function(results) {
                renderSearchResults(results);
                searchSpinner.style.display = 'none';
            });
        }
        
        function renderSearchResults(results) {
            var localResults = results.find(function(r) { return r.type === 'local'; }).data;
            var locResults = results.find(function(r) { return r.type === 'locations'; }).data;
            var layerResults = results.find(function(r) { return r.type === 'layers'; }).data;
            
            var html = '';
            
            // Section: Objekte (Local)
            if (localResults.length > 0) {
                html += '<div class="search-section-header">Objekte</div>';
                localResults.forEach(function(f) {
                    html += '<div class="search-item" onclick="handleSearchClick(\'local\', \'' + f.properties.buildingId + '\')">' +
                            '<div class="search-item-title">' + f.properties.name + '</div>' +
                            '<div class="search-item-subtitle">' + f.properties.streetName + ', ' + f.properties.city + '</div>' +
                            '</div>';
                });
            }
            
            // Section: Orte (API)
            if (locResults.length > 0) {
                html += '<div class="search-section-header">Orte</div>';
                locResults.forEach(function(r, index) {
                    var lat = r.attrs.lat;
                    var lon = r.attrs.lon;
                    var zoom = r.attrs.zoomlevel || 14;
                    html += '<div class="search-item" onclick="handleSearchClick(\'location\', null, ' + lat + ', ' + lon + ', ' + zoom + ')">' +
                            '<div class="search-item-title">' + r.attrs.label + '</div>' +
                            '</div>';
                });
            }
            
            // Section: Karten (API)
            if (layerResults.length > 0) {
                html += '<div class="search-section-header">Karten hinzufügen...</div>';
                layerResults.forEach(function(r) {
                    html += '<div class="search-item" onclick="handleSearchClick(\'layer\', \'' + r.attrs.label.replace(/'/g, "\\'") + '\')">' +
                            '<div class="search-item-title">' + r.attrs.label + '</div>' +
                            '</div>';
                });
            }
            
            if (html === '') {
                html = '<div class="search-item" style="cursor:default;"><div class="search-item-subtitle">Keine Resultate gefunden</div></div>';
            }
            
            searchResults.innerHTML = html;
            searchResults.classList.add('active');
        }
        
        // Make this function global so onclick in HTML string works
        window.handleSearchClick = function(type, id, lat, lon, zoom) {
            searchResults.classList.remove('active');
            
            if (currentView !== 'map') {
                switchView('map');
            }
            
            if (type === 'local') {
                // Pass true to fly to the building when searching
                selectBuilding(id, true);
                
                // Remove generic search marker if we select a specific building
                if (searchMarker) {
                    searchMarker.remove();
                    searchMarker = null;
                }

                var b = portfolioData.features.find(f => f.properties.buildingId === id);
                if(b) {
                    searchInput.value = b.properties.name;
                    searchClearBtn.classList.add('visible');
                }

            } else if (type === 'location') {
                // 1. Remove existing marker
                if (searchMarker) {
                    searchMarker.remove();
                }

                // 2. Fly to location
                map.flyTo({
                    center: [lon, lat],
                    zoom: zoom
                });

                // 3. Add Red Marker
                searchMarker = new mapboxgl.Marker({ color: '#c00' })
                    .setLngLat([lon, lat])
                    .addTo(map);

                // Clear selected building info panel
                selectedBuildingId = null;
                updateSelectedBuilding();
                updateUrlWithSelection();
                document.getElementById('info-panel').classList.remove('show');

                searchClearBtn.classList.add('visible');

            } else if (type === 'layer') {
                alert('Layer "' + id + '" wird bald verfügbar sein.');
            }
        };
        
        // ===== ACCORDION =====
        var geokatalogAccordion = document.getElementById('geokatalog-accordion');

        document.querySelectorAll('.accordion-header').forEach(function(header) {
            header.addEventListener('click', function() {
                var content = this.nextElementSibling;
                var isActive = this.classList.contains('active');
                var isGeokatalog = this.parentElement.id === 'geokatalog-accordion';

                document.querySelectorAll('.accordion-header').forEach(function(h) { h.classList.remove('active'); });
                document.querySelectorAll('.accordion-content').forEach(function(c) { c.classList.remove('show'); });
                geokatalogAccordion.classList.remove('expanded');

                if (!isActive) {
                    this.classList.add('active');
                    content.classList.add('show');

                    // Update share link when Teilen accordion is opened
                    var headerSpans = this.querySelectorAll(':scope > span');
                    var lastSpan = headerSpans[headerSpans.length - 1];
                    if (lastSpan && lastSpan.textContent.trim() === 'Teilen') {
                        updateShareLink();
                    }

                    // Expand Geokatalog to full height
                    if (isGeokatalog) {
                        geokatalogAccordion.classList.add('expanded');
                        loadGeokatalog();
                    }
                }

                setTimeout(updateMenuTogglePosition, 10);
            });
        });

        // ===== GEOKATALOG =====
        var geokatalogLoaded = false;

        function loadGeokatalog() {
            if (geokatalogLoaded) return;

            var treeContainer = document.getElementById('geokatalog-tree');

            fetch('https://api3.geo.admin.ch/rest/services/ech/CatalogServer?lang=de')
                .then(function(response) {
                    if (!response.ok) throw new Error('API nicht erreichbar');
                    return response.json();
                })
                .then(function(data) {
                    geokatalogLoaded = true;
                    treeContainer.innerHTML = '';

                    if (data.results && data.results.root && data.results.root.children) {
                        renderCatalogTree(data.results.root.children, treeContainer);
                    } else {
                        treeContainer.innerHTML = '<div class="geokatalog-error">Keine Daten verfügbar</div>';
                    }

                    setTimeout(updateMenuTogglePosition, 10);
                })
                .catch(function(error) {
                    console.error('Geokatalog Fehler:', error);
                    treeContainer.innerHTML = '<div class="geokatalog-error">Fehler beim Laden des Katalogs</div>';
                });
        }

        function renderCatalogTree(items, container) {
            items.forEach(function(item) {
                var itemEl = document.createElement('div');
                itemEl.className = 'catalog-item';

                var hasChildren = item.children && item.children.length > 0;

                var nodeEl = document.createElement('div');
                nodeEl.className = 'catalog-node' + (hasChildren ? '' : ' leaf');

                if (hasChildren) {
                    // Category node with arrow
                    var arrowEl = document.createElement('span');
                    arrowEl.className = 'node-arrow';
                    arrowEl.innerHTML = '<span class="material-symbols-outlined">chevron_right</span>';
                    nodeEl.appendChild(arrowEl);
                } else {
                    // Leaf node with checkbox
                    var checkboxEl = document.createElement('span');
                    checkboxEl.className = 'node-checkbox';
                    nodeEl.appendChild(checkboxEl);
                }

                var labelEl = document.createElement('span');
                labelEl.className = 'node-label';
                labelEl.textContent = item.label || item.category || 'Unbekannt';
                nodeEl.appendChild(labelEl);

                // Add info icon to leaf nodes
                if (!hasChildren) {
                    var infoEl = document.createElement('span');
                    infoEl.className = 'node-info';
                    infoEl.innerHTML = '<span class="material-symbols-outlined">info</span>';
                    nodeEl.appendChild(infoEl);
                }

                itemEl.appendChild(nodeEl);

                if (hasChildren) {
                    var childrenEl = document.createElement('div');
                    childrenEl.className = 'catalog-children';
                    renderCatalogTree(item.children, childrenEl);
                    itemEl.appendChild(childrenEl);

                    nodeEl.addEventListener('click', function(e) {
                        e.stopPropagation();
                        itemEl.classList.toggle('expanded');
                        nodeEl.classList.toggle('expanded');
                        setTimeout(updateMenuTogglePosition, 10);
                    });
                } else {
                    // Click on label does nothing for now (visual mockup)
                    nodeEl.addEventListener('click', function(e) {
                        e.stopPropagation();
                    });
                }

                container.appendChild(itemEl);
            });
        }

        // ===== MENU TOGGLE =====
        var menuToggle = document.getElementById('menu-toggle');
        var accordionPanel = document.getElementById('accordion-panel');
        var menuToggleText = document.getElementById('menu-toggle-text');
        var menuToggleIcon = menuToggle.querySelector('.material-symbols-outlined');
        var menuOpen = true;
        
        function updateMenuTogglePosition() {
            var mainRect = document.getElementById('map-view').getBoundingClientRect();

            if (menuOpen) {
                var panelRect = accordionPanel.getBoundingClientRect();
                var calculatedTop = panelRect.bottom - mainRect.top;
                // Ensure button stays below the panel - if panel hasn't rendered yet, retry
                if (panelRect.height < 50) {
                    setTimeout(updateMenuTogglePosition, 50);
                    return;
                }
                menuToggle.style.top = calculatedTop + 'px';
            } else {
                menuToggle.style.top = '10px';
            }
        }
        
        setTimeout(updateMenuTogglePosition, 100);
        
        menuToggle.addEventListener('click', function() {
            menuOpen = !menuOpen;
            
            if (menuOpen) {
                accordionPanel.classList.remove('collapsed');
                menuToggleText.textContent = 'Menü schliessen';
                menuToggleIcon.textContent = 'expand_less';
            } else {
                accordionPanel.classList.add('collapsed');
                menuToggleText.textContent = 'Menü öffnen';
                menuToggleIcon.textContent = 'expand_more';
            }
            
            setTimeout(updateMenuTogglePosition, 10);
        });
        
        var observer = new MutationObserver(function() {
            setTimeout(updateMenuTogglePosition, 10);
        });
        observer.observe(accordionPanel, { attributes: true, childList: true, subtree: true });
        
        // ===== INFO PANEL CLOSE =====
        document.getElementById('info-close').addEventListener('click', function() {
            document.getElementById('info-panel').classList.remove('show');
            selectedBuildingId = null;
            updateSelectedBuilding();
        });

        // ===== AI ASSISTANT PANEL =====
        var aiAssistantBtn = document.getElementById('ai-assistant-btn');
        var aiAssistantPanel = document.getElementById('ai-assistant-panel');
        var aiPanelClose = document.getElementById('ai-panel-close');
        var aiPanelOpen = false;

        function toggleAiPanel(forceClose) {
            if (forceClose === true) {
                aiPanelOpen = false;
            } else {
                aiPanelOpen = !aiPanelOpen;
            }

            if (aiPanelOpen) {
                aiAssistantPanel.classList.add('show');
                aiAssistantBtn.classList.add('active');
            } else {
                aiAssistantPanel.classList.remove('show');
                aiAssistantBtn.classList.remove('active');
            }

            // Resize map after transition completes
            if (window.map) {
                setTimeout(function() {
                    map.resize();
                }, 350);
            }
        }

        aiAssistantBtn.addEventListener('click', function() {
            toggleAiPanel();
        });

        aiPanelClose.addEventListener('click', function() {
            toggleAiPanel(true);
        });

        // ===== DETAIL TABS =====
        document.querySelectorAll('.detail-tab').forEach(function(tab) {
            tab.addEventListener('click', function() {
                if (this.classList.contains('disabled')) {
                    return;
                }
                var targetTab = this.dataset.tab;

                // Update active tab
                document.querySelectorAll('.detail-tab').forEach(function(t) {
                    t.classList.remove('active');
                });
                this.classList.add('active');

                // Switch content
                document.querySelectorAll('.tab-content').forEach(function(content) {
                    content.classList.remove('active');
                });
                var targetContent = document.querySelector('.tab-content[data-content="' + targetTab + '"]');
                if (targetContent) {
                    targetContent.classList.add('active');
                }

                // Render measurements table when switching to Bemessungen tab
                if (targetTab === 'bemessungen') {
                    renderMeasurementsTable();
                }

                // Render documents table when switching to Dokumente tab
                if (targetTab === 'dokumente') {
                    renderDocumentsTable();
                }

                // Render kontakte table when switching to Kontakte tab
                if (targetTab === 'kontakte') {
                    renderKontakteTable();
                }

                // Render kosten table when switching to Kosten tab
                if (targetTab === 'kosten') {
                    renderKostenTable();
                }

                // Render vertraege table when switching to Verträge tab
                if (targetTab === 'vertraege') {
                    renderVertraegeTable();
                }

                // Render ausstattung table when switching to Ausstattung tab
                if (targetTab === 'ausstattung') {
                    renderAusstattungTable();
                }
            });
        });

        // ===== STYLE SWITCHER =====
        var currentMapStyle = localStorage.getItem('mapStyle') || 'light-v11';
        var styleSwitcherBtn = document.getElementById('style-switcher-btn');
        var stylePanel = document.getElementById('style-panel');
        var stylePanelOpen = false;

        // Map style definitions
        var mapStyles = {
            'light-v11': { name: 'Light', url: 'mapbox://styles/mapbox/light-v11' },
            'streets-v12': { name: 'Standard', url: 'mapbox://styles/mapbox/streets-v12' },
            'satellite-v9': { name: 'Luftbild', url: 'mapbox://styles/mapbox/satellite-v9' },
            'satellite-streets-v12': { name: 'Hybrid', url: 'mapbox://styles/mapbox/satellite-streets-v12' }
        };

        // Generate thumbnail URL using Mapbox Static Images API
        function getStyleThumbnail(styleId, width, height) {
            var lon = 8.2275;
            var lat = 46.8182;
            var zoom = 6;
            return 'https://api.mapbox.com/styles/v1/mapbox/' + styleId + '/static/' +
                   lon + ',' + lat + ',' + zoom + '/' + width + 'x' + height +
                   '?access_token=' + mapboxgl.accessToken;
        }

        // Initialize thumbnails
        function initStyleThumbnails() {
            Object.keys(mapStyles).forEach(function(styleId) {
                var thumbEl = document.getElementById('thumb-' + styleId);
                if (thumbEl) {
                    thumbEl.src = getStyleThumbnail(styleId, 140, 100);
                }
            });
            // Set current style thumbnail
            document.getElementById('current-style-thumb').src = getStyleThumbnail(currentMapStyle, 160, 120);
        }

        // Update active style button
        function updateActiveStyleButton() {
            document.querySelectorAll('.style-option').forEach(function(btn) {
                btn.classList.remove('active');
                if (btn.dataset.style === currentMapStyle) {
                    btn.classList.add('active');
                }
            });
            document.getElementById('current-style-thumb').src = getStyleThumbnail(currentMapStyle, 160, 120);
        }

        // Toggle style panel
        function toggleStylePanel() {
            stylePanelOpen = !stylePanelOpen;
            if (stylePanelOpen) {
                stylePanel.classList.add('show');
            } else {
                stylePanel.classList.remove('show');
            }
        }

        // Close panel when clicking outside
        document.addEventListener('click', function(e) {
            if (stylePanelOpen && !e.target.closest('.style-switcher')) {
                stylePanelOpen = false;
                stylePanel.classList.remove('show');
            }
        });

        // Style switcher button click
        styleSwitcherBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleStylePanel();
        });

        // Style option click handlers
        document.querySelectorAll('.style-option').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var styleId = this.dataset.style;
                if (styleId === currentMapStyle) {
                    toggleStylePanel();
                    return;
                }

                currentMapStyle = styleId;
                localStorage.setItem('mapStyle', styleId);
                updateActiveStyleButton();

                // Change map style
                map.setStyle(mapStyles[styleId].url);

                // Close panel
                stylePanelOpen = false;
                stylePanel.classList.remove('show');
            });
        });

        // Re-add layers after style change
        map.on('style.load', function() {
            // Only re-add if portfolio data is loaded and source doesn't exist
            if (portfolioData && !map.getSource('portfolio')) {
                addMapLayers();
            }
        });

        // Apply saved style on load (if different from default)
        if (currentMapStyle !== 'light-v11') {
            map.once('load', function() {
                map.setStyle(mapStyles[currentMapStyle].url);
            });
        }

        // Initialize thumbnails after a short delay to ensure token is available
        setTimeout(initStyleThumbnails, 100);
        updateActiveStyleButton();

        // ===== SHARED TABLE UTILITIES =====

        // Generic sort function for table data
        function sortTableData(data, column, direction) {
            return data.sort(function(a, b) {
                var valA = a[column];
                var valB = b[column];
                if (typeof valA === 'string') {
                    valA = valA.toLowerCase();
                    valB = valB.toLowerCase();
                }
                if (valA < valB) return direction === 'asc' ? -1 : 1;
                if (valA > valB) return direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        // Generic selection update for detail tables
        function updateTableSelection(config) {
            var checkboxes = document.querySelectorAll('.' + config.checkboxClass);
            var checkedCount = document.querySelectorAll('.' + config.checkboxClass + ':checked').length;
            var selectAll = document.getElementById(config.selectAllId);

            if (selectAll) {
                selectAll.checked = checkedCount === checkboxes.length && checkboxes.length > 0;
                selectAll.indeterminate = checkedCount > 0 && checkedCount < checkboxes.length;
            }

            document.querySelectorAll('#' + config.tableId + ' tbody tr').forEach(function(row) {
                var cb = row.querySelector('.' + config.checkboxClass);
                row.classList.toggle('selected', cb && cb.checked);
            });

            document.querySelectorAll('.' + config.actionClass).forEach(function(btn) {
                btn.disabled = checkedCount === 0;
            });
        }

        // Generic sort column click handler setup
        function initTableSorting(config) {
            document.querySelectorAll('#' + config.tableId + ' th.sortable').forEach(function(th) {
                th.addEventListener('click', function() {
                    var column = this.dataset.sort;

                    if (column === config.state.column) {
                        config.state.direction = config.state.direction === 'asc' ? 'desc' : 'asc';
                    } else {
                        config.state.column = column;
                        config.state.direction = 'asc';
                    }

                    document.querySelectorAll('#' + config.tableId + ' th.sortable').forEach(function(header) {
                        header.classList.remove('sort-asc', 'sort-desc');
                        var icon = header.querySelector('.sort-icon');
                        if (icon) icon.textContent = 'unfold_more';
                    });

                    this.classList.add('sort-' + config.state.direction);
                    var sortIcon = this.querySelector('.sort-icon');
                    if (sortIcon) {
                        sortIcon.textContent = config.state.direction === 'asc' ? 'arrow_upward' : 'arrow_downward';
                    }

                    config.onSort();
                });
            });
        }

        // Generic select-all checkbox setup
        function initSelectAll(config) {
            var selectAll = document.getElementById(config.selectAllId);
            if (selectAll) {
                selectAll.addEventListener('change', function() {
                    var isChecked = this.checked;
                    document.querySelectorAll('.' + config.checkboxClass).forEach(function(cb) {
                        cb.checked = isChecked;
                    });
                    config.onUpdate();
                });
            }
        }

        // ===== GENERIC ENTITY TABLE FACTORY =====
        // Eliminates code duplication across 6 entity tables

        function createEntityTable(config) {
            var table = {
                data: [],
                filteredData: [],
                sort: { column: config.defaultSort || 'id', direction: 'asc' },
                tableConfig: {
                    tableId: config.tableId,
                    checkboxClass: config.checkboxClass,
                    selectAllId: config.selectAllId,
                    actionClass: config.actionClass,
                    state: null, // Will be set below
                    onSort: null,
                    onUpdate: null
                }
            };

            // Set up circular references
            table.tableConfig.state = table.sort;
            table.tableConfig.onSort = function() {
                sortTableData(table.filteredData, table.sort.column, table.sort.direction);
                table.render();
            };
            table.tableConfig.onUpdate = function() {
                updateTableSelection(table.tableConfig);
            };

            // Load data for a building
            table.load = function(building) {
                if (building && building.properties) {
                    var buildingId = building.properties.buildingId;
                    table.data = config.dataSource()
                        .filter(function(item) {
                            return item.buildingIds && item.buildingIds.includes(buildingId);
                        })
                        .map(config.transform);
                } else {
                    table.data = [];
                }
                table.filteredData = table.data.slice();
            };

            // Render table rows with empty state support
            table.render = function() {
                var tbody = document.getElementById(config.tbodyId);
                if (!tbody) return;

                // Check for empty state
                if (table.filteredData.length === 0) {
                    var colCount = config.columns.length + 1; // +1 for checkbox column
                    var emptyMessage = table.data.length === 0
                        ? 'Keine Einträge vorhanden'
                        : 'Keine Treffer für die Suche';
                    var emptyIcon = table.data.length === 0 ? 'inbox' : 'search_off';

                    tbody.innerHTML = '<tr class="empty-row"><td colspan="' + colCount + '">' +
                        '<div class="table-empty-state">' +
                        '<span class="material-symbols-outlined">' + emptyIcon + '</span>' +
                        '<div class="table-empty-message">' + emptyMessage + '</div>' +
                        '</div></td></tr>';
                    return;
                }

                var html = '';
                table.filteredData.forEach(function(item) {
                    html += '<tr data-id="' + item.id + '">';
                    html += '<td class="col-checkbox"><input type="checkbox" class="' + config.checkboxClass + '"></td>';
                    config.columns.forEach(function(col) {
                        var value = col.render ? col.render(item) : (item[col.key] || '—');
                        html += '<td class="' + col.className + '">' + value + '</td>';
                    });
                    html += '</tr>';
                });
                tbody.innerHTML = html;

                document.querySelectorAll('.' + config.checkboxClass).forEach(function(cb) {
                    cb.addEventListener('change', function() {
                        updateTableSelection(table.tableConfig);
                    });
                });
            };

            // Filter data based on search term
            table.filter = function(term) {
                term = term.toLowerCase().trim();
                if (term === '') {
                    table.filteredData = table.data.slice();
                } else {
                    table.filteredData = table.data.filter(function(item) {
                        return config.searchFields.some(function(field) {
                            var val = item[field];
                            if (val == null) return false;
                            return String(val).toLowerCase().includes(term);
                        });
                    });
                }
                sortTableData(table.filteredData, table.sort.column, table.sort.direction);
                table.render();
            };

            // Initialize event handlers
            table.init = function() {
                initTableSorting(table.tableConfig);
                initSelectAll(table.tableConfig);

                var filterInput = document.getElementById(config.filterId);
                if (filterInput) {
                    filterInput.addEventListener('input', function() {
                        table.filter(this.value);
                    });
                }

                var addBtn = document.getElementById(config.addBtnId);
                if (addBtn) {
                    addBtn.addEventListener('click', function() {
                        alert(config.addBtnMessage);
                    });
                }
            };

            return table;
        }

        // ===== SHARED FORMATTERS =====

        function formatCurrency(amount) {
            if (amount == null) return '—';
            return new Intl.NumberFormat('de-CH', {
                style: 'currency',
                currency: 'CHF',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount);
        }

        function formatCurrencyWithUnit(amount, einheit) {
            if (amount == null) return '—';
            var currency = 'CHF';
            if (einheit) {
                var parts = einheit.split('/');
                if (parts.length > 0) currency = parts[0].trim();
            }
            return new Intl.NumberFormat('de-CH', {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount);
        }

        function getStatusClass(status) {
            if (!status) return '';
            var s = status.toLowerCase();
            if (s === 'aktiv') return 'aktiv';
            if (s === 'gekündigt') return 'gekuendigt';
            if (s === 'ausgelaufen') return 'ausgelaufen';
            return '';
        }

        // ===== ENTITY TABLE DEFINITIONS =====

        var measurementsTable = createEntityTable({
            tableId: 'measurements-table',
            tbodyId: 'measurements-tbody',
            checkboxClass: 'measurement-checkbox',
            selectAllId: 'select-all-measurements',
            actionClass: 'measurements-action',
            filterId: 'measurements-filter',
            addBtnId: 'btn-add-measurement',
            addBtnMessage: 'Bemessung hinzufügen - kommt bald...',
            defaultSort: 'id',
            dataSource: function() { return allAreaMeasurements; },
            transform: function(m) {
                return {
                    id: m.areaMeasurementId,
                    areaType: m.type,
                    value: m.value,
                    unit: m.unit,
                    source: (m.extensionData && m.extensionData.source) || 'Manuell',
                    accuracy: m.accuracy,
                    standard: m.standard,
                    validFrom: m.validFrom,
                    validUntil: m.validUntil || '—'
                };
            },
            columns: [
                { key: 'id', className: 'col-id' },
                { key: 'areaType', className: 'col-type' },
                { key: 'value', className: 'col-area', render: function(m) {
                    return Number(m.value).toLocaleString('de-CH') + ' ' + m.unit;
                }},
                { key: 'source', className: 'col-source' },
                { key: 'accuracy', className: 'col-accuracy' },
                { key: 'standard', className: 'col-standard' },
                { key: 'validFrom', className: 'col-from' },
                { key: 'validUntil', className: 'col-until' }
            ],
            searchFields: ['id', 'areaType', 'accuracy', 'standard', 'unit', 'value']
        });

        var documentsTable = createEntityTable({
            tableId: 'documents-table',
            tbodyId: 'documents-tbody',
            checkboxClass: 'document-checkbox',
            selectAllId: 'select-all-documents',
            actionClass: 'documents-action',
            filterId: 'documents-filter',
            addBtnId: 'btn-add-document',
            addBtnMessage: 'Dokument hinzufügen - kommt bald...',
            defaultSort: 'id',
            dataSource: function() { return allDocuments; },
            transform: function(d) {
                return {
                    id: d.documentId,
                    titel: d.name,
                    dokumentTyp: d.type,
                    dateiformat: d.fileFormat,
                    datum: d.validFrom,
                    dateigroesse: d.fileSize,
                    url: d.url || '#'
                };
            },
            columns: [
                { key: 'id', className: 'col-id' },
                { key: 'titel', className: 'col-title' },
                { key: 'dokumentTyp', className: 'col-type' },
                { key: 'dateiformat', className: 'col-format' },
                { key: 'datum', className: 'col-date' },
                { key: 'dateigroesse', className: 'col-size' }
            ],
            searchFields: ['id', 'titel', 'dokumentTyp', 'dateiformat', 'datum', 'dateigroesse']
        });

        var kontakteTable = createEntityTable({
            tableId: 'kontakte-table',
            tbodyId: 'kontakte-tbody',
            checkboxClass: 'kontakt-checkbox',
            selectAllId: 'select-all-kontakte',
            actionClass: 'kontakte-action',
            filterId: 'kontakte-filter',
            addBtnId: 'btn-add-kontakt',
            addBtnMessage: 'Kontakt hinzufügen - kommt bald...',
            defaultSort: 'name',
            dataSource: function() { return allContacts; },
            transform: function(k) {
                return {
                    id: k.contactId,
                    name: k.name,
                    rolle: k.role,
                    organisation: k.organisation,
                    telefon: k.phone,
                    email: k.email
                };
            },
            columns: [
                { key: 'id', className: 'col-kontakt-id' },
                { key: 'name', className: 'col-kontakt-name' },
                { key: 'rolle', className: 'col-kontakt-rolle' },
                { key: 'organisation', className: 'col-kontakt-org' },
                { key: 'telefon', className: 'col-kontakt-telefon', render: function(k) {
                    return '<a href="tel:' + k.telefon + '">' + k.telefon + '</a>';
                }},
                { key: 'email', className: 'col-kontakt-email', render: function(k) {
                    return '<a href="mailto:' + k.email + '">' + k.email + '</a>';
                }}
            ],
            searchFields: ['id', 'name', 'rolle', 'organisation', 'telefon', 'email']
        });

        var kostenTable = createEntityTable({
            tableId: 'kosten-table',
            tbodyId: 'kosten-tbody',
            checkboxClass: 'kosten-checkbox',
            selectAllId: 'select-all-kosten',
            actionClass: 'kosten-action',
            filterId: 'kosten-filter',
            addBtnId: 'btn-add-kosten',
            addBtnMessage: 'Kosten hinzufügen - kommt bald...',
            defaultSort: 'kostengruppe',
            dataSource: function() { return allCosts; },
            transform: function(k) {
                return {
                    id: k.costId,
                    kostengruppe: k.costGroup,
                    kostenart: k.costType,
                    betrag: k.amount,
                    einheit: k.unit,
                    stichtag: k.referenceDate
                };
            },
            columns: [
                { key: 'id', className: 'col-kosten-id' },
                { key: 'kostengruppe', className: 'col-kosten-gruppe' },
                { key: 'kostenart', className: 'col-kosten-art' },
                { key: 'betrag', className: 'col-kosten-betrag', render: function(k) {
                    return formatCurrencyWithUnit(k.betrag, k.einheit);
                }},
                { key: 'einheit', className: 'col-kosten-einheit', render: function(k) {
                    return k.einheit || '—';
                }},
                { key: 'stichtag', className: 'col-kosten-stichtag', render: function(k) {
                    return k.stichtag || '—';
                }}
            ],
            searchFields: ['id', 'kostengruppe', 'kostenart', 'betrag', 'einheit', 'stichtag']
        });

        var vertraegeTable = createEntityTable({
            tableId: 'vertraege-table',
            tbodyId: 'vertraege-tbody',
            checkboxClass: 'vertrag-checkbox',
            selectAllId: 'select-all-vertraege',
            actionClass: 'vertraege-action',
            filterId: 'vertraege-filter',
            addBtnId: 'btn-add-vertrag',
            addBtnMessage: 'Vertrag hinzufügen - kommt bald...',
            defaultSort: 'vertragsart',
            dataSource: function() { return allContracts; },
            transform: function(v) {
                return {
                    id: v.contractId,
                    vertragsart: v.type,
                    vertragspartner: v.contractPartner,
                    vertragsbeginn: v.validFrom,
                    vertragsende: v.validUntil,
                    betrag: v.amount,
                    status: v.status
                };
            },
            columns: [
                { key: 'id', className: 'col-vertrag-id' },
                { key: 'vertragsart', className: 'col-vertrag-art' },
                { key: 'vertragspartner', className: 'col-vertrag-partner' },
                { key: 'vertragsbeginn', className: 'col-vertrag-beginn', render: function(v) {
                    return v.vertragsbeginn || '—';
                }},
                { key: 'vertragsende', className: 'col-vertrag-ende', render: function(v) {
                    return v.vertragsende || 'unbefristet';
                }},
                { key: 'betrag', className: 'col-vertrag-betrag', render: function(v) {
                    return formatCurrency(v.betrag);
                }},
                { key: 'status', className: 'col-vertrag-status', render: function(v) {
                    return '<span class="vertrag-status ' + getStatusClass(v.status) + '">' + v.status + '</span>';
                }}
            ],
            searchFields: ['id', 'vertragsart', 'vertragspartner', 'vertragsbeginn', 'vertragsende', 'betrag', 'status']
        });

        var ausstattungTable = createEntityTable({
            tableId: 'ausstattung-table',
            tbodyId: 'ausstattung-tbody',
            checkboxClass: 'ausstattung-checkbox',
            selectAllId: 'select-all-ausstattung',
            actionClass: 'ausstattung-action',
            filterId: 'ausstattung-filter',
            addBtnId: 'btn-add-ausstattung',
            addBtnMessage: 'Ausstattung hinzufügen - kommt bald...',
            defaultSort: 'bezeichnung',
            dataSource: function() { return allAssets; },
            transform: function(a) {
                return {
                    id: a.assetId,
                    bezeichnung: a.name,
                    kategorie: a.category,
                    hersteller: a.manufacturer,
                    baujahr: a.installationYear,
                    standort: a.location
                };
            },
            columns: [
                { key: 'id', className: 'col-ausstattung-id' },
                { key: 'bezeichnung', className: 'col-ausstattung-bezeichnung' },
                { key: 'kategorie', className: 'col-ausstattung-kategorie', render: function(a) {
                    return '<span class="kategorie-badge">' + a.kategorie + '</span>';
                }},
                { key: 'hersteller', className: 'col-ausstattung-hersteller' },
                { key: 'baujahr', className: 'col-ausstattung-baujahr' },
                { key: 'standort', className: 'col-ausstattung-standort' }
            ],
            searchFields: ['id', 'bezeichnung', 'kategorie', 'hersteller', 'baujahr', 'standort']
        });

        // Initialize all entity tables
        measurementsTable.init();
        documentsTable.init();
        kontakteTable.init();
        kostenTable.init();
        vertraegeTable.init();
        ausstattungTable.init();

        // ===== LEGACY FUNCTION ALIASES (for backward compatibility) =====
        // These maintain the old API so existing code continues to work

        function loadMeasurementsForBuilding(building) { measurementsTable.load(building); }
        function loadDocumentsForBuilding(building) { documentsTable.load(building); }
        function loadKontakteForBuilding(building) { kontakteTable.load(building); }
        function loadKostenForBuilding(building) { kostenTable.load(building); }
        function loadVertraegeForBuilding(building) { vertraegeTable.load(building); }
        function loadAusstattungForBuilding(building) { ausstattungTable.load(building); }

        function renderMeasurementsTable() { measurementsTable.render(); }
        function renderDocumentsTable() { documentsTable.render(); }
        function renderKontakteTable() { kontakteTable.render(); }
        function renderKostenTable() { kostenTable.render(); }
        function renderVertraegeTable() { vertraegeTable.render(); }
        function renderAusstattungTable() { ausstattungTable.render(); }