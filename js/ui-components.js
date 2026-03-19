const UIRenderer = {
    messagesArea: null,
    msgInput: null,
    memory: null,

    init(memoryInstance) {
        this.messagesArea = document.getElementById('messages-area');
        this.msgInput = document.getElementById('message-input');
        this.memory = memoryInstance;
    },

    escapeHtml(unsafe) {
        return unsafe.replace(/[&<>"]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            if (m === '"') return '&quot;';
            return m;
        });
    },

    renderMessages() {
        if (!this.messagesArea || !this.memory) return;

        this.messagesArea.innerHTML = '';
        this.memory.working.forEach(msg => {
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
                html += `<div class="message-content">${this.escapeHtml(msg.content)}</div>`;
            }

            if (msg.reasoning) {
                html += `
                    <div class="reasoning-toggle" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none'">
                        🧠 Toggle reasoning ▼
                    </div>
                    <div class="reasoning-block" style="display: none;">${this.escapeHtml(msg.reasoning)}</div>
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
            this.messagesArea.appendChild(div);
        });

        // Attach save button handlers
        document.querySelectorAll('.save-button').forEach(btn => {
            btn.onclick = (e) => {
                const id = e.target.dataset.id;
                const msg = this.memory.working.find(m => m.id === id);
                if (msg) {
                    this.memory.addActive(`${msg.role}: ${msg.content}`, msg.attachments);
                    this.updateMemoryPanels();
                    const chainCount = document.getElementById('chainCount');
                    if (chainCount) chainCount.textContent = this.memory.active.length;
                }
            };
        });

        this.messagesArea.scrollTop = this.messagesArea.scrollHeight;
    },

    updateMemoryPanels() {
        const activeList = document.getElementById('active-memory-list');
        const workingList = document.getElementById('working-memory-list');
        if (!activeList || !workingList || !this.memory) return;

        activeList.innerHTML = '';
        this.memory.getTopActive(8).forEach(m => {
            const d = document.createElement('div');
            d.className = 'memory-item';
            d.onclick = () => {
                if (this.msgInput) this.msgInput.value = m.content;
            };
            d.innerHTML = `
                <span class="memory-freq">${m.freq}x</span>
                <span class="memory-preview">${this.escapeHtml(m.content.substring(0, 40))}</span>
            `;
            activeList.appendChild(d);
        });

        workingList.innerHTML = '';
        this.memory.working.slice(-5).reverse().forEach(m => {
            const d = document.createElement('div');
            d.className = 'memory-item';
            d.innerHTML = `
                <span style="color:#0a84ff; min-width:35px;">${m.role}</span>
                <span class="memory-preview">${this.escapeHtml(m.content.substring(0, 30))}</span>
            `;
            workingList.appendChild(d);
        });
    },

    showTemporaryStatus(elementId, message) {
        const el = document.getElementById(elementId);
        if (el) {
            el.textContent = message;
            setTimeout(() => { el.textContent = ''; }, 2000);
        }
    }
};

window.UIRenderer = UIRenderer;
