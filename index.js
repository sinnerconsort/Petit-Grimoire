/**
 * Petit Grimoire - A Magical Girl Fortune-Telling Extension
 * Working version - positioning fixed
 */

import { getContext } from '../../../extensions.js';
import { saveSettingsDebounced } from '../../../../script.js';

const extensionName = 'third-party/Petit-Grimoire';
const extensionFolderPath = `scripts/extensions/${extensionName}`;

const THEMES = {
    guardian: {
        name: 'Guardian',
        main: '#dc78aa',
        secondary: '#f3aa1e',
        bg: '#1a0a12',
        cardBg: '#2a1020',
        textLight: '#fce4ec',
        fabIcon: 'fab-guardian.png'
    },
    umbra: {
        name: 'Umbra',
        main: '#940e8f',
        secondary: '#d89520',
        bg: '#0d0512',
        cardBg: '#1a0825',
        textLight: '#e8d5f5',
        fabIcon: 'fab-umbra.png'
    },
    apothecary: {
        name: 'Apothecary',
        main: '#76482e',
        secondary: '#4c6b20',
        bg: '#1a150e',
        cardBg: '#2a2015',
        textLight: '#f0e6d8',
        fabIcon: 'fab-apothecary.png'
    },
    moonstone: {
        name: 'Moonstone',
        main: '#d9c7fb',
        secondary: '#bcf1fd',
        bg: '#1a1525',
        cardBg: '#251e35',
        textLight: '#feebff',
        fabIcon: 'fab-moonstone.png'
    },
    phosphor: {
        name: 'Phosphor',
        main: '#7375ca',
        secondary: '#feffff',
        bg: '#060018',
        cardBg: '#0d0230',
        textLight: '#e8e8ff',
        fabIcon: 'fab-phosphor.png'
    },
    rosewood: {
        name: 'Rosewood',
        main: '#e4b0bc',
        secondary: '#d8caca',
        bg: '#1a1214',
        cardBg: '#2a1e22',
        textLight: '#f5eaed',
        fabIcon: 'fab-rosewood.png'
    },
    celestial: {
        name: 'Celestial',
        main: '#002f86',
        secondary: '#e3b35f',
        bg: '#060d1a',
        cardBg: '#0c1528',
        textLight: '#fbe09c',
        fabIcon: 'fab-celestial.png'
    }
};

const TABS = [
    { id: 'tarot', name: 'Tarot', icon: 'fa-star' },
    { id: 'crystal', name: 'Crystal Ball', icon: 'fa-circle' },
    { id: 'ouija', name: 'Ouija', icon: 'fa-ghost' },
    { id: 'spells', name: 'Spell Cards', icon: 'fa-wand-magic-sparkles' },
    { id: 'nyx', name: 'Nyx', icon: 'fa-cat' },
    { id: 'settings', name: 'Settings', icon: 'fa-gear' }
];

let settings = {
    enabled: true,
    theme: 'guardian',
    activeTab: 'tarot',
    fabPosition: { x: null, y: null }  // null = use default
};

// =============================================================================
// SETTINGS
// =============================================================================

function loadSettings() {
    try {
        const ctx = getContext();
        if (ctx.extensionSettings?.[extensionName]) {
            Object.assign(settings, ctx.extensionSettings[extensionName]);
        }
    } catch(e) { console.error('[PG]', e); }
}

function saveSettings() {
    try {
        const ctx = getContext();
        if (!ctx.extensionSettings) ctx.extensionSettings = {};
        ctx.extensionSettings[extensionName] = settings;
        saveSettingsDebounced();
    } catch(e) { console.error('[PG]', e); }
}

// =============================================================================
// UI CREATION
// =============================================================================

