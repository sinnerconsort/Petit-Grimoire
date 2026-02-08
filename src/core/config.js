/**
 * Petit Grimoire - Configuration
 * Themes, constants, and asset paths
 */

export const extensionName = 'third-party/Petit-Grimoire';
export const extensionFolderPath = `scripts/extensions/${extensionName}`;

/**
 * Asset paths - matching repo structure
 */
export const ASSET_PATHS = {
    grimoire: `${extensionFolderPath}/assets/grimoire`,
    shells: `${extensionFolderPath}/assets/shells`,
    sprites: `${extensionFolderPath}/assets/sprites`,
    wizardCat: `${extensionFolderPath}/assets/sprites/wizard-cat`
};

/**
 * Grimoire sprite info
 * All sprites are 896×720 per frame
 */
export const GRIMOIRE_SPRITES = {
    opening: {
        file: 'Grimoire_Opening.png',
        frames: 5,
        frameWidth: 896,
        frameHeight: 720
    },
    closing: {
        file: 'Grimoire_Closing.png',
        frames: 5,
        frameWidth: 896,
        frameHeight: 720
    },
    open: {
        file: 'Grimoire_WithTabs.png',
        frames: 1,
        frameWidth: 896,
        frameHeight: 720
    },
    pageNext: {
        file: 'Grimoire_PageNext.png',
        frames: 9,
        frameWidth: 448,
        frameHeight: 360
    },
    pagePrev: {
        file: 'Grimoire_PagePrev.png',
        frames: 9,
        frameWidth: 448,
        frameHeight: 360
    }
};

/**
 * Theme definitions
 * Each theme has colors, FAB icon, Nyxgotchi shell, and grimoire filter
 * 
 * grimoireFilter: CSS filter to tint the grimoire sprite
 * Base grimoire is warm tan (~35° hue), filters shift it to match theme
 */
