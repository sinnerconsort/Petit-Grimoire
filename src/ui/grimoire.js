/**
 * Petit Grimoire - Grimoire Panel
 * The magical book UI with tabs
 */

import { TABS, ASSET_PATHS, getTheme } from '../core/config.js';
import { settings, updateSetting } from '../core/state.js';

let panelElement = null;
let isOpen = false;

/**
 * Create the grimoire panel
 */
export function createGrimoire() {
    destroyGrimoire();
    
    const theme = getTheme(settings.theme);
    
    // =========== PANEL OVERLAY ===========
    const panel = document.createElement('div');
    panel.id = 'pg-panel';
    Object.assign(panel.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        zIndex: '99998',
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(4px)',
        display: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box'
    });
    
    // Click outside to close
    panel.addEventListener('click', (e) => {
        if (e.target === panel) closeGrimoire();
    });
    
    // =========== BOOK CONTAINER ===========
    // Uses sprite as background
    // Book sprite is 896x720 (wider than tall, ratio 1.244:1)
    // On mobile portrait, WIDTH is the constraint
    const book = document.createElement('div');
    book.id = 'pg-book';
    
    Object.assign(book.style, {
        position: 'relative',
        // Width-based sizing for mobile portrait
        width: '95vw',
        height: 'calc(95vw * 0.804)',  // 720/896 = 0.804
        maxHeight: '70vh',
        margin: 'auto',
        // Sprite background
        backgroundImage: `url('${ASSET_PATHS.grimoire}/Grimoire_WithTabs.png')`,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        imageRendering: 'pixelated',
        backgroundColor: 'transparent',
        overflow: 'visible'
    });
    
    // =========== TAB SIDEBAR ===========
    // Positioned absolutely over the sprite's visual tabs
    const sidebar = createSidebar(theme);
    book.appendChild(sidebar);
    
    // =========== CONTENT AREA ===========
    // Positioned inside the book's "page" area
    const content = createContent(theme);
    book.appendChild(content);
    
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
    document.getElementById('pg-panel')?.remove();
    isOpen = false;
}

/**
 * Open the grimoire
 */
export function openGrimoire() {
    if (!panelElement) return;
    
    panelElement.style.display = 'flex';
    panelElement.style.alignItems = 'center';
    panelElement.style.justifyContent = 'center';
    isOpen = true;
    
    // TODO: Play opening animation
}

/**
 * Close the grimoire
 */
export function closeGrimoire() {
    if (!panelElement) return;
    
    panelElement.style.display = 'none';
    isOpen = false;
    
    // TODO: Play closing animation
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
