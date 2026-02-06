/**
 * Petit Grimoire — Nyx Idle System
 * Activity tracking, unprompted commentary, session awareness
 */

import { debounce } from '../../../../utils.js';
import { extensionSettings } from '../state.js';
import { nyxSpeak } from './voice.js';
import { 
    saveSessionState, 
    loadSessionState, 
    calculateAbsence,
    getCurrentTimePeriod,
    startPeriodMonitoring,
    stopPeriodMonitoring 
} from './time.js';

// ============================================
// STATE
// ============================================

let idleTimer = null;
let lastActivityTime = Date.now();
let idleCommentCount = 0;
let sessionPokeCount = 0;
let isInitialized = false;

// Callback to display speech (set by nyxgotchi)
let showSpeechCallback = null;

// Constants
const MAX_IDLE_COMMENTS = 3;
const IDLE_FREQUENCY = {
    low: { min: 8, max: 15 },      // 8-15 minutes
    medium: { min: 4, max: 8 },     // 4-8 minutes
    high: { min: 2, max: 5 },       // 2-5 minutes
};

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize the idle system
 * @param {function} speechCallback - Function to display Nyx's speech
 */
export function initIdleSystem(speechCallback) {
    if (isInitialized) return;
    
    showSpeechCallback = speechCallback;
    
    // Activity listeners
    const debouncedActivity = debounce(onActivity, 250);
    $(document).on('click.nyxidle keypress.nyxidle', debouncedActivity);
    document.addEventListener('keydown', debouncedActivity);
    
    // Start idle timer
    resetIdleTimer();
    
    // Start period monitoring (for time-of-day awareness)
    startPeriodMonitoring(onPeriodChange);
    
    // Check for absence (returning user)
    checkForAbsence();
    
    // Save session state periodically
    setInterval(saveCurrentSession, 60 * 1000); // Every minute
    
    isInitialized = true;
    console.log('[Nyx Idle] System initialized');
}

/**
 * Cleanup the idle system
 */
export function cleanupIdleSystem() {
    if (idleTimer) clearTimeout(idleTimer);
    
    $(document).off('click.nyxidle keypress.nyxidle');
    stopPeriodMonitoring();
    
    saveCurrentSession();
    
    isInitialized = false;
    console.log('[Nyx Idle] System cleaned up');
}

// ============================================
// ACTIVITY TRACKING
// ============================================

/**
 * Handle user activity
 */
function onActivity() {
    lastActivityTime = Date.now();
    idleCommentCount = 0; // Reset on activity
    resetIdleTimer();
}

/**
 * Reset the idle timer with randomized delay
 */
function resetIdleTimer() {
    if (idleTimer) clearTimeout(idleTimer);
    
    // Check if idle comments are enabled
    if (!extensionSettings.nyx?.idleComments) return;
    
    // Get frequency settings
    const frequency = extensionSettings.nyx?.idleFrequency || 'medium';
    const range = IDLE_FREQUENCY[frequency] || IDLE_FREQUENCY.medium;
    
    // Random time within range
    const minutes = range.min + Math.random() * (range.max - range.min);
    const ms = minutes * 60 * 1000;
    
    idleTimer = setTimeout(onIdle, ms);
}

/**
 * Handle idle timeout - Nyx makes an unprompted comment
 */
async function onIdle() {
    // Don't spam comments
    if (idleCommentCount >= MAX_IDLE_COMMENTS) {
        resetIdleTimer();
        return;
    }
    
    // Don't talk to empty room (unless we want to be creepy)
    // Actually, let's be creepy sometimes
    const userPresent = document.hasFocus();
    
    // Don't interrupt AI generation
    if ($('#mes_stop').is(':visible')) {
        resetIdleTimer();
        return;
    }
    
    // Calculate idle duration
    const idleMinutes = Math.floor((Date.now() - lastActivityTime) / 60000);
    
    try {
        const line = await nyxSpeak('idle_nudge', { 
            idleMinutes,
            userPresent 
        });
        
        if (showSpeechCallback && line) {
            showSpeechCallback(line, 5000);
        }
        
        idleCommentCount++;
    } catch (err) {
        console.warn('[Nyx Idle] Failed to generate idle comment:', err);
    }
    
    // Set up next potential comment
    resetIdleTimer();
}

