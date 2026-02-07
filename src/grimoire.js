/**
 * Petit Grimoire — Pixel Art Grimoire
 * Spellbook UI using Franuka's RPG UI Pack assets (2x)
 * 7 tabs: Tarot, Crystal, Ouija, Nyx, Spells, Radio, Settings
 */

import {
    extensionName, extensionFolderPath, extensionSettings,
    grimoireOpen, setGrimoireOpen,
    saveSettings
} from './state.js';
import { showSpeech, updateNyxMood, playSpecialAnimation } from './nyxgotchi.js';

// Helper - get mood text from disposition (fallback if not in nyxgotchi.js)
function getMoodText(disposition) {
    if (disposition >= 80) return '😊 Delighted';
    if (disposition >= 60) return '😏 Amused';
    if (disposition >= 40) return '😐 Neutral';
    if (disposition >= 20) return '😒 Bored';
    return '😾 Annoyed';
}
import { setCompactActive, playTransformFlash } from './compact.js';

// ============================================
// CONSTANTS
// ============================================

// Tab configuration - matches ribbon positions on Spellbook_WithTabs.png
const TABS = [
    { id: 'tarot',    name: 'Tarot',   color: 'red',    position: 'right-1' },
    { id: 'crystal',  name: 'Crystal', color: 'teal',   position: 'right-2' },
    { id: 'ouija',    name: 'Ouija',   color: 'orange', position: 'right-3' },
    { id: 'nyx',      name: 'Nyx',     color: 'yellow', position: 'right-4' },
    { id: 'spells',   name: 'Spells',  color: 'green',  position: 'bottom-right' },
    { id: 'radio',    name: 'Radio',   color: 'gold',   position: 'bottom-left-2' },
    { id: 'settings', name: 'Config',  color: 'pink',   position: 'bottom-left' },
];

// Animation durations (ms)
const ANIM_OPEN = 600;      // Book opening
const ANIM_CLOSE = 600;     // Book closing  
const ANIM_PAGE_TURN = 400; // Page flip

// ============================================
// STATE
// ============================================

let currentTab = 'tarot';
let isAnimating = false;
let grimoireInitialized = false;

// ============================================
// GRIMOIRE HTML
// ============================================

function getGrimoireHTML() {
    return `
        <div class="mg-grimoire-overlay" id="mg-grimoire-overlay"></div>
        <div class="mg-grimoire" id="mg-grimoire" data-mg-theme="${extensionSettings.shellTheme || 'guardian'}">
            
            <!-- Animation layer for open/close/page-turn -->
            <div class="mg-grimoire-anim" id="mg-grimoire-anim"></div>
            
            <!-- Main book container -->
            <div class="mg-grimoire-book" id="mg-grimoire-book">
                
                <!-- Tab ribbons (clickable hotspots) -->
                <div class="mg-grimoire-tabs">
                    ${TABS.map(tab => `
                        <button class="mg-grimoire-tab mg-grimoire-tab--${tab.position}" 
                                data-tab="${tab.id}"
                                data-color="${tab.color}"
                                title="${tab.name}"
                                ${tab.id === 'tarot' ? 'data-active="true"' : ''}>
                            <span class="mg-grimoire-tab-label">${tab.name}</span>
                        </button>
                    `).join('')}
                </div>
                
                <!-- Page content area (sits on parchment) -->
                <div class="mg-grimoire-pages">
                    
                    <!-- LEFT PAGE: Usually decorative or secondary info -->
                    <div class="mg-grimoire-page mg-grimoire-page--left">
                        <div class="mg-grimoire-page-content" id="mg-page-left">
                            <!-- Dynamic content based on active tab -->
                        </div>
                    </div>
                    
                    <!-- RIGHT PAGE: Main interaction area -->
                    <div class="mg-grimoire-page mg-grimoire-page--right">
                        <div class="mg-grimoire-page-content" id="mg-page-right">
                            <!-- Dynamic content based on active tab -->
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
    `;
}

