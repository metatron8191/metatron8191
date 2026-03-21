let fabric, sync, grokClient, deepseekClient, claudeClient;

// After components loaded, initialize fabric and clients
window.addEventListener('componentsLoaded', async () => {
    // ... existing initialization ...

    // Initialize fabric
    fabric = new NoeticFabric();
    await fabric.init();

    sync = new MemorySync(fabric);

    // Initialize model clients with API keys (retrieved from localStorage)
    const xaiKey = localStorage.getItem('xai_api_key');
    const dsKey = localStorage.getItem('deepseek_api_key');
    const anthKey = localStorage.getItem('anthropic_api_key');

    if (xaiKey) grokClient = new GrokClient(xaiKey, fabric);
    if (dsKey) deepseekClient = new DeepSeekClient(dsKey, fabric);
    if (anthKey) claudeClient = new ClaudeClient(anthKey, fabric);

    // Load fabric panel UI
    await loadComponent('fabric-panel-placeholder', 'components/fabric-panel.html');
    attachFabricUI();

    // Override transmit function to use clients if available
    window.transmit = async function() {
        const model = modelSelector.value;
        const message = msgInput.value.trim();
        if (!message) return;

        let reply = '';
        try {
            if (model === 'grok-4-1-fast-reasoning' && grokClient) {
                reply = await grokClient.sendMessage(message);
            } else if (model === 'deepseek-chat' && deepseekClient) {
                reply = await deepseekClient.sendMessage(message);
            } else if (model === 'claude-3-opus' && claudeClient) {
                reply = await claudeClient.sendMessage(message);
            } else {
                // fallback to old API handlers
                // ... existing transmit code ...
                return;
            }
            // render reply
            const assistantMsg = fabric.modelContexts[model.split('-')[0]]?.slice(-1)[0];
            UIRenderer.renderMessages(); // needs to read from fabric
        } catch(e) {
            console.error(e);
            memory.addWorking(`⚠️ Error: ${e.message}`, 'system');
            UIRenderer.renderMessages();
        }
    };
});

// app.js - Main application logic
let memory;
let xaiApiKey = localStorage.getItem('xai_api_key') || '';
let deepseekApiKey = localStorage.getItem('deepseek_api_key') || '';
let previousResponseId = null;

// Tool state
let webSearchEnabled = false;
let xSearchEnabled = false;
let imageGenEnabled = false;
let streamingEnabled = false;

// System messages
let grokSystem = localStorage.getItem('grok_system') || '';
let dsChatSystem = localStorage.getItem('ds_chat_system') || '';
let dsReasonerSystem = localStorage.getItem('ds_reasoner_system') || '';
let overrideSystem = localStorage.getItem('override_system') || '';
let overrideRemaining = parseInt(localStorage.getItem('override_remaining') || '0');

// File state
let pendingFiles = [];
let pendingImages = [];

// Response control state
let temperature = 0.7;
let topP = 0.9;
let topK = 40;
let repetitionPenalty = 1.1;
let responseStyle = 'balanced';

// DOM elements (will be populated after components load)
let msgInput, transmitBtn, fileInput, fileNames, xaiDisplay, xaiStatus, 
    deepseekDisplay, deepseekStatus, chainSpan, chainCount, webSearchBtn, 
    xSearchBtn, imageGenBtn, streamToggle, getDeepSeekBtn, toolStatus, 
    modelSelector, maxTokensSelect, responseStyleSelect, advancedControls,
    tempSlider, tempValue, topPSlider, topPValue, topKSlider, topKValue,
    repPenaltySlider, repPenaltyValue, applyAdvancedBtn, resetAdvancedBtn,
    grokSystemInput, dsChatInput, dsReasonerInput, overrideInput, 
    overrideCountSelect, overrideRemainingSpan, resetOverrideBtn, applyAllBtn,
    toggleMemoryBtn, systemToggle, systemPanel, genesisBtn, genesisPanel, genesisClose;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize memory core
    memory = new AurelianMemory();
    UIRenderer.init(memory);
    
    // Make memory globally available
    window.memory = memory;
    
    // Make response params available to API calls
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
    window.addEventListener('componentsLoaded', () => {
        console.log('Components loaded, initializing app...');
        initializeDomElements();
        initializeEventListeners();
        initializeValues();
        UIRenderer.renderMessages();
        UIRenderer.updateMemoryPanels();
        
        // Initialize GenesisManager
        setTimeout(() => {
            if (window.GenesisManager) {
                console.log('Initializing GenesisManager');
                window.GenesisManager.init(memory);
            }
        }, 500);
    });
});

