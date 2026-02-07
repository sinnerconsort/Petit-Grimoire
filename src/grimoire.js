/**
 * Petit Grimoire — Compact FAB + Grimoire Drawer
 * Rebuild v1 — Clean shell
 *
 * Architecture:
 *   - Compact FAB: pixel art moon sprite, single click handler
 *   - Grimoire Drawer: right-slide panel, vertical tabstrip, parchment theme
 *   - Pages: empty shells with placeholder content, ready for feature plug-in
 *
 * Rules:
 *   ONE click handler per element (no double-binding)
 *   State derived from DOM (classList), never JS flags
 *   destroy() before create (idempotent)
 *   Namespaced jQuery events (.grimoire) for clean teardown
 */

import { extensionSettings } from './state.js';

// ══════════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════════

const DRAWER_TRANSITION_MS = 300;

const TABS = [
    { id: 'tarot',    icon: 'fa-layer-group',   label: 'Tarot' },
    { id: 'crystal',  icon: 'fa-circle',         label: 'Crystal Ball' },
    { id: 'ouija',    icon: 'fa-ghost',          label: 'Ouija' },
    { id: 'nyx',      icon: 'fa-cat',            label: 'Nyx' },
    { id: 'spells',   icon: 'fa-wand-sparkles',  label: 'Spells' },
    { id: 'settings', icon: 'fa-gear',           label: 'Settings' },
];

// ══════════════════════════════════════════════
// STATE — derived from DOM, never tracked as JS flag
// ══════════════════════════════════════════════

let currentTab = 'tarot';

function isOpen() {
    return document.getElementById('mg-grimoire')?.classList.contains('open') ?? false;
}

// ══════════════════════════════════════════════
// INIT / DESTROY
// ══════════════════════════════════════════════

export function initGrimoire() {
    console.log('[Grimoire] initGrimoire()');

    try {
        destroy();
        console.log('[Grimoire] destroy done');
    } catch (e) {
        console.error('[Grimoire] destroy failed:', e);
    }

    try {
        createCompact();
        console.log('[Grimoire] createCompact done');
    } catch (e) {
        console.error('[Grimoire] createCompact failed:', e);
        toastr?.error('createCompact failed: ' + e.message, 'Grimoire');
    }

    try {
        createDrawer();
        console.log('[Grimoire] createDrawer done');
    } catch (e) {
        console.error('[Grimoire] createDrawer failed:', e);
        toastr?.error('createDrawer failed: ' + e.message, 'Grimoire');
    }

    try {
        bindEvents();
        console.log('[Grimoire] bindEvents done');
    } catch (e) {
        console.error('[Grimoire] bindEvents failed:', e);
        toastr?.error('bindEvents failed: ' + e.message, 'Grimoire');
    }

    try {
        loadPageContent(currentTab);
        console.log('[Grimoire] loadPageContent done');
    } catch (e) {
        console.error('[Grimoire] loadPageContent failed:', e);
    }

    console.log('[Grimoire] ✅ Init complete');
}

function destroy() {
    // Remove all namespaced event handlers
    $(document).off('.grimoire');
    // Remove DOM elements
    $('#mg-compact').remove();
    $('#mg-grimoire').remove();
    $('#mg-grimoire-overlay').remove();
}

// ══════════════════════════════════════════════
// COMPACT FAB — pixel art moon sprite
// ══════════════════════════════════════════════

function createCompact() {
    const theme = extensionSettings.shellTheme || 'guardian';

    // Nuclear approach: create element directly, not via template string
    const fab = document.createElement('div');
    fab.id = 'mg-compact';
    fab.className = 'mg-fab mg-compact';
    fab.setAttribute('data-mg-theme', theme);
    
    // Inline everything — no CSS dependency at all
    Object.assign(fab.style, {
        position: 'fixed',
        bottom: '100px',
        right: '20px',
        zIndex: '999999',
        width: '80px',
        height: '80px',
        background: 'red',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '36px',
        cursor: 'pointer',
        border: '3px solid yellow',
        boxShadow: '0 0 20px red',
    });
    fab.textContent = '🌙';
    
    document.body.appendChild(fab);

    // Respect visibility setting
    if (extensionSettings.showCompact === false) {
        fab.style.display = 'none';
    }

    // Verification
    const exists = document.getElementById('mg-compact');
    const isVisible = exists ? getComputedStyle(exists).display !== 'none' : false;
    console.log(`[PetitGrimoire] FAB created: exists=${!!exists}, visible=${isVisible}, parent=${exists?.parentElement?.tagName}`);
    
    if (typeof toastr !== 'undefined') {
        toastr.success(`FAB: exists=${!!exists}, vis=${isVisible}`, 'Grimoire Debug', { timeOut: 5000 });
    }
}

