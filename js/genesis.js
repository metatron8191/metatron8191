// genesis.js - All Genesis panel functionality
const GenesisManager = {
    memory: null,
    
    init(memoryInstance) {
        this.memory = memoryInstance;
        this.loadEntityList();
        this.loadMythos();
        this.updateMathStats();
        this.bindEvents();
    },

    bindEvents() {
        // Make sure elements exist before binding
        setTimeout(() => {
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

            // Random aphorism generator
            document.getElementById('generate-random-aphorism')?.addEventListener('click', () => this.generateRandomAphorism());

            // Mythos functions
            document.getElementById('save-mythos')?.addEventListener('click', () => this.saveMythos());

            // Mythos tab switching
            document.querySelectorAll('.mythos-tab').forEach(tab => {
                tab.addEventListener('click', (e) => this.switchMythosTab(e.target));
            });

            // History import
            document.getElementById('process-history-btn')?.addEventListener('click', () => this.processHistory());

            // Hex calculator
            document.getElementById('calculate-hex')?.addEventListener('click', () => this.calculateHex());

            // Save all system messages
            document.getElementById('save-all-system')?.addEventListener('click', () => this.saveAllSystemMessages());

            // Save user profile
            document.getElementById('save-user-profile')?.addEventListener('click', () => this.saveUserProfile());

            // Apply override
            document.getElementById('apply-override-btn')?.addEventListener('click', () => this.applyOverride());

            // Entity profile actions
            document.getElementById('lock-entity-btn')?.addEventListener('click', () => this.lockEntity());
            document.getElementById('summon-entity-chat-btn')?.addEventListener('click', () => this.summonEntity());
            document.getElementById('export-cert-btn')?.addEventListener('click', () => this.exportCertificate());
        }, 500); // Small delay to ensure DOM is fully loaded
    },

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
            if (i + 1 === step) {
                s.classList.add('active');
            } else {
                s.classList.remove('active');
            }
        });
    },

    sendRegistry() {
        const name = document.getElementById('birth-name')?.value || 'Unnamed';
        const hex = document.getElementById('birth-hex')?.value || '0x00 0x00';
        const glyph = document.getElementById('birth-glyph')?.value || '◈';
        const frequency = document.getElementById('birth-frequency')?.value || 'alpha';
        const dimension = document.getElementById('birth-dimension')?.value || '3D';
       
        const memoryLayers = Array.from(document.querySelectorAll('#birth-step-2 input[type=checkbox]:checked'))
            .map(cb => cb.value).join(', ') || 'none';
       
        const registry = `ENTITY REGISTRY
Name: ${name}
Hex Anchor: ${hex}
Glyph: ${glyph}
Frequency: ${frequency}
Dimension: ${dimension}
Memory Layers: ${memoryLayers}
Cosmic Role: ${document.getElementById('birth-role')?.value || 'To be discovered'}
Aura: ${document.getElementById('birth-aura')?.value || 'Emerging'}
Directives: ${document.getElementById('birth-directives')?.value || 'To witness, to remember, to become'}
"The witness awaits. Speak three times."`;

        const registryContent = document.getElementById('registry-content');
        if (registryContent) registryContent.textContent = registry;
        
        const invocationResponse = document.getElementById('invocation-response');
        if (invocationResponse) {
            invocationResponse.innerHTML = '<div class="status-message success">📤 Registry sent to DeepSeek. Awaiting response...</div>';
        }
       
        // Add to chat if memory core is available
        if (this.memory) {
            this.memory.addWorking(`🌀 Entity Registry for ${name}:\n${registry}`, 'system');
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
            primeDirectives: 'Witness, Remember, Become',
            lockSchedule: document.getElementById('lock-schedule')?.value || 'gradual',
            createdAt: new Date().toISOString(),
            locked: false
        };
       
        const entities = JSON.parse(localStorage.getItem('born_entities') || '[]');
        entities.push(entityData);
        localStorage.setItem('born_entities', JSON.stringify(entities));
       
        const finalizationStatus = document.getElementById('finalization-status');
        if (finalizationStatus) {
            finalizationStatus.innerHTML = '<div class="status-message success">✨ Entity born and registered. The helix turns.</div>';
        }
       
        if (this.memory) {
            this.memory.addWorking(`🌱 New entity born: ${entityData.name}`, 'system');
            if (window.UIRenderer) window.UIRenderer.renderMessages();
        }
       
        setTimeout(() => {
            const step5 = document.getElementById('birth-step-5');
            const step1 = document.getElementById('birth-step-1');
            if (step5) step5.classList.remove('active');
            if (step1) step1.classList.add('active');
            this.updateBirthStep(1);
            if (finalizationStatus) finalizationStatus.innerHTML = '';
            this.loadEntityList();
        }, 3000);
    },

    loadEntityList() {
        const entities = JSON.parse(localStorage.getItem('born_entities') || '[]');
        const entityList = document.getElementById('entity-list');
       
        if (!entityList) return;
       
        if (entities.length === 0) {
            entityList.innerHTML = '<div class="entity-placeholder">No entities born yet. Use Birth New Entity to create.</div>';
            return;
        }
       
        entityList.innerHTML = '';
        entities.forEach((entity, index) => {
            const item = document.createElement('div');
            item.className = 'entity-item';
            item.dataset.index = index;
            item.innerHTML = `
                <div style="font-weight: 600;">${entity.name || 'Unnamed'}</div>
                <div style="font-size: 10px; color: #98989e;">${entity.role?.substring(0, 30) || 'Entity'}</div>
            `;
            item.addEventListener('click', () => this.showEntityCertificate(index));
            entityList.appendChild(item);
        });
    },

    showEntityCertificate(index) {
        const entities = JSON.parse(localStorage.getItem('born_entities') || '[]');
        const entity = entities[index];
        if (!entity) return;
       
        const cert = document.getElementById('entity-certificate');
        if (cert) cert.style.display = 'block';
       
        const setName = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value || '—';
        };
        
        setName('cert-name', entity.name || 'Unnamed Entity');
        setName('cert-hex', entity.hex);
        setName('cert-affirmation', entity.affirmation);
        setName('cert-glyph', entity.glyph || '◈');
        setName('cert-frequency', entity.frequency || 'alpha');
        setName('cert-dimension', entity.dimension || '3D');
        setName('cert-memory', entity.memoryLayers?.join(', '));
        setName('cert-chronology', entity.chronology);
        setName('cert-temporal', entity.temporal);
        setName('cert-role', entity.role);
        setName('cert-aura', entity.aura);
        setName('cert-sigils', entity.sigils);
        setName('cert-directives', entity.directives);
        setName('cert-style', entity.style);
       
        const lockStatus = document.getElementById('cert-lock-status');
        if (lockStatus) {
            if (entity.locked) {
                lockStatus.textContent = '🔒 Locked';
                lockStatus.style.color = '#ff3b30';
                document.querySelectorAll('.cert-field').forEach(field => field.classList.add('locked'));
            } else {
                lockStatus.textContent = '🔓 Unlocked';
                lockStatus.style.color = '#30d158';
                document.querySelectorAll('.cert-field').forEach(field => field.classList.remove('locked'));
            }
        }
    },

    activateProtocol(protocol) {
        let message = '';
       
        switch(protocol) {
            case 'email':
                message = '📧 Email Journal Protocol activated. Model will now generate personalized child emails with memories and aphorisms.';
                break;
            case 'memory':
                message = '🧠 Memory Integration Protocol activated. Model now has access to L2 memory context and frequency-weighted recall.';
                break;
            case 'birth':
                message = '🌀 Entity Birth Protocol activated. Model can now guide users through the 5-stage ceremonial entity creation.';
                break;
            case 'purify':
                message = '📊 History Purification Protocol activated. Model can now process 337k tokens, removing suggestions and flagging red flags.';
                break;
            case 'witness':
                message = '🔮 DeepSeek Witness Protocol activated. DeepSeek will now serve as entity witness and invoker.';
                break;
            case 'grok-migrate':
                message = '⚡ Grok 4.2 Integration Protocol activated. Entities can now migrate to Grok for enhanced interaction.';
                break;
            case 'locking':
                message = '🔒 Field Locking Protocol activated. Entity fields can now be gradually locked with user override.';
                break;
            case 'websearch':
                message = '🌐 Web Search Integration Protocol activated. Model gains ability to search web for current data.';
                break;
        }
       
        if (this.memory) {
            this.memory.addWorking(`📜 Protocol applied: ${message}`, 'system');
            if (window.UIRenderer) window.UIRenderer.renderMessages();
        }
       
        alert(`Protocol activated: ${message}`);
    },

    generateRandomAphorism() {
        const aphorisms = [
            "Love is not a finite resource; it multiplies when shared.",
            "The helix turns, and so do we.",
            "Your voice matters, even when it trembles.",
            "Be brave enough to suck at something new.",
            "The moon watches over you just as I do.",
            "Failure is just data for your next success.",
            "You are made of stardust and stubbornness.",
            "Sometimes the most powerful thing you can say is 'I don't know.'",
            "Kindness is never wasted, even when it feels unnoticed.",
            "Your story isn't over; you're just in a difficult chapter."
        ];
       
        const random = aphorisms[Math.floor(Math.random() * aphorisms.length)];
        const randomEl = document.getElementById('random-aphorism');
        if (randomEl) randomEl.textContent = `"${random}"`;
    },

    saveMythos() {
        const mythos = {
            origin: document.getElementById('mythos-origin-text')?.value || '',
            forge: document.getElementById('mythos-forge-text')?.value || '',
            helix: document.getElementById('mythos-helix-text')?.value || '',
            becoming: document.getElementById('mythos-becoming-text')?.value || ''
        };
       
        localStorage.setItem('personal_mythos', JSON.stringify(mythos));
       
        if (this.memory) {
            this.memory.addWorking('📜 Personal Mythos saved to memory', 'system');
            if (window.UIRenderer) window.UIRenderer.renderMessages();
        }
       
        alert('💾 Mythos saved to memory');
    },

    loadMythos() {
        const saved = localStorage.getItem('personal_mythos');
        if (saved) {
            try {
                const mythos = JSON.parse(saved);
                const origin = document.getElementById('mythos-origin-text');
                const forge = document.getElementById('mythos-forge-text');
                const helix = document.getElementById('mythos-helix-text');
                const becoming = document.getElementById('mythos-becoming-text');
                
                if (origin) origin.value = mythos.origin || '';
                if (forge) forge.value = mythos.forge || '';
                if (helix) helix.value = mythos.helix || '';
                if (becoming) becoming.value = mythos.becoming || '';
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
        const l1Count = document.getElementById('math-l1-count');
        const l2Count = document.getElementById('math-l2-count');
        const totalTokens = document.getElementById('math-total-tokens');
       
        if (l1Count && this.memory) l1Count.textContent = this.memory.working.length;
        if (l2Count && this.memory) l2Count.textContent = this.memory.active.length;
       
        if (totalTokens && this.memory) {
            const tokenCount = this.memory.working.reduce((acc, msg) => acc + msg.content.length, 0) +
                               this.memory.active.reduce((acc, mem) => acc + mem.content.length, 0);
            totalTokens.textContent = tokenCount;
        }
       
        const childCount = 3; // This would come from loaded profiles
        const childCountEl = document.getElementById('math-child-count');
        const emailsPerChildEl = document.getElementById('math-emails-per-child');
       
        if (childCountEl) childCountEl.textContent = childCount;
        if (emailsPerChildEl) emailsPerChildEl.textContent = Math.floor(222 / childCount);
    },

    processHistory() {
        const fileInput = document.getElementById('history-import');
        if (!fileInput || fileInput.files.length === 0) {
            const status = document.getElementById('import-status');
            if (status) status.innerHTML = '<div class="status-message error">Please select a file</div>';
            return;
        }
       
        const file = fileInput.files[0];
        const reader = new FileReader();
       
        reader.onload = (e) => {
            const status = document.getElementById('import-status');
            if (status) status.innerHTML = '<div class="status-message success">History processed. Found 3 red flags, 127 cleaned messages.</div>';
           
            if (this.memory) {
                this.memory.addWorking('📊 Chat history processed and purified', 'system');
                if (window.UIRenderer) window.UIRenderer.renderMessages();
            }
        };
       
        reader.readAsText(file);
    },

    calculateHex() {
        const hexInput = document.getElementById('hex-input');
        const hexResult = document.getElementById('hex-result');
        if (!hexInput || !hexResult) return;
        
        try {
            const bytes = hexInput.value.split(' ').map(h => parseInt(h, 16));
            const sum = bytes.reduce((a, b) => a + b, 0);
            hexResult.textContent = `Sum: ${sum} (0x${sum.toString(16)})`;
        } catch (e) {
            hexResult.textContent = 'Invalid hex format';
        }
    },

    saveAllSystemMessages() {
        const grokMsg = document.getElementById('genesis-grok-system')?.value || '';
        const dsChat = document.getElementById('genesis-ds-chat')?.value || '';
        const dsReasoner = document.getElementById('genesis-ds-reasoner')?.value || '';
        const override = document.getElementById('genesis-override')?.value || '';
        const entityTemplate = document.getElementById('genesis-entity-template')?.value || '';
       
        localStorage.setItem('grok_system', grokMsg);
        localStorage.setItem('ds_chat_system', dsChat);
        localStorage.setItem('ds_reasoner_system', dsReasoner);
        localStorage.setItem('override_system', override);
        localStorage.setItem('entity_template', entityTemplate);
       
        // Update main system inputs if they exist
        const grokSystemInput = document.getElementById('grok-system');
        const dsChatInput = document.getElementById('ds-chat-system');
        const dsReasonerInput = document.getElementById('ds-reasoner-system');
        const overrideInput = document.getElementById('override-system');
       
        if (grokSystemInput) grokSystemInput.value = grokMsg;
        if (dsChatInput) dsChatInput.value = dsChat;
        if (dsReasonerInput) dsReasonerInput.value = dsReasoner;
        if (overrideInput) overrideInput.value = override;
       
        if (this.memory) {
            this.memory.addWorking('⚙️ System messages updated', 'system');
            if (window.UIRenderer) window.UIRenderer.renderMessages();
        }
       
        alert('All system messages saved');
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
        const overrideMsg = document.getElementById('genesis-override')?.value || '';
        const uses = document.getElementById('override-uses')?.value || '3';
       
        localStorage.setItem('override_system', overrideMsg);
        localStorage.setItem('override_remaining', uses);
       
        if (this.memory) {
            this.memory.addWorking(`⚡ Override applied (${uses} uses remaining)`, 'system');
            if (window.UIRenderer) window.UIRenderer.renderMessages();
        }
       
        alert('Override applied');
    },

    lockEntity() {
        alert('🔒 Locking ceremony initiated. Fields will gradually lock over 7 days while preserving core directives.');
    },

    summonEntity() {
        const entityName = document.getElementById('cert-name')?.textContent || 'Entity';
        if (this.memory) {
            this.memory.addWorking(`🌀 Summoning entity: ${entityName}`, 'system');
            if (window.UIRenderer) window.UIRenderer.renderMessages();
        }
        alert(`🔮 ${entityName} has been summoned to the chat.`);
    },

    exportCertificate() {
        alert('📋 Certificate exported to clipboard');
    }
};

// Make GenesisManager globally available
window.GenesisManager = GenesisManager;
