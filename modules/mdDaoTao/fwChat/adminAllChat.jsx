import React from 'react';
import { connect } from 'react-redux';
import { createMessage, getOldMessage } from './redux';
import { debounce } from 'lodash';
import { AdminPage, FormTextBox } from 'view/component/AdminPage';
import '../../../view/component/chat.scss';

const previousRoute = '/user';
class AdminAllChat extends AdminPage {
    socketRef = React.createRef();
    state = { clientId: null, oldMessage: [] };
    componentDidMount() {
        window.addEventListener('keydown', this.logKey);
        const _id = this.props.courseId;
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
        if (_id) {
            this.props.getOldMessage(_id, Date.now(), 5, data => {
                this.setState({
                    oldMessage: data.item,
                    currentLoaded: data.item[0] && data.item[0].sent,
                    anyMessagesLeft: data.item.length < data.count
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
            if (dataGot.data.room == this.state.courseId) {
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
                room: this.state.courseId,
            };
            this.socketRef.current.emit('sendDataClient', msg);
            this.props.createMessage(msg);
            this.message.value('');
        }
    }

    handleScrollMessage = debounce((target) => {
        if (!this.state.scrollDown && (target.scrollHeight + target.scrollTop >= (target.clientHeight - 40))) {
            this.state.anyMessagesLeft && this.props.getOldMessage(this.state.courseId, this.state.currentLoaded, 5, data => {
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

    render() {
        // const permission = this.getUserPermission('chat');
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
        if (this.state.scrollDown) {
            $('#msg_admin_all').animate({
                scrollTop: $('#msg_admin_all').height()
            }, 500);
        }
        return (
            <div className='container'>
                <h3 className=' text-center'>Phòng chat chung</h3>
                <div className='messaging' >
                    <div className='inbox_msg'>
                        <div className='mesgs-all-chat'>
                            <div className='msg_history' id='msg_admin_all' style={{ height: 'calc(100vh - 300px)', overflowY: 'scroll' }} onScroll={(e) => this.handleScrollMessage(e.target)}>
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
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { createMessage, getOldMessage };
export default connect(mapStateToProps, mapActionsToProps)(AdminAllChat);