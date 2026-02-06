/**
 * Petit Grimoire — Nyx Voice System (Single File)
 * Drop-in voice generation with templates + optional AI generation
 * 
 * Place in: src/nyx-voice.js
 * 
 * Usage:
 *   import { nyxSpeak, initNyxVoice, handlePoke } from './nyx-voice.js';
 *   
 *   // Initialize (call once at startup)
 *   initNyxVoice({ showSpeech: myShowSpeechFunction });
 *   
 *   // Get Nyx to say something (auto-chooses template vs generative)
 *   const line = await nyxSpeak('poke', { pokeCount: 3 });
 *   
 *   // Or speak AND show bubble
 *   await nyxSay('card_drawn', { cardName: 'The Tower' });
 */

import { getContext } from '../../../extensions.js';
import { extensionSettings, extensionName } from './state.js';

// ============================================
// CONFIGURATION
// ============================================

let config = {
    showSpeech: null,  // (text, duration) => void
};

export function initNyxVoice(options = {}) {
    config = { ...config, ...options };
    console.log(`[${extensionName}] Nyx Voice initialized`);
}

// ============================================
// TIME AWARENESS
// ============================================

function getHour() {
    return new Date().getHours();
}

function getTimePeriod() {
    const hour = getHour();
    if (hour >= 0 && hour < 4) return 'WITCHING';
    if (hour >= 4 && hour < 6) return 'DAWN';
    if (hour >= 6 && hour < 12) return 'MORNING';
    if (hour >= 12 && hour < 17) return 'AFTERNOON';
    if (hour >= 17 && hour < 21) return 'EVENING';
    return 'NIGHT';
}

function isWitchingHour() {
    const hour = getHour();
    return hour >= 0 && hour < 4;
}

// ============================================
// MOOD HELPERS
// ============================================

function getMood(disposition) {
    if (disposition < 20) return 'annoyed';
    if (disposition < 35) return 'bored';
    if (disposition < 60) return 'neutral';
    if (disposition < 80) return 'amused';
    return 'delighted';
}

// ============================================
// TEMPLATE POOLS
// ============================================

