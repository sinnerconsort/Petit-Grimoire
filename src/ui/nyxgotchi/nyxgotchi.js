/**
 * Petit Grimoire — Nyxgotchi FAB
 * Tamagotchi-style floating companion widget
 */

import { ASSET_PATHS, getTheme, getNyxgotchiSize } from '../../core/config.js';
import { settings, updateSetting } from '../../core/state.js';
import { getSpriteAnimation, hasSpriteSupport, getMoodText } from './sprites.js';
import { getIndicatorHTML, consumePendingMessage, hasPendingMessage } from './nyx-indicators.js';

// ============================================
// CONSTANTS
// ============================================

// Display size for sprite inside the tama screen
const TAMA_SPRITE_SIZE = 32;

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
        annoyed: [`  ╱|、
(￣ ಠ 7
 |、˜〵
じしˍ,)ノ`],
        bored: [`  ╱|、
(˘ˎ ˘7
 |、 〵
じしˍ,)_`],
        amused: [`  ╱|、
(๑˃̵ᴗ˂̵)7
 |、˜〵
じしˍ,)ノ`],
        delighted: [`  ╱|、 ✧
(˃ᴗ˂ 。7
 |、˜〵
じしˍ,)ノ✧`]
    }
};

// Re-export getMoodText for external use
export { getMoodText };

// ============================================
// HELPERS
// ============================================

function getDisposition() {
    return settings.nyxDisposition ?? 50;
}

function getCurrentMood() {
    return getMoodText(getDisposition());
}

function getCurrentSize() {
    if (typeof getNyxgotchiSize === 'function') {
        return getNyxgotchiSize(settings.nyxgotchiSize);
    }
    return { shell: 100, sprite: 48 };
}

function usePixelSprites() {
    return hasSpriteSupport('cat');
}

function getCurrentAsciiSprite() {
    const mood = getCurrentMood();
    const moodFrames = ASCII_SPRITES.cat[mood] || ASCII_SPRITES.cat.neutral;
    return moodFrames[currentSpriteFrame % moodFrames.length];
}

// ============================================
// SPRITE SYSTEM
// ============================================

export function updateSpriteDisplay() {
    const sprite = document.getElementById('nyxgotchi-sprite');
    if (!sprite) return;

    const mood = getCurrentMood();

    if (usePixelSprites()) {
        const anim = getSpriteAnimation('cat', mood);
        if (anim) {
            currentAnimData = anim;
            
            // Get actual sprite dimensions from animation data
            const frameW = anim.fw;
            const frameH = anim.fh;
            const numFrames = anim.frames;
            
            // Current frame (proper loop)
            const frame = currentSpriteFrame % numFrames;
            
            // Scale: fit the 48px sprite into our display size
            const scale = TAMA_SPRITE_SIZE / frameW;
            const displayW = Math.round(frameW * scale);
            const displayH = Math.round(frameH * scale);
            
            // Sheet dimensions at display scale
            const sheetW = numFrames * displayW;
            
            // Frame position
            const frameX = frame * displayW;

            sprite.textContent = '';
            sprite.classList.add('pixel-mode');
            
            // CRITICAL: Set explicit size and clip to single frame
            sprite.style.width = displayW + 'px';
            sprite.style.height = displayH + 'px';
            sprite.style.minWidth = displayW + 'px';
            sprite.style.maxWidth = displayW + 'px';
            sprite.style.overflow = 'hidden';
            
            sprite.style.backgroundImage = `url('${anim.src}')`;
            sprite.style.backgroundSize = `${sheetW}px ${displayH}px`;
            sprite.style.backgroundPosition = `-${frameX}px 0`;
            sprite.style.backgroundRepeat = 'no-repeat';
            sprite.style.imageRendering = 'pixelated';
            
            // Offset for tall sprites (if defined)
            const offsetY = anim.offsetY || 0;
            if (offsetY) {
                sprite.style.marginTop = Math.round(offsetY * scale) + 'px';
            } else {
                sprite.style.marginTop = '0';
            }
            
            return;
        }
    }
    
    // ASCII fallback
    sprite.style.backgroundImage = '';
    sprite.style.marginTop = '0';
    sprite.classList.remove('pixel-mode');
    sprite.textContent = getCurrentAsciiSprite();
    currentAnimData = null;
}

export function startSpriteAnimation() {
    stopSpriteAnimation();
    currentSpriteFrame = 0;
    updateSpriteDisplay();

    const speed = currentAnimData ? currentAnimData.speed : 600;
    spriteInterval = setInterval(() => {
        currentSpriteFrame++;
        updateSpriteDisplay();
    }, speed);
}

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

