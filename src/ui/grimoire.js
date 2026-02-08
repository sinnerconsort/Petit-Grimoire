/**
 * Petit Grimoire - Grimoire Panel
 * The magical book UI with tabs
 */

import { TABS, ASSET_PATHS, getTheme, THEMES } from '../core/config.js';
import { settings, updateSetting } from '../core/state.js';
import { setFabOpenState } from './fab.js';

let panelElement = null;
let styleElement = null;
let isOpen = false;

// Make settings accessible for tab icons
window.petitGrimoireSettings = settings;

/**
 * Inject CSS for the grimoire
 */
function injectStyles() {
    // Remove old styles first
    document.getElementById('pg-grimoire-styles')?.remove();
    styleElement = null;
    
    console.log('[Petit Grimoire] Injecting minimal styles');
    
    styleElement = document.createElement('style');
    styleElement.id = 'pg-grimoire-styles';
    styleElement.textContent = `
        #pg-panel {
            display: none;
        }
        #pg-panel.pg-open {
            display: flex !important;
        }
        
        /* Tab icon animations */
        @keyframes pg-icon-float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-2px); }
        }
        
        @keyframes pg-icon-glow {
            0%, 100% { filter: drop-shadow(0 0 2px currentColor); }
            50% { filter: drop-shadow(0 0 6px currentColor); }
        }
        
        @keyframes pg-icon-sparkle {
            0%, 100% { opacity: 0.85; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.05); }
        }
        
        @keyframes pg-icon-bounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.15); }
        }
        
        .pg-tab-icon {
            transition: all 0.2s ease !important;
        }
        
        .pg-tab-icon.pg-active {
            animation: pg-icon-glow 2s ease-in-out infinite !important;
        }
        
        .pg-tab-icon:not(.pg-active) {
            animation: pg-icon-float 3s ease-in-out infinite !important;
        }
        
        .pg-tab-icon:hover:not(.pg-active) {
            animation: pg-icon-bounce 0.4s ease-in-out !important;
        }
    `;
    document.head.appendChild(styleElement);
}

/**
 * Create the grimoire panel
 */
export function createGrimoire() {
    destroyGrimoire();
    
    // Inject styles first
    injectStyles();
    
    // =========== PANEL OVERLAY ===========
    const panel = document.createElement('div');
    panel.id = 'pg-panel';
    
    // Click outside to close
    panel.addEventListener('click', (e) => {
        if (e.target === panel) closeGrimoire();
    });
    
    // =========== BOOK CONTAINER ===========
    const book = document.createElement('div');
    book.id = 'pg-book';
    
    panel.appendChild(book);
    document.body.appendChild(panel);
    
    panelElement = panel;
    return panel;
}

/**
 * Create clickable tab icons overlaid on the sprite's tab shapes
 */
