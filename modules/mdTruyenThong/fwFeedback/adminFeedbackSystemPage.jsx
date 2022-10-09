import React from 'react';
import { connect } from 'react-redux';
import FeedbackSection from './FeedbackAdminSection';
import { AdminPage } from 'view/component/AdminPage';

class AdminFeedbackSystemPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/feedback/system');
    }
    render() {
        const permission = this.getUserPermission('feedback');
        return this.renderPage({
            icon: 'fa fa-comments-o',
            title: 'Phản hồi',
            breadcrumb: ['Phản hồi'],
            content:<div className='tile'><FeedbackSection permission={permission} history={this.props.history} detailPageUrl='/user/feedback/system' type='system'/></div>,
        });
    }
}

const mapStateToProps = (state) => ({ system: state.system });
const mapActionsToProps = { };
export default connect(mapStateToProps, mapActionsToProps)(AdminFeedbackSystemPage);