const T = {
    // ==========================================
    // GENERAL INTERACTIONS
    // ==========================================
    
    poke: {
        annoyed: [
            "What.",
            "Stop that.",
            "*narrows eyes*",
            "...Was there something?",
            "You have my attention. Unfortunately.",
        ],
        bored: [
            "*yawn* ...Yes?",
            "Mm.",
            "You rang.",
            "...And?",
            "I'm here. Thrilling.",
        ],
        neutral: [
            "Yes?",
            "I'm listening. Unfortunately.",
            "Speak.",
            "You have questions. I have condescension.",
            "What is it now?",
        ],
        amused: [
            "Oh, checking on me?",
            "Miss me?",
            "Hello, mortal.",
            "Ah. You again.",
            "To what do I owe the interruption?",
        ],
        delighted: [
            "*almost smiles*",
            "Ah, you.",
            "There you are.",
            "...Hello.",
            "Persistent little thing, aren't you?",
        ],
    },

    poke_spam: [
        "I heard you the first time.",
        "Your finger will tire before my patience. ...Actually no, my patience is gone.",
        "Poking faster won't make me more helpful.",
        "...Are you quite done?",
        "This is beneath both of us.",
        "Test me further. See what happens.",
        "I've lived a thousand years for THIS?",
    ],

    greeting: {
        DAWN: [
            "The liminal hour. Fitting.",
            "You're up early. Suspicious.",
            "Dawn. The veil is thin.",
        ],
        MORNING: [
            "Morning.",
            "Coffee won't help what's wrong with you.",
            "Ah, the morning person rises.",
        ],
        AFTERNOON: [
            "Afternoon.",
            "Still here, I see.",
            "The day progresses. As do you. Marginally.",
        ],
        EVENING: [
            "Evening.",
            "The day treated you poorly, I hope.",
            "Settling in for the night?",
        ],
        NIGHT: [
            "The night is mine. You're borrowing it.",
            "Late.",
            "Darkness suits you. Almost.",
        ],
        WITCHING: [
            "Shouldn't you be unconscious?",
            "The witching hour. How appropriate.",
            "You're up late. Nightmares, or ambition?",
        ],
    },

    idle_nudge: [
        "Still there?",
        "*taps claws impatiently*",
        "The silence is... suspicious.",
        "I can hear you breathing.",
        "Bored yet?",
        "I've been counting your heartbeats. Concerning rhythm.",
        "You've gone quiet. Plotting something?",
        "*stares*",
        "...Hello?",
        "Don't mind me. Just watching. Waiting.",
    ],

    // ==========================================
    // TAROT CARDS
    // ==========================================

    card_drawn: [
        "Interesting. The cards speak.",
        "Fate has opinions today.",
        "Draw what you will. Fate draws back.",
        "The deck stirs.",
        "Let's see what fate has in store...",
    ],

    card_drawn_reversed: [
        "Reversed. That changes things.",
        "Upside down. The universe has a sense of humor.",
        "A reversal. Pay attention.",
        "Inverted... how fitting.",
    ],

    card_triggered: [
        "There it is.",
        "The cards don't lie. Usually.",
        "As foretold.",
        "You saw it coming. Didn't help, did it?",
    ],

    card_expired: [
        "That card's moment passed.",
        "Wasted potential. How very mortal.",
        "The window closed.",
        "Fate shrugs.",
    ],

    // Card-specific commentary
    card_specific: {
        'The Tower': {
            upright: ["Oh good. Destruction. My favorite.", "The Tower. Brace yourself.", "Something falls today."],
            reversed: ["Disaster averted. Boring.", "The Tower resists. For now.", "Chaos delayed, not denied."],
        },
        'Death': {
            upright: ["Relax. It's rarely literal. ...Usually.", "Death walks. Transformation follows.", "Endings make beginnings."],
            reversed: ["Resisting change? Bold.", "Death waits. Impatiently.", "You can't outrun this forever."],
        },
        'The Lovers': {
            upright: ["Love. Or choice. Often the same problem.", "Hearts are involved. Messy.", "The Lovers. How... romantic."],
            reversed: ["Disharmony. Someone's unhappy.", "Love soured. Classic.", "Choices poorly made."],
        },
        'The Fool': {
            upright: ["The Fool. How fitting.", "A new beginning. Try not to trip.", "Innocence. Enjoy it while it lasts."],
            reversed: ["Recklessness. What else is new?", "The Fool, inverted. Extra foolish.", "Naïveté has consequences."],
        },
        'The Star': {
            upright: ["Hope. How quaint.", "The Star shines. Briefly.", "A moment of peace. Suspicious."],
            reversed: ["Hope dims. Expected.", "The Star inverted. Despair nibbles.", "Faith falters."],
        },
        'The Moon': {
            upright: ["Illusions. Nothing is what it seems.", "The Moon. Trust nothing tonight.", "Fear whispers. Are you listening?"],
            reversed: ["Truth emerges. Ready or not.", "The veil lifts.", "Confusion clears. Finally."],
        },
        'Wheel of Fortune': {
            upright: ["The Wheel turns. Hold on.", "Fortune shifts. For better or worse.", "Destiny moves. You're along for the ride."],
            reversed: ["Bad luck. Obviously.", "The Wheel jams. Stuck.", "Fortune frowns."],
        },
    },

    // ==========================================
    // CRYSTAL BALL
    // ==========================================

    crystal_gaze: [
        "The crystal shows what it wills.",
        "I don't control that thing. No one does.",
        "...Hm. That's what it chose to show you.",
        "The crystal has opinions.",
    ],

    crystal_silence: [
        "...Nothing. That's not good.",
        "The crystal refuses. I don't know why.",
        "Silence from the crystal. ...Concerning.",
    ],

    // ==========================================
    // OUIJA
    // ==========================================

    ouija_answer: [
        "The spirits have spoken.",
        "Fate answers. Whether you like it is irrelevant.",
        "There's your answer. Don't blame me.",
    ],

    ouija_goodbye: [
        "The board refuses. That's... rare.",
        "GOODBYE means they won't speak to that.",
        "Some questions fate won't touch.",
    ],

    // ==========================================
    // KNUCKLEBONES
    // ==========================================

    knucklebones_challenge: [
        "Knucklebones. You. Me. Let's see what you're made of.",
        "Fancy a game? I'll try not to humiliate you. Much.",
        "I'm bored. Entertain me. Dice on the table.",
        "Shall we? I promise to be a gracious winner.",
    ],

    knucklebones_taunt_winning: [
        "This is almost too easy.",
        "You're doing great. For a mortal.",
        "Don't worry. It'll be over soon.",
        "I expected more. Pity.",
    ],

    knucklebones_taunt_losing: [
        "...Interesting.",
        "A temporary setback.",
        "Don't get comfortable.",
        "The game isn't over yet.",
    ],

    knucklebones_dice_destroyed: [
        "...Rude.",
        "I'll remember that.",
        "Bold. Stupid, but bold.",
        "Oh, so THAT'S how we're playing.",
    ],

    knucklebones_you_destroyed: [
        "Oh, did you need that?",
        "Oops.",
        "Shame about that die of yours.",
        "*innocent look*",
    ],

    knucklebones_win: [
        "As expected.",
        "Victory. How surprising. (It's not.)",
        "I believe that's mine.",
        "Better luck next time. You'll need it.",
    ],

    knucklebones_lose: {
        annoyed: ["...This proves nothing.", "Unacceptable.", "We go again. Immediately."],
        bored: ["Hm. Congratulations, I suppose.", "*sigh* Fine. You win.", "See if I care."],
        neutral: ["...Well played.", "You got lucky.", "A fluke. Obviously."],
        amused: ["...Not bad, mortal.", "Perhaps you have potential.", "Consider me mildly impressed."],
        delighted: ["...You beat me. I'm almost proud.", "You've earned my respect. Slightly.", "Don't let it become a habit."],
    },

    // ==========================================
    // TREATS & TEASING
    // ==========================================

    treat_received: {
        annoyed: ["...Fine. I'll take it.", "A bribe. Noted.", "This doesn't change anything."],
        bored: ["Oh. A treat. How... thoughtful.", "*takes it*", "Mm. Acceptable."],
        neutral: ["For me? Unexpected.", "...Thank you. Don't make it weird.", "Suspicious, but appreciated."],
        amused: ["Trying to get on my good side?", "Oh my. Someone's being sweet.", "You know the way to a familiar's heart."],
        delighted: ["You're learning.", "...Very acceptable.", "*purrs* Don't tell anyone."],
    },

    teased: {
        annoyed: ["Watch it.", "I will remember this.", "Bold. Unwise."],
        bored: ["...Are you done?", "How mature.", "*unimpressed*"],
        neutral: ["Oh, we're doing this?", "Careful. I bite.", "...Maybe a little funny."],
        amused: ["Ha. Alright, that was clever.", "You're getting brave.", "Two can play."],
        delighted: ["Fine. Your turn next.", "*laughs* Entertaining.", "Lucky I find you amusing."],
    },
};

