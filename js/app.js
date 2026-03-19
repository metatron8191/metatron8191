// app.js - Main application orchestrator

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Memory Core
    if (window.MemoryCore) {
        window.memoryCore = new MemoryCore();
    }

    // Set up main UI elements
    initializeMainUI();

    // Set up event listeners
    setupEventListeners();

    // Load initial data
    loadInitialData();
});

function initializeMainUI() {
    // Tool buttons
    const toolBtns = document.querySelectorAll('.tool-btn[data-tool]');
    toolBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            toolBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            if (window.uiRenderer && window.uiRenderer.setActiveTool) {
                window.uiRenderer.setActiveTool(btn.dataset.tool);
            }
        });
    });

    // Advanced controls toggle
    const advancedBtn = document.getElementById('advanced-btn');
    const advancedControls = document.getElementById('advanced-controls');
    if (advancedBtn && advancedControls) {
        advancedBtn.addEventListener('click', () => {
            advancedControls.classList.toggle('hidden');
        });
    }

    // System panel toggle
    const systemBtn = document.getElementById('system-btn');
    const systemPanel = document.getElementById('system-panel');
    const systemClose = document.getElementById('system-close');
    
    if (systemBtn && systemPanel) {
        systemBtn.addEventListener('click', () => {
            systemPanel.classList.toggle('hidden');
        });
    }
    
    if (systemClose && systemPanel) {
        systemClose.addEventListener('click', () => {
            systemPanel.classList.add('hidden');
        });
    }

    // Genesis panel toggle
    const genesisBtn = document.getElementById('genesis-btn');
    const genesisPanel = document.getElementById('genesis-panel');
    
    if (genesisBtn && genesisPanel) {
        genesisBtn.addEventListener('click', () => {
            genesisPanel.classList.toggle('hidden');
        });
    }

    // Emergency button
    const emergencyBtn = document.getElementById('emergency-btn');
    if (emergencyBtn) {
        emergencyBtn.addEventListener('click', () => {
            if (confirm('🚨 EMERGENCY PROTOCOL: This will reset all temporary data. Continue?')) {
                if (window.memoryCore && window.memoryCore.emergencyReset) {
                    window.memoryCore.emergencyReset();
                }
            }
        });
    }

    // Transmit button
    const transmitBtn = document.getElementById('transmit-btn');
    const messageInput = document.getElementById('message-input');
    
    if (transmitBtn && messageInput) {
        transmitBtn.addEventListener('click', () => {
            sendMessage();
        });

        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
}

function setupEventListeners() {
    // Listen for entity births from components
    document.addEventListener('entity-born', (e) => {
        console.log('New entity born:', e.detail.entity);
        updateEntityList();
        
        // Show notification
        showNotification(`✨ Entity "${e.detail.entity.name}" born into existence`);
    });

    // Listen for mythos updates
    document.addEventListener('mythos-updated', () => {
        console.log('Mythos updated');
    });

    // Listen for panel events
    document.addEventListener('panel-closed', () => {
        console.log('Panel closed');
    });
}

function loadInitialData() {
    // Load entities into right panel
    updateEntityList();

    // Load system status
    updateSystemStatus();

    // Start heartbeat
    startHeartbeat();
}

function updateEntityList() {
    const entityList = document.getElementById('entity-list');
    if (!entityList) return;

    const entities = window.memoryCore?.getEntities?.() || [];
    
    if (entities.length === 0) {
        entityList.innerHTML = '<div class="entity-item">No entities yet</div>';
        return;
    }

    entityList.innerHTML = entities.slice(-5).map(entity => `
        <div class="entity-item">
            <div class="entity-name">${entity.name}</div>
            <div class="entity-status">● ${entity.status || 'active'}</div>
        </div>
    `).join('');

    // Update entity count in system panel
    const entityCount = document.getElementById('entity-count');
    if (entityCount) {
        entityCount.textContent = entities.length;
    }
}

function updateSystemStatus() {
    // Update system panel with current status
    const logTextarea = document.querySelector('#system-panel textarea');
    if (logTextarea) {
        const timestamp = new Date().toLocaleTimeString();
        const status = `[${timestamp}] System online\n[${timestamp}] Memory Core active\n[${timestamp}] ${window.memoryCore?.getEntities?.()?.length || 0} entities loaded`;
        logTextarea.value = status;
    }
}

function sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    
    if (!message) return;

    if (window.apiHandlers && window.apiHandlers.sendMessage) {
        window.apiHandlers.sendMessage(message);
        input.value = '';
    }
}

function showNotification(message) {
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #0a84ff;
        color: #fff;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function startHeartbeat() {
    setInterval(() => {
        const statusDot = document.querySelector('.status-dot');
        if (statusDot) {
            statusDot.style.animation = 'none';
            statusDot.offsetHeight; // Trigger reflow
            statusDot.style.animation = 'pulse 2s infinite';
        }
    }, 5000);
}