// ============================================
// SESSION & ABSENCE
// ============================================

/**
 * Save current session state
 */
function saveCurrentSession() {
    saveSessionState({
        lastActivityTime,
        sessionPokeCount,
        idleCommentCount,
        timePeriod: getCurrentTimePeriod().key,
    });
}

/**
 * Check if user was away and greet them appropriately
 */
async function checkForAbsence() {
    const absence = calculateAbsence();
    
    if (!absence) {
        // No significant absence - maybe a fresh greeting
        const lastSession = loadSessionState();
        if (!lastSession) {
            // Completely new session
            try {
                const line = await nyxSpeak('first_meeting', {});
                if (showSpeechCallback && line) {
                    // Delay first meeting greeting slightly
                    setTimeout(() => showSpeechCallback(line, 6000), 2000);
                }
            } catch (err) {
                console.warn('[Nyx Idle] Failed to generate first meeting:', err);
            }
        }
        return;
    }
    
    // User was away - greet them
    try {
        const line = await nyxSpeak('greeting_absence', {
            absenceDuration: absence.formatted,
            absenceMinutes: absence.minutes,
            absenceHours: absence.hours,
            absenceDays: absence.days,
        });
        
        if (showSpeechCallback && line) {
            // Delay the greeting slightly so UI is ready
            setTimeout(() => showSpeechCallback(line, 5000), 1500);
        }
    } catch (err) {
        console.warn('[Nyx Idle] Failed to generate absence greeting:', err);
    }
}

// ============================================
// TIME PERIOD TRANSITIONS
// ============================================

/**
 * Handle time period changes (dawn → morning, etc.)
 */
async function onPeriodChange(transition) {
    console.log(`[Nyx Idle] Time period changed: ${transition.from.label} → ${transition.to.label}`);
    
    // Nyx might comment on significant transitions
    const significantTransitions = ['WITCHING', 'DAWN', 'NIGHT'];
    
    if (significantTransitions.includes(transition.to.key)) {
        // Small chance to comment on the time change
        if (Math.random() < 0.3) {
            try {
                const line = await nyxSpeak('greeting', {
                    transitionFrom: transition.from.label,
                    transitionTo: transition.to.label,
                });
                
                if (showSpeechCallback && line) {
                    showSpeechCallback(line, 4000);
                }
            } catch (err) {
                // Silent fail - this is optional
            }
        }
    }
}

// ============================================
// MANUAL TRIGGERS
// ============================================

/**
 * Handle poke button press
 * @returns {Promise<string>} What Nyx says
 */
export async function handlePoke() {
    sessionPokeCount++;
    
    // Check for spam
    const situation = sessionPokeCount > 5 ? 'poke_spam' : 'poke';
    
    const line = await nyxSpeak(situation, {
        pokeCount: sessionPokeCount
    });
    
    // Reset idle timer on interaction
    onActivity();
    
    return line;
}

/**
 * Handle treat/gift
 * @returns {Promise<string>} What Nyx says
 */
export async function handleTreat() {
    // Treats improve disposition
    const line = await nyxSpeak('treat_received', {});
    onActivity();
    return line;
}

/**
 * Handle tease
 * @returns {Promise<string>} What Nyx says
 */
export async function handleTease() {
    const line = await nyxSpeak('teased', {});
    onActivity();
    return line;
}

// ============================================
// STATE GETTERS
// ============================================

/**
 * Get current idle stats
 */
export function getIdleStats() {
    return {
        lastActivityTime,
        idleMinutes: Math.floor((Date.now() - lastActivityTime) / 60000),
        idleCommentCount,
        sessionPokeCount,
        isWindowFocused: document.hasFocus(),
    };
}

/**
 * Reset poke count (e.g., on new chat)
 */
export function resetSessionCounts() {
    sessionPokeCount = 0;
    idleCommentCount = 0;
}
