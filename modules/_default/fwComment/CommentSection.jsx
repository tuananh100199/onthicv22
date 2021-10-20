import React from 'react';
import { connect } from 'react-redux';
import { getCommentPage } from './redux';
import Comment from './Comment';
import CommentTextBox from './CommentTextBox';
import Pagination from 'view/component/Pagination';

class CommentSection extends React.Component {
    state = { pageNumber: 1, pageSize: 20, pageTotal: -1, list: [] };
    componentDidMount() {
        $(document).ready(() => this.getData());
    }

    getData = (pageNumber = this.state.pageNumber) => {
        const { refParentId, refId } = this.props;
        this.props.getCommentPage(refParentId, refId, null, null, page => {
            if (pageNumber != this.state.pageNumber) {
                $('html, body').stop().animate({
                    scrollTop: $(this.commentArea).offset().top - 100
                }, 1000);
            }
            this.setState(page);
        });
    };

    updateItem = (type, item) => {
        if (!type || type == 'create' || type == 'delete') {
            this.getData();
        } else {
            const list = this.state.list || [], index = list.findIndex(_item => _item._id == item._id);
            const newItem = Object.assign({}, list[index], item);
            list.splice(index, 1, newItem);
            this.setState({ list });
        }
    }

    render() {
        const { refParentId, refId } = this.props;
        const { pageNumber, pageSize, pageTotal, list } = this.state;
        return (
            <div className={this.props.className}>
                <div className='comment-respond'>
                    <h3 className='comment-reply-title'>Để lại bình luận</h3>
                    {refParentId && refId ? <CommentTextBox refParentId={refParentId} refId={refId} onChange={this.updateItem} rows={2} maxRows={4} /> : null}
                </div>
                <div className='comments-area' ref={e => this.commentArea = e}>
                    <div className='comments-heading'>
                        <h3>Bình luận</h3>
                    </div>
                    <div className='comments-list'>
                        {list && list.length ?
                            <ul style={{ listStyleType: 'none' }}>
                                {list.map((comment, index) => <Comment key={index} refParentId={refParentId} refId={refId} comment={comment} onChange={this.updateItem} />)}
                            </ul> : 'Chưa có bình luận!'}
                    </div>
                    <Pagination name='pageComment' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} getPage={this.getData} style={{ marginLeft: 45 }} />
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, comment: state.framework.comment });
const mapActionsToProps = { getCommentPage };
export default connect(mapStateToProps, mapActionsToProps)(CommentSection);