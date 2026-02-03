/**
 * Petit Grimoire - Magical Girl Fortune Extension
 * A fortune-telling companion for SillyTavern
 * 
 * Architecture: Two independent FABs
 *   - Compact Brooch (main FAB → opens Grimoire)
 *   - Nyx-gotchi (pet widget, independent)
 */

import { 
    getContext
} from '../../../extensions.js';

import { 
    saveSettingsDebounced
} from '../../../../script.js';

// ============================================
// CONSTANTS
// ============================================

const extensionName = 'petit-grimoire';
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;

// ============================================
// DEFAULT SETTINGS
// ============================================

const defaultSettings = {
    enabled: true,
    
    // Theme & appearance
    shellTheme: 'sailor-moon',
    familiarForm: 'cat',
    
    // Independent sizes
    compactSize: 'medium',   // small, medium, large
    tamaSize: 'medium',      // small, medium, large
    
    // Independent positions - stored as top/left only (bottom/right breaks in ST transforms)
    compactPosition: {},
    tamaPosition: {},
    
    // Visibility toggles
    showCompact: true,
    showTama: true,
    
    // Nyx state
    nyx: {
        disposition: 50,
        interestLevel: 'medium',
        lastShiftReason: null,
        totalCardsDrawn: 0,
        totalTriggered: 0,
        totalExpired: 0
    },
    
    // Feature toggles
    features: {
        particleEffects: true,
        soundEffects: true,
        screenFlash: true,
        nyxUnsolicited: true
    }
};

// ============================================
// STATE
// ============================================

let extensionSettings = {};

// Independent drag state per FAB
const dragState = {
    compact: { active: false, moved: false, offset: { x: 0, y: 0 } },
    tama: { active: false, moved: false, offset: { x: 0, y: 0 } }
};

// Sprite animation
let spriteInterval = null;
let currentSpriteFrame = 0;

// ============================================
// SETTINGS MANAGEMENT
// ============================================

function loadSettings() {
    const context = getContext();
    
    if (!context.extensionSettings[extensionName]) {
        context.extensionSettings[extensionName] = {};
    }
    
    extensionSettings = {
        ...defaultSettings,
        ...context.extensionSettings[extensionName]
    };
    
    // Deep merge nested objects
    extensionSettings.nyx = { ...defaultSettings.nyx, ...extensionSettings.nyx };
    extensionSettings.features = { ...defaultSettings.features, ...extensionSettings.features };
    extensionSettings.compactPosition = extensionSettings.compactPosition || {};
    extensionSettings.tamaPosition = extensionSettings.tamaPosition || {};
    
    // Migrate old nyxPosition if present
    if (extensionSettings.nyxPosition && !context.extensionSettings[extensionName].compactPosition) {
        extensionSettings.compactPosition = extensionSettings.nyxPosition;
    }
}

function saveSettings() {
    const context = getContext();
    context.extensionSettings[extensionName] = extensionSettings;
    saveSettingsDebounced();
}

// ============================================
// COMPACT HTML (Crystal Star Brooch)
// ============================================

