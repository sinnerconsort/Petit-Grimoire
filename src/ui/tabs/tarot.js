/**
 * Tarot Tab
 * Browse the Major Arcana, tap to see meanings
 * 
 * "The cards know. Nyx interprets."
 */

import { settings } from '../../core/state.js';
import { getTheme } from '../../core/config.js';
import { MAJOR_ARCANA, getCardImagePath, getCardBackPath } from '../../data/tarotCards.js';

// Currently selected card for detail view
let selectedCard = null;

/**
 * Get the content HTML for the tarot tab
 */
export function getContent() {
    const theme = getTheme(settings.theme);
    
    // Colors for parchment readability
    const textDark = '#2a1810';
    const textMid = '#4a3020';
    const textLight = '#6a5040';
    
    // Build card gallery HTML - using 2x images scaled down by CSS
    const galleryHTML = MAJOR_ARCANA.map(card => `
        <div class="pg-tarot-card" data-card-id="${card.id}" style="
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

        <!-- Card Detail Popup - OUTSIDE scroll wrapper -->
        <div id="pg-tarot-detail" style="
            display: none;
            position: fixed;
            top: 10%;
            left: 50%;
            transform: translateX(-50%);
            background: ${theme.cardBg || '#1a1020'};
            border: 3px solid ${theme.main};
            border-radius: 12px;
            padding: 16px;
            width: 280px;
            max-height: 80vh;
            overflow-y: auto;
            z-index: 10000;
            box-shadow: 0 0 40px ${theme.main}60;
            color: ${theme.textLight || '#fff'};
        ">
            <div id="pg-tarot-detail-content"></div>
            <button id="pg-tarot-detail-close" style="
                margin-top: 12px;
                width: 100%;
                padding: 8px;
                border-radius: 6px;
                border: 1px solid ${theme.main};
                background: transparent;
                color: ${theme.textLight || '#fff'};
                cursor: pointer;
                font-size: 11px;
            ">
                Close
            </button>
        </div>
        
        <!-- Overlay for detail - OUTSIDE scroll wrapper -->
        <div id="pg-tarot-overlay" style="
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            z-index: 9999;
        "></div>
    `;
}

/**
 * Initialize event listeners for the tarot tab
 */
export function init() {
    const gallery = document.getElementById('pg-tarot-gallery');
    const detailClose = document.getElementById('pg-tarot-detail-close');
    const overlay = document.getElementById('pg-tarot-overlay');
    
    if (gallery) {
        gallery.addEventListener('click', handleGalleryClick);
    }
    
    if (detailClose) {
        detailClose.addEventListener('click', closeDetail);
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeDetail);
    }
    
    // Add hover effects
    addHoverEffects();
}

/**
 * Cleanup when leaving the tab
 */
export function cleanup() {
    const gallery = document.getElementById('pg-tarot-gallery');
    const detailClose = document.getElementById('pg-tarot-detail-close');
    const overlay = document.getElementById('pg-tarot-overlay');
    
    if (gallery) {
        gallery.removeEventListener('click', handleGalleryClick);
    }
    
    if (detailClose) {
        detailClose.removeEventListener('click', closeDetail);
    }
    
    if (overlay) {
        overlay.removeEventListener('click', closeDetail);
    }
}

/**
 * Handle click on gallery
 */
function handleGalleryClick(event) {
    const cardEl = event.target.closest('.pg-tarot-card');
    if (!cardEl) return;
    
    const cardId = parseInt(cardEl.dataset.cardId);
    const card = MAJOR_ARCANA.find(c => c.id === cardId);
    
    if (card) {
        selectedCard = card;
        showDetail(card);
    }
}

/**
 * Show card detail popup
 */
function showDetail(card) {
    const theme = getTheme(settings.theme);
    const detail = document.getElementById('pg-tarot-detail');
    const content = document.getElementById('pg-tarot-detail-content');
    const overlay = document.getElementById('pg-tarot-overlay');
    
    if (!detail || !content) return;
    
    content.innerHTML = `
        <!-- Card Image -->
        <div style="text-align: center; margin-bottom: 12px;">
            <img src="${getCardImagePath(card, '5x')}" alt="${card.name}" style="
                max-width: 180px;
                max-height: 220px;
                image-rendering: pixelated;
                border-radius: 4px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            ">
        </div>
        
        <!-- Card Name -->
        <h3 style="
            text-align: center;
            font-size: 16px;
            margin-bottom: 4px;
            color: ${theme.secondary || theme.main};
        ">${card.numeral} - ${card.name}</h3>
        
        <!-- Upright Meaning -->
        <div style="margin-top: 12px;">
            <div style="
                display: flex;
                align-items: center;
                gap: 6px;
                margin-bottom: 6px;
            ">
                <span style="font-size: 14px;">⬆️</span>
                <span style="
                    font-size: 11px;
                    font-weight: 600;
                    color: ${theme.secondary || theme.main};
                    text-transform: uppercase;
                    letter-spacing: 1px;
                ">Upright</span>
            </div>
            <div style="
                font-size: 9px;
                color: ${theme.textDim || '#aaa'};
                margin-bottom: 6px;
            ">
                ${card.upright.keywords.join(' • ')}
            </div>
            <p style="
                font-size: 10px;
                line-height: 1.5;
                margin: 0;
                color: ${theme.textLight || '#fff'};
            ">${card.upright.meaning}</p>
        </div>
        
        <!-- Reversed Meaning -->
        <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid ${theme.main}40;">
            <div style="
                display: flex;
                align-items: center;
                gap: 6px;
                margin-bottom: 6px;
            ">
                <span style="font-size: 14px;">⬇️</span>
                <span style="
                    font-size: 11px;
                    font-weight: 600;
                    color: ${theme.main};
                    text-transform: uppercase;
                    letter-spacing: 1px;
                ">Reversed</span>
            </div>
            <div style="
                font-size: 9px;
                color: ${theme.textDim || '#aaa'};
                margin-bottom: 6px;
            ">
                ${card.reversed.keywords.join(' • ')}
            </div>
            <p style="
                font-size: 10px;
                line-height: 1.5;
                margin: 0;
                color: ${theme.textLight || '#fff'};
            ">${card.reversed.meaning}</p>
        </div>
    `;
    
    detail.style.display = 'block';
    if (overlay) overlay.style.display = 'block';
}

/**
 * Close card detail popup
 */
function closeDetail() {
    const detail = document.getElementById('pg-tarot-detail');
    const overlay = document.getElementById('pg-tarot-overlay');
    
    if (detail) detail.style.display = 'none';
    if (overlay) overlay.style.display = 'none';
    selectedCard = null;
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
    `;
    document.head.appendChild(style);
}
