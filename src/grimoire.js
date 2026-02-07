/**
 * Petit Grimoire — Grimoire + Compact (Merged)
 * v5 - Single file, no cross-module state issues
 * 
 * The compact IS the grimoire's toggle button - they're one unit.
 * 
 * Exports:
 *   - initGrimoire()      → creates both compact + drawer
 *   - openGrimoire()      → slide drawer in
 *   - closeGrimoire()     → slide drawer out
 *   - toggleGrimoire()    → open if closed, close if open
 *   - updateCompactBadge(n) → set fate queue count
 */

import { extensionName, extensionSettings } from './state.js';
import { setupFabDrag, applyPosition } from './drag.js';

// ══════════════════════════════════════════════
// STATE (all in one place, no sync issues)
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
// DEBUG HELPER (toastr since no console on mobile)
// ══════════════════════════════════════════════

function debug(msg) {
    console.log(`[Grimoire] ${msg}`);
    // Uncomment for toastr debugging:
    // if (typeof toastr !== 'undefined') {
    //     toastr.info(msg, 'Grimoire', { timeOut: 1500 });
    // }
}

// ══════════════════════════════════════════════
// INITIALIZATION
// ══════════════════════════════════════════════

export function initGrimoire() {
    debug('Initializing...');
    
    try {
        createCompact();
        createDrawer();
        debug('✅ Ready');
    } catch (err) {
        console.error('[Grimoire] Init failed:', err);
        if (typeof toastr !== 'undefined') {
            toastr.error('Grimoire init failed: ' + err.message);
        }
    }
}

// ══════════════════════════════════════════════
// COMPACT CREATION
// ══════════════════════════════════════════════

