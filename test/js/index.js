'use strict';

document.privateNS = document.privateNS || {};

function initAuthor() {
    document.privateNS.author = {
        id: 2147,
        nick_name: 'Liwangqian',
        username: 'l00277500',
        avatar: './img/a.jpg'
    }
}

function nowString() {
    let now = new Date();
    let fmtStr = `${now.getFullYear()}-${now.getMonth()}-${now.getDay()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    console.log(fmtStr);
    return fmtStr;
}

function initEditors() {

    let issueEditorView = $('.isource-issue-editor-view');
    document.privateNS.issueEditorView = issueEditorView;

    let commentEditorView = $('.isource-comment-editor-view');
    document.privateNS.commentEditorView = commentEditorView;

    function CreateNewIssue() {
        let issueEditor = document.privateNS.issueEditor;
        let assigneeSelected = $('.assignee-selector').find(':selected');
        let projectSelected = $('.project-selector').find(':selected');
        let labelSelected = $('.label-selector').find(':selected');

        let issueInfo = {
            author: document.privateNS.author,
            assignee: {
                id: assigneeSelected.find(':selected').val(),
                nick_name: assigneeSelected.find(':selected').text()
            },
            create_at: nowString(),
            description: issueEditor.markdown(issueEditor.value()),
            project_id: projectSelected.val(),
            issue_type: 'codereview',
            severity: 'minor',
            labels: labelSelected.map(item => item.text()),
            comments: []
        };

        // TODO: POST to isource

        var elem = newIssue(issueInfo);
        return $(elem);
    }

    let issueEditor = new SimpleMDE({
        element: document.getElementById('issue-editor'),
        status: false,
        spellChecker: false,
        toolbar: ['unordered-list', 'code', 'preview'],
        placeholder: 'Say something...',
        renderingConfig: {
            codeSyntaxHighlighting: true
        }
    });
    document.privateNS.issueEditor = issueEditor;

    let commentEditor = new SimpleMDE({
        element: document.getElementById('comment-editor'),
        status: false,
        spellChecker: false,
        toolbar: ['unordered-list', 'code', 'preview'],
        placeholder: 'Say something...',
        renderingConfig: {
            codeSyntaxHighlighting: true
        }
    });

    document.privateNS.commentEditor = commentEditor;

    $('.assignee-selector').select2({
        theme: 'bootstrap',
        width: 'resolve',
        placeholder: 'Assignee'
    });

    $('.project-selector').select2({
        theme: 'bootstrap',
        width: 'resolve',
        placeholder: 'Project'
    });

    $('.label-selector').select2({
        theme: 'bootstrap',
        width: 'resolve',
        placeholder: 'Labels'
    });

    $('#btn-new-issue').on('click', function (e) {
        e.preventDefault();
        // 做一些初始化工作
        issueEditorView.data('editor-mode', 'create'); // 区别于edit模式
        issueEditorView.insertAfter($('.workspace-header'));
        // 显示视图
        issueEditor.value('【代码检视】')
        issueEditorView.show();
    });

    $('#btn-cancel-issue').on('click', function (e) {
        e.preventDefault();
        issueEditorView.hide();
    });

    $('#btn-submit-issue').on('click', function (e) {
        e.preventDefault();
        issueEditorView.hide();
        // 插入新创建的issue到列表中
        if (issueEditorView.data('editor-mode') === 'create') {
            $('.issue-list').prepend(CreateNewIssue());
        } else {
            console.log(issueEditorView.previousSibling);
        }
    });
}