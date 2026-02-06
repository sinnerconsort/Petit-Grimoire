/**
 * Petit Grimoire — Settings Panel
 * Connection profiles, Nyx configuration, theme settings
 */

import { getContext } from '../../../extensions.js';
import { extensionName, extensionSettings, saveSettings } from './state.js';
import { nyxSay } from './nyxgotchi.js';

// ============================================
// CONSTANTS
// ============================================

const VOICE_MODES = {
    template: {
        name: 'Template',
        icon: '📜',
        desc: 'Fast, no API calls',
    },
    generative: {
        name: 'Generative',
        icon: '✨',
        desc: 'AI-powered responses',
    },
};

// ============================================
// PROFILE UTILITIES
// ============================================

/**
 * Get all available connection profiles
 */
export function getConnectionProfiles() {
    try {
        const ctx = getContext();
        const connectionManager = ctx.extensionSettings?.connectionManager;
        return connectionManager?.profiles || [];
    } catch (err) {
        console.warn(`[${extensionName}] Failed to get profiles:`, err);
        return [];
    }
}

/**
 * Get profile ID by name
 */
export function getProfileIdByName(profileName) {
    const ctx = getContext();
    const connectionManager = ctx.extensionSettings?.connectionManager;
    
    if (!connectionManager) return null;
    
    if (profileName === 'current') {
        return connectionManager.selectedProfile;
    }
    
    const profile = connectionManager.profiles?.find(p => p.name === profileName);
    return profile ? profile.id : null;
}

/**
 * Get profile object by ID
 */
export function getProfileById(profileId) {
    if (!profileId) return null;
    
    const ctx = getContext();
    const connectionManager = ctx.extensionSettings?.connectionManager;
    return connectionManager?.profiles?.find(p => p.id === profileId) || null;
}

/**
 * Check if ConnectionManagerRequestService is available
 */
export function hasConnectionManager() {
    try {
        const ctx = getContext();
        return !!ctx.ConnectionManagerRequestService;
    } catch {
        return false;
    }
}

/**
 * Resolve completion preset from profile
 */
export function resolveCompletionPreset(profile, selectedPresetSetting) {
    if (!profile) {
        return { includePreset: false, presetName: null, preset: null, apiType: null };
    }
    
    const ctx = getContext();
    const desiredPreset = selectedPresetSetting || 'current';
    
    let apiMap = null;
    try {
        apiMap = ctx.ConnectionManagerRequestService?.validateProfile(profile);
    } catch (err) {
        console.warn(`[${extensionName}] Failed to validate profile:`, err);
    }
    
    const apiType = apiMap?.selected ?? null;
    const presetManager = apiType ? ctx.getPresetManager?.(apiType) : null;
    
    if (desiredPreset === 'current') {
        const preset = presetManager?.getCompletionPresetByName?.(profile.preset);
        return {
            includePreset: !!profile.preset,
            presetName: profile.preset,
            preset: preset || null,
            apiType
        };
    }
    
    if (presetManager) {
        const preset = presetManager.getCompletionPresetByName?.(desiredPreset);
        if (preset) {
            return { includePreset: true, presetName: desiredPreset, preset, apiType };
        }
    }
    
    const fallbackPreset = presetManager?.getCompletionPresetByName?.(profile.preset);
    return {
        includePreset: !!profile.preset,
        presetName: profile.preset,
        preset: fallbackPreset || null,
        apiType
    };
}

// ============================================
// SETTINGS PANEL HTML
// ============================================

