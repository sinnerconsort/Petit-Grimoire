/**
 * Petit Grimoire - Magical Girl Fortune Extension
 * A fortune-telling companion for SillyTavern
 * 
 * Architecture: Two independent FABs
 *   - Compact Brooch (main FAB → opens Grimoire)
 *   - Nyx-gotchi (pet widget, independent)
 */

import { 
    getContext, 
    renderExtensionTemplateAsync,
    extension_settings
} from '../../../extensions.js';

import { 
    eventSource, 
    event_types, 
    saveSettingsDebounced
} from '../../../../script.js';

// ============================================
// CONSTANTS
// ============================================

const extensionName = 'petit-grimoire';
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;

// ============================================
// DEFAULT SETTINGS
// ============================================

const defaultSettings = {
    enabled: true,
    
    // Theme & appearance
    shellTheme: 'sailor-moon',
    compactVariant: 'crystal-star',  // crystal-star, cosmic-heart, crescent-wand, communicator, star-locket, silver-crystal
    familiarForm: 'cat',
    
    // Independent sizes
    compactSize: 'medium',   // small, medium, large
    tamaSize: 'medium',      // small, medium, large
    
    // Independent positions (Tribunal pattern)
    compactPosition: {
        top: 'auto',
        left: 'auto',
        right: 20,
        bottom: 100
    },
    tamaPosition: {
        top: 'auto',
        left: 'auto',
        right: 80,
        bottom: 160
    },
    
    // Visibility toggles
    showCompact: true,
    showTama: true,
    
    // Nyx state
    nyx: {
        disposition: 50,
        interestLevel: 'medium',
        lastShiftReason: null,
        totalCardsDrawn: 0,
        totalTriggered: 0,
        totalExpired: 0
    },
    
    // Feature toggles
    features: {
        particleEffects: true,
        soundEffects: true,
        screenFlash: true,
        nyxUnsolicited: true
    }
};

// ============================================
// STATE
// ============================================

let extensionSettings = {};

// Independent drag state per FAB
const dragState = {
    compact: { active: false, moved: false, offset: { x: 0, y: 0 } },
    tama: { active: false, moved: false, offset: { x: 0, y: 0 } }
};

// Sprite animation
let spriteInterval = null;
let currentSpriteFrame = 0;

// ============================================
// SETTINGS MANAGEMENT
// ============================================

function loadSettings() {
    const context = getContext();
    
    if (!context.extensionSettings[extensionName]) {
        context.extensionSettings[extensionName] = {};
    }
    
    extensionSettings = {
        ...defaultSettings,
        ...context.extensionSettings[extensionName]
    };
    
    // Deep merge nested objects
    extensionSettings.nyx = { ...defaultSettings.nyx, ...extensionSettings.nyx };
    extensionSettings.features = { ...defaultSettings.features, ...extensionSettings.features };
    extensionSettings.compactPosition = { ...defaultSettings.compactPosition, ...extensionSettings.compactPosition };
    extensionSettings.tamaPosition = { ...defaultSettings.tamaPosition, ...extensionSettings.tamaPosition };
    
    // Migrate old nyxPosition if present
    if (extensionSettings.nyxPosition && !context.extensionSettings[extensionName].compactPosition) {
        extensionSettings.compactPosition = extensionSettings.nyxPosition;
    }
}

function saveSettings() {
    const context = getContext();
    context.extensionSettings[extensionName] = extensionSettings;
    saveSettingsDebounced();
}

// ============================================
// COMPACT HTML (Shape driven by data-mg-variant)
// ============================================

function getCompactHTML() {
    return `
        <div class="mg-fab mg-compact" id="mg-compact" 
             data-mg-theme="${extensionSettings.shellTheme}" 
             data-mg-variant="${extensionSettings.compactVariant}"
             data-mg-size="${extensionSettings.compactSize || 'medium'}">
            <div class="mg-compact-body">
                <div class="mg-compact-ring">
                    <div class="mg-compact-face">
                        <span class="mg-compact-star">★</span>
                    </div>
                    <span class="mg-compact-gem mg-compact-gem--1"></span>
                    <span class="mg-compact-gem mg-compact-gem--2"></span>
                    <span class="mg-compact-gem mg-compact-gem--3"></span>
                    <span class="mg-compact-gem mg-compact-gem--4"></span>
                </div>
                <div class="mg-compact-sparkles">
                    <span>✦</span><span>✧</span><span>✦</span><span>✧</span>
                </div>
            </div>
            
            <!-- Speech bubble anchored to compact -->
            <div class="mg-speech" id="mg-speech">
                Hello, mortal.
            </div>
        </div>
    `;
}

