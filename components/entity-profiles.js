import {LitElement, html, css} from 'lit';

class EntityProfiles extends LitElement {
    static get properties() {
        return {
            entities: {type: Array},
            selectedEntity: {type: Object},
            filterStatus: {type: String},
            searchTerm: {type: String},
            viewMode: {type: String} // 'grid' or 'list'
        };
    }

    constructor() {
        super();
        this.entities = [];
        this.selectedEntity = null;
        this.filterStatus = 'all';
        this.searchTerm = '';
        this.viewMode = 'grid';
        this.loadEntities();
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

            /* Controls Bar */
            .controls-bar {
                display: flex;
                gap: 15px;
                margin-bottom: 20px;
                flex-wrap: wrap;
                align-items: center;
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
                font-size: 14px;
            }

            .filter-select {
                padding: 10px 15px;
                background: #2c2c2e;
                border: 1px solid #38383a;
                border-radius: 8px;
                color: #fff;
                font-size: 13px;
                min-width: 120px;
            }

            .view-toggle {
                display: flex;
                gap: 5px;
                background: #2c2c2e;
                padding: 4px;
                border-radius: 8px;
            }

            .view-btn {
                background: none;
                border: none;
                color: #98989e;
                padding: 6px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.2s;
            }

            .view-btn.active {
                background: #0a84ff;
                color: #fff;
            }

            /* Stats Bar */
            .stats-bar {
                display: flex;
                gap: 20px;
                margin-bottom: 25px;
                padding: 15px;
                background: #2c2c2e;
                border-radius: 8px;
                border: 1px solid #38383a;
            }

            .stat-item {
                flex: 1;
                text-align: center;
            }

            .stat-value {
                font-size: 24px;
                font-weight: 600;
                color: #0a84ff;
            }

            .stat-label {
                font-size: 11px;
                color: #98989e;
                text-transform: uppercase;
                margin-top: 5px;
            }

            /* Grid View */
            .entity-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                gap: 15px;
                margin-bottom: 20px;
            }

            .entity-card {
                background: #2c2c2e;
                border-radius: 10px;
                padding: 15px;
                cursor: pointer;
                transition: all 0.2s;
                border: 1px solid #38383a;
                position: relative;
                overflow: hidden;
            }

            .entity-card:hover {
                background: #3c3c3e;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                border-color: #0a84ff;
            }

            .entity-card.selected {
                border-color: #0a84ff;
                box-shadow: 0 0 0 2px rgba(10, 132, 255, 0.3);
            }

            .entity-status-badge {
                position: absolute;
                top: 10px;
                right: 10px;
                width: 8px;
                height: 8px;
                border-radius: 50%;
            }

            .status-active { background: #30d158; }
            .status-dormant { background: #ff9f0a; }
            .status-archived { background: #98989e; }

            .entity-icon {
                font-size: 32px;
                margin-bottom: 10px;
                text-align: center;
            }

            .entity-name {
                font-size: 16px;
                font-weight: 600;
                margin-bottom: 5px;
                text-align: center;
            }

            .entity-meta {
                font-size: 11px;
                color: #98989e;
                text-align: center;
                margin-bottom: 10px;
            }

            .attribute-bars {
                display: flex;
                gap: 4px;
                margin-top: 10px;
            }

            .attribute-bar {
                flex: 1;
                height: 4px;
                background: #3c3c3e;
                border-radius: 2px;
                overflow: hidden;
            }

            .attribute-bar-fill {
                height: 100%;
                background: #0a84ff;
                border-radius: 2px;
                transition: width 0.3s;
            }

            /* List View */
            .entity-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin-bottom: 20px;
            }

            .entity-row {
                background: #2c2c2e;
                border-radius: 8px;
                padding: 12px 15px;
                display: flex;
                align-items: center;
                gap: 15px;
                cursor: pointer;
                transition: all 0.2s;
                border: 1px solid #38383a;
            }

            .entity-row:hover {
                background: #3c3c3e;
                border-color: #0a84ff;
            }

            .entity-row.selected {
                border-color: #0a84ff;
                background: #3c3c3e;
            }

            .row-status {
                width: 8px;
                height: 8px;
                border-radius: 50%;
            }

            .row-icon {
                font-size: 20px;
            }

            .row-info {
                flex: 1;
            }

            .row-name {
                font-weight: 600;
                margin-bottom: 3px;
            }

            .row-details {
                font-size: 11px;
                color: #98989e;
            }

            .row-attributes {
                display: flex;
                gap: 15px;
                font-size: 11px;
                color: #98989e;
            }

            /* Detail View */
            .detail-view {
                background: #2c2c2e;
                border-radius: 12px;
                padding: 25px;
                margin-top: 20px;
                border: 1px solid #38383a;
                animation: slideIn 0.3s ease;
            }

            @keyframes slideIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
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
                font-size: 20px;
                font-weight: 600;
                color: #0a84ff;
            }

            .detail-close {
                background: none;
                border: none;
                color: #98989e;
                font-size: 20px;
                cursor: pointer;
                padding: 5px;
            }

            .detail-close:hover {
                color: #fff;
            }

            .detail-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
                margin-bottom: 20px;
            }

