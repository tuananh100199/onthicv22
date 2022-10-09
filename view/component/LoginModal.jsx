import React from 'react';
export default class LoginModal extends React.Component {
    showLogin = () => {
        this.username.value = '';
        this.password.value = '';
        this.errorMessage.innerHTML = '';
        $(this.modal).modal('show');
    }

    hide = () => $(this.modal).modal('hide');

    onLogin = (e) => {
        e.preventDefault();
        const data = {
            username: this.username.value.trim(),
            password: this.password.value
        };

        if (data.username !== '' && data.password !== '') {
            this.props.login(data, result => {
                this.errorMessage.innerHTML = result.error?result.error:'';
                if (result.user) {
                    T.notify('Đăng nhập thành công!', 'success');
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
            <div ref={e => this.modal = e} className='modal fade' tabIndex='-1' role='dialog' aria-hidden='true'>
                <div className='modal-dialog ' role='document'>
                    <div className='modal-content d-flex justify-content-center'>
                        <div className='modal-header text-center'>
                            <h4 className='modal-title w-100 font-weight-bold'>Đăng nhập</h4>
                        </div>
                        <div className='modal-body mx-3'>
                            <div className='form-group'>
                                <label htmlFor='username'>CMND/CCCD</label>
                                <input id='username' className='form-control text-secondary' type='text' ref={e => this.username = e} placeholder='CMND/CCCD' autoComplete='off' />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='password'>Mật khẩu</label>
                                <input id='password' className='form-control text-secondary' type='password' ref={e => this.password = e} placeholder='Mật khẩu' />
                            </div>

                            <p ref={e => this.errorMessage = e} className='text-danger text-center'></p>
                            <div className='float-right'>
                                <button type='submit' className='btn btn-success mr-2' onClick={this.onLogin}>Đăng nhập</button>
                                <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}