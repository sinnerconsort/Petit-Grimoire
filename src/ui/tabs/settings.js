/**
 * Petit Grimoire - Settings Tab
 * Configuration controls for the extension
 */

import { THEMES, getTheme, NYXGOTCHI_SIZES, getNyxgotchiSize } from '../../core/config.js';
import { settings, updateSetting } from '../../core/state.js';
import { destroyGrimoire, createGrimoire, openGrimoire, switchTab } from '../grimoire.js';
import { updateFabTheme } from '../fab.js';
import { toggleNyxgotchi, updateNyxgotchiSize, updateShell } from './nyx.js';

// Track initialization state
let isInitialized = false;

/**
 * Get the settings page HTML content
 * @returns {string} HTML content
 */
export function getContent() {
    const theme = getTheme(settings.theme);
    const themeOptions = Object.entries(THEMES).map(([key, t]) => 
        `<option value="${key}" ${key === settings.theme ? 'selected' : ''}>${t.name}</option>`
    ).join('');
    
    const sizeOptions = Object.entries(NYXGOTCHI_SIZES).map(([key, s]) =>
        `<option value="${key}" ${key === settings.nyxgotchiSize ? 'selected' : ''}>${s.name}</option>`
    ).join('');
    
    // Use darker colors for better readability on light parchment background
    const textDark = '#2a1810';
    const textMid = '#4a3020';
    const textLight = '#6a5040';
    const toggleOff = '#a08070';  // Darker off state for visibility
    
    // Check if Nyxgotchi is shown (default true if undefined)
    const showNyxgotchi = settings.showNyxgotchi !== false;
    
    return `
        <h2 class="pg-page-title" style="color: ${textDark}; margin: 0 0 6px 0; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 6px;">
            ⚙️ SETTINGS
        </h2>
        <p style="color: ${textMid}; font-style: italic; font-size: 10px; margin-bottom: 10px;">
            "Adjust the mystical parameters."
        </p>
        
        <div class="pg-settings-content" style="display: flex; flex-direction: column; gap: 12px; padding: 4px 0; overflow-x: hidden; max-width: 100%; box-sizing: border-box;">
            
            <!-- Theme Selection -->
            <div class="pg-setting-group" style="display: flex; flex-direction: column; gap: 4px;">
                <label style="color: ${textDark}; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                    ✦ Theme
                </label>
                <select id="pg-theme-select" style="
                    padding: 6px 8px;
                    border-radius: 6px;
                    border: 2px solid ${theme.main};
                    background: rgba(255,255,255,0.5);
                    color: ${textDark};
                    font-size: 11px;
                    cursor: pointer;
                    outline: none;
                ">
                    ${themeOptions}
                </select>
                <span style="color: ${textLight}; font-size: 9px; font-style: italic;">
                    ${theme.desc}
                </span>
            </div>
            
            <!-- Grimoire Position -->
            <div class="pg-setting-group" style="display: flex; flex-direction: column; gap: 4px;">
                <label style="color: ${textDark}; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                    ✦ Grimoire Position
                </label>
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="color: ${textMid}; font-size: 9px;">↑</span>
                    <input type="range" id="pg-position-slider" 
                        min="-200" max="200" value="${settings.grimoireOffsetY || 0}"
                        style="
                            flex: 1;
                            height: 4px;
                            border-radius: 2px;
                            background: ${theme.main}50;
                            outline: none;
                            cursor: pointer;
                            accent-color: ${theme.main};
                        "
                    />
                    <span style="color: ${textMid}; font-size: 9px;">↓</span>
                    <span id="pg-position-value" style="color: ${textDark}; font-size: 9px; min-width: 30px; text-align: right;">
                        ${settings.grimoireOffsetY || 0}px
                    </span>
                </div>
                <button id="pg-position-reset" style="
                    align-self: flex-start;
                    padding: 3px 8px;
                    border-radius: 4px;
                    border: 1px solid ${theme.main};
                    background: rgba(255,255,255,0.3);
                    color: ${textMid};
                    font-size: 9px;
                    cursor: pointer;
                ">
                    Reset
                </button>
            </div>
            
            <!-- Lock FAB Position -->
            <div class="pg-setting-group" style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
                <label style="color: ${textDark}; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; flex: 1;">
                    ✦ Lock FAB
                </label>
                <label class="pg-toggle" style="
                    position: relative;
                    width: 36px;
                    height: 20px;
                    cursor: pointer;
                    display: inline-block;
                    flex-shrink: 0;
                ">
                    <input type="checkbox" id="pg-lock-toggle" 
                        ${settings.grimoireLocked ? 'checked' : ''}
                        style="opacity: 0; width: 0; height: 0; position: absolute;"
                    />
                    <span class="pg-toggle-slider" style="
                        position: absolute;
                        inset: 0;
                        background: ${settings.grimoireLocked ? theme.main : toggleOff};
                        border-radius: 20px;
                        transition: background 0.3s;
                    "></span>
                    <span class="pg-toggle-knob" style="
                        position: absolute;
                        top: 2px;
                        left: ${settings.grimoireLocked ? '18px' : '2px'};
                        width: 16px;
                        height: 16px;
                        background: white;
                        border-radius: 50%;
                        transition: left 0.3s;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                    "></span>
                </label>
            </div>
            
            <!-- Fancy Font Toggle -->
            <div class="pg-setting-group" style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
                <label style="color: ${textDark}; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; flex: 1;">
                    ✦ Fancy Headers
                </label>
                <label class="pg-toggle" style="
                    position: relative;
                    width: 36px;
                    height: 20px;
                    cursor: pointer;
                    display: inline-block;
                    flex-shrink: 0;
                ">
                    <input type="checkbox" id="pg-fancy-font-toggle" 
                        ${settings.fancyFont ? 'checked' : ''}
                        style="opacity: 0; width: 0; height: 0; position: absolute;"
                    />
                    <span class="pg-toggle-slider" id="pg-fancy-slider" style="
                        position: absolute;
                        inset: 0;
                        background: ${settings.fancyFont ? theme.main : toggleOff};
                        border-radius: 20px;
                        transition: background 0.3s;
                    "></span>
                    <span class="pg-toggle-knob" id="pg-fancy-knob" style="
                        position: absolute;
                        top: 2px;
                        left: ${settings.fancyFont ? '18px' : '2px'};
                        width: 16px;
                        height: 16px;
                        background: white;
                        border-radius: 50%;
                        transition: left 0.3s;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                    "></span>
                </label>
            </div>
            <span style="color: ${textLight}; font-size: 9px; font-style: italic; margin-top: -8px;">
                Gothic pixel font with theme glow
            </span>
            
            <!-- ═══════════════════════════════════════════ -->
            <!-- NYXGOTCHI SECTION -->
            <!-- ═══════════════════════════════════════════ -->
            
            <div style="border-top: 1px solid ${theme.main}40; margin-top: 4px; padding-top: 12px;">
                <h3 style="color: ${textDark}; font-size: 11px; font-weight: 600; margin: 0 0 8px 0; display: flex; align-items: center; gap: 4px;">
                    🐱 Nyxgotchi
                </h3>
                
                <!-- Show Nyxgotchi Toggle -->
                <div class="pg-setting-group" style="display: flex; align-items: center; gap: 8px; flex-shrink: 0; margin-bottom: 10px;">
                    <label style="color: ${textDark}; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; flex: 1;">
                        ✦ Show Companion
                    </label>
                    <label class="pg-toggle" style="
                        position: relative;
                        width: 36px;
                        height: 20px;
                        cursor: pointer;
                        display: inline-block;
                        flex-shrink: 0;
                    ">
                        <input type="checkbox" id="pg-nyxgotchi-toggle" 
                            ${showNyxgotchi ? 'checked' : ''}
                            style="opacity: 0; width: 0; height: 0; position: absolute;"
                        />
                        <span class="pg-toggle-slider" id="pg-nyxgotchi-slider" style="
                            position: absolute;
                            inset: 0;
                            background: ${showNyxgotchi ? theme.main : toggleOff};
                            border-radius: 20px;
                            transition: background 0.3s;
                        "></span>
                        <span class="pg-toggle-knob" id="pg-nyxgotchi-knob" style="
                            position: absolute;
                            top: 2px;
                            left: ${showNyxgotchi ? '18px' : '2px'};
                            width: 16px;
                            height: 16px;
                            background: white;
                            border-radius: 50%;
                            transition: left 0.3s;
                            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                        "></span>
                    </label>
                </div>
                
                <!-- Nyxgotchi Size -->
                <div class="pg-setting-group" style="display: flex; flex-direction: column; gap: 4px;">
                    <label style="color: ${textDark}; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                        ✦ Size
                    </label>
                    <select id="pg-nyxgotchi-size" style="
                        padding: 6px 8px;
                        border-radius: 6px;
                        border: 2px solid ${theme.main};
                        background: rgba(255,255,255,0.5);
                        color: ${textDark};
                        font-size: 11px;
                        cursor: pointer;
                        outline: none;
                    ">
                        ${sizeOptions}
                    </select>
                    <span style="color: ${textLight}; font-size: 9px; font-style: italic;">
                        ${getNyxgotchiSize(settings.nyxgotchiSize).shell}px shell
                    </span>
                </div>
            </div>
            
            <!-- Extension Info -->
            <div style="margin-top: auto; padding-top: 12px; border-top: 1px solid ${theme.main}40;">
                <p style="color: ${textLight}; font-size: 9px; text-align: center; margin: 0;">
                    ✨ Petit Grimoire v0.1 ✨
                </p>
            </div>
        </div>
    `;
}

