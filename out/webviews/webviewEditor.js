'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const container_1 = require("../container");
const logger_1 = require("../logger");
const fs = require("fs");
class WebviewEditor extends vscode_1.Disposable {
    constructor() {
        super(() => this.dispose());
        this._disposable = vscode_1.Disposable.from(...this.registerCommands());
    }
    dispose() {
        this._disposable && this._disposable.dispose();
        this._disposablePanel && this._disposablePanel.dispose();
    }
    async getHtml() {
        if (logger_1.Logger.isDebugging) {
            return new Promise((resolve, reject) => {
                fs.readFile(container_1.Container.context.asAbsolutePath(this.filename), 'utf8', (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(data);
                    }
                });
            });
        }
        const doc = await vscode_1.workspace.openTextDocument(container_1.Container.context.asAbsolutePath(this.filename));
        return doc.getText();
    }
    onPanelDisposed() {
        this._disposablePanel && this._disposablePanel.dispose();
        this._panel = undefined;
    }
    async onMessageReceived(e) {
        if (e == null)
            return;
        logger_1.Logger.log(`WebviewEditor.onMessageReceived: type=${e.type}, data=${JSON.stringify(e)}`);
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
    async show() {
        let html = (await this.getHtml())
            .replace(/{{root}}/g, vscode_1.Uri.file(container_1.Container.context.asAbsolutePath('.')).with({ scheme: 'vscode-resource' }).toString());
        if (html.includes('\'{{bootstrap}}\'')) {
            html = html.replace('\'{{bootstrap}}\'', JSON.stringify(this.getBootstrap()));
        }
        if (this._panel === undefined) {
            this._panel = vscode_1.window.createWebviewPanel(this.id, this.title, vscode_1.ViewColumn.Three, {
                retainContextWhenHidden: true,
                enableFindWidget: true,
                enableCommandUris: true,
                enableScripts: true
            });
            this._disposablePanel = vscode_1.Disposable.from(this._panel, this._panel.onDidDispose(this.onPanelDisposed, this), this._panel.webview.onDidReceiveMessage(this.onMessageReceived, this));
            this._panel.webview.html = html;
        }
        else {
            this._panel.webview.html = html;
            this._panel.reveal(vscode_1.ViewColumn.Three);
        }
    }
    postMessage(message) {
        if (this._panel === undefined)
            return false;
        if (!this.visible)
            this._panel.reveal(vscode_1.ViewColumn.Three);
        const result = this._panel.webview.postMessage(message);
        return result;
    }
}
exports.WebviewEditor = WebviewEditor;
//# sourceMappingURL=webviewEditor.js.map