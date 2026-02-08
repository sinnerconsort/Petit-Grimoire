/**
 * Petit Grimoire - FAB (Floating Action Button / Compact)
 * The magical compact that opens the grimoire
 */

import { ASSET_PATHS, getTheme } from '../core/config.js';
import { settings, saveFabPosition, getFabPosition } from '../core/state.js';

let fabElement = null;
let styleElement = null;
let isDragging = false;
let hasMoved = false;
let startX, startY, startLeft, startTop;

/**
 * Inject FAB animations
 */
function injectStyles() {
    if (styleElement) return;
    
    styleElement = document.createElement('style');
    styleElement.id = 'pg-fab-styles';
    styleElement.textContent = `
        @keyframes pg-fab-float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-6px); }
        }
        
        @keyframes pg-fab-pulse {
            0%, 100% { filter: drop-shadow(0 0 8px var(--pg-glow-color)); }
            50% { filter: drop-shadow(0 0 16px var(--pg-glow-color)); }
        }
        
        @keyframes pg-fab-sparkle {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.85; }
        }
        
        #pg-fab {
            animation: pg-fab-float 3s ease-in-out infinite;
        }
        
        #pg-fab:hover {
            animation: pg-fab-float 3s ease-in-out infinite, pg-fab-pulse 1.5s ease-in-out infinite;
        }
        
        #pg-fab.pg-fab-open {
            animation: none;
            transform: scale(0.95);
        }
        
        #pg-fab img {
            transition: transform 0.2s ease;
        }
        
        #pg-fab:hover img {
            transform: scale(1.05);
        }
        
        #pg-fab:active img {
            transform: scale(0.95);
        }
    `;
    document.head.appendChild(styleElement);
}

/**
 * Create the FAB element
 * @param {Function} onToggle - Callback when FAB is clicked (not dragged)
 */
export function createFab(onToggle) {
    destroyFab();
    injectStyles();
    
    const theme = getTheme(settings.theme);
    const pos = getFabPosition();
    
    const fab = document.createElement('div');
    fab.id = 'pg-fab';
    fab.title = 'Open Petit Grimoire';
    
    // Set CSS variable for glow color
    fab.style.setProperty('--pg-glow-color', theme.main + '88');
    
    Object.assign(fab.style, {
        position: 'fixed',
        left: pos.x + 'px',
        top: pos.y + 'px',
        zIndex: '99999',
        width: '64px',
        height: '64px',
        // NO circle - transparent background
        background: 'transparent',
        border: 'none',
        borderRadius: '0',
        boxShadow: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        touchAction: 'none',
        // Filter for glow effect
        filter: `drop-shadow(0 0 8px ${theme.main}66)`
    });
    
    // Create icon image (the sprite IS the button)
    const img = document.createElement('img');
    img.src = `${ASSET_PATHS.sprites}/${theme.fabIcon}`;
    img.alt = '✨';
    img.draggable = false;
    Object.assign(img.style, {
        width: '64px',
        height: '64px',
        imageRendering: 'pixelated',
        pointerEvents: 'none'
    });
    
    // Fallback to emoji if image fails
    img.onerror = () => {
        fab.innerHTML = '✨';
        Object.assign(fab.style, {
            fontSize: '32px',
            color: theme.main,
            background: `linear-gradient(135deg, ${theme.cardBg}, ${theme.bg})`,
            border: `3px solid ${theme.main}`,
            borderRadius: '50%',
            width: '56px',
            height: '56px'
        });
    };
    
    fab.appendChild(img);
    document.body.appendChild(fab);
    
    // Setup drag handlers
    setupDragHandlers(fab, onToggle);
    
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
    
    // Update glow color
    fabElement.style.setProperty('--pg-glow-color', theme.main + '88');
    fabElement.style.filter = `drop-shadow(0 0 8px ${theme.main}66)`;
    
    const img = fabElement.querySelector('img');
    if (img) {
        img.src = `${ASSET_PATHS.sprites}/${theme.fabIcon}`;
    }
}

/**
 * Set FAB open state (changes animation)
 */
export function setFabOpenState(isOpen) {
    if (!fabElement) return;
    
    if (isOpen) {
        fabElement.classList.add('pg-fab-open');
        fabElement.title = 'Close Petit Grimoire';
    } else {
        fabElement.classList.remove('pg-fab-open');
        fabElement.title = 'Open Petit Grimoire';
    }
}

/**
 * Setup drag handlers for the FAB
 */
function setupDragHandlers(fab, onToggle) {
    function onStart(clientX, clientY) {
        isDragging = true;
        hasMoved = false;
        startX = clientX;
        startY = clientY;
        startLeft = fab.offsetLeft;
        startTop = fab.offsetTop;
        // Pause animation while dragging
        fab.style.animation = 'none';
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
        const fabSize = 64;
        newX = Math.max(0, Math.min(window.innerWidth - fabSize, newX));
        newY = Math.max(0, Math.min(window.innerHeight - fabSize, newY));
        
        fab.style.left = newX + 'px';
        fab.style.top = newY + 'px';
    }
    
    function onEnd() {
        if (!isDragging) return;
        isDragging = false;
        
        // Restore animation (unless grimoire is open)
        if (!fab.classList.contains('pg-fab-open')) {
            fab.style.animation = '';
        }
        
        // Save position
        saveFabPosition(fab.offsetLeft, fab.offsetTop);
        
        // If didn't drag, trigger toggle
        if (!hasMoved && onToggle) {
            console.log('[PG FAB] Calling onToggle');
            onToggle();
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
    
    const fabSize = 64;
    const x = Math.max(0, Math.min(window.innerWidth - fabSize, fabElement.offsetLeft));
    const y = Math.max(0, Math.min(window.innerHeight - fabSize, fabElement.offsetTop));
    
    fabElement.style.left = x + 'px';
    fabElement.style.top = y + 'px';
    
    saveFabPosition(x, y);
}
