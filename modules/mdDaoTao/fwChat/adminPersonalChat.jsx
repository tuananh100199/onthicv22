import React from 'react';
import { connect } from 'react-redux';
import { createMessage } from './redux';
import { getLearingProgressByLecturer, getLearingProgressByAdmin } from '../fwCourse/redux';
import { AdminPage } from 'view/component/AdminPage';
import '../../../view/component/chat.scss';

const previousRoute = '/user';
class AdminPersonalChat extends AdminPage {
    state = { listStudent: [] };
    componentDidMount() {
        const _id = this.props.courseId;
        this.setState({ courseId: _id });
        if (_id) {
            const user = this.props.system.user;
            if (user.isCourseAdmin) {
                console.log('a');
                this.props.getLearingProgressByAdmin(_id, data => {
                    this.setState({ listStudent: data.item });
                });
            } else {
                this.props.getLearingProgressByLecturer(_id, data => {
                    this.setState({ listStudent: data.item });
                });
            }
        } else {
            this.props.history.push(previousRoute);
        }
    }



    render() {
        // const permission = this.getUserPermission('chat');
        console.log(this.state.listStudent);
        const inboxChat = this.state.listStudent.map((student, index) =>
            <div key={index} className='chat_list'>
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
            <div className='messaging row'>
                <div className='inbox_msg '>
                    <div className='inbox_people col-md-3'>
                        <div className='headind_srch'>
                            <div className='recent_heading'>
                                <h4>Danh sách học viên</h4>
                            </div>
                            {/* <div className='srch_bar'>
                                <div className='stylish-input-group'>
                                    <input type='text' className='search-bar' placeholder='Search' />
                                    <span className='input-group-addon'>
                                        <button type='button'> <i className='fa fa-search' aria-hidden='true'></i> </button>
                                    </span> </div>
                            </div> */}
                        </div>
                        <div className='inbox_chat'>
                            {inboxChat}
                        </div>
                    </div>
                    <div className='mesgs col-md-9'>
                        <div className='msg_history'>
                            <div className='incoming_msg'>
                                <div className='incoming_msg_img'> <img src='https://ptetutorials.com/images/user-profile.png' alt='sunil' /> </div>
                                <div className='received_msg'>
                                    <div className='received_withd_msg'>
                                        <p>Test which is a new approach to have all
                                            solutions</p>
                                        <span className='time_date'> 11:01 AM    |    June 9</span></div>
                                </div>
                            </div>
                            <div className='outgoing_msg'>
                                <div className='sent_msg'>
                                    <p>Test which is a new approach to have all
                                        solutions</p>
                                    <span className='time_date'> 11:01 AM    |    June 9</span> </div>
                            </div>
                            <div className='incoming_msg'>
                                <div className='incoming_msg_img'> <img src='https://ptetutorials.com/images/user-profile.png' alt='sunil' /> </div>
                                <div className='received_msg'>
                                    <div className='received_withd_msg'>
                                        <p>Test, which is a new approach to have</p>
                                        <span className='time_date'> 11:01 AM    |    Yesterday</span></div>
                                </div>
                            </div>
                            <div className='outgoing_msg'>
                                <div className='sent_msg'>
                                    <p>Apollo University, Delhi, India Test</p>
                                    <span className='time_date'> 11:01 AM    |    Today</span> </div>
                            </div>
                            <div className='incoming_msg'>
                                <div className='incoming_msg_img'> <img src='https://ptetutorials.com/images/user-profile.png' alt='sunil' /> </div>
                                <div className='received_msg'>
                                    <div className='received_withd_msg'>
                                        <p>We work directly with our designers and suppliers,
                                            and sell direct to you, which means quality, exclusive
                                            products, at a price anyone can afford.</p>
                                        <span className='time_date'> 11:01 AM    |    Today</span></div>
                                </div>
                            </div>
                        </div>
                        <div className='type_msg'>
                            <div className='input_msg_write'>
                                <input type='text' className='write_msg' placeholder='Type a message' />
                                <button className='msg_send_btn' type='button'><i className='fa fa-paper-plane-o' aria-hidden='true'></i></button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </div>);
    }
}

const mapStateToProps = state => ({ system: state.system, division: state.trainning.division });
const mapActionsToProps = { createMessage, getLearingProgressByLecturer, getLearingProgressByAdmin };
export default connect(mapStateToProps, mapActionsToProps)(AdminPersonalChat);