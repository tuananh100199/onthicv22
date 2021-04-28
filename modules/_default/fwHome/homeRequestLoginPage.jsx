import React from 'react';
import { connect } from 'react-redux';
import { forgotPassword, login, register } from '../_init/redux';

// const texts = {
//     vi: {
//         hasLoggedIn: 'Bạn đã đăng nhập!',
//         continue: 'Tiếp tục',
//         login: 'Đăng nhập',
//         signUp: 'Đăng ký',
//         forgotPassword: 'Quên mật khẩu?'
//     },
//     en: {
//         hasLoggedIn: 'You have logged in!',
//         continue: 'Continue',
//         login: 'Login',
//         signUp: 'Sign up',
//         forgotPassword: 'Forgot password?'
//     }
// };

class HomeRequestLoginPage extends React.Component {
    state = { query: {} };

    componentDidMount() {
        $(document).ready(() => {
            const url = new URL(window.location.href);
            if (url.searchParams.get('formId')) {
                this.setState({ query: { formId: url.searchParams.get('formId') } });
            } else if (url.searchParams.get('eventId')) {
                this.setState({ query: { eventId: url.searchParams.get('eventId') } });
            } else if (url.searchParams.get('eventLink')) {
                this.setState({ query: { eventLink: url.searchParams.get('eventLink') } });
            }
        });
    }

    continueLink = () => {
        const query = this.state.query;
        if (query && query.formId) {
            return '/form/registration/item/' + query.formId;
        } else if (query && query.eventId) {
            return '/event/registration/' + query.eventId;
        } else if (query && query.eventLink) {
            return '/sukien/dangky/' + query.eventLink;
        } else {
            return '/user';
        }
    };

    onForgotPasswordClick = (event) => {
        event.preventDefault();
        const email = $('#loginEmail').val().trim();
        if (T.validateEmail(email)) {
            this.props.forgotPassword(email, result => {
                if (result.error) {
                    T.notify('Error when reset your password!', 'danger');
                } else {
                    T.notify('Please check your email inbox!', 'success');
                }
            }, () => T.notify('Error when reset your password!', 'danger'));
        } else {
            T.notify('Please enter your email!', 'danger');
            $('#loginEmail').focus();
        }
        event.preventDefault();
    };

    onLogin = (e) => {
        e.preventDefault();
        let data = {
            email: $('#loginEmail').val().trim(),
            password: $('#loginPassword').val().trim()
        };

        if (data.email !== '' && data.password !== '' && T.validateEmail(data.email)) {
            this.props.login(data, result => {
                if (result.error) {
                    T.notify(result.error, 'danger');
                } else if (result.user) {
                    window.location = this.continueLink();
                }
            });
        } else {
            T.notify('error', 'danger');
        }
    };

    onSignUp = (e) => {
        e.preventDefault();
        let data = {
            lastname: $('#submitLastName').val().trim(),
            firstname: $('#submitFirstName').val().trim(),
            email: $('#submitEmail').val().trim(),
            password: $('#submitPassword').val().trim()
        };
        if (data.firstname !== '' && data.lastname !== '' && data.email !== '' && data.password !== '') {
            this.props.register(data, result => {
                if (result.error) {
                    T.notify(result.error, 'danger');
                } else if (result.user) {
                    T.alert('Please check your email to active account.');
                }
            });
        } else {
            T.notify('Please enter enough information!', 'danger');
        }
    };