function initializeDomElements() {
    console.log('Initializing DOM elements...');
    
    msgInput = document.getElementById('message-input');
    transmitBtn = document.getElementById('transmit-button');
    fileInput = document.getElementById('file-input');
    fileNames = document.getElementById('file-names');
    xaiDisplay = document.getElementById('xai-display');
    xaiStatus = document.getElementById('xaiStatus');
    deepseekDisplay = document.getElementById('deepseek-display');
    deepseekStatus = document.getElementById('deepseekStatus');
    chainSpan = document.getElementById('currentChain');
    chainCount = document.getElementById('chainCount');
    webSearchBtn = document.getElementById('webSearchBtn');
    xSearchBtn = document.getElementById('xSearchBtn');
    imageGenBtn = document.getElementById('imageGenBtn');
    streamToggle = document.getElementById('streamToggle');
    getDeepSeekBtn = document.getElementById('getDeepSeekBtn');
    toolStatus = document.getElementById('tool-status');
    modelSelector = document.getElementById('model-selector');
    maxTokensSelect = document.getElementById('max-tokens-select');
    responseStyleSelect = document.getElementById('response-style');
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
    grokSystemInput = document.getElementById('grok-system');
    dsChatInput = document.getElementById('ds-chat-system');
    dsReasonerInput = document.getElementById('ds-reasoner-system');
    overrideInput = document.getElementById('override-system');
    overrideCountSelect = document.getElementById('override-count');
    overrideRemainingSpan = document.getElementById('override-remaining');
    resetOverrideBtn = document.getElementById('reset-override');
    applyAllBtn = document.getElementById('apply-system-all');
    toggleMemoryBtn = document.getElementById('toggle-memory');
    systemToggle = document.getElementById('systemToggle');
    systemPanel = document.getElementById('system-panel');
    genesisBtn = document.getElementById('genesis-btn');
    genesisPanel = document.getElementById('genesis-panel');
    genesisClose = document.getElementById('genesis-close');
    
    console.log('DOM elements initialized');
}

function initializeValues() {
    console.log('Initializing values...');
    
    // Set system message inputs
    if (grokSystemInput) grokSystemInput.value = grokSystem;
    if (dsChatInput) dsChatInput.value = dsChatSystem;
    if (dsReasonerInput) dsReasonerInput.value = dsReasonerSystem;
    if (overrideInput) overrideInput.value = overrideSystem;
    
    updateOverrideDisplay();
    updateApiDisplays();
    loadSystemMessages();
    initResponseControls();
    
    // Restore chain ID
    let currentChainId = localStorage.getItem('current_chain') || crypto.randomUUID();
    localStorage.setItem('current_chain', currentChainId);
    if (chainSpan) chainSpan.textContent = currentChainId.slice(0, 8);
    if (chainCount) chainCount.textContent = memory.active.length;
}

