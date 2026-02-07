/**
 * Petit Grimoire — Drawer Edition v3
 * Right-side sliding panel matching ST's native drawer pattern.
 * Parchment-themed with vertical tab strip on left edge.
 *
 * FIX v3:
 *   - Self-loads its own CSS (no dependency on main.css @import chain)
 *   - Force-clears isAnimating on every open/close (never gets stuck)
 *   - Verifies DOM before class manipulation, recreates if missing
 *   - Restores compact if anything goes wrong
 */

import { extensionFolderPath } from './state.js';

// ══════════════════════════════════════════════
// TAB CONFIGURATION
// ══════════════════════════════════════════════

const GRIMOIRE_TABS = [
    { id: 'tarot',    icon: 'fa-layer-group',     label: 'Tarot' },
    { id: 'crystal',  icon: 'fa-circle',          label: 'Crystal Ball' },
    { id: 'ouija',    icon: 'fa-ghost',           label: 'Ouija' },
    { id: 'nyx',      icon: 'fa-cat',             label: 'Nyx' },
    { id: 'spells',   icon: 'fa-wand-sparkles',   label: 'Spells' },
    { id: 'radio',    icon: 'fa-tower-broadcast',  label: 'Radio' },
    { id: 'settings', icon: 'fa-gear',            label: 'Settings' },
];

// ══════════════════════════════════════════════
// STATE
// ══════════════════════════════════════════════

let grimoireState = {
    isOpen: false,
    currentTab: 'tarot',
    isAnimating: false,
};

// ══════════════════════════════════════════════
// CSS SELF-LOADING
// Ensures grimoire.css is loaded even if
// main.css @import chain breaks.
// ══════════════════════════════════════════════

function ensureCSS() {
    const id = 'petit-grimoire-drawer-css';
    if (document.getElementById(id)) return;

    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = `${extensionFolderPath}/styles/grimoire.css`;
    document.head.appendChild(link);
    console.log('[Grimoire] Self-loaded grimoire.css');
}

// ══════════════════════════════════════════════
// INITIALIZATION
// ══════════════════════════════════════════════

export function initGrimoire() {
    console.log('[Grimoire] Initializing drawer edition v3...');

    try {
        ensureCSS();
        createGrimoireDOM();
        setupEventListeners();
        console.log('[Grimoire] ✅ Ready');
    } catch (err) {
        console.error('[Grimoire] Init failed:', err);
        if (typeof toastr !== 'undefined') {
            toastr.error('Grimoire init failed: ' + err.message, 'Petit Grimoire');
        }
    }
}

// ══════════════════════════════════════════════
// DOM CREATION
// ══════════════════════════════════════════════

