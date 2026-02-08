/**
 * Petit Grimoire - Tab System Dispatcher
 * Routes tab content/init/cleanup to individual modules
 */

// Tab modules
import * as settingsTab from './settings.js';
import * as placeholderTab from './placeholder.js';
import * as crystalBallTab from './crystalBall.js';  // <-- ADDED

// Future tab imports (uncomment as built)
// import * as tarotTab from './tarot.js';
// import * as ouijaTab from './ouija.js';
// import * as nyxTab from './nyx.js';
// import * as spellsTab from './spells.js';

/**
 * Tab module registry
 * Each module should export:
 *   - getContent(theme) → HTML string
 *   - init() → setup event listeners
 *   - cleanup() → optional teardown
 */
const TAB_MODULES = {
    tarot: placeholderTab,      // TODO: tarotTab
    crystal: crystalBallTab,    // <-- CHANGED from placeholderTab
    ouija: placeholderTab,      // TODO: ouijaTab
    nyx: placeholderTab,        // TODO: nyxTab
    spells: placeholderTab,     // TODO: spellsTab
    settings: settingsTab
};

/**
 * Get the content HTML for a tab
 * @param {string} tabId - Tab identifier
 * @returns {string} HTML content
 */
export function getTabContent(tabId) {
    const module = TAB_MODULES[tabId];
    if (module && typeof module.getContent === 'function') {
        return module.getContent();
    }
    console.warn(`[PG Tabs] No module found for tab: ${tabId}`);
    return placeholderTab.getContent(tabId);
}

/**
 * Initialize a tab (setup event listeners, etc.)
 * Called when switching to a tab
 * @param {string} tabId - Tab identifier
 */
export function initTab(tabId) {
    const module = TAB_MODULES[tabId];
    if (module && typeof module.init === 'function') {
        module.init();
    }
}

/**
 * Cleanup a tab (teardown listeners, etc.)
 * Called when switching away from a tab
 * @param {string} tabId - Tab identifier
 */
export function cleanupTab(tabId) {
    const module = TAB_MODULES[tabId];
    if (module && typeof module.cleanup === 'function') {
        module.cleanup();
    }
}

/**
 * Check if a tab has real content (not placeholder)
 * @param {string} tabId - Tab identifier
 * @returns {boolean}
 */
export function isTabImplemented(tabId) {
    return TAB_MODULES[tabId] !== placeholderTab;
}
