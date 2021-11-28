import React from 'react';
import { connect } from 'react-redux';
import { login } from 'modules/_default/_init/redux';

class SectionLoginForm extends React.Component {
    onLogin = (e) => {
        e.preventDefault();
        const data = {
            username: this.username.value.trim(),
            password: this.password.value
        };

        if (data.username !== '' && data.password !== '') {
            this.props.login(data, result => {
                this.errorMessage.innerHTML = result.error;
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
        const user = this.props.system && this.props.system.user;
        return (
            <div className='intro'>
                <div className='intro_col'>
                    <div className='intro_form_container'>
                        <div className='intro_form_title'>Hệ thống đào tạo trực tuyến
                            HIỆP PHÁT
                        </div>
                        <p>Hệ thống hỗ trợ công tác đào tạo, hỗ trợ giảng dạy - học và đánh giá, kiểm tra trực tuyến dành riêng cho các Học viên Đào tạo và sát hạch lái xe B1, B2 và C.</p>
                        {user ?
                            <>
                                <p>Xin chào {user.lastname + ' ' + user.firstname}!</p>
                                <a href='/user' className='button button_1 intro_button trans_200'>Trang cá nhân</a>
                            </> :
                            <form action='#' className='intro_form' id='intro_form' onSubmit={this.onLogin}>
                                <div className='d-flex flex-row align-items-start justify-content-between flex-wrap'>
                                    <p style={{ width: '100%', padding: '0 8px', margin: 0 }}>CMND/CCCD:
                                        <input id='username' type='text' onKeyPress={e => (!/[0-9]/.test(e.key)) && e.preventDefault()} className='intro_input w-100' placeholder='CMND/CCCD' ref={e => this.username = e} />
                                    </p>
                                    <p style={{ width: '100%', padding: '0 8px', margin: 0 }}>Mật khẩu<br />
                                        <input id='password' type='text' className='intro_input w-100' placeholder='Mật khẩu' ref={e => this.password = e} />
                                    </p>
                                </div>
                                <button className='button button_1 intro_button trans_200'>Đăng nhập</button>
                            </form>}
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { login };
export default connect(mapStateToProps, mapActionsToProps)(SectionLoginForm);
