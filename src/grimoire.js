/**
 * Petit Grimoire — Grimoire Drawer (WithTabs Edition)
 * Portrait single-page spellbook with 6 tabbed sections
 * Opens/closes via compact FAB tap with CSS slide animations
 */

import { setCompactActive, playTransformFlash } from './compact.js';

// ══════════════════════════════════════════════
// TAB CONFIGURATION (6 tabs — matches sprite)
// ══════════════════════════════════════════════

const GRIMOIRE_TABS = [
    { id: 'tarot',   icon: 'fa-layer-group',     label: 'Tarot' },
    { id: 'crystal', icon: 'fa-circle',           label: 'Crystal Ball' },
    { id: 'ouija',   icon: 'fa-ghost',            label: 'Ouija' },
    { id: 'nyx',     icon: 'fa-cat',              label: 'Nyx' },
    { id: 'spells',  icon: 'fa-wand-sparkles',    label: 'Spell Cards' },
    { id: 'radio',   icon: 'fa-tower-broadcast',  label: 'Radio' },
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
// INITIALIZATION
// ══════════════════════════════════════════════

export function initGrimoire() {
    console.log('[Grimoire] Initializing drawer edition...');

    // Clean up any previous instance
    document.getElementById('mg-grimoire-overlay')?.remove();
    document.getElementById('mg-grimoire')?.remove();

    createGrimoireDOM();
    setupEventListeners();
    console.log('[Grimoire] Ready!');
}

// ══════════════════════════════════════════════
// DOM CREATION
// ══════════════════════════════════════════════

function createGrimoireDOM() {
    // Overlay (dark backdrop, click to close)
    const overlay = document.createElement('div');
    overlay.className = 'mg-grimoire-overlay';
    overlay.id = 'mg-grimoire-overlay';
    document.body.appendChild(overlay);

    // Main container (hidden by default, CSS positions it)
    const grimoire = document.createElement('div');
    grimoire.className = 'mg-grimoire';
    grimoire.id = 'mg-grimoire';
    grimoire.style.display = 'none';

    grimoire.innerHTML = `
        <div class="mg-grimoire-book">
            <!-- Animation layer (CSS crossfade for tab switches) -->
            <div class="mg-grimoire-anim" id="mg-grimoire-anim"></div>

            <!-- Tab icons — positioned over the 6 sprite tab shapes -->
            <div class="mg-grimoire-tabs">
                ${GRIMOIRE_TABS.map((tab, i) => `
                    <button class="mg-grimoire-tab mg-grimoire-tab--${i + 1}"
                            data-tab="${tab.id}"
                            data-active="${tab.id === grimoireState.currentTab}"
                            title="${tab.label}">
                        <i class="fa-solid ${tab.icon}"></i>
                    </button>
                `).join('')}
            </div>

            <!-- Close button (top-right of parchment) -->
            <div class="mg-grimoire-close" id="mg-grimoire-close">
                <i class="fa-solid fa-xmark"></i>
            </div>

            <!-- Single scrollable page content -->
            <div class="mg-grimoire-pages">
                <div class="mg-grimoire-page-content" id="mg-page-content"></div>
            </div>
        </div>
    `;

    document.body.appendChild(grimoire);

    // Load initial tab content
    loadPageContent(grimoireState.currentTab);
}

// ══════════════════════════════════════════════
// EVENT LISTENERS
// ══════════════════════════════════════════════

function setupEventListeners() {
    // Overlay click → close
    document.getElementById('mg-grimoire-overlay')
        ?.addEventListener('click', closeGrimoire);

    // Close button → close
    document.getElementById('mg-grimoire-close')
        ?.addEventListener('click', (e) => {
            e.stopPropagation();
            closeGrimoire();
        });

    // Tab clicks
    document.querySelectorAll('.mg-grimoire-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabId = e.currentTarget.dataset.tab;
            if (tabId && tabId !== grimoireState.currentTab) {
                switchTab(tabId);
            }
        });
    });

    // Escape key → close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && grimoireState.isOpen) {
            closeGrimoire();
        }
    });
}

