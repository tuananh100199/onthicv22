import React from 'react';
import { connect } from 'react-redux';
import { getUserChats, getChatByAdmin } from './redux';
import { AdminPage } from 'view/component/AdminPage';
import './chat.scss';
import SectionChat from './sectionChat';

const previousRoute = '/user';
class LecturerPersonalChat extends AdminPage {
    state = { loading: true, listStudent: [], oldMessage: [], isLoading: true };

    componentDidMount() {
        const route = T.routeMatcher('/user/chat/:_id'),
            courseId = route.parse(window.location.pathname)._id,
            user = this.props.system.user;
        this.setState({ courseId, user });
        if (courseId) {
            this.props.getChatByAdmin(courseId, data => {
                this.props.getUserChats(data.item[0].user ? data.item[0].user._id : data.item[0]._id, null, data => {
                    this.setState({
                        oldMessage: data.chats,
                        isLoading: false
                    });
                });
                this.setState({ listTeacher: data.item, _selectedUserId: data.item[0].user ? data.item[0].user._id : data.item[0]._id });
            });
        } else {
            this.props.history.push(previousRoute);
        }
    }

    render() {
        const { isLoading, oldMessage, courseId, listTeacher, _selectedUserId } = this.state;
        return (
            !isLoading && <SectionChat type={'teacher'} oldMessagePersonal={oldMessage} courseId={courseId} listUser={listTeacher} _selectedUserId={_selectedUserId}></SectionChat>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, chat: state.trainning.chat });
const mapActionsToProps = { getChatByAdmin, getUserChats };
export default connect(mapStateToProps, mapActionsToProps)(LecturerPersonalChat);