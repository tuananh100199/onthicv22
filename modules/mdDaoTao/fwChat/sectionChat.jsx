import React from 'react';
import { connect } from 'react-redux';
import { readAllChats, getAllChats, getUserChats, addChat } from './redux';
import { AdminPage } from 'view/component/AdminPage';
import './chat.scss';
import inView from 'in-view';

class SectionChat extends AdminPage {
    state = { clientId: null, oldMessageAll: [], oldMessagePersonal: [] };
    componentDidMount() {
        const { courseId, listUser, _selectedUserId } = this.props,
            user = this.props.system.user;
        this.setState({ courseId, user, listUser, _selectedUserId });
        this.props.oldMessageAll && this.setState({
            oldMessageAll: this.props.oldMessageAll
        });
        this.props.oldMessagePersonal && this.setState({
            oldMessagePersonal: this.props.oldMessagePersonal
        });
        _selectedUserId ? T.socket.emit('chat:join', { _userId: _selectedUserId }) : T.socket.emit('chat:joinCourseRoom', { courseId });
        T.socket.on('chat:send', this.onReceiveMessage);
    }

    componentDidUpdate() {
        const listUser = this.state;
        !this.state._selectedUserId && listUser && listUser.length && this.selectUser(listUser[0]);
        this.scrollToChat;
    }

    componentWillUnmount() {
        T.socket.off('chat:send');
    }

