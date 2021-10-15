import React from 'react';
import { connect } from 'react-redux';
import { createMessage, getOldMessage, getAdminChatByStudent, readAllChats, getUserChats, addChat } from './redux';
import { getLearingProgressByLecturer, getChatByAdmin } from '../fwCourse/redux';
import { AdminPage } from 'view/component/AdminPage';
// import chatComponent from './chatComponent';
import './chat.scss';
import inView from 'in-view';

const previousRoute = '/user';
class UserPersonalChat extends AdminPage {
    state = { loading: true, listAdmin: [], oldMessage: [] };

    componentDidMount() {
        const route = T.routeMatcher('/user/chat/:_id'),
            courseId = route.parse(window.location.pathname)._id,
            user = this.props.system.user;
        this.setState({ courseId, user });

        if (courseId) {
            T.ready('/user/hoc-vien/khoa-hoc/' + courseId, () => {
                this.props.getAdminChatByStudent(courseId, data => {
                    console.log(data);
                    this.props.getUserChats(data.item[0]._id, null, chat => {
                        this.setState({
                            oldMessage: chat.chats.sort(() => -1),
                            listAdmin: data.item,
                            _selectedUserId: data.item && data.item[0]._id
                        });
                    });
                });
            });

        } else {
            this.props.history.push(previousRoute);
        }
        this.scrollToBottom();
        T.socket.on('chat:send', this.onReceiveMessage);
    }

    componentDidUpdate() {
        const listAdmin = this.state;
        !this.state._selectedUserId && listAdmin && listAdmin.length && this.selectUser(listAdmin[0]);
        this.state.loading && this.setState({ loading: false }, this.scrollToChat);
    }
    componentWillUnmount() {
        T.socket.off('chat:send');
    }

    selectUser = (student) => {
        if (this.state._selectedUserId != student._id && this.props.system && this.props.system.user) {
            this.props.getUserChats(student._id, null, data => {
                this.setState({
                    oldMessage: data.chats.sort(() => -1),
                    _selectedUserId: student._id,
                    isLastedChat: false,
                    adminName: student.firstname + ' ' + student.lastname,
                    adminImage: student.image
                });
            });
            !this.state.loading && T.socket.emit('chat:join', { _userId: student._id });
        }
    }

