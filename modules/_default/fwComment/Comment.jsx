import React from 'react';
import { connect } from 'react-redux';
import { approveComment, deleteComment, getCommentScope } from './redux';
import CommentTextBox from './CommentTextBox';

class Comment extends React.Component {
    state = { editMode: false, replyEditMode: {} };

    edit = (e, commentRef, controlTextRef) => {
        e.preventDefault();
        $(this[controlTextRef]).hide();
        this.setState({ editMode: true }, () => this[commentRef].focus());
    }

    cancelEdit = (controlTextRef) => {
        $(this[controlTextRef]).show();
        this.setState({ editMode: false });
    }

    editReply = (e, _id, commentRef, controlTextRef) => {
        e.preventDefault();
        $(this[controlTextRef]).hide();
        const replyEditMode = this.state.replyEditMode;
        replyEditMode[_id] = true;
        this.setState({ replyEditMode }, () => this[commentRef].focus());
    }

    cancelEditReply = (_id, controlTextRef) => {
        $(this[controlTextRef]).show();
        const replyEditMode = this.state.replyEditMode;
        replyEditMode[_id] = false;
        this.setState({ replyEditMode });
    }

    approve = (e, _id, status) => {
        e.preventDefault();
        T.confirm('Duyệt bình luận', `Bạn có chắc muốn <strong>${status == 'approved' ? 'duyệt' : 'từ chối'}</strong> bình luận này?`, 'info', isConfirm => {
            if (isConfirm) {
                this.props.approveComment(_id, status, (item) => {
                    T.alert(`${status == 'approved' ? 'Duyệt ' : 'Từ chối '} bình luận thành công!`, 'success', false, 800);
                    this.props.onChange('update', item);
                });
            }
        });
    }

    approveReply = (e, _id, status) => {
        e.preventDefault();
        T.confirm('Duyệt bình luận', `Bạn có chắc muốn <strong>${status == 'approved' ? 'duyệt' : 'từ chối'}</strong> bình luận này?`, 'info', isConfirm => {
            if (isConfirm) {
                this.props.approveComment(_id, status, (item) => {
                    T.alert(`${status == 'approved' ? 'Duyệt ' : 'Từ chối '} bình luận thành công!`, 'success', false, 800);
                    this.onChange('update', item);
                });
            }
        });
    }

    reply = (e) => {
        e.preventDefault();
        $(this.replyArea).show();
        this.replyComment.focus();
    }

    delete = (e, comment, isReply) => e.preventDefault() || T.confirm('Xoá bình luận', 'Bạn có muốn xoá bình luận này?', true, isConfirm =>
        isConfirm && this.props.onDelete(comment, () => {
            if (isReply) {
                this.onChange('delete', comment);
            } else {
                this.props.onChange('delete', comment);
            }
        }));

    loadMoreComment = () => {
        const comment = this.props.comment || {}, replies = comment.replies || [];
        this.props.getCommentScope(comment._id, replies.length, 10, newReplies => {
            replies.push(...newReplies);
            comment.replies = replies;
            this.props.onChange('update', comment);
        });
    }

    onChange = (type, item) => {
        let comment = this.props.comment || {}, replies = comment.replies || [], totalReplies = comment.totalReplies || 0;
        if (type == 'create') {
            totalReplies++;
            replies.push(item);
        } else if (type == 'update') {
            const index = replies.findIndex(_item => _item._id == item._id);
            const newItem = Object.assign({}, replies[index], item);
            replies.splice(index, 1, newItem);
        } else if (type == 'delete') {
            const index = replies.findIndex(_item => _item._id == item._id);
            totalReplies--;
            replies.splice(index, 1);
        }

        comment.replies = replies;
        comment.totalReplies = totalReplies;
        this.props.onChange('update', comment);
    }

