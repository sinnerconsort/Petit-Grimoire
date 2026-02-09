/**
 * Tarot Card Data - Major Arcana
 * All 22 cards with upright/reversed meanings and prompt injections
 */

// Asset path helper - will use ASSET_PATHS from config when integrated
const CARD_PATH = 'scripts/extensions/third-party/Petit-Grimoire/assets/sprites/tarot';

/**
 * All 22 Major Arcana cards
 */
export const MAJOR_ARCANA = [
    {
        id: 0,
        numeral: '0',
        name: 'The Fool',
        folder: '0_theFool',
        file: '0_theFool',
        upright: {
            keywords: ['New beginnings', 'Innocence', 'Spontaneity', 'Free spirit'],
            meaning: 'A leap of faith into the unknown. Fresh starts, untapped potential, and the courage to begin a journey without knowing where it leads.',
            injection: 'A moment of pure possibility opens. Someone acts on impulse, takes a risk, or stumbles into something unexpected. The path ahead is unwritten.'
        },
        reversed: {
            keywords: ['Recklessness', 'Risk-taking', 'Naivety', 'Foolishness'],
            meaning: 'Rash decisions without considering consequences. Being too naive, taking unnecessary risks, or refusing to learn from past mistakes.',
            injection: 'Caution is thrown to the wind—perhaps unwisely. A hasty decision, a ignored warning, or willful ignorance sets something in motion.'
        }
    },
    {
        id: 1,
        numeral: 'I',
        name: 'The Magician',
        folder: '1_theMagician',
        file: '1_TheMagician',
        upright: {
            keywords: ['Willpower', 'Creation', 'Manifestation', 'Resourcefulness'],
            meaning: 'The power to transform vision into reality. All the tools are at hand—skill, focus, and determination align to make the impossible possible.',
            injection: 'Someone discovers they have exactly what they need. A skill proves useful, a resource appears, or sheer willpower turns the tide.'
        },
        reversed: {
            keywords: ['Manipulation', 'Trickery', 'Wasted talent', 'Deception'],
            meaning: 'Power used for selfish ends or not used at all. Manipulation, illusions, or squandered potential. The tools exist but are misused.',
            injection: 'Things are not as they appear. Someone deceives, manipulates, or fails to use their gifts. A trick is being played.'
        }
    },
    {
        id: 2,
        numeral: 'II',
        name: 'The High Priestess',
        folder: '2_theHighPriestess',
        file: '2_theHighPriestess',
        upright: {
            keywords: ['Intuition', 'Mystery', 'Inner knowledge', 'The subconscious'],
            meaning: 'Hidden knowledge waiting to surface. Trust in intuition, secrets yet to be revealed, and the wisdom that comes from stillness and reflection.',
            injection: 'Something lurks beneath the surface. An intuition proves true, a secret exists to be found, or the subconscious mind offers guidance.'
        },
        reversed: {
            keywords: ['Secrets', 'Withdrawal', 'Silence', 'Blocked intuition'],
            meaning: 'Secrets kept too long, disconnection from inner wisdom, or refusing to see what intuition reveals. The veil stays firmly in place.',
            injection: 'Important information is being withheld—perhaps even from oneself. Intuition is ignored, or someone retreats into silence.'
        }
    },
    {
        id: 3,
        numeral: 'III',
        name: 'The Empress',
        folder: '3_theEmpress',
        file: '3_theEmpress',
        upright: {
            keywords: ['Abundance', 'Nurturing', 'Fertility', 'Nature'],
            meaning: 'Creation, growth, and nurturing energy. Abundance flows freely—whether in relationships, creativity, or material comfort. Life flourishes.',
            injection: 'Something grows or flourishes. Comfort is found, creativity flows, or a nurturing presence makes itself known.'
        },
        reversed: {
            keywords: ['Dependence', 'Smothering', 'Emptiness', 'Creative block'],
            meaning: 'Nurturing that becomes suffocating, creative blockages, or an inability to connect with abundance. Growth is stunted.',
            injection: 'Care becomes control, or emptiness where abundance should be. Creative energy stalls, or dependence becomes unhealthy.'
        }
    },
    {
        id: 4,
        numeral: 'IV',
        name: 'The Emperor',
        folder: '4_theEmperor',
        file: '4_theEmperor',
        upright: {
            keywords: ['Authority', 'Structure', 'Control', 'Stability'],
            meaning: 'Order, leadership, and established power. Rules exist for a reason. Authority figures, systems, and the stability that comes from structure.',
            injection: 'Authority makes itself known. Rules are enforced, leadership emerges, or structure provides stability in chaos.'
        },
        reversed: {
            keywords: ['Tyranny', 'Rigidity', 'Domination', 'Lack of discipline'],
            meaning: 'Authority corrupted or absent. Tyrannical control, excessive rigidity, or the chaos that comes when structure crumbles.',
            injection: 'Power is abused or absent. Someone becomes tyrannical, rules become oppressive, or lack of structure breeds chaos.'
        }
    },
    {
        id: 5,
        numeral: 'V',
        name: 'The Hierophant',
        folder: '5_theHierophant',
        file: '5_theHierophant',
        upright: {
            keywords: ['Tradition', 'Conformity', 'Institutions', 'Spiritual wisdom'],
            meaning: 'Established wisdom, traditions, and conventional approaches. Learning from those who came before. Institutions and their teachings.',
            injection: 'Tradition or convention influences events. Established wisdom offers guidance, or institutional forces come into play.'
        },
        reversed: {
            keywords: ['Rebellion', 'Subversion', 'New approaches', 'Freedom'],
            meaning: 'Breaking from tradition, questioning established wisdom, or finding that old ways no longer serve. Personal truth over dogma.',
            injection: 'Convention is challenged or rejected. Someone breaks from tradition, questions authority, or forges their own path.'
        }
    },
    {
        id: 6,
        numeral: 'VI',
        name: 'The Lovers',
        folder: '6_theLovers',
        file: '6_theLovers',
        upright: {
            keywords: ['Love', 'Union', 'Partnership', 'Choices'],
            meaning: 'Deep connection, important choices, and the harmony of union. Not just romantic love—any meaningful bond or crucial decision between paths.',
            injection: 'Connection deepens or a significant choice emerges. Hearts align, partnerships form, or a decision between two paths must be made.'
        },
        reversed: {
            keywords: ['Disharmony', 'Imbalance', 'Misalignment', 'Bad choices'],
            meaning: 'Relationships strained, values misaligned, or poor choices with lasting consequences. What should unite instead divides.',
            injection: 'Discord enters a relationship or a choice goes badly. Values clash, partnerships strain, or a wrong path is chosen.'
        }
    },
    {
        id: 7,
        numeral: 'VII',
        name: 'The Chariot',
        folder: '7_theChariot',
        file: '7_theChariot',
        upright: {
            keywords: ['Victory', 'Determination', 'Willpower', 'Control'],
            meaning: 'Triumph through sheer force of will. Opposing forces brought under control, obstacles overcome, and forward momentum that cannot be stopped.',
            injection: 'Determination pays off. Willpower overcomes obstacles, opposing forces are mastered, or victory comes through persistence.'
        },
        reversed: {
            keywords: ['Lack of direction', 'Aggression', 'No control', 'Defeat'],
            meaning: 'Force without direction, aggression without purpose, or losing control of what was once mastered. The chariot crashes.',
            injection: 'Control slips away. Aggression backfires, direction is lost, or what seemed certain victory turns to defeat.'
        }
    },
    {
        id: 8,
        numeral: 'VIII',
        name: 'Justice',
        folder: '8_justice',
        file: '8_justice',
        upright: {
            keywords: ['Justice', 'Fairness', 'Truth', 'Cause and effect'],
            meaning: 'Truth revealed, fairness served, and consequences delivered. What is deserved—good or ill—comes to pass. The scales balance.',
            injection: 'Justice is served, for better or worse. Truth comes to light, fairness prevails, or consequences catch up with past actions.'
        },
        reversed: {
            keywords: ['Injustice', 'Dishonesty', 'Unfairness', 'Avoiding accountability'],
            meaning: 'Justice denied, truth suppressed, or consequences avoided—for now. The scales tip unfairly. Someone escapes what they deserve.',
            injection: 'Injustice prevails. The truth is hidden, fairness is denied, or someone evades the consequences they\'ve earned.'
        }
    },
    {
        id: 9,
        numeral: 'IX',
        name: 'The Hermit',
        folder: '9_theHermit',
        file: '9_theHermit',
        upright: {
            keywords: ['Introspection', 'Solitude', 'Guidance', 'Inner wisdom'],
            meaning: 'Withdrawal for reflection and inner guidance. The wisdom found in solitude, the light that shines from within, and the teacher who appears when needed.',
            injection: 'Solitude offers clarity. Someone withdraws to reflect, inner wisdom surfaces, or a guide appears bearing light.'
        },
        reversed: {
            keywords: ['Isolation', 'Loneliness', 'Lost', 'Withdrawal'],
            meaning: 'Solitude that becomes isolation, guidance rejected, or being lost in the dark without a light to follow.',
            injection: 'Isolation takes its toll. Someone loses their way, rejects guidance, or withdraws too far from others.'
        }
    },
    {
        id: 10,
        numeral: 'X',
        name: 'Wheel of Fortune',
        folder: '10_wheelOfFortune',
        file: '10_wheelOfFortune',
        upright: {
            keywords: ['Change', 'Cycles', 'Fate', 'Turning point'],
            meaning: 'The wheel turns and nothing stays the same. Destiny shifts, luck changes, and a turning point arrives. What goes up must come down—and vice versa.',
            injection: 'Fate intervenes. Circumstances shift dramatically, luck changes hands, or a turning point arrives unbidden.'
        },
        reversed: {
            keywords: ['Bad luck', 'Resistance to change', 'Breaking cycles', 'Setbacks'],
            meaning: 'Fighting against inevitable change, a downturn in fortune, or the difficult work of breaking free from repeating cycles.',
            injection: 'Fortune turns against someone, or they fight the inevitable. A cycle repeats, luck sours, or change is resisted.'
        }
    },
    {
        id: 11,
        numeral: 'XI',
        name: 'Strength',
        folder: '11_strength',
        file: '11_strength',
        upright: {
            keywords: ['Courage', 'Inner strength', 'Compassion', 'Patience'],
            meaning: 'Power through gentleness, courage through compassion. The quiet strength that tames wild forces—not through dominance, but through patience and heart.',
            injection: 'Inner strength emerges. Courage manifests as gentleness, patience tames chaos, or compassion proves more powerful than force.'
        },
        reversed: {
            keywords: ['Self-doubt', 'Weakness', 'Raw emotion', 'Lack of courage'],
            meaning: 'Doubt undermining strength, emotions running wild, or courage failing when most needed. The inner beast breaks free.',
            injection: 'Strength falters. Self-doubt cripples action, emotions overwhelm reason, or courage fails at the crucial moment.'
        }
    },
    {
        id: 12,
        numeral: 'XII',
        name: 'The Hanged Man',
        folder: '12_theHangedMan',
        file: '12_theHangedMan',
        upright: {
            keywords: ['Suspension', 'Letting go', 'New perspective', 'Sacrifice'],
            meaning: 'Willing suspension—letting go to gain new perspective. Sacrifice that leads to wisdom, waiting that leads to insight, seeing the world upside-down.',
            injection: 'A pause brings revelation. Someone lets go of control, gains new perspective through sacrifice, or finds wisdom in waiting.'
        },
        reversed: {
            keywords: ['Stalling', 'Resistance', 'Indecision', 'Martyrdom'],
            meaning: 'Stuck without purpose, sacrifice without meaning, or refusing to let go when release is needed. Hanging on when you should drop.',
            injection: 'Stagnation without purpose. Someone clings to what should be released, plays the martyr, or delays without reason.'
        }
    },
    {
        id: 13,
        numeral: 'XIII',
        name: 'Death',
        folder: '13_death',
        file: '13_death',
        upright: {
            keywords: ['Endings', 'Transformation', 'Transition', 'Letting go'],
            meaning: 'Not literal death—transformation through ending. Something must die for something new to be born. Necessary transitions and the liberation of release.',
            injection: 'Something ends to make way for transformation. A chapter closes, an old self dies, or necessary change arrives unbidden.'
        },
        reversed: {
            keywords: ['Resistance to change', 'Stagnation', 'Decay', 'Fear of endings'],
            meaning: 'Resisting necessary endings, clinging to what should be released, or the slow decay that comes from refusing to transform.',
            injection: 'Change is resisted though it cannot be stopped. Someone clings to what\'s dying, fears necessary endings, or stagnates.'
        }
    },
    {
        id: 14,
        numeral: 'XIV',
        name: 'Temperance',
        folder: '14_temperance',
        file: '14_temperance',
        upright: {
            keywords: ['Balance', 'Moderation', 'Patience', 'Harmony'],
            meaning: 'The art of balance and blending opposites. Patience, moderation, and the middle path. Alchemy—combining elements into something greater.',
            injection: 'Balance is achieved through patience. Opposing forces harmonize, moderation proves wise, or disparate elements combine beautifully.'
        },
        reversed: {
            keywords: ['Imbalance', 'Excess', 'Lack of harmony', 'Misalignment'],
            meaning: 'Extremes without balance, elements that refuse to blend, or the discord that comes from forcing what should flow naturally.',
            injection: 'Balance tips into excess. Harmony breaks, patience runs out, or forces that should blend instead clash.'
        }
    },
    {
        id: 15,
        numeral: 'XV',
        name: 'The Devil',
        folder: '15_devil',
        file: '15_devil',
        upright: {
            keywords: ['Bondage', 'Addiction', 'Materialism', 'Shadow self'],
            meaning: 'Chains that could be broken but aren\'t. Addiction, obsession, materialism, and the shadow self. The prison whose door stands open.',
            injection: 'Bonds tighten—chosen or not. Addiction, obsession, or shadow aspects emerge. Someone is chained to something they could release.'
        },
        reversed: {
            keywords: ['Breaking free', 'Release', 'Detachment', 'Reclaiming power'],
            meaning: 'Finally breaking unhealthy bonds, facing shadow aspects, or reclaiming power from what once controlled you.',
            injection: 'Chains are broken. Someone confronts their shadow, releases an addiction, or reclaims power they\'d surrendered.'
        }
    },
    {
        id: 16,
        numeral: 'XVI',
        name: 'The Tower',
        folder: '16_theTower',
        file: '16_theTower',
        upright: {
            keywords: ['Upheaval', 'Sudden change', 'Revelation', 'Destruction'],
            meaning: 'Lightning strikes the tower built on false foundations. Sudden upheaval, shocking revelation, necessary destruction. The truth that can\'t be ignored.',
            injection: 'Something shatters. A sudden revelation destroys false beliefs, unexpected disaster strikes, or truth brings everything crashing down.'
        },
        reversed: {
            keywords: ['Avoiding disaster', 'Fear of change', 'Delayed ruin', 'Personal transformation'],
            meaning: 'Disaster narrowly avoided, ruin delayed but not prevented, or the internal upheaval that precedes external change.',
            injection: 'Disaster looms but hasn\'t struck—yet. Someone fears the coming storm, narrowly escapes ruin, or transforms internally first.'
        }
    },
    {
        id: 17,
        numeral: 'XVII',
        name: 'The Star',
        folder: '17_theStar',
        file: '17_theStar',
        upright: {
            keywords: ['Hope', 'Renewal', 'Serenity', 'Inspiration'],
            meaning: 'Light after darkness, hope after despair. Renewal, healing, and the calm that follows the storm. Wishes and quiet faith.',
            injection: 'Hope emerges from darkness. Healing begins, inspiration strikes, or serenity returns after turmoil.'
        },
        reversed: {
            keywords: ['Despair', 'Disconnection', 'Lack of faith', 'Hopelessness'],
            meaning: 'Faith faltering, hope dimming, or disconnection from what once inspired. The stars seem unreachable.',
            injection: 'Hope wavers. Faith fails, inspiration dries up, or despair creeps in where light once shone.'
        }
    },
    {
        id: 18,
        numeral: 'XVIII',
        name: 'The Moon',
        folder: '18_theMoon',
        file: '18_theMoon',
        upright: {
            keywords: ['Illusion', 'Fear', 'Subconscious', 'Intuition'],
            meaning: 'The realm of dreams, fears, and illusions. Things are not as they appear. The subconscious speaks, but its language is strange and shadowed.',
            injection: 'Illusion clouds perception. Fears surface, the subconscious stirs, or things appear other than they are.'
        },
        reversed: {
            keywords: ['Confusion clearing', 'Facing fears', 'Truth revealed', 'Repressed emotions'],
            meaning: 'Illusions dispelled, fears faced, or repressed emotions finally surfacing. The moon\'s light reveals what it once hid.',
            injection: 'Illusions clear or fears are confronted. What was hidden in shadow comes to light, for better or worse.'
        }
    },
    {
        id: 19,
        numeral: 'XIX',
        name: 'The Sun',
        folder: '19_theSun',
        file: '19_theSun',
        upright: {
            keywords: ['Joy', 'Success', 'Vitality', 'Positivity'],
            meaning: 'Pure radiance—joy, success, and warmth. Everything illuminated, nothing hidden. Vitality, celebration, and yes answers.',
            injection: 'Light and warmth break through. Joy arrives, success manifests, or truth is illuminated without shadow.'
        },
        reversed: {
            keywords: ['Temporary setbacks', 'Lack of clarity', 'Sadness', 'Overly optimistic'],
            meaning: 'The sun dimmed but not extinguished. Temporary sadness, clouded joy, or optimism that blinds to real problems.',
            injection: 'Joy is dimmed or delayed. Success falters, optimism blinds to problems, or the light is temporarily obscured.'
        }
    },
    {
        id: 20,
        numeral: 'XX',
        name: 'Judgement',
        folder: '20_judgement',
        file: '20_judgement',
        upright: {
            keywords: ['Judgement', 'Rebirth', 'Reckoning', 'Calling'],
            meaning: 'The trumpet sounds—a call to rise, be judged, and be reborn. Reckoning with the past, answering a higher calling, transformation complete.',
            injection: 'A reckoning arrives. Someone is called to account, answers a higher calling, or rises transformed from their past.'
        },
        reversed: {
            keywords: ['Self-doubt', 'Ignoring the call', 'Avoiding judgement', 'Fear of judgement'],
            meaning: 'Refusing the call, avoiding necessary reckoning, or letting fear of judgement prevent transformation.',
            injection: 'The call goes unanswered. Someone avoids reckoning, ignores their calling, or lets fear prevent rebirth.'
        }
    },
    {
        id: 21,
        numeral: 'XXI',
        name: 'The World',
        folder: '21_theWorld',
        file: '21_theWorld',
        upright: {
            keywords: ['Completion', 'Integration', 'Accomplishment', 'Wholeness'],
            meaning: 'The journey complete, the cycle fulfilled. Integration, accomplishment, and wholeness. The world opens, everything comes together.',
            injection: 'A cycle completes. Wholeness is achieved, a journey reaches its destination, or everything finally comes together.'
        },
        reversed: {
            keywords: ['Incompletion', 'Delays', 'Lack of closure', 'Empty success'],
            meaning: 'So close to completion but not quite there. Delays, lack of closure, or success that feels hollow. The final step remains.',
            injection: 'Completion eludes grasp. Something remains unfinished, closure is denied, or success arrives feeling hollow.'
        }
    }
];

