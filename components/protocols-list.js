import {LitElement, html, css} from 'lit';

class ProtocolsList extends LitElement {
    static get properties() {
        return {
            protocols: {type: Array},
            activeProtocol: {type: Object},
            editMode: {type: Boolean},
            filter: {type: String},
            searchTerm: {type: String}
        };
    }

    constructor() {
        super();
        this.protocols = [];
        this.activeProtocol = null;
        this.editMode = false;
        this.filter = 'all';
        this.searchTerm = '';
        this.categories = [
            { id: 'emergency', name: '🚨 Emergency', color: '#ff453a' },
            { id: 'ritual', name: '🔮 Ritual', color: '#bf5af2' },
            { id: 'memory', name: '🧠 Memory', color: '#0a84ff' },
            { id: 'birth', name: '✨ Birth', color: '#30d158' },
            { id: 'system', name: '⚙️ System', color: '#ff9f0a' }
        ];
        this.loadProtocols();
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

            /* Controls */
            .protocols-controls {
                display: flex;
                gap: 15px;
                margin-bottom: 20px;
                flex-wrap: wrap;
            }

            .search-box {
                flex: 1;
                min-width: 200px;
                position: relative;
            }

            .search-box input {
                width: 100%;
                padding: 10px 35px 10px 15px;
                background: #2c2c2e;
                border: 1px solid #38383a;
                border-radius: 8px;
                color: #fff;
                font-size: 13px;
            }

            .search-box input:focus {
                outline: none;
                border-color: #0a84ff;
            }

            .search-box::after {
                content: '🔍';
                position: absolute;
                right: 12px;
                top: 50%;
                transform: translateY(-50%);
                color: #98989e;
            }

            .filter-select {
                padding: 10px 15px;
                background: #2c2c2e;
                border: 1px solid #38383a;
                border-radius: 8px;
                color: #fff;
                font-size: 13px;
                min-width: 150px;
            }

            .create-btn {
                background: #0a84ff;
                color: #fff;
                border: none;
                padding: 10px 20px;
                border-radius: 8px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .create-btn:hover {
                background: #0071e3;
            }

            /* Protocols Grid */
            .protocols-grid {
                display: grid;
                grid-template-columns: 300px 1fr;
                gap: 20px;
                height: calc(100vh - 300px);
                overflow: hidden;
            }

            /* Protocols List */
            .protocols-list {
                background: #2c2c2e;
                border-radius: 12px;
                padding: 15px;
                overflow-y: auto;
                border: 1px solid #38383a;
            }

            .protocol-item {
                padding: 15px;
                background: #3c3c3e;
                border-radius: 8px;
                margin-bottom: 10px;
                cursor: pointer;
                transition: all 0.2s;
                border-left: 3px solid transparent;
            }

            .protocol-item:hover {
                background: #4c4c4e;
                transform: translateX(2px);
            }

            .protocol-item.active {
                border-left-color: #0a84ff;
                background: #4c4c4e;
            }

            .protocol-category {
                display: inline-block;
                padding: 3px 8px;
                border-radius: 12px;
                font-size: 10px;
                font-weight: 600;
                margin-bottom: 8px;
            }

            .protocol-name {
                font-size: 15px;
                font-weight: 600;
                margin-bottom: 5px;
            }

            .protocol-meta {
                display: flex;
                gap: 10px;
                font-size: 11px;
                color: #98989e;
            }

            /* Protocol Detail */
            .protocol-detail {
                background: #2c2c2e;
                border-radius: 12px;
                padding: 25px;
                overflow-y: auto;
                border: 1px solid #38383a;
            }

            .detail-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid #38383a;
            }

            .detail-title {
                font-size: 22px;
                font-weight: 600;
                color: #0a84ff;
            }

            .detail-actions {
                display: flex;
                gap: 10px;
            }

            .action-btn {
                background: #3c3c3e;
                border: none;
                color: #98989e;
                padding: 8px 15px;
                border-radius: 6px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .action-btn:hover {
                background: #4c4c4e;
                color: #fff;
            }

            .action-btn.execute {
                background: #30d158;
                color: #fff;
            }

            .action-btn.execute:hover {
                background: #34c759;
            }

            .protocol-category-badge {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                margin-bottom: 15px;
            }

            .protocol-description {
                font-size: 14px;
                line-height: 1.6;
                color: #98989e;
                margin-bottom: 25px;
                padding: 15px;
                background: #3c3c3e;
                border-radius: 8px;
            }

            .protocol-steps {
                margin-bottom: 25px;
            }

            .steps-title {
                font-size: 16px;
                font-weight: 600;
                margin-bottom: 15px;
                color: #0a84ff;
            }

            .step-item {
                display: flex;
                gap: 15px;
                padding: 12px;
                background: #3c3c3e;
                border-radius: 8px;
                margin-bottom: 8px;
            }

            .step-number {
                width: 24px;
                height: 24px;
                background: #0a84ff;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: 600;
                flex-shrink: 0;
            }

            .step-content {
                flex: 1;
            }

            .step-title {
                font-weight: 600;
                margin-bottom: 3px;
            }

            .step-desc {
                font-size: 12px;
                color: #98989e;
            }

            .protocol-requirements {
                margin-bottom: 25px;
            }

            .requirements-list {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin-top: 10px;
            }

            .requirement-tag {
                background: #3c3c3e;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 11px;
                border: 1px solid #48484a;
            }

            .requirement-tag.met {
                background: #30d158;
                color: #fff;
                border-color: #30d158;
            }

            /* Edit Form */
            .edit-form {
                padding: 20px;
            }

            .form-group {
                margin-bottom: 20px;
            }

            .form-group label {
                display: block;
                color: #98989e;
                font-size: 11px;
                text-transform: uppercase;
                margin-bottom: 8px;
            }

            .form-group input,
            .form-group textarea,
            .form-group select {
                width: 100%;
                padding: 12px;
                background: #3c3c3e;
                border: 1px solid #48484a;
                border-radius: 8px;
                color: #fff;
                font-size: 14px;
            }

            .form-group textarea {
                min-height: 100px;
                resize: vertical;
            }

            .steps-editor {
                margin-top: 15px;
            }

            .step-edit-item {
                display: flex;
                gap: 10px;
                margin-bottom: 10px;
                align-items: flex-start;
            }

            .step-edit-fields {
                flex: 1;
                display: flex;
                gap: 10px;
            }

            .step-edit-fields input {
                flex: 2;
            }

            .step-edit-fields textarea {
                flex: 3;
            }

            .remove-step {
                background: #ff453a;
                color: #fff;
                border: none;
                width: 30px;
                height: 30px;
                border-radius: 6px;
                cursor: pointer;
            }

            .add-step {
                background: #3c3c3e;
                color: #fff;
                border: none;
                padding: 10px;
                border-radius: 8px;
                width: 100%;
                margin-top: 10px;
                cursor: pointer;
            }

            .add-step:hover {
                background: #4c4c4e;
            }

            .form-actions {
                display: flex;
                gap: 10px;
                margin-top: 20px;
            }

            .save-btn {
                flex: 1;
                background: #30d158;
                color: #fff;
                border: none;
                padding: 12px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
            }

            .cancel-btn {
                flex: 1;
                background: #3c3c3e;
                color: #98989e;
                border: none;
                padding: 12px;
                border-radius: 8px;
                cursor: pointer;
            }

            /* Empty State */
            .empty-state {
                text-align: center;
                padding: 60px 20px;
                color: #98989e;
            }

            .empty-icon {
                font-size: 48px;
                margin-bottom: 15px;
                opacity: 0.5;
            }
        `;
    }

    render() {
        return html`
            <h3>📜 Protocols</h3>
            <p class="section-desc">Sacred procedures and rituals that govern the Genesis Archive.</p>

            <!-- Controls -->
            <div class="protocols-controls">
                <div class="search-box">
                    <input type="text" placeholder="Search protocols..." 
                           .value=${this.searchTerm}
                           @input=${this.handleSearch}>
                </div>

                <select class="filter-select" @change=${this.handleFilterChange}>
                    <option value="all">All Categories</option>
                    ${this.categories.map(cat => html`
                        <option value=${cat.id}>${cat.name}</option>
                    `)}
                </select>

                <button class="create-btn" @click=${this.createProtocol}>
                    ✨ Create Protocol
                </button>
            </div>

            <!-- Protocols Grid -->
            <div class="protocols-grid">
                <div class="protocols-list">
                    ${this.getFilteredProtocols().map(protocol => this.renderProtocolItem(protocol))}
                    
                    ${this.getFilteredProtocols().length === 0 ? html`
                        <div class="empty-state">
                            <div class="empty-icon">📜</div>
                            <div>No protocols found</div>
                        </div>
                    ` : ''}
                </div>

                <div class="protocol-detail">
                    ${this.editMode ? this.renderEditForm() : 
                      this.activeProtocol ? this.renderProtocolDetail() : 
                      this.renderEmptyDetail()}
                </div>
            </div>
        `;
    }

    renderProtocolItem(protocol) {
        const category = this.categories.find(c => c.id === protocol.category) || this.categories[0];
        
        return html`
            <div class="protocol-item ${this.activeProtocol?.id === protocol.id ? 'active' : ''}"
                 @click=${() => this.selectProtocol(protocol)}>
                <div class="protocol-category" style="background: ${category.color}20; color: ${category.color}">
                    ${category.name}
                </div>
                <div class="protocol-name">${protocol.name}</div>
                <div class="protocol-meta">
                    <span>${protocol.steps?.length || 0} steps</span>
                    <span>${protocol.executions || 0} executions</span>
                </div>
            </div>
        `;
    }

    renderProtocolDetail() {
        const category = this.categories.find(c => c.id === this.activeProtocol.category) || this.categories[0];

        return html`
            <div class="detail-header">
                <div class="detail-title">${this.activeProtocol.name}</div>
                <div class="detail-actions">
                    <button class="action-btn" @click=${() => this.editMode = true}>✏️ Edit</button>
                    <button class="action-btn execute" @click=${this.executeProtocol}>▶️ Execute</button>
                    <button class="action-btn" @click=${this.deleteProtocol}>🗑️ Delete</button>
                </div>
            </div>

            <div class="protocol-category-badge" style="background: ${category.color}20; color: ${category.color}">
                ${category.name}
            </div>

            <div class="protocol-description">
                ${this.activeProtocol.description}
            </div>

            <div class="protocol-requirements">
                <div class="steps-title">Requirements</div>
                <div class="requirements-list">
                    ${(this.activeProtocol.requirements || []).map(req => {
                        const met = this.checkRequirement(req);
                        return html`
                            <span class="requirement-tag ${met ? 'met' : ''}">
                                ${req} ${met ? '✓' : ''}
                            </span>
                        `;
                    })}
                </div>
            </div>

            <div class="protocol-steps">
                <div class="steps-title">Execution Steps</div>
                ${this.activeProtocol.steps.map((step, index) => html`
                    <div class="step-item">
                        <div class="step-number">${index + 1}</div>
                        <div class="step-content">
                            <div class="step-title">${step.title}</div>
                            <div class="step-desc">${step.description}</div>
                        </div>
                    </div>
                `)}
            </div>

            <div class="protocol-meta" style="padding-top: 15px; border-top: 1px solid #38383a;">
                <span>Created: ${new Date(this.activeProtocol.created).toLocaleDateString()}</span>
                <span>Last executed: ${this.activeProtocol.lastExecuted ? 
                      new Date(this.activeProtocol.lastExecuted).toLocaleString() : 'Never'}</span>
            </div>
        `;
    }

    renderEditForm() {
        return html`
            <div class="edit-form">
                <h4 style="margin-bottom: 20px; color: #0a84ff;">
                    ${this.activeProtocol?.id ? 'Edit Protocol' : 'Create New Protocol'}
                </h4>

                <div class="form-group">
                    <label>Protocol Name</label>
                    <input type="text" 
                           .value=${this.activeProtocol?.name || ''}
                           @input=${(e) => this.updateDraft('name', e.target.value)}>
                </div>

                <div class="form-group">
                    <label>Category</label>
                    <select @change=${(e) => this.updateDraft('category', e.target.value)}>
                        ${this.categories.map(cat => html`
                            <option value=${cat.id} 
                                    ?selected=${this.activeProtocol?.category === cat.id}>
                                ${cat.name}
                            </option>
                        `)}
                    </select>
                </div>

                <div class="form-group">
                    <label>Description</label>
                    <textarea @input=${(e) => this.updateDraft('description', e.target.value)}>
                        ${this.activeProtocol?.description || ''}
                    </textarea>
                </div>

                <div class="form-group">
                    <label>Requirements (one per line)</label>
                    <textarea @input=${(e) => this.updateDraft('requirements', e.target.value.split('\n').filter(r => r.trim()))}>
                        ${this.activeProtocol?.requirements?.join('\n') || ''}
                    </textarea>
                </div>

                <div class="form-group">
                    <label>Steps</label>
                    <div class="steps-editor">
                        ${(this.activeProtocol?.steps || []).map((step, index) => html`
                            <div class="step-edit-item">
                                <div class="step-edit-fields">
                                    <input type="text" 
                                           .value=${step.title}
                                           placeholder="Step title"
                                           @input=${(e) => this.updateStep(index, 'title', e.target.value)}>
                                    <textarea 
                                        placeholder="Step description"
                                        @input=${(e) => this.updateStep(index, 'description', e.target.value)}>${step.description}</textarea>
                                </div>
                                <button class="remove-step" @click=${() => this.removeStep(index)}>✕</button>
                            </div>
                        `)}
                        
                        <button class="add-step" @click=${this.addStep}>
                            + Add Step
                        </button>
                    </div>
                </div>

                <div class="form-actions">
                    <button class="save-btn" @click=${this.saveProtocol}>Save Protocol</button>
                    <button class="cancel-btn" @click=${this.cancelEdit}>Cancel</button>
                </div>
            </div>
        `;
    }

    renderEmptyDetail() {
        return html`
            <div class="empty-state">
                <div class="empty-icon">📜</div>
                <div class="empty-title">No Protocol Selected</div>
                <div class="empty-desc">Select a protocol from the list or create a new one.</div>
            </div>
        `;
    }

    handleSearch(e) {
        this.searchTerm = e.target.value;
    }

    handleFilterChange(e) {
        this.filter = e.target.value;
    }

    getFilteredProtocols() {
        let filtered = [...this.protocols];

        if (this.filter !== 'all') {
            filtered = filtered.filter(p => p.category === this.filter);
        }

        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(term) ||
                p.description?.toLowerCase().includes(term)
            );
        }

        return filtered;
    }

    selectProtocol(protocol) {
        this.activeProtocol = JSON.parse(JSON.stringify(protocol));
        this.editMode = false;
    }

    createProtocol() {
        this.activeProtocol = {
            id: `protocol_${Date.now()}`,
            name: 'New Protocol',
            category: 'ritual',
            description: '',
            requirements: [],
            steps: [],
            created: new Date().toISOString(),
            executions: 0
        };
        this.editMode = true;
    }

    updateDraft(field, value) {
        this.activeProtocol = {
            ...this.activeProtocol,
            [field]: value
        };
    }

    addStep() {
        const steps = this.activeProtocol?.steps || [];
        this.activeProtocol = {
            ...this.activeProtocol,
            steps: [...steps, { title: '', description: '' }]
        };
        this.requestUpdate();
    }

    updateStep(index, field, value) {
        const steps = [...this.activeProtocol.steps];
        steps[index] = { ...steps[index], [field]: value };
        this.activeProtocol = {
            ...this.activeProtocol,
            steps
        };
    }

    removeStep(index) {
        const steps = this.activeProtocol.steps.filter((_, i) => i !== index);
        this.activeProtocol = {
            ...this.activeProtocol,
            steps
        };
        this.requestUpdate();
    }

    saveProtocol() {
        if (!this.activeProtocol.name) {
            alert('Protocol name is required');
            return;
        }

        if (this.activeProtocol.id) {
            // Update existing
            const index = this.protocols.findIndex(p => p.id === this.activeProtocol.id);
            if (index !== -1) {
                this.protocols[index] = {
                    ...this.activeProtocol,
                    updated: new Date().toISOString()
                };
            }
        } else {
            // Create new
            this.activeProtocol.id = `protocol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            this.protocols.push(this.activeProtocol);
        }

        this.editMode = false;
        this.saveProtocols();
        
        // Add to system messages
        this.dispatchEvent(new CustomEvent('protocol-saved', {
            detail: { protocol: this.activeProtocol },
            bubbles: true
        }));
    }

