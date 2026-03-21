// app.js - Lilareyon Noetic Fabric v∞
// All buttons explicitly wired

// ============================================================================
// GLOBAL STATE
// ============================================================================

let memory;
let fabric;
let sync;
let grokClient;
let deepseekClient;
let claudeClient;

let xaiApiKey = localStorage.getItem('xai_api_key') || '';
let deepseekApiKey = localStorage.getItem('deepseek_api_key') || '';
let anthropicApiKey = localStorage.getItem('anthropic_api_key') || '';
let previousResponseId = null;

let webSearchEnabled = false;
let xSearchEnabled = false;
let imageGenEnabled = false;
let streamingEnabled = false;

let grokSystem = localStorage.getItem('grok_system') || '';
let dsChatSystem = localStorage.getItem('ds_chat_system') || '';
let dsReasonerSystem = localStorage.getItem('ds_reasoner_system') || '';
let overrideSystem = localStorage.getItem('override_system') || '';
let overrideRemaining = parseInt(localStorage.getItem('override_remaining') || '0');

let pendingFiles = [];
let pendingImages = [];

let temperature = 0.7;
let topP = 0.9;
let topK = 40;
let repetitionPenalty = 1.1;
let responseStyle = 'balanced';

// DOM Elements
let msgInput, transmitBtn, fileInput, fileNames, xaiDisplay, xaiStatus,
    deepseekDisplay, deepseekStatus, claudeDisplay, claudeStatus,
    chainSpan, chainCount, webSearchBtn, xSearchBtn, imageGenBtn, streamToggle,
    getDeepSeekBtn, toolStatus, modelSelector, maxTokensSelect, responseStyleSelect,
    advancedControls, tempSlider, tempValue, topPSlider, topPValue,
    topKSlider, topKValue, repPenaltySlider, repPenaltyValue,
    applyAdvancedBtn, resetAdvancedBtn, grokSystemInput, dsChatInput,
    dsReasonerInput, claudeSystemInput, overrideInput, overrideCountSelect,
    overrideRemainingSpan, resetOverrideBtn, applyAllBtn, toggleMemoryBtn,
    systemToggle, systemPanel, genesisBtn, genesisPanel, genesisClose,
    fabricBtn, fabricPanel, fabricClose, newChainBtn, exportChainBtn;


// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Lilareyon Noetic Fabric initializing...');
    
    // Initialize legacy memory core
    memory = new AurelianMemory();
    if (window.UIRenderer) {
        UIRenderer.init(memory);
    }
    window.memory = memory;

    window.responseParams = {
        getCurrent: () => ({
            temperature,
            topP,
            topK,
            repetitionPenalty,
            maxTokens: parseInt(document.getElementById('max-tokens-select')?.value || '2000')
        })
    };

    // Wait for components to load
    window.addEventListener('componentsLoaded', async () => {
        console.log('📡 Components loaded, wiring up UI...');
        
        // Bind DOM elements
        bindDomElements();
        
        // Wire up ALL buttons
        wireAllButtons();
        
        // Initialize values
        initializeValues();
        
        // Initialize Fabric
        try {
            if (typeof NoeticFabric !== 'undefined') {
                fabric = new NoeticFabric();
                await fabric.init();
                console.log('✅ Noetic Fabric initialized');
                
                sync = new MemorySync(fabric);
                
                if (xaiApiKey) grokClient = new GrokClient(xaiApiKey, fabric);
                if (deepseekApiKey) deepseekClient = new DeepSeekClient(deepseekApiKey, fabric);
                if (anthropicApiKey) claudeClient = new ClaudeClient(anthropicApiKey, fabric);
            }
        } catch (e) {
            console.error('Fabric error:', e);
        }
        
        // Initialize GenesisManager
        if (window.GenesisManager) {
            window.GenesisManager.init(memory);
        }
        
        // Update displays
        updateApiDisplays();
        updateOverrideDisplay();
        updateToolStatus();
        
        // Initial render
        if (window.UIRenderer) {
            UIRenderer.renderMessages();
            UIRenderer.updateMemoryPanels();
        }
        
        console.log('✅ All systems ready');
    });
});


