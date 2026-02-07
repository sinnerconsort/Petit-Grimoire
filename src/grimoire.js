/**
 * Petit Grimoire — Grimoire + Compact (Merged)
 * v6 - SIMPLIFIED: Direct click handler, no drag dependency
 * 
 * Exports:
 *   - initGrimoire()      → creates compact + drawer
 *   - closeGrimoire()     → slide drawer out  
 *   - updateCompactBadge(n) → set fate queue count
 */

import { extensionName, extensionFolderPath, extensionSettings } from './state.js';

// ══════════════════════════════════════════════
// STATE
// ══════════════════════════════════════════════

let isOpen = false;
let currentTab = 'tarot';

// ══════════════════════════════════════════════
// TAB CONFIGURATION
// ══════════════════════════════════════════════

const TABS = [
    { id: 'tarot',    icon: 'fa-layer-group',     label: 'Tarot' },
    { id: 'crystal',  icon: 'fa-circle',          label: 'Crystal Ball' },
    { id: 'ouija',    icon: 'fa-ghost',           label: 'Ouija' },
    { id: 'nyx',      icon: 'fa-cat',             label: 'Nyx' },
    { id: 'spells',   icon: 'fa-wand-sparkles',   label: 'Spells' },
    { id: 'settings', icon: 'fa-gear',            label: 'Settings' },
];

// ══════════════════════════════════════════════
// DEBUG (toastr for mobile)
// ══════════════════════════════════════════════

function debug(msg) {
    console.log(`[Grimoire] ${msg}`);
    // Enable this line for mobile debugging:
    if (typeof toastr !== 'undefined') {
        toastr.info(msg, 'Grimoire', { timeOut: 2000 });
    }
}

// ══════════════════════════════════════════════
// INITIALIZATION
// ══════════════════════════════════════════════

export function initGrimoire() {
    debug('Init start');
    
    try {
        createCompact();
        createDrawer();
        debug('Init complete');
    } catch (err) {
        console.error('[Grimoire] Init failed:', err);
        if (typeof toastr !== 'undefined') {
            toastr.error('Grimoire init failed: ' + err.message);
        }
    }
}

// ══════════════════════════════════════════════
// COMPACT CREATION - SIMPLE VERSION
// ══════════════════════════════════════════════

function createCompact() {
    // Remove old
    $('#mg-compact').remove();
    
    const theme = extensionSettings.shellTheme || 'guardian';
    
    const html = `
        <div class="mg-fab mg-compact" id="mg-compact" data-mg-theme="${theme}">
            <div class="mg-compact-body">
                <div class="mg-compact-glow"></div>
                <div class="mg-compact-icon"></div>
                <div class="mg-compact-sparkles">
                    <span class="mg-compact-sparkle"></span>
                    <span class="mg-compact-sparkle"></span>
                    <span class="mg-compact-sparkle"></span>
                    <span class="mg-compact-sparkle"></span>
                </div>
                <div class="mg-compact-badge" id="mg-compact-badge"></div>
            </div>
        </div>
    `;
    
    $('body').append(html);
    
    const $compact = $('#mg-compact');
    
    if (!$compact.length) {
        debug('ERROR: Compact not created');
        return;
    }
    
    // Force visibility with inline styles
    $compact.css({
        'position': 'fixed',
        'z-index': '99990',
        'display': 'flex',
        'visibility': 'visible',
        'opacity': '1',
        'pointer-events': 'auto',
        'bottom': '80px',
        'right': '16px'
    });
    
    // SIMPLE CLICK HANDLER - this is the key fix
    $compact.on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        debug('Compact clicked!');
        toggleGrimoire();
    });
    
    // Also bind to the body specifically for touch
    $('#mg-compact .mg-compact-body').on('click touchend', function(e) {
        e.preventDefault();
        e.stopPropagation();
        debug('Compact body tapped!');
        toggleGrimoire();
    });
    
    // Respect visibility setting
    if (extensionSettings.showCompact === false) {
        $compact.hide();
    }
    
    debug('Compact created with click handler');
}

// ══════════════════════════════════════════════
// DRAWER CREATION
// ══════════════════════════════════════════════