    render() {
        const { editMode, replyEditMode } = this.state;
        const { comment = {}, user, refParentId, refId, onChange } = this.props || {};
        const author = comment.author || {}, replies = comment.replies || [], totalReplies = comment.totalReplies || 0;
        const permissionWrite = user && ((author && author._id == user._id) || (user.isCourseAdmin) || (user.permissions && user.permissions.includes('comment:write')));
        const permissionDelete = user && ((author && author._id == user._id) || (user.isCourseAdmin) || (user.permissions && user.permissions.includes('comment:delete')));
        const permissionApprove = user && (user.isCourseAdmin || (user.permissions && user.permissions.includes('comment:write')));
        return <>
            <li>
                <div className={'comments-details ' + comment.state}>
                    <div className='comments-list-img' style={{ backgroundImage: `url('${author.image || '/img/avatar-default.png'}')` }} />
                    <div className='comments-content-wrap'>
                        <span>
                            <b><a href='#' onClick={e => e.preventDefault()}>{author.lastname} {author.firstname} &nbsp;</a></b>
                            <span className='post-time'>{new Date(comment.createdDate).getShortText()}</span>
                        </span>
                        {!editMode ?
                            <p style={{ whiteSpace: 'pre-line' }}>{comment.content}</p> :
                            <CommentTextBox ref={e => this.editComment = e} user={user} refParentId={refParentId} refId={refId} comment={comment} style={{ marginTop: '10px' }}
                                onChange={onChange} onCancel={() => this.cancelEdit('controlText')} rows={2} maxRows={4} hideAvatar />
                        }
                        <div ref={e => this.controlText = e}>
                            {comment.updatedDate && comment.createdDate != comment.updatedDate && <><small className='text-muted'>Đã chỉnh sửa</small><br /></>}
                            {user && user._id && <><small className='text-primary' style={{ cursor: 'pointer' }} onClick={e => this.reply(e)}>Trả lời</small>&nbsp;&nbsp;&nbsp;</>}
                            {permissionWrite && <><small className='text-blue' style={{ cursor: 'pointer' }} onClick={e => this.edit(e, 'editComment', 'controlText')}>Chỉnh sửa</small>&nbsp;&nbsp;&nbsp;</>}
                            {permissionDelete && <><small className='text-danger' style={{ cursor: 'pointer' }} onClick={e => this.delete(e, comment, false)}>Xoá</small>&nbsp;&nbsp;&nbsp;</>}
                            {permissionApprove && comment.state == 'waiting' && <><small className='text-success' style={{ cursor: 'pointer' }} onClick={e => this.approve(e, comment._id, 'approved')}>Duyệt</small>&nbsp;&nbsp;&nbsp;</>}
                            {permissionApprove && comment.state == 'waiting' && <><small className='text-danger' style={{ cursor: 'pointer' }} onClick={e => this.approve(e, comment._id, 'reject')}>Từ chối</small>&nbsp;&nbsp;&nbsp;</>}
                        </div>
                    </div>
                </div>
            </li>
            <li className='threaded-comments' ref={e => this.replyArea = e} style={{ display: 'none' }}>
                <CommentTextBox ref={e => this.replyComment = e} onChange={this.onChange} onCancel={() => $(this.replyArea).hide(100)} rows={1} maxRows={2} parentId={comment._id} />
            </li>
            {replies.map((comment, index) => {
                const author = comment.author || {};
                const permissionWrite = user && ((author && author._id == user._id) || (user.isCourseAdmin) || (user.permissions && user.permissions.includes('comment:write')));
                const permissionDelete = user && ((author && author._id == user._id) || (user.isCourseAdmin) || (user.permissions && user.permissions.includes('comment:delete')));
                const permissionApprove = user && (user.isCourseAdmin || (user.permissions && user.permissions.includes('comment:write')));
                const editMode = replyEditMode[comment._id] == true;
                return (
                    <li key={index} className='threaded-comments'>
                        <div className={'comments-details ' + comment.state}>
                            <div className='comments-list-img' style={{ backgroundImage: `url('${author.image || '/img/avatar-default.png'}')` }} />
                            <div className='comments-content-wrap'>
                                <span>
                                    <b><a href='#' onClick={e => e.preventDefault()}>{author.lastname} {author.firstname} &nbsp;</a></b>
                                    <span className='post-time'>{new Date(comment.createdDate).getShortText()}</span>
                                </span>
                                {!editMode ?
                                    <p style={{ whiteSpace: 'pre-line' }}>{comment.content}</p> :
                                    <CommentTextBox ref={e => this['editComment' + comment._id] = e} comment={comment} style={{ marginTop: '10px' }} onChange={this.onChange} onCancel={() => this.cancelEditReply(comment._id, 'controlText' + comment._id)} rows={1} maxRows={2} hideAvatar />
                                }
                                <div ref={e => this['controlText' + comment._id] = e}>
                                    {comment.updatedDate && comment.createdDate != comment.updatedDate && <><small className='text-muted' style={{ cursor: 'pointer' }}>Đã chỉnh sửa</small><br /></>}
                                    {permissionWrite && <><small className='text-blue' style={{ cursor: 'pointer' }} onClick={e => this.editReply(e, comment._id, 'editComment' + comment._id, 'controlText' + comment._id)}>Chỉnh sửa</small>&nbsp;&nbsp;&nbsp;</>}
                                    {permissionDelete && <><small className='text-danger' style={{ cursor: 'pointer' }} onClick={e => this.delete(e, comment, true)}>Xoá&nbsp;&nbsp;&nbsp;</small></>}
                                    {permissionApprove && comment.state == 'waiting' && <><small className='text-success' style={{ cursor: 'pointer' }} onClick={e => this.approveReply(e, comment._id, 'approved')}>Duyệt</small>&nbsp;&nbsp;&nbsp;</>}
                                    {permissionApprove && comment.state == 'waiting' && <><small className='text-danger' style={{ cursor: 'pointer' }} onClick={e => this.approveReply(e, comment._id, 'reject')}>Từ chối</small>&nbsp;&nbsp;&nbsp;</>}
                                </div>
                            </div>
                        </div>
                    </li>
                );
            })}
            {replies.length < totalReplies && (
                <li className='threaded-comments'>
                    <small className='text-primary' style={{ cursor: 'pointer' }} onClick={e => e.preventDefault() || this.loadMoreComment()}>Tải thêm bình luận</small>
                </li>)}
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system, user: state.system ? state.system.user : null });
const mapActionsToProps = { onDelete: deleteComment, approveComment, getCommentScope };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(Comment);