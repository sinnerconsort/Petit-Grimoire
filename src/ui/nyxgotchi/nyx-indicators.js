/**
 * Petit Grimoire — Nyx Indicators
 * Tiny pixel sprite animations that pop above the tama
 * when Nyx has something to say.
 * 
 * Sprites live in assets/effects/indicators/
 * 
 * Usage:
 *   import { showIndicator, clearIndicator } from './nyx-indicators.js';
 *   showIndicator('speech');   // Nyx wants to chat
 *   showIndicator('alert');    // Urgent/angry
 *   showIndicator('thinking'); // Processing
 *   showIndicator('idle');     // Gentle nudge
 *   clearIndicator();          // Remove
 */

import { ASSET_PATHS } from '../../core/config.js';

// ============================================
// INDICATOR DEFINITIONS
// ============================================

const INDICATORS = {
    speech: {
        file: 'speech_bubble_animation-11x11.png',
        frameWidth: 11,
        frameHeight: 11,
        frames: 8,
        fps: 6,
        loop: true
    },
    alert: {
        file: 'exclamation-7x8.png',
        frameWidth: 7,
        frameHeight: 8,
        frames: 6,
        fps: 8,
        loop: true
    },
    thinking: {
        file: 'tiny_speech_indicators-11x11.png',
        frameWidth: 11,
        frameHeight: 11,
        frames: 8,
        fps: 4,
        loop: true
    },
    idle: {
        file: 'tiny_chat_icon.png',
        frameWidth: 10,
        frameHeight: 11,
        frames: 1,
        fps: 0,
        loop: false
    }
};

// ============================================
// STATE
// ============================================

let currentIndicator = null;
let animationInterval = null;
let currentFrame = 0;
let pendingMessage = null;  // { type, screen, data } — what to show when tama tapped

// ============================================
// RENDER
// ============================================

/**
 * Show an indicator above the tama.
 * @param {string} type - 'speech' | 'alert' | 'thinking' | 'idle'
 * @param {object} [message] - Optional message data for when tama is tapped
 *   { screen: 'chat', data: { text: '...' } }
 */
export function showIndicator(type, message = null) {
    const indicator = INDICATORS[type];
    if (!indicator) {
        console.warn('[Indicators] Unknown type:', type);
        return;
    }

    // Store pending message
    if (message) {
        pendingMessage = { type, ...message };
    }

    // Clear existing
    clearIndicator();

    currentIndicator = type;

    // Get or create the indicator element
    let el = document.getElementById('nyx-indicator');
    if (!el) {
        console.warn('[Indicators] Indicator element not found in DOM');
        return;
    }

    const spritePath = `${ASSET_PATHS.effects}/indicators/${indicator.file}`;
    const totalWidth = indicator.frames * indicator.frameWidth;

    // Scale up for visibility (3x pixel-perfect)
    const scale = 3;
    const displayW = indicator.frameWidth * scale;
    const displayH = indicator.frameHeight * scale;

    el.style.cssText = `
        width: ${displayW}px;
        height: ${displayH}px;
        background-image: url('${spritePath}');
        background-size: ${totalWidth * scale}px ${displayH}px;
        background-position: 0 0;
        background-repeat: no-repeat;
        image-rendering: pixelated;
        image-rendering: crisp-edges;
        display: block;
        animation: nyx-indicator-bounce 0.6s ease-in-out infinite;
    `;

    // Animate frames
    if (indicator.frames > 1 && indicator.fps > 0) {
        currentFrame = 0;
        animationInterval = setInterval(() => {
            currentFrame = (currentFrame + 1) % indicator.frames;
            el.style.backgroundPosition = `-${currentFrame * indicator.frameWidth * scale}px 0`;
        }, 1000 / indicator.fps);
    }

    console.log('[Indicators] Showing:', type);
}

/**
 * Clear the current indicator
 */
export function clearIndicator() {
    if (animationInterval) {
        clearInterval(animationInterval);
        animationInterval = null;
    }

    const el = document.getElementById('nyx-indicator');
    if (el) {
        el.style.display = 'none';
        el.style.backgroundImage = '';
    }

    currentIndicator = null;
    currentFrame = 0;
}

/**
 * Get and consume the pending message (called when tama is tapped)
 * @returns {object|null} The pending message, or null
 */
export function consumePendingMessage() {
    const msg = pendingMessage;
    pendingMessage = null;
    clearIndicator();
    return msg;
}

/**
 * Check if there's a pending message
 */
export function hasPendingMessage() {
    return pendingMessage !== null;
}

/**
 * Get current indicator type
 */
export function getCurrentIndicator() {
    return currentIndicator;
}

/**
 * Get the indicator HTML element to insert into the tama template.
 * This is the container div that sits above the shell.
 */
export function getIndicatorHTML() {
    return `<div id="nyx-indicator" style="
        display: none;
        position: absolute;
        top: -8px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10;
        pointer-events: none;
    "></div>`;
}

// Inject bounce animation CSS (once)
const styleId = 'nyx-indicator-styles';
if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        @keyframes nyx-indicator-bounce {
            0%, 100% { transform: translateX(-50%) translateY(0); }
            50% { transform: translateX(-50%) translateY(-6px); }
        }
    `;
    document.head.appendChild(style);
}
