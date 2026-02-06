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

    // Nyx state & voice settings
    nyx: {
        // Disposition (0-100)
        disposition: 50,
        interestLevel: 'medium',
        lastShiftReason: null,
        
        // Stats
        totalCardsDrawn: 0,
        totalTriggered: 0,
        totalExpired: 0,
        
        // Voice settings
        generativeVoice: false,       // Use API for Nyx's voice (vs templates)
        connectionProfile: 'current', // Which connection profile for Nyx
        idleComments: true,           // Allow unprompted Nyx commentary
        idleFrequency: 'medium',      // low/medium/high
        
        // Unlocked sprites
        unlockedSprites: ['default'], // Forms Nyx can take
        currentSprite: 'default',
    },

    // Knucklebones game settings
    knucklebones: {
        // Stats
        gamesPlayed: 0,
        gamesWon: 0,           // Player wins
        currentStreak: 0,      // Player's current win streak
        bestStreak: 0,         // Player's best win streak
        stakedWins: 0,         // Wins with stakes on the line
        
        // Fortune effects
        fortuneFavor: 0,       // +1 good luck, -1 bad luck, 0 neutral
        
        // Settings
        nyxCanChallenge: true, // Nyx can initiate challenges
        challengeCooldown: 15, // Minutes between Nyx challenges
        lastChallenge: null,   // Timestamp
        
        // Unlocks
        unlocks: [],           // Array of unlock IDs earned
        
        // Dice style preference
        diceStyle: 'theme',    // 'theme' (match current) or specific unlock
    },

    // Feature toggles
    features: {
        particleEffects: true,
        soundEffects: true,
        screenFlash: true,
        nyxUnsolicited: true,
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

/** Active knucklebones game (null when not playing) */
export let activeKnucklebonesGame = null;

// ---- Mutable state setters ----

export function setSpriteInterval(val) { spriteInterval = val; }
export function setCurrentSpriteFrame(val) { currentSpriteFrame = val; }
export function setGrimoireOpen(val) { grimoireOpen = val; }
export function setSpeechTimeout(val) { speechTimeout = val; }
export function setActiveKnucklebonesGame(val) { activeKnucklebonesGame = val; }

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
    extensionSettings.knucklebones = { ...defaultSettings.knucklebones, ...extensionSettings.knucklebones };
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
    
    // Ensure unlocks array exists
    if (!Array.isArray(extensionSettings.knucklebones.unlocks)) {
        extensionSettings.knucklebones.unlocks = [];
    }
    if (!Array.isArray(extensionSettings.nyx.unlockedSprites)) {
        extensionSettings.nyx.unlockedSprites = ['default'];
    }
}

export function saveSettings() {
    const context = getContext();
    context.extensionSettings[extensionName] = extensionSettings;
    saveSettingsDebounced();
}

// ============================================
// NYX DISPOSITION HELPERS
// ============================================

/**
 * Shift Nyx's disposition by a delta amount
 * @param {number} delta - Amount to shift (positive = happier)
 * @param {string} reason - Why the shift happened
 */
export function shiftDisposition(delta, reason = null) {
    const oldDisposition = extensionSettings.nyx.disposition;
    extensionSettings.nyx.disposition = Math.max(0, Math.min(100, oldDisposition + delta));
    extensionSettings.nyx.lastShiftReason = reason;
    
    // Update interest level based on new disposition
    extensionSettings.nyx.interestLevel = getInterestLevel(extensionSettings.nyx.disposition);
    
    saveSettings();
    
    return {
        old: oldDisposition,
        new: extensionSettings.nyx.disposition,
        delta,
        reason
    };
}

/**
 * Get interest level from disposition score
 */
function getInterestLevel(disposition) {
    if (disposition >= 80) return 'delighted';
    if (disposition >= 60) return 'amused';
    if (disposition >= 40) return 'neutral';
    if (disposition >= 20) return 'bored';
    return 'annoyed';
}

/**
 * Get reversal chance for tarot based on disposition
 * Lower disposition = higher reversal chance
 */
export function getReversalChance() {
    const disposition = extensionSettings.nyx.disposition;
    // disposition 0   → 70% reversal
    // disposition 50  → 50% reversal  
    // disposition 100 → 30% reversal
    const baseChance = 50;
    const maxSwing = 20;
    const modifier = ((50 - disposition) / 50) * maxSwing;
    return Math.round(baseChance + modifier);
}

// ============================================
// KNUCKLEBONES HELPERS
// ============================================

/**
 * Record a knucklebones game result
 * @param {boolean} playerWon - Did the player win?
 * @param {boolean} hadStakes - Were there stakes on the game?
 */
export function recordKnucklebonesGame(playerWon, hadStakes = false) {
    const kb = extensionSettings.knucklebones;
    
    kb.gamesPlayed++;
    
    if (playerWon) {
        kb.gamesWon++;
        kb.currentStreak++;
        if (kb.currentStreak > kb.bestStreak) {
            kb.bestStreak = kb.currentStreak;
        }
        if (hadStakes) {
            kb.stakedWins++;
        }
    } else {
        kb.currentStreak = 0;
    }
    
    saveSettings();
    
    return {
        gamesPlayed: kb.gamesPlayed,
        gamesWon: kb.gamesWon,
        currentStreak: kb.currentStreak,
        bestStreak: kb.bestStreak,
    };
}

/**
 * Add an unlock
 * @param {string} unlockId - ID of the unlock
 * @returns {boolean} True if newly unlocked, false if already had
 */
export function addUnlock(unlockId) {
    if (extensionSettings.knucklebones.unlocks.includes(unlockId)) {
        return false;
    }
    extensionSettings.knucklebones.unlocks.push(unlockId);
    saveSettings();
    return true;
}

/**
 * Check if an unlock is earned
 * @param {string} unlockId - ID to check
 */
export function hasUnlock(unlockId) {
    return extensionSettings.knucklebones.unlocks.includes(unlockId);
}

/**
 * Set fortune favor (luck modifier from knucklebones bets)
 * @param {number} favor - -1, 0, or +1
 */
export function setFortuneFavor(favor) {
    extensionSettings.knucklebones.fortuneFavor = Math.max(-1, Math.min(1, favor));
    saveSettings();
}
