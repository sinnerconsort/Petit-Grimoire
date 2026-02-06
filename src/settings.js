/**
 * Petit Grimoire — Settings Panel
 * Connection profiles, Nyx configuration, theme settings
 */

import { getContext } from '../../../../extensions.js';
import { extensionName, extensionSettings, saveSettings } from './state.js';
import { nyxSay } from './nyxgotchi.js';

// ============================================
// PROFILE UTILITIES
// ============================================

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

export function getProfileIdByName(profileName) {
    try {
        const ctx = getContext();
        const connectionManager = ctx.extensionSettings?.connectionManager;
        if (!connectionManager) return null;
        if (profileName === 'current') return connectionManager.selectedProfile;
        const profile = connectionManager.profiles?.find(p => p.name === profileName);
        return profile ? profile.id : null;
    } catch {
        return null;
    }
}

export function getProfileById(profileId) {
    if (!profileId) return null;
    try {
        const ctx = getContext();
        const connectionManager = ctx.extensionSettings?.connectionManager;
        return connectionManager?.profiles?.find(p => p.id === profileId) || null;
    } catch {
        return null;
    }
}

export function hasConnectionManager() {
    try {
        const ctx = getContext();
        return !!ctx.ConnectionManagerRequestService;
    } catch {
        return false;
    }
}

// ============================================
// SETTINGS PANEL HTML
// ============================================

