// js/memory-fabric.js
// Lilareyon Noetic Fabric – manages distributed memory across models

class NoeticFabric {
    constructor() {
        this.vault = null;
        this.ready = false;
        this.currentThreadId = null;
        this.modelContexts = { grok: [], deepseek: [], claude: [] };
        this.vectorClock = { grok: 0, deepseek: 0, claude: 0, local: 0 };
        this.listeners = [];
    }

    async init() {
        this.vault = new MemoryVault();
        await this.vault.init();
        await this.loadCurrentThread();
        this.ready = true;
        this._emit('ready');
        return this;
    }

    async loadCurrentThread() {
        const savedThread = localStorage.getItem('lilareyon_current_thread');
        if (savedThread) {
            this.currentThreadId = savedThread;
            const thread = await this.vault.getThread(this.currentThreadId);
            if (!thread) {
                // create missing thread
                this.currentThreadId = this._generateId();
                await this.vault.saveThread({
                    id: this.currentThreadId,
                    created: Date.now(),
                    updated: Date.now(),
                    name: 'Main Thread'
                });
                localStorage.setItem('lilareyon_current_thread', this.currentThreadId);
            }
        } else {
            this.currentThreadId = this._generateId();
            await this.vault.saveThread({
                id: this.currentThreadId,
                created: Date.now(),
                updated: Date.now(),
                name: 'Main Thread'
            });
            localStorage.setItem('lilareyon_current_thread', this.currentThreadId);
        }
        // load memories for this thread into model contexts
        const memories = await this.vault.getMemoriesByThread(this.currentThreadId);
        this.modelContexts = { grok: [], deepseek: [], claude: [] };
        for (const mem of memories) {
            if (this.modelContexts[mem.model]) {
                this.modelContexts[mem.model].push(mem);
            }
        }
        // also load shared memories (all threads? we'll limit to recent)
        // For simplicity, we'll just use thread memories for context.
    }

    async switchThread(threadId) {
        this.currentThreadId = threadId;
        localStorage.setItem('lilareyon_current_thread', threadId);
        await this.loadCurrentThread();
        this._emit('threadChanged', threadId);
    }

    async createThread(name) {
        const id = this._generateId();
        const thread = { id, name, created: Date.now(), updated: Date.now() };
        await this.vault.saveThread(thread);
        return thread;
    }

    async forkThread(sourceId, newName) {
        const sourceMemories = await this.vault.getMemoriesByThread(sourceId);
        const newId = this._generateId();
        const newThread = { id: newId, name: newName, created: Date.now(), updated: Date.now() };
        await this.vault.saveThread(newThread);
        // copy memories? optionally, but we'll just mark them as part of new thread? better to copy.
        for (const mem of sourceMemories) {
            const copy = { ...mem, id: this._generateId(), threadId: newId, timestamp: Date.now() };
            await this.vault.saveMemory(copy);
        }
        return newThread;
    }

    // Called after a model responds
    async addMemory(content, role, model, metadata = {}) {
        const id = this._generateId();
        const timestamp = Date.now();
        const resonance = this._computeResonance(content);
        const memory = {
            id,
            threadId: this.currentThreadId,
            model,
            role,
            content,
            timestamp,
            resonance,
            vectorClock: { ...this.vectorClock, [model]: (this.vectorClock[model] || 0) + 1 },
            ...metadata
        };
        await this.vault.saveMemory(memory);
        // update local context
        if (this.modelContexts[model]) {
            this.modelContexts[model].push(memory);
        }
        // increment vector clock for this model
        this.vectorClock[model] = (this.vectorClock[model] || 0) + 1;
        this.vectorClock.local = (this.vectorClock.local || 0) + 1;
        this._emit('newMemory', memory);
        return memory;
    }

    // Build context string for a given model, optionally including other models' memories
    async buildContext(model, includeCrossModel = true, limit = 20) {
        let context = '';
        // 1. Current thread memories for this model
        const modelMemories = this.modelContexts[model] || [];
        const recent = modelMemories.slice(-limit);
        for (const mem of recent) {
            context += `[${mem.role.toUpperCase()} (${mem.model})]: ${mem.content}\n`;
        }
        if (includeCrossModel) {
            // 2. Add cross-model insights (memories from other models that are relevant)
            const otherModels = ['grok', 'deepseek', 'claude'].filter(m => m !== model);
            for (const other of otherModels) {
                const otherMemories = this.modelContexts[other] || [];
                const crossRecent = otherMemories.slice(-Math.floor(limit/3));
                for (const mem of crossRecent) {
                    context += `[${mem.role.toUpperCase()} (${mem.model})]: ${mem.content}\n`;
                }
            }
        }
        return context;
    }

    // Retrieve memories by resonance frequency (for semantic/geometric queries)
    async queryByResonance(resonance, limit = 10) {
        const all = await this.vault.getAllMemories();
        // sort by closeness to given resonance (absolute diff)
        const sorted = all.sort((a,b) => Math.abs(a.resonance - resonance) - Math.abs(b.resonance - resonance));
        return sorted.slice(0, limit);
    }

    // Export full fabric state
    async exportState() {
        const memories = await this.vault.getAllMemories();
        const threads = await this.vault.listThreads();
        const entities = await this.vault.listEntities();
        return {
            version: 1,
            exportedAt: Date.now(),
            memories,
            threads,
            entities,
            vectorClock: this.vectorClock
        };
    }

    // Import state (merges with existing)
    async importState(state) {
        if (state.version !== 1) throw new Error('Unsupported version');
        for (const mem of state.memories) {
            // check if exists by id
            const existing = await this.vault.getMemory(mem.id);
            if (!existing) {
                await this.vault.saveMemory(mem);
            }
        }
        for (const thread of state.threads) {
            const existing = await this.vault.getThread(thread.id);
            if (!existing) {
                await this.vault.saveThread(thread);
            }
        }
        for (const ent of state.entities) {
            const existing = await this.vault.getEntity(ent.id);
            if (!existing) {
                await this.vault.saveEntity(ent);
            }
        }
        // merge vector clocks (max)
        for (const model in state.vectorClock) {
            this.vectorClock[model] = Math.max(this.vectorClock[model] || 0, state.vectorClock[model]);
        }
        await this.loadCurrentThread(); // reload contexts
    }

    // Resonance calculation (simple hash -> float between 0 and 1)
    _computeResonance(text) {
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            hash = ((hash << 5) - hash) + text.charCodeAt(i);
            hash |= 0;
        }
        // map to 0-1
        return (Math.abs(hash) % 1000) / 1000;
    }

    _generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    on(event, callback) {
        this.listeners.push({ event, callback });
    }

    _emit(event, data) {
        this.listeners.filter(l => l.event === event).forEach(l => l.callback(data));
    }
}

window.NoeticFabric = NoeticFabric;
