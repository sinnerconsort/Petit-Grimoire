/**
 * Tarot Spritesheet Display Module
 * Handles themed tarot card spritesheets with 3D flip animations
 * 
 * Uses card DATA from tarotCards.js
 * This module handles DISPLAY only (spritesheets, animations, elements)
 * 
 * Spritesheet specs: 5272×405px, 23 cards (22 Major Arcana + card back)
 */

import { settings } from '../../core/state.js';
import { ASSET_PATHS } from '../../core/config.js';
import { MAJOR_ARCANA, drawCard, drawOrientation } from '../../data/tarotCards.js';

// ============================================
// SPRITESHEET SPECIFICATIONS
// ============================================

const SHEET_WIDTH = 5272;
const SHEET_HEIGHT = 405;
const TOTAL_CARDS = 23;
const CARD_WIDTH = SHEET_WIDTH / TOTAL_CARDS; // ~229.22px
const CARD_BACK_INDEX = 22;
const BASE_SCALE = 5; // Sprites are 5x base size

// ============================================
// THEME SPRITE PATHS
// ============================================

/**
 * Get spritesheet path for a theme
 */
export function getTarotSheet(themeName = null) {
    const theme = themeName || settings.theme || 'guardian';
    return `${ASSET_PATHS.sprites}/tarot/tarot_${theme}.png`;
}

// ============================================
// POSITION CALCULATIONS
// ============================================

/**
 * Get raw background-position X for a card index (in sheet pixels)
 */
export function getCardPositionRaw(index) {
    return -(index * CARD_WIDTH);
}

/**
 * Get scaled background-position X for display
 */
export function getCardPosition(index, displayScale = 2) {
    const rawPos = getCardPositionRaw(index);
    return (rawPos / BASE_SCALE) * displayScale;
}

/**
 * Get card back position
 */
export function getCardBackPosition(displayScale = 2) {
    return getCardPosition(CARD_BACK_INDEX, displayScale);
}

/**
 * Calculate display dimensions for a given scale
 */
export function getDisplayDimensions(displayScale = 2) {
    return {
        width: Math.round((CARD_WIDTH / BASE_SCALE) * displayScale),
        height: Math.round((SHEET_HEIGHT / BASE_SCALE) * displayScale),
        bgWidth: Math.round((SHEET_WIDTH / BASE_SCALE) * displayScale),
    };
}

// ============================================
// CARD ELEMENT CREATION
// ============================================

/**
 * Create a card element with spritesheet background
 * @param {number|null} cardIndex - Card index (0-21) or null for random
 * @param {Object} options - Configuration options
 */
export function createCardElement(cardIndex = null, options = {}) {
    const {
        displayScale = 2,
        faceDown = true,
        isReversed = false,
        theme = null,
        clickable = true,
    } = options;
    
    const dims = getDisplayDimensions(displayScale);
    const posX = faceDown 
        ? getCardBackPosition(displayScale) 
        : getCardPosition(cardIndex, displayScale);
    
    const card = document.createElement('div');
    card.className = 'pg-tarot-card';
    card.dataset.cardIndex = cardIndex;
    card.dataset.faceDown = faceDown;
    card.dataset.isReversed = isReversed;
    
    Object.assign(card.style, {
        width: `${dims.width}px`,
        height: `${dims.height}px`,
        backgroundImage: `url('${getTarotSheet(theme)}')`,
        backgroundSize: `${dims.bgWidth}px ${dims.height}px`,
        backgroundPosition: `${posX}px 0`,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
        cursor: clickable ? 'pointer' : 'default',
        transform: isReversed && !faceDown ? 'rotate(180deg)' : 'none',
        transition: 'transform 0.1s ease',
    });
    
    return card;
}

// ============================================
// 3D FLIP ANIMATION
// ============================================

/**
 * Inject flip animation styles (call once on init)
 */
