import React from 'react';
import { connect } from 'react-redux';
import { createContact } from './redux.jsx';
import { getAllAddressByUser } from '../fwAddress/redux.jsx'

class SectionContact extends React.Component {
    constructor(props) {
        super(props);
        this.background = React.createRef();
        this.name = React.createRef();
        this.email = React.createRef();
        this.subject = React.createRef();
        this.message = React.createRef();
    }
    componentDidMount() {
        // this.props.getAllAddressByUser(() => {
            T.ftcoAnimate();
            $(this.background.current).parallax()
        // });
    }

    componentWillUnmount() {
        $('.parallax-mirror').length != 0 && $(this.background.current).parallax('destroy')
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
        let { facebook, youtube, twitter, instagram, contact } =
            this.props.system ? this.props.system : { facebook: '', youtube: '', twitter: '', instagram: '', contact: '/img/contact.jpg' };
        facebook = facebook ? <li><a href={facebook} target='_blank'><i className='fa fa-facebook' aria-hidden='true' /></a></li> : '';
        youtube = youtube ? <li><a href={youtube} target='_blank'><i className='fa fa-youtube' aria-hidden='true' /></a></li> : '';
        twitter = twitter ? <li><a href={twitter} target='_blank'><i className='fa fa-twitter' aria-hidden='true' /></a></li> : '';
        instagram = instagram ? <li><a href={instagram} target='_blank'><i className='fa fa-instagram' aria-hidden='true' /></a></li> : '';

        return [
            <div key={0} className='home-contact d-flex flex-column align-items-start justify-content-end'>
                <div ref={this.background} className='parallax_background parallax-window' data-parallax='scroll' data-image-src={contact} data-speed='0.8' />
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
                                <div className='contact_content_title ftco-animate'>Thông tin liên hệ</div>
                                {this.props.address && this.props.address.list && this.props.address.list.length > 0 ?
                                    this.props.address.list.map((item, index) => (
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
                    {/*{this.props.address && this.props.address.list && this.props.address.list.length > 0 ?*/}
                    {/*    <div className="row google_map_row" >*/}
                    {/*        <div id='carouselContact' className='carousel slide col'*/}
                    {/*            data-ride='carousel'*/}
                    {/*            data-interval='2000'*/}
                    {/*            style={{*/}
                    {/*                height: 'auto',*/}
                    {/*            }}>*/}
                    {/*            <div className='carousel-inner'>*/}
                    {/*                {*/}
                    {/*                    this.props.address.list.map((item, index) => (*/}
                    {/*                        <div className={'carousel-item' + (index == 0 ? ' active' : '')}*/}
                    {/*                            key={index}*/}
                    {/*                            style={{*/}
                    {/*                                height: '500px',*/}
                    {/*                                backgroundImage: `url('${T.url(item.image)}')`,*/}
                    {/*                                backgroundRepeat: 'no-repeat',*/}
                    {/*                                backgroundPosition: 'center center',*/}
                    {/*                                border: '1px solid gray',*/}
                    {/*                                backgroundSize: 'cover',*/}
                    {/*                                cursor: 'pointer',*/}
                    {/*                            }}*/}
                    {/*                            onClick={() => window.open(item.mapURL, '_blank')}>*/}
                    
                    {/*                            <span style={{ position: 'fixed', bottom: '10px', left: '10px', color: 'red', fontWeight: 'bold' }}>{item.title + ':' + item.address}</span>*/}
                    {/*                        </div>))}*/}
                    {/*            </div>*/}
                    {/*            <a className='carousel-control-prev' href='#carouselContact' role='button' data-slide='prev' style={{ opacity: 1 }}>*/}
                    {/*                <span className='carousel-control-prev-icon' style={{ backgroundColor: '#4ca758', backgroundSize: '70% 70%' }}/>*/}
                    {/*                <span className='sr-only'>Previous</span>*/}
                    {/*            </a>*/}
                    {/*            <a className='carousel-control-next' href='#carouselContact' role='button' data-slide='next' style={{ opacity: 1 }}>*/}
                    {/*                <span className='carousel-control-next-icon' style={{ backgroundColor: '#4ca758', backgroundSize: '70% 70%' }}/>*/}
                    {/*                <span className='sr-only'>Next</span>*/}
                    {/*            </a>*/}
                    {/*        </div>*/}
                    {/*    </div> : <p>Chưa cập nhật địa chỉ</p>*/}
                    {/*}*/}
                </div>
            </div >
        ];
    }
}

const mapStateToProps = state => ({ system: state.system, contact: state.contact, address: state.address });
const mapActionsToProps = { createContact, getAllAddressByUser };
export default connect(mapStateToProps, mapActionsToProps)(SectionContact);