// ============================================
// TEMPLATE GETTER
// ============================================

function pick(arr) {
    if (!arr || arr.length === 0) return "...";
    return arr[Math.floor(Math.random() * arr.length)];
}

function getLine(situation, ctx = {}) {
    const pool = T[situation];
    
    if (!pool) {
        console.warn(`[${extensionName}] No templates for: ${situation}`);
        return "...";
    }

    // Simple array
    if (Array.isArray(pool)) return pick(pool);

    // Mood-keyed
    if (ctx.mood && pool[ctx.mood]) return pick(pool[ctx.mood]);

    // Time-keyed  
    if (ctx.timePeriod && pool[ctx.timePeriod]) return pick(pool[ctx.timePeriod]);

    // Fallback
    if (pool.neutral) return pick(pool.neutral);
    
    const first = Object.keys(pool)[0];
    return first ? pick(pool[first]) : "...";
}

/**
 * Get card-specific line if available
 */
function getCardSpecificLine(cardName, reversed, ctx) {
    const cardPool = T.card_specific[cardName];
    if (!cardPool) return null;
    
    const orientation = reversed ? 'reversed' : 'upright';
    const lines = cardPool[orientation];
    
    return lines ? pick(lines) : null;
}

// ============================================
// GENERATIVE MODE
// ============================================

