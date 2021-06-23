import React from 'react';
import { connect } from 'react-redux';
import { getDivisionAll, createDivision, deleteDivision, updateDivision } from './redux';
import { AdminPage } from 'view/component/AdminPage';
import '../../../view/component/chat.scss';

const previousRoute = '/user';
class TabAllChat extends AdminPage {
    componentDidMount() {
        const route = T.routeMatcher('/user/chat/:_id'),
            _id = route.parse(window.location.pathname)._id;
        this.setState({ courseId: _id });
        if (_id) {
            T.ready('/user/hoc-vien/khoa-hoc/' + _id, () => {
            });
        } else {
            this.props.history.push(previousRoute);
        }
    }



    render() {
        // const permission = this.getUserPermission('chat');

        return (
            <div className='container'>
                <h3 className=' text-center'>Messaging</h3>
                <div className='messaging'>
                    <div className='inbox_msg'>
                        <div className='mesgs-all-chat'>
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
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, division: state.trainning.division });
const mapActionsToProps = { getDivisionAll, createDivision, deleteDivision, updateDivision };
export default connect(mapStateToProps, mapActionsToProps)(TabAllChat);