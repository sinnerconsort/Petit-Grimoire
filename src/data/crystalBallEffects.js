/**
 * Crystal Ball Effects Pool
 * 35 effects across 6 categories
 * The crystal ball is WILD MAGIC - Nyx doesn't control it, nobody does
 */

export const CRYSTAL_CATEGORIES = {
    fortunate: {
        name: 'Fortunate',
        emoji: '🌟',
        weight: 20  // ~20% chance
    },
    unfortunate: {
        name: 'Unfortunate', 
        emoji: '⚫',
        weight: 25  // ~25% chance
    },
    revelation: {
        name: 'Revelation',
        emoji: '👁️',
        weight: 20  // ~20% chance
    },
    upheaval: {
        name: 'Upheaval',
        emoji: '🔥',
        weight: 15  // ~15% chance
    },
    chaos: {
        name: 'Chaos',
        emoji: '🌀',
        weight: 15  // ~15% chance
    },
    silence: {
        name: 'Silence',
        emoji: '🔇',
        weight: 5   // ~5% chance (rare, ominous)
    }
};

export const CRYSTAL_EFFECTS = [
    // ============================================
    // 🌟 FORTUNATE (Good) - 6 effects
    // ============================================
    {
        id: 'F1',
        name: 'The Helping Hand',
        category: 'fortunate',
        scope: 'scene',
        description: 'Unexpected aid arrives at a crucial moment',
        injection: 'Fate extends a hand. Help comes from an unlikely source—accept it quickly, before the moment passes.',
        nyxComment: "Well. That's... convenient. Suspiciously so."
    },
    {
        id: 'F2',
        name: 'The Open Door',
        category: 'fortunate',
        scope: 'scene',
        description: 'An obstacle dissolves, a path clears',
        injection: 'What blocked the way suddenly yields. The door that was locked now stands open.',
        nyxComment: "A clear path. Enjoy it. They're rare."
    },
    {
        id: 'F3',
        name: 'The Returned',
        category: 'fortunate',
        scope: 'arc',
        description: 'Someone or something lost returns',
        injection: "What was lost finds its way back. Not unchanged—nothing returns unchanged—but returned nonetheless.",
        nyxComment: "Things come back. Whether you still want them is another matter."
    },
    {
        id: 'F4',
        name: 'The Gift',
        category: 'fortunate',
        scope: 'scene',
        description: 'An unexpected resource or advantage appears',
        injection: "Fortune smiles—briefly. Something valuable falls into reach. Take it before fate changes its mind.",
        nyxComment: "A gift from the void. I'd check it for strings, but that's just me."
    },
    {
        id: 'F5',
        name: 'The Respite',
        category: 'fortunate',
        scope: 'scene',
        description: 'A moment of peace in chaos, tension releases',
        injection: "The storm passes. For now—perhaps only for now—there is calm. Breathe while you can.",
        nyxComment: "Rest. The crystal rarely offers it. Something worse must be coming."
    },
    {
        id: 'F6',
        name: 'The Truth That Heals',
        category: 'fortunate',
        scope: 'arc',
        description: 'A revelation that brings closure or reconciliation',
        injection: "A truth surfaces—one that mends rather than wounds. Understanding where there was confusion. Forgiveness where there was blame.",
        nyxComment: "Healing truths. How disgustingly wholesome. ...Don't look at me like that."
    },

    // ============================================
    // ⚫ UNFORTUNATE (Bad) - 7 effects
    // ============================================
    {
        id: 'U1',
        name: 'The Betrayal',
        category: 'unfortunate',
        scope: 'arc',
        description: 'Trust is broken, loyalty wavers',
        injection: "A knife finds the back it was always aimed at. Someone's loyalty was never what it seemed.",
        nyxComment: "Betrayal. The crystal loves showing those. Dramatic."
    },
    {
        id: 'U2',
        name: 'The Loss',
        category: 'unfortunate',
        scope: 'arc',
        description: 'Something or someone important is lost or taken',
        injection: "Something precious slips away. Whether stolen, broken, or simply gone—it cannot be held.",
        nyxComment: "Loss. The crystal doesn't soften the blow. It never does."
    },
    {
        id: 'U3',
        name: 'The Wound',
        category: 'unfortunate',
        scope: 'scene',
        description: 'Physical or emotional harm occurs',
        injection: "Pain finds its mark. A wound opens—in flesh, in heart, in mind. It will leave a scar.",
        nyxComment: "Pain incoming. I'd say 'prepare yourself' but you can't really, can you?"
    },
    {
        id: 'U4',
        name: "The Enemy's Advantage",
        category: 'unfortunate',
        scope: 'arc',
        description: 'Opposition gains ground, their plans succeed',
        injection: "The enemy moves while you watch. Their plans advance. Their position strengthens. The game shifts against you.",
        nyxComment: "Your opposition just got what they needed. The crystal thinks that's funny, probably."
    },
    {
        id: 'U5',
        name: 'The Consequence',
        category: 'unfortunate',
        scope: 'arc',
        description: 'Past actions come due—negatively',
        injection: "The bill comes due. Actions have echoes, and the echoes have arrived. Payment is required.",
        nyxComment: "Karma. Not the good kind. Did you do something? You must have done something."
    },
    {
        id: 'U6',
        name: 'The Closing Door',
        category: 'unfortunate',
        scope: 'arc',
        description: 'An opportunity vanishes, a path seals shut',
        injection: "The window slams. What was possible is now impossible. The chance has passed—perhaps forever.",
        nyxComment: "A door closes. The crystal loves finality."
    },
    {
        id: 'U7',
        name: 'The Worsening',
        category: 'unfortunate',
        scope: 'arc',
        description: 'An existing problem escalates',
        injection: "What was bad becomes worse. The crack spreads. The wound festers. The situation deteriorates.",
        nyxComment: "It's getting worse. Of course it is. Why would it get better?"
    },

    // ============================================
    // 👁️ REVELATION (Truth) - 6 effects
    // ============================================
    {
        id: 'R1',
        name: 'The Secret Exposed',
        category: 'revelation',
        scope: 'arc',
        description: 'Hidden information comes to light',
        injection: "The veil tears. What was hidden refuses to stay hidden any longer. The truth demands witness.",
        nyxComment: "Secrets out. The crystal doesn't care about privacy."
    },
    {
        id: 'R2',
        name: 'The True Face',
        category: 'revelation',
        scope: 'arc',
        description: "Someone's real nature or intentions are revealed",
        injection: "The mask slips. Beneath the face they show is the face they are. See clearly now.",
        nyxComment: "Someone's true self, exposed. Were you ready? You're never ready."
    },
    {
        id: 'R3',
        name: 'The Memory Surfaces',
        category: 'revelation',
        scope: 'meta',
        description: 'A buried memory or past event becomes relevant',
        injection: "The past stirs. A memory long buried claws its way to the surface—relevant, finally, terribly relevant.",
        nyxComment: "A flashback. The crystal loves dragging up the past."
    },
    {
        id: 'R4',
        name: 'The Connection',
        category: 'revelation',
        scope: 'arc',
        description: 'A hidden link between people or events is revealed',
        injection: "The threads were always connected. What seemed separate was always intertwined. See the pattern now.",
        nyxComment: "Everything's connected. Surprise. The crystal enjoys making you feel stupid for not seeing it."
    },
    {
        id: 'R5',
        name: 'The Warning Ignored',
        category: 'revelation',
        scope: 'arc',
        description: 'Something dismissed as unimportant proves crucial',
        injection: "The sign was there. The warning was given. It was overlooked, dismissed, forgotten. Now its significance is undeniable.",
        nyxComment: "Remember that thing you ignored? You shouldn't have ignored it."
    },
    {
        id: 'R6',
        name: 'The Mirror',
        category: 'revelation',
        scope: 'meta',
        description: 'Self-revelation—a truth about the protagonist',
        injection: "The mirror reflects what you'd rather not see. A truth about yourself, undeniable and uncomfortable.",
        nyxComment: "Self-awareness. Forced upon you. My favorite kind."
    },

    // ============================================
    // 🔥 UPHEAVAL (Major Change) - 6 effects
    // ============================================
    {
        id: 'H1',
        name: 'The Arrival',
        category: 'upheaval',
        scope: 'arc',
        description: 'Someone significant enters the scene',
        injection: "A presence approaches. Someone significant—their arrival will shift everything. Prepare for recalculation.",
        nyxComment: "Someone's coming. The crystal won't say who. It likes suspense."
    },
    {
        id: 'H2',
        name: 'The Departure',
        category: 'upheaval',
        scope: 'arc',
        description: 'Someone significant leaves',
        injection: "A presence withdraws. Someone who mattered is leaving—by choice or by force. The shape of things changes.",
        nyxComment: "Someone's leaving. Permanently? The crystal won't clarify."
    },
    {
        id: 'H3',
        name: 'The Reversal',
        category: 'upheaval',
        scope: 'arc',
        description: 'Situations flip—hunters become hunted, etc.',
        injection: "The tables turn. What was one way is now its opposite. Power shifts. Roles reverse. Adapt quickly.",
        nyxComment: "Everything just flipped. Try to keep up."
    },
    {
        id: 'H4',
        name: 'The Breaking Point',
        category: 'upheaval',
        scope: 'arc',
        description: 'A situation reaches critical mass, something snaps',
        injection: "The tension finally breaks. Something that was holding—barely—gives way entirely. The collapse begins.",
        nyxComment: "Something just broke. Beyond repair, most likely."
    },
    {
        id: 'H5',
        name: 'The Transformation',
        category: 'upheaval',
        scope: 'arc',
        description: 'Someone or something fundamentally changes',
        injection: "Metamorphosis. What was is no longer. Something has transformed into something else entirely. There is no going back.",
        nyxComment: "Fundamental change. The crystal doesn't do small adjustments."
    },
    {
        id: 'H6',
        name: 'The End of an Era',
        category: 'upheaval',
        scope: 'meta',
        description: 'A chapter closes, a phase ends',
        injection: "An era concludes. What defined the past will not define the future. The page turns whether ready or not.",
        nyxComment: "Chapter's over. The crystal is very dramatic about transitions."
    },

    // ============================================
    // 🌀 CHAOS (Wild) - 7 effects
    // ============================================
    {
        id: 'C1',
        name: 'The Convergence',
        category: 'chaos',
        scope: 'scene',
        description: 'Multiple plot threads collide unexpectedly',
        injection: "Separate paths collide. What should not have met meets. The collision cannot be undone.",
        nyxComment: "Everything happening at once. The crystal thinks that's hilarious."
    },
    {
        id: 'C2',
        name: 'The Wildcard',
        category: 'chaos',
        scope: 'scene',
        description: 'A completely unexpected element enters',
        injection: "The unknown intrudes. Something no one expected, no one planned for, no one can explain. It's here now.",
        nyxComment: "I don't... I don't know what that is. The crystal is showing off."
    },
    {
        id: 'C3',
        name: 'The Misunderstanding',
        category: 'chaos',
        scope: 'arc',
        description: 'A critical miscommunication with consequences',
        injection: "Words twist between speaker and listener. What was meant and what was heard are not the same. The damage blooms.",
        nyxComment: "Miscommunication. The crystal finds it funny when mortals fail to understand each other."
    },
    {
        id: 'C4',
        name: 'The Coincidence',
        category: 'chaos',
        scope: 'scene',
        description: 'An improbable coincidence with major impact',
        injection: "Chance laughs. An impossible coincidence occurs—the wrong person, the wrong place, the wrong time. Or was it the right?",
        nyxComment: "What are the odds? The crystal doesn't care about probability."
    },
    {
        id: 'C5',
        name: 'The Glitch',
        category: 'chaos',
        scope: 'meta',
        description: 'Something breaks the expected pattern—time, logic, memory',
        injection: "Reality hiccups. Something doesn't follow the rules. Time stutters. Memory conflicts. Logic fractures.",
        nyxComment: "That's... wrong. The crystal is showing something that shouldn't be. I don't like this."
    },
    {
        id: 'C6',
        name: 'The Third Option',
        category: 'chaos',
        scope: 'arc',
        description: 'A solution or path no one considered appears',
        injection: "Neither this nor that—something else entirely. A third option materializes where only two existed. The impossible becomes possible.",
        nyxComment: "An option no one considered. The crystal loves lateral thinking."
    },
    {
        id: 'C7',
        name: 'The Echo',
        category: 'chaos',
        scope: 'meta',
        description: 'History repeats—a past pattern recurs',
        injection: "This has happened before. The pattern repeats. The names change, the roles remain. History is rhyming.",
        nyxComment: "Déjà vu. The crystal is reminding you that nothing is new."
    },

    // ============================================
    // 🔇 SILENCE (Rare) - 3 effects
    // ============================================
    {
        id: 'S1',
        name: 'The Crystal Is Silent',
        category: 'silence',
        scope: 'meta',
        description: 'Nothing. The crystal shows nothing. This is ominous.',
        injection: "The crystal swirls... and shows nothing. No future. No present. Only fog. What this means is unclear. That it means something is certain.",
        nyxComment: "...It's not showing anything. That's never good. I've only seen that a few times. Something is wrong—or something is coming that fate itself doesn't want to reveal."
    },
    {
        id: 'S2',
        name: 'The Refusal',
        category: 'silence',
        scope: 'meta',
        description: 'The crystal actively refuses to answer',
        injection: "The crystal clouds over deliberately. This is not absence—this is refusal. Some futures are not meant to be seen.",
        nyxComment: "It's refusing. Not unable—unwilling. Even I don't know what that means. Don't look at me like that."
    },
    {
        id: 'S3',
        name: 'The Static',
        category: 'silence',
        scope: 'meta',
        description: 'Contradictory images, impossible to parse',
        injection: "Images flicker—too many, too fast, contradicting each other. Yes and no. Alive and dead. Here and gone. The future is in flux—too many possibilities to resolve into one.",
        nyxComment: "It can't decide. Too many branching paths. The future isn't written yet—or it's being rewritten as we speak."
    }
];