// ============================================
// TAMA HTML (Independent pet widget)
// ============================================

function getTamaHTML() {
    return `
        <div class="mg-fab mg-tama" id="mg-tama"
             data-mg-theme="${extensionSettings.shellTheme}"
             data-mg-size="${extensionSettings.tamaSize || 'medium'}">
            <div class="mg-tama-shell">
                <div class="mg-tama-screen">
                    <!-- Status bar -->
                    <div class="mg-tama-status">
                        <span>🎴<span id="mg-tama-queue">0</span></span>
                        <span class="mg-tama-heart" id="mg-tama-heart">💜</span>
                        <span>⭐<span id="mg-tama-disposition">${extensionSettings.nyx.disposition}</span></span>
                    </div>
                    
                    <!-- Sprite -->
                    <div class="mg-tama-sprite" id="mg-tama-sprite"></div>
                    
                    <!-- Card flash overlay -->
                    <div class="mg-tama-flash" id="mg-tama-flash">
                        <span class="card-icon">🎴</span>
                    </div>
                    
                    <!-- Mood -->
                    <div class="mg-tama-mood" id="mg-tama-mood">${getMoodText(extensionSettings.nyx.disposition)}</div>
                </div>
                
                <!-- Buttons -->
                <div class="mg-tama-buttons">
                    <button class="mg-tama-btn" id="mg-tama-btn-draw" title="Draw Card">🎴</button>
                    <button class="mg-tama-btn" id="mg-tama-btn-queue" title="Queue">📋</button>
                    <button class="mg-tama-btn" id="mg-tama-btn-poke" title="Poke">👆</button>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// SPRITE SYSTEM
// ============================================

const SPRITES = {
    cat: {
        neutral: [
`  ╱|、
(˚ˎ 。7
 |、˜〵
じしˍ,)ノ`,
`  ╱|、
(˚ˎ 。7
 |、 〵
じしˍ,)ノ`
        ],
        annoyed: [
`  ╱|、
(￣ ಠ 7
 |、˜〵
じしˍ,)ノ`,
`  ╱|、
(￣ ಠ 7
 |، 〵
じしˍ,)ノ`
        ],
        bored: [
`  ╱|、
(˘ˎ ˘7
 |、 〵
じしˍ,)_`
        ],
        amused: [
`  ╱|、
(๑˃̵ᴗ˂̵)7
 |、˜〵
じしˍ,)ノ`,
`  ╱|、
(๑˃̵ᴗ˂̵)7
 |、 〵