function createDrawer() {
    // Remove old
    $('#mg-grimoire').remove();
    $('#mg-grimoire-overlay').remove();
    
    const theme = extensionSettings.shellTheme || 'guardian';
    
    // Overlay
    const $overlay = $('<div class="mg-grimoire-overlay" id="mg-grimoire-overlay"></div>');
    $overlay.on('click', function() {
        debug('Overlay clicked');
        closeGrimoire();
    });
    $('body').append($overlay);
    
    // Drawer
    const drawerHtml = `
        <div class="mg-grimoire" id="mg-grimoire" data-mg-theme="${theme}">
            <div class="mg-grimoire-inner">
                <div class="mg-grimoire-tabstrip">
                    ${TABS.map(tab => `
                        <button class="mg-grimoire-tab"
                                data-tab="${tab.id}"
                                data-active="${tab.id === currentTab}"
                                title="${tab.label}">
                            <i class="fa-solid ${tab.icon}"></i>
                        </button>
                    `).join('')}
                    
                    <button class="mg-grimoire-tab mg-grimoire-tab--close"
                            id="mg-grimoire-close"
                            title="Close Grimoire">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                
                <div class="mg-grimoire-page" id="mg-grimoire-page">
                    <div class="mg-grimoire-page-content" id="mg-page-content"></div>
                </div>
            </div>
            
            <div class="mg-grimoire-corner mg-grimoire-corner--tl"></div>
            <div class="mg-grimoire-corner mg-grimoire-corner--tr"></div>
            <div class="mg-grimoire-corner mg-grimoire-corner--bl"></div>
            <div class="mg-grimoire-corner mg-grimoire-corner--br"></div>
        </div>
    `;
    
    $('body').append(drawerHtml);
    
    // Tab click handlers
    $('.mg-grimoire-tab:not(.mg-grimoire-tab--close)').on('click', function() {
        const tabId = $(this).data('tab');
        if (tabId && tabId !== currentTab) {
            switchTab(tabId);
        }
    });
    
    // Close button
    $('#mg-grimoire-close').on('click', function(e) {
        e.stopPropagation();
        debug('Close button clicked');
        closeGrimoire();
    });
    
    // Escape key
    $(document).on('keydown.grimoire', function(e) {
        if (e.key === 'Escape' && isOpen) {
            closeGrimoire();
        }
    });
    
    // Load initial page
    loadPageContent(currentTab);
    
    debug('Drawer created');
}

// ══════════════════════════════════════════════
// OPEN / CLOSE / TOGGLE
// ══════════════════════════════════════════════

function openGrimoire() {
    if (isOpen) {
        debug('Already open');
        return;
    }
    
    debug('Opening...');
    
    const $drawer = $('#mg-grimoire');
    const $overlay = $('#mg-grimoire-overlay');
    const $compact = $('#mg-compact');
    
    if (!$drawer.length || !$overlay.length) {
        debug('ERROR: DOM missing');
        return;
    }
    
    // Transform flash on compact
    $compact.addClass('transforming');
    setTimeout(() => $compact.removeClass('transforming'), 400);
    
    // Hide compact
    $compact.css({
        'opacity': '0',
        'pointer-events': 'none'
    });
    
    // Show overlay + drawer
    $overlay.addClass('visible');
    $drawer.addClass('open');
    
    isOpen = true;
    debug('Opened!');
}

export function closeGrimoire() {
    if (!isOpen) {
        debug('Already closed');
        return;
    }
    
    debug('Closing...');
    
    const $drawer = $('#mg-grimoire');
    const $overlay = $('#mg-grimoire-overlay');
    
    $drawer.removeClass('open');
    $overlay.removeClass('visible');
    
    isOpen = false;
    
    // Show compact after animation
    setTimeout(showCompact, 300);
    
    debug('Closed!');
}

function toggleGrimoire() {
    debug(`Toggle (isOpen: ${isOpen})`);
    
    if (isOpen) {
        closeGrimoire();
    } else {
        openGrimoire();
    }
}

function showCompact() {
    const $compact = $('#mg-compact');
    if (!$compact.length) return;
    
    if (extensionSettings.showCompact === false) {
        $compact.hide();
        return;
    }
    
    $compact.css({
        'opacity': '1',
        'pointer-events': 'auto'
    });
}

// ══════════════════════════════════════════════
// TAB SWITCHING
// ══════════════════════════════════════════════

function switchTab(tabId) {
    debug(`Tab: ${tabId}`);
    
    // Update active states
    $('.mg-grimoire-tab').each(function() {
        $(this).attr('data-active', $(this).data('tab') === tabId ? 'true' : 'false');
    });
    
    const $page = $('#mg-page-content');
    $page.css('opacity', '0');
    
    setTimeout(() => {
        currentTab = tabId;
        loadPageContent(tabId);
        $page.css('opacity', '1');
    }, 150);
}

// ══════════════════════════════════════════════
// PAGE CONTENT
// ══════════════════════════════════════════════

function loadPageContent(tabId) {
    const $container = $('#mg-page-content');
    if (!$container.length) return;
    
    $container.html(getPageHTML(tabId));
    $container.scrollTop(0);
    bindPageActions(tabId);
}

