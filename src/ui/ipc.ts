'use strict';

export interface MemberInfo {
    id: String;
    email: String;
    nick_name: String;
    username: String;
    avatar: String;
}

export type Severity = 'suggestion' | 'minor' | 'major' | 'fatal';
export type IssueType = 'codereview' | 'comment';
export type IssueState = 'new' | 'accepted' | 'closed';

interface IssueContext {
    uri: String;
    range: Number[];
    code: String;
}

export interface Issue {
    id: Number;
    title: String;
    description: String;
    state: String;
    closed: Boolean;
    project_id: Number;
    issue_type: IssueType;
    create_at: String;
    update_at: String;
    author: MemberInfo;
    assignee?: MemberInfo;
    context?: IssueContext;
    severity?: Severity;
    labels?: String[];
}

interface NewIssueMessage {
    type: 'newIssue';
    context: IssueContext;
}

interface IssueToCodeMessage {
    type: 'issueToCode';
    issue: Issue;
}

export type Message = NewIssueMessage | IssueToCodeMessage;

export interface SettingsBootstrap {
    author: MemberInfo;
    account: {
        'PRIVATE-TOKEN': String;
    };
}