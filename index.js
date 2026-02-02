/**
 * Magical Girl Extension
 * A fortune-telling companion for SillyTavern
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
    
    // Theme settings
    shellTheme: 'sailor-moon',  // sailor-moon, madoka, witch-core, pastel-goth, y2k, classic
    familiarForm: 'cat',        // cat, crow, fox, moth, rabbit, serpent
    shellScale: 'medium',       // small, medium, large
    
    // Nyx-gotchi position (saved for persistence) - using top/left like Tribunal
    nyxPosition: {
        top: 70,
        left: 'auto',
        right: 20,
        bottom: 'auto'
    },
    
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
let isDragging = false;
let dragOffset = { x: 0, y: 0 };
let dragMoved = false;

// ============================================
// SETTINGS MANAGEMENT
// ============================================

function loadSettings() {
    const context = getContext();
    
    // Initialize if not exists
    if (!context.extensionSettings[extensionName]) {
        context.extensionSettings[extensionName] = {};
    }
    
    // Merge with defaults
    extensionSettings = {
        ...defaultSettings,
        ...context.extensionSettings[extensionName]
    };
    
    // Ensure nested objects are merged properly
    extensionSettings.nyx = { ...defaultSettings.nyx, ...extensionSettings.nyx };
    extensionSettings.features = { ...defaultSettings.features, ...extensionSettings.features };
    extensionSettings.nyxPosition = { ...defaultSettings.nyxPosition, ...extensionSettings.nyxPosition };
    
    console.log(`[${extensionName}] Settings loaded:`, extensionSettings);
}

function saveSettings() {
    const context = getContext();
    context.extensionSettings[extensionName] = extensionSettings;
    saveSettingsDebounced();
}

// ============================================
// MAIN WIDGET HTML
// ============================================

function getWidgetHTML() {
    return `
        <div class="mg-widget" id="mg-widget" data-mg-theme="${extensionSettings.shellTheme}" data-mg-scale="${extensionSettings.shellScale || 'medium'}">
            
            <!-- Thought bubble (hidden by default) -->
            <div class="nyxgotchi-thought" id="nyxgotchi-speech">
                Hello, mortal.
            </div>
            
            <!-- Tamagotchi Widget (above compact) -->
            <div class="mg-tamagotchi" id="mg-tamagotchi">
                <div class="mg-tama-screen">
                    <!-- Status bar -->
                    <div class="mg-tama-status">
                        <span>🎴<span id="nyxgotchi-queue">0</span></span>
                        <span class="nyxgotchi-heart" id="nyxgotchi-heart">💜</span>
                        <span>⭐<span id="nyxgotchi-disposition">${extensionSettings.nyx.disposition}</span></span>
                    </div>
                    
                    <!-- Sprite -->
                    <div class="mg-tama-sprite" id="nyxgotchi-sprite"></div>
                    
                    <!-- Card flash overlay -->
                    <div class="nyxgotchi-card-flash" id="nyxgotchi-card-flash">
                        <span class="card-icon">🎴</span>
                    </div>
                    
                    <!-- Mood -->
                    <div class="mg-tama-mood" id="nyxgotchi-mood">${getMoodText(extensionSettings.nyx.disposition)}</div>
                </div>
                
                <!-- Tama buttons -->
                <div class="mg-tama-buttons">
                    <button class="mg-tama-btn" id="nyxgotchi-btn-draw" title="Draw Card">🎴</button>
                    <button class="mg-tama-btn" id="nyxgotchi-btn-queue" title="Queue">📋</button>
                    <button class="mg-tama-btn" id="nyxgotchi-btn-poke" title="Poke">👆</button>
                </div>
            </div>
            
            <!-- Compact Brooch (main FAB) -->
            <div class="mg-compact" id="mg-compact">
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
        </div>
    `;
}

// ============================================
// SPRITE SYSTEM
// ============================================

// Sprites organized by: animal -> mood -> frames[]
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
(≧◡≦)7
 |、˜〵
じしˍ,)ノ`,
`  ╱|、✧
(≧◡≦)7
 |、 〵 ✧
じしˍ,)ノ`
        ]
    },
    owl: {
        neutral: [
` ,___,
[O . o]
/)___)
-"--"-`,
` ,___,
[o . O]
/)___)
-"--"-`
        ],
        annoyed: [
` ,___,
[◣_◢]
/)___)
-"--"-`
        ],
        bored: [
` ,_____,
[◡ , ◡] ☾
(____)(\\
-"---"--`
        ],
        amused: [
` ,___,
[◉◡◉]
/)___)
-"--"-`,
` ,___,
[◉◡◉]
/)__) ~
-"--"-`
        ],
        delighted: [
` ,___,  ✦
[★‿★]
/)___)
-"--"-`,
` ,___, ✦
[★‿★]  
/)__) ♪
-"--"-`
        ]
    },
    fox: {
        neutral: [
`  ∧ ∧
(• x •)
 /づ づ`,
`  ∧ ∧
(• x •)
 /づづ`
        ],
        annoyed: [
`  ∧ ∧
(≖ x ≖)
 /づ づ`
        ],
        bored: [
`  ∧ ∧
(︶ x ︶)
  /づ_`
        ],
        amused: [
`  ∧ ∧
(◕ ᴥ ◕)
 /づ づ`,
`  ∧ ∧  ~
(◕ ᴥ ◕)
 /づづ`
        ],
        delighted: [
`  ∧ ∧ ✧
(≧ω≦)
 /づ づ`,
`  ∧ ∧✧
(≧ω≦) ♡
 /づづ`
        ]
    },
    bunny: {
        neutral: [
` () ()
(• . •)
c(")(")`
        ],
        annoyed: [
` () ()
(￫ . ￩)
c(")(")`
        ],
        bored: [
` (\\__/)
(︶.︶)
(")_(")`
        ],
        amused: [
` () ()
(◕‿◕)
c(")(")`,
` ()⌒()
(◕‿◕)
c(")(")`
        ],
        delighted: [
` () () ♡
(≧◡≦)
c(")(")`,
`♡() ()
(≧◡≦)✧
c(")(")`
        ]
    }
};

// Animation state
let spriteAnimationInterval = null;
let currentSpriteFrame = 0;

function getCurrentSprite() {
    const form = extensionSettings.familiarForm || 'cat';
    const disposition = extensionSettings.nyx?.disposition || 50;
    const mood = getMoodText(disposition);
    
    const animalSprites = SPRITES[form] || SPRITES.cat;
    const moodFrames = animalSprites[mood] || animalSprites.neutral;
    
    return moodFrames;
}

function renderSprite() {
    const frames = getCurrentSprite();
    currentSpriteFrame = currentSpriteFrame % frames.length;
    const frame = frames[currentSpriteFrame];
    
    $('#nyxgotchi-sprite').html(`<pre>${frame}</pre>`);
}

function startSpriteAnimation() {
    // Clear any existing animation
    if (spriteAnimationInterval) {
        clearInterval(spriteAnimationInterval);
    }
    
    // Initial render
    currentSpriteFrame = 0;
    renderSprite();
    
    // Cycle frames every 800ms
    spriteAnimationInterval = setInterval(() => {
        currentSpriteFrame++;
        renderSprite();
    }, 800);
}

function stopSpriteAnimation() {
    if (spriteAnimationInterval) {
        clearInterval(spriteAnimationInterval);
        spriteAnimationInterval = null;
    }
}

// Alias for external use
function updateSpriteDisplay() {
    renderSprite();
}

// Get mood text based on disposition
function getMoodText(disposition) {
    if (disposition < 20) return 'annoyed';
    if (disposition < 40) return 'bored';
    if (disposition < 60) return 'neutral';
    if (disposition < 80) return 'amused';
    return 'delighted';
}

// ============================================
// COMPACT FAB CREATION
// ============================================

// ============================================
// WIDGET CREATION
// ============================================

function createWidget() {
    // Remove existing
    $('#mg-widget').remove();
    
    console.log(`[${extensionName}] Creating widget...`);
    
    // Add to DOM
    $('body').append(getWidgetHTML());
    
    const $widget = $('#mg-widget');
    if ($widget.length === 0) {
        console.error(`[${extensionName}] Failed to create widget!`);
        if (typeof toastr !== 'undefined') {
            toastr.error('Failed to create widget!', 'Petit Grimoire');
        }
        return;
    }
    
    // Apply saved position
    applyWidgetPosition();
    
    // Wire up all events
    setupWidgetEvents();
    
    // Start sprite animation
    startSpriteAnimation();
    
    console.log(`[${extensionName}] Widget created successfully`);
}

function applyWidgetPosition() {
    const $widget = $('#mg-widget');
    if ($widget.length === 0) return;
    
    const pos = extensionSettings.nyxPosition;
    
    if (pos.top !== undefined && pos.top !== 'auto') {
        $widget.css({ top: pos.top + 'px', bottom: 'auto' });
    } else if (pos.bottom !== undefined && pos.bottom !== 'auto') {
        $widget.css({ bottom: pos.bottom + 'px', top: 'auto' });
    } else {
        $widget.css({ bottom: '100px', top: 'auto' });
    }
    
    if (pos.right !== undefined && pos.right !== 'auto') {
        $widget.css({ right: pos.right + 'px', left: 'auto' });
    } else if (pos.left !== undefined && pos.left !== 'auto') {
        $widget.css({ left: pos.left + 'px', right: 'auto' });
    } else {
        $widget.css({ right: '20px', left: 'auto' });
    }
}

// ============================================
// DRAGGING (drag by compact, moves whole widget)
// ============================================

function setupDragging() {
    const compact = document.getElementById('mg-compact');
    if (!compact) return;
    
    // Drag by the compact brooch
    compact.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
    
    compact.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', endDrag);
}

function startDrag(e) {
    const widget = document.getElementById('mg-widget');
    if (!widget) return;
    
    isDragging = true;
    dragMoved = false;
    widget.classList.add('dragging');
    
    const rect = widget.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    dragOffset.x = clientX - rect.left;
    dragOffset.y = clientY - rect.top;
    
    e.preventDefault();
}

function drag(e) {
    if (!isDragging) return;
    
    dragMoved = true;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const widget = document.getElementById('mg-widget');
    const rect = widget.getBoundingClientRect();
    
    let newLeft = clientX - dragOffset.x;
    let newTop = clientY - dragOffset.y;
    
    // Constrain to viewport
    newLeft = Math.max(10, Math.min(window.innerWidth - rect.width - 10, newLeft));
    newTop = Math.max(10, Math.min(window.innerHeight - rect.height - 10, newTop));
    
    widget.style.left = newLeft + 'px';
    widget.style.top = newTop + 'px';
    widget.style.right = 'auto';
    widget.style.bottom = 'auto';
    
    e.preventDefault();
}

function endDrag() {
    if (!isDragging) return;
    
    isDragging = false;
    const widget = document.getElementById('mg-widget');
    widget.classList.remove('dragging');
    
    const rect = widget.getBoundingClientRect();
    extensionSettings.nyxPosition = {
        top: rect.top,
        right: window.innerWidth - rect.right,
        left: 'auto',
        bottom: 'auto'
    };
    saveSettings();
}

// ============================================
// EVENT SETUP
// ============================================

function setupWidgetEvents() {
    setupDragging();
    
    // Tama buttons
    $('#nyxgotchi-btn-draw').on('click', (e) => {
        e.stopPropagation();
        onDrawCard();
    });
    
    $('#nyxgotchi-btn-queue').on('click', (e) => {
        e.stopPropagation();
        onViewQueue();
    });
    
    $('#nyxgotchi-btn-poke').on('click', (e) => {
        e.stopPropagation();
        onPokeNyx();
    });
    
    // Compact click - open grimoire (but not if just dragged)
    $('#mg-compact').on('click', (e) => {
        e.stopPropagation();
        if (dragMoved) {
            dragMoved = false;
            return;
        }
        triggerTransformation();
    });
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
    showNyxSpeech("✨ Let's see what the cards reveal... ✨", 3000);
    
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

function onDrawCard() {
    // TODO: Implement actual card drawing
    showCardFlash('🎴');
    showNyxSpeech("A card? Very well. Let's see what fate has in store...");
    
    // Update queue count (placeholder)
    const currentQueue = parseInt($('#nyxgotchi-queue').text()) || 0;
    $('#nyxgotchi-queue').text(Math.min(currentQueue + 1, 5));
}

function onViewQueue() {
    // TODO: Implement queue viewing
    const queueCount = parseInt($('#nyxgotchi-queue').text()) || 0;
    
    if (queueCount === 0) {
        showNyxSpeech("The queue is empty. Draw something.");
    } else {
        showNyxSpeech(`${queueCount} card${queueCount > 1 ? 's' : ''} await their moment.`);
    }
}

function onPokeNyx() {
    const disposition = extensionSettings.nyx.disposition;
    const responses = getPokeResponses(disposition);
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    showNyxSpeech(response);
    
    // Trigger sprite reaction
    $('#nyxgotchi-sprite').addClass('reacting');
    setTimeout(() => $('#nyxgotchi-sprite').removeClass('reacting'), 300);
}

function getPokeResponses(disposition) {
    if (disposition < 20) {
        return [
            "What.",
            "Stop that.",
            "I'm busy.",
            "...really?"
        ];
    } else if (disposition < 40) {
        return [
            "*yawn* ...Was there something?",
            "Mm. Yes. Hello.",
            "I'm aware you're there.",
            "Fascinating. You poked me."
        ];
    } else if (disposition < 60) {
        return [
            "Yes? I'm watching. Always watching.",
            "Something on your mind?",
            "I'm here. As always.",
            "The cards are patient. Are you?"
        ];
    } else if (disposition < 80) {
        return [
            "Checking on me? How thoughtful.",
            "Miss me already?",
            "Ah, attention. My favorite.",
            "You're more entertaining than most."
        ];
    } else {
        return [
            "Oh, are we bonding? How quaint.",
            "I suppose I'll allow the interruption.",
            "You've earned a moment of my time.",
            "Careful—I might start to like you."
        ];
    }
}

// ============================================
// VISUAL EFFECTS
// ============================================

function showNyxSpeech(text, duration = 4000) {
    const thought = $('#nyxgotchi-speech');
    thought.text(text).addClass('visible');
    
    // Auto-hide
    setTimeout(() => {
        thought.removeClass('visible');
    }, duration);
}

function showCardFlash(cardIcon) {
    const flash = $('#nyxgotchi-card-flash');
    flash.find('.card-icon').text(cardIcon);
    flash.addClass('active');
    
    setTimeout(() => {
        flash.removeClass('active');
    }, 1500);
}

function updateNyxMood() {
    const disposition = extensionSettings.nyx.disposition;
    const mood = getMoodText(disposition);
    
    $('#nyxgotchi-mood').text(mood);
    $('#nyxgotchi-disposition').text(disposition);
    
    // Update sprite mood class
    const sprite = $('#nyxgotchi-sprite');
    sprite.removeClass('mood-annoyed mood-bored mood-neutral mood-amused mood-delighted');
    sprite.addClass(`mood-${mood}`);
    
    // Refresh sprite for new mood
    currentSpriteFrame = 0;
    updateSpriteDisplay();
    
    // Update heart animation
    const heart = $('#nyxgotchi-heart');
    if (disposition >= 60) {
        heart.addClass('invested');
    } else {
        heart.removeClass('invested');
    }
}

// ============================================
// THEME SWITCHING
// ============================================

function setTheme(themeName) {
    extensionSettings.shellTheme = themeName;
    $('#mg-widget').attr('data-mg-theme', themeName);
    saveSettings();
}

function setFamiliarForm(formName) {
    extensionSettings.familiarForm = formName;
    currentSpriteFrame = 0; // Reset animation frame
    updateSpriteDisplay();  // Refresh sprite
    saveSettings();
}

function setScale(scaleName) {
    extensionSettings.shellScale = scaleName;
    $('#mg-widget').attr('data-mg-scale', scaleName);
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
                
                <label for="mg-theme">Shell Theme:</label>
                <select id="mg-theme" class="text_pole">
                    <option value="sailor-moon" ${extensionSettings.shellTheme === 'sailor-moon' ? 'selected' : ''}>Sailor Moon</option>
                    <option value="madoka" ${extensionSettings.shellTheme === 'madoka' ? 'selected' : ''}>Madoka</option>
                    <option value="witch-core" ${extensionSettings.shellTheme === 'witch-core' ? 'selected' : ''}>Witch Core</option>
                    <option value="pastel-goth" ${extensionSettings.shellTheme === 'pastel-goth' ? 'selected' : ''}>Pastel Goth</option>
                    <option value="y2k" ${extensionSettings.shellTheme === 'y2k' ? 'selected' : ''}>Y2K</option>
                    <option value="classic" ${extensionSettings.shellTheme === 'classic' ? 'selected' : ''}>Classic</option>
                </select>
                
                <label for="mg-familiar">Familiar Form:</label>
                <select id="mg-familiar" class="text_pole">
                    <option value="cat" ${extensionSettings.familiarForm === 'cat' ? 'selected' : ''}>Cat</option>
                    <option value="owl" ${extensionSettings.familiarForm === 'owl' ? 'selected' : ''}>Owl</option>
                    <option value="fox" ${extensionSettings.familiarForm === 'fox' ? 'selected' : ''}>Fox</option>
                    <option value="bunny" ${extensionSettings.familiarForm === 'bunny' ? 'selected' : ''}>Bunny</option>
                </select>
                
                <label for="mg-scale">Size:</label>
                <select id="mg-scale" class="text_pole">
                    <option value="small" ${extensionSettings.shellScale === 'small' ? 'selected' : ''}>Small</option>
                    <option value="medium" ${extensionSettings.shellScale === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="large" ${extensionSettings.shellScale === 'large' ? 'selected' : ''}>Large</option>
                </select>
                
                <hr>
                
                <div class="flex-container">
                    <span>Nyx Disposition: </span>
                    <span id="mg-disposition-display">${extensionSettings.nyx.disposition}</span>
                </div>
                
                <hr>
                
                <div class="flex-container">
                    <input type="button" id="mg-reset-position" class="menu_button" value="Reset Position">
                </div>
            </div>
        </div>
    `;
    
    $('#extensions_settings2').append(html);
    
    // Event handlers
    $('#mg-enabled').on('change', function() {
        extensionSettings.enabled = $(this).prop('checked');
        saveSettings();
        
        if (extensionSettings.enabled) {
            createWidget();
        } else {
            $('#mg-widget').remove();
            stopSpriteAnimation();
        }
    });
    
    $('#mg-theme').on('change', function() {
        setTheme($(this).val());
    });
    
    $('#mg-familiar').on('change', function() {
        setFamiliarForm($(this).val());
    });
    
    $('#mg-scale').on('change', function() {
        setScale($(this).val());
    });
    
    $('#mg-reset-position').on('click', function() {
        extensionSettings.nyxPosition = { 
            top: 70,
            right: 20,
            left: 'auto',
            bottom: 'auto'
        };
        applyWidgetPosition();
        saveSettings();
        if (typeof toastr !== 'undefined') {
            toastr.info('Position reset!');
        }
    });
}

// ============================================
// INITIALIZATION
// ============================================

jQuery(async () => {
    try {
        console.log(`[${extensionName}] Starting initialization...`);
        
        // Load settings
        loadSettings();
        console.log(`[${extensionName}] Settings loaded, enabled:`, extensionSettings.enabled);
        
        // Add settings panel
        await addExtensionSettings();
        console.log(`[${extensionName}] Settings panel added`);
        
        // Create widget if enabled
        if (extensionSettings.enabled) {
            console.log(`[${extensionName}] Extension is enabled, creating widget...`);
            createWidget();
        } else {
            console.log(`[${extensionName}] Extension is disabled`);
        }
        
        console.log(`[${extensionName}] ✅ Loaded successfully`);
        
    } catch (error) {
        console.error(`[${extensionName}] ❌ Critical failure:`, error);
        if (typeof toastr !== 'undefined') {
            toastr.error(
                'Petit Grimoire failed to initialize.',
                'Error',
                { timeOut: 10000 }
            );
        }
    }
});

// ============================================
// EXPORTS (for debugging)
// ============================================

window.PetitGrimoire = {
    getSettings: () => extensionSettings,
    setTheme,
    setFamiliarForm,
    setScale,
    showNyxSpeech,
    updateNyxMood,
    updateSpriteDisplay,
    startSpriteAnimation,
    stopSpriteAnimation,
    triggerTransformation,
    openGrimoire,
    closeGrimoire
};
