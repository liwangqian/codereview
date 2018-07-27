'use strict';
import { DOM } from './../shared/dom';
import { darken, lighten, opacity } from '../shared/colors';
import { Message, SettingsBootstrap } from './../ipc';

interface VsCodeApi {
    postMessage(msg: {}): void;
    setState(state: {}): void;
    getState(): {};
}

declare function acquireVsCodeApi(): VsCodeApi;

export abstract class App<TBootstrap extends SettingsBootstrap> {

    private readonly _api: VsCodeApi;
    // private _issues: Issue[] = [];
    private _updating: boolean = false;

    constructor(
        protected readonly appName: string,
        protected readonly bootstrap: TBootstrap
    ) {
        this.log(`${this.appName}.ctor`);

        this._api = acquireVsCodeApi();

        this.initializeColorPalette();
        this.initialize();
        this.bind();

        setTimeout(() => {
            document.body.classList.remove('preload');
        }, 500);
    }

    protected log(message: string) {
        console.log(message);
    }

    protected onBind() { }
    protected onInitialize() { }

    protected onInputFocused(element: HTMLInputElement) {
        this.log(`${this.appName}.onInputFocused: name=${element.name}, value=${element.value}`);

        const popup = document.getElementById(`${element.name}.popup`);
        if (popup != null) {
            popup.classList.remove('hidden');
        }
    }

    protected onInputSelected(element: HTMLSelectElement) {
        if (this._updating) return;

        const value = element.options[element.selectedIndex].value;

        this.log(`${this.appName}.onInputSelected: name=${element.name}, value=${value}`);

    }

    protected onJumpToLinkClicked(element: HTMLAnchorElement, e: MouseEvent) {
        const href = element.getAttribute('href');
        if (href == null) return;

        const el = document.getElementById(href.substr(1));
        if (el == null) return;

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

    protected onMessageReceived(e: MessageEvent) {
        const msg = e.data as Message;
        switch (msg.type) {
            case 'newIssue':
                this.log('onNewIssueMessage');
                break;
        }
    }

    protected onPopupMouseDown(element: HTMLElement, e: MouseEvent) {
        // e.stopPropagation();
        // e.stopImmediatePropagation();
        e.preventDefault();
    }

    protected onTokenMouseDown(element: HTMLElement, e: MouseEvent) {
        if (this._updating) return;

        this.log(`${this.appName}.onTokenClicked: id=${element.id}`);

        const setting = element.closest('.settings-group__setting');
        if (setting == null) return;

        const input = setting.querySelector<HTMLInputElement>('input[type=text], input:not([type])');
        if (input == null) return;

        input.value += `\${${element.dataset.token}}`;

        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();
    }

    protected postMessage(e: Message) {
        this._api.postMessage(e);
    }

    private bind() {
        this.onBind();

        const onMessageReceived = this.onMessageReceived.bind(this);
        window.addEventListener('message', onMessageReceived);

        const onInputFocused = this.onInputFocused.bind(this);
        DOM.listenAll('input[type=text].setting, input:not([type]).setting', 'focus', function (this: HTMLInputElement) { return onInputFocused(this, ...arguments); });

        const onInputSelected = this.onInputSelected.bind(this);
        DOM.listenAll('select.setting', 'change', function (this: HTMLInputElement) { return onInputSelected(this, ...arguments); });

        const onTokenMouseDown = this.onTokenMouseDown.bind(this);
        DOM.listenAll('[data-token]', 'mousedown', function (this: HTMLElement) { return onTokenMouseDown(this, ...arguments); });

        const onPopupMouseDown = this.onPopupMouseDown.bind(this);
        DOM.listenAll('.popup', 'mousedown', function (this: HTMLElement) { return onPopupMouseDown(this, ...arguments); });

        const onJumpToLinkClicked = this.onJumpToLinkClicked.bind(this);
        DOM.listenAll('a.jump-to[href^="#"]', 'click', function (this: HTMLAnchorElement) { return onJumpToLinkClicked(this, ...arguments); });
    }

    private initialize() {
        this.log(`${this.appName}.initialize`);

        this.onInitialize();
    }

    private initializeColorPalette() {
        const onColorThemeChanged = () => {
            const body = document.body;
            const computedStyle = getComputedStyle(body);

            const bodyStyle = body.style;
            let color = computedStyle.getPropertyValue('--color').trim();
            bodyStyle.setProperty('--color--75', opacity(color, 75));
            bodyStyle.setProperty('--color--50', opacity(color, 50));

            color = computedStyle.getPropertyValue('--background-color').trim();
            bodyStyle.setProperty('--background-color--lighten-05', lighten(color, 5));
            bodyStyle.setProperty('--background-color--darken-05', darken(color, 5));
            bodyStyle.setProperty('--background-color--lighten-075', lighten(color, 7.5));
            bodyStyle.setProperty('--background-color--darken-075', darken(color, 7.5));
            bodyStyle.setProperty('--background-color--lighten-15', lighten(color, 15));
            bodyStyle.setProperty('--background-color--darken-15', darken(color, 15));
            bodyStyle.setProperty('--background-color--lighten-30', lighten(color, 30));
            bodyStyle.setProperty('--background-color--darken-30', darken(color, 30));

            color = computedStyle.getPropertyValue('--link-color').trim();
            bodyStyle.setProperty('--link-color--darken-20', darken(color, 20));
        };

        const observer = new MutationObserver(onColorThemeChanged);
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

        onColorThemeChanged();
        return observer;
    }
}

