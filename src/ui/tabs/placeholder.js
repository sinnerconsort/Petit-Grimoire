/**
 * Petit Grimoire - Placeholder Tab
 * "Coming soon" content for unbuilt tabs
 */

// Tab metadata
const TAB_META = {
    tarot: {
        icon: '🎴',
        name: 'TAROT',
        quote: 'The cards know what you refuse to see.'
    },
    crystal: {
        icon: '🔮',
        name: 'CRYSTAL BALL',
        quote: 'Fate is not a request line.'
    },
    ouija: {
        icon: '👻',
        name: 'OUIJA',
        quote: 'Ask, and fate shall answer. Then make it true.'
    },
    nyx: {
        icon: '🐱',
        name: 'NYX',
        quote: "I'm watching. Always watching."
    },
    spells: {
        icon: '✨',
        name: 'SPELL CARDS',
        quote: 'Words have power. Use them wisely.'
    }
};

/**
 * Get placeholder content for an unbuilt tab
 * @param {string} tabId - Optional tab ID for custom messaging
 * @returns {string} HTML content
 */
export function getContent(tabId = 'unknown') {
    const meta = TAB_META[tabId] || {
        icon: '✦',
        name: tabId.toUpperCase(),
        quote: 'Magic awaits...'
    };
    
    // Colors for grimoire's light parchment background
    const textDark = '#2a1810';
    const textMid = '#4a3020';
    const textLight = '#6a5040';
    
    return `
        <h2 class="pg-page-title" style="color: ${textDark}; margin: 0 0 8px 0; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
            ${meta.icon} ${meta.name}
        </h2>
        <p style="color: ${textMid}; font-style: italic; font-size: 10px; margin-bottom: 15px;">
            "${meta.quote}"
        </p>
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: ${textLight}; gap: 12px;">
            <div style="font-size: 32px; opacity: 0.4;">
                ${meta.icon}
            </div>
            <p style="font-style: italic; font-size: 11px;">Coming soon...</p>
            <p style="font-size: 9px; opacity: 0.6; text-align: center; max-width: 180px;">
                This mystical feature is still being woven into existence.
            </p>
        </div>
    `;
}

/**
 * Initialize placeholder tab (no-op)
 */
export function init() {
    // Nothing to initialize for placeholder
}

/**
 * Cleanup placeholder tab (no-op)
 */
export function cleanup() {
    // Nothing to cleanup for placeholder
}
