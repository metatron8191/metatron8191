// js/memory-sync.js
// Handles cross-tab sync and optional cloud sync

class MemorySync {
    constructor(fabric) {
        this.fabric = fabric;
        this.syncInterval = null;
        this.broadcastChannel = null;
        this.init();
    }

    init() {
        // Cross-tab sync using BroadcastChannel
        if (typeof BroadcastChannel !== 'undefined') {
            this.broadcastChannel = new BroadcastChannel('lilareyon_sync');
            this.broadcastChannel.onmessage = (event) => {
                if (event.data.type === 'memory_added') {
                    this.fabric.vault.saveMemory(event.data.memory);
                    this.fabric.loadCurrentThread(); // reload contexts
                }
                if (event.data.type === 'thread_switch') {
                    this.fabric.switchThread(event.data.threadId);
                }
            };
        }
    }

    startAutoSync(intervalMs = 5000) {
        if (this.syncInterval) clearInterval(this.syncInterval);
        this.syncInterval = setInterval(() => this.syncToCloud(), intervalMs);
    }

    stopAutoSync() {
        if (this.syncInterval) clearInterval(this.syncInterval);
    }

    async syncToCloud() {
        // Placeholder: implement cloud sync if desired
        // For now, just update local vector clocks
        const meta = await this.fabric.vault.getSyncMeta();
        const now = Date.now();
        await this.fabric.vault.updateSyncMeta({ ...meta, lastSync: now });
    }

    broadcastMemory(memory) {
        if (this.broadcastChannel) {
            this.broadcastChannel.postMessage({ type: 'memory_added', memory });
        }
    }

    broadcastThreadSwitch(threadId) {
        if (this.broadcastChannel) {
            this.broadcastChannel.postMessage({ type: 'thread_switch', threadId });
        }
    }
}

window.MemorySync = MemorySync;
