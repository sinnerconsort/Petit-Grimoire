/**
 * Petit Grimoire - Minimal Test Version
 */

import {
    extensionName, extensionFolderPath, extensionSettings, defaultSettings,
    loadSettings, saveSettings,
    setCurrentSpriteFrame
} from './src/state.js';

import { createCompact } from './src/compact.js';

import {
    createTama, stopSpriteAnimation,
    showSpeech, updateNyxMood,
    updateSpriteDisplay,
    playSpecialAnimation
} from './src/nyxgotchi.js';

import {
    triggerTransformation, openGrimoire, closeGrimoire,
    onDrawCard, onViewQueue, onPokeNyx
} from './src/grimoire.js';

function loadCSS() {
    if (document.getElementById('petit-grimoire-styles')) return;
    const link = document.createElement('link');
    link.id = 'petit-grimoire-styles';
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = `${extensionFolderPath}/styles/main.css`;
    document.head.appendChild(link);
}

function setTheme(themeName) {
    extensionSettings.shellTheme = themeName;
    $('#mg-compact').attr('data-mg-theme', themeName);
    $('#nyxgotchi').attr('data-mg-theme', themeName);
    $('#mg-grimoire').attr('data-mg-theme', themeName);
    saveSettings();
}

function initCompact() {
    createCompact(() => triggerTransformation());
}

function initTama() {
    createTama({
        onDraw: onDrawCard,
        onQueue: onViewQueue,
        onPoke: onPokeNyx,
    });
}

async function addExtensionSettings() {
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
                <label for="mg-theme">Theme:</label>
                <select id="mg-theme" class="text_pole">
                    <option value="guardian" ${extensionSettings.shellTheme === 'guardian' ? 'selected' : ''}>Guardian</option>
                    <option value="umbra" ${extensionSettings.shellTheme === 'umbra' ? 'selected' : ''}>Umbra</option>
                    <option value="moonstone" ${extensionSettings.shellTheme === 'moonstone' ? 'selected' : ''}>Moonstone</option>
                </select>
                <hr>
                <input type="button" id="mg-reset-positions" class="menu_button" value="Reset Positions">
            </div>
        </div>
    `;
    $('#extensions_settings2').append(html);

    $('#mg-enabled').on('change', function () {
        extensionSettings.enabled = $(this).prop('checked');
        saveSettings();
        if (extensionSettings.enabled) {
            initCompact();
            initTama();
        } else {
            $('#mg-compact').remove();
            $('#nyxgotchi').remove();
            stopSpriteAnimation();
        }
    });

    $('#mg-theme').on('change', function () {
        setTheme($(this).val());
    });

    $('#mg-reset-positions').on('click', function () {
        extensionSettings.compactPosition = {};
        extensionSettings.tamaPosition = {};
        saveSettings();
        initCompact();
        initTama();
    });
}

jQuery(async () => {
    try {
        console.log(`[${extensionName}] Starting...`);
        loadCSS();
        loadSettings();
        await addExtensionSettings();
        if (extensionSettings.enabled) {
            initCompact();
            initTama();
        }
        console.log(`[${extensionName}] ✅ Loaded`);
    } catch (error) {
        console.error(`[${extensionName}] ❌ Failed:`, error);
    }
});

window.PetitGrimoire = { getSettings: () => extensionSettings };