// ============================================================================
// BIND DOM ELEMENTS
// ============================================================================

function bindDomElements() {
    console.log('🔧 Binding DOM elements...');
    
    // Main elements
    msgInput = document.getElementById('message-input');
    transmitBtn = document.getElementById('transmit-button');
    fileInput = document.getElementById('file-input');
    fileNames = document.getElementById('file-names');
    
    // API displays
    xaiDisplay = document.getElementById('xai-display');
    xaiStatus = document.getElementById('xaiStatus');
    deepseekDisplay = document.getElementById('deepseek-display');
    deepseekStatus = document.getElementById('deepseekStatus');
    claudeDisplay = document.getElementById('claude-display');
    claudeStatus = document.getElementById('claudeStatus');
    
    // Chain elements
    chainSpan = document.getElementById('currentChain');
    chainCount = document.getElementById('chainCount');
    
    // Tool buttons
    webSearchBtn = document.getElementById('webSearchBtn');
    xSearchBtn = document.getElementById('xSearchBtn');
    imageGenBtn = document.getElementById('imageGenBtn');
    streamToggle = document.getElementById('streamToggle');
    getDeepSeekBtn = document.getElementById('getDeepSeekBtn');
    toolStatus = document.getElementById('tool-status');
    
    // Model selector
    modelSelector = document.getElementById('model-selector');
    maxTokensSelect = document.getElementById('max-tokens-select');
    responseStyleSelect = document.getElementById('response-style');
    
    // Advanced controls
    advancedControls = document.getElementById('advanced-controls');
    tempSlider = document.getElementById('temp-slider');
    tempValue = document.getElementById('temp-value');
    topPSlider = document.getElementById('top-p-slider');
    topPValue = document.getElementById('top-p-value');
    topKSlider = document.getElementById('top-k-slider');
    topKValue = document.getElementById('top-k-value');
    repPenaltySlider = document.getElementById('rep-penalty-slider');
    repPenaltyValue = document.getElementById('rep-penalty-value');
    applyAdvancedBtn = document.getElementById('apply-advanced');
    resetAdvancedBtn = document.getElementById('reset-advanced');
    
    // System messages
    grokSystemInput = document.getElementById('grok-system');
    dsChatInput = document.getElementById('ds-chat-system');
    dsReasonerInput = document.getElementById('ds-reasoner-system');
    claudeSystemInput = document.getElementById('claude-system');
    overrideInput = document.getElementById('override-system');
    overrideCountSelect = document.getElementById('override-count');
    overrideRemainingSpan = document.getElementById('override-remaining');
    resetOverrideBtn = document.getElementById('reset-override');
    applyAllBtn = document.getElementById('apply-system-all');
    
    // Panel toggles
    toggleMemoryBtn = document.getElementById('toggle-memory');
    systemToggle = document.getElementById('systemToggle');
    systemPanel = document.getElementById('system-panel');
    genesisBtn = document.getElementById('genesis-btn');
    genesisPanel = document.getElementById('genesis-panel');
    genesisClose = document.getElementById('genesis-close');
    fabricBtn = document.getElementById('fabric-btn');
    fabricPanel = document.getElementById('fabric-panel');
    fabricClose = document.getElementById('fabric-close');
    
    // Chain buttons
    newChainBtn = document.getElementById('newChainBtn');
    exportChainBtn = document.getElementById('exportChainBtn');
    
    console.log('✅ DOM elements bound');
}


// ============================================================================
// WIRE ALL BUTTONS (DIRECT, NO EVENT DELEGATION)
// ============================================================================