    loadMoreChats = () => inView('.listViewLoading').on('enter', () => { // Scroll on top and load more chats
        const _selectedUserId = this.state._selectedUserId ? this.state._selectedUserId : null;
        if (_selectedUserId) {
            const chats = this.state.oldMessagePersonal,
                chatLength = chats ? chats.length : 0,
                sent = chats && chats.length ? chats[0].sent : null;
            this.props.getUserChats(_selectedUserId, sent, data => {
                const loadedChats = data.chats.sort(() => -1);
                this.setState(prevState => ({
                    oldMessagePersonal: loadedChats.concat(prevState.oldMessagePersonal),
                    isLastedChat: data.chats && data.chats.length < 20
                }));
                this.scrollToChat(chatLength - 1);
            });
        } else {
            const chats = this.state.oldMessageAll,
                chatLength = chats ? chats.length : 0,
                sent = chats && chats.length ? chats[0].sent : null;
            this.props.getAllChats(this.state.courseId, sent, data => {
                const loadedChats = data.chats.sort(() => -1);
                this.setState(prevState => ({
                    oldMessageAll: loadedChats.concat(prevState.oldMessageAll),
                    isLastedChat: data.chats && data.chats.length < 20
                }));
                this.scrollToChat(chatLength - 1);
            });
        }
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

    selectUser = (student) => {
        const studentId = student.user ? student.user._id : student._id;
        if (this.state._selectedUserId != studentId && this.props.system && this.props.system.user) {
            // this.selectedUser = student.user;
            this.props.getUserChats(studentId, null, data => {
                this.setState({
                    oldMessagePersonal: data.chats.sort(() => -1),
                    _selectedUserId: studentId,
                    isLastedChat: false,
                    userName: student.firstname + ' ' + student.lastname,
                    userImage: student.image
                });
            });
            !this.state.loading && T.socket.emit('chat:join', { _userId: studentId });
        }
    }


    onSendMessage = (e) => {
        e.preventDefault();
        const receiver = this.state._selectedUserId ? this.state._selectedUserId : this.state.courseId,
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
        const { _selectedUserId, courseId } = this.state;
        if (user && chat) {
            this.props.addChat(user._id == chat.sender._id, data.chat);
            if (chat.receiver == courseId) {
                this.setState(prevState => ({
                    oldMessageAll: [...prevState.oldMessageAll, data.chat]
                }));
                this.scrollToBottom();
            } else {
                if (_selectedUserId == chat.receiver._id || _selectedUserId == chat.sender._id) {//Hội thoại hiện tại
                    this.setState(prevState => ({
                        oldMessagePersonal: [...prevState.oldMessagePersonal, data.chat]
                    }));
                    this.props.readAllChats(_selectedUserId);
                    this.scrollToBottom();
                }
                // else {
                //     const listUserNew = listUser.filter(user => (user.user ? user.user._id : user._id) != chat.sender._id);
                //     listUserNew.unshift(this.state.listUser.find(user => user.user ? user.user._id : user._id == chat.sender._id));
                //     this.setState({
                //         listUser: listUserNew
                //     });
                // }
            }
        }
    }

    render() {
        const urlRegex = /^(https?|chrome):\/\/[^\s$.?#].[^\s]*$/gm,
            oldMessage = this.state._selectedUserId ? this.state.oldMessagePersonal : this.state.oldMessageAll,
            isChatAll = !this.state._selectedUserId;
        const renderMess = oldMessage && oldMessage.length ? oldMessage.map((message, index, element) => {
            const prev_msg = element[index - 1],
                isNow = (prev_msg && (new Date(prev_msg.sent).getTime() + 300000 >= new Date(message.sent).getTime())),
                isNewDay = !(prev_msg && T.dateToText(prev_msg.sent, 'dd/mm/yyyy') == T.dateToText(new Date(), 'dd/mm/yyyy')),
                isNewUser = (!isNow || (prev_msg && prev_msg.sender._id != message.sender._id)) && message.sender._id != this.state.user._id,
                isNewSender = (!isNow || isNewDay) && (message.sender._id == this.state.user._id),
                newMessage = message.message.split(' ').map((part, index) =>
                    urlRegex.test(part) ? <a key={index} style={{ color: message.sender._id != this.state.user._id ? 'black' : 'white' }} href={part} target='_blank' rel='noreferrer' ><u>{part}</u></a> : part + ' '
                );
            return (
                <div key={index}>
                    {isNewDay ?
                        !isNow && <p className='text-secondary text-center'>{T.dateToText(message.sent, 'dd/mm HH:MM')}</p> :
                        !isNow && <p className='text-secondary text-center'>{T.dateToText(message.sent, 'HH:MM')}</p>}
                    <div style={{ marginBottom: '5px' }} className={(message.sender._id == this.state.user._id) ? 'message me' : 'message'}>
                        {(isNewUser || isNewSender) && <img style={{ width: '30px' }} src={message.sender.image} alt={message.lastname} />}
                        <div>
                            {(isNewUser || isNewSender) && <div className={'font-weight-bold mb-0 ' + (isNewSender ? 'text-right' : '') + (message.sender.isCourseAdmin ? 'text-danger' : (message.sender.isLecturer ? 'text-primary' : ''))}>{message.sender.firstname + ' ' + message.sender.lastname + ' '}</div>}
                            <p className='info' style={{ position: 'static', marginLeft: isNewUser ? '0px' : '45px', marginRight: isNewSender ? '0px' : '45px' }} data-toggle='tooltip' title={T.dateToText(message.sent, isNewDay ? 'dd/mm HH:MM' : 'HH:MM')}>{newMessage}</p>
                        </div>
                    </div>
                </div>
            );
        }) : null;
        const listUser = this.state.listUser;
        const userName = this.state.userName ? this.state.userName : listUser && listUser[0] && listUser[0].firstname + ' ' + listUser[0].lastname,
            userImage = this.state.userImage ? this.state.userImage : (listUser && listUser[0] && (listUser[0].user ? listUser[0].user.image : listUser[0].image));
        const { _selectedUserId, isLastedChat } = this.state;
        const inboxChat = this.state.listUser && this.state.listUser.map((userChat, index) => {
            const isSelectedUser = _selectedUserId == (userChat.user ? userChat.user._id : userChat._id);
            return (
                <div key={index} className={'chat_list' + (isSelectedUser ? ' active_chat' : '')} style={{ cursor: 'pointer' }} onClick={e => e.preventDefault() || this.selectUser(userChat)}>
                    <div className='chat_people'>
                        <div className='chat_img'> <img src={userChat.user ? userChat.user.image : userChat.image} alt={userChat.lastname} /> </div>
                        <div className='chat_ib'>
                            <h6>{userChat.firstname + ' ' + userChat.lastname}</h6>
                        </div>
                    </div>
                </div>);
        });

        return (
            isChatAll ?
                (<div className='messanger' style={{ height: '300px' }}>
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
                </div>) :
                (<div className='messanger' >
                    <div className='inbox_msg row' >
                        <div className='inbox_people col-md-3'>
                            <div className='headind_srch'>
                                <div className='recent_heading'>
                                    <h4>Cố vấn học tập</h4>
                                </div>
                            </div>
                            <div className='inbox_chat'>
                                {inboxChat}
                            </div>
                        </div>
                        <div className='col-md-9' >
                            <div style={{ borderBottom: '1px solid black', height: '35px', display: 'flex', alignItems: 'flex-start', paddingTop: '5px' }}>
                                <img style={{ height: '25px', width: '25px' }} src={userImage} alt={userName} />
                                <h6 style={{ marginBottom: '0px' }}>&nbsp;{userName}</h6>
                            </div>
                            <div className='messages' id='msg_admin_all' style={{ height: 'calc(100vh - 350px)', overflowY: 'scroll', maxHeight: 'none' }} >
                                {isLastedChat ? null :
                                    <div style={{ width: '100%', height: 48, textAlign: 'center' }}>
                                        <img alt='Loading' className='listViewLoading' src='/img/loading.gif' style={{ marginLeft: 'auto', marginRight: 'auto', height: 48 }} onLoad={this.loadMoreChats} />
                                    </div>}
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
                    </div>
                </div>)
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { readAllChats, getAllChats, getUserChats, addChat };
export default connect(mapStateToProps, mapActionsToProps)(SectionChat);