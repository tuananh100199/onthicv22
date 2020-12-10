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
            T.notify('Your name is empty!', 'danger');
            (this.name.current).focus();
        } else if (this.email.current.value == '') {
            T.notify('Your email is empty!', 'danger');
            (this.email.current).focus();
        } else if (!T.validateEmail(this.email.current.value)) {
            T.notify('Invalid email!', 'danger');
            (this.email.current).focus();
        } else if (this.subject.current.value == '') {
            T.notify('Your subject is empty!', 'danger');
            (this.subject.current).focus();
        } else if (this.message.current.value == '') {
            T.notify('Your message is empty!', 'danger');
            (this.message.current).focus();
        } else {
            this.props.createContact({
                name: this.name.current.value,
                email: this.email.current.value,
                subject: this.subject.current.value,
                message: this.message.current.value
            }, () => {
                this.name.current.value = this.email.current.value = this.subject.current.value = this.message.current.value = '';
                T.notify('Your message has been sent!', 'success', true, 3000);
            });
        }
    }
    
    render() {
        const { address, mobile, email, map, latitude, longitude } = this.props.system ? this.props.system : { map: '', latitude: 0, longitude: 0 };
        const mapUrl = 'https://www.google.com/maps/@' + latitude + ',' + longitude + ',16z';
        
        return [
            <div key={0} className='justify-content-center pb-3'>
                <div className='col-md-12 heading-sections text-center'>
                    <h2 className='mb-4'>Liên hệ</h2>
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
                                <h4>Contact Info</h4>
                                <ul className='contact-list'>
                                    <li>
                                        <h6><i className='fa fa-phone' aria-hidden='true' /> Phone</h6>
                                        <a href={'tel:' + email}>{mobile}</a>
                                    </li>
                                    <li>
                                        <h6><i className='fa fa-envelope' aria-hidden='true' />Email</h6>
                                        <a href={'mailto:' + email}>{email}</a>
                                    </li>
                                    <li>
                                        <h6 style={{ flex: 'none' }}><i className='fa fa-map-pin' aria-hidden='true' /> Address</h6>&nbsp;
                                        <a href={mapUrl} target='_blank'>
                                            {address}
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                
                        <div className='col-12 col-lg-6 mb-30'>
                            <div className='contact-form'>
                                <h4>Get In Touch</h4>
                                <form onSubmit={this.sendMessage} className='row'>
                                    <div className='col-12 col-lg-6'>
                                        <input type='text' className='form-control' ref={this.name} placeholder='Name' />
                                    </div>
                                    <div className='col-12 col-lg-6'>
                                        <input type='email' className='form-control' ref={this.email} placeholder='Email' />
                                    </div>
                                    <div className='col-12'>
                                        <input type='text' className='form-control' ref={this.subject} placeholder='Subject' />
                                    </div>
                            
                                    <div className='col-12'>
                                        <textarea name='message' className='form-control' ref={this.message} cols='30' rows='10' placeholder='Message' />
                                    </div>
                                    <div className='col-12'>
                                        <button className='btn clever-btn w-100'>Send Message</button>
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