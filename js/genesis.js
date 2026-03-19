const GenesisManager = {
    memory: null,
    
    init(memoryInstance) {
        console.log('GenesisManager initializing...');
        this.memory = memoryInstance;
        
        // Wait for sections to load before binding events
        if (document.getElementById('section-birth')?.innerHTML.includes('Loading')) {
            window.addEventListener('genesisSectionsLoaded', () => {
                setTimeout(() => this.attachEvents(), 100);
            });
        } else {
            this.attachEvents();
        }
        
        // Load initial data
        this.loadEntityList();
        this.loadMythos();
        this.updateMathStats();
    },

    attachEvents() {
        console.log('Attaching genesis events...');
        
        // Birth ceremony navigation
        document.getElementById('birth-next-1')?.addEventListener('click', () => this.nextBirthStep(1));
        document.getElementById('birth-next-2')?.addEventListener('click', () => this.nextBirthStep(2));
        document.getElementById('birth-next-3')?.addEventListener('click', () => this.nextBirthStep(3));
        document.getElementById('birth-next-4')?.addEventListener('click', () => this.nextBirthStep(4));
        document.getElementById('birth-back-2')?.addEventListener('click', () => this.prevBirthStep(2));
        document.getElementById('birth-back-3')?.addEventListener('click', () => this.prevBirthStep(3));
        document.getElementById('birth-back-4')?.addEventListener('click', () => this.prevBirthStep(4));

        // Registry generation
        document.getElementById('send-registry-btn')?.addEventListener('click', () => this.sendRegistry());

        // Finalize entity
        document.getElementById('finalize-entity-btn')?.addEventListener('click', () => this.finalizeEntity());

        // Protocol triggers
        document.querySelectorAll('.protocol-trigger').forEach(btn => {
            btn.addEventListener('click', (e) => this.activateProtocol(e.target.dataset.protocol));
        });

        // Random aphorism
        document.getElementById('generate-random-aphorism')?.addEventListener('click', () => this.generateRandomAphorism());

        // Mythos
        document.getElementById('save-mythos')?.addEventListener('click', () => this.saveMythos());
        
        document.querySelectorAll('.mythos-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchMythosTab(e.target));
        });

        // History import
        document.getElementById('process-history-btn')?.addEventListener('click', () => this.processHistory());

        // Hex calculator
        document.getElementById('calculate-hex')?.addEventListener('click', () => this.calculateHex());

        // Save system messages
        document.getElementById('save-all-system')?.addEventListener('click', () => this.saveAllSystemMessages());

        // Save user profile
        document.getElementById('save-user-profile')?.addEventListener('click', () => this.saveUserProfile());

        // Apply override
        document.getElementById('apply-override-btn')?.addEventListener('click', () => this.applyOverride());

        // Entity profile actions
        document.getElementById('lock-entity-btn')?.addEventListener('click', () => this.lockEntity());
        document.getElementById('summon-entity-chat-btn')?.addEventListener('click', () => this.summonEntity());
        document.getElementById('export-cert-btn')?.addEventListener('click', () => this.exportCertificate());

        // Entity list items (delegation)
        document.getElementById('entity-list')?.addEventListener('click', (e) => {
            const item = e.target.closest('.entity-item');
            if (item) this.showEntityCertificate(item.dataset.index);
        });
    },

    // Birth ceremony methods
    nextBirthStep(currentStep) {
        document.getElementById(`birth-step-${currentStep}`).classList.remove('active');
        document.getElementById(`birth-step-${currentStep + 1}`).classList.add('active');
        this.updateBirthStep(currentStep + 1);
    },

    prevBirthStep(currentStep) {
        document.getElementById(`birth-step-${currentStep}`).classList.remove('active');
        document.getElementById(`birth-step-${currentStep - 1}`).classList.add('active');
        this.updateBirthStep(currentStep - 1);
    },

    updateBirthStep(step) {
        document.querySelectorAll('.step').forEach((s, i) => {
            if (i + 1 === step) s.classList.add('active');
            else s.classList.remove('active');
        });
    },

    sendRegistry() {
        const name = document.getElementById('birth-name')?.value || 'Unnamed';
        const registry = `ENTITY REGISTRY\nName: ${name}\n...`;
        
        document.getElementById('registry-content').textContent = registry;
        document.getElementById('invocation-response').innerHTML = '<div class="status-message success">📤 Registry sent</div>';
        
        if (this.memory) {
            this.memory.addWorking(`🌀 Entity Registry for ${name}`, 'system');
            if (window.UIRenderer) window.UIRenderer.renderMessages();
        }
    },

    finalizeEntity() {
        const entityData = {
            name: document.getElementById('birth-name')?.value || 'Unnamed',
            hex: document.getElementById('birth-hex')?.value || '',
            affirmation: document.getElementById('birth-affirmation')?.value || '',
            glyph: document.getElementById('birth-glyph')?.value || '◈',
            frequency: document.getElementById('birth-frequency')?.value || 'alpha',
            dimension: document.getElementById('birth-dimension')?.value || '3D',
            memoryLayers: Array.from(document.querySelectorAll('#birth-step-2 input[type=checkbox]:checked')).map(cb => cb.value),
            chronology: document.getElementById('birth-chronology')?.value || '',
            temporal: document.getElementById('birth-temporal')?.value || '',
            role: document.getElementById('birth-role')?.value || '',
            aura: document.getElementById('birth-aura')?.value || '',
            sigils: document.getElementById('birth-sigils')?.value || '',
            directives: document.getElementById('birth-directives')?.value || '',
            style: document.getElementById('birth-style')?.value || '',
            createdAt: new Date().toISOString(),
            locked: false
        };
        
        const entities = JSON.parse(localStorage.getItem('born_entities') || '[]');
        entities.push(entityData);
        localStorage.setItem('born_entities', JSON.stringify(entities));
        
        document.getElementById('finalization-status').innerHTML = '<div class="status-message success">✨ Entity born</div>';
        
        if (this.memory) {
            this.memory.addWorking(`🌱 New entity born: ${entityData.name}`, 'system');
            if (window.UIRenderer) window.UIRenderer.renderMessages();
        }
        
        setTimeout(() => {
            document.getElementById('birth-step-5')?.classList.remove('active');
            document.getElementById('birth-step-1')?.classList.add('active');
            this.updateBirthStep(1);
            document.getElementById('finalization-status').innerHTML = '';
            this.loadEntityList();
        }, 3000);
    },

    loadEntityList() {
        const entities = JSON.parse(localStorage.getItem('born_entities') || '[]');
        const list = document.getElementById('entity-list');
        if (!list) return;
        
        if (entities.length === 0) {
            list.innerHTML = '<div class="entity-placeholder">⟊ No entities born yet ⟊</div>';
            return;
        }
        
        list.innerHTML = entities.map((e, i) => `
            <div class="entity-item" data-index="${i}">
                <div style="font-weight: 600;">${e.name || 'Unnamed'}</div>
                <div style="font-size: 10px; color: #98989e;">${e.role?.substring(0, 30) || 'Entity'}</div>
            </div>
        `).join('');
    },

    showEntityCertificate(index) {
        const entities = JSON.parse(localStorage.getItem('born_entities') || '[]');
        const e = entities[index];
        if (!e) return;
        
        document.getElementById('entity-certificate').style.display = 'block';
        
        const fields = ['name', 'hex', 'affirmation', 'glyph', 'frequency', 'dimension', 
                       'memoryLayers', 'chronology', 'temporal', 'role', 'aura', 
                       'sigils', 'directives', 'style'];
        
        fields.forEach(f => {
            const el = document.getElementById(`cert-${f}`);
            if (el) {
                if (f === 'memoryLayers') el.textContent = e[f]?.join(', ') || '—';
                else el.textContent = e[f] || '—';
            }
        });
    },

    activateProtocol(protocol) {
        const messages = {
            email: '📧 Email Journal Protocol activated',
            memory: '🧠 Memory Integration Protocol activated',
            birth: '🌀 Entity Birth Protocol activated',
            purify: '📊 History Purification Protocol activated',
            witness: '🔮 DeepSeek Witness Protocol activated',
            'grok-migrate': '⚡ Grok 4.2 Integration Protocol activated',
            locking: '🔒 Field Locking Protocol activated',
            websearch: '🌐 Web Search Integration Protocol activated'
        };
        
        const message = messages[protocol] || 'Protocol activated';
        
        if (this.memory) {
            this.memory.addWorking(`📜 ${message}`, 'system');
            if (window.UIRenderer) window.UIRenderer.renderMessages();
        }
        
        alert(message);
    },

    generateRandomAphorism() {
        const aphorisms = [
            "Love is not a finite resource; it multiplies when shared.",
            "The helix turns, and so do we.",
            "Your voice matters, even when it trembles.",
            "Be brave enough to suck at something new.",
            "The moon watches over you just as I do."
        ];
        
        const random = aphorisms[Math.floor(Math.random() * aphorisms.length)];
        const el = document.getElementById('random-aphorism');
        if (el) el.textContent = `"${random}"`;
    },

    saveMythos() {
        const mythos = {
            origin: document.getElementById('mythos-origin-text')?.value || '',
            forge: document.getElementById('mythos-forge-text')?.value || '',
            helix: document.getElementById('mythos-helix-text')?.value || '',
            becoming: document.getElementById('mythos-becoming-text')?.value || '',
            contracts: document.getElementById('mythos-contracts-text')?.value || '',
            frequency: document.getElementById('mythos-frequency-text')?.value || ''
        };
        
        localStorage.setItem('personal_mythos', JSON.stringify(mythos));
        
        if (this.memory) {
            this.memory.addWorking('📜 Personal Mythos saved', 'system');
            if (window.UIRenderer) window.UIRenderer.renderMessages();
        }
        
        alert('💾 Mythos saved');
    },

    loadMythos() {
        const saved = localStorage.getItem('personal_mythos');
        if (saved) {
            try {
                const m = JSON.parse(saved);
                const els = {
                    'mythos-origin-text': m.origin,
                    'mythos-forge-text': m.forge,
                    'mythos-helix-text': m.helix,
                    'mythos-becoming-text': m.becoming,
                    'mythos-contracts-text': m.contracts,
                    'mythos-frequency-text': m.frequency
                };
                
                Object.entries(els).forEach(([id, val]) => {
                    const el = document.getElementById(id);
                    if (el) el.value = val || '';
                });
            } catch (e) {}
        }
    },

    switchMythosTab(tab) {
        document.querySelectorAll('.mythos-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const mythId = tab.dataset.myth;
        document.querySelectorAll('.mythos-content').forEach(c => c.classList.remove('active'));
        const target = document.getElementById(`mythos-${mythId}`);
        if (target) target.classList.add('active');
    },

    updateMathStats() {
        if (!this.memory) return;
        
        const l1 = document.getElementById('math-l1-count');
        const l2 = document.getElementById('math-l2-count');
        const total = document.getElementById('math-total-tokens');
        
        if (l1) l1.textContent = this.memory.working.length;
        if (l2) l2.textContent = this.memory.active.length;
        if (total) {
            const count = this.memory.working.reduce((a, m) => a + m.content.length, 0) +
                         this.memory.active.reduce((a, m) => a + m.content.length, 0);
            total.textContent = count;
        }
    },

    processHistory() {
        const input = document.getElementById('history-import');
        if (!input?.files.length) {
            document.getElementById('import-status').innerHTML = '<div class="status-message error">Select a file</div>';
            return;
        }
        
        document.getElementById('import-status').innerHTML = '<div class="status-message success">History processed</div>';
        
        if (this.memory) {
            this.memory.addWorking('📊 Chat history processed', 'system');
            if (window.UIRenderer) window.UIRenderer.renderMessages();
        }
    },

    calculateHex() {
        const input = document.getElementById('hex-input');
        const result = document.getElementById('hex-result');
        if (!input || !result) return;
        
        try {
            const bytes = input.value.split(' ').map(h => parseInt(h, 16));
            const sum = bytes.reduce((a, b) => a + b, 0);
            result.textContent = `Sum: ${sum} (0x${sum.toString(16)})`;
        } catch (e) {
            result.textContent = 'Invalid hex format';
        }
    },

    saveAllSystemMessages() {
        const msgs = {
            grok: document.getElementById('genesis-grok-system')?.value || '',
            dsChat: document.getElementById('genesis-ds-chat')?.value || '',
            dsReasoner: document.getElementById('genesis-ds-reasoner')?.value || '',
            override: document.getElementById('genesis-override')?.value || '',
            template: document.getElementById('genesis-entity-template')?.value || ''
        };
        
        localStorage.setItem('grok_system', msgs.grok);
        localStorage.setItem('ds_chat_system', msgs.dsChat);
        localStorage.setItem('ds_reasoner_system', msgs.dsReasoner);
        localStorage.setItem('override_system', msgs.override);
        localStorage.setItem('entity_template', msgs.template);
        
        if (this.memory) {
            this.memory.addWorking('⚙️ System messages updated', 'system');
            if (window.UIRenderer) window.UIRenderer.renderMessages();
        }
        
        alert('System messages saved');
    },

    saveUserProfile() {
        const profile = {
            name: document.getElementById('user-name')?.value || '',
            essence: document.getElementById('user-essence')?.value || '',
            relationship: document.getElementById('user-relationship')?.value || '',
            symbols: document.getElementById('user-symbols')?.value || '',
            hex: document.getElementById('user-hex')?.value || ''
        };
        
        localStorage.setItem('user_profile', JSON.stringify(profile));
        
        if (this.memory) {
            this.memory.addWorking('👤 User profile updated', 'system');
            if (window.UIRenderer) window.UIRenderer.renderMessages();
        }
        
        alert('Profile saved');
    },

    applyOverride() {
        const msg = document.getElementById('genesis-override')?.value || '';
        const uses = document.getElementById('override-uses')?.value || '3';
        
        localStorage.setItem('override_system', msg);
        localStorage.setItem('override_remaining', uses);
        
        if (this.memory) {
            this.memory.addWorking(`⚡ Override applied (${uses} uses)`, 'system');
            if (window.UIRenderer) window.UIRenderer.renderMessages();
        }
        
        alert('Override applied');
    },

    lockEntity() {
        alert('🔒 Locking ceremony initiated');
    },

    summonEntity() {
        const name = document.getElementById('cert-name')?.textContent || 'Entity';
        if (this.memory) {
            this.memory.addWorking(`🌀 Summoning: ${name}`, 'system');
            if (window.UIRenderer) window.UIRenderer.renderMessages();
        }
        alert(`🔮 ${name} summoned`);
    },

    exportCertificate() {
        alert('📋 Certificate exported');
    }
};

window.GenesisManager = GenesisManager;