function onDragEnd() {
    if (!isDragging) return;

    isDragging = false;
    const el = document.getElementById('nyxgotchi');
    if (el) {
        el.classList.remove('dragging');
        const rect = el.getBoundingClientRect();
        const x = Math.max(0, rect.left);
        const y = Math.max(0, rect.top);
        updateSetting('nyxgotchiPosition', { x, y });
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
// POSITION & SIZE
// ============================================

function applyPosition(element) {
    const pos = settings.nyxgotchiPosition;
    
    element.style.top = 'auto';
    element.style.bottom = 'auto';
    element.style.left = 'auto';
    element.style.right = 'auto';
    
    if (pos && typeof pos.x === 'number' && typeof pos.y === 'number') {
        const elSize = getCurrentSize().shell || 100;
        const maxX = window.innerWidth - elSize;
        const maxY = window.innerHeight - elSize;
        
        const safeX = Math.max(0, Math.min(pos.x, maxX));
        const safeY = Math.max(0, Math.min(pos.y, maxY));
        
        element.style.left = safeX + 'px';
        element.style.top = safeY + 'px';
    } else {
        element.style.right = '20px';
        element.style.bottom = '80px';
    }
}

// ============================================
// SHELL THEME
// ============================================

function getShellPath() {
    const theme = getTheme(settings.theme);
    return `${ASSET_PATHS.shells}/${theme.shell}`;
}

export function updateShell() {
    const shellImg = document.querySelector('.nyxgotchi-shell-img');
    if (shellImg) {
        shellImg.src = getShellPath();
    }
    
    const nyxgotchi = document.getElementById('nyxgotchi');
    if (nyxgotchi) {
        nyxgotchi.setAttribute('data-mg-theme', settings.theme || 'guardian');
    }
}

export function updateNyxgotchiSize() {
    const nyxgotchi = document.getElementById('nyxgotchi');
    if (!nyxgotchi) return;
    
    const size = getCurrentSize();
    const shell = nyxgotchi.querySelector('.nyxgotchi-shell');
    if (shell) {
        shell.style.width = size.shell + 'px';
        shell.style.height = size.shell + 'px';
    }
    updateSpriteDisplay();
}

// ============================================
// MOOD DISPLAY
// ============================================

export function updateMoodDisplay() {
    const disposition = getDisposition();
    const mood = getMoodText(disposition);

    const moodEl = document.getElementById('nyxgotchi-mood');
    if (moodEl) moodEl.textContent = mood;

    const dispEl = document.getElementById('nyxgotchi-disposition');
    if (dispEl) dispEl.textContent = disposition;

    const heart = document.getElementById('nyxgotchi-heart');
    if (heart) {
        heart.classList.toggle('invested', disposition >= 60);
    }

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
    const size = getCurrentSize();
    const themeData = getTheme(theme);

    // Screen position - adjusted to fill the shell's screen area fully
    // These percentages should match your shell PNG's transparent screen area
    const screenStyle = `
        position: absolute;
        z-index: 1;
        left: 16%;
        top: 18%;
        width: 68%;
        height: 58%;
        background: linear-gradient(180deg, #0a1810 0%, #0d2818 50%, #0a1810 100%);
        border-radius: 6px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    `;

    return `
        <div class="nyxgotchi" id="nyxgotchi" data-mg-theme="${theme}">
            ${getIndicatorHTML()}
            <div class="nyxgotchi-shell" id="nyxgotchi-shell" style="
                position: relative;
                width: ${size.shell}px; 
                height: ${size.shell}px;
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                
                <!-- Screen content (behind glass) -->
                <div class="nyxgotchi-screen" style="${screenStyle}">
                    
                    <!-- Backlight glow -->
                    <div style="
                        position: absolute;
                        inset: 0;
                        background: radial-gradient(ellipse at center, rgba(74, 222, 128, 0.12) 0%, transparent 70%);
                        pointer-events: none;
                        z-index: 0;
                    "></div>
                    
                    <!-- Status bar -->
                    <div class="nyxgotchi-status" style="
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        gap: 3px;
                        padding: 2px 4px;
                        font-size: 7px;
                        font-family: monospace;
                        color: #4ade80;
                        background: rgba(0, 0, 0, 0.3);
                        flex-shrink: 0;
                        position: relative;
                        z-index: 1;
                    ">
                        <span class="nyxgotchi-heart" id="nyxgotchi-heart" style="color: #f472b6; font-size: 8px;">♥</span>
                        <span id="nyxgotchi-disposition" style="font-size: 8px;">${disposition}</span>
                    </div>

                    <!-- Sprite area -->
                    <div class="nyxgotchi-sprite-area" style="
                        flex: 1;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        overflow: hidden;
                        position: relative;
                        z-index: 1;
                        min-height: 0;
                    ">
                        <!-- Sprite glow behind -->
                        <div style="
                            position: absolute;
                            width: 36px;
                            height: 36px;
                            background: radial-gradient(circle, rgba(74, 222, 128, 0.25) 0%, transparent 70%);
                            border-radius: 50%;
                            filter: blur(3px);
                            pointer-events: none;
                        "></div>
                        
                        <!-- Sprite -->
                        <div class="nyxgotchi-sprite" id="nyxgotchi-sprite" style="
                            position: relative;
                            font-family: monospace;
                            font-size: 5px;
                            line-height: 1;
                            white-space: pre;
                            color: #4ade80;
                            image-rendering: pixelated;
                            filter: drop-shadow(0 0 2px rgba(74, 222, 128, 0.6));
                        "></div>
                    </div>

                    <!-- Mood text -->
                    <div class="nyxgotchi-mood" id="nyxgotchi-mood" style="
                        font-size: 6px;
                        font-family: monospace;
                        color: #4ade80;
                        text-align: center;
                        padding: 2px;
                        background: rgba(0, 0, 0, 0.3);
                        text-transform: lowercase;
                        letter-spacing: 0.5px;
                        flex-shrink: 0;
                        position: relative;
                        z-index: 1;
                    ">${mood}</div>
                    
                    <!-- Scanlines -->
                    <div style="
                        position: absolute;
                        inset: 0;
                        background: repeating-linear-gradient(
                            0deg,
                            transparent,
                            transparent 1px,
                            rgba(0, 0, 0, 0.08) 1px,
                            rgba(0, 0, 0, 0.08) 2px
                        );
                        pointer-events: none;
                        z-index: 2;
                    "></div>
                </div>

                <!-- Shell image (on top) -->
                <img class="nyxgotchi-shell-img"
                     src="${shellSrc}"
                     alt="Nyxgotchi"
                     draggable="false"
                     style="
                        position: absolute;
                        inset: 0;
                        width: 100%;
                        height: 100%;
                        z-index: 3;
                        image-rendering: pixelated;
                        pointer-events: none;
                        opacity: 1;
                     "
                     onerror="this.style.opacity='0';" />
            </div>
        </div>
    `;
}

// ============================================
// INITIALIZATION
// ============================================

export function createNyxgotchi() {
    destroyNyxgotchi();

    document.body.insertAdjacentHTML('beforeend', getNyxgotchiHTML());

    const nyxgotchi = document.getElementById('nyxgotchi');
    if (!nyxgotchi) {
        console.error('[PG] Failed to create Nyxgotchi');
        return;
    }

    nyxgotchi.style.setProperty('position', 'fixed', 'important');
    nyxgotchi.style.setProperty('z-index', '2147483647', 'important');
    nyxgotchi.style.setProperty('display', 'flex', 'important');
    nyxgotchi.style.setProperty('visibility', 'visible', 'important');
    nyxgotchi.style.setProperty('opacity', '1', 'important');
    nyxgotchi.style.setProperty('pointer-events', 'auto', 'important');

    applyPosition(nyxgotchi);
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
            
            if (elapsed < 300 && moved < 10) {
                const msg = consumePendingMessage();
                import('./handheld.js').then(m => m.toggleHandheld(msg)).catch(() => {});
            }
        });

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
                const msg = consumePendingMessage();
                import('./handheld.js').then(m => m.toggleHandheld(msg)).catch(() => {});
            }
        }, { passive: true });
    }

    startSpriteAnimation();

    if (settings.showNyxgotchi === false) {
        nyxgotchi.style.setProperty('display', 'none', 'important');
    }

    console.log('[PG] Nyxgotchi created');
}

export function destroyNyxgotchi() {
    stopSpriteAnimation();
    const existing = document.getElementById('nyxgotchi');
    if (existing) existing.remove();
}

export function toggleNyxgotchi(show) {
    const nyxgotchi = document.getElementById('nyxgotchi');
    if (nyxgotchi) {
        nyxgotchi.style.setProperty('display', show ? 'flex' : 'none', 'important');
    }
    updateSetting('showNyxgotchi', show);
}

export function setDisposition(value) {
    const clamped = Math.max(0, Math.min(100, value));
    updateSetting('nyxDisposition', clamped);
    updateMoodDisplay();
}

export function adjustDisposition(delta) {
    setDisposition(getDisposition() + delta);
}
