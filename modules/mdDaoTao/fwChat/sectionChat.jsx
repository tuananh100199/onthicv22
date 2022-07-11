import React from 'react';
import { connect } from 'react-redux';
import { readAllChats, getAllChats, getUserChats, addChat, getUserChatToken, getAllUserChatToken } from './redux';
// import axios from 'axios';
import { getStudent, updateStudent } from '../fwStudent/redux';
import { AdminPage } from 'view/component/AdminPage';
import './chat.scss';
import inView from 'in-view';

class SectionChat extends AdminPage {
    state = { clientId: null, oldMessageAll: [], oldMessagePersonal: [], isLastedChat: false };
    componentDidMount() {
        let { courseId, listUser=[], _selectedUserId } = this.props,
            user = this.props.system.user;
        listUser=listUser.map(item=>{
            if((item.user && item.user._id==_selectedUserId) || item._id==_selectedUserId){
                return {...item,numOfUnreadChat:0};
            }else{
                return item;
            }
        });

        this.setState({ courseId, user, listUser, _selectedUserId });
        this.props.oldMessageAll && this.setState({
            oldMessageAll: this.props.oldMessageAll
        });
        this.props.oldMessagePersonal && this.setState({
            oldMessagePersonal: this.props.oldMessagePersonal
        });
        if (!(user.isLecturer || user.isCourseAdmin)) {
            this.props.getStudent({ course: courseId, user: user._id }, data => {
                if (!data.error) {
                    this.setState({ studentId: data._id });
                    let tongThoiGianChat = data.tongThoiGianChat ? data.tongThoiGianChat : 0;
                    let hours = 0;
                    let minutes = 0;
                    let seconds = 0;
                    window.interval = setInterval(() => {
                        ++tongThoiGianChat;
                        this.setState({ tongThoiGianChat });
                        hours = parseInt(tongThoiGianChat / 3600) % 24;
                        minutes = parseInt(tongThoiGianChat / 60) % 60;
                        seconds = tongThoiGianChat % 60;
                        $('#time').text((hours < 10 ? '0' + hours : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds));
                    }, 1000);
                    window.onbeforeunload = (event) => {
                        const e = event || window.event;
                        e.preventDefault();
                        clearInterval(window.interval);
                        this.props.updateStudent(data._id, { tongThoiGianChat });
                    };
                }
            });
        }

        _selectedUserId ? T.socket.emit('chat:join', { _userId: _selectedUserId }) : T.socket.emit('chat:joinCourseRoom', { courseId });
        T.socket.on('chat:send', this.onReceiveMessage);
        this.scrollToBottom();
    }

    componentDidUpdate() {
        const listUser = this.state;
        !this.state._selectedUserId && listUser && listUser.length && this.selectUser(listUser[0]);
        this.scrollToChat;
        this.scrollToBottom();
    }

    componentWillUnmount() {
        T.socket.off('chat:send');
        const { studentId, tongThoiGianChat, user } = this.state;
        clearInterval(window.interval);
        user && !(user.isLecturer || user.isCourseAdmin) && this.props.updateStudent(studentId, { tongThoiGianChat });
    }

    loadMoreChats = () => { // Scroll on top and load more chats
        const _selectedUserId = this.state._selectedUserId ? this.state._selectedUserId : null;
        if (_selectedUserId) {
            const chats = this.state.oldMessagePersonal,
                chatLength = chats ? chats.length : 0,
                sent = chats && chats.length ? chats[chats.length - 1].sent : null;
            this.props.getUserChats(_selectedUserId, sent, data => {
                const loadedChats = data.chats;
                this.setState(prevState => ({
                    oldMessagePersonal: prevState.oldMessagePersonal.concat(loadedChats),
                    isLastedChat: data.chats && data.chats.length < 20
                }));
                this.scrollToChat(chatLength - 1);
            });
        } else {
            const chats = this.state.oldMessageAll,
                chatLength = chats ? chats.length : 0,
                sent = chats && chats.length ? chats[chats.length - 1].sent : null;
            this.props.getAllChats(this.state.courseId, sent, data => {
                const loadedChats = data.chats;
                this.setState(prevState => ({
                    oldMessageAll: prevState.oldMessageAll.concat(loadedChats),
                    isLastedChat: data.chats && data.chats.length < 20
                }));
                this.scrollToChat(chatLength - 1);
            });
        }
    };

    setupInView = () => inView('.listViewLoading').on('enter', () => this.loadMoreChats());

