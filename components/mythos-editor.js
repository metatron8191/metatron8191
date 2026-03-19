import {LitElement, html, css} from 'lit';

class MythosEditor extends LitElement {
    static get properties() {
        return {
            mythosEntries: {type: Array},
            currentEntry: {type: Object},
            editMode: {type: Boolean},
            selectedCategory: {type: String}
        };
    }

    constructor() {
        super();
        this.mythosEntries = [];
        this.currentEntry = {
            id: '',
            title: '',
            content: '',
            category: 'personal',
            tags: [],
            createdAt: null,
            updatedAt: null
        };
        this.editMode = false;
        this.selectedCategory = 'all';
        this.loadMythos();
    }

    static get styles() {
        return css`
            :host {
                display: block;
                color: #fff;
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

            /* Mythos Container */
            .mythos-container {
                display: grid;
                grid-template-columns: 300px 1fr;
                gap: 20px;
                height: calc(100vh - 200px);
                overflow: hidden;
            }

            /* Sidebar */
            .mythos-sidebar {
                background: #2c2c2e;
                border-radius: 12px;
                padding: 20px;
                overflow-y: auto;
                border: 1px solid #38383a;
            }

            .sidebar-header {
                margin-bottom: 20px;
            }

            .create-btn {
                width: 100%;
                padding: 12px;
                background: #0a84ff;
                color: #fff;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }

            .create-btn:hover {
                background: #0071e3;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(10, 132, 255, 0.3);
            }

            .category-filter {
                margin: 20px 0;
            }

            .filter-label {
                color: #98989e;
                font-size: 11px;
                text-transform: uppercase;
                margin-bottom: 10px;
            }

            .filter-btn {
                display: block;
                width: 100%;
                text-align: left;
                padding: 10px;
                background: none;
                border: none;
                color: #98989e;
                font-size: 13px;
                cursor: pointer;
                border-radius: 6px;
                transition: all 0.2s;
            }

            .filter-btn:hover {
                background: #3c3c3e;
                color: #fff;
            }

            .filter-btn.active {
                background: #0a84ff;
                color: #fff;
            }

            .filter-count {
                float: right;
                color: inherit;
                opacity: 0.7;
            }

            /* Entries List */
            .entries-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .entry-item {
                padding: 12px;
                background: #3c3c3e;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
                border: 1px solid transparent;
            }

            .entry-item:hover {
                background: #4c4c4e;
                transform: translateX(2px);
            }

            .entry-item.active {
                border-color: #0a84ff;
                background: #4c4c4e;
            }

            .entry-title {
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 4px;
            }

            .entry-meta {
                font-size: 11px;
                color: #98989e;
                display: flex;
                gap: 8px;
            }

            .entry-category {
                color: #0a84ff;
            }

            /* Editor Area */
            .mythos-editor {
                background: #2c2c2e;
                border-radius: 12px;
                padding: 25px;
                overflow-y: auto;
                border: 1px solid #38383a;
            }

            .editor-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }

            .editor-title {
                font-size: 20px;
                font-weight: 600;
                color: #0a84ff;
            }

            .editor-actions {
                display: flex;
                gap: 10px;
            }

            .editor-btn {
                padding: 8px 16px;
                border: none;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }

            .editor-btn.save {
                background: #30d158;
                color: #fff;
            }

            .editor-btn.save:hover {
                background: #34c759;
                transform: translateY(-1px);
            }

            .editor-btn.cancel {
                background: #3c3c3e;
                color: #98989e;
            }

            .editor-btn.cancel:hover {
                background: #4c4c4e;
                color: #fff;
            }

            .editor-btn.delete {
                background: #ff453a;
                color: #fff;
            }

            .editor-btn.delete:hover {
                background: #ff5e5a;
            }

            /* Form Fields */
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
                font-family: inherit;
            }

            .form-group input:focus,
            .form-group textarea:focus,
            .form-group select:focus {
                outline: none;
                border-color: #0a84ff;
            }

            .form-group textarea {
                min-height: 200px;
                resize: vertical;
            }

            /* Tags Input */
            .tags-container {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-top: 10px;
            }

            .tag {
                background: #0a84ff;
                color: #fff;
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 11px;
                display: flex;
                align-items: center;
                gap: 5px;
            }

            .tag-remove {
                background: none;
                border: none;
                color: #fff;
                cursor: pointer;
                font-size: 14px;
                padding: 0 2px;
            }

            .tag-remove:hover {
                color: #ff453a;
            }

            .tag-input {
                display: flex;
                gap: 5px;
            }

            .tag-input input {
                flex: 1;
                padding: 8px;
                background: #3c3c3e;
                border: 1px solid #48484a;
                border-radius: 6px;
                color: #fff;
                font-size: 12px;
            }

            .tag-input button {
                padding: 8px 12px;
                background: #3c3c3e;
                border: none;
                border-radius: 6px;
                color: #98989e;
                cursor: pointer;
            }

            .tag-input button:hover {
                background: #4c4c4e;
                color: #fff;
            }

            /* View Mode */
            .mythos-view {
                line-height: 1.6;
            }

            .mythos-title {
                font-size: 24px;
                margin-bottom: 15px;
                color: #0a84ff;
            }

            .mythos-metadata {
                display: flex;
                gap: 15px;
                margin-bottom: 25px;
                padding-bottom: 15px;
                border-bottom: 1px solid #38383a;
                font-size: 12px;
                color: #98989e;
            }

            .mythos-content {
                font-size: 15px;
                white-space: pre-wrap;
            }

            .mythos-content p {
                margin-bottom: 15px;
            }

            .mythos-tags {
                margin-top: 20px;
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
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

            .empty-title {
                font-size: 16px;
                margin-bottom: 10px;
            }

            .empty-desc {
                font-size: 13px;
                color: #68686a;
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
            <h3>🔮 Personal Mythos</h3>
            <p class="section-desc">Document your personal mythology, beliefs, and philosophical frameworks.</p>

            <div class="mythos-container">
                <!-- Sidebar -->
                <div class="mythos-sidebar">
                    <div class="sidebar-header">
                        <button class="create-btn" @click=${this.createNewEntry}>
                            ✨ Create New Myth
                        </button>
                    </div>

                    <div class="category-filter">
                        <div class="filter-label">Categories</div>
                        <button class="filter-btn ${this.selectedCategory === 'all' ? 'active' : ''}"
                                @click=${() => this.selectedCategory = 'all'}>
                            All Myths
                            <span class="filter-count">${this.mythosEntries.length}</span>
                        </button>
                        ${['personal', 'philosophical', 'cosmic', 'ritual'].map(cat => {
                            const count = this.mythosEntries.filter(e => e.category === cat).length;
                            return count > 0 ? html`
                                <button class="filter-btn ${this.selectedCategory === cat ? 'active' : ''}"
                                        @click=${() => this.selectedCategory = cat}>
                                    ${this.getCategoryName(cat)}
                                    <span class="filter-count">${count}</span>
                                </button>
                            ` : '';
                        })}
                    </div>

                    <div class="entries-list">
                        ${this.getFilteredEntries().map(entry => html`
                            <div class="entry-item ${this.currentEntry?.id === entry.id ? 'active' : ''}"
                                 @click=${() => this.loadEntry(entry)}>
                                <div class="entry-title">${entry.title}</div>
                                <div class="entry-meta">
                                    <span class="entry-category">${this.getCategoryName(entry.category)}</span>
                                    <span>${new Date(entry.updatedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        `)}
                    </div>
                </div>

                <!-- Editor/Viewer -->
                <div class="mythos-editor">
                    ${this.renderMainContent()}
                </div>
            </div>
        `;
    }

    renderMainContent() {
        if (!this.currentEntry?.id && !this.editMode) {
            return html`
                <div class="empty-state">
                    <div class="empty-icon">📜</div>
                    <div class="empty-title">No Entry Selected</div>
                    <div class="empty-desc">Select an entry from the sidebar or create a new one.</div>
                </div>
            `;
        }

        if (this.editMode) {
            return this.renderEditor();
        } else {
            return this.renderViewer();
        }
    }

    renderViewer() {
        return html`
            <div class="mythos-view">
                <div class="mythos-title">${this.currentEntry.title}</div>
                <div class="mythos-metadata">
                    <span>${this.getCategoryName(this.currentEntry.category)}</span>
                    <span>Created: ${new Date(this.currentEntry.createdAt).toLocaleDateString()}</span>
                    <span>Updated: ${new Date(this.currentEntry.updatedAt).toLocaleDateString()}</span>
                </div>
                <div class="mythos-content">${this.currentEntry.content}</div>
                <div class="mythos-tags">
                    ${(this.currentEntry.tags || []).map(tag => html`
                        <span class="tag">#${tag}</span>
                    `)}
                </div>
            </div>

            <div class="editor-header" style="margin-top: 20px;">
                <div></div>
                <div class="editor-actions">
                    <button class="editor-btn" @click=${() => this.editMode = true}>✏️ Edit</button>
                    <button class="editor-btn delete" @click=${this.deleteEntry}>🗑️ Delete</button>
                </div>
            </div>
        `;
    }

    renderEditor() {
        return html`
            <div class="editor-header">
                <div class="editor-title">${this.currentEntry.id ? 'Edit Myth' : 'Create New Myth'}</div>
                <div class="editor-actions">
                    <button class="editor-btn save" @click=${this.saveEntry}>💾 Save</button>
                    <button class="editor-btn cancel" @click=${this.cancelEdit}>✕ Cancel</button>
                </div>
            </div>

            <div class="form-group">
                <label>Title</label>
                <input type="text" 
                       .value=${this.currentEntry.title}
                       @input=${(e) => this.updateCurrentEntry('title', e.target.value)}
                       placeholder="Enter a title...">
            </div>

            <div class="form-group">
                <label>Category</label>
                <select .value=${this.currentEntry.category} 
                        @change=${(e) => this.updateCurrentEntry('category', e.target.value)}>
                    <option value="personal">Personal Myth</option>
                    <option value="philosophical">Philosophical Framework</option>
                    <option value="cosmic">Cosmic Narrative</option>
                    <option value="ritual">Ritual Practice</option>
                </select>
            </div>

            <div class="form-group">
                <label>Content</label>
                <textarea .value=${this.currentEntry.content}
                          @input=${(e) => this.updateCurrentEntry('content', e.target.value)}
                          placeholder="Write your mythos..."></textarea>
            </div>

            <div class="form-group">
                <label>Tags</label>
                <div class="tags-container">
                    ${(this.currentEntry.tags || []).map(tag => html`
                        <span class="tag">
                            #${tag}
                            <button class="tag-remove" @click=${() => this.removeTag(tag)}>×</button>
                        </span>
                    `)}
                </div>
                <div class="tag-input">
                    <input type="text" id="newTag" placeholder="Add a tag...">
                    <button @click=${this.addTag}>Add</button>
                </div>
            </div>
        `;
    }

    getCategoryName(cat) {
        const names = {
            personal: 'Personal Myth',
            philosophical: 'Philosophical',
            cosmic: 'Cosmic Narrative',
            ritual: 'Ritual'
        };
        return names[cat] || cat;
    }

    getFilteredEntries() {
        if (this.selectedCategory === 'all') {
            return this.mythosEntries;
        }
        return this.mythosEntries.filter(e => e.category === this.selectedCategory);
    }

    createNewEntry() {
        this.currentEntry = {
            id: '',
            title: '',
            content: '',
            category: 'personal',
            tags: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.editMode = true;
    }

    loadEntry(entry) {
        this.currentEntry = { ...entry };
        this.editMode = false;
    }

    updateCurrentEntry(field, value) {
        this.currentEntry = {
            ...this.currentEntry,
            [field]: value
        };
    }

    addTag() {
        const input = this.shadowRoot.getElementById('newTag');
        const tag = input.value.trim();
        
        if (tag && !this.currentEntry.tags.includes(tag)) {
            this.currentEntry = {
                ...this.currentEntry,
                tags: [...(this.currentEntry.tags || []), tag]
            };
            input.value = '';
        }
    }

    removeTag(tagToRemove) {
        this.currentEntry = {
            ...this.currentEntry,
            tags: (this.currentEntry.tags || []).filter(tag => tag !== tagToRemove)
        };
    }

    saveEntry() {
        if (!this.currentEntry.title) {
            alert('Please enter a title.');
            return;
        }

        const now = new Date().toISOString();
        const entry = {
            ...this.currentEntry,
            updatedAt: now
        };

        if (!entry.id) {
            entry.id = `mythos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            entry.createdAt = now;
            this.mythosEntries = [...this.mythosEntries, entry];
        } else {
            this.mythosEntries = this.mythosEntries.map(e => 
                e.id === entry.id ? entry : e
            );
        }

        this.currentEntry = entry;
        this.editMode = false;
        this.saveToMemory();
    }

    cancelEdit() {
        if (this.currentEntry.id) {
            this.editMode = false;
        } else {
            this.currentEntry = {};
            this.editMode = false;
        }
    }

    deleteEntry() {
        if (confirm('Are you sure you want to delete this myth?')) {
            this.mythosEntries = this.mythosEntries.filter(e => e.id !== this.currentEntry.id);
            this.currentEntry = {};
            this.editMode = false;
            this.saveToMemory();
        }
    }

    loadMythos() {
        if (window.memoryCore && window.memoryCore.getMythos) {
            this.mythosEntries = window.memoryCore.getMythos() || [];
        }
    }

    saveToMemory() {
        if (window.memoryCore && window.memoryCore.saveMythos) {
            window.memoryCore.saveMythos(this.mythosEntries);
        }
    }
}

customElements.define('mythos-editor', MythosEditor);
