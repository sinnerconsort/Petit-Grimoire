/**
 * Petit Grimoire - A Magical Girl Fortune-Telling Extension
 * 
 * Main entry point - handles FAB, grimoire drawer, themes
 */

import { getContext, renderExtensionTemplateAsync } from '../../../extensions.js';
import { eventSource, event_types, saveSettingsDebounced } from '../../../../script.js';

// =============================================================================
// CONSTANTS & CONFIGURATION
// =============================================================================

const extensionName = 'third-party/Petit-Grimoire';
const extensionFolderPath = `scripts/extensions/${extensionName}`;

/**
 * Asset paths - matching repo structure
 */
const ASSET_PATHS = {
    grimoire: `${extensionFolderPath}/assets/grimoire`,
    shells: `${extensionFolderPath}/assets/shells`,
    sprites: `${extensionFolderPath}/assets/sprites`,
    wizardCat: `${extensionFolderPath}/assets/sprites/wizard-cat`
};

/**
 * Theme definitions - each theme has colors and a matching FAB moon
 */
const THEMES = {
    guardian: {
        name: 'Guardian',
        desc: 'Star Prism • Gem Guardians',
        main: '#dc78aa',
        secondary: '#f3aa1e',
        accent1: '#e71720',
        accent2: '#26508a',
        bg: '#1a0a12',
        cardBg: '#2a1020',
        textLight: '#fce4ec',
        textDim: '#dc78aa99',
        fabIcon: 'fab-guardian.png',
        shell: 'guardian-shell.png'
    },
    umbra: {
        name: 'Umbra',
        desc: 'Grief Seeds • Soul Fragments',
        main: '#940e8f',
        secondary: '#d89520',
        accent1: '#5d0971',
        accent2: '#c8b1f7',
        bg: '#0d0512',
        cardBg: '#1a0825',
        textLight: '#e8d5f5',
        textDim: '#c8b1f788',
        fabIcon: 'fab-umbra.png',
        shell: 'umbra-shell.png'
    },
    apothecary: {
        name: 'Apothecary',
        desc: 'Dried Herbs • Forest Remedies',
        main: '#76482e',
        secondary: '#4c6b20',
        accent1: '#bdbf46',
        accent2: '#e9ae75',
        bg: '#1a150e',
        cardBg: '#2a2015',
        textLight: '#f0e6d8',
        textDim: '#e9ae7588',
        fabIcon: 'fab-apothecary.png',
        shell: 'apothecary-shell.png'
    },
    moonstone: {
        name: 'Moonstone',
        desc: 'Moon Phases • Crystal Paws',
        main: '#d9c7fb',
        secondary: '#bcf1fd',
        accent1: '#feebff',
        accent2: '#d692ff',
        bg: '#1a1525',
        cardBg: '#251e35',
        textLight: '#feebff',
        textDim: '#d9c7fb88',
        fabIcon: 'fab-moonstone.png',
        shell: 'moonstone-shell.png'
    },
    phosphor: {
        name: 'Phosphor',
        desc: 'Neon Crystals • Digital Potions',
        main: '#7375ca',
        secondary: '#feffff',
        accent1: '#f990f6',
        accent2: '#120147',
        bg: '#060018',
        cardBg: '#0d0230',
        textLight: '#e8e8ff',
        textDim: '#7375ca88',
        fabIcon: 'fab-phosphor.png',
        shell: 'phosphor-shell.png'
    },
    rosewood: {
        name: 'Rosewood',
        desc: 'Dream Diary • Rose Sigils',
        main: '#e4b0bc',
        secondary: '#d8caca',
        accent1: '#83b6ac',
        accent2: '#177656',
        bg: '#1a1214',
        cardBg: '#2a1e22',
        textLight: '#f5eaed',
        textDim: '#e4b0bc88',
        fabIcon: 'fab-rosewood.png',
        shell: 'rosewood-shell.png'
    },
    celestial: {
        name: 'Celestial',
        desc: 'Astral Chains • Starbound Grimoire',
        main: '#002f86',
        secondary: '#e3b35f',
        accent1: '#132040',
        accent2: '#fbe09c',
        bg: '#060d1a',
        cardBg: '#0c1528',
        textLight: '#fbe09c',
        textDim: '#e3b35f88',
        fabIcon: 'fab-celestial.png',
        shell: 'celestial-shell.png'
    }
};

