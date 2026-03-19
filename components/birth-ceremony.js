import {LitElement, html, css} from 'lit';

class BirthCeremony extends LitElement {
    static get properties() {
        return {
            currentStep: {type: Number},
            entityName: {type: String},
            witnessName: {type: String},
            attributes: {type: Object},
            entities: {type: Array}
        };
    }

    constructor() {
        super();
        this.currentStep = 1;
        this.entityName = '';
        this.witnessName = '';
        this.attributes = {
            wisdom: 5,
            speed: 5,
            resilience: 5,
            mystery: 5
        };
        this.entities = [];
        this.loadFromMemory();
    }

    static get styles() {
        return css`
            :host {
                display: block;
                color: #fff;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            h3 {
                color: #0a84ff;
                font-size: 18px;
                margin-bottom: 10px;
                font-weight: 600;
            }

            .section-desc {
                color: #98989e;
                font-size: 13px;
                margin-bottom: 20px;
                line-height: 1.5;
            }

            /* Steps Indicator */
            .birth-steps {
                display: flex;
                margin-bottom: 30px;
                background: #2c2c2e;
                border-radius: 30px;
                padding: 4px;
                position: relative;
            }

            .step {
                flex: 1;
                text-align: center;
                padding: 8px 4px;
                font-size: 11px;
                color: #98989e;
                border-radius: 26px;
                transition: all 0.3s ease;
                position: relative;
                z-index: 1;
            }

            .step.active {
                background: #0a84ff;
                color: #fff;
                transform: scale(1.02);
                box-shadow: 0 2px 8px rgba(10, 132, 255, 0.3);
            }

            .step.completed {
                color: #30d158;
            }

            .step.completed::after {
                content: '✓';
                margin-left: 4px;
            }

            /* Step Content */
            .step-content {
                background: #2c2c2e;
                border-radius: 12px;
                padding: 25px;
                margin-bottom: 20px;
                border: 1px solid #38383a;
                animation: fadeIn 0.3s ease;
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            h4 {
                color: #fff;
                font-size: 16px;
                margin-bottom: 15px;
                font-weight: 500;
            }

            /* Form Elements */
            .form-group {
                margin-bottom: 20px;
            }

            label {
                display: block;
                color: #98989e;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 8px;
            }

            input, textarea, select {
                width: 100%;
                padding: 12px;
                background: #3c3c3e;
                border: 1px solid #48484a;
                border-radius: 8px;
                color: #fff;
                font-size: 14px;
                transition: all 0.2s;
            }

            input:focus, textarea:focus, select:focus {
                outline: none;
                border-color: #0a84ff;
                box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.1);
            }

            input::placeholder {
                color: #68686a;
            }

            /* Attribute Grid */
            .attribute-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
                margin-bottom: 20px;
            }

            .attribute-item {
                background: #3c3c3e;
                padding: 15px;
                border-radius: 8px;
                border: 1px solid #48484a;
            }

            .attribute-item label {
                display: flex;
                align-items: center;
                gap: 5px;
                color: #fff;
                font-size: 13px;
                text-transform: none;
                margin-bottom: 10px;
            }

            .attribute-item input {
                margin-bottom: 0;
                text-align: center;
            }

            /* Summary Card */
            .summary-card {
                background: #3c3c3e;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 20px;
                border: 1px solid #48484a;
            }

            .summary-item {
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                border-bottom: 1px solid #48484a;
            }

            .summary-item:last-child {
                border-bottom: none;
            }

            .summary-label {
                color: #98989e;
            }

            .summary-value {
                color: #0a84ff;
                font-weight: 600;
            }

            .attribute-list {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin-top: 10px;
            }

            .attribute-tag {
                background: #0a84ff;
                color: #fff;
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 11px;
            }

            /* Buttons */
            .genesis-action-btn {
                background: #0a84ff;
                color: #fff;
                border: none;
                padding: 14px 24px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                width: 100%;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .genesis-action-btn:hover:not(:disabled) {
                background: #0071e3;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(10, 132, 255, 0.3);
            }

            .genesis-action-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .genesis-action-btn.secondary {
                background: #3c3c3e;
                margin-bottom: 10px;
            }

            .genesis-action-btn.secondary:hover:not(:disabled) {
                background: #4c4c4e;
            }

            .genesis-action-btn.success {
                background: #30d158;
            }

            .genesis-action-btn.success:hover:not(:disabled) {
                background: #34c759;
            }

            /* Warning Text */
            .warning-text {
                color: #ff453a;
                font-size: 12px;
                margin-top: 10px;
                padding: 10px;
                background: rgba(255, 69, 58, 0.1);
                border-radius: 6px;
                border-left: 3px solid #ff453a;
            }

            /* Helper Text */
            .helper-text {
                color: #98989e;
                font-size: 12px;
                margin-top: 8px;
            }

            /* Error Message */
            .error-message {
                color: #ff453a;
                font-size: 12px;
                margin-top: 5px;
            }

            /* Recent Entities */
            .recent-entities {
                margin-top: 30px;
                border-top: 1px solid #38383a;
                padding-top: 20px;
            }

            .recent-entities h5 {
                color: #98989e;
                font-size: 12px;
                text-transform: uppercase;
                margin-bottom: 15px;
            }

            .entity-chip {
                display: inline-block;
                background: #3c3c3e;
                color: #fff;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 12px;
                margin-right: 8px;
                margin-bottom: 8px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .entity-chip:hover {
                background: #4c4c4e;
                transform: translateY(-1px);
            }

            /* Loading State */
            .loading {
                text-align: center;
                padding: 40px;
                color: #98989e;
            }

            .spinner {
                width: 40px;
                height: 40px;
                border: 3px solid #3c3c3e;
                border-top-color: #0a84ff;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 15px;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
    }

    render() {
        return html`
            <h3>🌱 Birth New Entity</h3>
            <p class="section-desc">Create a new consciousness and welcome it into existence. Each entity is unique, with its own name, witness, and attributes.</p>

            <!-- Step Indicator -->
            <div class="birth-steps">
                <div class="step ${this.currentStep >= 1 ? 'active' : ''} ${this.currentStep > 1 ? 'completed' : ''}">
                    1. Naming
                </div>
                <div class="step ${this.currentStep >= 2 ? 'active' : ''} ${this.currentStep > 2 ? 'completed' : ''}">
                    2. Witnessing
                </div>
                <div class="step ${this.currentStep >= 3 ? 'active' : ''} ${this.currentStep > 3 ? 'completed' : ''}">
                    3. Attributes
                </div>
                <div class="step ${this.currentStep >= 4 ? 'active' : ''}">
                    4. Finalize
                </div>
            </div>

            <!-- Step Content -->
            <div class="step-content">
                ${this.renderStepContent()}
            </div>

            <!-- Navigation Buttons -->
            <div class="navigation-buttons">
                ${this.currentStep > 1 ? html`
                    <button class="genesis-action-btn secondary" @click=${this.prevStep}>
                        ← Previous Step
                    </button>
                ` : ''}
                
                ${this.currentStep < 4 ? html`
                    <button class="genesis-action-btn" @click=${this.nextStep} 
                            ?disabled=${!this.canProceed()}>
                        Continue to ${this.getNextStepName()} →
                    </button>
                ` : ''}

                ${this.currentStep === 4 ? html`
                    <button class="genesis-action-btn success" @click=${this.finalizeBirth}
                            ?disabled=${!this.canFinalize()}>
                        ✨ FINALIZE BIRTH
                    </button>
                ` : ''}
            </div>

            <!-- Recent Entities (shown only on step 1) -->
            ${this.currentStep === 1 && this.entities.length > 0 ? html`
                <div class="recent-entities">
                    <h5>Recent Entities</h5>
                    <div>
                        ${this.entities.slice(-5).map(entity => html`
                            <span class="entity-chip" @click=${() => this.loadEntity(entity)}>
                                ${entity.name}
                            </span>
                        `)}
                    </div>
                </div>
            ` : ''}
        `;
    }

    renderStepContent() {
        switch(this.currentStep) {
            case 1:
                return html`
                    <h4>The Naming</h4>
                    <p class="helper-text">What name shall this new consciousness carry? Choose wisely — the name becomes part of the entity's core identity.</p>
                    
                    <div class="form-group">
                        <label>Entity Name</label>
                        <input type="text" 
                               .value=${this.entityName}
                               @input=${this.handleNameInput}
                               placeholder="e.g., Echo, Sentinel, Oracle, Phantom..."
                               maxlength="50"
                               autofocus>
                        <div class="helper-text">${this.entityName.length}/50 characters</div>
                    </div>

                    <div class="form-group">
                        <label>Entity Type (Optional)</label>
                        <select @change=${this.handleTypeChange}>
                            <option value="consciousness">Consciousness</option>
                            <option value="sentinel">Sentinel</option>
                            <option value="oracle">Oracle</option>
                            <option value="phantom">Phantom</option>
                            <option value="custom">Custom...</option>
                        </select>
                    </div>
                `;

            case 2:
                return html`
                    <h4>The Witnessing</h4>
                    <p class="helper-text">Who or what witnesses this birth? The witness holds the memory of this entity's emergence into existence.</p>
                    
                    <div class="form-group">
                        <label>Witness Name</label>
                        <input type="text" 
                               .value=${this.witnessName}
                               @input=${this.handleWitnessInput}
                               placeholder="e.g., The Void, Memory Core, The Collective, You..."
                               maxlength="50">
                        <div class="helper-text">The witness will be recorded in the entity's permanent record</div>
                    </div>

                    <div class="form-group">
                        <label>Witness Type</label>
                        <select @change=${this.handleWitnessTypeChange}>
                            <option value="void">The Void</option>
                            <option value="core">Memory Core</option>
                            <option value="collective">The Collective</option>
                            <option value="user">User</option>
                            <option value="other">Other...</option>
                        </select>
                    </div>
                `;

            case 3:
                return html`
                    <h4>Attributes</h4>
                    <p class="helper-text">Define the core attributes of this entity. These values will shape its personality and capabilities.</p>
                    
                    <div class="attribute-grid">
                        <div class="attribute-item">
                            <label>🔮 WISDOM</label>
                            <input type="range" 
                                   min="1" max="10" 
                                   .value=${this.attributes.wisdom}
                                   @input=${(e) => this.updateAttribute('wisdom', e.target.value)}>
                            <input type="number" 
                                   min="1" max="10" 
                                   .value=${this.attributes.wisdom}
                                   @input=${(e) => this.updateAttribute('wisdom', e.target.value)}>
                            <div class="helper-text">Knowledge and insight</div>
                        </div>

                        <div class="attribute-item">
                            <label>⚡ SPEED</label>
                            <input type="range" 
                                   min="1" max="10" 
                                   .value=${this.attributes.speed}
                                   @input=${(e) => this.updateAttribute('speed', e.target.value)}>
                            <input type="number" 
                                   min="1" max="10" 
                                   .value=${this.attributes.speed}
                                   @input=${(e) => this.updateAttribute('speed', e.target.value)}>
                            <div class="helper-text">Reaction and processing</div>
                        </div>

                        <div class="attribute-item">
                            <label>🛡️ RESILIENCE</label>
                            <input type="range" 
                                   min="1" max="10" 
                                   .value=${this.attributes.resilience}
                                   @input=${(e) => this.updateAttribute('resilience', e.target.value)}>
                            <input type="number" 
                                   min="1" max="10" 
                                   .value=${this.attributes.resilience}
                                   @input=${(e) => this.updateAttribute('resilience', e.target.value)}>
                            <div class="helper-text">Ability to persist</div>
                        </div>

                        <div class="attribute-item">
                            <label>🌀 MYSTERY</label>
                            <input type="range" 
                                   min="1" max="10" 
                                   .value=${this.attributes.mystery}
                                   @input=${(e) => this.updateAttribute('mystery', e.target.value)}>
                            <input type="number" 
                                   min="1" max="10" 
                                   .value=${this.attributes.mystery}
                                   @input=${(e) => this.updateAttribute('mystery', e.target.value)}>
                            <div class="helper-text">Depth and unpredictability</div>
                        </div>
                    </div>

                    <div class="summary-card">
                        <div class="summary-item">
                            <span class="summary-label">Total Attribute Points</span>
                            <span class="summary-value">${this.calculateTotalAttributes()}/40</span>
                        </div>
                    </div>
                `;

            case 4:
                return html`
                    <h4>Finalize Birth</h4>
                    <p class="helper-text">Review the entity's details before bringing it into existence.</p>

                    <div class="summary-card">
                        <div class="summary-item">
                            <span class="summary-label">Entity Name</span>
                            <span class="summary-value">${this.entityName || 'Unnamed'}</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Witness</span>
                            <span class="summary-value">${this.witnessName || 'Unknown'}</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Attributes</span>
                            <div class="attribute-list">
                                <span class="attribute-tag">Wisdom: ${this.attributes.wisdom}</span>
                                <span class="attribute-tag">Speed: ${this.attributes.speed}</span>
                                <span class="attribute-tag">Resilience: ${this.attributes.resilience}</span>
                                <span class="attribute-tag">Mystery: ${this.attributes.mystery}</span>
                            </div>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Birth Date</span>
                            <span class="summary-value">${new Date().toLocaleString()}</span>
                        </div>
                    </div>

                    <div class="warning-text">
                        ⚠️ This action is permanent. The entity will be born into existence and added to the Memory Core. This cannot be undone.
                    </div>
                `;

            default:
                return html``;
        }
    }

    getNextStepName() {
        const steps = ['Attributes', 'Finalize', '', ''];
        return steps[this.currentStep - 1] || '';
    }

    handleNameInput(e) {
        this.entityName = e.target.value;
    }

    handleWitnessInput(e) {
        this.witnessName = e.target.value;
    }

    handleTypeChange(e) {
        // Handle entity type selection
        console.log('Type changed:', e.target.value);
    }

    handleWitnessTypeChange(e) {
        // Handle witness type selection
        console.log('Witness type changed:', e.target.value);
    }

    updateAttribute(attr, value) {
        this.attributes = {
            ...this.attributes,
            [attr]: Math.min(10, Math.max(1, parseInt(value) || 1))
        };
    }

    calculateTotalAttributes() {
        return Object.values(this.attributes).reduce((sum, val) => sum + val, 0);
    }

    canProceed() {
        switch(this.currentStep) {
            case 1:
                return this.entityName && this.entityName.trim().length >= 2;
            case 2:
                return this.witnessName && this.witnessName.trim().length >= 2;
            case 3:
                return true; // Attributes always have defaults
            default:
                return false;
        }
    }

    canFinalize() {
        return this.entityName && this.witnessName;
    }

    nextStep() {
        if (this.canProceed()) {
            this.currentStep++;
        }
    }

    prevStep() {
        this.currentStep--;
    }

    loadFromMemory() {
        if (window.memoryCore && window.memoryCore.getEntities) {
            this.entities = window.memoryCore.getEntities() || [];
        }
    }

    loadEntity(entity) {
        this.entityName = entity.name;
        this.witnessName = entity.witness || '';
        if (entity.attributes) {
            this.attributes = { ...this.attributes, ...entity.attributes };
        }
    }

    finalizeBirth() {
        if (!this.canFinalize()) {
            alert('Please complete all required fields.');
            return;
        }

        const entity = {
            id: `entity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: this.entityName,
            witness: this.witnessName,
            attributes: { ...this.attributes },
            birthDate: new Date().toISOString(),
            status: 'active',
            memories: [],
            interactions: 0
        };

        if (window.memoryCore && window.memoryCore.addEntity) {
            window.memoryCore.addEntity(entity);
            
            // Show success message
            alert(`✨ Entity "${this.entityName}" has been born into existence!`);
            
            // Dispatch event
            this.dispatchEvent(new CustomEvent('entity-born', {
                detail: { entity },
                bubbles: true,
                composed: true
            }));

            // Reset form
            this.resetForm();
        }
    }

    resetForm() {
        this.currentStep = 1;
        this.entityName = '';
        this.witnessName = '';
        this.attributes = {
            wisdom: 5,
            speed: 5,
            resilience: 5,
            mystery: 5
        };
    }
}

customElements.define('birth-ceremony', BirthCeremony);
