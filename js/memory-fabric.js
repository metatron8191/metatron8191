// js/memory-fabric.js – v2.0 with streaming
window.MemoryFabric = {
    apiHandler: null,
    currentStreamingElement: null,

    async init() {
        this.apiHandler = new window.APIHandler();
        const settings = window.MemoryCore.getSettings();
        if (settings.model) this.apiHandler.setModel(settings.model);
        console.log('🧵 Memory Fabric v2.0 ready');
    },

    async sendMessage(userMessage) {
        let thread = window.MemoryCore.getCurrentThread();
        if (!thread) thread = window.MemoryCore.createThread('Conversation');

        const userMsg = { role: 'user', content: userMessage, timestamp: new Date().toISOString() };
        window.MemoryCore.addMessageToThread(userMsg);
        window.UIRenderer.appendMessage(userMsg);

        this.showTypingIndicator();

        try {
            const settings = thread.settings || window.MemoryCore.state.settings;
            const prevId = window.MemoryCore.state.currentResponseId;

            const result = await this.apiHandler.sendMessage(userMessage, {
                model: settings.model,
                temperature: settings.temperature,
                stateful: settings.stateful,
                previousResponseId: prevId,
                stream: true
            });

            this.hideTypingIndicator();

            // Live streaming
            const assistantDiv = window.UIRenderer.appendMessage({ role: 'assistant', content: '' }, true);
            this.currentStreamingElement = assistantDiv;

            const fullText = await new Promise(resolve => {
                this.apiHandler.activeClient.sendMessageStream(userMessage, {
                    model: settings.model,
                    temperature: settings.temperature,
                    stateful: settings.stateful,
                    previousResponseId: prevId
                }, (delta, full) => {
                    window.UIRenderer.updateStreamingContent(assistantDiv, full);
                    resolve(full);
                });
            });

            const assistantMsg = {
                role: 'assistant',
                content: fullText,
                responseId: this.apiHandler.getCurrentResponseId(),
                timestamp: new Date().toISOString()
            };

            window.MemoryCore.addMessageToThread(assistantMsg);
            window.MemoryCore.setCurrentResponseId(assistantMsg.responseId);

            window.renderMessages();
            window.updateThreadsList();
            return assistantMsg;

        } catch (e) {
            this.hideTypingIndicator();
            const errMsg = { role: 'assistant', content: `⚠️ ${e.message}`, isError: true };
            window.MemoryCore.addMessageToThread(errMsg);
            window.UIRenderer.appendMessage(errMsg);
        }
    },

    showTypingIndicator() { /* same as before */ },
    hideTypingIndicator() { /* same as before */ },

    createNewThread() {
        window.MemoryCore.createThread();
        if (this.apiHandler) this.apiHandler.resetConversation();
        window.renderMessages();
        window.updateThreadsList();
    },

    loadThread(threadId) {
        const thread = window.MemoryCore.switchThread(threadId);
        if (thread && this.apiHandler.activeClient?.setCurrentResponseId) {
            this.apiHandler.activeClient.setCurrentResponseId(thread.responseChain?.slice(-1)[0] || null);
        }
        window.renderMessages();
        window.updateThreadsList();
    },

    clearCurrentThread() {
        if (confirm('Clear thread?')) {
            window.MemoryCore.clearCurrentThread();
            if (this.apiHandler) this.apiHandler.resetConversation();
            window.renderMessages();
            window.updateThreadsList();
        }
    }
};

// Global bindings
window.sendUserMessage = (msg) => window.MemoryFabric.sendMessage(msg);
window.createNewThread = () => { window.MemoryFabric.createNewThread(); window.closeThreadsPanel?.(); };
window.loadThread = (id) => { window.MemoryFabric.loadThread(id); window.closeThreadsPanel?.(); };
window.clearCurrentThread = () => window.MemoryFabric.clearCurrentThread();

document.addEventListener('componentsLoaded', async () => {
    await window.MemoryFabric.init();
    window.renderMessages();
    window.updateThreadsList();
});