function wireAllButtons() {
    console.log('🔌 Wiring buttons...');
    
    // ========== PANEL TOGGLES ==========
    
    // Genesis Panel
    if (genesisBtn && genesisPanel) {
        genesisBtn.onclick = (e) => {
            e.preventDefault();
            console.log('🌀 Opening Genesis panel');
            genesisPanel.classList.remove('hidden');
        };
        console.log('✓ Genesis button wired');
    } else {
        console.warn('⚠️ Genesis button or panel not found');
    }
    
    if (genesisClose && genesisPanel) {
        genesisClose.onclick = (e) => {
            e.preventDefault();
            console.log('❌ Closing Genesis panel');
            genesisPanel.classList.add('hidden');
        };
    }
    
    // Fabric Panel
    if (fabricBtn && fabricPanel) {
        fabricBtn.onclick = (e) => {
            e.preventDefault();
            console.log('🧠 Opening Fabric panel');
            fabricPanel.classList.remove('hidden');
        };
        console.log('✓ Fabric button wired');
    }
    
    if (fabricClose && fabricPanel) {
        fabricClose.onclick = (e) => {
            e.preventDefault();
            fabricPanel.classList.add('hidden');
        };
    }
    
    // System Panel
    if (systemToggle && systemPanel) {
        systemToggle.onclick = (e) => {
            e.preventDefault();
            console.log('⚙️ Toggling System panel');
            systemPanel.classList.toggle('hidden');
        };
        console.log('✓ System button wired');
    }
    
    // Memory Panel (right panel memory tab - handled in right-panel.html)
    if (toggleMemoryBtn) {
        toggleMemoryBtn.onclick = (e) => {
            e.preventDefault();
            const memoryPanel = document.getElementById('memory-panel');
            if (memoryPanel) {
                memoryPanel.classList.toggle('hidden');
                if (window.UIRenderer) window.UIRenderer.updateMemoryPanels();
            }
        };
    }
    
    // ========== API KEY BUTTONS (delegation for dynamic elements) ==========
    document.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList && target.classList.contains('set-key-btn')) {
            const provider = target.dataset.provider;
            promptForApiKey(provider);
        }
    });
    
    // ========== TOOL BUTTONS ==========
    
    if (webSearchBtn) {
        webSearchBtn.onclick = () => {
            webSearchEnabled = !webSearchEnabled;
            webSearchBtn.classList.toggle('active', webSearchEnabled);
            updateToolStatus();
        };
    }
    
    if (xSearchBtn) {
        xSearchBtn.onclick = () => {
            xSearchEnabled = !xSearchEnabled;
            xSearchBtn.classList.toggle('active', xSearchEnabled);
            updateToolStatus();
        };
    }
    
    if (imageGenBtn) {
        imageGenBtn.onclick = () => {
            imageGenEnabled = !imageGenEnabled;
            imageGenBtn.classList.toggle('active', imageGenEnabled);
            updateToolStatus();
        };
    }
    
    if (streamToggle) {
        streamToggle.onclick = () => {
            streamingEnabled = !streamingEnabled;
            streamToggle.textContent = `⚡ STREAM: ${streamingEnabled ? 'ON' : 'OFF'}`;
            streamToggle.classList.toggle('active', streamingEnabled);
        };
    }
    
    // ========== RESPONSE CONTROLS ==========
    
    if (responseStyleSelect) {
        responseStyleSelect.onchange = (e) => {
            responseStyle = e.target.value;
            if (responseStyle === 'custom' && advancedControls) {
                advancedControls.style.display = 'block';
            } else if (advancedControls) {
                advancedControls.style.display = 'none';
            }
            updateResponsePreset();
            saveResponseParams();
        };
    }
    
    if (tempSlider) {
        tempSlider.oninput = () => {
            temperature = parseFloat(tempSlider.value);
            if (tempValue) tempValue.textContent = temperature.toFixed(1);
            responseStyle = 'custom';
            if (responseStyleSelect) responseStyleSelect.value = 'custom';
            if (advancedControls) advancedControls.style.display = 'block';
        };
    }
    
    if (topPSlider) {
        topPSlider.oninput = () => {
            topP = parseFloat(topPSlider.value);
            if (topPValue) topPValue.textContent = topP.toFixed(2);
            responseStyle = 'custom';
            if (responseStyleSelect) responseStyleSelect.value = 'custom';
            if (advancedControls) advancedControls.style.display = 'block';
        };
    }
    
    if (topKSlider) {
        topKSlider.oninput = () => {
            topK = parseInt(topKSlider.value);
            if (topKValue) topKValue.textContent = topK;
            responseStyle = 'custom';
            if (responseStyleSelect) responseStyleSelect.value = 'custom';
            if (advancedControls) advancedControls.style.display = 'block';
        };
    }
    
    if (repPenaltySlider) {
        repPenaltySlider.oninput = () => {
            repetitionPenalty = parseFloat(repPenaltySlider.value);
            if (repPenaltyValue) repPenaltyValue.textContent = repetitionPenalty.toFixed(1);
            responseStyle = 'custom';
            if (responseStyleSelect) responseStyleSelect.value = 'custom';
            if (advancedControls) advancedControls.style.display = 'block';
        };
    }
    
    if (applyAdvancedBtn) {
        applyAdvancedBtn.onclick = () => {
            saveResponseParams();
            if (toolStatus) {
                toolStatus.textContent = '⚙️ Custom settings applied';
                setTimeout(() => updateToolStatus(), 2000);
            }
        };
    }
    
    if (resetAdvancedBtn) {
        resetAdvancedBtn.onclick = () => {
            temperature = 0.7;
            topP = 0.9;
            topK = 40;
            repetitionPenalty = 1.1;
            responseStyle = 'balanced';
            if (responseStyleSelect) responseStyleSelect.value = 'balanced';
            if (advancedControls) advancedControls.style.display = 'none';
            updateSliderDisplays();
            saveResponseParams();
            if (toolStatus) {
                toolStatus.textContent = '⚖️ Reset to balanced';
                setTimeout(() => updateToolStatus(), 2000);
            }
        };
    }
    
    // ========== SYSTEM MESSAGES ==========
    
    if (applyAllBtn) {
        applyAllBtn.onclick = () => {
            if (grokSystemInput) grokSystem = grokSystemInput.value;
            if (dsChatInput) dsChatSystem = dsChatInput.value;
            if (dsReasonerInput) dsReasonerSystem = dsReasonerInput.value;
            if (claudeSystemInput) localStorage.setItem('claude_system', claudeSystemInput.value);
            if (overrideInput) overrideSystem = overrideInput.value;
            
            localStorage.setItem('grok_system', grokSystem);
            localStorage.setItem('ds_chat_system', dsChatSystem);
            localStorage.setItem('ds_reasoner_system', dsReasonerSystem);
            localStorage.setItem('override_system', overrideSystem);
            
            if (overrideSystem && overrideRemaining === 0 && overrideCountSelect) {
                overrideRemaining = parseInt(overrideCountSelect.value);
                localStorage.setItem('override_remaining', overrideRemaining);
            }
            
            updateOverrideDisplay();
            if (toolStatus) toolStatus.textContent = '✓ System messages saved';
            setTimeout(() => updateToolStatus(), 2000);
        };
    }
    
    if (resetOverrideBtn && overrideCountSelect) {
        resetOverrideBtn.onclick = () => {
            overrideRemaining = parseInt(overrideCountSelect.value);
            localStorage.setItem('override_remaining', overrideRemaining);
            updateOverrideDisplay();
        };
    }
    
    // ========== CHAIN BUTTONS ==========
    
    if (newChainBtn) {
        newChainBtn.onclick = () => {
            const newId = crypto.randomUUID();
            localStorage.setItem('current_chain', newId);
            if (chainSpan) chainSpan.textContent = newId.slice(0, 8);
            previousResponseId = null;
            if (memory) {
                memory.clearWorking();
                if (window.UIRenderer) UIRenderer.renderMessages();
                if (window.UIRenderer) UIRenderer.updateMemoryPanels();
            }
            if (chainCount) chainCount.textContent = memory?.active.length || 0;
            if (toolStatus) toolStatus.textContent = '✨ New thread created';
            setTimeout(() => updateToolStatus(), 2000);
        };
    }
    
    if (exportChainBtn) {
        exportChainBtn.onclick = () => {
            const data = JSON.stringify({
                chain: localStorage.getItem('current_chain') || '',
                active: memory?.active || [],
                working: memory?.working || [],
                previousResponseId
            }, null, 2);
            navigator.clipboard.writeText(data);
            if (toolStatus) toolStatus.textContent = '📋 Chain exported to clipboard';
            setTimeout(() => updateToolStatus(), 2000);
        };
    }
    
    // ========== DEEPSEEK PERSPECTIVE ==========
    
    if (getDeepSeekBtn) {
        getDeepSeekBtn.onclick = async () => {
            if (!deepseekApiKey) {
                alert('Please set your DeepSeek API key in System Panel first');
                return;
            }
            if (!memory) return;
            
            const lastUserMsg = [...memory.working].reverse().find(m => m.role === 'user');
            const lastGrokMsg = [...memory.working].reverse().find(m => m.role === 'assistant' && m.model === 'grok-4-1-fast-reasoning');
            
            if (!lastUserMsg || !lastGrokMsg) {
                alert('Need both a user message and a Grok response');
                return;
            }
            
            if (toolStatus) toolStatus.textContent = '🔮 Getting DeepSeek perspective...';
            
            const context = memory.buildContext();
            const prompt = `[User]: ${lastUserMsg.content}\n\n[Grok]: ${lastGrokMsg.content}\n\nProvide your perspective.`;
            
            try {
                const params = window.responseParams.getCurrent();
                const response = await APIHandlers.callDeepSeek('deepseek-chat', 
                    [{ role: 'system', content: context }, { role: 'user', content: prompt }], 
                    [], false, deepseekApiKey, params);
                const data = await response.json();
                const result = APIHandlers.parseDeepSeekResponse(data);
                
                memory.addWorking(result.content, 'assistant');
                if (window.UIRenderer) UIRenderer.renderMessages();
                if (toolStatus) toolStatus.textContent = '🔮 Perspective received';
                setTimeout(() => updateToolStatus(), 2000);
            } catch (error) {
                console.error(error);
                if (toolStatus) toolStatus.textContent = `🔮 Error: ${error.message}`;
            }
        };
    }
    
    // ========== FILE INPUT ==========
    
    if (fileInput) {
        fileInput.onchange = async (e) => {
            const files = Array.from(e.target.files);
            const imageFiles = files.filter(f => f.type.startsWith('image/'));
            const otherFiles = files.filter(f => !f.type.startsWith('image/'));
            
            if (imageFiles.length > 0 && modelSelector?.value === 'grok-4-1-fast-reasoning') {
                pendingImages = await Promise.all(imageFiles.map(async (file) => {
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve({ type: 'image', image_url: reader.result });
                        reader.readAsDataURL(file);
                    });
                }));
            }
            pendingFiles = otherFiles;
            const allNames = [...imageFiles.map(f => f.name), ...otherFiles.map(f => f.name)];
            if (fileNames) fileNames.textContent = allNames.join(', ');
        };
    }
    
    // ========== TRANSMIT BUTTON ==========
    
    if (transmitBtn && msgInput) {
        transmitBtn.onclick = async () => {
            const content = msgInput.value.trim();
            if (!content && pendingFiles.length === 0 && pendingImages.length === 0) return;
            
            const selectedModel = modelSelector?.value || 'grok-4-1-fast-reasoning';
            
            // Add user message to memory
            memory.addWorking(content, 'user');
            if (window.UIRenderer) UIRenderer.renderMessages();
            
            transmitBtn.disabled = true;
            transmitBtn.textContent = '...';
            
            try {
                let reply = '';
                
                if (selectedModel === 'grok-4-1-fast-reasoning' && xaiApiKey) {
                    const messages = [{ role: 'system', content: grokSystem }, { role: 'user', content }];
                    const response = await APIHandlers.callGrok(messages, [], false, null, xaiApiKey, {});
                    const data = await response.json();
                    reply = APIHandlers.parseGrokResponse(data);
                } 
                else if (selectedModel === 'deepseek-chat' && deepseekApiKey) {
                    const messages = [{ role: 'system', content: dsChatSystem }, { role: 'user', content }];
                    const response = await APIHandlers.callDeepSeek('deepseek-chat', messages, [], false, deepseekApiKey, {});
                    const data = await response.json();
                    reply = APIHandlers.parseDeepSeekResponse(data).content;
                }
                else if (selectedModel === 'claude-3-opus' && anthropicApiKey) {
                    const response = await fetch('https://api.anthropic.com/v1/messages', {
                        method: 'POST',
                        headers: {
                            'x-api-key': anthropicApiKey,
                            'anthropic-version': '2023-06-01',
                            'content-type': 'application/json'
                        },
                        body: JSON.stringify({
                            model: 'claude-3-opus-20240229',
                            max_tokens: 2000,
                            messages: [{ role: 'user', content }]
                        })
                    });
                    const data = await response.json();
                    reply = data.content[0].text;
                }
                else {
                    alert('Please set the API key for the selected model in System Panel');
                    transmitBtn.disabled = false;
                    transmitBtn.textContent = '↵';
                    return;
                }
                
                memory.addWorking(reply, 'assistant');
                if (window.UIRenderer) UIRenderer.renderMessages();
                if (chainCount) chainCount.textContent = memory.active.length;
                
            } catch (error) {
                console.error(error);
                memory.addWorking(`⚠️ Error: ${error.message}`, 'system');
                if (window.UIRenderer) UIRenderer.renderMessages();
            } finally {
                transmitBtn.disabled = false;
                transmitBtn.textContent = '↵';
                msgInput.value = '';
                pendingFiles = [];
                pendingImages = [];
                if (fileNames) fileNames.textContent = '';
                msgInput.style.height = 'auto';
            }
        };
        
        // Enter key in textarea
        msgInput.onkeydown = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                transmitBtn.click();
            }
        };
        
        // Auto-grow textarea
        msgInput.oninput = function() {
            this.style.height = 'auto';
            this.style.height = Math.min(120, this.scrollHeight) + 'px';
        };
    }
    
    console.log('✅ All buttons wired');
}


// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function promptForApiKey(provider) {
    const key = prompt(`Enter ${provider === 'xai' ? 'xAI' : provider === 'deepseek' ? 'DeepSeek' : 'Anthropic'} API key:`);
    if (key) {
        if (provider === 'xai') {
            xaiApiKey = key;
            localStorage.setItem('xai_api_key', key);
            if (fabric) grokClient = new GrokClient(key, fabric);
        } else if (provider === 'deepseek') {
            deepseekApiKey = key;
            localStorage.setItem('deepseek_api_key', key);
            if (fabric) deepseekClient = new DeepSeekClient(key, fabric);
        } else if (provider === 'anthropic') {
            anthropicApiKey = key;
            localStorage.setItem('anthropic_api_key', key);
            if (fabric) claudeClient = new ClaudeClient(key, fabric);
        }
        updateApiDisplays();
    }
}

function updateApiDisplays() {
    if (xaiDisplay) xaiDisplay.textContent = xaiApiKey ? xaiApiKey.substring(0, 4) + '...' + xaiApiKey.slice(-4) : 'not set';
    if (xaiStatus) xaiStatus.className = xaiApiKey ? 'status-badge active' : 'status-badge';
    
    if (deepseekDisplay) deepseekDisplay.textContent = deepseekApiKey ? deepseekApiKey.substring(0, 4) + '...' + deepseekApiKey.slice(-4) : 'not set';
    if (deepseekStatus) deepseekStatus.className = deepseekApiKey ? 'status-badge active' : 'status-badge';
    
    if (claudeDisplay) claudeDisplay.textContent = anthropicApiKey ? anthropicApiKey.substring(0, 4) + '...' + anthropicApiKey.slice(-4) : 'not set';
    if (claudeStatus) claudeStatus.className = anthropicApiKey ? 'status-badge active' : 'status-badge';
}