/**
 * Grimoire sprite configuration
 */
const SPRITES = {
    // Dimensions (raw pixel art size)
    frameWidth: 896,
    frameHeight: 720,
    
    // Frame counts
    openingFrames: 5,
    closingFrames: 5,
    pageNextFrames: 9,
    pagePrevFrames: 9,
    
    // Page turn sprites are smaller
    pageFrameWidth: 448,
    pageFrameHeight: 360,
    
    // Animation timing (ms per frame)
    frameDelay: 80,
    pageFrameDelay: 50
};

/**
 * Tab definitions for the grimoire
 */
const TABS = [
    { id: 'tarot', name: 'Tarot', icon: 'fa-cards' },
    { id: 'crystal', name: 'Crystal Ball', icon: 'fa-circle' },
    { id: 'ouija', name: 'Ouija', icon: 'fa-ghost' },
    { id: 'spells', name: 'Spell Cards', icon: 'fa-wand-magic-sparkles' },
    { id: 'nyx', name: 'Nyx', icon: 'fa-cat' },
    { id: 'settings', name: 'Settings', icon: 'fa-gear' }
];

// =============================================================================
// STATE
// =============================================================================

let extensionSettings = {
    enabled: true,
    theme: 'guardian',
    panelOpen: false,
    activeTab: 'tarot',
    fabPosition: { right: 15, bottom: 100 }
};

// Runtime state (not persisted)
let isAnimating = false;
let currentAnimationFrame = null;

// =============================================================================
// SETTINGS PERSISTENCE
// =============================================================================

function loadSettings() {
    try {
        const context = getContext();
        const saved = context.extensionSettings?.[extensionName];
        if (saved) {
            Object.assign(extensionSettings, saved);
        }
    } catch (error) {
        console.error('[PetitGrimoire] Error loading settings:', error);
    }
}

function saveSettings() {
    try {
        const context = getContext();
        if (!context.extensionSettings) {
            context.extensionSettings = {};
        }
        context.extensionSettings[extensionName] = extensionSettings;
        saveSettingsDebounced();
    } catch (error) {
        console.error('[PetitGrimoire] Error saving settings:', error);
    }
}

// =============================================================================
// THEME SYSTEM
// =============================================================================

/**
 * Apply a theme to the extension UI
 */
function applyTheme(themeKey) {
    const theme = THEMES[themeKey];
    if (!theme) {
        console.warn(`[PetitGrimoire] Unknown theme: ${themeKey}`);
        return;
    }
    
    // Set CSS custom properties on the grimoire container
    const root = document.querySelector('#petit-grimoire-container');
    if (root) {
        root.style.setProperty('--pg-main', theme.main);
        root.style.setProperty('--pg-secondary', theme.secondary);
        root.style.setProperty('--pg-accent1', theme.accent1);
        root.style.setProperty('--pg-accent2', theme.accent2);
        root.style.setProperty('--pg-bg', theme.bg);
        root.style.setProperty('--pg-card-bg', theme.cardBg);
        root.style.setProperty('--pg-text-light', theme.textLight);
        root.style.setProperty('--pg-text-dim', theme.textDim);
    }
    
    // Update FAB icon
    const fab = document.querySelector('#petit-grimoire-fab img');
    if (fab) {
        fab.src = `${ASSET_PATHS.sprites}/${theme.fabIcon}`;
    }
    
    // Update data attribute for CSS selectors
    document.querySelector('#petit-grimoire-container')?.setAttribute('data-theme', themeKey);
    
    extensionSettings.theme = themeKey;
    saveSettings();
}

// =============================================================================
// GRIMOIRE ANIMATION
// =============================================================================

/**
 * Play the grimoire opening animation
 */
