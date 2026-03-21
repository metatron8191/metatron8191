// js/model-clients/grok-client.js – v2.0 with streaming
class GrokClient {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.x.ai/v1';
        this.currentResponseId = null;
        this.systemPrompt = null;
    }

    setSystemPrompt(p) { this.systemPrompt = p; }
    setCurrentResponseId(id) { this.currentResponseId = id; }
    getCurrentResponseId() { return this.currentResponseId; }

    async sendMessage(message, options = {}) {
        return this._callAPI(message, { ...options, stream: false });
    }

    async sendMessageStream(message, options = {}, onChunk) {
        return this._callAPI(message, { ...options, stream: true }, onChunk);
    }

    async _callAPI(message, options, onChunk = null) {
        if (!this.apiKey) throw new Error('xAI API key missing');

        const { model = 'grok-4', temperature = 0.7, stateful = true, previousResponseId = null, stream = false } = options;

        const input = [];
        if (!previousResponseId && this.systemPrompt) input.push({ role: 'system', content: this.systemPrompt });
        input.push({ role: 'user', content: message });

        const body = {
            model,
            input,
            temperature,
            max_output_tokens: 8192,
            store: stateful
        };
        if (previousResponseId || (stateful && this.currentResponseId)) {
            body.previous_response_id = previousResponseId || this.currentResponseId;
        }
        if (stream) body.stream = true;

        const res = await fetch(`${this.baseUrl}/responses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.apiKey}` },
            body: JSON.stringify(body)
        });

        if (!res.ok) throw new Error(`API Error ${res.status}: ${await res.text()}`);

        if (!stream) {
            const data = await res.json();
            const text = data.output?.flatMap(o => o.content?.filter(c => c.type === 'output_text').map(c => c.text) || []).join('') || '';
            if (stateful && data.id) this.currentResponseId = data.id;
            return { text, responseId: data.id, stored: true };
        }

        // === STREAMING ===
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullText = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split('\n');
            buffer = lines.pop();

            for (const line of lines) {
                if (!line.trim() || !line.startsWith('data: ')) continue;
                const jsonStr = line.slice(6);
                if (jsonStr === '[DONE]') continue;

                try {
                    const event = JSON.parse(jsonStr);
                    const delta = event?.output?.[0]?.content?.[0]?.text_delta || 
                                 event?.delta?.text || '';
                    if (delta) {
                        fullText += delta;
                        onChunk?.(delta, fullText);
                    }
                    if (event.id && stateful) this.currentResponseId = event.id;
                } catch (e) {}
            }
        }
        return { text: fullText, responseId: this.currentResponseId, stored: true };
    }

    resetConversation() { this.currentResponseId = null; }
}

window.GrokClient = GrokClient;