function createTabIcons(book, scale, offsetY) {
    // Remove existing tab icons
    document.getElementById('pg-tab-icons')?.remove();
    
    const container = document.createElement('div');
    container.id = 'pg-tab-icons';
    container.setAttribute('style', `
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        pointer-events: none !important;
        z-index: 10 !important;
    `);
    
    // Tab positions in SPRITE coordinates (before scaling)
    // Measured from the book+tabs portion starting at x:310 in the full sprite
    // ADJUST THESE if icons don't line up perfectly!
    const TAB_DATA = [
        { id: 'tarot',    icon: 'fa-copy',        y: 237, label: 'Tarot' },
        { id: 'crystal',  icon: 'fa-moon',        y: 275, label: 'Crystal Ball' },
        { id: 'ouija',    icon: 'fa-ghost',       y: 313, label: 'Ouija' },
        { id: 'nyx',      icon: 'fa-cat',         y: 352, label: 'Nyx' },
        { id: 'radio',    icon: 'fa-radio',       y: 388, label: 'Radio' },
        { id: 'settings', icon: 'fa-gear',        y: 427, label: 'Settings' },
    ];
    
    // Tab dimensions in sprite coordinates
    const TAB_WIDTH = 40;   // How wide the clickable area
    const TAB_HEIGHT = 45;  // Height of each tab
    const TAB_LEFT = 145;    // X position from left edge of book portion
    
    // Get theme colors for icons
    const theme = getTheme(settings.theme);
    const activeColor = theme.iconActive || theme.secondary;
    const inactiveColor = theme.iconInactive || theme.main;
    
    TAB_DATA.forEach((tab, index) => {
        const btn = document.createElement('button');
        btn.className = 'pg-tab-icon';
        btn.dataset.tab = tab.id;
        btn.title = tab.label;
        btn.innerHTML = `<i class="fa-solid ${tab.icon}"></i>`;
        
        // Scale positions to match the scaled sprite
        const scaledY = (tab.y * scale) - offsetY;
        const scaledX = TAB_LEFT * scale;
        const scaledW = TAB_WIDTH * scale;
        const scaledH = TAB_HEIGHT * scale;
        
        const isActive = tab.id === settings.activeTab;
        
        // Add active class for CSS animations
        if (isActive) btn.classList.add('pg-active');
        
        // Stagger animation delay for wave effect
        const animDelay = index * 0.15;
        
        btn.setAttribute('style', `
            position: absolute !important;
            left: ${scaledX}px !important;
            top: ${scaledY}px !important;
            width: ${scaledW}px !important;
            height: ${scaledH}px !important;
            background: transparent !important;
            border: none !important;
            cursor: pointer !important;
            pointer-events: auto !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            color: ${isActive ? activeColor : inactiveColor} !important;
            font-size: ${Math.max(14, scaledH * 0.35)}px !important;
            opacity: ${isActive ? '1' : '0.6'} !important;
            animation-delay: ${animDelay}s !important;
        `);
        
        // Hover effects with theme colors
        btn.addEventListener('mouseenter', () => {
            if (btn.dataset.tab !== settings.activeTab) {
                btn.style.color = activeColor;
                btn.style.opacity = '1';
            }
        });
        
        btn.addEventListener('mouseleave', () => {
            if (btn.dataset.tab !== settings.activeTab) {
                btn.style.color = inactiveColor;
                btn.style.opacity = '0.6';
            }
        });
        
        // Click handler
        btn.addEventListener('click', () => {
            switchTab(tab.id);
        });
        
        container.appendChild(btn);
    });
    
    book.appendChild(container);
}

/**
 * Update the visual state of tab icons
 */
function updateTabIconStates() {
    const theme = getTheme(settings.theme);
    const activeColor = theme.iconActive || theme.secondary;
    const inactiveColor = theme.iconInactive || theme.main;
    
    document.querySelectorAll('.pg-tab-icon').forEach(btn => {
        const isActive = btn.dataset.tab === settings.activeTab;
        
        // Update colors
        btn.style.color = isActive ? activeColor : inactiveColor;
        btn.style.opacity = isActive ? '1' : '0.6';
        
        // Toggle active class for CSS animations
        if (isActive) {
            btn.classList.add('pg-active');
        } else {
            btn.classList.remove('pg-active');
        }
    });
}

/**
 * Create the content area - positioned inside the book's page
 */