function createCompact() {
    // Remove old
    $('#mg-compact').remove();
    
    const html = `
        <div class="mg-fab mg-compact" id="mg-compact"
             data-mg-theme="${extensionSettings.shellTheme || 'guardian'}"
             data-mg-size="${extensionSettings.compactSize || 'medium'}">
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
    
    const el = document.getElementById('mg-compact');
    if (!el) {
        debug('❌ Compact creation failed');
        return;
    }
    
    // Force visibility
    el.style.setProperty('position', 'fixed', 'important');
    el.style.setProperty('z-index', '99990', 'important');
    el.style.setProperty('display', 'flex', 'important');
    el.style.setProperty('visibility', 'visible', 'important');
    el.style.setProperty('opacity', '1', 'important');
    el.style.setProperty('pointer-events', 'auto', 'important');
    
    // Position
    applyPosition('mg-compact', 'compactPosition');
    
    // Drag + tap handler - THIS IS THE KEY: tap calls toggleGrimoire directly
    setupFabDrag('mg-compact', 'compact', 'compactPosition', () => {
        debug('Compact tapped');
        toggleGrimoire();
    });
    
    // Respect visibility setting
    if (extensionSettings.showCompact === false) {
        el.style.setProperty('display', 'none', 'important');
    }
    
    debug('Compact created');
}

// ══════════════════════════════════════════════
// DRAWER CREATION
// ══════════════════════════════════════════════

function createDrawer() {
    // Remove old
    $('#mg-grimoire').remove();
    $('#mg-grimoire-overlay').remove();
    
    // Overlay
    const overlay = document.createElement('div');
    overlay.className = 'mg-grimoire-overlay';
    overlay.id = 'mg-grimoire-overlay';
    overlay.addEventListener('click', closeGrimoire);
    document.body.appendChild(overlay);
    
    // Drawer
    const drawer = document.createElement('div');
    drawer.className = 'mg-grimoire';
    drawer.id = 'mg-grimoire';
    drawer.setAttribute('data-mg-theme', extensionSettings.shellTheme || 'guardian');
    
    drawer.innerHTML = `
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
    `;
    
    document.body.appendChild(drawer);
    
    // Tab click handlers
    drawer.querySelectorAll('.mg-grimoire-tab:not(.mg-grimoire-tab--close)').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabId = e.currentTarget.dataset.tab;
            if (tabId && tabId !== currentTab) {
                switchTab(tabId);
            }
        });
    });
    
    // Close button
    document.getElementById('mg-grimoire-close')?.addEventListener('click', (e) => {
        e.stopPropagation();
        closeGrimoire();
    });
    
    // Escape key
    document.addEventListener('keydown', (e) => {
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

export function openGrimoire() {
    if (isOpen) {
        debug('Already open');
        return;
    }
    
    debug('Opening...');
    
    const drawer = document.getElementById('mg-grimoire');
    const overlay = document.getElementById('mg-grimoire-overlay');
    const compact = document.getElementById('mg-compact');
    
    if (!drawer || !overlay) {
        debug('❌ DOM missing, recreating...');
        createDrawer();
        return openGrimoire();
    }
    
    // Hide compact
    if (compact) {
        compact.style.setProperty('opacity', '0', 'important');
        compact.style.setProperty('pointer-events', 'none', 'important');
    }
    
    // Show overlay + drawer
    overlay.classList.add('visible');
    drawer.classList.add('open');
    
    isOpen = true;
    debug('✅ Opened');
}

export function closeGrimoire() {
    if (!isOpen) {
        debug('Already closed');
        // Still ensure everything is in closed state
        document.getElementById('mg-grimoire')?.classList.remove('open');
        document.getElementById('mg-grimoire-overlay')?.classList.remove('visible');
        showCompact();
        return;
    }
    
    debug('Closing...');
    
    const drawer = document.getElementById('mg-grimoire');
    const overlay = document.getElementById('mg-grimoire-overlay');
    
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('visible');
    
    isOpen = false;
    
    // Show compact after animation
    setTimeout(showCompact, 300);
    
    debug('✅ Closed');
}

export function toggleGrimoire() {
    debug(`Toggle called (isOpen: ${isOpen})`);
    
    if (isOpen) {
        closeGrimoire();
    } else {
        // Play transform flash on compact
        const compact = document.getElementById('mg-compact');
        if (compact) {
            compact.classList.add('transforming');
            setTimeout(() => compact.classList.remove('transforming'), 400);
        }
        openGrimoire();
    }
}

function showCompact() {
    const compact = document.getElementById('mg-compact');
    if (!compact) return;
    
    if (extensionSettings.showCompact === false) {
        compact.style.setProperty('display', 'none', 'important');
        return;
    }
    
    compact.style.setProperty('opacity', '1', 'important');
    compact.style.setProperty('pointer-events', 'auto', 'important');
}

// ══════════════════════════════════════════════
// TAB SWITCHING
// ══════════════════════════════════════════════

function switchTab(tabId) {
    debug(`Switching to tab: ${tabId}`);
    
    // Update active states
    document.querySelectorAll('.mg-grimoire-tab').forEach(tab => {
        tab.dataset.active = tab.dataset.tab === tabId ? 'true' : 'false';
    });
    
    const page = document.getElementById('mg-page-content');
    if (page) {
        page.style.opacity = '0';
        setTimeout(() => {
            currentTab = tabId;
            loadPageContent(tabId);
            page.style.opacity = '1';
        }, 150);
    } else {
        currentTab = tabId;
        loadPageContent(tabId);
    }
}

// ══════════════════════════════════════════════
// PAGE CONTENT
// ══════════════════════════════════════════════

function loadPageContent(tabId) {
    const container = document.getElementById('mg-page-content');
    if (!container) return;
    
    container.innerHTML = getPageHTML(tabId);
    container.scrollTop = 0;
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
                <div class="mg-queue-footer">Cards trigger on story beats</div>
            </div>
            <div class="mg-page-divider"></div>
            <div class="mg-page-section">
                <h4 class="mg-page-subtitle">Last Reading</h4>
                <div class="mg-last-reading">
                    <div class="mg-mini-card">—</div>
                    <div class="mg-last-reading-info">
                        <div>No reading yet</div>
                        <div class="mg-text-dim">Draw your first card</div>
                    </div>
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
                        <div class="mg-crystal-mist mg-crystal-mist--2"></div>
                    </div>
                    <div class="mg-crystal-base"></div>
                </div>
                <button class="mg-page-btn" id="mg-btn-gaze">✧ Gaze Into The Mist</button>
                <p class="mg-text-dim" style="text-align:center; margin-top:4px;">
                    Wild magic. No control. No refunds.
                </p>
            </div>
            <div class="mg-page-divider"></div>
            <div class="mg-page-section">
                <h4 class="mg-page-subtitle">Recent Visions</h4>
                <div class="mg-vision-log" id="mg-vision-log">
                    <p class="mg-text-dim">The mists are clear...</p>
                </div>
            </div>
            <div class="mg-page-divider"></div>
            <div class="mg-page-section">
                <h4 class="mg-page-subtitle">Effect Pool</h4>
                <p class="mg-text-dim">35 possible fates across 6 categories: Fortunate, Unfortunate, Revelation, Upheaval, Chaos, and Silence.</p>
            </div>
        `,
        
        ouija: `
            <div class="mg-page-section">
                <h3 class="mg-page-title">👻 Ouija</h3>
                <p class="mg-page-flavor">"Ask, and fate shall answer. Then make it true."</p>
                <div class="mg-ouija-mini">
                    <div class="mg-ouija-letters">A B C D E F G H I J K L M</div>
                    <div class="mg-ouija-letters">N O P Q R S T U V W X Y Z</div>
                    <div class="mg-ouija-yes-no"><span>YES</span><span>NO</span></div>
                    <input type="text" class="mg-ouija-input" id="mg-ouija-question"
                           placeholder="Ask a yes/no question...">
                </div>
                <button class="mg-page-btn" id="mg-btn-ask-spirits">✦ Consult The Spirits</button>
            </div>
            <div class="mg-page-divider"></div>
            <div class="mg-page-section">
                <h4 class="mg-page-subtitle">Spirit Answers</h4>
                <div class="mg-ouija-history" id="mg-ouija-history">
                    <p class="mg-text-dim">The board is silent...</p>
                </div>
            </div>
            <div class="mg-page-divider"></div>
            <div class="mg-page-section">
                <h4 class="mg-page-subtitle">How It Works</h4>
                <p class="mg-text-dim">The ouija doesn't just predict—it plants. Ask about feelings, and feelings stir. The prophecy fulfills itself.</p>
            </div>
        `,
        
        nyx: `
            <div class="mg-page-section">
                <h3 class="mg-page-title">🐱 Nyx</h3>
                <div class="mg-nyx-portrait">😼</div>
                <div class="mg-nyx-mood" id="mg-nyx-mood">Mood: <strong>Neutral</strong></div>
                <div class="mg-nyx-disposition">
                    <div class="mg-nyx-disposition-fill" id="mg-nyx-bar" style="width: 50%"></div>
                </div>
                <p class="mg-text-dim" style="text-align:center;">"I'm watching. Always watching."</p>
            </div>
            <div class="mg-page-divider"></div>
            <div class="mg-page-section">
                <h4 class="mg-page-subtitle">Familiar Actions</h4>
                <div class="mg-nyx-actions">
                    <button class="mg-nyx-btn" id="mg-btn-pet-nyx">🐾 Pet</button>
                    <button class="mg-nyx-btn" id="mg-btn-treat-nyx">🍬 Treat</button>
                </div>
            </div>
            <div class="mg-page-divider"></div>
            <div class="mg-page-section">
                <h4 class="mg-page-subtitle">Disposition Effects</h4>
                <p class="mg-text-dim">
                    Keep Nyx entertained and your luck improves.
                    Bore her and the cards turn against you.
                </p>
                <p class="mg-text-dim" style="margin-top:8px;">
                    She enjoys: Drama, embarrassment, romantic tension, conflict.
                </p>
            </div>
        `,
        
        spells: `
            <div class="mg-page-section">
                <h3 class="mg-page-title">✨ Spell Cards</h3>
                <p class="mg-page-flavor">"Visual magic. No story impact—just vibes."</p>
                <p class="mg-text-dim">
                    Spell cards trigger automatically when keywords
                    appear in the story. Pure atmosphere.
                </p>
                <button class="mg-page-btn" id="mg-btn-test-spell">✦ Test Random Spell</button>
            </div>
            <div class="mg-page-divider"></div>
            <div class="mg-page-section">
                <h4 class="mg-page-subtitle">Active Spells</h4>
                <p class="mg-text-dim">
                    🔥 Ember — fire, flame, burn<br>
                    ❄️ Frost — cold, ice, freeze<br>
                    ⚡ Spark — lightning, shock<br>
                    🌊 Torrent — water, rain, flood<br>
                    🌑 Shadow — dark, night, shadow<br>
                    ✨ Radiance — light, glow, shine
                </p>
            </div>
        `,
        
        settings: `
            <div class="mg-page-section">
                <h3 class="mg-page-title">⚙️ Settings</h3>
                <p class="mg-text-dim">Configuration options coming soon.</p>
                <h4 class="mg-page-subtitle" style="margin-top:12px;">Planned</h4>
                <p class="mg-text-dim">
                    • Nyx chattiness level<br>
                    • Card queue size<br>
                    • Auto-trigger settings<br>
                    • Sound volume<br>
                    • Visual effects toggle
                </p>
            </div>
            <div class="mg-page-divider"></div>
            <div class="mg-page-section">
                <h4 class="mg-page-subtitle">About</h4>
                <p class="mg-text-dim">Petit Grimoire v5 — Merged Edition</p>
            </div>
        `,
    };
    
    return pages[tabId] || pages.tarot;
}

