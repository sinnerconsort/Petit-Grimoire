/**
 * Petit Grimoire - Grimoire Panel
 * The magical book UI with tabs
 * 
 * NOTE: The positioning code in openGrimoire() is FRAGILE.
 * Only modify tab content via the tabs/ modules.
 */

import { TABS, ASSET_PATHS, getTheme, THEMES } from '../core/config.js';
import { settings, updateSetting } from '../core/state.js';
import { setFabOpenState } from './fab.js';

// Tab system - handles all tab content and initialization
import { getTabContent, initTab, cleanupTab } from './tabs/tabManager.js';

let panelElement = null;
let styleElement = null;
let isOpen = false;
let currentTab = null;  // Track current tab for cleanup

// Make settings accessible for tab icons
window.petitGrimoireSettings = settings;

/**
 * Inject CSS for the grimoire
 */
function injectStyles() {
    // Remove old styles first
    document.getElementById('pg-grimoire-styles')?.remove();
    document.getElementById('pg-font-link')?.remove();
    styleElement = null;
    
    console.log('[Petit Grimoire] Injecting styles with fonts');
    
    // Add Google Fonts link for Silkscreen
    const fontLink = document.createElement('link');
    fontLink.id = 'pg-font-link';
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&display=swap';
    document.head.appendChild(fontLink);
    
    // Note: FontAwesome is already loaded by SillyTavern
    
    // Get theme for header glow colors
    const theme = getTheme(settings.theme);
    
    styleElement = document.createElement('style');
    styleElement.id = 'pg-grimoire-styles';
    styleElement.textContent = `
        /* Font Face for Royal Decree */
        @font-face {
            font-family: 'Royal Decree';
            src: url('/extensions/third-party/Petit-Grimoire/assets/fonts/Royal_Decree.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
        }
        
        /* Base pixel font for all grimoire text */
        #pg-panel, #pg-panel * {
            font-family: 'Silkscreen', cursive !important;
        }
        
        /* Fancy font mode - headers only */
        #pg-panel.pg-fancy-font .pg-page-title {
            font-family: 'Royal Decree', serif !important;
            font-size: 22px !important;
            letter-spacing: 2px !important;
        }
        
        /* Theme-colored header text when fancy font is on */
        #pg-panel.pg-fancy-font .pg-page-title {
            color: ${theme.main} !important;
        }
        
        /* Soft pulsing glow animation for headers */
        @keyframes pg-header-glow {
            0%, 100% { 
                text-shadow: 0 0 4px ${theme.main}40, 0 0 8px ${theme.main}20;
            }
            50% { 
                text-shadow: 0 0 8px ${theme.main}60, 0 0 16px ${theme.main}40, 0 0 24px ${theme.main}20;
            }
        }
        
        #pg-panel.pg-fancy-font .pg-page-title {
            animation: pg-header-glow 3s ease-in-out infinite !important;
        }
        
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
    
    // Click outside to close - with delay to prevent touch event bleed-through
    let canClose = false;
    panel.addEventListener('click', (e) => {
        if (e.target === panel && canClose) {
            closeGrimoire();
        }
    });
    
    // Also handle touch events explicitly
    panel.addEventListener('touchend', (e) => {
        if (e.target === panel && canClose) {
            e.preventDefault();
            closeGrimoire();
        }
    });
    
    // Enable closing after a short delay (prevents FAB touch bleed-through)
    setTimeout(() => { canClose = true; }, 400);
    
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
    // Using emoji for reliable display (FA may not load in all ST setups)
    const TAB_DATA = [
        { id: 'tarot',    icon: '⭐',    y: 237, label: 'Tarot' },
        { id: 'crystal',  icon: '🔮',    y: 275, label: 'Crystal Ball' },
        { id: 'ouija',    icon: '👻',    y: 313, label: 'Ouija' },
        { id: 'nyx',      icon: '🐱',    y: 352, label: 'Nyx' },
        { id: 'spells',   icon: '✨',    y: 388, label: 'Spells' },
        { id: 'settings', icon: '⚙️',    y: 427, label: 'Settings' },
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
        btn.textContent = tab.icon;  // Direct emoji, no FA dependency
        
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
    // Book binding is at screen edge, so content needs larger right margin
    // to stay within visible page area
    content.setAttribute('style', `
        position: absolute !important;
        left: 35% !important;
        right: 20% !important;
        top: 25% !important;
        bottom: 6% !important;
        padding: 2% !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        color: #3a2518 !important;
        font-size: 11px !important;
        line-height: 1.5 !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
        scrollbar-width: thin !important;
        scrollbar-color: ${theme.main}40 transparent !important;
        z-index: 5 !important;
        box-sizing: border-box !important;
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
            overflow: hidden !important;
            box-sizing: border-box !important;
        `);
        
        // Get content from tab module system
        page.innerHTML = getTabContent(tab.id);
        
        content.appendChild(page);
    });
    
    book.appendChild(content);
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
    currentTab = null;
    isOpen = false;
}

/**
 * Open the grimoire
 * 
 * ⚠️ WARNING: The positioning math below is FRAGILE.
 * Do not modify unless you understand the sprite coordinate system.
 */
export function openGrimoire() {
    console.log('[PG] openGrimoire called');
    toastr.info('openGrimoire called', 'Debug');
    
    if (!panelElement) return;
    
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    
    // ============ HEIGHT-FIRST SIZING ============
    // Book is 80% of viewport height, width follows aspect ratio
    // Anchored to RIGHT edge of screen (binding at edge)
    const bookInSpriteWidth = 586;
    const bookInSpriteHeight = 665;
    const bookAspectRatio = bookInSpriteWidth / bookInSpriteHeight;  // ~0.88 (width/height)
    
    // Size based on 80% viewport height
    let bookHeight = Math.floor(vh * 0.80);
    let bookWidth = Math.floor(bookHeight * bookAspectRatio);
    
    toastr.info(`vh:${vh} 80%=${Math.floor(vh*0.8)} bookW:${bookWidth} bookH:${bookHeight}`, 'Sizing');
    
    // Panel as container - NO flex, NO centering
    panelElement.setAttribute('style', `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        z-index: 99998 !important;
        background: rgba(0,0,0,0.7) !important;
        margin: 0 !important;
        padding: 0 !important;
        box-sizing: border-box !important;
        overflow: hidden !important;
        display: block !important;
    `);
    
    const book = document.getElementById('pg-book');
    if (book) {
        // Vertical centering with offset
        const grimoireYOffset = settings.grimoireOffsetY || 0;
        const topPosition = Math.max(0, Math.min(vh - bookHeight, (vh - bookHeight) / 2 + grimoireYOffset));
        
        // FORCE right edge positioning
        // Negative right value pushes book right to compensate for sprite padding
        const bindingOffset = -89;  // Your working value
        
        book.setAttribute('style', `
            position: absolute !important;
            top: ${topPosition}px !important;
            right: ${bindingOffset}px !important;
            left: auto !important;
            width: ${bookWidth}px !important;
            height: ${bookHeight}px !important;
            margin: 0 !important;
            padding: 0 !important;
            background: none !important;
            transform: none !important;
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
    
    // Add fancy font class if enabled
    if (settings.fancyFont) {
        panelElement.classList.add('pg-fancy-font');
    } else {
        panelElement.classList.remove('pg-fancy-font');
    }
    
    isOpen = true;
    
    // Update FAB state
    setFabOpenState(true);
    
    // Initialize the active tab via tab module system
    currentTab = settings.activeTab;
    initTab(currentTab);
    
    console.log('[Petit Grimoire] Opened');
}

/**
 * Close the grimoire
 */
export function closeGrimoire() {
    console.log('[PG] closeGrimoire called');
    toastr.warning('closeGrimoire called', 'Debug');
    
    if (!panelElement) return;
    
    // Cleanup current tab
    if (currentTab) {
        cleanupTab(currentTab);
        currentTab = null;
    }
    
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
    // Cleanup previous tab
    if (currentTab && currentTab !== tabId) {
        cleanupTab(currentTab);
    }
    
    // Update setting
    updateSetting('activeTab', tabId);
    currentTab = tabId;
    
    // Update tab icon visuals
    updateTabIconStates();
    
    // Show/hide pages
    document.querySelectorAll('.pg-page').forEach(page => {
        page.style.display = page.dataset.page === tabId ? 'flex' : 'none';
    });
    
    // Initialize new tab via tab module system
    initTab(tabId);
    
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
