import React from 'react';
import { connect } from 'react-redux';
import { getFeedbackAll, createFeedback } from './redux';
import { AdminPage, FormRichTextBox} from 'view/component/AdminPage';

class FeedbackSection extends AdminPage {
    componentDidMount() {
        this.props.getFeedbackAll(this.props.type,this.props._refId);
    }

    sendFeedback = () => {
        const content = this.newFeedback.value(),
            data = {
                _refId: this.props._refId,
                type: this.props.type,
                content: content,
                replies: [],
            };
        if (content == '') {
            T.notify('Không thể gửi thông điệp không nội dung!', 'danger');
            this.newFeedback.focus();
        } else {
            this.props.createFeedback(data, () => {
                this.newFeedback.value('');
            });
        }
    }

    render() {
        // const permission = this.getUserPermission('feedback');
        const feedback =this.props.feedback;
        return <>
            <div className='tile'>
            <h3 className='tile-title'>Phản hồi {this.props.type =='course'?'khóa học':''}</h3>
            <div className='tile-body'>
                        {feedback && feedback.length ? feedback.map((item, index) => <div key={index} style={{ margin: 10 }}>
                            <div className='row'>
                                <div className='col-md-1' >
                                    <img src={item.user && item.user.image} style={{ height: '40px', borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5 }} alt='no image'></img>
                                </div>
                                <div className='col-md-11' style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5 }}>
                                    <div className=''>
                                        <b>{`${item.user && item.user.lastname} ${item.user && item.user.firstname}`}</b> (Bạn):
                                        <label style={{ float: 'right' }}>
                                            {T.dateToText(item.createdDate)}
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
                                            (Quản trị khóa học):
                                            <label style={{ float: 'right' }}>
                                                {T.dateToText(reply.createdDate)}
                                            </label>
                                        </div>
                                        <div className=''>
                                            {reply.content}
                                        </div>
                                    </div>
                                </div>) : `Chưa có phản hồi từ quản trị ${this.props.type =='course'?'khóa học':''} `}
                            </div>
                        </div>) : 'Chưa có phản hồi'}
                    </div>    
                    <div className='tile-footer'>
                        <div className='row'>
                            <FormRichTextBox ref={e => this.newFeedback = e} className='col-md-11' style={{ display: 'flex' }} />
                            <div className='col-md-1'>
                                <button className='btn btn-primary' type='button' onClick={() => this.sendFeedback}> Gửi </button>
                            </div>
                        </div>
                    </div>      
            </div>
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system, feedback: state.comunication.feedback });
const mapActionsToProps = { getFeedbackAll, createFeedback };
export default connect(mapStateToProps, mapActionsToProps)(FeedbackSection);