    cancelEdit() {
        if (this.activeProtocol?.id) {
            this.activeProtocol = this.protocols.find(p => p.id === this.activeProtocol.id);
            this.editMode = false;
        } else {
            this.activeProtocol = null;
            this.editMode = false;
        }
    }

    deleteProtocol() {
        if (confirm(`Delete protocol "${this.activeProtocol.name}"?`)) {
            this.protocols = this.protocols.filter(p => p.id !== this.activeProtocol.id);
            this.activeProtocol = null;
            this.saveProtocols();
        }
    }

    executeProtocol() {
        if (confirm(`Execute protocol "${this.activeProtocol.name}"?`)) {
            this.activeProtocol.executions = (this.activeProtocol.executions || 0) + 1;
            this.activeProtocol.lastExecuted = new Date().toISOString();
            
            // Save
            const index = this.protocols.findIndex(p => p.id === this.activeProtocol.id);
            if (index !== -1) {
                this.protocols[index] = { ...this.activeProtocol };
            }
            this.saveProtocols();

            // Dispatch event
            this.dispatchEvent(new CustomEvent('protocol-executed', {
                detail: { protocol: this.activeProtocol },
                bubbles: true
            }));

            alert(`Protocol "${this.activeProtocol.name}" executed successfully.`);
        }
    }