/**
 * Initialize settings page event listeners
 */
export function init() {
    // Debounce to prevent double-init
    const settingsPage = document.querySelector('.pg-page[data-page="settings"]');
    if (!settingsPage || settingsPage.dataset.initialized === 'true') return;
    settingsPage.dataset.initialized = 'true';
    
    const theme = getTheme(settings.theme);
    const toggleOff = '#a08070';
    
    // Theme selector
    const themeSelect = document.getElementById('pg-theme-select');
    if (themeSelect) {
        themeSelect.addEventListener('change', handleThemeChange);
    }
    
    // Position slider
    const positionSlider = document.getElementById('pg-position-slider');
    if (positionSlider) {
        positionSlider.addEventListener('input', handlePositionChange);
    }
    
    // Reset position button
    const resetBtn = document.getElementById('pg-position-reset');
    if (resetBtn) {
        resetBtn.addEventListener('click', handlePositionReset);
    }
    
    // Lock FAB toggle
    const lockToggle = document.getElementById('pg-lock-toggle');
    if (lockToggle) {
        lockToggle.addEventListener('change', (e) => handleToggleChange(e, 'grimoireLocked', theme, toggleOff));
    }
    
    // Fancy font toggle
    const fancyFontToggle = document.getElementById('pg-fancy-font-toggle');
    if (fancyFontToggle) {
        fancyFontToggle.addEventListener('change', handleFancyFontChange);
    }
    
    // Nyxgotchi visibility toggle
    const nyxgotchiToggle = document.getElementById('pg-nyxgotchi-toggle');
    if (nyxgotchiToggle) {
        nyxgotchiToggle.addEventListener('change', handleNyxgotchiToggle);
    }
    
    // Nyxgotchi size selector
    const nyxgotchiSize = document.getElementById('pg-nyxgotchi-size');
    if (nyxgotchiSize) {
        nyxgotchiSize.addEventListener('change', handleNyxgotchiSizeChange);
    }
    
    isInitialized = true;
}