じしˍ,)ノ`
        ],
        delighted: [
`  ╱|、 ✧
(˃ᴗ˂ 。7
 |、˜〵
じしˍ,)ノ✧`,
`  ╱|、✧
(˃ᴗ˂ 。7
 |، 〵
じしˍ,)ノ`
        ]
    }
};

function getMoodText(disposition) {
    if (disposition < 20) return 'annoyed';
    if (disposition < 35) return 'bored';
    if (disposition < 60) return 'neutral';
    if (disposition < 80) return 'amused';
    return 'delighted';
}

function getMoodForDisposition(disposition) {
    return getMoodText(disposition);
}

function getCurrentSprite() {
    const form = extensionSettings.familiarForm || 'cat';
    const mood = getMoodForDisposition(extensionSettings.nyx.disposition);
    
    const formSprites = SPRITES[form] || SPRITES.cat;
    const moodFrames = formSprites[mood] || formSprites.neutral;
    
    if (!moodFrames || moodFrames.length === 0) {
        return SPRITES.cat.neutral[0];
    }
    
    return moodFrames[currentSpriteFrame % moodFrames.length];
}

function updateSpriteDisplay() {
    const sprite = document.getElementById('mg-tama-sprite');
    if (sprite) {
        sprite.textContent = getCurrentSprite();
    }
}

function startSpriteAnimation() {
    stopSpriteAnimation();
    updateSpriteDisplay();
    
    spriteInterval = setInterval(() => {
        currentSpriteFrame++;
        updateSpriteDisplay();
    }, 2000);
}

function stopSpriteAnimation() {
    if (spriteInterval) {
        clearInterval(spriteInterval);
        spriteInterval = null;
    }
}

// ============================================
// GENERIC DRAG SYSTEM (reusable per FAB)
// ============================================

function setupFabDrag(elementId, stateKey, positionKey) {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    const state = dragState[stateKey];
    
    function onStart(e) {
        // Don't drag from buttons
        if (e.target.closest('button')) return;
        
        state.active = true;
        state.moved = false;
        el.classList.add('dragging');
        
        const rect = el.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        state.offset.x = clientX - rect.left;
        state.offset.y = clientY - rect.top;
        
        e.preventDefault();
    }
    
    function onMove(e) {
        if (!state.active) return;
        
        state.moved = true;
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        const rect = el.getBoundingClientRect();
        
        let newLeft = clientX - state.offset.x;
        let newTop = clientY - state.offset.y;
        
        // Constrain to viewport
        newLeft = Math.max(5, Math.min(window.innerWidth - rect.width - 5, newLeft));
        newTop = Math.max(5, Math.min(window.innerHeight - rect.height - 5, newTop));
        
        el.style.left = newLeft + 'px';
        el.style.top = newTop + 'px';
        el.style.right = 'auto';
        el.style.bottom = 'auto';
        
        e.preventDefault();
    }
    
    function onEnd() {
        if (!state.active) return;
        
        state.active = false;
        el.classList.remove('dragging');
        
        // Save position
        const rect = el.getBoundingClientRect();
        extensionSettings[positionKey] = {
            top: rect.top,
            left: rect.left,
            right: 'auto',
            bottom: 'auto'
        };
        saveSettings();
    }
    
    el.addEventListener('mousedown', onStart);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
    
    el.addEventListener('touchstart', onStart, { passive: false });
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
}

// ============================================
// POSITION APPLICATION
// ============================================

function applyPosition(elementId, positionKey) {
    const $el = $(`#${elementId}`);
    if ($el.length === 0) return;
    
    const pos = extensionSettings[positionKey];
    
    // Top/Bottom
    if (pos.top !== undefined && pos.top !== 'auto') {
        $el.css({ top: pos.top + 'px', bottom: 'auto' });
    } else if (pos.bottom !== undefined && pos.bottom !== 'auto') {
        $el.css({ bottom: pos.bottom + 'px', top: 'auto' });
    } else {
        $el.css({ bottom: '100px', top: 'auto' });
    }
    
    // Left/Right
    if (pos.left !== undefined && pos.left !== 'auto') {
        $el.css({ left: pos.left + 'px', right: 'auto' });
    } else if (pos.right !== undefined && pos.right !== 'auto') {
        $el.css({ right: pos.right + 'px', left: 'auto' });
    } else {
        $el.css({ right: '20px', left: 'auto' });
    }
}

// ============================================
// COMPACT CREATION & EVENTS
// ============================================

function createCompact() {
    $('#mg-compact').remove();
    
    $('body').append(getCompactHTML());
    
    const $compact = $('#mg-compact');
    if ($compact.length === 0) {
        console.error(`[${extensionName}] Failed to create compact`);
        return;
    }
    
    applyPosition('mg-compact', 'compactPosition');
    setupFabDrag('mg-compact', 'compact', 'compactPosition');
    
    // Click → open grimoire (but not if dragged)
    $compact.on('click', (e) => {
        if (e.target.closest('button')) return;
        e.stopPropagation();
        if (dragState.compact.moved) {
            dragState.compact.moved = false;
            return;
        }
        triggerTransformation();
    });
    
    // Respect visibility setting
    if (!extensionSettings.showCompact) {
        $compact.hide();
    }
    
    console.log(`[${extensionName}] Compact created (${extensionSettings.compactVariant})`);
}

// ============================================
// TAMA CREATION & EVENTS
// ============================================

