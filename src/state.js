/**
 * Petit Grimoire — State Management
 * Single source of truth for extension settings.
 */

import { getContext } from '../../../extensions.js';
import { saveSettingsDebounced } from '../../../../script.js';

// ══════════════════════════════════════════════
// EXTENSION IDENTITY
// ══════════════════════════════════════════════

export const extensionName = 'third-party/Petit-Grimoire';
export const extensionFolderPath = `scripts/extensions/${extensionName}`;

// ══════════════════════════════════════════════
// DEFAULT SETTINGS
// ══════════════════════════════════════════════

export const defaultSettings = {
    enabled: true,
    shellTheme: 'guardian',
    showCompact: true,
};

// ══════════════════════════════════════════════
// LIVE SETTINGS (mutable reference)
// ══════════════════════════════════════════════

export let extensionSettings = { ...defaultSettings };

// ══════════════════════════════════════════════
// LOAD / SAVE
// ══════════════════════════════════════════════

export function loadSettings() {
    try {
        const context = getContext();
        const saved = context.extensionSettings?.[extensionName];
        if (saved && typeof saved === 'object') {
            extensionSettings = { ...defaultSettings, ...saved };
        }
        console.log('[PetitGrimoire] Settings loaded:', extensionSettings.shellTheme);
    } catch (err) {
        console.error('[PetitGrimoire] Settings load failed:', err);
    }
}

export function saveSettings() {
    try {
        const context = getContext();
        if (!context.extensionSettings) return;
        context.extensionSettings[extensionName] = { ...extensionSettings };
        saveSettingsDebounced();
    } catch (err) {
        console.error('[PetitGrimoire] Settings save failed:', err);
    }
}