// ══════════════════════════════════════════════
// OPEN / CLOSE / TOGGLE
// ══════════════════════════════════════════════

export function openGrimoire() {
    if (grimoireState.isOpen || grimoireState.isAnimating) return;

    const grimoire = document.getElementById('mg-grimoire');
    const overlay = document.getElementById('mg-grimoire-overlay');
    if (!grimoire || !overlay) return;

    grimoireState.isAnimating = true;

    // Show overlay with fade-in
    overlay.style.display = 'block';
    requestAnimationFrame(() => overlay.classList.add('visible'));

    // Show grimoire with slide-in animation
    grimoire.classList.remove('mg-grimoire-closing');
    grimoire.classList.remove('mg-grimoire-opening');
    grimoire.style.display = 'block';

    // Force reflow so animation replays
    void grimoire.offsetWidth;
    grimoire.classList.add('mg-grimoire-opening');

    // Compact FAB feedback
    playTransformFlash();
    setCompactActive(true);

    grimoireState.isOpen = true;
    grimoireState.isAnimating = false;
}

export function closeGrimoire() {
    if (!grimoireState.isOpen || grimoireState.isAnimating) return;

    const grimoire = document.getElementById('mg-grimoire');
    const overlay = document.getElementById('mg-grimoire-overlay');
    if (!grimoire || !overlay) return;

    grimoireState.isAnimating = true;

    // Trigger CSS slide-out animation
    grimoire.classList.remove('mg-grimoire-opening');
    grimoire.classList.add('mg-grimoire-closing');

    // Fade out overlay
    overlay.classList.remove('visible');

    // After animation completes, actually hide elements
    setTimeout(() => {
        grimoire.style.display = 'none';
        grimoire.classList.remove('mg-grimoire-closing');
        overlay.style.display = 'none';

        setCompactActive(false);
        grimoireState.isOpen = false;
        grimoireState.isAnimating = false;
    }, 250); // matches grimoire-slide-out duration in CSS
}

export function toggleGrimoire() {
    if (grimoireState.isOpen) {
        closeGrimoire();
    } else {
        openGrimoire();
    }
}

// ══════════════════════════════════════════════
// TAB SWITCHING (CSS crossfade, no sprite anim)
// ══════════════════════════════════════════════

function switchTab(tabId) {
    if (grimoireState.isAnimating || tabId === grimoireState.currentTab) return;

    grimoireState.isAnimating = true;

    // Update active states on tab buttons
    document.querySelectorAll('.mg-grimoire-tab').forEach(tab => {
        tab.dataset.active = tab.dataset.tab === tabId ? 'true' : 'false';
    });

    // Play crossfade
    const anim = document.getElementById('mg-grimoire-anim');
    if (anim) {
        anim.className = 'mg-grimoire-anim';
        void anim.offsetWidth; // force reflow
        anim.classList.add('mg-anim-page-fade');
    }

    // Swap content after brief delay
    setTimeout(() => {
        grimoireState.currentTab = tabId;
        loadPageContent(tabId);
        grimoireState.isAnimating = false;
    }, 150);
}

// ══════════════════════════════════════════════
// PAGE CONTENT (single column — portrait layout)
// ══════════════════════════════════════════════