function createGrimoireDOM() {
    // Remove stale copies
    document.getElementById('mg-grimoire')?.remove();
    document.getElementById('mg-grimoire-overlay')?.remove();

    // Overlay (click-to-close backdrop)
    const overlay = document.createElement('div');
    overlay.className = 'mg-grimoire-overlay';
    overlay.id = 'mg-grimoire-overlay';
    document.body.appendChild(overlay);

    // Drawer panel
    const drawer = document.createElement('div');
    drawer.className = 'mg-grimoire';
    drawer.id = 'mg-grimoire';

    drawer.innerHTML = `
        <div class="mg-grimoire-inner">
            <!-- Vertical tab strip -->
            <div class="mg-grimoire-tabstrip">
                ${GRIMOIRE_TABS.map(tab => `
                    <button class="mg-grimoire-tab"
                            data-tab="${tab.id}"
                            data-active="${tab.id === grimoireState.currentTab}"
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

            <!-- Scrollable page content -->
            <div class="mg-grimoire-page" id="mg-grimoire-page">
                <div class="mg-grimoire-page-content" id="mg-page-content"></div>
            </div>
        </div>

        <!-- Corner flourishes -->
        <div class="mg-grimoire-corner mg-grimoire-corner--tl"></div>
        <div class="mg-grimoire-corner mg-grimoire-corner--tr"></div>
        <div class="mg-grimoire-corner mg-grimoire-corner--bl"></div>
        <div class="mg-grimoire-corner mg-grimoire-corner--br"></div>
    `;

    document.body.appendChild(drawer);

    // Verify
    if (!document.getElementById('mg-grimoire')) {
        console.error('[Grimoire] DOM creation failed!');
    }

    // Load initial page
    loadPageContent(grimoireState.currentTab);
}

// ══════════════════════════════════════════════
// EVENT LISTENERS
// ══════════════════════════════════════════════

let _escapeHandler = null;

function setupEventListeners() {
    // Overlay → close
    document.getElementById('mg-grimoire-overlay')?.addEventListener('click', closeGrimoire);

    // Close button
    document.getElementById('mg-grimoire-close')?.addEventListener('click', (e) => {
        e.stopPropagation();
        closeGrimoire();
    });

    // Tab clicks
    document.querySelectorAll('.mg-grimoire-tab:not(.mg-grimoire-tab--close)').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabId = e.currentTarget.dataset.tab;
            if (tabId && tabId !== grimoireState.currentTab) {
                switchTab(tabId);
            }
        });
    });

    // Escape key
    if (_escapeHandler) document.removeEventListener('keydown', _escapeHandler);
    _escapeHandler = (e) => {
        if (e.key === 'Escape' && grimoireState.isOpen) closeGrimoire();
    };
    document.addEventListener('keydown', _escapeHandler);
}

// ══════════════════════════════════════════════
// COMPACT VISIBILITY
// ══════════════════════════════════════════════

function hideCompact() {
    const el = document.getElementById('mg-compact');
    if (!el) return;
    el.style.setProperty('opacity', '0', 'important');
    el.style.setProperty('pointer-events', 'none', 'important');
    el.style.setProperty('transition', 'opacity 0.2s ease', 'important');
}

function showCompact() {
    const el = document.getElementById('mg-compact');
    if (!el) return;
    el.style.setProperty('opacity', '1', 'important');
    el.style.setProperty('pointer-events', 'auto', 'important');
    el.style.setProperty('transition', 'opacity 0.3s ease 0.1s', 'important');
}

// ══════════════════════════════════════════════
// OPEN / CLOSE
//
// CRITICAL: Force-clears isAnimating every time.
// Never gets stuck. Always restores compact on failure.
// ══════════════════════════════════════════════

export function openGrimoire() {
    console.log('[Grimoire] openGrimoire() — isOpen:', grimoireState.isOpen);

    // ALWAYS force-clear — never trust this flag
    grimoireState.isAnimating = false;

    if (grimoireState.isOpen) {
        console.log('[Grimoire] Already open, skipping');
        return;
    }

    let drawer = document.getElementById('mg-grimoire');
    let overlay = document.getElementById('mg-grimoire-overlay');

    // Recreate if missing
    if (!drawer || !overlay) {
        console.warn('[Grimoire] DOM missing — recreating');
        createGrimoireDOM();
        setupEventListeners();
        drawer = document.getElementById('mg-grimoire');
        overlay = document.getElementById('mg-grimoire-overlay');
    }

    // Final check — if still missing, bail and restore compact
    if (!drawer || !overlay) {
        console.error('[Grimoire] Cannot create DOM!');
        showCompact();
        return;
    }

    grimoireState.isAnimating = true;
    hideCompact();

    // Ensure CSS is loaded
    ensureCSS();

    // Force display
    drawer.style.removeProperty('display');

    // Show overlay + slide drawer in
    overlay.classList.add('visible');
    drawer.classList.add('open');

    console.log('[Grimoire] .open class added. classList:', drawer.className);

    // setTimeout — always fires, never gets stuck like animationend
    setTimeout(() => {
        grimoireState.isOpen = true;
        grimoireState.isAnimating = false;
        console.log('[Grimoire] ✅ Opened');
    }, 400);
}

export function closeGrimoire() {
    console.log('[Grimoire] closeGrimoire() — isOpen:', grimoireState.isOpen);

    // ALWAYS force-clear
    grimoireState.isAnimating = false;

    if (!grimoireState.isOpen) {
        // Even if state says closed, force DOM to match
        document.getElementById('mg-grimoire')?.classList.remove('open');
        document.getElementById('mg-grimoire-overlay')?.classList.remove('visible');
        showCompact();
        return;
    }

    const drawer = document.getElementById('mg-grimoire');
    const overlay = document.getElementById('mg-grimoire-overlay');
    if (!drawer || !overlay) {
        grimoireState.isOpen = false;
        showCompact();
        return;
    }

    grimoireState.isAnimating = true;

    drawer.classList.remove('open');
    overlay.classList.remove('visible');

    setTimeout(() => {
        grimoireState.isOpen = false;
        grimoireState.isAnimating = false;
        showCompact();
        console.log('[Grimoire] ✅ Closed');
    }, 400);
}

export function toggleGrimoire() {
    grimoireState.isOpen ? closeGrimoire() : openGrimoire();
}

// ══════════════════════════════════════════════
// TAB SWITCHING
// ══════════════════════════════════════════════

function switchTab(tabId) {
    if (tabId === grimoireState.currentTab) return;

    document.querySelectorAll('.mg-grimoire-tab').forEach(tab => {
        tab.dataset.active = tab.dataset.tab === tabId ? 'true' : 'false';
    });

    const page = document.getElementById('mg-page-content');
    if (page) {
        page.style.opacity = '0';
        setTimeout(() => {
            grimoireState.currentTab = tabId;
            loadPageContent(tabId);
            page.style.opacity = '1';
        }, 150);
    } else {
        grimoireState.currentTab = tabId;
        loadPageContent(tabId);
    }
}

// ══════════════════════════════════════════════
// PAGE CONTENT
// ══════════════════════════════════════════════

function loadPageContent(tabId) {
    const container = document.getElementById('mg-page-content');
    if (!container) return;
    container.innerHTML = getPageContent(tabId);
    container.scrollTop = 0;
    bindPageActions(tabId);
}

function getPageContent(tabId) {
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

                <button class="mg-page-btn" id="mg-btn-draw-card">
                    ✦ Draw a Card
                </button>
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

                <button class="mg-page-btn" id="mg-btn-gaze">
                    ✧ Gaze Into The Mist
                </button>

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
                <p class="mg-text-dim">
                    35 possible fates across 6 categories:
                    Fortunate, Unfortunate, Revelation,
                    Upheaval, Chaos, and Silence.
                </p>
            </div>
        `,

        ouija: `
            <div class="mg-page-section">
                <h3 class="mg-page-title">👻 Ouija</h3>
                <p class="mg-page-flavor">"Ask, and fate shall answer. Then make it true."</p>

                <div class="mg-ouija-mini">
                    <div class="mg-ouija-letters">A B C D E F G H I J K L M</div>
                    <div class="mg-ouija-letters">N O P Q R S T U V W X Y Z</div>
                    <div class="mg-ouija-yes-no">
                        <span>YES</span><span>NO</span>
                    </div>
                    <input type="text" class="mg-ouija-input"
                           id="mg-ouija-question"
                           placeholder="Ask a yes/no question...">
                </div>

                <button class="mg-page-btn" id="mg-btn-ask-spirits">
                    ✦ Consult The Spirits
                </button>
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
                <p class="mg-text-dim">
                    The ouija doesn't just predict—it plants.
                    Ask about feelings, and feelings stir.
                    The prophecy fulfills itself.
                </p>
            </div>
        `,

        nyx: `
            <div class="mg-page-section">
                <h3 class="mg-page-title">🐱 Nyx</h3>

                <div class="mg-nyx-portrait">😼</div>

                <div class="mg-nyx-mood" id="mg-nyx-mood">
                    Mood: <strong>Neutral</strong>
                </div>

                <div class="mg-nyx-disposition">
                    <div class="mg-nyx-disposition-fill" id="mg-nyx-bar" style="width: 50%"></div>
                </div>

                <p class="mg-text-dim" style="text-align:center;">
                    "I'm watching. Always watching."
                </p>
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
                <p class="mg-text-dim" style="margin-top:6px;">
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

                <button class="mg-page-btn" id="mg-btn-test-spell">
                    ✦ Test Random Spell
                </button>
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

        radio: `
            <div class="mg-page-section">
                <h3 class="mg-page-title">📻 Radio</h3>
                <p class="mg-page-flavor">"Tune in to the cosmic frequencies."</p>
                <p class="mg-text-dim">
                    Coming soon: Ambient soundscapes,
                    mystical frequencies, and mood-reactive audio.
                </p>
            </div>

            <div class="mg-page-divider"></div>

            <div class="mg-page-section">
                <h4 class="mg-page-subtitle">Stations</h4>
                <p class="mg-text-dim">
                    🌙 Moonlight Lounge<br>
                    🔮 Crystal Frequencies<br>
                    ⭐ Starbound Static<br>
                    🌸 Sakura Dreams
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
                <p class="mg-text-dim">
                    Petit Grimoire v0.3 — Drawer Edition
                </p>
            </div>
        `,
    };

    return pages[tabId] || pages.tarot;
}

function bindPageActions(tabId) {
    document.getElementById('mg-btn-draw-card')?.addEventListener('click', () => {
        console.log('[Grimoire] Draw card clicked');
    });
    document.getElementById('mg-btn-gaze')?.addEventListener('click', () => {
        console.log('[Grimoire] Crystal ball gaze clicked');
    });
    document.getElementById('mg-btn-ask-spirits')?.addEventListener('click', () => {
        const q = document.getElementById('mg-ouija-question')?.value;
        console.log('[Grimoire] Ouija question:', q);
    });
    document.getElementById('mg-btn-pet-nyx')?.addEventListener('click', () => {
        console.log('[Grimoire] Pet Nyx');
    });
    document.getElementById('mg-btn-treat-nyx')?.addEventListener('click', () => {
        console.log('[Grimoire] Treat Nyx');
    });
    document.getElementById('mg-btn-test-spell')?.addEventListener('click', () => {
        console.log('[Grimoire] Test spell');
    });
}

// ══════════════════════════════════════════════
// CALLBACK STUBS (index.js compatibility)
// ══════════════════════════════════════════════

export function triggerTransformation() {
    console.log('[Grimoire] Transformation triggered!');
    openGrimoire();
}

export function onDrawCard() {
    console.log('[Grimoire] Draw card from Nyxgotchi');
}

export function onViewQueue() {
    console.log('[Grimoire] View queue from Nyxgotchi');
}

export function onPokeNyx() {
    console.log('[Grimoire] Poke Nyx from Nyxgotchi');
}

// ══════════════════════════════════════════════
// EXPORTS
// ══════════════════════════════════════════════

export { grimoireState, GRIMOIRE_TABS };