export function injectFlipStyles() {
    const styleId = 'pg-tarot-flip-styles';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        .pg-tarot-card-container {
            perspective: 1000px;
            display: inline-block;
        }
        
        .pg-tarot-card-flipper {
            position: relative;
            transform-style: preserve-3d;
            transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .pg-tarot-card-flipper.flipped {
            transform: rotateY(180deg);
        }
        
        .pg-tarot-card-flipper.reversed.flipped {
            transform: rotateY(180deg) rotate(180deg);
        }
        
        .pg-tarot-card-face {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
        }
        
        .pg-tarot-card-back {
            z-index: 2;
        }
        
        .pg-tarot-card-front {
            transform: rotateY(180deg);
            z-index: 1;
        }
        
        /* Glow effect on hover */
        .pg-tarot-card-container:hover .pg-tarot-card-flipper:not(.flipped) {
            filter: brightness(1.1);
        }
        
        /* Subtle float animation for unflipped cards */
        @keyframes pg-card-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
        }
        
        .pg-tarot-card-container.floating .pg-tarot-card-flipper:not(.flipped) {
            animation: pg-card-float 2s ease-in-out infinite;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Create a flippable card with front/back faces
 * @param {number} cardIndex - The card to show when flipped
 * @param {Object} options - Configuration options
 */
export function createFlippableCard(cardIndex, options = {}) {
    const {
        displayScale = 2,
        isReversed = false,
        theme = null,
        floating = true,
        onFlip = null,
    } = options;
    
    const dims = getDisplayDimensions(displayScale);
    
    // Container (provides perspective)
    const container = document.createElement('div');
    container.className = 'pg-tarot-card-container' + (floating ? ' floating' : '');
    container.style.width = `${dims.width}px`;
    container.style.height = `${dims.height}px`;
    
    // Flipper (rotates on flip)
    const flipper = document.createElement('div');
    flipper.className = 'pg-tarot-card-flipper' + (isReversed ? ' reversed' : '');
    flipper.style.width = '100%';
    flipper.style.height = '100%';
    
    // Back face (card back - visible initially)
    const backFace = document.createElement('div');
    backFace.className = 'pg-tarot-card-face pg-tarot-card-back';
    Object.assign(backFace.style, {
        backgroundImage: `url('${getTarotSheet(theme)}')`,
        backgroundSize: `${dims.bgWidth}px ${dims.height}px`,
        backgroundPosition: `${getCardBackPosition(displayScale)}px 0`,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
        borderRadius: '4px',
    });
    
    // Front face (actual card - hidden initially)
    const frontFace = document.createElement('div');
    frontFace.className = 'pg-tarot-card-face pg-tarot-card-front';
    Object.assign(frontFace.style, {
        backgroundImage: `url('${getTarotSheet(theme)}')`,
        backgroundSize: `${dims.bgWidth}px ${dims.height}px`,
        backgroundPosition: `${getCardPosition(cardIndex, displayScale)}px 0`,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
        borderRadius: '4px',
    });
    
    flipper.appendChild(backFace);
    flipper.appendChild(frontFace);
    container.appendChild(flipper);
    
    // Store data
    container.dataset.cardIndex = cardIndex;
    container.dataset.isReversed = isReversed;
    container.dataset.flipped = 'false';
    
    // Click handler
    container.addEventListener('click', () => {
        if (container.dataset.flipped === 'false') {
            flipper.classList.add('flipped');
            container.dataset.flipped = 'true';
            container.classList.remove('floating');
            
            if (onFlip) {
                // Get the full card data from tarotCards.js
                const cardData = MAJOR_ARCANA[cardIndex];
                onFlip({ ...cardData, isReversed });
            }
        }
    });
    
    return container;
}

/**
 * Programmatically flip a card
 */
export function flipCardElement(container, reveal = true) {
    const flipper = container.querySelector('.pg-tarot-card-flipper');
    if (!flipper) return;
    
    if (reveal) {
        flipper.classList.add('flipped');
        container.dataset.flipped = 'true';
        container.classList.remove('floating');
    } else {
        flipper.classList.remove('flipped');
        container.dataset.flipped = 'false';
    }
}

/**
 * Reset a flippable card to face-down
 */
export function resetCard(container) {
    flipCardElement(container, false);
    container.classList.add('floating');
}

// ============================================
// SPREAD LAYOUTS
// ============================================

/**
 * Draw multiple unique cards (for spreads)
 * @param {number} count - Number of cards to draw
 * @param {number} reversalChance - Chance of reversal (0-100)
 */
export function drawSpread(count = 3, reversalChance = 50) {
    const indices = [...Array(MAJOR_ARCANA.length).keys()];
    const drawn = [];
    
    for (let i = 0; i < count && indices.length > 0; i++) {
        const pick = Math.floor(Math.random() * indices.length);
        const cardIndex = indices.splice(pick, 1)[0];
        const cardData = MAJOR_ARCANA[cardIndex];
        
        drawn.push({
            ...cardData,
            isReversed: drawOrientation(reversalChance)
        });
    }
    
    return drawn;
}

/**
 * Create a three-card spread (Past, Present, Future)
 */
export function createThreeCardSpread(options = {}) {
    const {
        displayScale = 2,
        reversalChance = 50,
        theme = null,
        onCardFlip = null,
        gap = 12,
    } = options;
    
    const cards = drawSpread(3, reversalChance);
    const positions = ['Past', 'Present', 'Future'];
    const dims = getDisplayDimensions(displayScale);
    
    const spread = document.createElement('div');
    spread.className = 'pg-tarot-spread pg-tarot-spread-three';
    spread.style.cssText = `
        display: flex;
        justify-content: center;
        gap: ${gap}px;
        flex-wrap: wrap;
    `;
    
    cards.forEach((card, i) => {
        const slot = document.createElement('div');
        slot.className = 'pg-tarot-slot';
        slot.style.cssText = 'text-align: center;';
        
        const cardEl = createFlippableCard(card.id, {
            displayScale,
            isReversed: card.isReversed,
            theme,
            onFlip: (flippedCard) => {
                if (onCardFlip) {
                    onCardFlip(flippedCard, positions[i], i);
                }
            },
        });
        
        const label = document.createElement('div');
        label.className = 'pg-tarot-slot-label';
        label.textContent = positions[i];
        label.style.cssText = `
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-top: 8px;
            opacity: 0.7;
        `;
        
        slot.appendChild(cardEl);
        slot.appendChild(label);
        spread.appendChild(slot);
    });
    
    // Store drawn cards data on the spread element
    spread.dataset.cards = JSON.stringify(cards);
    
    return spread;
}

/**
 * Create a single card draw
 */
export function createSingleDraw(options = {}) {
    const {
        displayScale = 2,
        reversalChance = 50,
        theme = null,
        onFlip = null,
    } = options;
    
    const { card, isReversed } = drawCard(reversalChance);
    
    const container = document.createElement('div');
    container.className = 'pg-tarot-single-draw';
    container.style.cssText = 'display: flex; justify-content: center;';
    
    const cardEl = createFlippableCard(card.id, {
        displayScale,
        isReversed,
        theme,
        onFlip: (flippedCard) => {
            if (onFlip) {
                onFlip(flippedCard);
            }
        },
    });
    
    container.appendChild(cardEl);
    container.dataset.card = JSON.stringify({ ...card, isReversed });
    
    return container;
}

// ============================================
// EXPORTS
// ============================================

export { 
    CARD_WIDTH, 
    SHEET_WIDTH, 
    SHEET_HEIGHT, 
    CARD_BACK_INDEX,
    BASE_SCALE,
};