/**
 * Cleanup settings page (reset initialization flag)
 */
export function cleanup() {
    isInitialized = false;
    const settingsPage = document.querySelector('.pg-page[data-page="settings"]');
    if (settingsPage) {
        settingsPage.dataset.initialized = 'false';
    }
}

// =============================================================================
// EVENT HANDLERS
// =============================================================================

function handleThemeChange(e) {
    updateSetting('theme', e.target.value);
    
    // Update FAB theme FIRST (before rebuilding grimoire)
    updateFabTheme();
    
    // Update Nyxgotchi shell
    updateShell();
    
    // Rebuild grimoire UI to apply new theme fully
    destroyGrimoire();
    createGrimoire();
    openGrimoire();
    switchTab('settings');
}

function handlePositionChange(e) {
    const val = parseInt(e.target.value);
    const positionValue = document.getElementById('pg-position-value');
    if (positionValue) positionValue.textContent = `${val}px`;
    
    // Apply position in real-time
    updateSetting('grimoireOffsetY', val);
    applyGrimoireOffset(val);
}

function handlePositionReset() {
    const positionSlider = document.getElementById('pg-position-slider');
    const positionValue = document.getElementById('pg-position-value');
    
    updateSetting('grimoireOffsetY', 0);
    if (positionSlider) positionSlider.value = 0;
    if (positionValue) positionValue.textContent = '0px';
    applyGrimoireOffset(0);
}