function getCompactHTML() {
    return `
        <div class="mg-fab mg-compact" id="mg-compact" 
             data-mg-theme="${extensionSettings.shellTheme}" 
             data-mg-variant="crystal-star"
             data-mg-size="${extensionSettings.compactSize || 'medium'}">
            <div class="mg-compact-body">
                <div class="mg-compact-ring">
                    <div class="mg-compact-face">
                        <span class="mg-compact-star">★</span>
                    </div>
                    <span class="mg-compact-gem mg-compact-gem--1"></span>
                    <span class="mg-compact-gem mg-compact-gem--2"></span>
                    <span class="mg-compact-gem mg-compact-gem--3"></span>
                    <span class="mg-compact-gem mg-compact-gem--4"></span>
                </div>
                <div class="mg-compact-sparkles">
                    <span>✦</span><span>✧</span><span>✦</span><span>✧</span>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// TAMA HTML (Independent pet widget)
// ============================================

function getTamaHTML() {
    const disposition = extensionSettings.nyx.disposition;
    return `
        <div class="mg-fab mg-tama" id="mg-tama"
             data-mg-theme="${extensionSettings.shellTheme}"
             data-mg-size="${extensionSettings.tamaSize || 'medium'}">
            <!-- Thought bubble (floats above tama) -->
            <div class="mg-thought" id="mg-speech">
                <span class="mg-thought-text">Hello, mortal.</span>
            </div>
            <div class="mg-tama-shell">
                <!-- Antenna / decoration -->
                <div class="mg-tama-antenna"></div>
                
                <div class="mg-tama-screen">
                    <!-- CRT scanline overlay -->
                    <div class="mg-tama-scanlines"></div>
                    
                    <!-- Status bar -->
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
                    
                    <!-- Sprite -->
                    <div class="mg-tama-sprite" id="mg-tama-sprite"></div>
                    
                    <!-- Card flash overlay -->
                    <div class="mg-tama-flash" id="mg-tama-flash">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="1" width="14" height="20" rx="2"/>
                            <path d="M10 7l-2 4h4l-2 4"/>
                        </svg>
                    </div>
                    
                    <!-- Mood -->
                    <div class="mg-tama-mood" id="mg-tama-mood">${getMoodText(disposition)}</div>
                </div>
                
                <!-- Buttons -->
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
// SPRITE SYSTEM
// ============================================

const SPRITES = {
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

function getMoodText(disposition) {
    if (disposition < 20) return 'annoyed';
    if (disposition < 35) return 'bored';
    if (disposition < 60) return 'neutral';
    if (disposition < 80) return 'amused';
    return 'delighted';
}

function getMoodForDisposition(disposition) {
    return getMoodText(disposition);
}

function getCurrentSprite() {
    const form = extensionSettings.familiarForm || 'cat';
    const mood = getMoodForDisposition(extensionSettings.nyx.disposition);
    
    const formSprites = SPRITES[form] || SPRITES.cat;
    const moodFrames = formSprites[mood] || formSprites.neutral;
    
    if (!moodFrames || moodFrames.length === 0) {
        return SPRITES.cat.neutral[0];
    }
    
    return moodFrames[currentSpriteFrame % moodFrames.length];
}

function updateSpriteDisplay() {
    const sprite = document.getElementById('mg-tama-sprite');
    if (sprite) {
        sprite.textContent = getCurrentSprite();
    }
}

function startSpriteAnimation() {
    stopSpriteAnimation();
    updateSpriteDisplay();
    
    spriteInterval = setInterval(() => {
        currentSpriteFrame++;
        updateSpriteDisplay();
    }, 2000);
}

function stopSpriteAnimation() {
    if (spriteInterval) {
        clearInterval(spriteInterval);
        spriteInterval = null;
    }
}

// ============================================
// GENERIC DRAG SYSTEM (reusable per FAB)
// ============================================

function setupFabDrag(elementId, stateKey, positionKey) {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    const state = dragState[stateKey];
    
    function onStart(e) {
        // Don't drag from buttons
        if (e.target.closest('button')) return;
        
        state.active = true;
        state.moved = false;
        el.classList.add('dragging');
        
        const rect = el.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        state.offset.x = clientX - rect.left;
        state.offset.y = clientY - rect.top;
        
        e.preventDefault();
    }
    
    function onMove(e) {
        if (!state.active) return;
        
        state.moved = true;
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        const rect = el.getBoundingClientRect();
        
        let newLeft = clientX - state.offset.x;
        let newTop = clientY - state.offset.y;
        
        // Constrain to viewport
        newLeft = Math.max(5, Math.min(window.innerWidth - rect.width - 5, newLeft));
        newTop = Math.max(5, Math.min(window.innerHeight - rect.height - 5, newTop));
        
        el.style.setProperty('left', newLeft + 'px', 'important');
        el.style.setProperty('top', newTop + 'px', 'important');
        el.style.setProperty('right', 'auto', 'important');
        el.style.setProperty('bottom', 'auto', 'important');
        
        e.preventDefault();
    }
    
    function onEnd() {
        if (!state.active) return;
        
        state.active = false;
        el.classList.remove('dragging');
        
        // Save position
        const rect = el.getBoundingClientRect();
        extensionSettings[positionKey] = {
            top: rect.top,
            left: rect.left,
            right: 'auto',
            bottom: 'auto'
        };
        saveSettings();
    }
    
    el.addEventListener('mousedown', onStart);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
    
    el.addEventListener('touchstart', onStart, { passive: false });
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
}

// ============================================
// POSITION APPLICATION
// ============================================

function getDefaultPosition(elementId) {
    // Always compute as top/left from viewport - never use bottom/right
    // (ST/themes may have transforms that break fixed positioning with bottom/right)
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;
    
    if (elementId === 'mg-tama') {
        return { top: vpH - 240, left: vpW - 130 };
    }
    // compact default
    return { top: vpH - 120, left: vpW - 76 };
}

function applyPosition(elementId, positionKey) {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    const pos = extensionSettings[positionKey];
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;
    
    let top, left;
    
    // Try to use saved position (always stored as top/left after drag)
    if (pos && typeof pos === 'object') {
        if (pos.top !== undefined && pos.top !== 'auto' && !isNaN(Number(pos.top))) {
            top = Number(pos.top);
        } else if (pos.bottom !== undefined && pos.bottom !== 'auto' && !isNaN(Number(pos.bottom))) {
            // Convert old bottom-based position to top
            top = vpH - Number(pos.bottom) - (el.offsetHeight || 56);
        }
        if (pos.left !== undefined && pos.left !== 'auto' && !isNaN(Number(pos.left))) {
            left = Number(pos.left);
        } else if (pos.right !== undefined && pos.right !== 'auto' && !isNaN(Number(pos.right))) {
            // Convert old right-based position to left
            left = vpW - Number(pos.right) - (el.offsetWidth || 56);
        }
    }
    
    // Fall back to computed defaults if no valid saved position
    if (top === undefined || left === undefined) {
        const defaults = getDefaultPosition(elementId);
        if (top === undefined) top = defaults.top;
        if (left === undefined) left = defaults.left;
    }
    
    // Clamp to viewport (with small margin)
    const elW = el.offsetWidth || 56;
    const elH = el.offsetHeight || 56;
    top = Math.max(5, Math.min(vpH - elH - 5, top));
    left = Math.max(5, Math.min(vpW - elW - 5, left));
    
    el.style.setProperty('top', top + 'px', 'important');
    el.style.setProperty('left', left + 'px', 'important');
    el.style.setProperty('bottom', 'auto', 'important');
    el.style.setProperty('right', 'auto', 'important');
}

// ============================================
// COMPACT CREATION & EVENTS
// ============================================

function createCompact() {
    $('#mg-compact').remove();
    
    $('body').append(getCompactHTML());
    
    const $compact = $('#mg-compact');
    if ($compact.length === 0) {
        console.error(`[${extensionName}] Failed to create compact`);
        return;
    }
    
    const el = $compact[0];
    
    // Force critical display properties
    el.style.setProperty('position', 'fixed', 'important');
    el.style.setProperty('z-index', '2147483647', 'important');
    el.style.setProperty('display', 'flex', 'important');
    el.style.setProperty('visibility', 'visible', 'important');
    el.style.setProperty('opacity', '1', 'important');
    el.style.setProperty('pointer-events', 'auto', 'important');
    
    // Apply position (always top/left, clamped to viewport)
    applyPosition('mg-compact', 'compactPosition');
    
    setupFabDrag('mg-compact', 'compact', 'compactPosition');
    
    // Click → open grimoire (but not if dragged)
    $compact.on('click', (e) => {
        if (e.target.closest('button')) return;
        e.stopPropagation();
        if (dragState.compact.moved) {
            dragState.compact.moved = false;
            return;
        }
        triggerTransformation();
    });
    
    // Respect visibility setting
    if (!extensionSettings.showCompact) {
        el.style.setProperty('display', 'none', 'important');
    }
    
    console.log(`[${extensionName}] Compact created`);
}

// ============================================
// TAMA CREATION & EVENTS
// ============================================

function createTama() {
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
    
    // Apply position (always top/left, clamped to viewport)
    applyPosition('mg-tama', 'tamaPosition');
    
    setupFabDrag('mg-tama', 'tama', 'tamaPosition');
    
    // Tama buttons
    $('#mg-tama-btn-draw').on('click', (e) => {
        e.stopPropagation();
        onDrawCard();
    });
    
    $('#mg-tama-btn-queue').on('click', (e) => {
        e.stopPropagation();
        onViewQueue();
    });
    
    $('#mg-tama-btn-poke').on('click', (e) => {
        e.stopPropagation();
        onPokeNyx();
    });
    
    // Respect visibility setting
    if (!extensionSettings.showTama) {
        tamaEl.style.setProperty('display', 'none', 'important');
    }
    
    // Start sprite animation
    startSpriteAnimation();
    
    console.log(`[${extensionName}] Tama created`);
}

// ============================================
// GRIMOIRE PANEL (Tome + Clasp)
// ============================================

function getGrimoireHTML() {
    return `
        <div class="mg-overlay" id="mg-overlay"></div>
        <div class="mg-grimoire mg-fab" id="mg-grimoire" data-mg-theme="${extensionSettings.shellTheme}">
            <div class="mg-tome">
                <!-- Corner gems -->
                <span class="mg-tome-gem mg-tome-gem--tl"></span>
                <span class="mg-tome-gem mg-tome-gem--tr"></span>
                <span class="mg-tome-gem mg-tome-gem--bl"></span>
                <span class="mg-tome-gem mg-tome-gem--br"></span>
                
                <!-- Embossed border -->
                <div class="mg-tome-border"></div>
                
                <!-- Inner page -->
                <div class="mg-tome-page">
                    <div class="mg-tome-layout">
                        <!-- Side tabs -->
                        <div class="mg-tome-tabs">
                            <button class="mg-tome-tab active" data-mg-tab="cards">
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="1" width="10" height="14" rx="1.5"/><path d="M6 5.5l-1 2.5h3l-1 2.5"/></svg>
                                <span>Cards</span>
                            </button>
                            <button class="mg-tome-tab" data-mg-tab="queue">
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="4" y1="3" x2="13" y2="3"/><line x1="4" y1="8" x2="13" y2="8"/><line x1="4" y1="13" x2="13" y2="13"/><circle cx="1.5" cy="3" r="0.75" fill="currentColor"/><circle cx="1.5" cy="8" r="0.75" fill="currentColor"/><circle cx="1.5" cy="13" r="0.75" fill="currentColor"/></svg>
                                <span>Queue</span>
                            </button>
                            <button class="mg-tome-tab" data-mg-tab="nyx">
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" stroke="none"><path d="M8 14s-5.5-4.5-6.5-7C.5 4.5 2 2 4.5 2 6 2 7.5 3.5 8 4.5 8.5 3.5 10 2 11.5 2 14 2 15.5 4.5 14.5 7 13.5 9.5 8 14 8 14z"/></svg>
                                <span>Nyx</span>
                            </button>
                        </div>
                        
                        <!-- Content area -->
                        <div class="mg-tome-content">
                            <!-- Cards Tab -->
                            <div class="mg-tome-panel active" data-mg-panel="cards">
                                <div class="mg-tome-heading">Draw from the Deck</div>
                                <div class="mg-tome-flavor">The cards whisper of what is to come...</div>
                                
                                <div class="mg-card-spread">
                                    <div class="mg-card-slot" style="transform:rotate(-5deg)"><span class="mg-card-symbol">✦</span></div>
                                    <div class="mg-card-slot"><span class="mg-card-symbol">✦</span></div>
                                    <div class="mg-card-slot" style="transform:rotate(5deg)"><span class="mg-card-symbol">✦</span></div>
                                </div>
                                
                                <button class="mg-tome-btn mg-draw-btn" id="mg-grimoire-draw">
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="1" width="10" height="14" rx="1.5"/><path d="M6 5.5l-1 2.5h3l-1 2.5"/></svg>
                                    Draw a Card
                                </button>
                                
                                <div class="mg-tome-section">
                                    <div class="mg-tome-section-title">Last Reading</div>
                                    <div class="mg-last-reading">
                                        <div class="mg-mini-card">—</div>
                                        <div class="mg-last-reading-info">
                                            <div class="mg-last-reading-name" id="mg-last-card-name">No cards drawn yet</div>
                                            <div class="mg-last-reading-keywords" id="mg-last-card-keywords">Draw to reveal your fate</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Queue Tab -->
                            <div class="mg-tome-panel" data-mg-panel="queue">
                                <div class="mg-tome-heading">Card Queue</div>
                                <div class="mg-tome-flavor">Cards drawn, awaiting their moment in the story</div>
                                
                                <div class="mg-queue-list" id="mg-queue-list">
                                    <div class="mg-queue-empty">
                                        <div class="mg-queue-empty-icon">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4"><rect x="4" y="2" width="12" height="18" rx="2"/><line x1="8" y1="8" x2="14" y2="8"/><line x1="8" y1="12" x2="12" y2="12"/></svg>
                                        </div>
                                        The queue is empty. Draw some cards!
                                    </div>
                                </div>
                                
                                <div class="mg-queue-footer" id="mg-queue-footer">0 of 5 slots filled</div>
                            </div>
                            
                            <!-- Nyx Tab -->
                            <div class="mg-tome-panel" data-mg-panel="nyx">
                                <div class="mg-tome-heading">Nyx</div>
                                
                                <div class="mg-nyx-stats">
                                    <div class="mg-nyx-stats-header">
                                        <span>Disposition</span>
                                        <span class="mg-nyx-score" id="mg-nyx-score">${extensionSettings.nyx.disposition}</span>
                                    </div>
                                    <div class="mg-nyx-bar">
                                        <div class="mg-nyx-bar-fill" id="mg-nyx-bar" style="width:${extensionSettings.nyx.disposition}%"></div>
                                    </div>
                                    <div class="mg-nyx-bar-labels">
                                        <span>hostile</span><span>neutral</span><span>devoted</span>
                                    </div>
                                </div>
                                
                                <div class="mg-nyx-mood" id="mg-nyx-mood-text">
                                    Currently: <b>${getMoodText(extensionSettings.nyx.disposition)}</b>
                                </div>
                                
                                <div class="mg-nyx-actions">
                                    <button class="mg-nyx-action-btn" data-action="treat">Offer Treat</button>
                                    <button class="mg-nyx-action-btn" data-action="advice">Ask Advice</button>
                                    <button class="mg-nyx-action-btn" data-action="pet">Pet</button>
                                    <button class="mg-nyx-action-btn" data-action="tease">Tease</button>
                                </div>
                                
                                <div class="mg-tome-section">
                                    <div class="mg-tome-section-title">Recent</div>
                                    <div class="mg-nyx-log" id="mg-nyx-log">
                                        <div class="mg-nyx-log-entry">Nyx watches you curiously...</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Clasp -->
                <div class="mg-tome-clasp">
                    <div class="mg-tome-clasp-dot"></div>
                </div>
            </div>
        </div>
    `;
}

let grimoireOpen = false;

function triggerTransformation() {
    const $compact = $('#mg-compact');
    
    if (typeof toastr !== 'undefined') toastr.info('🔮 Transformation triggered', 'Debug');
    
    if ($compact.hasClass('transforming')) return;
    
    if (grimoireOpen) {
        closeGrimoire();
        return;
    }
    
    $compact.addClass('transforming');
    showSpeech("✨ Let's see what the cards reveal...", 2000);
    
    setTimeout(() => {
        $compact.removeClass('transforming');
        openGrimoire();
    }, 600);
}

function openGrimoire() {
    if (grimoireOpen) return;
    grimoireOpen = true;
    
    if (typeof toastr !== 'undefined') toastr.info('📖 openGrimoire called', 'Debug');
    
    // Remove any existing
    $('#mg-grimoire, #mg-overlay').remove();
    
    // Add to body
    const html = getGrimoireHTML();
    $('body').append(html);
    
    const grimoire = document.getElementById('mg-grimoire');
    const overlay = document.getElementById('mg-overlay');
    
    if (typeof toastr !== 'undefined') {
        toastr.info(`grimoire: ${!!grimoire}, overlay: ${!!overlay}`, 'Debug Elements');
    }
    
    if (!grimoire || !overlay) return;
    
    // Position: center horizontally, upper portion of screen
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;
    const gW = Math.min(300, vpW - 32);
    let gLeft = (vpW - gW) / 2;
    let gTop = Math.max(60, vpH - 480);
    
    grimoire.style.setProperty('width', gW + 'px', 'important');
    grimoire.style.setProperty('left', gLeft + 'px', 'important');
    grimoire.style.setProperty('top', gTop + 'px', 'important');
    
    // Force display then animate
    grimoire.style.setProperty('display', 'block', 'important');
    overlay.style.setProperty('display', 'block', 'important');
    
    requestAnimationFrame(() => {
        grimoire.classList.add('visible');
        overlay.classList.add('visible');
    });
    
    // Wire up events
    setupGrimoireEvents();
    
    if (typeof toastr !== 'undefined') {
        const r = grimoire.getBoundingClientRect();
        toastr.success(`📐 ${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}`, 'Grimoire Pos');
    }
    
    console.log(`[${extensionName}] Grimoire opened`);
}

function closeGrimoire() {
    grimoireOpen = false;
    
    const grimoire = document.getElementById('mg-grimoire');
    const overlay = document.getElementById('mg-overlay');
    
    if (grimoire) grimoire.classList.remove('visible');
    if (overlay) overlay.classList.remove('visible');
    
    // Remove after animation
    setTimeout(() => {
        $('#mg-grimoire, #mg-overlay').remove();
    }, 300);
    
    $('#mg-compact').removeClass('active');
    console.log(`[${extensionName}] Grimoire closed`);
}

function setupGrimoireEvents() {
    // Overlay click to close
    $('#mg-overlay').on('click', closeGrimoire);
    
    // Tab switching
    $('.mg-tome-tab').on('click', function() {
        const tabName = $(this).data('mg-tab');
        
        $('.mg-tome-tab').removeClass('active');
        $(this).addClass('active');
        
        $('.mg-tome-panel').removeClass('active');
        $(`.mg-tome-panel[data-mg-panel="${tabName}"]`).addClass('active');
    });
    
    // Draw button
    $('#mg-grimoire-draw').on('click', function() {
        onDrawCard();
    });
    
    // Nyx action buttons
    $('.mg-nyx-action-btn').on('click', function() {
        const action = $(this).data('action');
        onNyxAction(action);
    });
}

function onNyxAction(action) {
    const responses = {
        treat: ["Nyx accepted the treat graciously. +2", "Nyx sniffed it and looked unimpressed.", "Nyx devoured it instantly! +3"],
        advice: ["Nyx says: 'Trust the next card drawn.'", "Nyx says: 'Patience is a virtue you lack.'", "Nyx stares at you in eloquent silence."],
        pet: ["Nyx purrs contentedly. +1", "Nyx tolerates this. Barely.", "Nyx leans into your hand. +2"],
        tease: ["Nyx narrows her eyes. -1", "Nyx swats at you dismissively.", "Nyx pretends not to care. She cares."],
    };
    
    const options = responses[action] || ["Nyx ignores you."];
    const response = options[Math.floor(Math.random() * options.length)];
    
    // Add to log
    const log = document.getElementById('mg-nyx-log');
    if (log) {
        const entry = document.createElement('div');
        entry.className = 'mg-nyx-log-entry';
        entry.textContent = response;
        log.prepend(entry);
        
        // Keep log trimmed
        while (log.children.length > 5) {
            log.removeChild(log.lastChild);
        }
    }
    
    showSpeech(response, 3000);
}

// ============================================
// BUTTON HANDLERS
// ============================================

function onDrawCard() {
    showCardFlash();
    showSpeech("A card? Very well. Let's see what fate has in store...");
    
    const currentQueue = parseInt($('#mg-tama-queue').text()) || 0;
    $('#mg-tama-queue').text(Math.min(currentQueue + 1, 5));
}

function onViewQueue() {
    const queueCount = parseInt($('#mg-tama-queue').text()) || 0;
    
    if (queueCount === 0) {
        showSpeech("The queue is empty. Draw something.");
    } else {
        showSpeech(`${queueCount} card${queueCount > 1 ? 's' : ''} await their moment.`);
    }
}

function onPokeNyx() {
    const responses = [
        "*swats your hand away* Don't.",
        "...what do you want?",
        "*stretches* I was napping.",
        "Touch me again and I'll curse you.",
        "Oh, you're still here.",
        "*stares at you with ancient contempt*",
        "*yawns dramatically*",
        "I've lived a thousand years for THIS?"
    ];
    
    const response = responses[Math.floor(Math.random() * responses.length)];
    showSpeech(response);
    
    // Disposition shift
    const shift = Math.random() < 0.3 ? 2 : -1;
    extensionSettings.nyx.disposition = Math.max(0, Math.min(100, extensionSettings.nyx.disposition + shift));
    saveSettings();
    updateNyxMood();
}

// ============================================
// CARD FLASH
// ============================================

function showCardFlash() {
    const flash = document.getElementById('mg-tama-flash');
    if (!flash) return;
    
    flash.classList.remove('visible');
    void flash.offsetWidth; // Force reflow for re-triggering
    flash.classList.add('visible');
    setTimeout(() => flash.classList.remove('visible'), 600);
}

// ============================================
// SPEECH BUBBLE (anchored to compact)
// ============================================

let speechTimeout = null;

function showSpeech(text, duration = 4000) {
    const speech = document.getElementById('mg-speech');
    if (!speech) return;
    
    clearTimeout(speechTimeout);
    
    const textEl = speech.querySelector('.mg-thought-text');
    if (textEl) textEl.textContent = text;
    speech.classList.add('visible');
    
    speechTimeout = setTimeout(() => {
        speech.classList.remove('visible');
    }, duration);
}

// ============================================
// NYX MOOD UPDATE
// ============================================

function updateNyxMood() {
    const disposition = extensionSettings.nyx.disposition;
    const mood = getMoodText(disposition);
    
    $('#mg-tama-mood').text(mood);
    $('#mg-tama-disposition').text(disposition);
    
    currentSpriteFrame = 0;
    updateSpriteDisplay();
    
    const heart = $('#mg-tama-heart');
    if (disposition >= 60) {
        heart.addClass('invested');
    } else {
        heart.removeClass('invested');
    }
}

// ============================================
// THEME & VARIANT SWITCHING
// ============================================

function setTheme(themeName) {
    extensionSettings.shellTheme = themeName;
    $('#mg-compact').attr('data-mg-theme', themeName);
    $('#mg-tama').attr('data-mg-theme', themeName);
    saveSettings();
}

function setFamiliarForm(formName) {
    extensionSettings.familiarForm = formName;
    currentSpriteFrame = 0;
    updateSpriteDisplay();
    saveSettings();
}

function setCompactSize(size) {
    extensionSettings.compactSize = size;
    $('#mg-compact').attr('data-mg-size', size);
    saveSettings();
}

function setTamaSize(size) {
    extensionSettings.tamaSize = size;
    $('#mg-tama').attr('data-mg-size', size);
    saveSettings();
}

// ============================================
// SETTINGS PANEL
// ============================================

async function addExtensionSettings() {
    const html = `
        <div class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
                <b>📖 Petit Grimoire</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content">
                <label class="checkbox_label">
                    <input type="checkbox" id="mg-enabled" ${extensionSettings.enabled ? 'checked' : ''}>
                    <span>Enable Extension</span>
                </label>
                
                <hr>
                <h5>Compact Brooch</h5>
                
                <label for="mg-theme">Color Theme:</label>
                <select id="mg-theme" class="text_pole">
                    <option value="sailor-moon" ${extensionSettings.shellTheme === 'sailor-moon' ? 'selected' : ''}>Sailor Moon</option>
                    <option value="madoka" ${extensionSettings.shellTheme === 'madoka' ? 'selected' : ''}>Madoka</option>
                    <option value="witch-core" ${extensionSettings.shellTheme === 'witch-core' ? 'selected' : ''}>Witch Core</option>
                    <option value="pastel-goth" ${extensionSettings.shellTheme === 'pastel-goth' ? 'selected' : ''}>Pastel Goth</option>
                    <option value="y2k" ${extensionSettings.shellTheme === 'y2k' ? 'selected' : ''}>Y2K</option>
                    <option value="classic" ${extensionSettings.shellTheme === 'classic' ? 'selected' : ''}>Classic</option>
                </select>
                
                <label for="mg-compact-size">Compact Size:</label>
                <select id="mg-compact-size" class="text_pole">
                    <option value="small" ${extensionSettings.compactSize === 'small' ? 'selected' : ''}>Small</option>
                    <option value="medium" ${extensionSettings.compactSize === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="large" ${extensionSettings.compactSize === 'large' ? 'selected' : ''}>Large</option>
                </select>
                
                <label class="checkbox_label">
                    <input type="checkbox" id="mg-show-compact" ${extensionSettings.showCompact !== false ? 'checked' : ''}>
                    <span>Show Compact</span>
                </label>
                
                <hr>
                <h5>Nyx-gotchi</h5>
                
                <label for="mg-familiar">Familiar Form:</label>
                <select id="mg-familiar" class="text_pole">
                    <option value="cat" ${extensionSettings.familiarForm === 'cat' ? 'selected' : ''}>Cat</option>
                    <option value="owl" ${extensionSettings.familiarForm === 'owl' ? 'selected' : ''}>Owl</option>
                    <option value="fox" ${extensionSettings.familiarForm === 'fox' ? 'selected' : ''}>Fox</option>
                    <option value="bunny" ${extensionSettings.familiarForm === 'bunny' ? 'selected' : ''}>Bunny</option>
                </select>
                
                <label for="mg-tama-size">Tama Size:</label>
                <select id="mg-tama-size" class="text_pole">
                    <option value="small" ${extensionSettings.tamaSize === 'small' ? 'selected' : ''}>Small</option>
                    <option value="medium" ${extensionSettings.tamaSize === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="large" ${extensionSettings.tamaSize === 'large' ? 'selected' : ''}>Large</option>
                </select>
                
                <label class="checkbox_label">
                    <input type="checkbox" id="mg-show-tama" ${extensionSettings.showTama !== false ? 'checked' : ''}>
                    <span>Show Nyx-gotchi</span>
                </label>
                
                <hr>
                
                <div class="flex-container">
                    <span>Nyx Disposition: </span>
                    <span id="mg-disposition-display">${extensionSettings.nyx.disposition}</span>
                </div>
                
                <hr>
                
                <div class="flex-container">
                    <input type="button" id="mg-reset-positions" class="menu_button" value="Reset Positions">
                </div>
            </div>
        </div>
    `;
    
    $('#extensions_settings2').append(html);
    
    // ---- Event handlers ----
    
    $('#mg-enabled').on('change', function() {
        extensionSettings.enabled = $(this).prop('checked');
        saveSettings();
        
        if (extensionSettings.enabled) {
            createCompact();
            createTama();
        } else {
            $('#mg-compact').remove();
            $('#mg-tama').remove();
            stopSpriteAnimation();
        }
    });
    
    $('#mg-theme').on('change', function() {
        setTheme($(this).val());
    });
    
    $('#mg-compact-size').on('change', function() {
        setCompactSize($(this).val());
    });
    
    $('#mg-familiar').on('change', function() {
        setFamiliarForm($(this).val());
    });
    
    $('#mg-tama-size').on('change', function() {
        setTamaSize($(this).val());
    });
    
    $('#mg-show-compact').on('change', function() {
        extensionSettings.showCompact = $(this).prop('checked');
        saveSettings();
        const el = document.getElementById('mg-compact');
        if (el) {
            el.style.setProperty('display', extensionSettings.showCompact ? 'flex' : 'none', 'important');
        }
    });
    
    $('#mg-show-tama').on('change', function() {
        extensionSettings.showTama = $(this).prop('checked');
        saveSettings();
        const el = document.getElementById('mg-tama');
        if (el) {
            el.style.setProperty('display', extensionSettings.showTama ? 'flex' : 'none', 'important');
        }
    });
    
    $('#mg-reset-positions').on('click', function() {
        extensionSettings.compactPosition = { ...defaultSettings.compactPosition };
        extensionSettings.tamaPosition = { ...defaultSettings.tamaPosition };
        saveSettings();
        
        // Nuke inline styles completely and recreate - most reliable on mobile
        createCompact();
        createTama();
        
        if (typeof toastr !== 'undefined') {
            toastr.info('Positions reset!');
        }
    });
}

// ============================================
// INITIALIZATION
// ============================================

jQuery(async () => {
    try {
        console.log(`[${extensionName}] Starting initialization...`);
        
        loadSettings();
        
        await addExtensionSettings();
        
        if (extensionSettings.enabled) {
            createCompact();
            createTama();
        }
        
        console.log(`[${extensionName}] ✅ Loaded successfully`);
        
    } catch (error) {
        console.error(`[${extensionName}] ❌ Critical failure:`, error);
        if (typeof toastr !== 'undefined') {
            toastr.error('Petit Grimoire failed to initialize.', 'Error', { timeOut: 10000 });
        }
    }
});

// ============================================
// EXPORTS (for debugging)
// ============================================

window.PetitGrimoire = {
    getSettings: () => extensionSettings,
    setTheme,
    setFamiliarForm,
    setCompactSize,
    setTamaSize,
    showSpeech,
    updateNyxMood,
    triggerTransformation,
    openGrimoire,
    closeGrimoire
};
