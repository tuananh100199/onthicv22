import React from 'react';
import { connect } from 'react-redux';
import { createMessage, getOldMessage } from './redux';
import { debounce } from 'lodash';
import { getLearingProgressByLecturer, getChatByAdmin } from '../fwCourse/redux';
import { AdminPage } from 'view/component/AdminPage';
import './chat.scss';

const previousRoute = '/user';
class AdminPersonalChat extends AdminPage {
    state = { listStudent: [], oldMessage: [] };

    componentDidMount() {
        window.addEventListener('keydown', this.logKey);
        const courseId = this.props.courseId,
            user = this.props.system.user;
        this.setState({ courseId, user, currentLoaded: 0 });
        if (courseId) {
            this.props.getChatByAdmin(courseId, data => {
                this.setState({ listStudent: data.item, roomId: courseId + '_' + user._id + '_' + data.item[0].user._id, activeId: data.item[0].user._id }, () => {
                    this.props.getOldMessage(this.state.roomId, Date.now(), 100, data => {
                        this.setState({
                            oldMessage: data.item,
                            currentLoaded: data.item[0] && data.item[0].sent,
                            anyMessagesLeft: data.item.length < data.count
                        });
                    });
                });
                const listRoom = data.item.map(student => courseId + '_' + user._id + '_' + student.user._id);
                T.socket.emit('sendRoomClient', listRoom);
            });
        } else {
            this.props.history.push(previousRoute);
        }
        T.socket.on('sendDataServer', dataGot => {
            if (dataGot.data.room == this.state.roomId) {
                this.setState(prevState => ({
                    oldMessage: [...prevState.oldMessage, dataGot.data]
                }));
            }
        });
        this.scrollToBottom();
    }

    componentDidUpdate() {
        this.scrollToBottom();
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.logKey);
    }

    logKey = (e) => (e.code == 'Enter') && this.sendMessage();


    sendMessage = (e) => {
        e && e.preventDefault();
        const message = this.messagePersonal.value ? this.messagePersonal.value.trim() : '';
        if (message !== '') {
            const msg = {
                message: message,
                sent: Date.now(),
                room: this.state.roomId,
            };
            T.socket.emit('sendDataClient', msg);
            msg.user = this.state.user;
            this.props.createMessage(msg);
            this.messagePersonal.value = '';
        }
    }

    loadChat = (e, student) => {
        const studentId = student.user._id;
        const { courseId, user } = this.state;
        e.preventDefault();
        this.setState({ roomId: courseId + '_' + user._id + '_' + studentId, activeId: studentId, studentName: student.firstname + ' ' + student.lastname, studentImage: student.user.image }, () => {
            this.props.getOldMessage(this.state.roomId, Date.now(), 5, data => {
                this.setState({
                    oldMessage: data.item,
                    currentLoaded: data.item[0] && data.item[0].sent,
                    anyMessagesLeft: data.item.length < data.count
                });
            });
        });
    }

    scrollToBottom = () => {
        this.scrollDown.scrollIntoView({ behavior: 'smooth' });
    }

    handleScrollMessage = debounce((target) => {
        if (target.scrollHeight + target.scrollTop >= (target.clientHeight - 40)) {
            this.state.anyMessagesLeft && this.props.getOldMessage(this.state.roomId, this.state.currentLoaded, 5, data => {
                this.setState(prevState => ({
                    oldMessage: data.item.concat(prevState.oldMessage),
                    currentLoaded: data.item[0].sent,
                    anyMessagesLeft: data.item.concat(prevState.oldMessage).length < data.count,
                }));
            });
        }
    }, 200)

    render() {
        const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        const renderMess = this.state.oldMessage.map((msg, index, element) => {
            const prev_msg = element[index - 1],
                isNow = (prev_msg && (new Date(prev_msg.sent).getTime() + 300000 >= new Date(msg.sent).getTime())),
                isNewDay = !(prev_msg && T.dateToText(prev_msg.sent, 'dd/mm/yyyy') == T.dateToText(new Date(), 'dd/mm/yyyy')),
                isNewUser = (!isNow || (prev_msg && prev_msg.user._id != msg.user._id)) && msg.user._id != this.state.user._id,
                message = msg.message.split(' ').map((part, index) =>
                    urlRegex.test(part) ? <a key={index} style={{ color: msg.user._id != this.state.user._id ? 'black' : 'white' }} href={part} target='_blank' rel='noreferrer' ><u>{part}</u></a> : part + ' '
                );
            return (
                <div key={index}>
                    {isNewDay ?
                        !isNow && <p className='text-secondary text-center'>{T.dateToText(msg.sent, 'dd/mm HH:MM')}</p> :
                        !isNow && <p className='text-secondary text-center'>{T.dateToText(msg.sent, 'HH:MM')}</p>}
                    <div style={{ marginBottom: '5px' }} className={(msg.user._id == this.state.user._id) ? 'message me' : 'message'}>
                        {isNewUser && <img style={{ width: '30px' }} src={msg.user.image} alt={msg.lastname} />}
                        <div>
                            <p className='info' style={{ position: 'static', marginLeft: isNewUser ? '0px' : '45px' }} data-toggle='tooltip' title={T.dateToText(msg.sent, isNewDay ? 'dd/mm HH:MM' : 'HH:MM')}>{message}</p>
                        </div>
                    </div>
                </div>

            );
        });
        const studentName = this.state.studentName ? this.state.studentName : this.state.listStudent[0] && this.state.listStudent[0].firstname + ' ' + this.state.listStudent[0].lastname,
            studentImage = this.state.studentImage ? this.state.studentImage : this.state.listStudent[0] && this.state.listStudent[0].user.image;
        const inboxChat = this.state.listStudent.map((student, index) =>
            <div key={index} className={'chat_list' + (this.state.activeId == student.user._id ? ' active_chat' : '')} style={{ cursor: 'pointer' }} onClick={e => this.loadChat(e, student)}>
                <div className='chat_people'>
                    <div className='chat_img'> <img src={student.user.image} alt={student.lastname} /> </div>
                    <div className='chat_ib'>
                        <h6>{student.firstname + ' ' + student.lastname}</h6>
                    </div>
                </div>
            </div>
        );
        return (
            <div className='messanger'>
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
                            <img style={{ height: '25px', width: '25px' }} src={studentImage} alt={studentName} />
                            <h6 style={{ marginBottom: '0px' }}>&nbsp;{studentName}</h6>
                        </div>
                        <div className='messages' id='msg_admin_all' style={{ height: 'calc(100vh - 350px)', overflowY: 'scroll', maxHeight: 'none' }} onScroll={(e) => this.handleScrollMessage(e.target)}>
                            {renderMess}
                            <div ref={e => this.scrollDown = e}></div>
                        </div>
                        <div className='sender'>
                            <input type='text' placeholder='Gửi tin nhắn' ref={e => this.messagePersonal = e} />
                            <button className='btn btn-primary' type='button' onClick={this.sendMessage}><i className='fa fa-lg fa-fw fa-paper-plane'></i></button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, division: state.trainning.division });
const mapActionsToProps = { createMessage, getOldMessage, getLearingProgressByLecturer, getChatByAdmin };
export default connect(mapStateToProps, mapActionsToProps)(AdminPersonalChat);