// ============================================
// PAGE CONTENT GENERATORS
// ============================================

function getTarotPageContent() {
    return {
        left: `
            <div class="mg-page-section">
                <h3 class="mg-page-title">Fate Queue</h3>
                <div class="mg-queue-list" id="mg-queue-list">
                    <div class="mg-queue-empty">No cards drawn yet...</div>
                </div>
                <div class="mg-queue-footer" id="mg-queue-footer">0 of 5 slots</div>
            </div>
        `,
        right: `
            <div class="mg-page-section">
                <h3 class="mg-page-title">Draw from the Deck</h3>
                <p class="mg-page-flavor">The cards whisper of what is to come...</p>
                
                <div class="mg-card-spread">
                    <div class="mg-card-slot" style="transform:rotate(-5deg)"><span>✦</span></div>
                    <div class="mg-card-slot"><span>✦</span></div>
                    <div class="mg-card-slot" style="transform:rotate(5deg)"><span>✦</span></div>
                </div>
                
                <button class="mg-page-btn" id="mg-draw-card">
                    Draw a Card
                </button>
                
                <div class="mg-page-subsection">
                    <h4 class="mg-page-subtitle">Last Reading</h4>
                    <div class="mg-last-reading">
                        <div class="mg-mini-card">—</div>
                        <div class="mg-last-reading-info">
                            <div id="mg-last-card-name">None yet</div>
                            <div id="mg-last-card-keywords" class="mg-text-dim">Draw to reveal your fate</div>
                        </div>
                    </div>
                </div>
            </div>
        `
    };
}

function getCrystalPageContent() {
    return {
        left: `
            <div class="mg-page-section">
                <h3 class="mg-page-title">Visions Past</h3>
                <div class="mg-vision-log" id="mg-vision-log">
                    <div class="mg-text-dim">The mists hold no memories...</div>
                </div>
            </div>
        `,
        right: `
            <div class="mg-page-section">
                <h3 class="mg-page-title">Crystal Ball</h3>
                <p class="mg-page-flavor">Wild magic swirls within...</p>
                
                <div class="mg-crystal-orb">
                    <div class="mg-crystal-sphere">
                        <div class="mg-crystal-mist"></div>
                        <div class="mg-crystal-mist mg-crystal-mist--2"></div>
                        <div class="mg-crystal-glint"></div>
                    </div>
                    <div class="mg-crystal-base"></div>
                </div>
                
                <button class="mg-page-btn" id="mg-crystal-gaze">
                    Gaze into the Mist
                </button>
                
                <div class="mg-page-subsection">
                    <h4 class="mg-page-subtitle">Last Vision</h4>
                    <div class="mg-crystal-vision" id="mg-crystal-vision">
                        The mists have not yet parted...
                    </div>
                </div>
            </div>
        `
    };
}

function getOuijaPageContent() {
    return {
        left: `
            <div class="mg-page-section">
                <h3 class="mg-page-title">Spirit Answers</h3>
                <div class="mg-ouija-history" id="mg-ouija-history">
                    <div class="mg-text-dim">The spirits await your questions...</div>
                </div>
            </div>
        `,
        right: `
            <div class="mg-page-section">
                <h3 class="mg-page-title">Ouija Board</h3>
                <p class="mg-page-flavor">Ask the spirits a question...</p>
                
                <div class="mg-ouija-board">
                    <div class="mg-ouija-row mg-ouija-answers">
                        <span class="mg-ouija-answer">YES</span>
                        <span class="mg-ouija-sun">☀</span>
                        <span class="mg-ouija-answer">NO</span>
                    </div>
                    <div class="mg-ouija-letters">
                        <div class="mg-ouija-row">A B C D E F G H I J K L M</div>
                        <div class="mg-ouija-row">N O P Q R S T U V W X Y Z</div>
                    </div>
                    <div class="mg-ouija-planchette" id="mg-ouija-planchette">
                        <div class="mg-ouija-lens"></div>
                    </div>
                    <div class="mg-ouija-numbers">
                        <span>1 2 3 4 5 6 7 8 9 0</span>
                    </div>
                    <div class="mg-ouija-farewell">GOODBYE</div>
                </div>
                
                <button class="mg-page-btn" id="mg-ouija-ask">
                    Consult the Spirits
                </button>
                
                <div class="mg-ouija-response" id="mg-ouija-response">
                    <div class="mg-ouija-waiting">Awaiting your question...</div>
                </div>
            </div>
        `
    };
}