// ══════════════════════════════════════════════
// DRAWER — parchment panel with vertical tabstrip
// ══════════════════════════════════════════════

function createDrawer() {
    const theme = extensionSettings.shellTheme || 'guardian';

    // Build tab buttons
    const tabsHTML = TABS.map(tab => `
        <button class="mg-grimoire-tab"
                data-tab="${tab.id}"
                data-active="${tab.id === currentTab}"
                title="${tab.label}">
            <i class="fa-solid ${tab.icon}"></i>
        </button>
    `).join('');

    // Overlay (click to close)
    $('body').append(`<div class="mg-grimoire-overlay" id="mg-grimoire-overlay"></div>`);

    // Drawer
    $('body').append(`
        <div class="mg-grimoire" id="mg-grimoire" data-mg-theme="${theme}">
            <div class="mg-grimoire-inner">
                <div class="mg-grimoire-tabstrip">
                    ${tabsHTML}
                    <div class="mg-grimoire-tab-spacer"></div>
                    <button class="mg-grimoire-tab mg-grimoire-tab--close"
                            id="mg-grimoire-close" title="Close">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div class="mg-grimoire-page">
                    <div class="mg-grimoire-page-content" id="mg-page-content"></div>
                </div>
            </div>
        </div>
    `);
}

// ══════════════════════════════════════════════
// EVENT BINDING — ONE handler per element, namespaced
// ══════════════════════════════════════════════

function bindEvents() {
    // Compact click → toggle drawer
    $('#mg-compact').on('click.grimoire', function (e) {
        e.preventDefault();
        e.stopPropagation();
        toggle();
    });

    // Overlay click → close
    $('#mg-grimoire-overlay').on('click.grimoire', close);

    // Close button
    $('#mg-grimoire-close').on('click.grimoire', function (e) {
        e.stopPropagation();
        close();
    });

    // Tab clicks — delegated from tabstrip (NOT per-button)
    $('.mg-grimoire-tabstrip').on('click.grimoire', '.mg-grimoire-tab:not(.mg-grimoire-tab--close)', function () {
        const tabId = $(this).data('tab');
        if (tabId && tabId !== currentTab) {
            switchTab(tabId);
        }
    });

    // Escape key
    $(document).on('keydown.grimoire', function (e) {
        if (e.key === 'Escape' && isOpen()) close();
    });

    // Stop drawer clicks from bubbling to overlay
    $('#mg-grimoire').on('click.grimoire', function (e) {
        e.stopPropagation();
    });
}

// ══════════════════════════════════════════════
// OPEN / CLOSE / TOGGLE
// ══════════════════════════════════════════════

function open() {
    if (isOpen()) return;

    // Transformation flash on compact
    const $compact = $('#mg-compact');
    $compact.addClass('transforming');
    setTimeout(() => $compact.removeClass('transforming'), 400);

    // Hide compact while drawer is open
    $compact.css({ opacity: 0, 'pointer-events': 'none' });

    // Show overlay + slide drawer in
    $('#mg-grimoire-overlay').addClass('visible');
    $('#mg-grimoire').addClass('open');
}

function close() {
    if (!isOpen()) return;

    $('#mg-grimoire').removeClass('open');
    $('#mg-grimoire-overlay').removeClass('visible');

    // Restore compact after transition completes
    setTimeout(showCompact, DRAWER_TRANSITION_MS);
}

export function closeGrimoire() { close(); }

function toggle() {
    if (isOpen()) close(); else open();
}

function showCompact() {
    const $compact = $('#mg-compact');
    if (!$compact.length) return;
    if (extensionSettings.showCompact === false) { $compact.hide(); return; }
    $compact.css({ opacity: 1, 'pointer-events': 'auto' });
}

// ══════════════════════════════════════════════
// TAB SWITCHING — with crossfade
// ══════════════════════════════════════════════

function switchTab(tabId) {
    // Update active states
    $('.mg-grimoire-tab').each(function () {
        $(this).attr('data-active', $(this).data('tab') === tabId ? 'true' : 'false');
    });

    // Fade content out, swap, fade in
    const $page = $('#mg-page-content');
    $page.css('opacity', '0');

    setTimeout(() => {
        currentTab = tabId;
        loadPageContent(tabId);
        $page.css('opacity', '1');
    }, 150);
}

// ══════════════════════════════════════════════
// PAGE CONTENT — empty shells for future features
// ══════════════════════════════════════════════

function loadPageContent(tabId) {
    const $c = $('#mg-page-content');
    if (!$c.length) return;
    $c.html(getPageHTML(tabId)).scrollTop(0);
    bindPageActions(tabId);
}