/**
 * Card back info
 */
export const CARD_BACK = {
    folder: '_cardBack',
    file: '_cardBack'
};

/**
 * Get card image path
 * @param {object} card - Card object or CARD_BACK
 * @param {string} size - '1x', '2x', or '5x'
 * @returns {string} Full path to image
 */
export function getCardImagePath(card, size = '2x') {
    return `${CARD_PATH}/${card.folder}/${card.file}_${size}.png`;
}

/**
 * Get card back image path
 * @param {string} size - '1x', '2x', or '5x'
 * @returns {string} Full path to card back image
 */
export function getCardBackPath(size = '2x') {
    return `${CARD_PATH}/${CARD_BACK.folder}/${CARD_BACK.file}_${size}.png`;
}

/**
 * Get a random card
 * @returns {object} Random card from Major Arcana
 */
export function getRandomCard() {
    return MAJOR_ARCANA[Math.floor(Math.random() * MAJOR_ARCANA.length)];
}

/**
 * Draw a random orientation (upright/reversed)
 * @param {number} reversalChance - Chance of reversal (0-100), default 50
 * @returns {boolean} True if reversed
 */
export function drawOrientation(reversalChance = 50) {
    return Math.random() * 100 < reversalChance;
}

/**
 * Draw a card with random orientation
 * @param {number} reversalChance - Chance of reversal (0-100)
 * @returns {object} { card, isReversed }
 */
export function drawCard(reversalChance = 50) {
    return {
        card: getRandomCard(),
        isReversed: drawOrientation(reversalChance)
    };
}
