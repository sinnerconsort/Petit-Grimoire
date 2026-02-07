/**
 * Petit Grimoire - A Magical Girl Fortune-Telling Extension
 * Using inline styles to diagnose CSS loading issues
 */

import { getContext } from '../../../extensions.js';
import { saveSettingsDebounced } from '../../../../script.js';

const extensionName = 'third-party/Petit-Grimoire';
const extensionFolderPath = `scripts/extensions/${extensionName}`;

const THEMES = {
    guardian: { name: 'Guardian', main: '#dc78aa', bg: '#1a0a12', cardBg: '#2a1020', textLight: '#fce4ec' },
    umbra: { name: 'Umbra', main: '#940e8f', bg: '#0d0512', cardBg: '#1a0825', textLight: '#e8d5f5' },
    moonstone: { name: 'Moonstone', main: '#d9c7fb', bg: '#1a1525', cardBg: '#251e35', textLight: '#feebff' },
    celestial: { name: 'Celestial', main: '#002f86', bg: '#060d1a', cardBg: '#0c1528', textLight: '#fbe09c' },
};

let settings = {
    enabled: true,
    theme: 'guardian',
    panelOpen: false,
    fabPosition: { right: 20, bottom: 100 }
};

// Load/save
function loadSettings() {
    const ctx = getContext();
    const saved = ctx.extensionSettings?.[extensionName];
    if (saved) Object.assign(settings, saved);
}

function saveSettings() {
    const ctx = getContext();
    if (!ctx.extensionSettings) ctx.extensionSettings = {};
    ctx.extensionSettings[extensionName] = settings;
    saveSettingsDebounced();
}

// =============================================================================
// CREATE UI WITH INLINE STYLES
// =============================================================================

function createUI() {
    // Remove existing
    $('#petit-grimoire-fab').remove();
    $('#petit-grimoire-panel').remove();
    
    const theme = THEMES[settings.theme] || THEMES.guardian;
    
    // FAB - ALL INLINE STYLES
    const fab = $('<div>', {
        id: 'petit-grimoire-fab',
        title: 'Open Petit Grimoire'
    }).css({
        'position': 'fixed',
        'z-index': '999999',
        'right': settings.fabPosition.right + 'px',
        'bottom': settings.fabPosition.bottom + 'px',
        'width': '56px',
        'height': '56px',
        'background': `linear-gradient(135deg, ${theme.cardBg}, ${theme.bg})`,
        'border': `3px solid ${theme.main}`,
        'border-radius': '50%',
        'box-shadow': `0 4px 20px ${theme.main}80`,
        'display': 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        'cursor': 'pointer',
        'font-size': '24px',
        'color': theme.main,
        'user-select': 'none',
        'touch-action': 'none'
    }).html('✨');
    
    // PANEL - ALL INLINE STYLES
    const panel = $('<div>', {
        id: 'petit-grimoire-panel'
    }).css({
        'position': 'fixed',
        'top': '0',
        'left': '0',
        'right': '0',
        'bottom': '0',
        'z-index': '999998',
        'background': 'rgba(0,0,0,0.8)',
        'backdrop-filter': 'blur(4px)',
        'display': 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        'opacity': '0',
        'visibility': 'hidden',
        'pointer-events': 'none',
        'transition': 'opacity 0.3s ease'
    });
    
    // BOOK inside panel
    const book = $('<div>', {
        id: 'petit-grimoire-book'
    }).css({
        'width': '300px',
        'min-height': '400px',
        'background': theme.cardBg,
        'border': `3px solid ${theme.main}`,
        'border-radius': '12px',
        'box-shadow': `0 10px 40px rgba(0,0,0,0.5), 0 0 30px ${theme.main}50`,
        'padding': '20px',
        'color': theme.textLight
    }).html(`
        <h2 style="color: ${theme.main}; text-align: center; margin-bottom: 20px;">✨ Petit Grimoire ✨</h2>
        <p style="text-align: center;">Theme: ${theme.name}</p>
        <p style="text-align: center; margin-top: 20px; opacity: 0.7;">Panel is working!</p>
        <button id="pg-close-test" style="
            display: block;
            margin: 30px auto 0;
            padding: 10px 25px;
            background: ${theme.main};
            border: none;
            border-radius: 8px;
            color: ${theme.bg};
            font-weight: bold;
            cursor: pointer;
        ">Close</button>
    `);
    
    panel.append(book);
    
    // Add to body
    $('body').append(fab);
    $('body').append(panel);
    
    // FAB click
    let isDragging = false;
    let hasMoved = false;
    let startX, startY, startRight, startBottom;
    
    fab.on('mousedown touchstart', function(e) {
        isDragging = true;
        hasMoved = false;
        
        const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        
        startX = clientX;
        startY = clientY;
        startRight = parseInt(fab.css('right'));
        startBottom = parseInt(fab.css('bottom'));
        
        e.preventDefault();
    });
    
    $(document).on('mousemove touchmove', function(e) {
        if (!isDragging) return;
        
        const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
        
        const deltaX = startX - clientX;
        const deltaY = startY - clientY;
        
        if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
            hasMoved = true;
        }
        
        const newRight = Math.max(5, Math.min(window.innerWidth - 60, startRight + deltaX));
        const newBottom = Math.max(5, Math.min(window.innerHeight - 60, startBottom + deltaY));
        
        fab.css({ right: newRight + 'px', bottom: newBottom + 'px' });
    });
    
    $(document).on('mouseup touchend', function() {
        if (!isDragging) return;
        isDragging = false;
        
        settings.fabPosition = {
            right: parseInt(fab.css('right')),
            bottom: parseInt(fab.css('bottom'))
        };
        saveSettings();
        
        if (!hasMoved) {
            togglePanel();
        }
    });
    
    // Close button
    $(document).on('click', '#pg-close-test', closePanel);
    
    // Click backdrop
    panel.on('click', function(e) {
        if (e.target === this) closePanel();
    });
    
    toastr.success('FAB created with inline styles!', 'Petit Grimoire');
}

function togglePanel() {
    if (settings.panelOpen) {
        closePanel();
    } else {
        openPanel();
    }
}

function openPanel() {
    $('#petit-grimoire-panel').css({
        'opacity': '1',
        'visibility': 'visible',
        'pointer-events': 'auto'
    });
    settings.panelOpen = true;
    saveSettings();
}

function closePanel() {
    $('#petit-grimoire-panel').css({
        'opacity': '0',
        'visibility': 'hidden',
        'pointer-events': 'none'
    });
    settings.panelOpen = false;
    saveSettings();
}

function destroyUI() {
    $('#petit-grimoire-fab').remove();
    $('#petit-grimoire-panel').remove();
}

// Settings panel in Extensions tab
function addSettingsUI() {
    if ($('#pg-settings').length) return;
    
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
                <div style="margin-top: 10px;">
                    <label>Theme: </label>
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

// Init
jQuery(async () => {
    console.log('[PetitGrimoire] Starting...');
    loadSettings();
    addSettingsUI();
    
    if (settings.enabled) {
        // Small delay for DOM
        setTimeout(createUI, 300);
    }
});
