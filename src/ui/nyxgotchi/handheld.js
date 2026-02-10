/**
 * Petit Grimoire — Handheld Panel
 * Game Boy style popup for Nyx interactions
 * 
 * Opens when tapping the Nyxgotchi shell.
 * D-pad navigates menu, A selects, B goes back.
 * 
 * Screens: main, chat, status, knucklebones, radio, weather, horoscope, settings
 */

import { ASSET_PATHS, getTheme } from '../../core/config.js';
import { settings, updateSetting } from '../../core/state.js';
import { getMoodText } from './sprites.js';

// ============================================
// STATE
// ============================================

let isOpen = false;
let currentScreen = 'main';
let selectedIndex = 0;  // D-pad highlighted menu item

// ============================================
// MENU DEFINITIONS
// ============================================

const MAIN_MENU = [
    { id: 'chat',         icon: '💬', label: 'Chat',         screen: 'chat' },
    { id: 'status',       icon: '♥',  label: 'Status',       screen: 'status' },
    { id: 'knucklebones', icon: '🎲', label: 'Knucklebones', screen: 'knucklebones' },
    { id: 'radio',        icon: '📻', label: 'Radio',        screen: 'radio' },
    { id: 'weather',      icon: '🌧',  label: 'Weather',      screen: 'weather' },
    { id: 'horoscope',    icon: '⭐', label: 'Horoscope',    screen: 'horoscope' },
];

// ============================================
// SCREEN CONTENT GENERATORS
// ============================================

function getMainScreenContent() {
    const disposition = settings.nyxDisposition ?? 50;
    const mood = getMoodText(disposition);

    const menuHTML = MAIN_MENU.map((item, i) => `
        <button class="handheld-menu-btn ${i === selectedIndex ? 'selected' : ''}" 
                data-screen="${item.screen}" data-index="${i}">
            <span class="menu-icon">${item.icon}</span>
            <span class="menu-label">${item.label}</span>
        </button>
    `).join('');

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
                ${menuHTML}
            </div>
        </div>
    `;
}

function getChatContent() {
    return `
        <div class="handheld-sub-screen">
            <div class="handheld-sub-title">💬 Chat</div>
            <div class="handheld-sub-body" id="handheld-chat-log">
                <p class="screen-placeholder">Nyx is listening...</p>
            </div>
            <button class="handheld-back-btn" data-screen="main">← Back</button>
        </div>
    `;
}

function getStatusContent() {
    const disposition = settings.nyxDisposition ?? 50;
    const mood = getMoodText(disposition);

    return `
        <div class="handheld-sub-screen">
            <div class="handheld-sub-title">♥ Status</div>
            <div class="handheld-sub-body">
                <div class="status-row">
                    <span class="status-label">Mood</span>
                    <span class="status-value">${mood}</span>
                </div>
                <div class="status-row">
                    <span class="status-label">Disposition</span>
                    <span class="status-value">${disposition}/100</span>
                </div>
                <div class="mood-bar" style="margin-top: 4px;">
                    <div class="mood-bar-fill" style="width: ${disposition}%"></div>
                </div>
            </div>
            <button class="handheld-back-btn" data-screen="main">← Back</button>
        </div>
    `;
}

function getKnucklebonesContent() {
    return `
        <div class="handheld-sub-screen">
            <div class="handheld-sub-title">🎲 Knucklebones</div>
            <div class="handheld-sub-body">
                <p class="screen-placeholder">Coming soon...</p>
            </div>
            <button class="handheld-back-btn" data-screen="main">← Back</button>
        </div>
    `;
}

function getRadioContent() {
    return `
        <div class="handheld-sub-screen">
            <div class="handheld-sub-title">📻 Radio</div>
            <div class="handheld-sub-body">
                <p class="screen-placeholder">Tuning in...</p>
            </div>
            <button class="handheld-back-btn" data-screen="main">← Back</button>
        </div>
    `;
}

function getWeatherContent() {
    return `
        <div class="handheld-sub-screen">
            <div class="handheld-sub-title">🌧 Weather</div>
            <div class="handheld-sub-body">
                <p class="screen-placeholder">Checking the skies...</p>
            </div>
            <button class="handheld-back-btn" data-screen="main">← Back</button>
        </div>
    `;
}

function getHoroscopeContent() {
    return `
        <div class="handheld-sub-screen">
            <div class="handheld-sub-title">⭐ Horoscope</div>
            <div class="handheld-sub-body">
                <p class="screen-placeholder">Reading the stars...</p>
            </div>
            <button class="handheld-back-btn" data-screen="main">← Back</button>
        </div>
    `;
}

function getSettingsContent() {
    const disposition = settings.nyxDisposition ?? 50;
    const showTama = settings.showNyxgotchi !== false;

    return `
        <div class="handheld-sub-screen">
            <div class="handheld-sub-title">⚙ Settings</div>
            <div class="handheld-sub-body">
                <label class="setting-row">
                    <span>Show Tama</span>
                    <input type="checkbox" id="handheld-show-tama" ${showTama ? 'checked' : ''}>
                </label>
                <label class="setting-row">
                    <span>Disposition</span>
                    <input type="range" id="handheld-disposition" min="0" max="100" value="${disposition}">
                    <span id="handheld-disp-value">${disposition}</span>
                </label>
            </div>
            <button class="handheld-back-btn" data-screen="main">← Back</button>
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
        case 'chat':         screenEl.innerHTML = getChatContent(); break;
        case 'status':       screenEl.innerHTML = getStatusContent(); break;
        case 'knucklebones': screenEl.innerHTML = getKnucklebonesContent(); break;
        case 'radio':        screenEl.innerHTML = getRadioContent(); break;
        case 'weather':      screenEl.innerHTML = getWeatherContent(); break;
        case 'horoscope':    screenEl.innerHTML = getHoroscopeContent(); break;
        case 'settings':
            screenEl.innerHTML = getSettingsContent();
            setupSettingsListeners();
            break;
        default:
            selectedIndex = 0;
            screenEl.innerHTML = getMainScreenContent();
    }

    setupScreenListeners();
}

