/**
 * Petit Grimoire - State Management
 * Global settings and per-chat data persistence
 */

import { getContext } from '../../../../../extensions.js';
import { saveSettingsDebounced } from '../../../../../../script.js';
import { extensionName, DEFAULT_SETTINGS } from './config.js';

/**
 * Extension settings (global, persisted)
 */
export let settings = { ...DEFAULT_SETTINGS };

/**
 * Load settings from SillyTavern
 */
export function loadSettings() {
    try {
        const ctx = getContext();
        const saved = ctx.extensionSettings?.[extensionName];
        if (saved) {
            // Merge saved with defaults (handles new settings)
            settings = { ...DEFAULT_SETTINGS, ...saved };
        }
    } catch (e) {
        console.error('[PG] Failed to load settings:', e);
    }
}

/**
 * Save settings to SillyTavern
 */
export function saveSettings() {
    try {
        const ctx = getContext();
        if (!ctx.extensionSettings) ctx.extensionSettings = {};
        ctx.extensionSettings[extensionName] = settings;
        saveSettingsDebounced();
    } catch (e) {
        console.error('[PG] Failed to save settings:', e);
    }
}

/**
 * Update a single setting
 */
export function updateSetting(key, value) {
    settings[key] = value;
    saveSettings();
}

/**
 * Update multiple settings at once
 */
export function updateSettings(updates) {
    Object.assign(settings, updates);
    saveSettings();
}

/**
 * Get current theme name
 */
export function getCurrentTheme() {
    return settings.theme || 'guardian';
}

/**
 * Set theme and save
 */
export function setTheme(themeName) {
    settings.theme = themeName;
    saveSettings();
}

/**
 * Get FAB position (with defaults)
 */
export function getFabPosition() {
    const defaultX = window.innerWidth - 70;
    const defaultY = window.innerHeight - 140;
    return {
        x: settings.fabPosition?.x ?? defaultX,
        y: settings.fabPosition?.y ?? defaultY
    };
}

/**
 * Save FAB position
 */
export function saveFabPosition(x, y) {
    settings.fabPosition = { x, y };
    saveSettings();
}
