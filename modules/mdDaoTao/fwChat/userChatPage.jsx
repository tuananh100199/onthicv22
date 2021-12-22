import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormTabs } from 'view/component/AdminPage';
import { getAdminChatByStudent, getChatByAdmin,getUserChats } from './redux';
import UserAllChat from './userAllChat';
import UserPersonalChat from './userPersonalChat';
import AdminAllChat from './adminAllChat';
// import LecturerPersonalChat from './lecturerPersonalChat';
import AdminPersonalChat from './adminPersonalChat';

class ChatPage extends AdminPage {
    state = { userChat: false, adminChat:false };
    componentDidMount() {
        const route = T.routeMatcher('/user/chat/:_id'),
            _id = route.parse(window.location.pathname)._id;
        const sessionUser = this.props.system.user;
        this.setState({ courseId: _id });
        if (_id) {
            if (sessionUser.isCourseAdmin || sessionUser.isLecturer) {
                T.ready('/user/course');
                this.props.getChatByAdmin(_id, data => {
                    if(data && data.item && data.item.length) this.setState({ adminChat: true });
                    else this.setState({ adminChat: false });
                });
            } else {
                T.ready('/user/hoc-vien/khoa-hoc/' + _id);
                this.props.getAdminChatByStudent(_id, data => {
                    if (data.item && data.item._id) this.setState({ userChat: true }); 
                    else this.setState({ userChat: false });
                });
            }
        } else {
            this.props.history.goBack();
        }
    }

    render() {
        const sessionUser = this.props.system.user,
            isAdmin = sessionUser.isCourseAdmin || sessionUser.isLecturer,
            {userChat, adminChat} = this.state;
        const adminTabs = [
            { title: 'Phòng chat chung', component: <AdminAllChat /> },
        ];
        if(adminChat && (sessionUser.isLecturer||sessionUser.isCourseAdmin)) adminTabs.push({ title: 'Phòng chat cá nhân', component: <AdminPersonalChat /> });
        const userTabs = [
            { title: 'Phòng chat chung', component: <UserAllChat /> },
        ];
        if (userChat) userTabs.push({ title: 'Phòng chat cá nhân', component: <UserPersonalChat /> });
        const backRoute = isAdmin ? `/user/course/${this.state.courseId}` : `/user/hoc-vien/khoa-hoc/${this.state.courseId}`;
        return this.renderPage({
            icon: 'fa fa-comments-o',
            title: 'Chat',
            breadcrumb: [<a key={0} href='#' onClick={() => this.props.history.goBack()}>Khóa học</a>, 'Chat'],
            content: <FormTabs id='courseEditPageTab' contentClassName='tile' tabs={isAdmin ? adminTabs : userTabs} />,
            backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, division: state.trainning.division });
const mapActionsToProps = { getAdminChatByStudent,getChatByAdmin,getUserChats };
export default connect(mapStateToProps, mapActionsToProps)(ChatPage);