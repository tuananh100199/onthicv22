import React from 'react';
import { connect } from 'react-redux';
import { saveSystemState } from './redux';
import { AdminPage, FormTextBox, FormImageBox } from 'view/component/AdminPage';

class SettingsPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready();
        let { address, email, mobile, fax, facebook, youtube, twitter, instagram, dangKyTuVanLink, logo, footer, contact, subscribe } = this.props.system ?
            this.props.system : { address: '', email: '', mobile: '', fax: '', facebook: '', youtube: '', twitter: '', instagram: '', dangKyTuVanLink: '', logo: '/img/logo.jpg', footer: '/img/footer.jpg', contact: '/img/contact.jpg', subscribe: '/img/subscribe.jpg' };
        this.systemAddress.value(address);
        this.systemEmail.value(email);
        this.systemMobile.value(mobile);
        this.systemFax.value(fax);
        this.systemFacebook.value(facebook);
        this.systemYoutube.value(youtube);
        this.systemTwitter.value(twitter);
        this.systemInstagram.value(instagram);
        this.systemDangKyTuVanLink.value(dangKyTuVanLink);
        this.systemLogo.setData('logo', logo);
        this.systemFooter.setData('footer', footer);
        this.systemContact.setData('contact', contact);
        this.systemSubscribe.setData('subscribe', subscribe);
        this.setState({ logo, footer, contact, subscribe });
    }

    saveCommonInfo = () => {
        this.props.saveSystemState({
            address: this.systemAddress.value(),
            email: this.systemEmail.value(),
            mobile: this.systemMobile.value(),
            fax: this.systemFax.value(),
            facebook: this.systemFacebook.value(),
            youtube: this.systemYoutube.value(),
            twitter: this.systemTwitter.value(),
            instagram: this.systemInstagram.value(),
            dangKyTuVanLink: this.systemDangKyTuVanLink.value(),
        });
    }

    changePassword = () => {
        const emailPassword1 = this.emailPassword1.value(),
            emailPassword2 = this.emailPassword2.value();
        if (emailPassword1 == '') {
            T.notify('Mật khẩu mới của email hiện tại bị trống!', 'danger');
            this.emailPassword1.focus();
        } else if (emailPassword2 == '') {
            T.notify('Nhập lại mật khẩu mới!', 'danger');
            this.emailPassword2.focus();
        } else if (emailPassword1 != emailPassword2) {
            T.notify('Mật khẩu mới không giống nhau!', 'danger');
            this.emailPassword1.focus();
        } else {
            this.props.saveSystemState({ emailPassword: emailPassword1 });
            this.emailPassword1.value(''),
                this.emailPassword2.value('');
        }
    }

    render() {
        const permission = this.getUserPermission('system', ['settings']);
        const readOnly = !permission.settings;
        return this.renderPage({
            icon: 'fa fa-cog',
            title: 'Cài đặt hệ thống',
            breadcrumb: ['Thông tin hệ thống'],
            content: <>
                <div className='row'>
                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Thông tin chung</h3>
                            <div className='tile-body'>
                                <FormTextBox ref={e => this.systemAddress = e} label='Địa chỉ' readOnly={readOnly} />
                                <FormTextBox ref={e => this.systemEmail = e} label='Email' readOnly={readOnly} />
                                <FormTextBox ref={e => this.systemMobile = e} label='Số điện thoại' readOnly={readOnly} />
                                <FormTextBox ref={e => this.systemDangKyTuVanLink = e} label='Đường dẫn đăng ký tư vấn' readOnly={readOnly} />
                                <FormTextBox ref={e => this.systemFax = e} label='Fax' readOnly={readOnly} />
                                <FormTextBox ref={e => this.systemFacebook = e} label='Facebook' readOnly={readOnly} />
                                <FormTextBox ref={e => this.systemYoutube = e} label='You tube' readOnly={readOnly} />
                                <FormTextBox ref={e => this.systemTwitter = e} label='Twitter' readOnly={readOnly} />
                                <FormTextBox ref={e => this.systemInstagram = e} label='Instagram' readOnly={readOnly} />
                            </div>
                            {!readOnly ?
                                <div className='tile-footer' style={{ textAlign: 'right' }}>
                                    <button className='btn btn-primary' type='button' onClick={this.saveCommonInfo}>
                                        <i className='fa fa-fw fa-lg fa-save' /> Lưu
                                </button>
                                </div> : null}
                        </div>
                    </div>

                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Thay đổi mật khẩu</h3>
                            <div className='tile-body'>
                                <FormTextBox ref={e => this.emailPassword1 = e} label='Mật khẩu mới' type='password' readOnly={readOnly} />
                                <FormTextBox ref={e => this.emailPassword2 = e} label='Nhập lại mật khẩu mới' type='password' readOnly={readOnly} />
                            </div>
                            {!readOnly ?
                                <div className='tile-footer'>
                                    <div className='row'>
                                        <div className='col-md-12' style={{ textAlign: 'right' }}>
                                            <button className='btn btn-primary' type='button' onClick={this.changePassword}>
                                                <i className='fa fa-fw fa-lg fa-check-circle' />Thay đổi mật khẩu
                                        </button>
                                        </div>
                                    </div>
                                </div> : null}
                        </div>

                        <div className='tile'>
                            <h3 className='tile-title'>Hình ảnh</h3>
                            <div className='tile-body'>
                                <div className='tile-body'>
                                    <FormImageBox ref={e => this.systemLogo = e} label='Logo công ty' uploadType='SettingImage' image={this.state.logo} readOnly={readOnly} />
                                    <FormImageBox ref={e => this.systemFooter = e} label='Hình nền cuối trang web' uploadType='SettingImage' image={this.state.footer} readOnly={readOnly} />
                                    <FormImageBox ref={e => this.systemContact = e} label='Hình nền phần liên hệ' uploadType='SettingImage' image={this.state.contact} readOnly={readOnly} />
                                    <FormImageBox ref={e => this.systemSubscribe = e} label='Hình nền phần đăng ký nhận tin' uploadType='SettingImage' image={this.state.subscribe} readOnly={readOnly} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { saveSystemState };
export default connect(mapStateToProps, mapActionsToProps)(SettingsPage);