function getPageHTML(tabId) {
    const pages = {
        tarot: `
            <div class="mg-page-section">
                <h3 class="mg-page-title">🎴 Tarot</h3>
                <p class="mg-page-flavor">"The cards know what you refuse to see."</p>
                <div class="mg-card-spread">
                    <div class="mg-card-slot">?</div>
                    <div class="mg-card-slot">?</div>
                    <div class="mg-card-slot">?</div>
                </div>
                <button class="mg-page-btn" id="mg-btn-draw-card">✦ Draw A Card</button>
            </div>
            <div class="mg-page-divider"></div>
            <div class="mg-page-section">
                <h4 class="mg-page-subtitle">Fate Queue</h4>
                <div class="mg-queue-list" id="mg-fate-queue">
                    <div class="mg-queue-empty">No cards in queue</div>
                </div>
            </div>
        `,
        
        crystal: `
            <div class="mg-page-section">
                <h3 class="mg-page-title">🔮 Crystal Ball</h3>
                <p class="mg-page-flavor">"Fate is not a request line."</p>
                <div class="mg-crystal-orb">
                    <div class="mg-crystal-sphere">
                        <div class="mg-crystal-mist"></div>
                    </div>
                </div>
                <button class="mg-page-btn" id="mg-btn-gaze">✧ Gaze Into The Mist</button>
            </div>
        `,
        
        ouija: `
            <div class="mg-page-section">
                <h3 class="mg-page-title">👻 Ouija</h3>
                <p class="mg-page-flavor">"Ask, and fate shall answer."</p>
                <input type="text" class="mg-ouija-input" id="mg-ouija-question"
                       placeholder="Ask a yes/no question...">
                <button class="mg-page-btn" id="mg-btn-ask-spirits">✦ Consult The Spirits</button>
            </div>
        `,
        
        nyx: `
            <div class="mg-page-section">
                <h3 class="mg-page-title">🐱 Nyx</h3>
                <div class="mg-nyx-portrait">😼</div>
                <div class="mg-nyx-mood">Mood: <strong>Neutral</strong></div>
                <p class="mg-text-dim">"I'm watching. Always watching."</p>
                <div class="mg-nyx-actions">
                    <button class="mg-nyx-btn" id="mg-btn-pet-nyx">🐾 Pet</button>
                    <button class="mg-nyx-btn" id="mg-btn-treat-nyx">🍬 Treat</button>
                </div>
            </div>
        `,
        
        spells: `
            <div class="mg-page-section">
                <h3 class="mg-page-title">✨ Spell Cards</h3>
                <p class="mg-page-flavor">"Visual magic. Pure vibes."</p>
                <button class="mg-page-btn" id="mg-btn-test-spell">✦ Test Random Spell</button>
            </div>
        `,
        
        settings: `
            <div class="mg-page-section">
                <h3 class="mg-page-title">⚙️ Settings</h3>
                <p class="mg-text-dim">Configuration coming soon.</p>
                <p class="mg-text-dim" style="margin-top:12px;">Petit Grimoire v6</p>
            </div>
        `,
    };
    
    return pages[tabId] || pages.tarot;
}

function bindPageActions(tabId) {
    // Tarot
    $('#mg-btn-draw-card').on('click', function() {
        debug('Draw card');
        toastr?.info('Card draw coming soon!', 'Tarot');
    });
    
    // Crystal ball
    $('#mg-btn-gaze').on('click', function() {
        debug('Crystal gaze');
        toastr?.info('Crystal ball coming soon!', 'Crystal Ball');
    });
    
    // Ouija
    $('#mg-btn-ask-spirits').on('click', function() {
        const q = $('#mg-ouija-question').val();
        debug('Ouija: ' + q);
        toastr?.info('Ouija coming soon!', 'Ouija');
    });
    
    // Nyx
    $('#mg-btn-pet-nyx').on('click', function() {
        debug('Pet Nyx');
        toastr?.info('"...Was that supposed to be pleasant?"', 'Nyx');
    });
    
    $('#mg-btn-treat-nyx').on('click', function() {
        debug('Treat Nyx');
        toastr?.info('"Acceptable."', 'Nyx');
    });
    
    // Spells
    $('#mg-btn-test-spell').on('click', function() {
        debug('Test spell');
        toastr?.info('Spell effects coming soon!', 'Spells');
    });
}

// ══════════════════════════════════════════════
// PUBLIC UTILITIES
// ══════════════════════════════════════════════

export function updateCompactBadge(count) {
    const $badge = $('#mg-compact-badge');
    if (!$badge.length) return;
    
    if (count > 0) {
        $badge.text(count).addClass('visible');
    } else {
        $badge.removeClass('visible');
    }
}

// ══════════════════════════════════════════════
// LEGACY EXPORTS (for compatibility)
// ══════════════════════════════════════════════

export function triggerTransformation() {
    toggleGrimoire();
}

export function openGrimoirePanel() {
    openGrimoire();
}
