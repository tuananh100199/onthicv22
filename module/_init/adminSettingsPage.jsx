import React from 'react';
import { connect } from 'react-redux';
import { saveSystemState } from './reduxSystem.jsx';
import ImageBox from '../../view/component/ImageBox.jsx';

class AddressListSection extends React.Component {
    state = { items: [] };

    componentDidMount() {
        this.setState({ items: this.props.items || [] });
    }

    textChanged = (index, value, type) => {
        const items = this.state.items;
        items[index][type] = value;
        this.setState({ items });
    }

    addAddress = () => {
        const items = this.state.items;
        items.push({
            addressTitle: '',
            address: '',
            phoneNumber: '',
            mobile: '',
            email: ''
        });

        this.setState({ items });
    }

    saveAddress = () => this.props.saveAddress(JSON.stringify(this.state.items));

    render() {
        return (
            <div className='tile'>
                <h3 className='tile-title'>Danh sách địa chỉ</h3>
                <div className='tile-body'>
                    {this.state.items.map((item, index) => (
                        <React.Fragment key={index}>
                            <h5>Địa Chỉ {index + 1}</h5>
                            <div className='form-group row'>
                                <label className='col-2 col-form-label'>Tên địa chỉ</label>
                                <div className='col-10'>
                                    <input className='form-control' type='text' placeholder='Tên địa chỉ' value={item.addressTitle.trim()} onChange={e => this.textChanged(index, e.target.value, 'addressTitle')} />
                                </div>
                            </div>
                            <div className='form-group row'>
                                <label className='col-2 col-form-label'>Địa chỉ</label>
                                <div className='col-10'>
                                    <input className='form-control' type='text' placeholder='Địa chỉ' value={item.address.trim()} onChange={e => this.textChanged(index, e.target.value, 'address')} />
                                </div>
                            </div>
                            <div className='form-group row'>
                                <label className='col-2 col-form-label'>Số điện thoại</label>
                                <div className='col-10'>
                                    <input className='form-control' type='text' placeholder='Số điện thoại' value={item.phoneNumber.trim()} onChange={e => this.textChanged(index, e.target.value, 'phoneNumber')} />
                                </div>
                            </div>
                            <div className='form-group row'>
                                <label className='col-2 col-form-label'>Di động</label>
                                <div className='col-10'>
                                    <input className='form-control' type='text' placeholder='Di động' value={item.mobile.trim()} onChange={e => this.textChanged(index, e.target.value, 'mobile')} />
                                </div>
                            </div>
                            <div className='form-group row'>
                                <label className='col-2 col-form-label'>Email</label>
                                <div className='col-10'>
                                    <input className='form-control' type='text' placeholder='Email' value={item.email.trim()} onChange={e => this.textChanged(index, e.target.value, 'email')} />
                                </div>
                            </div>
                        </React.Fragment>
                    ))}
                </div>
                <div className='tile-footer' style={{ textAlign: 'right' }}>
                    <button className='btn btn-success' type='button' onClick={this.addAddress}>
                        <i className='fa fa-fw fa-lg fa-plus-circle' />Thêm
                    </button>&nbsp;
                    <button className='btn btn-primary' type='button' onClick={this.saveAddress}>
                        <i className='fa fa-fw fa-lg fa-check-circle' />Lưu
                    </button>
                </div>
            </div>
        );
    }
}

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
        this.latitude = React.createRef();
        this.longitude = React.createRef();
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

    saveMapInfo = () => {
        this.props.saveSystemState({
            latitude: $(this.latitude.current).val().trim(),
            longitude: $(this.longitude.current).val().trim(),
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
        let { address, email, mobile, fax, facebook, youtube, twitter, instagram, logo, latitude, longitude, map, addressList } = this.props.system ?
            this.props.system : { address: '', email: '', mobile: '', fax: '', facebook: '', youtube: '', twitter: '', instagram: '', logo: '', footer: '', addressList: '' };

        addressList = JSON.parse(addressList);
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
                                    <i className='fa fa-fw fa-lg fa-check-circle' /> Lưu
                                </button>
                            </div>
                        </div>

                        <AddressListSection items={addressList} saveAddress={value => this.props.saveSystemState({ addressList: value })} />

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
                                        <label className='control-label'>Logo</label>
                                        <ImageBox postUrl='/user/upload' uploadType='SettingImage' userData='logo' image={logo} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='tile'>
                            <h3 className='tile-title'>Bản đồ</h3>
                            <div className='tile-body'>
                                <div className='form-group'>
                                    <label className='control-label'>Vĩ độ</label>
                                    <input className='form-control' type='number' placeholder='Vĩ độ' ref={this.latitude} defaultValue={latitude} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Kinh độ</label>
                                    <input className='form-control' type='number' placeholder='Kinh độ' ref={this.longitude} defaultValue={longitude} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Hình ảnh bản đồ</label>
                                    <ImageBox postUrl='/user/upload' uploadType='SettingImage' userData='map' image={map} />
                                </div>
                            </div>
                            <div className='tile-footer' style={{ textAlign: 'right' }}>
                                <button className='btn btn-primary' type='button' onClick={this.saveMapInfo}>
                                    <i className='fa fa-fw fa-lg fa-check-circle' /> Lưu
                                </button>
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