function getNyxPageContent() {
    const disposition = extensionSettings.nyx?.disposition ?? 50;
    return {
        left: `
            <div class="mg-page-section">
                <h3 class="mg-page-title">Activity Log</h3>
                <div class="mg-nyx-log" id="mg-nyx-log">
                    <div class="mg-text-dim">Nyx watches silently...</div>
                </div>
            </div>
        `,
        right: `
            <div class="mg-page-section">
                <h3 class="mg-page-title">Nyx</h3>
                <p class="mg-page-flavor">Your familiar observes with ancient eyes...</p>
                
                <div class="mg-nyx-portrait">
                    <div class="mg-nyx-mood-indicator" id="mg-nyx-mood-indicator">
                        ${getMoodText(disposition)}
                    </div>
                </div>
                
                <div class="mg-nyx-disposition">
                    <div class="mg-nyx-bar-track">
                        <div class="mg-nyx-bar-fill" id="mg-nyx-bar" style="width: ${disposition}%"></div>
                    </div>
                    <div class="mg-nyx-score">
                        <span id="mg-nyx-score">${disposition}</span> / 100
                    </div>
                </div>
                
                <div class="mg-nyx-actions">
                    <button class="mg-page-btn mg-page-btn--small" data-nyx-action="treat">🍬 Treat</button>
                    <button class="mg-page-btn mg-page-btn--small" data-nyx-action="pet">✋ Pet</button>
                    <button class="mg-page-btn mg-page-btn--small" data-nyx-action="advice">💭 Advice</button>
                    <button class="mg-page-btn mg-page-btn--small" data-nyx-action="tease">😼 Tease</button>
                </div>
            </div>
        `
    };
}

function getSpellsPageContent() {
    return {
        left: `
            <div class="mg-page-section">
                <h3 class="mg-page-title">Spell Log</h3>
                <div class="mg-spell-log" id="mg-spell-log">
                    <div class="mg-text-dim">No spells cast yet...</div>
                </div>
            </div>
        `,
        right: `
            <div class="mg-page-section">
                <h3 class="mg-page-title">Spell Cards</h3>
                <p class="mg-page-flavor">Active enchantments shimmer around you...</p>
                
                <div class="mg-spells-grid" id="mg-spells-grid">
                    <div class="mg-spell-card" data-spell="shield">
                        <div class="mg-spell-icon">🛡️</div>
                        <div class="mg-spell-name">Aegis</div>
                        <div class="mg-spell-status">Ready</div>
                    </div>
                    <div class="mg-spell-card" data-spell="charm">
                        <div class="mg-spell-icon">💖</div>
                        <div class="mg-spell-name">Charm</div>
                        <div class="mg-spell-status">Ready</div>
                    </div>
                    <div class="mg-spell-card" data-spell="insight">
                        <div class="mg-spell-icon">👁️</div>
                        <div class="mg-spell-name">Insight</div>
                        <div class="mg-spell-status">Ready</div>
                    </div>
                    <div class="mg-spell-card" data-spell="chaos">
                        <div class="mg-spell-icon">🌀</div>
                        <div class="mg-spell-name">Chaos</div>
                        <div class="mg-spell-status">Ready</div>
                    </div>
                </div>
            </div>
        `
    };
}

