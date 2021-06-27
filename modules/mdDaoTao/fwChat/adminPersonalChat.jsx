import React from 'react';
import { connect } from 'react-redux';
import { createMessage, getOldMessage } from './redux';
import { getLearingProgressByLecturer, getLearingProgressByAdmin } from '../fwCourse/redux';
import { AdminPage, FormTextBox } from 'view/component/AdminPage';
import '../../../view/component/chat.scss';

const previousRoute = '/user';
class AdminPersonalChat extends AdminPage {
    socketRef = React.createRef();
    state = { listStudent: [], oldMessage: [] };
    componentDidMount() {
        const _id = this.props.courseId;
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
            user.isCourseAdmin ?
                this.props.getLearingProgressByAdmin(_id, data => {
                    this.setState({ listStudent: data.item, roomId: _id + '_' + user._id + '_' + data.item[0].user._id, activeId: data.item[0].user._id }, () => {
                        this.props.getOldMessage(this.state.roomId, data => {
                            this.setState({
                                oldMessage: data.item
                            });
                        });
                    });
                }) :
                this.props.getLearingProgressByLecturer(_id, data => {
                    this.setState({ listStudent: data.item, roomId: _id + '_' + user._id + '_' + data.item[0].user._id, activeId: data.item[0].user._id }, () => {
                        this.props.getOldMessage(this.state.roomId, data => {
                            this.setState({
                                oldMessage: data.item
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

    loadChat = (e, studentId) => {
        const { courseId, user } = this.state;
        e.preventDefault();
        this.setState({ roomId: courseId + '_' + user._id + '_' + studentId, activeId: studentId }, () => {
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
        const inboxChat = this.state.listStudent.map((student, index) =>
            <div key={index} className={'chat_list' + (this.state.activeId == student.user._id ? ' active_chat' : '')} style={{ cursor: 'pointer' }} onClick={e => this.loadChat(e, student.user._id)}>
                <div className='chat_people'>
                    <div className='chat_img'> <img src={student.user.image} alt={student.lastname} /> </div>
                    <div className='chat_ib'>
                        <h6>{student.firstname + ' ' + student.lastname}</h6>
                    </div>
                </div>
            </div>
        );
        return (<div className='container'>
            <h3 className=' text-center'>Messaging</h3>
            <div className='messaging'>
                <div className='inbox_msg row'>
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

const mapStateToProps = state => ({ system: state.system, division: state.trainning.division });
const mapActionsToProps = { createMessage, getOldMessage, getLearingProgressByLecturer, getLearingProgressByAdmin };
export default connect(mapStateToProps, mapActionsToProps)(AdminPersonalChat);