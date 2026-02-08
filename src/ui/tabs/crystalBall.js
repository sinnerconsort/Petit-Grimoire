/**
 * Crystal Ball Tab
 * Wild magic divination - no control, no refunds
 * 
 * The crystal ball is NOT under Nyx's control. It's older, more chaotic.
 * When you peer into it, you're bypassing her entirely.
 */

import { settings } from '../../core/state.js';
import { getTheme, ASSET_PATHS } from '../../core/config.js';
import { drawCrystalBallEffect, getEffectPoolStats, CRYSTAL_CATEGORIES } from '../../data/crystalBallEffects.js';

// State for this tab
let recentVisions = [];
let cooldownUntil = null;
const COOLDOWN_MS = 60000; // 1 minute between gazes (adjust as needed)
const MAX_RECENT_VISIONS = 5;

/**
 * Get the content HTML for the crystal ball tab
 */
export function getContent() {
    const theme = getTheme(settings.theme);
    
    // Colors for parchment readability
    const textDark = '#2a1810';
    const textMid = '#4a3020';
    const textLight = '#6a5040';
    
    // Get crystal ball sprite for current theme
    const crystalSprite = `${ASSET_PATHS.sprites}/crystal-balls/${settings.theme}.png`;
    
    // Check cooldown
    const onCooldown = cooldownUntil && Date.now() < cooldownUntil;
    const cooldownRemaining = onCooldown ? Math.ceil((cooldownUntil - Date.now()) / 1000) : 0;
    
    // Build recent visions HTML
    const visionsHTML = recentVisions.length > 0 
        ? recentVisions.map(v => `
            <div class="pg-vision-entry" style="
                padding: 6px 8px;
                margin-bottom: 6px;
                background: rgba(0,0,0,0.05);
                border-radius: 4px;
                border-left: 3px solid ${theme.main};
            ">
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
                    <span style="font-size: 12px;">${CRYSTAL_CATEGORIES[v.category]?.emoji || '🔮'}</span>
                    <span style="font-weight: 600; color: ${textDark}; font-size: 10px;">${v.name}</span>
                </div>
                <div style="font-size: 9px; color: ${textMid}; font-style: italic;">
                    ${v.description}
                </div>
            </div>
        `).join('')
        : `<p style="color: ${textLight}; font-style: italic; text-align: center; font-size: 10px;">
            The mists are clear...
        </p>`;
    
    // Build effect pool info
    const poolStats = getEffectPoolStats();
    const categoryList = Object.entries(poolStats)
        .map(([key, cat]) => cat.name)
        .join(', ');
    const totalEffects = Object.values(poolStats).reduce((sum, cat) => sum + cat.count, 0);
    
    return `
    <div class="pg-crystal-scroll" style="
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 2px;
    padding-top: 20px;      /* push content DOWN */
    padding-left: 10px;      /* push content RIGHT */
    padding-bottom: 15px;   /* add space at BOTTOM */
">
        <h2 class="pg-page-title" style="color: ${textDark}; margin: 0 0 6px 0; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 6px;">
                🔮 CRYSTAL BALL
            </h2>
            <p style="color: ${textMid}; font-style: italic; font-size: 10px; margin-bottom: 12px;">
                "Fate is not a request line."
            </p>
            
            <!-- Crystal Ball Visual -->
            <div id="pg-crystal-container" style="
                display: flex;
                flex-direction: column;
                align-items: center;
                margin-bottom: 12px;
            ">
                <div id="pg-crystal-orb" style="
                    width: 64px;
                    height: 64px;
                    background-image: url('${crystalSprite}');
                    background-size: contain;
                    background-repeat: no-repeat;
                    background-position: center;
                    image-rendering: pixelated;
                    transition: filter 0.3s ease, transform 0.3s ease;
                    ${onCooldown ? 'filter: grayscale(0.5) brightness(0.7);' : ''}
                "></div>
            </div>
            
            <!-- Gaze Button -->
            <button id="pg-crystal-gaze" ${onCooldown ? 'disabled' : ''} style="
                width: 100%;
                padding: 10px 16px;
                border-radius: 6px;
                border: 2px solid ${theme.main};
                background: linear-gradient(135deg, ${theme.main}40, ${theme.main}20);
                color: ${textDark};
                font-size: 11px;
                font-weight: 600;
                cursor: ${onCooldown ? 'not-allowed' : 'pointer'};
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                transition: all 0.2s ease;
                opacity: ${onCooldown ? '0.6' : '1'};
            ">
                <span>◇</span>
                <span id="pg-crystal-btn-text">${onCooldown ? `The mists settle... (${cooldownRemaining}s)` : 'GAZE INTO THE MIST'}</span>
            </button>
            
            <p style="color: ${textLight}; font-size: 9px; text-align: center; margin: 8px 0; font-style: italic;">
                Wild magic. No control. No refunds.
            </p>
            
            <!-- Divider -->
            <div style="border-top: 1px dashed ${textLight}40; margin: 12px 0;"></div>
            
            <!-- Recent Visions -->
            <h3 style="color: ${textDark}; font-size: 11px; font-weight: 600; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">
                Recent Visions
            </h3>
            <div id="pg-crystal-visions" style="
                max-height: 120px;
                overflow-y: auto;
                margin-bottom: 12px;
            ">
                ${visionsHTML}
            </div>
            
            <!-- Divider -->
            <div style="border-top: 1px dashed ${textLight}40; margin: 12px 0;"></div>
            
            <!-- Effect Pool Info -->
            <h3 style="color: ${textDark}; font-size: 11px; font-weight: 600; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px;">
                Effect Pool
            </h3>
            <p style="color: ${textMid}; font-size: 9px; line-height: 1.4;">
                ${totalEffects} possible fates across 6 categories: ${categoryList}.
            </p>
            
            <!-- Result Display (hidden until used) -->
            <div id="pg-crystal-result" style="
                display: none;
                position: fixed;
                top: 45%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: ${theme.cardBg || '#1a1020'};
                border: 3px solid ${theme.main};
                border-radius: 12px;
                padding: 20px;
                max-width: 300px;
                z-index: 10000;
                box-shadow: 0 0 40px ${theme.main}60;
                color: ${theme.textLight || '#fff'};
            ">
                <div id="pg-crystal-result-content"></div>
                <button id="pg-crystal-result-close" style="
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
            
            <!-- Overlay for result -->
            <div id="pg-crystal-overlay" style="
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.7);
                z-index: 9999;
            "></div>
        </div>
    `;
}