function getRadioPageContent() {
    return {
        left: `
            <div class="mg-page-section">
                <h3 class="mg-page-title">Now Playing</h3>
                <div class="mg-radio-now" id="mg-radio-now">
                    <div class="mg-text-dim">Silence...</div>
                </div>
            </div>
        `,
        right: `
            <div class="mg-page-section">
                <h3 class="mg-page-title">Magical Radio</h3>
                <p class="mg-page-flavor">Tune into the ethereal wavelengths...</p>
                
                <div class="mg-radio-dial">
                    <div class="mg-radio-display" id="mg-radio-display">OFF</div>
                </div>
                
                <div class="mg-radio-controls">
                    <button class="mg-page-btn mg-page-btn--small" id="mg-radio-prev">◀◀</button>
                    <button class="mg-page-btn" id="mg-radio-toggle">▶ Play</button>
                    <button class="mg-page-btn mg-page-btn--small" id="mg-radio-next">▶▶</button>
                </div>
                
                <div class="mg-radio-stations" id="mg-radio-stations">
                    <div class="mg-text-dim">Loading stations...</div>
                </div>
            </div>
        `
    };
}

function getSettingsPageContent() {
    return {
        left: `
            <div class="mg-page-section">
                <h3 class="mg-page-title">About</h3>
                <div class="mg-settings-about">
                    <p><strong>Petit Grimoire</strong></p>
                    <p class="mg-text-dim">Your magical companion</p>
                    <p class="mg-text-dim mg-text-small">v1.0.0</p>
                </div>
            </div>
        `,
        right: `
            <div class="mg-page-section">
                <h3 class="mg-page-title">Settings</h3>
                <p class="mg-page-flavor">Configure your magical experience...</p>
                
                <div class="mg-settings-group">
                    <label class="mg-checkbox-label">
                        <input type="checkbox" id="mg-setting-particles" 
                            ${extensionSettings.features?.particleEffects !== false ? 'checked' : ''}>
                        <span>Particle Effects</span>
                    </label>
                    
                    <label class="mg-checkbox-label">
                        <input type="checkbox" id="mg-setting-sounds"
                            ${extensionSettings.features?.soundEffects !== false ? 'checked' : ''}>
                        <span>Sound Effects</span>
                    </label>
                    
                    <label class="mg-checkbox-label">
                        <input type="checkbox" id="mg-setting-nyx-comments"
                            ${extensionSettings.features?.nyxUnsolicited !== false ? 'checked' : ''}>
                        <span>Nyx Comments</span>
                    </label>
                </div>
            </div>
        `
    };
}

// Map tab IDs to content generators
const PAGE_CONTENT = {
    tarot: getTarotPageContent,
    crystal: getCrystalPageContent,
    ouija: getOuijaPageContent,
    nyx: getNyxPageContent,
    spells: getSpellsPageContent,
    radio: getRadioPageContent,
    settings: getSettingsPageContent,
};

// ============================================
// GRIMOIRE INITIALIZATION
// ============================================

function ensureGrimoireExists() {
    if (document.getElementById('mg-grimoire')) return;
    
    $('body').append(getGrimoireHTML());
    initGrimoireEvents();
    grimoireInitialized = true;
    console.log(`[${extensionName}] Grimoire DOM created`);
}

function initGrimoireEvents() {
    // Tab click handlers
    $(document).on('click', '.mg-grimoire-tab', function(e) {
        const tabId = $(this).data('tab');
        if (tabId) switchTab(tabId);
    });
    
    // Overlay click to close
    $(document).on('click', '#mg-grimoire-overlay', closeGrimoire);
    
    // Escape key to close
    $(document).on('keydown', (e) => {
        if (e.key === 'Escape' && grimoireOpen) {
            closeGrimoire();
        }
    });
}

// ============================================
// GRIMOIRE CONTROLS (EXPORTED)
// ============================================

/**
 * Transformation sequence - called when compact is tapped
 */
export function triggerTransformation() {
    // Play compact flash
    playTransformFlash();
    
    // Open grimoire after brief delay
    setTimeout(() => {
        openGrimoire();
    }, 200);
}