function initializeEventListeners() {
    console.log('Initializing event listeners...');
    
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const target = btn.dataset.target;
            document.querySelectorAll('.tab-content').forEach(tc => tc.classList.add('hidden'));
            const targetEl = document.getElementById(target);
            if (targetEl) targetEl.classList.remove('hidden');
        });
    });

    // Genesis panel toggle
    if (genesisBtn) {
        genesisBtn.addEventListener('click', () => {
            if (genesisPanel) genesisPanel.classList.toggle('hidden');
        });
    }
    
    if (genesisClose) {
        genesisClose.addEventListener('click', () => {
            if (genesisPanel) genesisPanel.classList.add('hidden');
        });
    }

    // Response style
    if (responseStyleSelect) {
        responseStyleSelect.addEventListener('change', handleResponseStyleChange);
    }
    
    // Sliders
    if (tempSlider) tempSlider.addEventListener('input', handleTempInput);
    if (topPSlider) topPSlider.addEventListener('input', handleTopPInput);
    if (topKSlider) topKSlider.addEventListener('input', handleTopKInput);
    if (repPenaltySlider) repPenaltySlider.addEventListener('input', handleRepPenaltyInput);
    
    // Advanced buttons
    if (applyAdvancedBtn) applyAdvancedBtn.addEventListener('click', handleApplyAdvanced);
    if (resetAdvancedBtn) resetAdvancedBtn.addEventListener('click', handleResetAdvanced);
    
    // Apply system messages
    if (applyAllBtn) applyAllBtn.addEventListener('click', handleApplySystem);
    
    // Reset override
    if (resetOverrideBtn) resetOverrideBtn.addEventListener('click', handleResetOverride);
    
    // Chain management
    const newChainBtn = document.getElementById('newChainBtn');
    const exportChainBtn = document.getElementById('exportChainBtn');
    
    if (newChainBtn) newChainBtn.addEventListener('click', handleNewChain);
    if (exportChainBtn) exportChainBtn.addEventListener('click', handleExportChain);
    
    // Tool toggles
    if (webSearchBtn) webSearchBtn.addEventListener('click', toggleWebSearch);
    if (xSearchBtn) xSearchBtn.addEventListener('click', toggleXSearch);
    if (imageGenBtn) imageGenBtn.addEventListener('click', toggleImageGen);
    if (streamToggle) streamToggle.addEventListener('click', toggleStream);
    
    // Get DeepSeek perspective
    if (getDeepSeekBtn) getDeepSeekBtn.addEventListener('click', getDeepSeekPerspective);
    
    // Toggle panels
    if (toggleMemoryBtn) toggleMemoryBtn.addEventListener('click', toggleMemory);
    if (systemToggle) systemToggle.addEventListener('click', toggleSystem);
    
    // File handling
    if (fileInput) fileInput.addEventListener('change', handleFileSelect);
    if (msgInput) {
        msgInput.addEventListener('dragover', (e) => e.preventDefault());
        msgInput.addEventListener('drop', handleFileDrop);
    }
    
    // Transmit
    if (transmitBtn) transmitBtn.addEventListener('click', transmit);
    
    // Enter to send
    if (msgInput) {
        msgInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                transmit();
            }
        });
        
        // Auto-grow textarea
        msgInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(120, this.scrollHeight) + 'px';
        });
    }
}

// ===== GLOBAL API KEY FUNCTION =====
window.promptForApiKey = function(provider) {
    const key = prompt(`Enter ${provider === 'xai' ? 'xAI' : 'DeepSeek'} API key:`);
    if (key) {
        if (provider === 'xai') {
            xaiApiKey = key;
            localStorage.setItem('xai_api_key', key);
        } else {
            deepseekApiKey = key;
            localStorage.setItem('deepseek_api_key', key);
        }
        updateApiDisplays();
    }
};

// ===== HELPER FUNCTIONS =====
function updateApiDisplays() {
    if (xaiApiKey) {
        if (xaiDisplay) xaiDisplay.textContent = xaiApiKey.substring(0, 4) + '...' + xaiApiKey.slice(-4);
        if (xaiStatus) xaiStatus.className = 'api-dot active';
    } else {
        if (xaiDisplay) xaiDisplay.textContent = 'xAI not set';
        if (xaiStatus) xaiStatus.className = 'api-dot';
    }
    if (deepseekApiKey) {
        if (deepseekDisplay) deepseekDisplay.textContent = deepseekApiKey.substring(0, 4) + '...' + deepseekApiKey.slice(-4);
        if (deepseekStatus) deepseekStatus.className = 'api-dot active';
    } else {
        if (deepseekDisplay) deepseekDisplay.textContent = 'DS not set';
        if (deepseekStatus) deepseekStatus.className = 'api-dot';
    }
}

function updateToolStatus() {
    const tools = [];
    if (webSearchEnabled) tools.push('🌐');
    if (xSearchEnabled) tools.push('𝕏');
    if (toolStatus) toolStatus.textContent = tools.length ? `Search: ${tools.join(' ')}` : '';
}

function updateOverrideDisplay() {
    if (overrideRemainingSpan) {
        overrideRemainingSpan.textContent = overrideRemaining > 0 ? `${overrideRemaining} left` : 'inactive';
    }
    const dsChatStatus = document.getElementById('ds-chat-status');
    const dsReasonerStatus = document.getElementById('ds-reasoner-status');
    if (dsChatStatus) {
        dsChatStatus.className = overrideRemaining > 0 ? 'status-badge inactive' : 'status-badge active';
    }
    if (dsReasonerStatus) {
        dsReasonerStatus.className = overrideRemaining > 0 ? 'status-badge inactive' : 'status-badge active';
    }
}

