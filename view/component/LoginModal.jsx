import React from 'react';
import './loginModal.scss';
export default class LoginModal extends React.Component {
    txtUser = React.createRef();
    txtPassword = React.createRef();
    errorMessage = React.createRef();
    showLogin = () => {
        $('input').val('');
        $(this.errorMessage.current).html('&nbsp;');
        // $(this.signUpErrorMessage.current).html('&nbsp;');
        $(this.modal).modal('show');
    }
    hide = () => $(this.modal).modal('hide');
    onLogin = (e) => {
        e.preventDefault();
        let errorMessage = $(this.errorMessage.current),
            data = {
                username: this.txtUser.current.value.trim(),
                password: this.txtPassword.current.value
            };

        if (data.username !== '' && data.password !== '') {
            this.props.login(data, result => {
                errorMessage.html(result.error);

                if (result.user) {
                    $(this.modal.current).modal('hide');
                    window.location = '/user';
                }
            });
        } else {
            T.notify('error', 'danger');
        }
    }
    render() {
        return (
            <div ref={e => this.modal = e} className='modal fade' id='elegantModalForm' tabIndex='-1' role='dialog'
                aria-labelledby='myModalLabel' style={{ zIndex: 2000 }}
                aria-hidden='true' >
                <div className='modal-dialog ' role='document'>
                    <div className='modal-content d-flex justify-content-center'>
                        <div className='modal-header text-center'>
                            <h4 className='modal-title w-100 font-weight-bold'>Đăng nhập</h4>
                        </div>
                        <div className=''>
                            <div className='wrap-login100 align-self-center'>
                                <form className='login100-form validate-form login-validate-form' onSubmit={this.onLogin}>
                                    <div className='wrap-input100 validate-input login-validate-input'>
                                        <input className='input100' type='text' name='username' id='loginModalUsername' ref={this.txtUser}
                                            placeholder='CMND/CCCD' autoComplete='off' />
                                        <span className='focus-input100' />
                                        <span className='symbol-input100'><i className='icon icon-envelope' aria-hidden='true' /></span>
                                    </div>

                                    <div className='wrap-input100 validate-input login-validate-input'
                                        data-validate='Password is required'>
                                        <input className='input100' type='password' name='pass' id='loginModalPassword'
                                            ref={this.txtPassword} placeholder='Mật khẩu' />
                                        <span className='focus-input100' />
                                        <span className='symbol-input100'><i className='icon icon-lock' aria-hidden='true' /></span>
                                    </div>

                                    <p ref={this.errorMessage} className='text-danger text-center'>&nbsp;</p>

                                    <div className='container-login100-form-btn' style={{ padding: '0' }}>
                                        <button className='login100-form-btn' type='submit'>Đăng nhập</button>
                                    </div>

                                    <div className='text-center p-t-12'>
                                        <a className='txt2' href='#' onClick={this.onForgotPasswordClick}>Quên mật khẩu</a>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div className='modal-footer' style={{ display: 'block' }}>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'
                                style={{ width: '100px', float: 'right' }}>Đóng</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}