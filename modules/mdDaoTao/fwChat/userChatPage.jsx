import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormTabs } from 'view/component/AdminPage';
import UserAllChat from './userAllChat';
import UserPersonalChat from './userPersonalChat';
import AdminAllChat from './adminAllChat';
import AdminPersonalChat from './adminPersonalChat';

class ChatPage extends AdminPage {
    state = {};
    componentDidMount() {
        const route = T.routeMatcher('/user/chat/:_id'),
            _id = route.parse(window.location.pathname)._id;
        const sessionUser = this.props.system.user;
        this.setState({ courseId: _id });
        if (_id) {
            if (sessionUser.isCourseAdmin || sessionUser.isLecturer) {
                T.ready('/user/course');
            } else {
                T.ready('/user/hoc-vien/khoa-hoc/' + _id);
            }
        } else {
            this.props.history.goBack();
        }
    }

    render() {
        const sessionUser = this.props.system.user,
            isAdmin = sessionUser.isCourseAdmin || sessionUser.isLecturer;
        const adminTabs = [
            { title: 'Phòng chat chung', component: <AdminAllChat /> },
            sessionUser.isLecturer && { title: 'Phòng chat cá nhân', component: <AdminPersonalChat /> },
        ];
        const userTabs = [
            { title: 'Phòng chat chung', component: <UserAllChat /> },
            { title: 'Phòng chat cá nhân', component: <UserPersonalChat /> },
        ];
        return this.renderPage({
            icon: 'fa fa-comments-o',
            title: 'Chat',
            breadcrumb: [<a key={0} href='#' onClick={() => this.props.history.goBack()}>Khóa học</a>, 'Chat'],
            content: <FormTabs id='courseEditPageTab' contentClassName='tile' tabs={isAdmin ? adminTabs : userTabs} />,
            onBack: () => this.props.history.goBack(),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, division: state.trainning.division });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(ChatPage);