function getPageHTML(tabId) {
    const pages = {

        // ── TAROT ──────────────────────────────────
        tarot: `
            <div class="mg-page-section">
                <h3 class="mg-page-title">🎴 Tarot</h3>
                <p class="mg-page-flavor">"The cards know what you refuse to see."</p>

                <div class="mg-card-spread">
                    <div class="mg-card-slot">?</div>
                    <div class="mg-card-slot">?</div>
                    <div class="mg-card-slot">?</div>
                </div>
                <div class="mg-spread-labels">
                    <span>Past</span><span>Present</span><span>Future</span>
                </div>

                <div class="mg-btn-row">
                    <button class="mg-page-btn" id="mg-btn-draw">✦ Draw Three</button>
                    <button class="mg-page-btn mg-page-btn--secondary" id="mg-btn-draw-single">Draw One</button>
                </div>
            </div>

            <div class="mg-page-divider"></div>

            <div class="mg-page-section">
                <h4 class="mg-page-subtitle">Fate Queue</h4>
                <div id="mg-fate-queue">
                    <div class="mg-empty-state">No cards in queue</div>
                </div>
            </div>
        `,

        // ── CRYSTAL BALL ───────────────────────────
        crystal: `
            <div class="mg-page-section">
                <h3 class="mg-page-title">🔮 Crystal Ball</h3>
                <p class="mg-page-flavor">"The crystal doesn't negotiate. It doesn't care what I think. Or what you want."</p>

                <div class="mg-crystal-orb">
                    <div class="mg-crystal-sphere">
                        <div class="mg-crystal-mist"></div>
                        <div class="mg-crystal-mist mg-crystal-mist--2"></div>
                    </div>
                    <div class="mg-crystal-base"></div>
                </div>

                <button class="mg-page-btn" id="mg-btn-gaze">✧ Gaze Into The Crystal</button>
            </div>

            <div class="mg-page-divider"></div>

            <div class="mg-page-section">
                <h4 class="mg-page-subtitle">Visions</h4>
                <div id="mg-vision-log">
                    <div class="mg-empty-state">The crystal is silent...</div>
                </div>
            </div>
        `,

        // ── OUIJA ──────────────────────────────────
        ouija: `
            <div class="mg-page-section">
                <h3 class="mg-page-title">👻 Ouija</h3>
                <p class="mg-page-flavor">"The board only answers what it wishes to answer."</p>

                <div class="mg-ouija-board">
                    <div class="mg-ouija-letters">A B C D E F G H I J K L M</div>
                    <div class="mg-ouija-letters">N O P Q R S T U V W X Y Z</div>
                    <div class="mg-ouija-yes-no"><span>YES</span><span>NO</span></div>
                    <div class="mg-ouija-numbers">1 2 3 4 5 6 7 8 9 0</div>
                    <div class="mg-ouija-planchette">◈</div>
                    <div class="mg-ouija-goodbye">GOODBYE</div>
                </div>

                <input type="text" class="mg-ouija-input" id="mg-ouija-question"
                       placeholder="Ask a yes/no question..." autocomplete="off">
                <button class="mg-page-btn" id="mg-btn-ask">✦ Consult The Spirits</button>
            </div>

            <div class="mg-page-divider"></div>

            <div class="mg-page-section">
                <h4 class="mg-page-subtitle">Spirit Log</h4>
                <div id="mg-ouija-history">
                    <div class="mg-empty-state">The spirits await</div>
                </div>
            </div>
        `,

        // ── NYX ────────────────────────────────────
        nyx: `
            <div class="mg-page-section">
                <h3 class="mg-page-title">🐱 Nyx</h3>

                <div class="mg-nyx-portrait">😼</div>

                <div class="mg-nyx-mood">
                    Mood: <strong id="mg-nyx-mood-text">Neutral</strong>
                </div>

                <div class="mg-nyx-disposition-bar">
                    <div class="mg-nyx-disposition-fill" id="mg-nyx-disposition" style="width: 50%"></div>
                </div>

                <p class="mg-page-flavor">"I'm watching. Always watching."</p>

                <div class="mg-nyx-actions">
                    <button class="mg-nyx-btn" id="mg-btn-pet">🐾 Pet</button>
                    <button class="mg-nyx-btn" id="mg-btn-treat">🍬 Treat</button>
                    <button class="mg-nyx-btn" id="mg-btn-poke">👉 Poke</button>
                </div>
            </div>

            <div class="mg-page-divider"></div>

            <div class="mg-page-section">
                <h4 class="mg-page-subtitle">Nyx's Commentary</h4>
                <div id="mg-nyx-log">
                    <div class="mg-empty-state">She's being conspicuously silent...</div>
                </div>
            </div>
        `,

        // ── SPELLS ─────────────────────────────────
        spells: `
            <div class="mg-page-section">
                <h3 class="mg-page-title">✨ Spell Cards</h3>
                <p class="mg-page-flavor">"Purely atmospheric. Doesn't affect the story."</p>

                <div class="mg-spell-grid">
                    <div class="mg-spell-card" data-spell="ember">🔥<br>Ember</div>
                    <div class="mg-spell-card" data-spell="frost">❄️<br>Frost</div>
                    <div class="mg-spell-card" data-spell="tempest">🌪️<br>Tempest</div>
                    <div class="mg-spell-card" data-spell="shadow">🌑<br>Shadow</div>
                    <div class="mg-spell-card" data-spell="radiance">✨<br>Radiance</div>
                    <div class="mg-spell-card" data-spell="spark">⚡<br>Spark</div>
                    <div class="mg-spell-card" data-spell="torrent">💧<br>Torrent</div>
                    <div class="mg-spell-card" data-spell="mist">🌫️<br>Mist</div>
                </div>

                <button class="mg-page-btn mg-page-btn--secondary" id="mg-btn-test-spell">Test Random Spell</button>
            </div>

            <div class="mg-page-divider"></div>

            <div class="mg-page-section">
                <label class="mg-checkbox-label">
                    <input type="checkbox" checked disabled> Auto-trigger on keywords
                </label>
                <label class="mg-checkbox-label">
                    <input type="checkbox" disabled> Play sounds
                </label>
            </div>
        `,

        // ── SETTINGS ───────────────────────────────
        settings: `
            <div class="mg-page-section">
                <h3 class="mg-page-title">⚙️ Settings</h3>
                <p class="mg-page-flavor">Extension settings are in ST's Extensions panel.</p>
                <p class="mg-text-dim">In-grimoire config coming soon.</p>
            </div>

            <div class="mg-page-divider"></div>

            <div class="mg-page-section">
                <p class="mg-text-dim" style="text-align:center">
                    📖 Petit Grimoire v2.0<br>
                    <em>Rebuild — Clean Shell</em>
                </p>
            </div>
        `,
    };

    return pages[tabId] || pages.tarot;
}

