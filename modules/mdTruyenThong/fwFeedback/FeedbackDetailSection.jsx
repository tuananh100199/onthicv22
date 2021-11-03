import React from 'react';
import { connect } from 'react-redux';
import { getFeedback, updateFeedback } from './redux';
import { FormRichTextBox } from 'view/component/AdminPage';

class FeedbackSection extends React.Component {
    componentDidMount() {
        const { _id } = this.props;
        this.props.getFeedback(_id);
    }

    replyFeedback = () => {
        const content = this.newFeedback.value();
        if (content == '') {
            T.notify('Không thể gửi thông điệp không nội dung!', 'danger');
            this.newFeedback.focus();
        } else {
            this.props.updateFeedback(this.props._id, content, () => {
                this.newFeedback.value('');
            });
        }
    }

    render() {
        // const permission = this.getUserPermission('feedback');
        const item = this.props.feedback && this.props.feedback.item;
        return item ? <>
            <div className='tile'>
                {/* <div className='tile-body'> */}
                <div className='row'>
                    <FormRichTextBox ref={e => this.newFeedback = e} className='col-md-11' style={{ display: 'flex' }} />
                    <div className='col-md-1'>
                        <button className='btn btn-primary' type='button' onClick={this.replyFeedback}> Gửi </button>
                    </div>
                </div>
                <div className='tile-body'>
                    <div style={{ marginRight: 100 }}>
                        <div className='row'>
                            <div className='col-md-1' >
                                <img src={item.user && item.user.image} style={{ height: '40px', borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5 }} alt='no image'></img>
                            </div>
                            <div className='col-md-11' style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5 }}>
                                <div className=''>
                                    <b>{`${item.user && item.user.lastname} ${item.user && item.user.firstname}`}</b>
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
                            {item.replies.length ? item.replies.map((reply, index) => <div className='row' style={{ marginTop: 10 }} key={index}>
                                <div className='col-md-1'>
                                    {/* {index==0 && <i className='fa fa-share'></i>} */}
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
                            </div>) : null}
                        </div>
                    </div>
                </div>
            </div>
        </> : null;
    }
}

const mapStateToProps = state => ({ system: state.system, feedback: state.communication.feedback });
const mapActionsToProps = { getFeedback, updateFeedback };
export default connect(mapStateToProps, mapActionsToProps)(FeedbackSection);