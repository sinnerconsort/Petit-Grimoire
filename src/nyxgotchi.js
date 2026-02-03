/**
 * Petit Grimoire — Nyx-gotchi
 * Egg-shaped tamagotchi widget: HTML, sprites, speech bubble, card flash, mood
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
    const sprite = document.getElementById('nyxgotchi-sprite');
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

    setCurrentSpriteFrame(0);
    updateSpriteDisplay();

    // Apply mood class to sprite for CSS animations
    const sprite = document.getElementById('nyxgotchi-sprite');
    if (sprite) {
        sprite.className = 'nyxgotchi-sprite';
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

                    <!-- Top status icons -->
                    <div class="nyxgotchi-icons-row">
                        <span class="nyxgotchi-icon">💡</span>
                        <span class="nyxgotchi-icon">🍴</span>
                        <span class="nyxgotchi-icon">⚡</span>
                        <span class="nyxgotchi-icon">🎒</span>
                    </div>

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

                    <!-- Bottom status icons -->
                    <div class="nyxgotchi-icons-row">
                        <span class="nyxgotchi-icon">👑</span>
                        <span class="nyxgotchi-icon">❤</span>
                        <span class="nyxgotchi-icon">🔮</span>
                        <span class="nyxgotchi-icon">📖</span>
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

    console.log(`[${extensionName}] Nyxgotchi created`);
}