async function playOpenAnimation() {
    if (isAnimating) return;
    isAnimating = true;
    
    const grimoire = document.querySelector('#petit-grimoire-book');
    if (!grimoire) {
        isAnimating = false;
        return;
    }
    
    grimoire.classList.add('animating');
    grimoire.classList.remove('open', 'closed');
    
    // Play through frames
    for (let frame = 0; frame < SPRITES.openingFrames; frame++) {
        grimoire.style.setProperty('--sprite-frame', frame);
        grimoire.setAttribute('data-animation', 'opening');
        grimoire.setAttribute('data-frame', frame);
        await delay(SPRITES.frameDelay);
    }
    
    // Set final open state
    grimoire.classList.remove('animating');
    grimoire.classList.add('open');
    grimoire.setAttribute('data-animation', 'open');
    
    isAnimating = false;
}

/**
 * Play the grimoire closing animation
 */
async function playCloseAnimation() {
    if (isAnimating) return;
    isAnimating = true;
    
    const grimoire = document.querySelector('#petit-grimoire-book');
    if (!grimoire) {
        isAnimating = false;
        return;
    }
    
    grimoire.classList.add('animating');
    grimoire.classList.remove('open', 'closed');
    
    // Play through frames
    for (let frame = 0; frame < SPRITES.closingFrames; frame++) {
        grimoire.style.setProperty('--sprite-frame', frame);
        grimoire.setAttribute('data-animation', 'closing');
        grimoire.setAttribute('data-frame', frame);
        await delay(SPRITES.frameDelay);
    }
    
    // Set final closed state
    grimoire.classList.remove('animating');
    grimoire.classList.add('closed');
    grimoire.setAttribute('data-animation', 'closed');
    
    isAnimating = false;
}

/**
 * Play page turn animation
 */
async function playPageTurn(direction = 'next') {
    if (isAnimating) return;
    isAnimating = true;
    
    const pageOverlay = document.querySelector('#petit-grimoire-page-turn');
    if (!pageOverlay) {
        isAnimating = false;
        return;
    }
    
    pageOverlay.classList.add('active');
    pageOverlay.setAttribute('data-direction', direction);
    
    const frameCount = direction === 'next' ? SPRITES.pageNextFrames : SPRITES.pagePrevFrames;
    
    for (let frame = 0; frame < frameCount; frame++) {
        pageOverlay.style.setProperty('--page-frame', frame);
        pageOverlay.setAttribute('data-frame', frame);
        await delay(SPRITES.pageFrameDelay);
    }
    
    pageOverlay.classList.remove('active');
    isAnimating = false;
}

// =============================================================================
// PANEL CONTROL
// =============================================================================

/**
 * Open the grimoire panel
 */
async function openPanel() {
    if (extensionSettings.panelOpen || isAnimating) return;
    
    const panel = document.querySelector('#petit-grimoire-panel');
    if (!panel) return;
    
    panel.classList.add('visible');
    await playOpenAnimation();
    
    extensionSettings.panelOpen = true;
    saveSettings();
}

/**
 * Close the grimoire panel
 */
async function closePanel() {
    if (!extensionSettings.panelOpen || isAnimating) return;
    
    await playCloseAnimation();
    
    const panel = document.querySelector('#petit-grimoire-panel');
    if (panel) {
        panel.classList.remove('visible');
    }
    
    extensionSettings.panelOpen = false;
    saveSettings();
}

/**
 * Toggle the grimoire panel
 */
function togglePanel() {
    if (extensionSettings.panelOpen) {
        closePanel();
    } else {
        openPanel();
    }
}

// =============================================================================
// TAB SYSTEM
// =============================================================================

/**
 * Switch to a tab with page turn animation
 */