export function getSettingsPanelHTML() {
    const s = extensionSettings;
    const profiles = getConnectionProfiles();
    const hasCM = hasConnectionManager();
    const isGenerative = s.nyxVoiceMode === 'generative';
    const chattinessLabels = ['Silent', 'Quiet', 'Normal', 'Chatty', 'Verbose'];
    
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
            
            <div class="mg-profile-section" id="mg-profile-section" style="${isGenerative && hasCM ? '' : 'display: none;'}">
                <div class="mg-profile-header">
                    <span class="mg-profile-icon">🔗</span>
                    <span class="mg-profile-title">Connection Profile</span>
                </div>
                
                <div class="mg-setting-row">
                    <div class="mg-setting-label">Profile</div>
                    <select class="mg-select" id="mg-nyx-profile">
                        <option value="current" ${s.nyxProfile === 'current' ? 'selected' : ''}>Use Current</option>
                        ${profiles.map(p => `<option value="${p.name}" ${s.nyxProfile === p.name ? 'selected' : ''}>${p.name}</option>`).join('')}
                    </select>
                </div>
                
                <div class="mg-setting-row">
                    <div class="mg-setting-label">Max Tokens</div>
                    <div class="mg-range-wrap">
                        <input type="range" class="mg-range" id="mg-nyx-tokens" min="50" max="300" step="25" value="${s.nyxMaxTokens || 100}">
                        <span class="mg-range-value" id="mg-nyx-tokens-val">${s.nyxMaxTokens || 100}</span>
                    </div>
                </div>
                
                <div class="mg-setting-row">
                    <button class="mg-test-btn" id="mg-test-voice"><span>🎭</span> Test Voice</button>
                </div>
            </div>
        </div>
        
        <div class="mg-settings-divider"></div>
        
        <!-- Behavior -->
        <div class="mg-settings-group">
            <div class="mg-settings-group-title">Behavior</div>
            
            <div class="mg-setting-row">
                <div class="mg-setting-label">
                    Idle Chatter
                    <div class="mg-setting-desc">Random comments when idle</div>
                </div>
                <label class="mg-toggle">
                    <input type="checkbox" id="mg-idle-chat" ${s.idleChatEnabled ? 'checked' : ''}>
                    <span class="mg-toggle-slider"></span>
                </label>
            </div>
            
            <div class="mg-setting-row">
                <div class="mg-setting-label">
                    Show Disposition
                    <div class="mg-setting-desc">Display mood number</div>
                </div>
                <label class="mg-toggle">
                    <input type="checkbox" id="mg-show-disposition" ${s.showDisposition !== false ? 'checked' : ''}>
                    <span class="mg-toggle-slider"></span>
                </label>
            </div>
            
            <div class="mg-setting-row">
                <div class="mg-setting-label">Chattiness</div>
                <div class="mg-range-wrap">
                    <input type="range" class="mg-range" id="mg-chattiness" min="1" max="5" step="1" value="${s.chattiness || 3}">
                    <span class="mg-range-value" id="mg-chattiness-val">${chattinessLabels[(s.chattiness || 3) - 1]}</span>
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
                    <option value="guardian" ${s.shellTheme === 'guardian' ? 'selected' : ''}>Guardian</option>
                    <option value="umbra" ${s.shellTheme === 'umbra' ? 'selected' : ''}>Umbra</option>
                    <option value="apothecary" ${s.shellTheme === 'apothecary' ? 'selected' : ''}>Apothecary</option>
                    <option value="moonstone" ${s.shellTheme === 'moonstone' ? 'selected' : ''}>Moonstone</option>
                    <option value="phosphor" ${s.shellTheme === 'phosphor' ? 'selected' : ''}>Phosphor</option>
                    <option value="rosewood" ${s.shellTheme === 'rosewood' ? 'selected' : ''}>Rosewood</option>
                    <option value="celestial" ${s.shellTheme === 'celestial' ? 'selected' : ''}>Celestial</option>
                </select>
            </div>
            
            <div class="mg-setting-row">
                <div class="mg-setting-label">Tama Size</div>
                <select class="mg-select" id="mg-tama-size">
                    <option value="small" ${s.tamaSize === 'small' ? 'selected' : ''}>Small</option>
                    <option value="medium" ${s.tamaSize === 'medium' || !s.tamaSize ? 'selected' : ''}>Medium</option>
                    <option value="large" ${s.tamaSize === 'large' ? 'selected' : ''}>Large</option>
                </select>
            </div>
            
            <div class="mg-setting-row">
                <div class="mg-setting-label">
                    Show Tama
                    <div class="mg-setting-desc">Display Nyxgotchi widget</div>
                </div>
                <label class="mg-toggle">
                    <input type="checkbox" id="mg-show-tama" ${s.showTama !== false ? 'checked' : ''}>
                    <span class="mg-toggle-slider"></span>
                </label>
            </div>
        </div>
        
        <div class="mg-settings-divider"></div>
        
        <!-- Tarot -->
        <div class="mg-settings-group">
            <div class="mg-settings-group-title">Tarot</div>
            
            <div class="mg-setting-row">
                <div class="mg-setting-label">
                    Queue Size
                    <div class="mg-setting-desc">Max cards in fate queue</div>
                </div>
                <select class="mg-select" id="mg-queue-size">
                    <option value="3" ${s.queueSize === 3 ? 'selected' : ''}>3 cards</option>
                    <option value="5" ${s.queueSize === 5 || !s.queueSize ? 'selected' : ''}>5 cards</option>
                    <option value="7" ${s.queueSize === 7 ? 'selected' : ''}>7 cards</option>
                </select>
            </div>
            
            <div class="mg-setting-row">
                <div class="mg-setting-label">Card Expiry</div>
                <div class="mg-range-wrap">
                    <input type="range" class="mg-range" id="mg-card-expiry" min="10" max="50" step="5" value="${s.cardExpiry || 20}">
                    <span class="mg-range-value" id="mg-card-expiry-val">${s.cardExpiry || 20} msg</span>
                </div>
            </div>
        </div>
        
        <button class="mg-reset-btn" id="mg-reset-settings">↺ Reset to Defaults</button>
        <div class="mg-version-info">Petit Grimoire v0.1.0</div>
    `;
}

// ============================================
// EVENT BINDING
// ============================================

function bindSettingsEvents() {
    // Voice mode
    $(document).on('click', '.mg-voice-mode:not([disabled])', function() {
        const mode = $(this).data('mode');
        extensionSettings.nyxVoiceMode = mode;
        $('.mg-voice-mode').removeClass('active');
        $(this).addClass('active');
        $('#mg-profile-section').toggle(mode === 'generative' && hasConnectionManager());
        saveSettings();
    });
    
    // Profile selection
    $(document).on('change', '#mg-nyx-profile', function() {
        extensionSettings.nyxProfile = $(this).val();
        saveSettings();
    });
    
    // Max tokens
    $(document).on('input', '#mg-nyx-tokens', function() {
        const val = $(this).val();
        $('#mg-nyx-tokens-val').text(val);
        extensionSettings.nyxMaxTokens = parseInt(val);
        saveSettings();
    });
    
    // Test voice
    $(document).on('click', '#mg-test-voice', async function() {
        const $btn = $(this);
        $btn.addClass('testing').find('span').text('⏳');
        try {
            await testGenerativeVoice();
        } catch (err) {
            console.error(`[${extensionName}] Voice test failed:`, err);
            nyxSay('poke');
        }
        $btn.removeClass('testing').find('span').text('🎭');
    });
    
    // Idle chat
    $(document).on('change', '#mg-idle-chat', function() {
        extensionSettings.idleChatEnabled = $(this).is(':checked');
        saveSettings();
    });
    
    // Show disposition
    $(document).on('change', '#mg-show-disposition', function() {
        extensionSettings.showDisposition = $(this).is(':checked');
        $('#nyxgotchi-disposition').toggle(extensionSettings.showDisposition);
        saveSettings();
    });
    
    // Chattiness
    $(document).on('input', '#mg-chattiness', function() {
        const val = parseInt($(this).val());
        const labels = ['Silent', 'Quiet', 'Normal', 'Chatty', 'Verbose'];
        $('#mg-chattiness-val').text(labels[val - 1]);
        extensionSettings.chattiness = val;
        saveSettings();
    });
    
    // Theme
    $(document).on('change', '#mg-theme', function() {
        extensionSettings.shellTheme = $(this).val();
        $('[data-mg-theme]').attr('data-mg-theme', extensionSettings.shellTheme);
        saveSettings();
    });
    
    // Tama size
    $(document).on('change', '#mg-tama-size', function() {
        extensionSettings.tamaSize = $(this).val();
        $('#nyxgotchi').attr('data-mg-size', extensionSettings.tamaSize);
        saveSettings();
    });
    
    // Show tama
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
    
    // Card expiry
    $(document).on('input', '#mg-card-expiry', function() {
        const val = $(this).val();
        $('#mg-card-expiry-val').text(val + ' msg');
        extensionSettings.cardExpiry = parseInt(val);
        saveSettings();
    });
    
    // Reset
    $(document).on('click', '#mg-reset-settings', function() {
        if (confirm('Reset all settings to defaults?')) {
            resetToDefaults();
        }
    });
}

// ============================================
// GENERATIVE VOICE
// ============================================

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
    
    const prompt = `You are Nyx, an ancient, sardonic magical familiar. Respond to being poked with a single short line (under 15 words). Be sarcastic.`;
    
    const response = await ctx.ConnectionManagerRequestService.sendRequest(
        profileId,
        [{ role: 'user', content: prompt }],
        extensionSettings.nyxMaxTokens || 100,
        { extractData: true, includePreset: true, includeInstruct: false },
        {}
    );
    
    if (response?.content) {
        const { showSpeech } = await import('./nyxgotchi.js');
        showSpeech(response.content.trim(), 5000);
    }
}

export async function generateNyxLine(situation, context = {}) {
    try {
        const ctx = getContext();
        if (!ctx.ConnectionManagerRequestService) return null;
        
        const profileId = getProfileIdByName(extensionSettings.nyxProfile || 'current');
        const profile = getProfileById(profileId);
        if (!profileId || !profile) return null;
        
        const prompt = buildNyxPrompt(situation, context);
        const response = await ctx.ConnectionManagerRequestService.sendRequest(
            profileId,
            [{ role: 'user', content: prompt }],
            extensionSettings.nyxMaxTokens || 100,
            { extractData: true, includePreset: true, includeInstruct: false },
            {}
        );
        
        return response?.content?.trim() || null;
    } catch (err) {
        console.warn(`[${extensionName}] Generative voice failed:`, err);
        return null;
    }
}

function buildNyxPrompt(situation, context) {
    const mood = context.mood || 'neutral';
    const disposition = context.disposition || 50;
    
    const basePrompt = `You are Nyx, an ancient magical familiar. Sardonic, condescending, insufferably knowledgeable.
Current mood: ${mood} (disposition: ${disposition}/100)
Respond with a single short line (under 20 words). No quotes, no actions, just dialogue.`;

    const situations = {
        poke: 'The human just poked you.',
        poke_spam: 'The human keeps poking you repeatedly.',
        card_drawn: `The human drew: ${context.cardName || 'a card'}.`,
        card_triggered: `A fate card (${context.cardName}) triggered.`,
        card_expired: `A fate card (${context.cardName}) expired unused.`,
        idle_nudge: 'Make an idle observation.',
        greeting: 'Greet the human.',
    };
    
    return `${basePrompt}\n\nSituation: ${situations[situation] || 'Respond naturally.'}`;
}

// ============================================
// DEFAULTS
// ============================================

function resetToDefaults() {
    Object.assign(extensionSettings, {
        nyxVoiceMode: 'template',
        nyxProfile: 'current',
        nyxMaxTokens: 100,
        idleChatEnabled: true,
        showDisposition: true,
        chattiness: 3,
        shellTheme: 'guardian',
        tamaSize: 'medium',
        showTama: true,
        queueSize: 5,
        cardExpiry: 20,
    });
    saveSettings();
    
    const panel = document.querySelector('[data-mg-panel="settings"]');
    if (panel) panel.innerHTML = getSettingsPanelHTML();
}

// ============================================
// INIT
// ============================================

export function initSettings() {
    bindSettingsEvents();
    console.log(`[${extensionName}] Settings initialized`);
}
