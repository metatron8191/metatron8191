// js/app.js – Legacy bridge (now safe thin loader)
// All real logic lives in MemoryCore + MemoryFabric

document.addEventListener('componentsLoaded', () => {
    console.log('🚀 Lilareyon v2.0 – Memory Fabric fully initialized');
    
    // Ensure legacy globals point to new system
    window.AppState = window.MemoryCore?.state || {};
    window.createNewThread = window.MemoryFabric.createNewThread;
    window.loadThread = window.MemoryFabric.loadThread;
    window.saveCurrentThread = () => window.MemoryCore?.saveToStorage();
    window.renderMessages = window.UIRenderer.renderMessages;
    window.updateThreadsList = window.UIRenderer.updateThreadsList;
    
    // Final UI refresh
    window.renderMessages();
    window.updateThreadsList();
});

console.log('✅ Legacy app.js bridged to Memory Fabric v2');
