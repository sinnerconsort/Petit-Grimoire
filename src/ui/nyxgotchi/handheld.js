/**
 * Petit Grimoire — Handheld Panel
 * Game Boy style popup for Nyx interactions & Knucklebones
 * 
 * Opens when tapping the Nyxgotchi shell.
 * Features a transparent screen area for dynamic content.
 */

import { ASSET_PATHS, getTheme } from '../../core/config.js';
import { settings, updateSetting } from '../../core/state.js';
import { getMoodText } from './sprites.js';

// ============================================
// STATE
// ============================================

let isOpen = false;
let currentScreen = 'main';  // 'main' | 'knucklebones' | 'settings'

// ============================================
// SCREEN CONTENT GENERATORS
// ============================================

function getMainScreenContent() {
    const disposition = settings.nyxDisposition ?? 50;
    const mood = getMoodText(disposition);
    const theme = getTheme(settings.theme);

    return `
        <div class="handheld-main-screen">
            <div class="handheld-title">✧ NYX ✧</div>
            
            <div class="handheld-mood-display">
                <div class="mood-label">Mood</div>
                <div class="mood-value">${mood}</div>
                <div class="mood-bar">
                    <div class="mood-bar-fill" style="width: ${disposition}%"></div>
                </div>
            </div>

            <div class="handheld-menu">
                <button class="handheld-menu-btn" data-screen="knucklebones">
                    🎲 Knucklebones
                </button>
                <button class="handheld-menu-btn" data-action="poke">
                    👆 Poke Nyx
                </button>
                <button class="handheld-menu-btn" data-screen="settings">
                    ⚙️ Settings
                </button>
            </div>

            <div class="handheld-speech" id="handheld-speech">
                <span class="speech-text">...</span>
            </div>
        </div>
    `;
}

function getKnucklebonesContent() {
    return `
        <div class="handheld-knucklebones">
            <div class="handheld-title">🎲 KNUCKLEBONES 🎲</div>
            
            <div class="knucklebones-board">
                <div class="knucklebones-player" data-player="nyx">
                    <div class="player-label">Nyx</div>
                    <div class="dice-grid">
                        <div class="dice-column">
                            <div class="dice-slot"></div>
                            <div class="dice-slot"></div>
                            <div class="dice-slot"></div>
                        </div>
                        <div class="dice-column">
                            <div class="dice-slot"></div>
                            <div class="dice-slot"></div>
                            <div class="dice-slot"></div>
                        </div>
                        <div class="dice-column">
                            <div class="dice-slot"></div>
                            <div class="dice-slot"></div>
                            <div class="dice-slot"></div>
                        </div>
                    </div>
                    <div class="player-score">0</div>
                </div>

                <div class="knucklebones-divider"></div>

                <div class="knucklebones-player" data-player="user">
                    <div class="player-score">0</div>
                    <div class="dice-grid">
                        <div class="dice-column" data-col="0">
                            <div class="dice-slot"></div>
                            <div class="dice-slot"></div>
                            <div class="dice-slot"></div>
                        </div>
                        <div class="dice-column" data-col="1">
                            <div class="dice-slot"></div>
                            <div class="dice-slot"></div>
                            <div class="dice-slot"></div>
                        </div>
                        <div class="dice-column" data-col="2">
                            <div class="dice-slot"></div>
                            <div class="dice-slot"></div>
                            <div class="dice-slot"></div>
                        </div>
                    </div>
                    <div class="player-label">You</div>
                </div>
            </div>

            <div class="knucklebones-current-die">
                <div class="current-die-value">?</div>
                <button class="roll-btn">Roll</button>
            </div>

            <div class="handheld-back-btn" data-screen="main">← Back</div>
        </div>
    `;
}