export function openGrimoire() {
    if (grimoireOpen || isAnimating) return;
    
    ensureGrimoireExists();
    
    isAnimating = true;
    setGrimoireOpen(true);
    setCompactActive(true);
    
    const overlay = document.getElementById('mg-grimoire-overlay');
    const grimoire = document.getElementById('mg-grimoire');
    const animLayer = document.getElementById('mg-grimoire-anim');
    const book = document.getElementById('mg-grimoire-book');
    
    if (!grimoire) return;
    
    // Show overlay
    overlay.style.display = 'block';
    requestAnimationFrame(() => overlay.classList.add('visible'));
    
    // Show grimoire container
    grimoire.style.display = 'flex';
    
    // Play opening animation
    animLayer.classList.add('mg-anim-opening');
    book.style.opacity = '0';
    
    setTimeout(() => {
        animLayer.classList.remove('mg-anim-opening');
        book.style.opacity = '1';
        grimoire.classList.add('visible');
        isAnimating = false;
        
        // Load initial tab content
        loadTabContent(currentTab);
    }, ANIM_OPEN);
}

export function closeGrimoire() {
    if (!grimoireOpen || isAnimating) return;
    
    isAnimating = true;
    
    const overlay = document.getElementById('mg-grimoire-overlay');
    const grimoire = document.getElementById('mg-grimoire');
    const animLayer = document.getElementById('mg-grimoire-anim');
    const book = document.getElementById('mg-grimoire-book');
    
    if (!grimoire) return;
    
    // Play closing animation
    book.style.opacity = '0';
    animLayer.classList.add('mg-anim-closing');
    
    setTimeout(() => {
        animLayer.classList.remove('mg-anim-closing');
        grimoire.classList.remove('visible');
        grimoire.style.display = 'none';
        overlay.classList.remove('visible');
        
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 300);
        
        setGrimoireOpen(false);
        setCompactActive(false);
        isAnimating = false;
    }, ANIM_CLOSE);
}

export function toggleGrimoire() {
    if (grimoireOpen) {
        closeGrimoire();
    } else {
        openGrimoire();
    }
}

// ============================================
// TAB SWITCHING
// ============================================

function switchTab(newTabId) {
    if (newTabId === currentTab || isAnimating) return;
    
    const oldIndex = TABS.findIndex(t => t.id === currentTab);
    const newIndex = TABS.findIndex(t => t.id === newTabId);
    const goingForward = newIndex < oldIndex; // Lower index = "front" of book
    
    isAnimating = true;
    
    const animLayer = document.getElementById('mg-grimoire-anim');
    
    // Update tab active states
    document.querySelectorAll('.mg-grimoire-tab').forEach(tab => {
        tab.removeAttribute('data-active');
    });
    document.querySelector(`.mg-grimoire-tab[data-tab="${newTabId}"]`)?.setAttribute('data-active', 'true');
    
    // Play page turn animation
    const animClass = goingForward ? 'mg-anim-page-next' : 'mg-anim-page-prev';
    animLayer.classList.add(animClass);
    
    // Fade out current content
    const leftPage = document.getElementById('mg-page-left');
    const rightPage = document.getElementById('mg-page-right');
    if (leftPage) leftPage.style.opacity = '0';
    if (rightPage) rightPage.style.opacity = '0';
    
    setTimeout(() => {
        // Load new content
        currentTab = newTabId;
        loadTabContent(newTabId);
        
        // Fade in new content
        if (leftPage) leftPage.style.opacity = '1';
        if (rightPage) rightPage.style.opacity = '1';
        
        animLayer.classList.remove(animClass);
        isAnimating = false;
    }, ANIM_PAGE_TURN);
}

function loadTabContent(tabId) {
    const contentGenerator = PAGE_CONTENT[tabId];
    if (!contentGenerator) return;
    
    const content = contentGenerator();
    
    const leftPage = document.getElementById('mg-page-left');
    const rightPage = document.getElementById('mg-page-right');
    
    if (leftPage) leftPage.innerHTML = content.left;
    if (rightPage) rightPage.innerHTML = content.right;
    
    // Initialize tab-specific functionality
    initTabFunctionality(tabId);
}

