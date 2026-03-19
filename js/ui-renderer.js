const UIRenderer = {
    memory: null,

    init(memoryInstance) {
        this.memory = memoryInstance;
    },

    renderMessages() {
        const area = document.getElementById('messages-area');
        if (!area || !this.memory) return;

        area.innerHTML = '';
        
        this.memory.working.forEach(msg => {
            const container = document.createElement('div');
            container.className = 'message-container';
            container.setAttribute('data-role', msg.role);
            if (msg.id) container.id = `msg-${msg.id}`;

            // Header
            const header = document.createElement('div');
            header.className = 'message-header';
            
            const roleSpan = document.createElement('span');
            roleSpan.className = 'message-role';
            roleSpan.textContent = msg.role === 'user' ? 'YOU' : 
                                  msg.role === 'assistant' ? 'AURELIAN' : 'SYSTEM';
            
            const timeSpan = document.createElement('span');
            timeSpan.className = 'message-time';
            timeSpan.textContent = msg.time || new Date().toLocaleTimeString();
            
            if (msg.model) {
                const modelSpan = document.createElement('span');
                modelSpan.style.color = '#0a84ff';
                modelSpan.style.marginLeft = '8px';
                modelSpan.textContent = msg.model.includes('grok') ? '🤖' : '🔮';
                header.appendChild(modelSpan);
            }
            
            header.appendChild(roleSpan);
            header.appendChild(timeSpan);
            
            // Content
            const content = document.createElement('div');
            content.className = 'message-content';
            
            if (msg.role === 'assistant' && msg.content.startsWith('http') && msg.attachments?.some(a => a.name === 'generated_image')) {
                const img = document.createElement('img');
                img.src = msg.content;
                img.style.maxWidth = '100%';
                img.style.borderRadius = '8px';
                content.appendChild(img);
            } else {
                content.textContent = msg.content;
            }
            
            container.appendChild(header);
            container.appendChild(content);
            
            // Attachments
            if (msg.attachments && msg.attachments.length > 0) {
                const attDiv = document.createElement('div');
                attDiv.className = 'message-attachments';
                attDiv.textContent = `📎 ${msg.attachments.map(a => a.name).join(', ')}`;
                container.appendChild(attDiv);
            }
            
            // Reasoning
            if (msg.reasoning) {
                const reasoning = document.createElement('div');
                reasoning.className = 'message-reasoning';
                reasoning.textContent = `🔍 ${msg.reasoning}`;
                container.appendChild(reasoning);
            }
            
            area.appendChild(container);
        });

        area.scrollTop = area.scrollHeight;
    },

    updateMemoryPanels() {
        if (!this.memory) return;

        // Update counts
        const l1Count = document.getElementById('l1-count');
        const l2Count = document.getElementById('l2-count');
        if (l1Count) l1Count.textContent = this.memory.working.length;
        if (l2Count) l2Count.textContent = this.memory.active.length;

        // Render memory panel
        const panel = document.getElementById('memory-panel');
        if (!panel) return;

        panel.innerHTML = '<h4 style="color:#98989e; margin-bottom:8px;">FREQUENT MEMORIES</h4>';
        
        const topMemories = this.memory.getTopActive(5);
        if (topMemories.length === 0) {
            panel.innerHTML += '<p style="color:#636366; font-size:11px;">No active memories yet</p>';
            return;
        }

        const list = document.createElement('ul');
        list.className = 'memory-list';
        
        topMemories.forEach(mem => {
            const item = document.createElement('li');
            item.className = 'memory-item';
            item.innerHTML = `
                <div>${mem.content.substring(0, 60)}${mem.content.length > 60 ? '...' : ''}</div>
                <div class="memory-freq">used ${mem.freq} times</div>
            `;
            list.appendChild(item);
        });
        
        panel.appendChild(list);
    },

    showTemporaryStatus(elementId, message, duration = 2000) {
        const el = document.getElementById(elementId);
        if (!el) return;
        
        el.textContent = message;
        setTimeout(() => {
            el.textContent = '';
        }, duration);
    }
};

window.UIRenderer = UIRenderer;
