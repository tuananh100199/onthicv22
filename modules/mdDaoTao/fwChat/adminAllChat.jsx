import React from 'react';
import { connect } from 'react-redux';
import { readAllChats, getAllChats, addChat } from './redux';
import { AdminPage } from 'view/component/AdminPage';
import './chat.scss';
import T from 'view/js/common';
import SectionChat from './sectionChat';

const previousRoute = '/user';
class AdminAllChat extends AdminPage {
    state = { clientId: null, oldMessage: [], isLoading: true };
    componentDidMount() {
        const courseId = this.props.courseId,
            user = this.props.system.user;
        this.setState({ courseId, user });
        if (courseId) {
            this.props.getAllChats(courseId, null, data => {
                this.setState({ oldMessage: data.chats.sort(() => -1), isLoading: false });
            });
            T.socket.emit('chat:join', { _roomId: courseId });
        } else {
            this.props.history.push(previousRoute);
        }
        T.socket.on('chat:send', this.onReceiveMessage);
        // this.scrollToBottom();
    }

    componentWillUnmount() {
        T.socket.off('chat:send');
    }

    render() {
        const { oldMessage, isLoading } = this.state;
        return (
            !isLoading ? <SectionChat courseId={this.props.courseId} oldMessage={oldMessage}></SectionChat> : null
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { readAllChats, getAllChats, addChat };
export default connect(mapStateToProps, mapActionsToProps)(AdminAllChat);