function getSettingsContent() {
    const disposition = settings.nyxDisposition ?? 50;

    return `
        <div class="handheld-settings">
            <div class="handheld-title">⚙️ SETTINGS ⚙️</div>
            
            <div class="settings-group">
                <label class="setting-label">Disposition</label>
                <input type="range" 
                       class="setting-range" 
                       id="handheld-disposition" 
                       min="0" max="100" 
                       value="${disposition}">
                <span class="setting-value">${disposition}</span>
            </div>

            <div class="settings-group">
                <label class="setting-label">
                    <input type="checkbox" 
                           id="handheld-show-tama"
                           ${settings.showNyxgotchi !== false ? 'checked' : ''}>
                    Show Nyxgotchi
                </label>
            </div>

            <div class="handheld-back-btn" data-screen="main">← Back</div>
        </div>
    `;
}

// ============================================
// SCREEN MANAGEMENT
// ============================================

function renderScreen(screenName) {
    const screenEl = document.getElementById('handheld-screen-content');
    if (!screenEl) return;

    currentScreen = screenName;

    switch (screenName) {
        case 'knucklebones':
            screenEl.innerHTML = getKnucklebonesContent();
            break;
        case 'settings':
            screenEl.innerHTML = getSettingsContent();
            setupSettingsListeners();
            break;
        default:
            screenEl.innerHTML = getMainScreenContent();
    }

    setupScreenListeners();
}

function setupScreenListeners() {
    // Menu buttons
    document.querySelectorAll('.handheld-menu-btn[data-screen]').forEach(btn => {
        btn.addEventListener('click', () => {
            renderScreen(btn.dataset.screen);
        });
    });

    // Back buttons
    document.querySelectorAll('.handheld-back-btn[data-screen]').forEach(btn => {
        btn.addEventListener('click', () => {
            renderScreen(btn.dataset.screen);
        });
    });

    // Poke action
    document.querySelectorAll('[data-action="poke"]').forEach(btn => {
        btn.addEventListener('click', handlePoke);
    });
}

function setupSettingsListeners() {
    // Disposition slider
    const dispSlider = document.getElementById('handheld-disposition');
    if (dispSlider) {
        dispSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            e.target.nextElementSibling.textContent = value;
            updateSetting('nyxDisposition', value);
            
            // Update nyxgotchi mood
            const moodEl = document.getElementById('nyxgotchi-mood');
            if (moodEl) moodEl.textContent = getMoodText(value);
        });
    }

    // Show tama toggle
    const showTama = document.getElementById('handheld-show-tama');
    if (showTama) {
        showTama.addEventListener('change', (e) => {
            const nyxgotchi = document.getElementById('nyxgotchi');
            if (nyxgotchi) {
                nyxgotchi.style.display = e.target.checked ? 'block' : 'none';
            }
            updateSetting('showNyxgotchi', e.target.checked);
        });
    }
}

// ============================================
// POKE INTERACTION
// ============================================

const POKE_RESPONSES = {
    annoyed: [
        "What.",
        "Stop that.",
        "*hiss*",
        "Do you have nothing better to do?",
        "I'm busy."
    ],
    bored: [
        "*yawn*",
        "...yes?",
        "Is something happening?",
        "Wake me when it's interesting."
    ],
    neutral: [
        "Yes?",
        "I'm watching.",
        "Go on.",
        "Something on your mind?"
    ],
    amused: [
        "Oh? Need something?",
        "Checking on me?",
        "How thoughtful.",
        "I suppose I'll allow it."
    ],
    delighted: [
        "Ah, you~",
        "Miss me already?",
        "How delightful.",
        "Yes yes, I'm here."
    ]
};

function handlePoke() {
    const disposition = settings.nyxDisposition ?? 50;
    const mood = getMoodText(disposition);
    const responses = POKE_RESPONSES[mood] || POKE_RESPONSES.neutral;
    const response = responses[Math.floor(Math.random() * responses.length)];

    showSpeech(response);
}

function showSpeech(text, duration = 3000) {
    const speechEl = document.getElementById('handheld-speech');
    if (!speechEl) return;

    const textEl = speechEl.querySelector('.speech-text');
    if (textEl) textEl.textContent = text;

    speechEl.classList.add('visible');

    setTimeout(() => {
        speechEl.classList.remove('visible');
    }, duration);
}

