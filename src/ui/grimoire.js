/**
 * Petit Grimoire - Grimoire Panel
 * The magical book UI with tabs
 */

import { TABS, ASSET_PATHS, getTheme } from '../core/config.js';
import { settings, updateSetting } from '../core/state.js';

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
        { id: 'tarot',    icon: 'fa-layer-group', y: 88,  label: 'Tarot' },
        { id: 'crystal',  icon: 'fa-moon',        y: 158, label: 'Crystal Ball' },
        { id: 'ouija',    icon: 'fa-ghost',       y: 228, label: 'Ouija' },
        { id: 'nyx',      icon: 'fa-cat',         y: 298, label: 'Nyx' },
        { id: 'radio',    icon: 'fa-radio',       y: 368, label: 'Radio' },
        { id: 'settings', icon: 'fa-gear',        y: 438, label: 'Settings' },
    ];
    
    // Tab dimensions in sprite coordinates
    const TAB_WIDTH = 50;   // How wide the clickable area
    const TAB_HEIGHT = 55;  // Height of each tab
    const TAB_LEFT = 12;    // X position from left edge of book portion
    
    TAB_DATA.forEach(tab => {
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
            color: ${isActive ? '#5a4030' : '#8b7355'} !important;
            font-size: ${Math.max(14, scaledH * 0.35)}px !important;
            transition: color 0.2s ease, transform 0.15s ease !important;
            opacity: ${isActive ? '1' : '0.7'} !important;
        `);
        
        // Hover effects
        btn.addEventListener('mouseenter', () => {
            if (btn.dataset.tab !== settings.activeTab) {
                btn.style.color = '#5a4030';
                btn.style.opacity = '1';
                btn.style.transform = 'scale(1.1)';
            }
        });
        
        btn.addEventListener('mouseleave', () => {
            if (btn.dataset.tab !== settings.activeTab) {
                btn.style.color = '#8b7355';
                btn.style.opacity = '0.7';
                btn.style.transform = 'scale(1)';
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
    document.querySelectorAll('.pg-tab-icon').forEach(btn => {
        const isActive = btn.dataset.tab === settings.activeTab;
        btn.style.color = isActive ? '#5a4030' : '#8b7355';
        btn.style.opacity = isActive ? '1' : '0.7';
        btn.style.transform = 'scale(1)';
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
    content.setAttribute('style', `
        position: absolute !important;
        left: 14% !important;
        right: 6% !important;
        top: 8% !important;
        bottom: 12% !important;
        padding: 3% !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        color: #4a3728 !important;
        font-size: 13px !important;
        line-height: 1.4 !important;
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
    const emojis = {
        tarot: '🎴',
        crystal: '🔮',
        ouija: '👻',
        nyx: '🐱',
        radio: '📻',
        settings: '⚙️'
    };
    
    const names = {
        tarot: 'TAROT',
        crystal: 'CRYSTAL BALL',
        ouija: 'OUIJA',
        nyx: 'NYX',
        radio: 'RADIO',
        settings: 'SETTINGS'
    };
    
    const quotes = {
        tarot: 'The cards know what you refuse to see.',
        crystal: 'Fate is not a request line.',
        ouija: 'Ask, and fate shall answer. Then make it true.',
        nyx: "I'm watching. Always watching.",
        radio: 'Tune in to the cosmic frequencies.',
        settings: 'Adjust the mystical parameters.'
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
        book.setAttribute('style', `
            position: relative !important;
            width: ${bookWidth}px !important;
            height: ${bookHeight}px !important;
            background: none !important;
            margin-left: auto !important;
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
    
    console.log('[Petit Grimoire] Opened');
}

/**
 * Close the grimoire
 */
export function closeGrimoire() {
    if (!panelElement) return;
    
    panelElement.classList.remove('pg-open');
    isOpen = false;
}

/**
 * Toggle grimoire open/close
 */
export function toggleGrimoire() {
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
    
    console.log('[Petit Grimoire] Switched to tab:', tabId);
}

/**
 * Update grimoire theme (colors only, no rebuild)
 */
export function updateGrimoireTheme() {
    if (!panelElement) return;
    
    const theme = getTheme(settings.theme);
    const content = document.getElementById('pg-content');
    
    if (content) {
        content.style.scrollbarColor = `${theme.main}40 transparent`;
    }
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
