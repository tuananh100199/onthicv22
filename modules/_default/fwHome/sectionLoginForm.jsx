import React from 'react';
import { connect } from 'react-redux';
import { login } from 'modules/_default/_init/redux';
import { homegetLoginForm } from './redux/reduxLoginForm';

class SectionLoginForm extends React.Component {
    state = {};
    componentDidMount() {
        this.props.viewId && this.props.homegetLoginForm(this.props.viewId, data => this.setState(data));
    }

    onLogin = (e) => {
        e.preventDefault();
        const data = {
            username: this.username.value.trim(),
            password: this.password.value
        };

        if (data.username !== '' && data.password !== '') {
            this.props.login(data, result => {
                if (result.error) {
                    this.errorMessage.innerHTML = result.error;
                }
                if (result.user) {
                    window.location = '/user';
                }
            });
        } else {
            T.notify('error', 'danger');
        }
    }

    render() {
        const { item } = this.state;
        const user = this.props.system && this.props.system.user;
        return (
        <>
            { !user ?
            <div className='login_form'>
                <div className='intro_col'>
                {item ?  
                    <div className='intro_form_login' style={{backgroundImage: 'url(' + item.imageBackground + ')', backgroundSize: 'cover'}}>
                        
                            <div className='row'>
                                <div className='col-lg-7 col-md-12' style={{ width: '100%'}}>
                                    <div className='wrap_image'>
                                        <img src={item.image} style={{ width: '100%', objectFit: 'contain' }} alt='Image' />                                        
                                    </div>
                                </div>
                                <div className='col-lg-5 col-md-12'>
                                    <div className='wrap_form'>
                                        <div className='form_title'>
                                            {item.title}
                                        </div>
                                        <p className='content'>{item.content}</p>
                                        <form action='#' className='intro_form' id='intro_form' onSubmit={this.onLogin}>
                                            <div className='d-flex flex-row align-items-start justify-content-between flex-wrap'>
                                                <div style={{ width: '100%', padding: '0 8px', margin: 0 }} className='wrap-box'>
                                                    <div className='wrap_icon'>
                                                        <i className='fa fa-user' aria-hidden='true' />
                                                    </div>
                                                    <input id='username' type='text' onKeyPress={e => (!/[0-9]/.test(e.key)) && e.preventDefault()} placeholder='Tên đăng nhập' ref={e => this.username = e} />
                                                </div>
                                                <div style={{ width: '100%', padding: '0 8px', margin: 0 }} className='wrap-box' >
                                                    <div className='wrap_icon'>
                                                        <i className='fa fa-lock' aria-hidden='true' />
                                                    </div>
                                                    <input id='password' type='password' placeholder='Mật khẩu' ref={e => this.password = e} />
                                                </div>
                                            </div>
                                            <p ref={e => this.errorMessage = e} className='text-center' style={{ color: 'white' }}></p>
                                            <div className='wrap-submit-btn'>
                                                <button className='login-form-button trans_200'>Đăng nhập</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div> 
                    </div>
                : null}
                </div>
            </div> : <div style={{ paddingTop: '80px'}}/>}
        </>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { login, homegetLoginForm };
export default connect(mapStateToProps, mapActionsToProps)(SectionLoginForm);
