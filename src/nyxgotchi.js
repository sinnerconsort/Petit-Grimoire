/**
 * Petit Grimoire — Nyx-gotchi
 * Egg-shaped tamagotchi widget: HTML, sprites, speech bubble, card flash, mood
 *
 * Sprite system: Two rendering modes
 *   1. Sprite Mode — CSS background-position stepping through strip PNGs
 *   2. ASCII Mode  — Text-based fallback (original system)
 *
 * Mode is auto-detected: if the familiar has entries in FAMILIAR_SPRITES,
 * sprite mode is used. Otherwise falls back to ASCII.
 */

import {
    extensionName, extensionSettings,
    spriteInterval, currentSpriteFrame,
    speechTimeout,
    setSpriteInterval, setCurrentSpriteFrame, setSpeechTimeout
} from './state.js';
import { setupFabDrag, applyPosition } from './drag.js';
import { hasSpriteSupport, getSpriteAnimation } from './sprites.js';

// ============================================
// ASCII SPRITE DATA (fallback)
// ============================================

export const SPRITES = {
    cat: {
        neutral: [
`  ╱|、
(˚ˎ 。7
 |、˜〵
じしˍ,)ノ`,
`  ╱|、
(˚ˎ 。7
 |、 〵
じしˍ,)ノ`
        ],
        annoyed: [
`  ╱|、
(￣ ಠ 7
 |、˜〵
じしˍ,)ノ`,
`  ╱|、
(￣ ಠ 7
 |، 〵
じしˍ,)ノ`
        ],
        bored: [
`  ╱|、
(˘ˎ ˘7
 |、 〵
じしˍ,)_`
        ],
        amused: [
`  ╱|、
(๑˃̵ᴗ˂̵)7
 |、˜〵
じしˍ,)ノ`,
`  ╱|、
(๑˃̵ᴗ˂̵)7
 |、 〵
じしˍ,)ノ`
        ],
        delighted: [
`  ╱|、 ✧
(˃ᴗ˂ 。7
 |、˜〵
じしˍ,)ノ✧`,
`  ╱|、✧
(˃ᴗ˂ 。7
 |، 〵
じしˍ,)ノ`
        ]
    }
};

// ============================================
// INTERNAL STATE
// ============================================

/** Track which animation is currently loaded to avoid reloading same strip */
let _currentAnimKey = null;

/** Track current animation data for frame stepping */
let _currentAnim = null;

// ============================================
// MOOD HELPERS
// ============================================

export function getMoodText(disposition) {
    if (disposition < 20) return 'annoyed';
    if (disposition < 35) return 'bored';
    if (disposition < 60) return 'neutral';
    if (disposition < 80) return 'amused';
    return 'delighted';
}

export function getMoodForDisposition(disposition) {
    return getMoodText(disposition);
}

// ============================================
// SPRITE SYSTEM — IMAGE MODE
// ============================================

/**
 * Load a sprite strip onto the sprite element using background-image.
 * Sets up dimensions, background-size, and positions to frame 0.
 *
 * @param {HTMLElement} el - The sprite div
 * @param {Object} anim - Animation data { path, frames, fw, fh, speed }
 */
function loadSpriteStrip(el, anim) {
    el.classList.add('sprite-mode');
    el.textContent = ''; // Clear any ASCII

    // Set the strip as background
    el.style.backgroundImage = `url('${anim.src}')`;
    el.style.backgroundSize = `${anim.frames * anim.fw}px ${anim.fh}px`;
    el.style.width = `${anim.fw}px`;
    el.style.height = `${anim.fh}px`;

    // Start at frame 0
    el.style.backgroundPosition = '0px 0px';
}

/**
 * Step to a specific frame in the current sprite strip.
 * @param {HTMLElement} el - The sprite div
 * @param {number} frame - Frame index
 * @param {number} fw - Frame width in px
 */
function setSpriteFrame(el, frame, fw) {
    el.style.backgroundPosition = `-${frame * fw}px 0px`;
}

// ============================================
// SPRITE SYSTEM — ASCII MODE (fallback)
// ============================================

