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
        const { item } = this.state;
        const user = this.props.system && this.props.system.user;
        return (
        <>
            { !user ?
            <div className='intro login_form'>
                <div className='intro_col'>
                    <div className='intro_form_container'>
                            {item ? 
                                <div className='row'>
                                    <div className='col-md-7' style={{ width: '100%'}}>
                                        <div className='wrap_image'>
                                            <img src={item.image} style={{ width: '100%', objectFit: 'contain' }} alt='Image' />                                        
                                        </div>
                                    </div>
                                    <div className='col-md-5'>
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
                                                    <input id='password' type='text' placeholder='Mật khẩu' ref={e => this.password = e} />
                                                </div>
                                            </div>
                                            <button className='button button_1 intro_button trans_200' style={{ marginTop: '20px'}}>Đăng nhập</button>
                                        </form>
                                    </div>
                                </div> : null}
                    </div>
                </div>
            </div> :  null}
        </>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { login, homegetLoginForm };
export default connect(mapStateToProps, mapActionsToProps)(SectionLoginForm);
