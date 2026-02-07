/**
 * Petit Grimoire — Entry Point
 * Rebuild v2 — Clean Shell
 *
 * Currently loads: Compact FAB + Grimoire Drawer
 * Future: Nyxgotchi, Tarot engine, Crystal Ball, Ouija, Spell effects
 */

import {
    extensionName, extensionFolderPath,
    extensionSettings, defaultSettings,
    loadSettings, saveSettings,
} from './src/state.js';

import {
    initGrimoire,
    closeGrimoire,
    updateCompactBadge,
} from './src/grimoire.js';

// ============================================
// CSS LOADING (ST may not auto-load from subdirs)
// ============================================

function loadCSS() {
    const cssId = 'petit-grimoire-css';
    if (!document.getElementById(cssId)) {
        const link = document.createElement('link');
        link.id = cssId;
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = `/${extensionFolderPath}/styles/main.css`;
        document.head.appendChild(link);
        console.log('[PetitGrimoire] CSS loaded:', link.href);
    }
}

// ============================================
// THEME SWITCHING
// ============================================

function setTheme(themeName) {
    extensionSettings.shellTheme = themeName;

    // Update all themed elements
    $('#mg-compact').attr('data-mg-theme', themeName);
    $('#mg-grimoire').attr('data-mg-theme', themeName);
    // Future: $('#nyxgotchi').attr('data-mg-theme', themeName);

    saveSettings();
}

// ============================================
// SETTINGS PANEL (in ST Extensions tab)
// ============================================

function addSettingsPanel() {
    const themes = [
        { value: 'guardian',    label: '✦ Guardian (Star Prism)' },
        { value: 'umbra',      label: '◆ Umbra (Grief Seeds)' },
        { value: 'apothecary', label: '❀ Apothecary (Botanicals)' },
        { value: 'moonstone',  label: '☽ Moonstone (Crystals)' },
        { value: 'phosphor',   label: '△ Phosphor (Neon)' },
        { value: 'rosewood',   label: '❀ Rosewood (Floral)' },
        { value: 'celestial',  label: '✴ Celestial (Starbound)' },
    ];

    const themeOptions = themes.map(t =>
        `<option value="${t.value}" ${extensionSettings.shellTheme === t.value ? 'selected' : ''}>${t.label}</option>`
    ).join('\n');

    const html = `
        <div class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
                <b>📖 Petit Grimoire</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content">

                <label class="checkbox_label">
                    <input type="checkbox" id="mg-enabled" ${extensionSettings.enabled ? 'checked' : ''}>
                    <span>Enable Extension</span>
                </label>

                <hr>
                <h5>Appearance</h5>

                <label for="mg-theme">Color Theme:</label>
                <select id="mg-theme" class="text_pole">
                    ${themeOptions}
                </select>

                <label class="checkbox_label">
                    <input type="checkbox" id="mg-show-compact" ${extensionSettings.showCompact !== false ? 'checked' : ''}>
                    <span>Show Compact Brooch</span>
                </label>

                <hr>

                <div class="flex-container">
                    <input type="button" id="mg-reset" class="menu_button" value="Reset UI">
                </div>

            </div>
        </div>
    `;

    $('#extensions_settings2').append(html);

    // ── Event Handlers ──

    $('#mg-enabled').on('change', function () {
        extensionSettings.enabled = $(this).prop('checked');
        saveSettings();
        if (extensionSettings.enabled) {
            initGrimoire();
        } else {
            destroyAll();
        }
    });

    $('#mg-theme').on('change', function () {
        setTheme($(this).val());
    });

    $('#mg-show-compact').on('change', function () {
        extensionSettings.showCompact = $(this).prop('checked');
        saveSettings();
        $('#mg-compact').toggle(extensionSettings.showCompact);
    });

    $('#mg-reset').on('click', function () {
        destroyAll();
        initGrimoire();
        toastr?.info('UI reset!', 'Petit Grimoire');
    });
}

// ============================================
// CLEANUP
// ============================================

function destroyAll() {
    closeGrimoire();
    $('#mg-compact').remove();
    $('#mg-grimoire').remove();
    $('#mg-grimoire-overlay').remove();
}

// ============================================
// BOOT
// ============================================

jQuery(async () => {
    try {
        console.log('[PetitGrimoire] Starting...');

        // 0. Load CSS (ST may not auto-load from subdirs)
        loadCSS();

        // 1. Load settings
        loadSettings();

        // 2. Settings panel
        addSettingsPanel();

        // 3. Init UI if enabled
        if (extensionSettings.enabled) {
            console.log('[PetitGrimoire] Theme:', extensionSettings.shellTheme);
            initGrimoire();
        }

        console.log('[PetitGrimoire] ✅ Ready');

    } catch (error) {
        console.error('[PetitGrimoire] ❌ Boot failed:', error);
        if (typeof toastr !== 'undefined') {
            toastr.error('Petit Grimoire: ' + error.message, 'Error', { timeOut: 10000 });
        }
    }
});

// ============================================
// DEBUG — accessible via browser console
// ============================================

window.PetitGrimoire = {
    getSettings: () => extensionSettings,
    setTheme,
    updateCompactBadge,
    reinit: () => { destroyAll(); initGrimoire(); },
};
