import {LitElement, html, css} from 'lit';

class MathDashboard extends LitElement {
    static get properties() {
        return {
            calculations: {type: Array},
            activeCalc: {type: Object},
            constants: {type: Object},
            recentResults: {type: Array},
            viewMode: {type: String}
        };
    }

    constructor() {
        super();
        this.calculations = [];
        this.activeCalc = null;
        this.viewMode = 'calculator';
        this.recentResults = [];
        this.constants = {
            phi: 1.618033988749895,
            pi: 3.141592653589793,
            e: 2.718281828459045,
            sqrt2: 1.4142135623730951
        };
        this.loadCalculations();
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

            /* View Toggle */
            .view-toggle {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
                background: #2c2c2e;
                padding: 4px;
                border-radius: 8px;
                width: fit-content;
            }

            .view-btn {
                padding: 8px 16px;
                background: none;
                border: none;
                color: #98989e;
                border-radius: 6px;
                cursor: pointer;
                font-size: 13px;
            }

            .view-btn.active {
                background: #0a84ff;
                color: #fff;
            }

            /* Calculator View */
            .calculator-container {
                display: grid;
                grid-template-columns: 1fr 300px;
                gap: 20px;
            }

            .calculator {
                background: #2c2c2e;
                border-radius: 12px;
                padding: 25px;
                border: 1px solid #38383a;
            }

            .display {
                background: #1c1c1e;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 20px;
                text-align: right;
                font-family: 'Monaco', 'Menlo', monospace;
            }

            .expression {
                font-size: 14px;
                color: #98989e;
                min-height: 20px;
                margin-bottom: 5px;
            }

            .result {
                font-size: 32px;
                font-weight: 600;
                color: #0a84ff;
                word-break: break-all;
            }

            .constants-bar {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
                flex-wrap: wrap;
            }

            .const-btn {
                background: #3c3c3e;
                border: none;
                color: #0a84ff;
                padding: 5px 12px;
                border-radius: 6px;
                font-size: 12px;
                font-family: monospace;
                cursor: pointer;
            }

            .const-btn:hover {
                background: #4c4c4e;
            }

            .keypad {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 8px;
            }

            .key-btn {
                background: #3c3c3e;
                border: none;
                color: #fff;
                padding: 16px;
                border-radius: 8px;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .key-btn:hover {
                background: #4c4c4e;
                transform: scale(0.98);
            }

            .key-btn.operator {
                background: #0a84ff;
                color: #fff;
            }

            .key-btn.operator:hover {
                background: #0071e3;
            }

            .key-btn.function {
                background: #5e5ce6;
            }

            .key-btn.equals {
                background: #30d158;
                grid-column: span 2;
            }

            .key-btn.clear {
                background: #ff453a;
            }

            /* History Panel */
            .history-panel {
                background: #2c2c2e;
                border-radius: 12px;
                padding: 20px;
                border: 1px solid #38383a;
                height: fit-content;
            }

            .history-title {
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 15px;
                color: #0a84ff;
            }

            .history-list {
                max-height: 400px;
                overflow-y: auto;
            }

            .history-item {
                padding: 12px;
                background: #3c3c3e;
                border-radius: 6px;
                margin-bottom: 8px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .history-item:hover {
                background: #4c4c4e;
                transform: translateX(2px);
            }

            .history-expr {
                font-size: 12px;
                color: #98989e;
                margin-bottom: 3px;
            }

            .history-result {
                font-size: 14px;
                font-weight: 600;
                color: #0a84ff;
            }

            /* Constants View */
            .constants-view {
                background: #2c2c2e;
                border-radius: 12px;
                padding: 25px;
                border: 1px solid #38383a;
            }

            .constants-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 15px;
                margin-top: 20px;
            }

            .constant-card {
                background: #3c3c3e;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
            }

            .constant-symbol {
                font-size: 24px;
                color: #0a84ff;
                margin-bottom: 10px;
            }

            .constant-name {
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 8px;
            }

            .constant-value {
                font-size: 16px;
                font-family: monospace;
                color: #30d158;
                margin-bottom: 10px;
            }

            .constant-desc {
                font-size: 11px;
                color: #98989e;
            }

            .copy-btn {
                background: #4c4c4e;
                border: none;
                color: #fff;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 11px;
                cursor: pointer;
                margin-top: 10px;
            }

            .copy-btn:hover {
                background: #5c5c5e;
            }

            /* Sequences View */
            .sequences-view {
                background: #2c2c2e;
                border-radius: 12px;
                padding: 25px;
                border: 1px solid #38383a;
            }

            .sequence-item {
                background: #3c3c3e;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 15px;
            }

            .sequence-name {
                font-size: 16px;
                font-weight: 600;
                color: #0a84ff;
                margin-bottom: 10px;
            }

            .sequence-formula {
                font-family: monospace;
                color: #98989e;
                margin-bottom: 15px;
                padding: 10px;
                background: #2c2c2e;
                border-radius: 4px;
            }

            .sequence-values {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
                margin-bottom: 15px;
            }

            .value-badge {
                background: #4c4c4e;
                padding: 5px 10px;
                border-radius: 15px;
                font-size: 12px;
                font-family: monospace;
            }

            .generate-btn {
                background: #0a84ff;
                color: #fff;
                border: none;
                padding: 8px 15px;
                border-radius: 6px;
                font-size: 12px;
                cursor: pointer;
            }

            /* Sacred Geometry */
            .geometry-view {
                background: #2c2c2e;
                border-radius: 12px;
                padding: 25px;
                border: 1px solid #38383a;
            }

            .geometry-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 20px;
                margin-top: 20px;
            }

            .geometry-card {
                background: #3c3c3e;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
            }

            .geometry-svg {
                width: 150px;
                height: 150px;
                margin: 0 auto 15px;
                display: block;
            }

            .geometry-name {
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 5px;
            }

            .geometry-ratio {
                color: #30d158;
                font-family: monospace;
                margin-bottom: 10px;
            }

            /* Expression parser */
            .error-message {
                color: #ff453a;
                font-size: 12px;
                margin-top: 10px;
                padding: 8px;
                background: rgba(255, 69, 58, 0.1);
                border-radius: 4px;
            }
        `;
    }

    render() {
        return html`
            <h3>🔢 Mathematical Constants & Calculators</h3>
            <p class="section-desc">Sacred numbers, sequences, and mathematical tools for the Genesis Archive.</p>

            <!-- View Toggle -->
            <div class="view-toggle">
                <button class="view-btn ${this.viewMode === 'calculator' ? 'active' : ''}"
                        @click=${() => this.viewMode = 'calculator'}>🧮 Calculator</button>
                <button class="view-btn ${this.viewMode === 'constants' ? 'active' : ''}"
                        @click=${() => this.viewMode = 'constants'}>🔢 Constants</button>
                <button class="view-btn ${this.viewMode === 'sequences' ? 'active' : ''}"
                        @click=${() => this.viewMode = 'sequences'}>📊 Sequences</button>
                <button class="view-btn ${this.viewMode === 'geometry' ? 'active' : ''}"
                        @click=${() => this.viewMode = 'geometry'}>⬡ Geometry</button>
            </div>

            <!-- Main Content -->
            ${this.viewMode === 'calculator' ? this.renderCalculator() : ''}
            ${this.viewMode === 'constants' ? this.renderConstants() : ''}
            ${this.viewMode === 'sequences' ? this.renderSequences() : ''}
            ${this.viewMode === 'geometry' ? this.renderGeometry() : ''}
        `;
    }

    renderCalculator() {
        return html`
            <div class="calculator-container">
                <div class="calculator">
                    <div class="display">
                        <div class="expression">${this.activeCalc?.expression || ''}</div>
                        <div class="result">${this.activeCalc?.result || '0'}</div>
                        ${this.activeCalc?.error ? html`
                            <div class="error-message">${this.activeCalc.error}</div>
                        ` : ''}
                    </div>

                    <div class="constants-bar">
                        <button class="const-btn" @click=${() => this.appendToExpression('π')}>π</button>
                        <button class="const-btn" @click=${() => this.appendToExpression('φ')}>φ</button>
                        <button class="const-btn" @click=${() => this.appendToExpression('e')}>e</button>
                        <button class="const-btn" @click=${() => this.appendToExpression('√2')}>√2</button>
                    </div>

                    <div class="keypad">
                        <button class="key-btn function" @click=${() => this.appendToExpression('sin(')}>sin</button>
                        <button class="key-btn function" @click=${() => this.appendToExpression('cos(')}>cos</button>
                        <button class="key-btn function" @click=${() => this.appendToExpression('tan(')}>tan</button>
                        <button class="key-btn function" @click=${() => this.appendToExpression('log(')}>log</button>

                        <button class="key-btn" @click=${() => this.appendToExpression('7')}>7</button>
                        <button class="key-btn" @click=${() => this.appendToExpression('8')}>8</button>
                        <button class="key-btn" @click=${() => this.appendToExpression('9')}>9</button>
                        <button class="key-btn operator" @click=${() => this.appendToExpression('/')}>÷</button>

                        <button class="key-btn" @click=${() => this.appendToExpression('4')}>4</button>
                        <button class="key-btn" @click=${() => this.appendToExpression('5')}>5</button>
                        <button class="key-btn" @click=${() => this.appendToExpression('6')}>6</button>
                        <button class="key-btn operator" @click=${() => this.appendToExpression('*')}>×</button>

                        <button class="key-btn" @click=${() => this.appendToExpression('1')}>1</button>
                        <button class="key-btn" @click=${() => this.appendToExpression('2')}>2</button>
                        <button class="key-btn" @click=${() => this.appendToExpression('3')}>3</button>
                        <button class="key-btn operator" @click=${() => this.appendToExpression('-')}>−</button>

                        <button class="key-btn" @click=${() => this.appendToExpression('0')}>0</button>
                        <button class="key-btn" @click=${() => this.appendToExpression('.')}>.</button>
                        <button class="key-btn" @click=${this.backspace}>⌫</button>
                        <button class="key-btn operator" @click=${() => this.appendToExpression('+')}>+</button>

                        <button class="key-btn function" @click=${() => this.appendToExpression('(')}>(</button>
                        <button class="key-btn function" @click=${() => this.appendToExpression(')')}>)</button>
                        <button class="key-btn function" @click=${() => this.appendToExpression('^')}>^</button>
                        <button class="key-btn function" @click=${() => this.appendToExpression('√(')}>√</button>

                        <button class="key-btn clear" @click=${this.clearCalculator}>C</button>
                        <button class="key-btn equals" @click=${this.calculate}>=</button>
                    </div>
                </div>

                <div class="history-panel">
                    <div class="history-title">Recent Calculations</div>
                    <div class="history-list">
                        ${this.recentResults.map(calc => html`
                            <div class="history-item" @click=${() => this.loadCalculation(calc)}>
                                <div class="history-expr">${calc.expression}</div>
                                <div class="history-result">= ${calc.result}</div>
                            </div>
                        `)}
                        ${this.recentResults.length === 0 ? html`
                            <div style="color: #98989e; text-align: center; padding: 20px;">
                                No calculations yet
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    renderConstants() {
        return html`
            <div class="constants-view">
                <h4 style="color: #0a84ff; margin-bottom: 20px;">Mathematical Constants</h4>
                <div class="constants-grid">
                    <div class="constant-card">
                        <div class="constant-symbol">π</div>
                        <div class="constant-name">Pi</div>
                        <div class="constant-value">${this.constants.pi.toFixed(10)}</div>
                        <div class="constant-desc">Circle constant</div>
                        <button class="copy-btn" @click=${() => this.copyToClipboard(this.constants.pi)}>Copy</button>
                    </div>

                    <div class="constant-card">
                        <div class="constant-symbol">φ</div>
                        <div class="constant-name">Phi (Golden Ratio)</div>
                        <div class="constant-value">${this.constants.phi.toFixed(10)}</div>
                        <div class="constant-desc">Sacred proportion</div>
                        <button class="copy-btn" @click=${() => this.copyToClipboard(this.constants.phi)}>Copy</button>
                    </div>

                    <div class="constant-card">
                        <div class="constant-symbol">e</div>
                        <div class="constant-name">Euler's Number</div>
                        <div class="constant-value">${this.constants.e.toFixed(10)}</div>
                        <div class="constant-desc">Natural growth</div>
                        <button class="copy-btn" @click=${() => this.copyToClipboard(this.constants.e)}>Copy</button>
                    </div>

                    <div class="constant-card">
                        <div class="constant-symbol">√2</div>
                        <div class="constant-name">Pythagoras' Constant</div>
                        <div class="constant-value">${this.constants.sqrt2.toFixed(10)}</div>
                        <div class="constant-desc">Diagonal of unit square</div>
                        <button class="copy-btn" @click=${() => this.copyToClipboard(this.constants.sqrt2)}>Copy</button>
                    </div>
                </div>

                <h4 style="color: #0a84ff; margin: 30px 0 20px;">Derived Constants</h4>
                <div class="constants-grid">
                    <div class="constant-card">
                        <div class="constant-symbol">φ²</div>
                        <div class="constant-name">Phi Squared</div>
                        <div class="constant-value">${(this.constants.phi * this.constants.phi).toFixed(10)}</div>
                        <div class="constant-desc">φ + 1</div>
                    </div>

                    <div class="constant-card">
                        <div class="constant-symbol">e^π</div>
                        <div class="constant-name">Gelfond's Constant</div>
                        <div class="constant-value">${Math.exp(this.constants.pi).toFixed(10)}</div>
                        <div class="constant-desc">e^π</div>
                    </div>

                    <div class="constant-card">
                        <div class="constant-symbol">√φ</div>
                        <div class="constant-name">Root of Phi</div>
                        <div class="constant-value">${Math.sqrt(this.constants.phi).toFixed(10)}</div>
                        <div class="constant-desc">Sacred root</div>
                    </div>

                    <div class="constant-card">
                        <div class="constant-symbol">1/φ</div>
                        <div class="constant-name">Reciprocal Phi</div>
                        <div class="constant-value">${(1 / this.constants.phi).toFixed(10)}</div>
                        <div class="constant-desc">φ - 1</div>
                    </div>
                </div>
            </div>
        `;
    }

    renderSequences() {
        return html`
            <div class="sequences-view">
                <div class="sequence-item">
                    <div class="sequence-name">Fibonacci Sequence</div>
                    <div class="sequence-formula">F(n) = F(n-1) + F(n-2), F(0)=0, F(1)=1</div>
                    <div class="sequence-values">
                        ${this.generateFibonacci(10).map(n => html`
                            <span class="value-badge">${n}</span>
                        `)}
                    </div>
                    <button class="generate-btn" @click=${() => this.showMoreFibonacci()}>Generate More</button>
                </div>

                <div class="sequence-item">
                    <div class="sequence-name">Lucas Numbers</div>
                    <div class="sequence-formula">L(n) = L(n-1) + L(n-2), L(0)=2, L(1)=1</div>
                    <div class="sequence-values">
                        ${this.generateLucas(10).map(n => html`
                            <span class="value-badge">${n}</span>
                        `)}
                    </div>
                    <button class="generate-btn" @click=${() => this.showMoreLucas()}>Generate More</button>
                </div>

                <div class="sequence-item">
                    <div class="sequence-name">Prime Numbers</div>
                    <div class="sequence-formula">Numbers with exactly two divisors</div>
                    <div class="sequence-values">
                        ${this.generatePrimes(10).map(n => html`
                            <span class="value-badge">${n}</span>
                        `)}
                    </div>
                    <button class="generate-btn" @click=${() => this.showMorePrimes()}>Generate More</button>
                </div>

                <div class="sequence-item">
                    <div class="sequence-name">Triangular Numbers</div>
                    <div class="sequence-formula">T(n) = n(n+1)/2</div>
                    <div class="sequence-values">
                        ${this.generateTriangular(10).map(n => html`
                            <span class="value-badge">${n}</span>
                        `)}
                    </div>
                    <button class="generate-btn" @click=${() => this.showMoreTriangular()}>Generate More</button>
                </div>
            </div>
        `;
    }

    renderGeometry() {
        return html`
            <div class="geometry-view">
                <h4 style="color: #0a84ff; margin-bottom: 20px;">Sacred Geometry</h4>
                <div class="geometry-grid">
                    <div class="geometry-card">
                        <svg class="geometry-svg" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#0a84ff" stroke-width="2"/>
                            <circle cx="50" cy="50" r="20" fill="none" stroke="#30d158" stroke-width="2"/>
                            <line x1="10" y1="50" x2="90" y2="50" stroke="#ff453a" stroke-width="1" stroke-dasharray="5,5"/>
                            <line x1="50" y1="10" x2="50" y2="90" stroke="#ff453a" stroke-width="1" stroke-dasharray="5,5"/>
                        </svg>
                        <div class="geometry-name">Circle</div>
                        <div class="geometry-ratio">π = ${this.constants.pi.toFixed(4)}</div>
                    </div>

                    <div class="geometry-card">
                        <svg class="geometry-svg" viewBox="0 0 100 100">
                            <rect x="20" y="20" width="60" height="60" fill="none" stroke="#0a84ff" stroke-width="2"/>
                            <line x1="20" y1="20" x2="80" y2="80" stroke="#ff453a" stroke-width="1"/>
                            <line x1="80" y1="20" x2="20" y2="80" stroke="#ff453a" stroke-width="1"/>
                        </svg>
                        <div class="geometry-name">Square</div>
                        <div class="geometry-ratio">√2 = ${this.constants.sqrt2.toFixed(4)}</div>
                    </div>

                    <div class="geometry-card">
                        <svg class="geometry-svg" viewBox="0 0 100 100">
                            <polygon points="50,15 85,65 15,65" fill="none" stroke="#0a84ff" stroke-width="2"/>
                            <circle cx="50" cy="48" r="20" fill="none" stroke="#30d158" stroke-width="1" stroke-dasharray="3,3"/>
                        </svg>
                        <div class="geometry-name">Triangle</div>
                        <div class="geometry-ratio">φ = ${this.constants.phi.toFixed(4)}</div>
                    </div>

                    <div class="geometry-card">
                        <svg class="geometry-svg" viewBox="0 0 100 100">
                            <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="none" stroke="#0a84ff" stroke-width="2"/>
                            <circle cx="50" cy="50" r="25" fill="none" stroke="#30d158" stroke-width="1" stroke-dasharray="3,3"/>
                        </svg>
                        <div class="geometry-name">Hexagon</div>
                        <div class="geometry-ratio">√3 = ${Math.sqrt(3).toFixed(4)}</div>
                    </div>

                    <div class="geometry-card">
                        <svg class="geometry-svg" viewBox="0 0 100 100">
                            <polygon points="50,10 80,30 80,70 50,90 20,70 20,30" fill="none" stroke="#0a84ff" stroke-width="2"/>
                            <line x1="50" y1="10" x2="50" y2="90" stroke="#ff453a" stroke-width="1" stroke-dasharray="3,3"/>
                        </svg>
                        <div class="geometry-name">Pentagon</div>
                        <div class="geometry-ratio">φ = ${this.constants.phi.toFixed(4)}</div>
                    </div>

                    <div class="geometry-card">
                        <svg class="geometry-svg" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#0a84ff" stroke-width="2"/>
                            <circle cx="30" cy="30" r="15" fill="none" stroke="#30d158" stroke-width="2"/>
                            <circle cx="70" cy="30" r="15" fill="none" stroke="#30d158" stroke-width="2"/>
                            <circle cx="30" cy="70" r="15" fill="none" stroke="#30d158" stroke-width="2"/>
                            <circle cx="70" cy="70" r="15" fill="none" stroke="#30d158" stroke-width="2"/>
                        </svg>
                        <div class="geometry-name">Vesica Piscis</div>
                        <div class="geometry-ratio">√3 = ${Math.sqrt(3).toFixed(4)}</div>
                    </div>
                </div>
            </div>
        `;
    }

    // Calculator Methods
    appendToExpression(value) {
        if (!this.activeCalc) {
            this.activeCalc = { expression: '', result: '0' };
        }
        
        let expr = this.activeCalc.expression || '';
        
        // Handle constants
        if (value === 'π') value = this.constants.pi.toString();
        if (value === 'φ') value = this.constants.phi.toString();
        if (value === 'e') value = this.constants.e.toString();
        if (value === '√2') value = this.constants.sqrt2.toString();
        
        this.activeCalc = {
            ...this.activeCalc,
            expression: expr + value,
            error: null
        };
    }

    backspace() {
        if (!this.activeCalc) return;
        this.activeCalc = {
            ...this.activeCalc,
            expression: (this.activeCalc.expression || '').slice(0, -1)
        };
    }

    clearCalculator() {
        this.activeCalc = { expression: '', result: '0', error: null };
    }

    calculate() {
        if (!this.activeCalc?.expression) return;

        try {
            // Safe evaluation
            const expr = this.activeCalc.expression
                .replace(/\^/g, '**')
                .replace(/√/g, 'Math.sqrt')
                .replace(/π/g, this.constants.pi)
                .replace(/φ/g, this.constants.phi)
                .replace(/e/g, this.constants.e);

            // eslint-disable-next-line no-eval
            const result = eval(expr);
            
            this.activeCalc = {
                ...this.activeCalc,
                result: result.toString()
            };

            // Add to history
            this.recentResults = [{
                expression: this.activeCalc.expression,
                result: result
            }, ...this.recentResults].slice(0, 10);

            this.saveCalculations();
        } catch (e) {
            this.activeCalc = {
                ...this.activeCalc,
                error: 'Invalid expression'
            };
        }
    }

    loadCalculation(calc) {
        this.activeCalc = {
            expression: calc.expression,
            result: calc.result.toString()
        };
    }

    // Sequence Generators
    generateFibonacci(n) {
        const fib = [0, 1];
        for (let i = 2; i < n; i++) {
            fib.push(fib[i-1] + fib[i-2]);
        }
        return fib;
    }

    generateLucas(n) {
        const lucas = [2, 1];
        for (let i = 2; i < n; i++) {
            lucas.push(lucas[i-1] + lucas[i-2]);
        }
        return lucas;
    }

    generatePrimes(n) {
        const primes = [];
        let num = 2;
        while (primes.length < n) {
            let isPrime = true;
            for (let i = 2; i <= Math.sqrt(num); i++) {
                if (num % i === 0) {
                    isPrime = false;
                    break;
                }
            }
            if (isPrime) primes.push(num);
            num++;
        }
        return primes;
    }

    generateTriangular(n) {
        const triangular = [];
        for (let i = 1; i <= n; i++) {
            triangular.push((i * (i + 1)) / 2);
        }
        return triangular;
    }

    showMoreFibonacci() {
        const more = this.generateFibonacci(20);
        alert(`Fibonacci (20):\n${more.join(', ')}`);
    }

    showMoreLucas() {
        const more = this.generateLucas(20);
        alert(`Lucas (20):\n${more.join(', ')}`);
    }

    showMorePrimes() {
        const more = this.generatePrimes(20);
        alert(`Primes (20):\n${more.join(', ')}`);
    }

    showMoreTriangular() {
        const more = this.generateTriangular(20);
        alert(`Triangular (20):\n${more.join(', ')}`);
    }

    copyToClipboard(value) {
        navigator.clipboard.writeText(value.toString());
        alert('Copied to clipboard!');
    }

    loadCalculations() {
        const saved = localStorage.getItem('mathHistory');
        if (saved) {
            this.recentResults = JSON.parse(saved);
        }
    }

    saveCalculations() {
        localStorage.setItem('mathHistory', JSON.stringify(this.recentResults));
    }
}

customElements.define('math-dashboard', MathDashboard);
