// app.js
document.addEventListener('DOMContentLoaded', () => {
    // Initialize core
    const memory = new AurelianMemory();
    UIRenderer.init(memory);

    // State
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

    // Make params available to API calls
    window.responseParams = {
        getCurrent: () => ({
            temperature,
            topP,
            topK,
            repetitionPenalty,
            maxTokens: parseInt(maxTokensSelect?.value || '2000')
        })
    };

    // DOM elements
    const msgInput = document.getElementById('message-input');
    const transmitBtn = document.getElementById('transmit-button');
    const fileInput = document.getElementById('file-input');
    const fileNames = document.getElementById('file-names');
    const xaiDisplay = document.getElementById('xai-display');
    const xaiStatus = document.getElementById('xaiStatus');
    const deepseekDisplay = document.getElementById('deepseek-display');
    const deepseekStatus = document.getElementById('deepseekStatus');
    const chainSpan = document.getElementById('currentChain');
    const chainCount = document.getElementById('chainCount');
    const webSearchBtn = document.getElementById('webSearchBtn');
    const xSearchBtn = document.getElementById('xSearchBtn');
    const imageGenBtn = document.getElementById('imageGenBtn');
    const streamToggle = document.getElementById('streamToggle');
    const getDeepSeekBtn = document.getElementById('getDeepSeekBtn');
    const toolStatus = document.getElementById('tool-status');
    const modelSelector = document.getElementById('model-selector');
    const maxTokensSelect = document.getElementById('max-tokens-select');

    // Response control elements
    const responseStyleSelect = document.getElementById('response-style');
    const advancedControls = document.getElementById('advanced-controls');
    const tempSlider = document.getElementById('temp-slider');
    const tempValue = document.getElementById('temp-value');
    const topPSlider = document.getElementById('top-p-slider');
    const topPValue = document.getElementById('top-p-value');
    const topKSlider = document.getElementById('top-k-slider');
    const topKValue = document.getElementById('top-k-value');
    const repPenaltySlider = document.getElementById('rep-penalty-slider');
    const repPenaltyValue = document.getElementById('rep-penalty-value');
    const applyAdvancedBtn = document.getElementById('apply-advanced');
    const resetAdvancedBtn = document.getElementById('reset-advanced');

    // System panel elements
    const grokSystemInput = document.getElementById('grok-system');
    const dsChatInput = document.getElementById('ds-chat-system');
    const dsReasonerInput = document.getElementById('ds-reasoner-system');
    const overrideInput = document.getElementById('override-system');
    const overrideCountSelect = document.getElementById('override-count');
    const overrideRemainingSpan = document.getElementById('override-remaining');
    const resetOverrideBtn = document.getElementById('reset-override');
    const applyAllBtn = document.getElementById('apply-system-all');
    const toggleMemoryBtn = document.getElementById('toggle-memory');
    const memoryPanel = document.getElementById('memory-panel');
    const systemToggle = document.getElementById('systemToggle');
    const systemPanel = document.getElementById('system-panel');

    // === INITIAL VALUES ===
    grokSystemInput.value = grokSystem;
    dsChatInput.value = dsChatSystem;
    dsReasonerInput.value = dsReasonerSystem;
    overrideInput.value = overrideSystem;
    updateOverrideDisplay();
    updateApiDisplays();
    loadSystemMessages();
    initResponseControls();

    // Restore chain ID
    let currentChainId = localStorage.getItem('current_chain') || crypto.randomUUID();
    localStorage.setItem('current_chain', currentChainId);
    if (chainSpan) chainSpan.textContent = currentChainId.slice(0, 8);
    if (chainCount) chainCount.textContent = memory.active.length;

    // === RENDER INITIAL MESSAGES ===
    UIRenderer.renderMessages();
    UIRenderer.updateMemoryPanels();

    // === TAB SWITCHING ===
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const target = btn.dataset.target;
            document.querySelectorAll('.tab-content').forEach(tc => tc.classList.add('hidden'));
            document.getElementById(target).classList.remove('hidden');
        });
    });

    // === RESPONSE CONTROL INITIALIZATION ===
    function initResponseControls() {
        // Load saved values if they exist
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
        
        // Update UI
        updateSliderDisplays();
        if (responseStyleSelect) {
            responseStyleSelect.value = responseStyle;
            if (responseStyle === 'custom') {
                advancedControls.style.display = 'block';
            }
        }
    }

    function updateSliderDisplays() {
        if (tempSlider) {
            tempSlider.value = temperature;
            tempValue.textContent = temperature.toFixed(1);
        }
        if (topPSlider) {
            topPSlider.value = topP;
            topPValue.textContent = topP.toFixed(2);
        }
        if (topKSlider) {
            topKSlider.value = topK;
            topKValue.textContent = topK;
        }
        if (repPenaltySlider) {
            repPenaltySlider.value = repetitionPenalty;
            repPenaltyValue.textContent = repetitionPenalty.toFixed(1);
        }
    }

    function saveResponseParams() {
        localStorage.setItem('response_params', JSON.stringify({
            temperature, topP, topK, repetitionPenalty, responseStyle
        }));
    }

    // Response style preset handler
    responseStyleSelect?.addEventListener('change', (e) => {
        responseStyle = e.target.value;
        
        if (responseStyle === 'custom') {
            advancedControls.style.display = 'block';
            return;
        }
        
        advancedControls.style.display = 'none';
        
        // Apply presets
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
        
        // Update sliders and save
        updateSliderDisplays();
        saveResponseParams();
    });

    // Slider event listeners
    tempSlider?.addEventListener('input', () => {
        temperature = parseFloat(tempSlider.value);
        tempValue.textContent = temperature.toFixed(1);
        responseStyle = 'custom';
        responseStyleSelect.value = 'custom';
        advancedControls.style.display = 'block';
    });

    topPSlider?.addEventListener('input', () => {
        topP = parseFloat(topPSlider.value);
        topPValue.textContent = topP.toFixed(2);
        responseStyle = 'custom';
        responseStyleSelect.value = 'custom';
        advancedControls.style.display = 'block';
    });

    topKSlider?.addEventListener('input', () => {
        topK = parseInt(topKSlider.value);
        topKValue.textContent = topK;
        responseStyle = 'custom';
        responseStyleSelect.value = 'custom';
        advancedControls.style.display = 'block';
    });

    repPenaltySlider?.addEventListener('input', () => {
        repetitionPenalty = parseFloat(repPenaltySlider.value);
        repPenaltyValue.textContent = repetitionPenalty.toFixed(1);
        responseStyle = 'custom';
        responseStyleSelect.value = 'custom';
        advancedControls.style.display = 'block';
    });

    applyAdvancedBtn?.addEventListener('click', () => {
        // Values already updated via sliders
        saveResponseParams();
        
        if (toolStatus) {
            toolStatus.textContent = '⚙️ Custom settings applied';
            setTimeout(() => updateToolStatus(), 2000);
        }
    });

    resetAdvancedBtn?.addEventListener('click', () => {
        temperature = 0.7;
        topP = 0.9;
        topK = 40;
        repetitionPenalty = 1.1;
        responseStyle = 'balanced';
        responseStyleSelect.value = 'balanced';
        advancedControls.style.display = 'none';
        updateSliderDisplays();
        saveResponseParams();
        
        if (toolStatus) {
            toolStatus.textContent = '⚖️ Reset to balanced';
            setTimeout(() => updateToolStatus(), 2000);
        }
    });

    // === APPLY SYSTEM MESSAGES ===
    applyAllBtn?.addEventListener('click', () => {
        grokSystem = grokSystemInput.value;
        dsChatSystem = dsChatInput.value;
        dsReasonerSystem = dsReasonerInput.value;
        overrideSystem = overrideInput.value;

        localStorage.setItem('grok_system', grokSystem);
        localStorage.setItem('ds_chat_system', dsChatSystem);
        localStorage.setItem('ds_reasoner_system', dsReasonerSystem);
        localStorage.setItem('override_system', overrideSystem);

        if (overrideSystem && overrideRemaining === 0) {
            overrideRemaining = parseInt(overrideCountSelect.value);
            localStorage.setItem('override_remaining', overrideRemaining);
        }

        updateOverrideDisplay();
        UIRenderer.showTemporaryStatus('system-save-status', '✓ saved');
    });

    // === RESET OVERRIDE ===
    resetOverrideBtn?.addEventListener('click', () => {
        overrideRemaining = parseInt(overrideCountSelect.value);
        localStorage.setItem('override_remaining', overrideRemaining);
        updateOverrideDisplay();
    });

    // === CHAIN MANAGEMENT ===
    document.getElementById('newChainBtn')?.addEventListener('click', () => {
        const newId = crypto.randomUUID();
        localStorage.setItem('current_chain', newId);
        if (chainSpan) chainSpan.textContent = newId.slice(0, 8);
        previousResponseId = null;
        
        // Clear working memory but preserve L2
        memory.clearWorking();
        
        // Re-render empty messages
        UIRenderer.renderMessages();
        UIRenderer.updateMemoryPanels();
        
        if (chainCount) chainCount.textContent = memory.active.length;
    });

    document.getElementById('exportChainBtn')?.addEventListener('click', () => {
        const data = JSON.stringify({
            chain: localStorage.getItem('current_chain') || '',
            active: memory.active,
            working: memory.working,
            previousResponseId
        }, null, 2);
        navigator.clipboard.writeText(data);
        alert('Chain data copied to clipboard');
    });

    // === TOOL TOGGLES ===
    webSearchBtn?.addEventListener('click', () => {
        webSearchEnabled = !webSearchEnabled;
        webSearchBtn.classList.toggle('active', webSearchEnabled);
        updateToolStatus();
    });

    xSearchBtn?.addEventListener('click', () => {
        xSearchEnabled = !xSearchEnabled;
        xSearchBtn.classList.toggle('active', xSearchEnabled);
        updateToolStatus();
    });

    imageGenBtn?.addEventListener('click', () => {
        imageGenEnabled = !imageGenEnabled;
        imageGenBtn.classList.toggle('active', imageGenEnabled);
        if (toolStatus) toolStatus.textContent = imageGenEnabled ? '🎨 Image gen on' : '';
    });

    streamToggle?.addEventListener('click', () => {
        streamingEnabled = !streamingEnabled;
        streamToggle.textContent = `⚡ STREAM: ${streamingEnabled ? 'ON' : 'OFF'}`;
        streamToggle.classList.toggle('active', streamingEnabled);
    });

    // === GET DEEPSEEK PERSPECTIVE ===
    getDeepSeekBtn?.addEventListener('click', async () => {
        await getDeepSeekPerspective();
    });

    // === TOGGLE PANELS ===
    toggleMemoryBtn?.addEventListener('click', () => {
        memoryPanel?.classList.toggle('hidden');
        if (!memoryPanel?.classList.contains('hidden')) {
            UIRenderer.updateMemoryPanels();
        }
    });

    systemToggle?.addEventListener('click', () => {
        systemPanel?.classList.toggle('hidden');
    });

    // === FILE HANDLING ===
    fileInput?.addEventListener('change', handleFileSelect);
    msgInput?.addEventListener('dragover', (e) => e.preventDefault());
    msgInput?.addEventListener('drop', handleFileDrop);

    // === TRANSMIT ===
    transmitBtn?.addEventListener('click', transmit);

    // === ENTER TO SEND ===
    msgInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            transmit();
        }
    });

    // === AUTO-GROW TEXTAREA ===
    msgInput?.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(120, this.scrollHeight) + 'px';
    });

    // === HELPER FUNCTIONS ===

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

    function updateToolStatus() {
        const tools = [];
        if (webSearchEnabled) tools.push('🌐');
        if (xSearchEnabled) tools.push('𝕏');
        if (toolStatus) toolStatus.textContent = tools.length ? `Search: ${tools.join(' ')}` : '';
    }

    function updateOverrideDisplay() {
        if (overrideRemainingSpan) overrideRemainingSpan.textContent = overrideRemaining > 0 ? `${overrideRemaining} left` : 'inactive';
        const dsChatStatus = document.getElementById('ds-chat-status');
        const dsReasonerStatus = document.getElementById('ds-reasoner-status');
        if (dsChatStatus) dsChatStatus.className = overrideRemaining > 0 ? 'status-badge inactive' : 'status-badge active';
        if (dsReasonerStatus) dsReasonerStatus.className = overrideRemaining > 0 ? 'status-badge inactive' : 'status-badge active';
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
        // Load aurelian.txt into Grok system
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

        // Load aurelian2.txt and append to Grok system
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
        const content = msgInput?.value.trim() || '';
        const selectedModel = modelSelector?.value || 'grok-4-1-fast-reasoning';
        const params = window.responseParams.getCurrent();

        // Handle image generation
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
                    transmitBtn.textContent = 'TRANSMIT';
                }
                if (msgInput) msgInput.value = '';
            }
            return;
        }

        // Regular chat
        if (!content && pendingFiles.length === 0 && pendingImages.length === 0) return;

        // Check API keys
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

        // Add user message
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

            let reply = '';
            let reasoning = null;

            if (selectedModel.startsWith('deepseek')) {
                const response = await APIHandlers.callDeepSeek(selectedModel, messages, tools, streamingEnabled, deepseekApiKey, params);

                if (streamingEnabled) {
                    await handleStream(response, selectedModel);
                    useOverrideIfActive();
                    if (transmitBtn) {
                        transmitBtn.disabled = false;
                        transmitBtn.textContent = 'TRANSMIT';
                    }
                    if (msgInput) msgInput.value = '';
                    pendingFiles = [];
                    pendingImages = [];
                    if (fileNames) fileNames.textContent = '';
                    return;
                }

                const data = await response.json();
                const result = APIHandlers.parseDeepSeekResponse(data);
                reply = result.content;
                reasoning = result.reasoning;

            } else { // Grok
                const response = await APIHandlers.callGrok(messages, tools, streamingEnabled, previousResponseId, xaiApiKey, params);

                if (streamingEnabled) {
                    await handleStream(response, selectedModel);
                    if (transmitBtn) {
                        transmitBtn.disabled = false;
                        transmitBtn.textContent = 'TRANSMIT';
                    }
                    if (msgInput) msgInput.value = '';
                    pendingFiles = [];
                    pendingImages = [];
                    if (fileNames) fileNames.textContent = '';
                    return;
                }

                const data = await response.json();
                if (data.id) previousResponseId = data.id;
                reply = APIHandlers.parseGrokResponse(data);
            }

            if (reply) {
                const assistantMsg = memory.addWorking(reply, 'assistant');
                assistantMsg.model = selectedModel;
                if (reasoning) assistantMsg.reasoning = reasoning;
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
                transmitBtn.textContent = 'TRANSMIT';
            }
            if (msgInput) msgInput.value = '';
            pendingFiles = [];
            pendingImages = [];
            if (fileNames) fileNames.textContent = '';
            if (msgInput) {
                msgInput.style.height = 'auto';
            }
        }
    }
});
