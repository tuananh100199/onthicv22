import React from 'react';
import { connect } from 'react-redux';
import FeedbackSection from './FeedbackAdminSection';
import { AdminPage } from 'view/component/AdminPage';

class AdminFeedbackSystemPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/feedback/system');
    }
    render() {
        return this.renderPage({
            icon: 'fa fa-comments-o',
            title: 'Phản hồi',
            breadcrumb: ['Phản hồi'],
            content:<div className='tile'><FeedbackSection detailPageUrl='/user/feedback/system' type='system'/></div>,
        });
    }
}

const mapStateToProps = () => ({ });
const mapActionsToProps = { };
export default connect(mapStateToProps, mapActionsToProps)(AdminFeedbackSystemPage);
