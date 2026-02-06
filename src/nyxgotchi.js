/**
 * Petit Grimoire — Nyx-gotchi
 * Egg-shaped tamagotchi widget: HTML, pixel sprites, speech bubble, card flash, mood
 * Now integrated with Nyx voice system for dynamic dialogue
 */

import {
    extensionName, extensionSettings,
    spriteInterval, currentSpriteFrame,
    speechTimeout,
    setSpriteInterval, setCurrentSpriteFrame, setSpeechTimeout
} from './state.js';
import { setupFabDrag, applyPosition } from './drag.js';
import { getSpriteAnimation, hasSpriteSupport } from './sprites.js';

// Import Nyx voice system
import { nyxSpeak } from './nyx/voice.js';
import { initIdleSystem, cleanupIdleSystem, handlePoke } from './nyx/idle.js';

// ============================================
// ANIMATION STATE
// ============================================

let specialAnimMoodOverride = null;
let specialAnimTimeout = null;
let currentAnimData = null;
let pokeHoldTimer = null;
const LONG_PRESS_DURATION = 1500; // 1.5s for knucklebones trigger

// Display size for pixel sprites (32px native → 52px display)
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
// SPRITE SYSTEM (Pixel + ASCII fallback)
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
            // Fallback to ASCII
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

/**
 * Temporarily override the sprite to show a reaction mood, then revert.
 */
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

/**
 * Make Nyx speak with voice system and show in bubble
 * @param {string} situation - Context for nyxSpeak
 * @param {object} context - Additional context data
 * @param {number} duration - How long to show speech
 */
export async function nyxSay(situation, context = {}, duration = 4000) {
    try {
        const line = await nyxSpeak(situation, context);
        if (line) {
            showSpeech(line, duration);
        }
        return line;
    } catch (err) {
        console.warn(`[${extensionName}] nyxSay error:`, err);
        return null;
    }
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
// TAMA HTML (Egg Shell Design — no icon rows)
// ============================================

export function getTamaHTML() {
    const disposition = extensionSettings.nyx.disposition;
    const mood = getMoodText(disposition);
    return `
        <div class="nyxgotchi" id="nyxgotchi"
             data-mg-theme="${extensionSettings.shellTheme}"
             data-mg-size="${extensionSettings.tamaSize || 'medium'}">

            <!-- Speech bubble -->
            <div class="nyxgotchi-speech" id="nyxgotchi-speech">
                <span class="nyxgotchi-speech-text">...</span>
            </div>

            <!-- Keychain loop -->
            <div class="nyxgotchi-chain">
                <div class="nyxgotchi-chain-link"></div>
                <div class="nyxgotchi-chain-link"></div>
                <div class="nyxgotchi-chain-link"></div>
            </div>

            <!-- Egg shell -->
            <div class="nyxgotchi-shell">

                <!-- Shell decorations -->
                <div class="nyxgotchi-decorations">
                    <span class="nyxgotchi-deco nyxgotchi-deco--1"></span>
                    <span class="nyxgotchi-deco nyxgotchi-deco--2"></span>
                    <span class="nyxgotchi-deco nyxgotchi-deco--3"></span>
                    <span class="nyxgotchi-deco nyxgotchi-deco--4"></span>
                    <span class="nyxgotchi-deco nyxgotchi-deco--5"></span>
                    <span class="nyxgotchi-deco nyxgotchi-deco--6"></span>
                </div>

                <!-- Screen frame -->
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
// POKE BUTTON HANDLERS (with long-press for Knucklebones)
// ============================================

function onPokeStart(e, callbacks) {
    e.preventDefault();
    
    // Start long-press timer for Knucklebones
    pokeHoldTimer = setTimeout(() => {
        pokeHoldTimer = null;
        // Long press detected - trigger Knucklebones!
        if (callbacks.onKnucklebones) {
            playSpecialAnimation('amused', 1);
            callbacks.onKnucklebones();
        }
    }, LONG_PRESS_DURATION);
}

function onPokeEnd(e, callbacks) {
    e.preventDefault();
    
    // If timer still exists, it was a short press
    if (pokeHoldTimer) {
        clearTimeout(pokeHoldTimer);
        pokeHoldTimer = null;
        
        // Regular poke
        onPokeClick(callbacks);
    }
}

function onPokeCancel() {
    if (pokeHoldTimer) {
        clearTimeout(pokeHoldTimer);
        pokeHoldTimer = null;
    }
}

async function onPokeClick(callbacks) {
    try {
        // Use the idle system's poke handler for counting
        const line = await handlePoke();
        
        if (line) {
            showSpeech(line, 4000);
        }
        
        // Play appropriate animation based on mood
        const mood = getMoodText(extensionSettings.nyx.disposition);
        playSpecialAnimation(mood === 'annoyed' ? 'annoyed' : 'neutral', 1.5);
        
        // Also call the callback if provided
        if (callbacks.onPoke) callbacks.onPoke();
    } catch (err) {
        console.warn(`[${extensionName}] Poke error:`, err);
        showSpeech("...", 2000);
    }
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

    // Draw button
    $('#nyxgotchi-btn-draw').on('click', (e) => {
        e.stopPropagation();
        if (callbacks.onDraw) callbacks.onDraw();
    });

    // Queue button
    $('#nyxgotchi-btn-queue').on('click', (e) => {
        e.stopPropagation();
        if (callbacks.onQueue) callbacks.onQueue();
    });

    // Poke button with long-press detection
    const pokeBtn = document.getElementById('nyxgotchi-btn-poke');
    if (pokeBtn) {
        // Mouse events
        pokeBtn.addEventListener('mousedown', (e) => onPokeStart(e, callbacks));
        pokeBtn.addEventListener('mouseup', (e) => onPokeEnd(e, callbacks));
        pokeBtn.addEventListener('mouseleave', onPokeCancel);
        
        // Touch events
        pokeBtn.addEventListener('touchstart', (e) => onPokeStart(e, callbacks), { passive: false });
        pokeBtn.addEventListener('touchend', (e) => onPokeEnd(e, callbacks), { passive: false });
        pokeBtn.addEventListener('touchcancel', onPokeCancel);
    }

    if (!extensionSettings.showTama) {
        tamaEl.style.setProperty('display', 'none', 'important');
    }

    // Initialize idle system with showSpeech callback
    initIdleSystem(showSpeech);

    startSpriteAnimation();

    console.log(`[${extensionName}] Nyxgotchi created with voice system`);
}

// ============================================
// CLEANUP
// ============================================

export function destroyTama() {
    cleanupIdleSystem();
    stopSpriteAnimation();
    $('#nyxgotchi').remove();
}
