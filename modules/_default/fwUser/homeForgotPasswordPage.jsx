import React from 'react';

export default class ForgotPasswordPage extends React.Component {
    state = { message: '', error: '' };

    componentDidMount() {
        T.post(window.location.pathname,
            res => this.setState({ message: res.error }),
            error => T.notify('Hệ thống bị lỗi!', 'danger'));
    }

    save = () => {
        let password1 = $('#fgtPassword1').val(),
            password2 = $('#fgtPassword2').val();
        if (password1 === '') {
            this.setState({ error: 'Vui lòng nhập mật khẩu!' });
            $('#fgtPassword1').focus();
        } else if (password2 === '') {
            this.setState({ error: 'Vui lòng nhập lại mật khẩu!' });
            $('#fgtPassword2').focus();
        } else if (password1 != password2) {
            this.setState({ error: 'Mật khẩu không trùng nhau!' });
            $('#fgtPassword1').focus();
        } else {
            const route = T.routeMatcher('/forgot-password/:userId/:userToken'),
                params = route.parse(window.location.pathname);
            T.put('/forgot-password/new-password', { userId: params.userId, token: params.userToken, password: password1 },
                res => {
                    if (res.error) {
                        this.setState({ message: null, error: res.error });
                    } else {
                        this.setState({ message: 'Đổi mật khẩu thành công!', error: null });
                    }
                },
                error => { });
        }
    }

    goToHomePage = (e) => e.preventDefault() || this.props.history.push('/');

    render() {
        if (this.state.message && this.state.message !== '') {
            return (
                <div className='central-box'>
                    <h3 dangerouslySetInnerHTML={{ __html: this.state.message }} />
                    Nhấp vào <a href='#' onClick={this.goToHomePage}>đây</a> để trở về trang chủ.
                </div>
            );
        } else {
            return (
                <div className='central-box' style={{ textAlign: 'left' }}>
                    <div className='form-group'>
                        <label htmlFor='fgtPassword1'>Mật khẩu</label>
                        <input type='password' className='form-control' id='fgtPassword1' placeholder='Mật khẩu' autoFocus={true} />
                    </div>
                    <div className='form-group'>
                        <label htmlFor='fgtPassword2'>Nhập lại mật khẩu</label>
                        <input type='password' className='form-control' id='fgtPassword2' placeholder='Nhập lại mật khẩu' />
                    </div>
                    <p style={{ color: 'red' }} dangerouslySetInnerHTML={{ __html: this.state.error }} />
                    <div style={{ width: '100%', textAlign: 'right' }}>
                        <button type='button' className='btn btn-primary' onClick={this.save}>
                            <i className='fa fa-fw fa-lg fa-save' /> Lưu
                        </button>
                    </div>
                </div>
            );
        }
    }
}