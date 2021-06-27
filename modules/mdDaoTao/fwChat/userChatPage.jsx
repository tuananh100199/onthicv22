import React from 'react';
import { connect } from 'react-redux';
import { createMessage } from './redux';
import { AdminPage, FormTabs } from 'view/component/AdminPage';
import UserAllChat from './userAllChat';
import UserPersonalChat from './userPersonalChat';


const previousRoute = '/user';
class ChatPage extends AdminPage {
    componentDidMount() {
        const route = T.routeMatcher('/user/chat/:_id'),
            _id = route.parse(window.location.pathname)._id;
        this.setState({ courseId: _id });
        if (_id) {
            T.ready('/user/hoc-vien/khoa-hoc/' + _id, () => {


            });
        } else {
            this.props.history.push(previousRoute);
        }
    }



    render() {
        // const permission = this.getUserPermission('chat');
        const adminTabs = [
            { title: 'Phòng chat chung', component: <UserAllChat /> },
            { title: 'Phòng chat cá nhân', component: <UserPersonalChat /> },
        ];
        return this.renderPage({
            icon: 'fa fa-comment',
            title: 'Chat room',
            breadcrumb: ['Chat'],
            content: <FormTabs id='courseEditPageTab' contentClassName='tile' tabs={adminTabs} />,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, division: state.trainning.division });
const mapActionsToProps = { createMessage };
export default connect(mapStateToProps, mapActionsToProps)(ChatPage);