function initTabFunctionality(tabId) {
    switch (tabId) {
        case 'tarot':
            initTarotTab();
            break;
        case 'crystal':
            initCrystalTab();
            break;
        case 'ouija':
            initOuijaTab();
            break;
        case 'nyx':
            initNyxTab();
            break;
        case 'spells':
            initSpellsTab();
            break;
        case 'radio':
            initRadioTab();
            break;
        case 'settings':
            initSettingsTab();
            break;
    }
}

// ============================================
// TAB INITIALIZERS
// ============================================

function initTarotTab() {
    const drawBtn = document.getElementById('mg-draw-card');
    if (drawBtn) {
        drawBtn.addEventListener('click', handleDrawCard);
    }
    updateQueueDisplay();
}

function initCrystalTab() {
    const gazeBtn = document.getElementById('mg-crystal-gaze');
    if (gazeBtn) {
        gazeBtn.addEventListener('click', handleCrystalGaze);
    }
}

function initOuijaTab() {
    const askBtn = document.getElementById('mg-ouija-ask');
    if (askBtn) {
        askBtn.addEventListener('click', handleOuijaAsk);
    }
}

function initNyxTab() {
    document.querySelectorAll('[data-nyx-action]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.currentTarget.dataset.nyxAction;
            handleNyxAction(action);
        });
    });
    updateNyxPanel();
}

function initSpellsTab() {
    document.querySelectorAll('.mg-spell-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const spell = e.currentTarget.dataset.spell;
            handleCastSpell(spell, $(e.currentTarget));
        });
    });
}

function initRadioTab() {
    // TODO: Radio functionality
}

function initSettingsTab() {
    $('#mg-setting-particles').on('change', function() {
        if (!extensionSettings.features) extensionSettings.features = {};
        extensionSettings.features.particleEffects = $(this).prop('checked');
        saveSettings();
    });
    
    $('#mg-setting-sounds').on('change', function() {
        if (!extensionSettings.features) extensionSettings.features = {};
        extensionSettings.features.soundEffects = $(this).prop('checked');
        saveSettings();
    });
    
    $('#mg-setting-nyx-comments').on('change', function() {
        if (!extensionSettings.features) extensionSettings.features = {};
        extensionSettings.features.nyxUnsolicited = $(this).prop('checked');
        saveSettings();
    });
}

// ============================================
// EVENT HANDLERS (Internal)
// ============================================

function handleDrawCard() {
    // Placeholder - will integrate with tarot system
    const cards = ['The Fool', 'The Magician', 'High Priestess', 'The Tower', 'The Star', 'The Moon'];
    const card = cards[Math.floor(Math.random() * cards.length)];
    const reversed = Math.random() < 0.5;
    
    const nameEl = document.getElementById('mg-last-card-name');
    const keywordsEl = document.getElementById('mg-last-card-keywords');
    
    if (nameEl) nameEl.textContent = card + (reversed ? ' ⟲' : '');
    if (keywordsEl) keywordsEl.textContent = reversed ? 'Reversed meaning...' : 'Upright meaning...';
    
    showSpeech(`Drew ${card}${reversed ? ' (reversed)' : ''}`, 3000);
    playSpecialAnimation('amused', 2);
}

function handleCrystalGaze() {
    const visions = [
        { text: "Shadows gather at the edge of perception.", type: 'ominous' },
        { text: "A path diverges. Both lead somewhere unexpected.", type: 'choice' },
        { text: "Someone's thoughts turn to you, unbidden.", type: 'connection' },
        { text: "What was lost will find its way back.", type: 'hope' },
        { text: "The crystal shows only swirling mist...", type: 'unclear' },
    ];
    
    const vision = visions[Math.floor(Math.random() * visions.length)];
    const el = document.getElementById('mg-crystal-vision');
    if (el) el.textContent = vision.text;
    
    // Add to log
    const log = document.getElementById('mg-vision-log');
    if (log && log.querySelector('.mg-text-dim')) {
        log.innerHTML = '';
    }
    if (log) {
        const entry = document.createElement('div');
        entry.className = 'mg-vision-entry';
        entry.textContent = `✦ ${vision.text}`;
        log.prepend(entry);
        while (log.children.length > 5) log.removeChild(log.lastChild);
    }
    
    showSpeech(vision.text, 4000);
    playSpecialAnimation('amused', 2);
}

