import React from 'react';
import { connect } from 'react-redux';
import { createContact } from './redux.jsx';
import { getAllAddressByUser } from '../../module/fwAddress/redux.jsx'

class SectionContact extends React.Component {
    constructor(props) {
        super(props);
        this.name = React.createRef();
        this.email = React.createRef();
        this.subject = React.createRef();
        this.message = React.createRef();
    }
    componentDidMount() {
        this.props.getAllAddressByUser(() => {
            T.ftcoAnimate();
        });
    }
    sendMessage = (e) => {
        e.preventDefault();
        if (this.name.current.value == '') {
            T.notify('Tên bị trống!', 'danger');
            (this.name.current).focus();
        } else if (this.email.current.value == '') {
            T.notify('Email bị trống!', 'danger');
            (this.email.current).focus();
        } else if (!T.validateEmail(this.email.current.value)) {
            T.notify('Email không hợp lệ!', 'danger');
            (this.email.current).focus();
        } else if (this.subject.current.value == '') {
            T.notify('Chủ đề bị trống!', 'danger');
            (this.subject.current).focus();
        } else if (this.message.current.value == '') {
            T.notify('Nội dung bị trống!', 'danger');
            (this.message.current).focus();
        } else {
            this.props.createContact({
                name: this.name.current.value,
                email: this.email.current.value,
                subject: this.subject.current.value,
                message: this.message.current.value
            }, () => {
                this.name.current.value = this.email.current.value = this.subject.current.value = this.message.current.value = '';
                T.notify('Tin nhắn của bạn đã được gửi!', 'success', true, 3000);
            });
        }
    }

    render() {
        let { addressList, mobile, email, map, latitude, longitude } = this.props.system ? this.props.system : { addressList: JSON.stringify([]), map: '', latitude: 0, longitude: 0 };
        const mapUrl = 'https://www.google.com/maps/@' + latitude + ',' + longitude + ',16z';

        const styles = {
            border: {
                borderBottom: 'solid 1px lightgray',
            },
            noBorder: {
                borderBottom: 'none',
            }
        };
        try {
            addressList = JSON.parse(addressList);
        } catch (e) {
            console.error(e)
        }

        return [
            <div className='contact'>
                <div className='container'>
                    <div className='row'>
                        <div class="col-lg-6">
                            <div class="contact_form_container">
                                <div class="contact_form_title">Make an Appointment</div>
                                <form action="#" class="contact_form" id="contact_form">
                                    <div class="d-flex flex-row align-items-start justify-content-between flex-wrap">
                                        <input type="text" class="contact_input" placeholder="Your Name" required="required" />
                                        <input type="email" class="contact_input" placeholder="Your E-mail" required="required" />
                                        <input type="tel" class="contact_input" placeholder="Your Phone" required="required" />
                                        <select class="contact_select contact_input" required>
                                            <option disabled="" selected="">Speciality</option>
                                            <option>Speciality 1</option>
                                            <option>Speciality 2</option>
                                            <option>Speciality 3</option>
                                            <option>Speciality 4</option>
                                            <option>Speciality 5</option>
                                        </select>
                                        <select class="contact_select contact_input" required="required" >
                                            <option disabled="" selected="">Doctor</option>
                                            <option>Doctor 1</option>
                                            <option>Doctor 2</option>
                                            <option>Doctor 3</option>
                                            <option>Doctor 4</option>
                                            <option>Doctor 5</option>
                                        </select>
                                        <input type="text" id="datepicker" class="contact_input datepicker" placeholder="Date" required="required" />
                                    </div>
                                    <button class="button button_1 contact_button trans_200">make an appointment</button>
                                </form>
                            </div>
                        </div>
                        <div class="col-lg-5 offset-lg-1 contact_col">
                            <div class="contact_content">
                                <div class="contact_content_title">Thông tin liên lạc</div>
                                {this.props.address && this.props.address.list && this.props.address.list.length > 0 ?
                                    this.props.address.list.map((item, index) => (
                                        [
                                            <div class="contact_info">
                                                <ul>
                                                    <li class="d-flex flex-row align-items-start justify-content-start">
                                                        <div>Address</div>
                                                        <div>1481 Creekside Lane Avila Beach, CA 931</div>
                                                    </li>
                                                    <li class="d-flex flex-row align-items-start justify-content-start">
                                                        <div>Phone</div>
                                                        <div>+53 345 7953 32453</div>
                                                    </li>
                                                    <li class="d-flex flex-row align-items-start justify-content-start">
                                                        <div>E-mail</div>
                                                        <div>yourmail@gmail.com</div>
                                                    </li>
                                                </ul>
                                            </div>
                                        ]
                                    )) : <p>Chưa cập nhật địa chỉ</p>}

                                <div class="contact_social">
                                    <ul class="d-flex flex-row align-items-center justify-content-start">
                                        <li><a href="#"><i class="fa fa-pinterest" aria-hidden="true"></i></a></li>
                                        <li><a href="#"><i class="fa fa-facebook" aria-hidden="true"></i></a></li>
                                        <li><a href="#"><i class="fa fa-twitter" aria-hidden="true"></i></a></li>
                                        <li><a href="#"><i class="fa fa-dribbble" aria-hidden="true"></i></a></li>
                                        <li><a href="#"><i class="fa fa-behance" aria-hidden="true"></i></a></li>
                                        <li><a href="#"><i class="fa fa-linkedin" aria-hidden="true"></i></a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >,

        ];
    }
}

const mapStateToProps = state => ({ system: state.system, contact: state.contact, address: state.address });
const mapActionsToProps = { createContact, getAllAddressByUser };
export default connect(mapStateToProps, mapActionsToProps)(SectionContact);