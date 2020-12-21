import React from 'react';
import { connect } from 'react-redux';
import { createContact } from './redux.jsx';


class SectionContact extends React.Component {
    constructor(props) {
        super(props);
        this.name = React.createRef();
        this.email = React.createRef();
        this.subject = React.createRef();
        this.message = React.createRef();
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
        let { addressList, mobile, email, map, latitude, longitude } = this.props.system ? this.props.system : {addressList: JSON.stringify([]) , map: '', latitude: 0, longitude: 0 };
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
            <div key={0} className='justify-content-center pb-3'>
                <div className='col-md-12 heading-sections text-center'>
                </div>
            </div>,
            <a key={1} href={mapUrl} target='_blank'>
                <div key={0} className='map-area' style={{ height: '300px', background: 'url(' + map + ') no-repeat center center' }} />
            </a>,
            <section key={2} className='contact-area mt-30'>
                <div className='container'>
                    <div className='row'>
                        <div className='col-12 col-lg-6'>
                            <div className='contact--info'>
                                <h4>Thông tin liên hệ</h4>
                                <ul className='contact-list'>
                                    <li>
                                        <h6><i className='fa fa-phone' aria-hidden='true' /> Điện thoại</h6>
                                        <a href={'tel:' + email}>{mobile}</a>
                                    </li>
                                    <li>
                                        <h6><i className='fa fa-envelope' aria-hidden='true' />Email</h6>
                                        <a href={'mailto:' + email}>{email}</a>
                                    </li>
                                    <li style={{display: 'block'}}>
                                        <h6><i className='fa fa-envelope' aria-hidden='true' />Địa chỉ</h6>
                                        {addressList.map((item, index) => <div className='mb-1' key={index}>
                                            <p><strong>{item.addressTitle}</strong>:&nbsp;&nbsp;
                                                <span >{item.address}</span>
                                            </p>
                                            <p>Điện thoại: 
                                                <span >{item.phoneNumber}</span>
                                                &nbsp;&nbsp;
                                                <span >Di động: </span>
                                                <span >{item.mobile}</span>
                                            </p>
                                            <p>Email: 
                                                <span >{item.email}</span>
                                            </p>
                                            <p style={(index === addressList.length - 1) ? styles.noBorder: styles.border}></p>
                                    </div>)}
                                    </li>
                                </ul>
                            </div>
                        </div>
                
                        <div className='col-12 col-lg-6 mb-30'>
                            <div className='contact-form'>
                                <h4>Liên lạc</h4>
                                <form onSubmit={this.sendMessage} className='row'>
                                    <div className='col-12 col-lg-6'>
                                        <input type='text' className='form-control' ref={this.name} placeholder='Tên' />
                                    </div>
                                    <div className='col-12 col-lg-6'>
                                        <input type='email' className='form-control' ref={this.email} placeholder='Email' />
                                    </div>
                                    <div className='col-12'>
                                        <input type='text' className='form-control' ref={this.subject} placeholder='Chủ đề' />
                                    </div>
                            
                                    <div className='col-12'>
                                        <textarea name='message' className='form-control' ref={this.message} cols='30' rows='10' placeholder='Nội dung' />
                                    </div>
                                    <div className='col-12'>
                                        <button className='btn clever-btn w-100'>Gửi tin nhắn</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section >
        ];
    }
}

const mapStateToProps = state => ({ system: state.system, contact: state.contact });
const mapActionsToProps = { createContact };
export default connect(mapStateToProps, mapActionsToProps)(SectionContact);