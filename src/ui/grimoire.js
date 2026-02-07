/**
 * Petit Grimoire - Grimoire Panel
 * The magical book UI with tabs
 */

import { TABS, ASSET_PATHS, GRIMOIRE_SPRITES, getTheme } from '../core/config.js';
import { settings, updateSetting } from '../core/state.js';

let panelElement = null;
let isOpen = false;

// Book dimensions - native sprite is 896×720
// We scale to fit mobile while maintaining aspect ratio
const BOOK_ASPECT = 896 / 720; // ~1.244 (wider than tall)

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
    // Uses sprite as background, sized to fill mobile screen
    const book = document.createElement('div');
    book.id = 'pg-book';
    
    // Calculate size based on viewport - book sprite is 896x720 (wider than tall)
    // On mobile, height is the constraint, so size based on that
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    
    // Use 60% of viewport height, calculate width from aspect ratio
    let bookHeight = vh * 0.6;
    let bookWidth = bookHeight * (896 / 720); // Maintain aspect ratio
    
    // If too wide for screen, constrain by width instead
    if (bookWidth > vw * 0.95) {
        bookWidth = vw * 0.95;
        bookHeight = bookWidth * (720 / 896);
    }
    
    Object.assign(book.style, {
        position: 'relative',
        width: `${bookWidth}px`,
        height: `${bookHeight}px`,
        margin: 'auto',
        // Sprite background
        backgroundImage: `url('${ASSET_PATHS.grimoire}/Grimoire_WithTabs.png')`,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        imageRendering: 'pixelated',
        backgroundColor: 'transparent',
        borderRadius: '0',
        boxShadow: 'none',
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
    
    // =========== CLOSE BUTTON ===========
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.title = 'Close';
    Object.assign(closeBtn.style, {
        position: 'absolute',
        top: '8%',
        right: '8%',
        width: '24px',
        height: '24px',
        background: theme.main,
        border: 'none',
        borderRadius: '50%',
        color: theme.bg,
        fontSize: '16px',
        fontWeight: 'bold',
        lineHeight: '1',
        cursor: 'pointer',
        zIndex: '10',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: '0.8',
        transition: 'opacity 0.2s'
    });
    closeBtn.addEventListener('mouseenter', () => closeBtn.style.opacity = '1');
    closeBtn.addEventListener('mouseleave', () => closeBtn.style.opacity = '0.8');
    closeBtn.addEventListener('click', closeGrimoire);
    book.appendChild(closeBtn);
    
    panel.appendChild(book);
    document.body.appendChild(panel);
    
    panelElement = panel;
    return panel;
}

/**
 * Create the tab sidebar - positioned over sprite's visual tabs
 * Tabs are absolutely positioned on the left edge
 */
function createSidebar(theme) {
    const sidebar = document.createElement('div');
    sidebar.id = 'pg-sidebar';
    Object.assign(sidebar.style, {
        position: 'absolute',
        left: '0',
        top: '15%',
        bottom: '15%',
        width: '12%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '5% 0',
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
            width: '28px',
            height: '28px',
            background: isActive ? theme.main : 'transparent',
            border: `2px solid ${isActive ? theme.main : theme.main + '60'}`,
            borderRadius: '6px',
            color: isActive ? theme.bg : theme.main,
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isActive ? '1' : '0.7'
        });
        
        btn.addEventListener('click', () => switchTab(tab.id));
        btn.addEventListener('mouseenter', () => {
            if (btn.dataset.tab !== settings.activeTab) {
                btn.style.opacity = '1';
                btn.style.borderColor = theme.main;
            }
        });
        btn.addEventListener('mouseleave', () => {
            if (btn.dataset.tab !== settings.activeTab) {
                btn.style.opacity = '0.7';
                btn.style.borderColor = theme.main + '60';
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
        // Adjust these percentages based on your sprite's layout
        left: '15%',
        right: '8%',
        top: '12%',
        bottom: '12%',
        padding: '10px',
        overflowY: 'auto',
        color: theme.textLight,
        display: 'flex',
        flexDirection: 'column',
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
            alignItems: 'center',
            justifyContent: 'center',
            flex: '1',
            textAlign: 'center'
        });
        
        // Placeholder content (will be replaced by feature modules)
        page.innerHTML = `
            <h2 style="color: ${theme.main}; margin-bottom: 10px; font-size: 16px; letter-spacing: 2px; text-shadow: 0 0 10px ${theme.main}40;">
                ✨ ${tab.name} ✨
            </h2>
            <p style="opacity: 0.6; font-style: italic; font-size: 12px;">
                Coming soon...
            </p>
        `;
        
        content.appendChild(page);
    });
    
    return content;
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
        btn.style.background = isActive ? theme.main : 'transparent';
        btn.style.border = `2px solid ${isActive ? theme.main : theme.main + '60'}`;
        btn.style.color = isActive ? theme.bg : theme.main;
        btn.style.opacity = isActive ? '1' : '0.7';
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
    const book = document.getElementById('pg-book');
    const content = document.getElementById('pg-content');
    
    if (content) {
        content.style.color = theme.textLight;
        content.style.scrollbarColor = `${theme.main}40 transparent`;
    }
    
    // Update tab buttons
    document.querySelectorAll('.pg-tab-btn').forEach(btn => {
        const isActive = btn.dataset.tab === settings.activeTab;
        btn.style.background = isActive ? theme.main : 'transparent';
        btn.style.border = `2px solid ${isActive ? theme.main : theme.main + '60'}`;
        btn.style.color = isActive ? theme.bg : theme.main;
        btn.style.opacity = isActive ? '1' : '0.7';
    });
    
    // Update close button
    const closeBtn = book?.querySelector('button[title="Close"]');
    if (closeBtn) {
        closeBtn.style.background = theme.main;
        closeBtn.style.color = theme.bg;
    }
    
    // Update page titles
    document.querySelectorAll('.pg-page h2').forEach(h2 => {
        h2.style.color = theme.main;
        h2.style.textShadow = `0 0 10px ${theme.main}40`;
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
