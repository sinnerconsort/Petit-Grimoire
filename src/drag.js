/**
 * Petit Grimoire — Drag System
 * Reusable FAB drag handling + position helpers
 */

import { extensionSettings, dragState, saveSettings } from './state.js';

// ============================================
// FAB DRAG
// ============================================

/**
 * Set up drag-to-move and tap detection for a FAB element.
 * @param {string} elementId - DOM id of the FAB
 * @param {string} stateKey - Key in dragState ('compact' | 'tama')
 * @param {string} positionKey - Key in extensionSettings for saved position
 * @param {Function} [onTap] - Called on tap (not drag)
 */
export function setupFabDrag(elementId, stateKey, positionKey, onTap) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const state = dragState[stateKey];

    function onStart(e) {
        if (e.target.closest('button')) return;

        state.active = true;
        state.moved = false;
        el.classList.add('dragging');

        const rect = el.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        state.offset.x = clientX - rect.left;
        state.offset.y = clientY - rect.top;

        e.preventDefault();
    }

    function onMove(e) {
        if (!state.active) return;

        state.moved = true;

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const rect = el.getBoundingClientRect();

        let newLeft = clientX - state.offset.x;
        let newTop = clientY - state.offset.y;

        // Constrain to viewport
        newLeft = Math.max(5, Math.min(window.innerWidth - rect.width - 5, newLeft));
        newTop = Math.max(5, Math.min(window.innerHeight - rect.height - 5, newTop));

        el.style.setProperty('left', newLeft + 'px', 'important');
        el.style.setProperty('top', newTop + 'px', 'important');
        el.style.setProperty('right', 'auto', 'important');
        el.style.setProperty('bottom', 'auto', 'important');

        e.preventDefault();
    }

    function onEnd(e) {
        if (!state.active) return;

        state.active = false;
        el.classList.remove('dragging');

        if (!state.moved && onTap) {
            onTap(e);
        } else if (state.moved) {
            const rect = el.getBoundingClientRect();
            extensionSettings[positionKey] = {
                top: rect.top,
                left: rect.left,
                right: 'auto',
                bottom: 'auto'
            };
            saveSettings();
        }

        state.moved = false;
    }

    el.addEventListener('mousedown', onStart);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);

    el.addEventListener('touchstart', onStart, { passive: false });
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
}

// ============================================
// POSITION HELPERS
// ============================================

export function getDefaultPosition(elementId) {
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;

    if (elementId === 'mg-tama') {
        return { top: vpH - 240, left: vpW - 130 };
    }
    // compact default
    return { top: vpH - 120, left: vpW - 76 };
}

export function applyPosition(elementId, positionKey) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const pos = extensionSettings[positionKey];
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;

    let top, left;

    if (pos && typeof pos === 'object') {
        if (pos.top !== undefined && pos.top !== 'auto' && !isNaN(Number(pos.top))) {
            top = Number(pos.top);
        } else if (pos.bottom !== undefined && pos.bottom !== 'auto' && !isNaN(Number(pos.bottom))) {
            top = vpH - Number(pos.bottom) - (el.offsetHeight || 56);
        }
        if (pos.left !== undefined && pos.left !== 'auto' && !isNaN(Number(pos.left))) {
            left = Number(pos.left);
        } else if (pos.right !== undefined && pos.right !== 'auto' && !isNaN(Number(pos.right))) {
            left = vpW - Number(pos.right) - (el.offsetWidth || 56);
        }
    }

    if (top === undefined || left === undefined) {
        const defaults = getDefaultPosition(elementId);
        if (top === undefined) top = defaults.top;
        if (left === undefined) left = defaults.left;
    }

    // Clamp to viewport
    const elW = el.offsetWidth || 56;
    const elH = el.offsetHeight || 56;
    top = Math.max(5, Math.min(vpH - elH - 5, top));
    left = Math.max(5, Math.min(vpW - elW - 5, left));

    el.style.setProperty('top', top + 'px', 'important');
    el.style.setProperty('left', left + 'px', 'important');
    el.style.setProperty('bottom', 'auto', 'important');
    el.style.setProperty('right', 'auto', 'important');
}
