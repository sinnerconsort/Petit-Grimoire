/**
 * Petit Grimoire — Grimoire Panel
 * Tome HTML, open/close, tab switching, all subsystem actions
 */

import {
    extensionName, extensionSettings,
    grimoireOpen, setGrimoireOpen,
    saveSettings
} from './state.js';
import { showSpeech, showCardFlash, updateNyxMood, getMoodText, playSpecialAnimation } from './nyxgotchi.js';
import { getSettingsPanelHTML, initSettings } from './settings.js';

// ============================================
// GRIMOIRE HTML
// ============================================

export function getGrimoireHTML() {
    return `
        <div class="mg-overlay" id="mg-overlay"></div>
        <div class="mg-grimoire mg-fab" id="mg-grimoire" data-mg-theme="${extensionSettings.shellTheme}">
            <div class="mg-tome">
                <span class="mg-tome-gem mg-tome-gem--tl"></span>
                <span class="mg-tome-gem mg-tome-gem--tr"></span>
                <span class="mg-tome-gem mg-tome-gem--bl"></span>
                <span class="mg-tome-gem mg-tome-gem--br"></span>
                <div class="mg-tome-border"></div>

                <div class="mg-tome-page">
                    <div class="mg-tome-layout">
                        <div class="mg-tome-tabs">
                            <button class="mg-tome-tab active" data-mg-tab="cards">
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="1" width="10" height="14" rx="1.5"/><path d="M6 5.5l-1 2.5h3l-1 2.5"/></svg>
                                <span>Cards</span>
                            </button>
                            <button class="mg-tome-tab" data-mg-tab="crystal">
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="5"/><ellipse cx="8" cy="13" rx="4" ry="1.5"/></svg>
                                <span>Crystal</span>
                            </button>
                            <button class="mg-tome-tab" data-mg-tab="spells">
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 1l1 3h3l-2.5 2 1 3L8 7.5 5.5 9l1-3L4 4h3z"/></svg>
                                <span>Spells</span>
                            </button>
                            <button class="mg-tome-tab" data-mg-tab="queue">
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="4" y1="3" x2="13" y2="3"/><line x1="4" y1="8" x2="13" y2="8"/><line x1="4" y1="13" x2="13" y2="13"/></svg>
                                <span>Queue</span>
                            </button>
                            <button class="mg-tome-tab" data-mg-tab="ouija">
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="8" cy="8" rx="7" ry="5.5"/><circle cx="8" cy="7" r="2" opacity="0.5"/></svg>
                                <span>Ouija</span>
                            </button>
                            <button class="mg-tome-tab" data-mg-tab="nyx">
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M8 14s-5.5-4.5-6.5-7C.5 4.5 2 2 4.5 2 6 2 7.5 3.5 8 4.5 8.5 3.5 10 2 11.5 2 14 2 15.5 4.5 14.5 7 13.5 9.5 8 14 8 14z"/></svg>
                                <span>Nyx</span>
                            </button>
                            <button class="mg-tome-tab" data-mg-tab="settings">
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="2"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M2.9 2.9l1.4 1.4M11.7 11.7l1.4 1.4M2.9 13.1l1.4-1.4M11.7 4.3l1.4-1.4"/></svg>
                                <span>Config</span>
                            </button>
                        </div>

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
                                <div class="mg-tome-flavor">Cards drawn, awaiting their moment</div>
                                <div class="mg-queue-list" id="mg-queue-list">
                                    <div class="mg-queue-empty">The queue is empty. Draw some cards!</div>
                                </div>
                                <div class="mg-queue-footer" id="mg-queue-footer">0 of 5 slots filled</div>
                            </div>

                            <!-- Crystal Ball Tab -->
                            <div class="mg-tome-panel" data-mg-panel="crystal">
                                <div class="mg-tome-heading">Crystal Ball</div>
                                <div class="mg-tome-flavor">Wild magic swirls within...</div>
                                <div class="mg-crystal-orb">
                                    <div class="mg-crystal-sphere">
                                        <div class="mg-crystal-mist"></div>
                                        <div class="mg-crystal-mist mg-crystal-mist--2"></div>
                                        <div class="mg-crystal-glint"></div>
                                    </div>
                                    <div class="mg-crystal-base"></div>
                                </div>
                                <button class="mg-tome-btn mg-crystal-gaze-btn" id="mg-crystal-gaze">
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="5"/></svg>
                                    Gaze into the Mist
                                </button>
                                <div class="mg-tome-section">
                                    <div class="mg-tome-section-title">Last Vision</div>
                                    <div class="mg-crystal-vision" id="mg-crystal-vision">The mists have not yet parted...</div>
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
                                        <span class="mg-ouija-answer">YES</span>
                                        <span class="mg-ouija-sun">☀</span>
                                        <span class="mg-ouija-answer">NO</span>
                                    </div>
                                    <div class="mg-ouija-letters">
                                        <div class="mg-ouija-row">ABCDEFGHIJKLM</div>
                                        <div class="mg-ouija-row">NOPQRSTUVWXYZ</div>
                                    </div>
                                    <div class="mg-ouija-row mg-ouija-numbers">1234567890</div>
                                    <div class="mg-ouija-farewell">GOODBYE</div>
                                </div>
                                <div class="mg-ouija-planchette" id="mg-ouija-planchette"><div class="mg-ouija-lens"></div></div>
                                <button class="mg-tome-btn mg-ouija-ask-btn" id="mg-ouija-ask">Ask the Spirits</button>
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
                                        <span class="mg-nyx-score" id="mg-nyx-score">${extensionSettings.nyx?.disposition ?? 50}</span>
                                    </div>
                                    <div class="mg-nyx-bar">
                                        <div class="mg-nyx-bar-fill" id="mg-nyx-bar" style="width:${extensionSettings.nyx?.disposition ?? 50}%"></div>
                                    </div>
                                    <div class="mg-nyx-bar-labels"><span>hostile</span><span>neutral</span><span>devoted</span></div>
                                </div>
                                <div class="mg-nyx-mood" id="mg-nyx-mood-text">Currently: <b>${getMoodText(extensionSettings.nyx?.disposition ?? 50)}</b></div>
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

                            <!-- Settings Tab -->
                            <div class="mg-tome-panel" data-mg-panel="settings">
                                ${getSettingsPanelHTML()}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mg-tome-clasp" id="mg-grimoire-close"><div class="mg-tome-clasp-dot"></div></div>
            </div>
        </div>
    `;
}

