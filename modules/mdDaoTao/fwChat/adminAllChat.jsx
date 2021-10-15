import React from 'react';
import { connect } from 'react-redux';
import { createMessage, getOldMessage, readAllChats, getAllChats, addChat } from './redux';
import { AdminPage } from 'view/component/AdminPage';
import './chat.scss';
import T from 'view/js/common';
import inView from 'in-view';

const previousRoute = '/user';
class AdminAllChat extends AdminPage {
    state = { clientId: null, oldMessage: [] };
    componentDidMount() {
        const courseId = this.props.courseId,
            user = this.props.system.user;
        this.setState({ courseId, user, currentLoaded: 0 });
        if (courseId) {
            this.props.getAllChats(courseId, null, data => {
                this.setState({ oldMessage: data.chats.sort(() => -1) });
            });
            T.socket.emit('chat:join', { _roomId: courseId });
        } else {
            this.props.history.push(previousRoute);
        }
        T.socket.on('chat:send', this.onReceiveMessage);
        this.scrollToBottom();
    }

    componentDidUpdate() {
        this.scrollToChat;
    }

    componentWillUnmount() {
        T.socket.off('chat:send');
    }

    loadMoreChats = () => inView('.listViewLoading').on('enter', () => { // Scroll on top and load more chats
        const chats = this.state.oldMessage,
            chatLength = chats ? chats.length : 0,
            sent = chats && chats.length ? chats[0].sent : null;
        this.props.getAllChats(this.state.courseId, sent, data => {
            const loadedChats = data.chats.sort(() => -1);
            this.setState(prevState => ({
                oldMessage: loadedChats.concat(prevState.oldMessage),
                isLastedChat: data.chats && data.chats.length < 20
            }));
            this.scrollToChat(chatLength - 1);
        });
    });

    scrollToChat = (index = 19, attemptNumber = 5) => {
        const userChats = this.state.oldMessage ? this.state.oldMessage : [],
            chat = userChats && userChats.length > index && userChats[index] ? document.getElementById(`chat${userChats[index]._id}`) : null;
        if (chat) {
            chat.scrollIntoView({});
        } else {
            attemptNumber && setTimeout(() => this.scrollToChat(index, attemptNumber - 1), 1000);
        }
    }


    onSendMessage = (e) => {
        e.preventDefault();
        const receiver = this.state.courseId,
            message = this.message.value;
        if (receiver && message !== '') {
            T.socket.emit('chat:send', { receiver, message });
            this.message.value = '';
            this.message.focus();
        }
    }

    scrollToBottom = () => {
        this.scrollDown.scrollIntoView({ behavior: 'smooth' });
    }

    onReceiveMessage = (data) => {
        const user = this.props.system ? this.props.system.user : null;
        const chat = data ? data.chat : null;
        if (user && chat) {
            this.props.addChat(user._id == chat.sender._id, data.chat);
            this.setState(prevState => ({
                oldMessage: [...prevState.oldMessage, data.chat]
            }));
        }
        this.scrollToBottom();
    }

    render() {
        const urlRegex = /^(https?|chrome):\/\/[^\s$.?#].[^\s]*$/gm;
        const renderMess = this.state.oldMessage.map((message, index, element) => {
            const prev_msg = element[index - 1],
                isNow = (prev_msg && (new Date(prev_msg.sent).getTime() + 300000 >= new Date(message.sent).getTime())),
                isNewDay = !(prev_msg && T.dateToText(prev_msg.sent, 'dd/mm/yyyy') == T.dateToText(new Date(), 'dd/mm/yyyy')),
                isNewUser = (!isNow || (prev_msg && prev_msg.sender._id != message.sender._id)) && message.sender._id != this.state.user._id,
                newMessage = message.message.split(' ').map((part, index) =>
                    urlRegex.test(part) ? <a key={index} style={{ color: message.sender._id != this.state.user._id ? 'black' : 'white' }} href={part} target='_blank' rel='noreferrer' ><u>{part}</u></a> : part + ' '
                );
            return (
                <div key={index}>
                    {isNewDay ?
                        !isNow && <p className='text-secondary text-center'>{T.dateToText(message.sent, 'dd/mm HH:MM')}</p> :
                        !isNow && <p className='text-secondary text-center'>{T.dateToText(message.sent, 'HH:MM')}</p>}
                    <div style={{ marginBottom: '5px' }} className={(message.sender._id == this.state.user._id) ? 'message me' : 'message'}>
                        {isNewUser && <img style={{ width: '30px' }} src={message.sender.image} alt={message.lastname} />}
                        <div>
                            {isNewUser && <div className={'font-weight-bold mb-0 ' + (message.sender.isCourseAdmin ? 'text-danger' : (message.sender.isLecturer ? 'text-primary' : ''))}>{message.sender.firstname + ' ' + message.sender.lastname + ' '}</div>}
                            <p className='info' style={{ position: 'static', marginLeft: isNewUser ? '0px' : '45px' }} data-toggle='tooltip' title={T.dateToText(message.sent, isNewDay ? 'dd/mm HH:MM' : 'HH:MM')}>{newMessage}</p>
                        </div>
                    </div>
                </div>
            );
        });

        return (
            <div className='messanger' style={{ minHeight: '300px' }}>
                <div className='messages' style={{ height: '300px', overflowY: 'scroll' }} >
                    {renderMess}
                    <div ref={e => this.scrollDown = e}></div>
                </div>
                <form style={{ display: 'flex' }} onSubmit={this.onSendMessage}>
                    <input ref={e => this.message = e} type='text' style={{ flex: 1, border: '1px solid #1488db', outline: 'none', padding: '5px 10px' }} />
                    <button className='btn btn-primary' type='submit' style={{ borderRadius: 0 }}>
                        <i className='fa fa-lg fa-fw fa-paper-plane' />
                    </button>
                </form>
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { createMessage, getOldMessage, readAllChats, getAllChats, addChat };
export default connect(mapStateToProps, mapActionsToProps)(AdminAllChat);