            .detail-field {
                margin-bottom: 15px;
            }

            .detail-label {
                font-size: 11px;
                color: #98989e;
                text-transform: uppercase;
                margin-bottom: 5px;
            }

            .detail-value {
                font-size: 14px;
                color: #fff;
            }

            .attribute-meter {
                margin-bottom: 10px;
            }

            .meter-label {
                display: flex;
                justify-content: space-between;
                font-size: 12px;
                margin-bottom: 3px;
            }

            .meter-bar {
                height: 6px;
                background: #3c3c3e;
                border-radius: 3px;
                overflow: hidden;
            }

            .meter-fill {
                height: 100%;
                background: #0a84ff;
                border-radius: 3px;
                transition: width 0.3s;
            }

            .memory-timeline {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #38383a;
            }

            .memory-item {
                padding: 10px;
                background: #3c3c3e;
                border-radius: 6px;
                margin-bottom: 8px;
                font-size: 12px;
            }

            .memory-time {
                color: #98989e;
                font-size: 10px;
                margin-bottom: 3px;
            }

            /* Empty State */
            .empty-state {
                text-align: center;
                padding: 60px 20px;
                background: #2c2c2e;
                border-radius: 12px;
                border: 2px dashed #38383a;
            }

            .empty-icon {
                font-size: 48px;
                margin-bottom: 15px;
                opacity: 0.5;
            }

            .empty-title {
                font-size: 16px;
                color: #98989e;
                margin-bottom: 10px;
            }

            .empty-desc {
                font-size: 13px;
                color: #68686a;
                max-width: 300px;
                margin: 0 auto;
            }

            /* Pagination */
            .pagination {
                display: flex;
                justify-content: center;
                gap: 5px;
                margin-top: 20px;
            }

            .page-btn {
                background: #2c2c2e;
                border: 1px solid #38383a;
                color: #98989e;
                padding: 8px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.2s;
            }

            .page-btn:hover {
                background: #3c3c3e;
                color: #fff;
            }

            .page-btn.active {
                background: #0a84ff;
                color: #fff;
                border-color: #0a84ff;
            }
        `;
    }

    render() {
        const filteredEntities = this.getFilteredEntities();

        return html`
            <h3>👥 Entity Profiles</h3>
            <p class="section-desc">View and manage all entities that have been born into existence.</p>

            <!-- Controls -->
            <div class="controls-bar">
                <div class="search-box">
                    <input type="text" 
                           placeholder="Search entities..." 
                           .value=${this.searchTerm}
                           @input=${this.handleSearch}>
                </div>

                <select class="filter-select" @change=${this.handleFilterChange}>
                    <option value="all">All Entities</option>
                    <option value="active">Active</option>
                    <option value="dormant">Dormant</option>
                    <option value="archived">Archived</option>
                </select>

                <div class="view-toggle">
                    <button class="view-btn ${this.viewMode === 'grid' ? 'active' : ''}" 
                            @click=${() => this.viewMode = 'grid'}>📱 Grid</button>
                    <button class="view-btn ${this.viewMode === 'list' ? 'active' : ''}" 
                            @click=${() => this.viewMode = 'list'}>📋 List</button>
                </div>
            </div>

            <!-- Stats -->
            <div class="stats-bar">
                <div class="stat-item">
                    <div class="stat-value">${this.entities.length}</div>
                    <div class="stat-label">Total Entities</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${this.entities.filter(e => e.status === 'active').length}</div>
                    <div class="stat-label">Active</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${this.entities.reduce((sum, e) => sum + (e.interactions || 0), 0)}</div>
                    <div class="stat-label">Interactions</div>
                </div>
            </div>

            <!-- Entity List/Grid -->
            ${filteredEntities.length === 0 ? this.renderEmptyState() : 
              this.viewMode === 'grid' ? this.renderGridView(filteredEntities) : 
              this.renderListView(filteredEntities)}

