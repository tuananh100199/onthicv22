import React from 'react';
import { connect } from 'react-redux';
import { getAdminChatByStudent, getUserChats } from './redux';
import { AdminPage } from 'view/component/AdminPage';
// import chatComponent from './chatComponent';
import './chat.scss';
import SectionChat from './sectionChat';
const previousRoute = '/user';
class UserPersonalChat extends AdminPage {
    state = { loading: true, listAdmin: [], oldMessage: [], isLoading: true };

    componentDidMount() {
        const route = T.routeMatcher('/user/chat/:_id'),
            courseId = route.parse(window.location.pathname)._id,
            user = this.props.system.user;
        this.setState({ courseId, user });
        if (courseId) {
            T.ready('/user/hoc-vien/khoa-hoc/' + courseId, () => {
                this.props.getAdminChatByStudent(courseId, data => {
                    this.props.getUserChats(data.item[0]._id, null, chat => {
                        this.setState({
                            oldMessage: chat.chats.sort(() => -1),
                            listAdmin: data.item,
                            _selectedUserId: data.item && data.item[0]._id,
                            isLoading: false
                        });
                    });
                });
            });

        } else {
            this.props.history.push(previousRoute);
        }
    }

    render() {
        const { isLoading, oldMessage, courseId, listAdmin, _selectedUserId } = this.state;
        return (
            !isLoading && <SectionChat oldMessagePersonal={oldMessage} courseId={courseId} listUser={listAdmin} _selectedUserId={_selectedUserId}></SectionChat>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, chat: state.trainning.chat });
const mapActionsToProps = { getAdminChatByStudent, getUserChats };
export default connect(mapStateToProps, mapActionsToProps)(UserPersonalChat);