function createTama() {
    $('#mg-tama').remove();
    
    $('body').append(getTamaHTML());
    
    const $tama = $('#mg-tama');
    if ($tama.length === 0) {
        console.error(`[${extensionName}] Failed to create tama`);
        return;
    }
    
    applyPosition('mg-tama', 'tamaPosition');
    setupFabDrag('mg-tama', 'tama', 'tamaPosition');
    
    // Tama buttons
    $('#mg-tama-btn-draw').on('click', (e) => {
        e.stopPropagation();
        onDrawCard();
    });
    
    $('#mg-tama-btn-queue').on('click', (e) => {
        e.stopPropagation();
        onViewQueue();
    });
    
    $('#mg-tama-btn-poke').on('click', (e) => {
        e.stopPropagation();
        onPokeNyx();
    });
    
    // Respect visibility setting
    if (!extensionSettings.showTama) {
        $tama.hide();
    }
    
    // Start sprite animation
    startSpriteAnimation();
    
    console.log(`[${extensionName}] Tama created`);
}

// ============================================
// GRIMOIRE TRANSFORMATION
// ============================================

function triggerTransformation() {
    const $compact = $('#mg-compact');
    
    if ($compact.hasClass('transforming')) return;
    
    if ($compact.hasClass('active')) {
        closeGrimoire();
        return;
    }
    
    $compact.addClass('transforming');
    showSpeech("✨ Let's see what the cards reveal... ✨", 3000);
    
    setTimeout(() => {
        $compact.removeClass('transforming').addClass('active');
        openGrimoire();
    }, 800);
}

function openGrimoire() {
    console.log(`[${extensionName}] Opening Grimoire...`);
    if (typeof toastr !== 'undefined') {
        toastr.info('✨ Grimoire opened! (Panel coming soon)', 'Petit Grimoire');
    }
}

function closeGrimoire() {
    $('#mg-compact').removeClass('active');
    console.log(`[${extensionName}] Closing Grimoire...`);
}

// ============================================
// BUTTON HANDLERS
// ============================================

function onDrawCard() {
    showCardFlash('🎴');
    showSpeech("A card? Very well. Let's see what fate has in store...");
    
    const currentQueue = parseInt($('#mg-tama-queue').text()) || 0;
    $('#mg-tama-queue').text(Math.min(currentQueue + 1, 5));
}

function onViewQueue() {
    const queueCount = parseInt($('#mg-tama-queue').text()) || 0;
    
    if (queueCount === 0) {
        showSpeech("The queue is empty. Draw something.");
    } else {
        showSpeech(`${queueCount} card${queueCount > 1 ? 's' : ''} await their moment.`);
    }
}

