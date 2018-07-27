'use strict';

import { commands } from 'vscode';
import { WebviewEditor } from './webviewEditor';
import { SettingsBootstrap } from '../ui/ipc';

export class IssueWorkSpaceEditor extends WebviewEditor<SettingsBootstrap> {
    get filename() {
        return 'workspace.html';
    }

    get id() {
        return 'codereview.issueworkspace';
    }

    get title() {
        return 'Issue WorkSpace';
    }

    getBootstrap() {
        return {
            author: {
                id: '',
                email: '',
                username: '',
                nick_name: '',
                avatar: ''
            },
            account: {
                'PRIVATE-TOKEN': 'xxx'
            }
        } as SettingsBootstrap;
    }

    registerCommands() {
        return [
            commands.registerCommand('codereview.showWorkSpace', this.show, this)
        ];
    }
}