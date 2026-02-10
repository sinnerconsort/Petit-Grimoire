/**
 * Tarot Tab
 * Browse the Major Arcana, tap to see meanings
 * 
 * "The cards know. Nyx interprets."
 */

import { settings } from '../../core/state.js';
import { getTheme } from '../../core/config.js';
import { MAJOR_ARCANA, getCardImagePath } from '../../data/tarotCards.js';

// View state: 'gallery' or 'detail'
let currentView = 'gallery';
let selectedCard = null;

/**
 * Theme-specific card filter settings
 * Original cards are gold/yellow (~50° on color wheel)
 * hue-rotate shifts FROM that starting point
 * 
 * Color wheel reference:
 *   0° = Red, 60° = Yellow, 120° = Green, 
 *   180° = Cyan, 240° = Blue, 300° = Magenta
 */
const THEME_CARD_FILTER = {
    guardian: { 
        // Target: Purple (~280°) from gold (~50°) = +230°
        hue: 230,
        saturation: 1.1,
        brightness: 1,
    },
    umbra: { 
        // Target: Vivid dark purple, needs pop against purple book
        hue: 200,
        saturation: 1.4,
        brightness: 0.8,
    },
    apothecary: { 
        // Target: Warm brown/sepia - slight shift, darkened but not TOO dark
        hue: -7,
        saturation: 0.97,
        brightness: 0.75,  // Was 0.56, now lighter
    },
    moonstone: { 
        // Target: Sky blue (~200°) from gold (~50°) = +150°
        hue: 150,
        saturation: 0.8,
        brightness: 1,
    },
    phosphor: { 
        // Target: Cyan (~180°) from gold (~50°) = +130°
        hue: 130,
        saturation: 1.8,
        brightness: 1,
    },
    rosewood: { 
        // Target: Sage green - this one was working
        hue: 36,
        saturation: 0.47,
        brightness: 1,
    },
    celestial: { 
        // Keep original gold
        hue: 0,
        saturation: 1,
        brightness: 1,
    },
};

/**
 * Get the CSS filter string for current theme's cards
 */
function getCardFilter() {
    const themeName = settings.theme || 'guardian';
    const config = THEME_CARD_FILTER[themeName] || THEME_CARD_FILTER.guardian;
    
    // Skip filter entirely for celestial (keep original gold)
    if (themeName === 'celestial') {
        return 'none';
    }
    
    return `hue-rotate(${config.hue}deg) saturate(${config.saturation}) brightness(${config.brightness})`;
}

/**
 * Get the content HTML for the tarot tab
 */
export function getContent() {
    // Reset to gallery view when tab loads
    currentView = 'gallery';
    selectedCard = null;
    
    return getGalleryView();
}

/**
 * Gallery view - grid of all cards
 */
function getGalleryView() {
    const theme = getTheme(settings.theme);
    const cardFilter = getCardFilter();
    const textDark = '#2a1810';
    const textMid = '#4a3020';
    const textLight = '#6a5040';
    
    const galleryHTML = MAJOR_ARCANA.map(card => `
        <div class="pg-tarot-card" data-card-id="${card.id}" style="
            position: relative;
            width: 46px;
            height: 81px;
            cursor: pointer;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            border-radius: 3px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">
            <img src="${getCardImagePath(card, '2x')}" alt="${card.name}" style="
                width: 100%;
                height: 100%;
                image-rendering: pixelated;
                display: block;
                filter: ${cardFilter};
            ">
        </div>
    `).join('');
    
    return `
        <div style="flex: 1; min-height: 0; overflow: hidden; position: relative;">
            <div class="pg-tarot-scroll" style="
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                overflow-y: auto;
                overflow-x: hidden;
                padding: 10px 4px 10px 5px;
            ">
                <h2 class="pg-page-title" style="color: ${textDark}; margin: 0 0 6px 0; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 6px;">
                    🎴 TAROT
                </h2>
                <p style="color: ${textMid}; font-style: italic; font-size: 10px; margin-bottom: 12px;">
                    "The cards know. Nyx interprets."
                </p>
                
                <!-- Card Gallery -->
                <div id="pg-tarot-gallery" style="
                    display: grid;
                    grid-template-columns: repeat(4, 46px);
                    gap: 8px;
                    justify-content: center;
                    margin-bottom: 16px;
                ">
                    ${galleryHTML}
                </div>
                
                <!-- Hint -->
                <p style="color: ${textLight}; font-size: 9px; text-align: center; font-style: italic;">
                    Tap a card to see its meaning
                </p>
            </div>
        </div>
    `;
}

/**
 * Detail view - single card with meanings
 */