    loadMoreChats = () => inView('.listViewLoading').on('enter', () => { // Scroll on top and load more chats
        const _selectedUserId = this.state._selectedUserId ? this.state._selectedUserId : null;
        if (!this.state.loading && _selectedUserId) {
            const chats = this.state.oldMessage,
                chatLength = chats ? chats.length : 0,
                sent = chats && chats.length ? chats[0].sent : null;
            this.props.getUserChats(_selectedUserId, sent, data => {
                const loadedChats = data.chats.sort(() => -1);
                this.setState(prevState => ({
                    oldMessage: loadedChats.concat(prevState.oldMessage),
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

    scrollToBottom = () => {
        this.scrollDown.scrollIntoView({ behavior: 'smooth' });
    }

    onSendMessage = (e) => {
        e.preventDefault();
        const receiver = this.state._selectedUserId,
            message = this.message.value;
        if (receiver && message !== '') {
            T.socket.emit('chat:send', { receiver, message });
            this.message.value = '';
            this.message.focus();
        }
    }

    onReceiveMessage = (data) => {
        const user = this.props.system ? this.props.system.user : null;
        const chat = data ? data.chat : null;
        const selectedUserId = this.state._selectedUserId;
        if (user && chat) {
            this.props.addChat(user._id == chat.sender._id, data.chat);
            this.setState(prevState => ({
                oldMessage: [...prevState.oldMessage, data.chat]
            }));
            if (selectedUserId) {
                // Nếu tôi đang đang chat với người gửi => các message của người gửi chuyển read=true
                if (selectedUserId == chat.sender._id) {
                    this.props.readAllChats(selectedUserId);
                }

                // Nếu chat đang ở cuộc hội thoại hiện hành => cuộn xuống đến chat cuối
                if (selectedUserId == chat.sender._id || chat.receiver && selectedUserId == chat.receiver._id) {
                    this.scrollToBottom();
                }
            } else if (this.state.listAdmin && this.state.listAdmin.length) {
                // Chọn thằng đầu trong danh sách
                setTimeout(() => this.selectUser(this.state.listAdmin[0]), 1000);
            }
        }
    }

    render() {
        const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        const renderMess = this.state.oldMessage && this.state.oldMessage.map((message, index, element) => {
            const prev_msg = element[index - 1],
                isNow = (prev_msg && (new Date(prev_msg.sent).getTime() + 300000 >= new Date(message.sent).getTime())),
                isNewDay = !(prev_msg && T.dateToText(prev_msg.sent, 'dd/mm/yyyy') == T.dateToText(new Date(), 'dd/mm/yyyy')),
                isNewUser = (!isNow || (prev_msg && prev_msg.sender._id != message.sender._id)) && message.sender._id != this.state.user._id,
                newMessage = message.message.split(' ').map((part, index) =>
                    urlRegex.test(part) ? <a key={index} style={{ color: message.sender._id != this.state.user._id ? 'black' : 'white' }} href={part} target='_blank' rel='noreferrer' ><u>{part}</u></a> : part + ' '
                );
            return (
                <div key={index} id={`chat${message._id}`}>
                    {isNewDay ?
                        !isNow && <p className='text-secondary text-center'>{T.dateToText(message.sent, 'dd/mm HH:MM')}</p> :
                        !isNow && <p className='text-secondary text-center'>{T.dateToText(message.sent, 'HH:MM')}</p>}
                    <div style={{ marginBottom: '5px' }} className={(message.sender._id == this.state.user._id) ? 'message me' : 'message'}>
                        {isNewUser && <img style={{ width: '30px' }} src={message.sender.image} alt={message.lastname} />}
                        <div>
                            <p className='info' style={{ position: 'static', marginLeft: isNewUser ? '0px' : '45px' }} data-toggle='tooltip' title={T.dateToText(message.sent, isNewDay ? 'dd/mm HH:MM' : 'HH:MM')}>{newMessage}</p>
                        </div>
                    </div>
                </div>

            );
        });
        const adminName = this.state.adminName ? this.state.adminName : this.state.listAdmin[0] && this.state.listAdmin[0].firstname + ' ' + this.state.listAdmin[0].lastname,
            adminImage = this.state.adminImage ? this.state.adminImage : this.state.listAdmin[0] && this.state.listAdmin[0].image;
        const { _selectedUserId, isLastedChat } = this.state;
        const inboxChat = this.state.listAdmin.map((student, index) => {
            const isSelectedUser = _selectedUserId == student._id;
            //const isUnreadUser = user.chats && user.chats.find(item => !item.read) ? true : false;
            return (
                <div key={index} className={'chat_list' + (isSelectedUser ? ' active_chat' : '')} style={{ cursor: 'pointer' }} onClick={e => e.preventDefault() || this.selectUser(student)}>
                    <div className='chat_people'>
                        <div className='chat_img'> <img src={student.image} alt={student.lastname} /> </div>
                        <div className='chat_ib'>
                            <h6>{student.firstname + ' ' + student.lastname}</h6>
                        </div>
                    </div>
                </div>);
        });
        return (
            <div className='messanger' >
                <div className='inbox_msg row' >
                    <div className='inbox_people col-md-3'>
                        <div className='headind_srch'>
                            <div className='recent_heading'>
                                <h4>Danh sách học viên</h4>
                            </div>
                        </div>
                        <div className='inbox_chat'>
                            {inboxChat}
                        </div>
                    </div>
                    <div className='col-md-9' >
                        <div style={{ borderBottom: '1px solid black', height: '35px', display: 'flex', alignItems: 'flex-start', paddingTop: '5px' }}>
                            <img style={{ height: '25px', width: '25px' }} src={adminImage} alt={adminName} />
                            <h6 style={{ marginBottom: '0px' }}>&nbsp;{adminName}</h6>
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
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, chat: state.trainning.chat });
const mapActionsToProps = { createMessage, getOldMessage, getAdminChatByStudent, getLearingProgressByLecturer, getChatByAdmin, readAllChats, getUserChats, addChat };
export default connect(mapStateToProps, mapActionsToProps)(UserPersonalChat);