function createContent(book, scale, offsetY) {
    // Remove existing content
    document.getElementById('pg-content')?.remove();
    
    const theme = getTheme(settings.theme);
    
    const content = document.createElement('div');
    content.id = 'pg-content';
    
    // Position inside the "page" area of the sprite
    // These are percentages of the book container
    // left + right must be less than 100% or content collapses!
    content.setAttribute('style', `
        position: absolute !important;
        left: 35% !important;
        right: 10% !important;
        top: 27% !important;
        bottom: 14% !important;
        padding: 3% !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        color: #4a3728 !important;
        font-size: 13px !important;
        line-height: 1.4 !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
        scrollbar-width: thin !important;
        scrollbar-color: ${theme.main}40 transparent !important;
        z-index: 5 !important;
    `);
    
    TABS.forEach(tab => {
        const page = document.createElement('div');
        page.className = 'pg-page';
        page.dataset.page = tab.id;
        
        const isActive = tab.id === settings.activeTab;
        page.setAttribute('style', `
            display: ${isActive ? 'flex' : 'none'} !important;
            flex-direction: column !important;
            height: 100% !important;
            text-align: left !important;
        `);
        
        // Placeholder content (will be replaced by feature modules)
        page.innerHTML = getPageContent(tab.id);
        
        content.appendChild(page);
    });
    
    book.appendChild(content);
}

/**
 * Get placeholder content for each page
 */
function getPageContent(tabId) {
    // Settings page gets real content
    if (tabId === 'settings') {
        return buildSettingsPage();
    }
    
    const emojis = {
        tarot: '🎴',
        crystal: '🔮',
        ouija: '👻',
        nyx: '🐱',
        spells: '✨'
    };
    
    const names = {
        tarot: 'TAROT',
        crystal: 'CRYSTAL BALL',
        ouija: 'OUIJA',
        nyx: 'NYX',
        spells: 'SPELL CARDS'
    };
    
    const quotes = {
        tarot: 'The cards know what you refuse to see.',
        crystal: 'Fate is not a request line.',
        ouija: 'Ask, and fate shall answer. Then make it true.',
        nyx: "I'm watching. Always watching.",
        spells: 'Words have power. Use them wisely.'
    };
    
    return `
        <h2 style="color: #5a4030; margin: 0 0 8px 0; font-size: 16px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
            ${emojis[tabId] || '✦'} ${names[tabId] || tabId.toUpperCase()}
        </h2>
        <p style="color: #6a5040; font-style: italic; font-size: 12px; margin-bottom: 15px;">
            "${quotes[tabId] || 'Magic awaits...'}"
        </p>
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0.5;">
            <p style="font-style: italic;">Coming soon...</p>
        </div>
    `;
}

/**
 * Build the settings page HTML
 */
