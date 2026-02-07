/**
 * Petit Grimoire - A Magical Girl Fortune-Telling Extension
 * REBUILD - Simplified with debug output
 */

import { getContext } from '../../../extensions.js';
import { eventSource, event_types, saveSettingsDebounced } from '../../../../script.js';

// =============================================================================
// CONSTANTS
// =============================================================================

const extensionName = 'third-party/Petit-Grimoire';
const extensionFolderPath = `scripts/extensions/${extensionName}`;

const ASSET_PATHS = {
    grimoire: `${extensionFolderPath}/assets/grimoire`,
    shells: `${extensionFolderPath}/assets/shells`,
    sprites: `${extensionFolderPath}/assets/sprites`,
};

const THEMES = {
    guardian: {
        name: 'Guardian',
        main: '#dc78aa',
        secondary: '#f3aa1e',
        bg: '#1a0a12',
        cardBg: '#2a1020',
        textLight: '#fce4ec',
        fabIcon: 'fab-guardian.png',
    },
    umbra: {
        name: 'Umbra',
        main: '#940e8f',
        secondary: '#d89520',
        bg: '#0d0512',
        cardBg: '#1a0825',
        textLight: '#e8d5f5',
        fabIcon: 'fab-umbra.png',
    },
    apothecary: {
        name: 'Apothecary',
        main: '#76482e',
        secondary: '#4c6b20',
        bg: '#1a150e',
        cardBg: '#2a2015',
        textLight: '#f0e6d8',
        fabIcon: 'fab-apothecary.png',
    },
    moonstone: {
        name: 'Moonstone',
        main: '#d9c7fb',
        secondary: '#bcf1fd',
        bg: '#1a1525',
        cardBg: '#251e35',
        textLight: '#feebff',
        fabIcon: 'fab-moonstone.png',
    },
    phosphor: {
        name: 'Phosphor',
        main: '#7375ca',
        secondary: '#feffff',
        bg: '#060018',
        cardBg: '#0d0230',
        textLight: '#e8e8ff',
        fabIcon: 'fab-phosphor.png',
    },
    rosewood: {
        name: 'Rosewood',
        main: '#e4b0bc',
        secondary: '#d8caca',
        bg: '#1a1214',
        cardBg: '#2a1e22',
        textLight: '#f5eaed',
        fabIcon: 'fab-rosewood.png',
    },
    celestial: {
        name: 'Celestial',
        main: '#002f86',
        secondary: '#e3b35f',
        bg: '#060d1a',
        cardBg: '#0c1528',
        textLight: '#fbe09c',
        fabIcon: 'fab-celestial.png',
    }
};

// =============================================================================
// STATE
// =============================================================================

let extensionSettings = {
    enabled: true,
    theme: 'guardian',
    panelOpen: false,
    fabPosition: { right: 20, bottom: 100 }
};

// =============================================================================
// SETTINGS
// =============================================================================

function loadSettings() {
    try {
        const context = getContext();
        const saved = context.extensionSettings?.[extensionName];
        if (saved) {
            Object.assign(extensionSettings, saved);
        }
        console.log('[PetitGrimoire] Settings loaded:', extensionSettings);
    } catch (error) {
        console.error('[PetitGrimoire] loadSettings error:', error);
    }
}

function saveSettings() {
    try {
        const context = getContext();
        if (!context.extensionSettings) {
            context.extensionSettings = {};
        }
        context.extensionSettings[extensionName] = extensionSettings;
        saveSettingsDebounced();
    } catch (error) {
        console.error('[PetitGrimoire] saveSettings error:', error);
    }
}

// =============================================================================
// UI CREATION
// =============================================================================