    scrollToChat = (index = 0, attemptNumber = 5) => {
        const userChats = this.state.oldMessage ? this.state.oldMessage : [],
            chat = userChats && userChats.length > index && userChats[index] ? document.getElementById(`chat${userChats[index]._id}`) : null;
        if (chat) {
            chat.scrollIntoView({});
        } else {
            attemptNumber && setTimeout(() => this.scrollToChat(index, attemptNumber - 1), 1000);
        }
    }

    selectUser = (user) => {
        const userId = user.user ? user.user._id : user._id;
        if (this.state._selectedUserId != userId && this.props.system && this.props.system.user) {
            this.props.getUserChats(userId, null, data => {
                this.setState(prev=>({
                    oldMessagePersonal: data.chats,
                    _selectedUserId: userId,
                    isLastedChat: data.chats && data.chats.length < 20,
                    userName: user.lastname + ' ' + user.firstname,
                    userImage: user.image,
                    listUser:prev.listUser.map(item=>{
                        if((item.user && item.user._id==userId) || item._id==userId){
                            return {...item,numOfUnreadChat:0};
                        }else{
                            return item;
                        }
                    })
                }));
            });
            T.socket.emit('chat:join', { _userId: userId });
        }
    }


    onSendMessage = (e) => {
        e.preventDefault();
        const receiver = this.state._selectedUserId ? this.state._selectedUserId : this.state.courseId,
            message = this.message.value;
        if (receiver && message !== '') {
            // const user = this.props.system.user;
            // if (this.state._selectedUserId && user.isLecturer) {
            //     this.props.getUserChatToken(this.state._selectedUserId, data => {
            //         if (data && data.token) {
            //             axios.post('https://fcm.googleapis.com/fcm/send', {
            //                 data: {
            //                     _id: this.state._selectedUserId,
            //                     type: 'chatPersonal',
            //                     text: message,
            //                     senderId: user._id,
            //                     senderImage: user.image,
            //                     senderName: user.lastname + ' ' + user.firstname
            //                 },
            //                 to: data.token
            //             },
            //                 {
            //                     headers: {
            //                         Authorization: 'key=AAAASwL7W64:APA91bFGza7Zqa4XcgOwUean5O5Ml_s7d9k3P9FSM5RrJty_qTlBXerAnjhebWIFnHsZuyW7Vh0veKkVl7XBQYLbpQya2iwRLPwtum9ecKKth2ZP_N7Gr2lPebU8dtcog13YsAI9OjEz'
            //                     }
            //                 });
            //         }
            //     });
            // } else if (!this.state._selectedUserId) {
            //     this.props.getAllUserChatToken(this.state.courseId, data => {
            //         if (data && data.list && data.list.length) {
            //             axios.post('https://fcm.googleapis.com/fcm/send', {
            //                 data: {
            //                     _id: this.state.courseId,
            //                     type: 'chatAll',
            //                     text: message,
            //                     senderId: user._id,
            //                     senderImage: user.image,
            //                     senderName: user.lastname + ' ' + user.firstname
            //                 },
            //                 registration_ids: data.list
            //             },
            //                 {
            //                     headers: {
            //                         Authorization: 'key=AAAASwL7W64:APA91bFGza7Zqa4XcgOwUean5O5Ml_s7d9k3P9FSM5RrJty_qTlBXerAnjhebWIFnHsZuyW7Vh0veKkVl7XBQYLbpQya2iwRLPwtum9ecKKth2ZP_N7Gr2lPebU8dtcog13YsAI9OjEz'
            //                     }
            //                 });
            //         }
            //     });
            // }
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
        let { _selectedUserId, courseId, listUser } = this.state;
        if (user && chat) {
            this.props.addChat(user._id == chat.sender._id, data.chat);
            if (chat.receiver == courseId) {//phòng chat chung
                this.setState(prevState => ({
                    oldMessageAll: [data.chat, ...prevState.oldMessageAll]
                }));
                this.scrollToChat();
            } else {// chat cá nhân
                listUser = listUser.map(item=>{
                    if((item.user && item.user._id==chat.sender._id) || item._id==chat.sender._id){// user này gửi chat
                        if(chat.sender && chat.sender._id!=_selectedUserId){ // không focus trong tab đó
                            return {...item,numOfUnreadChat:item.numOfUnreadChat+1,lastMessage:chat};
                        }else{
                            return {...item,lastMessage:chat,numOfUnreadChat:0};
                        } 
                    }
                    return item;
                        
                }).sort((a,b)=>{
                    if(!a.lastMessage || !a.lastMessage.sent) return 1;
                    if(!b.lastMessage || !b.lastMessage.sent) return -1;
                    return new Date(b.lastMessage.sent).getTime() - new Date(a.lastMessage.sent).getTime();
                });
                this.setState({listUser});
                if (_selectedUserId == chat.receiver._id || _selectedUserId == chat.sender._id) {//Hội thoại hiện tại
                    this.setState(prevState => ({
                        oldMessagePersonal: [data.chat, ...prevState.oldMessagePersonal],
                    }));
                    this.props.readAllChats(_selectedUserId);
                    this.scrollToChat();
                }
            }
            this.scrollToBottom();
        }
    }

    renderChatBox = (listChats, chats, prevItem, _userId) => {
        if (chats && chats.length && prevItem) {
            console.log(prevItem);
            const sent = prevItem.sent ? T.dateToText(new Date(prevItem.sent), 'dd/mm HH:MM') : '';
            listChats.push(
                <div key={listChats.length} style={{ width: '100%', display: 'flex', marginBottom: 8 }}>
                    {prevItem.sender && prevItem.sender._id == _userId ?
                        <>
                            <div style={{ width: '70%', position: 'relative', border: 'solid 1px #ddd', borderRadius: 6, padding: 8, marginLeft: '20%', textAlign: 'right' }}>
                                <p style={{ marginBottom: 6, fontWeight: 'bolder' }}>
                                    {prevItem.sender ? prevItem.sender.lastname : 'Người dùng hệ thống'} {prevItem.sender ? prevItem.sender.firstname : ''} {prevItem.sender.isCourseAdmin ? ' - QTV' : ''}
                                </p>
                                <small className='text-secondary' style={{ position: 'absolute', top: 6, left: 6 }}>{sent}</small>
                                {chats}
                            </div>
                            <div style={{ width: '8%', padding: 6 }}>
                                <img src={prevItem.sender ? prevItem.sender.image : '/img/avatar-default.png'} alt='image' style={{ width: '100%', height: 'auto', borderRadius: '50%', border: 'solid 1px #ddd' }} />
                            </div>
                        </> :
                        <>
                            <div style={{ width: '8%', padding: 6 }}>
                                <img src={prevItem.sender ? prevItem.sender.image : '/img/avatar-default.png'} alt='image' style={{ width: '100%', height: 'auto', borderRadius: '50%', border: 'solid 1px #ddd' }} />
                            </div>
                            <div style={{ width: '70%', position: 'relative', border: 'solid 1px #ddd', borderRadius: 6, padding: 8 }}>
                                <p style={{ marginBottom: 6, fontWeight: 'bolder' }}>{prevItem.sender ? prevItem.sender.lastname : 'Người dùng hệ thống'} {prevItem.sender ? prevItem.sender.firstname : ''} {prevItem.sender.isCourseAdmin ? ' - QTV' : ''}</p>
                                <small className='text-secondary' style={{ position: 'absolute', top: 6, right: 6 }}>{sent}</small>
                                {chats}
                            </div>
                        </>}
                </div>);
        }
    };

    render() {
        const urlRegex = /^(https?|chrome):\/\/[^\s$.?#].[^\s]*$/gm,
            oldMessage = this.state._selectedUserId ? this.state.oldMessagePersonal : this.state.oldMessageAll,
            isLecturerChat = this.state._selectedUserId && this.state.listUser && this.state.listUser.length > 1;
            const user = this.props.system ? this.props.system.user : {};
        const listChats = [];
        if (oldMessage && oldMessage.length) {
            let index = oldMessage.length,
                chats = [];
            while (index > 0) {
                index--;
                const item = oldMessage[index], prevItem = index + 1 < oldMessage.length ? oldMessage[index + 1] : null,
                    itemSent = new Date(item.sent), prevItemSent = prevItem ? new Date(prevItem.sent) : null,
                    isNewDay = prevItemSent == null || T.dateToText(itemSent, 'dd/mm/yyyy') != T.dateToText(prevItemSent, 'dd/mm/yyyy'),
                    isNow = itemSent && prevItemSent && itemSent.getTime() - prevItemSent.getTime() <= 300000,
                    isNewUser = !item.sender || !(prevItem && prevItem.sender) || (item.sender && prevItem && prevItem.sender && prevItem.sender._id != item.sender._id),
                    newMessage = item.message.split(' ').map((part, index) =>
                        urlRegex.test(part) ? <a key={index} href={part} target='_blank' rel='noreferrer' ><u>{part}</u></a> : part + ' '
                    );
                if (isNewDay || isNewUser || !isNow) {
                    this.renderChatBox(listChats, chats, prevItem, user._id);
                    chats = [];
                }
                chats.push(<p key={item._id} id={`chat${item._id}`} style={{ margin: 0 }}>{newMessage}</p>);
            }
            //Check tin nhắn cuối là của mình và đã được người nhận đọc chưa
            if(oldMessage[0].sender  && oldMessage[0].sender._id==user._id && oldMessage[0].read==true){
                chats.push(<p key={listChats.length} id={listChats.length} 
                    style={{ margin: 0,fontWeight:'600', fontSize:'12px', color:'#ccc' }}>Đã xem</p>);
            }
            this.renderChatBox(listChats, chats, oldMessage[0], user._id);
        }

        const listUser = this.state.listUser;
        const userName = this.state.userName ? this.state.userName : listUser && listUser[0] && listUser[0].lastname + ' ' + listUser[0].firstname,
            userImage = this.state.userImage ? this.state.userImage : (listUser && listUser[0] && (listUser[0].user ? listUser[0].user.image : listUser[0].image));
        const { _selectedUserId, isLastedChat } = this.state;
        const inboxChat = listUser && listUser.length && listUser.map((userChat, index) => {
            const { numOfUnreadChat } = userChat;
            const isSelectedUser = _selectedUserId == (userChat.user ? userChat.user._id : userChat._id);
            return (
                <div key={index} className={'chat_list' + (isSelectedUser ? ' active_chat' : '')} style={{ cursor: 'pointer' }} onClick={e => e.preventDefault() || this.selectUser(userChat)}>
                    <div className='chat_people'>
                        <div className='chat_img'> <img src={userChat.user ? userChat.user.image : userChat.image} alt={userChat.lastname} /> </div>
                        <div className='chat_ib'>
                            <h6 className={!isSelectedUser && numOfUnreadChat && numOfUnreadChat>0?'font-weight-bold':'font-weight-normal'}>
                                {userChat.lastname + ' ' + userChat.firstname} {!isSelectedUser && numOfUnreadChat && numOfUnreadChat>0 ?<span className="chat_unread">{numOfUnreadChat}</span> :null}
                            </h6>
                        </div>
                    </div>
                </div>);
        });
        return (
            !isLecturerChat ?
                (<div className='messanger' style={{ height: '59vh' }}>
                    {this.props.listUser && <div style={{ borderBottom: '1px solid black', height: '35px', display: 'flex', alignItems: 'flex-start', paddingTop: '5px' }}>
                        <img style={{ height: '25px', width: '25px' }} src={userImage} alt={userName} />
                        <h6 style={{ marginBottom: '0px' }}>&nbsp;{userName}</h6>
                    </div>}
                    <div className='messages' style={{ overflowY: 'scroll', maxHeight: 'none' }} >
                        {isLastedChat ? null :
                            <div style={{ width: '100%', height: 48, textAlign: 'center' }}>
                                <img alt='Loading' className='listViewLoading' src='/img/loading.gif' style={{ marginLeft: 'auto', marginRight: 'auto', height: 48 }} onLoad={this.setupInView} />
                            </div>}
                        {listChats}
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
                        <div className='inbox_people col-sm-3'>
                            <div className='headind_srch'>
                                <div className='recent_heading'>
                                    <h4>{'Liên hệ'}</h4>
                                </div>
                            </div>
                            <div className='inbox_chat'>
                                {inboxChat}
                            </div>
                        </div>
                        <div className='col-sm-9' >
                            <div style={{ borderBottom: '1px solid black', height: '35px', display: 'flex', alignItems: 'flex-start', paddingTop: '5px' }}>
                                <img style={{ height: '25px', width: '25px' }} src={userImage} alt={userName} />
                                <h6 style={{ marginBottom: '0px' }}>&nbsp;{userName}</h6>
                            </div>
                            <div className='messages' id='msg_admin_all' style={{ height: 'calc(100vh - 350px)', overflowY: 'scroll', maxHeight: 'none' }} >
                                {isLastedChat ? null :
                                    <div style={{ width: '100%', height: 48, textAlign: 'center' }}>
                                        <img alt='Loading' className='listViewLoading' src='/img/loading.gif' style={{ marginLeft: 'auto', marginRight: 'auto', height: 48 }} onLoad={this.setupInView} />
                                    </div>}
                                {listChats}
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
const mapActionsToProps = { readAllChats, getAllChats, getUserChats, addChat, getStudent, updateStudent, getUserChatToken, getAllUserChatToken };
export default connect(mapStateToProps, mapActionsToProps)(SectionChat);