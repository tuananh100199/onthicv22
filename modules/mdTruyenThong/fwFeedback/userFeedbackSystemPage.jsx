import React from 'react';
import { connect } from 'react-redux';
import FeedbackSection from './FeedbackUserSection';
import { AdminPage } from 'view/component/AdminPage';

class userFeedbackSystemPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/feedback');
    }
    render() {
        return this.renderPage({
            icon: 'fa fa-cog',
            title: 'Phản hồi',
            breadcrumb: ['Phản hồi'],
            content: <FeedbackSection type='system' />,
        });
    }
}

const mapStateToProps = () => ({});
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(userFeedbackSystemPage);
