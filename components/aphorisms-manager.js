import {LitElement, html, css} from 'lit';

class AphorismsManager extends LitElement {
    static get properties() {
        return {
            aphorisms: {type: Array},
            categories: {type: Array},
            activeCategory: {type: String},
            showAphorism: {type: Object},
            editMode: {type: Boolean},
            favoriteIds: {type: Set}
        };
    }

    constructor() {
        super();
        this.aphorisms = [];
        this.categories = [
            { id: 'wisdom', name: 'Wisdom', icon: '🦉', color: '#0a84ff' },
            { id: 'paradox', name: 'Paradox', icon: '🌀', color: '#bf5af2' },
            { id: 'truth', name: 'Truth', icon: '⚡', color: '#ff9f0a' },
            { id: 'mystery', name: 'Mystery', icon: '🌙', color: '#5e5ce6' },
            { id: 'cosmic', name: 'Cosmic', icon: '🌌', color: '#30d158' }
        ];
        this.activeCategory = 'all';
        this.showAphorism = null;
        this.editMode = false;
        this.favoriteIds = new Set();
        this.loadAphorisms();
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

            /* Aphorism of the Day */
            .daily-aphorism {
                background: linear-gradient(135deg, #2c2c2e 0%, #3c3c3e 100%);
                border-radius: 12px;
                padding: 25px;
                margin-bottom: 25px;
                border: 1px solid #0a84ff;
                position: relative;
                overflow: hidden;
            }

            .daily-aphorism::before {
                content: '"';
                position: absolute;
                top: -20px;
                left: -10px;
                font-size: 120px;
                color: rgba(10, 132, 255, 0.1);
                font-family: serif;
            }

            .daily-label {
                color: #0a84ff;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 10px;
            }

            .daily-text {
                font-size: 24px;
                line-height: 1.4;
                margin-bottom: 15px;
                position: relative;
                z-index: 1;
            }

            .daily-author {
                color: #98989e;
                font-style: italic;
                text-align: right;
            }

            /* Controls */
            .aphorism-controls {
                display: flex;
                gap: 15px;
                margin-bottom: 20px;
                flex-wrap: wrap;
                align-items: center;
            }

            .category-filter {
                display: flex;
                gap: 5px;
                background: #2c2c2e;
                padding: 4px;
                border-radius: 8px;
                flex-wrap: wrap;
            }

            .category-btn {
                background: none;
                border: none;
                color: #98989e;
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 5px;
            }

            .category-btn:hover {
                background: #3c3c3e;
                color: #fff;
            }

            .category-btn.active {
                background: #0a84ff;
                color: #fff;
            }

            .create-btn {
                background: #0a84ff;
                color: #fff;
                border: none;
                padding: 8px 20px;
                border-radius: 8px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                margin-left: auto;
            }

            /* Aphorisms Grid */
            .aphorisms-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 15px;
                margin-bottom: 20px;
            }

            .aphorism-card {
                background: #2c2c2e;
                border-radius: 10px;
                padding: 20px;
                border: 1px solid #38383a;
                transition: all 0.2s;
                cursor: pointer;
                position: relative;
            }

            .aphorism-card:hover {
                transform: translateY(-2px);
                border-color: #0a84ff;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            }

            .aphorism-card.favorite {
                border-color: #ff9f0a;
                background: linear-gradient(135deg, #2c2c2e 0%, #3c3c2e 100%);
            }

            .card-category {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 10px;
                font-weight: 600;
                margin-bottom: 15px;
            }

            .card-text {
                font-size: 14px;
                line-height: 1.6;
                margin-bottom: 15px;
                quotes: "“" "”" "‘" "’";
            }

            .card-text::before {
                content: '“';
                color: #0a84ff;
                font-size: 20px;
                margin-right: 2px;
            }

            .card-text::after {
                content: '”';
                color: #0a84ff;
                font-size: 20px;
                margin-left: 2px;
            }

            .card-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 11px;
                color: #98989e;
            }

            .card-author {
                font-style: italic;
            }

            .favorite-btn {
                background: none;
                border: none;
                color: #ff9f0a;
                font-size: 18px;
                cursor: pointer;
                padding: 0 5px;
            }

            /* Detail View */
            .detail-view {
                background: #2c2c2e;
                border-radius: 12px;
                padding: 30px;
                margin-top: 20px;
                border: 1px solid #38383a;
                animation: slideUp 0.3s ease;
            }

            @keyframes slideUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .detail-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }

            .detail-category {
                padding: 6px 16px;
                border-radius: 25px;
                font-size: 12px;
                font-weight: 600;
            }

            .detail-actions {
                display: flex;
                gap: 10px;
            }

            .detail-action-btn {
                background: #3c3c3e;
                border: none;
                color: #98989e;
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 12px;
                cursor: pointer;
            }

            .detail-action-btn:hover {
                background: #4c4c4e;
                color: #fff;
            }

            .detail-text {
                font-size: 24px;
                line-height: 1.6;
                margin-bottom: 20px;
                padding: 20px 0;
                border-bottom: 1px solid #38383a;
            }

            .detail-meta {
                display: flex;
                gap: 20px;
                color: #98989e;
                font-size: 13px;
                margin-bottom: 20px;
            }

            .detail-tags {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }

            .tag {
                background: #3c3c3e;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 11px;
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
                min-height: 120px;
                resize: vertical;
            }

            .tags-input {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }

            .tag-input {
                display: flex;
                gap: 5px;
            }

            .tag-input input {
                flex: 1;
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
        const daily = this.getDailyAphorism();

        return html`
            <h3>💫 Aphorisms</h3>
            <p class="section-desc">Wisdom, paradoxes, and truths from the depths of the Genesis Archive.</p>

            <!-- Aphorism of the Day -->
            ${daily ? html`
                <div class="daily-aphorism">
                    <div class="daily-label">Aphorism of the Day</div>
                    <div class="daily-text">${daily.text}</div>
                    <div class="daily-author">— ${daily.author || 'Unknown'}</div>
                </div>
            ` : ''}

            <!-- Controls -->
            <div class="aphorism-controls">
                <div class="category-filter">
                    <button class="category-btn ${this.activeCategory === 'all' ? 'active' : ''}"
                            @click=${() => this.activeCategory = 'all'}>
                        🏛️ All
                    </button>
                    ${this.categories.map(cat => html`
                        <button class="category-btn ${this.activeCategory === cat.id ? 'active' : ''}"
                                @click=${() => this.activeCategory = cat.id}
                                style="color: ${this.activeCategory === cat.id ? '#fff' : cat.color}">
                            ${cat.icon} ${cat.name}
                        </button>
                    `)}
                </div>

                <button class="create-btn" @click=${this.createAphorism}>
                    ✨ Add Aphorism
                </button>
            </div>

            <!-- Aphorisms Grid -->
            <div class="aphorisms-grid">
                ${this.getFilteredAphorisms().map(aph => this.renderAphorismCard(aph))}
                
                ${this.getFilteredAphorisms().length === 0 ? html`
                    <div class="empty-state">
                        <div class="empty-icon">💫</div>
                        <div>No aphorisms found</div>
                    </div>
                ` : ''}
            </div>

            <!-- Detail/Edit View -->
            ${this.showAphorism && !this.editMode ? this.renderDetailView() : ''}
            ${this.editMode ? this.renderEditForm() : ''}
        `;
    }

    renderAphorismCard(aph) {
        const category = this.categories.find(c => c.id === aph.category) || this.categories[0];
        const isFavorite = this.favoriteIds.has(aph.id);

        return html`
            <div class="aphorism-card ${isFavorite ? 'favorite' : ''}" 
                 @click=${() => this.showAphorismDetail(aph)}>
                <div class="card-category" style="background: ${category.color}20; color: ${category.color}">
                    ${category.icon} ${category.name}
                </div>
                <div class="card-text">${aph.text}</div>
                <div class="card-footer">
                    <span class="card-author">${aph.author || 'Unknown'}</span>
                    <button class="favorite-btn" @click=${(e) => this.toggleFavorite(e, aph.id)}>
                        ${isFavorite ? '★' : '☆'}
                    </button>
                </div>
            </div>
        `;
    }

    renderDetailView() {
        const category = this.categories.find(c => c.id === this.showAphorism.category) || this.categories[0];

        return html`
            <div class="detail-view">
                <div class="detail-header">
                    <div class="detail-category" style="background: ${category.color}20; color: ${category.color}">
                        ${category.icon} ${category.name}
                    </div>
                    <div class="detail-actions">
                        <button class="detail-action-btn" @click=${() => this.editMode = true}>✏️ Edit</button>
                        <button class="detail-action-btn" @click=${this.deleteAphorism}>🗑️ Delete</button>
                        <button class="detail-action-btn" @click=${() => this.showAphorism = null}>✕ Close</button>
                    </div>
                </div>

                <div class="detail-text">${this.showAphorism.text}</div>

                <div class="detail-meta">
                    <span>Author: ${this.showAphorism.author || 'Unknown'}</span>
                    <span>Added: ${new Date(this.showAphorism.dateAdded).toLocaleDateString()}</span>
                </div>

                ${this.showAphorism.tags?.length > 0 ? html`
                    <div class="detail-tags">
                        ${this.showAphorism.tags.map(tag => html`
                            <span class="tag">#${tag}</span>
                        `)}
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderEditForm() {
        return html`
            <div class="detail-view">
                <h4 style="margin-bottom: 20px; color: #0a84ff;">
                    ${this.showAphorism?.id ? 'Edit Aphorism' : 'New Aphorism'}
                </h4>

                <div class="edit-form">
                    <div class="form-group">
                        <label>Category</label>
                        <select @change=${(e) => this.updateDraft('category', e.target.value)}>
                            ${this.categories.map(cat => html`
                                <option value=${cat.id} 
                                        ?selected=${this.showAphorism?.category === cat.id}>
                                    ${cat.icon} ${cat.name}
                                </option>
                            `)}
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Aphorism Text</label>
                        <textarea @input=${(e) => this.updateDraft('text', e.target.value)}
