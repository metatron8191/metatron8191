// js/memory-fabric.js – v2.0 with proper streaming control from input area
window.MemoryFabric = {
    apiHandler: null,
    currentStreamingElement: null,

    async init() {
        this.apiHandler = new window.APIHandler();
        const settings = window.MemoryCore.getSettings();
        if (settings.model) this.apiHandler.setModel(settings.model);
        console.log('🧵 Memory Fabric v2.0 ready');
    },

    async sendMessage(userMessage, options = { stream: false }) {
        if (!userMessage || !userMessage.trim()) {
            console.warn('Empty message');
            return;
        }

        const { stream = false } = options;

        let thread = window.MemoryCore.getCurrentThread();
        if (!thread) {
            thread = window.MemoryCore.createThread('Conversation');
        }

        const userMsg = {
            role: 'user',
            content: userMessage,
            timestamp: new Date().toISOString()
        };
        window.MemoryCore.addMessageToThread(userMsg);
        window.UIRenderer.appendMessage(userMsg);

        this.showTypingIndicator();

        try {
            const settings = thread.settings || window.MemoryCore.state.settings;
            const prevId = window.MemoryCore.state.currentResponseId;

            let fullText = '';
            let responseId = null;

            if (stream && this.apiHandler.activeClient?.sendMessageStream) {
                // === Streaming path ===
                const assistantDiv = window.UIRenderer.appendMessage(
                    { role: 'assistant', content: '' },
                    true
                );
                this.currentStreamingElement = assistantDiv;

                const result = await this.apiHandler.activeClient.sendMessageStream(
                    userMessage,
                    {
                        model: settings.model,
                        temperature: settings.temperature,
                        stateful: settings.stateful,
                        previousResponseId: prevId
                    },
                    (delta, accumulated) => {
                        fullText = accumulated;
                        window.UIRenderer.updateStreamingContent(assistantDiv, fullText);
                    }
                );

                fullText = result.text;
                responseId = result.responseId;
            } else {
                // === Non-streaming path ===
                const result = await this.apiHandler.sendMessage(userMessage, {
                    model: settings.model,
                    temperature: settings.temperature,
                    stateful: settings.stateful,
                    previousResponseId: prevId,
                    stream: false
                });

                fullText = result.text;
                responseId = result.responseId;
            }

            this.hideTypingIndicator();

            const assistantMsg = {
                role: 'assistant',
                content: fullText,
                responseId: responseId,
                timestamp: new Date().toISOString()
            };

            window.MemoryCore.addMessageToThread(assistantMsg);
            window.MemoryCore.setCurrentResponseId(assistantMsg.responseId);

            // Final refresh (in case streaming missed something)
            window.renderMessages();
            window.updateThreadsList();

            return assistantMsg;

        } catch (e) {
            this.hideTypingIndicator();
            console.error('Send error:', e);
            const errMsg = {
                role: 'assistant',
                content: `⚠️ ${e.message || 'Failed to get response'}`,
                isError: true,
                timestamp: new Date().toISOString()
            };
            window.MemoryCore.addMessageToThread(errMsg);
            window.UIRenderer.appendMessage(errMsg);
        }
    },

    showTypingIndicator() {
        const container = document.getElementById('messages-area');
        if (!container || document.getElementById('typing-indicator')) return;

        const div = document.createElement('div');
        div.id = 'typing-indicator';
        div.style.cssText = 'display:flex; justify-content:flex-start; margin-bottom:16px;';
        div.innerHTML = `
            <div style="background:#1a1a2e; border-radius:16px; padding:12px 16px; border:1px solid #6c5ce7;">
                <div style="display:flex; gap:6px;">
                    <span style="width:10px; height:10px; background:#6c5ce7; border-radius:50%; animation:pulse 1.4s infinite;"></span>
                    <span style="width:10px; height:10px; background:#6c5ce7; border-radius:50%; animation:pulse 1.4s infinite 0.3s;"></span>
                    <span style="width:10px; height:10px; background:#6c5ce7; border-radius:50%; animation:pulse 1.4s infinite 0.6s;"></span>
                </div>
            </div>
            <style>
                @keyframes pulse { 0%, 100% { opacity:0.4; transform:scale(0.8); } 50% { opacity:1; transform:scale(1.2); } }
            </style>
        `;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    },

    hideTypingIndicator() {
        const el = document.getElementById('typing-indicator');
        if (el) el.remove();
    },

    createNewThread() {
        window.MemoryCore.createThread();
        if (this.apiHandler) this.apiHandler.resetConversation();
        window.renderMessages();
        window.updateThreadsList();
    },

    loadThread(threadId) {
        const thread = window.MemoryCore.switchThread(threadId);
        if (thread && this.apiHandler.activeClient?.setCurrentResponseId) {
            this.apiHandler.activeClient.setCurrentResponseId(
                thread.responseChain?.slice(-1)[0] || null
            );
        }
        window.renderMessages();
        window.updateThreadsList();
    },

    clearCurrentThread() {
        if (confirm('Clear this thread? All messages will be removed.')) {
            window.MemoryCore.clearCurrentThread();
            if (this.apiHandler) this.apiHandler.resetConversation();
            window.renderMessages();
            window.updateThreadsList();
        }
    }
};

// Global bindings (updated to pass options)
window.sendUserMessage = (msg, options) => window.MemoryFabric.sendMessage(msg, options);

window.createNewThread = () => {
    window.MemoryFabric.createNewThread();
    window.closeThreadsPanel?.();
};

window.loadThread = (id) => {
    window.MemoryFabric.loadThread(id);
    window.closeThreadsPanel?.();
};

window.clearCurrentThread = () => window.MemoryFabric.clearCurrentThread();

document.addEventListener('componentsLoaded', async () => {
    await window.MemoryFabric.init();
    window.renderMessages();
    window.updateThreadsList();
});