function handleToggleChange(e, settingKey, theme, toggleOff) {
    const isChecked = e.target.checked;
    updateSetting(settingKey, isChecked);
    
    // Update visual state
    const slider = e.target.parentElement.querySelector('.pg-toggle-slider');
    const knob = e.target.parentElement.querySelector('.pg-toggle-knob');
    if (slider) slider.style.background = isChecked ? theme.main : toggleOff;
    if (knob) knob.style.left = isChecked ? '18px' : '2px';
}

function handleFancyFontChange(e) {
    const isEnabled = e.target.checked;
    const theme = getTheme(settings.theme);
    const toggleOff = '#a08070';
    
    updateSetting('fancyFont', isEnabled);
    
    // Update visual state of toggle
    const slider = document.getElementById('pg-fancy-slider');
    const knob = document.getElementById('pg-fancy-knob');
    if (slider) slider.style.background = isEnabled ? theme.main : toggleOff;
    if (knob) knob.style.left = isEnabled ? '18px' : '2px';
    
    // Toggle fancy font class on panel
    const panelElement = document.getElementById('pg-panel');
    if (panelElement) {
        if (isEnabled) {
            panelElement.classList.add('pg-fancy-font');
        } else {
            panelElement.classList.remove('pg-fancy-font');
        }
    }
}

function handleNyxgotchiToggle(e) {
    const isEnabled = e.target.checked;
    const theme = getTheme(settings.theme);
    const toggleOff = '#a08070';
    
    // Update visual state of toggle
    const slider = document.getElementById('pg-nyxgotchi-slider');
    const knob = document.getElementById('pg-nyxgotchi-knob');
    if (slider) slider.style.background = isEnabled ? theme.main : toggleOff;
    if (knob) knob.style.left = isEnabled ? '18px' : '2px';
    
    // Toggle Nyxgotchi visibility
    toggleNyxgotchi(isEnabled);
}

function handleNyxgotchiSizeChange(e) {
    const newSize = e.target.value;
    updateSetting('nyxgotchiSize', newSize);
    
    // Update size hint text
    const sizeHint = e.target.nextElementSibling;
    if (sizeHint) {
        const size = getNyxgotchiSize(newSize);
        sizeHint.textContent = `${size.shell}px shell`;
    }
    
    // Apply new size
    updateNyxgotchiSize();
}

/**
 * Apply grimoire vertical offset in real-time
 */
function applyGrimoireOffset(offset) {
    const book = document.getElementById('pg-book');
    if (!book) return;
    
    const vh = window.innerHeight;
    const bookHeight = book.offsetHeight;
    const topPosition = Math.max(0, Math.min(vh - bookHeight, (vh - bookHeight) / 2 + offset));
    
    book.style.top = `${topPosition}px`;
}