function setupScreenListeners() {
    // Menu buttons (tap to navigate)
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

    // Poke action (legacy)
    document.querySelectorAll('[data-action="poke"]').forEach(btn => {
        btn.addEventListener('click', handlePoke);
    });
}

function setupSettingsListeners() {
    const dispSlider = document.getElementById('handheld-disposition');
    if (dispSlider) {
        dispSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            const valEl = document.getElementById('handheld-disp-value');
            if (valEl) valEl.textContent = value;
            updateSetting('nyxDisposition', value);
            
            const moodEl = document.getElementById('nyxgotchi-mood');
            if (moodEl) moodEl.textContent = getMoodText(value);
        });
    }

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
// D-PAD NAVIGATION
// ============================================

function updateSelection(newIndex) {
    const items = document.querySelectorAll('.handheld-menu-btn[data-index]');
    if (items.length === 0) return;

    // Wrap around
    if (newIndex < 0) newIndex = items.length - 1;
    if (newIndex >= items.length) newIndex = 0;
    selectedIndex = newIndex;

    // Update visual selection
    items.forEach((btn, i) => {
        btn.classList.toggle('selected', i === selectedIndex);
    });

    // Scroll selected item into view
    items[selectedIndex]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function handleDpad(direction) {
    if (currentScreen !== 'main') {
        // In sub-screens, left = back
        if (direction === 'left') {
            renderScreen('main');
        }
        return;
    }

    switch (direction) {
        case 'up':
            updateSelection(selectedIndex - 1);
            break;
        case 'down':
            updateSelection(selectedIndex + 1);
            break;
        case 'right':
            // Right = enter selected screen (same as A)
            handleAButton();
            break;
    }
}

function handleAButton() {
    if (currentScreen === 'main') {
        // Select highlighted menu item
        const items = document.querySelectorAll('.handheld-menu-btn[data-index]');
        const selected = items[selectedIndex];
        if (selected?.dataset.screen) {
            renderScreen(selected.dataset.screen);
        }
    } else {
        // In sub-screens, A could confirm/interact
        const actionBtn = document.querySelector('.roll-btn, .handheld-action-btn');
        if (actionBtn) actionBtn.click();
    }
}

function handleBButton() {
    if (currentScreen === 'main') {
        closeHandheld();
    } else {
        renderScreen('main');
    }
}

// ============================================
// POKE INTERACTION
// ============================================

function handlePoke() {
    const speechEl = document.getElementById('handheld-speech');
    if (!speechEl) return;

    const phrases = [
        "Don't touch me.",
        "What.",
        "I was sleeping.",
        "Do that again and I bite.",
        "...fine. Hello.",
        "*hiss*",
        "You have my attention. Briefly.",
        "The audacity.",
        "I'll allow it. Once.",
        "Acceptable.",
        "Don't make it weird."
    ];

    const msg = phrases[Math.floor(Math.random() * phrases.length)];
    const textEl = speechEl.querySelector('.speech-text');
    if (textEl) textEl.textContent = msg;
}

// ============================================
// HANDHELD HTML
// ============================================

function getHandheldHTML() {
    const theme = settings.theme || 'guardian';
    const themeData = getTheme(theme);
    const gameboyImg = themeData.gameboyShell || 'gameboy_lid.png';

    return `
        <div class="handheld-overlay" id="handheld-overlay">
            <div class="handheld-container" id="handheld-container" data-mg-theme="${theme}">
                
                <!-- Screen content (behind the shell) -->
                <div class="handheld-screen" id="handheld-screen">
                    <div class="handheld-screen-content" id="handheld-screen-content">
                        ${getMainScreenContent()}
                    </div>
                </div>

                <!-- Game Boy shell (on top, themed per deck) -->
                <img class="handheld-shell-img"
                     src="${ASSET_PATHS.shells}/${gameboyImg}"
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
            </div>
        </div>
    `;
}

// ============================================
// OPEN / CLOSE / TOGGLE
// ============================================

/**
 * Toggle the handheld panel open/closed.
 * @param {object} [pendingMsg] - Optional message from indicator system
 */
export function toggleHandheld(pendingMsg = null) {
    if (isOpen) {
        closeHandheld();
    } else {
        openHandheld(pendingMsg);
    }
}

/**
 * Open the handheld panel
 * @param {object} [pendingMsg] - Optional message to navigate to on open
 */
export function openHandheld(pendingMsg = null) {
    if (isOpen) return;

    // Add to DOM
    document.body.insertAdjacentHTML('beforeend', getHandheldHTML());

    const overlay = document.getElementById('handheld-overlay');
    const container = document.getElementById('handheld-container');

    if (!overlay || !container) {
        console.error('[PG] Failed to create handheld');
        return;
    }

    // Position directly with inline styles (same pattern as investigation.js)
    const isMobile = window.innerWidth <= 1000;

    if (isMobile) {
        const topBar = document.getElementById('top-settings-holder');
        const topBarHeight = topBar ? topBar.offsetHeight : 60;
        
        const availHeight = window.innerHeight - topBarHeight - 80;
        const containerHeight = Math.min(390, availHeight);
        const containerWidth = Math.round(containerHeight * (260 / 390));

        container.style.cssText = `
            position: fixed !important;
            top: ${topBarHeight + 10}px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            width: ${containerWidth}px !important;
            height: ${containerHeight}px !important;
            z-index: 2147483647 !important;
        `;
    } else {
        container.style.cssText = `
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 280px !important;
            height: 420px !important;
            z-index: 2147483647 !important;
        `;
    }

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeHandheld();
        }
    });

    // Wire D-pad buttons
    container.querySelectorAll('.dpad-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            handleDpad(btn.dataset.dir);
        });
    });

    // Wire A/B buttons
    const btnA = container.querySelector('.btn-a');
    if (btnA) btnA.addEventListener('click', handleAButton);

    const btnB = container.querySelector('.btn-b');
    if (btnB) btnB.addEventListener('click', handleBButton);

    // Setup screen listeners
    setupScreenListeners();

    // If there's a pending message, navigate to that screen
    if (pendingMsg?.screen) {
        renderScreen(pendingMsg.screen);
        console.log('[PG] Handheld opened to:', pendingMsg.screen);
    }

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

    setTimeout(() => {
        if (overlay) overlay.remove();
    }, 300);

    isOpen = false;
    currentScreen = 'main';
    selectedIndex = 0;
    console.log('[PG] Handheld closed');
}

/**
 * Check if handheld is open
 */
export function isHandheldOpen() {
    return isOpen;
}

/**
 * Update handheld theme (called when theme changes)
 */
export function updateHandheldTheme() {
    // If handheld is open, re-render with new theme
    if (isOpen) {
        closeHandheld();
        openHandheld();
    }
}
