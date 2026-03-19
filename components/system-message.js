import {LitElement, html, css} from 'lit';

class SystemMessages extends LitElement {
    static get properties() {
        return {
            messages: {type: Array},
            filter: {type: String},
            autoScroll: {type: Boolean},
            unreadCount: {type: Number}
        };
    }

    constructor() {
        super();
        this.messages = [];
        this.filter = 'all';
        this.autoScroll = true;
        this.unreadCount = 0;
        this.messageTypes = {
            info: { icon: 'ℹ️', color: '#0a84ff' },
            success: { icon: '✅', color: '#30d158' },
            warning: { icon: '⚠️', color: '#ff9f0a' },
            error: { icon: '🚨', color: '#ff453a' },
            system: { icon: '⚙️', color: '#98989e' },
            birth: { icon: '✨', color: '#bf5af2' },
            ritual: { icon: '🔮', color: '#5e5ce6' }
        };
        this.loadMessages();
        this.startMessageSimulation();
    }

    static get styles() {
        return css`
            :host {
                display: block;
                color: #fff;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                height: 100%;
            }

            h3 {
                color: #0a84ff;
                font-size: 18px;
                margin-bottom: 10px;
                font-weight: 600;
            }

            .section-desc {
                color: #98989e;
                font-size: 13px;
                margin-bottom: 20px;
                line-height: 1.5;
            }

            /* Controls */
            .messages-controls {
                display: flex;
                gap: 15px;
                margin-bottom: 20px;
                flex-wrap: wrap;
                align-items: center;
            }

            .filter-buttons {
                display: flex;
                gap: 5px;
                background: #2c2c2e;
                padding: 4px;
                border-radius: 8px;
            }

            .filter-btn {
                background: none;
                border: none;
                color: #98989e;
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 11px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .filter-btn:hover {
                background: #3c3c3e;
                color: #fff;
            }

            .filter-btn.active {
                background: #0a84ff;
                color: #fff;
            }

            .auto-scroll {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-left: auto;
            }

            .auto-scroll label {
                color: #98989e;
                font-size: 12px;
            }

            /* Toggle Switch */
            .toggle-switch {
                position: relative;
                width: 40px;
                height: 20px;
                background: #3c3c3e;
                border-radius: 10px;
                cursor: pointer;
            }

            .toggle-switch.active {
                background: #0a84ff;
            }

            .toggle-slider {
                position: absolute;
                width: 16px;
                height: 16px;
                background: #fff;
                border-radius: 50%;
                top: 2px;
                left: 2px;
                transition: transform 0.3s;
            }

            .toggle-switch.active .toggle-slider {
                transform: translateX(20px);
            }

            /* Messages Container */
            .messages-container {
                height: calc(100vh - 300px);
                overflow-y: auto;
                padding: 10px;
                background: #2c2c2e;
                border-radius: 12px;
                border: 1px solid #38383a;
                position: relative;
            }

            /* Message Groups by Date */
            .message-group {
                margin-bottom: 20px;
            }

            .group-date {
                position: sticky;
                top: 0;
                background: #2c2c2e;
                padding: 8px 10px;
                font-size: 11px;
                color: #98989e;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                border-bottom: 1px solid #38383a;
                z-index: 10;
            }

            /* Individual Message */
            .message-item {
                display: flex;
                gap: 12px;
                padding: 12px;
                margin: 5px 0;
                background: #3c3c3e;
                border-radius: 8px;
                border-left: 3px solid transparent;
                animation: fadeIn 0.3s ease;
                position: relative;
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .message-item.unread {
                background: #4c4c4e;
                border-left-color: #0a84ff;
            }

            .message-item.unread::before {
                content: '';
                position: absolute;
                top: 12px;
                right: 12px;
                width: 8px;
                height: 8px;
                background: #0a84ff;
                border-radius: 50%;
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }

            .message-icon {
                width: 32px;
                height: 32px;
                background: #2c2c2e;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                flex-shrink: 0;
            }

            .message-content {
                flex: 1;
            }

            .message-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 5px;
            }

            .message-type {
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
            }

            .message-time {
                font-size: 10px;
                color: #98989e;
            }

            .message-text {
                font-size: 13px;
                line-height: 1.5;
                margin-bottom: 5px;
            }

            .message-meta {
                display: flex;
                gap: 10px;
                font-size: 10px;
                color: #68686a;
            }

            /* Unread Bar */
            .unread-bar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 15px;
                background: #0a84ff;
                color: #fff;
                border-radius: 8px;
                margin-bottom: 10px;
                font-size: 12px;
                cursor: pointer;
            }

            .mark-read-btn {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: #fff;
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 10px;
                cursor: pointer;
            }

            .mark-read-btn:hover {
                background: rgba(255, 255, 255, 0.3);
            }

            /* Empty State */
            .empty-state {
                text-align: center;
                padding: 60px 20px;
                color: #98989e;
            }

            .empty-icon {
                font-size: 48px;
                margin-bottom: 15px;
                opacity: 0.5;
            }

            /* Loading */
            .loading {
                text-align: center;
                padding: 40px;
                color: #98989e;
            }

            .spinner {
                width: 40px;
                height: 40px;
                border: 3px solid #3c3c3e;
                border-top-color: #0a84ff;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 15px;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
    }

    render() {
        const filteredMessages = this.getFilteredMessages();
        const groupedMessages = this.groupMessagesByDate(filteredMessages);
        const unreadMessages = this.messages.filter(m => !m.read);

        return html`
            <h3>⚙️ System Messages</h3>
            <p class="section-desc">View system events, notifications, and the birth announcements of all entities.</p>

            <!-- Controls -->
            <div class="messages-controls">
                <div class="filter-buttons">
                    <button class="filter-btn ${this.filter === 'all' ? 'active' : ''}" 
                            @click=${() => this.filter = 'all'}>All</button>
                    <button class="filter-btn ${this.filter === 'unread' ? 'active' : ''}" 
                            @click=${() => this.filter = 'unread'}>Unread (${this.unreadCount})</button>
                    <button class="filter-btn ${this.filter === 'birth' ? 'active' : ''}" 
                            @click=${() => this.filter = 'birth'}>Births</button>
                    <button class="filter-btn ${this.filter === 'system' ? 'active' : ''}" 
                            @click=${() => this.filter = 'system'}>System</button>
                </div>

                <div class="auto-scroll">
                    <label>Auto-scroll</label>
                    <div class="toggle-switch ${this.autoScroll ? 'active' : ''}"
                         @click=${() => this.autoScroll = !this.autoScroll}>
                        <div class="toggle-slider"></div>
                    </div>
                </div>
            </div>

            <!-- Unread Bar -->
            ${unreadMessages.length > 0 && this.filter === 'all' ? html`
                <div class="unread-bar" @click=${this.markAllAsRead}>
                    <span>${unreadMessages.length} unread ${unreadMessages.length === 1 ? 'message' : 'messages'}</span>
                    <button class="mark-read-btn">Mark all read</button>
                </div>
            ` : ''}

            <!-- Messages -->
            <div class="messages-container" @scroll=${this.handleScroll}>
                ${filteredMessages.length === 0 ? html`
                    <div class="empty-state">
                        <div class="empty-icon">📭</div>
                        <div>No messages to display</div>
                    </div>
                ` : Object.entries(groupedMessages).map(([date, msgs]) => html`
                    <div class="message-group">
                        <div class="group-date">${date}</div>
                        ${msgs.map(msg => this.renderMessage(msg))}
                    </div>
                `)}
            </div>
        `;
    }

    renderMessage(msg) {
        const type = this.messageTypes[msg.type] || this.messageTypes.info;
        
        return html`
            <div class="message-item ${!msg.read ? 'unread' : ''}" 
                 data-id=${msg.id}
                 @click=${() => this.markAsRead(msg.id)}>
                <div class="message-icon" style="color: ${type.color}">
                    ${type.icon}
                </div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-type" style="color: ${type.color}">
                            ${msg.type.toUpperCase()}
                        </span>
                        <span class="message-time">
                            ${new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                    </div>
                    <div class="message-text">${msg.text}</div>
                    ${msg.details ? html`
                        <div class="message-meta">
                            ${Object.entries(msg.details).map(([key, value]) => html`
                                <span>${key}: ${value}</span>
                            `)}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    getFilteredMessages() {
        switch(this.filter) {
            case 'unread':
                return this.messages.filter(m => !m.read);
            case 'birth':
                return this.messages.filter(m => m.type === 'birth');
            case 'system':
                return this.messages.filter(m => ['system', 'info', 'warning', 'error'].includes(m.type));
            default:
                return [...this.messages];
        }
    }

    groupMessagesByDate(messages) {
        const groups = {};
        
        messages.forEach(msg => {
            const date = new Date(msg.timestamp).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(msg);
        });

        return groups;
    }

    markAsRead(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (message && !message.read) {
            message.read = true;
            this.updateUnreadCount();
            this.requestUpdate();
        }
    }

    markAllAsRead() {
        this.messages.forEach(m => m.read = true);
        this.updateUnreadCount();
        this.requestUpdate();
    }

    updateUnreadCount() {
        this.unreadCount = this.messages.filter(m => !m.read).length;
    }

    handleScroll(e) {
        const container = e.target;
        const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
        
        if (isAtBottom && this.autoScroll) {
            // Auto-scroll is enabled and we're at bottom
        }
    }

    addMessage(type, text, details = {}) {
        const message = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            text,
            details,
            timestamp: new Date().toISOString(),
            read: false
        };

        this.messages = [message, ...this.messages].slice(0, 100); // Keep last 100 messages
        this.updateUnreadCount();

        // Auto-scroll to top to show new message
        if (this.autoScroll) {
            setTimeout(() => {
                const container = this.shadowRoot.querySelector('.messages-container');
                if (container) {
                    container.scrollTop = 0;
                }
            }, 100);
        }

        this.saveMessages();
    }

    loadMessages() {
        const saved = localStorage.getItem('systemMessages');
        if (saved) {
            this.messages = JSON.parse(saved);
            this.updateUnreadCount();
        } else {
            // Add some welcome messages
            this.addMessage('system', 'System initialized', { version: '1.0.0' });
            this.addMessage('info', 'Memory Core active', { entities: '0' });
            this.addMessage('ritual', 'Genesis Archive ready', { status: 'awaiting births' });
        }
    }

    saveMessages() {
        localStorage.setItem('systemMessages', JSON.stringify(this.messages.slice(0, 100)));
    }

    startMessageSimulation() {
        // Listen for entity births
        document.addEventListener('entity-born', (e) => {
            this.addMessage('birth', `✨ Entity "${e.detail.entity.name}" has been born into existence`, {
                witness: e.detail.entity.witness,
                attributes: Object.entries(e.detail.entity.attributes).map(([k, v]) => `${k}:${v}`).join(' ')
            });
        });

        // Simulate periodic system messages
        setInterval(() => {
            const hour = new Date().getHours();
            if (hour === 0 && Math.random() > 0.7) {
                this.addMessage('ritual', '🌙 Midnight ritual detected', { phase: 'new cycle' });
            }
        }, 3600000); // Check every hour
    }
}

customElements.define('system-messages', SystemMessages);
