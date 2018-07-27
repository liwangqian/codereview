'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const webviewEditor_1 = require("./webviewEditor");
class IssueWorkSpaceEditor extends webviewEditor_1.WebviewEditor {
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
                name: "xxx",
                id: "xxx",
                avatar: "f-fa:smile",
            },
            account: {
                "private-token": 'xxx'
            }
        };
    }
    registerCommands() {
        return [
            vscode_1.commands.registerCommand('codereview.showWorkSpace', this.show, this),
        ];
    }
}
exports.IssueWorkSpaceEditor = IssueWorkSpaceEditor;
//# sourceMappingURL=issueEditor.js.map