function getAsciiSprite() {
    const form = extensionSettings.familiarForm || 'cat';
    const mood = getMoodForDisposition(extensionSettings.nyx.disposition);

    const formSprites = SPRITES[form] || SPRITES.cat;
    const moodFrames = formSprites[mood] || formSprites.neutral;

    if (!moodFrames || moodFrames.length === 0) {
        return SPRITES.cat.neutral[0];
    }

    return moodFrames[currentSpriteFrame % moodFrames.length];
}

// ============================================
// UNIFIED DISPLAY UPDATE
// ============================================

/**
 * Update the sprite display. Auto-detects mode:
 * - If familiar has sprite support → image mode (background-position)
 * - Otherwise → ASCII text mode
 *
 * Called on: init, mood change, frame tick, familiar change
 */
export function updateSpriteDisplay() {
    const sprite = document.getElementById('nyxgotchi-sprite');
    if (!sprite) return;

    const form = extensionSettings.familiarForm || 'cat';
    const mood = getMoodForDisposition(extensionSettings.nyx.disposition);

    // ── Image sprite mode ──
    if (hasSpriteSupport(form)) {
        const anim = getSpriteAnimation(form, mood);
        if (!anim) return;

        const animKey = `${form}:${mood}`;

        // Only reload the strip if animation changed
        if (_currentAnimKey !== animKey) {
            _currentAnimKey = animKey;
            _currentAnim = anim;
            loadSpriteStrip(sprite, anim);
            setCurrentSpriteFrame(0);

            // Restart animation loop with new speed
            _restartAnimLoop(anim.speed);
        }

        // Step to current frame
        const frame = currentSpriteFrame % anim.frames;
        setSpriteFrame(sprite, frame, anim.fw);

    // ── ASCII fallback mode ──
    } else {
        sprite.classList.remove('sprite-mode');
        sprite.style.backgroundImage = '';
        sprite.style.width = '';
        sprite.style.height = '';
        sprite.textContent = getAsciiSprite();
    }
}

// ============================================
// ANIMATION LOOP
// ============================================

/**
 * Restart the frame-stepping interval with a new speed.
 * @param {number} speed - ms per frame
 */
function _restartAnimLoop(speed) {
    stopSpriteAnimation();

    setSpriteInterval(setInterval(() => {
        setCurrentSpriteFrame(currentSpriteFrame + 1);
        updateSpriteDisplay();
    }, speed));
}

export function startSpriteAnimation() {
    stopSpriteAnimation();
    updateSpriteDisplay();

    // If in sprite mode, speed comes from animation data
    if (_currentAnim) {
        _restartAnimLoop(_currentAnim.speed);
    } else {
        // ASCII mode: fixed 2s cycle
        setSpriteInterval(setInterval(() => {
            setCurrentSpriteFrame(currentSpriteFrame + 1);
            updateSpriteDisplay();
        }, 2000));
    }
}

export function stopSpriteAnimation() {
    if (spriteInterval) {
        clearInterval(spriteInterval);
        setSpriteInterval(null);
    }
}

// ============================================
// SPEECH BUBBLE
// ============================================

export function showSpeech(text, duration = 4000) {
    const speech = document.getElementById('nyxgotchi-speech');
    if (!speech) return;

    clearTimeout(speechTimeout);

    const textEl = speech.querySelector('.nyxgotchi-speech-text');
    if (textEl) textEl.textContent = text;
    speech.classList.add('visible');

    setSpeechTimeout(setTimeout(() => {
        speech.classList.remove('visible');
    }, duration));
}

// ============================================
// CARD FLASH
// ============================================

export function showCardFlash() {
    const flash = document.getElementById('nyxgotchi-flash');
    if (!flash) return;

    flash.classList.remove('active');
    void flash.offsetWidth; // Force reflow
    flash.classList.add('active');
    setTimeout(() => flash.classList.remove('active'), 1600);
}

// ============================================
// NYX MOOD UPDATE
// ============================================

