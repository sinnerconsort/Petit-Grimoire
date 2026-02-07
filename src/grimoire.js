/**
 * Petit Grimoire — Drawer Edition v4 (Nuclear)
 * 
 * ZERO IMPORTS. Injects its own critical CSS inline.
 * The drawer WILL appear even if every external CSS file fails.
 *
 * Changes from v3:
 *   - Removed all imports (was breaking module loading)
 *   - Injects critical CSS as <style> tag (no file dependencies)
 *   - toastr debug breadcrumbs for mobile debugging
 *   - Force-clears isAnimating on every open/close
 *   - Restores compact if anything goes wrong
 */

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
// CRITICAL CSS — injected as <style> tag
// This guarantees the drawer renders even if
// grimoire.css never loads via @import chain.
// ══════════════════════════════════════════════

function injectCriticalCSS() {
    if (document.getElementById('mg-grimoire-critical-css')) return;

    const style = document.createElement('style');
    style.id = 'mg-grimoire-critical-css';
    style.textContent = `
        /* ── Overlay ── */
        .mg-grimoire-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.45);
            z-index: 99998;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
        }
        .mg-grimoire-overlay.visible {
            opacity: 1;
            pointer-events: auto;
        }

        /* ── Drawer ── */
        .mg-grimoire {
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            z-index: 99999;
            width: 380px;
            max-width: 95vw;
            transform: translateX(100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            background:
                repeating-linear-gradient(0deg,
                    transparent, transparent 28px,
                    rgba(139,90,43,0.03) 28px, rgba(139,90,43,0.03) 29px),
                linear-gradient(135deg, #f5e6d3 0%, #e8d5bc 50%, #f5e6d3 100%);
            box-shadow:
                -4px 0 16px rgba(0,0,0,0.3),
                -1px 0 0 #b8956a,
                inset 2px 0 8px rgba(139,90,43,0.15);
            pointer-events: auto;
            overflow: hidden;
        }
        .mg-grimoire.open {
            transform: translateX(0) !important;
        }

        /* ── Inner layout ── */
        .mg-grimoire-inner {
            display: flex;
            height: 100%;
            width: 100%;
        }

        /* ── Tab strip ── */
        .mg-grimoire-tabstrip {
            flex: 0 0 44px;
            width: 44px;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 8px 0;
            gap: 2px;
            background: linear-gradient(180deg, #d4b896 0%, #c4a880 50%, #d4b896 100%);
            border-right: 2px solid #b8956a;
            box-shadow: inset -2px 0 4px rgba(0,0,0,0.1);
        }

        /* ── Tab buttons ── */
        .mg-grimoire-tab {
            width: 36px;
            height: 36px;
            border: none;
            border-radius: 6px;
            background: transparent;
            cursor: pointer;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #7a6858;
            font-size: 14px;
            transition: all 0.15s ease;
            position: relative;
        }
        .mg-grimoire-tab:hover {
            background: rgba(139,90,43,0.15);
            color: #8b5a2b;
        }
        .mg-grimoire-tab[data-active="true"] {
            background: #f5e6d3;
            color: #8b5a2b;
            box-shadow: 0 1px 3px rgba(0,0,0,0.12),
                        inset 0 0 0 1px rgba(139,90,43,0.15);
        }
        .mg-grimoire-tab[data-active="true"]::after {
            content: '';
            position: absolute;
            right: 3px;
            top: 50%;
            transform: translateY(-50%);
            width: 4px;
            height: 4px;
            background: #8b5a2b;
            border-radius: 50%;
        }
        .mg-grimoire-tab--close {
            margin-top: auto;
            color: #7a6858;
        }
        .mg-grimoire-tab--close:hover {
            background: rgba(180,60,60,0.15);
            color: #a04040;
        }

        /* ── Page content ── */
        .mg-grimoire-page {
            flex: 1;
            min-width: 0;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        .mg-grimoire-page-content {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 16px 14px;
            transition: opacity 0.15s ease;
            scrollbar-width: thin;
            scrollbar-color: #8b5a2b transparent;
        }

        /* ── Corners ── */
        .mg-grimoire-corner {
            position: absolute;
            width: 24px;
            height: 24px;
            pointer-events: none;
            opacity: 0.25;
            z-index: 5;
        }
        .mg-grimoire-corner--tl { top:6px; left:50px; border-top:2px solid #8b5a2b; border-left:2px solid #8b5a2b; }
        .mg-grimoire-corner--tr { top:6px; right:6px; border-top:2px solid #8b5a2b; border-right:2px solid #8b5a2b; }
        .mg-grimoire-corner--bl { bottom:6px; left:50px; border-bottom:2px solid #8b5a2b; border-left:2px solid #8b5a2b; }
        .mg-grimoire-corner--br { bottom:6px; right:6px; border-bottom:2px solid #8b5a2b; border-right:2px solid #8b5a2b; }

        /* ── Page styles ── */
        .mg-page-section { margin-bottom: 12px; }
        .mg-page-title {
            font-size: 15px; font-weight: 700; color: #8b5a2b;
            margin: 0 0 6px 0; padding-bottom: 6px;
            border-bottom: 2px solid #d4a574; letter-spacing: 1px;
        }
        .mg-page-subtitle {
            font-size: 12px; font-weight: 700; color: #4a3728;
            margin: 10px 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px;
        }
        .mg-page-flavor {
            font-size: 11px; font-style: italic; color: #7a6858;
            margin: 0 0 10px 0; line-height: 1.5;
        }
        .mg-page-divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #d4a574 20%, #d4a574 80%, transparent);
            margin: 14px 0; opacity: 0.6;
        }
        .mg-text-dim {
            color: #7a6858; font-size: 11px; font-style: italic; line-height: 1.5;
        }

        /* ── Buttons ── */
        .mg-page-btn {
            display: block; width: 100%; padding: 10px 14px; margin: 10px 0;
            background: linear-gradient(180deg, #d4a574, #8b5a2b);
            border: 2px solid #8b5a2b; border-radius: 6px;
            color: #fff; font-size: 11px; font-weight: 700;
            text-transform: uppercase; letter-spacing: 1.5px;
            text-shadow: 1px 1px 0 rgba(0,0,0,0.3);
            text-align: center; cursor: pointer;
            transition: all 0.15s ease;
            box-shadow: 0 2px 4px rgba(0,0,0,0.15);
        }
        .mg-page-btn:hover { transform: translateY(-1px); box-shadow: 0 3px 8px rgba(0,0,0,0.2); }
        .mg-page-btn:active { transform: translateY(1px); box-shadow: 0 1px 2px rgba(0,0,0,0.15); }

        /* ── Tarot ── */
        .mg-card-spread { display: flex; justify-content: center; gap: 8px; margin: 12px 0; }
        .mg-card-slot {
            width: 50px; height: 72px;
            background: linear-gradient(135deg, rgba(139,90,43,0.12), rgba(212,165,116,0.08));
            border: 2px dashed #8b5a2b; border-radius: 4px;
            display: flex; align-items: center; justify-content: center;
            font-size: 16px; color: #8b5a2b; opacity: 0.5;
        }
        .mg-queue-list { min-height: 40px; }
        .mg-queue-empty {
            text-align: center; padding: 10px 4px;
            color: #7a6858; font-style: italic; font-size: 11px;
        }
        .mg-queue-footer {
            text-align: center; font-size: 9px; color: #7a6858;
            padding-top: 4px; border-top: 1px dashed #d4a574; opacity: 0.7;
        }
        .mg-last-reading {
            display: flex; align-items: center; gap: 8px; padding: 6px 8px;
            background: rgba(139,90,43,0.06); border-radius: 6px;
            border: 1px solid rgba(139,90,43,0.1);
        }
        .mg-mini-card {
            width: 28px; height: 38px; background: #8b5a2b;
            border-radius: 3px; display: flex; align-items: center;
            justify-content: center; color: #fff; font-size: 11px; flex-shrink: 0;
        }
        .mg-last-reading-info { flex: 1; font-size: 11px; color: #4a3728; }

        /* ── Crystal Ball ── */
        .mg-crystal-orb { display: flex; flex-direction: column; align-items: center; margin: 14px 0; }
        .mg-crystal-sphere {
            width: 72px; height: 72px; border-radius: 50%;
            background: radial-gradient(circle at 30% 30%,
                rgba(200,180,255,0.9), rgba(100,80,150,0.7), rgba(50,30,80,0.9));
            box-shadow: 0 0 20px rgba(150,100,200,0.35), inset 0 0 16px rgba(255,255,255,0.2);
            position: relative; overflow: hidden;
        }
        .mg-crystal-mist {
            position: absolute; inset: 0;
            background: radial-gradient(circle at 50% 50%,
                transparent 0%, rgba(200,180,255,0.3) 50%, transparent 70%);
            animation: mg-swirl 4s ease-in-out infinite;
        }
        .mg-crystal-mist--2 { animation-delay: -2s; animation-direction: reverse; }
        @keyframes mg-swirl {
            0%, 100% { transform: rotate(0deg) scale(1); opacity: 0.5; }
            50% { transform: rotate(180deg) scale(1.1); opacity: 0.8; }
        }
        .mg-crystal-base {
            width: 32px; height: 8px;
            background: linear-gradient(180deg, #5a4a3a, #3a2a1a);
            border-radius: 0 0 4px 4px; margin-top: -3px;
        }
        .mg-vision-log, .mg-ouija-history { min-height: 50px; max-height: 120px; overflow-y: auto; }

        /* ── Ouija ── */
        .mg-ouija-mini {
            padding: 10px; background: linear-gradient(180deg, #3a2a1a, #2a1a0a);
            border-radius: 8px; text-align: center; margin: 8px 0;
            box-shadow: inset 0 2px 6px rgba(0,0,0,0.3);
        }
        .mg-ouija-letters { font-size: 9px; color: #d4a574; letter-spacing: 3px; margin-bottom: 4px; font-weight: 600; }
        .mg-ouija-yes-no { display: flex; justify-content: space-around; font-size: 10px; font-weight: 700; color: #d4a574; margin: 6px 0; }
        .mg-ouija-input {
            width: 100%; padding: 6px 10px; margin-top: 6px;
            background: rgba(255,255,255,0.08); border: 1px solid #d4a574;
            border-radius: 4px; color: #d4a574; font-size: 11px; box-sizing: border-box;
        }
        .mg-ouija-input::placeholder { color: rgba(212,165,116,0.4); }

        /* ── Nyx ── */
        .mg-nyx-portrait {
            width: 56px; height: 56px; margin: 0 auto 8px; border-radius: 50%;
            background: linear-gradient(135deg, #6b5b95, #4a3f6b);
            display: flex; align-items: center; justify-content: center;
            font-size: 24px; box-shadow: 0 3px 8px rgba(107,91,149,0.4);
        }
        .mg-nyx-mood { text-align: center; font-size: 12px; color: #4a3728; margin-bottom: 6px; }
        .mg-nyx-disposition { height: 6px; background: rgba(139,90,43,0.15); border-radius: 4px; overflow: hidden; margin: 8px 0; }
        .mg-nyx-disposition-fill { height: 100%; background: linear-gradient(90deg, #d4a574, #8b5a2b); border-radius: 4px; transition: width 0.3s ease; }
        .mg-nyx-actions { display: flex; gap: 6px; margin-top: 8px; }
        .mg-nyx-btn {
            flex: 1; padding: 8px 10px; font-size: 11px; font-weight: 600;
            border-radius: 6px; border: 1px solid #8b5a2b;
            background: rgba(139,90,43,0.08); color: #4a3728;
            cursor: pointer; transition: all 0.15s ease; text-align: center;
        }
        .mg-nyx-btn:hover { background: #8b5a2b; color: #fff; }

        /* ── Responsive ── */
        @media (max-width: 420px) {
            .mg-grimoire { width: 100vw; }
            .mg-grimoire-tabstrip { flex: 0 0 40px; width: 40px; }
            .mg-grimoire-tab { width: 32px; height: 32px; font-size: 13px; }
            .mg-grimoire-corner--tl, .mg-grimoire-corner--bl { left: 46px; }
        }
        @media (min-width: 421px) and (max-width: 600px) {
            .mg-grimoire { width: 88vw; }
        }
        @media (min-width: 601px) and (max-width: 1000px) {
            .mg-grimoire { width: 420px; }
            .mg-grimoire-tabstrip { flex: 0 0 48px; width: 48px; }
            .mg-grimoire-tab { width: 40px; height: 40px; font-size: 16px; }
        }
        @media (min-width: 1001px) {
            .mg-grimoire { width: 440px; }
            .mg-grimoire-tabstrip { flex: 0 0 52px; width: 52px; }
            .mg-grimoire-tab { width: 42px; height: 42px; font-size: 17px; }
            .mg-page-title { font-size: 17px; }
            .mg-page-subtitle { font-size: 13px; }
            .mg-page-flavor, .mg-text-dim { font-size: 12px; }
            .mg-page-btn { font-size: 12px; padding: 12px 16px; }
            .mg-grimoire-page-content { padding: 20px 18px; }
        }
    `;
    document.head.appendChild(style);
    console.log('[Grimoire] Critical CSS injected');
}

