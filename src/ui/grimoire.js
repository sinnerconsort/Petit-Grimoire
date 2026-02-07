/**
 * Petit Grimoire - Grimoire Panel
 * The magical book UI with tabs
 */

import { TABS, ASSET_PATHS, GRIMOIRE_SPRITES, getTheme } from '../core/config.js';
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
    const book = document.createElement('div');
    book.id = 'pg-book';
    Object.assign(book.style, {
        position: 'relative',
        width: '90vw',
        maxWidth: '360px',
        height: '70vh',
        maxHeight: '500px',
        margin: 'auto',
        background: theme.cardBg,
        border: `3px solid ${theme.main}`,
        borderRadius: '12px',
        boxShadow: `0 10px 40px rgba(0,0,0,0.5), 0 0 30px ${theme.main}40`,
        display: 'flex',
        overflow: 'hidden'
    });
    
    // =========== TAB SIDEBAR ===========
    const sidebar = createSidebar(theme);
    book.appendChild(sidebar);
    
    // =========== CONTENT AREA ===========
    const content = createContent(theme);
    book.appendChild(content);
    
    // =========== CLOSE BUTTON ===========
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.title = 'Close';
    Object.assign(closeBtn.style, {
        position: 'absolute',
        top: '10px',
        right: '10px',
        width: '32px',
        height: '32px',
        background: theme.main,
        border: 'none',
        borderRadius: '50%',
        color: theme.bg,
        fontSize: '20px',
        fontWeight: 'bold',
        lineHeight: '1',
        cursor: 'pointer',
        zIndex: '10',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    });
    closeBtn.addEventListener('click', closeGrimoire);
    book.appendChild(closeBtn);
    
    panel.appendChild(book);
    document.body.appendChild(panel);
    
    panelElement = panel;
    return panel;
}

/**
 * Create the tab sidebar
 */
function createSidebar(theme) {
    const sidebar = document.createElement('div');
    sidebar.id = 'pg-sidebar';
    Object.assign(sidebar.style, {
        width: '50px',
        background: theme.bg,
        borderRight: `1px solid ${theme.main}33`,
        padding: '10px 5px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        overflowY: 'auto',
        flexShrink: '0'
    });
    
    TABS.forEach(tab => {
        const btn = document.createElement('button');
        btn.className = 'pg-tab-btn';
        btn.dataset.tab = tab.id;
        btn.title = tab.name;
        btn.innerHTML = `<i class="fa-solid ${tab.icon}"></i>`;
        
        const isActive = tab.id === settings.activeTab;
        Object.assign(btn.style, {
            width: '38px',
            height: '38px',
            minHeight: '38px',
            background: isActive ? theme.main : 'transparent',
            border: `1px solid ${theme.main}`,
            borderRadius: '8px',
            color: isActive ? theme.bg : theme.main,
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: '0'
        });
        
        btn.addEventListener('click', () => switchTab(tab.id));
        sidebar.appendChild(btn);
    });
    
    return sidebar;
}

/**
 * Create the content area with pages
 */
function createContent(theme) {
    const content = document.createElement('div');
    content.id = 'pg-content';
    Object.assign(content.style, {
        flex: '1',
        padding: '20px',
        overflowY: 'auto',
        color: theme.textLight,
        display: 'flex',
        flexDirection: 'column'
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
            <h2 style="color: ${theme.main}; margin-bottom: 15px; font-size: 20px; letter-spacing: 2px;">
                ✨ ${tab.name} ✨
            </h2>
            <p style="opacity: 0.6; font-style: italic; margin-top: 10px;">
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
        btn.style.color = isActive ? theme.bg : theme.main;
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
    const sidebar = document.getElementById('pg-sidebar');
    const content = document.getElementById('pg-content');
    
    if (book) {
        book.style.background = theme.cardBg;
        book.style.border = `3px solid ${theme.main}`;
        book.style.boxShadow = `0 10px 40px rgba(0,0,0,0.5), 0 0 30px ${theme.main}40`;
    }
    
    if (sidebar) {
        sidebar.style.background = theme.bg;
        sidebar.style.borderRight = `1px solid ${theme.main}33`;
    }
    
    if (content) {
        content.style.color = theme.textLight;
    }
    
    // Update tab buttons
    document.querySelectorAll('.pg-tab-btn').forEach(btn => {
        const isActive = btn.dataset.tab === settings.activeTab;
        btn.style.background = isActive ? theme.main : 'transparent';
        btn.style.border = `1px solid ${theme.main}`;
        btn.style.color = isActive ? theme.bg : theme.main;
    });
    
    // Update close button
    const closeBtn = book?.querySelector('button:last-of-type');
    if (closeBtn) {
        closeBtn.style.background = theme.main;
        closeBtn.style.color = theme.bg;
    }
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