function handleOuijaAsk() {
    const responses = [
        { answer: 'YES', flavor: 'The planchette moves decisively.', mood: 'positive' },
        { answer: 'NO', flavor: 'The spirits pull firmly toward NO.', mood: 'negative' },
        { answer: 'MAYBE', flavor: 'The planchette trembles...', mood: 'uncertain' },
        { answer: 'BEWARE', flavor: 'B-E-W-A-R-E...', mood: 'warning' },
        { answer: 'SOON', flavor: 'The spirits say: SOON.', mood: 'cryptic' },
        { answer: 'GOODBYE', flavor: 'The spirits end the session.', mood: 'cryptic' },
    ];
    
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    // Animate planchette
    const planchette = document.getElementById('mg-ouija-planchette');
    if (planchette) {
        planchette.classList.add('mg-ouija-moving');
        setTimeout(() => planchette.classList.remove('mg-ouija-moving'), 1500);
    }
    
    // Show response
    const el = document.getElementById('mg-ouija-response');
    if (el) {
        el.innerHTML = `
            <div class="mg-ouija-result mg-ouija-mood-${response.mood}">
                <div class="mg-ouija-answer-text">${response.answer}</div>
                <div class="mg-ouija-flavor-text">${response.flavor}</div>
            </div>
        `;
    }
    
    // Add to history
    const history = document.getElementById('mg-ouija-history');
    if (history && history.querySelector('.mg-text-dim')) {
        history.innerHTML = '';
    }
    if (history) {
        const entry = document.createElement('div');
        entry.className = 'mg-ouija-history-entry';
        entry.textContent = `› ${response.answer}`;
        history.prepend(entry);
        while (history.children.length > 5) history.removeChild(history.lastChild);
    }
    
    showSpeech(response.flavor, 3000);
}

function handleNyxAction(action) {
    const responses = {
        treat: [
            ['Nyx accepted the treat graciously.', 2, 'delighted'],
            ['Nyx sniffed it and looked unimpressed.', 0, 'bored'],
            ['Nyx devoured it instantly!', 3, 'delighted']
        ],
        advice: [
            ["Nyx says: 'Trust the next card drawn.'", 0, null],
            ["Nyx says: 'Patience is a virtue you lack.'", 0, 'annoyed'],
            ['Nyx stares at you in eloquent silence.', 0, 'bored']
        ],
        pet: [
            ['Nyx purrs contentedly.', 1, 'amused'],
            ['Nyx tolerates this. Barely.', 0, 'bored'],
            ['Nyx leans into your hand.', 2, 'delighted']
        ],
        tease: [
            ['Nyx narrows her eyes.', -1, 'annoyed'],
            ['Nyx swats at you dismissively.', -2, 'annoyed'],
            ['Nyx pretends not to care. She cares.', 0, 'bored']
        ],
    };
    
    const options = responses[action] || [['Nyx ignores you.', 0, null]];
    const [text, shift, anim] = options[Math.floor(Math.random() * options.length)];
    
    if (shift !== 0) {
        shiftDisposition(shift);
    }
    if (anim) {
        playSpecialAnimation(anim, 2);
    }
    
    // Add to log
    const log = document.getElementById('mg-nyx-log');
    if (log && log.querySelector('.mg-text-dim')) {
        log.innerHTML = '';
    }
    if (log) {
        let displayText = `› ${text}`;
        if (shift > 0) displayText += ` +${shift}`;
        else if (shift < 0) displayText += ` ${shift}`;
        
        const entry = document.createElement('div');
        entry.className = 'mg-nyx-log-entry';
        entry.textContent = displayText;
        log.prepend(entry);
        while (log.children.length > 5) log.removeChild(log.lastChild);
    }
    
    showSpeech(text, 3000);
    updateNyxPanel();
}

