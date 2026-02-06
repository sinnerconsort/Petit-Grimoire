/**
 * Petit Grimoire — Nyx-gotchi
 * Pixel art tamagotchi widget with Nyx voice integration
 *
 * Architecture: Screen content renders BEHIND the shell PNG.
 * The transparent glass area in the pixel art shows content through.
 * Entire shell is the poke target (tap = poke, long-press = knucklebones).
 */

import {
    extensionName, extensionSettings,
    spriteInterval, currentSpriteFrame,
    speechTimeout,
    setSpriteInterval, setCurrentSpriteFrame, setSpeechTimeout
} from './state.js';
import { setupFabDrag, applyPosition } from './drag.js';
import { getSpriteAnimation, hasSpriteSupport } from './sprites.js';

// Import Nyx voice system - MATCHING ACTUAL EXPORTS
import { 
    initNyxVoice, 
    startIdleMonitor, 
    stopIdleMonitor, 
    handlePoke, 
    nyxSpeak 
} from './nyx-voice.js';

// ============================================
// ANIMATION STATE
// ============================================

let specialAnimMoodOverride = null;
let specialAnimTimeout = null;
let currentAnimData = null;
let pokeHoldTimer = null;
const LONG_PRESS_DURATION = 1500;

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
 |、 〵
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

/**
 * Make Nyx speak with voice system and show in bubble
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
// TAMA HTML
// ============================================

function getShellImagePath() {
    return `/scripts/extensions/third-party/${extensionName}/assets/sprites/nyxgotchi-shell.png`;
}

export function getTamaHTML() {
    const disposition = extensionSettings.nyx.disposition;
    const mood = getMoodText(disposition);
    const shellSrc = getShellImagePath();

    return `
        <div class="nyxgotchi" id="nyxgotchi"
             data-mg-theme="${extensionSettings.shellTheme}"
             data-mg-size="${extensionSettings.tamaSize || 'medium'}">

            <div class="nyxgotchi-speech" id="nyxgotchi-speech">
                <span class="nyxgotchi-speech-text">...</span>
            </div>

            <div class="nyxgotchi-shell" id="nyxgotchi-shell">

                <!-- Screen content (z:1, behind glass) -->
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

                <!-- Shell image (z:2, on top, transparent glass shows screen) -->
                <img class="nyxgotchi-shell-img"
                     src="${shellSrc}"
                     alt=""
                     draggable="false" />

            </div>
        </div>
    `;
}

// ============================================
// POKE HANDLERS
// (Whole shell is the tap target now)
// ============================================

function onPokeStart(e, callbacks) {
    e.preventDefault();
    
    pokeHoldTimer = setTimeout(() => {
        pokeHoldTimer = null;
        if (callbacks.onKnucklebones) {
            playSpecialAnimation('amused', 1);
            callbacks.onKnucklebones();
        }
    }, LONG_PRESS_DURATION);
}

function onPokeEnd(e, callbacks) {
    e.preventDefault();
    
    if (pokeHoldTimer) {
        clearTimeout(pokeHoldTimer);
        pokeHoldTimer = null;
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
        // Use voice system's poke handler
        const line = await handlePoke();
        
        if (line) {
            showSpeech(line, 4000);
        }
        
        // Play animation based on mood
        const mood = getMoodText(extensionSettings.nyx.disposition);
        playSpecialAnimation(mood === 'annoyed' ? 'annoyed' : 'neutral', 1.5);
        
        // Also call callback if provided
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

    // ── Poke on shell tap (replaces 3-button system) ──
    const shell = document.getElementById('nyxgotchi-shell');
    if (shell) {
        shell.addEventListener('mousedown', (e) => onPokeStart(e, callbacks));
        shell.addEventListener('mouseup', (e) => onPokeEnd(e, callbacks));
        shell.addEventListener('mouseleave', onPokeCancel);
        
        shell.addEventListener('touchstart', (e) => onPokeStart(e, callbacks), { passive: false });
        shell.addEventListener('touchend', (e) => onPokeEnd(e, callbacks), { passive: false });
        shell.addEventListener('touchcancel', onPokeCancel);
    }

    if (!extensionSettings.showTama) {
        tamaEl.style.setProperty('display', 'none', 'important');
    }

    // Initialize Nyx voice with speech callback
    initNyxVoice({ showSpeech });
    
    // Start idle monitoring
    startIdleMonitor();

    startSpriteAnimation();

    console.log(`[${extensionName}] Nyxgotchi created (pixel shell)`);
}

// ============================================
// CLEANUP
// ============================================

export function destroyTama() {
    stopIdleMonitor();
    stopSpriteAnimation();
    $('#nyxgotchi').remove();
}
