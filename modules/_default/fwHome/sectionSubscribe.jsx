import React from 'react';
import { connect } from 'react-redux';
import { createSubscribe } from './redux/reduxSubscribe';



class SectionSubscribe extends React.Component {
    constructor(props) {
        super(props);
        this.background = React.createRef();
        this.email = React.createRef();
        this.state = {};
    }


    componentDidMount() {
        $(document).ready(() => {
            const done = () => {
                if (this.props && this.props.system && this.props.system.subscribe) {
                    $(window).trigger('resize')
                    $(this.background.current).parallax();
                } else {
                    setTimeout(done, 100)
                }
            }
            done()
        })
    }

    componentWillUnmount() {
        $('.parallax-mirror').length != 0 && $(this.background.current).parallax('destroy')
    }

    sendMessage = (e) => {
        e.preventDefault();
        if (this.email.current.value == '') {
            T.notify('Email bị trống!', 'danger');
            (this.email.current).focus();
        } else if (!T.validateEmail(this.email.current.value)) {
            T.notify('Email không hợp lệ!', 'danger');
            (this.email.current).focus();
        } else {
            this.props.createSubscribe({
                email: this.email.current.value,
            }, () => {
                this.email.current.value = '';
                T.notify('Đăng ký nhận tin của bạn đã được gửi!', 'success', true, 3000);
            });
        }
    }

    render() {
        let subscribe = this.props && this.props.system && this.props.system.subscribe ? this.props.system.subscribe : '/img/subscribe.jpg';
        return (
            <div className='newsletter'>
                <div ref={this.background} className='parallax_background parallax-window' data-parallax='scroll' data-image-src={subscribe} data-speed='0.8' />
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
                                    <input type='email' className='newsletter_input' ref={this.email} placeholder='Email của bạn' />
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
const mapActionsToProps = {createSubscribe};
export default connect(mapStateToProps, mapActionsToProps)(SectionSubscribe);