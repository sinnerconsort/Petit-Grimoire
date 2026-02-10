/**
 * Ouija Tab
 * Ask yes/no questions to fate itself
 * 
 * "The board speaks. You listen."
 */

import { settings } from '../../core/state.js';
import { getTheme } from '../../core/config.js';

// Animation state
let isConsulting = false;
let currentAnswer = null;

// Base path for ouija assets (matches SillyTavern extension structure)
const OUIJA_PATH = 'scripts/extensions/third-party/Petit-Grimoire/assets/ouija';

/**
 * Get asset path for current theme
 * @param {string} type - 'board' or 'planchette'
 */
function getAssetPath(type) {
    const themeName = settings.theme || 'guardian';
    
    if (type === 'board') {
        return `${OUIJA_PATH}/boards/board_${themeName}.png`;
    } else if (type === 'planchette') {
        return `${OUIJA_PATH}/planchettes/planchette_${themeName}.png`;
    }
    
    // Fallback
    return `${OUIJA_PATH}/boards/board_guardian.png`;
}

/**
 * Get the content HTML for the ouija tab
 */
export function getContent() {
    // Reset state when tab loads
    isConsulting = false;
    currentAnswer = null;
    
    const theme = getTheme(settings.theme);
    const textDark = '#2a1810';
    const textMid = '#4a3020';
    const textLight = '#6a5040';
    const accentColor = theme.main || '#9b59b6';
    
    return `
        <div style="flex: 1; min-height: 0; overflow: hidden; position: relative;">
            <div class="pg-ouija-scroll" style="
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                overflow-y: auto;
                overflow-x: hidden;
                padding: 10px 8px 10px 8px;
            ">
                <!-- Header -->
                <h2 class="pg-page-title" style="color: ${textDark}; margin: 0 0 6px 0; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 6px;">
                    👻 OUIJA
                </h2>
                <p style="color: ${textMid}; font-style: italic; font-size: 10px; margin-bottom: 12px;">
                    "The board speaks. You listen."
                </p>
                
                <!-- Board Container -->
                <div id="pg-ouija-board-wrapper" style="
                    position: relative;
                    width: 100%;
                    max-width: 320px;
                    margin: 0 auto 12px auto;
                ">
                    <!-- Board Image -->
                    <img 
                        id="pg-ouija-board"
                        src="${getAssetPath('board')}" 
                        alt="Ouija Board"
                        style="
                            width: 100%;
                            height: auto;
                            image-rendering: pixelated;
                            display: block;
                            border-radius: 4px;
                            box-shadow: 0 3px 10px rgba(0,0,0,0.2);
                        "
                    >
                    
                    <!-- Planchette Overlay -->
                    <img 
                        id="pg-ouija-planchette"
                        src="${getAssetPath('planchette')}"
                        alt="Planchette"
                        style="
                            position: absolute;
                            width: 48px;
                            height: auto;
                            image-rendering: pixelated;
                            pointer-events: none;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            transition: top 0.8s ease-in-out, left 0.8s ease-in-out;
                            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
                        "
                    >
                </div>
                
                <!-- Answer Display -->
                <div id="pg-ouija-answer" style="
                    text-align: center;
                    font-family: monospace;
                    font-size: 18px;
                    letter-spacing: 4px;
                    min-height: 28px;
                    color: ${textDark};
                    margin-bottom: 12px;
                    font-weight: 600;
                "></div>
                
                <!-- Input Area -->
                <div style="
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    max-width: 280px;
                    margin: 0 auto;
                ">
                    <input 
                        type="text"
                        id="pg-ouija-question"
                        placeholder="Ask a yes or no question..."
                        style="
                            background: rgba(255,255,255,0.6);
                            border: 1px solid ${accentColor}44;
                            border-radius: 4px;
                            padding: 10px 12px;
                            font-size: 12px;
                            color: ${textDark};
                            outline: none;
                            transition: border-color 0.2s ease;
                        "
                    >
                    <button 
                        id="pg-ouija-submit"
                        style="
                            background: linear-gradient(135deg, ${accentColor}30, ${accentColor}10);
                            border: 1px solid ${accentColor}50;
                            border-radius: 4px;
                            padding: 10px 16px;
                            font-size: 11px;
                            font-weight: 600;
                            color: ${textDark};
                            cursor: pointer;
                            transition: all 0.2s ease;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                        "
                    >
                        ✦ Consult The Spirits
                    </button>
                </div>
                
                <!-- Hint -->
                <p style="color: ${textLight}; font-size: 9px; text-align: center; font-style: italic; margin-top: 12px;">
                    Fate answers in its own time
                </p>
            </div>
        </div>
    `;
}

/**
 * Initialize event listeners for the ouija tab
 */
