/**
 * Petit Grimoire — Compact Brooch
 * Pixel art moon sprite FAB — opens the Grimoire
 */

import { extensionName, extensionSettings } from './state.js';
import { setupFabDrag, applyPosition } from './drag.js';

// ============================================
// HTML
// ============================================

export function getCompactHTML() {
    return `
        <div class="mg-fab mg-compact" id="mg-compact"
             data-mg-theme="${extensionSettings.shellTheme}"
             data-mg-size="${extensionSettings.compactSize || 'medium'}">
            <div class="mg-compact-body">
                <div class="mg-compact-glow"></div>
                <div class="mg-compact-icon"></div>
                <div class="mg-compact-sparkles">
                    <span class="mg-compact-sparkle"></span>
                    <span class="mg-compact-sparkle"></span>
                    <span class="mg-compact-sparkle"></span>
                    <span class="mg-compact-sparkle"></span>
                </div>
                <div class="mg-compact-badge" id="mg-compact-badge"></div>
            </div>
        </div>
    `;
}

// ============================================
// CREATION
// ============================================

/**
 * Create compact brooch and append to DOM.
 * @param {Function} onTap - Called on tap (not drag). Typically triggerTransformation.
 */
export function createCompact(onTap) {
    $('#mg-compact').remove();

    $('body').append(getCompactHTML());

    const $compact = $('#mg-compact');
    if ($compact.length === 0) {
        console.error(`[${extensionName}] Failed to create compact`);
        return;
    }

    const el = $compact[0];

    // Force critical display properties
    el.style.setProperty('position', 'fixed', 'important');
    el.style.setProperty('z-index', '2147483647', 'important');
    el.style.setProperty('display', 'flex', 'important');
    el.style.setProperty('visibility', 'visible', 'important');
    el.style.setProperty('opacity', '1', 'important');
    el.style.setProperty('pointer-events', 'auto', 'important');

    applyPosition('mg-compact', 'compactPosition');

    setupFabDrag('mg-compact', 'compact', 'compactPosition', () => {
        if (onTap) onTap();
    });

    // Respect visibility setting
    if (!extensionSettings.showCompact) {
        el.style.setProperty('display', 'none', 'important');
    }

    console.log(`[${extensionName}] Compact created`);
}

// ============================================
// BADGE (fate queue count)
// ============================================

/**
 * Update the queue badge on the compact FAB.
 * @param {number} count - Number of cards in the fate queue
 */
export function updateCompactBadge(count) {
    const $badge = $('#mg-compact-badge');
    if ($badge.length === 0) return;

    if (count > 0) {
        $badge.text(count).addClass('visible');
    } else {
        $badge.removeClass('visible');
    }
}

// ============================================
// VISUAL STATE
// ============================================

/**
 * Set active state (grimoire is open)
 */
export function setCompactActive(isActive) {
    $('#mg-compact').toggleClass('active', isActive);
}

/**
 * Play transformation flash animation
 */
export function playTransformFlash() {
    const $compact = $('#mg-compact');
    $compact.addClass('transforming');
    setTimeout(() => $compact.removeClass('transforming'), 400);
}