/**
 * Initialize event listeners for the crystal ball tab
 */
export function init() {
    const gazeBtn = document.getElementById('pg-crystal-gaze');
    const resultClose = document.getElementById('pg-crystal-result-close');
    const overlay = document.getElementById('pg-crystal-overlay');
    
    if (gazeBtn) {
        gazeBtn.addEventListener('click', handleGaze);
    }
    
    if (resultClose) {
        resultClose.addEventListener('click', closeResult);
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeResult);
    }
    
    // Start cooldown timer if active
    if (cooldownUntil && Date.now() < cooldownUntil) {
        startCooldownTimer();
    }
}

/**
 * Cleanup when leaving the tab
 */
export function cleanup() {
    const gazeBtn = document.getElementById('pg-crystal-gaze');
    const resultClose = document.getElementById('pg-crystal-result-close');
    const overlay = document.getElementById('pg-crystal-overlay');
    
    if (gazeBtn) {
        gazeBtn.removeEventListener('click', handleGaze);
    }
    
    if (resultClose) {
        resultClose.removeEventListener('click', closeResult);
    }
    
    if (overlay) {
        overlay.removeEventListener('click', closeResult);
    }
}

/**
 * Handle the gaze button click
 */
async function handleGaze() {
    // Check cooldown
    if (cooldownUntil && Date.now() < cooldownUntil) {
        return;
    }
    
    const orb = document.getElementById('pg-crystal-orb');
    const btn = document.getElementById('pg-crystal-gaze');
    
    // Animate the orb (pulsing glow)
    if (orb) {
        orb.style.animation = 'pg-crystal-pulse 0.5s ease-in-out 3';
        orb.style.filter = 'brightness(1.5) saturate(1.5)';
    }
    
    // Disable button during animation
    if (btn) {
        btn.disabled = true;
    }
    
    // Wait for dramatic effect
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Draw a fate
    const effect = drawCrystalBallEffect();
    
    // Add to recent visions
    recentVisions.unshift(effect);
    if (recentVisions.length > MAX_RECENT_VISIONS) {
        recentVisions.pop();
    }
    
    // Show the result
    showResult(effect);
    
    // Reset orb
    if (orb) {
        orb.style.animation = '';
        orb.style.filter = '';
    }
    
    // Start cooldown
    cooldownUntil = Date.now() + COOLDOWN_MS;
    startCooldownTimer();
    
    // Update visions display
    updateVisionsDisplay();
    
    // TODO: Actually inject the prompt into SillyTavern
    // This will use setExtensionPrompt() when integrated
    console.log('[Crystal Ball] Vision:', effect.name);
    console.log('[Crystal Ball] Injection:', effect.injection);
}

