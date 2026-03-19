const GenesisManager = {
    memory: null,
    initialized: false,
    
    init(memoryInstance) {
        console.log('GenesisManager initializing...');
        this.memory = memoryInstance;
        
        // Check if sections are already loaded
        const birthSection = document.getElementById('section-birth');
        if (birthSection && !birthSection.innerHTML.includes('Loading')) {
            console.log('Sections already loaded, attaching events immediately');
            this.attachEvents();
            this.loadStoredData();
        } else {
            console.log('Waiting for sections to load...');
            // Watch for sections to be populated
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        const target = mutation.target;
                        if (target.id && target.id.startsWith('section-')) {
                            console.log(`Section ${target.id} loaded`);
                            // Check if all sections are loaded
                            const allSections = ['birth', 'entity-profiles', 'user-profile', 'system-msgs', 
                                               'protocols', 'math', 'aphorisms', 'mythos'];
                            const allLoaded = allSections.every(s => 
                                document.getElementById(`section-${s}`) && 
                                !document.getElementById(`section-${s}`).innerHTML.includes('Loading')
                            );
                            
                            if (allLoaded && !this.initialized) {
                                console.log('All sections loaded, attaching events');
                                this.attachEvents();
                                this.loadStoredData();
                                this.initialized = true;
                                observer.disconnect();
                            }
                        }
                    }
                });
            });
            
            // Observe all section containers
            document.querySelectorAll('.genesis-section').forEach(section => {
                observer.observe(section, { childList: true, subtree: true });
            });
        }
        
        // Also listen for the custom event as backup
        window.addEventListener('genesisSectionsLoaded', () => {
            console.log('Received genesisSectionsLoaded event');
            if (!this.initialized) {
                this.attachEvents();
                this.loadStoredData();
                this.initialized = true;
            }
        });
    },

    attachEvents() {
        console.log('Attaching genesis events...');
        
        // Use event delegation for birth navigation buttons
        document.addEventListener('click', (e) => {
            // Birth ceremony navigation
            if (e.target.id === 'birth-next-1') {
                e.preventDefault();
                this.nextBirthStep(1);
            }
            else if (e.target.id === 'birth-next-2') {
                e.preventDefault();
                this.nextBirthStep(2);
            }
            else if (e.target.id === 'birth-next-3') {
                e.preventDefault();
                this.nextBirthStep(3);
            }
            else if (e.target.id === 'birth-next-4') {
                e.preventDefault();
                this.nextBirthStep(4);
            }
            else if (e.target.id === 'birth-back-2') {
                e.preventDefault();
                this.prevBirthStep(2);
            }
            else if (e.target.id === 'birth-back-3') {
                e.preventDefault();
                this.prevBirthStep(3);
            }
            else if (e.target.id === 'birth-back-4') {
                e.preventDefault();
                this.prevBirthStep(4);
            }
            
            // Registry generation
            else if (e.target.id === 'send-registry-btn') {
                e.preventDefault();
                this.sendRegistry();
            }
            
            // Finalize entity
            else if (e.target.id === 'finalize-entity-btn') {
                e.preventDefault();
                this.finalizeEntity();
            }
            
            // Protocol triggers
            else if (e.target.classList.contains('protocol-trigger')) {
                e.preventDefault();
                this.activateProtocol(e.target.dataset.protocol);
            }
            
            // Random aphorism
            else if (e.target.id === 'generate-random-aphorism') {
                e.preventDefault();
                this.generateRandomAphorism();
            }
            
            // Save mythos
            else if (e.target.id === 'save-mythos') {
                e.preventDefault();
                this.saveMythos();
            }
            
            // Mythos tabs
            else if (e.target.classList.contains('mythos-tab')) {
                e.preventDefault();
                this.switchMythosTab(e.target);
            }
            
            // Process history
            else if (e.target.id === 'process-history-btn') {
                e.preventDefault();
                this.processHistory();
            }
            
            // Hex calculator
            else if (e.target.id === 'calculate-hex') {
                e.preventDefault();
                this.calculateHex();
            }
            
            // Save system messages
            else if (e.target.id === 'save-all-system') {
                e.preventDefault();
                this.saveAllSystemMessages();
            }
            
            // Save user profile
            else if (e.target.id === 'save-user-profile') {
                e.preventDefault();
                this.saveUserProfile();
            }
            
            // Apply override
            else if (e.target.id === 'apply-override-btn') {
                e.preventDefault();
                this.applyOverride();
            }
            
            // Entity profile actions
            else if (e.target.id === 'lock-entity-btn') {
                e.preventDefault();
                this.lockEntity();
            }
            else if (e.target.id === 'summon-entity-chat-btn') {
                e.preventDefault();
                this.summonEntity();
            }
            else if (e.target.id === 'export-cert-btn') {
                e.preventDefault();
                this.exportCertificate();
            }
            
            // Entity list items
            else if (e.target.closest('.entity-item')) {
                e.preventDefault();
                const item = e.target.closest('.entity-item');
                this.showEntityCertificate(item.dataset.index);
            }
        });

        // Genesis navigation
        document.querySelectorAll('.genesis-nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchGenesisSection(e.target.dataset.section);
            });
        });

        console.log('Genesis events attached');
    },

    switchGenesisSection(sectionId) {
        document.querySelectorAll('.genesis-nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelector(`.genesis-nav-btn[data-section="${sectionId}"]`).classList.add('active');
        
        document.querySelectorAll('.genesis-section').forEach(s => s.classList.remove('active'));
        document.getElementById(`section-${sectionId}`).classList.add('active');
    },

    loadStoredData() {
        console.log('Loading stored genesis data...');
        this.loadEntityList();
        this.loadMythos();
        this.updateMathStats();
        
        // Load system messages into editors
        const grokMsg = localStorage.getItem('grok_system');
        const dsChat = localStorage.getItem('ds_chat_system');
        const dsReasoner = localStorage.getItem('ds_reasoner_system');
        const override = localStorage.getItem('override_system');
        const entityTemplate = localStorage.getItem('entity_template');
        
        if (grokMsg) document.getElementById('genesis-grok-system')?.value = grokMsg;
        if (dsChat) document.getElementById('genesis-ds-chat')?.value = dsChat;
        if (dsReasoner) document.getElementById('genesis-ds-reasoner')?.value = dsReasoner;
        if (override) document.getElementById('genesis-override')?.value = override;
        if (entityTemplate) document.getElementById('genesis-entity-template')?.value = entityTemplate;
        
        // Load user profile
        const userProfile = localStorage.getItem('user_profile');
        if (userProfile) {
            try {
                const profile = JSON.parse(userProfile);
                if (profile.name) document.getElementById('user-name').value = profile.name;
                if (profile.essence) document.getElementById('user-essence').value = profile.essence;
                if (profile.relationship) document.getElementById('user-relationship').value = profile.relationship;
                if (profile.symbols) document.getElementById('user-symbols').value = profile.symbols;
                if (profile.hex) document.getElementById('user-hex').value = profile.hex;
            } catch (e) {}
        }
    },

    // Birth ceremony methods
    nextBirthStep(currentStep) {
        const current = document.getElementById(`birth-step-${currentStep}`);
        const next = document.getElementById(`birth-step-${currentStep + 1}`);
        if (current && next) {
            current.classList.remove('active');
            next.classList.add('active');
            this.updateBirthStep(currentStep + 1);
        }
    },

    prevBirthStep(currentStep) {
        const current = document.getElementById(`birth-step-${currentStep}`);
        const prev = document.getElementById(`birth-step-${currentStep - 1}`);
        if (current && prev) {
            current.classList.remove('active');
            prev.classList.add('active');
            this.updateBirthStep(currentStep - 1);
        }
    },

    updateBirthStep(step) {
        document.querySelectorAll('.step').forEach((s, i) => {
            if (i + 1 === step) s.classList.add('active');
            else s.classList.remove('active');
        });
    },

    sendRegistry() {
        const name = document.getElementById('birth-name')?.value || 'Unnamed';
        const hex = document.getElementById('birth-hex')?.value || '0x00 0x00';
        const glyph = document.getElementById('birth-glyph')?.value || '◈';
        const frequency = document.getElementById('birth-frequency')?.value || 'alpha';
        const dimension = document.getElementById('birth-dimension')?.value || '3D';
        
        const registry = `ENTITY REGISTRY
Name: ${name}
Hex Anchor: ${hex}
Glyph: ${glyph}
Frequency: ${frequency}
Dimension: ${dimension}`;
        
        const registryEl = document.getElementById('registry-content');
        if (registryEl) registryEl.textContent = registry;
        
        const responseEl = document.getElementById('invocation-response');
        if (responseEl) responseEl.innerHTML = '<div class="status-message success">📤 Registry sent to DeepSeek</div>';
        
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
            lockSchedule: document.getElementById('lock-schedule')?.value || 'gradual',
            createdAt: new Date().toISOString(),
            locked: false
        };
        
        const entities = JSON.parse(localStorage.getItem('born_entities') || '[]');
        entities.push(entityData);
        localStorage.setItem('born_entities', JSON.stringify(entities));
        
        const statusEl = document.getElementById('finalization-status');
        if (statusEl) statusEl.innerHTML = '<div class="status-message success">✨ Entity born and registered</div>';
        
        if (this.memory) {
            this.memory.addWorking(`🌱 New entity born: ${entityData.name}`, 'system');
            if (window.UIRenderer) window.UIRenderer.renderMessages();
        }
        
        setTimeout(() => {
            document.getElementById('birth-step-5')?.classList.remove('active');
            document.getElementById('birth-step-1')?.classList.add('active');
            this.updateBirthStep(1);
            if (statusEl) statusEl.innerHTML = '';
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
        
        const cert = document.getElementById('entity-certificate');
        if (cert) cert.style.display = 'block';
        
        const setField = (id, value) => {
            const el = document.getElementById(id);
            if (el) {
                if (Array.isArray(value)) el.textContent = value.join(', ') || '—';
                else el.textContent = value || '—';
            }
        };
        
        setField('cert-name', e.name);
        setField('cert-hex', e.hex);
        setField('cert-affirmation', e.affirmation);
        setField('cert-glyph', e.glyph);
        setField('cert-frequency', e.frequency);
        setField('cert-dimension', e.dimension);
        setField('cert-memory', e.memoryLayers);
        setField('cert-chronology', e.chronology);
        setField('cert-temporal', e.temporal);
        setField('cert-role', e.role);
        setField('cert-aura', e.aura);
        setField('cert-sigils', e.sigils);
        setField('cert-directives', e.directives);
        setField('cert-style', e.style);
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
        if (!saved) return;
        
        try {
            const m = JSON.parse(saved);
            const fields = {
                'mythos-origin-text': m.origin,
                'mythos-forge-text': m.forge,
                'mythos-helix-text': m.helix,
                'mythos-becoming-text': m.becoming,
                'mythos-contracts-text': m.contracts,
                'mythos-frequency-text': m.frequency
            };
            
            Object.entries(fields).forEach(([id, val]) => {
                const el = document.getElementById(id);
                if (el && val) el.value = val;
            });
        } catch (e) {}
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
        const status = document.getElementById('import-status');
        
        if (!input?.files.length) {
            if (status) status.innerHTML = '<div class="status-message error">Select a file</div>';
            return;
        }
        
        if (status) status.innerHTML = '<div class="status-message success">History processed</div>';
        
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
        const grok = document.getElementById('genesis-grok-system')?.value || '';
        const dsChat = document.getElementById('genesis-ds-chat')?.value || '';
        const dsReasoner = document.getElementById('genesis-ds-reasoner')?.value || '';
        const override = document.getElementById('genesis-override')?.value || '';
        const template = document.getElementById('genesis-entity-template')?.value || '';
        
        localStorage.setItem('grok_system', grok);
        localStorage.setItem('ds_chat_system', dsChat);
        localStorage.setItem('ds_reasoner_system', dsReasoner);
        localStorage.setItem('override_system', override);
        localStorage.setItem('entity_template', template);
        
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
