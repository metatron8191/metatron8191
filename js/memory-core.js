// js/memory-core.js – v2.0
window.MemoryCore = {
    state: {
        threads: [],
        currentThreadId: null,
        currentResponseId: null,
        settings: { temperature: 0.7, model: 'grok-4', stateful: true }
    },

    init() {
        this.loadFromStorage();
        console.log('🧠 Memory Core v2.0 initialized');
    },

    loadFromStorage() {
        const saved = localStorage.getItem('lilareyon_threads');
        if (saved) this.state.threads = JSON.parse(saved);
        
        const settings = localStorage.getItem('lilareyon_settings');
        if (settings) this.state.settings = { ...this.state.settings, ...JSON.parse(settings) };
    },

    saveToStorage() {
        localStorage.setItem('lilareyon_threads', JSON.stringify(this.state.threads));
        localStorage.setItem('lilareyon_settings', JSON.stringify(this.state.settings));
    },

    createThread(title = 'New Thread') {
        const thread = {
            id: 'thread_' + Date.now(),
            title,
            preview: 'Empty thread',
            createdAt: new Date().toISOString(),
            messages: [],
            responseChain: [],
            settings: { ...this.state.settings } // per-thread override
        };
        this.state.threads.unshift(thread);
        this.state.currentThreadId = thread.id;
        this.state.currentResponseId = null;
        this.saveToStorage();
        return thread;
    },

    getCurrentThread() {
        return this.state.threads.find(t => t.id === this.state.currentThreadId);
    },

    addMessageToThread(message) {
        const thread = this.getCurrentThread();
        if (thread) {
            thread.messages.push(message);
            thread.preview = message.content?.substring(0, 60) || 'Empty';
            this.saveToStorage();
        }
    },

    setCurrentResponseId(id) {
        this.state.currentResponseId = id;
        const thread = this.getCurrentThread();
        if (thread && id) thread.responseChain.push(id);
        this.saveToStorage();
    },

    switchThread(threadId) {
        const thread = this.state.threads.find(t => t.id === threadId);
        if (thread) {
            this.state.currentThreadId = threadId;
            this.state.currentResponseId = thread.responseChain[thread.responseChain.length - 1] || null;
            this.saveToStorage();
            return thread;
        }
        return null;
    },

    clearCurrentThread() {
        const thread = this.getCurrentThread();
        if (thread) {
            thread.messages = [];
            thread.responseChain = [];
            thread.preview = 'Empty thread';
            this.state.currentResponseId = null;
            this.saveToStorage();
        }
    },

    updateSettings(settings, threadOnly = false) {
        if (!threadOnly) this.state.settings = { ...this.state.settings, ...settings };
        const thread = this.getCurrentThread();
        if (thread) thread.settings = { ...thread.settings, ...settings };
        this.saveToStorage();
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.MemoryCore.init());
} else window.MemoryCore.init();
