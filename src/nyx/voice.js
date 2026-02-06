/**
 * Petit Grimoire — Nyx Voice System
 * Core generation: the central nyxSpeak() function everything calls
 */

import { extensionSettings } from '../state.js';
import { sendNyxRequest, isConnectionAvailable } from './connection.js';
import { buildPrompt } from './contexts.js';
import { getTemplateFallback } from './templates.js';
import { getCurrentTimePeriod, getHour } from './time.js';

// Local mood calculation to avoid circular dependency with nyxgotchi
function getMoodText(disposition) {
    if (disposition < 20) return 'annoyed';
    if (disposition < 35) return 'bored';
    if (disposition < 60) return 'neutral';
    if (disposition < 80) return 'amused';
    return 'delighted';
}

// ============================================
// CORE VOICE FUNCTION
// ============================================

/**
 * Make Nyx speak. Uses API if configured, falls back to templates.
 * This is THE function everything calls.
 * 
 * @param {string} situation - What's happening (e.g., 'knucklebones_taunt')
 * @param {object} context - Situation-specific data
 * @returns {Promise<string>} - What Nyx says
 */
export async function nyxSpeak(situation, context = {}) {
    // Enrich context with global state
    const fullContext = enrichContext(context);

    // Check if generative mode is enabled AND we have a connection
    const useGenerative = extensionSettings.nyx.generativeVoice && isConnectionAvailable();

    if (useGenerative) {
        try {
            const prompt = buildPrompt(situation, fullContext);
            if (!prompt) {
                console.warn(`[Nyx] No prompt template for situation: ${situation}`);
                return getTemplateFallback(situation, fullContext);
            }

            const response = await sendNyxRequest(prompt.system, prompt.user);
            const parsed = parseNyxResponse(response);
            
            if (parsed && parsed.trim()) {
                return parsed;
            } else {
                console.warn('[Nyx] Empty response, using fallback');
                return getTemplateFallback(situation, fullContext);
            }
        } catch (err) {
            console.warn('[Nyx] Generation failed, using fallback:', err);
            return getTemplateFallback(situation, fullContext);
        }
    } else {
        // Template mode - no API calls
        return getTemplateFallback(situation, fullContext);
    }
}

/**
 * Enrich context with global Nyx state
 */
function enrichContext(context) {
    const nyx = extensionSettings.nyx || {};
    const kb = extensionSettings.knucklebones || {};

    return {
        ...context,
        // Mood & disposition
        disposition: nyx.disposition ?? 50,
        mood: getMoodText(nyx.disposition ?? 50),
        
        // Time awareness
        timeOfDay: getCurrentTimePeriod(),
        hour: getHour(),
        
        // Knucklebones stats
        gamesPlayed: kb.gamesPlayed ?? 0,
        gamesWon: kb.gamesWon ?? 0,
        playerWins: (kb.gamesPlayed ?? 0) - (kb.gamesWon ?? 0),
        currentStreak: kb.currentStreak ?? 0,
        nyxWinRate: kb.gamesPlayed > 0 
            ? Math.round(((kb.gamesPlayed - (kb.gamesWon ?? 0)) / kb.gamesPlayed) * 100)
            : 50,
        
        // Tarot stats
        totalCardsDrawn: nyx.totalCardsDrawn ?? 0,
        totalTriggered: nyx.totalTriggered ?? 0,
        
        // Fortune favor (from knucklebones bets)
        fortuneFavor: kb.fortuneFavor ?? 0,
    };
}

/**
 * Parse and clean Nyx's response
 */
function parseNyxResponse(response) {
    if (!response) return null;

    let text = response.trim();

    // Remove any accidental quotation wrapping
    if ((text.startsWith('"') && text.endsWith('"')) ||
        (text.startsWith("'") && text.endsWith("'"))) {
        text = text.slice(1, -1);
    }

    // Remove "Nyx:" or "NYX:" prefix if model added it
    text = text.replace(/^(Nyx|NYX)\s*:\s*/i, '');

    // Remove action asterisks if we don't want them
    // (optional - might want to keep for *sighs* etc)
    // text = text.replace(/\*[^*]+\*/g, '');

    return text.trim();
}

// ============================================
// QUICK HELPERS
// ============================================

/**
 * Quick speak - for simple one-off lines without much context
 */
export async function nyxQuip(situation) {
    return nyxSpeak(situation, {});
}

/**
 * Check if Nyx would use generative voice right now
 */
export function isGenerativeMode() {
    return extensionSettings.nyx.generativeVoice && isConnectionAvailable();
}
