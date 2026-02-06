/**
 * Petit Grimoire — Nyx-gotchi
 * Egg-shaped tamagotchi widget: HTML, pixel sprites, speech bubble, card flash, mood
 */

import {
    extensionName, extensionSettings,
    spriteInterval, currentSpriteFrame,
    speechTimeout,
    setSpriteInterval, setCurrentSpriteFrame, setSpeechTimeout
} from './state.js';
import { setupFabDrag, applyPosition } from './drag.js';
import { getSpriteAnimation, hasSpriteSupport } from './sprites.js';

// ============================================
// ANIMATION STATE
// ============================================

let specialAnimMoodOverride = null;
let specialAnimTimeout = null;
let currentAnimData = null;

const SPRITE_DISPLAY = 52;

// ============================================
// ASCII FALLBACK SPRITES
// ============================================

const ASCII_SPRITES = {
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

function usePixelSprites() {
    const form = extensionSettings.familiarForm || 'cat';
    return hasSpriteSupport(form);
}

function getCurrentMood() {
    return specialAnimMoodOverride || getMoodForDisposition(extensionSettings.nyx.disposition);
}

function getCurrentAsciiSprite() {
    const form = extensionSettings.familiarForm || 'cat';
    const mood = getCurrentMood();
    const formSprites = ASCII_SPRITES[form] || ASCII_SPRITES.cat;
    const moodFrames = formSprites[mood] || formSprites.neutral;
    if (!moodFrames || moodFrames.length === 0) {
        return ASCII_SPRITES.cat.neutral[0];
    }
    return moodFrames[currentSpriteFrame % moodFrames.length];
}

export function updateSpriteDisplay() {
    const sprite = document.getElementById('nyxgotchi-sprite');
    if (!sprite) return;

    const form = extensionSettings.familiarForm || 'cat';
    const mood = getCurrentMood();

    if (usePixelSprites()) {
        const anim = getSpriteAnimation(form, mood);
        if (!anim) {
            sprite.style.backgroundImage = '';
            sprite.textContent = getCurrentAsciiSprite();
            sprite.classList.remove('pixel-mode');
            currentAnimData = null;
            return;
        }

        currentAnimData = anim;
        const frame = currentSpriteFrame % anim.frames;
        const sheetWidth = anim.frames * SPRITE_DISPLAY;

        sprite.textContent = '';
        sprite.classList.add('pixel-mode');
        sprite.style.width = SPRITE_DISPLAY + 'px';
        sprite.style.height = SPRITE_DISPLAY + 'px';
        sprite.style.backgroundImage = `url(${anim.src})`;
        sprite.style.backgroundSize = `${sheetWidth}px ${SPRITE_DISPLAY}px`;
        sprite.style.backgroundPosition = `-${frame * SPRITE_DISPLAY}px 0`;
        sprite.style.backgroundRepeat = 'no-repeat';
        sprite.style.imageRendering = 'pixelated';
    } else {
        sprite.style.backgroundImage = '';
        sprite.classList.remove('pixel-mode');
        sprite.textContent = getCurrentAsciiSprite();
        currentAnimData = null;
    }
}

export function startSpriteAnimation() {
    stopSpriteAnimation();
    updateSpriteDisplay();

    const speed = currentAnimData ? currentAnimData.speed : 2000;
    setSpriteInterval(setInterval(() => {
        setCurrentSpriteFrame(currentSpriteFrame + 1);
        updateSpriteDisplay();
    }, speed));
}

export function stopSpriteAnimation() {
    if (spriteInterval) {
        clearInterval(spriteInterval);
        setSpriteInterval(null);
    }
}

export function playSpecialAnimation(mood, durationSeconds = 2) {
    try {
        if (specialAnimTimeout) clearTimeout(specialAnimTimeout);

        specialAnimMoodOverride = mood;
        setCurrentSpriteFrame(0);
        startSpriteAnimation();

        const sprite = document.getElementById('nyxgotchi-sprite');
        if (sprite) {
            sprite.className = 'nyxgotchi-sprite';
            if (usePixelSprites()) sprite.classList.add('pixel-mode');
            if (mood !== 'neutral') sprite.classList.add(`mood-${mood}`);
        }

        specialAnimTimeout = setTimeout(() => {
            specialAnimMoodOverride = null;
            specialAnimTimeout = null;
            startSpriteAnimation();
            updateNyxMood();
        }, durationSeconds * 1000);
    } catch (err) {
        console.error(`[${extensionName}] playSpecialAnimation error:`, err);
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
    void flash.offsetWidth;
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

    if (!specialAnimMoodOverride) {
        setCurrentSpriteFrame(0);
        startSpriteAnimation();
    }

    const sprite = document.getElementById('nyxgotchi-sprite');
    if (sprite && !specialAnimMoodOverride) {
        sprite.className = 'nyxgotchi-sprite';
        if (usePixelSprites()) sprite.classList.add('pixel-mode');
        if (mood !== 'neutral') sprite.classList.add(`mood-${mood}`);
    }

    const heart = $('#nyxgotchi-heart');
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
    const mood = getMoodText(disposition);
    return `
        <div class="nyxgotchi" id="nyxgotchi"
             data-mg-theme="${extensionSettings.shellTheme}"
             data-mg-size="${extensionSettings.tamaSize || 'medium'}">

            <div class="nyxgotchi-speech" id="nyxgotchi-speech">
                <span class="nyxgotchi-speech-text">...</span>
            </div>

            <div class="nyxgotchi-chain">
                <div class="nyxgotchi-chain-link"></div>
                <div class="nyxgotchi-chain-link"></div>
                <div class="nyxgotchi-chain-link"></div>
            </div>

            <div class="nyxgotchi-shell">

                <div class="nyxgotchi-decorations">
                    <span class="nyxgotchi-deco nyxgotchi-deco--1"></span>
                    <span class="nyxgotchi-deco nyxgotchi-deco--2"></span>
                    <span class="nyxgotchi-deco nyxgotchi-deco--3"></span>
                    <span class="nyxgotchi-deco nyxgotchi-deco--4"></span>
                    <span class="nyxgotchi-deco nyxgotchi-deco--5"></span>
                    <span class="nyxgotchi-deco nyxgotchi-deco--6"></span>
                </div>

                <div class="nyxgotchi-screen-frame">
                    <div class="nyxgotchi-screen">

                        <div class="nyxgotchi-status">
                            <div class="nyxgotchi-status-item">
                                <span class="nyxgotchi-heart" id="nyxgotchi-heart">♥</span>
                                <span id="nyxgotchi-disposition">${disposition}</span>
                            </div>
                            <div class="nyxgotchi-status-item">
                                <span class="nyxgotchi-queue-badge" id="nyxgotchi-queue">Q:0</span>
                            </div>
                        </div>

                        <div class="nyxgotchi-sprite-area">
                            <div class="nyxgotchi-sprite" id="nyxgotchi-sprite"></div>
                            <div class="nyxgotchi-card-flash" id="nyxgotchi-flash">
                                <span class="card-icon">🌟</span>
                            </div>
                        </div>

                        <div class="nyxgotchi-mood" id="nyxgotchi-mood">${mood}</div>

                    </div>
                </div>

                <div class="nyxgotchi-buttons">
                    <button class="nyxgotchi-button" data-action="draw" id="nyxgotchi-btn-draw"></button>
                    <button class="nyxgotchi-button nyxgotchi-button--middle" data-action="queue" id="nyxgotchi-btn-queue"></button>
                    <button class="nyxgotchi-button" data-action="poke" id="nyxgotchi-btn-poke"></button>
                </div>

            </div>
        </div>
    `;
}

// ============================================
// TAMA CREATION
// ============================================

export function createTama(callbacks = {}) {
    $('#nyxgotchi').remove();

    $('body').append(getTamaHTML());

    const $tama = $('#nyxgotchi');
    if ($tama.length === 0) {
        console.error(`[${extensionName}] Failed to create tama`);
        return;
    }

    const tamaEl = $tama[0];

    tamaEl.style.setProperty('position', 'fixed', 'important');
    tamaEl.style.setProperty('z-index', '2147483647', 'important');
    tamaEl.style.setProperty('display', 'flex', 'important');
    tamaEl.style.setProperty('visibility', 'visible', 'important');
    tamaEl.style.setProperty('opacity', '1', 'important');
    tamaEl.style.setProperty('pointer-events', 'auto', 'important');

    applyPosition('nyxgotchi', 'tamaPosition');
    setupFabDrag('nyxgotchi', 'tama', 'tamaPosition');

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

    if (!extensionSettings.showTama) {
        tamaEl.style.setProperty('display', 'none', 'important');
    }

    startSpriteAnimation();

    console.log(`[${extensionName}] Nyxgotchi created`);
}
