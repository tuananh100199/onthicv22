import React from 'react';
import { connect } from 'react-redux';
import { createMessage, getAdminChatByStudent, getOldMessage } from './redux';
import { AdminPage, FormTextBox } from 'view/component/AdminPage';
import '../../../view/component/chat.scss';

const previousRoute = '/user';
class UserPersonalChat extends AdminPage {
    socketRef = React.createRef();
    state = { listAdmin: [], oldMessage: [] };
    componentDidMount() {
        window.addEventListener('keydown', this.logKey);
        const route = T.routeMatcher('/user/chat/:_id'),
            _id = route.parse(window.location.pathname)._id;
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
                }
            });
            T.ready('/user/hoc-vien/khoa-hoc/' + _id, () => {
                this.props.getAdminChatByStudent(_id, data => {
                    this.setState({ listAdmin: data.item, roomId: _id + '_' + data.item[0]._id + '_' + user._id, activeId: data.item[0]._id }, () => {
                        this.props.getOldMessage(this.state.roomId, data => {
                            this.setState({
                                oldMessage: data.item
                            });
                        });
                    });
                });

            });
        } else {
            this.props.history.push(previousRoute);
        }
        this.socketRef.current = T.socket;
        this.socketRef.current.on('getId', data => {
            this.setState({
                clientId: data
            });
        });
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
        if (this.message.value() !== '') {
            const msg = {
                message: this.message.value(),
                user: this.state.user,
                sent: Date.now(),
                room: this.state.roomId,
            };
            this.socketRef.current.emit('sendDataClient', msg);
            this.props.createMessage(msg);
            this.message.value('');
        }
    }

    loadChat = (e, adminId) => {
        const { courseId, user } = this.state;
        e.preventDefault();
        this.setState({ roomId: courseId + '_' + adminId + '_' + user._id, activeId: adminId }, () => {
            this.props.getOldMessage(this.state.roomId, data => {
                this.setState({
                    oldMessage: data.item
                });
            });
        });
    }

    render() {
        const renderMess = this.state.oldMessage.map((msg, index) =>
            <div key={index} className={(msg.user._id == this.state.user._id) ? 'outgoing_msg' : 'incoming_msg'}>
                {(msg.user._id != this.state.user._id) && <div className='incoming_msg_img'> <img src={msg.user.image} alt={msg.lastname} /> </div>}
                {(msg.user._id != this.state.user._id) ?
                    <div className='received_msg'>
                        <p className={'font-weight-bold mb-0 ' + (msg.user.isCourseAdmin ? 'text-danger' : (msg.user.isLecturer ? 'text-primary' : ''))}>{msg.user.firstname + ' ' + msg.user.lastname}</p>
                        <div className='received_withd_msg'>
                            <p>{msg.message}</p>
                            <span className='time_date'> {T.dateToText(msg.sent)}</span>
                        </div>
                    </div> :
                    <div className='outgoing_msg my-0'>
                        <div className='sent_msg'>
                            <p>{msg.message}</p>
                            <span className='time_date'> {T.dateToText(msg.sent)}</span> </div>
                    </div>}
            </div>
        );
        const inboxChat = this.state.listAdmin.map((admin, index) =>
            <div key={index} className={'chat_list' + (this.state.activeId == admin._id ? ' active_chat' : '')} style={{ cursor: 'pointer' }} onClick={e => this.loadChat(e, admin._id)}>
                <div className='chat_people'>
                    <div className='chat_img'> <img src={admin.image} alt={admin.lastname} /> </div>
                    <div className='chat_ib'>
                        <h6>{admin.firstname + ' ' + admin.lastname}</h6>
                    </div>
                </div>
            </div>
        );
        return (<div className='container'>
            <h3 className=' text-center'>Phòng chat cá nhân</h3>
            <div className='messaging'>
                <div className='inbox_msg row'>
                    <div className='inbox_people col-md-3'>
                        <div className='headind_srch'>
                            <div className='recent_heading'>
                                <h4>Danh sách liên hệ</h4>
                            </div>
                        </div>
                        <div className='inbox_chat'>
                            {inboxChat}
                        </div>
                    </div>
                    <div className='mesgs col-md-9'>
                        <div className='msg_history'>
                            {renderMess}
                        </div>
                        <div className='type_msg'>
                            <div className='input_msg_write'>
                                <FormTextBox ref={e => this.message = e} />
                                <button className='msg_send_btn' type='button' onClick={this.sendMessage}><i className='fa fa-paper-plane-o' aria-hidden='true'></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>);
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { createMessage, getAdminChatByStudent, getOldMessage };
export default connect(mapStateToProps, mapActionsToProps)(UserPersonalChat);