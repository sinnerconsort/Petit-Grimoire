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
// SPRITE FRAME DIMENSIONS
// ============================================

/**
 * Default sprite size (matches most sprites)
 * The wizard cat sprites appear to be 32x32 pixels
 */
const DEFAULT_FRAME_SIZE = 32;

// ============================================
// FAMILIAR SPRITE REGISTRY
// ============================================

/**
 * Wizard Cat sprite sheets
 * 
 * File inventory:
 *   - IdleCatb.png     (8 frames)  - default idle
 *   - Idle2Catb.png    (12 frames) - alternate idle
 *   - Sleeping.png     (4 frames)  - snoozing
 *   - Sittingb.png     (4 frames)  - sitting
 *   - HurtCatb.png     (8 frames)  - hurt/annoyed
 *   - RunCatb.png      (8 frames)  - running
 *   - FlyingCat.png    (4 frames)  - flying on broom
 *   - Jump.png         (14 frames) - jumping (TALL: 32x64)
 *   - Attack.png       (8 frames)  - attack
 *   - WizardAttack.png (8 frames)  - magic attack
 *   - DieCatb.png      (12 frames) - death
 *   - Die2Catb.png     (14 frames) - death alt (TALL: 32x64)
 * 
 * TALL sprites have double height and need offsetY to center
 */
const FAMILIAR_SPRITES = {
    cat: {
        name: 'Nyx',
        animations: {
            // === MOOD STATES ===
            neutral: {
                src: `${ASSET_PATHS.wizardCat}/IdleCatb.png`,
                frames: 8,
                frameWidth: DEFAULT_FRAME_SIZE,
                frameHeight: DEFAULT_FRAME_SIZE,
                speed: 500
            },
            bored: {
                src: `${ASSET_PATHS.wizardCat}/Sleeping.png`,
                frames: 4,
                frameWidth: DEFAULT_FRAME_SIZE,
                frameHeight: DEFAULT_FRAME_SIZE,
                speed: 800
            },
            annoyed: {
                src: `${ASSET_PATHS.wizardCat}/HurtCatb.png`,
                frames: 8,
                frameWidth: DEFAULT_FRAME_SIZE,
                frameHeight: DEFAULT_FRAME_SIZE,
                speed: 300
            },
            amused: {
                src: `${ASSET_PATHS.wizardCat}/RunCatb.png`,
                frames: 8,
                frameWidth: DEFAULT_FRAME_SIZE,
                frameHeight: DEFAULT_FRAME_SIZE,
                speed: 120
            },
            delighted: {
                src: `${ASSET_PATHS.wizardCat}/FlyingCat.png`,
                frames: 4,
                frameWidth: DEFAULT_FRAME_SIZE,
                frameHeight: DEFAULT_FRAME_SIZE,
                speed: 150
            },

            // === EXTRA ANIMATIONS ===
            idle2: {
                src: `${ASSET_PATHS.wizardCat}/Idle2Catb.png`,
                frames: 12,
                frameWidth: DEFAULT_FRAME_SIZE,
                frameHeight: DEFAULT_FRAME_SIZE,
                speed: 500
            },
            sitting: {
                src: `${ASSET_PATHS.wizardCat}/Sittingb.png`,
                frames: 4,
                frameWidth: DEFAULT_FRAME_SIZE,
                frameHeight: DEFAULT_FRAME_SIZE,
                speed: 600
            },
            flying: {
                src: `${ASSET_PATHS.wizardCat}/FlyingCat.png`,
                frames: 4,
                frameWidth: DEFAULT_FRAME_SIZE,
                frameHeight: DEFAULT_FRAME_SIZE,
                speed: 150
            },
            attack: {
                src: `${ASSET_PATHS.wizardCat}/Attack.png`,
                frames: 8,
                frameWidth: DEFAULT_FRAME_SIZE,
                frameHeight: DEFAULT_FRAME_SIZE,
                speed: 100
            },
            wizardAttack: {
                src: `${ASSET_PATHS.wizardCat}/WizardAttack.png`,
                frames: 8,
                frameWidth: DEFAULT_FRAME_SIZE,
                frameHeight: DEFAULT_FRAME_SIZE,
                speed: 100
            },

            // === TALL SPRITES (double height) ===
            jump: {
                src: `${ASSET_PATHS.wizardCat}/Jump.png`,
                frames: 14,
                frameWidth: DEFAULT_FRAME_SIZE,
                frameHeight: DEFAULT_FRAME_SIZE * 2,  // 64px tall
                speed: 80,
                offsetY: -DEFAULT_FRAME_SIZE / 2      // Shift up to center
            },
            die: {
                src: `${ASSET_PATHS.wizardCat}/DieCatb.png`,
                frames: 12,
                frameWidth: DEFAULT_FRAME_SIZE,
                frameHeight: DEFAULT_FRAME_SIZE,
                speed: 150
            },
            die2: {
                src: `${ASSET_PATHS.wizardCat}/Die2Catb.png`,
                frames: 14,
                frameWidth: DEFAULT_FRAME_SIZE,
                frameHeight: DEFAULT_FRAME_SIZE * 2,  // 64px tall
                speed: 150,
                offsetY: -DEFAULT_FRAME_SIZE / 2      // Shift up to center
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

    // Return with defaults filled in
    return {
        src: anim.src,
        frames: anim.frames,
        frameWidth: anim.frameWidth || DEFAULT_FRAME_SIZE,
        frameHeight: anim.frameHeight || DEFAULT_FRAME_SIZE,
        speed: anim.speed || 500,
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
 * Get all available mood states for a familiar.
 * @param {string} familiar - Form key
 * @returns {string[]}
 */
export function getAvailableMoods(familiar) {
    const data = FAMILIAR_SPRITES[familiar];
    if (!data) return ['neutral'];
    return Object.keys(data.animations);
}

/**
 * Get the default frame size for scaling calculations
 * @returns {number}
 */
export function getDefaultFrameSize() {
    return DEFAULT_FRAME_SIZE;
}