function createUI() {
    destroyUI();
    
    const theme = THEMES[settings.theme] || THEMES.guardian;
    
    // Default position: bottom-right
    const defaultX = window.innerWidth - 70;
    const defaultY = window.innerHeight - 140;
    const fabX = settings.fabPosition.x ?? defaultX;
    const fabY = settings.fabPosition.y ?? defaultY;
    
    // =========== FAB ===========
    const fab = document.createElement('div');
    fab.id = 'pg-fab';
    fab.title = 'Open Petit Grimoire';
    
    Object.assign(fab.style, {
        position: 'fixed',
        left: fabX + 'px',
        top: fabY + 'px',
        zIndex: '99999',
        width: '56px',
        height: '56px',
        background: `linear-gradient(135deg, ${theme.cardBg}, ${theme.bg})`,
        border: `3px solid ${theme.main}`,
        borderRadius: '50%',
        boxShadow: `0 4px 20px ${theme.main}66`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        touchAction: 'none',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    });
    
    // Try image, fallback to emoji
    const img = document.createElement('img');
    img.src = `${extensionFolderPath}/assets/sprites/${theme.fabIcon}`;
    img.alt = '✨';
    img.draggable = false;
    Object.assign(img.style, {
        width: '32px',
        height: '32px',
        imageRendering: 'pixelated',
        pointerEvents: 'none'
    });
    img.onerror = () => {
        fab.innerHTML = '✨';
        fab.style.fontSize = '24px';
        fab.style.color = theme.main;
    };
    fab.appendChild(img);
    
    document.body.appendChild(fab);
    
    // =========== PANEL ===========
    const panel = document.createElement('div');
    panel.id = 'pg-panel';
    Object.assign(panel.style, {
        position: 'fixed',
        inset: '0',
        zIndex: '99998',
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(4px)',
        display: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box'
    });
    
    // Book container
    const book = document.createElement('div');
    book.id = 'pg-book';
    Object.assign(book.style, {
        position: 'relative',
        width: '320px',
        maxWidth: '95vw',
        height: '450px',
        maxHeight: '70vh',
        background: theme.cardBg,
        border: `3px solid ${theme.main}`,
        borderRadius: '12px',
        boxShadow: `0 10px 40px rgba(0,0,0,0.5), 0 0 30px ${theme.main}40`,
        display: 'flex',
        overflow: 'hidden'
    });
    
    // Tab sidebar
    const sidebar = document.createElement('div');
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
        Object.assign(btn.style, {
            width: '38px',
            height: '38px',
            minHeight: '38px',
            background: tab.id === settings.activeTab ? theme.main : 'transparent',
            border: `1px solid ${theme.main}`,
            borderRadius: '8px',
            color: tab.id === settings.activeTab ? theme.bg : theme.main,
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: '0'
        });
        btn.onclick = () => switchTab(tab.id, theme);
        sidebar.appendChild(btn);
    });
    
    // Content area
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
        Object.assign(page.style, {
            display: tab.id === settings.activeTab ? 'flex' : 'none',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: '1',
            textAlign: 'center'
        });
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
    
    book.appendChild(sidebar);
    book.appendChild(content);
    
    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
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
    closeBtn.onclick = closePanel;
    book.appendChild(closeBtn);
    
    panel.appendChild(book);
    panel.onclick = (e) => { if (e.target === panel) closePanel(); };
    
    document.body.appendChild(panel);
    
    // =========== FAB DRAG ===========
    let isDragging = false;
    let hasMoved = false;
    let startX, startY, startLeft, startTop;
    
    function onStart(clientX, clientY) {
        isDragging = true;
        hasMoved = false;
        startX = clientX;
        startY = clientY;
        startLeft = fab.offsetLeft;
        startTop = fab.offsetTop;
        fab.style.transition = 'none';
    }
    
    function onMove(clientX, clientY) {
        if (!isDragging) return;
        
        const dx = clientX - startX;
        const dy = clientY - startY;
        
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) hasMoved = true;
        
        let newX = startLeft + dx;
        let newY = startTop + dy;
        
        // Constrain to viewport
        newX = Math.max(0, Math.min(window.innerWidth - 56, newX));
        newY = Math.max(0, Math.min(window.innerHeight - 56, newY));
        
        fab.style.left = newX + 'px';
        fab.style.top = newY + 'px';
    }
    
    function onEnd() {
        if (!isDragging) return;
        isDragging = false;
        fab.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
        
        settings.fabPosition = {
            x: fab.offsetLeft,
            y: fab.offsetTop
        };
        saveSettings();
        
        if (!hasMoved) {
            openPanel();
        }
    }
    
    fab.addEventListener('mousedown', (e) => { e.preventDefault(); onStart(e.clientX, e.clientY); });
    document.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
    document.addEventListener('mouseup', onEnd);
    
    fab.addEventListener('touchstart', (e) => { onStart(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
    document.addEventListener('touchmove', (e) => { if (isDragging) onMove(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
    document.addEventListener('touchend', onEnd);
    
    console.log('[PG] UI created');
}

function destroyUI() {
    document.getElementById('pg-fab')?.remove();
    document.getElementById('pg-panel')?.remove();
}

function openPanel() {
    const panel = document.getElementById('pg-panel');
    if (panel) panel.style.display = 'flex';
}

function closePanel() {
    const panel = document.getElementById('pg-panel');
    if (panel) panel.style.display = 'none';
}

function switchTab(tabId, theme) {
    if (!theme) theme = THEMES[settings.theme] || THEMES.guardian;
    
    document.querySelectorAll('.pg-tab-btn').forEach(btn => {
        const isActive = btn.dataset.tab === tabId;
        btn.style.background = isActive ? theme.main : 'transparent';
        btn.style.color = isActive ? theme.bg : theme.main;
    });
    
    document.querySelectorAll('.pg-page').forEach(page => {
        page.style.display = page.dataset.page === tabId ? 'flex' : 'none';
    });
    
    settings.activeTab = tabId;
    saveSettings();
}

// =============================================================================
// SETTINGS UI
// =============================================================================

function addSettingsUI() {
    if (document.getElementById('pg-settings')) return;
    
    const themeOpts = Object.entries(THEMES)
        .map(([k, t]) => `<option value="${k}" ${settings.theme === k ? 'selected' : ''}>${t.name}</option>`)
        .join('');
    
    const html = `
        <div id="pg-settings" class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
                <b>✨ Petit Grimoire</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content">
                <label class="checkbox_label">
                    <input type="checkbox" id="pg-enabled" ${settings.enabled ? 'checked' : ''}>
                    <span>Enable Extension</span>
                </label>
                <div style="margin-top: 10px; display: flex; align-items: center; gap: 10px;">
                    <label>Theme:</label>
                    <select id="pg-theme">${themeOpts}</select>
                </div>
            </div>
        </div>
    `;
    
    $('#extensions_settings2').append(html);
    
    $('#pg-enabled').on('change', function() {
        settings.enabled = $(this).prop('checked');
        saveSettings();
        if (settings.enabled) createUI();
        else destroyUI();
    });
    
    $('#pg-theme').on('change', function() {
        settings.theme = $(this).val();
        saveSettings();
        if (settings.enabled) createUI();
    });
}

// =============================================================================
// INIT
// =============================================================================

jQuery(() => {
    console.log('[PG] Petit Grimoire starting...');
    loadSettings();
    addSettingsUI();
    
    if (settings.enabled) {
        setTimeout(createUI, 300);
    }
});
