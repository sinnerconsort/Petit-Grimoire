/**
 * Petit Grimoire — Sprite Registry
 * Maps familiar forms → animation data
 * 
 * Wizard Cat sprites from: assets/sprites/wizard-cat/
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
// SPRITE CONSTANTS
// ============================================

/**
 * Base frame size for wizard cat sprites
 * All standard sprites are 32x32, tall ones are 32x64
 */
const FRAME_SIZE = 32;

// ============================================
// FAMILIAR SPRITE REGISTRY
// ============================================

/**
 * Wizard Cat sprite sheets - verified frame counts:
 * 
 *   IdleCatb.png     - 8 frames  (32x32 each)
 *   Idle2Catb.png    - 12 frames (32x32 each)  
 *   Sleeping.png     - 4 frames  (32x32 each)
 *   Sittingb.png     - 4 frames  (32x32 each)
 *   HurtCatb.png     - 8 frames  (32x32 each)
 *   RunCatb.png      - 8 frames  (32x32 each)
 *   FlyingCat.png    - 4 frames  (32x32 each)
 *   Attack.png       - 8 frames  (32x32 each)
 *   WizardAttack.png - 8 frames  (32x32 each)
 *   Jump.png         - 14 frames (32x64 each) TALL
 *   DieCatb.png      - 12 frames (32x32 each)
 *   Die2Catb.png     - 14 frames (32x64 each) TALL
 */
const FAMILIAR_SPRITES = {
    cat: {
        name: 'Nyx',
        animations: {
            // === MOOD STATES (used by disposition system) ===
            neutral: {
                src: `${ASSET_PATHS.wizardCat}/IdleCatb.png`,
                frames: 8,
                frameWidth: FRAME_SIZE,
                frameHeight: FRAME_SIZE,
                speed: 400
            },
            bored: {
                src: `${ASSET_PATHS.wizardCat}/Sleeping.png`,
                frames: 4,
                frameWidth: FRAME_SIZE,
                frameHeight: FRAME_SIZE,
                speed: 700
            },
            annoyed: {
                src: `${ASSET_PATHS.wizardCat}/HurtCatb.png`,
                frames: 8,
                frameWidth: FRAME_SIZE,
                frameHeight: FRAME_SIZE,
                speed: 250
            },
            amused: {
                src: `${ASSET_PATHS.wizardCat}/RunCatb.png`,
                frames: 8,
                frameWidth: FRAME_SIZE,
                frameHeight: FRAME_SIZE,
                speed: 100
            },
            delighted: {
                src: `${ASSET_PATHS.wizardCat}/FlyingCat.png`,
                frames: 4,
                frameWidth: FRAME_SIZE,
                frameHeight: FRAME_SIZE,
                speed: 150
            },

            // === EXTRA ANIMATIONS (for special events) ===
            idle2: {
                src: `${ASSET_PATHS.wizardCat}/Idle2Catb.png`,
                frames: 12,
                frameWidth: FRAME_SIZE,
                frameHeight: FRAME_SIZE,
                speed: 400
            },
            sitting: {
                src: `${ASSET_PATHS.wizardCat}/Sittingb.png`,
                frames: 4,
                frameWidth: FRAME_SIZE,
                frameHeight: FRAME_SIZE,
                speed: 500
            },
            flying: {
                src: `${ASSET_PATHS.wizardCat}/FlyingCat.png`,
                frames: 4,
                frameWidth: FRAME_SIZE,
                frameHeight: FRAME_SIZE,
                speed: 150
            },
            attack: {
                src: `${ASSET_PATHS.wizardCat}/Attack.png`,
                frames: 8,
                frameWidth: FRAME_SIZE,
                frameHeight: FRAME_SIZE,
                speed: 80
            },
            wizardAttack: {
                src: `${ASSET_PATHS.wizardCat}/WizardAttack.png`,
                frames: 8,
                frameWidth: FRAME_SIZE,
                frameHeight: FRAME_SIZE,
                speed: 80
            },
            run: {
                src: `${ASSET_PATHS.wizardCat}/RunCatb.png`,
                frames: 8,
                frameWidth: FRAME_SIZE,
                frameHeight: FRAME_SIZE,
                speed: 80
            },

            // === TALL SPRITES (double height, need offset) ===
            jump: {
                src: `${ASSET_PATHS.wizardCat}/Jump.png`,
                frames: 14,
                frameWidth: FRAME_SIZE,
                frameHeight: FRAME_SIZE * 2,
                speed: 70,
                offsetY: -FRAME_SIZE / 2
            },
            die: {
                src: `${ASSET_PATHS.wizardCat}/DieCatb.png`,
                frames: 12,
                frameWidth: FRAME_SIZE,
                frameHeight: FRAME_SIZE,
                speed: 120
            },
            die2: {
                src: `${ASSET_PATHS.wizardCat}/Die2Catb.png`,
                frames: 14,
                frameWidth: FRAME_SIZE,
                frameHeight: FRAME_SIZE * 2,
                speed: 120,
                offsetY: -FRAME_SIZE / 2
            }
        }
    }
};

/**
 * Get sprite animation data for a familiar and mood.
 * @param {string} familiar - Form key (e.g., 'cat')
 * @param {string} mood - Mood string from getMoodText() or animation name
 * @returns {Object|null} { src, frames, frameWidth, frameHeight, speed, offsetY? }
 */
export function getSpriteAnimation(familiar, mood) {
    const data = FAMILIAR_SPRITES[familiar];
    if (!data) return null;

    const anim = data.animations[mood] || data.animations.neutral;
    if (!anim) return null;

    return {
        src: anim.src,
        frames: anim.frames,
        frameWidth: anim.frameWidth || FRAME_SIZE,
        frameHeight: anim.frameHeight || FRAME_SIZE,
        speed: anim.speed || 400,
        offsetY: anim.offsetY || 0
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

/**
 * Get all available animation names for a familiar.
 * @param {string} familiar - Form key
 * @returns {string[]}
 */
export function getAvailableMoods(familiar) {
    const data = FAMILIAR_SPRITES[familiar];
    if (!data) return ['neutral'];
    return Object.keys(data.animations);
}

/**
 * Get the base frame size
 * @returns {number}
 */
export function getDefaultFrameSize() {
    return FRAME_SIZE;
}
