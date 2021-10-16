import React from 'react';
import { connect } from 'react-redux';
import { getFeedbackAll,updateFeedback } from './redux';
import { AdminPage, FormRichTextBox} from 'view/component/AdminPage';

class FeedbackSection extends AdminPage {
    state={};
    componentDidMount() {
        this.props.getFeedbackAll(this.props.type,this.props._refId);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.type != this.props.type) {
            this.props.getFeedbackAll(this.props.type,this.props._refId);
        }
    }

    onClick = (e, item) => {
        e.preventDefault();
        !item.isSeen && this.props.updateFeedback(item._id,{isSeen:true});
        this.setState({ _feedbackIdSelected:item._id });
    }

    replyFeedback = () => {
        const content = this.newFeedback.value();
        if (content == '') {
            T.notify('Không thể gửi thông điệp không nội dung!', 'danger');
            this.newFeedback.focus();
        } else {
            this.props.updateFeedback(this.props._id, content ,() => {
                this.newFeedback.value('');
            });
        }
    }

    render() {
        const feedback =this.props.feedback,
             item=feedback.find((item)=>item._id==this.state._feedbackIdSelected);
        return <>
                <div className='row'>
                <div className='col-md-3' >
                    <h3 className='tile-title'>Danh sách phản hồi</h3>
                    <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
                        {/* <div style={{ marginTop: 8, marginRight: 8 }}>
                            <i className='fa fa-check'></i>: Đã trả lời
                        </div> */}
                    {feedback.length ? feedback.map((item, index) =>
                    <div key={index} style={{ marginTop: 8, marginRight: 8,...(item._id==this.state._feedbackIdSelected && { backgroundColor:'#F0F8FF' }),
                    fontWeight:item.isSeen==true?'normal':'bold' }}>              
                    <a href='#' style={{color:'black' }} onClick={e => this.onClick(e, item)}>
                        {`${item.user && item.user.lastname} ${item.user && item.user.firstname}`}</a>
                    <label>{T.dateToText(item.createdDate)}</label>
                        </div>)
                          :'Danh sách trống!'}
                    </div>
                </div>

                <div className='col-md-9'>
                    <h3 className='tile-title'>Nội dung phản hồi</h3>
                    {this.state._feedbackIdSelected ?
                    <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 0 }}>
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
                                        {T.fromNow(reply.createdDate)}
                                        </label>
                                    </div>
                                    <div className=''>
                                        {reply.content}
                                    </div>
                                </div>
                            </div>) : 'Chưa có phản hồi lại'}
                        </div>
                        <div className='row'>
                            <FormRichTextBox ref={e => this.newFeedback = e} className='col-md-11' style={{ display: 'flex' }} />
                            <div className='col-md-1'>
                                <button className='btn btn-primary' type='button' onClick={this.replyFeedback}> Gửi </button>
                            </div>
                        </div>
                    </div>               
                    :'Chọn phản hồi để xem chi tiết'}
                </div>
            </div> 
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system, feedback: state.communication.feedback });
const mapActionsToProps = { getFeedbackAll, updateFeedback };
export default connect(mapStateToProps, mapActionsToProps)(FeedbackSection);