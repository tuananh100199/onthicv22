import React from 'react';
import { connect } from 'react-redux';
import { getFeedbackAll, updateFeedback } from 'modules/mdTruyenThong/fwFeedback/redux';
import FeedbackSection from 'modules/mdTruyenThong/fwFeedback/FeedbackSection';

class AdminFeedbackView extends React.Component {
    state = {};
    componentDidMount() {
        this.props.getFeedbackAll('course', this.props.courseId);
    }

    onClick = (e, item) => {
        e.preventDefault();
        !item.isSeen && this.props.updateFeedback(item._id, { isSeen: true });
        this.setState({ _feedbackIdSelected: item._id });
    }

    render() {
        const feedback = this.props.feedback;
        return (
            <div className='row'>
                <div className='col-md-3' >
                    <h3 className='tile-title'>Danh sách phản hồi</h3>
                    <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
                        {/* <div style={{ marginTop: 8, marginRight: 8 }}>
                            <i className='fa fa-check'></i>: Đã trả lời
                        </div> */}
                        {feedback.length ? feedback.map((item, index) =>
                            <div key={index} style={{
                                marginTop: 8, marginRight: 8, ...(item._id == this.state._feedbackIdSelected && { backgroundColor: '#F0F8FF' }),
                                fontWeight: item.isSeen == true ? 'normal' : 'bold'
                            }}>
                                <a href='#' style={{ color: 'black' }} onClick={e => this.onClick(e, item)}>
                                    {`${item.user && item.user.lastname} ${item.user && item.user.firstname}`}</a>
                                <label>{T.dateToText(item.createdDate)}</label>
                            </div>)
                            : 'Danh sách trống!'}
                    </div>
                </div>

                <div className='col-md-9'>
                    <h3 className='tile-title'>Nội dung phản hồi</h3>
                    {this.state._feedbackIdSelected ? <FeedbackSection _id={this.state._feedbackIdSelected} viewBy='admin' type='course' isTitleHidden={true} /> : 'Chọn phản hồi để xem chi tiết'}
                </div>
            </div>);
    }
}

const mapStateToProps = state => ({ system: state.system, feedback: state.communication.feedback, student: state.trainning.student });
const mapActionsToProps = { getFeedbackAll, updateFeedback };
export default connect(mapStateToProps, mapActionsToProps)(AdminFeedbackView);