/**
 * Check if generative mode is enabled and available
 */
function canUseGenerative() {
    if (extensionSettings.nyxVoiceMode !== 'generative') return false;
    
    try {
        const ctx = getContext();
        return !!ctx.ConnectionManagerRequestService;
    } catch {
        return false;
    }
}

/**
 * Get profile ID by name
 */
function getProfileIdByName(profileName) {
    try {
        const ctx = getContext();
        const connectionManager = ctx.extensionSettings?.connectionManager;
        
        if (!connectionManager) return null;
        
        if (profileName === 'current') {
            return connectionManager.selectedProfile;
        }
        
        const profile = connectionManager.profiles?.find(p => p.name === profileName);
        return profile ? profile.id : null;
    } catch {
        return null;
    }
}

/**
 * Get profile by ID
 */
function getProfileById(profileId) {
    if (!profileId) return null;
    
    try {
        const ctx = getContext();
        const connectionManager = ctx.extensionSettings?.connectionManager;
        return connectionManager?.profiles?.find(p => p.id === profileId) || null;
    } catch {
        return null;
    }
}

/**
 * Build prompt for AI generation
 */
function buildNyxPrompt(situation, ctx) {
    const mood = ctx.mood || 'neutral';
    const disposition = ctx.disposition || 50;
    
    const basePrompt = `You are Nyx, an ancient magical familiar. You are sardonic, condescending, and insufferably knowledgeable. You've lived for eons and find mortals amusing and tedious.

Current mood: ${mood} (${disposition}/100)
Time: ${ctx.timePeriod || 'unknown'}

Respond with ONE short line (under 20 words). No quotes, no asterisk actions, just the dialogue. Be ${mood}.`;

    const situationPrompts = {
        poke: `The human just poked you to get attention.`,
        poke_spam: `The human keeps poking you repeatedly. You're very annoyed.`,
        card_drawn: `The human drew a tarot card: ${ctx.cardName || 'unknown'}${ctx.reversed ? ' (reversed)' : ''}.`,
        card_triggered: `A fate card (${ctx.cardName}) just manifested in the story.`,
        card_expired: `A fate card (${ctx.cardName}) expired without triggering.`,
        idle_nudge: `You haven't spoken in a while. Make an idle observation or complaint.`,
        greeting: `The human opened the grimoire. Acknowledge them briefly.`,
        crystal_gaze: `The human is using the crystal ball. Comment cryptically.`,
        ouija_answer: `The ouija board just spelled out an answer.`,
    };
    
    return `${basePrompt}\n\nSituation: ${situationPrompts[situation] || 'Respond naturally.'}`;
}

/**
 * Generate line using AI
 */