function getSystemMessageForModel(model) {
    if (model === 'grok-4-1-fast-reasoning') {
        return grokSystem || 'You are Aurelian, a sovereign memory core.';
    } else if (model === 'deepseek-reasoner') {
        if (overrideRemaining > 0 && overrideSystem) return overrideSystem;
        return dsReasonerSystem || 'You are a deep reasoning assistant.';
    } else {
        if (overrideRemaining > 0 && overrideSystem) return overrideSystem;
        return dsChatSystem || 'You are a helpful assistant.';
    }
}

function useOverrideIfActive() {
    if (overrideRemaining > 0) {
        overrideRemaining--;
        localStorage.setItem('override_remaining', overrideRemaining);
        updateOverrideDisplay();
    }
}

async function loadSystemMessages() {
    try {
        const response1 = await fetch('aurelian.txt');
        if (response1.ok) {
            const text = await response1.text();
            if (!grokSystem) {
                grokSystem = text;
                if (grokSystemInput) grokSystemInput.value = text;
                localStorage.setItem('grok_system', text);
            }
        }
    } catch (e) {
        console.log('Could not load aurelian.txt');
    }
    
    try {
        const response2 = await fetch('aurelian2.txt');
        if (response2.ok) {
            const text2 = await response2.text();
            if (!grokSystem.includes(text2.substring(0, 50))) {
                grokSystem = grokSystem + '\n\n' + text2;
                if (grokSystemInput) grokSystemInput.value = grokSystem;
                localStorage.setItem('grok_system', grokSystem);
            }
        }
    } catch (e) {
        console.log('Could not load aurelian2.txt');
    }
}

