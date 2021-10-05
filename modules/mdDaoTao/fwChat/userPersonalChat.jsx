import React from 'react';
import { connect } from 'react-redux';
import { createMessage, getAdminChatByStudent, getOldMessage, getRoomId } from './redux';
import { debounce } from 'lodash';
import { AdminPage } from 'view/component/AdminPage';
import '../../../view/component/chat.scss';

const previousRoute = '/user';
class UserPersonalChat extends AdminPage {
    socketRef = React.createRef();
    state = { listAdmin: [], oldMessage: [] };
    componentDidMount() {
        window.addEventListener('keydown', this.logKey);
        const route = T.routeMatcher('/user/chat/:_id'),
            _id = route.parse(window.location.pathname)._id;
        this.socketRef.current = T.socket;
        if (_id) {
            const user = this.props.system.user;
            this.setState({
                courseId: _id,
                user: {
                    _id: user._id,
                    image: user.image,
                    lastname: user.lastname,
                    firstname: user.firstname,
                    isCourseAdmin: user.isCourseAdmin,
                    isLecturer: user.isLecturer
                },
                scrollDown: true,
                currentLoaded: 0,
            });
            T.ready('/user/hoc-vien/khoa-hoc/' + _id, () => {
                this.props.getAdminChatByStudent(_id, data => {
                    this.setState({ listAdmin: data.item, roomId: _id + '_' + data.item[0]._id + '_' + user._id, activeId: data.item[0]._id }, () => {
                        this.props.getOldMessage(this.state.roomId, Date.now(), 100, data => {
                            this.setState({
                                oldMessage: data.item,
                                currentLoaded: data.item[0] && data.item[0].sent,
                                anyMessagesLeft: data.item.length < data.count
                            });
                        });
                    });
                });
                this.props.getRoomId(_id, data => {
                    if (data.error) {
                        this.props.history.push(previousRoute);
                    } else {
                        this.socketRef.current.emit('sendRoomClient', data.listRoom);
                    }
                });
            });
        } else {
            this.props.history.push(previousRoute);
        }
        this.socketRef.current.on('sendDataServer', dataGot => {
            if (dataGot.data.room == this.state.roomId) {
                this.setState(prevState => ({
                    oldMessage: [...prevState.oldMessage, dataGot.data]
                }));
            }

        });
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.logKey);
    }

    logKey = (e) => {
        if (e.code == 'Enter') {
            this.sendMessage();
        }
    }

    sendMessage = () => {
        const message = $('#user_personal_message').val() ? $('#user_personal_message').val().trim() : '';
        if (message !== '') {
            const msg = {
                message: message,
                sent: Date.now(),
                room: this.state.roomId,
            };
            this.socketRef.current.emit('sendDataClient', msg);
            msg.user = this.state.user;
            this.props.createMessage(msg);
            $('#user_personal_message').val('');
        }
    }

    handleScrollMessage = debounce((target) => {
        if (!this.state.scrollDown && (target.scrollHeight + target.scrollTop >= (target.clientHeight))) {
            this.state.anyMessagesLeft && this.props.getOldMessage(this.state.roomId, this.state.currentLoaded, 5, data => {
                this.setState(prevState => ({
                    oldMessage: data.item.concat(prevState.oldMessage),
                    currentLoaded: data.item[0].sent,
                    anyMessagesLeft: data.item.concat(prevState.oldMessage).length < data.count,
                }));
            });
        } else if (this.state.scrollDown) {
            this.setState({ scrollDown: false });
        }
    }, 200)

    loadChat = (e, admin) => {
        const adminId = admin._id;
        const { courseId, user } = this.state;
        e.preventDefault();
        this.setState({ roomId: courseId + '_' + adminId + '_' + user._id, activeId: adminId, adminName: admin.firstname + ' ' + admin.lastname, adminImage: admin.image }, () => {
            this.props.getOldMessage(this.state.roomId, Date.now(), 5, data => {
                this.setState({
                    oldMessage: data.item,
                    currentLoaded: data.item[0] && data.item[0].sent,
                    anyMessagesLeft: data.item.length < data.count
                });
            });
        });
    }

    render() {
        const renderMess = this.state.oldMessage.map((msg, index, element) => {
            const prev_msg = element[index - 1],
                isNow = (prev_msg && (new Date(prev_msg.sent).getTime() + 300000 >= new Date(msg.sent).getTime())),
                isNewDay = !(prev_msg && T.dateToText(prev_msg.sent, 'dd/mm/yyyy') == T.dateToText(new Date(), 'dd/mm/yyyy')),
                isNewUser = (!isNow || (prev_msg && prev_msg.user._id != msg.user._id)) && msg.user._id != this.state.user._id;
            return (
                <div key={index}>
                    {isNewDay ?
                        !isNow && <p className='text-secondary text-center'>{T.dateToText(msg.sent, 'dd/mm HH:MM')}</p> :
                        !isNow && <p className='text-secondary text-center'>{T.dateToText(msg.sent, 'HH:MM')}</p>}
                    <div style={{ marginBottom: '5px' }} className={(msg.user._id == this.state.user._id) ? 'message me' : 'message'}>
                        {isNewUser && <img style={{ width: '30px' }} src={msg.user.image} alt={msg.lastname} />}
                        <div>
                            <p className='info' style={{ position: 'static', marginLeft: isNewUser ? '0px' : '45px' }} data-toggle='tooltip' title={T.dateToText(msg.sent, isNewDay ? 'dd/mm HH:MM' : 'HH:MM')}>{msg.message}</p>
                        </div>
                    </div>
                </div>

            );
        });
        const adminName = this.state.adminName ? this.state.adminName : this.state.listAdmin[0] && this.state.listAdmin[0].firstname + ' ' + this.state.listAdmin[0].lastname,
            adminImage = this.state.adminImage ? this.state.adminImage : this.state.listAdmin[0] && this.state.listAdmin[0].image;
        const inboxChat = this.state.listAdmin.map((admin, index) =>
            <div key={index} className={'chat_list' + (this.state.activeId == admin._id ? ' active_chat' : '')} style={{ cursor: 'pointer' }} onClick={e => this.loadChat(e, admin)}>
                <div className='chat_people'>
                    <div className='chat_img'> <img src={admin.image} alt={admin.lastname} /> </div>
                    <div className='chat_ib'>
                        <h6>{admin.firstname + ' ' + admin.lastname}</h6>
                    </div>
                </div>
            </div>
        );
        if (this.state.scrollDown) {
            $('#msg_user_personal').stop().animate({
                scrollTop: $('#msg_user_personal').height()
            }, 500);
        }
        return (
            <div >
                <div className='messanger'>
                    <div className='inbox_msg row'>
                        <div className='inbox_people col-md-3'>
                            <div className='headind_srch'>
                                <div className='recent_heading'>
                                    <h4>Danh sách giảng viên</h4>
                                </div>
                            </div>
                            <div className='inbox_chat'>
                                {inboxChat}
                            </div>
                        </div>
                        <div className='col-md-9'>
                            <div style={{ borderBottom: '1px solid black', height: '30px', display: 'flex', alignItems: 'flex-start', paddingTop: '5px' }}>
                                <img style={{ height: '20px', width: '20px' }} src={adminImage} alt={adminName} />
                                <h6 style={{ marginBottom: '0px' }}>&nbsp;{adminName}</h6>
                            </div>
                            <div className='messages' id='msg_admin_all' style={{ height: 'calc(100vh - 350px)', overflowY: 'scroll', maxHeight: 'none' }} onScroll={(e) => this.handleScrollMessage(e.target)}>
                                {renderMess}
                            </div>
                            <div className='sender'>
                                <input type='text' placeholder='Gửi tin nhắn' id='user_personal_message' />
                                <button className='btn btn-primary' type='button' onClick={this.sendMessage}><i className='fa fa-lg fa-fw fa-paper-plane'></i></button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { createMessage, getAdminChatByStudent, getOldMessage, getRoomId };
export default connect(mapStateToProps, mapActionsToProps)(UserPersonalChat);