'use strict';



let onCancelComment = function (event) {
    event.preventDefault();
    document.privateNS.commentEditorView.hide();
}

let onSubmitComment = function (event) {
    event.preventDefault();
    document.privateNS.commentEditorView.hide();

    let commentEditor = document.privateNS.commentEditor;
    let commentInfo = {
        author: document.privateNS.author,
        create_at: nowString(),
        description: commentEditor.markdown(commentEditor.value())
    }

    let commentItem = newComment(commentInfo);
    let parents = $(event.currentTarget).parents();
    let itemBefore = parents.filter('.comment-item');
    if (itemBefore.length === 0) {
        parents.filter('.list-group-item')
            .children('.comment-list-view')
            .append(commentItem);
    } else {
        commentItem.insertAfter(itemBefore);
    }

    let commentListView = parents.filter('.list-group-item').children('.comment-list-view');
    commentListView.show();

    // add comments count
    let commentBtn = parents.filter('.list-group-item')
        .children('.toolbar')
        .children('.btn-comment-toggle')
        .children('.fa-comments');
    commentBtn.text(parseInt(commentBtn.text()) + 1);
}

let onCodeContextViewToggle = function (event) {
    event.preventDefault();
    let codeContextView = $(event.currentTarget).parents().children('.code-context-view');
    codeContextView.toggle();
}

let onReplyComment = function (event) {
    event.preventDefault();
    let parents = $(event.currentTarget).parents();
    let listItem = parents.closest('.comment-item');
    if (listItem.length === 0) {
        listItem = parents.closest('.issue-item');
    }
    listItem.append(document.privateNS.commentEditorView);
    document.privateNS.commentEditorView.show();
}

let onCommentListToggle = function (event) {
    event.preventDefault();

    let target = $(event.currentTarget);
    let commentListView = target.parents().closest('.list-group-item').children('.comment-list-view');
    commentListView.toggle();
}

let onCommentEdit = function (event) {
    event.preventDefault();

    let target = $(event.currentTarget);
    let listItem = target.parents().closest('.list-group-item');
    let issueEditorView = $('.isource-issue-editor-view');
    issueEditorView.insertAfter(listItem);
    issueEditorView.data('editor-mode', 'edit'); // 区别于create模式
    issueEditorView.show();
}

let onUnimplementBtn = function (event) {
    event.preventDefault();
    console.log('functionality is not implemented.');
}

// gen comment html
function commentHeader(params) {
    return $(`<div class="row-fluid comment-header-view">
    <div class="col-fluid">
        <div class="avatar-container" style="float: left;">
            <a href="javascript:void(0)">
                <img src="${params.author.avatar}" alt="author" class="img-circle">
            </a>
        </div>
    </div>
    <div class="col-fluid">
        <span class="row-fluid">
            <h4 class="nick-name">${params.author.nick_name}</h4>
            <i class="author-id hide">${params.author.id}</i>
            <i class="create-at">comment at ${params.create_at}</i>
        </span>
    </div>
    </div>
    `);
}

function commentBody(params) {
    return $(`<div class="row-fluid comment-body-view">
    <!-- issue描述视图 -->
    <div class="item-description-view">
        <div class="mb-1 mt-1">${params.description}</div>
    </div>
    </div>`);
}

function commentToolbar(params) {
    let toolbar = $(`<div class="row-fluid toolbar">
    <a href="#" class="btn-comment-reply">
        <span class="fas fa-reply-all" title="Reply"></span>
    </a>
    </div>`);

    toolbar.children('.btn-comment-reply').on('click', onReplyComment);
    return toolbar;
}

function commentListItem(params) {
    let listItem = $('<div></div>');
    listItem.attr('class', 'list-group-item comment-item');
    listItem.attr('style', 'border-left: none; border-right: none;');
    listItem.append(commentHeader(params), commentBody(params), commentToolbar(params));
    return listItem;
}


function issueHeader(params) {
    return $(`<div class="row-fluid issue-header-view">
    <div class="col-fluid">
        <div class="avatar-container" style="float: left;">
            <a href="#">
                <img src="${params.author.avatar}" alt="author" class="img-circle">
            </a>
        </div>
    </div>
    <div class="col-fluid">
        <span class="row-fluid">
            <h4 class="nick-name">${params.author.nick_name}
                <span class="pull-right">
                    <h6>
                        <em class="badge badge-info">${params.closed ? "Closed" : "Open"}</em>
                    </h6>
                </span>
            </h4>
            <i class="author-id hide">${params.author.id}</i>
            <i class="create-at">comment at ${params.create_at}</i>
        </span>
    </div>
</div>`);
}

function parseDescription(description) {
    return description;
}

function parseCodeContext(description) {
    return 'local x = 1 + 3;'
}

function issueBody(params) {
    let description = parseDescription(params.description);
    let codeContext = parseCodeContext(params.description);
    let body = $(`<div class="row-fluid issue-body-view">
    <!-- issue描述视图 -->
    <div class="item-description-view">
        <div class="mb-1 mt-1">${description}</div>
    </div>

    <!-- 代码上下文查看按钮 -->
    <div class="inline-toolbar">
        <a href="#" class="toggle-code-context-view">more...</a>

        <!-- issue代码上下文 -->
        <div class="code-context-view border collapse hide code-block">
            <pre><code>${codeContext}</code></pre>
        </div>
    </div>
    </div>`);

    body.children('.inline-toolbar')
        .children('.toggle-code-context-view')
        .on('click', onCodeContextViewToggle);

    return body;
}

function issueToolbar(params) {
    let toolbar = $(`<div class="row-fluid toolbar">
    <a href="#" class="btn-comment-reply">
        <span class="fas fa-reply-all" title="Reply"></span>
    </a>
    <a href="#" class="btn-comment-toggle">
        <span class="fas fa-comments" title="Comments">${params.comments.length}</span>
    </a>
    <a href="#" class="btn-comment-edit">
        <span class="icon fas fa-edit" title="Edit"></span>
    </a>
    <a href="#" class="btn-comment-open-isource">
        <span class="icon fas fa-external-link-alt" title="Open isource"></span>
    </a>
    <a href="#" class="btn-comment-open-file">
        <span class="icon fas fa-file-code" title="Jump to file"></span>
    </a>
    <a href="#" class="btn-comment-delete pull-right">
        <span class="icon fas fa-trash" title="Delete"></span>
    </a>
    </div>`);

    toolbar.children('.btn-comment-reply').on('click', onReplyComment);
    toolbar.children('.btn-comment-toggle').on('click', onCommentListToggle);
    toolbar.children('.btn-comment-edit').on('click', onCommentEdit);
    toolbar.children('.btn-comment-open-isource').on('click', onUnimplementBtn);
    toolbar.children('.btn-comment-open-file').on('click', onUnimplementBtn);
    toolbar.children('.btn-comment-delete').on('click', onUnimplementBtn);

    return toolbar;
}

function issueListItem(params) {
    let commentlistView = $('<div></div>');
    commentlistView.attr('class', 'list-group flex-column align-items-start comment-list-view collapse hide');
    commentlistView.append(params.comments.map(item => commentListItem(item)));

    let issueItem = $('<div></div>');
    issueItem.attr('class', 'list-group-item issue-item');
    issueItem.attr('style', 'border-left: none; border-right: none;');
    issueItem.data('comments-num', params.comments.length);
    issueItem.append(issueHeader(params), issueBody(params), issueToolbar(params), commentlistView);

    return issueItem;
}

function newComment(params) {
    return commentListItem(params);
}

function newIssue(params) {
    return issueListItem(params);
}