function loadPageContent(tabId) {
    const container = document.getElementById('mg-page-content');
    if (!container) return;

    container.innerHTML = getPageContent(tabId);

    // Scroll to top on tab switch
    container.scrollTop = 0;

    // Rebind interactive elements
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

            <div class="mg-page-section">
                <h4 class="mg-page-subtitle">Fate Queue</h4>
                <div class="mg-queue-list" id="mg-fate-queue">
                    <div class="mg-queue-empty">No cards in queue</div>
                </div>
                <div class="mg-queue-footer">Cards trigger on story beats</div>
            </div>

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
                    ✧ Gaze Into the Mist
                </button>

                <p class="mg-text-dim" style="text-align:center; margin-top:8px;">
                    Wild magic. No control. No refunds.
                </p>
            </div>

            <div class="mg-page-section">
                <h4 class="mg-page-subtitle">Recent Visions</h4>
                <div class="mg-vision-log" id="mg-vision-log">
                    <div class="mg-queue-empty">The mists are clear...</div>
                </div>
            </div>

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
                        <span>YES</span>
                        <span>NO</span>
                    </div>
                    <input type="text" class="mg-ouija-input"
                           id="mg-ouija-question"
                           placeholder="Ask a yes/no question...">
                </div>

                <button class="mg-page-btn" id="mg-btn-ask-spirits">
                    ✦ Consult the Spirits
                </button>
            </div>

            <div class="mg-page-section">
                <h4 class="mg-page-subtitle">Spirit Answers</h4>
                <div class="mg-ouija-history" id="mg-ouija-history">
                    <div class="mg-queue-empty">The board is silent...</div>
                </div>
            </div>

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

            <div class="mg-page-section">
                <h4 class="mg-page-subtitle">Familiar Actions</h4>

                <div class="mg-nyx-actions">
                    <button class="mg-nyx-btn" id="mg-btn-pet-nyx">
                        🐾 Pet
                    </button>
                    <button class="mg-nyx-btn" id="mg-btn-treat-nyx">
                        🍬 Treat
                    </button>
                </div>
            </div>

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
                    mystical frequencies, and
                    mood-reactive audio.
                </p>
            </div>

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
    };

    return pages[tabId] || pages.tarot;
}

// ══════════════════════════════════════════════
// PAGE ACTION BINDINGS
// ══════════════════════════════════════════════

function bindPageActions(tabId) {
    // Tarot
    document.getElementById('mg-btn-draw-card')
        ?.addEventListener('click', () => {
            console.log('[Grimoire] Draw card clicked');
            // TODO: Implement card drawing
        });

    // Crystal Ball
    document.getElementById('mg-btn-gaze')
        ?.addEventListener('click', () => {
            console.log('[Grimoire] Crystal ball gaze clicked');
            // TODO: Implement crystal ball
        });

    // Ouija
    document.getElementById('mg-btn-ask-spirits')
        ?.addEventListener('click', () => {
            const question = document.getElementById('mg-ouija-question')?.value;
            console.log('[Grimoire] Ouija question:', question);
            // TODO: Implement ouija
        });

    // Nyx
    document.getElementById('mg-btn-pet-nyx')
        ?.addEventListener('click', () => {
            console.log('[Grimoire] Pet Nyx clicked');
            // TODO: Implement nyx interaction
        });

    document.getElementById('mg-btn-treat-nyx')
        ?.addEventListener('click', () => {
            console.log('[Grimoire] Treat Nyx clicked');
            // TODO: Implement nyx interaction
        });

    // Spells
    document.getElementById('mg-btn-test-spell')
        ?.addEventListener('click', () => {
            console.log('[Grimoire] Test spell clicked');
            // TODO: Implement spell test
        });
}

// ══════════════════════════════════════════════
// COMPACT FAB CALLBACKS
// ══════════════════════════════════════════════

/**
 * Called by compact FAB on tap — toggles the grimoire open/closed.
 */
export function triggerTransformation() {
    toggleGrimoire();
}

/** Quick-draw a card from the nyxgotchi */
export function onDrawCard() {
    console.log('[Grimoire] Draw card from Nyxgotchi');
    // TODO: Quick draw a card
}

/** View the fate queue from the nyxgotchi */
export function onViewQueue() {
    console.log('[Grimoire] View queue from Nyxgotchi');
    // TODO: Show queue preview
}

/** Poke Nyx from the nyxgotchi */
export function onPokeNyx() {
    console.log('[Grimoire] Poke Nyx from Nyxgotchi');
    // TODO: Nyx reaction
}

// ══════════════════════════════════════════════
// EXPORTS
// ══════════════════════════════════════════════

export {
    grimoireState,
    GRIMOIRE_TABS,
};
