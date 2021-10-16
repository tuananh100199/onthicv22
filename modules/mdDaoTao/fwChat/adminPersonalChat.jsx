import React from 'react';
import { connect } from 'react-redux';
import { readAllChats, getUserChats, addChat } from './redux';
// import { debounce } from 'lodash';
import { getLearingProgressByLecturer, getChatByAdmin } from '../fwCourse/redux';
import { AdminPage } from 'view/component/AdminPage';
// import chatComponent from './chatComponent';
import './chat.scss';
import SectionChat from './sectionChat';

const previousRoute = '/user';
class AdminPersonalChat extends AdminPage {
    state = { loading: true, listStudent: [], oldMessage: [], isLoading: true };

    componentDidMount() {
        const courseId = this.props.courseId,
            user = this.props.system.user;
        this.setState({ courseId, user });
        if (courseId) {
            this.props.getChatByAdmin(courseId, data => {
                this.props.getUserChats(data.item[0].user._id, null, data => {
                    this.setState({
                        oldMessage: data.chats.sort(() => -1),
                        isLoading: false
                    });
                });
                this.setState({ listStudent: data.item, _selectedUserId: data.item[0].user._id });
            });
        } else {
            this.props.history.push(previousRoute);
        }
    }

    render() {
        const { isLoading, oldMessage, courseId, listStudent, _selectedUserId } = this.state;
        return (
            !isLoading && <SectionChat oldMessagePersonal={oldMessage} courseId={courseId} listUser={listStudent} _selectedUserId={_selectedUserId}></SectionChat>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, chat: state.trainning.chat });
const mapActionsToProps = { getLearingProgressByLecturer, getChatByAdmin, readAllChats, getUserChats, addChat };
export default connect(mapStateToProps, mapActionsToProps)(AdminPersonalChat);