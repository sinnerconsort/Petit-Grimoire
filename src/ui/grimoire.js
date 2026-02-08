/**
 * Petit Grimoire - Grimoire Panel
 * The magical book UI with tabs
 */

import { TABS, ASSET_PATHS, getTheme } from '../core/config.js';
import { settings, updateSetting } from '../core/state.js';

let panelElement = null;
let styleElement = null;
let isOpen = false;

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
    // Only basic panel styles - openGrimoire() handles all positioning
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
    
    // NO SIDEBAR OR CONTENT FOR NOW - just the book
    
    panel.appendChild(book);
    document.body.appendChild(panel);
    
    panelElement = panel;
    return panel;
}

/**
 * Create the tab sidebar - positioned over sprite's visual tabs
 * Tabs align with the book spine on the left edge
 */
function createSidebar(theme) {
    const sidebar = document.createElement('div');
    sidebar.id = 'pg-sidebar';
    Object.assign(sidebar.style, {
        position: 'absolute',
        // Position over the left spine tabs in the sprite
        left: '0',
        top: '10%',
        bottom: '15%',
        width: '10%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: '2%',
        gap: '2%',
        zIndex: '5'
    });
    
    TABS.forEach((tab, index) => {
        const btn = document.createElement('button');
        btn.className = 'pg-tab-btn';
        btn.dataset.tab = tab.id;
        btn.title = tab.name;
        btn.innerHTML = `<i class="fa-solid ${tab.icon}"></i>`;
        
        const isActive = tab.id === settings.activeTab;
        Object.assign(btn.style, {
            width: '75%',
            aspectRatio: '1',
            background: isActive ? theme.main + '40' : 'transparent',
            border: 'none',
            borderRadius: '4px',
            color: isActive ? theme.main : theme.textDim,
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isActive ? '1' : '0.6'
        });
        
        btn.addEventListener('click', () => switchTab(tab.id));
        btn.addEventListener('mouseenter', () => {
            if (btn.dataset.tab !== settings.activeTab) {
                btn.style.opacity = '1';
                btn.style.background = theme.main + '20';
            }
        });
        btn.addEventListener('mouseleave', () => {
            if (btn.dataset.tab !== settings.activeTab) {
                btn.style.opacity = '0.6';
                btn.style.background = 'transparent';
            }
        });
        
        sidebar.appendChild(btn);
    });
    
    return sidebar;
}

/**
 * Create the content area - positioned inside the book's page
 */
function createContent(theme) {
    const content = document.createElement('div');
    content.id = 'pg-content';
    Object.assign(content.style, {
        position: 'absolute',
        // Position inside the "page" area of the sprite
        // Starts after the spine/tabs, with padding from edges
        left: '14%',
        right: '6%',
        top: '8%',
        bottom: '10%',
        padding: '3%',
        overflowY: 'auto',
        overflowX: 'hidden',
        color: '#4a3728',  // Dark brown text for parchment
        fontSize: '13px',
        lineHeight: '1.4',
        // Subtle scrollbar
        scrollbarWidth: 'thin',
        scrollbarColor: `${theme.main}40 transparent`
    });
    
    TABS.forEach(tab => {
        const page = document.createElement('div');
        page.className = 'pg-page';
        page.dataset.page = tab.id;
        
        const isActive = tab.id === settings.activeTab;
        Object.assign(page.style, {
            display: isActive ? 'flex' : 'none',
            flexDirection: 'column',
            height: '100%',
            textAlign: 'left'
        });
        
        // Placeholder content (will be replaced by feature modules)
        page.innerHTML = `
            <h2 style="color: #5a4030; margin: 0 0 8px 0; font-size: 16px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                ${getTabEmoji(tab.id)} ${tab.name.toUpperCase()}
            </h2>
            <p style="color: #6a5040; font-style: italic; font-size: 12px; margin-bottom: 15px;">
                "${getTabQuote(tab.id)}"
            </p>
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0.5;">
                <p style="font-style: italic;">Coming soon...</p>
            </div>
        `;
        
        content.appendChild(page);
    });
    
    return content;
}

/**
 * Get emoji for tab header
 */
function getTabEmoji(tabId) {
    const emojis = {
        tarot: '🎴',
        crystal: '🔮',
        ouija: '👻',
        nyx: '🐱',
        spells: '✨',
        settings: '⚙️'
    };
    return emojis[tabId] || '✦';
}

/**
 * Get flavor quote for tab
 */
