'use strict';
import { DOM } from './../shared/dom';
import { App } from '../shared/app-base';
import { SettingsBootstrap } from '../ipc';

const bootstrap: SettingsBootstrap = (window as any).bootstrap;

export class WorkspaceApp extends App<SettingsBootstrap> {

    private _scopes: HTMLSelectElement | null = null;

    constructor() {
        super('WorkspaceApp', bootstrap);
    }

    protected onInitialize() {
    }

    protected onBind() {
        const onSectionHeaderClicked = this.onSectionHeaderClicked.bind(this);
        DOM.listenAll('.section__header', 'click', function (this: HTMLInputElement) { return onSectionHeaderClicked(this, ...arguments); });

        const onActionLinkClicked = this.onActionLinkClicked.bind(this);
        DOM.listenAll('[data-action]', 'click', function (this: HTMLAnchorElement) { return onActionLinkClicked(this, ...arguments); });
    }

    private onActionLinkClicked(element: HTMLElement, e: MouseEvent) {
        switch (element.dataset.action) {
            case 'collapse':
                for (const el of document.querySelectorAll('.section__header')) {
                    el.classList.add('collapsed');
                }

                document.querySelector('[data-action="collapse"]')!.classList.add('hidden');
                document.querySelector('[data-action="expand"]')!.classList.remove('hidden');
                break;

            case 'expand':
                for (const el of document.querySelectorAll('.section__header')) {
                    el.classList.remove('collapsed');
                }

                document.querySelector('[data-action="collapse"]')!.classList.remove('hidden');
                document.querySelector('[data-action="expand"]')!.classList.add('hidden');
                break;
        }

        e.preventDefault();
        e.stopPropagation();
    }

    protected onInputSelected(element: HTMLSelectElement) {
        if (element === this._scopes) return;

        return super.onInputSelected(element);
    }

    private onSectionHeaderClicked(element: HTMLElement, e: MouseEvent) {
        if ((e.target as HTMLElement).matches('i.icon__info') ||
            (e.target as HTMLElement).matches('a.link__learn-more')) return;

        element.classList.toggle('collapsed');
    }
}