function createUI() {
    console.log('[PetitGrimoire] createUI called');
    
    // Remove existing
    $('#petit-grimoire-fab').remove();
    $('#petit-grimoire-panel').remove();
    
    const theme = THEMES[extensionSettings.theme] || THEMES.guardian;
    const fabSrc = `${ASSET_PATHS.sprites}/${theme.fabIcon}`;
    
    console.log('[PetitGrimoire] FAB image src:', fabSrc);
    
    // Create FAB - super simple
    const fabHtml = `
        <div id="petit-grimoire-fab" title="Open Grimoire">
            <img src="${fabSrc}" alt="✨" draggable="false">
        </div>
    `;
    
    // Create Panel
    const panelHtml = `
        <div id="petit-grimoire-panel" class="${extensionSettings.panelOpen ? 'open' : ''}">
            <div id="petit-grimoire-book">
                <div class="pg-book-content">
                    <div class="pg-header">✨ Petit Grimoire ✨</div>
                    <div class="pg-body">
                        <p>Theme: ${theme.name}</p>
                        <p>Panel is working!</p>
                        <button id="pg-test-close">Close Panel</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Append to body
    $('body').append(fabHtml);
    $('body').append(panelHtml);
    
    console.log('[PetitGrimoire] HTML appended');
    
    // Verify elements exist
    const $fab = $('#petit-grimoire-fab');
    const $panel = $('#petit-grimoire-panel');
    
    console.log('[PetitGrimoire] FAB exists:', $fab.length > 0);
    console.log('[PetitGrimoire] Panel exists:', $panel.length > 0);
    
    if ($fab.length === 0) {
        toastr.error('FAB element not created!', 'PetitGrimoire');
        return;
    }
    
    // Apply saved position
    $fab.css({
        right: extensionSettings.fabPosition.right + 'px',
        bottom: extensionSettings.fabPosition.bottom + 'px'
    });
    
    // FAB click handler
    $fab.on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('[PetitGrimoire] FAB clicked');
        togglePanel();
    });
    
    // Close button
    $('#pg-test-close').on('click', function() {
        closePanel();
    });
    
    // Click outside panel to close
    $panel.on('click', function(e) {
        if (e.target === this) {
            closePanel();
        }
    });
    
    toastr.success('UI Created! FAB should be visible.', 'PetitGrimoire');
}

function destroyUI() {
    $('#petit-grimoire-fab').remove();
    $('#petit-grimoire-panel').remove();
}

// =============================================================================
// PANEL CONTROL
// =============================================================================

function togglePanel() {
    if (extensionSettings.panelOpen) {
        closePanel();
    } else {
        openPanel();
    }
}

function openPanel() {
    console.log('[PetitGrimoire] Opening panel');
    $('#petit-grimoire-panel').addClass('open');
    extensionSettings.panelOpen = true;
    saveSettings();
}

function closePanel() {
    console.log('[PetitGrimoire] Closing panel');
    $('#petit-grimoire-panel').removeClass('open');
    extensionSettings.panelOpen = false;
    saveSettings();
}

// =============================================================================
// THEME
// =============================================================================

function applyTheme(themeKey) {
    if (!THEMES[themeKey]) return;
    
    extensionSettings.theme = themeKey;
    saveSettings();
    
    // Recreate UI with new theme
    if (extensionSettings.enabled) {
        createUI();
    }
}

// =============================================================================
// SETTINGS PANEL (in Extensions tab)
// =============================================================================

function addExtensionSettings() {
    // Check if already added
    if ($('#pg-settings-block').length > 0) return;
    
    const themeOptions = Object.entries(THEMES)
        .map(([key, t]) => `<option value="${key}" ${extensionSettings.theme === key ? 'selected' : ''}>${t.name}</option>`)
        .join('');
    
    const settingsHtml = `
        <div id="pg-settings-block" class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
                <b>✨ Petit Grimoire</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content">
                <label class="checkbox_label">
                    <input type="checkbox" id="pg-enabled" ${extensionSettings.enabled ? 'checked' : ''}>
                    <span>Enable Extension</span>
                </label>
                <div style="margin-top: 10px;">
                    <label style="margin-right: 10px;">Theme:</label>
                    <select id="pg-theme-select">${themeOptions}</select>
                </div>
                <div style="margin-top: 10px;">
                    <button id="pg-debug-btn" class="menu_button">Debug: Recreate UI</button>
                </div>
            </div>
        </div>
    `;
    
    $('#extensions_settings2').append(settingsHtml);
    
    // Enable toggle
    $('#pg-enabled').on('change', function() {
        extensionSettings.enabled = $(this).prop('checked');
        saveSettings();
        
        if (extensionSettings.enabled) {
            createUI();
        } else {
            destroyUI();
        }
    });
    
    // Theme select
    $('#pg-theme-select').on('change', function() {
        applyTheme($(this).val());
    });
    
    // Debug button
    $('#pg-debug-btn').on('click', function() {
        toastr.info('Recreating UI...', 'PetitGrimoire');
        createUI();
    });
}

// =============================================================================
// INIT
// =============================================================================

jQuery(async () => {
    console.log('[PetitGrimoire] 🔮 Starting...');
    
    try {
        loadSettings();
        addExtensionSettings();
        
        if (extensionSettings.enabled) {
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                createUI();
            }, 500);
        }
        
        console.log('[PetitGrimoire] ✨ Init complete');
        
    } catch (error) {
        console.error('[PetitGrimoire] Init error:', error);
        toastr.error('Failed to initialize: ' + error.message, 'PetitGrimoire');
    }
});
