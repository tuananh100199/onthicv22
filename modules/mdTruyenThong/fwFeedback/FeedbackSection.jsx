import React from 'react';
import { connect } from 'react-redux';
import { getFeedbackAllByUser, createFeedback,updateFeedback } from './redux';
import { AdminPage, FormRichTextBox} from 'view/component/AdminPage';

const dayjs = require('dayjs'),relativeTime = require('dayjs/plugin/relativeTime'),updateLocale = require('dayjs/plugin/updateLocale');
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);
dayjs.updateLocale('en', {
    relativeTime: {
      past: '%s cách đây',
      s: 'vài giây',
      m: '1 phút',
      mm: '%d phút',
      h: '1 giờ',
      hh: '%d giờ',
      d: '1 ngày',
      dd: '%d ngày',
      M: '1 tháng',
      MM: '%d tháng',
      y: '1 năm',
      yy: '%d năm'
    }
  });
class FeedbackSection extends AdminPage {
    componentDidMount() {
        this.props.viewBy =='admin'|| this.props.getFeedbackAllByUser(this.props.type,this.props._refId);
    }

    sendFeedback = () => {
        const content = this.newFeedback.value(),
            data = {
                _refId: this.props._refId,
                type: this.props.type,
                content: content,
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
        // const permission = this.getUserPermission('feedback');
        const feedback =this.props.feedback,
        item=this.props.viewBy =='admin' && feedback.find((item)=>item._id==this.props._id);
        return <>
            <div className='tile'>
            {!this.props.isTitleHidden && <h3 className='tile-title'>Phản hồi {this.props.type =='course'?'khóa học':''}</h3>}
            <div className='tile-body'>
                        {this.props.viewBy =='admin'?
                        <div style={{ margin: 10 }}>
                        <div className='row'>
                            <div className='col-md-1' >
                                <img src={item.user && item.user.image} style={{ height: '40px', borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5 }} alt='no image'></img>
                            </div>
                            <div className='col-md-11' style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5 }}>
                                <div className=''>
                                    <b>{`${item.user && item.user.lastname} ${item.user && item.user.firstname}`}</b>
                                    <label style={{ float: 'right' }}>
                                        {/* {T.dateToText(item.createdDate)} */}
                                        {/* dayjs.extend(relativeTime) */}
                                        {dayjs(item.createdDate).fromNow()}
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
                                        {dayjs(reply.createdDate).fromNow()}
                                            {/* {T.dateToText(reply.createdDate)} */}
                                        </label>
                                    </div>
                                    <div className=''>
                                        {reply.content}
                                    </div>
                                </div>
                            </div>) : `Chưa có phản hồi từ quản trị ${this.props.type =='course'?'khóa học':''} `}
                        </div>
                    </div>
                        :
                        (feedback.length ? feedback.map((item, index) => <div key={index} style={{ margin: 10 }}>
                            <div className='row'>
                                <div className='col-md-1' >
                                    <img src={item.user && item.user.image} style={{ height: '40px', borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5 }} alt='no image'></img>
                                </div>
                                <div className='col-md-11' style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5 }}>
                                    <div className=''>
                                        <b>{`${item.user && item.user.lastname} ${item.user && item.user.firstname}`}</b> (Bạn):
                                        <label style={{ float: 'right' }}>
                                        {dayjs(item.createdDate).fromNow()}
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
                                            {dayjs(reply.createdDate).fromNow()}
                                            </label>
                                        </div>
                                        <div className=''>
                                            {reply.content}
                                        </div>
                                    </div>
                                </div>) : `Chưa có phản hồi từ quản trị ${this.props.type =='course'?'khóa học':''} `}
                            </div>
                        </div>) : 'Chưa có phản hồi')}
                    </div>    
                    <div className='tile-footer'>
                        <div className='row'>
                            <FormRichTextBox ref={e => this.newFeedback = e} className='col-md-11' style={{ display: 'flex' }} />
                            <div className='col-md-1'>
                                <button className='btn btn-primary' type='button' onClick={this.props.viewBy=='admin'?this.replyFeedback:this.sendFeedback}> Gửi </button>
                            </div>
                        </div>
                    </div>      
            </div>
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system, feedback: state.communication.feedback });
const mapActionsToProps = { getFeedbackAllByUser, createFeedback,updateFeedback };
export default connect(mapStateToProps, mapActionsToProps)(FeedbackSection);