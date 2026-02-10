/**
 * Petit Grimoire — Nyxgotchi Module
 * 
 * Exports:
 * - Nyxgotchi: Floating tamagotchi companion FAB
 * - Handheld: Game Boy popup panel
 * - Sprites: Cat animation system
 */

// Re-export everything
export {
    createNyxgotchi,
    destroyNyxgotchi,
    toggleNyxgotchi,
    updateShell,
    updateSpriteDisplay,
    updateMoodDisplay,
    setDisposition,
    adjustDisposition,
    getMoodText,
    startSpriteAnimation,
    stopSpriteAnimation
} from './nyxgotchi.js';

export {
    openHandheld,
    closeHandheld,
    isHandheldOpen,
    updateHandheldTheme
} from './handheld.js';

export {
    getSpriteAnimation,
    hasSpriteSupport,
    getAvailableMoods
} from './sprites.js';