function bindPageActions(tabId) {
    // Tarot
    document.getElementById('mg-btn-draw-card')?.addEventListener('click', () => {
        debug('Draw card clicked');
        if (typeof toastr !== 'undefined') {
            toastr.info('Card draw coming soon!', 'Tarot');
        }
    });
    
    // Crystal ball
    document.getElementById('mg-btn-gaze')?.addEventListener('click', () => {
        debug('Crystal ball gaze');
        if (typeof toastr !== 'undefined') {
            toastr.info('Crystal ball coming soon!', 'Crystal Ball');
        }
    });
    
    // Ouija
    document.getElementById('mg-btn-ask-spirits')?.addEventListener('click', () => {
        const q = document.getElementById('mg-ouija-question')?.value;
        debug('Ouija: ' + q);
        if (typeof toastr !== 'undefined') {
            toastr.info('Ouija coming soon!', 'Ouija');
        }
    });
    
    // Nyx
    document.getElementById('mg-btn-pet-nyx')?.addEventListener('click', () => {
        debug('Pet Nyx');
        if (typeof toastr !== 'undefined') {
            toastr.info('"...Was that supposed to be pleasant?"', 'Nyx');
        }
    });
    
    document.getElementById('mg-btn-treat-nyx')?.addEventListener('click', () => {
        debug('Treat Nyx');
        if (typeof toastr !== 'undefined') {
            toastr.info('"Acceptable."', 'Nyx');
        }
    });
    
    // Spells
    document.getElementById('mg-btn-test-spell')?.addEventListener('click', () => {
        debug('Test spell');
        if (typeof toastr !== 'undefined') {
            toastr.info('Spell effects coming soon!', 'Spells');
        }
    });
}

// ══════════════════════════════════════════════
// PUBLIC UTILITIES
// ══════════════════════════════════════════════

/**
 * Update the queue badge on the compact FAB
 */
export function updateCompactBadge(count) {
    const badge = document.getElementById('mg-compact-badge');
    if (!badge) return;
    
    if (count > 0) {
        badge.textContent = count;
        badge.classList.add('visible');
    } else {
        badge.classList.remove('visible');
    }
}

/**
 * Get current state (for debugging)
 */
export function getState() {
    return { isOpen, currentTab };
}

// ══════════════════════════════════════════════
// LEGACY EXPORTS (for index.js compatibility)
// ══════════════════════════════════════════════

export function triggerTransformation() {
    toggleGrimoire();
}

export function onDrawCard() {
    debug('onDrawCard stub');
}

export function onViewQueue() {
    debug('onViewQueue stub');
}

export function onPokeNyx() {
    debug('onPokeNyx stub');
}
