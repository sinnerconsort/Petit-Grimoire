/**
 * Petit Grimoire — Nyx-gotchi
 * Tama widget: HTML, sprites, speech bubble, card flash, mood
 */

import {
    extensionName, extensionSettings,
    spriteInterval, currentSpriteFrame,
    speechTimeout,
    setSpriteInterval, setCurrentSpriteFrame, setSpeechTimeout
} from './state.js';
import { setupFabDrag, applyPosition } from './drag.js';

// ============================================
// SPRITE DATA
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
// SPRITE SYSTEM
// ============================================

export function getCurrentSprite() {
    const form = extensionSettings.familiarForm || 'cat';
    const mood = getMoodForDisposition(extensionSettings.nyx.disposition);

    const formSprites = SPRITES[form] || SPRITES.cat;
    const moodFrames = formSprites[mood] || formSprites.neutral;

    if (!moodFrames || moodFrames.length === 0) {
        return SPRITES.cat.neutral[0];
    }

    return moodFrames[currentSpriteFrame % moodFrames.length];
}

export function updateSpriteDisplay() {
    const sprite = document.getElementById('mg-tama-sprite');
    if (sprite) {
        sprite.textContent = getCurrentSprite();
    }
}

export function startSpriteAnimation() {
    stopSpriteAnimation();
    updateSpriteDisplay();

    setSpriteInterval(setInterval(() => {
        setCurrentSpriteFrame(currentSpriteFrame + 1);
        updateSpriteDisplay();
    }, 2000));
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
    const speech = document.getElementById('mg-speech');
    if (!speech) return;

    clearTimeout(speechTimeout);

    const textEl = speech.querySelector('.mg-thought-text');
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
    const flash = document.getElementById('mg-tama-flash');
    if (!flash) return;

    flash.classList.remove('visible');
    void flash.offsetWidth; // Force reflow
    flash.classList.add('visible');
    setTimeout(() => flash.classList.remove('visible'), 600);
}

// ============================================
// NYX MOOD UPDATE
// ============================================

export function updateNyxMood() {
    const disposition = extensionSettings.nyx.disposition;
    const mood = getMoodText(disposition);

    $('#mg-tama-mood').text(mood);
    $('#mg-tama-disposition').text(disposition);

    setCurrentSpriteFrame(0);
    updateSpriteDisplay();

    const heart = $('#mg-tama-heart');
    if (disposition >= 60) {
        heart.addClass('invested');
    } else {
        heart.removeClass('invested');
    }
}

// ============================================
// TAMA HTML
// ============================================

export function getTamaHTML() {
    const disposition = extensionSettings.nyx.disposition;
    return `
        <div class="mg-fab mg-tama" id="mg-tama"
             data-mg-theme="${extensionSettings.shellTheme}"
             data-mg-size="${extensionSettings.tamaSize || 'medium'}">
            <!-- Thought bubble -->
            <div class="mg-thought" id="mg-speech">
                <span class="mg-thought-text">Hello, mortal.</span>
            </div>
            <div class="mg-tama-shell">
                <div class="mg-tama-antenna"></div>

                <div class="mg-tama-screen">
                    <div class="mg-tama-scanlines"></div>

                    <div class="mg-tama-status">
                        <span class="mg-tama-stat">
                            <svg width="8" height="10" viewBox="0 0 12 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="2" y="0.5" width="8" height="11" rx="1"/>
                                <rect x="0.5" y="2.5" width="8" height="11" rx="1"/>
                            </svg>
                            <span id="mg-tama-queue">0</span>
                        </span>
                        <span class="mg-tama-stat mg-tama-heart" id="mg-tama-heart">
                            <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" stroke="none">
                                <path d="M8 14s-5.5-4.5-6.5-7C.5 4.5 2 2 4.5 2 6 2 7.5 3.5 8 4.5 8.5 3.5 10 2 11.5 2 14 2 15.5 4.5 14.5 7 13.5 9.5 8 14 8 14z"/>
                            </svg>
                        </span>
                        <span class="mg-tama-stat">
                            <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" stroke="none">
                                <path d="M8 0l2.5 5 5.5.8-4 3.9.9 5.5L8 12.5 3.1 15.2l.9-5.5-4-3.9L5.5 5z"/>
                            </svg>
                            <span id="mg-tama-disposition">${disposition}</span>
                        </span>
                    </div>

                    <div class="mg-tama-sprite" id="mg-tama-sprite"></div>

                    <div class="mg-tama-flash" id="mg-tama-flash">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="1" width="14" height="20" rx="2"/>
                            <path d="M10 7l-2 4h4l-2 4"/>
                        </svg>
                    </div>

                    <div class="mg-tama-mood" id="mg-tama-mood">${getMoodText(disposition)}</div>
                </div>

                <div class="mg-tama-buttons">
                    <button class="mg-tama-btn" id="mg-tama-btn-draw" title="Draw Card">
                        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="1" width="10" height="14" rx="1.5"/>
                            <path d="M6 5.5l-1 2.5h3l-1 2.5"/>
                        </svg>
                    </button>
                    <button class="mg-tama-btn" id="mg-tama-btn-queue" title="Queue">
                        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="4" y1="3" x2="13" y2="3"/>
                            <line x1="4" y1="8" x2="13" y2="8"/>
                            <line x1="4" y1="13" x2="13" y2="13"/>
                            <circle cx="1.5" cy="3" r="0.75" fill="currentColor"/>
                            <circle cx="1.5" cy="8" r="0.75" fill="currentColor"/>
                            <circle cx="1.5" cy="13" r="0.75" fill="currentColor"/>
                        </svg>
                    </button>
                    <button class="mg-tama-btn" id="mg-tama-btn-poke" title="Poke Nyx">
                        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M10 1v6M7.5 4v5M12.5 4v5M5 7v4"/>
                            <path d="M5 11c0 2.5 2 4 5 4s4-1.5 4-3.5V8"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
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
    $('#mg-tama').remove();

    $('body').append(getTamaHTML());

    const $tama = $('#mg-tama');
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

    applyPosition('mg-tama', 'tamaPosition');

    setupFabDrag('mg-tama', 'tama', 'tamaPosition');

    // Tama buttons → wired to callbacks from index.js
    $('#mg-tama-btn-draw').on('click', (e) => {
        e.stopPropagation();
        if (callbacks.onDraw) callbacks.onDraw();
    });

    $('#mg-tama-btn-queue').on('click', (e) => {
        e.stopPropagation();
        if (callbacks.onQueue) callbacks.onQueue();
    });

    $('#mg-tama-btn-poke').on('click', (e) => {
        e.stopPropagation();
        if (callbacks.onPoke) callbacks.onPoke();
    });

    // Respect visibility setting
    if (!extensionSettings.showTama) {
        tamaEl.style.setProperty('display', 'none', 'important');
    }

    startSpriteAnimation();

    console.log(`[${extensionName}] Tama created`);
}