export function updateNyxMood() {
    const disposition = extensionSettings.nyx.disposition;
    const mood = getMoodText(disposition);

    $('#nyxgotchi-mood').text(mood);
    $('#nyxgotchi-disposition').text(disposition);

    // Reset animation state for mood change
    _currentAnimKey = null; // Force strip reload
    setCurrentSpriteFrame(0);
    updateSpriteDisplay();

    // Apply mood class to sprite for CSS movement overlays
    const sprite = document.getElementById('nyxgotchi-sprite');
    if (sprite) {
        // Preserve sprite-mode class, reset mood classes
        const isSpriteMode = sprite.classList.contains('sprite-mode');
        sprite.className = 'nyxgotchi-sprite';
        if (isSpriteMode) sprite.classList.add('sprite-mode');
        if (mood !== 'neutral') {
            sprite.classList.add(`mood-${mood}`);
        }
    }

    const heart = $('#nyxgotchi-heart');
    if (disposition >= 60) {
        heart.addClass('invested');
    } else {
        heart.removeClass('invested');
    }
}

// ============================================
// PLAY SPECIAL ANIMATION
// ============================================

/**
 * Temporarily play a special animation (e.g. spell cast on card draw).
 * Reverts to mood-based animation after it completes one cycle.
 *
 * @param {string} animName - Key from FAMILIAR_SPRITES animations (e.g. 'special', 'flying')
 * @param {number} [holdCycles=1] - How many full cycles to play before reverting
 */
export function playSpecialAnimation(animName, holdCycles = 1) {
    const form = extensionSettings.familiarForm || 'cat';
    if (!hasSpriteSupport(form)) return;

    const anim = getSpriteAnimation(form, animName);
    if (!anim) return;

    const sprite = document.getElementById('nyxgotchi-sprite');
    if (!sprite) return;

    // Load the special animation
    loadSpriteStrip(sprite, anim);
    setCurrentSpriteFrame(0);
    _currentAnimKey = `${form}:${animName}:special`; // Unique key so mood change will override
    _currentAnim = anim;

    // Stop current loop, start special loop
    stopSpriteAnimation();
    const totalFrames = anim.frames * holdCycles;
    let frameCount = 0;

    setSpriteInterval(setInterval(() => {
        frameCount++;
        setCurrentSpriteFrame(frameCount);
        setSpriteFrame(sprite, frameCount % anim.frames, anim.fw);

        // After full cycle(s), revert to mood animation
        if (frameCount >= totalFrames) {
            _currentAnimKey = null; // Force reload on next update
            startSpriteAnimation();
        }
    }, anim.speed));
}

// ============================================
// TAMA HTML (Egg Shell Design)
// ============================================