async function switchTab(tabId) {
    if (isAnimating) return;
    if (tabId === extensionSettings.activeTab) return;
    
    const currentIndex = TABS.findIndex(t => t.id === extensionSettings.activeTab);
    const newIndex = TABS.findIndex(t => t.id === tabId);
    
    if (newIndex === -1) return;
    
    // Determine direction
    const direction = newIndex > currentIndex ? 'next' : 'prev';
    
    // Play page turn
    await playPageTurn(direction);
    
    // Update active states
    document.querySelectorAll('.pg-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    
    document.querySelectorAll('.pg-tab-content').forEach(content => {
        content.classList.toggle('active', content.dataset.tabContent === tabId);
    });
    
    extensionSettings.activeTab = tabId;
    saveSettings();
}

// =============================================================================
// FAB (Floating Action Button)
// =============================================================================

/**
 * Make the FAB draggable
 */
function initFabDrag() {
    const fab = document.querySelector('#petit-grimoire-fab');
    if (!fab) return;
    
    let isDragging = false;
    let hasMoved = false;
    let startX, startY, startRight, startBottom;
    
    const onStart = (clientX, clientY) => {
        isDragging = true;
        hasMoved = false;
        startX = clientX;
        startY = clientY;
        
        const rect = fab.getBoundingClientRect();
        startRight = window.innerWidth - rect.right;
        startBottom = window.innerHeight - rect.bottom;
        
        fab.classList.add('dragging');
    };
    
    const onMove = (clientX, clientY) => {
        if (!isDragging) return;
        
        const deltaX = startX - clientX;
        const deltaY = startY - clientY;
        
        if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
            hasMoved = true;
        }
        
        let newRight = startRight + deltaX;
        let newBottom = startBottom + deltaY;
        
        // Constrain to viewport
        const fabRect = fab.getBoundingClientRect();
        newRight = Math.max(5, Math.min(window.innerWidth - fabRect.width - 5, newRight));
        newBottom = Math.max(5, Math.min(window.innerHeight - fabRect.height - 5, newBottom));
        
        fab.style.right = `${newRight}px`;
        fab.style.bottom = `${newBottom}px`;
    };
    
    const onEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        fab.classList.remove('dragging');
        
        // Save position
        extensionSettings.fabPosition = {
            right: parseInt(fab.style.right),
            bottom: parseInt(fab.style.bottom)
        };
        saveSettings();
        
        // If we didn't move, treat as click
        if (!hasMoved) {
            togglePanel();
        }
    };
    
    // Mouse events
    fab.addEventListener('mousedown', (e) => {
        e.preventDefault();
        onStart(e.clientX, e.clientY);
    });
    
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            e.preventDefault();
            onMove(e.clientX, e.clientY);
        }
    });
    
    document.addEventListener('mouseup', onEnd);
    
    // Touch events
    fab.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        onStart(touch.clientX, touch.clientY);
    }, { passive: true });
    
    document.addEventListener('touchmove', (e) => {
        if (isDragging) {
            const touch = e.touches[0];
            onMove(touch.clientX, touch.clientY);
        }
    }, { passive: false });
    
    document.addEventListener('touchend', onEnd);
}

// =============================================================================
// UI INITIALIZATION
// =============================================================================

/**
 * Create the main UI structure
 */