// ============================================
// OPEN / CLOSE - FASTER & MORE RELIABLE
// ============================================

let transformLock = false;

export function triggerTransformation() {
    if (transformLock) return;
    
    if (grimoireOpen) {
        closeGrimoire();
        return;
    }

    transformLock = true;
    const $compact = $('#mg-compact');
    $compact.addClass('transforming');

    // FASTER: 250ms instead of 600ms
    setTimeout(() => {
        $compact.removeClass('transforming');
        openGrimoire();
        setTimeout(() => { transformLock = false; }, 100);
    }, 250);
}

export function openGrimoire() {
    try {
        if (grimoireOpen) return;
        setGrimoireOpen(true);

        $('#mg-grimoire, #mg-overlay').remove();
        $('body').append(getGrimoireHTML());

        const grimoire = document.getElementById('mg-grimoire');
        const overlay = document.getElementById('mg-overlay');

        if (!grimoire || !overlay) {
            setGrimoireOpen(false);
            transformLock = false;
            return;
        }

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
            requestAnimationFrame(() => {
                grimoire.classList.add('visible');
                overlay.classList.add('visible');
            });
        });

        setupGrimoireEvents();
        $('#mg-compact').addClass('active');
        console.log(`[${extensionName}] Grimoire opened`);
    } catch (err) {
        console.error(`[${extensionName}] openGrimoire error:`, err);
        setGrimoireOpen(false);
        transformLock = false;
    }
}

export function closeGrimoire() {
    if (!grimoireOpen) return;
    setGrimoireOpen(false);
    transformLock = false;

    const grimoire = document.getElementById('mg-grimoire');
    const overlay = document.getElementById('mg-overlay');

    if (grimoire) grimoire.classList.remove('visible');
    if (overlay) overlay.classList.remove('visible');

    setTimeout(() => { $('#mg-grimoire, #mg-overlay').remove(); }, 300);
    $('#mg-compact').removeClass('active transforming');
    console.log(`[${extensionName}] Grimoire closed`);
}

// ============================================
// EVENT WIRING
// ============================================

