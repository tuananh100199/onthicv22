import React from 'react';
import FeedbackSection from 'modules/mdTruyenThong/fwFeedback/FeedbackAdminSection';

export default class AdminFeedbackView extends React.Component {
    render() {
        return <FeedbackSection type='course' _refId={this.props.courseId} />;
    }
}