function getDetailView(card) {
    const theme = getTheme(settings.theme);
    const cardFilter = getCardFilter();
    const textDark = '#2a1810';
    const textMid = '#4a3020';
    const textLight = '#6a5040';
    const accentColor = theme.main || '#9b59b6';
    
    return `
        <div style="flex: 1; min-height: 0; overflow: hidden; position: relative;">
            <div class="pg-tarot-scroll" style="
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                overflow-y: auto;
                overflow-x: hidden;
                padding: 10px 8px 10px 8px;
            ">
                <!-- Back Button -->
                <div id="pg-tarot-back" style="
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    cursor: pointer;
                    color: ${textMid};
                    font-size: 10px;
                    margin-bottom: 10px;
                ">
                    <span style="font-size: 12px;">←</span>
                    <span>Back to Deck</span>
                </div>
                
                <!-- Card Image with Filter -->
                <div style="text-align: center; margin-bottom: 10px;">
                    <img src="${getCardImagePath(card, '5x')}" alt="${card.name}" style="
                        width: 115px;
                        height: 202px;
                        image-rendering: pixelated;
                        display: block;
                        margin: 0 auto;
                        border-radius: 4px;
                        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
                        filter: ${cardFilter};
                    ">
                </div>
                
                <!-- Card Name -->
                <h3 style="
                    text-align: center;
                    font-size: 14px;
                    margin: 0 0 4px 0;
                    color: ${textDark};
                    font-weight: 600;
                ">${card.numeral} · ${card.name}</h3>
                
                <!-- Upright Section -->
                <div style="
                    margin-top: 12px;
                    padding: 10px;
                    background: rgba(255,255,255,0.4);
                    border-radius: 6px;
                    border-left: 3px solid ${accentColor};
                ">
                    <div style="
                        display: flex;
                        align-items: center;
                        gap: 4px;
                        margin-bottom: 6px;
                    ">
                        <span style="font-size: 12px;">⬆️</span>
                        <span style="
                            font-size: 11px;
                            font-weight: 600;
                            color: ${textDark};
                            text-transform: uppercase;
                            letter-spacing: 1px;
                        ">Upright</span>
                    </div>
                    <div style="
                        font-size: 9px;
                        color: ${textMid};
                        margin-bottom: 6px;
                        font-style: italic;
                    ">
                        ${card.upright.keywords.join(' · ')}
                    </div>
                    <p style="
                        font-size: 10px;
                        line-height: 1.5;
                        margin: 0;
                        color: ${textDark};
                    ">${card.upright.meaning}</p>
                </div>
                
                <!-- Reversed Section -->
                <div style="
                    margin-top: 10px;
                    padding: 10px;
                    background: rgba(0,0,0,0.05);
                    border-radius: 6px;
                    border-left: 3px solid ${textMid};
                ">
                    <div style="
                        display: flex;
                        align-items: center;
                        gap: 4px;
                        margin-bottom: 6px;
                    ">
                        <span style="font-size: 12px;">⬇️</span>
                        <span style="
                            font-size: 11px;
                            font-weight: 600;
                            color: ${textDark};
                            text-transform: uppercase;
                            letter-spacing: 1px;
                        ">Reversed</span>
                    </div>
                    <div style="
                        font-size: 9px;
                        color: ${textMid};
                        margin-bottom: 6px;
                        font-style: italic;
                    ">
                        ${card.reversed.keywords.join(' · ')}
                    </div>
                    <p style="
                        font-size: 10px;
                        line-height: 1.5;
                        margin: 0;
                        color: ${textDark};
                    ">${card.reversed.meaning}</p>
                </div>
            </div>
        </div>
    `;
}

/**
 * Initialize event listeners for the tarot tab
 */
export function init() {
    if (currentView === 'gallery') {
        initGalleryListeners();
    } else {
        initDetailListeners();
    }
}

/**
 * Setup gallery view listeners
 */
function initGalleryListeners() {
    const gallery = document.getElementById('pg-tarot-gallery');
    if (gallery) {
        gallery.addEventListener('click', handleGalleryClick);
    }
    addHoverEffects();
}

/**
 * Setup detail view listeners
 */
function initDetailListeners() {
    const backBtn = document.getElementById('pg-tarot-back');
    if (backBtn) {
        backBtn.addEventListener('click', goBackToGallery);
    }
}

/**
 * Cleanup when leaving the tab
 */
export function cleanup() {
    const gallery = document.getElementById('pg-tarot-gallery');
    const backBtn = document.getElementById('pg-tarot-back');
    
    if (gallery) {
        gallery.removeEventListener('click', handleGalleryClick);
    }
    if (backBtn) {
        backBtn.removeEventListener('click', goBackToGallery);
    }
}

/**
 * Handle click on gallery card
 */
function handleGalleryClick(event) {
    const cardEl = event.target.closest('.pg-tarot-card');
    if (!cardEl) return;
    
    const cardId = parseInt(cardEl.dataset.cardId);
    const card = MAJOR_ARCANA.find(c => c.id === cardId);
    
    if (card) {
        showCardDetail(card);
    }
}

/**
 * Switch to card detail view
 */
function showCardDetail(card) {
    currentView = 'detail';
    selectedCard = card;
    
    // Get the page container and replace content
    const page = document.querySelector('.pg-page');
    if (page) {
        page.innerHTML = getDetailView(card);
        initDetailListeners();
    }
}

/**
 * Go back to gallery view
 */
function goBackToGallery() {
    currentView = 'gallery';
    selectedCard = null;
    
    // Get the page container and replace content
    const page = document.querySelector('.pg-page');
    if (page) {
        page.innerHTML = getGalleryView();
        initGalleryListeners();
    }
}

/**
 * Add hover effects to cards
 */
function addHoverEffects() {
    const cards = document.querySelectorAll('.pg-tarot-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'scale(1.1) translateY(-4px)';
            card.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)';
            card.style.zIndex = '10';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
            card.style.zIndex = '';
        });
    });
}

// Add CSS for touch feedback
const styleId = 'pg-tarot-styles';
if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        .pg-tarot-card:active {
            transform: scale(0.95) !important;
        }
        #pg-tarot-back:hover {
            opacity: 0.7;
        }
        #pg-tarot-back:active {
            opacity: 0.5;
        }
    `;
    document.head.appendChild(style);
}