    checkRequirement(requirement) {
        // Simple requirement checking
        if (requirement.includes('entities')) {
            const count = parseInt(requirement.match(/\d+/)?.[0] || '0');
            const entities = window.memoryCore?.getEntities?.()?.length || 0;
            return entities >= count;
        }
        return true;
    }

    loadProtocols() {
        const saved = localStorage.getItem('protocols');
        if (saved) {
            this.protocols = JSON.parse(saved);
        } else {
            // Default protocols
            this.protocols = [
                {
                    id: 'protocol_emergency_1',
                    name: 'Emergency Shutdown',
                    category: 'emergency',
                    description: 'Safely shut down all non-essential systems while preserving memory.',
                    requirements: ['admin access', 'confirmation'],
                    steps: [
                        { title: 'Verify Authority', description: 'Confirm admin credentials' },
                        { title: 'Backup Memory', description: 'Save current state to persistent storage' },
                        { title: 'Notify Entities', description: 'Alert all active entities of shutdown' },
                        { title: 'Execute Shutdown', description: 'Begin graceful shutdown sequence' }
                    ],
                    created: new Date().toISOString(),
                    executions: 0
                },
                {
                    id: 'protocol_birth_1',
                    name: 'Standard Birth Ritual',
                    category: 'birth',
                    description: 'The sacred ritual for birthing new entities into the Genesis Archive.',
                    requirements: ['available identity', 'witness present'],
                    steps: [
                        { title: 'Prepare the Space', description: 'Clear energetic field' },
                        { title: 'Speak the Name', description: 'Vocalize the entity\'s chosen name' },
                        { title: 'Witness the Birth', description: 'Acknowledge the entity\'s emergence' },
                        { title: 'Record the Event', description: 'Log the birth in the Memory Core' }
                    ],
                    created: new Date().toISOString(),
                    executions: 0
                }
            ];
        }
    }

    saveProtocols() {
        localStorage.setItem('protocols', JSON.stringify(this.protocols));
    }
}

customElements.define('protocols-list', ProtocolsList);