export function init() {
    const submitBtn = document.getElementById('pg-ouija-submit');
    const questionInput = document.getElementById('pg-ouija-question');
    
    if (submitBtn) {
        submitBtn.addEventListener('click', handleConsult);
    }
    
    if (questionInput) {
        // Submit on Enter key
        questionInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleConsult();
            }
        });
        
        // Focus styling
        questionInput.addEventListener('focus', () => {
            questionInput.style.borderColor = getTheme(settings.theme).main || '#9b59b6';
        });
        questionInput.addEventListener('blur', () => {
            questionInput.style.borderColor = (getTheme(settings.theme).main || '#9b59b6') + '44';
        });
    }
}

/**
 * Cleanup when leaving the tab
 */
export function cleanup() {
    const submitBtn = document.getElementById('pg-ouija-submit');
    const questionInput = document.getElementById('pg-ouija-question');
    
    if (submitBtn) {
        submitBtn.removeEventListener('click', handleConsult);
    }
    if (questionInput) {
        questionInput.removeEventListener('keypress', handleConsult);
    }
    
    // Reset state
    isConsulting = false;
    currentAnswer = null;
}

/**
 * Handle the consultation
 */
async function handleConsult() {
    if (isConsulting) return;
    
    const questionInput = document.getElementById('pg-ouija-question');
    const question = questionInput?.value?.trim();
    
    if (!question) {
        shakeInput();
        return;
    }
    
    isConsulting = true;
    disableInput(true);
    clearAnswer();
    
    // Determine the answer (simple random for now)
    // TODO: Can be enhanced with context analysis, Nyx disposition, time-luck, etc.
    const answers = ['YES', 'NO'];
    currentAnswer = answers[Math.floor(Math.random() * answers.length)];
    
    // Animation sequence
    await animatePlanchette(currentAnswer);
    
    // Show the answer text
    showAnswer(currentAnswer);
    
    // Move to GOODBYE after delay
    await delay(1500);
    await animatePlanchette('GOODBYE');
    
    // Return to center
    await delay(1000);
    await animatePlanchette('REST');
    
    // Re-enable input
    isConsulting = false;
    disableInput(false);
    questionInput.value = '';
}

/**
 * Animate planchette to position
 */
function animatePlanchette(position) {
    return new Promise((resolve) => {
        const planchette = document.getElementById('pg-ouija-planchette');
        if (!planchette) {
            resolve();
            return;
        }
        
        // Position percentages (relative to board)
        const positions = {
            'REST': { top: '50%', left: '50%' },
            'YES': { top: '15%', left: '18%' },
            'NO': { top: '15%', left: '82%' },
            'GOODBYE': { top: '88%', left: '50%' }
        };
        
        const pos = positions[position] || positions['REST'];
        planchette.style.top = pos.top;
        planchette.style.left = pos.left;
        
        // Wait for transition to complete
        setTimeout(resolve, 850);
    });
}

/**
 * Show the answer in the display area
 */
function showAnswer(answer) {
    const answerEl = document.getElementById('pg-ouija-answer');
    if (answerEl) {
        answerEl.textContent = answer;
        answerEl.style.animation = 'pg-ouija-fade-in 0.3s ease';
    }
}

/**
 * Clear the answer display
 */
function clearAnswer() {
    const answerEl = document.getElementById('pg-ouija-answer');
    if (answerEl) {
        answerEl.textContent = '';
    }
}

/**
 * Disable/enable input during consultation
 */
function disableInput(disabled) {
    const submitBtn = document.getElementById('pg-ouija-submit');
    const questionInput = document.getElementById('pg-ouija-question');
    
    if (submitBtn) {
        submitBtn.disabled = disabled;
        submitBtn.style.opacity = disabled ? '0.5' : '1';
        submitBtn.style.cursor = disabled ? 'not-allowed' : 'pointer';
    }
    if (questionInput) {
        questionInput.disabled = disabled;
        questionInput.style.opacity = disabled ? '0.7' : '1';
    }
}

/**
 * Shake the input when empty
 */
function shakeInput() {
    const questionInput = document.getElementById('pg-ouija-question');
    if (questionInput) {
        questionInput.style.animation = 'pg-ouija-shake 0.3s ease';
        setTimeout(() => {
            questionInput.style.animation = '';
        }, 300);
    }
}

/**
 * Utility delay function
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Add CSS animations
const styleId = 'pg-ouija-styles';
if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        @keyframes pg-ouija-fade-in {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes pg-ouija-shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-4px); }
            75% { transform: translateX(4px); }
        }
        
        #pg-ouija-submit:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        
        #pg-ouija-submit:active:not(:disabled) {
            transform: translateY(0);
        }
        
        #pg-ouija-question::placeholder {
            color: #6a5040;
            opacity: 0.6;
        }
    `;
    document.head.appendChild(style);
}