export const THEMES = {
    guardian: {
        name: 'Guardian',
        desc: 'Star Prism • Gem Guardians',
        // Colors
        main: '#dc78aa',
        secondary: '#f3aa1e',
        accent1: '#e71720',
        accent2: '#26508a',
        bg: '#1a0a12',
        cardBg: '#2a1020',
        textLight: '#fce4ec',
        textDim: '#dc78aa99',
        // Icon colors (purple like tama bow)
        iconActive: '#8060c0',
        iconInactive: '#6040a0',
        // Assets
        fabIcon: 'fab-guardian.png',
        shell: 'guardian-shell.png',
        // Grimoire tint: warm tan → pink/magenta
        grimoireFilter: 'hue-rotate(300deg) saturate(1.3) brightness(1.05)'
    },
    umbra: {
        name: 'Umbra',
        desc: 'Grief Seeds • Soul Fragments',
        main: '#940e8f',
        secondary: '#d89520',
        accent1: '#5d0971',
        accent2: '#c8b1f7',
        bg: '#0d0512',
        cardBg: '#1a0825',
        textLight: '#e8d5f5',
        textDim: '#c8b1f788',
        // Icon colors (dark purple)
        iconActive: '#c8b1f7',
        iconInactive: '#5d0971',
        fabIcon: 'fab-umbra.png',
        shell: 'umbra-shell.png',
        // Grimoire tint: warm tan → deep purple (darker, more saturated)
        grimoireFilter: 'hue-rotate(255deg) saturate(1.6) brightness(0.75)'
    },
    apothecary: {
        name: 'Apothecary',
        desc: 'Dried Herbs • Forest Remedies',
        main: '#76482e',
        secondary: '#4c6b20',
        accent1: '#bdbf46',
        accent2: '#e9ae75',
        bg: '#1a150e',
        cardBg: '#2a2015',
        textLight: '#f0e6d8',
        textDim: '#e9ae7588',
        // Icon colors (earthy green/gold)
        iconActive: '#bdbf46',
        iconInactive: '#4c6b20',
        fabIcon: 'fab-apothecary.png',
        shell: 'apothecary-shell.png',
        // Grimoire tint: warm tan → earthy olive/sage (minimal shift, keep natural)
        grimoireFilter: 'hue-rotate(50deg) saturate(0.85) brightness(0.95)'
    },
    moonstone: {
        name: 'Moonstone',
        desc: 'Moon Phases • Crystal Paws',
        main: '#d9c7fb',
        secondary: '#bcf1fd',
        accent1: '#feebff',
        accent2: '#d692ff',
        bg: '#1a1525',
        cardBg: '#251e35',
        textLight: '#feebff',
        textDim: '#d9c7fb88',
        // Icon colors (soft purple/cyan)
        iconActive: '#bcf1fd',
        iconInactive: '#a090d0',
        fabIcon: 'fab-moonstone.png',
        shell: 'moonstone-shell.png',
        // Grimoire tint: warm tan → soft lavender (lighter, desaturated)
        grimoireFilter: 'hue-rotate(240deg) saturate(0.7) brightness(1.15)'
    },
    phosphor: {
        name: 'Phosphor',
        desc: 'Neon Crystals • Digital Potions',
        main: '#7375ca',
        secondary: '#feffff',
        accent1: '#f990f6',
        accent2: '#120147',
        bg: '#060018',
        cardBg: '#0d0230',
        textLight: '#e8e8ff',
        textDim: '#7375ca88',
        // Icon colors (cyan/turquoise)
        iconActive: '#00e5e5',
        iconInactive: '#0090a0',
        fabIcon: 'fab-phosphor.png',
        shell: 'phosphor-shell.png',
        // Grimoire tint: warm tan → neon purple/cyan (vibrant, high contrast)
        grimoireFilter: 'hue-rotate(230deg) saturate(1.8) brightness(0.9) contrast(1.15)'
    },
    rosewood: {
        name: 'Rosewood',
        desc: 'Dream Diary • Rose Sigils',
        main: '#e4b0bc',
        secondary: '#d8caca',
        accent1: '#83b6ac',
        accent2: '#177656',
        bg: '#1a1214',
        cardBg: '#2a1e22',
        textLight: '#f5eaed',
        textDim: '#e4b0bc88',
        // Icon colors (green tones)
        iconActive: '#83b6ac',
        iconInactive: '#177656',
        fabIcon: 'fab-rosewood.png',
        shell: 'rosewood-shell.png',
        // Grimoire tint: warm tan → soft blush pink (light, soft, dreamy)
        grimoireFilter: 'hue-rotate(320deg) saturate(0.6) brightness(1.12)'
    },
    celestial: {
        name: 'Celestial',
        desc: 'Astral Chains • Starbound Grimoire',
        main: '#002f86',
        secondary: '#e3b35f',
        accent1: '#132040',
        accent2: '#fbe09c',
        bg: '#060d1a',
        cardBg: '#0c1528',
        textLight: '#fbe09c',
        textDim: '#e3b35f88',
        // Icon colors (gold tones)
        iconActive: '#fbe09c',
        iconInactive: '#e3b35f',
        fabIcon: 'fab-celestial.png',
        shell: 'celestial-shell.png',
        // Grimoire tint: warm tan → deep navy blue (darker, richer)
        grimoireFilter: 'hue-rotate(200deg) saturate(2.0) brightness(0.55) contrast(1.1)'
    }
};

/**
 * Tab definitions for the grimoire
 */
export const TABS = [
    { id: 'tarot', name: 'Tarot', icon: 'fa-star' },
    { id: 'crystal', name: 'Crystal Ball', icon: 'fa-circle' },
    { id: 'ouija', name: 'Ouija', icon: 'fa-ghost' },
    { id: 'spells', name: 'Spell Cards', icon: 'fa-wand-magic-sparkles' },
    { id: 'nyx', name: 'Nyx', icon: 'fa-cat' },
    { id: 'settings', name: 'Settings', icon: 'fa-gear' }
];

/**
 * Default extension settings
 */
export const DEFAULT_SETTINGS = {
    enabled: true,
    theme: 'guardian',
    activeTab: 'tarot',
    fabPosition: { x: null, y: null },
    grimoireOpen: false,
    // Grimoire positioning
    grimoireOffsetY: 0,       // Vertical offset in pixels (-200 to 200)
    grimoireLocked: false     // Lock position toggle
};

/**
 * Get theme by name, with fallback to guardian
 */
export function getTheme(themeName) {
    return THEMES[themeName] || THEMES.guardian;
}
