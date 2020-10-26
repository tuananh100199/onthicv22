import React from 'react';
import { connect } from 'react-redux';
import { saveSystemState } from './reduxSystem.jsx';
import ImageBox from '../../view/component/ImageBox.jsx';

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
        this.addressName = React.createRef();
        this.addressDetail = React.createRef();
        this.addressPhone = React.createRef();
        this.addressLandlinePhone = React.createRef();
        this.addressEmail = React.createRef();

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

    saveAddress = () => {
        this.props.saveSystemState({
            addressName: $(this.addressName.current).val().trim(),
            addressDetail: $(this.addressDetail.current).val().trim(),
            addressLandlinePhone: $(this.addressLandlinePhone.current).val().trim(),
            addressPhone: $(this.addressPhone.current).val().trim(),
            addressEmail: $(this.addressEmail.current).val().trim(),
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
        const { address, email, mobile, fax, facebook, youtube, twitter, instagram, logo, latitude, longitude, map } = this.props.system ?
            this.props.system : { address: '', email: '', mobile: '', fax: '', facebook: '', youtube: '', twitter: '', instagram: '', logo: '', footer: '' };

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-cog' /> Configure</h1>
                </div>
                <div className='row'>
                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>General information</h3>
                            <div className='tile-body'>
                                <div className='form-group'>
                                    <label className='control-label'>Address</label>
                                    <input className='form-control' type='text' placeholder='Address' ref={this.address} defaultValue={address} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Email</label>
                                    <input className='form-control' type='email' placeholder='Email' ref={this.email} defaultValue={email} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Phone number</label>
                                    <input className='form-control' type='text' placeholder='Phone number' ref={this.mobile} defaultValue={mobile} />
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
                                    <i className='fa fa-fw fa-lg fa-check-circle' /> Save
                                </button>
                            </div>
                        </div>

                        <div className='tile'>
                            <h3 className='tile-title'>Address List</h3>
                            <div className='tile-body'>
                                <div className='form-group'>
                                    <label className='control-label'>Name</label>
                                    <input className='form-control' type='text' placeholder='Name' ref={this.addressName} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Address</label>
                                    <input className='form-control' type='email' placeholder='Address' ref={this.addressDetail} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Landline Telephone number</label>
                                    <input className='form-control' type='text' placeholder='Landline Telephone number' ref={this.addressLandlinePhone} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Phone number</label>
                                    <input className='form-control' type='text' placeholder='Phone number' ref={this.addressPhone} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Email</label>
                                    <input className='form-control' type='text' placeholder='Email' ref={this.addressEmail} />
                                </div>
                            </div>
                            <div className='tile-footer' style={{ textAlign: 'right' }}>
                                <button className='btn btn-primary' type='button' onClick={this.saveAddress}>
                                    <i className='fa fa-fw fa-lg fa-check-circle' /> Add
                                </button>
                            </div>
                        </div>



                    </div>

                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Change password</h3>
                            <div className='tile-body'>
                                <div className='form-group'>
                                    <label className='control-label'>New password</label>
                                    <input className='form-control' type='password' placeholder='New password' ref={this.emailPassword1} defaultValue='' autoComplete='new-password' />
                                    <input className='form-control mt-1' type='password' placeholder='Retype password' ref={this.emailPassword2} defaultValue='' autoComplete='new-password' />
                                </div>
                            </div>
                            <div className='tile-footer'>
                                <div className='row'>
                                    <div className='col-md-12' style={{ textAlign: 'right' }}>
                                        <button className='btn btn-primary' type='button' onClick={this.changePassword}>
                                            <i className='fa fa-fw fa-lg fa-check-circle' />Change password
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='tile'>
                            <h3 className='tile-title'>Images</h3>
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
                            <h3 className='tile-title'>Maps</h3>
                            <div className='tile-body'>
                                <div className='form-group'>
                                    <label className='control-label'>Latitude</label>
                                    <input className='form-control' type='number' placeholder='Latitude' ref={this.latitude} defaultValue={latitude} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Longitude</label>
                                    <input className='form-control' type='number' placeholder='Longitude' ref={this.longitude} defaultValue={longitude} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Map image</label>
                                    <ImageBox postUrl='/user/upload' uploadType='SettingImage' userData='map' image={map} />
                                </div>
                            </div>
                            <div className='tile-footer' style={{ textAlign: 'right' }}>
                                <button className='btn btn-primary' type='button' onClick={this.saveMapInfo}>
                                    <i className='fa fa-fw fa-lg fa-check-circle' /> Save
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