function setupGrimoireEvents() {
    $('#mg-overlay').on('click', closeGrimoire);
    $('#mg-grimoire-close').on('click', closeGrimoire);

    $('.mg-tome-tab').on('click', function () {
        const tabName = $(this).data('mg-tab');
        $('.mg-tome-tab').removeClass('active');
        $(this).addClass('active');
        $('.mg-tome-panel').removeClass('active');
        $(`.mg-tome-panel[data-mg-panel="${tabName}"]`).addClass('active');
    });

    $('#mg-grimoire-draw').on('click', onDrawCard);
    $('#mg-crystal-gaze').on('click', onCrystalGaze);
    $('.mg-spell-card').on('click', function () { onCastSpell($(this).data('spell'), $(this)); });
    $('#mg-ouija-ask').on('click', onOuijaAsk);
    $('.mg-nyx-action-btn').on('click', function () { onNyxAction($(this).data('action')); });
    
    initSettings();
}

// ============================================
// CARD DRAW
// ============================================

export function onDrawCard() {
    showCardFlash();
    showSpeech('A card? Very well. Let\'s see what fate has in store...');
    playSpecialAnimation('amused', 2);
    const currentQueue = parseInt($('#mg-tama-queue').text()) || 0;
    $('#mg-tama-queue').text(Math.min(currentQueue + 1, 5));
}

export function onViewQueue() {
    const queueCount = parseInt($('#mg-tama-queue').text()) || 0;
    showSpeech(queueCount === 0 ? 'The queue is empty. Draw something.' : `${queueCount} card${queueCount > 1 ? 's' : ''} await their moment.`);
}

export function onPokeNyx() {
    const responses = [
        { text: "*swats your hand away* Don't.", anim: 'annoyed' },
        { text: "...what do you want?", anim: 'bored' },
        { text: "*stretches* I was napping.", anim: 'bored' },
        { text: "Touch me again and I'll curse you.", anim: 'annoyed' },
        { text: "Oh, you're still here.", anim: 'bored' },
        { text: "I've lived a thousand years for THIS?", anim: 'annoyed' },
    ];
    const response = responses[Math.floor(Math.random() * responses.length)];
    showSpeech(response.text);
    if (Math.random() < 0.3) shiftDisposition(-1);
    playSpecialAnimation(response.anim, 1.5);
}

// ============================================
// CRYSTAL BALL
// ============================================

function onCrystalGaze() {
    const sphere = document.querySelector('.mg-crystal-sphere');
    if (sphere) {
        sphere.classList.add('mg-crystal-active');
        setTimeout(() => sphere.classList.remove('mg-crystal-active'), 3000);
    }

    const visions = [
        { text: "Shadows gather at the edges of your path...", type: 'warning' },
        { text: "A door opens where none stood before.", type: 'opportunity' },
        { text: "Someone watches from the darkness.", type: 'mystery' },
        { text: "The threads of fate twist unexpectedly.", type: 'change' },
        { text: "A forgotten truth stirs in the depths.", type: 'revelation' },
        { text: "Light breaks through gathering clouds.", type: 'hope' },
        { text: "The crystal shows only swirling mist...", type: 'unclear' },
        { text: "A choice approaches. Both paths have thorns.", type: 'choice' },
    ];

    const vision = visions[Math.floor(Math.random() * visions.length)];
    const el = document.getElementById('mg-crystal-vision');
    if (el) el.textContent = vision.text;
    showSpeech(vision.text, 4000);
    playSpecialAnimation('amused', 2);
}

// ============================================
// SPELLS
// ============================================

function onCastSpell(spellName, $card) {
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
        shield: ["Aegis shimmers around you, deflecting misfortune.", "A protective ward rises, invisible but present."],
        charm: ["Charm weaves through your words, honeying them.", "A subtle enchantment makes you more... likeable."],
        insight: ["Your perception sharpens. Hidden things reveal themselves.", "The veil thins—you see what others miss."],
        chaos: ["Chaos unleashed! The narrative twists wildly!", "Wild magic surges—anything could happen!"],
    };

    const pool = effects[spellName] || ["The spell fizzles."];
    const result = pool[Math.floor(Math.random() * pool.length)];

    const log = document.getElementById('mg-spell-log');
    if (log) {
        const entry = document.createElement('div');
        entry.className = 'mg-spell-log-entry';
        entry.textContent = `✦ ${result}`;
        if (log.firstChild?.textContent === 'No spells cast yet') log.innerHTML = '';
        log.prepend(entry);
        while (log.children.length > 4) log.removeChild(log.lastChild);
    }

    showSpeech(result, 3000);
    playSpecialAnimation(spellName === 'chaos' ? 'delighted' : 'amused', 2);
}

