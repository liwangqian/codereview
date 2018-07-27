'use strict';
import { ExtensionContext } from 'vscode';
import { IssueWorkSpaceEditor } from './webviews/issueEditor';

export class Container {
    static initialize(context: ExtensionContext) {
        this._context = context;

        context.subscriptions.push(this._issueWorkSpaceEditor = new IssueWorkSpaceEditor());
    }

    private static _context: ExtensionContext;
    static get context() {
        return this._context;
    }

    private static _issueWorkSpaceEditor: IssueWorkSpaceEditor;
    static get issueWorkSpaceEditor() {
        return this._issueWorkSpaceEditor;
    }
}