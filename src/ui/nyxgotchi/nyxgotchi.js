/**
 * Petit Grimoire — Nyxgotchi FAB
 * Tamagotchi-style floating companion widget
 */

import { ASSET_PATHS, getTheme, getNyxgotchiSize } from '../../core/config.js';
import { settings, updateSetting } from '../../core/state.js';
import { getSpriteAnimation, hasSpriteSupport, getMoodText } from './sprites.js';

// ============================================
// CONSTANTS
// ============================================

const DEFAULT_SPRITE_SIZE = 52;

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
    const size = getCurrentSize();
    const spriteSize = size.sprite || DEFAULT_SPRITE_SIZE;

    if (usePixelSprites()) {
        const anim = getSpriteAnimation('cat', mood);
        if (anim) {
            currentAnimData = anim;
            const frame = currentSpriteFrame % anim.frames;
            const sheetWidth = anim.frames * spriteSize;

            sprite.textContent = '';
            sprite.classList.add('pixel-mode');
            sprite.style.width = spriteSize + 'px';
            sprite.style.height = spriteSize + 'px';
            sprite.style.backgroundImage = `url(${anim.src})`;
            sprite.style.backgroundSize = `${sheetWidth}px ${spriteSize}px`;
            sprite.style.backgroundPosition = `-${frame * spriteSize}px 0`;
            sprite.style.backgroundRepeat = 'no-repeat';
            sprite.style.imageRendering = 'pixelated';
            return;
        }
    }
    
    // ASCII fallback
    sprite.style.backgroundImage = '';
    sprite.classList.remove('pixel-mode');
    sprite.textContent = getCurrentAsciiSprite();
    currentAnimData = null;
}

export function startSpriteAnimation() {
    stopSpriteAnimation();
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

    // Use top/left exclusively, clear bottom/right
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
        // Only save valid on-screen positions
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

/**
 * Apply position to the Nyxgotchi element.
 * 
 * CRITICAL: Always clear ALL four directional properties before setting
 * new ones, because the CSS class sets bottom/right defaults which will
 * conflict with inline top/left values.
 */
function applyPosition(element) {
    const pos = settings.nyxgotchiPosition;
    
    // Always reset ALL directional props first to avoid CSS conflicts
    element.style.top = 'auto';
    element.style.bottom = 'auto';
    element.style.left = 'auto';
    element.style.right = 'auto';
    
    if (pos && typeof pos.x === 'number' && typeof pos.y === 'number') {
        // Clamp to viewport — catches corrupt saved positions like y=-220
        const elSize = getCurrentSize().shell || 100;
        const maxX = window.innerWidth - elSize;
        const maxY = window.innerHeight - elSize;
        let safeX = Math.max(0, Math.min(pos.x, maxX));
        let safeY = Math.max(0, Math.min(pos.y, maxY));
        
        element.style.left = safeX + 'px';
        element.style.top = safeY + 'px';
        
        // If the saved position was out of bounds, fix it in settings too
        if (pos.x !== safeX || pos.y !== safeY) {
            console.log(`[PG] Fixed corrupt position (${pos.x},${pos.y}) → (${safeX},${safeY})`);
            updateSetting('nyxgotchiPosition', { x: safeX, y: safeY });
        }
    } else {
        // Default: bottom-right (use top/left to avoid CSS bottom/right conflict)
        element.style.left = (window.innerWidth - 140) + 'px';
        element.style.top = (window.innerHeight - 220) + 'px';
    }
}

// ============================================
// SHELL / THEME
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

    // Fallback background color if shell image fails
    const fallbackBg = themeData?.main || '#dc78aa';

    return `
        <div class="nyxgotchi" id="nyxgotchi" data-mg-theme="${theme}">
            <div class="nyxgotchi-shell" id="nyxgotchi-shell" style="
                position: relative;
                width: ${size.shell}px; 
                height: ${size.shell}px;
                background: radial-gradient(ellipse at 30% 30%, ${fallbackBg}88, ${fallbackBg}44);
                border-radius: 50% 50% 45% 45%;
                border: 3px solid ${fallbackBg};
                box-shadow: 0 4px 12px ${fallbackBg}66;
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                
                <!-- Screen content (behind glass) -->
                <div class="nyxgotchi-screen" style="
                    position: absolute;
                    z-index: 1;
                    left: 18%;
                    top: 20%;
                    width: 64%;
                    height: 40%;
                    background: linear-gradient(135deg, #1a2a1a, #0d1a0d);
                    border-radius: 8px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    box-shadow: inset 0 0 10px rgba(0, 255, 100, 0.1);
                ">
                    <div class="nyxgotchi-status" style="
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        padding: 2px 4px;
                        font-size: 8px;
                        font-family: monospace;
                        color: #4ade80;
                        background: rgba(0, 0, 0, 0.2);
                    ">
                        <span class="nyxgotchi-heart" id="nyxgotchi-heart" style="color: #f472b6;">♥</span>
                        <span id="nyxgotchi-disposition">${disposition}</span>
                    </div>

                    <div class="nyxgotchi-sprite-area" style="
                        flex: 1;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        overflow: hidden;
                    ">
                        <div class="nyxgotchi-sprite" id="nyxgotchi-sprite" style="
                            font-family: monospace;
                            font-size: 5px;
                            line-height: 1;
                            white-space: pre;
                            color: #4ade80;
                            image-rendering: pixelated;
                        "></div>
                    </div>

                    <div class="nyxgotchi-mood" id="nyxgotchi-mood" style="
                        font-size: 7px;
                        font-family: monospace;
                        color: #4ade80;
                        text-align: center;
                        padding: 1px;
                        background: rgba(0, 0, 0, 0.2);
                        text-transform: lowercase;
                    ">${mood}</div>
                </div>

                <!-- Shell image (on top, transparent glass shows screen) -->
                <img class="nyxgotchi-shell-img"
                     src="${shellSrc}"
                     alt="Nyxgotchi"
                     draggable="false"
                     style="
                        position: absolute;
                        inset: 0;
                        width: 100%;
                        height: 100%;
                        z-index: 2;
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

    // Force visibility
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
                import('./handheld.js').then(m => m.toggleHandheld()).catch(() => {});
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
                import('./handheld.js').then(m => m.toggleHandheld()).catch(() => {});
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
