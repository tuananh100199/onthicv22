import React from 'react';
import { connect } from 'react-redux';
import { createMessage, getOldMessage } from './redux';
import { debounce } from 'lodash';
import { AdminPage } from 'view/component/AdminPage';
import '../../../view/component/chat.scss';
import T from 'view/js/common';

const previousRoute = '/user';
class AdminAllChat extends AdminPage {
    socketRef = React.createRef();
    state = { clientId: null, oldMessage: [] };
    componentDidMount() {
        window.addEventListener('keydown', this.logKey);
        const _id = this.props.courseId;
        const user = this.props.system.user;
        this.socketRef.current = T.socket;
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
            this.props.getOldMessage(_id, Date.now(), 100, data => {
                this.setState({
                    oldMessage: data.item,
                    currentLoaded: data.item[0] && data.item[0].sent,
                    anyMessagesLeft: data.item.length < data.count
                });
            });
            this.socketRef.current.emit('sendRoomClient', [_id]);
        } else {
            this.props.history.push(previousRoute);
        }
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
        const message = $('#message').val().trim();
        if (message !== '') {
            const msg = {
                message: message,
                sent: Date.now(),
                room: this.state.courseId,
            };
            this.socketRef.current.emit('sendDataClient', msg);
            msg.user = this.state.user;
            this.props.createMessage(msg);
            $('#message').val('');
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
                            {isNewUser && <div className={'font-weight-bold mb-0 ' + (msg.user.isCourseAdmin ? 'text-danger' : (msg.user.isLecturer ? 'text-primary' : ''))}>{msg.user.firstname + ' ' + msg.user.lastname + ' '}</div>}
                            <p className='info' style={{ position: 'static', marginLeft: isNewUser ? '0px' : '45px' }} data-toggle='tooltip' title={T.dateToText(msg.sent, isNewDay ? 'dd/mm HH:MM' : 'HH:MM')}>{msg.message}</p>
                        </div>
                    </div>
                </div>

            );
        });

        if (this.state.scrollDown) {
            $('#msg_admin_all').animate({
                scrollTop: $('#msg_admin_all').height()
            }, 1000);
        }
        return (
            <div className='tile-body'>
                <div className='messanger' style={{ minHeight: '300px' }} >
                    <div className='messages' id='msg_admin_all' style={{ overflowY: 'scroll', height: 'calc(100vh - 160px)' }} onScroll={(e) => this.handleScrollMessage(e.target)}>
                        {renderMess}
                    </div>
                    <div className='sender'>
                        <input type='text' placeholder='Gửi tin nhắn' id='message' />
                        <button className='btn btn-primary' type='button' onClick={this.sendMessage}><i className='fa fa-lg fa-fw fa-paper-plane'></i></button>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { createMessage, getOldMessage };
export default connect(mapStateToProps, mapActionsToProps)(AdminAllChat);