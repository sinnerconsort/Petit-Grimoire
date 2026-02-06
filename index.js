/**
 * Petit Grimoire - Magical Girl Fortune Extension
 * Entry point: settings panel + initialization
 *
 * Architecture: Two independent FABs
 *   - Compact Brooch (main FAB → opens Grimoire)
 *   - Nyx-gotchi (pet widget, independent)
 *
 * Modules:
 *   src/state.js      — shared state, settings load/save
 *   src/drag.js       — FAB drag system + position helpers
 *   src/compact.js    — Crystal Star Brooch
 *   src/nyxgotchi.js  — Tama widget, sprites, speech, mood
 *   src/grimoire.js   — Tome panel + all tab subsystems
 *   src/nyx/          — Voice system (generative + templates)
 */

import {
    extensionName, extensionFolderPath, extensionSettings, defaultSettings,
    loadSettings, saveSettings,
    setCurrentSpriteFrame
} from './src/state.js';

import { createCompact } from './src/compact.js';

import {
    createTama, destroyTama, stopSpriteAnimation,
    showSpeech, updateNyxMood,
    updateSpriteDisplay,
    playSpecialAnimation,
    nyxSay
} from './src/nyxgotchi.js';

import {
    triggerTransformation, openGrimoire, closeGrimoire,
    onDrawCard, onViewQueue
} from './src/grimoire.js';

// Nyx voice system
import { 
    nyxSpeak, 
    isGenerativeMode, 
    getConnectionStatus,
    populateProfileDropdown 
} from './src/nyx/index.js';

// ============================================
// CSS LOADING
// ============================================

