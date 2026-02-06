/**
 * Petit Grimoire — Nyx Time Awareness
 * Time period detection, witching hour modifiers, session tracking
 */

// ============================================
// TIME PERIODS
// ============================================

export const TIME_PERIODS = {
    DAWN: { start: 5, end: 7, label: 'Dawn', mood: 'liminal', luckMod: 0 },
    MORNING: { start: 7, end: 12, label: 'Morning', mood: 'bright', luckMod: 5 },
    AFTERNOON: { start: 12, end: 17, label: 'Afternoon', mood: 'neutral', luckMod: 0 },
    EVENING: { start: 17, end: 21, label: 'Evening', mood: 'settling', luckMod: -5 },
    NIGHT: { start: 21, end: 24, label: 'Night', mood: 'dark', luckMod: -10 },
    WITCHING: { start: 0, end: 4, label: 'Witching Hour', mood: 'ominous', luckMod: -15 },
    PRE_DAWN: { start: 4, end: 5, label: 'Pre-Dawn', mood: 'liminal', luckMod: -5 },
};

// ============================================
// PERIOD DETECTION
// ============================================

/**
 * Get the current time period based on hour
 * @returns {object} Period object with label, mood, luckMod
 */
export function getCurrentTimePeriod() {
    const hour = new Date().getHours();
    
    for (const [key, period] of Object.entries(TIME_PERIODS)) {
        if (period.start <= period.end) {
            // Normal range (e.g., 7-12)
            if (hour >= period.start && hour < period.end) {
                return { key, ...period };
            }
        } else {
            // Wraps midnight (e.g., 21-24, 0-4) - handled by separate entries
            if (hour >= period.start || hour < period.end) {
                return { key, ...period };
            }
        }
    }
    
    // Fallback
    return { key: 'AFTERNOON', ...TIME_PERIODS.AFTERNOON };
}

/**
 * Check if it's currently the witching hour (midnight-4am)
 * @returns {boolean}
 */
export function isWitchingHour() {
    const hour = new Date().getHours();
    return hour >= 0 && hour < 4;
}

/**
 * Get luck modifier based on current time
 * Witching hours are unlucky, morning is lucky
 * @returns {number} Modifier to add to luck calculations
 */
export function getTimeLuckModifier() {
    const period = getCurrentTimePeriod();
    return period.luckMod || 0;
}

// ============================================
// TIME FORMATTING
// ============================================

/**
 * Get current hour (0-23)
 * @returns {number}
 */
export function getHour() {
    return new Date().getHours();
}

/**
 * Get a descriptive time string for prompts
 * @returns {string} e.g., "Night (11:00)"
 */
export function getTimeDescription() {
    const period = getCurrentTimePeriod();
    const hour = new Date().getHours();
    const minute = new Date().getMinutes();
    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    return `${period.label} (${timeStr})`;
}

/**
 * Format a duration in milliseconds to human-readable
 * @param {number} ms - Duration in milliseconds
 * @returns {string} e.g., "5 minutes", "2 hours"
 */
export function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days !== 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''}`;
    if (minutes > 0) return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
}

// ============================================
// SESSION TRACKING
// ============================================

const SESSION_KEY = 'petit_grimoire_session';

/**
 * Save current session state to localStorage
 * @param {object} state - Session state to save
 */
export function saveSessionState(state) {
    try {
        localStorage.setItem(SESSION_KEY, JSON.stringify({
            ...state,
            savedAt: Date.now()
        }));
    } catch (err) {
        console.warn('[Nyx] Failed to save session state:', err);
    }
}

/**
 * Load previous session state from localStorage
 * @returns {object|null} Previous session state or null
 */
export function loadSessionState() {
    try {
        const saved = localStorage.getItem(SESSION_KEY);
        if (!saved) return null;
        
        const data = JSON.parse(saved);
        
        // Consider session expired after 24 hours
        const timeSinceSave = Date.now() - data.savedAt;
        if (timeSinceSave > 24 * 60 * 60 * 1000) {
            localStorage.removeItem(SESSION_KEY);
            return null;
        }
        
        return data;
    } catch (err) {
        console.warn('[Nyx] Failed to load session state:', err);
        return null;
    }
}

/**
 * Calculate how long the user was away
 * @returns {object|null} Absence info or null if not applicable
 */
export function calculateAbsence() {
    const saved = loadSessionState();
    if (!saved || !saved.lastActivityTime) return null;
    
    const absenceMs = Date.now() - saved.lastActivityTime;
    
    // Only count absences over 5 minutes
    if (absenceMs < 5 * 60 * 1000) return null;
    
    return {
        milliseconds: absenceMs,
        minutes: Math.floor(absenceMs / (1000 * 60)),
        hours: Math.floor(absenceMs / (1000 * 60 * 60)),
        days: Math.floor(absenceMs / (1000 * 60 * 60 * 24)),
        formatted: formatDuration(absenceMs)
    };
}

// ============================================
// PERIOD TRANSITION DETECTION
// ============================================

let lastPeriodKey = null;
let periodCheckInterval = null;

/**
 * Start monitoring for time period changes
 * @param {function} onTransition - Callback when period changes
 */
export function startPeriodMonitoring(onTransition) {
    lastPeriodKey = getCurrentTimePeriod().key;
    
    // Check every minute
    periodCheckInterval = setInterval(() => {
        const current = getCurrentTimePeriod();
        if (current.key !== lastPeriodKey) {
            const oldPeriod = TIME_PERIODS[lastPeriodKey];
            onTransition({
                from: { key: lastPeriodKey, ...oldPeriod },
                to: current
            });
            lastPeriodKey = current.key;
        }
    }, 60 * 1000);
}

/**
 * Stop period monitoring
 */
export function stopPeriodMonitoring() {
    if (periodCheckInterval) {
        clearInterval(periodCheckInterval);
        periodCheckInterval = null;
    }
}