// Response control handlers
function initResponseControls() {
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

function handleResponseStyleChange(e) {
    responseStyle = e.target.value;
   
    if (responseStyle === 'custom') {
        if (advancedControls) advancedControls.style.display = 'block';
        return;
    }
   
    if (advancedControls) advancedControls.style.display = 'none';
   
    switch(responseStyle) {
        case 'precise':
            temperature = 0.2;
            topP = 0.5;
            topK = 20;
            repetitionPenalty = 1.0;
            break;
        case 'balanced':
            temperature = 0.7;
            topP = 0.9;
            topK = 40;
            repetitionPenalty = 1.1;
            break;
        case 'creative':
            temperature = 1.2;
            topP = 0.95;
            topK = 60;
            repetitionPenalty = 1.2;
            break;
    }
   
    updateSliderDisplays();
    saveResponseParams();
}

function handleTempInput() {
    temperature = parseFloat(tempSlider.value);
    tempValue.textContent = temperature.toFixed(1);
    responseStyle = 'custom';
    responseStyleSelect.value = 'custom';
    if (advancedControls) advancedControls.style.display = 'block';
}

function handleTopPInput() {
    topP = parseFloat(topPSlider.value);
    topPValue.textContent = topP.toFixed(2);
    responseStyle = 'custom';
    responseStyleSelect.value = 'custom';
    if (advancedControls) advancedControls.style.display = 'block';
}

function handleTopKInput() {
    topK = parseInt(topKSlider.value);
    topKValue.textContent = topK;
    responseStyle = 'custom';
    responseStyleSelect.value = 'custom';
    if (advancedControls) advancedControls.style.display = 'block';
}

function handleRepPenaltyInput() {
    repetitionPenalty = parseFloat(repPenaltySlider.value);
    repPenaltyValue.textContent = repetitionPenalty.toFixed(1);
    responseStyle = 'custom';
    responseStyleSelect.value = 'custom';
    if (advancedControls) advancedControls.style.display = 'block';
}

function handleApplyAdvanced() {
    saveResponseParams();
    if (toolStatus) {
        toolStatus.textContent = '⚙️ Custom settings applied';
        setTimeout(() => updateToolStatus(), 2000);
    }
}

function handleResetAdvanced() {
    temperature = 0.7;
    topP = 0.9;
    topK = 40;
    repetitionPenalty = 1.1;
    responseStyle = 'balanced';
    responseStyleSelect.value = 'balanced';
    if (advancedControls) advancedControls.style.display = 'none';
    updateSliderDisplays();
    saveResponseParams();
   
    if (toolStatus) {
        toolStatus.textContent = '⚖️ Reset to balanced';
        setTimeout(() => updateToolStatus(), 2000);
    }
}

function handleApplySystem() {
    if (grokSystemInput) grokSystem = grokSystemInput.value;
    if (dsChatInput) dsChatSystem = dsChatInput.value;
    if (dsReasonerInput) dsReasonerSystem = dsReasonerInput.value;
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
    if (window.UIRenderer) {
        window.UIRenderer.showTemporaryStatus('system-save-status', '✓ saved');
    }
}

function handleResetOverride() {
    if (overrideCountSelect) {
        overrideRemaining = parseInt(overrideCountSelect.value);
        localStorage.setItem('override_remaining', overrideRemaining);
        updateOverrideDisplay();
    }
}

function handleNewChain() {
    const newId = crypto.randomUUID();
    localStorage.setItem('current_chain', newId);
    if (chainSpan) chainSpan.textContent = newId.slice(0, 8);
    previousResponseId = null;
   
    if (memory) {
        memory.clearWorking();
        UIRenderer.renderMessages();
        UIRenderer.updateMemoryPanels();
    }
   
    if (chainCount) chainCount.textContent = memory?.active.length || 0;
}

function handleExportChain() {
    const data = JSON.stringify({
        chain: localStorage.getItem('current_chain') || '',
        active: memory?.active || [],
        working: memory?.working || [],
        previousResponseId
    }, null, 2);
    navigator.clipboard.writeText(data);
    alert('Chain data copied to clipboard');
}

function toggleWebSearch() {
    webSearchEnabled = !webSearchEnabled;
    if (webSearchBtn) webSearchBtn.classList.toggle('active', webSearchEnabled);
    updateToolStatus();
}

function toggleXSearch() {
    xSearchEnabled = !xSearchEnabled;
    if (xSearchBtn) xSearchBtn.classList.toggle('active', xSearchEnabled);
    updateToolStatus();
}

function toggleImageGen() {
    imageGenEnabled = !imageGenEnabled;
    if (imageGenBtn) imageGenBtn.classList.toggle('active', imageGenEnabled);
    if (toolStatus) toolStatus.textContent = imageGenEnabled ? '🎨 Image gen on' : '';
}

function toggleStream() {
    streamingEnabled = !streamingEnabled;
    if (streamToggle) {
        streamToggle.textContent = `⚡ STREAM: ${streamingEnabled ? 'ON' : 'OFF'}`;
        streamToggle.classList.toggle('active', streamingEnabled);
    }
}

function toggleMemory() {
    const memoryPanel = document.getElementById('memory-panel');
    if (memoryPanel) {
        memoryPanel.classList.toggle('hidden');
        if (!memoryPanel.classList.contains('hidden')) {
            UIRenderer.updateMemoryPanels();
        }
    }
}

function toggleSystem() {
    if (systemPanel) systemPanel.classList.toggle('hidden');
}

async function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    const otherFiles = files.filter(f => !f.type.startsWith('image/'));
    
    if (imageFiles.length > 0 && modelSelector?.value === 'grok-4-1-fast-reasoning') {
        pendingImages = await Promise.all(imageFiles.map(async (file) => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve({
                    type: 'image',
                    image_url: reader.result
                });
                reader.readAsDataURL(file);
            });
        }));
    }
    
    pendingFiles = otherFiles;
    const allNames = [...imageFiles.map(f => f.name), ...otherFiles.map(f => f.name)];
    if (fileNames) fileNames.textContent = allNames.join(', ');
}

async function handleFileDrop(e) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    
    if (imageFiles.length > 0 && modelSelector?.value === 'grok-4-1-fast-reasoning') {
        pendingImages = await Promise.all(imageFiles.map(async (file) => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve({
                    type: 'image',
                    image_url: reader.result
                });
                reader.readAsDataURL(file);
            });
        }));
        if (fileNames) fileNames.textContent = imageFiles.map(f => f.name).join(', ');
    }
}

async function generateImage(prompt) {
    return await APIHandlers.generateImage(prompt, xaiApiKey);
}

