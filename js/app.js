// app.js - Main application logic (Genesis code removed)

document.addEventListener('DOMContentLoaded', () => {
    // Initialize core
    const memory = new AurelianMemory();
    UIRenderer.init(memory);
    
    // Make memory globally available for genesis module
    window.memory = memory;
    
    // State
    let xaiApiKey = localStorage.getItem('xai_api_key') || '';
    let deepseekApiKey = localStorage.getItem('deepseek_api_key') || '';
    let previousResponseId = null;
    
    // Tool state
    let webSearchEnabled = false;
    let xSearchEnabled = false;
    let imageGenEnabled = false;
    let streamingEnabled = false;
    
    // System messages
    let grokSystem = localStorage.getItem('grok_system') || '';
    let dsChatSystem = localStorage.getItem('ds_chat_system') || '';
    let dsReasonerSystem = localStorage.getItem('ds_reasoner_system') || '';
    let overrideSystem = localStorage.getItem('override_system') || '';
    let overrideRemaining = parseInt(localStorage.getItem('override_remaining') || '0');
    
    // File state
    let pendingFiles = [];
    let pendingImages = [];
    
    // Response control state
    let temperature = 0.7;
    let topP = 0.9;
    let topK = 40;
    let repetitionPenalty = 1.1;
    let responseStyle = 'balanced';
    
    // ... rest of app.js remains the same, but remove all Genesis panel code ...
    
    // Note: The GenesisManager will handle all genesis-related functionality
});