function buildSettingsPage() {
    const theme = getTheme(settings.theme);
    const themeOptions = Object.entries(THEMES).map(([key, t]) => 
        `<option value="${key}" ${key === settings.theme ? 'selected' : ''}>${t.name}</option>`
    ).join('');
    
    return `
        <h2 style="color: #5a4030; margin: 0 0 8px 0; font-size: 16px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
            ⚙️ SETTINGS
        </h2>
        <p style="color: #6a5040; font-style: italic; font-size: 12px; margin-bottom: 15px;">
            "Adjust the mystical parameters."
        </p>
        
        <div class="pg-settings-content" style="display: flex; flex-direction: column; gap: 16px; padding: 8px 0;">
            
            <!-- Theme Selection -->
            <div class="pg-setting-group" style="display: flex; flex-direction: column; gap: 6px;">
                <label style="color: #5a4030; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                    ✦ Theme
                </label>
                <select id="pg-theme-select" style="
                    padding: 8px 12px;
                    border-radius: 8px;
                    border: 2px solid ${theme.main}60;
                    background: ${theme.cardBg}40;
                    color: #5a4030;
                    font-size: 13px;
                    cursor: pointer;
                    outline: none;
                ">
                    ${themeOptions}
                </select>
                <span style="color: #8a7060; font-size: 10px; font-style: italic;">
                    ${theme.desc}
                </span>
            </div>
            
            <!-- Grimoire Position -->
            <div class="pg-setting-group" style="display: flex; flex-direction: column; gap: 6px;">
                <label style="color: #5a4030; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                    ✦ Grimoire Position
                </label>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="color: #8a7060; font-size: 11px;">↑</span>
                    <input type="range" id="pg-position-slider" 
                        min="-200" max="200" value="${settings.grimoireOffsetY || 0}"
                        style="
                            flex: 1;
                            height: 6px;
                            border-radius: 3px;
                            background: ${theme.main}30;
                            outline: none;
                            cursor: pointer;
                            accent-color: ${theme.main};
                        "
                    />
                    <span style="color: #8a7060; font-size: 11px;">↓</span>
                    <span id="pg-position-value" style="color: #5a4030; font-size: 11px; min-width: 35px; text-align: right;">
                        ${settings.grimoireOffsetY || 0}px
                    </span>
                </div>
                <button id="pg-position-reset" style="
                    align-self: flex-start;
                    padding: 4px 10px;
                    border-radius: 4px;
                    border: 1px solid ${theme.main}40;
                    background: transparent;
                    color: #6a5040;
                    font-size: 10px;
                    cursor: pointer;
                ">
                    Reset to Center
                </button>
            </div>
            
            <!-- Lock Position -->
            <div class="pg-setting-group" style="display: flex; align-items: center; gap: 10px;">
                <label style="color: #5a4030; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; flex: 1;">
                    ✦ Lock FAB Position
                </label>
                <label class="pg-toggle" style="
                    position: relative;
                    width: 44px;
                    height: 24px;
                    cursor: pointer;
                ">
                    <input type="checkbox" id="pg-lock-toggle" 
                        ${settings.grimoireLocked ? 'checked' : ''}
                        style="opacity: 0; width: 0; height: 0;"
                    />
                    <span class="pg-toggle-slider" style="
                        position: absolute;
                        inset: 0;
                        background: ${settings.grimoireLocked ? theme.main : '#ccc'};
                        border-radius: 24px;
                        transition: background 0.3s;
                    "></span>
                    <span class="pg-toggle-knob" style="
                        position: absolute;
                        top: 2px;
                        left: ${settings.grimoireLocked ? '22px' : '2px'};
                        width: 20px;
                        height: 20px;
                        background: white;
                        border-radius: 50%;
                        transition: left 0.3s;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    "></span>
                </label>
            </div>
            
            <!-- Extension Info -->
            <div style="margin-top: auto; padding-top: 16px; border-top: 1px solid ${theme.main}20;">
                <p style="color: #8a7060; font-size: 10px; text-align: center; margin: 0;">
                    ✨ Petit Grimoire v0.1 ✨
                </p>
            </div>
        </div>
    `;
}

/**
 * Initialize settings page event listeners
 */
function initSettingsListeners() {
    // Debounce to prevent double-init
    const settingsPage = document.querySelector('.pg-page[data-page="settings"]');
    if (!settingsPage || settingsPage.dataset.initialized) return;
    settingsPage.dataset.initialized = 'true';
    
    const theme = getTheme(settings.theme);
    
    // Theme selector
    const themeSelect = document.getElementById('pg-theme-select');
    if (themeSelect) {
        themeSelect.addEventListener('change', (e) => {
            updateSetting('theme', e.target.value);
            // Rebuild UI to apply new theme fully
            destroyGrimoire();
            createGrimoire();
            openGrimoire();
            switchTab('settings');
        });
    }
    
    // Position slider
    const positionSlider = document.getElementById('pg-position-slider');
    const positionValue = document.getElementById('pg-position-value');
    if (positionSlider) {
        positionSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            if (positionValue) positionValue.textContent = `${val}px`;
            
            // Apply position in real-time
            updateSetting('grimoireOffsetY', val);
            applyGrimoireOffset(val);
        });
    }
    
    // Reset position button
    const resetBtn = document.getElementById('pg-position-reset');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            updateSetting('grimoireOffsetY', 0);
            if (positionSlider) positionSlider.value = 0;
            if (positionValue) positionValue.textContent = '0px';
            applyGrimoireOffset(0);
        });
    }
    
    // Lock toggle
    const lockToggle = document.getElementById('pg-lock-toggle');
    if (lockToggle) {
        lockToggle.addEventListener('change', (e) => {
            const isLocked = e.target.checked;
            updateSetting('grimoireLocked', isLocked);
            
            // Update visual state
            const slider = lockToggle.parentElement.querySelector('.pg-toggle-slider');
            const knob = lockToggle.parentElement.querySelector('.pg-toggle-knob');
            if (slider) slider.style.background = isLocked ? theme.main : '#ccc';
            if (knob) knob.style.left = isLocked ? '22px' : '2px';
        });
    }
}

