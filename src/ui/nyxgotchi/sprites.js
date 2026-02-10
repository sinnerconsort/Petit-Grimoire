/**
 * Petit Grimoire — Sprite Registry
 * Maps familiar forms → animation data
 * 
 * Wizard Cat sprites from: assets/sprites/wizard-cat/
 * 
 * Frame counts verified against actual PNG dimensions:
 *   IdleCatb.png     - 224x32  → 7 frames  (32x32)
 *   Idle2Catb.png    - 448x32  → 14 frames (32x32)
 *   Sleeping.png     - 96x32   → 3 frames  (32x32)
 *   Sittingb.png     - 96x32   → 3 frames  (32x32)
 *   HurtCatb.png     - 224x32  → 7 frames  (32x32)
 *   RunCatb.png      - 224x32  → 7 frames  (32x32)
 *   FlyingCat.png    - 96x32   → 3 frames  (32x32)
 *   Attack.png       - 288x64  → 9 frames  (32x64 tall!)
 *   WizardAttack.png - 224x32  → 7 frames  (32x32)
 *   Jump.png         - 416x64  → 13 frames (32x64 tall!)
 *   DieCatb.png      - 480x32  → 15 frames (32x32)
 *   Die2Catb.png     - 448x32  → 14 frames (32x32, NOT tall)
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
 * All sheets are 32px wide per frame.
 * Most are 32px tall; Attack and Jump are 64px tall.
 */
const FRAME_W = 32;
const FRAME_H = 32;
const FRAME_H_TALL = 64;

// ============================================
// FAMILIAR SPRITE REGISTRY
// ============================================

const FAMILIAR_SPRITES = {
    cat: {
        name: 'Nyx',
        animations: {
            // === MOOD STATES ===
            neutral: {
                src: `${ASSET_PATHS.wizardCat}/IdleCatb.png`,
                frames: 7,            // 224 / 32 = 7
                frameWidth: FRAME_W,
                frameHeight: FRAME_H,
                speed: 400
            },
            bored: {
                src: `${ASSET_PATHS.wizardCat}/Sleeping.png`,
                frames: 3,            // 96 / 32 = 3
                frameWidth: FRAME_W,
                frameHeight: FRAME_H,
                speed: 700
            },
            annoyed: {
                src: `${ASSET_PATHS.wizardCat}/HurtCatb.png`,
                frames: 7,            // 224 / 32 = 7
                frameWidth: FRAME_W,
                frameHeight: FRAME_H,
                speed: 250
            },
            amused: {
                src: `${ASSET_PATHS.wizardCat}/RunCatb.png`,
                frames: 7,            // 224 / 32 = 7
                frameWidth: FRAME_W,
                frameHeight: FRAME_H,
                speed: 100
            },
            delighted: {
                src: `${ASSET_PATHS.wizardCat}/FlyingCat.png`,
                frames: 3,            // 96 / 32 = 3
                frameWidth: FRAME_W,
                frameHeight: FRAME_H,
                speed: 150
            },

            // === EXTRA ANIMATIONS ===
            idle2: {
                src: `${ASSET_PATHS.wizardCat}/Idle2Catb.png`,
                frames: 14,           // 448 / 32 = 14
                frameWidth: FRAME_W,
                frameHeight: FRAME_H,
                speed: 400
            },
            sitting: {
                src: `${ASSET_PATHS.wizardCat}/Sittingb.png`,
                frames: 3,            // 96 / 32 = 3
                frameWidth: FRAME_W,
                frameHeight: FRAME_H,
                speed: 500
            },
            flying: {
                src: `${ASSET_PATHS.wizardCat}/FlyingCat.png`,
                frames: 3,            // 96 / 32 = 3
                frameWidth: FRAME_W,
                frameHeight: FRAME_H,
                speed: 150
            },
            attack: {
                src: `${ASSET_PATHS.wizardCat}/Attack.png`,
                frames: 9,            // 288 / 32 = 9
                frameWidth: FRAME_W,
                frameHeight: FRAME_H_TALL,  // 64px tall!
                speed: 80,
                offsetY: -FRAME_W / 2       // -16, shift up so feet stay grounded
            },
            wizardAttack: {
                src: `${ASSET_PATHS.wizardCat}/WizardAttack.png`,
                frames: 7,            // 224 / 32 = 7
                frameWidth: FRAME_W,
                frameHeight: FRAME_H,
                speed: 80
            },
            run: {
                src: `${ASSET_PATHS.wizardCat}/RunCatb.png`,
                frames: 7,            // 224 / 32 = 7
                frameWidth: FRAME_W,
                frameHeight: FRAME_H,
                speed: 80
            },

            // === TALL SPRITES ===
            jump: {
                src: `${ASSET_PATHS.wizardCat}/Jump.png`,
                frames: 13,           // 416 / 32 = 13
                frameWidth: FRAME_W,
                frameHeight: FRAME_H_TALL,  // 64px tall
                speed: 70,
                offsetY: -FRAME_W / 2       // -16
            },

            // === DEATH ANIMATIONS (both 32px tall) ===
            die: {
                src: `${ASSET_PATHS.wizardCat}/DieCatb.png`,
                frames: 15,           // 480 / 32 = 15
                frameWidth: FRAME_W,
                frameHeight: FRAME_H,
                speed: 120
            },
            die2: {
                src: `${ASSET_PATHS.wizardCat}/Die2Catb.png`,
                frames: 14,           // 448 / 32 = 14
                frameWidth: FRAME_W,
                frameHeight: FRAME_H, // 32px tall, NOT 64!
                speed: 120
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
        frameWidth: anim.frameWidth || FRAME_W,
        frameHeight: anim.frameHeight || FRAME_H,
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
    return FRAME_W;
}
