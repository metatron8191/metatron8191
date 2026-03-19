// ui.js
document.addEventListener('DOMContentLoaded', () => {
    // === INIT ===
    const memory = new AurelianMemory();
    let xaiApiKey = localStorage.getItem('xai_api_key') || '';
    let deepseekApiKey = localStorage.getItem('deepseek_api_key') || '';
    let previousResponseId = null;

    // Tool state
    let webSearchEnabled = false;
    let xSearchEnabled = false;
    let imageGenEnabled = false;
    let streamingEnabled = false;

    // System message storage
    let grokSystem = localStorage.getItem('grok_system') || '';
    let dsChatSystem = localStorage.getItem('ds_chat_system') || '';
    let dsReasonerSystem = localStorage.getItem('ds_reasoner_system') || '';
    let overrideSystem = localStorage.getItem('override_system') || '';
    let overrideRemaining = parseInt(localStorage.getItem('override_remaining') || '0');

    // File state
    let pendingFiles = [];
    let pendingImages = [];

    // DOM elements
    const messagesArea = document.getElementById('messages-area');
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

    // System panel elements
    const grokSystemInput = document.getElementById('grok-system');
    const dsChatInput = document.getElementById('ds-chat-system');
    const dsReasonerInput = document.getElementById('ds-reasoner-system');
    const overrideInput = document.getElementById('override-system');
    const overrideCountSelect = document.getElementById('override-count');
    const overrideRemainingSpan = document.getElementById('override-remaining');
    const resetOverrideBtn = document.getElementById('reset-override');
    const applyAllBtn = document.getElementById('apply-system-all');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const toggleMemoryBtn = document.getElementById('toggle-memory');
    const memoryPanel = document.getElementById('memory-panel');
    const systemToggle = document.getElementById('systemToggle');
    const systemPanel = document.getElementById('system-panel');

    // === LOAD INITIAL VALUES ===
    grokSystemInput.value = grokSystem;
    dsChatInput.value = dsChatSystem;
    dsReasonerInput.value = dsReasonerSystem;
    overrideInput.value = overrideSystem;
    updateOverrideDisplay();
    updateApiDisplays();
    loadAurelianSystemMessage();

    // === EVENT LISTENERS ===
    
    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const target = btn.dataset.target;
            tabContents.forEach(tc => tc.classList.add('hidden'));
            document.getElementById(target).classList.remove('hidden');
        });
    });

    // Apply all system messages
    applyAllBtn.addEventListener('click', () => {
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
        showTemporaryStatus('system-save-status', '✓ saved');
    });

    // Reset override counter
    resetOverrideBtn.addEventListener('click', () => {
        overrideRemaining = parseInt(overrideCountSelect.value);
        localStorage.setItem('override_remaining', overrideRemaining);
        updateOverrideDisplay();
    });

    // Chain management
    document.getElementById('newChainBtn').addEventListener('click', () => {
        const newId = crypto.randomUUID();
        localStorage.setItem('current_chain', newId);
        chainSpan.textContent = newId.slice(0, 8);
        previousResponseId = null;
    });

    document.getElementById('exportChainBtn').addEventListener('click', () => {
        const data = JSON.stringify({
            chain: localStorage.getItem('current_chain') || '',
            active: memory.active,
            working: memory.working,
            previousResponseId
        }, null, 2);
        navigator.clipboard.writeText(data);
        alert('Chain data copied to clipboard');
    });

    // Tool toggles
    webSearchBtn.addEventListener('click', () => {
        webSearchEnabled = !webSearchEnabled;
        webSearchBtn.classList.toggle('active', webSearchEnabled);
        updateToolStatus();
    });

    xSearchBtn.addEventListener('click', () => {
        xSearchEnabled = !xSearchEnabled;
        xSearchBtn.classList.toggle('active', xSearchEnabled);
        updateToolStatus();
    });

    imageGenBtn.addEventListener('click', () => {
        imageGenEnabled = !imageGenEnabled;
        imageGenBtn.classList.toggle('active', imageGenEnabled);
        toolStatus.textContent = imageGenEnabled ? '🎨 Image gen on' : '';
    });

    streamToggle.addEventListener('click', () => {
        streamingEnabled = !streamingEnabled;
        streamToggle.textContent = `⚡ STREAM: ${streamingEnabled ? 'ON' : 'OFF'}`;
        streamToggle.classList.toggle('active', streamingEnabled);
    });

    // Get DeepSeek perspective button
    getDeepSeekBtn.addEventListener('click', async () => {
        await getDeepSeekPerspective(memory, deepseekApiKey, toolStatus, renderMessages, updateMemoryPanels);
    });

    // Toggle panels
    toggleMemoryBtn.addEventListener('click', () => {
        memoryPanel.classList.toggle('hidden');
        if (!memoryPanel.classList.contains('hidden')) {
            updateMemoryPanels();
        }
    });

    systemToggle.addEventListener('click', () => {
        systemPanel.classList.toggle('hidden');
    });

    // File handling
    fileInput.addEventListener('change', handleFileSelect);
    msgInput.addEventListener('dragover', (e) => e.preventDefault());
    msgInput.addEventListener('drop', handleFileDrop);

    // Transmit
    transmitBtn.addEventListener('click', () => {
        transmit(memory, {
            xaiApiKey, deepseekApiKey, previousResponseId,
            webSearchEnabled, xSearchEnabled, imageGenEnabled, streamingEnabled,
            grokSystem, dsChatSystem, dsReasonerSystem, overrideRemaining,
            pendingFiles, pendingImages,
            modelSelector, msgInput, fileNames, toolStatus, transmitBtn,
            renderMessages, updateMemoryPanels, updateApiDisplays, updateOverrideDisplay,
            useOverrideIfActive, handleStream, generateImage
        });
    });

    // Enter to send
    msgInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            transmitBtn.click();
        }
    });

    // Auto-grow textarea
    msgInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(120, this.scrollHeight) + 'px';
    });

    // === HELPER FUNCTIONS ===

    function updateApiDisplays() {
        if (xaiApiKey) {
            xaiDisplay.textContent = xaiApiKey.substring(0, 4) + '...' + xaiApiKey.slice(-4);
            xaiStatus.className = 'api-dot active';
        } else {
            xaiDisplay.textContent = 'xAI not set';
            xaiStatus.className = 'api-dot';
        }
        if (deepseekApiKey) {
            deepseekDisplay.textContent = deepseekApiKey.substring(0, 4) + '...' + deepseekApiKey.slice(-4);
            deepseekStatus.className = 'api-dot active';
        } else {
            deepseekDisplay.textContent = 'DS not set';
            deepseekStatus.className = 'api-dot';
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
        toolStatus.textContent = tools.length ? `Search: ${tools.join(' ')}` : '';
    }

    function updateOverrideDisplay() {
        overrideRemainingSpan.textContent = overrideRemaining > 0 ? `${overrideRemaining} left` : 'inactive';
        document.getElementById('ds-chat-status').className = overrideRemaining > 0 ? 'status-badge inactive' : 'status-badge active';
        document.getElementById('ds-reasoner-status').className = overrideRemaining > 0 ? 'status-badge inactive' : 'status-badge active';
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

    async function loadAurelianSystemMessage() {
        try {
            const response = await fetch('aurelian.txt');
            if (response.ok) {
                const text = await response.text();
                if (!grokSystem) {
                    grokSystem = text;
                    grokSystemInput.value = text;
                    localStorage.setItem('grok_system', text);
                }
            }
        } catch (e) {
            console.log('Could not load aurelian.txt');
        }
    }

    async function handleFileSelect(e) {
        const files = Array.from(e.target.files);
        const imageFiles = files.filter(f => f.type.startsWith('image/'));
        const otherFiles = files.filter(f => !f.type.startsWith('image/'));

        if (imageFiles.length > 0 && modelSelector.value === 'grok-4-1-fast-reasoning') {
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
        fileNames.textContent = allNames.join(', ');
    }

    async function handleFileDrop(e) {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        const imageFiles = files.filter(f => f.type.startsWith('image/'));

        if (imageFiles.length > 0 && modelSelector.value === 'grok-4-1-fast-reasoning') {
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
            fileNames.textContent = imageFiles.map(f => f.name).join(', ');
        }
    }

    function showTemporaryStatus(elementId, message) {
        const el = document.getElementById(elementId);
        el.textContent = message;
        setTimeout(() => { el.textContent = ''; }, 2000);
    }

    // === RENDER FUNCTIONS ===

    function renderMessages() {
        messagesArea.innerHTML = '';
        memory.working.forEach(msg => {
            const div = document.createElement('div');
            div.className = 'message-container';
            div.setAttribute('data-role', msg.role);

            let roleClass = '';
            let roleName = msg.role.toUpperCase();

            if (msg.role === 'assistant') {
                if (msg.model === 'grok-4-1-fast-reasoning') {
                    roleClass = 'grok';
                    roleName = 'GROK AURELIAN';
                } else if (msg.model === 'deepseek-reasoner') {
                    roleClass = 'reasoner';
                    roleName = 'DEEPSEEK REASONER';
                } else if (msg.model === 'deepseek-chat') {
                    roleClass = 'deepseek';
                    roleName = 'DEEPSEEK AURELIAN';
                }
            }

            let html = `
                <div class="message-header">
                    <span class="message-role ${roleClass}">${roleName}</span>
                    <span class="message-time">${msg.time}</span>
                </div>
            `;

            if (msg.content.startsWith('http') && msg.attachments?.some(a => a.name === 'generated_image')) {
                html += `<img src="${msg.content}" class="image-attachment" alt="Generated image">`;
            } else {
                html += `<div class="message-content">${escapeHtml(msg.content)}</div>`;
            }

            if (msg.reasoning) {
                html += `
                    <div class="reasoning-toggle" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none'">
                        🧠 Toggle reasoning ▼
                    </div>
                    <div class="reasoning-block" style="display: none;">${escapeHtml(msg.reasoning)}</div>
                `;
            }

            if (msg.attachments?.length) {
                const attachmentNames = msg.attachments.map(a => a.name || a).join(', ');
                html += `<div style="color:#0a84ff; font-size:11px; margin-top:4px;">📎 ${attachmentNames}</div>`;
            }

            html += `<div class="message-tools">`;
            html += `<button class="message-btn save-button" data-id="${msg.id}">💾 SAVE</button>`;
            html += `</div>`;

            div.innerHTML = html;
            messagesArea.appendChild(div);
        });

        document.querySelectorAll('.save-button').forEach(btn => {
            btn.onclick = (e) => {
                const id = e.target.dataset.id;
                const msg = memory.working.find(m => m.id === id);
                if (msg) {
                    memory.addActive(`${msg.role}: ${msg.content}`, msg.attachments);
                    updateMemoryPanels();
                    chainCount.textContent = memory.active.length;
                }
            };
        });

        messagesArea.scrollTop = messagesArea.scrollHeight;
    }

    function escapeHtml(unsafe) {
        return unsafe.replace(/[&<>"]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            if (m === '"') return '&quot;';
            return m;
        });
    }

    function updateMemoryPanels() {
        const activeList = document.getElementById('active-memory-list');
        const workingList = document.getElementById('working-memory-list');
        if (!activeList) return;

        activeList.innerHTML = '';
        memory.getTopActive(8).forEach(m => {
            const d = document.createElement('div');
            d.className = 'memory-item';
            d.onclick = () => msgInput.value = m.content;
            d.innerHTML = `
                <span class="memory-freq">${m.freq}x</span>
                <span class="memory-preview">${escapeHtml(m.content.substring(0, 40))}</span>
            `;
            activeList.appendChild(d);
        });

        workingList.innerHTML = '';
        memory.working.slice(-5).reverse().forEach(m => {
            const d = document.createElement('div');
            d.className = 'memory-item';
            d.innerHTML = `
                <span style="color:#0a84ff; min-width:35px;">${m.role}</span>
                <span class="memory-preview">${escapeHtml(m.content.substring(0, 30))}</span>
            `;
            workingList.appendChild(d);
        });
    }

    // Initial render
    renderMessages();
    updateMemoryPanels();
});