function getTabQuote(tabId) {
    const quotes = {
        tarot: 'The cards know what you refuse to see.',
        crystal: 'Fate is not a request line.',
        ouija: 'Ask, and fate shall answer. Then make it true.',
        nyx: "I'm watching. Always watching.",
        spells: 'Visual magic. No story impact—just vibes.',
        settings: 'Tune the cosmic frequencies.'
    };
    return quotes[tabId] || 'Magic awaits...';
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
    
    // Calculate book size - FILL THE WIDTH
    // The book+tabs in the sprite is ~586x665, we'll crop to show just that
    const bookInSpriteWidth = 586;
    const bookInSpriteHeight = 665;
    const bookAspectRatio = bookInSpriteHeight / bookInSpriteWidth; // ~1.135
    
    // Fill full screen width
    let bookWidth = vw;
    let bookHeight = Math.floor(bookWidth * bookAspectRatio);
    
    // Use setAttribute with !important to FORCE styles
    panelElement.setAttribute('style', `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        z-index: 99998 !important;
        background: rgba(0,0,0,0.7) !important;
        display: flex !important;
        align-items: flex-start !important;
        justify-content: center !important;
        margin: 0 !important;
        padding: 0 !important;
        box-sizing: border-box !important;
    `);
    
    // Force book size AND position relative
    // IMPORTANT: overflow: hidden to contain children
    const book = document.getElementById('pg-book');
    if (book) {
        book.setAttribute('style', `
            position: relative !important;
            width: ${bookWidth}px !important;
            height: ${bookHeight}px !important;
            min-width: ${bookWidth}px !important;
            min-height: ${bookHeight}px !important;
            flex-shrink: 0 !important;
            background: none !important;
            overflow: hidden !important;
        `);
        
        // Crop sprite to show just the book portion, scaled to fill container
        // Sprite is 896x720, book+tabs starts at x:310, is 586x665
        
        let spriteDiv = document.getElementById('pg-book-sprite');
        if (!spriteDiv) {
            spriteDiv = document.createElement('div');
            spriteDiv.id = 'pg-book-sprite';
            book.appendChild(spriteDiv);
        }
        
        // Scale sprite so book portion matches our container size
        const spriteFullWidth = 896;
        const spriteFullHeight = 720;
        const bookInSpriteWidthActual = 586;
        const bookStartX = 310;
        const bookStartY = 30;  // Small top margin
        
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
        
        console.log('[Petit Grimoire] Book size:', bookWidth, 'x', bookHeight);
        console.log('[Petit Grimoire] Sprite scale:', scale.toFixed(3));
        console.log('[Petit Grimoire] Offset:', offsetX, offsetY);
    }
    
    // Debug (comment out when done)
    /*
    let debugEl = document.getElementById('pg-debug');
    if (!debugEl) {
        debugEl = document.createElement('div');
        debugEl.id = 'pg-debug';
        debugEl.setAttribute('style', `
            position: fixed !important;
            top: 5px !important;
            left: 5px !important;
            background: red !important;
            color: white !important;
            padding: 5px 10px !important;
            font-size: 11px !important;
            z-index: 999999 !important;
            font-family: monospace !important;
        `);
        document.body.appendChild(debugEl);
    }
    
    const bookRect = book?.getBoundingClientRect();
    const spriteDiv = document.getElementById('pg-book-sprite');
    const spriteStyle = spriteDiv ? window.getComputedStyle(spriteDiv) : null;
    
    debugEl.innerHTML = `
        Book: ${bookRect?.width?.toFixed(0)}x${bookRect?.height?.toFixed(0)}<br>
        BG size: ${spriteStyle?.backgroundSize || 'none'}<br>
        BG pos: ${spriteStyle?.backgroundPosition || 'none'}
    `;
    */
    
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
    const theme = getTheme(settings.theme);
    
    // Update button styles
    document.querySelectorAll('.pg-tab-btn').forEach(btn => {
        const isActive = btn.dataset.tab === tabId;
        btn.style.background = isActive ? theme.main + '40' : 'transparent';
        btn.style.color = isActive ? theme.main : theme.textDim;
        btn.style.opacity = isActive ? '1' : '0.6';
    });
    
    // Show/hide pages
    document.querySelectorAll('.pg-page').forEach(page => {
        page.style.display = page.dataset.page === tabId ? 'flex' : 'none';
    });
    
    // Save active tab
    updateSetting('activeTab', tabId);
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
    
    // Update tab buttons
    document.querySelectorAll('.pg-tab-btn').forEach(btn => {
        const isActive = btn.dataset.tab === settings.activeTab;
        btn.style.background = isActive ? theme.main + '40' : 'transparent';
        btn.style.color = isActive ? theme.main : theme.textDim;
        btn.style.opacity = isActive ? '1' : '0.6';
    });
}

/**
 * Get a page element by tab ID
 * (For feature modules to populate content)
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
