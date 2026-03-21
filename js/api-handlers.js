// js/api-handlers.js – v2.0
class APIHandler {
    constructor() {
        this.activeClient = null;
        this.currentModel = 'grok';
        this.apiKeys = { grok: localStorage.getItem('lilareyon_api_key_grok') || '' };
        this.systemPrompt = localStorage.getItem('lilareyon_system_prompt') || 'You are Lilareyon...';
        this.initializeClient();
    }

    initializeClient() {
        if (this.currentModel === 'grok' && window.GrokClient) {
            this.activeClient = new window.GrokClient(this.apiKeys.grok);
            this.activeClient.setSystemPrompt(this.systemPrompt);
        }
    }

    setModel(m) { this.currentModel = m; this.initializeClient(); }
    setApiKey(model, key) {
        this.apiKeys[model] = key;
        localStorage.setItem(`lilareyon_api_key_${model}`, key);
        if (model === this.currentModel) this.initializeClient();
    }

    async sendMessage(msg, opts = {}) {
        return this.activeClient.sendMessage(msg, opts);
    }

    getCurrentResponseId() {
        return this.activeClient?.getCurrentResponseId?.() || null;
    }

    resetConversation() { this.activeClient?.resetConversation?.(); }
}

window.APIHandler = APIHandler;