            <!-- Detail View -->
            ${this.selectedEntity ? this.renderDetailView() : ''}
        `;
    }

    renderGridView(entities) {
        return html`
            <div class="entity-grid">
                ${entities.map(entity => html`
                    <div class="entity-card ${this.selectedEntity?.id === entity.id ? 'selected' : ''}"
                         @click=${() => this.selectEntity(entity)}>
                        <div class="entity-status-badge status-${entity.status || 'active'}"></div>
                        <div class="entity-icon">${this.getEntityIcon(entity)}</div>
                        <div class="entity-name">${entity.name}</div>
                        <div class="entity-meta">Witness: ${entity.witness || 'Unknown'}</div>
                        <div class="attribute-bars">
                            ${Object.entries(entity.attributes || {}).map(([key, value]) => html`
                                <div class="attribute-bar">
                                    <div class="attribute-bar-fill" style="width: ${value * 10}%"></div>
                                </div>
                            `)}
                        </div>
                    </div>
                `)}
            </div>
        `;
    }

    renderListView(entities) {
        return html`
            <div class="entity-list">
                ${entities.map(entity => html`
                    <div class="entity-row ${this.selectedEntity?.id === entity.id ? 'selected' : ''}"
                         @click=${() => this.selectEntity(entity)}>
                        <div class="row-status status-${entity.status || 'active'}"></div>
                        <div class="row-icon">${this.getEntityIcon(entity)}</div>
                        <div class="row-info">
                            <div class="row-name">${entity.name}</div>
                            <div class="row-details">Born: ${new Date(entity.birthDate).toLocaleDateString()}</div>
                        </div>
                        <div class="row-attributes">
                            <span>Wis: ${entity.attributes?.wisdom || 5}</span>
                            <span>Spd: ${entity.attributes?.speed || 5}</span>
                            <span>Res: ${entity.attributes?.resilience || 5}</span>
                            <span>Mys: ${entity.attributes?.mystery || 5}</span>
                        </div>
                    </div>
                `)}
            </div>
        `;
    }

    renderDetailView() {
        return html`
            <div class="detail-view">
                <div class="detail-header">
                    <span class="detail-title">${this.selectedEntity.name}</span>
                    <button class="detail-close" @click=${() => this.selectedEntity = null}>✕</button>
                </div>

                <div class="detail-grid">
                    <div>
                        <div class="detail-field">
                            <div class="detail-label">Entity ID</div>
                            <div class="detail-value">${this.selectedEntity.id}</div>
                        </div>
                        <div class="detail-field">
                            <div class="detail-label">Birth Date</div>
                            <div class="detail-value">${new Date(this.selectedEntity.birthDate).toLocaleString()}</div>
                        </div>
                        <div class="detail-field">
                            <div class="detail-label">Witness</div>
                            <div class="detail-value">${this.selectedEntity.witness || 'Unknown'}</div>
                        </div>
                        <div class="detail-field">
                            <div class="detail-label">Status</div>
                            <div class="detail-value">${this.selectedEntity.status || 'Active'}</div>
                        </div>
                    </div>

                    <div>
                        <div class="detail-field">
                            <div class="detail-label">Attributes</div>
                            ${Object.entries(this.selectedEntity.attributes || {}).map(([key, value]) => html`
                                <div class="attribute-meter">
                                    <div class="meter-label">
                                        <span>${key.charAt(0).toUpperCase() + key.slice(1)}</span>
                                        <span>${value}/10</span>
                                    </div>
                                    <div class="meter-bar">
                                        <div class="meter-fill" style="width: ${value * 10}%"></div>
                                    </div>
                                </div>
                            `)}
                        </div>
                        <div class="detail-field">
                            <div class="detail-label">Interactions</div>
                            <div class="detail-value">${this.selectedEntity.interactions || 0}</div>
                        </div>
                    </div>
                </div>

                <div class="memory-timeline">
                    <div class="detail-label">Memory Timeline</div>
                    ${(this.selectedEntity.memories || []).map(memory => html`
                        <div class="memory-item">
                            <div class="memory-time">${new Date(memory.timestamp).toLocaleString()}</div>
                            <div>${memory.content}</div>
                        </div>
                    `)}
                </div>
            </div>
        `;
    }

    renderEmptyState() {
        return html`
            <div class="empty-state">
                <div class="empty-icon">👥</div>
                <div class="empty-title">No Entities Found</div>
                <div class="empty-desc">
                    ${this.searchTerm ? 'No entities match your search criteria.' : 
                      'Use the Birth Ceremony to create your first entity.'}
                </div>
            </div>
        `;
    }

    handleSearch(e) {
        this.searchTerm = e.target.value;
    }

    handleFilterChange(e) {
        this.filterStatus = e.target.value;
    }

    getFilteredEntities() {
        let filtered = [...this.entities];

        // Apply status filter
        if (this.filterStatus !== 'all') {
            filtered = filtered.filter(e => e.status === this.filterStatus);
        }

        // Apply search filter
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(e => 
                e.name.toLowerCase().includes(term) ||
                (e.witness && e.witness.toLowerCase().includes(term))
            );
        }

        return filtered;
    }

    getEntityIcon(entity) {
        const icons = {
            sentinel: '🛡️',
            oracle: '🔮',
            phantom: '👻',
            consciousness: '🧠'
        };
        return icons[entity.type] || '👤';
    }

    selectEntity(entity) {
        this.selectedEntity = entity;
    }

    loadEntities() {
        if (window.memoryCore && window.memoryCore.getEntities) {
            this.entities = window.memoryCore.getEntities() || [];
        }
    }
}

customElements.define('entity-profiles', EntityProfiles);
