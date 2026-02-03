/**
 * Petit Grimoire — Compact Brooch
 * Crystal Star Brooch HTML generation + creation
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
             data-mg-variant="crystal-star"
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
