'use strict';

class iSourceAuthorModel {
    constructor() {
        this.id = -1;
        this.email = '';
        this.nick_name = '';
        this.username = '';
        this.avatar = '';
    }

    static fromJSON(jsonData) {
        if (!jsonData) return null;

        let author = new iSourceAuthorModel();
        author.id = jsonData.id;
        author.email = jsonData.email;
        author.nick_name = jsonData.nick_name;
        author.username = jsonData.username;
        author.avatar = jsonData.avatar;

        return author;
    }

    static toJSON(obj) {
        let jsonData = Object.create(null);
        jsonData.id = obj.id;
        jsonData.email = obj.email;
        jsonData.nick_name = obj.nick_name;
        jsonData.username = obj.username;
        jsonData.avatar = obj.avatar;

        return jsonData;
    }
}

class iSourceIssueModel {
    constructor() {
        this.id = -1;
        this.title = '';
        this.description = '';
        this.state = '';
        this.closed = false;
        this.project_id = -1;
        this.issue_type = '';
        this.create_at = '';
        this.update_at = '';
        this.author = null;
        this.assignee = null;
        this.context = null;
        this.severity = '';
        this.labels = [];
    }

    static fromJSON(jsonData) {
        if (!jsonData) return null;

        let issue = new iSourceIssueModel();
        issue.id = jsonData.id;
        issue.title = jsonData.title;
        issue.description = jsonData.description;
        issue.state = jsonData.state;
        issue.closed = jsonData.closed;
        issue.project_id = jsonData.project_id;
        issue.issue_type = jsonData.issue_type;
        issue.create_at = jsonData.create_at;
        issue.update_at = jsonData.update_at;
        issue.author = iSourceAuthorModel.fromJSON(jsonData.author);
        issue.assignee = iSourceAuthorModel.fromJSON(jsonData.assignee);
        issue.context = '';
        issue.severity = jsonData.severity;
        issue.labels = jsonData.labels;

        return issue;
    }

    static toJSON(obj) {
        let jsonData = Object.create(null);

        jsonData.id = obj.id;
        jsonData.title = obj.title;
        jsonData.description = obj.description;
        jsonData.state = obj.state;
        jsonData.closed = obj.closed;
        jsonData.project_id = obj.project_id;
        jsonData.issue_type = obj.issue_type;
        jsonData.create_at = obj.create_at;
        jsonData.update_at = obj.update_at;
        jsonData.author = iSourceAuthorModel.toJSON(obj.author);
        jsonData.assignee = iSourceAuthorModel.fromJSON(obj.assignee);
        jsonData.context = obj.context;
        jsonData.severity = obj.severity;
        jsonData.labels = obj.labels;
    }
}