function updateToolStatus() {
    const tools = [];
    if (webSearchEnabled) tools.push('🌐');
    if (xSearchEnabled) tools.push('𝕏');
    if (imageGenEnabled) tools.push('🎨');
    if (toolStatus) toolStatus.textContent = tools.length ? `Tools: ${tools.join(' ')}` : '';
}

function updateOverrideDisplay() {
    if (overrideRemainingSpan) {
        overrideRemainingSpan.textContent = overrideRemaining > 0 ? `${overrideRemaining} left` : 'inactive';
    }
}

function initializeValues() {
    // Load stored system messages
    if (grokSystemInput) grokSystemInput.value = grokSystem;
    if (dsChatInput) dsChatInput.value = dsChatSystem;
    if (dsReasonerInput) dsReasonerInput.value = dsReasonerSystem;
    if (overrideInput) overrideInput.value = overrideSystem;
    
    updateOverrideDisplay();
    updateApiDisplays();
    
    // Restore chain ID
    let currentChainId = localStorage.getItem('current_chain') || crypto.randomUUID();
    localStorage.setItem('current_chain', currentChainId);
    if (chainSpan) chainSpan.textContent = currentChainId.slice(0, 8);
    if (chainCount) chainCount.textContent = memory?.active.length || 0;
    
    // Load response params
    const saved = localStorage.getItem('response_params');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            temperature = parsed.temperature ?? 0.7;
            topP = parsed.topP ?? 0.9;
            topK = parsed.topK ?? 40;
            repetitionPenalty = parsed.repetitionPenalty ?? 1.1;
            responseStyle = parsed.responseStyle ?? 'balanced';
        } catch (e) {}
    }
    updateSliderDisplays();
    if (responseStyleSelect) {
        responseStyleSelect.value = responseStyle;
        if (responseStyle === 'custom' && advancedControls) {
            advancedControls.style.display = 'block';
        }
    }
}