    render() {
        const user = this.props.system && this.props.system.user ? this.props.system.user : null;
        if (user) {
            return (
                <div className='site-section bg-light'>
                    <div className='container'>
                        <div className='row align-items-first'>
                            <div className='col-12'>
                                <div className='bg-white'>
                                    <div className='p-3 p-lg-5 border'>
                                        <p className='text-black text-center'>
                                            {/* <span className='h2'>{language.hasLoggedIn}</span> | <Link to={this.continueLink()}>{language.continue}</Link>//TODO */}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else {
            return (
                <div className='container'>
                    <div className='row'>
                        <div className='col-12'>
                            <div className='single-course-content section-padding-30-100'>
                                <div className='course--content'>
                                    <ul className='nav nav-tabs nav-justified'>
                                        <li className='nav-item'>
                                            {/* <a className='nav-link active' data-toggle='tab' href='#loginTab' role='tab' aria-selected='true'>{language.login}</a> TODO */}
                                        </li>
                                        <li className='nav-item'>
                                            {/* <a className='nav-link' data-toggle='tab' href='#signUpTab' role='tab' aria-selected='false'>{language.signUp}</a> TODO */}
                                        </li>
                                    </ul>
                                    <div className='tab-content'>
                                        <div className='tab-pane fade show active' id='loginTab'>
                                            <div className='col-12 col-md-8 offset-md-2 col-lg-6 offset-lg-3'>
                                                <form onSubmit={this.onLogin}>
                                                    <div className='form-group row mt-3'>
                                                        <div className='col-12'>
                                                            <label htmlFor='loginEmail' className='text-black'>
                                                                Email <span className='text-danger'>*</span>
                                                            </label>
                                                            <input type='email' className='form-control' id='loginEmail' />
                                                        </div>
                                                    </div>
                                                    <div className='form-group row'>
                                                        <div className='col-md-12'>
                                                            <label htmlFor='loginPassword' className='text-black'>
                                                                Password <span className='text-danger'>*</span>
                                                            </label>
                                                            <input type='password' className='form-control' id='loginPassword' />
                                                        </div>
                                                    </div>
                                                    <div className='form-group row'>
                                                        <div className='col-lg-12'>
                                                            {/* <button type='submit' className='btn btn-primary btn-lg btn-block'>{language.login}</button>//TODO */}
                                                        </div>
                                                    </div>
                                                </form>
                                                <div className='text-center'>
                                                    <a href='#' onClick={this.onForgotPasswordClick}>
                                                        {/* <small>{language.forgotPassword}</small> TODO */}
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='tab-pane fade' id='signUpTab'>
                                            <div className='col-12 col-md-8 offset-md-2 col-lg-6 offset-lg-3'>
                                                <form onSubmit={this.onSignUp}>
                                                    <div className='form-group row mt-3'>
                                                        <div className='col-12'>
                                                            <label htmlFor='submitFirstName' className='text-black'>
                                                                First Name <span className='text-danger'>*</span>
                                                            </label>
                                                            <input type='text' className='form-control' id='submitFirstName' />
                                                        </div>
                                                    </div>
                                                    <div className='form-group row'>
                                                        <div className='col-12'>
                                                            <label htmlFor='submitLastName' className='text-black'>
                                                                Last Name <span className='text-danger'>*</span>
                                                            </label>
                                                            <input type='text' className='form-control' id='submitLastName' />
                                                        </div>
                                                    </div>
                                                    <div className='form-group row'>
                                                        <div className='col-md-12'>
                                                            <label htmlFor='submitEmail' className='text-black'>
                                                                Email <span className='text-danger'>*</span>
                                                            </label>
                                                            <input type='email' className='form-control' id='submitEmail' />
                                                        </div>
                                                    </div>
                                                    <div className='form-group row'>
                                                        <div className='col-md-12'>
                                                            <label htmlFor='submitPassword' className='text-black'>
                                                                Password <span className='text-danger'>*</span>
                                                            </label>
                                                            <input type='password' className='form-control' id='submitPassword' />
                                                        </div>
                                                    </div>
                                                    <div className='form-group row'>
                                                        <div className='col-lg-12'>
                                                            {/* <button type='submit' className='btn btn-primary btn-lg btn-block'>{language.signUp}</button>//TODO */}
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionToProps = { forgotPassword, login, register };
export default connect(mapStateToProps, mapActionToProps)(HomeRequestLoginPage);
