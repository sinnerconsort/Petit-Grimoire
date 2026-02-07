/**
 * Petit Grimoire - Magical Girl Fortune Extension
 * Entry point: settings panel + initialization
 * 
 * v6 - Simplified, no compact.js dependency
 */

import {
    extensionName, extensionFolderPath, extensionSettings, defaultSettings,
    loadSettings, saveSettings,
    setCurrentSpriteFrame
} from './src/state.js';

// Grimoire now creates its own compact internally
import {
    initGrimoire,
    closeGrimoire,
    updateCompactBadge
} from './src/grimoire.js';

import {
    createTama, stopSpriteAnimation,
    showSpeech, updateNyxMood,
    updateSpriteDisplay,
    playSpecialAnimation
} from './src/nyxgotchi.js';

// ============================================
// CSS LOADING
// ============================================

function loadCSS() {
    if (document.getElementById('petit-grimoire-styles')) return;

    const link = document.createElement('link');
    link.id = 'petit-grimoire-styles';
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = `${extensionFolderPath}/styles/main.css`;
    document.head.appendChild(link);

    console.log(`[${extensionName}] CSS loaded`);
}

// ============================================
// THEME SWITCHING
// ============================================

function setTheme(themeName) {
    extensionSettings.shellTheme = themeName;
    $('#mg-compact').attr('data-mg-theme', themeName);
    $('#nyxgotchi').attr('data-mg-theme', themeName);
    $('#mg-grimoire').attr('data-mg-theme', themeName);
    saveSettings();
}

function setFamiliarForm(formName) {
    extensionSettings.familiarForm = formName;
    setCurrentSpriteFrame(0);
    updateSpriteDisplay();
    saveSettings();
}

function setCompactSize(size) {
    extensionSettings.compactSize = size;
    $('#mg-compact').attr('data-mg-size', size);
    saveSettings();
}

function setTamaSize(size) {
    extensionSettings.tamaSize = size;
    $('#nyxgotchi').attr('data-mg-size', size);
    saveSettings();
}

// ============================================
// TAMA INIT
// ============================================

function initTama() {
    createTama({
        onDraw: () => {
            console.log('[PetitGrimoire] Draw from tama');
            toastr?.info('Card draw coming soon!', 'Tarot');
        },
        onQueue: () => {
            console.log('[PetitGrimoire] Queue from tama');
            toastr?.info('Fate queue coming soon!', 'Queue');
        },
        onPoke: () => {
            console.log('[PetitGrimoire] Poke from tama');
            toastr?.info('"...Was that supposed to be affectionate?"', 'Nyx');
        },
    });
}

// ============================================
// SETTINGS PANEL
// ============================================

async function addExtensionSettings() {
    const themes = [
        { value: 'guardian',    label: '✦ Guardian (Star Prism)' },
        { value: 'umbra',       label: '◆ Umbra (Grief Seeds)' },
        { value: 'apothecary',  label: '❀ Apothecary (Botanicals)' },
        { value: 'moonstone',   label: '☽ Moonstone (Crystals)' },
        { value: 'phosphor',    label: '△ Phosphor (Neon)' },
        { value: 'rosewood',    label: '❀ Rosewood (Floral)' },
        { value: 'celestial',   label: '✴ Celestial (Starbound)' },
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
                <h5>Compact Brooch</h5>

                <label for="mg-theme">Color Theme:</label>
                <select id="mg-theme" class="text_pole">
                    ${themeOptions}
                </select>

                <label class="checkbox_label">
                    <input type="checkbox" id="mg-show-compact" ${extensionSettings.showCompact !== false ? 'checked' : ''}>
                    <span>Show Compact</span>
                </label>

                <hr>
                <h5>Nyx-gotchi</h5>

                <label for="mg-familiar">Familiar Form:</label>
                <select id="mg-familiar" class="text_pole">
                    <option value="cat" ${extensionSettings.familiarForm === 'cat' ? 'selected' : ''}>Cat</option>
                </select>

                <label class="checkbox_label">
                    <input type="checkbox" id="mg-show-tama" ${extensionSettings.showTama !== false ? 'checked' : ''}>
                    <span>Show Nyx-gotchi</span>
                </label>

                <hr>

                <div class="flex-container">
                    <input type="button" id="mg-reset-positions" class="menu_button" value="Reset All">
                </div>
            </div>
        </div>
    `;

    $('#extensions_settings2').append(html);

    // Event handlers
    $('#mg-enabled').on('change', function () {
        extensionSettings.enabled = $(this).prop('checked');
        saveSettings();

        if (extensionSettings.enabled) {
            initGrimoire();
            initTama();
        } else {
            closeGrimoire();
            $('#mg-compact').remove();
            $('#nyxgotchi').remove();
            $('#mg-grimoire').remove();
            $('#mg-grimoire-overlay').remove();
            stopSpriteAnimation();
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

    $('#mg-show-tama').on('change', function () {
        extensionSettings.showTama = $(this).prop('checked');
        saveSettings();
        $('#nyxgotchi').toggle(extensionSettings.showTama);
    });

    $('#mg-reset-positions').on('click', function () {
        // Re-init everything
        $('#mg-compact').remove();
        $('#mg-grimoire').remove();
        $('#mg-grimoire-overlay').remove();
        $('#nyxgotchi').remove();
        
        initGrimoire();
        initTama();
        
        toastr?.info('Reset complete!');
    });
}

// ============================================
// INITIALIZATION
// ============================================

jQuery(async () => {
    try {
        console.log(`[${extensionName}] Starting...`);

        loadCSS();
        loadSettings();

        await addExtensionSettings();

        if (extensionSettings.enabled) {
            console.log(`[${extensionName}] Enabled, initializing UI...`);
            initGrimoire();
            initTama();
        }

        console.log(`[${extensionName}] ✅ Ready`);

    } catch (error) {
        console.error(`[${extensionName}] ❌ Failed:`, error);
        toastr?.error('Petit Grimoire failed: ' + error.message, 'Error', { timeOut: 10000 });
    }
});

// Debug exports
window.PetitGrimoire = {
    getSettings: () => extensionSettings,
    setTheme,
    updateCompactBadge,
};