/**
 * Pick a random effect using weighted categories
 */
export function drawCrystalBallEffect() {
    // Calculate total weight
    const totalWeight = Object.values(CRYSTAL_CATEGORIES).reduce((sum, cat) => sum + cat.weight, 0);
    
    // Pick a category based on weights
    let roll = Math.random() * totalWeight;
    let selectedCategory = null;
    
    for (const [key, cat] of Object.entries(CRYSTAL_CATEGORIES)) {
        roll -= cat.weight;
        if (roll <= 0) {
            selectedCategory = key;
            break;
        }
    }
    
    // Get all effects in this category
    const categoryEffects = CRYSTAL_EFFECTS.filter(e => e.category === selectedCategory);
    
    // Pick a random effect from the category
    const effect = categoryEffects[Math.floor(Math.random() * categoryEffects.length)];
    
    return {
        ...effect,
        categoryInfo: CRYSTAL_CATEGORIES[effect.category],
        timestamp: Date.now()
    };
}

/**
 * Get effect pool stats for display
 */
export function getEffectPoolStats() {
    const stats = {};
    for (const [key, cat] of Object.entries(CRYSTAL_CATEGORIES)) {
        const count = CRYSTAL_EFFECTS.filter(e => e.category === key).length;
        stats[key] = { ...cat, count };
    }
    return stats;
}