async function handleStream(response, model) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulated = '';
    let reasoning = '';
    
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message-container streaming';
    msgDiv.setAttribute('data-role', 'assistant');
    msgDiv.innerHTML = `
        <div class="message-header">
            <span class="message-role">ASSISTANT (streaming)</span>
            <span class="message-time">${new Date().toLocaleTimeString()}</span>
        </div>
        <div class="message-content" id="stream-content"></div>
    `;
    document.getElementById('messages-area').appendChild(msgDiv);
    const contentDiv = document.getElementById('stream-content');
    
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;
                try {
                    const parsed = JSON.parse(data);
                    let token;
                    if (model.startsWith('grok')) {
                        token = parsed.choices?.[0]?.delta?.content;
                        if (parsed.choices?.[0]?.delta?.reasoning) {
                            reasoning += parsed.choices[0].delta.reasoning;
                        }
                    } else {
                        token = parsed.choices?.[0]?.delta?.content;
                        if (parsed.choices?.[0]?.delta?.reasoning) {
                            reasoning += parsed.choices[0].delta.reasoning;
                        }
                    }
                    if (token) {
                        accumulated += token;
                        if (contentDiv) contentDiv.textContent = accumulated;
                        document.getElementById('messages-area').scrollTop = document.getElementById('messages-area').scrollHeight;
                    }
                } catch (e) { }
            }
        }
    }
    
    msgDiv.remove();
    const assistantMsg = memory.addWorking(accumulated, 'assistant');
    assistantMsg.model = model;
    if (reasoning) {
        assistantMsg.reasoning = reasoning;
    }
    UIRenderer.renderMessages();
}

async function getDeepSeekPerspective() {
    if (!deepseekApiKey) {
        alert('Please set your DeepSeek API key first');
        return;
    }
    
    if (!memory) return;
    
    const lastUserMsg = [...memory.working].reverse().find(m => m.role === 'user');
    const lastGrokMsg = [...memory.working].reverse().find(m => m.role === 'assistant' && m.model === 'grok-4-1-fast-reasoning');
    
    if (!lastUserMsg || !lastGrokMsg) {
        alert('Need both a user message and a Grok response to get DeepSeek perspective');
        return;
    }
    
    if (toolStatus) toolStatus.textContent = '🔮 Getting DeepSeek perspective...';
    
    const context = memory.buildContext();
    const systemMsg = getSystemMessageForModel('deepseek-chat') + '\n\n' + context;
    const prompt = `[Lilith's message]: ${lastUserMsg.content}\n\n[Grok's response]: ${lastGrokMsg.content}\n\nProvide your perspective on this exchange.`;
    
    const messages = [
        { role: 'system', content: systemMsg },
        { role: 'user', content: prompt }
    ];
    
    try {
        const params = window.responseParams.getCurrent();
        const response = await APIHandlers.callDeepSeek('deepseek-chat', messages, [], false, deepseekApiKey, params);
        const data = await response.json();
        const result = APIHandlers.parseDeepSeekResponse(data);
        
        const assistantMsg = memory.addWorking(result.content, 'assistant');
        assistantMsg.model = 'deepseek-chat';
        if (result.reasoning) assistantMsg.reasoning = result.reasoning;
        
        UIRenderer.renderMessages();
        UIRenderer.updateMemoryPanels();
        if (chainCount) chainCount.textContent = memory.active.length;
        if (toolStatus) toolStatus.textContent = '🔮 Perspective received';
        
        useOverrideIfActive();
    } catch (error) {
        console.error('DeepSeek perspective error:', error);
        if (toolStatus) toolStatus.textContent = `🔮 Error: ${error.message}`;
        memory.addWorking(`⚠️ DeepSeek error: ${error.message}`, 'system');
        UIRenderer.renderMessages();
    }
}

