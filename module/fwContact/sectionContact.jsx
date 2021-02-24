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
        let { addressList, mobile, email, map, facebook, youtube, twitter, instagram, contact, subscribe, latitude, longitude } =
            this.props.system ? this.props.system : { addressList: JSON.stringify([]), map: '', facebook: '', youtube: '', twitter: '', instagram: '', contact: '/img/contact.jpg', subscribe: '/img/subscribe.jpg', latitude: 0, longitude: 0 };
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
            <div className='container-fluid'>
                <div className='row'>
                    <div className='col-12 px-0'>
                        <div className="owl-theme">
                            <div className='slider-content'
                                style={{
                                    height: '500px',
                                    background: `url('${contact}')`,
                                    backgroundRepeat: 'repeat',
                                    backgroundPosition: 'center',
                                    backgroundSize: 'cover'
                                }}
                            >

                            </div>
                        </div>
                    </div>
                </div>
            </div>
            ,
            <div className='contact'>
                <div className='container'>
                    <div className='row'>
                        <div className="col-lg-6">
                            <div className="contact_form_container">
                                <div className="contact_form_title">Make an Appointment</div>
                                <form className="contact_form" id="contact_form" onSubmit={this.sendMessage}>
                                    <div className="d-flex flex-row align-items-start justify-content-between flex-wrap">
                                        <input type="text" className="contact_input" ref={this.name} placeholder='Tên' />
                                        <input type="email" className="contact_input" ref={this.email} placeholder='Email' />
                                        <input type="text" className="contact_input_subject" ref={this.subject} placeholder='Chủ đề' />
                                        <textarea name='message' className='contact_input_subject' ref={this.message} cols='30' rows='10' placeholder='Nội dung' />
                                    </div>
                                    <button className="button button_1 contact_button trans_200">make an appointment</button>
                                </form>
                            </div>
                        </div>
                        <div className="col-lg-5 offset-lg-1 contact_col">
                            <div className="contact_content">
                                <div className="contact_content_title">Thông tin liên lạc</div>
                                {this.props.address && this.props.address.list && this.props.address.list.length > 0 ?
                                    this.props.address.list.map((item, index) => (
                                        [
                                            <div className="contact_info" key={index}>
                                                <ul>
                                                    <li className="d-flex flex-row align-items-start justify-content-start">
                                                        <div>{item.title}:</div>
                                                        <div>{item.address}</div>
                                                    </li>
                                                    <li className="d-flex flex-row align-items-start justify-content-start">
                                                        <div>Điện thoại:</div>
                                                        <div><a href={'tel:' + item.phoneNumber}>{item.phoneNumber}</a></div>
                                                    </li>
                                                    <li className="d-flex flex-row align-items-start justify-content-start">
                                                        <div>E-mail</div>
                                                        <div><a href={'mailto:' + item.email}>{item.email}</a></div>
                                                    </li>
                                                </ul>
                                            </div>
                                        ]
                                    )) : <p>Chưa cập nhật địa chỉ</p>}

                                <div className="contact_social">
                                    <ul className="d-flex flex-row align-items-center justify-content-start">
                                        <li><a href="#"><i className="fa fa-pinterest" aria-hidden="true"></i></a></li>
                                        <li><a href="#"><i className="fa fa-facebook" aria-hidden="true"></i></a></li>
                                        <li><a href="#"><i className="fa fa-twitter" aria-hidden="true"></i></a></li>
                                        <li><a href="#"><i className="fa fa-dribbble" aria-hidden="true"></i></a></li>
                                        <li><a href="#"><i className="fa fa-behance" aria-hidden="true"></i></a></li>
                                        <li><a href="#"><i className="fa fa-linkedin" aria-hidden="true"></i></a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >,
            <div className="newsletter">
                <div className="parallax_background parallax-window" data-parallax="scroll" data-image-src="/img/contact.jpg" data-speed="0.8"></div>
                <div className="container">
                    <div className="row">
                        <div className="col text-center">
                            <div className="newsletter_title">Subscribe to our newsletter</div>
                        </div>
                    </div>
                    <div className="row newsletter_row">
                        <div className="col-lg-8 offset-lg-2">
                            <div className="newsletter_form_container">
                                <form action="#" id="newsleter_form" className="newsletter_form">
                                    <input type="email" className="newsletter_input" placeholder="Your E-mail" required="required" />
                                    <button className="newsletter_button">subscribe</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        ];
    }
}

const mapStateToProps = state => ({ system: state.system, contact: state.contact, address: state.address });
const mapActionsToProps = { createContact, getAllAddressByUser };
export default connect(mapStateToProps, mapActionsToProps)(SectionContact);