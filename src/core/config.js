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
    wizardCat: `${extensionFolderPath}/assets/sprites/wizard-cat`,
    icons: `${extensionFolderPath}/assets/sprites/tabs`
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
 * Nyxgotchi size presets
 * Each size defines shell dimensions
 */
export const NYXGOTCHI_SIZES = {
    tiny: {
        name: 'Tiny',
        shell: 60,
        sprite: 32
    },
    small: {
        name: 'Small',
        shell: 80,
        sprite: 40
    },
    medium: {
        name: 'Medium',
        shell: 100,
        sprite: 48
    },
    large: {
        name: 'Large',
        shell: 120,
        sprite: 52
    }
};

/**
 * Theme definitions
 * Each theme has colors, FAB icon, Nyxgotchi shell, gameboy shell, and grimoire filter
 * 
 * grimoireFilter: CSS filter to tint the grimoire sprite
 * Base grimoire is warm tan (~35° hue), filters shift it to match theme
 * 
 * gameboyShell: PNG filename in shells/ folder for the handheld popup
 * Base gameboy_lid.png is grey; themed versions are pre-colored
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
        gameboyShell: 'gameboy_guardian.png',
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
        gameboyShell: 'gameboy_umbra.png',
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
        gameboyShell: 'gameboy_apothecary.png',
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
        gameboyShell: 'gameboy_moonstone.png',
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
        gameboyShell: 'gameboy_phosphor.png',
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
        gameboyShell: 'gameboy_rosewood.png',
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
        gameboyShell: 'gameboy_celestial.png',
        // Grimoire tint: warm tan → deep navy blue (darker, richer)
        grimoireFilter: 'hue-rotate(200deg) saturate(2.0) brightness(0.55) contrast(1.1)'
    },
    angel: {
        name: 'Angel',
        desc: 'Divine Light • Heavenly Grace',
        // Colors - warm whites, golds, soft blues
        main: '#f0e6d0',
        secondary: '#d4a843',
        accent1: '#8eb8d4',
        accent2: '#f5d98a',
        bg: '#1a1812',
        cardBg: '#2a2518',
        textLight: '#fdf8ef',
        textDim: '#d4a84388',
        // Icon colors (soft gold/blue)
        iconActive: '#f5d98a',
        iconInactive: '#d4a843',
        // Assets
        fabIcon: 'fab-angel.png',
        shell: 'angel-shell.png',
        gameboyShell: 'gameboy_angel.png',
        // Grimoire tint: warm tan → ivory gold (warm, bright, ethereal)
        grimoireFilter: 'hue-rotate(15deg) saturate(0.5) brightness(1.25) contrast(0.95)'
    },
    demon: {
        name: 'Demon',
        desc: 'Infernal Pact • Hellfire Sigils',
        // Colors - deep reds, blacks, ember orange
        main: '#8b1a1a',
        secondary: '#e05030',
        accent1: '#ff6b35',
        accent2: '#2a0a0a',
        bg: '#120808',
        cardBg: '#1e0c0c',
        textLight: '#ffd5c8',
        textDim: '#e0503088',
        // Icon colors (ember/fire)
        iconActive: '#ff6b35',
        iconInactive: '#8b1a1a',
        // Assets
        fabIcon: 'fab-demon.png',
        shell: 'demon-shell.png',
        gameboyShell: 'gameboy_demon.png',
        // Grimoire tint: warm tan → blood red/charred (dark, saturated)
        grimoireFilter: 'hue-rotate(345deg) saturate(1.8) brightness(0.6) contrast(1.2)'
    }
};

/**
 * Tab definitions for the grimoire
 */
export const TABS = [
    { id: 'tarot', name: 'Tarot', icon: 'fa-star' },
    { id: 'crystal', name: 'Crystal Ball', icon: 'fa-circle' },
    { id: 'ouija', name: 'Ouija', icon: 'fa-ghost' },
    { id: 'spells', name: 'Spell Cards', icon: 'fa-magic' },
    { id: 'nyx', name: 'Nyx', icon: 'fa-cat' },
    { id: 'settings', name: 'Settings', icon: 'fa-cog' }
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
    grimoireLocked: false,    // Lock position toggle
    // Font settings
    fancyFont: false,         // Use Gentry Society decorative font
    // Nyxgotchi settings
    showNyxgotchi: true,                      // Toggle visibility
    nyxgotchiSize: 'medium',                  // Size preset: tiny, small, medium, large
    nyxgotchiPosition: { x: null, y: null },  // Saved drag position
    nyxDisposition: 50                        // 0-100, affects mood
};

/**
 * Get theme by name, with fallback to guardian
 */
export function getTheme(themeName) {
    return THEMES[themeName] || THEMES.guardian;
}

/**
 * Get Nyxgotchi size preset, with fallback to medium
 */
export function getNyxgotchiSize(sizeName) {
    return NYXGOTCHI_SIZES[sizeName] || NYXGOTCHI_SIZES.medium;
}
