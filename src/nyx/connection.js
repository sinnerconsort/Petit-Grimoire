/**
 * Petit Grimoire — Nyx Connection
 * Independent API calls via ConnectionManagerRequestService
 * Falls back gracefully when not available
 */

import { getContext } from '../../../../extensions.js';
import { extensionSettings } from '../state.js';

// ============================================
// CONNECTION PROFILE UTILITIES
// ============================================

/**
 * Get a connection profile ID by name
 * @param {string} profileName - Profile name or 'current'
 * @returns {string|null} Profile ID or null
 */
export function getProfileIdByName(profileName) {
    const ctx = getContext();
    const connectionManager = ctx.extensionSettings?.connectionManager;
    
    if (!connectionManager) return null;

    // "current" = currently active profile
    if (profileName === 'current') {
        return connectionManager.selectedProfile;
    }

    // Find by name
    const profile = connectionManager.profiles?.find(p => p.name === profileName);
    return profile?.id || null;
}

/**
 * Get a connection profile by ID
 * @param {string} profileId - Profile ID
 * @returns {object|null} Profile object or null
 */
export function getProfileById(profileId) {
    if (!profileId) return null;

    const ctx = getContext();
    const connectionManager = ctx.extensionSettings?.connectionManager;
    return connectionManager?.profiles?.find(p => p.id === profileId) || null;
}

/**
 * Get list of available connection profiles
 * @returns {Array} Array of {id, name} objects
 */
export function getAvailableProfiles() {
    const ctx = getContext();
    const profiles = ctx.extensionSettings?.connectionManager?.profiles || [];
    return profiles.map(p => ({ id: p.id, name: p.name }));
}

// ============================================
// CONNECTION AVAILABILITY
// ============================================

/**
 * Check if ConnectionManagerRequestService is available
 * @returns {boolean}
 */
export function isServiceAvailable() {
    const ctx = getContext();
    return !!ctx.ConnectionManagerRequestService;
}

/**
 * Check if a valid connection is configured for Nyx
 * @returns {boolean}
 */
export function isConnectionAvailable() {
    if (!isServiceAvailable()) return false;
    
    const profileName = extensionSettings.nyx?.connectionProfile || 'current';
    const profileId = getProfileIdByName(profileName);
    
    return !!profileId;
}

// ============================================
// REQUEST SENDING
// ============================================

/**
 * Send an independent generation request for Nyx
 * @param {string} systemPrompt - System message
 * @param {string} userPrompt - User message
 * @param {number} maxTokens - Max response tokens (default 150)
 * @returns {Promise<string>} Generated response
 */
export async function sendNyxRequest(systemPrompt, userPrompt, maxTokens = 150) {
    const ctx = getContext();
    
    // Check service availability
    if (!ctx.ConnectionManagerRequestService) {
        throw new Error('ConnectionManagerRequestService not available');
    }

    // Get configured profile
    const profileName = extensionSettings.nyx?.connectionProfile || 'current';
    const profileId = getProfileIdByName(profileName);
    
    if (!profileId) {
        throw new Error(`Connection profile not found: ${profileName}`);
    }

    const profile = getProfileById(profileId);
    if (!profile) {
        throw new Error(`Profile data not found for ID: ${profileId}`);
    }

    // Build messages array
    const messages = [];
    
    if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
    }
    
    messages.push({ role: 'user', content: userPrompt });

    // Send request
    try {
        const response = await ctx.ConnectionManagerRequestService.sendRequest(
            profileId,
            messages,
            maxTokens,
            {
                extractData: true,      // Extract response content
                includePreset: true,    // Apply preset settings
                includeInstruct: false  // Skip instruct templates for clean output
            },
            {} // No override payload
        );

        if (!response?.content) {
            throw new Error('Empty response from API');
        }

        return response.content;
    } catch (err) {
        console.error('[Nyx Connection] Request failed:', err);
        throw err;
    }
}

// ============================================
// SETTINGS UI HELPERS
// ============================================

/**
 * Populate a profile dropdown select element
 * @param {HTMLSelectElement|jQuery} selectElement - The select element
 * @param {string} currentValue - Current selected value
 */
export function populateProfileDropdown(selectElement, currentValue) {
    const $select = $(selectElement);
    $select.empty();
    
    // Always include "current" option
    $select.append('<option value="current">Use Current Connection</option>');
    
    // Add all available profiles
    const profiles = getAvailableProfiles();
    profiles.forEach(profile => {
        $select.append(`<option value="${profile.name}">${profile.name}</option>`);
    });
    
    // Set current value
    $select.val(currentValue || 'current');
}

/**
 * Get connection status for display
 * @returns {object} {available: boolean, profileName: string, status: string}
 */
export function getConnectionStatus() {
    const serviceAvailable = isServiceAvailable();
    const profileName = extensionSettings.nyx?.connectionProfile || 'current';
    const profileId = getProfileIdByName(profileName);
    
    if (!serviceAvailable) {
        return {
            available: false,
            profileName: null,
            status: 'Connection Manager not available'
        };
    }
    
    if (!profileId) {
        return {
            available: false,
            profileName: profileName,
            status: `Profile "${profileName}" not found`
        };
    }
    
    const profile = getProfileById(profileId);
    return {
        available: true,
        profileName: profile?.name || profileName,
        status: 'Ready'
    };
}
