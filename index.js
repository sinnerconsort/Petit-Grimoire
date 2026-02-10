/**
 * Petit Grimoire - Main Entry Point
 * A Magical Girl Fortune-Telling Extension for SillyTavern
 * 
 * ⚠️ DIAGNOSTIC VERSION
 */

// Core
import { extensionName, THEMES, getTheme } from './src/core/config.js';
import { settings, loadSettings, saveSettings, setTheme } from './src/core/state.js';

// UI
import { createFab, destroyFab, updateFabTheme, constrainFabToViewport } from './src/ui/fab.js';
import { createGrimoire, destroyGrimoire, toggleGrimoire, updateGrimoireTheme } from './src/ui/grimoire.js';

// Nyxgotchi
import { createNyxgotchi, destroyNyxgotchi, updateShell, updateHandheldTheme } from './src/ui/nyxgotchi/nyx.js';

// =============================================================================
// DEBUG
// =============================================================================

function debug(msg, type = 'info') {
    console.log(`[PG] ${msg}`);
    if (typeof toastr !== 'undefined') {
        toastr[type]?.(msg, '✨ PG Debug', { timeOut: 4000 });
    }
}

// =============================================================================
// UI LIFECYCLE
// =============================================================================

/**
 * Create all UI elements - each wrapped in try/catch so one failure
 * doesn't prevent the others from being created
 */
function createUI() {
    destroyUI();
    
    // Create FAB
    try {
        debug('Creating FAB...');
        createFab(toggleGrimoire);
        debug('FAB OK', 'success');
    } catch (err) {
        debug(`FAB FAILED: ${err.message}`, 'error');
        console.error('[PG] FAB creation failed:', err);
    }
    
    // Create grimoire panel
    try {
        debug('Creating Grimoire...');
        createGrimoire();
        debug('Grimoire OK', 'success');
    } catch (err) {
        debug(`GRIMOIRE FAILED: ${err.message}`, 'error');
        console.error('[PG] Grimoire creation failed:', err);
    }
    
    // Create Nyxgotchi companion
    try {
        debug('Creating Nyxgotchi...');
        createNyxgotchi();
        // createNyxgotchi has its own debug messages
    } catch (err) {
        debug(`NYXGOTCHI FAILED: ${err.message}`, 'error');
        console.error('[PG] Nyxgotchi creation failed:', err);
    }
    
    console.log('[PG] UI created');
}

/**
 * Destroy all UI elements
 */
function destroyUI() {
    destroyFab();
    destroyGrimoire();
    destroyNyxgotchi();
}

/**
 * Rebuild UI with current theme
 */
function rebuildUI() {
    if (settings.enabled) {
        createUI();
    }
}

/**
 * Apply theme changes without full rebuild
 */
function applyTheme() {
    updateFabTheme();
    updateGrimoireTheme();
    try { updateShell(); } catch(e) {}
    try { updateHandheldTheme(); } catch(e) {}
}

// =============================================================================
// SETTINGS PANEL
// =============================================================================

function addSettingsUI() {
    if (document.getElementById('pg-settings')) return;
    
    const themeOpts = Object.entries(THEMES)
        .map(([k, t]) => `<option value="${k}" ${settings.theme === k ? 'selected' : ''}>${t.name}</option>`)
        .join('');
    
    const html = `
        <div id="pg-settings" class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
                <b>✨ Petit Grimoire</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content">
                <label class="checkbox_label">
                    <input type="checkbox" id="pg-enabled" ${settings.enabled ? 'checked' : ''}>
                    <span>Enable Extension</span>
                </label>
                <div style="margin-top: 10px; display: flex; align-items: center; gap: 10px;">
                    <label>Theme:</label>
                    <select id="pg-theme">${themeOpts}</select>
                </div>
                <div style="margin-top: 8px; font-size: 11px; opacity: 0.6;">
                    ${getTheme(settings.theme).desc}
                </div>
            </div>
        </div>
    `;
    
    $('#extensions_settings2').append(html);
    
    // Enable/disable toggle
    $('#pg-enabled').on('change', function() {
        settings.enabled = $(this).prop('checked');
        saveSettings();
        
        if (settings.enabled) {
            createUI();
        } else {
            destroyUI();
        }
    });
    
    // Theme selector
    $('#pg-theme').on('change', function() {
        const newTheme = $(this).val();
        setTheme(newTheme);
        
        $(this).closest('.inline-drawer-content')
            .find('div:last-child')
            .text(getTheme(newTheme).desc);
        
        if (settings.enabled) {
            rebuildUI();
        }
    });
}

// =============================================================================
// WINDOW EVENTS
// =============================================================================

let resizeTimeout = null;

function handleResize() {
    constrainFabToViewport();
}

window.addEventListener('resize', () => {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleResize, 150);
});

// =============================================================================
// INITIALIZATION
// =============================================================================

jQuery(() => {
    debug('Petit Grimoire starting...');
    
    // Load saved settings
    loadSettings();
    
    // Add settings panel
    addSettingsUI();
    
    // Create UI if enabled
    if (settings.enabled) {
        setTimeout(createUI, 300);
    }
    
    debug('Initialized');
});
