import React from 'react';
import { connect } from 'react-redux';
import { createSubscribe } from './redux';

class SectionSubscribe extends React.Component {
    state = {};
    componentDidMount() {
        $(document).ready(() => {
            const done = () => {
                if (this.props && this.props.system && this.props.system.subscribe) {
                    $(window).trigger('resize');
                    $(this.background).parallax();
                } else {
                    setTimeout(done, 100);
                }
            };
            done();
        });
    }

    componentWillUnmount() {
        $('.parallax-mirror').length != 0 && $(this.background).parallax('destroy');
    }

    sendMessage = (e) => {
        e.preventDefault();
        if (this.email.value == '') {
            T.notify('Email bị trống!', 'danger');
            (this.email).focus();
        } else if (!T.validateEmail(this.email.value)) {
            T.notify('Email không hợp lệ!', 'danger');
            (this.email).focus();
        } else {
            this.props.createSubscribe({ email: this.email.value }, () => {
                this.email.value = '';
                T.notify('Đăng ký nhận tin của bạn đã được gửi!', 'success', true, 3000);
            });
        }
    }

    render() {
        let subscribe = this.props && this.props.system && this.props.system.subscribe ? this.props.system.subscribe : '/img/subscribe.jpg';
        return (
            <div className='newsletter'>
                <div ref={e => this.background = e} className='parallax_background parallax-window' data-parallax='scroll' data-image-src={subscribe} data-speed='0.8' style={{backgroundColor: 'black', opacity: '0.7'}}/>
                <div className='container'>
                    <div className='row'>
                        <div className='col text-center'>
                            <div className='newsletter_title'>Theo dõi để nhận được thông tin mới nhất từ chúng tôi</div>
                        </div>
                    </div>
                    <div className='row newsletter_row'>
                        <div className='col-lg-8 offset-lg-2'>
                            <div className='newsletter_form_container'>
                                <form action='#' id='newsleter_form' className='newsletter_form' onSubmit={this.sendMessage}>
                                    <input type='email' className='newsletter_input' ref={e => this.email = e} placeholder='Email của bạn' />
                                    <button className='newsletter_button'>Đăng ký</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { createSubscribe };
export default connect(mapStateToProps, mapActionsToProps)(SectionSubscribe);