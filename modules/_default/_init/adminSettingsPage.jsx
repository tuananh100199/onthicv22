import React from 'react';
import { connect } from 'react-redux';
import { saveSystemState } from './reduxSystem';
import ImageBox from 'view/component/ImageBox';
import { AdminPage, AdminModal, FormTextBox, FormCheckbox, FormImageBox, FormDatePicker, FormSelect, TableCell, renderTable } from 'view/component/AdminPage';


class SettingsPage extends AdminPage {

    componentDidMount() {
        T.ready();
        let { address, email, mobile, fax, facebook, youtube, twitter, instagram, logo, footer, contact, subscribe } = this.props.system ?
        this.props.system : { address: '', email: '', mobile: '', fax: '', facebook: '', youtube: '', twitter: '', instagram: '', logo: '', footer: '/img/footer.jpg', contact: '/img/contact.jpg', subscribe: '/img/subscribe.jpg' };
        this.setState(systemInfo);

        this.systemAddress.value(address);
        this.systemEmail.value(email);
        this.systemMobile.value(mobile);
        this.systemFax.value(fax);
        this.systemFacebook.value(facebook);
        this.systemYoutube.value(youtube);
        this.systemTwitter.value(twitter);
        this.systemInstagram.value(instagram);
        // this.systemLogo.value(logo);
        // this.systemFooter.value(footer);
        // this.systemContact.value(contact);
        // this.systemSubscribe.value(subscribe);
        // this.systemFooter.value(footer);
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
            this.props.saveSystemState({ password: emailPassword1 });
            this.emailPassword1.value(''),
            this.emailPassword2.value('');
        }
    }

    render() {
        let readOnly = false;
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-cog' /> Cấu hình</h1>
                </div>
                <div className='row'>
                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Thông tin chung</h3>
                            <div className='tile-body'>
                                <FormTextBox ref={e => this.systemAddress = e} label='Địa chỉ' readOnly={readOnly} defaultValue='' />
                                <FormTextBox ref={e => this.systemEmail = e} label='Email' readOnly={readOnly} defaultValue='' />
                                <FormTextBox ref={e => this.systemMobile = e} label='Số điện thoại' readOnly={readOnly} defaultValue='' />
                                <FormTextBox ref={e => this.systemFax = e} label='Fax' readOnly={readOnly} defaultValue='' />
                                <FormTextBox ref={e => this.systemFacebook = e} label='Facebook' readOnly={readOnly} defaultValue='' />
                                <FormTextBox ref={e => this.systemYoutube = e} label='You tube' readOnly={readOnly} defaultValue='' />
                                <FormTextBox ref={e => this.systemTwitter = e} label='Twitter' readOnly={readOnly} defaultValue='' />
                                <FormTextBox ref={e => this.systemInstagram = e} label='Instagram' readOnly={readOnly} defaultValue='' />
                            </div>
                            <div className='tile-footer' style={{ textAlign: 'right' }}>
                                <button className='btn btn-primary' type='button' onClick={this.saveCommonInfo}>
                                    <i className='fa fa-fw fa-lg fa-save' /> Lưu
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Thay đổi mật khẩu</h3>
                            <div className='tile-body'>
                                <FormTextBox ref={e => this.emailPassword1 = e} label='Mật khẩu mới' readOnly={readOnly} defaultValue='' autoComplete='new-password'/>
                                <FormTextBox ref={e => this.emailPassword2 = e} label='Nhập lại mật khẩu mới' readOnly={readOnly} defaultValue='' autoComplete='new-password'/>
                            </div>
                            <div className='tile-footer'>
                                <div className='row'>
                                    <div className='col-md-12' style={{ textAlign: 'right' }}>
                                        <button className='btn btn-primary' type='button' onClick={this.changePassword}>
                                            <i className='fa fa-fw fa-lg fa-check-circle' />Thay đổi mật khẩu
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='tile'>
                            <h3 className='tile-title'>Hình ảnh</h3>
                            <div className='tile-body'>
                                <div className='tile-body'>
                                    <div className='form-group'>
                                        <label className='control-label'>Logo công ty</label>
                                        {/* <ImageBox postUrl='/user/upload' uploadType='SettingImage' userData='logo' image={logo} /> */}
                                    </div>
                                    <FormImageBox ref={e => this.systemLogo = e} className='form-group' label='Logo công ty' uploadType='SettingImage' readOnly={readOnly} />

{/* 
                                    <div className='form-group'>
                                        <label className='control-label'>Hình nền cuối trang web</label>
                                        <ImageBox postUrl='/user/upload' uploadType='SettingImage' userData='footer' image={footer} />
                                    </div>

                                    <div className='form-group'>
                                        <label className='control-label'>Hình nền phần Liên hệ</label>
                                        <ImageBox postUrl='/user/upload' uploadType='SettingImage' userData='contact' image={contact} />
                                    </div>

                                    <div className='form-group'>
                                        <label className='control-label'>Hình nền phần Đăng ký nhận tin</label>
                                        <ImageBox postUrl='/user/upload' uploadType='SettingImage' userData='subscribe' image={subscribe} />
                                    </div> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { saveSystemState };
export default connect(mapStateToProps, mapActionsToProps)(SettingsPage);