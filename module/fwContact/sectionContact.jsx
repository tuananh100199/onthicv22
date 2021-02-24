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
        facebook = facebook ? <li><a href={facebook} target='_blank'><i className='fa fa-facebook' aria-hidden='true' /></a></li> : '';
        youtube = youtube ? <li><a href={youtube} target='_blank'><i className='fa fa-youtube' aria-hidden='true' /></a></li> : '';
        twitter = twitter ? <li><a href={twitter} target='_blank'><i className='fa fa-twitter' aria-hidden='true' /></a></li> : '';
        instagram = instagram ? <li><a href={instagram} target='_blank'><i className='fa fa-instagram' aria-hidden='true' /></a></li> : '';
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
            <div class="home d-flex flex-column align-items-start justify-content-end">
                <div class="parallax_background parallax-window" data-parallax="scroll" data-image-src={contact} data-speed="0.8"></div>
                <div class="home_overlay"><img src="images/home_overlay.png" alt="" /></div>
                <div class="home_container">
                    <div class="container">
                        <div class="row">
                            <div class="col">
                                <div class="home_content">
                                    <div class="home_title">Liên hệ</div>
                                    <div class="home_text">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            ,
            <div className='contact'>
                <div className='container'>
                    <div className='row'>
                        <div className='col-lg-6'>
                            <div className='contact_form_container'>
                                <div className='contact_form_title'>Gửi Tin Nhắn</div>
                                <form className='contact_form' id='contact_form' onSubmit={this.sendMessage}>
                                    <div className='d-flex flex-row align-items-start justify-content-between flex-wrap'>
                                        <input type='text' className='contact_input' ref={this.name} placeholder='Tên' />
                                        <input type='email' className='contact_input' ref={this.email} placeholder='Email' />
                                        <input type='text' className='contact_input w-100' ref={this.subject} placeholder='Chủ đề' />
                                        <textarea name='message' className='contact_input w-100' ref={this.message} cols='30' rows='10' placeholder='Nội dung' />
                                    </div>
                                    <button className='button button_1 contact_button trans_200'>gửi tin nhắn</button>
                                </form>
                            </div>
                        </div>
                        <div className='col-lg-5 offset-lg-1 contact_col'>
                            <div className='contact_content'>
                                <div className='contact_content_title'>Thông tin liên lạc</div>
                                {this.props.address && this.props.address.list && this.props.address.list.length > 0 ?
                                    this.props.address.list.map((item, index) => (
                                        [
                                            <div className='contact_info' key={index}>
                                                <ul>
                                                    <li className='d-flex flex-row align-items-start justify-content-start'>
                                                        <div>{item.title}:</div>
                                                        <div>{item.address}</div>
                                                    </li>
                                                    <li className='d-flex flex-row align-items-start justify-content-start'>
                                                        <div>Điện thoại:</div>
                                                        <div><a href={'tel:' + item.phoneNumber}>{item.phoneNumber}</a></div>
                                                    </li>
                                                    <li className='d-flex flex-row align-items-start justify-content-start'>
                                                        <div>E-mail</div>
                                                        <div><a href={'mailto:' + item.email}>{item.email}</a></div>
                                                    </li>
                                                </ul>
                                            </div>
                                        ]
                                    )) : <p>Chưa cập nhật địa chỉ</p>}

                                <div className='contact_social'>
                                    <ul className='d-flex flex-row align-items-center justify-content-start'>
                                        {twitter}
                                        {facebook}
                                        {youtube}
                                        {instagram}
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