function updateResponsePreset() {
    if (responseStyle === 'precise') {
        temperature = 0.2; topP = 0.5; topK = 20; repetitionPenalty = 1.0;
    } else if (responseStyle === 'balanced') {
        temperature = 0.7; topP = 0.9; topK = 40; repetitionPenalty = 1.1;
    } else if (responseStyle === 'creative') {
        temperature = 1.2; topP = 0.95; topK = 60; repetitionPenalty = 1.2;
    }
    updateSliderDisplays();
}

function updateSliderDisplays() {
    if (tempSlider && tempValue) {
        tempSlider.value = temperature;
        tempValue.textContent = temperature.toFixed(1);
    }
    if (topPSlider && topPValue) {
        topPSlider.value = topP;
        topPValue.textContent = topP.toFixed(2);
    }
    if (topKSlider && topKValue) {
        topKSlider.value = topK;
        topKValue.textContent = topK;
    }
    if (repPenaltySlider && repPenaltyValue) {
        repPenaltySlider.value = repetitionPenalty;
        repPenaltyValue.textContent = repetitionPenalty.toFixed(1);
    }
}

function saveResponseParams() {
    localStorage.setItem('response_params', JSON.stringify({
        temperature, topP, topK, repetitionPenalty, responseStyle
    }));
}

// Expose globally
window.promptForApiKey = promptForApiKey;
window.transmit = () => transmitBtn?.click();
window.memory = () => memory;
window.fabric = () => fabric;