// ══════════════════════════════════════════════
// INITIALIZATION
// ══════════════════════════════════════════════

export function initGrimoire() {
    console.log('[Grimoire] Initializing v4 (nuclear)...');

    try {
        injectCriticalCSS();
        createGrimoireDOM();
        setupEventListeners();
        console.log('[Grimoire] ✅ Ready');
        if (typeof toastr !== 'undefined') {
            toastr.success('Grimoire initialized', 'Petit Grimoire', { timeOut: 2000 });
        }
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

    // Overlay
    const overlay = document.createElement('div');
    overlay.className = 'mg-grimoire-overlay';
    overlay.id = 'mg-grimoire-overlay';
    document.body.appendChild(overlay);

    // Drawer
    const drawer = document.createElement('div');
    drawer.className = 'mg-grimoire';
    drawer.id = 'mg-grimoire';

    drawer.innerHTML = `
        <div class="mg-grimoire-inner">
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
    console.log('[Grimoire] DOM created:', !!document.getElementById('mg-grimoire'));

    loadPageContent(grimoireState.currentTab);
}

// ══════════════════════════════════════════════
// EVENT LISTENERS
// ══════════════════════════════════════════════

let _escapeHandler = null;

function setupEventListeners() {
    document.getElementById('mg-grimoire-overlay')?.addEventListener('click', closeGrimoire);

    document.getElementById('mg-grimoire-close')?.addEventListener('click', (e) => {
        e.stopPropagation();
        closeGrimoire();
    });

    document.querySelectorAll('.mg-grimoire-tab:not(.mg-grimoire-tab--close)').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabId = e.currentTarget.dataset.tab;
            if (tabId && tabId !== grimoireState.currentTab) {
                switchTab(tabId);
            }
        });
    });

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
// ══════════════════════════════════════════════

export function openGrimoire() {
    // ALWAYS force-clear — never trust this flag
    grimoireState.isAnimating = false;

    if (grimoireState.isOpen) return;

    console.log('[Grimoire] Opening...');

    let drawer = document.getElementById('mg-grimoire');
    let overlay = document.getElementById('mg-grimoire-overlay');

    // Recreate if missing
    if (!drawer || !overlay) {
        console.warn('[Grimoire] DOM missing — recreating');
        injectCriticalCSS();
        createGrimoireDOM();
        setupEventListeners();
        drawer = document.getElementById('mg-grimoire');
        overlay = document.getElementById('mg-grimoire-overlay');
    }

    if (!drawer || !overlay) {
        console.error('[Grimoire] DOM creation failed!');
        if (typeof toastr !== 'undefined') {
            toastr.error('Grimoire DOM creation failed', 'Petit Grimoire');
        }
        showCompact();
        return;
    }

    grimoireState.isAnimating = true;
    hideCompact();

    // Force display
    drawer.style.removeProperty('display');

    // Slide in
    overlay.classList.add('visible');
    drawer.classList.add('open');

    if (typeof toastr !== 'undefined') {
        toastr.info('Grimoire opening...', 'Petit Grimoire', { timeOut: 1500 });
    }

    setTimeout(() => {
        grimoireState.isOpen = true;
        grimoireState.isAnimating = false;
        console.log('[Grimoire] ✅ Opened');
    }, 400);
}

export function closeGrimoire() {
    // ALWAYS force-clear
    grimoireState.isAnimating = false;

    if (!grimoireState.isOpen) {
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
                <button class="mg-page-btn" id="mg-btn-draw-card">✦ Draw a Card</button>
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

        radio: `
            <div class="mg-page-section">
                <h3 class="mg-page-title">📻 Radio</h3>
                <p class="mg-page-flavor">"Tune in to the cosmic frequencies."</p>
                <p class="mg-text-dim">Coming soon: Ambient soundscapes and mystical frequencies.</p>
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
                <p class="mg-text-dim">Petit Grimoire v0.4 — Drawer Edition (Nuclear)</p>
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
        console.log('[Grimoire] Crystal ball gaze');
    });
    document.getElementById('mg-btn-ask-spirits')?.addEventListener('click', () => {
        const q = document.getElementById('mg-ouija-question')?.value;
        console.log('[Grimoire] Ouija:', q);
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
