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
 * Confirmed: 32x32 per frame
 */
const FRAME_SIZE = 32;

// ============================================
// FAMILIAR SPRITE REGISTRY
// ============================================

/**
 * Wizard Cat sprite sheets - 32x32 per frame
 * 
 *   IdleCatb.png     - 8 frames
 *   Idle2Catb.png    - 12 frames  
 *   Sleeping.png     - 4 frames
 *   Sittingb.png     - 4 frames
 *   HurtCatb.png     - 8 frames
 *   RunCatb.png      - 8 frames
 *   FlyingCat.png    - 4 frames
 *   Attack.png       - 8 frames
 *   WizardAttack.png - 8 frames
 *   Jump.png         - 14 frames (32x64 tall)
 *   DieCatb.png      - 12 frames
 *   Die2Catb.png     - 14 frames (32x64 tall)
 */
const FAMILIAR_SPRITES = {
    cat: {
        name: 'Nyx',
        animations: {
            // === MOOD STATES ===
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

            // === EXTRA ANIMATIONS ===
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

            // === TALL SPRITES (double height) ===
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
 * Check if a familiar has sprite support.
 */
export function hasSpriteSupport(familiar) {
    return !!(FAMILIAR_SPRITES[familiar]?.animations?.neutral);
}

/**
 * Get all available animation names for a familiar.
 */
export function getAvailableMoods(familiar) {
    const data = FAMILIAR_SPRITES[familiar];
    if (!data) return ['neutral'];
    return Object.keys(data.animations);
}

/**
 * Get the base frame size
 */
export function getDefaultFrameSize() {
    return FRAME_SIZE;
}
