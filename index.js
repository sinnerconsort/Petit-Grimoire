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
// COMPACT FAB HTML
// ============================================

function getCompactFabHTML() {
    return `
        <div class="mg-compact-fab" id="mg-compact-fab" data-mg-theme="${extensionSettings.shellTheme}" style="position:fixed; bottom:100px; left:20px; width:56px; height:56px; z-index:99999; background:gold; border-radius:50%; border:3px solid #ff69b4; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow: 0 0 20px gold;">
            <span style="font-size:24px;">★</span>
        </div>
    `;
}

// ============================================
// NYX-GOTCHI HTML
// ============================================

function getNyxgotchiHTML() {
    return `
        <div class="nyxgotchi" id="nyxgotchi" data-mg-theme="${extensionSettings.shellTheme}" data-mg-scale="${extensionSettings.shellScale || 'medium'}">
            <!-- Thought bubble (hidden by default) -->
            <div class="nyxgotchi-thought" id="nyxgotchi-speech">
                Hello, mortal.
            </div>
            
            <!-- The shell -->
            <div class="nyxgotchi-shell">
                <!-- Decorative chain -->
                <div class="nyxgotchi-chain">
                    <div class="nyxgotchi-chain-link"></div>
                    <div class="nyxgotchi-chain-link"></div>
                    <div class="nyxgotchi-chain-link"></div>
                    <div class="nyxgotchi-chain-link"></div>
                    <div class="nyxgotchi-chain-link"></div>
                </div>
                
                <!-- Decorations -->
                <div class="nyxgotchi-decorations">
                    <span class="nyxgotchi-deco nyxgotchi-deco--1">✦</span>
                    <span class="nyxgotchi-deco nyxgotchi-deco--2">☽</span>
                    <span class="nyxgotchi-deco nyxgotchi-deco--3">♡</span>
                    <span class="nyxgotchi-deco nyxgotchi-deco--4">★</span>
                    <span class="nyxgotchi-deco nyxgotchi-deco--5">✧</span>
                    <span class="nyxgotchi-deco nyxgotchi-deco--6">◇</span>
                </div>
                
                <!-- Screen -->
                <div class="nyxgotchi-screen">
                    <!-- Status bar -->
                    <div class="nyxgotchi-status">
                        <span class="nyxgotchi-status-item">
                            🎴<span class="nyxgotchi-queue-badge" id="nyxgotchi-queue">0</span>
                        </span>
                        <span class="nyxgotchi-status-item nyxgotchi-heart" id="nyxgotchi-heart">💜</span>
                        <span class="nyxgotchi-status-item">
                            ⭐<span id="nyxgotchi-disposition">${extensionSettings.nyx.disposition}</span>
                        </span>
                    </div>
                    
                    <!-- Sprite area -->
                    <div class="nyxgotchi-sprite-area">
                        <div class="nyxgotchi-sprite" id="nyxgotchi-sprite">
                            <!-- Filled by sprite animation system -->
                        </div>
                        
                        <!-- Card flash overlay -->
                        <div class="nyxgotchi-card-flash" id="nyxgotchi-card-flash">
                            <span class="card-icon">🎴</span>
                        </div>
                    </div>
                    
                    <!-- Mood display -->
                    <div class="nyxgotchi-mood" id="nyxgotchi-mood">
                        ${getMoodText(extensionSettings.nyx.disposition)}
                    </div>
                </div>
                
                <!-- Buttons -->
                <div class="nyxgotchi-buttons">
                    <button class="nyxgotchi-button" data-action="draw" id="nyxgotchi-btn-draw" title="Draw Card"></button>
                    <button class="nyxgotchi-button" data-action="queue" id="nyxgotchi-btn-queue" title="View Queue"></button>
                    <button class="nyxgotchi-button" data-action="poke" id="nyxgotchi-btn-poke" title="Poke Nyx"></button>
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

function createCompactFab() {
    // Remove existing if any
    $('#mg-compact-fab').remove();
    
    console.log(`[${extensionName}] === CREATING COMPACT FAB ===`);
    if (typeof toastr !== 'undefined') {
        toastr.warning('Attempting to create Compact...', 'Debug');
    }
    
    // Add to DOM
    const html = getCompactFabHTML();
    console.log(`[${extensionName}] Compact HTML:`, html.substring(0, 100));
    $('body').append(html);
    
    // Verify it was added
    const $compact = $('#mg-compact-fab');
    console.log(`[${extensionName}] Compact element found:`, $compact.length);
    
    if ($compact.length === 0) {
        console.error(`[${extensionName}] Failed to create Compact FAB!`);
        if (typeof toastr !== 'undefined') {
            toastr.error('Failed to create Compact!', 'Petit Grimoire');
        }
        return;
    }
    
    // Apply theme
    $compact.attr('data-mg-theme', extensionSettings.shellTheme);
    
    // Wire up events
    setupCompactEvents();
    
    if (typeof toastr !== 'undefined') {
        toastr.success('Compact FAB created! Look bottom-left!', 'Petit Grimoire');
    }
    console.log(`[${extensionName}] Compact FAB created successfully`);
}

function setupCompactEvents() {
    const $compact = $('#mg-compact-fab');
    
    // Click to transform and open grimoire
    $compact.on('click', (e) => {
        e.stopPropagation();
        triggerTransformation();
    });
}

function triggerTransformation() {
    const $compact = $('#mg-compact-fab');
    
    // Already transforming? Ignore
    if ($compact.hasClass('transforming')) return;
    
    // If grimoire is open, close it
    if ($compact.hasClass('active')) {
        closeGrimoire();
        return;
    }
    
    // Start transformation sequence
    $compact.addClass('transforming');
    
    // Nyx reacts
    showNyxSpeech("✨ Let's see what the cards reveal... ✨", 3000);
    
    // After animation, open grimoire
    setTimeout(() => {
        $compact.removeClass('transforming').addClass('active');
        openGrimoire();
    }, 800);
}

function openGrimoire() {
    // TODO: Create and show the Grimoire panel
    console.log(`[${extensionName}] Opening Grimoire...`);
    
    // Placeholder - will build the actual grimoire next
    if (typeof toastr !== 'undefined') {
        toastr.info('✨ Grimoire opened! (Panel coming soon)', 'Petit Grimoire');
    }
}

function closeGrimoire() {
    const $compact = $('#mg-compact-fab');
    $compact.removeClass('active');
    
    // TODO: Hide the Grimoire panel
    console.log(`[${extensionName}] Closing Grimoire...`);
}

// ============================================
// NYX-GOTCHI CREATION
// ============================================

function createNyxgotchi() {
    // Remove existing if any
    $('#nyxgotchi').remove();
    
    // Debug: Show we're trying to create
    if (typeof toastr !== 'undefined') {
        toastr.info('Creating Nyx-gotchi...', 'Petit Grimoire');
    }
    console.log(`[${extensionName}] Creating Nyx-gotchi...`);
    
    // Add to DOM
    const html = getNyxgotchiHTML();
    $('body').append(html);
    
    // Verify it was added
    const $nyx = $('#nyxgotchi');
    if ($nyx.length === 0) {
        if (typeof toastr !== 'undefined') {
            toastr.error('Failed to create Nyx-gotchi element!', 'Petit Grimoire');
        }
        console.error(`[${extensionName}] Failed to append Nyx-gotchi to DOM`);
        return;
    }
    
    // Apply saved position
    applyNyxPosition();
    
    // Wire up event handlers
    setupNyxgotchiEvents();
    
    // Start sprite animation
    startSpriteAnimation();
    
    // Debug: Confirm success
    if (typeof toastr !== 'undefined') {
        toastr.success('Nyx-gotchi created!', 'Petit Grimoire');
    }
    console.log(`[${extensionName}] Nyx-gotchi created, element:`, $nyx[0]);
}

function applyNyxPosition() {
    const $nyx = $('#nyxgotchi');
    if ($nyx.length === 0) return;
    
    const pos = extensionSettings.nyxPosition;
    
    // Apply position - handle both old and new format
    if (pos.top !== undefined && pos.top !== 'auto') {
        $nyx.css('top', pos.top + 'px');
        $nyx.css('bottom', 'auto');
    } else if (pos.bottom !== undefined && pos.bottom !== 'auto') {
        $nyx.css('bottom', pos.bottom + 'px');
        $nyx.css('top', 'auto');
    } else {
        // Default to top
        $nyx.css('top', '70px');
        $nyx.css('bottom', 'auto');
    }
    
    if (pos.right !== undefined && pos.right !== 'auto') {
        $nyx.css('right', pos.right + 'px');
        $nyx.css('left', 'auto');
    } else if (pos.left !== undefined && pos.left !== 'auto') {
        $nyx.css('left', pos.left + 'px');
        $nyx.css('right', 'auto');
    } else {
        // Default to right
        $nyx.css('right', '20px');
        $nyx.css('left', 'auto');
    }
    
    console.log(`[${extensionName}] Applied position:`, pos);
}

// ============================================
// DRAGGING
// ============================================

function setupDragging() {
    const nyxgotchi = document.getElementById('nyxgotchi');
    if (!nyxgotchi) return;
    
    // Mouse events
    nyxgotchi.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
    
    // Touch events
    nyxgotchi.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', endDrag);
}

function startDrag(e) {
    // Don't drag if clicking a button
    if (e.target.closest('.nyxgotchi-button')) return;
    
    isDragging = true;
    const nyxgotchi = document.getElementById('nyxgotchi');
    nyxgotchi.classList.add('dragging');
    
    const rect = nyxgotchi.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    dragOffset.x = clientX - rect.left;
    dragOffset.y = clientY - rect.top;
    
    e.preventDefault();
}

function drag(e) {
    if (!isDragging) return;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const nyxgotchi = document.getElementById('nyxgotchi');
    const rect = nyxgotchi.getBoundingClientRect();
    
    // Calculate new position based on drag
    let newLeft = clientX - dragOffset.x;
    let newTop = clientY - dragOffset.y;
    
    // Constrain to viewport
    const minX = 10;
    const maxX = window.innerWidth - rect.width - 10;
    const minY = 10;
    const maxY = window.innerHeight - rect.height - 10;
    
    newLeft = Math.max(minX, Math.min(maxX, newLeft));
    newTop = Math.max(minY, Math.min(maxY, newTop));
    
    // Apply position using left/top
    nyxgotchi.style.left = newLeft + 'px';
    nyxgotchi.style.top = newTop + 'px';
    nyxgotchi.style.right = 'auto';
    nyxgotchi.style.bottom = 'auto';
    
    e.preventDefault();
}

function endDrag() {
    if (!isDragging) return;
    
    isDragging = false;
    const nyxgotchi = document.getElementById('nyxgotchi');
    nyxgotchi.classList.remove('dragging');
    
    // Get computed position
    const rect = nyxgotchi.getBoundingClientRect();
    
    // Save as top/right (easier to work with)
    extensionSettings.nyxPosition = {
        top: rect.top,
        right: window.innerWidth - rect.right,
        left: 'auto',
        bottom: 'auto'
    };
    saveSettings();
    
    console.log(`[${extensionName}] Saved position:`, extensionSettings.nyxPosition);
}

// ============================================
// BUTTON HANDLERS
// ============================================

function setupNyxgotchiEvents() {
    setupDragging();
    
    // Draw button
    $('#nyxgotchi-btn-draw').on('click', (e) => {
        e.stopPropagation();
        onDrawCard();
    });
    
    // Queue button
    $('#nyxgotchi-btn-queue').on('click', (e) => {
        e.stopPropagation();
        onViewQueue();
    });
    
    // Poke button
    $('#nyxgotchi-btn-poke').on('click', (e) => {
        e.stopPropagation();
        onPokeNyx();
    });
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
    $('#nyxgotchi').attr('data-mg-theme', themeName);
    $('#mg-compact-fab').attr('data-mg-theme', themeName);
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
    $('#nyxgotchi').attr('data-mg-scale', scaleName);
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
            createNyxgotchi();
            createCompactFab();
        } else {
            $('#nyxgotchi').remove();
            $('#mg-compact-fab').remove();
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
        applyNyxPosition();
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
        
        // Create Nyx-gotchi if enabled
        if (extensionSettings.enabled) {
            console.log(`[${extensionName}] Extension is enabled, creating Nyx-gotchi...`);
            createNyxgotchi();
            createCompactFab();
        } else {
            console.log(`[${extensionName}] Extension is disabled, skipping Nyx-gotchi creation`);
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