// ============================================
// HANDHELD HTML
// ============================================

function getHandheldHTML() {
    const theme = settings.theme || 'guardian';

    return `
        <div class="handheld-overlay" id="handheld-overlay">
            <div class="handheld-container" id="handheld-container" data-mg-theme="${theme}">
                
                <!-- Screen content (behind the shell) -->
                <div class="handheld-screen" id="handheld-screen">
                    <div class="handheld-screen-content" id="handheld-screen-content">
                        ${getMainScreenContent()}
                    </div>
                </div>

                <!-- Game Boy shell (on top) -->
                <img class="handheld-shell-img"
                     src="${ASSET_PATHS.shells}/gameboy_lid.png"
                     alt=""
                     draggable="false" />

                <!-- D-Pad (positioned over the shell) -->
                <div class="handheld-dpad">
                    <button class="dpad-btn dpad-up" data-dir="up">▲</button>
                    <button class="dpad-btn dpad-left" data-dir="left">◀</button>
                    <button class="dpad-btn dpad-right" data-dir="right">▶</button>
                    <button class="dpad-btn dpad-down" data-dir="down">▼</button>
                </div>

                <!-- A/B Buttons -->
                <div class="handheld-buttons">
                    <button class="action-btn btn-b">B</button>
                    <button class="action-btn btn-a">A</button>
                </div>

                <!-- Close button -->
                <button class="handheld-close" id="handheld-close">✕</button>
            </div>
        </div>
    `;
}

// ============================================
// OPEN / CLOSE / TOGGLE
// ============================================

/**
 * Toggle the handheld panel open/closed.
 * Called by Nyxgotchi tap.
 */
export function toggleHandheld() {
    if (isOpen) {
        closeHandheld();
    } else {
        openHandheld();
    }
}

/**
 * Open the handheld panel
 */
export function openHandheld() {
    if (isOpen) return;

    // Add to DOM
    document.body.insertAdjacentHTML('beforeend', getHandheldHTML());

    const overlay = document.getElementById('handheld-overlay');
    const container = document.getElementById('handheld-container');

    if (!overlay || !container) {
        console.error('[PG] Failed to create handheld');
        return;
    }

    // Setup close handlers
    const closeBtn = document.getElementById('handheld-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeHandheld);
    }

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeHandheld();
        }
    });

    // B button = back/close
    const btnB = container.querySelector('.btn-b');
    if (btnB) {
        btnB.addEventListener('click', () => {
            if (currentScreen === 'main') {
                closeHandheld();
            } else {
                renderScreen('main');
            }
        });
    }

    // A button = confirm/select
    const btnA = container.querySelector('.btn-a');
    if (btnA) {
        btnA.addEventListener('click', () => {
            const firstBtn = container.querySelector('.handheld-menu-btn, .roll-btn');
            if (firstBtn) firstBtn.click();
        });
    }

    // Setup screen listeners
    setupScreenListeners();

    // Animate in
    requestAnimationFrame(() => {
        overlay.classList.add('visible');
        container.classList.add('visible');
    });

    isOpen = true;
    console.log('[PG] Handheld opened');
}

/**
 * Close the handheld panel
 */
export function closeHandheld() {
    const overlay = document.getElementById('handheld-overlay');
    const container = document.getElementById('handheld-container');

    if (container) container.classList.remove('visible');
    if (overlay) overlay.classList.remove('visible');

    // Remove after animation
    setTimeout(() => {
        if (overlay) overlay.remove();
    }, 300);

    isOpen = false;
    currentScreen = 'main';
    console.log('[PG] Handheld closed');
}

/**
 * Check if handheld is open
 */
export function isHandheldOpen() {
    return isOpen;
}

/**
 * Update handheld theme
 */
export function updateHandheldTheme() {
    const container = document.getElementById('handheld-container');
    if (container) {
        container.setAttribute('data-mg-theme', settings.theme || 'guardian');
    }
}
