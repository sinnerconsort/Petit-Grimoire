/**
 * Petit Grimoire - DEBUG VERSION
 * Giant red button that should be impossible to miss
 */

import { getContext } from '../../../extensions.js';
import { saveSettingsDebounced } from '../../../../script.js';

const extensionName = 'third-party/Petit-Grimoire';

let settings = { enabled: true, theme: 'guardian' };

function loadSettings() {
    try {
        const ctx = getContext();
        if (ctx.extensionSettings?.[extensionName]) {
            Object.assign(settings, ctx.extensionSettings[extensionName]);
        }
    } catch(e) { console.error(e); }
}

function saveSettings() {
    try {
        const ctx = getContext();
        if (!ctx.extensionSettings) ctx.extensionSettings = {};
        ctx.extensionSettings[extensionName] = settings;
        saveSettingsDebounced();
    } catch(e) { console.error(e); }
}

function createUI() {
    // Remove any existing
    document.getElementById('pg-fab')?.remove();
    document.getElementById('pg-panel')?.remove();
    
    // Create FAB - BIG RED CIRCLE, can't miss it
    const fab = document.createElement('div');
    fab.id = 'pg-fab';
    fab.innerHTML = '✨';
    
    // Apply styles directly to the element
    Object.assign(fab.style, {
        position: 'fixed',
        left: '50%',           // CENTER of screen
        top: '50%',            // CENTER of screen  
        transform: 'translate(-50%, -50%)',
        zIndex: '2147483647',  // Max possible z-index
        width: '100px',        // BIG
        height: '100px',       // BIG
        background: 'red',     // OBVIOUS COLOR
        border: '5px solid yellow',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '40px',
        cursor: 'pointer',
        boxShadow: '0 0 50px red'
    });
    
    document.body.appendChild(fab);
    
    // Verify it exists
    const check = document.getElementById('pg-fab');
    if (check) {
        const rect = check.getBoundingClientRect();
        toastr.info(`FAB position: ${rect.left.toFixed(0)}, ${rect.top.toFixed(0)}, size: ${rect.width}x${rect.height}`, 'Debug');
    } else {
        toastr.error('FAB element NOT FOUND after creation!', 'Debug');
    }
    
    // Panel
    const panel = document.createElement('div');
    panel.id = 'pg-panel';
    Object.assign(panel.style, {
        position: 'fixed',
        inset: '0',
        zIndex: '2147483646',
        background: 'rgba(0,0,0,0.9)',
        display: 'none',
        alignItems: 'center',
        justifyContent: 'center'
    });
    panel.innerHTML = `
        <div style="background: #2a1020; border: 3px solid #dc78aa; border-radius: 12px; padding: 30px; color: white; text-align: center;">
            <h2 style="color: #dc78aa;">✨ It Works! ✨</h2>
            <p>Panel opened successfully</p>
            <button id="pg-close" style="margin-top: 20px; padding: 10px 30px; background: #dc78aa; border: none; border-radius: 8px; cursor: pointer;">Close</button>
        </div>
    `;
    document.body.appendChild(panel);
    
    // Click handlers
    fab.addEventListener('click', () => {
        toastr.info('FAB clicked!', 'Debug');
        panel.style.display = 'flex';
    });
    
    document.getElementById('pg-close')?.addEventListener('click', () => {
        panel.style.display = 'none';
    });
    
    panel.addEventListener('click', (e) => {
        if (e.target === panel) panel.style.display = 'none';
    });
    
    toastr.success('BIG RED FAB should be in CENTER of screen!', 'Petit Grimoire');
}

function destroyUI() {
    document.getElementById('pg-fab')?.remove();
    document.getElementById('pg-panel')?.remove();
}

function addSettingsUI() {
    if (document.getElementById('pg-settings')) return;
    
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
                <button id="pg-recreate" class="menu_button" style="margin-top: 10px;">Recreate UI (Debug)</button>
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
    
    $('#pg-recreate').on('click', () => {
        toastr.info('Recreating...', 'Debug');
        createUI();
    });
}

// Init
jQuery(() => {
    console.log('[PetitGrimoire] DEBUG VERSION starting...');
    loadSettings();
    addSettingsUI();
    
    if (settings.enabled) {
        setTimeout(createUI, 500);
    }
});