export function getSettingsPanelHTML() {
    const settings = extensionSettings;
    const profiles = getConnectionProfiles();
    const hasProfiles = profiles.length > 0;
    const hasCM = hasConnectionManager();
    
    const isGenerative = settings.nyxVoiceMode === 'generative';
    
    return `
        <div class="mg-tome-heading">⚙️ Settings</div>
        <div class="mg-tome-flavor">Configure your grimoire and familiar</div>
        
        <!-- Nyx Voice Mode -->
        <div class="mg-settings-group">
            <div class="mg-settings-group-title">Nyx Voice</div>
            
            <div class="mg-voice-modes">
                <button class="mg-voice-mode ${!isGenerative ? 'active' : ''}" data-mode="template">
                    <div class="mg-voice-mode-icon">📜</div>
                    <div class="mg-voice-mode-name">Template</div>
                    <div class="mg-voice-mode-desc">Fast, no API</div>
                </button>
                <button class="mg-voice-mode ${isGenerative ? 'active' : ''}" data-mode="generative" ${!hasCM ? 'disabled title="Requires Connection Manager"' : ''}>
                    <div class="mg-voice-mode-icon">✨</div>
                    <div class="mg-voice-mode-name">Generative</div>
                    <div class="mg-voice-mode-desc">AI-powered</div>
                </button>
            </div>
            
            <!-- Connection Profile (shown when generative) -->
            <div class="mg-profile-section" id="mg-profile-section" style="${isGenerative && hasCM ? '' : 'display: none;'}">
                <div class="mg-profile-header">
                    <span class="mg-profile-icon">🔗</span>
                    <span class="mg-profile-title">Connection Profile</span>
                    <span class="mg-profile-status ${hasCM ? 'active' : 'inactive'}">
                        ${hasCM ? 'Available' : 'Unavailable'}
                    </span>
                </div>
                
                <div class="mg-profile-desc">
                    Use a separate API connection for Nyx's voice. Recommended: cheap/fast model like DeepSeek.
                </div>
                
                <div class="mg-setting-row">
                    <div class="mg-setting-label">Profile</div>
                    <select class="mg-select" id="mg-nyx-profile">
                        <option value="current" ${settings.nyxProfile === 'current' ? 'selected' : ''}>
                            Use Current
                        </option>
                        ${profiles.map(p => `
                            <option value="${p.name}" ${settings.nyxProfile === p.name ? 'selected' : ''}>
                                ${p.name}
                            </option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="mg-setting-row">
                    <div class="mg-setting-label">Max Tokens</div>
                    <div class="mg-range-wrap">
                        <input type="range" class="mg-range" id="mg-nyx-tokens" 
                               min="50" max="300" step="25" 
                               value="${settings.nyxMaxTokens || 100}">
                        <span class="mg-range-value" id="mg-nyx-tokens-val">${settings.nyxMaxTokens || 100}</span>
                    </div>
                </div>
                
                <div class="mg-setting-row">
                    <button class="mg-test-btn" id="mg-test-voice">
                        <span>🎭</span> Test Voice
                    </button>
                </div>
            </div>
        </div>
        
        <div class="mg-settings-divider"></div>
        
        <!-- Nyx Behavior -->
        <div class="mg-settings-group">
            <div class="mg-settings-group-title">Behavior</div>
            
            <div class="mg-setting-row">
                <div class="mg-setting-label">
                    Idle Chatter
                    <div class="mg-setting-desc">Random comments when idle</div>
                </div>
                <label class="mg-toggle">
                    <input type="checkbox" id="mg-idle-chat" ${settings.idleChatEnabled ? 'checked' : ''}>
                    <span class="mg-toggle-slider"></span>
                </label>
            </div>
            
            <div class="mg-setting-row">
                <div class="mg-setting-label">
                    Show Disposition
                    <div class="mg-setting-desc">Display mood number on screen</div>
                </div>
                <label class="mg-toggle">
                    <input type="checkbox" id="mg-show-disposition" ${settings.showDisposition !== false ? 'checked' : ''}>
                    <span class="mg-toggle-slider"></span>
                </label>
            </div>
            
            <div class="mg-setting-row">
                <div class="mg-setting-label">Chattiness</div>
                <div class="mg-range-wrap">
                    <input type="range" class="mg-range" id="mg-chattiness" 
                           min="1" max="5" step="1" 
                           value="${settings.chattiness || 3}">
                    <span class="mg-range-value" id="mg-chattiness-val">${['Silent', 'Quiet', 'Normal', 'Chatty', 'Verbose'][settings.chattiness - 1] || 'Normal'}</span>
                </div>
            </div>
        </div>
        
        <div class="mg-settings-divider"></div>
        
        <!-- Appearance -->
        <div class="mg-settings-group">
            <div class="mg-settings-group-title">Appearance</div>
            
            <div class="mg-setting-row">
                <div class="mg-setting-label">Theme</div>
                <select class="mg-select" id="mg-theme">
                    <option value="guardian" ${settings.shellTheme === 'guardian' ? 'selected' : ''}>Guardian</option>
                    <option value="umbra" ${settings.shellTheme === 'umbra' ? 'selected' : ''}>Umbra</option>
                    <option value="apothecary" ${settings.shellTheme === 'apothecary' ? 'selected' : ''}>Apothecary</option>
                    <option value="moonstone" ${settings.shellTheme === 'moonstone' ? 'selected' : ''}>Moonstone</option>
                    <option value="phosphor" ${settings.shellTheme === 'phosphor' ? 'selected' : ''}>Phosphor</option>
                    <option value="rosewood" ${settings.shellTheme === 'rosewood' ? 'selected' : ''}>Rosewood</option>
                    <option value="celestial" ${settings.shellTheme === 'celestial' ? 'selected' : ''}>Celestial</option>
                </select>
            </div>
            
            <div class="mg-setting-row">
                <div class="mg-setting-label">Tama Size</div>
                <select class="mg-select" id="mg-tama-size">
                    <option value="small" ${settings.tamaSize === 'small' ? 'selected' : ''}>Small</option>
                    <option value="medium" ${settings.tamaSize === 'medium' || !settings.tamaSize ? 'selected' : ''}>Medium</option>
                    <option value="large" ${settings.tamaSize === 'large' ? 'selected' : ''}>Large</option>
                </select>
            </div>
            
            <div class="mg-setting-row">
                <div class="mg-setting-label">
                    Show Tama
                    <div class="mg-setting-desc">Display Nyxgotchi widget</div>
                </div>
                <label class="mg-toggle">
                    <input type="checkbox" id="mg-show-tama" ${settings.showTama !== false ? 'checked' : ''}>
                    <span class="mg-toggle-slider"></span>
                </label>
            </div>
        </div>
        
        <div class="mg-settings-divider"></div>
        
        <!-- Tarot Settings -->
        <div class="mg-settings-group">
            <div class="mg-settings-group-title">Tarot</div>
            
            <div class="mg-setting-row">
                <div class="mg-setting-label">
                    Queue Size
                    <div class="mg-setting-desc">Max cards in fate queue</div>
                </div>
                <select class="mg-select" id="mg-queue-size">
                    <option value="3" ${settings.queueSize === 3 ? 'selected' : ''}>3 cards</option>
                    <option value="5" ${settings.queueSize === 5 || !settings.queueSize ? 'selected' : ''}>5 cards</option>
                    <option value="7" ${settings.queueSize === 7 ? 'selected' : ''}>7 cards</option>
                </select>
            </div>
            
            <div class="mg-setting-row">
                <div class="mg-setting-label">Card Expiry</div>
                <div class="mg-range-wrap">
                    <input type="range" class="mg-range" id="mg-card-expiry" 
                           min="10" max="50" step="5" 
                           value="${settings.cardExpiry || 20}">
                    <span class="mg-range-value" id="mg-card-expiry-val">${settings.cardExpiry || 20} msg</span>
                </div>
            </div>
        </div>
        
        <button class="mg-reset-btn" id="mg-reset-settings">
            ↺ Reset to Defaults
        </button>
        
        <div class="mg-version-info">
            Petit Grimoire v0.1.0
        </div>
    `;
}

// ============================================
// EVENT BINDING
// ============================================

export function bindSettingsEvents() {
    // Voice mode selection
    $(document).on('click', '.mg-voice-mode:not([disabled])', function() {
        const mode = $(this).data('mode');
        extensionSettings.nyxVoiceMode = mode;
        
        $('.mg-voice-mode').removeClass('active');
        $(this).addClass('active');
        
        // Show/hide profile section
        if (mode === 'generative' && hasConnectionManager()) {
            $('#mg-profile-section').slideDown(200);
        } else {
            $('#mg-profile-section').slideUp(200);
        }
        
        saveSettings();
    });
    
    // Profile selection
    $(document).on('change', '#mg-nyx-profile', function() {
        extensionSettings.nyxProfile = $(this).val();
        saveSettings();
    });
    
    // Max tokens slider
    $(document).on('input', '#mg-nyx-tokens', function() {
        const val = $(this).val();
        $('#mg-nyx-tokens-val').text(val);
        extensionSettings.nyxMaxTokens = parseInt(val);
        saveSettings();
    });
    
    // Test voice button
    $(document).on('click', '#mg-test-voice', async function() {
        const $btn = $(this);
        $btn.addClass('testing').find('span').text('⏳');
        
        try {
            await testGenerativeVoice();
        } catch (err) {
            console.error(`[${extensionName}] Voice test failed:`, err);
            nyxSay('poke'); // Fallback to template
        }
        
        $btn.removeClass('testing').find('span').text('🎭');
    });
    
    // Idle chat toggle
    $(document).on('change', '#mg-idle-chat', function() {
        extensionSettings.idleChatEnabled = $(this).is(':checked');
        saveSettings();
    });
    
    // Show disposition toggle
    $(document).on('change', '#mg-show-disposition', function() {
        extensionSettings.showDisposition = $(this).is(':checked');
        $('#nyxgotchi-disposition').toggle(extensionSettings.showDisposition);
        saveSettings();
    });
    
    // Chattiness slider
    $(document).on('input', '#mg-chattiness', function() {
        const val = parseInt($(this).val());
        const labels = ['Silent', 'Quiet', 'Normal', 'Chatty', 'Verbose'];
        $('#mg-chattiness-val').text(labels[val - 1]);
        extensionSettings.chattiness = val;
        saveSettings();
    });
    
    // Theme selection
    $(document).on('change', '#mg-theme', function() {
        extensionSettings.shellTheme = $(this).val();
        $('#nyxgotchi').attr('data-mg-theme', extensionSettings.shellTheme);
        $('#mg-grimoire').attr('data-mg-theme', extensionSettings.shellTheme);
        saveSettings();
    });
    
    // Tama size
    $(document).on('change', '#mg-tama-size', function() {
        extensionSettings.tamaSize = $(this).val();
        $('#nyxgotchi').attr('data-mg-size', extensionSettings.tamaSize);
        saveSettings();
    });
    
    // Show tama toggle
    $(document).on('change', '#mg-show-tama', function() {
        extensionSettings.showTama = $(this).is(':checked');
        $('#nyxgotchi').toggle(extensionSettings.showTama);
        saveSettings();
    });
    
    // Queue size
    $(document).on('change', '#mg-queue-size', function() {
        extensionSettings.queueSize = parseInt($(this).val());
        saveSettings();
    });
    
    // Card expiry slider
    $(document).on('input', '#mg-card-expiry', function() {
        const val = $(this).val();
        $('#mg-card-expiry-val').text(val + ' msg');
        extensionSettings.cardExpiry = parseInt(val);
        saveSettings();
    });
    
    // Reset settings
    $(document).on('click', '#mg-reset-settings', function() {
        if (confirm('Reset all settings to defaults?')) {
            resetToDefaults();
        }
    });
}

// ============================================
// GENERATIVE VOICE
// ============================================

/**
 * Test the generative voice with current profile
 */
async function testGenerativeVoice() {
    const ctx = getContext();
    
    if (!ctx.ConnectionManagerRequestService) {
        throw new Error('ConnectionManagerRequestService not available');
    }
    
    const profileId = getProfileIdByName(extensionSettings.nyxProfile || 'current');
    const profile = getProfileById(profileId);
    
    if (!profileId || !profile) {
        throw new Error('Profile not found');
    }
    
    const prompt = `You are Nyx, an ancient, sardonic magical familiar. You're condescending but occasionally almost affectionate. Respond to being poked by the user with a single short line (under 15 words). Be sarcastic.`;
    
    const response = await ctx.ConnectionManagerRequestService.sendRequest(
        profileId,
        [{ role: 'user', content: prompt }],
        extensionSettings.nyxMaxTokens || 100,
        {
            extractData: true,
            includePreset: true,
            includeInstruct: false
        },
        {}
    );
    
    if (response?.content) {
        // Show the generated response
        const { showSpeech } = await import('./nyxgotchi.js');
        showSpeech(response.content.trim(), 5000);
    }
}