function onPokeNyx() {
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
// CARD FLASH
// ============================================

function showCardFlash(emoji) {
    const flash = document.getElementById('mg-tama-flash');
    if (!flash) return;
    
    const icon = flash.querySelector('.card-icon');
    if (icon) icon.textContent = emoji;
    
    flash.classList.add('visible');
    setTimeout(() => flash.classList.remove('visible'), 600);
}

// ============================================
// SPEECH BUBBLE (anchored to compact)
// ============================================

let speechTimeout = null;

function showSpeech(text, duration = 4000) {
    const speech = document.getElementById('mg-speech');
    if (!speech) return;
    
    clearTimeout(speechTimeout);
    
    speech.textContent = text;
    speech.classList.add('visible');
    
    speechTimeout = setTimeout(() => {
        speech.classList.remove('visible');
    }, duration);
}

// ============================================
// NYX MOOD UPDATE
// ============================================

function updateNyxMood() {
    const disposition = extensionSettings.nyx.disposition;
    const mood = getMoodText(disposition);
    
    $('#mg-tama-mood').text(mood);
    $('#mg-tama-disposition').text(disposition);
    
    currentSpriteFrame = 0;
    updateSpriteDisplay();
    
    const heart = $('#mg-tama-heart');
    if (disposition >= 60) {
        heart.addClass('invested');
    } else {
        heart.removeClass('invested');
    }
}

// ============================================
// THEME & VARIANT SWITCHING
// ============================================

function setTheme(themeName) {
    extensionSettings.shellTheme = themeName;
    $('#mg-compact').attr('data-mg-theme', themeName);
    $('#mg-tama').attr('data-mg-theme', themeName);
    saveSettings();
}

function setCompactVariant(variantName) {
    extensionSettings.compactVariant = variantName;
    // Recreate compact with new variant
    createCompact();
    saveSettings();
}

function setFamiliarForm(formName) {
    extensionSettings.familiarForm = formName;
    currentSpriteFrame = 0;
    updateSpriteDisplay();
    saveSettings();
}

function setCompactSize(size) {
    extensionSettings.compactSize = size;
    $('#mg-compact').attr('data-mg-size', size);
    saveSettings();
}

function setTamaSize(size) {
    extensionSettings.tamaSize = size;
    $('#mg-tama').attr('data-mg-size', size);
    saveSettings();
}

// ============================================
// SETTINGS PANEL
// ============================================

async function addExtensionSettings() {
    const html = `
        <div class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
                <b>📖 Petit Grimoire</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content">
                <label class="checkbox_label">
                    <input type="checkbox" id="mg-enabled" ${extensionSettings.enabled ? 'checked' : ''}>
                    <span>Enable Extension</span>
                </label>
                
                <hr>
                <h5>Compact Brooch</h5>
                
                <label for="mg-compact-variant">Compact Style:</label>
                <select id="mg-compact-variant" class="text_pole">
                    <option value="crystal-star" ${extensionSettings.compactVariant === 'crystal-star' ? 'selected' : ''}>Crystal Star Brooch</option>
                    <option value="cosmic-heart" ${extensionSettings.compactVariant === 'cosmic-heart' ? 'selected' : ''}>Cosmic Heart</option>
                    <option value="crescent-wand" ${extensionSettings.compactVariant === 'crescent-wand' ? 'selected' : ''}>Crescent Wand</option>
                    <option value="communicator" ${extensionSettings.compactVariant === 'communicator' ? 'selected' : ''}>Communicator</option>
                    <option value="star-locket" ${extensionSettings.compactVariant === 'star-locket' ? 'selected' : ''}>Star Locket</option>
                    <option value="silver-crystal" ${extensionSettings.compactVariant === 'silver-crystal' ? 'selected' : ''}>Silver Crystal</option>
                </select>
                
                <label for="mg-theme">Color Theme:</label>
                <select id="mg-theme" class="text_pole">
                    <option value="sailor-moon" ${extensionSettings.shellTheme === 'sailor-moon' ? 'selected' : ''}>Sailor Moon</option>
                    <option value="madoka" ${extensionSettings.shellTheme === 'madoka' ? 'selected' : ''}>Madoka</option>
                    <option value="witch-core" ${extensionSettings.shellTheme === 'witch-core' ? 'selected' : ''}>Witch Core</option>
                    <option value="pastel-goth" ${extensionSettings.shellTheme === 'pastel-goth' ? 'selected' : ''}>Pastel Goth</option>
                    <option value="y2k" ${extensionSettings.shellTheme === 'y2k' ? 'selected' : ''}>Y2K</option>
                    <option value="classic" ${extensionSettings.shellTheme === 'classic' ? 'selected' : ''}>Classic</option>
                </select>
                
                <label for="mg-compact-size">Compact Size:</label>
                <select id="mg-compact-size" class="text_pole">
                    <option value="small" ${extensionSettings.compactSize === 'small' ? 'selected' : ''}>Small</option>
                    <option value="medium" ${extensionSettings.compactSize === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="large" ${extensionSettings.compactSize === 'large' ? 'selected' : ''}>Large</option>
                </select>
                
                <label class="checkbox_label">
                    <input type="checkbox" id="mg-show-compact" ${extensionSettings.showCompact !== false ? 'checked' : ''}>
                    <span>Show Compact</span>
                </label>
                
                <hr>
                <h5>Nyx-gotchi</h5>
                
                <label for="mg-familiar">Familiar Form:</label>
                <select id="mg-familiar" class="text_pole">
                    <option value="cat" ${extensionSettings.familiarForm === 'cat' ? 'selected' : ''}>Cat</option>
                    <option value="owl" ${extensionSettings.familiarForm === 'owl' ? 'selected' : ''}>Owl</option>
                    <option value="fox" ${extensionSettings.familiarForm === 'fox' ? 'selected' : ''}>Fox</option>
                    <option value="bunny" ${extensionSettings.familiarForm === 'bunny' ? 'selected' : ''}>Bunny</option>
                </select>
                
                <label for="mg-tama-size">Tama Size:</label>
                <select id="mg-tama-size" class="text_pole">
                    <option value="small" ${extensionSettings.tamaSize === 'small' ? 'selected' : ''}>Small</option>
                    <option value="medium" ${extensionSettings.tamaSize === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="large" ${extensionSettings.tamaSize === 'large' ? 'selected' : ''}>Large</option>
                </select>
                
                <label class="checkbox_label">
                    <input type="checkbox" id="mg-show-tama" ${extensionSettings.showTama !== false ? 'checked' : ''}>
                    <span>Show Nyx-gotchi</span>
                </label>
                
                <hr>
                
                <div class="flex-container">
                    <span>Nyx Disposition: </span>
                    <span id="mg-disposition-display">${extensionSettings.nyx.disposition}</span>
                </div>
                
                <hr>
                
                <div class="flex-container">
                    <input type="button" id="mg-reset-positions" class="menu_button" value="Reset Positions">
                </div>
            </div>
        </div>
    `;
    
    $('#extensions_settings2').append(html);
    
    // ---- Event handlers ----
    
    $('#mg-enabled').on('change', function() {
        extensionSettings.enabled = $(this).prop('checked');
        saveSettings();
        
        if (extensionSettings.enabled) {
            createCompact();
            createTama();
        } else {
            $('#mg-compact').remove();
            $('#mg-tama').remove();
            stopSpriteAnimation();
        }
    });
    
    $('#mg-compact-variant').on('change', function() {
        setCompactVariant($(this).val());
    });
    
    $('#mg-theme').on('change', function() {
        setTheme($(this).val());
    });
    
    $('#mg-compact-size').on('change', function() {
        setCompactSize($(this).val());
    });
    
    $('#mg-familiar').on('change', function() {
        setFamiliarForm($(this).val());
    });
    
    $('#mg-tama-size').on('change', function() {
        setTamaSize($(this).val());
    });
    
    $('#mg-show-compact').on('change', function() {
        extensionSettings.showCompact = $(this).prop('checked');
        saveSettings();
        if (extensionSettings.showCompact) {
            $('#mg-compact').show();
        } else {
            $('#mg-compact').hide();
        }
    });
    
    $('#mg-show-tama').on('change', function() {
        extensionSettings.showTama = $(this).prop('checked');
        saveSettings();
        if (extensionSettings.showTama) {
            $('#mg-tama').show();
        } else {
            $('#mg-tama').hide();
        }
    });
    
    $('#mg-reset-positions').on('click', function() {
        extensionSettings.compactPosition = { ...defaultSettings.compactPosition };
        extensionSettings.tamaPosition = { ...defaultSettings.tamaPosition };
        applyPosition('mg-compact', 'compactPosition');
        applyPosition('mg-tama', 'tamaPosition');
        saveSettings();
        if (typeof toastr !== 'undefined') {
            toastr.info('Positions reset!');
        }
    });
}

// ============================================
// INITIALIZATION
// ============================================

jQuery(async () => {
    try {
        console.log(`[${extensionName}] Starting initialization...`);
        
        loadSettings();
        
        await addExtensionSettings();
        
        if (extensionSettings.enabled) {
            createCompact();
            createTama();
        }
        
        console.log(`[${extensionName}] ✅ Loaded successfully`);
        
    } catch (error) {
        console.error(`[${extensionName}] ❌ Critical failure:`, error);
        if (typeof toastr !== 'undefined') {
            toastr.error('Petit Grimoire failed to initialize.', 'Error', { timeOut: 10000 });
        }
    }
});

// ============================================
// EXPORTS (for debugging)
// ============================================

window.PetitGrimoire = {
    getSettings: () => extensionSettings,
    setTheme,
    setCompactVariant,
    setFamiliarForm,
    setCompactSize,
    setTamaSize,
    showSpeech,
    updateNyxMood,
    triggerTransformation,
    openGrimoire,
    closeGrimoire
};
