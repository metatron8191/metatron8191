class AurelianMemory {
    constructor() {
        this.L1_KEY = 'aurelian_working';
        this.L2_KEY = 'aurelian_active';
        this.working = JSON.parse(sessionStorage.getItem(this.L1_KEY)) || [];
        this.active = JSON.parse(localStorage.getItem(this.L2_KEY)) || [];
        this.sortActive();
    }

    addWorking(content, role = 'user', attachments = []) {
        const msg = {
            id: crypto.randomUUID(),
            role,
            content,
            attachments,
            ts: Date.now(),
            time: new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            }),
            reasoning: null,
            model: null
        };
        this.working.push(msg);
        this.persistWorking();
        return msg;
    }

    persistWorking() {
        sessionStorage.setItem(this.L1_KEY, JSON.stringify(this.working));
    }

    clearWorking() {
        this.working = [];
        this.persistWorking();
    }

    addActive(content, attachments = [], meta = {}) {
        const mem = {
            id: crypto.randomUUID(),
            content,
            attachments,
            freq: 1,
            last: Date.now(),
            created: Date.now(),
            meta
        };
        this.active.push(mem);
        this.sortActive();
        this.trimActive();
        this.persistActive();
        return mem;
    }

    accessActive(id) {
        const mem = this.active.find(m => m.id === id);
        if (mem) {
            mem.freq++;
            mem.last = Date.now();
            this.sortActive();
            this.persistActive();
        }
        return mem;
    }

    sortActive() {
        this.active.sort((a, b) => b.freq - a.freq || b.last - a.last);
    }

    trimActive() {
        if (this.active.length > 100) {
            this.active = this.active.slice(0, 100);
        }
    }

    persistActive() {
        localStorage.setItem(this.L2_KEY, JSON.stringify(this.active));
    }

    getTopActive(n = 8) {
        return this.active.slice(0, n);
    }

    buildContext() {
        const top = this.getTopActive(3);
        const recent = this.working.slice(-2);
        let ctx = '=== MEMORY CONTEXT ===\n';
        if (top.length) {
            ctx += 'FREQUENT:\n';
            top.forEach(m => ctx += `- [${m.freq}x] ${m.content.substring(0, 100)}\n`);
        }
        if (recent.length) {
            ctx += '\nRECENT:\n';
            recent.forEach(m => ctx += `- ${m.role}: ${m.content.substring(0, 100)}\n`);
        }
        return ctx;
    }
}

window.AurelianMemory = AurelianMemory;
