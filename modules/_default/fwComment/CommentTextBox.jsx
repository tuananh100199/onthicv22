import React from 'react';
import { connect } from 'react-redux';
import { createComment, updateComment } from './redux';

class CommentTextBox extends React.Component {
    focus = () => $(this.commentArea).focus();

    componentDidMount() {
        const _this = this;
        $(document).ready(() => {
            function getCaret(el) {
                if (el.selectionStart) {
                    return el.selectionStart;
                } else if (document.selection) {
                    el.focus();
                    let r = document.selection.createRange();
                    if (r == null) {
                        return 0;
                    }
                    let re = el.createTextRange(), rc = re.duplicate();
                    re.moveToBookmark(r.getBookmark());
                    rc.setEndPoint('EndToStart', re);
                    return rc.text.length;
                }
                return 0;
            }

            $(this.commentArea).on('keyup', function (event) {
                if (event.keyCode == 13) {
                    let content = this.value;
                    let caret = getCaret(this);
                    if (event.shiftKey) {
                        this.value = content.substring(0, caret - 1) + '\n' + content.substring(caret, content.length);
                        event.stopPropagation();
                    } else {
                        _this.onSave(event);
                    }
                }
            });

            $(this.commentArea).on('keydown', function (event) {
                if (event.keyCode == 13 && !event.shiftKey) {
                    event.preventDefault();
                }
            });

            $(this.commentArea).on('input', function () {
                // Set textAreaHeight
                // font-size: 14px;
                // line-height: 1.5
                // padding: 6px
                const currentRows = Math.ceil((this.scrollHeight - 6 * 2) / (14 * 1.5));
                if (_this.props.maxRows && currentRows <= _this.props.maxRows) {
                    this.style.height = 'auto';
                    this.style.height = (this.scrollHeight + 3) + 'px';
                }
            });

            $(this.commentArea).on('focus', () => {
                $(this.buttons).css({ opacity: 1, height: '32px' });
                $(this.sendButton).css({ opacity: 1 });
            });

            $(this.commentArea).on('blur', () => {
                $(this.buttons).css({ opacity: 0, height: 0 });
                $(this.sendButton).css({ opacity: 0 });
            });

            const comment = this.props.comment;
            if (comment) {
                $(this.commentArea).val(comment.content);
                $(this.commentArea).trigger('input');
                $(this.buttons).css({ opacity: 1, height: '32px' });
                $(this.sendButton).css({ opacity: 1 });
            }
        });
    }

    componentWillUnmount() {
        $(this.commentArea).off('keyup');
        $(this.commentArea).off('keydown');
        $(this.commentArea).off('input');
        $(this.commentArea).off('focus');
        $(this.commentArea).off('blur');
    }

    onSave = (e) => {
        e.preventDefault();
        const { comment, refParentId, refId, onCreate, parentId, onUpdate, onChange, onCancel } = this.props;
        const data = {
            refParentId, refId,
            content: $(this.commentArea).val()
        };

        if (!data.content) {
            T.notify('Vui lòng nhập nội dung bình luận!', 'danger');
            $(this.commentArea).focus();
        } else {
            $(this.commentArea).blur();
            if (comment && comment._id) {
                data.author = comment.author._id;
                onUpdate && onUpdate(comment._id, data, (item) => {
                    $(this.commentArea).val('');
                    if (item.state == 'approved') {
                        onChange && onChange('update', item);
                    } else {
                        onChange && onChange('delete', item);
                        T.notify('Bình luận của bạn đã được cập nhật và cần được duyệt lại!', 'info');
                    }
                    onCancel && onCancel();
                });
            } else {
                onCreate(parentId || null, data, (item) => {
                    $(this.commentArea).val('');
                    if (item.state == 'approved') {
                        onChange && onChange('create', item);
                    } else {
                        T.notify('Bình luận của bạn đã được gửi đi và cần được duyệt!', 'info');
                    }
                    onCancel && onCancel();
                });
            }
        }
    }

    cancel = (e) => {
        e.preventDefault();
        $(this.commentArea).val('');
        $(this.commentArea).blur();
        this.props.onCancel && this.props.onCancel();
    }

    render() {
        const { user = {}, rows = 1, hideAvatar = false, style = {} } = this.props || {};
        return <>
            <div className='comments-details' style={{ ...(style || {}), display: !user || !user._id ? '' : 'none' }}>
                <a href='#' onClick={e => e.preventDefault() || T.showLogin()}>Đăng nhập để thực hiện bình luận</a>
            </div>
            <div className='comments-details' style={{ ...(style || {}), display: user && user._id ? '' : 'none' }}>
                {!hideAvatar && <div className='comments-list-img' style={{ backgroundImage: `url('${user?.image || '/img/avatar-default.png'}')` }} />}
                <div className='comments-content-wrap contact-form' style={hideAvatar ? { marginLeft: 0, paddingLeft: 0, paddingRight: 0 } : {}}>
                    <textarea ref={e => this.commentArea = e} className='form-control' placeholder='Để lại bình luận' rows={rows} />
                    <a className='send-button' href='#' ref={e => this.sendButton = e} onClick={e => this.onSave(e)}><i className='fa fa-send' /></a>
                </div>
                <div className='comments-buttons' ref={e => this.buttons = e} style={hideAvatar ? { marginLeft: 0, paddingLeft: 0, paddingRight: 0 } : {}}>
                    <small className='text-hint'>Nhấn shift + enter để thêm dòng mới</small>
                    <button className='btn btn-primary' onClick={e => this.onSave(e)}><i className='fa fa-send' /> Lưu</button>
                    <button className='btn btn-secondary' style={{ marginLeft: '5px' }} onClick={e => this.cancel(e)}><i className='fa fa-ban' /> Hủy</button>
                </div>
            </div>
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system, user: state.system ? state.system.user : null });
const mapActionsToProps = { onCreate: createComment, onUpdate: updateComment };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(CommentTextBox);