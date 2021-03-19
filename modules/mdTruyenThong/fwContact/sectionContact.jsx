import React from 'react';
import { connect } from 'react-redux';
import { createContact } from './redux';
import { getAllDivisionByUser } from 'modules/mdDaoTao/fwDivision/redux';

class SectionContact extends React.Component {
    componentDidMount() {
        T.ftcoAnimate();
        $(this.background).parallax()
    }

    componentWillUnmount() {
        $('.parallax-mirror').length != 0 && $(this.background).parallax('destroy')
    }

    sendMessage = (e) => {
        e.preventDefault();
        if (this.name.value == '') {
            T.notify('Tên bị trống!', 'danger');
            this.name.focus();
        } else if (this.email.value == '') {
            T.notify('Email bị trống!', 'danger');
            this.email.focus();
        } else if (!T.validateEmail(this.email.value)) {
            T.notify('Email không hợp lệ!', 'danger');
            this.email.focus();
        } else if (this.subject.value == '') {
            T.notify('Chủ đề bị trống!', 'danger');
            this.subject.focus();
        } else if (this.message.value == '') {
            T.notify('Nội dung bị trống!', 'danger');
            this.message.focus();
        } else {
            this.props.createContact({
                name: this.name.value,
                email: this.email.value,
                subject: this.subject.value,
                message: this.message.value
            }, () => {
                this.name.value = this.email.value = this.subject.value = this.message.value = '';
                T.notify('Tin nhắn của bạn đã được gửi!', 'success', true, 3000);
            });
        }
    }

    render() {
        let { facebook, youtube, twitter, instagram, contact } =
            this.props.system ? this.props.system : { facebook: '', youtube: '', twitter: '', instagram: '', contact: '/img/contact.jpg' };
        facebook = facebook ? <li><a href={facebook} target='_blank'><i className='fa fa-facebook' aria-hidden='true' /></a></li> : '';
        youtube = youtube ? <li><a href={youtube} target='_blank'><i className='fa fa-youtube' aria-hidden='true' /></a></li> : '';
        twitter = twitter ? <li><a href={twitter} target='_blank'><i className='fa fa-twitter' aria-hidden='true' /></a></li> : '';
        instagram = instagram ? <li><a href={instagram} target='_blank'><i className='fa fa-instagram' aria-hidden='true' /></a></li> : '';

        return [
            <div key={0} className='home-contact d-flex flex-column align-items-start justify-content-end'>
                <div ref={e => this.background = e} className='parallax_background parallax-window' data-parallax='scroll' data-image-src={contact} data-speed='0.8' />
                <div className='home_overlay'><img src='img/home_overlay.png' alt='' /></div>
                <div className='home_container'>
                    <div className='container'>
                        <div className='row'>
                            <div className='col'>
                                <div className='home_content ftco-animate'>
                                    <div className='home_text_content'>
                                        <div className='home_title'>Liên hệ</div>
                                        <div className='home_text'>Trung tâm dạy nghề lái xe Hiệp Phát</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>,
            <div key={1} className='contact'>
                <div className='container'>
                    <div className='row'>
                        <div className='col-lg-6'>
                            <div className='contact_form_container'>
                                <div className='contact_form_title'>Liên hệ</div>
                                <form className='contact_form' id='contact_form' onSubmit={this.sendMessage}>
                                    <div className='d-flex flex-row align-items-start justify-content-between flex-wrap'>
                                        <input type='text' className='contact_input' ref={e => this.name = e} placeholder='Tên' />
                                        <input type='email' className='contact_input' ref={e => this.email = e} placeholder='Email' />
                                        <input type='text' className='contact_input w-100' ref={e => this.subject = e} placeholder='Chủ đề' />
                                        <textarea name='message' className='contact_input w-100' ref={e => this.message = e} cols='30' rows='10' placeholder='Nội dung' />
                                    </div>
                                    <button className='button button_1 contact_button trans_200'>gửi tin nhắn</button>
                                </form>
                            </div>
                        </div>
                        <div className='col-lg-5 offset-lg-1 contact_col'>
                            <div className='contact_content'>
                                <div className='contact_content_title ftco-animate'>Thông tin liên hệ</div>
                                {this.props.division && this.props.division.list && this.props.division.list.length > 0 ?
                                    this.props.division.list.map((item, index) => (
                                        <div className='contact_info ftco-animate' key={index}>
                                            <ul>
                                                <li className='d-flex flex-row align-items-start justify-content-start'>
                                                    <div style={{ whiteSpace: 'nowrap' }}>{item.title}:&nbsp;</div>
                                                    <div>{item.address}</div>
                                                </li>
                                                <li className='d-flex flex-row align-items-start justify-content-start'>
                                                    <div style={{ whiteSpace: 'nowrap' }}>Điện thoại:&nbsp;</div>
                                                    <div><a href={'tel:' + item.phoneNumber}>{item.phoneNumber}</a></div>
                                                </li>
                                                <li className='d-flex flex-row align-items-start justify-content-start'>
                                                    <div style={{ whiteSpace: 'nowrap' }}>Email:&nbsp;</div>
                                                    <div><a href={'mailto:' + item.email}>{item.email}</a></div>
                                                </li>
                                            </ul>
                                        </div>
                                    )) : <p>Chưa cập nhật địa chỉ</p>}

                                <div className='contact_social ftco-animate'>
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
            </div>
        ];
    }
}

const mapStateToProps = state => ({ system: state.system, contact: state.contact, division: state.division });
const mapActionsToProps = { createContact, getAllDivisionByUser };
export default connect(mapStateToProps, mapActionsToProps)(SectionContact);