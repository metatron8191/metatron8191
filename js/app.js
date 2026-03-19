// app.js - Main application orchestrator with full component integration

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Memory Core
    if (window.MemoryCore) {
        window.memoryCore = new MemoryCore();
    }

    // Set up main UI elements
    initializeMainUI();

    // Set up component event listeners
    setupComponentListeners();

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
            
            // Log system message when opening genesis panel
            if (!genesisPanel.classList.contains('hidden')) {
                logSystemEvent('Genesis Archive accessed', 'info');
            }
        });
    }

    // Emergency button
    const emergencyBtn = document.getElementById('emergency-btn');
    if (emergencyBtn) {
        emergencyBtn.addEventListener('click', () => {
            if (confirm('🚨 EMERGENCY PROTOCOL: This will reset all temporary data. Continue?')) {
                if (window.memoryCore && window.memoryCore.emergencyReset) {
                    window.memoryCore.emergencyReset();
                    logSystemEvent('Emergency protocol executed', 'warning');
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

function setupComponentListeners() {
    // Listen for entity births from birth-ceremony component
    document.addEventListener('entity-born', (e) => {
        console.log('New entity born:', e.detail.entity);
        updateEntityList();
        
        // Show notification
        showNotification(`✨ Entity "${e.detail.entity.name}" born into existence`);
        
        // Log to system messages
        logSystemEvent(`Entity "${e.detail.entity.name}" born`, 'birth', {
            witness: e.detail.entity.witness,
            attributes: e.detail.entity.attributes
        });

        // Update user stats
        updateUserStats('entityWitnessed');
    });

    // Listen for mythos updates
    document.addEventListener('mythos-updated', (e) => {
        console.log('Mythos updated:', e.detail);
        logSystemEvent('Mythos entry updated', 'info', {
            title: e.detail.entry?.title
        });
    });

    // Listen for protocol execution
    document.addEventListener('protocol-executed', (e) => {
        console.log('Protocol executed:', e.detail);
        showNotification(`📜 Protocol "${e.detail.protocol.name}" executed`);
        logSystemEvent(`Protocol executed: ${e.detail.protocol.name}`, 'ritual', {
            steps: e.detail.protocol.steps?.length
        });
    });

    // Listen for protocol saves
    document.addEventListener('protocol-saved', (e) => {
        console.log('Protocol saved:', e.detail);
        logSystemEvent(`Protocol saved: ${e.detail.protocol.name}`, 'system');
    });

    // Listen for aphorism saves
    document.addEventListener('aphorism-saved', (e) => {
        console.log('Aphorism saved:', e.detail);
        logSystemEvent(`Aphorism added: "${e.detail.aphorism.text.substring(0, 30)}..."`, 'wisdom');
    });

    // Listen for panel close
    document.addEventListener('panel-closed', () => {
        console.log('Genesis panel closed');
    });

    // Listen for math calculations
    document.addEventListener('calculation-performed', (e) => {
        console.log('Calculation:', e.detail);
        updateUserStats('calculationPerformed');
    });
}

function loadInitialData() {
    // Load entities into right panel
    updateEntityList();

    // Load system status
    updateSystemStatus();

    // Load user profile
    loadUserProfile();

    // Start heartbeat
    startHeartbeat();

    // Welcome message
    setTimeout(() => {
        logSystemEvent('Welcome to the Genesis Archive', 'system', {
            version: '1.0.0',
            status: 'Memory Core active'
        });
    }, 1000);
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
        <div class="entity-item" title="Born: ${new Date(entity.birthDate).toLocaleString()}">
            <div class="entity-name">${entity.name}</div>
            <div class="entity-status">● ${entity.status || 'active'}</div>
            <div style="font-size: 10px; color: #98989e; margin-top: 5px;">
                ${entity.interactions || 0} interactions
            </div>
        </div>
    `).join('');

    // Update entity count in system panel
    const entityCount = document.getElementById('entity-count');
    if (entityCount) {
        entityCount.textContent = entities.length;
    }
}

function updateSystemStatus() {
    const logTextarea = document.querySelector('#system-panel textarea');
    if (!logTextarea) return;

    const timestamp = new Date().toLocaleTimeString();
    const entities = window.memoryCore?.getEntities?.()?.length || 0;
    const memoryUsage = estimateMemoryUsage();
    
    const status = [
        `[${timestamp}] System online`,
        `[${timestamp}] Memory Core active`,
        `[${timestamp}] ${entities} entities loaded`,
        `[${timestamp}] Memory usage: ${memoryUsage}%`,
        `[${timestamp}] Ready for rituals`
    ].join('\n');
    
    logTextarea.value = status;
}

function estimateMemoryUsage() {
    // Simple memory estimation based on entity count
    const entities = window.memoryCore?.getEntities?.()?.length || 0;
    return Math.min(Math.floor(entities * 5), 95);
}

function loadUserProfile() {
    // Update user stats from memory core
    const entities = window.memoryCore?.getEntities?.()?.length || 0;
    const userProfile = document.querySelector('user-profile');
    
    if (userProfile) {
        // User profile component will handle its own loading
        userProfile.profile.stats.entitiesWitnessed = entities;
    }
}

function updateUserStats(action) {
    const userProfile = document.querySelector('user-profile');
    if (!userProfile) return;

    switch(action) {
        case 'entityWitnessed':
            userProfile.profile.stats.entitiesWitnessed++;
            break;
        case 'calculationPerformed':
            userProfile.profile.stats.insightsGained++;
            break;
    }
    
    userProfile.profile.lastActive = new Date().toISOString();
    userProfile.saveUserData();
}

function logSystemEvent(message, type = 'info', details = {}) {
    // Find system-messages component and add message
    const systemMessages = document.querySelector('system-messages');
    if (systemMessages) {
        systemMessages.addMessage(type, message, details);
    }

    // Also update system panel textarea
    const logTextarea = document.querySelector('#system-panel textarea');
    if (logTextarea) {
        const timestamp = new Date().toLocaleTimeString();
        const icon = getTypeIcon(type);
        const currentLog = logTextarea.value;
        const newEntry = `[${timestamp}] ${icon} ${message}`;
        logTextarea.value = [newEntry, ...currentLog.split('\n').slice(0, 9)].join('\n');
    }
}

function getTypeIcon(type) {
    const icons = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '🚨',
        birth: '✨',
        ritual: '🔮',
        wisdom: '💫',
        system: '⚙️'
    };
    return icons[type] || '📌';
}

function sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    
    if (!message) return;

    // Add to messages container
    const messagesContainer = document.getElementById('messages-container');
    if (messagesContainer) {
        const messageEl = document.createElement('div');
        messageEl.className = 'message user';
        messageEl.innerHTML = `
            ${message}
            <div class="message-timestamp">${new Date().toLocaleTimeString()}</div>
        `;
        messagesContainer.appendChild(messageEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Update user stats
    const userProfile = document.querySelector('user-profile');
    if (userProfile) {
        userProfile.profile.stats.messagesSent++;
    }

    // Log to system
    logSystemEvent('Message transmitted', 'info', {
        length: message.length
    });

    // Clear input
    input.value = '';

    // Simulate response (if using API handlers)
    if (window.apiHandlers && window.apiHandlers.sendMessage) {
        window.apiHandlers.sendMessage(message);
    }
}

function showNotification(message, type = 'info') {
    const colors = {
        info: '#0a84ff',
        success: '#30d158',
        warning: '#ff9f0a',
        error: '#ff453a',
        birth: '#bf5af2'
    };

    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: #fff;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        z-index: 3000;
        animation: slideIn 0.3s ease;
        font-size: 13px;
        max-width: 300px;
    `;
    notification.textContent = message;
    
    // Add animation styles if not present
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
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

        // Update system status periodically
        updateSystemStatus();
    }, 5000);
}

// Emergency cleanup function
window.emergencyCleanup = function() {
    localStorage.clear();
    sessionStorage.clear();
    location.reload();
};

// Export for debugging
window.debug = {
    getState: () => ({
        entities: window.memoryCore?.getEntities?.() || [],
        userProfile: localStorage.getItem('userProfile'),
        protocols: localStorage.getItem('protocols'),
        aphorisms: localStorage.getItem('aphorisms')
    }),
    
    reset: () => {
        if (confirm('Reset all data?')) {
            localStorage.clear();
            location.reload();
        }
    }
};
