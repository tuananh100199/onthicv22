import React from 'react';
import { connect } from 'react-redux';
import FeedbackSection from 'modules/mdTruyenThong/fwFeedback/FeedbackUserSection';
import { AdminPage } from 'view/component/AdminPage';

class userFeedbackSystemPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/feedback/system');
    }
    render() {
        return this.renderPage({
            icon: 'fa fa-cog',
            title: 'Phản hồi hệ thống',
            breadcrumb: ['Phản hồi hệ thống'],
            content:<FeedbackSection type='system' title='hệ thống'/>,
        });
    }
}

const mapStateToProps = () => ({ });
const mapActionsToProps = { };
export default connect(mapStateToProps, mapActionsToProps)(userFeedbackSystemPage);
