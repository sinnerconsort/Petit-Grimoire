/**
 * Petit Grimoire — Nyxgotchi FAB
 * Tamagotchi-style floating companion widget
 * 
 * Tapping the shell opens the Handheld panel.
 * The cat sprite shows Nyx's mood based on disposition.
 */

import { ASSET_PATHS, THEMES, getTheme } from '../core/config.js';
import { settings, updateSetting, saveSettings } from '../core/state.js';
import { getSpriteAnimation, hasSpriteSupport } from './sprites.js';
import { openHandheld } from './handheld.js';

// ============================================
// CONSTANTS
// ============================================

const SPRITE_SIZE = 52;  // Pixel sprite display size

// ============================================
// ANIMATION STATE
// ============================================

let spriteInterval = null;
let currentSpriteFrame = 0;
let currentAnimData = null;

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
じしˍ,)ノ`
        ],
        delighted: [
`  ╱|、 ✧
(˃ᴗ˂ 。7
 |、˜〵
じしˍ,)ノ✧`
        ]
    }
};

// ============================================
// MOOD HELPERS
// ============================================

/**
 * Get mood text from disposition value
 */
export function getMoodText(disposition) {
    if (disposition < 20) return 'annoyed';
    if (disposition < 35) return 'bored';
    if (disposition < 60) return 'neutral';
    if (disposition < 80) return 'amused';
    return 'delighted';
}

/**
 * Get current disposition (with defaults)
 */
function getDisposition() {
    return settings.nyxDisposition ?? 50;
}

/**
 * Get current mood based on disposition
 */
function getCurrentMood() {
    return getMoodText(getDisposition());
}

// ============================================
// SPRITE SYSTEM
// ============================================

function usePixelSprites() {
    return hasSpriteSupport('cat');
}

function getCurrentAsciiSprite() {
    const mood = getCurrentMood();
    const moodFrames = ASCII_SPRITES.cat[mood] || ASCII_SPRITES.cat.neutral;
    return moodFrames[currentSpriteFrame % moodFrames.length];
}

/**
 * Update the sprite display (pixel or ASCII)
 */
export function updateSpriteDisplay() {
    const sprite = document.getElementById('nyxgotchi-sprite');
    if (!sprite) return;

    const mood = getCurrentMood();

    if (usePixelSprites()) {
        const anim = getSpriteAnimation('cat', mood);
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
        const sheetWidth = anim.frames * SPRITE_SIZE;

        sprite.textContent = '';
        sprite.classList.add('pixel-mode');
        sprite.style.width = SPRITE_SIZE + 'px';
        sprite.style.height = SPRITE_SIZE + 'px';
        sprite.style.backgroundImage = `url(${anim.src})`;
        sprite.style.backgroundSize = `${sheetWidth}px ${SPRITE_SIZE}px`;
        sprite.style.backgroundPosition = `-${frame * SPRITE_SIZE}px 0`;
        sprite.style.backgroundRepeat = 'no-repeat';
        sprite.style.imageRendering = 'pixelated';
    } else {
        sprite.style.backgroundImage = '';
        sprite.classList.remove('pixel-mode');
        sprite.textContent = getCurrentAsciiSprite();
        currentAnimData = null;
    }
}

/**
 * Start sprite animation loop
 */
export function startSpriteAnimation() {
    stopSpriteAnimation();
    updateSpriteDisplay();

    const speed = currentAnimData ? currentAnimData.speed : 600;
    spriteInterval = setInterval(() => {
        currentSpriteFrame++;
        updateSpriteDisplay();
    }, speed);
}

/**
 * Stop sprite animation
 */
export function stopSpriteAnimation() {
    if (spriteInterval) {
        clearInterval(spriteInterval);
        spriteInterval = null;
    }
}

// ============================================
// DRAG SYSTEM
// ============================================

let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let elementStartX = 0;
let elementStartY = 0;

function onDragStart(e) {
    const el = document.getElementById('nyxgotchi');
    if (!el) return;

    isDragging = true;
    el.classList.add('dragging');

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    dragStartX = clientX;
    dragStartY = clientY;

    const rect = el.getBoundingClientRect();
    elementStartX = rect.left;
    elementStartY = rect.top;

    e.preventDefault();
}

function onDragMove(e) {
    if (!isDragging) return;

    const el = document.getElementById('nyxgotchi');
    if (!el) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - dragStartX;
    const deltaY = clientY - dragStartY;

    let newX = elementStartX + deltaX;
    let newY = elementStartY + deltaY;

    // Constrain to viewport
    const maxX = window.innerWidth - el.offsetWidth;
    const maxY = window.innerHeight - el.offsetHeight;
    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    el.style.left = newX + 'px';
    el.style.top = newY + 'px';
    el.style.right = 'auto';
    el.style.bottom = 'auto';

    e.preventDefault();
}

function onDragEnd(e) {
    if (!isDragging) return;

    isDragging = false;
    const el = document.getElementById('nyxgotchi');
    if (el) {
        el.classList.remove('dragging');

        // Save position
        const rect = el.getBoundingClientRect();
        updateSetting('nyxgotchiPosition', { x: rect.left, y: rect.top });
    }
}

function setupDrag(element) {
    element.addEventListener('mousedown', onDragStart);
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);

    element.addEventListener('touchstart', onDragStart, { passive: false });
    document.addEventListener('touchmove', onDragMove, { passive: false });
    document.addEventListener('touchend', onDragEnd);
}

// ============================================
// POSITION MANAGEMENT
// ============================================

function applyPosition(element) {
    const pos = settings.nyxgotchiPosition;
    
    if (pos && pos.x !== null && pos.y !== null) {
        element.style.left = pos.x + 'px';
        element.style.top = pos.y + 'px';
        element.style.right = 'auto';
        element.style.bottom = 'auto';
    } else {
        // Default position: bottom-right
        element.style.right = '20px';
        element.style.bottom = '100px';
        element.style.left = 'auto';
        element.style.top = 'auto';
    }
}

// ============================================
// SHELL / THEME
// ============================================

function getShellPath() {
    const theme = getTheme(settings.theme);
    return `${ASSET_PATHS.shells}/${theme.shell}`;
}

/**
 * Update shell image for current theme
 */
export function updateShell() {
    const shellImg = document.querySelector('.nyxgotchi-shell-img');
    if (shellImg) {
        shellImg.src = getShellPath();
    }
    
    // Update theme attribute
    const nyxgotchi = document.getElementById('nyxgotchi');
    if (nyxgotchi) {
        nyxgotchi.setAttribute('data-mg-theme', settings.theme || 'guardian');
    }
}

// ============================================
// UPDATE MOOD DISPLAY
// ============================================

export function updateMoodDisplay() {
    const disposition = getDisposition();
    const mood = getMoodText(disposition);

    const moodEl = document.getElementById('nyxgotchi-mood');
    if (moodEl) moodEl.textContent = mood;

    const dispEl = document.getElementById('nyxgotchi-disposition');
    if (dispEl) dispEl.textContent = disposition;

    // Heart animation speed based on disposition
    const heart = document.getElementById('nyxgotchi-heart');
    if (heart) {
        heart.classList.toggle('invested', disposition >= 60);
    }

    // Restart animation for new mood
    currentSpriteFrame = 0;
    startSpriteAnimation();
}

// ============================================
// HTML TEMPLATE
// ============================================

function getNyxgotchiHTML() {
    const disposition = getDisposition();
    const mood = getMoodText(disposition);
    const shellSrc = getShellPath();
    const theme = settings.theme || 'guardian';

    return `
        <div class="nyxgotchi" id="nyxgotchi" data-mg-theme="${theme}">
            <div class="nyxgotchi-shell" id="nyxgotchi-shell">
                
                <!-- Screen content (behind glass) -->
                <div class="nyxgotchi-screen">
                    <div class="nyxgotchi-status">
                        <div class="nyxgotchi-status-item">
                            <span class="nyxgotchi-heart" id="nyxgotchi-heart">♥</span>
                            <span id="nyxgotchi-disposition">${disposition}</span>
                        </div>
                    </div>

                    <div class="nyxgotchi-sprite-area">
                        <div class="nyxgotchi-sprite" id="nyxgotchi-sprite"></div>
                    </div>

                    <div class="nyxgotchi-mood" id="nyxgotchi-mood">${mood}</div>
                </div>

                <!-- Shell image (on top, transparent glass shows screen) -->
                <img class="nyxgotchi-shell-img"
                     src="${shellSrc}"
                     alt="Nyxgotchi"
                     draggable="false" />
            </div>
        </div>
    `;
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Create and display the Nyxgotchi FAB
 */
export function createNyxgotchi() {
    // Remove existing
    destroyNyxgotchi();

    // Add to DOM
    document.body.insertAdjacentHTML('beforeend', getNyxgotchiHTML());

    const nyxgotchi = document.getElementById('nyxgotchi');
    if (!nyxgotchi) {
        console.error('[PG] Failed to create Nyxgotchi');
        return;
    }

    // Apply position
    applyPosition(nyxgotchi);

    // Setup drag
    setupDrag(nyxgotchi);

    // Shell tap → open handheld
    const shell = document.getElementById('nyxgotchi-shell');
    if (shell) {
        let tapStart = 0;
        let tapX = 0;
        let tapY = 0;

        shell.addEventListener('mousedown', (e) => {
            tapStart = Date.now();
            tapX = e.clientX;
            tapY = e.clientY;
        });

        shell.addEventListener('mouseup', (e) => {
            const elapsed = Date.now() - tapStart;
            const moved = Math.abs(e.clientX - tapX) + Math.abs(e.clientY - tapY);
            
            // Quick tap with minimal movement = open handheld
            if (elapsed < 300 && moved < 10) {
                openHandheld();
            }
        });

        // Touch version
        shell.addEventListener('touchstart', (e) => {
            tapStart = Date.now();
            tapX = e.touches[0].clientX;
            tapY = e.touches[0].clientY;
        }, { passive: true });

        shell.addEventListener('touchend', (e) => {
            const elapsed = Date.now() - tapStart;
            const touch = e.changedTouches[0];
            const moved = Math.abs(touch.clientX - tapX) + Math.abs(touch.clientY - tapY);
            
            if (elapsed < 300 && moved < 10) {
                openHandheld();
            }
        }, { passive: true });
    }

    // Start animation
    startSpriteAnimation();

    // Hide if disabled
    if (!settings.showNyxgotchi) {
        nyxgotchi.style.display = 'none';
    }

    console.log('[PG] Nyxgotchi created');
}

/**
 * Destroy the Nyxgotchi FAB
 */
export function destroyNyxgotchi() {
    stopSpriteAnimation();
    const existing = document.getElementById('nyxgotchi');
    if (existing) existing.remove();
}

/**
 * Toggle Nyxgotchi visibility
 */
export function toggleNyxgotchi(show) {
    const nyxgotchi = document.getElementById('nyxgotchi');
    if (nyxgotchi) {
        nyxgotchi.style.display = show ? 'block' : 'none';
    }
    updateSetting('showNyxgotchi', show);
}

/**
 * Set disposition and update display
 */
export function setDisposition(value) {
    const clamped = Math.max(0, Math.min(100, value));
    updateSetting('nyxDisposition', clamped);
    updateMoodDisplay();
}

/**
 * Adjust disposition by delta
 */
export function adjustDisposition(delta) {
    setDisposition(getDisposition() + delta);
}
