/**
 * Petit Grimoire - FAB (Floating Action Button / Compact)
 * The magical compact that opens the grimoire
 */

import { ASSET_PATHS, getTheme } from '../core/config.js';
import { settings, saveFabPosition, getFabPosition } from '../core/state.js';

let fabElement = null;
let isDragging = false;
let hasMoved = false;
let startX, startY, startLeft, startTop;

/**
 * Create the FAB element
 * @param {Function} onOpen - Callback when FAB is clicked (not dragged)
 */
export function createFab(onOpen) {
    destroyFab();
    
    const theme = getTheme(settings.theme);
    const pos = getFabPosition();
    
    const fab = document.createElement('div');
    fab.id = 'pg-fab';
    fab.title = 'Open Petit Grimoire';
    
    Object.assign(fab.style, {
        position: 'fixed',
        left: pos.x + 'px',
        top: pos.y + 'px',
        zIndex: '99999',
        width: '56px',
        height: '56px',
        background: `linear-gradient(135deg, ${theme.cardBg}, ${theme.bg})`,
        border: `3px solid ${theme.main}`,
        borderRadius: '50%',
        boxShadow: `0 4px 20px ${theme.main}66`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        touchAction: 'none',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    });
    
    // Create icon image
    const img = document.createElement('img');
    img.src = `${ASSET_PATHS.sprites}/${theme.fabIcon}`;
    img.alt = '✨';
    img.draggable = false;
    Object.assign(img.style, {
        width: '36px',
        height: '36px',
        imageRendering: 'pixelated',
        pointerEvents: 'none'
    });
    
    // Fallback to emoji if image fails
    img.onerror = () => {
        fab.innerHTML = '✨';
        fab.style.fontSize = '24px';
        fab.style.color = theme.main;
    };
    
    fab.appendChild(img);
    document.body.appendChild(fab);
    
    // Setup drag handlers
    setupDragHandlers(fab, onOpen);
    
    fabElement = fab;
    return fab;
}

/**
 * Destroy the FAB
 */
export function destroyFab() {
    if (fabElement) {
        fabElement.remove();
        fabElement = null;
    }
    document.getElementById('pg-fab')?.remove();
}

/**
 * Update FAB theme
 */
export function updateFabTheme() {
    if (!fabElement) return;
    
    const theme = getTheme(settings.theme);
    
    Object.assign(fabElement.style, {
        background: `linear-gradient(135deg, ${theme.cardBg}, ${theme.bg})`,
        border: `3px solid ${theme.main}`,
        boxShadow: `0 4px 20px ${theme.main}66`
    });
    
    const img = fabElement.querySelector('img');
    if (img) {
        img.src = `${ASSET_PATHS.sprites}/${theme.fabIcon}`;
    }
}

/**
 * Setup drag handlers for the FAB
 */
function setupDragHandlers(fab, onOpen) {
    function onStart(clientX, clientY) {
        isDragging = true;
        hasMoved = false;
        startX = clientX;
        startY = clientY;
        startLeft = fab.offsetLeft;
        startTop = fab.offsetTop;
        fab.style.transition = 'none';
    }
    
    function onMove(clientX, clientY) {
        if (!isDragging) return;
        
        const dx = clientX - startX;
        const dy = clientY - startY;
        
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            hasMoved = true;
        }
        
        let newX = startLeft + dx;
        let newY = startTop + dy;
        
        // Constrain to viewport
        newX = Math.max(0, Math.min(window.innerWidth - 56, newX));
        newY = Math.max(0, Math.min(window.innerHeight - 56, newY));
        
        fab.style.left = newX + 'px';
        fab.style.top = newY + 'px';
    }
    
    function onEnd() {
        if (!isDragging) return;
        isDragging = false;
        fab.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
        
        // Save position
        saveFabPosition(fab.offsetLeft, fab.offsetTop);
        
        // If didn't drag, trigger open
        if (!hasMoved && onOpen) {
            onOpen();
        }
    }
    
    // Mouse events
    fab.addEventListener('mousedown', (e) => {
        e.preventDefault();
        onStart(e.clientX, e.clientY);
    });
    
    document.addEventListener('mousemove', (e) => {
        onMove(e.clientX, e.clientY);
    });
    
    document.addEventListener('mouseup', onEnd);
    
    // Touch events
    fab.addEventListener('touchstart', (e) => {
        onStart(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    
    document.addEventListener('touchmove', (e) => {
        if (isDragging) {
            onMove(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });
    
    document.addEventListener('touchend', onEnd);
}

/**
 * Constrain FAB to viewport (call on resize)
 */
export function constrainFabToViewport() {
    if (!fabElement) return;
    
    const x = Math.max(0, Math.min(window.innerWidth - 56, fabElement.offsetLeft));
    const y = Math.max(0, Math.min(window.innerHeight - 56, fabElement.offsetTop));
    
    fabElement.style.left = x + 'px';
    fabElement.style.top = y + 'px';
    
    saveFabPosition(x, y);
}
