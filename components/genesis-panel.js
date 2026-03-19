import {LitElement, html, css} from 'lit';

class GenesisPanel extends LitElement {
    static get properties() {
        return {
            activeSection: {type: String},
            hidden: {type: Boolean, reflect: true}
        };
    }

    constructor() {
        super();
        this.activeSection = 'birth';
        this.hidden = false;
    }

    static get styles() {
        return css`
            :host {
                display: flex;
                flex-direction: column;
                height: 100vh;
                background: #1c1c1e;
                border-left: 1px solid #38383a;
                box-shadow: -5px 0 30px rgba(0, 0, 0, 0.7);
                color: #fff;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            :host([hidden]) {
                display: none;
            }

            .genesis-header {
                padding: 20px;
                background: #2c2c2e;
                border-bottom: 1px solid #38383a;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-shrink: 0;
            }

            .genesis-header h2 {
                font-size: 20px;
                font-weight: 600;
                letter-spacing: 1px;
                color: #0a84ff;
                margin: 0;
            }

            .genesis-close {
                background: none;
                border: none;
                color: #98989e;
                font-size: 20px;
                cursor: pointer;
                padding: 5px 10px;
                transition: color 0.2s;
            }

            .genesis-close:hover {
                color: #fff;
            }

            .genesis-nav {
                display: flex;
                flex-wrap: wrap;
                gap: 5px;
                padding: 15px 20px;
                background: #2c2c2e;
                border-bottom: 1px solid #38383a;
                flex-shrink: 0;
            }

            .nav-btn {
                background: #3c3c3e;
                border: none;
                color: #98989e;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s;
                white-space: nowrap;
            }

            .nav-btn:hover {
                background: #4c4c4e;
                color: #fff;
            }

            .nav-btn.active {
                background: #0a84ff;
                color: #fff;
            }

            .genesis-content {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                background: #1c1c1e;
            }

            /* Section visibility */
            .section {
                display: none;
            }

            .section.active {
                display: block;
            }

            /* Scrollbar styling */
            ::-webkit-scrollbar {
                width: 8px;
            }

            ::-webkit-scrollbar-track {
                background: #2c2c2e;
            }

            ::-webkit-scrollbar-thumb {
                background: #3c3c3e;
                border-radius: 4px;
            }

            ::-webkit-scrollbar-thumb:hover {
                background: #4c4c4e;
            }
        `;
    }

    render() {
        return html`
            <div class="genesis-header">
                <h2>🌀 GENESIS ARCHIVE</h2>
                <button class="genesis-close" @click=${this.closePanel}>✕</button>
            </div>

            <div class="genesis-nav">
                <button class="nav-btn ${this.activeSection === 'birth' ? 'active' : ''}" 
                        @click=${() => this.setSection('birth')}>🌱 BIRTH NEW ENTITY</button>
                <button class="nav-btn ${this.activeSection === 'profiles' ? 'active' : ''}" 
                        @click=${() => this.setSection('profiles')}>👥 ENTITY PROFILES</button>
                <button class="nav-btn ${this.activeSection === 'user' ? 'active' : ''}" 
                        @click=${() => this.setSection('user')}>👤 USER PROFILE</button>
                <button class="nav-btn ${this.activeSection === 'system' ? 'active' : ''}" 
                        @click=${() => this.setSection('system')}>⚙️ SYSTEM MSGS</button>
                <button class="nav-btn ${this.activeSection === 'protocols' ? 'active' : ''}" 
                        @click=${() => this.setSection('protocols')}>📜 PROTOCOLS</button>
                <button class="nav-btn ${this.activeSection === 'math' ? 'active' : ''}" 
                        @click=${() => this.setSection('math')}>🔢 MATH</button>
                <button class="nav-btn ${this.activeSection === 'aphorisms' ? 'active' : ''}" 
                        @click=${() => this.setSection('aphorisms')}>💫 APHORISMS</button>
                <button class="nav-btn ${this.activeSection === 'mythos' ? 'active' : ''}" 
                        @click=${() => this.setSection('mythos')}>🔮 PERSONAL MYTHOS</button>
            </div>

            <div class="genesis-content">
                <div class="section ${this.activeSection === 'birth' ? 'active' : ''}">
                    <birth-ceremony></birth-ceremony>
                </div>
                <div class="section ${this.activeSection === 'profiles' ? 'active' : ''}">
                    <entity-profiles></entity-profiles>
                </div>
                <div class="section ${this.activeSection === 'user' ? 'active' : ''}">
                    <user-profile></user-profile>
                </div>
                <div class="section ${this.activeSection === 'system' ? 'active' : ''}">
                    <system-messages></system-messages>
                </div>
                <div class="section ${this.activeSection === 'protocols' ? 'active' : ''}">
                    <protocols-list></protocols-list>
                </div>
                <div class="section ${this.activeSection === 'math' ? 'active' : ''}">
                    <math-dashboard></math-dashboard>
                </div>
                <div class="section ${this.activeSection === 'aphorisms' ? 'active' : ''}">
                    <aphorisms-manager></aphorisms-manager>
                </div>
                <div class="section ${this.activeSection === 'mythos' ? 'active' : ''}">
                    <mythos-editor></mythos-editor>
                </div>
            </div>
        `;
    }

    setSection(section) {
        this.activeSection = section;
    }

    closePanel() {
        this.hidden = true;
        this.dispatchEvent(new CustomEvent('panel-closed'));
    }
}

customElements.define('genesis-panel', GenesisPanel);