/**
 * Apply grimoire vertical offset in real-time
 */
function applyGrimoireOffset(offset) {
    const book = document.getElementById('pg-book');
    if (!book) return;
    
    const vh = window.innerHeight;
    const bookHeight = book.offsetHeight;
    const topPosition = Math.max(0, Math.min(vh - bookHeight, (vh - bookHeight) / 2 + offset));
    
    book.style.marginTop = `${topPosition}px`;
}

/**
 * Destroy the grimoire panel
 */
export function destroyGrimoire() {
    if (panelElement) {
        panelElement.remove();
        panelElement = null;
    }
    if (styleElement) {
        styleElement.remove();
        styleElement = null;
    }
    document.getElementById('pg-panel')?.remove();
    document.getElementById('pg-grimoire-styles')?.remove();
    document.getElementById('pg-debug')?.remove();
    isOpen = false;
}

/**
 * Open the grimoire
 */
export function openGrimoire() {
    console.log('[PG] openGrimoire called');
    toastr.info('openGrimoire called', 'Debug');
    
    if (!panelElement) return;
    
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    
    // Calculate book size - PAGE should fill screen, tabs extend off left
    const bookInSpriteWidth = 586;
    const bookInSpriteHeight = 665;
    const pagePortionRatio = 0.82;
    const bookAspectRatio = bookInSpriteHeight / bookInSpriteWidth;
    
    let bookWidth = Math.floor(vw / pagePortionRatio);
    let bookHeight = Math.floor(bookWidth * bookAspectRatio);
    
    // Panel as flex container
    panelElement.setAttribute('style', `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        z-index: 99998 !important;
        background: rgba(0,0,0,0.7) !important;
        margin: 0 !important;
        padding: 0 !important;
        box-sizing: border-box !important;
        display: flex !important;
        flex-direction: row !important;
        align-items: flex-start !important;
    `);
    
    const book = document.getElementById('pg-book');
    if (book) {
        // Apply vertical offset from settings
        const grimoireYOffset = settings.grimoireOffsetY || 0;
        const topPosition = Math.max(0, Math.min(vh - bookHeight, (vh - bookHeight) / 2 + grimoireYOffset));
        
        book.setAttribute('style', `
            position: relative !important;
            width: ${bookWidth}px !important;
            height: ${bookHeight}px !important;
            background: none !important;
            margin-left: auto !important;
            margin-top: ${topPosition}px !important;
            flex-shrink: 0 !important;
        `);
        
        // Sprite setup
        let spriteDiv = document.getElementById('pg-book-sprite');
        if (!spriteDiv) {
            spriteDiv = document.createElement('div');
            spriteDiv.id = 'pg-book-sprite';
            book.appendChild(spriteDiv);
        }
        
        const spriteFullWidth = 896;
        const spriteFullHeight = 720;
        const bookInSpriteWidthActual = 586;
        const bookStartX = 310;
        const bookStartY = 30;
        
        const scale = bookWidth / bookInSpriteWidthActual;
        const scaledSpriteWidth = Math.floor(spriteFullWidth * scale);
        const scaledSpriteHeight = Math.floor(spriteFullHeight * scale);
        const offsetX = Math.floor(bookStartX * scale);
        const offsetY = Math.floor(bookStartY * scale);
        
        // Get current theme for grimoire filter
        const currentTheme = getTheme(settings.theme);
        const grimoireFilter = currentTheme.grimoireFilter || 'none';
        
        spriteDiv.setAttribute('style', `
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: ${bookWidth}px !important;
            height: ${bookHeight}px !important;
            background-image: url('${ASSET_PATHS.grimoire}/Grimoire_WithTabs.png') !important;
            background-size: ${scaledSpriteWidth}px ${scaledSpriteHeight}px !important;
            background-position: -${offsetX}px -${offsetY}px !important;
            background-repeat: no-repeat !important;
            image-rendering: pixelated !important;
            pointer-events: none !important;
            z-index: 0 !important;
            filter: ${grimoireFilter} !important;
        `);
        
        // Create tab icons overlay
        createTabIcons(book, scale, offsetY);
        
        // Create content area
        createContent(book, scale, offsetY);
        
        console.log('[Petit Grimoire] Book size:', bookWidth, 'x', bookHeight);
        console.log('[Petit Grimoire] Scale:', scale.toFixed(3));
    }
    
    panelElement.classList.add('pg-open');
    isOpen = true;
    
    // Update FAB state
    setFabOpenState(true);
    
    // Initialize settings listeners if on settings tab
    if (settings.activeTab === 'settings') {
        initSettingsListeners();
    }
    
    console.log('[Petit Grimoire] Opened');
}

