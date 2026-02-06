/**
 * Petit Grimoire — Nyx Module Index
 * Central export for all Nyx voice/personality systems
 */

// Core voice system
export { nyxSpeak, nyxQuip, isGenerativeMode } from './voice.js';

// Connection management
export { 
    isConnectionAvailable, 
    isServiceAvailable,
    getAvailableProfiles,
    getConnectionStatus,
    populateProfileDropdown 
} from './connection.js';

// Time awareness
export { 
    getCurrentTimePeriod, 
    isWitchingHour, 
    getTimeLuckModifier,
    getTimeDescription,
    formatDuration,
    calculateAbsence 
} from './time.js';

// Idle system
export { 
    initIdleSystem, 
    cleanupIdleSystem,
    handlePoke,
    handleTreat,
    handleTease,
    getIdleStats,
    resetSessionCounts
} from './idle.js';

// Templates (for direct access if needed)
export { getTemplateFallback } from './templates.js';

// Personality (for reference/debugging)
export { NYX_CORE, MOOD_MODIFIERS, TIME_MODIFIERS } from './personality.js';

// Contexts (for reference/debugging)
export { getKnownSituations } from './contexts.js';
