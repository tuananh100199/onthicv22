import React from 'react';
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

            <div ref={e => this.modal = e} className='modal fade' id='modalLoginForm' tabIndex='-1' role='dialog' aria-labelledby='myModalLabel'
                aria-hidden='true'>
                <div className='modal-dialog ' role='document'>
                    <div className='modal-content d-flex justify-content-center'>
                        <div className='modal-header text-center'>
                            <h4 className='modal-title w-100 font-weight-bold'>Đăng nhập</h4>
                        </div>
                        <div className='modal-body mx-3'>
                            <div className='form-group'>
                                <input className='form-control text-secondary' type='text' ref={this.txtUser} placeholder='CMND/CCCD' autoComplete='off' />
                            </div>
                            <div className='form-group'>
                                <input className='form-control text-secondary' type='password' ref={this.txtPassword} placeholder='Mật khẩu' />
                            </div>

                            <p ref={this.errorMessage} className='text-danger text-center'>&nbsp;</p>

                            <div className='d-flex justify-content-center'>
                                <button className='btn btn-success' type='submit' onClick={this.onLogin}>Đăng nhập</button>
                            </div>
                            {/* <div className='text-center p-t-12'>
                                <a className='text-secondary' href='#' onClick={this.onForgotPasswordClick} >Quên mật khẩu</a>
                            </div> */}


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