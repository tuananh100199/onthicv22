import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormTabs } from 'view/component/AdminPage';
import UserAllChat from './userAllChat';
import UserPersonalChat from './userPersonalChat';

class ChatPage extends AdminPage {
    state = {};
    componentDidMount() {
        const route = T.routeMatcher('/user/chat/:_id'),
            _id = route.parse(window.location.pathname)._id;
        this.setState({ courseId: _id });
        if (_id) {
            T.ready('/user/hoc-vien/khoa-hoc/' + _id);
        } else {
            this.props.history.goBack();
        }
    }

    render() {
        const adminTabs = [
            { title: 'Phòng chat chung', component: <UserAllChat /> },
            { title: 'Phòng chat cá nhân', component: <UserPersonalChat /> },
        ];
        return this.renderPage({
            icon: 'fa fa-comments-o',
            title: 'Chat',
            breadcrumb: [<a key={0} href='#' onClick={() => this.props.history.goBack()}>Khóa học</a>, 'Chat'],
            content: <FormTabs id='courseEditPageTab' contentClassName='tile' tabs={adminTabs} />,
            onBack: () => this.props.history.goBack(),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, division: state.trainning.division });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(ChatPage);