function createUI() {
    // Remove existing if present
    document.querySelector('#petit-grimoire-container')?.remove();
    
    const theme = THEMES[extensionSettings.theme] || THEMES.guardian;
    
    // Build tab buttons HTML
    const tabButtonsHtml = TABS.map((tab, index) => `
        <button class="pg-tab-btn ${tab.id === extensionSettings.activeTab ? 'active' : ''}" 
                data-tab="${tab.id}" 
                data-index="${index}"
                title="${tab.name}">
            <i class="fa-solid ${tab.icon}"></i>
        </button>
    `).join('');
    
    // Build tab content HTML
    const tabContentHtml = TABS.map(tab => `
        <div class="pg-tab-content ${tab.id === extensionSettings.activeTab ? 'active' : ''}" 
             data-tab-content="${tab.id}">
            <div class="pg-page-header">${tab.name}</div>
            <div class="pg-page-body" id="pg-page-${tab.id}">
                <!-- Content will be injected by sub-modules -->
                <p class="pg-placeholder">✨ ${tab.name} coming soon...</p>
            </div>
        </div>
    `).join('');
    
    const containerHtml = `
        <div id="petit-grimoire-container" data-theme="${extensionSettings.theme}">
            <!-- FAB Button -->
            <button id="petit-grimoire-fab" 
                    style="right: ${extensionSettings.fabPosition.right}px; bottom: ${extensionSettings.fabPosition.bottom}px;">
                <img src="${ASSET_PATHS.sprites}/${theme.fabIcon}" 
                     alt="Open Grimoire" 
                     draggable="false">
            </button>
            
            <!-- Panel -->
            <div id="petit-grimoire-panel" class="${extensionSettings.panelOpen ? 'visible' : ''}">
                <!-- The Grimoire Book -->
                <div id="petit-grimoire-book" 
                     class="${extensionSettings.panelOpen ? 'open' : 'closed'}"
                     data-animation="${extensionSettings.panelOpen ? 'open' : 'closed'}">
                    
                    <!-- Tab buttons (positioned over the book's tab sprites) -->
                    <div id="pg-tab-buttons">
                        ${tabButtonsHtml}
                    </div>
                    
                    <!-- Page content area -->
                    <div id="pg-page-content">
                        ${tabContentHtml}
                    </div>
                    
                    <!-- Page turn overlay -->
                    <div id="petit-grimoire-page-turn"></div>
                </div>
                
                <!-- Close button -->
                <button id="pg-close-btn" title="Close Grimoire">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        </div>
    `;
    
    $('body').append(containerHtml);
    
    // Apply theme colors
    applyTheme(extensionSettings.theme);
    
    // Wire up events
    initFabDrag();
    
    // Tab clicks
    document.querySelectorAll('.pg-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });
    
    // Close button
    document.querySelector('#pg-close-btn')?.addEventListener('click', closePanel);
    
    // Click outside to close (on the backdrop area)
    document.querySelector('#petit-grimoire-panel')?.addEventListener('click', (e) => {
        if (e.target.id === 'petit-grimoire-panel') {
            closePanel();
        }
    });
}

/**
 * Add settings to the Extensions panel
 */
async function addExtensionSettings() {
    const settingsHtml = `
        <div class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
                <b>✨ Petit Grimoire</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content">
                <label class="checkbox_label">
                    <input type="checkbox" id="pg-enabled" ${extensionSettings.enabled ? 'checked' : ''}>
                    <span>Enable Extension</span>
                </label>
                
                <div class="pg-settings-row">
                    <label>Theme:</label>
                    <select id="pg-theme-select">
                        ${Object.entries(THEMES).map(([key, t]) => 
                            `<option value="${key}" ${extensionSettings.theme === key ? 'selected' : ''}>${t.name}</option>`
                        ).join('')}
                    </select>
                </div>
            </div>
        </div>
    `;
    
    $('#extensions_settings2').append(settingsHtml);
    
    // Enable/disable toggle
    $('#pg-enabled').on('change', function() {
        extensionSettings.enabled = $(this).prop('checked');
        saveSettings();
        
        if (extensionSettings.enabled) {
            createUI();
        } else {
            document.querySelector('#petit-grimoire-container')?.remove();
        }
    });
    
    // Theme select
    $('#pg-theme-select').on('change', function() {
        applyTheme($(this).val());
    });
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// =============================================================================
// INITIALIZATION
// =============================================================================

jQuery(async () => {
    console.log('[PetitGrimoire] 🔮 Initializing...');
    
    try {
        // Load saved settings
        loadSettings();
        
        // Add to Extensions panel
        await addExtensionSettings();
        
        // Create UI if enabled
        if (extensionSettings.enabled) {
            createUI();
        }
        
        // Register event handlers
        eventSource.on(event_types.CHAT_CHANGED, () => {
            // Could reload per-chat data here
        });
        
        console.log('[PetitGrimoire] ✨ Ready!');
        
    } catch (error) {
        console.error('[PetitGrimoire] ❌ Initialization failed:', error);
        toastr.error('Petit Grimoire failed to load. Check console.', 'Extension Error');
    }
});

// =============================================================================
// EXPORTS (for sub-modules)
// =============================================================================

export {
    THEMES,
    SPRITES,
    TABS,
    ASSET_PATHS,
    extensionSettings,
    extensionFolderPath,
    saveSettings,
    applyTheme,
    switchTab,
    openPanel,
    closePanel
};