/**
 * Bind interactive elements within each page.
 * These are placeholder toasts — swap for real logic later.
 */
function bindPageActions(tabId) {
    switch (tabId) {
        case 'tarot':
            $('#mg-btn-draw').on('click', () =>
                toastr?.info('Three-card spread — coming soon!', 'Tarot'));
            $('#mg-btn-draw-single').on('click', () =>
                toastr?.info('Single draw — coming soon!', 'Tarot'));
            break;

        case 'crystal':
            $('#mg-btn-gaze').on('click', () =>
                toastr?.info('Crystal gazing — coming soon!', 'Crystal Ball'));
            break;

        case 'ouija':
            $('#mg-btn-ask').on('click', () => {
                const q = $('#mg-ouija-question').val()?.trim();
                if (!q) { toastr?.warning('Ask a question first!', 'Ouija'); return; }
                toastr?.info(`"${q}" — spirits answering soon!`, 'Ouija');
                $('#mg-ouija-question').val('');
            });
            $('#mg-ouija-question').on('keydown', (e) => {
                if (e.key === 'Enter') { e.preventDefault(); $('#mg-btn-ask').trigger('click'); }
            });
            break;

        case 'nyx':
            $('#mg-btn-pet').on('click', () =>
                toastr?.info('"...Was that supposed to be pleasant?"', 'Nyx'));
            $('#mg-btn-treat').on('click', () =>
                toastr?.info('"Acceptable."', 'Nyx'));
            $('#mg-btn-poke').on('click', () =>
                toastr?.info('"What."', 'Nyx'));
            break;

        case 'spells':
            $('.mg-spell-card').on('click', function () {
                const spell = $(this).data('spell');
                toastr?.info(`${spell} effect — coming soon!`, 'Spells');
                $(this).addClass('mg-spell-card--flash');
                setTimeout(() => $(this).removeClass('mg-spell-card--flash'), 300);
            });
            $('#mg-btn-test-spell').on('click', () => {
                const spells = ['ember','frost','tempest','shadow','radiance','spark','torrent','mist'];
                const pick = spells[Math.floor(Math.random() * spells.length)];
                toastr?.info(`Random: ${pick}!`, 'Spells');
            });
            break;
    }
}

// ══════════════════════════════════════════════
// PUBLIC UTILITIES
// ══════════════════════════════════════════════

/**
 * Update the fate queue badge on the compact FAB.
 * Pass 0 to hide, >0 to show count.
 */
export function updateCompactBadge(count) {
    const $badge = $('#mg-compact-badge');
    if (!$badge.length) return;
    if (count > 0) {
        $badge.text(count).addClass('visible');
    } else {
        $badge.removeClass('visible').text('');
    }
}
