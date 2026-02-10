/**
 * Petit Grimoire — Sprite Registry
 * Maps familiar forms → animation data with embedded base64 sprites.
 */

import { ASSET_PATHS } from '../../core/config.js';

// ============================================
// MOOD HELPERS
// ============================================

/**
 * Get mood text from disposition value
 * @param {number} disposition - 0-100 value
 * @returns {string} Mood name
 */
export function getMoodText(disposition) {
    if (disposition < 20) return 'annoyed';
    if (disposition < 35) return 'bored';
    if (disposition < 60) return 'neutral';
    if (disposition < 80) return 'amused';
    return 'delighted';
}

// ============================================
// FAMILIAR SPRITE REGISTRY
// ============================================

const FAMILIAR_SPRITES = {
    cat: {
        name: 'Nyx',
        animations: {
            neutral: {
                src: `${ASSET_PATHS.wizardCat}/idle.png`,
                frames: 4,
                speed: 600
            },
            bored: {
                src: `${ASSET_PATHS.wizardCat}/sleeping.png`,
                frames: 2,
                speed: 800
            },
            annoyed: {
                src: `${ASSET_PATHS.wizardCat}/hurt.png`,
                frames: 4,
                speed: 400
            },
            amused: {
                src: `${ASSET_PATHS.wizardCat}/run.png`,
                frames: 4,
                speed: 150
            },
            delighted: {
                src: `${ASSET_PATHS.wizardCat}/run.png`,
                frames: 4,
                speed: 100
            }
        }
    }
};

/**
 * Get sprite animation data for a familiar and mood.
 * @param {string} familiar - Form key (e.g., 'cat')
 * @param {string} mood - Mood string from getMoodText()
 * @returns {Object|null} { src, frames, speed }
 */
export function getSpriteAnimation(familiar, mood) {
    const data = FAMILIAR_SPRITES[familiar];
    if (!data) return null;

    const anim = data.animations[mood] || data.animations.neutral;
    if (!anim) return null;

    return anim;
}

/**
 * Check if a familiar has sprite support (vs ASCII-only).
 * @param {string} familiar - Form key
 * @returns {boolean}
 */
export function hasSpriteSupport(familiar) {
    return !!(FAMILIAR_SPRITES[familiar]?.animations?.neutral);
}

/**
 * Get all available mood states for a familiar.
 * @param {string} familiar - Form key
 * @returns {string[]}
 */
export function getAvailableMoods(familiar) {
    const data = FAMILIAR_SPRITES[familiar];
    if (!data) return ['neutral'];
    return Object.keys(data.animations);
}