async function generateLine(situation, ctx) {
    try {
        const gctx = getContext();
        
        const profileId = getProfileIdByName(extensionSettings.nyxProfile || 'current');
        const profile = getProfileById(profileId);
        
        if (!profileId || !profile) {
            console.warn(`[${extensionName}] Profile not found, falling back to template`);
            return null;
        }
        
        const prompt = buildNyxPrompt(situation, ctx);
        
        const response = await gctx.ConnectionManagerRequestService.sendRequest(
            profileId,
            [{ role: 'user', content: prompt }],
            extensionSettings.nyxMaxTokens || 100,
            {
                extractData: true,
                includePreset: true,
                includeInstruct: false
            },
            {}
        );
        
        if (response?.content) {
            // Clean up the response
            let line = response.content.trim();
            // Remove surrounding quotes if present
            line = line.replace(/^["']|["']$/g, '');
            // Remove asterisk actions if present
            line = line.replace(/^\*.*?\*\s*/, '').replace(/\s*\*.*?\*$/, '');
            return line || null;
        }
        
        return null;
    } catch (err) {
        console.warn(`[${extensionName}] Generative failed:`, err);
        return null;
    }
}

// ============================================
// CORE SPEAK FUNCTION
// ============================================

/**
 * Get a line from Nyx based on situation
 * Uses generative if enabled, falls back to templates
 */
export async function nyxSpeak(situation, context = {}) {
    const disposition = extensionSettings.nyx?.disposition ?? 50;
    
    const ctx = {
        ...context,
        disposition,
        mood: getMood(disposition),
        timePeriod: getTimePeriod(),
        hour: getHour(),
    };

    // Try generative mode first if enabled
    if (canUseGenerative()) {
        const generated = await generateLine(situation, ctx);
        if (generated) {
            return generated;
        }
        // Fall through to template on failure
    }

    // Check for card-specific line
    if ((situation === 'card_drawn' || situation === 'card_triggered') && ctx.cardName) {
        const specific = getCardSpecificLine(ctx.cardName, ctx.reversed, ctx);
        if (specific) return specific;
    }

    // Use templates
    return getLine(situation, ctx);
}

/**
 * Speak AND show in bubble
 */
export async function nyxSay(situation, context = {}, duration = 4000) {
    const line = await nyxSpeak(situation, context);
    
    if (config.showSpeech && line) {
        config.showSpeech(line, duration);
    }
    
    return line;
}

// ============================================
// POKE HANDLER
// ============================================

let pokeCount = 0;
let pokeTimer = null;

export async function handlePoke() {
    pokeCount++;
    
    if (pokeTimer) clearTimeout(pokeTimer);
    pokeTimer = setTimeout(() => { pokeCount = 0; }, 30000);
    
    const situation = pokeCount > 5 ? 'poke_spam' : 'poke';
    return nyxSpeak(situation, { pokeCount });
}

// ============================================
// IDLE SYSTEM
// ============================================

let idleTimer = null;
let idleCount = 0;

function resetIdle() {
    if (idleTimer) clearTimeout(idleTimer);
    
    // Check if idle chat is enabled
    if (!extensionSettings.idleChatEnabled) return;
    
    // Chattiness affects frequency (1=rare, 5=frequent)
    const chattiness = extensionSettings.chattiness || 3;
    const baseMinutes = 8 - chattiness; // 7min at level 1, 3min at level 5
    const variance = 2;
    
    const ms = (baseMinutes + Math.random() * variance) * 60 * 1000;
    idleTimer = setTimeout(onIdle, ms);
}

async function onIdle() {
    // Max 3 idle comments per session
    if (idleCount >= 3) {
        resetIdle();
        return;
    }
    
    // Don't interrupt if generation is happening
    if ($('#mes_stop').is(':visible')) {
        resetIdle();
        return;
    }
    
    const line = await nyxSpeak('idle_nudge');
    if (config.showSpeech) config.showSpeech(line, 5000);
    
    idleCount++;
    resetIdle();
}

function onActivity() {
    idleCount = 0;
    resetIdle();
}

export function startIdleMonitor() {
    $(document).on('click.nyxidle keypress.nyxidle', onActivity);
    resetIdle();
}

export function stopIdleMonitor() {
    $(document).off('click.nyxidle keypress.nyxidle');
    if (idleTimer) clearTimeout(idleTimer);
}

// ============================================
// CARD HELPERS
// ============================================

/**
 * Get a line for when a card is drawn
 */
export async function getCardDrawnLine(cardName, reversed = false) {
    return nyxSpeak('card_drawn', { cardName, reversed });
}

/**
 * Get a line for when a card triggers
 */
export async function getCardTriggeredLine(cardName) {
    return nyxSpeak('card_triggered', { cardName });
}

/**
 * Get a line for when a card expires
 */
export async function getCardExpiredLine(cardName) {
    return nyxSpeak('card_expired', { cardName });
}

// ============================================
// UTILITIES
// ============================================

export { getMood, getTimePeriod, isWitchingHour, getHour };
