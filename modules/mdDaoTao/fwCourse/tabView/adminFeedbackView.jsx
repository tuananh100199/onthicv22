import React from 'react';
import { connect } from 'react-redux';
import {getFeedbackAll} from 'modules/mdTruyenThong/fwFeedback/redux';
import FeedbackSection from 'modules/mdTruyenThong/fwFeedback/FeedbackSection';
// import { FormTextBox } from 'view/component/AdminPage';

class AdminFeedbackView extends React.Component {
    state={};
    componentDidMount() {
        this.props.getFeedbackAll('course',this.props.courseId);
    }

    onClick = (e, _id) => {
        e.preventDefault();
        this.setState({ _feedbackIdSelected:_id });
    }

    render() {
        const feedback =this.props.feedback;
        return (
            <div className='row'>
                <div className='col-md-3' >
                    <h3 className='tile-title'>Học viên</h3>
                    <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
                        <div style={{ marginTop: 8, marginRight: 8 }}>
                            <i className='fa fa-check'></i>: Đã trả lời
                        </div>
                    {
                        feedback.length ?feedback.map((item, index) =><div key={index} style={{ marginTop: 8, marginRight: 8 }}>
                    <b onClick={e => this.onClick(e, item._id)}>{`${item.user && item.user.lastname} ${item.user && item.user.firstname}`}</b>
                        </div>)                       :'Danh sách trống!'
                    }
                        
                    </div>
                </div>

                <div className='col-md-9'>
                    <h3 className='tile-title'>Phản hồi</h3>
                    {this.state._feedbackIdSelected && <FeedbackSection _id={this.state._feedbackIdSelected} viewBy='admin' />}
                </div>
            </div>);
    }
}

const mapStateToProps = state => ({ system: state.system, feedback: state.communication.feedback ,student: state.trainning.student });
const mapActionsToProps = {getFeedbackAll};
export default connect(mapStateToProps, mapActionsToProps)(AdminFeedbackView);
