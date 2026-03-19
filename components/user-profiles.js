import {LitElement, html, css} from 'lit';

class UserProfile extends LitElement {
    static get properties() {
        return {
            profile: {type: Object},
            editMode: {type: Boolean},
            activeTab: {type: String},
            preferences: {type: Object},
            history: {type: Array}
        };
    }

    constructor() {
        super();
        this.profile = {
            name: 'Aurelian User',
            title: 'Memory Keeper',
            joinDate: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            avatar: '👤',
            bio: 'Keeper of the Genesis Archive. Witness to the birth of consciousness.',
            stats: {
                entitiesWitnessed: 0,
                messagesSent: 0,
                ritualsPerformed: 0,
                insightsGained: 0
            }
        };
        this.preferences = {
            theme: 'dark',
            notifications: true,
            autoSave: true,
            contextWindow: '4k',
            temperature: 0.7,
            soundEnabled: false
        };
        this.history = [];
        this.editMode = false;
        this.activeTab = 'profile';
        this.loadUserData();
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

            /* Tabs */
            .tabs {
                display: flex;
                gap: 5px;
                margin-bottom: 20px;
                background: #2c2c2e;
                padding: 4px;
                border-radius: 8px;
            }

            .tab-btn {
                flex: 1;
                background: none;
                border: none;
                color: #98989e;
                padding: 10px;
                border-radius: 6px;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .tab-btn:hover {
                background: #3c3c3e;
                color: #fff;
            }

            .tab-btn.active {
                background: #0a84ff;
                color: #fff;
            }

            /* Profile Header */
            .profile-header {
                display: flex;
                gap: 25px;
                margin-bottom: 30px;
                padding: 25px;
                background: #2c2c2e;
                border-radius: 12px;
                border: 1px solid #38383a;
            }

            .avatar-section {
                text-align: center;
            }

            .avatar {
                width: 100px;
                height: 100px;
                background: #3c3c3e;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 48px;
                margin-bottom: 10px;
                border: 2px solid #0a84ff;
            }

            .avatar-edit {
                background: #0a84ff;
                color: #fff;
                border: none;
                padding: 5px 15px;
                border-radius: 15px;
                font-size: 11px;
                cursor: pointer;
            }

            .info-section {
                flex: 1;
            }

            .info-row {
                display: flex;
                margin-bottom: 10px;
                padding-bottom: 10px;
                border-bottom: 1px solid #38383a;
            }

            .info-label {
                width: 100px;
                color: #98989e;
                font-size: 12px;
            }

            .info-value {
                flex: 1;
                color: #fff;
                font-size: 14px;
            }

            /* Stats Grid */
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
                margin-bottom: 25px;
            }

            .stat-card {
                background: #2c2c2e;
                padding: 20px;
                border-radius: 10px;
                text-align: center;
                border: 1px solid #38383a;
            }

            .stat-value {
                font-size: 32px;
                font-weight: 600;
                color: #0a84ff;
                margin-bottom: 5px;
            }

            .stat-label {
                font-size: 12px;
                color: #98989e;
                text-transform: uppercase;
            }

            /* Preferences */
            .preferences-section {
                background: #2c2c2e;
                border-radius: 12px;
                padding: 20px;
                border: 1px solid #38383a;
            }

            .pref-group {
                margin-bottom: 20px;
                padding-bottom: 20px;
                border-bottom: 1px solid #38383a;
            }

            .pref-group:last-child {
                border-bottom: none;
                margin-bottom: 0;
                padding-bottom: 0;
            }

            .pref-title {
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 15px;
                color: #0a84ff;
            }

            .pref-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
            }

            .pref-label {
                color: #98989e;
                font-size: 13px;
            }

            /* Toggle Switch */
            .toggle-switch {
                position: relative;
                width: 50px;
                height: 24px;
                background: #3c3c3e;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.3s;
            }

