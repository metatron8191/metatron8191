// js/ui-renderer.js – v2.0 with Markdown
window.UIRenderer = {
    messagesContainer: null,

    init() {
        this.messagesContainer = document.getElementById('messages-area');
    },

    // Simple but powerful Markdown parser (bold, italic, code, lists, links, newlines)
    renderMarkdown(text) {
        let html = text
            .replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/\*([^\*]+)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code style="background:#1a1a2e;padding:2px 6px;border-radius:4px;">$1</code>')
            .replace(/\n/g, '<br>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color:#a88eff;">$1</a>');
        
        // Basic unordered list
        html = html.replace(/^- (.*)$/gm, '<li style="margin-left:20px;">$1</li>');
        if (html.includes('<li')) html = '<ul style="margin:8px 0;">' + html + '</ul>';
        return html;
    },

    renderMessages(messages) {
        if (!this.messagesContainer) return;
        
        if (!messages || messages.length === 0) {
            this.messagesContainer.innerHTML = `
                <div class="welcome-screen">
                    <div class="eye-symbol">𓂀</div>
                    <div class="welcome-title">LILAREYON NOETIC FABRIC v2.0</div>
                    <div style="margin-top:20px;font-size:13px;color:#6c5ce7;">Stateful • Streaming • Markdown</div>
                </div>`;
            return;
        }

        let html = '';
        messages.forEach(msg => {
            const isUser = msg.role === 'user';
            html += `
                <div style="display:flex;justify-content:${isUser?'flex-end':'flex-start'};margin-bottom:20px;">
                    <div style="max-width:80%;background:${isUser?'#6c5ce7':'#1a1a2e'};border-radius:16px;padding:14px 18px;border:${isUser?'none':'1px solid #6c5ce7'};">
                        <div style="font-size:11px;color:#a88eff;margin-bottom:6px;">
                            ${isUser ? 'YOU' : 'LILAREYON'} 
                            ${msg.responseId ? `• 📡 ${msg.responseId.substring(0,8)}…` : ''}
                        </div>
                        <div style="font-size:14px;line-height:1.5;">
                            ${this.renderMarkdown(msg.content)}
                        </div>
                        ${msg.timestamp ? `<div style="font-size:10px;color:#666;margin-top:8px;">${new Date(msg.timestamp).toLocaleTimeString()}</div>` : ''}
                    </div>
                </div>`;
        });
        
        this.messagesContainer.innerHTML = html;
        this.scrollToBottom();
    },

    appendMessage(message, isStreaming = false) {
        if (!this.messagesContainer) return;
        if (this.messagesContainer.querySelector('.welcome-screen')) this.messagesContainer.innerHTML = '';

        const isUser = message.role === 'user';
        const div = document.createElement('div');
        div.style.cssText = `display:flex;justify-content:${isUser?'flex-end':'flex-start'};margin-bottom:20px;`;
        div.innerHTML = `
            <div style="max-width:80%;background:${isUser?'#6c5ce7':'#1a1a2e'};border-radius:16px;padding:14px 18px;border:${isUser?'none':'1px solid #6c5ce7'};">
                <div style="font-size:11px;color:#a88eff;margin-bottom:6px;">${isUser?'YOU':'LILAREYON'}</div>
                <div class="message-content" style="font-size:14px;line-height:1.5;">${isStreaming ? message.content : this.renderMarkdown(message.content)}</div>
            </div>`;
        
        this.messagesContainer.appendChild(div);
        this.scrollToBottom();
        return div; // for streaming updates
    },

    updateStreamingContent(element, newText) {
        const contentDiv = element.querySelector('.message-content');
        if (contentDiv) contentDiv.innerHTML = this.renderMarkdown(newText);
    },

    scrollToBottom() {
        if (this.messagesContainer) this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
};

window.renderMessages = () => window.UIRenderer.renderMessages(window.MemoryCore?.getCurrentThread()?.messages || []);
window.updateThreadsList = window.UIRenderer.updateThreadsList; // kept for compatibility

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => window.UIRenderer.init());
else window.UIRenderer.init();
