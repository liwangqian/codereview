'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const dom_1 = require("./../shared/dom");
const colors_1 = require("../shared/colors");
class App {
    constructor(appName, bootstrap) {
        this.appName = appName;
        this.bootstrap = bootstrap;
        this._updating = false;
        this.log(`${this.appName}.ctor`);
        this._api = acquireVsCodeApi();
        this.initializeColorPalette();
        this.initialize();
        this.bind();
        setTimeout(() => {
            document.body.classList.remove('preload');
        }, 500);
    }
    log(message) {
        console.log(message);
    }
    onBind() { }
    onInitialize() { }
    onInputBlurred(element) {
        this.log(`${this.appName}.onInputBlurred: name=${element.name}, value=${element.value}`);
        const popup = document.getElementById(`${element.name}.popup`);
        if (popup != null) {
            popup.classList.add('hidden');
        }
        let value = element.value;
        if (value === '') {
            value = element.dataset.defaultValue;
            if (value === undefined) {
                value = null;
            }
        }
        this._issues[element.name] = value;
        // this.setAdditionalSettings(element.checked ? element.dataset.addSettingsOn : element.dataset.addSettingsOff);
        this.applyChanges();
    }
    onInputChecked(element) {
        if (this._updating)
            return;
        this.log(`${this.appName}.onInputChecked: name=${element.name}, checked=${element.checked}, value=${element.value}`);
        switch (element.dataset.type) {
            case 'object': {
                const props = element.name.split('.');
                const settingName = props.splice(0, 1)[0];
                const setting = this.getSettingValue(settingName) || Object.create(null);
                if (element.checked) {
                    set(setting, props.join('.'), fromCheckboxValue(element.value));
                }
                else {
                    set(setting, props.join('.'), false);
                }
                this._issues[settingName] = setting;
                break;
            }
            case 'array': {
                const setting = this.getSettingValue(element.name) || [];
                if (Array.isArray(setting)) {
                    if (element.checked) {
                        if (!setting.includes(element.value)) {
                            setting.push(element.value);
                        }
                    }
                    else {
                        const i = setting.indexOf(element.value);
                        if (i !== -1) {
                            setting.splice(i, 1);
                        }
                    }
                    this._issues[element.name] = setting;
                }
                break;
            }
            default: {
                if (element.checked) {
                    this._issues[element.name] = fromCheckboxValue(element.value);
                }
                else {
                    this._issues[element.name] = false;
                }
                break;
            }
        }
        this.setAdditionalSettings(element.checked ? element.dataset.addSettingsOn : element.dataset.addSettingsOff);
        this.applyChanges();
    }
    onInputFocused(element) {
        this.log(`${this.appName}.onInputFocused: name=${element.name}, value=${element.value}`);
        const popup = document.getElementById(`${element.name}.popup`);
        if (popup != null) {
            popup.classList.remove('hidden');
        }
    }
    onInputSelected(element) {
        if (this._updating)
            return;
        const value = element.options[element.selectedIndex].value;
        this.log(`${this.appName}.onInputSelected: name=${element.name}, value=${value}`);
        this._issues[element.name] = ensureIfBoolean(value);
        this.applyChanges();
    }
    onJumpToLinkClicked(element, e) {
        const href = element.getAttribute('href');
        if (href == null)
            return;
        const el = document.getElementById(href.substr(1));
        if (el == null)
            return;
        let height = 83;
        const header = document.querySelector('.page-header--sticky');
        if (header != null) {
            height = header.clientHeight;
        }
        el.scrollIntoView({
            block: 'start',
            behavior: 'instant'
        });
        window.scrollBy(0, -height);
        e.stopPropagation();
        e.preventDefault();
    }
    onMessageReceived(e) {
        const msg = e.data;
        switch (msg.type) {
            case 'settingsChanged':
                this.bootstrap.config = msg.config;
                this.setState();
                break;
        }
    }
    onPopupMouseDown(element, e) {
        // e.stopPropagation();
        // e.stopImmediatePropagation();
        e.preventDefault();
    }
    onTokenMouseDown(element, e) {
        if (this._updating)
            return;
        this.log(`${this.appName}.onTokenClicked: id=${element.id}`);
        const setting = element.closest('.settings-group__setting');
        if (setting == null)
            return;
        const input = setting.querySelector('input[type=text], input:not([type])');
        if (input == null)
            return;
        input.value += `\${${element.dataset.token}}`;
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();
    }
    postMessage(e) {
        this._api.postMessage(e);
    }
    bind() {
        this.onBind();
        const onMessageReceived = this.onMessageReceived.bind(this);
        window.addEventListener('message', onMessageReceived);
        const onInputChecked = this.onInputChecked.bind(this);
        dom_1.DOM.listenAll('input[type=checkbox].setting', 'change', function () { return onInputChecked(this, ...arguments); });
        const onInputBlurred = this.onInputBlurred.bind(this);
        dom_1.DOM.listenAll('input[type=text].setting, input:not([type]).setting', 'blur', function () { return onInputBlurred(this, ...arguments); });
        const onInputFocused = this.onInputFocused.bind(this);
        dom_1.DOM.listenAll('input[type=text].setting, input:not([type]).setting', 'focus', function () { return onInputFocused(this, ...arguments); });
        const onInputSelected = this.onInputSelected.bind(this);
        dom_1.DOM.listenAll('select.setting', 'change', function () { return onInputSelected(this, ...arguments); });
        const onTokenMouseDown = this.onTokenMouseDown.bind(this);
        dom_1.DOM.listenAll('[data-token]', 'mousedown', function () { return onTokenMouseDown(this, ...arguments); });
        const onPopupMouseDown = this.onPopupMouseDown.bind(this);
        dom_1.DOM.listenAll('.popup', 'mousedown', function () { return onPopupMouseDown(this, ...arguments); });
        const onJumpToLinkClicked = this.onJumpToLinkClicked.bind(this);
        dom_1.DOM.listenAll('a.jump-to[href^="#"]', 'click', function () { return onJumpToLinkClicked(this, ...arguments); });
    }
    evaluateStateExpression(expression, changes) {
        let state = false;
        for (const expr of expression.trim().split('&')) {
            const [lhs, op, rhs] = parseStateExpression(expr);
            switch (op) {
                case '=': { // Equals
                    let value = changes[lhs];
                    if (value === undefined) {
                        value = this.getSettingValue(lhs) || false;
                    }
                    state = rhs !== undefined ? rhs === '' + value : !!value;
                    break;
                }
                case '!': { // Not equals
                    let value = changes[lhs];
                    if (value === undefined) {
                        value = this.getSettingValue(lhs) || false;
                    }
                    state = rhs !== undefined ? rhs !== '' + value : !value;
                    break;
                }
                case '+': { // Contains
                    if (rhs !== undefined) {
                        const setting = this.getSettingValue(lhs);
                        state = setting !== undefined ? setting.includes(rhs.toString()) : false;
                    }
                    break;
                }
            }
            if (!state)
                break;
        }
        return state;
    }
    getSettingValue(path) {
        return get(this.bootstrap.config, path);
    }
    initialize() {
        this.log(`${this.appName}.initialize`);
        this.onInitialize();
        this.setState();
    }
    initializeColorPalette() {
        const onColorThemeChanged = () => {
            const body = document.body;
            const computedStyle = getComputedStyle(body);
            const bodyStyle = body.style;
            let color = computedStyle.getPropertyValue('--color').trim();
            bodyStyle.setProperty('--color--75', colors_1.opacity(color, 75));
            bodyStyle.setProperty('--color--50', colors_1.opacity(color, 50));
            color = computedStyle.getPropertyValue('--background-color').trim();
            bodyStyle.setProperty('--background-color--lighten-05', colors_1.lighten(color, 5));
            bodyStyle.setProperty('--background-color--darken-05', colors_1.darken(color, 5));
            bodyStyle.setProperty('--background-color--lighten-075', colors_1.lighten(color, 7.5));
            bodyStyle.setProperty('--background-color--darken-075', colors_1.darken(color, 7.5));
            bodyStyle.setProperty('--background-color--lighten-15', colors_1.lighten(color, 15));
            bodyStyle.setProperty('--background-color--darken-15', colors_1.darken(color, 15));
            bodyStyle.setProperty('--background-color--lighten-30', colors_1.lighten(color, 30));
            bodyStyle.setProperty('--background-color--darken-30', colors_1.darken(color, 30));
            color = computedStyle.getPropertyValue('--link-color').trim();
            bodyStyle.setProperty('--link-color--darken-20', colors_1.darken(color, 20));
        };
        const observer = new MutationObserver(onColorThemeChanged);
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        onColorThemeChanged();
        return observer;
    }
    setState() {
        this._updating = true;
        try {
            for (const el of document.querySelectorAll('input[type=checkbox].setting')) {
                const checked = el.dataset.type === 'array'
                    ? (this.getSettingValue(el.name) || []).includes(el.value)
                    : this.getSettingValue(el.name) || false;
                el.checked = checked;
            }
            for (const el of document.querySelectorAll('input[type=text].setting, input:not([type]).setting')) {
                el.value = this.getSettingValue(el.name) || '';
            }
            for (const el of document.querySelectorAll('select.setting')) {
                const value = this.getSettingValue(el.name);
                const option = el.querySelector(`option[value='${value}']`);
                if (option != null) {
                    option.selected = true;
                }
            }
        }
        finally {
            this._updating = false;
        }
        const state = flatten(this.bootstrap.config);
        this.setVisibility(state);
        this.setEnablement(state);
    }
    setAdditionalSettings(expression) {
        if (!expression)
            return;
        const addSettings = parseAdditionalSettingsExpression(expression);
        for (const [s, v] of addSettings) {
            this._issues[s] = v;
        }
    }
    setEnablement(state) {
        for (const el of document.querySelectorAll('[data-enablement]')) {
            const disabled = !this.evaluateStateExpression(el.dataset.enablement, state);
            if (disabled) {
                el.setAttribute('disabled', '');
            }
            else {
                el.removeAttribute('disabled');
            }
            if (el.matches('input,select')) {
                el.disabled = disabled;
            }
            else {
                const input = el.querySelector('input,select');
                if (input == null)
                    continue;
                input.disabled = disabled;
            }
        }
    }
    setVisibility(state) {
        for (const el of document.querySelectorAll('[data-visibility]')) {
            el.classList.toggle('hidden', !this.evaluateStateExpression(el.dataset.visibility, state));
        }
    }
}
exports.App = App;
function ensureIfBoolean(value) {
    if (value === 'true')
        return true;
    if (value === 'false')
        return false;
    return value;
}
function get(o, path) {
    return path.split('.').reduce((o = {}, key) => o == null ? undefined : o[key], o);
}
function set(o, path, value) {
    const props = path.split('.');
    const length = props.length;
    const lastIndex = length - 1;
    let index = -1;
    let nested = o;
    while (nested != null && ++index < length) {
        const key = props[index];
        let newValue = value;
        if (index !== lastIndex) {
            const objValue = nested[key];
            newValue = typeof objValue === 'object'
                ? objValue
                : {};
        }
        nested[key] = newValue;
        nested = nested[key];
    }
    return o;
}
function parseAdditionalSettingsExpression(expression) {
    const settingsExpression = expression.trim().split(',');
    return settingsExpression.map(s => {
        const [setting, value] = s.split('=');
        return [setting, ensureIfBoolean(value)];
    });
}
function parseStateExpression(expression) {
    const [lhs, op, rhs] = expression.trim().split(/([=\+\!])/);
    return [lhs.trim(), op !== undefined ? op.trim() : '=', rhs !== undefined ? rhs.trim() : rhs];
}
function flatten(o, path) {
    const results = {};
    for (const key in o) {
        const value = o[key];
        if (Array.isArray(value))
            continue;
        if (typeof value === 'object') {
            Object.assign(results, flatten(value, path === undefined ? key : `${path}.${key}`));
        }
        else {
            results[path === undefined ? key : `${path}.${key}`] = value;
        }
    }
    return results;
}
function fromCheckboxValue(elementValue) {
    switch (elementValue) {
        case 'on': return true;
        case 'null': return null;
        case 'undefined': return undefined;
        default: return elementValue;
    }
}
//# sourceMappingURL=app-base.js.map