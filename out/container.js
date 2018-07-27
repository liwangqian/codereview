'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const issueEditor_1 = require("./webviews/issueEditor");
class Container {
    static initialize(context) {
        this._context = context;
        context.subscriptions.push(this._issueWorkSpaceEditor = new issueEditor_1.IssueWorkSpaceEditor());
    }
    static get context() {
        return this._context;
    }
    static get issueWorkSpaceEditor() {
        return this._issueWorkSpaceEditor;
    }
}
exports.Container = Container;
//# sourceMappingURL=container.js.map