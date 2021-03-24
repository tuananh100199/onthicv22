import React from 'react';
import { connect } from 'react-redux';
import { saveSystemState } from './reduxSystem';
import ImageBox from 'view/component/ImageBox';

class SettingsPage extends React.Component {
    constructor(props) {
        super(props);
        this.address = React.createRef();
        this.email = React.createRef();
        this.emailPassword1 = React.createRef();
        this.emailPassword2 = React.createRef();
        this.mobile = React.createRef();
        this.fax = React.createRef();
        this.facebook = React.createRef();
        this.youtube = React.createRef();
        this.twitter = React.createRef();
        this.instagram = React.createRef();
    }

    componentDidMount() {
        T.ready();
    }

    saveCommonInfo = () => {
        this.props.saveSystemState({
            address: $(this.address.current).val().trim(),
            email: $(this.email.current).val().trim(),
            mobile: $(this.mobile.current).val().trim(),
            fax: $(this.fax.current).val().trim(),
            facebook: $(this.facebook.current).val().trim(),
            youtube: $(this.youtube.current).val().trim(),
            twitter: $(this.twitter.current).val().trim(),
            instagram: $(this.instagram.current).val().trim(),
        });
    }

    changePassword = () => {
        const emailPassword1 = $(this.emailPassword1.current).val(),
            emailPassword2 = $(this.emailPassword2.current).val();
        if (emailPassword1 == '') {
            T.notify('New password of current email is empty!', 'danger');
            $(this.emailPassword1.current).focus();
        } else if (emailPassword2 == '') {
            T.notify('Please retype new password!', 'danger');
            $(this.emailPassword2.current).focus();
        } else if (emailPassword1 != emailPassword2) {
            T.notify('New password and retype password are not match!', 'danger');
            $(this.emailPassword1.current).focus();
        } else {
            this.props.saveSystemState({ password: emailPassword1 });
            $(this.emailPassword1.current).val('');
            $(this.emailPassword2.current).val('');
        }
    }

    render() {
        let { address, email, mobile, fax, facebook, youtube, twitter, instagram, logo, footer, contact, subscribe, addressList } = this.props.system ?
            this.props.system : { address: '', email: '', mobile: '', fax: '', facebook: '', youtube: '', twitter: '', instagram: '', logo: '', footer: '/img/footer.jpg', contact: '/img/contact.jpg', subscribe: '/img/subscribe.jpg', addressList: '' };

        try {
            addressList = JSON.parse(addressList);
        } catch (e) {
            addressList = []
        }

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
                                <div className='form-group'>
                                    <label className='control-label'>Địa chỉ</label>
                                    <input className='form-control' type='text' placeholder='Địa chỉ' ref={this.address} defaultValue={address} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Email</label>
                                    <input className='form-control' type='email' placeholder='Email' ref={this.email} defaultValue={email} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Số điện thoại</label>
                                    <input className='form-control' type='text' placeholder='Số điện thoại' ref={this.mobile} defaultValue={mobile} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Fax</label>
                                    <input className='form-control' type='text' placeholder='Fax' ref={this.fax} defaultValue={fax} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Facebook</label>
                                    <input className='form-control' type='text' placeholder='Facebook' ref={this.facebook} defaultValue={facebook} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Youtube</label>
                                    <input className='form-control' type='text' placeholder='Youtube' ref={this.youtube} defaultValue={youtube} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Twitter</label>
                                    <input className='form-control' type='text' placeholder='Twitter' ref={this.twitter} defaultValue={twitter} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Instagram</label>
                                    <input className='form-control' type='text' placeholder='Instagram' ref={this.instagram} defaultValue={instagram} />
                                </div>
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
                                <div className='form-group'>
                                    <label className='control-label'>Mật khẩu mới</label>
                                    <input className='form-control' type='password' placeholder='Mật khẩu mới' ref={this.emailPassword1} defaultValue='' autoComplete='new-password' />
                                    <input className='form-control mt-1' type='password' placeholder='Nhập lại mật khẩu' ref={this.emailPassword2} defaultValue='' autoComplete='new-password' />
                                </div>
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
                                        <ImageBox postUrl='/user/upload' uploadType='SettingImage' userData='logo' image={logo} />
                                    </div>

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
                                    </div>
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