

class DeepSeekClient {
    constructor(apiKey, fabric) {
        this.apiKey = apiKey;
        this.fabric = fabric;
    }

    async sendMessage(userMessage, options = {}) {
        if (!this.apiKey) throw new Error('DeepSeek API key not set');

        await this.fabric.addMemory(userMessage, 'user', 'deepseek', options.metadata);

        const context = await this.fabric.buildContext('deepseek', true, 20);
        const systemPrompt = `You are DeepSeek, part of the Lilareyon Noetic Fabric. You have access to shared memory across models. Here is the recent conversation context:\n${context}\n\nRespond naturally, aware that other models (Grok, Claude) may later see your response.`;

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
        ];

        const response = await APIHandlers.callDeepSeek('deepseek-chat', messages, [], false, this.apiKey, {});
        const data = await response.json();
        const result = APIHandlers.parseDeepSeekResponse(data);

        await this.fabric.addMemory(result.content, 'assistant', 'deepseek', { model: 'deepseek-chat', reasoning: result.reasoning });

        return result.content;
    }
}

window.DeepSeekClient = DeepSeekClient;
