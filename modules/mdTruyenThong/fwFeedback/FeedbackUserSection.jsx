import React from 'react';
import { connect } from 'react-redux';
import { createFeedback, getFeedbackPageByStudent } from './redux';
import { AdminPage, FormRichTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class FeedbackSection extends AdminPage {
    componentDidMount() {
        const { type, _refId } = this.props;
        this.props.getFeedbackPageByStudent(1, 50, { type, _refId });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.type != this.props.type) {
            const { type, _refId } = this.props;
            this.props.getFeedbackPageByStudent(1, 50, { type, _refId });
        }
    }

    sendFeedback = (e) => {
        e.preventDefault();
        const content = this.newFeedback.value().trim(),
            newData = {
                ...(this.props.type != 'system' && { _refId: this.props._refId }),
                type: this.props.type,
                content,
            };
        if (content == '') {
            T.notify('Không thể gửi thông điệp không nội dung!', 'danger');
            this.newFeedback.focus();
        } else {
            this.props.createFeedback(newData, () => {
                this.newFeedback.value('');
            });
        }
    }

    render() {
        // const permission = this.getUserPermission('feedback');
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.feedback && this.props.feedback.page ?
            this.props.feedback.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        return <>
            <div className='tile'>
                <div className='row'>
                    <FormRichTextBox ref={e => this.newFeedback = e} className='col-md-11' style={{ display: 'flex' }} />
                    <div className='col-md-1'>
                        <button className='btn btn-primary' type='button' onClick={this.sendFeedback}> Gửi </button>
                    </div>
                </div>
                <div className='tile-body'>
                    {list.length ? list.map((item, index) => <div key={index} style={{ margin: 10 }}>
                        <div className='row'>
                            <div className='col-md-1' >
                                <img src={item.user && item.user.image} style={{ height: '40px', borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5 }} alt='no image'></img>
                            </div>
                            <div className='col-md-11' style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5 }}>
                                <div className=''>
                                    <b>{`${item.user && item.user.lastname} ${item.user && item.user.firstname}`}</b> (Bạn):
                                        <label style={{ float: 'right' }}>
                                        {T.fromNow(item.createdDate)}
                                    </label>
                                </div>
                                <div className=''>
                                    {item.content}
                                </div>
                            </div>
                        </div>
                        <div style={{ marginTop: 10 }}>
                            {item.replies.length ? item.replies.map((reply, index) => <div className='row' style={{ margin: 10 }} key={index}>
                                <div className='col-md-1'>
                                    <i className='fa fa-share'></i>
                                </div>
                                <div className='col-md-1'>
                                    <img src={reply.adminUser && reply.adminUser.image} style={{ height: '40px', borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5 }} alt='no image'></img>
                                </div>
                                <div className='col-md-10' style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5 }}>
                                    <div className=''>
                                        <b>{reply.adminUser && `${reply.adminUser.lastname} ${reply.adminUser.firstname}`}</b>
                                            (Quản trị viên):
                                            <label style={{ float: 'right' }}>
                                            {T.fromNow(reply.createdDate)}
                                        </label>
                                    </div>
                                    <div className=''>
                                        {reply.content}
                                    </div>
                                </div>
                            </div>) : 'Chưa được trả lời từ quản trị viên'}
                        </div>
                    </div>) : 'Chưa có phản hồi'}
                </div>
            </div>
            <Pagination pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                getPage={this.props.getFeedbackPageByStudent} style={{ left: 320 }} />
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system, feedback: state.communication.feedback });
const mapActionsToProps = { createFeedback, getFeedbackPageByStudent };
export default connect(mapStateToProps, mapActionsToProps)(FeedbackSection);