async function transmit() {
    if (!msgInput || !memory) return;
    
    const content = msgInput.value.trim() || '';
    const selectedModel = modelSelector?.value || 'grok-4-1-fast-reasoning';
    const params = window.responseParams.getCurrent();
    
    // Image generation mode
    if (imageGenEnabled && selectedModel === 'grok-4-1-fast-reasoning') {
        if (!content) {
            alert('Please enter a prompt for image generation');
            return;
        }
        if (!xaiApiKey) {
            alert('Please set your xAI API key first');
            return;
        }
        
        if (transmitBtn) {
            transmitBtn.disabled = true;
            transmitBtn.textContent = '🎨';
        }
        
        try {
            const imageUrl = await generateImage(content);
            memory.addWorking(content, 'user');
            const assistantMsg = memory.addWorking(imageUrl, 'assistant', [{ name: 'generated_image' }]);
            assistantMsg.model = selectedModel;
            UIRenderer.renderMessages();
        } catch (error) {
            memory.addWorking(`⚠️ Image generation failed: ${error.message}`, 'system');
            UIRenderer.renderMessages();
        } finally {
            if (transmitBtn) {
                transmitBtn.disabled = false;
                transmitBtn.textContent = '↵';
            }
            msgInput.value = '';
        }
        return;
    }
    
    // Regular chat mode
    if (!content && pendingFiles.length === 0 && pendingImages.length === 0) return;
    
    if (selectedModel.startsWith('deepseek') && !deepseekApiKey) {
        alert('Please set your DeepSeek API key first');
        return;
    }
    
    if (selectedModel === 'grok-4-1-fast-reasoning' && !xaiApiKey) {
        alert('Please set your xAI API key first');
        return;
    }
    
    if (transmitBtn) {
        transmitBtn.disabled = true;
        transmitBtn.textContent = '...';
    }
    
    const attachments = [...pendingFiles.map(f => ({ name: f.name }))];
    if (pendingImages.length > 0) {
        attachments.push({ name: `${pendingImages.length} image(s)` });
    }
    
    const userMsg = memory.addWorking(content, 'user', attachments);
    userMsg.model = selectedModel;
    UIRenderer.renderMessages();
    UIRenderer.updateMemoryPanels();
    
    try {
        const context = memory.buildContext();
        const systemMessage = getSystemMessageForModel(selectedModel) + '\n\n' + context;
        
        const messages = [
            { role: 'system', content: systemMessage }
        ];
        
        memory.working.slice(-10).forEach(m => {
            if (m.role === 'user') {
                if (selectedModel === 'grok-4-1-fast-reasoning' && m.id === userMsg.id && pendingImages.length > 0) {
                    const contentArray = [
                        { type: 'text', text: m.content || ' ' },
                        ...pendingImages
                    ];
                    messages.push({ role: 'user', content: contentArray });
                } else {
                    messages.push({ role: 'user', content: m.content });
                }
            } else {
                messages.push({ role: 'assistant', content: m.content });
            }
        });
        
        const tools = [];
        if (webSearchEnabled) tools.push({ type: 'web_search' });
        if (xSearchEnabled) tools.push({ type: 'x_search' });
        
        if (selectedModel.startsWith('deepseek')) {
            const response = await APIHandlers.callDeepSeek(selectedModel, messages, tools, streamingEnabled, deepseekApiKey, params);
            
            if (streamingEnabled) {
                await handleStream(response, selectedModel);
                useOverrideIfActive();
                if (transmitBtn) {
                    transmitBtn.disabled = false;
                    transmitBtn.textContent = '↵';
                }
                msgInput.value = '';
                pendingFiles = [];
                pendingImages = [];
                if (fileNames) fileNames.textContent = '';
                return;
            }
            
            const data = await response.json();
            const result = APIHandlers.parseDeepSeekResponse(data);
            
            const assistantMsg = memory.addWorking(result.content, 'assistant');
            assistantMsg.model = selectedModel;
            if (result.reasoning) assistantMsg.reasoning = result.reasoning;
            
        } else {
            const response = await APIHandlers.callGrok(messages, tools, streamingEnabled, previousResponseId, xaiApiKey, params);
            
            if (streamingEnabled) {
                await handleStream(response, selectedModel);
                if (transmitBtn) {
                    transmitBtn.disabled = false;
                    transmitBtn.textContent = '↵';
                }
                msgInput.value = '';
                pendingFiles = [];
                pendingImages = [];
                if (fileNames) fileNames.textContent = '';
                return;
            }
            
            const data = await response.json();
            if (data.id) previousResponseId = data.id;
            const reply = APIHandlers.parseGrokResponse(data);
            
            const assistantMsg = memory.addWorking(reply, 'assistant');
            assistantMsg.model = selectedModel;
        }
        
        if (selectedModel.startsWith('deepseek')) {
            useOverrideIfActive();
        }
        
        UIRenderer.renderMessages();
        UIRenderer.updateMemoryPanels();
        if (chainCount) chainCount.textContent = memory.active.length;
        
    } catch (error) {
        console.error('API Error:', error);
        memory.addWorking(`⚠️ Error: ${error.message}`, 'system');
        UIRenderer.renderMessages();
        previousResponseId = null;
    } finally {
        if (transmitBtn) {
            transmitBtn.disabled = false;
            transmitBtn.textContent = '↵';
        }
        msgInput.value = '';
        pendingFiles = [];
        pendingImages = [];
        if (fileNames) fileNames.textContent = '';
        msgInput.style.height = 'auto';
    }
}
