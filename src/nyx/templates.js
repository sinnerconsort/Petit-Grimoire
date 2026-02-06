/**
 * Petit Grimoire — Nyx Templates
 * Fallback lines for when no API/connection profile is configured
 * Organized by situation, mood, and time where relevant
 */

// ============================================
// TEMPLATE POOLS
// ============================================

const TEMPLATES = {
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
        "Your finger will tire before my patience. Actually, no. My patience is gone.",
        "Poking faster won't make me more helpful.",
        "...Are you quite done?",
        "This is beneath both of us.",
        "Test me further. See what happens.",
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

    greeting_absence: [
        "Oh. You're back.",
        "I didn't notice you were gone. (I did.)",
        "The prodigal mortal returns.",
        "...Took you long enough.",
        "Back already? Time moves strangely for your kind.",
    ],

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

    first_meeting: [
        "Ah. A new contract. How... quaint. I am Nyx. You'll learn what that means.",
        "So. You're the one. I've bound to worse. ...Marginally worse.",
        "The contract is sealed. I am Nyx. Try not to bore me.",
    ],

    treat_received: {
        annoyed: [
            "...Fine. I'll take it.",
            "A bribe. Noted.",
            "This doesn't change anything. But I'll keep it.",
        ],
        bored: [
            "Oh. A treat. How... thoughtful.",
            "*takes it without enthusiasm*",
            "Mm. Acceptable.",
        ],
        neutral: [
            "For me? How unexpected.",
            "...Thank you. Don't make it weird.",
            "A gift. Suspicious, but appreciated.",
        ],
        amused: [
            "Trying to get on my good side? It's working. Marginally.",
            "Oh my. Someone's being sweet.",
            "A treat! You do know the way to a familiar's heart.",
        ],
        delighted: [
            "You're learning. I'm almost proud.",
            "...This is acceptable. Very acceptable.",
            "*purrs* Don't tell anyone I did that.",
        ],
    },

    teased: {
        annoyed: [
            "Watch it.",
            "I will remember this slight.",
            "Bold. Unwise, but bold.",
        ],
        bored: [
            "...Are you done?",
            "How very mature.",
            "*unimpressed stare*",
        ],
        neutral: [
            "Oh, we're doing this now?",
            "Careful. I bite.",
            "You think you're funny? ...Maybe a little.",
        ],
        amused: [
            "Ha. Alright, that was clever.",
            "You're getting brave. I like it.",
            "Two can play at this game, mortal.",
        ],
        delighted: [
            "Ooh, we're teasing now? Fine. Your turn next.",
            "*laughs* You're entertaining when you try.",
            "You're lucky I find you amusing.",
        ],
    },

    // ==========================================
    // TAROT CARDS
    // ==========================================

    card_drawn: [
        "Interesting. The cards speak.",
        "Fate has opinions today.",
        "Draw what you will. Fate draws back.",
        "The deck stirs.",
    ],

    card_drawn_reversed: [
        "Reversed. That changes things.",
        "Upside down. The universe has a sense of humor.",
        "A reversal. Pay attention.",
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
        "The crystal refuses. I don't know why. I don't want to know.",
        "Silence from the crystal. ...Concerning.",
    ],

    // ==========================================
    // OUIJA
    // ==========================================

    ouija_answer: [
        "The spirits have spoken. Make of it what you will.",
        "Fate answers. Whether you like the answer is irrelevant.",
        "There's your answer. Don't blame me.",
    ],

    ouija_goodbye: [
        "The board refuses. That's... rare.",
        "GOODBYE means they won't speak to that. Why, I wonder?",
        "Some questions fate won't touch.",
    ],

    // ==========================================
    // KNUCKLEBONES - CHALLENGES
    // ==========================================

    knucklebones_challenge: [
        "Knucklebones. You. Me. Let's see what you're made of.",
        "Fancy a game? I'll try not to humiliate you. Much.",
        "I'm bored. Entertain me. Dice on the table.",
        "Shall we? I promise to be a gracious winner.",
    ],

    knucklebones_accept_challenge: [
        "Brave. Or foolish. Let's find out.",
        "Accepted. Don't disappoint me.",
        "Good. I was hoping you'd say yes.",
    ],

    knucklebones_decline_challenge: [
        "Wise. Or cowardly. I'll decide later.",
        "A tactical retreat. Noted.",
        "Perhaps next time. If you can stomach it.",
    ],

    knucklebones_player_challenge: [
        "You dare challenge me? ...I accept.",
        "Oh, so NOW you have confidence.",
        "Very well. Don't say I didn't warn you.",
    ],

    // ==========================================
    // KNUCKLEBONES - GAMEPLAY
    // ==========================================

    knucklebones_game_start: [
        "Begin.",
        "Let fate decide.",
        "Roll well. Or don't. I'll enjoy it either way.",
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

    knucklebones_taunt_close: [
        "Close game. How tedious.",
        "Neck and neck. Almost exciting.",
        "This could go either way. Thrilling.",
    ],

    knucklebones_dice_destroyed: [
        "...Rude.",
        "I'll remember that.",
        "Bold. Stupid, but bold.",
        "You'll pay for that.",
        "Oh, so THAT'S how we're playing.",
    ],

    knucklebones_you_destroyed: [
        "Oh, did you need that?",
        "Oops.",
        "Mine now. Well, gone now.",
        "Shame about that die of yours.",
        "*innocent look*",
    ],

    knucklebones_player_match: [
        "Ugh. Lucky.",
        "...Fine.",
        "Multipliers. How nice for you.",
        "Don't let it go to your head.",
    ],

    knucklebones_nyx_match: [
        "See how it's done?",
        "Multipliers. Because I'm that good.",
        "Watch and learn.",
        "Stack them high.",
    ],

    // ==========================================
    // KNUCKLEBONES - END GAME
    // ==========================================

    knucklebones_win: [
        "As expected.",
        "Victory. How surprising. (It's not.)",
        "I believe that's mine.",
        "Better luck next time. You'll need it.",
    ],

    knucklebones_lose: {
        annoyed: [
            "...This proves nothing.",
            "Unacceptable.",
            "We go again. Immediately.",
            "I demand a rematch.",
        ],
        bored: [
            "Hm. Congratulations, I suppose.",
            "*sigh* Fine. You win this one.",
            "Take your victory. See if I care.",
        ],
        neutral: [
            "...Well played.",
            "You got lucky.",
            "A fluke. Obviously.",
        ],
        amused: [
            "...Not bad, mortal. Not bad at all.",
            "Ha. Perhaps you have potential after all.",
            "Consider me... mildly impressed.",
        ],
        delighted: [
            "...You actually beat me. I'm almost proud.",
            "Well well. You've earned my respect. Slightly.",
            "Impressive. Don't let it become a habit.",
        ],
    },

    knucklebones_lose_streak: [
        "This ends NOW.",
        "You've had your fun. It stops here.",
        "I don't know what dark magic you're using, but I will find out.",
        "Statistically impossible. You're cheating. Somehow.",
    ],

    // ==========================================
    // UNLOCKS & LORE
    // ==========================================

    unlock_earned: [
        "You've earned something. Don't let it go to your head.",
        "An achievement. How quaint.",
        "Consider this a reward. They're rare from me.",
    ],

    lore_reveal: [
        "You want to know about me? ...Fine. You've earned a glimpse.",
        "Very well. A piece of the truth. Handle it carefully.",
        "Not many get to see this. Don't make me regret it.",
    ],

    sprite_unlock: [
        "Ah. You've unlocked... this. A form I don't wear often.",
        "You're seeing something most don't. Cherish it.",
        "This is what I was. Or what I'm becoming. I forget which.",
    ],

    // ==========================================
    // META / SPECIAL
    // ==========================================

    disposition_milestone: {
        improving: [
            "...Hm. You're less insufferable than most.",
            "Don't read into this, but... you're tolerable.",
            "We're getting along. How suspicious.",
        ],
        worsening: [
            "You're testing my patience.",
            "I'm enjoying your company less and less.",
            "Keep this up and see what happens.",
        ],
    },

    session_end: [
        "Leaving? ...Fine.",
        "Until next time, mortal.",
        "Don't be a stranger. (Or do. I don't care.)",
        "Go on then. I'll be here.",
    ],
};

// ============================================
// FALLBACK GETTER
// ============================================

/**
 * Get a template fallback for a situation
 * @param {string} situation - Situation key
 * @param {object} context - Context with mood, timeOfDay, etc.
 * @returns {string} A random appropriate line
 */
export function getTemplateFallback(situation, context = {}) {
    const pool = TEMPLATES[situation];
    
    if (!pool) {
        console.warn(`[Nyx Templates] No templates for situation: ${situation}`);
        return "...";
    }

    // If pool is a simple array
    if (Array.isArray(pool)) {
        return pickRandom(pool);
    }

    // If pool is mood-keyed
    if (context.mood && pool[context.mood]) {
        return pickRandom(pool[context.mood]);
    }

    // If pool is time-keyed
    if (context.timeOfDay && pool[context.timeOfDay]) {
        return pickRandom(pool[context.timeOfDay]);
    }

    // If pool is direction-keyed (for disposition changes)
    if (context.direction && pool[context.direction]) {
        return pickRandom(pool[context.direction]);
    }

    // If pool is an object but we don't have a matching key, try 'neutral' or first available
    if (typeof pool === 'object' && !Array.isArray(pool)) {
        if (pool.neutral) {
            return pickRandom(pool.neutral);
        }
        // Get first available array
        const firstKey = Object.keys(pool)[0];
        if (firstKey && Array.isArray(pool[firstKey])) {
            return pickRandom(pool[firstKey]);
        }
    }

    return "...";
}

/**
 * Pick random item from array
 */
function pickRandom(arr) {
    if (!arr || arr.length === 0) return "...";
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Get all template situations (for debugging)
 */
export function getTemplateSituations() {
    return Object.keys(TEMPLATES);
}