/**
 * Close the grimoire
 */
export function closeGrimoire() {
    console.log('[PG] closeGrimoire called');
    toastr.warning('closeGrimoire called', 'Debug');
    
    if (!panelElement) return;
    
    panelElement.classList.remove('pg-open');
    panelElement.style.display = 'none';  // Override the inline display:flex
    isOpen = false;
    
    // Update FAB state
    setFabOpenState(false);
    
    toastr.success('Grimoire closed, isOpen now: ' + isOpen, 'Debug');
}

/**
 * Toggle grimoire open/close
 */
export function toggleGrimoire() {
    console.log('[PG] toggleGrimoire called, isOpen:', isOpen);
    toastr.info(`Toggle called. isOpen: ${isOpen}`, 'Debug');
    
    if (isOpen) {
        closeGrimoire();
    } else {
        openGrimoire();
    }
}

/**
 * Check if grimoire is open
 */
export function isGrimoireOpen() {
    return isOpen;
}

/**
 * Switch to a tab
 */
export function switchTab(tabId) {
    // Update setting
    updateSetting('activeTab', tabId);
    
    // Update tab icon visuals
    updateTabIconStates();
    
    // Show/hide pages
    document.querySelectorAll('.pg-page').forEach(page => {
        page.style.display = page.dataset.page === tabId ? 'flex' : 'none';
    });
    
    // Initialize settings listeners when switching to settings tab
    if (tabId === 'settings') {
        initSettingsListeners();
    }
    
    console.log('[Petit Grimoire] Switched to tab:', tabId);
}

/**
 * Update grimoire theme (sprite filter + colors, no rebuild)
 */
export function updateGrimoireTheme() {
    if (!panelElement) return;
    
    const theme = getTheme(settings.theme);
    
    // Update sprite filter
    const spriteDiv = document.getElementById('pg-book-sprite');
    if (spriteDiv) {
        const grimoireFilter = theme.grimoireFilter || 'none';
        spriteDiv.style.filter = grimoireFilter;
    }
    
    // Update scrollbar color
    const content = document.getElementById('pg-content');
    if (content) {
        content.style.scrollbarColor = `${theme.main}40 transparent`;
    }
    
    // Update tab icon colors
    updateTabIconStates();
    
    console.log('[Petit Grimoire] Updated grimoire theme:', settings.theme);
}

/**
 * Get a page element by tab ID
 */
export function getPage(tabId) {
    return document.querySelector(`.pg-page[data-page="${tabId}"]`);
}

/**
 * Set page content
 */
export function setPageContent(tabId, html) {
    const page = getPage(tabId);
    if (page) {
        page.innerHTML = html;
    }
}
