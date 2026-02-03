/**
 * Petit Grimoire — Grimoire Panel
 * Tome HTML, open/close, tab switching, all subsystem actions
 */

import {
    extensionName, extensionSettings,
    grimoireOpen, setGrimoireOpen,
    saveSettings
} from './state.js';
import { showSpeech, showCardFlash, updateNyxMood, getMoodText } from './nyxgotchi.js';

// ============================================
// GRIMOIRE HTML
// ============================================

export function getGrimoireHTML() {
    return `
        <div class="mg-overlay" id="mg-overlay"></div>
        <div class="mg-grimoire mg-fab" id="mg-grimoire" data-mg-theme="${extensionSettings.shellTheme}">
            <div class="mg-tome">
                <!-- Corner gems -->
                <span class="mg-tome-gem mg-tome-gem--tl"></span>
                <span class="mg-tome-gem mg-tome-gem--tr"></span>
                <span class="mg-tome-gem mg-tome-gem--bl"></span>
                <span class="mg-tome-gem mg-tome-gem--br"></span>

                <!-- Embossed border -->
                <div class="mg-tome-border"></div>

                <!-- Inner page -->
                <div class="mg-tome-page">
                    <div class="mg-tome-layout">
                        <!-- Side tabs -->
                        <div class="mg-tome-tabs">
                            <button class="mg-tome-tab active" data-mg-tab="cards">
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="1" width="10" height="14" rx="1.5"/><path d="M6 5.5l-1 2.5h3l-1 2.5"/></svg>
                                <span>Cards</span>
                            </button>
                            <button class="mg-tome-tab" data-mg-tab="crystal">
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="5"/><ellipse cx="8" cy="13" rx="4" ry="1.5"/><path d="M5 6.5c1.5-1 4-1 5.5 0" opacity="0.5"/></svg>
                                <span>Crystal</span>
                            </button>
                            <button class="mg-tome-tab" data-mg-tab="spells">
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 1l1 3h3l-2.5 2 1 3L8 7.5 5.5 9l1-3L4 4h3z"/><path d="M4 12l1-1M12 12l-1-1M8 14v-1" opacity="0.5"/></svg>
                                <span>Spells</span>
                            </button>
                            <button class="mg-tome-tab" data-mg-tab="queue">
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="4" y1="3" x2="13" y2="3"/><line x1="4" y1="8" x2="13" y2="8"/><line x1="4" y1="13" x2="13" y2="13"/><circle cx="1.5" cy="3" r="0.75" fill="currentColor"/><circle cx="1.5" cy="8" r="0.75" fill="currentColor"/><circle cx="1.5" cy="13" r="0.75" fill="currentColor"/></svg>
                                <span>Queue</span>
                            </button>
                            <button class="mg-tome-tab" data-mg-tab="ouija">
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="8" cy="8" rx="7" ry="5.5"/><circle cx="8" cy="7" r="2" opacity="0.5"/><path d="M4 4.5l1 .5M11 4.5l-1 .5"/></svg>
                                <span>Ouija</span>
                            </button>
                            <button class="mg-tome-tab" data-mg-tab="nyx">
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" stroke="none"><path d="M8 14s-5.5-4.5-6.5-7C.5 4.5 2 2 4.5 2 6 2 7.5 3.5 8 4.5 8.5 3.5 10 2 11.5 2 14 2 15.5 4.5 14.5 7 13.5 9.5 8 14 8 14z"/></svg>
                                <span>Nyx</span>
                            </button>
                        </div>

                        <!-- Content area -->
                        <div class="mg-tome-content">
                            <!-- Cards Tab -->
                            <div class="mg-tome-panel active" data-mg-panel="cards">
                                <div class="mg-tome-heading">Draw from the Deck</div>
                                <div class="mg-tome-flavor">The cards whisper of what is to come...</div>

                                <div class="mg-card-spread">
                                    <div class="mg-card-slot" style="transform:rotate(-5deg)"><span class="mg-card-symbol">✦</span></div>
                                    <div class="mg-card-slot"><span class="mg-card-symbol">✦</span></div>
                                    <div class="mg-card-slot" style="transform:rotate(5deg)"><span class="mg-card-symbol">✦</span></div>
                                </div>

                                <button class="mg-tome-btn mg-draw-btn" id="mg-grimoire-draw">
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="1" width="10" height="14" rx="1.5"/><path d="M6 5.5l-1 2.5h3l-1 2.5"/></svg>
                                    Draw a Card
                                </button>

                                <div class="mg-tome-section">
                                    <div class="mg-tome-section-title">Last Reading</div>
                                    <div class="mg-last-reading">
                                        <div class="mg-mini-card">—</div>
                                        <div class="mg-last-reading-info">
                                            <div class="mg-last-reading-name" id="mg-last-card-name">No cards drawn yet</div>
                                            <div class="mg-last-reading-keywords" id="mg-last-card-keywords">Draw to reveal your fate</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Queue Tab -->
                            <div class="mg-tome-panel" data-mg-panel="queue">
                                <div class="mg-tome-heading">Card Queue</div>
                                <div class="mg-tome-flavor">Cards drawn, awaiting their moment in the story</div>

                                <div class="mg-queue-list" id="mg-queue-list">
                                    <div class="mg-queue-empty">
                                        <div class="mg-queue-empty-icon">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4"><rect x="4" y="2" width="12" height="18" rx="2"/><line x1="8" y1="8" x2="14" y2="8"/><line x1="8" y1="12" x2="12" y2="12"/></svg>
                                        </div>
                                        The queue is empty. Draw some cards!
                                    </div>
                                </div>

                                <div class="mg-queue-footer" id="mg-queue-footer">0 of 5 slots filled</div>
                            </div>

                            <!-- Crystal Ball Tab -->
                            <div class="mg-tome-panel" data-mg-panel="crystal">
                                <div class="mg-tome-heading">Crystal Ball</div>
                                <div class="mg-tome-flavor">Wild magic swirls within... what will it reveal?</div>

                                <div class="mg-crystal-orb">
                                    <div class="mg-crystal-sphere">
                                        <div class="mg-crystal-mist"></div>
                                        <div class="mg-crystal-mist mg-crystal-mist--2"></div>
                                        <div class="mg-crystal-glint"></div>
                                    </div>
                                    <div class="mg-crystal-base"></div>
                                </div>

                                <button class="mg-tome-btn mg-crystal-gaze-btn" id="mg-crystal-gaze">
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="5"/><path d="M5 6.5c1.5-1 4-1 5.5 0"/></svg>
                                    Gaze into the Mist
                                </button>

                                <div class="mg-tome-section">
                                    <div class="mg-tome-section-title">Last Vision</div>
                                    <div class="mg-crystal-vision" id="mg-crystal-vision">
                                        The mists have not yet parted...
                                    </div>
                                </div>
                            </div>

                            <!-- Spells Tab -->
                            <div class="mg-tome-panel" data-mg-panel="spells">
                                <div class="mg-tome-heading">Spell Cards</div>
                                <div class="mg-tome-flavor">Active enchantments shimmer around you</div>

                                <div class="mg-spells-grid" id="mg-spells-grid">
                                    <div class="mg-spell-card" data-spell="shield">
                                        <div class="mg-spell-icon">🛡️</div>
                                        <div class="mg-spell-name">Aegis</div>
                                        <div class="mg-spell-desc">Deflects negative outcomes</div>
                                        <div class="mg-spell-status">Ready</div>
                                    </div>
                                    <div class="mg-spell-card" data-spell="charm">
                                        <div class="mg-spell-icon">💖</div>
                                        <div class="mg-spell-name">Charm</div>
                                        <div class="mg-spell-desc">Amplifies social interactions</div>
                                        <div class="mg-spell-status">Ready</div>
                                    </div>
                                    <div class="mg-spell-card" data-spell="insight">
                                        <div class="mg-spell-icon">👁️</div>
                                        <div class="mg-spell-name">Insight</div>
                                        <div class="mg-spell-desc">Reveals hidden details</div>
                                        <div class="mg-spell-status">Ready</div>
                                    </div>
                                    <div class="mg-spell-card" data-spell="chaos">
                                        <div class="mg-spell-icon">🌀</div>
                                        <div class="mg-spell-name">Chaos</div>
                                        <div class="mg-spell-desc">Wildcard narrative twist</div>
                                        <div class="mg-spell-status">Ready</div>
                                    </div>
                                </div>

                                <div class="mg-tome-section">
                                    <div class="mg-tome-section-title">Spell Log</div>
                                    <div class="mg-spell-log" id="mg-spell-log">
                                        <div class="mg-spell-log-entry">No spells cast yet</div>
                                    </div>
                                </div>
                            </div>

                            <!-- Ouija Tab -->
                            <div class="mg-tome-panel" data-mg-panel="ouija">
                                <div class="mg-tome-heading">Spirit Board</div>
                                <div class="mg-tome-flavor">Ask the spirits a yes or no question...</div>

                                <div class="mg-ouija-board">
                                    <div class="mg-ouija-row mg-ouija-answers">
                                        <span class="mg-ouija-answer" data-answer="yes">YES</span>
                                        <span class="mg-ouija-sun">☀</span>
                                        <span class="mg-ouija-answer" data-answer="no">NO</span>
                                    </div>
                                    <div class="mg-ouija-letters">
                                        <div class="mg-ouija-row">ABCDEFGHIJKLM</div>
                                        <div class="mg-ouija-row">NOPQRSTUVWXYZ</div>
                                    </div>
                                    <div class="mg-ouija-row mg-ouija-numbers">
                                        <span>1234567890</span>
                                    </div>
                                    <div class="mg-ouija-farewell">GOODBYE</div>
                                </div>

                                <div class="mg-ouija-planchette" id="mg-ouija-planchette">
                                    <div class="mg-ouija-lens"></div>
                                </div>

                                <button class="mg-tome-btn mg-ouija-ask-btn" id="mg-ouija-ask">
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6"/><path d="M6 6c0-1.5 1.5-2.5 3-1.5s1 3-1 3v1"/><circle cx="8" cy="12" r="0.5" fill="currentColor"/></svg>
                                    Ask the Spirits
                                </button>

                                <div class="mg-tome-section">
                                    <div class="mg-tome-section-title">The Spirits Say</div>
                                    <div class="mg-ouija-response" id="mg-ouija-response">
                                        <span class="mg-ouija-waiting">Waiting for a question...</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Nyx Tab -->
                            <div class="mg-tome-panel" data-mg-panel="nyx">
                                <div class="mg-tome-heading">Nyx</div>

                                <div class="mg-nyx-stats">
                                    <div class="mg-nyx-stats-header">
                                        <span>Disposition</span>
                                        <span class="mg-nyx-score" id="mg-nyx-score">${extensionSettings.nyx.disposition}</span>
                                    </div>
                                    <div class="mg-nyx-bar">
                                        <div class="mg-nyx-bar-fill" id="mg-nyx-bar" style="width:${extensionSettings.nyx.disposition}%"></div>
                                    </div>
                                    <div class="mg-nyx-bar-labels">
                                        <span>hostile</span><span>neutral</span><span>devoted</span>
                                    </div>
                                </div>

                                <div class="mg-nyx-mood" id="mg-nyx-mood-text">
                                    Currently: <b>${getMoodText(extensionSettings.nyx.disposition)}</b>
                                </div>

                                <div class="mg-nyx-actions">
                                    <button class="mg-nyx-action-btn" data-action="treat">Offer Treat</button>
                                    <button class="mg-nyx-action-btn" data-action="advice">Ask Advice</button>
                                    <button class="mg-nyx-action-btn" data-action="pet">Pet</button>
                                    <button class="mg-nyx-action-btn" data-action="tease">Tease</button>
                                </div>

                                <div class="mg-tome-section">
                                    <div class="mg-tome-section-title">Recent</div>
                                    <div class="mg-nyx-log" id="mg-nyx-log">
                                        <div class="mg-nyx-log-entry">Nyx watches you curiously...</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Clasp -->
                <div class="mg-tome-clasp">
                    <div class="mg-tome-clasp-dot"></div>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// OPEN / CLOSE
// ============================================

export function triggerTransformation() {
    const $compact = $('#mg-compact');

    if ($compact.hasClass('transforming')) return;

    if (grimoireOpen) {
        closeGrimoire();
        return;
    }

    $compact.addClass('transforming');
    showSpeech('✨ Let\'s see what the cards reveal...', 2000);

    setTimeout(() => {
        $compact.removeClass('transforming');
        openGrimoire();
    }, 600);
}

export function openGrimoire() {
    if (grimoireOpen) return;
    setGrimoireOpen(true);

    // Remove any existing
    $('#mg-grimoire, #mg-overlay').remove();

    $('body').append(getGrimoireHTML());

    const grimoire = document.getElementById('mg-grimoire');
    const overlay = document.getElementById('mg-overlay');

    if (!grimoire || !overlay) return;

    // Position: center horizontally, constrain within viewport
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;
    const gW = Math.min(300, vpW - 32);
    const gLeft = (vpW - gW) / 2;
    const gTop = Math.max(40, vpH * 0.12);
    const gMaxH = vpH - gTop - 16;

    grimoire.style.setProperty('width', gW + 'px', 'important');
    grimoire.style.setProperty('left', gLeft + 'px', 'important');
    grimoire.style.setProperty('top', gTop + 'px', 'important');
    grimoire.style.setProperty('max-height', gMaxH + 'px', 'important');

    grimoire.style.setProperty('display', 'block', 'important');
    overlay.style.setProperty('display', 'block', 'important');

    requestAnimationFrame(() => {
        grimoire.classList.add('visible');
        overlay.classList.add('visible');
    });

    setupGrimoireEvents();

    console.log(`[${extensionName}] Grimoire opened`);
}

export function closeGrimoire() {
    setGrimoireOpen(false);

    const grimoire = document.getElementById('mg-grimoire');
    const overlay = document.getElementById('mg-overlay');

    if (grimoire) grimoire.classList.remove('visible');
    if (overlay) overlay.classList.remove('visible');

    setTimeout(() => {
        $('#mg-grimoire, #mg-overlay').remove();
    }, 300);

    $('#mg-compact').removeClass('active');
    console.log(`[${extensionName}] Grimoire closed`);
}

// ============================================
// EVENT WIRING
// ============================================

function setupGrimoireEvents() {
    $('#mg-overlay').on('click', closeGrimoire);

    // Tab switching
    $('.mg-tome-tab').on('click', function () {
        const tabName = $(this).data('mg-tab');

        $('.mg-tome-tab').removeClass('active');
        $(this).addClass('active');

        $('.mg-tome-panel').removeClass('active');
        $(`.mg-tome-panel[data-mg-panel="${tabName}"]`).addClass('active');
    });

    // Draw button
    $('#mg-grimoire-draw').on('click', function () {
        onDrawCard();
    });

    // Crystal Ball gaze button
    $('#mg-crystal-gaze').on('click', function () {
        onCrystalGaze();
    });

    // Spell card clicks
    $('.mg-spell-card').on('click', function () {
        const spell = $(this).data('spell');
        onCastSpell(spell, $(this));
    });

    // Ouija ask button
    $('#mg-ouija-ask').on('click', function () {
        onOuijaAsk();
    });

    // Nyx action buttons
    $('.mg-nyx-action-btn').on('click', function () {
        const action = $(this).data('action');
        onNyxAction(action);
    });
}

// ============================================
// CARD DRAW
// ============================================

export function onDrawCard() {
    showCardFlash();
    showSpeech('A card? Very well. Let\'s see what fate has in store...');

    const currentQueue = parseInt($('#mg-tama-queue').text()) || 0;
    $('#mg-tama-queue').text(Math.min(currentQueue + 1, 5));
}

// ============================================
// QUEUE VIEW
// ============================================

export function onViewQueue() {
    const queueCount = parseInt($('#mg-tama-queue').text()) || 0;

    if (queueCount === 0) {
        showSpeech('The queue is empty. Draw something.');
    } else {
        showSpeech(`${queueCount} card${queueCount > 1 ? 's' : ''} await their moment.`);
    }
}

// ============================================
// POKE NYX
// ============================================

export function onPokeNyx() {
    const responses = [
        "*swats your hand away* Don't.",
        "...what do you want?",
        "*stretches* I was napping.",
        "Touch me again and I'll curse you.",
        "Oh, you're still here.",
        "*stares at you with ancient contempt*",
        "*yawns dramatically*",
        "I've lived a thousand years for THIS?"
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];
    showSpeech(response);

    // Disposition shift
    const shift = Math.random() < 0.3 ? 2 : -1;
    extensionSettings.nyx.disposition = Math.max(0, Math.min(100, extensionSettings.nyx.disposition + shift));
    saveSettings();
    updateNyxMood();
}

// ============================================
// CRYSTAL BALL
// ============================================

function onCrystalGaze() {
    const visions = [
        { text: 'A fork in the road... the left path glimmers with possibility.', type: 'choice' },
        { text: 'Someone unexpected will arrive before the story ends.', type: 'character' },
        { text: 'The next conflict will resolve through words, not force.', type: 'tone' },
        { text: 'A secret is about to surface. Be ready.', type: 'plot' },
        { text: 'The mists show... laughter. An unlikely alliance forms.', type: 'social' },
        { text: 'Danger approaches from a direction no one expects.', type: 'threat' },
        { text: 'An old promise resurfaces. It cannot be ignored.', type: 'plot' },
        { text: 'The crystal pulses warmly. A moment of peace is near.', type: 'mood' },
        { text: 'Something precious will be lost... but something greater found.', type: 'bittersweet' },
        { text: 'The spirits are restless. Chaos favors the bold tonight.', type: 'wild' },
        { text: 'A door thought closed swings open again.', type: 'opportunity' },
        { text: 'Beware of the one who smiles too much.', type: 'warning' },
    ];

    const vision = visions[Math.floor(Math.random() * visions.length)];

    // Animate the orb
    const sphere = document.querySelector('.mg-crystal-sphere');
    if (sphere) {
        sphere.classList.add('mg-crystal-active');
        setTimeout(() => sphere.classList.remove('mg-crystal-active'), 2000);
    }

    // Update vision text
    const el = document.getElementById('mg-crystal-vision');
    if (el) {
        el.textContent = vision.text;
        el.dataset.type = vision.type;
    }

    showSpeech(`The crystal shows: "${vision.text}"`, 4000);
}

// ============================================
// SPELLS
// ============================================

function onCastSpell(spellName, $card) {
    const spells = {
        shield: {
            name: 'Aegis',
            cast: ['Aegis shimmers into place! Negative outcomes weakened.', 'The shield holds... for now.', 'A barrier of light surrounds the scene.'],
            cooldown: 3,
        },
        charm: {
            name: 'Charm',
            cast: ['Charm weaves through the air! Social rolls enhanced.', 'Hearts flutter. The charm takes hold.', 'A warm glow settles over the conversation.'],
            cooldown: 3,
        },
        insight: {
            name: 'Insight',
            cast: ['Insight pierces the veil! Hidden details may surface.', 'The third eye opens briefly.', 'Patterns emerge from the chaos. You see more clearly now.'],
            cooldown: 3,
        },
        chaos: {
            name: 'Chaos',
            cast: ['WILD MAGIC SURGE! Anything could happen!', 'The threads of fate tangle and reform!', 'Chaos laughs. The story lurches sideways.'],
            cooldown: 5,
        },
    };

    const spell = spells[spellName];
    if (!spell) return;

    if ($card.hasClass('mg-spell-cooldown')) {
        showSpeech(`${spell.name} is still recharging...`);
        return;
    }

    const result = spell.cast[Math.floor(Math.random() * spell.cast.length)];

    // Visual feedback
    $card.addClass('mg-spell-cast');
    setTimeout(() => $card.removeClass('mg-spell-cast'), 600);

    // Set cooldown
    $card.addClass('mg-spell-cooldown');
    $card.find('.mg-spell-status').text(`Cooldown: ${spell.cooldown}`);

    let remaining = spell.cooldown;
    const cdInterval = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
            clearInterval(cdInterval);
            $card.removeClass('mg-spell-cooldown');
            $card.find('.mg-spell-status').text('Ready');
        } else {
            $card.find('.mg-spell-status').text(`Cooldown: ${remaining}`);
        }
    }, 10000);

    // Log it
    const log = document.getElementById('mg-spell-log');
    if (log) {
        const entry = document.createElement('div');
        entry.className = 'mg-spell-log-entry';
        entry.textContent = `✦ ${result}`;
        if (log.firstChild && log.firstChild.textContent === 'No spells cast yet') {
            log.innerHTML = '';
        }
        log.prepend(entry);
        while (log.children.length > 4) log.removeChild(log.lastChild);
    }

    showSpeech(result, 3000);
}

// ============================================
// OUIJA BOARD
// ============================================

function onOuijaAsk() {
    const responses = [
        { answer: 'YES', flavor: 'The planchette moves decisively to YES.', mood: 'positive' },
        { answer: 'YES', flavor: 'A warm glow passes over the board... YES.', mood: 'positive' },
        { answer: 'NO', flavor: 'The spirits pull firmly toward NO.', mood: 'negative' },
        { answer: 'NO', flavor: 'A chill passes. The answer is NO.', mood: 'negative' },
        { answer: 'MAYBE', flavor: 'The planchette trembles between answers...', mood: 'uncertain' },
        { answer: 'ASK AGAIN', flavor: 'The spirits are unclear. Ask again later.', mood: 'uncertain' },
        { answer: 'BEWARE', flavor: 'The board spells out: B-E-W-A-R-E...', mood: 'warning' },
        { answer: 'SOON', flavor: 'The planchette circles, then settles: SOON.', mood: 'cryptic' },
        { answer: 'NEVER', flavor: 'A cold wind. The spirits say: NEVER.', mood: 'negative' },
        { answer: 'FATE DECIDES', flavor: 'The planchette spins wildly! Fate will decide!', mood: 'wild' },
        { answer: 'GOODBYE', flavor: 'The spirits wish to end the session...', mood: 'cryptic' },
        { answer: 'LOOK BEHIND YOU', flavor: 'The letters glow one by one... unsettling.', mood: 'warning' },
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];

    // Animate planchette
    const planchette = document.getElementById('mg-ouija-planchette');
    if (planchette) {
        planchette.classList.add('mg-ouija-moving');
        setTimeout(() => planchette.classList.remove('mg-ouija-moving'), 1500);
    }

    // Update response area
    const el = document.getElementById('mg-ouija-response');
    if (el) {
        el.innerHTML = `
            <div class="mg-ouija-result mg-ouija-mood-${response.mood}">
                <div class="mg-ouija-answer-text">${response.answer}</div>
                <div class="mg-ouija-flavor-text">${response.flavor}</div>
            </div>
        `;
    }

    showSpeech(response.flavor, 3000);
}

// ============================================
// NYX ACTIONS (within grimoire)
// ============================================

function onNyxAction(action) {
    const responses = {
        treat: ['Nyx accepted the treat graciously. +2', 'Nyx sniffed it and looked unimpressed.', 'Nyx devoured it instantly! +3'],
        advice: ["Nyx says: 'Trust the next card drawn.'", "Nyx says: 'Patience is a virtue you lack.'", 'Nyx stares at you in eloquent silence.'],
        pet: ['Nyx purrs contentedly. +1', 'Nyx tolerates this. Barely.', 'Nyx leans into your hand. +2'],
        tease: ['Nyx narrows her eyes. -1', 'Nyx swats at you dismissively.', 'Nyx pretends not to care. She cares.'],
    };

    const options = responses[action] || ['Nyx ignores you.'];
    const response = options[Math.floor(Math.random() * options.length)];

    // Add to log
    const log = document.getElementById('mg-nyx-log');
    if (log) {
        const entry = document.createElement('div');
        entry.className = 'mg-nyx-log-entry';
        entry.textContent = response;
        log.prepend(entry);

        while (log.children.length > 5) {
            log.removeChild(log.lastChild);
        }
    }

    showSpeech(response, 3000);
}
