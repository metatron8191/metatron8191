const APIHandlers = {
    async callGrok(messages, tools, streamingEnabled, previousResponseId, xaiApiKey, params = {}) {
        const {
            maxTokens = 2000,
            temperature = 0.7,
            topP = 0.9
        } = params;

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
                temperature,
                top_p: topP,
                max_output_tokens: maxTokens,
                stream: streamingEnabled
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || `API error: ${response.status}`);
        }

        return response;
    },

    async callDeepSeek(model, messages, tools, streamingEnabled, deepseekApiKey, params = {}) {
        const {
            maxTokens = 2000,
            temperature = 0.7,
            topP = 0.9,
            topK = 40,
            repetitionPenalty = 1.1
        } = params;

        // DeepSeek uses frequency_penalty (0-2) which is (repetitionPenalty - 1)
        const frequencyPenalty = Math.min(2, Math.max(0, repetitionPenalty - 1));
        
        const body = {
            model: model,
            messages: messages,
            tools: tools.length ? tools : undefined,
            temperature,
            top_p: topP,
            max_tokens: maxTokens,
            frequency_penalty: frequencyPenalty,
            stream: streamingEnabled
        };

        // Only add top_k if supported and non-zero
        if (topK > 0) {
            body.top_k = topK;
        }

        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${deepseekApiKey}`
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || `API error: ${response.status}`);
        }

        return response;
    },

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
