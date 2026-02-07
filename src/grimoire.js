/**
 * Petit Grimoire — Grimoire Drawer (WithTabs Edition)
 * Portrait single-page spellbook with 6 tabbed sections
 * Opens/closes via compact FAB tap
 *
 * Follows ST's own panel pattern:
 *   - Base state: hidden via CSS (opacity 0, pointer-events none)
 *   - Open:  addClass('is-open')
 *   - Close: removeClass('is-open'), addClass('is-closing')
 *            → animationend removes 'is-closing'
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
    $('#mg-grimoire-overlay').remove();
    $('#mg-grimoire').remove();

    createGrimoireDOM();
    setupEventListeners();
    console.log('[Grimoire] Ready — element in DOM:', $('#mg-grimoire').length > 0);
}

// ══════════════════════════════════════════════
// DOM CREATION
// ══════════════════════════════════════════════

function createGrimoireDOM() {
    // Overlay (dark backdrop)
    $('body').append('<div class="mg-grimoire-overlay" id="mg-grimoire-overlay"></div>');

    // Build tab buttons
    const tabsHTML = GRIMOIRE_TABS.map((tab, i) => `
        <button class="mg-grimoire-tab mg-grimoire-tab--${i + 1}"
                data-tab="${tab.id}"
                data-active="${tab.id === grimoireState.currentTab}"
                title="${tab.label}">
            <i class="fa-solid ${tab.icon}"></i>
        </button>
    `).join('');

    // Main grimoire container (hidden by default via CSS — no .is-open class)
    $('body').append(`
        <div class="mg-grimoire" id="mg-grimoire">
            <div class="mg-grimoire-book">
                <div class="mg-grimoire-anim" id="mg-grimoire-anim"></div>

                <div class="mg-grimoire-tabs">
                    ${tabsHTML}
                </div>

                <div class="mg-grimoire-close" id="mg-grimoire-close">
                    <i class="fa-solid fa-xmark"></i>
                </div>

                <div class="mg-grimoire-pages">
                    <div class="mg-grimoire-page-content" id="mg-page-content"></div>
                </div>
            </div>
        </div>
    `);

    // Load initial tab content
    loadPageContent(grimoireState.currentTab);
}

// ══════════════════════════════════════════════
// EVENT LISTENERS (delegated — survive DOM rebuilds)
// ══════════════════════════════════════════════

function setupEventListeners() {
    // Overlay click → close
    $(document).on('click.grimoire', '#mg-grimoire-overlay', () => {
        closeGrimoire();
    });

    // Close button → close
    $(document).on('click.grimoire', '#mg-grimoire-close', (e) => {
        e.stopPropagation();
        closeGrimoire();
    });

    // Tab clicks
    $(document).on('click.grimoire', '.mg-grimoire-tab', (e) => {
        const tabId = $(e.currentTarget).data('tab');
        if (tabId && tabId !== grimoireState.currentTab) {
            switchTab(tabId);
        }
    });

    // Escape key → close
    $(document).on('keydown.grimoire', (e) => {
        if (e.key === 'Escape' && grimoireState.isOpen) {
            closeGrimoire();
        }
    });
}

// ══════════════════════════════════════════════
// OPEN / CLOSE / TOGGLE
// Follows ST pattern: addClass/removeClass + animationend
// ══════════════════════════════════════════════

export function openGrimoire() {
    if (grimoireState.isOpen || grimoireState.isAnimating) return;

    const $grimoire = $('#mg-grimoire');
    const $overlay = $('#mg-grimoire-overlay');
    if ($grimoire.length === 0) return;

    grimoireState.isAnimating = true;

    // Show overlay
    $overlay.addClass('visible');

    // Open grimoire — CSS .is-open handles visibility + slide-in animation
    $grimoire.removeClass('is-closing').addClass('is-open');

    // Compact FAB feedback
    playTransformFlash();
    setCompactActive(true);

    grimoireState.isOpen = true;
    grimoireState.isAnimating = false;

    console.log('[Grimoire] Opened');
}

export function closeGrimoire() {
    if (!grimoireState.isOpen || grimoireState.isAnimating) return;

    const $grimoire = $('#mg-grimoire');
    const $overlay = $('#mg-grimoire-overlay');
    if ($grimoire.length === 0) return;

    grimoireState.isAnimating = true;

    // Trigger close animation (ST pattern)
    $grimoire.removeClass('is-open').addClass('is-closing');
    $overlay.removeClass('visible');

    // Clean up after animation completes
    $grimoire.one('animationend', () => {
        $grimoire.removeClass('is-closing');
        setCompactActive(false);
        grimoireState.isOpen = false;
        grimoireState.isAnimating = false;
        console.log('[Grimoire] Closed');
    });

    // Safety timeout if animationend doesn't fire
    setTimeout(() => {
        if (grimoireState.isAnimating) {
            $grimoire.removeClass('is-closing');
            setCompactActive(false);
            grimoireState.isOpen = false;
            grimoireState.isAnimating = false;
            console.log('[Grimoire] Closed (timeout fallback)');
        }
    }, 500);
}

export function toggleGrimoire() {
    grimoireState.isOpen ? closeGrimoire() : openGrimoire();
}

// ══════════════════════════════════════════════
// TAB SWITCHING
// ══════════════════════════════════════════════

function switchTab(tabId) {
    if (grimoireState.isAnimating || tabId === grimoireState.currentTab) return;

    // Update active states on tab buttons
    $('.mg-grimoire-tab').each(function () {
        $(this).attr('data-active', $(this).data('tab') === tabId ? 'true' : 'false');
    });

    // Quick crossfade on content
    const $content = $('#mg-page-content');
    $content.css('opacity', '0');

    setTimeout(() => {
        grimoireState.currentTab = tabId;
        loadPageContent(tabId);
        $content.css('opacity', '1');
    }, 120);
}

// ══════════════════════════════════════════════
// PAGE CONTENT (single column — portrait layout)
// ══════════════════════════════════════════════

function loadPageContent(tabId) {
    const $container = $('#mg-page-content');
    if ($container.length === 0) return;

    $container.html(getPageContent(tabId));
    $container.scrollTop(0);
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
                <button class="mg-page-btn" id="mg-btn-draw-card">✦ Draw a Card</button>
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
                <button class="mg-page-btn" id="mg-btn-gaze">✧ Gaze Into the Mist</button>
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
                        <span>YES</span><span>NO</span>
                    </div>
                    <input type="text" class="mg-ouija-input"
                           id="mg-ouija-question"
                           placeholder="Ask a yes/no question...">
                </div>
                <button class="mg-page-btn" id="mg-btn-ask-spirits">✦ Consult the Spirits</button>
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
                    <button class="mg-nyx-btn" id="mg-btn-pet-nyx">🐾 Pet</button>
                    <button class="mg-nyx-btn" id="mg-btn-treat-nyx">🍬 Treat</button>
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
                <button class="mg-page-btn" id="mg-btn-test-spell">✦ Test Random Spell</button>
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
                    mystical frequencies, and mood-reactive audio.
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
    $('#mg-btn-draw-card').on('click', () => console.log('[Grimoire] Draw card clicked'));
    $('#mg-btn-gaze').on('click', () => console.log('[Grimoire] Crystal ball gaze clicked'));
    $('#mg-btn-ask-spirits').on('click', () => {
        console.log('[Grimoire] Ouija question:', $('#mg-ouija-question').val());
    });
    $('#mg-btn-pet-nyx').on('click', () => console.log('[Grimoire] Pet Nyx clicked'));
    $('#mg-btn-treat-nyx').on('click', () => console.log('[Grimoire] Treat Nyx clicked'));
    $('#mg-btn-test-spell').on('click', () => console.log('[Grimoire] Test spell clicked'));
}

// ══════════════════════════════════════════════
// COMPACT FAB CALLBACKS
// ══════════════════════════════════════════════

/** Called by compact FAB on tap — toggles the grimoire. */
export function triggerTransformation() {
    toggleGrimoire();
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
