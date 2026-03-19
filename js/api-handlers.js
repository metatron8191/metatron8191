// api-handlers.js
const APIHandlers = {
    // Grok API call (Responses API)
    async callGrok(messages, tools, streamingEnabled, previousResponseId, xaiApiKey) {
        const response = await fetch('https://api.x.ai/v1/responses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${xaiApiKey}`
            },
            body: JSON.stringify({
                model: 'grok-4-1-fast-reasoning',
                input: messages,
                tools: tools.length ? tools : undefined,
                previous_response_id: previousResponseId,
                store: true,
                temperature: 0.7,
                max_output_tokens: 2000,
                stream: streamingEnabled
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || `API error: ${response.status}`);
        }

        return response;
    },

    // DeepSeek API call
    async callDeepSeek(model, messages, tools, streamingEnabled, deepseekApiKey) {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${deepseekApiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                tools: tools.length ? tools : undefined,
                temperature: 0.7,
                max_tokens: 2000,
                stream: streamingEnabled
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || `API error: ${response.status}`);
        }

        return response;
    },

    // Image generation
    async generateImage(prompt, xaiApiKey) {
        const response = await fetch('https://api.x.ai/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${xaiApiKey}`
            },
            body: JSON.stringify({
                model: 'grok-2-image-1212',
                prompt: prompt,
                n: 1,
                size: '1024x1024'
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || `Image gen failed: ${response.status}`);
        }

        const data = await response.json();
        return data.data[0].url;
    },

    // Parse Grok response
    parseGrokResponse(data) {
        if (!data || !data.output || !Array.isArray(data.output)) {
            throw new Error('Invalid API response structure');
        }

        const messageItem = data.output.find(item => item.type === 'message');
        if (!messageItem || !messageItem.content) {
            return '[No message content]';
        }

        const textItem = messageItem.content.find(c => c.type === 'output_text');
        return textItem?.text || JSON.stringify(messageItem.content);
    },

    // Parse DeepSeek response
    parseDeepSeekResponse(data) {
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Invalid API response structure');
        }
        return {
            content: data.choices[0].message.content || '[Empty response]',
            reasoning: data.choices[0].message.reasoning
        };
    }
};

window.APIHandlers = APIHandlers;