// ============================================
// OUIJA BOARD
// ============================================

function onOuijaAsk() {
    const responses = [
        { answer: 'YES', flavor: 'The planchette moves decisively to YES.', mood: 'positive' },
        { answer: 'NO', flavor: 'The spirits pull firmly toward NO.', mood: 'negative' },
        { answer: 'MAYBE', flavor: 'The planchette trembles between answers...', mood: 'uncertain' },
        { answer: 'BEWARE', flavor: 'The board spells out: B-E-W-A-R-E...', mood: 'warning' },
        { answer: 'SOON', flavor: 'The planchette circles, then settles: SOON.', mood: 'cryptic' },
        { answer: 'NEVER', flavor: 'A cold wind. The spirits say: NEVER.', mood: 'negative' },
        { answer: 'GOODBYE', flavor: 'The spirits wish to end the session...', mood: 'cryptic' },
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];

    const planchette = document.getElementById('mg-ouija-planchette');
    if (planchette) {
        planchette.classList.add('mg-ouija-moving');
        setTimeout(() => planchette.classList.remove('mg-ouija-moving'), 1500);
    }

    const el = document.getElementById('mg-ouija-response');
    if (el) {
        el.innerHTML = `<div class="mg-ouija-result mg-ouija-mood-${response.mood}">
            <div class="mg-ouija-answer-text">${response.answer}</div>
            <div class="mg-ouija-flavor-text">${response.flavor}</div>
        </div>`;
    }

    showSpeech(response.flavor, 3000);
    const ouijaAnim = { positive: 'amused', negative: 'annoyed', warning: 'annoyed', cryptic: 'bored', uncertain: 'bored' };
    playSpecialAnimation(ouijaAnim[response.mood] || 'bored', 2);
}

// ============================================
// NYX HELPERS
// ============================================

export function updateNyxPanel() {
    const d = extensionSettings.nyx?.disposition ?? 50;
    $('#mg-nyx-score').text(d);
    $('#mg-nyx-bar').css('width', d + '%');
    $('#mg-nyx-mood-text').html(`Currently: <b>${getMoodText(d)}</b>`);
}

export function shiftDisposition(amount) {
    if (!extensionSettings.nyx) extensionSettings.nyx = { disposition: 50 };
    extensionSettings.nyx.disposition = Math.max(0, Math.min(100, extensionSettings.nyx.disposition + amount));
    saveSettings();
    updateNyxMood();
    updateNyxPanel();
}

function onNyxAction(action) {
    const responses = {
        treat: [['Nyx accepted the treat graciously.', 2, 'delighted'], ['Nyx sniffed it and looked unimpressed.', 0, 'bored'], ['Nyx devoured it instantly!', 3, 'delighted']],
        advice: [["Nyx says: 'Trust the next card drawn.'", 0, null], ["Nyx says: 'Patience is a virtue you lack.'", 0, 'annoyed'], ['Nyx stares at you in eloquent silence.', 0, 'bored']],
        pet: [['Nyx purrs contentedly.', 1, 'amused'], ['Nyx tolerates this. Barely.', 0, 'bored'], ['Nyx leans into your hand.', 2, 'delighted']],
        tease: [['Nyx narrows her eyes.', -1, 'annoyed'], ['Nyx swats at you dismissively.', -2, 'annoyed'], ['Nyx pretends not to care. She cares.', 0, 'bored']],
    };

    const options = responses[action] || [['Nyx ignores you.', 0, null]];
    const [text, shift, anim] = options[Math.floor(Math.random() * options.length)];

    let displayText = '› ' + text;
    if (shift > 0) displayText += ` +${shift}`;
    else if (shift < 0) displayText += ` ${shift}`;

    if (shift !== 0) shiftDisposition(shift);
    if (anim) playSpecialAnimation(anim, 2);

    const log = document.getElementById('mg-nyx-log');
    if (log) {
        const entry = document.createElement('div');
        entry.className = 'mg-nyx-log-entry';
        entry.textContent = displayText;
        log.prepend(entry);
        while (log.children.length > 5) log.removeChild(log.lastChild);
    }

    showSpeech(text, 3000);
}