function loadCSS() {
    // Only load once
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
// THEME & VARIANT SWITCHING
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
// KNUCKLEBONES (placeholder)
// ============================================

function onKnucklebonesChallenge() {
    // TODO: Open knucklebones modal
    console.log(`[${extensionName}] Knucklebones challenge triggered!`);
    showSpeech("Knucklebones? ...Coming soon.", 3000);
}

// ============================================
// CREATION HELPERS (wire callbacks)
// ============================================

function initCompact() {
    createCompact(() => triggerTransformation());
}

function initTama() {
    createTama({
        onDraw: onDrawCard,
        onQueue: onViewQueue,
        onPoke: () => {}, // Handled internally by nyxgotchi now
        onKnucklebones: onKnucklebonesChallenge, // Long-press poke
    });
}

// ============================================
// SETTINGS PANEL
// ============================================

async function addExtensionSettings() {
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
                <h5>Compact Brooch</h5>

                <label for="mg-theme">Color Theme:</label>
                <select id="mg-theme" class="text_pole">
                    ${themeOptions}
                </select>

                <label for="mg-compact-size">Compact Size:</label>
                <select id="mg-compact-size" class="text_pole">
                    <option value="small" ${extensionSettings.compactSize === 'small' ? 'selected' : ''}>Small</option>
                    <option value="medium" ${extensionSettings.compactSize === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="large" ${extensionSettings.compactSize === 'large' ? 'selected' : ''}>Large</option>
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
                    <option value="owl" ${extensionSettings.familiarForm === 'owl' ? 'selected' : ''}>Owl</option>
                    <option value="fox" ${extensionSettings.familiarForm === 'fox' ? 'selected' : ''}>Fox</option>
                    <option value="bunny" ${extensionSettings.familiarForm === 'bunny' ? 'selected' : ''}>Bunny</option>
                </select>

                <label for="mg-tama-size">Tama Size:</label>
                <select id="mg-tama-size" class="text_pole">
                    <option value="small" ${extensionSettings.tamaSize === 'small' ? 'selected' : ''}>Small</option>
                    <option value="medium" ${extensionSettings.tamaSize === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="large" ${extensionSettings.tamaSize === 'large' ? 'selected' : ''}>Large</option>
                </select>

                <label class="checkbox_label">
                    <input type="checkbox" id="mg-show-tama" ${extensionSettings.showTama !== false ? 'checked' : ''}>
                    <span>Show Nyx-gotchi</span>
                </label>

                <hr>
                <h5>Nyx Voice</h5>

                <label class="checkbox_label">
                    <input type="checkbox" id="mg-nyx-generative" ${extensionSettings.nyx.generativeVoice ? 'checked' : ''}>
                    <span>Use Generative Voice (API)</span>
                </label>

                <label for="mg-nyx-profile">Connection Profile:</label>
                <select id="mg-nyx-profile" class="text_pole">
                    <option value="current">Use Current Connection</option>
                </select>
                <small id="mg-nyx-connection-status" style="opacity: 0.7; display: block; margin-top: 4px;"></small>

                <label class="checkbox_label">
                    <input type="checkbox" id="mg-nyx-idle" ${extensionSettings.nyx.idleComments !== false ? 'checked' : ''}>
                    <span>Nyx Speaks Unprompted</span>
                </label>

                <label for="mg-nyx-idle-freq">Idle Frequency:</label>
                <select id="mg-nyx-idle-freq" class="text_pole">
                    <option value="low" ${extensionSettings.nyx.idleFrequency === 'low' ? 'selected' : ''}>Low (8-15 min)</option>
                    <option value="medium" ${extensionSettings.nyx.idleFrequency === 'medium' ? 'selected' : ''}>Medium (4-8 min)</option>
                    <option value="high" ${extensionSettings.nyx.idleFrequency === 'high' ? 'selected' : ''}>High (2-5 min)</option>
                </select>

                <hr>

                <div class="flex-container">
                    <span>Nyx Disposition: </span>
                    <span id="mg-disposition-display">${extensionSettings.nyx.disposition}</span>
                </div>

                <hr>

                <div class="flex-container">
                    <input type="button" id="mg-reset-positions" class="menu_button" value="Reset Positions">
                </div>
            </div>
        </div>
    `;

    $('#extensions_settings2').append(html);

    // Populate connection profile dropdown
    populateProfileDropdown('#mg-nyx-profile', extensionSettings.nyx.connectionProfile);
    updateConnectionStatus();

    // ---- Event handlers ----

    $('#mg-enabled').on('change', function () {
        extensionSettings.enabled = $(this).prop('checked');
        saveSettings();

        if (extensionSettings.enabled) {
            initCompact();
            initTama();
        } else {
            $('#mg-compact').remove();
            destroyTama();
        }
    });

    $('#mg-theme').on('change', function () {
        setTheme($(this).val());
    });

    $('#mg-compact-size').on('change', function () {
        setCompactSize($(this).val());
    });

    $('#mg-familiar').on('change', function () {
        setFamiliarForm($(this).val());
    });

    $('#mg-tama-size').on('change', function () {
        setTamaSize($(this).val());
    });

    $('#mg-show-compact').on('change', function () {
        extensionSettings.showCompact = $(this).prop('checked');
        saveSettings();
        const el = document.getElementById('mg-compact');
        if (el) {
            el.style.setProperty('display', extensionSettings.showCompact ? 'flex' : 'none', 'important');
        }
    });

    $('#mg-show-tama').on('change', function () {
        extensionSettings.showTama = $(this).prop('checked');
        saveSettings();
        const el = document.getElementById('nyxgotchi');
        if (el) {
            el.style.setProperty('display', extensionSettings.showTama ? 'flex' : 'none', 'important');
        }
    });

    // Nyx voice settings
    $('#mg-nyx-generative').on('change', function () {
        extensionSettings.nyx.generativeVoice = $(this).prop('checked');
        saveSettings();
        updateConnectionStatus();
    });

    $('#mg-nyx-profile').on('change', function () {
        extensionSettings.nyx.connectionProfile = $(this).val();
        saveSettings();
        updateConnectionStatus();
    });

    $('#mg-nyx-idle').on('change', function () {
        extensionSettings.nyx.idleComments = $(this).prop('checked');
        saveSettings();
    });

    $('#mg-nyx-idle-freq').on('change', function () {
        extensionSettings.nyx.idleFrequency = $(this).val();
        saveSettings();
    });

    $('#mg-reset-positions').on('click', function () {
        extensionSettings.compactPosition = { ...defaultSettings.compactPosition };
        extensionSettings.tamaPosition = { ...defaultSettings.tamaPosition };
        saveSettings();

        initCompact();
        initTama();

        if (typeof toastr !== 'undefined') {
            toastr.info('Positions reset!');
        }
    });
}

function updateConnectionStatus() {
    const status = getConnectionStatus();
    const $status = $('#mg-nyx-connection-status');
    
    if (extensionSettings.nyx.generativeVoice) {
        if (status.available) {
            $status.text(`✓ ${status.profileName} ready`).css('color', '#4a4');
        } else {
            $status.text(`✗ ${status.status}`).css('color', '#a44');
        }
    } else {
        $status.text('Using template responses').css('color', '');
    }
}

// ============================================
// INITIALIZATION
// ============================================

jQuery(async () => {
    try {
        console.log(`[${extensionName}] Starting initialization...`);

        // Load CSS first!
        loadCSS();

        loadSettings();

        await addExtensionSettings();

        if (extensionSettings.enabled) {
            initCompact();
            initTama();
        }

        console.log(`[${extensionName}] ✅ Loaded successfully`);
        console.log(`[${extensionName}] Voice mode: ${isGenerativeMode() ? 'Generative' : 'Templates'}`);

    } catch (error) {
        console.error(`[${extensionName}] ❌ Critical failure:`, error);
        if (typeof toastr !== 'undefined') {
            toastr.error('Petit Grimoire failed to initialize.', 'Error', { timeOut: 10000 });
        }
    }
});

// ============================================
// EXPORTS (for debugging)
// ============================================

window.PetitGrimoire = {
    getSettings: () => extensionSettings,
    setTheme,
    setFamiliarForm,
    setCompactSize,
    setTamaSize,
    showSpeech,
    updateNyxMood,
    playSpecialAnimation,
    triggerTransformation,
    openGrimoire,
    closeGrimoire,
    // Nyx voice system
    nyxSpeak,
    nyxSay,
    isGenerativeMode,
    getConnectionStatus,
};
