/**
 * Petit Grimoire — Sprite Registry
 * Maps familiar forms → animation strips with frame data.
 * Each animation: { file, frames, fw, fh, speed (ms per frame) }
 *
 * Sprites live in: assets/sprites/{familiar}/
 * Format: horizontal strips, all frames same size, left-to-right
 */

import { extensionFolderPath } from './state.js';

// ============================================
// SPRITE DEFINITIONS
// ============================================

/**
 * Registry of all sprite animations per familiar form.
 * Keys match mood strings from getMoodText() + special states.
 *
 * Mood mapping (disposition → mood → animation):
 *   annoyed   → hurt/upset expression
 *   bored     → sitting idle
 *   neutral   → standard idle loop
 *   amused    → playful movement
 *   delighted → excited/magical action
 *
 * Special states (triggered by events, not disposition):
 *   sleeping  → zzz loop
 *   special   → spell cast / card draw
 *   flying    → travel / transition
 *   dying     → critical state
 */
export const FAMILIAR_SPRITES = {
    cat: {
        folder: 'wizard-cat',
        animations: {
            // ── Mood-mapped (disposition-driven) ──
            neutral:   { file: 'IdleCatb.png',      frames: 7,  fw: 32, fh: 32, speed: 200 },
            annoyed:   { file: 'HurtCatb.png',       frames: 7,  fw: 32, fh: 32, speed: 200 },
            bored:     { file: 'Sittingb.png',       frames: 3,  fw: 32, fh: 32, speed: 400 },
            amused:    { file: 'RunCatb.png',        frames: 7,  fw: 32, fh: 32, speed: 150 },
            delighted: { file: 'WizardAttack.png',   frames: 7,  fw: 32, fh: 32, speed: 180 },

            // ── Special states (event-triggered) ──
            sleeping:  { file: 'Sleeping.png',       frames: 3,  fw: 32, fh: 32, speed: 500 },
            special:   { file: 'WizardAttack.png',   frames: 7,  fw: 32, fh: 32, speed: 120 },
            flying:    { file: 'FlyingCat.png',      frames: 3,  fw: 32, fh: 32, speed: 200 },
            dying:     { file: 'DieCatb.png',        frames: 15, fw: 32, fh: 32, speed: 200 },
            dyingAlt:  { file: 'Die2Catb.png',       frames: 14, fw: 32, fh: 32, speed: 200 },
            neutralAlt:{ file: 'Idle2Catb.png',      frames: 14, fw: 32, fh: 32, speed: 150 },
        }
    }
    // Future familiars: owl, fox, bunny
    // Just add their folder + animations here
};


// ============================================
// PATH HELPERS
// ============================================

/**
 * Get the full URL for a sprite strip file.
 * @param {string} familiar - Form key (e.g. 'cat')
 * @param {string} filename - Strip filename (e.g. 'IdleCatb.png')
 * @returns {string} Full path from extension root
 */
export function getSpritePath(familiar, filename) {
    const data = FAMILIAR_SPRITES[familiar];
    if (!data) return null;
    return `${extensionFolderPath}/assets/sprites/${data.folder}/${filename}`;
}

/**
 * Get animation data for a familiar + mood combo.
 * Falls back to neutral, then returns null if no sprites exist.
 * @param {string} familiar - Form key
 * @param {string} mood - Mood string from getMoodText()
 * @returns {Object|null} { file, frames, fw, fh, speed, path }
 */
export function getSpriteAnimation(familiar, mood) {
    const data = FAMILIAR_SPRITES[familiar];
    if (!data) return null;

    const anim = data.animations[mood] || data.animations.neutral;
    if (!anim) return null;

    return {
        ...anim,
        path: getSpritePath(familiar, anim.file)
    };
}

/**
 * Check if a familiar has sprite support (vs ASCII-only).
 * @param {string} familiar - Form key
 * @returns {boolean}
 */
export function hasSpriteSupport(familiar) {
    return !!(FAMILIAR_SPRITES[familiar]?.animations?.neutral);
}
