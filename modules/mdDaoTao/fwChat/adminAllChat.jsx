import React from 'react';
import { connect } from 'react-redux';
import { createMessage, getOldMessage } from './redux';
import { debounce } from 'lodash';
import { AdminPage } from 'view/component/AdminPage';
import './chat.scss';
import T from 'view/js/common';

const previousRoute = '/user';
class AdminAllChat extends AdminPage {
    state = { clientId: null, oldMessage: [] };
    componentDidMount() {
        window.addEventListener('keydown', this.logKey);
        const courseId = this.props.courseId,
            user = this.props.system.user;
        this.setState({ courseId, user, currentLoaded: 0 });
        if (courseId) {
            this.props.getOldMessage(courseId, Date.now(), 100, data => {
                this.setState({
                    oldMessage: data.item,
                    currentLoaded: data.item[0] && data.item[0].sent,
                    anyMessagesLeft: data.item.length < data.count
                });
            });
            T.socket.emit('sendRoomClient', [courseId]);
        } else {
            this.props.history.push(previousRoute);
        }
        T.socket.on('sendDataServer', dataGot => {
            if (dataGot.data.room == this.state.courseId) {
                this.setState(prevState => ({ oldMessage: [...prevState.oldMessage, dataGot.data] }));
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
        const message = this.messageAll.value.trim();
        if (message !== '') {
            const msg = {
                message: message,
                sent: Date.now(),
                room: this.state.courseId,
            };
            T.socket.emit('sendDataClient', msg);
            msg.user = this.state.user;
            this.props.createMessage(msg);
            this.messageAll.value = '';
        }
    }

    handleScrollMessage = debounce((target) => {
        if (target.scrollHeight + target.scrollTop >= (target.clientHeight - 40)) {
            this.state.anyMessagesLeft && this.props.getOldMessage(this.state.courseId, this.state.currentLoaded, 5, data => {
                this.setState(prevState => ({
                    oldMessage: data.item.concat(prevState.oldMessage),
                    currentLoaded: data.item[0].sent,
                    anyMessagesLeft: data.item.concat(prevState.oldMessage).length < data.count,
                }));
            });
        }
    }, 200)

    scrollToBottom = () => {
        this.scrollDown.scrollIntoView({ behavior: 'smooth' });
    }

    render() {
        const urlRegex = /^(https?|chrome):\/\/[^\s$.?#].[^\s]*$/gm;
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
                            {isNewUser && <div className={'font-weight-bold mb-0 ' + (msg.user.isCourseAdmin ? 'text-danger' : (msg.user.isLecturer ? 'text-primary' : ''))}>{msg.user.firstname + ' ' + msg.user.lastname + ' '}</div>}
                            <p className='info' style={{ position: 'static', marginLeft: isNewUser ? '0px' : '45px' }} data-toggle='tooltip' title={T.dateToText(msg.sent, isNewDay ? 'dd/mm HH:MM' : 'HH:MM')}>{message}</p>
                        </div>
                    </div>
                </div>
            );
        });

        return (
            <form className='messanger' style={{ minHeight: '300px' }} onSubmit={this.sendMessage}>
                <div className='messages' style={{ height: '300px', overflowY: 'scroll' }} onScroll={(e) => this.handleScrollMessage(e.target)}>
                    {renderMess}
                    <div ref={e => this.scrollDown = e}></div>
                </div>
                <div style={{ display: 'flex' }}>
                    <input ref={e => this.messageAll = e} type='text' placeholder='Gửi tin nhắn' style={{ flex: 1, border: '1px solid #1488db', outline: 'none', padding: '5px 10px' }} />
                    <button className='btn btn-primary' type='submit' style={{ borderRadius: 0 }}>
                        <i className='fa fa-lg fa-fw fa-paper-plane' />
                    </button>
                </div>
            </form>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { createMessage, getOldMessage };
export default connect(mapStateToProps, mapActionsToProps)(AdminAllChat);