/**
 * Show the result popup
 */
function showResult(effect) {
    const theme = getTheme(settings.theme);
    const result = document.getElementById('pg-crystal-result');
    const content = document.getElementById('pg-crystal-result-content');
    const overlay = document.getElementById('pg-crystal-overlay');
    
    if (!result || !content) return;
    
    const categoryInfo = CRYSTAL_CATEGORIES[effect.category];
    
    content.innerHTML = `
        <div style="text-align: center; margin-bottom: 12px;">
            <span style="font-size: 32px;">${categoryInfo?.emoji || '🔮'}</span>
        </div>
        <h3 style="
            text-align: center;
            font-size: 14px;
            margin-bottom: 4px;
            color: ${theme.secondary || theme.main};
        ">${effect.name}</h3>
        <p style="
            text-align: center;
            font-size: 10px;
            opacity: 0.7;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
        ">${categoryInfo?.name || effect.category}</p>
        <p style="
            font-style: italic;
            font-size: 11px;
            line-height: 1.5;
            margin-bottom: 12px;
            text-align: center;
        ">"${effect.injection}"</p>
        <div style="
            padding: 8px;
            background: rgba(255,255,255,0.1);
            border-radius: 6px;
            border-left: 3px solid ${theme.main};
        ">
            <p style="font-size: 10px; margin: 0;">
                <strong>Nyx:</strong> <em>${effect.nyxComment}</em>
            </p>
        </div>
    `;
    
    result.style.display = 'block';
    if (overlay) overlay.style.display = 'block';
}

/**
 * Close the result popup
 */
function closeResult() {
    const result = document.getElementById('pg-crystal-result');
    const overlay = document.getElementById('pg-crystal-overlay');
    
    if (result) result.style.display = 'none';
    if (overlay) overlay.style.display = 'none';
}

/**
 * Start the cooldown timer UI updates
 */
function startCooldownTimer() {
    const btn = document.getElementById('pg-crystal-gaze');
    const btnText = document.getElementById('pg-crystal-btn-text');
    const orb = document.getElementById('pg-crystal-orb');
    
    const updateTimer = () => {
        if (!cooldownUntil || Date.now() >= cooldownUntil) {
            // Cooldown finished
            if (btn) {
                btn.disabled = false;
                btn.style.opacity = '1';
            }
            if (btnText) {
                btnText.textContent = 'GAZE INTO THE MIST';
            }
            if (orb) {
                orb.style.filter = '';
            }
            return;
        }
        
        const remaining = Math.ceil((cooldownUntil - Date.now()) / 1000);
        
        if (btn) {
            btn.disabled = true;
            btn.style.opacity = '0.6';
        }
        if (btnText) {
            btnText.textContent = `The mists settle... (${remaining}s)`;
        }
        if (orb) {
            orb.style.filter = 'grayscale(0.5) brightness(0.7)';
        }
        
        // Continue updating
        setTimeout(updateTimer, 1000);
    };
    
    updateTimer();
}

/**
 * Update the recent visions display
 */
function updateVisionsDisplay() {
    const container = document.getElementById('pg-crystal-visions');
    if (!container) return;
    
    const theme = getTheme(settings.theme);
    const textDark = '#2a1810';
    const textMid = '#4a3020';
    const textLight = '#6a5040';
    
    if (recentVisions.length === 0) {
        container.innerHTML = `
            <p style="color: ${textLight}; font-style: italic; text-align: center; font-size: 10px;">
                The mists are clear...
            </p>
        `;
        return;
    }
    
    container.innerHTML = recentVisions.map(v => `
        <div class="pg-vision-entry" style="
            padding: 6px 8px;
            margin-bottom: 6px;
            background: rgba(0,0,0,0.05);
            border-radius: 4px;
            border-left: 3px solid ${theme.main};
        ">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
                <span style="font-size: 12px;">${CRYSTAL_CATEGORIES[v.category]?.emoji || '🔮'}</span>
                <span style="font-weight: 600; color: ${textDark}; font-size: 10px;">${v.name}</span>
            </div>
            <div style="font-size: 9px; color: ${textMid}; font-style: italic;">
                ${v.description}
            </div>
        </div>
    `).join('');
}

// Add CSS animation for the crystal pulse (inject once)
const styleId = 'pg-crystal-styles';
if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        @keyframes pg-crystal-pulse {
            0%, 100% { transform: scale(1); filter: brightness(1); }
            50% { transform: scale(1.1); filter: brightness(1.5) saturate(1.5); }
        }
    `;
    document.head.appendChild(style);
}
