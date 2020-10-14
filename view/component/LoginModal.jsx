import React from 'react';
import PropTypes from 'prop-types';
import SwipeableViews from 'react-swipeable-views';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import './loginModal.scss';

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <Typography component="div" role="tabpanel" hidden={value !== index} id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`} {...other}>
            <Box p={3}>{children}</Box>
        </Typography>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};

function a11yProps(index) {
    return {
        id: `full-width-tab-${index}`,
        'aria-controls': `full-width-tabpanel-${index}`,
    };
}

const texts = {
    vi: {
        firstname: 'Tên',
        lastname: 'Họ',
        email: 'Email',
        password: 'Mật khẩu',
        forgotPassword: 'Quên mật khẩu?',
        close: 'Đóng',
        register: 'Đăng ký',
        login: 'Đăng nhập',
    },
    en: {
        firstname: 'Firstname',
        lastname: 'Lastname',
        email: 'Email',
        password: 'Password',
        forgotPassword: 'Forgot password?',
        close: 'Close',
        register: 'Register',
        login: 'Login',
    }
};

export default class LoginModal extends React.Component {
    constructor(props) {
        super(props);
        this.modal = React.createRef();
        this.txtFirstname = React.createRef();
        this.txtLastname = React.createRef();
        this.txtEmail = React.createRef();
        this.txtPassword = React.createRef();
        this.signUpEmail = React.createRef();
        this.signUpPassword = React.createRef();
        this.errorMessage = React.createRef();
        this.signUpErrorMessage = React.createRef();
        this.googleLogin = React.createRef();

        this.state = {
            value: 0
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleChangeIndex = this.handleChangeIndex.bind(this);

        this.showLogin = this.showLogin.bind(this);
        this.onLogin = this.onLogin.bind(this);
        this.onSignUp = this.onSignUp.bind(this);
        this.validate = this.validate.bind(this);
        this.showValidate = this.showValidate.bind(this);
        this.onForgotPasswordClick = this.onForgotPasswordClick.bind(this);
    }

    handleChange(event, newValue) {
        this.setState({ value: newValue });
    };

    handleChangeIndex(index) {
        this.setState({ value: index });
    };

    validate(input) {
        if ($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
            return T.validateEmail($(input).val().trim());
        } else {
            if ($(input).val().trim() == '') {
                return false;
            }
        }
    }

    showValidate(input) {
        let thisAlert = $(input).parent();
        $(thisAlert).addClass('alert-validate');
    }

    componentDidMount() {
        $(document).ready(() => {
            setTimeout(() => {
                // let input = $('.validate-input .input100');
                let input2 = $('.login-validate-input .input100');
                let input3 = $('.signUp-validate-input .input100');
                $('.login-validate-form').on('submit', function () {
                    let check = true;
                    for (let i = 0; i < input2.length; i++) {
                        if (validate(input2[i]) == false) {
                            showValidate(input2[i]);
                            check = false;
                        }
                    }
                    return check;
                });

                $('.signUp-validate-form').on('submit', function () {
                    let check = true;
                    for (let i = 0; i < input3.length; i++) {
                        if (validate(input3[i]) == false) {
                            showValidate(input3[i]);
                            check = false;
                        }
                    }
                    return check;
                });

                $('.validate-form .input100').each(function () {
                    $(this).focus(function () {
                        hideValidate(this);
                    });
                });

                function validate(input) {
                    if ($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
                        if ($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
                            return false;
                        }
                    } else {
                        if ($(input).val().trim() == '') {
                            return false;
                        }
                    }
                }

                function showValidate(input) {
                    let thisAlert = $(input).parent();
                    $(thisAlert).addClass('alert-validate');
                }

                function hideValidate(input) {
                    let thisAlert = $(input).parent();
                    $(thisAlert).removeClass('alert-validate');
                }
            }, 250);
        });
        $(this.modal.current).on('shown.bs.modal', () => {
            $(this.txtEmail.current).focus();
        });
    }

    showLogin() {
        $('input').val('');
        $(this.errorMessage.current).html('&nbsp;');
        $(this.signUpErrorMessage.current).html('&nbsp;');
        $(this.modal.current).modal('show');
        $(this.googleLogin.current).css('border', '1px solid #eee');
    }

    onForgotPasswordClick(event) {
        const emailInput = $(this.txtEmail.current)[0];
        if (this.validate(emailInput)) {
            const email = emailInput.value.trim(), errorMessage = $(this.errorMessage.current);
            this.props.forgotPassword(email, result => {
                if (result.error) {
                    errorMessage.html('Error when reset your password!');
                } else {
                    errorMessage.html('Please check your email!');
                }
            }, () => errorMessage.html('Error when reset your password!'));
        } else {
            this.showValidate(emailInput);
        }
        event.preventDefault();
    }

    onLogin(e) {
        e.preventDefault();
        let errorMessage = $(this.errorMessage.current),
            data = {
                email: this.txtEmail.current.value.trim(),
                password: this.txtPassword.current.value
            };

        if (data.email !== '' && data.password !== '' && T.validateEmail(data.email)) {
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

    onSignUp(e) {
        e.preventDefault();
        let errorMessage = $(this.signUpErrorMessage.current),
            data = {
                lastname: this.txtFirstname.current.value.trim(),
                firstname: this.txtLastname.current.value.trim(),
                email: this.signUpEmail.current.value.trim(),
                password: this.signUpPassword.current.value
            };
        if (data.firstname !== '' && data.lastname !== '' && data.email !== '' && data.password !== '') {
            this.props.register(data, result => {
                errorMessage.html(result.error);
                if (result.user) {
                    $(this.modal.current).modal('hide');
                    T.alert('Please check your email to active account.');
                }
            });
        }
    }

    render() {
        const language = T.language(texts);
        return (
            <div ref={this.modal} className='modal fade' id='elegantModalForm' tabIndex='-1' role='dialog'
                aria-labelledby='myModalLabel' style={{ zIndex: 2000 }}
                aria-hidden='true'>
                <div className='modal-dialog ' role='document'>
                    <div className='modal-content d-flex justify-content-center'>
                        <div className=''>
                            <AppBar position="static" color="transparent">
                                <Tabs value={this.state.value} onChange={this.handleChange} indicatorColor="primary" textColor="primary"
                                    variant="fullWidth" aria-label="full width tabs example">
                                    <Tab label={language.login} {...a11yProps(0)} />
                                    <Tab label={language.register} {...a11yProps(1)} />
                                </Tabs>
                            </AppBar>
                            <SwipeableViews axis={'x'} index={this.state.value} onChangeIndex={this.handleChangeIndex}>
                                <TabPanel value={this.state.value} index={0} className='d-flex justify-content-center'>
                                    <div className='wrap-login100 align-self-center'>
                                        <form className='login100-form validate-form login-validate-form' onSubmit={this.onLogin}>
                                            <div className='wrap-input100 validate-input login-validate-input'
                                                data-validate='Valid email is required: ex@org.com'>
                                                <input className='input100' type='text' name='email' id='loginModalEmail' ref={this.txtEmail}
                                                    placeholder={language.email} autoComplete='off' />
                                                <span className='focus-input100' />
                                                <span className='symbol-input100'><i className='icon icon-envelope' aria-hidden='true' /></span>
                                            </div>

                                            <div className='wrap-input100 validate-input login-validate-input'
                                                data-validate='Password is required'>
                                                <input className='input100' type='password' name='pass' id='loginModalPassword'
                                                    ref={this.txtPassword} placeholder={language.password} />
                                                <span className='focus-input100' />
                                                <span className='symbol-input100'><i className='icon icon-lock' aria-hidden='true' /></span>
                                            </div>

                                            <p ref={this.errorMessage} className='text-danger text-center'>&nbsp;</p>

                                            <div className='container-login100-form-btn' style={{ padding: '0' }}>
                                                <button className='login100-form-btn' type='submit'>
                                                    {language.login}
                                                </button>
                                            </div>

                                            <div className='text-center p-t-12'>
                                                <a className='txt2' href='#' onClick={this.onForgotPasswordClick}>
                                                    {language.forgotPassword}
                                                </a>
                                            </div>
                                        </form>
                                    </div>
                                </TabPanel>
                                <TabPanel value={this.state.value} index={1} className='d-flex justify-content-center'>
                                    <div className='wrap-login100 align-self-center'>
                                        <form className='login100-form validate-form signUp-validate-form' onSubmit={this.onSignUp}>
                                            <div className='wrap-input100 validate-input signUp-validate-input' data-validate='Firstname is required'>
                                                <input className='input100' type='text' autoComplete="off" placeholder={language.firstname} ref={this.txtFirstname} />
                                                <span className='focus-input100' />
                                                <span className='symbol-input100'><i className='icon icon-user' aria-hidden='true' /></span>
                                            </div>

                                            <div className='wrap-input100 validate-input signUp-validate-input' data-validate='Lastname is required'>
                                                <input className='input100' type='text' autoComplete="off" placeholder={language.lastname} ref={this.txtLastname} />
                                                <span className='focus-input100' />
                                                <span className='symbol-input100'><i className='icon icon-user' aria-hidden='true' /></span>
                                            </div>

                                            <div className='wrap-input100 validate-input signUp-validate-input' data-validate='Valid email is required: ex@org.com'>
                                                <input className='input100' type='text' name='email' autoComplete="off" placeholder={language.email} ref={this.signUpEmail} />
                                                <span className='focus-input100' />
                                                <span className='symbol-input100'><i className='icon icon-envelope' aria-hidden='true' /></span>
                                            </div>

                                            <div className='wrap-input100 validate-input signUp-validate-input' data-validate='Password is required'>
                                                <input className='input100' type='password' autoComplete="off" placeholder={language.password} ref={this.signUpPassword} />
                                                <span className='focus-input100' />
                                                <span className='symbol-input100'><i className='icon icon-lock' aria-hidden='true' /></span>
                                            </div>

                                            <p ref={this.signUpErrorMessage} className='text-danger text-center'>&nbsp;</p>

                                            <div className='container-login100-form-btn' style={{ padding: '0' }}>
                                                <button className='login100-form-btn'>
                                                    {language.register}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </TabPanel>
                            </SwipeableViews>
                        </div>
                        <div className='modal-footer' style={{ display: 'block' }}>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'
                                style={{ width: '100px', float: 'right' }}>{language.close}</button>
                        </div>
                    </div>
                </div>

            </div>
        );
    }
}