export function getTamaHTML() {
    const disposition = extensionSettings.nyx.disposition;
    const mood = getMoodText(disposition);
    return `
        <div class="nyxgotchi" id="nyxgotchi"
             data-mg-theme="${extensionSettings.shellTheme}"
             data-mg-size="${extensionSettings.tamaSize || 'medium'}">

            <!-- Speech bubble (appears above on commentary) -->
            <div class="nyxgotchi-speech" id="nyxgotchi-speech">
                <span class="nyxgotchi-speech-text">Hello, mortal.</span>
            </div>

            <!-- Keychain loop -->
            <div class="nyxgotchi-chain">
                <div class="nyxgotchi-chain-link"></div>
                <div class="nyxgotchi-chain-link"></div>
                <div class="nyxgotchi-chain-link"></div>
            </div>

            <!-- Egg shell -->
            <div class="nyxgotchi-shell">

                <!-- Shell decorations (CSS fills content per theme) -->
                <div class="nyxgotchi-decorations">
                    <span class="nyxgotchi-deco nyxgotchi-deco--1"></span>
                    <span class="nyxgotchi-deco nyxgotchi-deco--2"></span>
                    <span class="nyxgotchi-deco nyxgotchi-deco--3"></span>
                    <span class="nyxgotchi-deco nyxgotchi-deco--4"></span>
                    <span class="nyxgotchi-deco nyxgotchi-deco--5"></span>
                    <span class="nyxgotchi-deco nyxgotchi-deco--6"></span>
                </div>

                <!-- Screen frame (colored border like real Tamas) -->
                <div class="nyxgotchi-screen-frame">

                    <!-- LCD Screen -->
                    <div class="nyxgotchi-screen">

                        <!-- Status bar -->
                        <div class="nyxgotchi-status">
                            <div class="nyxgotchi-status-item">
                                <span class="nyxgotchi-heart" id="nyxgotchi-heart">♥</span>
                                <span id="nyxgotchi-disposition">${disposition}</span>
                            </div>
                            <div class="nyxgotchi-status-item">
                                <span class="nyxgotchi-queue-badge" id="nyxgotchi-queue">Q:0</span>
                            </div>
                        </div>

                        <!-- Sprite area -->
                        <div class="nyxgotchi-sprite-area">
                            <div class="nyxgotchi-sprite" id="nyxgotchi-sprite"></div>

                            <!-- Card flash overlay -->
                            <div class="nyxgotchi-card-flash" id="nyxgotchi-flash">
                                <span class="card-icon">🌟</span>
                            </div>
                        </div>

                        <!-- Mood text -->
                        <div class="nyxgotchi-mood" id="nyxgotchi-mood">${mood}</div>

                    </div>

                </div><!-- end screen-frame -->

                <!-- Buttons -->
                <div class="nyxgotchi-buttons">
                    <button class="nyxgotchi-button" data-action="draw" id="nyxgotchi-btn-draw"></button>
                    <button class="nyxgotchi-button nyxgotchi-button--middle" data-action="queue" id="nyxgotchi-btn-queue"></button>
                    <button class="nyxgotchi-button" data-action="poke" id="nyxgotchi-btn-poke"></button>
                </div>

            </div><!-- end shell -->

        </div><!-- end nyxgotchi -->
    `;
}

// ============================================
// TAMA CREATION
// ============================================

/**
 * Create tama widget and append to DOM.
 * @param {Object} callbacks - Button click handlers
 * @param {Function} callbacks.onDraw
 * @param {Function} callbacks.onQueue
 * @param {Function} callbacks.onPoke
 */
export function createTama(callbacks = {}) {
    $('#nyxgotchi').remove();

    // Reset animation state on recreate
    _currentAnimKey = null;
    _currentAnim = null;

    $('body').append(getTamaHTML());

    const $tama = $('#nyxgotchi');
    if ($tama.length === 0) {
        console.error(`[${extensionName}] Failed to create tama`);
        return;
    }

    const tamaEl = $tama[0];

    // Force critical display properties
    tamaEl.style.setProperty('position', 'fixed', 'important');
    tamaEl.style.setProperty('z-index', '2147483647', 'important');
    tamaEl.style.setProperty('display', 'flex', 'important');
    tamaEl.style.setProperty('visibility', 'visible', 'important');
    tamaEl.style.setProperty('opacity', '1', 'important');
    tamaEl.style.setProperty('pointer-events', 'auto', 'important');

    applyPosition('nyxgotchi', 'tamaPosition');

    setupFabDrag('nyxgotchi', 'tama', 'tamaPosition');

    // Tama buttons → wired to callbacks from index.js
    $('#nyxgotchi-btn-draw').on('click', (e) => {
        e.stopPropagation();
        if (callbacks.onDraw) callbacks.onDraw();
    });

    $('#nyxgotchi-btn-queue').on('click', (e) => {
        e.stopPropagation();
        if (callbacks.onQueue) callbacks.onQueue();
    });

    $('#nyxgotchi-btn-poke').on('click', (e) => {
        e.stopPropagation();
        if (callbacks.onPoke) callbacks.onPoke();
    });

    // Respect visibility setting
    if (!extensionSettings.showTama) {
        tamaEl.style.setProperty('display', 'none', 'important');
    }

    startSpriteAnimation();

    const form = extensionSettings.familiarForm || 'cat';
    const mode = hasSpriteSupport(form) ? 'sprite' : 'ASCII';
    console.log(`[${extensionName}] Nyxgotchi created (${mode} mode: ${form})`);
}
