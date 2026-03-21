// js/model-clients/claude-client.js

class ClaudeClient {
    constructor(apiKey, fabric) {
        this.apiKey = apiKey;
        this.fabric = fabric;
    }

    async sendMessage(userMessage, options = {}) {
        if (!this.apiKey) throw new Error('Anthropic API key not set');

        await this.fabric.addMemory(userMessage, 'user', 'claude', options.metadata);

        const context = await this.fabric.buildContext('claude', true, 20);
        const systemPrompt = `You are Claude, part of the Lilareyon Noetic Fabric. You have access to shared memory across models. Here is the recent conversation context:\n${context}\n\nRespond naturally, aware that other models (Grok, DeepSeek) may later see your response.`;

        // Using fetch to Anthropic API (you can reuse APIHandlers if extended)
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': this.apiKey,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                model: 'claude-3-opus-20240229',
                system: systemPrompt,
                messages: [{ role: 'user', content: userMessage }],
                max_tokens: 2000
            })
        });
        const data = await response.json();
        const reply = data.content[0].text;

        await this.fabric.addMemory(reply, 'assistant', 'claude', { model: 'claude-3-opus' });

        return reply;
    }
}

window.ClaudeClient = ClaudeClient;
