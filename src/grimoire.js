/**
 * Petit Grimoire — Inventory Book Edition
 * Magical spellbook UI with FontAwesome tab icons
 */

// ══════════════════════════════════════════════
// TAB CONFIGURATION
// ══════════════════════════════════════════════

const GRIMOIRE_TABS = [
    { id: 'tarot',    icon: 'fa-layer-group',    label: 'Tarot' },
    { id: 'crystal',  icon: 'fa-circle',         label: 'Crystal Ball' },
    { id: 'ouija',    icon: 'fa-ghost',          label: 'Ouija' },
    { id: 'nyx',      icon: 'fa-cat',            label: 'Nyx' },
    { id: 'spells',   icon: 'fa-wand-sparkles',  label: 'Spells' },
    { id: 'radio',    icon: 'fa-tower-broadcast', label: 'Radio' },
    { id: 'settings', icon: 'fa-gear',           label: 'Settings' },
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
    console.log('[Grimoire] Initializing Inventory Book edition...');
    createGrimoireDOM();
    setupEventListeners();
    console.log('[Grimoire] Ready!');
}

// ══════════════════════════════════════════════
// DOM CREATION
// ══════════════════════════════════════════════

function createGrimoireDOM() {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'mg-grimoire-overlay';
    overlay.id = 'mg-grimoire-overlay';
    document.body.appendChild(overlay);
    
    // Create main container
    const grimoire = document.createElement('div');
    grimoire.className = 'mg-grimoire';
    grimoire.id = 'mg-grimoire';
    
    grimoire.innerHTML = `
        <div class="mg-grimoire-book">
            <!-- Animation layer -->
            <div class="mg-grimoire-anim" id="mg-grimoire-anim"></div>
            
            <!-- Tab icons (positioned over the blank tabs) -->
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
            
            <!-- Page content area -->
            <div class="mg-grimoire-pages">
                <div class="mg-grimoire-page mg-grimoire-page--left">
                    <div class="mg-grimoire-page-content" id="mg-page-left"></div>
                </div>
                <div class="mg-grimoire-page mg-grimoire-page--right">
                    <div class="mg-grimoire-page-content" id="mg-page-right"></div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(grimoire);
    
    // Load initial page content
    loadPageContent(grimoireState.currentTab);
}

// ══════════════════════════════════════════════
// EVENT LISTENERS
// ══════════════════════════════════════════════

function setupEventListeners() {
    // Overlay click to close
    const overlay = document.getElementById('mg-grimoire-overlay');
    overlay?.addEventListener('click', closeGrimoire);
    
    // Tab clicks
    document.querySelectorAll('.mg-grimoire-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabId = e.currentTarget.dataset.tab;
            if (tabId && tabId !== grimoireState.currentTab) {
                switchTab(tabId);
            }
        });
    });
    
    // Escape key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && grimoireState.isOpen) {
            closeGrimoire();
        }
    });
}

// ══════════════════════════════════════════════
// OPEN / CLOSE
// ══════════════════════════════════════════════

export function openGrimoire() {
    if (grimoireState.isOpen || grimoireState.isAnimating) return;
    
    const grimoire = document.getElementById('mg-grimoire');
    const overlay = document.getElementById('mg-grimoire-overlay');
    if (!grimoire || !overlay) return;
    
    grimoireState.isAnimating = true;
    
    // Position grimoire
    const isMobile = window.innerWidth <= 1000;
    if (isMobile) {
        const topBar = document.getElementById('top-settings-holder');
        const topBarHeight = topBar ? topBar.offsetHeight : 60;
        grimoire.style.top = (topBarHeight + 10) + 'px';
        grimoire.style.left = '50%';
        grimoire.style.transform = 'translateX(-50%)';
    } else {
        grimoire.style.top = '50%';
        grimoire.style.left = '50%';
        grimoire.style.transform = 'translate(-50%, -50%)';
    }
    
    // Show overlay
    overlay.style.display = 'block';
    requestAnimationFrame(() => overlay.classList.add('visible'));
    
    // Show grimoire with opening animation
    grimoire.style.display = 'block';
    playAnimation('opening', () => {
        grimoireState.isOpen = true;
        grimoireState.isAnimating = false;
    });
}

export function closeGrimoire() {
    if (!grimoireState.isOpen || grimoireState.isAnimating) return;
    
    const grimoire = document.getElementById('mg-grimoire');
    const overlay = document.getElementById('mg-grimoire-overlay');
    if (!grimoire || !overlay) return;
    
    grimoireState.isAnimating = true;
    
    // Play closing animation
    playAnimation('closing', () => {
        grimoire.style.display = 'none';
        overlay.classList.remove('visible');
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 300);
        
        grimoireState.isOpen = false;
        grimoireState.isAnimating = false;
    });
}

export function toggleGrimoire() {
    if (grimoireState.isOpen) {
        closeGrimoire();
    } else {
        openGrimoire();
    }
}

// ══════════════════════════════════════════════
// TAB SWITCHING
// ══════════════════════════════════════════════

function switchTab(tabId) {
    if (grimoireState.isAnimating || tabId === grimoireState.currentTab) return;
    
    const currentIndex = GRIMOIRE_TABS.findIndex(t => t.id === grimoireState.currentTab);
    const newIndex = GRIMOIRE_TABS.findIndex(t => t.id === tabId);
    
    if (newIndex === -1) return;
    
    grimoireState.isAnimating = true;
    
    // Determine animation direction
    const animType = newIndex > currentIndex ? 'page-next' : 'page-prev';
    
    // Update active states
    document.querySelectorAll('.mg-grimoire-tab').forEach(tab => {
        tab.dataset.active = tab.dataset.tab === tabId ? 'true' : 'false';
    });
    
    // Play page flip animation
    playAnimation(animType, () => {
        grimoireState.currentTab = tabId;
        loadPageContent(tabId);
        grimoireState.isAnimating = false;
    });
}

// ══════════════════════════════════════════════
// ANIMATIONS
// ══════════════════════════════════════════════

function playAnimation(type, onComplete) {
    const anim = document.getElementById('mg-grimoire-anim');
    if (!anim) {
        onComplete?.();
        return;
    }
    
    // Clear previous animation
    anim.className = 'mg-grimoire-anim';
    
    // Force reflow
    void anim.offsetWidth;
    
    // Add animation class
    anim.classList.add(`mg-anim-${type}`);
    
    // Duration based on type
    const durations = {
        'opening': 500,
        'closing': 500,
        'page-next': 400,
        'page-prev': 400,
    };
    
    const duration = durations[type] || 400;
    
    setTimeout(() => {
        anim.className = 'mg-grimoire-anim';
        onComplete?.();
    }, duration);
}

// ══════════════════════════════════════════════
// PAGE CONTENT
// ══════════════════════════════════════════════

function loadPageContent(tabId) {
    const leftPage = document.getElementById('mg-page-left');
    const rightPage = document.getElementById('mg-page-right');
    
    if (!leftPage || !rightPage) return;
    
    const content = getPageContent(tabId);
    leftPage.innerHTML = content.left;
    rightPage.innerHTML = content.right;
    
    // Rebind any buttons
    bindPageActions(tabId);
}

function getPageContent(tabId) {
    const pages = {
        tarot: {
            left: `
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
            `,
            right: `
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
            `
        },
        
        crystal: {
            left: `
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
            `,
            right: `
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
            `
        },
        
        ouija: {
            left: `
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
            `,
            right: `
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
            `
        },
        
        nyx: {
            left: `
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
            `,
            right: `
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
            `
        },
        
        spells: {
            left: `
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
            `,
            right: `
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
            `
        },
        
        radio: {
            left: `
                <div class="mg-page-section">
                    <h3 class="mg-page-title">📻 Radio</h3>
                    <p class="mg-page-flavor">"Tune in to the cosmic frequencies."</p>
                    
                    <p class="mg-text-dim">
                        Coming soon: Ambient soundscapes,
                        mystical frequencies, and
                        mood-reactive audio.
                    </p>
                </div>
            `,
            right: `
                <div class="mg-page-section">
                    <h4 class="mg-page-subtitle">Stations</h4>
                    <p class="mg-text-dim">
                        🌙 Moonlight Lounge<br>
                        🔮 Crystal Frequencies<br>
                        ⭐ Starbound Static<br>
                        🌸 Sakura Dreams
                    </p>
                </div>
            `
        },
        
        settings: {
            left: `
                <div class="mg-page-section">
                    <h3 class="mg-page-title">⚙️ Settings</h3>
                    
                    <p class="mg-text-dim">
                        Configuration options coming soon.
                    </p>
                    
                    <h4 class="mg-page-subtitle" style="margin-top:12px;">Planned</h4>
                    <p class="mg-text-dim">
                        • Nyx chattiness level<br>
                        • Card queue size<br>
                        • Auto-trigger settings<br>
                        • Sound volume<br>
                        • Visual effects toggle
                    </p>
                </div>
            `,
            right: `
                <div class="mg-page-section">
                    <h4 class="mg-page-subtitle">About</h4>
                    <p class="mg-text-dim">
                        Petit Grimoire v0.1<br>
                        Inventory Book Edition
                    </p>
                    <p class="mg-text-dim" style="margin-top:8px;">
                        A magical girl fortune-telling
                        extension for SillyTavern.
                    </p>
                </div>
                
                <div class="mg-page-section">
                    <h4 class="mg-page-subtitle">Credits</h4>
                    <p class="mg-text-dim">
                        Book assets: Franuka<br>
                        (itch.io)
                    </p>
                </div>
            `
        },
    };
    
    return pages[tabId] || pages.tarot;
}

function bindPageActions(tabId) {
    // Tarot
    const drawBtn = document.getElementById('mg-btn-draw-card');
    drawBtn?.addEventListener('click', () => {
        console.log('[Grimoire] Draw card clicked');
        // TODO: Implement card drawing
    });
    
    // Crystal Ball
    const gazeBtn = document.getElementById('mg-btn-gaze');
    gazeBtn?.addEventListener('click', () => {
        console.log('[Grimoire] Crystal ball gaze clicked');
        // TODO: Implement crystal ball
    });
    
    // Ouija
    const askBtn = document.getElementById('mg-btn-ask-spirits');
    askBtn?.addEventListener('click', () => {
        const question = document.getElementById('mg-ouija-question')?.value;
        console.log('[Grimoire] Ouija question:', question);
        // TODO: Implement ouija
    });
    
    // Nyx
    const petBtn = document.getElementById('mg-btn-pet-nyx');
    petBtn?.addEventListener('click', () => {
        console.log('[Grimoire] Pet Nyx clicked');
        // TODO: Implement nyx interaction
    });
    
    const treatBtn = document.getElementById('mg-btn-treat-nyx');
    treatBtn?.addEventListener('click', () => {
        console.log('[Grimoire] Treat Nyx clicked');
        // TODO: Implement nyx interaction
    });
    
    // Spells
    const testSpellBtn = document.getElementById('mg-btn-test-spell');
    testSpellBtn?.addEventListener('click', () => {
        console.log('[Grimoire] Test spell clicked');
        // TODO: Implement spell test
    });
}

// ══════════════════════════════════════════════
// CALLBACK STUBS (for index.js compatibility)
// ══════════════════════════════════════════════

export function triggerTransformation() {
    console.log('[Grimoire] Transformation triggered!');
    // Play sparkle effect, then open grimoire
    openGrimoire();
}

export function onDrawCard() {
    console.log('[Grimoire] Draw card from Nyxgotchi');
    // TODO: Quick draw a card
}

export function onViewQueue() {
    console.log('[Grimoire] View queue from Nyxgotchi');
    // TODO: Show queue preview
}

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
