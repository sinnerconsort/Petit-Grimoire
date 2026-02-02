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
// NYX-GOTCHI HTML
// ============================================

function getNyxgotchiHTML() {
    return `
        <div class="nyxgotchi" id="nyxgotchi" data-mg-theme="${extensionSettings.shellTheme}">
            <!-- Speech bubble (hidden by default) -->
            <div class="nyxgotchi-speech" id="nyxgotchi-speech">
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
                            ${getPlaceholderSprite()}
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

// Placeholder ASCII sprite until we have real pixel art
function getPlaceholderSprite() {
    const form = extensionSettings.familiarForm || 'cat';
    
    const sprites = {
        cat: `<pre style="font-size:6px;line-height:1;margin:0;color:var(--mg-screen-pixel);">
 /\\_/\\
( o.o )
 > ^ <
</pre>`,
        crow: `<pre style="font-size:6px;line-height:1;margin:0;color:var(--mg-screen-pixel);">
  ▲
 (●>●)
  ╱|╲
</pre>`,
        fox: `<pre style="font-size:6px;line-height:1;margin:0;color:var(--mg-screen-pixel);">
 /\\___/\\
(  ◕ω◕ )
  ╱   ╲
</pre>`,
        moth: `<pre style="font-size:6px;line-height:1;margin:0;color:var(--mg-screen-pixel);">
 ╱ ● ● ╲
 ╲ ═══ ╱
  ╲ ╱ ╱
</pre>`,
        rabbit: `<pre style="font-size:6px;line-height:1;margin:0;color:var(--mg-screen-pixel);">
 (\\__/)
 (• ᴗ •)
 / 　 づ
</pre>`,
        serpent: `<pre style="font-size:6px;line-height:1;margin:0;color:var(--mg-screen-pixel);">
   ___
 〈 ◉ 〉
  〉═〈
  ~~~
</pre>`
    };
    
    return sprites[form] || sprites.cat;
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
    
    // Calculate new position (from bottom-right)
    const newRight = window.innerWidth - clientX - (rect.width - dragOffset.x);
    const newBottom = window.innerHeight - clientY - (rect.height - dragOffset.y);
    
    // Clamp to viewport
    const clampedRight = Math.max(0, Math.min(window.innerWidth - rect.width, newRight));
    const clampedBottom = Math.max(0, Math.min(window.innerHeight - rect.height, newBottom));
    
    nyxgotchi.style.right = clampedRight + 'px';
    nyxgotchi.style.bottom = clampedBottom + 'px';
    
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
    const speech = $('#nyxgotchi-speech');
    speech.text(text).addClass('visible');
    
    // Auto-hide
    setTimeout(() => {
        speech.removeClass('visible');
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
    saveSettings();
}

function setFamiliarForm(formName) {
    extensionSettings.familiarForm = formName;
    $('#nyxgotchi-sprite').html(getPlaceholderSprite());
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
                    <option value="crow" ${extensionSettings.familiarForm === 'crow' ? 'selected' : ''}>Crow</option>
                    <option value="fox" ${extensionSettings.familiarForm === 'fox' ? 'selected' : ''}>Fox</option>
                    <option value="moth" ${extensionSettings.familiarForm === 'moth' ? 'selected' : ''}>Moth</option>
                    <option value="rabbit" ${extensionSettings.familiarForm === 'rabbit' ? 'selected' : ''}>Rabbit</option>
                    <option value="serpent" ${extensionSettings.familiarForm === 'serpent' ? 'selected' : ''}>Serpent</option>
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
        } else {
            $('#nyxgotchi').remove();
        }
    });
    
    $('#mg-theme').on('change', function() {
        setTheme($(this).val());
    });
    
    $('#mg-familiar').on('change', function() {
        setFamiliarForm($(this).val());
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
    showNyxSpeech,
    updateNyxMood
};