function handleCastSpell(spellName, $card) {
    if ($card.hasClass('mg-spell-cooldown')) return;
    
    $card.addClass('mg-spell-cast');
    setTimeout(() => $card.removeClass('mg-spell-cast'), 500);
    
    $card.addClass('mg-spell-cooldown');
    $card.find('.mg-spell-status').text('Cooling...');
    setTimeout(() => {
        $card.removeClass('mg-spell-cooldown');
        $card.find('.mg-spell-status').text('Ready');
    }, 10000);
    
    const effects = {
        shield: ["Aegis shimmers around you.", "A protective ward rises."],
        charm: ["Charm weaves through your words.", "A subtle enchantment takes hold."],
        insight: ["Your perception sharpens.", "The veil thins—you see clearly."],
        chaos: ["Chaos unleashed!", "Wild magic surges!"],
    };
    
    const pool = effects[spellName] || ["The spell fizzles."];
    const result = pool[Math.floor(Math.random() * pool.length)];
    
    // Add to log
    const log = document.getElementById('mg-spell-log');
    if (log && log.querySelector('.mg-text-dim')) {
        log.innerHTML = '';
    }
    if (log) {
        const entry = document.createElement('div');
        entry.className = 'mg-spell-log-entry';
        entry.textContent = `✦ ${result}`;
        log.prepend(entry);
        while (log.children.length > 4) log.removeChild(log.lastChild);
    }
    
    showSpeech(result, 3000);
    playSpecialAnimation(spellName === 'chaos' ? 'delighted' : 'amused', 2);
}

// ============================================
// HELPERS
// ============================================

function shiftDisposition(amount) {
    if (!extensionSettings.nyx) extensionSettings.nyx = { disposition: 50 };
    extensionSettings.nyx.disposition = Math.max(0, Math.min(100, extensionSettings.nyx.disposition + amount));
    saveSettings();
    updateNyxMood();
}

function updateNyxPanel() {
    const d = extensionSettings.nyx?.disposition ?? 50;
    const scoreEl = document.getElementById('mg-nyx-score');
    const barEl = document.getElementById('mg-nyx-bar');
    const moodEl = document.getElementById('mg-nyx-mood-indicator');
    
    if (scoreEl) scoreEl.textContent = d;
    if (barEl) barEl.style.width = d + '%';
    if (moodEl) moodEl.textContent = getMoodText(d);
}

function updateQueueDisplay() {
    // TODO: Integrate with actual fate queue
    const list = document.getElementById('mg-queue-list');
    const footer = document.getElementById('mg-queue-footer');
    
    if (footer) footer.textContent = '0 of 5 slots';
}

// ============================================
// NYXGOTCHI BUTTON HANDLERS (EXPORTED)
// These are called from index.js via nyxgotchi callbacks
// ============================================

export function onDrawCard() {
    // Quick draw from nyxgotchi - could open grimoire to tarot tab
    if (!grimoireOpen) {
        currentTab = 'tarot';
        openGrimoire();
    } else {
        switchTab('tarot');
    }
}

export function onViewQueue() {
    // View queue - open grimoire to tarot tab
    if (!grimoireOpen) {
        currentTab = 'tarot';
        openGrimoire();
    } else {
        switchTab('tarot');
    }
}

export function onPokeNyx() {
    // Poke nyx - show speech bubble
    const pokes = [
        "What.",
        "Yes, I'm still here.",
        "...was that supposed to do something?",
        "*yawn*",
        "Don't you have cards to draw?",
        "I was napping.",
    ];
    const msg = pokes[Math.floor(Math.random() * pokes.length)];
    showSpeech(msg, 3000);
    
    // Small chance to shift disposition
    if (Math.random() < 0.3) {
        const shift = Math.random() < 0.5 ? 1 : -1;
        shiftDisposition(shift);
    }
}
