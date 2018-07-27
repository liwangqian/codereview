'use strict';
import { Disposable, Uri, ViewColumn, WebviewPanel, window, workspace } from 'vscode';
import { Message } from '../ui/ipc';
import { Container } from '../container';
import { Logger } from '../logger';
import * as fs from 'fs';

export abstract class WebviewEditor<TBootstrap> extends Disposable {

    private _disposable: Disposable | undefined;
    private _disposablePanel: Disposable | undefined;
    private _panel: WebviewPanel | undefined;

    constructor() {
        super(() => this.dispose());

        this._disposable = Disposable.from(...this.registerCommands());
    }

    abstract get filename(): string;
    abstract get id(): string;
    abstract get title(): string;

    abstract getBootstrap(): TBootstrap;
    abstract registerCommands(): Disposable[];

    dispose() {
        this._disposable && this._disposable.dispose();
        this._disposablePanel && this._disposablePanel.dispose();
    }

    private async getHtml(): Promise<string> {
        if (Logger.isDebugging) {
            return new Promise<string>((resolve, reject) => {
                fs.readFile(Container.context.asAbsolutePath(this.filename), 'utf8', (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(data);
                    }
                });
            });
        }

        const doc = await workspace.openTextDocument(Container.context.asAbsolutePath(this.filename));
        return doc.getText();
    }

    private onPanelDisposed() {
        this._disposablePanel && this._disposablePanel.dispose();
        this._panel = undefined;
    }

    protected async onMessageReceived(e: Message) {
        if (e == null) return;

        Logger.log(`WebviewEditor.onMessageReceived: type=${e.type}, data=${JSON.stringify(e)}`);

        switch (e.type) {
            case 'newIssue':
                break;
        }
    }

    get visible() {
        return this._panel === undefined ? false : this._panel.visible;
    }

    hide() {
        if (this._panel) {
            this._panel.dispose();
        }
    }

    async show(): Promise<void> {
        let html = (await this.getHtml())
            .replace(/{{root}}/g, Uri.file(Container.context.asAbsolutePath('.')).with({ scheme: 'vscode-resource' }).toString());
        if (html.includes('\'{{bootstrap}}\'')) {
            html = html.replace('\'{{bootstrap}}\'', JSON.stringify(this.getBootstrap()));
        }

        if (this._panel === undefined) {
            this._panel = window.createWebviewPanel(
                this.id,
                this.title,
                ViewColumn.Three, // { viewColumn: ViewColumn.Active, preserveFocus: false }
                {
                    retainContextWhenHidden: true,
                    enableFindWidget: true,
                    enableCommandUris: true,
                    enableScripts: true
                }
            );

            this._disposablePanel = Disposable.from(
                this._panel,
                this._panel.onDidDispose(this.onPanelDisposed, this),
                this._panel.webview.onDidReceiveMessage(this.onMessageReceived, this)
            );

            this._panel.webview.html = html;
        }
        else {
            this._panel.webview.html = html;
            this._panel.reveal(ViewColumn.Three); // , false);
        }
    }

    postMessage(message: Message) {
        if (this._panel === undefined) return false;
        if (!this.visible) this._panel.reveal(ViewColumn.Three);
        const result = this._panel!.webview.postMessage(message);
        return result;
    }
}