/**
 * Generate Nyx dialogue using AI
 */
export async function generateNyxLine(situation, context = {}) {
    const ctx = getContext();
    
    if (!ctx.ConnectionManagerRequestService) {
        return null; // Fallback to template
    }
    
    const profileId = getProfileIdByName(extensionSettings.nyxProfile || 'current');
    const profile = getProfileById(profileId);
    
    if (!profileId || !profile) {
        return null;
    }
    
    const prompt = buildNyxPrompt(situation, context);
    
    try {
        const response = await ctx.ConnectionManagerRequestService.sendRequest(
            profileId,
            [{ role: 'user', content: prompt }],
            extensionSettings.nyxMaxTokens || 100,
            {
                extractData: true,
                includePreset: true,
                includeInstruct: false
            },
            {}
        );
        
        return response?.content?.trim() || null;
    } catch (err) {
        console.warn(`[${extensionName}] Generative voice failed:`, err);
        return null;
    }
}

/**
 * Build prompt for Nyx based on situation
 */
function buildNyxPrompt(situation, context) {
    const mood = context.mood || 'neutral';
    const disposition = context.disposition || 50;
    
    const basePrompt = `You are Nyx, an ancient magical familiar bound to a human. You are sardonic, condescending, and insufferably knowledgeable. You've lived for eons and find mortals both amusing and tedious.

Current mood: ${mood} (disposition: ${disposition}/100)
Time: ${context.timePeriod || 'unknown'}

Respond with a single short line (under 20 words). No quotes, no actions, just dialogue.`;

    const situationPrompts = {
        poke: `The human just poked you to get your attention.`,
        poke_spam: `The human keeps poking you repeatedly. You're annoyed.`,
        card_drawn: `The human just drew a tarot card: ${context.cardName || 'unknown'}.`,
        card_triggered: `A fate card (${context.cardName}) just triggered in the story.`,
        card_expired: `A fate card (${context.cardName}) expired unused.`,
        idle_nudge: `You haven't spoken in a while. Make an idle observation.`,
        greeting: `The human just opened the grimoire. Greet them (${context.timePeriod}).`,
    };
    
    return `${basePrompt}\n\nSituation: ${situationPrompts[situation] || 'Respond naturally.'}`;
}

// ============================================
// DEFAULTS
// ============================================

function resetToDefaults() {
    extensionSettings.nyxVoiceMode = 'template';
    extensionSettings.nyxProfile = 'current';
    extensionSettings.nyxMaxTokens = 100;
    extensionSettings.idleChatEnabled = true;
    extensionSettings.showDisposition = true;
    extensionSettings.chattiness = 3;
    extensionSettings.shellTheme = 'guardian';
    extensionSettings.tamaSize = 'medium';
    extensionSettings.showTama = true;
    extensionSettings.queueSize = 5;
    extensionSettings.cardExpiry = 20;
    
    saveSettings();
    
    // Refresh settings panel
    const panel = document.querySelector('[data-panel="settings"]');
    if (panel) {
        panel.innerHTML = getSettingsPanelHTML();
    }
}

// ============================================
// INIT
// ============================================

export function initSettings() {
    bindSettingsEvents();
    console.log(`[${extensionName}] Settings initialized`);
}