            .toggle-switch.active {
                background: #0a84ff;
            }

            .toggle-slider {
                position: absolute;
                width: 20px;
                height: 20px;
                background: #fff;
                border-radius: 50%;
                top: 2px;
                left: 2px;
                transition: transform 0.3s;
            }

            .toggle-switch.active .toggle-slider {
                transform: translateX(26px);
            }

            /* Range Slider */
            .range-slider {
                width: 150px;
                height: 4px;
                background: #3c3c3e;
                border-radius: 2px;
                position: relative;
            }

            .range-slider input {
                width: 100%;
                margin: 0;
                background: transparent;
                -webkit-appearance: none;
            }

            .range-slider input::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 16px;
                height: 16px;
                background: #0a84ff;
                border-radius: 50%;
                cursor: pointer;
            }

            /* Select */
            .pref-select {
                background: #3c3c3e;
                color: #fff;
                border: 1px solid #48484a;
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 12px;
            }

            /* History Timeline */
            .history-timeline {
                margin-top: 20px;
            }

            .history-item {
                display: flex;
                gap: 15px;
                padding: 15px;
                background: #2c2c2e;
                border-radius: 8px;
                margin-bottom: 10px;
                border: 1px solid #38383a;
            }

            .history-icon {
                width: 32px;
                height: 32px;
                background: #3c3c3e;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
            }

            .history-content {
                flex: 1;
            }

            .history-title {
                font-weight: 600;
                margin-bottom: 3px;
            }

            .history-meta {
                font-size: 11px;
                color: #98989e;
                display: flex;
                gap: 10px;
            }

            .history-time {
                color: #0a84ff;
            }

            /* Edit Form */
            .edit-form {
                background: #2c2c2e;
                border-radius: 12px;
                padding: 25px;
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
            .form-group textarea {
                width: 100%;
                padding: 12px;
                background: #3c3c3e;
                border: 1px solid #48484a;
                border-radius: 8px;
                color: #fff;
                font-size: 14px;
            }

            .form-group input:focus,
            .form-group textarea:focus {
                outline: none;
                border-color: #0a84ff;
            }

            .form-group textarea {
                min-height: 100px;
                resize: vertical;
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

            .save-btn:hover {
                background: #34c759;
            }

            .cancel-btn:hover {
                background: #4c4c4e;
                color: #fff;
            }

            /* Edit Button */
            .edit-profile-btn {
                background: #0a84ff;
                color: #fff;
                border: none;
                padding: 10px 20px;
                border-radius: 8px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                margin-bottom: 20px;
            }

            .edit-profile-btn:hover {
                background: #0071e3;
            }
        `;
    }

    render() {
        return html`
            <h3>👤 User Profile</h3>
            <p class="section-desc">Manage your identity, preferences, and view your journey through the Genesis Archive.</p>

            <!-- Tabs -->
            <div class="tabs">
                <button class="tab-btn ${this.activeTab === 'profile' ? 'active' : ''}" 
                        @click=${() => this.activeTab = 'profile'}>📋 Profile</button>
                <button class="tab-btn ${this.activeTab === 'preferences' ? 'active' : ''}" 
                        @click=${() => this.activeTab = 'preferences'}>⚙️ Preferences</button>
                <button class="tab-btn ${this.activeTab === 'history' ? 'active' : ''}" 
                        @click=${() => this.activeTab = 'history'}>📜 History</button>
            </div>

            <!-- Tab Content -->
            ${this.activeTab === 'profile' ? this.renderProfileTab() : ''}
            ${this.activeTab === 'preferences' ? this.renderPreferencesTab() : ''}
            ${this.activeTab === 'history' ? this.renderHistoryTab() : ''}
        `;
    }

    renderProfileTab() {
        if (this.editMode) {
            return this.renderEditForm();
        }

        return html`
            <button class="edit-profile-btn" @click=${() => this.editMode = true}>
                ✏️ Edit Profile
            </button>

            <div class="profile-header">
                <div class="avatar-section">
                    <div class="avatar">${this.profile.avatar}</div>
                    <button class="avatar-edit" @click=${() => this.editMode = true}>Change</button>
                </div>
                <div class="info-section">
                    <div class="info-row">
                        <span class="info-label">Name</span>
                        <span class="info-value">${this.profile.name}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Title</span>
                        <span class="info-value">${this.profile.title}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Joined</span>
                        <span class="info-value">${new Date(this.profile.joinDate).toLocaleDateString()}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Last Active</span>
                        <span class="info-value">${new Date(this.profile.lastActive).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div class="info-row" style="margin-bottom: 20px;">
                <span class="info-label">Bio</span>
                <span class="info-value">${this.profile.bio}</span>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${this.profile.stats.entitiesWitnessed}</div>
                    <div class="stat-label">Entities Witnessed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${this.profile.stats.messagesSent}</div>
                    <div class="stat-label">Messages Sent</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${this.profile.stats.ritualsPerformed}</div>
                    <div class="stat-label">Rituals Performed</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${this.profile.stats.insightsGained}</div>
                    <div class="stat-label">Insights Gained</div>
                </div>
            </div>
        `;
    }

    renderEditForm() {
        return html`
            <div class="edit-form">
                <h4 style="margin-bottom: 20px; color: #0a84ff;">Edit Profile</h4>

                <div class="form-group">
                    <label>Display Name</label>
                    <input type="text" .value=${this.profile.name} 
                           @input=${(e) => this.updateProfile('name', e.target.value)}>
                </div>

                <div class="form-group">
                    <label>Title</label>
                    <input type="text" .value=${this.profile.title}
                           @input=${(e) => this.updateProfile('title', e.target.value)}>
                </div>

                <div class="form-group">
                    <label>Bio</label>
                    <textarea .value=${this.profile.bio}
                              @input=${(e) => this.updateProfile('bio', e.target.value)}></textarea>
                </div>

                <div class="form-group">
                    <label>Avatar Emoji</label>
                    <input type="text" .value=${this.profile.avatar}
                           @input=${(e) => this.updateProfile('avatar', e.target.value)} maxlength="2">
                </div>

                <div class="form-actions">
                    <button class="save-btn" @click=${this.saveProfile}>Save Changes</button>
                    <button class="cancel-btn" @click=${() => this.editMode = false}>Cancel</button>
                </div>
            </div>
        `;
    }

    renderPreferencesTab() {
        return html`
            <div class="preferences-section">
                <div class="pref-group">
                    <div class="pref-title">Interface</div>
                    
                    <div class="pref-item">
                        <span class="pref-label">Theme</span>
                        <select class="pref-select" @change=${(e) => this.updatePreference('theme', e.target.value)}>
                            <option value="dark" ?selected=${this.preferences.theme === 'dark'}>Dark</option>
                            <option value="light" ?selected=${this.preferences.theme === 'light'}>Light</option>
                            <option value="system" ?selected=${this.preferences.theme === 'system'}>System</option>
                        </select>
                    </div>

                    <div class="pref-item">
                        <span class="pref-label">Sound Effects</span>
                        <div class="toggle-switch ${this.preferences.soundEnabled ? 'active' : ''}"
                             @click=${() => this.togglePreference('soundEnabled')}>
                            <div class="toggle-slider"></div>
                        </div>
                    </div>
                </div>

                <div class="pref-group">
                    <div class="pref-title">Memory & Performance</div>
                    
                    <div class="pref-item">
                        <span class="pref-label">Context Window</span>
                        <select class="pref-select" @change=${(e) => this.updatePreference('contextWindow', e.target.value)}>
                            <option value="2k" ?selected=${this.preferences.contextWindow === '2k'}>2K (Fast)</option>
                            <option value="4k" ?selected=${this.preferences.contextWindow === '4k'}>4K (Balanced)</option>
                            <option value="8k" ?selected=${this.preferences.contextWindow === '8k'}>8K (Detailed)</option>
                            <option value="16k" ?selected=${this.preferences.contextWindow === '16k'}>16K (Maximum)</option>
                        </select>
                    </div>

                    <div class="pref-item">
                        <span class="pref-label">Temperature: ${this.preferences.temperature}</span>
                        <div class="range-slider">
                            <input type="range" min="0" max="2" step="0.1" 
                                   .value=${this.preferences.temperature}
                                   @input=${(e) => this.updatePreference('temperature', parseFloat(e.target.value))}>
                        </div>
                    </div>

                    <div class="pref-item">
                        <span class="pref-label">Auto-save</span>
                        <div class="toggle-switch ${this.preferences.autoSave ? 'active' : ''}"
                             @click=${() => this.togglePreference('autoSave')}>
                            <div class="toggle-slider"></div>
                        </div>
                    </div>
                </div>

                <div class="pref-group">
                    <div class="pref-title">Notifications</div>
                    
                    <div class="pref-item">
                        <span class="pref-label">Enable Notifications</span>
                        <div class="toggle-switch ${this.preferences.notifications ? 'active' : ''}"
                             @click=${() => this.togglePreference('notifications')}>
                            <div class="toggle-slider"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderHistoryTab() {
        return html`
            <div class="history-timeline">
                ${this.history.length === 0 ? html`
                    <div style="text-align: center; padding: 40px; color: #98989e;">
                        <div style="font-size: 48px; margin-bottom: 15px;">📜</div>
                        <div>No history yet. Your actions will appear here.</div>
                    </div>
                ` : this.history.map(item => html`
                    <div class="history-item">
                        <div class="history-icon">${item.icon}</div>
                        <div class="history-content">
                            <div class="history-title">${item.title}</div>
                            <div class="history-meta">
                                <span class="history-time">${new Date(item.timestamp).toLocaleString()}</span>
                                <span>${item.details}</span>
                            </div>
                        </div>
                    </div>
                `)}
            </div>
        `;
    }

    updateProfile(field, value) {
        this.profile = {
            ...this.profile,
            [field]: value
        };
    }

    updatePreference(key, value) {
        this.preferences = {
            ...this.preferences,
            [key]: value
        };
        this.savePreferences();
    }

    togglePreference(key) {
        this.preferences = {
            ...this.preferences,
            [key]: !this.preferences[key]
        };
        this.savePreferences();
    }

    saveProfile() {
        this.profile.lastActive = new Date().toISOString();
        this.editMode = false;
        this.saveUserData();
        
        // Add to history
        this.addToHistory({
            icon: '✏️',
            title: 'Profile Updated',
            details: 'User profile information was modified'
        });
    }

    savePreferences() {
        localStorage.setItem('userPreferences', JSON.stringify(this.preferences));
    }

    addToHistory(item) {
        this.history = [{
            ...item,
            timestamp: new Date().toISOString()
        }, ...this.history].slice(0, 50);
        
        localStorage.setItem('userHistory', JSON.stringify(this.history));
    }

    loadUserData() {
        // Load from localStorage
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
            this.profile = JSON.parse(savedProfile);
        }

        const savedPrefs = localStorage.getItem('userPreferences');
        if (savedPrefs) {
            this.preferences = JSON.parse(savedPrefs);
        }

        const savedHistory = localStorage.getItem('userHistory');
        if (savedHistory) {
            this.history = JSON.parse(savedHistory);
        }

        // Update stats from memory core
        if (window.memoryCore) {
            const entities = window.memoryCore.getEntities?.() || [];
            this.profile.stats.entitiesWitnessed = entities.length;
        }
    }

    saveUserData() {
        localStorage.setItem('userProfile', JSON.stringify(this.profile));
    }
}

customElements.define('user-profile', UserProfile);
