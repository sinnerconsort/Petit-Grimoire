/**
 * Petit Grimoire — Shared State
 * Settings management, constants, mutable state
 */

import { getContext } from '../../../../extensions.js';
import { saveSettingsDebounced } from '../../../../../script.js';

// ============================================
// CONSTANTS
// ============================================

export const extensionName = 'petit-grimoire';
export const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;

// ============================================
// DEFAULT SETTINGS
// ============================================

export const defaultSettings = {
    enabled: true,

    // Theme & appearance
    shellTheme: 'guardian',
    familiarForm: 'cat',

    // Independent sizes
    compactSize: 'medium',
    tamaSize: 'medium',

    // Independent positions
    compactPosition: {},
    tamaPosition: {},

    // Visibility toggles
    showCompact: true,
    showTama: true,

    // Nyx state
    nyx: {
        disposition: 50,
        interestLevel: 'medium',
        lastShiftReason: null,
        totalCardsDrawn: 0,
        totalTriggered: 0,
        totalExpired: 0
    },

    // Feature toggles
    features: {
        particleEffects: true,
        soundEffects: true,
        screenFlash: true,
        nyxUnsolicited: true
    }
};

// ============================================
// MUTABLE STATE
// ============================================

/** @type {Object} Current extension settings (mutated in place) */
export let extensionSettings = {};

/** Per-FAB drag tracking */
export const dragState = {
    compact: { active: false, moved: false, offset: { x: 0, y: 0 } },
    tama: { active: false, moved: false, offset: { x: 0, y: 0 } }
};

/** Sprite animation */
export let spriteInterval = null;
export let currentSpriteFrame = 0;

/** Grimoire panel */
export let grimoireOpen = false;

/** Speech bubble */
export let speechTimeout = null;

// ---- Mutable state setters ----

export function setSpriteInterval(val) { spriteInterval = val; }
export function setCurrentSpriteFrame(val) { currentSpriteFrame = val; }
export function setGrimoireOpen(val) { grimoireOpen = val; }
export function setSpeechTimeout(val) { speechTimeout = val; }

// ============================================
// SETTINGS MANAGEMENT
// ============================================

export function loadSettings() {
    const context = getContext();

    if (!context.extensionSettings[extensionName]) {
        context.extensionSettings[extensionName] = {};
    }

    // Shallow merge + reassign the module-level binding
    extensionSettings = {
        ...defaultSettings,
        ...context.extensionSettings[extensionName]
    };

    // Deep merge nested objects
    extensionSettings.nyx = { ...defaultSettings.nyx, ...extensionSettings.nyx };
    extensionSettings.features = { ...defaultSettings.features, ...extensionSettings.features };
    extensionSettings.compactPosition = extensionSettings.compactPosition || {};
    extensionSettings.tamaPosition = extensionSettings.tamaPosition || {};

    // Migrate old theme names → new 7-deck system
    const themeMigration = {
        'sailor-moon': 'guardian',
        'madoka': 'umbra',
        'witch-core': 'apothecary',
        'pastel-goth': 'moonstone',
        'y2k': 'phosphor',
        'classic': 'rosewood'
    };
    if (themeMigration[extensionSettings.shellTheme]) {
        extensionSettings.shellTheme = themeMigration[extensionSettings.shellTheme];
    }

    // Migrate old nyxPosition if present
    if (extensionSettings.nyxPosition && !context.extensionSettings[extensionName].compactPosition) {
        extensionSettings.compactPosition = extensionSettings.nyxPosition;
    }
}

export function saveSettings() {
    const context = getContext();
    context.extensionSettings[extensionName] = extensionSettings;
    saveSettingsDebounced();
}
